import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalConversions,
      dailyConversions,
      totalFiles,
      storageUsed,
      recentConversions,
      popularFormats,
    ] = await Promise.all([
      this.prisma.conversion.count({ where: { userId } }),
      this.prisma.conversion.count({ where: { userId, createdAt: { gte: today } } }),
      this.prisma.file.count({ where: { userId, status: { not: 'DELETED' } } }),
      this.prisma.file.aggregate({
        where: { userId, status: { not: 'DELETED' } },
        _sum: { size: true },
      }),
      this.prisma.conversion.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { inputFile: true },
      }),
      this.prisma.conversion.groupBy({
        by: ['inputFormat', 'outputFormat'],
        where: { userId },
        _count: true,
        orderBy: { _count: { inputFormat: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalConversions,
      dailyConversions,
      totalFiles,
      storageUsed: Number(storageUsed._sum.size) || 0,
      recentConversions,
      popularFormats,
    };
  }
}
