import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        _count: {
          select: { files: true, conversions: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async getUsage(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [dailyUsage, totalConversions, totalStorage] = await Promise.all([
      this.prisma.dailyUsage.findUnique({
        where: { userId_date: { userId, date: today } },
      }),
      this.prisma.conversion.count({ where: { userId } }),
      this.prisma.file.aggregate({
        where: { userId, status: { not: 'DELETED' } },
        _sum: { size: true },
      }),
    ]);

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    return {
      userId,
      conversionsToday: dailyUsage?.conversions || 0,
      totalConversions,
      storageUsed: Number(totalStorage._sum.size) || 0,
      storageLimit: subscription?.storageLimit ? Number(subscription.storageLimit) : 500000000,
      dailyConversionLimit: subscription?.dailyConversionLimit || 10,
      maxFileSize: subscription?.maxFileSize ? Number(subscription.maxFileSize) : 104857600,
      resetDate: new Date(today.getTime() + 86400000).toISOString(),
    };
  }

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
