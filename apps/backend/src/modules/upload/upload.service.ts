import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { FORMAT_META } from '@convertforge/shared-types';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly maxFileSize: number;
  private readonly chunkSize: number;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private config: ConfigService,
  ) {
    this.maxFileSize = this.config.get<number>('upload.maxFileSize', 5368709120);
    this.chunkSize = this.config.get<number>('upload.chunkSize', 5242880);
  }

  async initiateUpload(userId: string, fileName: string, fileSize: number, mimeType: string) {
    if (fileSize > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum of ${this.maxFileSize} bytes`);
    }

    const ext = path.extname(fileName).toLowerCase();
    const format = Object.entries(FORMAT_META).find(([, meta]) =>
      meta.extensions.includes(ext),
    )?.[0] || 'UNKNOWN';

    const isAnonymous = userId === 'anonymous' || userId.startsWith('sess_');
    const file = await this.prisma.file.create({
      data: {
        userId: isAnonymous ? null : userId,
        sessionId: isAnonymous ? userId : null,
        originalName: fileName,
        storagePath: '',
        mimeType,
        size: fileSize,
        format,
        category: FORMAT_META[format]?.category || 'UNKNOWN',
        status: 'UPLOADING',
        checksum: crypto.randomUUID(),
      },
    });

    const ext = path.extname(fileName).toLowerCase();
    const storagePath = `uploads/${file.id}${ext}`;
    await this.prisma.file.update({
      where: { id: file.id },
      data: { storagePath },
    });

    if (fileSize > this.chunkSize * 2) {
      const totalChunks = Math.ceil(fileSize / this.chunkSize);
      const chunkUpload = await this.prisma.chunkUpload.create({
        data: {
          userId,
          fileName,
          fileSize,
          chunkSize: this.chunkSize,
          totalChunks,
          status: 'INITIATED',
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      const uploadUrls = Array.from({ length: totalChunks }, (_, i) =>
        this.storage.getUploadUrl(`chunks/${chunkUpload.id}/${i}`, 3600),
      );

      return {
        id: file.id,
        uploadMethod: 'CHUNKED',
        chunkUpload: {
          uploadId: chunkUpload.id,
          chunkSize: this.chunkSize,
          totalChunks,
          uploadUrls,
        },
      };
    }

    const uploadUrl = this.storage.getUploadUrl(storagePath, 3600);

    return {
      id: file.id,
      uploadUrl,
      uploadMethod: 'PUT',
    };
  }

  async completeChunkedUpload(fileId: string, uploadId: string, userId: string) {
    const chunkUpload = await this.prisma.chunkUpload.findUnique({
      where: { id: uploadId },
    });

    if (!chunkUpload || chunkUpload.userId !== userId) {
      throw new BadRequestException('Invalid chunk upload');
    }

    const ext = path.extname(chunkUpload.fileName).toLowerCase();
    const storagePath = `uploads/${fileId}${ext}`;

    await this.storage.mergeChunks(
      `chunks/${uploadId}`,
      chunkUpload.totalChunks,
      storagePath,
    );

    await this.prisma.chunkUpload.update({
      where: { id: uploadId },
      data: { status: 'COMPLETED' },
    });

    await this.prisma.file.update({
      where: { id: fileId },
      data: { status: 'UPLOADED', storagePath },
    });

    return { message: 'Upload completed' };
  }

  async uploadDirect(
    userId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    const ext = path.extname(file.originalname).toLowerCase();
    const format = Object.entries(FORMAT_META).find(([, meta]) =>
      meta.extensions.includes(ext),
    )?.[0] || 'UNKNOWN';

    const isAnonymous = userId === 'anonymous' || userId.startsWith('sess_');
    const storagePath = `uploads/${isAnonymous ? 'anon' : userId}/${crypto.randomUUID()}${ext}`;
    await this.storage.uploadBuffer(storagePath, file.buffer);

    const savedFile = await this.prisma.file.create({
      data: {
        userId: isAnonymous ? null : userId,
        sessionId: isAnonymous ? userId : null,
        originalName: file.originalname,
        storagePath,
        mimeType: file.mimetype,
        size: file.size,
        format,
        category: FORMAT_META[format]?.category || 'UNKNOWN',
        status: 'UPLOADED',
        checksum: crypto.createHash('md5').update(file.buffer).digest('hex'),
      },
    });

    return savedFile;
  }

  async getUserFiles(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const fileWhere = {
      OR: [{ userId }, { sessionId: userId }],
      status: { not: 'DELETED' as const },
    };

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where: fileWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.file.count({
        where: fileWhere,
      }),
    ]);

    return {
      items: files,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async deleteFile(fileId: string, userId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, OR: [{ userId }, { sessionId: userId }] },
    });

    if (!file) throw new BadRequestException('File not found');

    await this.storage.deleteFile(file.storagePath);

    await this.prisma.file.update({
      where: { id: fileId },
      data: { status: 'DELETED' },
    });

    return { message: 'File deleted' };
  }
}
