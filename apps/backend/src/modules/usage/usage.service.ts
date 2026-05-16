import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsageService {
  private readonly logger = new Logger(UsageService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyUsage() {
    this.logger.log('Running daily usage reset...');

    const conversions = await this.prisma.conversion.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0) - 86400000),
          lt: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _count: { id: true },
    });

    for (const entry of conversions) {
      if (!entry.userId) continue;
      await this.prisma.dailyUsage.upsert({
        where: {
          userId_date: {
            userId: entry.userId!,
            date: new Date(new Date().setHours(0, 0, 0, 0) - 86400000),
          },
        },
        update: { conversions: entry._count.id },
        create: {
          userId: entry.userId!,
          date: new Date(new Date().setHours(0, 0, 0, 0) - 86400000),
          conversions: entry._count.id,
        },
      });
    }

    this.logger.log(`Daily usage recorded for ${conversions.length} users`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredFiles() {
    this.logger.log('Running expired file cleanup...');

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const expiredFiles = await this.prisma.file.updateMany({
      where: {
        status: 'UPLOADED',
        createdAt: { lt: cutoff },
        conversions: { none: { status: 'COMPLETED' } },
      },
      data: { status: 'DELETED' },
    });

    this.logger.log(`Cleaned up ${expiredFiles.count} expired files`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStaleChunkUploads() {
    this.logger.log('Running stale chunk upload cleanup...');

    const expiredChunks = await this.prisma.chunkUpload.deleteMany({
      where: {
        status: { in: ['INITIATED', 'IN_PROGRESS'] },
        expiresAt: { lt: new Date() },
      },
    });

    if (expiredChunks.count > 0) {
      this.logger.log(`Cleaned up ${expiredChunks.count} stale chunk uploads`);
    }
  }

  async getUserDailyUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await this.prisma.dailyUsage.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return {
      conversionsToday: usage?.conversions || 0,
      date: today.toISOString(),
    };
  }

  async trackUsageEvent(
    userId: string,
    action: string,
    metadata?: {
      resource?: string;
      resourceId?: string;
      ip?: string;
      userAgent?: string;
      creditsCost?: number;
    },
  ) {
    await this.prisma.usageLog.create({
      data: {
        userId,
        action,
        resource: metadata?.resource,
        resourceId: metadata?.resourceId,
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
        creditsCost: metadata?.creditsCost || 0,
        metadata: metadata || {},
      },
    });
  }
}
