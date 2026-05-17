import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface StorageProvider {
  uploadBuffer(key: string, buffer: Buffer): Promise<void>;
  download(key: string): Promise<Buffer>;
  deleteFile(key: string): Promise<void>;
  getSignedUrl(key: string, expiresIn: number): string;
  mergeChunks(prefix: string, totalChunks: number, destination: string): Promise<void>;
}

class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor(private basePath: string) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  private getFullPath(key: string): string {
    const fullPath = path.join(this.basePath, key);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    return fullPath;
  }

  async uploadBuffer(key: string, buffer: Buffer): Promise<void> {
    const fullPath = this.getFullPath(key);
    await fs.promises.writeFile(fullPath, buffer);
  }

  async download(key: string): Promise<Buffer> {
    return fs.promises.readFile(this.getFullPath(key));
  }

  async deleteFile(key: string): Promise<void> {
    const fullPath = this.getFullPath(key);
    try {
      await fs.promises.unlink(fullPath);
    } catch (err) {
      this.logger.warn(`Failed to delete ${fullPath}: ${(err as Error).message}`);
    }
  }

  getSignedUrl(key: string, _expiresIn: number): string {
    const apiUrl = process.env.API_URL || 'http://localhost:4000';
    return `${apiUrl.replace(/\/$/, '')}/api/v1/storage/download/${encodeURIComponent(key)}`;
  }

  async mergeChunks(prefix: string, totalChunks: number, destination: string): Promise<void> {
    const destPath = this.getFullPath(destination);
    const writeStream = fs.createWriteStream(destPath);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = this.getFullPath(`${prefix}/${i}`);
      const chunk = await fs.promises.readFile(chunkPath);
      writeStream.write(chunk);
      await fs.promises.unlink(chunkPath);
    }

    writeStream.end();
    await fs.promises.rmdir(path.dirname(this.getFullPath(prefix)));
  }
}

class S3StorageProvider implements StorageProvider {
  private readonly logger = new Logger(S3StorageProvider.name);
  private s3: any;

  constructor(private config: ConfigService) {
    try {
      const AWS = require('aws-sdk');
      this.s3 = new AWS.S3({
        region: this.config.get<string>('storage.s3.region'),
        accessKeyId: this.config.get<string>('storage.s3.accessKeyId'),
        secretAccessKey: this.config.get<string>('storage.s3.secretAccessKey'),
        endpoint: this.config.get<string>('storage.s3.endpoint'),
        s3Accelerate: this.config.get<boolean>('storage.s3.useAccelerateEndpoint'),
      });
    } catch {
      this.logger.warn('AWS SDK not available, using local storage fallback');
    }
  }

  private get bucket(): string {
    return this.config.get<string>('storage.s3.bucket', 'convertforge');
  }

  async uploadBuffer(key: string, buffer: Buffer): Promise<void> {
    await this.s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
    }).promise();
  }

  async download(key: string): Promise<Buffer> {
    const result = await this.s3.getObject({
      Bucket: this.bucket,
      Key: key,
    }).promise();
    return result.Body;
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.deleteObject({
      Bucket: this.bucket,
      Key: key,
    }).promise();
  }

  getSignedUrl(key: string, expiresIn: number): string {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    });
  }

  async mergeChunks(prefix: string, totalChunks: number, destination: string): Promise<void> {
    const multipartUpload = await this.s3.createMultipartUpload({
      Bucket: this.bucket,
      Key: destination,
    }).promise();

    const parts = [];
    for (let i = 0; i < totalChunks; i++) {
      const part = await this.s3.uploadPartCopy({
        Bucket: this.bucket,
        Key: destination,
        PartNumber: i + 1,
        UploadId: multipartUpload.UploadId,
        CopySource: `${this.bucket}/${prefix}/${i}`,
      }).promise();
      parts.push({ PartNumber: i + 1, ETag: part.ETag });
    }

    await this.s3.completeMultipartUpload({
      Bucket: this.bucket,
      Key: destination,
      UploadId: multipartUpload.UploadId,
      MultipartUpload: { Parts: parts },
    }).promise();
  }
}

@Injectable()
export class StorageService {
  private provider: StorageProvider;
  private readonly logger = new Logger(StorageService.name);

  constructor(private config: ConfigService) {
    const storageProvider = this.config.get<string>('storage.provider', 'local');

    if (storageProvider === 's3') {
      this.provider = new S3StorageProvider(config);
    } else {
      const localPath = this.config.get<string>('storage.localPath', './uploads');
      this.provider = new LocalStorageProvider(localPath);
    }

    this.logger.log(`Storage provider: ${storageProvider}`);
  }

  async uploadBuffer(key: string, buffer: Buffer): Promise<void> {
    return this.provider.uploadBuffer(key, buffer);
  }

  async download(key: string): Promise<Buffer> {
    return this.provider.download(key);
  }

  async deleteFile(key: string): Promise<void> {
    return this.provider.deleteFile(key);
  }

  getUploadUrl(key: string, expiresIn: number): string {
    return this.provider.getSignedUrl(key, expiresIn);
  }

  async mergeChunks(prefix: string, totalChunks: number, destination: string): Promise<void> {
    return this.provider.mergeChunks(prefix, totalChunks, destination);
  }
}
