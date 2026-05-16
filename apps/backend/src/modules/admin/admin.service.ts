import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalConversions,
      completedConversions,
      failedConversions,
      totalFiles,
      totalStorage,
      activeSubscriptions,
      revenue,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.conversion.count(),
      this.prisma.conversion.count({ where: { status: 'COMPLETED' } }),
      this.prisma.conversion.count({ where: { status: 'FAILED' } }),
      this.prisma.file.count({ where: { status: { not: 'DELETED' } } }),
      this.prisma.file.aggregate({ _sum: { size: true }, where: { status: { not: 'DELETED' } } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE', tier: { not: 'FREE' } } }),
      this.prisma.invoice.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalConversions: {
        total: totalConversions,
        completed: completedConversions,
        failed: failedConversions,
        successRate: totalConversions > 0 ? (completedConversions / totalConversions) * 100 : 0,
      },
      totalFiles,
      totalStorage: Number(totalStorage._sum.size) || 0,
      activeSubscriptions,
      revenue: Number(revenue._sum.amount) || 0,
    };
  }

  async getUsers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: { subscription: true, _count: { select: { conversions: true, files: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      items: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserDetail(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        files: { orderBy: { createdAt: 'desc' }, take: 10 },
        conversions: { orderBy: { createdAt: 'desc' }, take: 10 },
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
  }

  async updateUser(userId: string, data: { role?: string; isActive?: boolean }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: data.role as any, isActive: data.isActive },
    });
  }

  async getConversionAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 86400000);

    const conversions = await this.prisma.conversion.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    });

    const dailyCounts: Record<string, { total: number; completed: number; failed: number }> = {};
    for (const c of conversions) {
      const day = c.createdAt.toISOString().split('T')[0];
      if (!dailyCounts[day]) {
        dailyCounts[day] = { total: 0, completed: 0, failed: 0 };
      }
      dailyCounts[day].total++;
      if (c.status === 'COMPLETED') dailyCounts[day].completed++;
      if (c.status === 'FAILED') dailyCounts[day].failed++;
    }

    return {
      period: `${days} days`,
      totalConversions: conversions.length,
      dailyBreakdown: Object.entries(dailyCounts).map(([date, counts]) => ({
        date,
        ...counts,
      })),
    };
  }

  async getRevenueAnalytics(days = 30) {
    const since = new Date(Date.now() - days * 86400000);

    const invoices = await this.prisma.invoice.findMany({
      where: { createdAt: { gte: since }, status: 'PAID' },
      orderBy: { createdAt: 'asc' },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const inv of invoices) {
      const month = inv.createdAt.toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + inv.amount;
    }

    return {
      period: `${days} days`,
      totalRevenue: invoices.reduce((sum, i) => sum + i.amount, 0),
      monthlyBreakdown: Object.entries(monthlyRevenue).map(([month, amount]) => ({
        month,
        amount,
      })),
    };
  }
}
