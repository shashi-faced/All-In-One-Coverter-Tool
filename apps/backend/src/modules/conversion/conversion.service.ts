import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { SUPPORTED_CONVERSIONS } from '@convertforge/shared-types';

@Injectable()
export class ConversionService {
  private readonly logger = new Logger(ConversionService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async createConversion(
    userId: string,
    fileId: string,
    outputFormat: string,
    options: Record<string, unknown> = {},
  ) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, OR: [{ userId }, { sessionId: userId }] },
    });

    if (!file) {
      throw new BadRequestException('File not found');
    }

    if (!['UPLOADED', 'READY', 'UPLOADING'].includes(file.status)) {
      throw new BadRequestException('File is not ready for conversion');
    }

    const allowedFormats = SUPPORTED_CONVERSIONS[file.format];
    if (!allowedFormats || !allowedFormats.includes(outputFormat)) {
      throw new BadRequestException(
        `Conversion from ${file.format} to ${outputFormat} is not supported`,
      );
    }

    const isAnonymous = !userId || userId === 'anonymous' || userId.startsWith('sess_');
    const subscription = isAnonymous ? null : await this.prisma.subscription.findUnique({
      where: { userId },
    }).catch(() => null);

    // Rate limiting: 10 conversions/hour for anonymous
    if (isAnonymous) {
      const oneHourAgo = new Date(Date.now() - 3600000);
      const recentCount = await this.prisma.conversion.count({
        where: { sessionId: userId, createdAt: { gte: oneHourAgo } },
      });
      if (recentCount >= 10) {
        throw new BadRequestException('Rate limit exceeded. Please sign up for more conversions.');
      }
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (subscription && subscription.dailyConversionLimit > 0) {
        const dailyUsage = await this.prisma.dailyUsage.findUnique({
          where: { userId_date: { userId, date: today } },
        });
        if ((dailyUsage?.conversions || 0) >= subscription.dailyConversionLimit) {
          throw new BadRequestException('Daily conversion limit reached');
        }
      }
    }

    const conversion = await this.prisma.conversion.create({
      data: {
        userId: isAnonymous ? null : userId,
        sessionId: isAnonymous ? userId : null,
        fileId,
        inputFormat: file.format,
        outputFormat,
        options: options as any,
        status: 'PENDING',
        priority: subscription?.priority || 0,
      },
    });

    const job = await this.queueService.addConversionJob({
      jobId: conversion.id,
      userId,
      fileId,
      inputPath: file.storagePath,
      inputFormat: file.format,
      outputFormat,
      options,
      priority: subscription?.priority || 0,
    });

    await this.prisma.conversion.update({
      where: { id: conversion.id },
      data: { status: 'QUEUED' },
    });

    if (!isAnonymous) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await this.prisma.dailyUsage.upsert({
        where: { userId_date: { userId, date: today } },
        update: { conversions: { increment: 1 } },
        create: { userId, date: today, conversions: 1 },
      });
    }

    this.logger.log(`Conversion created: ${conversion.id} (${file.format} -> ${outputFormat})`);

    return {
      id: conversion.id,
      status: 'QUEUED',
      jobId: job.id,
    };
  }

  async getConversion(conversionId: string, userId: string) {
    const conversion = await this.prisma.conversion.findFirst({
      where: { id: conversionId, OR: [{ userId }, { sessionId: userId }] },
      include: {
        inputFile: true,
        jobLogs: { orderBy: { timestamp: 'desc' }, take: 20 },
      },
    });

    if (!conversion) {
      throw new BadRequestException('Conversion not found');
    }

    return conversion;
  }

  async getUserConversions(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const convWhere = { OR: [{ userId }, { sessionId: userId }] };

    const [conversions, total] = await Promise.all([
      this.prisma.conversion.findMany({
        where: convWhere,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { inputFile: true },
      }),
      this.prisma.conversion.count({ where: convWhere }),
    ]);

    return {
      items: conversions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getSupportedFormats() {
    return Object.entries(SUPPORTED_CONVERSIONS).map(([input, outputs]) => ({
      input,
      outputs,
    }));
  }

  async cancelConversion(conversionId: string, userId: string) {
    const conversion = await this.prisma.conversion.findFirst({
      where: { id: conversionId, OR: [{ userId }, { sessionId: userId }] },
    });

    if (!conversion) {
      throw new BadRequestException('Conversion not found');
    }

    if (conversion.status === 'COMPLETED' || conversion.status === 'FAILED') {
      throw new BadRequestException('Cannot cancel completed or failed conversion');
    }

    await this.queueService.cancelJob(conversionId);

    await this.prisma.conversion.update({
      where: { id: conversionId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Conversion cancelled' };
  }

  async retryConversion(conversionId: string, userId: string) {
    const conversion = await this.prisma.conversion.findFirst({
      where: { id: conversionId, OR: [{ userId }, { sessionId: userId }] },
    });

    if (!conversion) {
      throw new BadRequestException('Conversion not found');
    }

    if (conversion.status !== 'FAILED') {
      throw new BadRequestException('Only failed conversions can be retried');
    }

    const file = await this.prisma.file.findFirst({
      where: { id: conversion.fileId, userId },
    });

    if (!file || file.status === 'DELETED') {
      throw new BadRequestException('Original file no longer available');
    }

    const updated = await this.prisma.conversion.update({
      where: { id: conversionId },
      data: { status: 'PENDING', progress: 0, error: null },
    });

    await this.queueService.addConversionJob({
      jobId: conversion.id,
      userId,
      fileId: file.id,
      inputPath: file.storagePath,
      inputFormat: conversion.inputFormat,
      outputFormat: conversion.outputFormat,
      options: (conversion.options as Record<string, unknown>) || {},
      priority: conversion.priority,
    });

    return updated;
  }
}
