import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  private generateApiKey(): string {
    return `cf_${crypto.randomBytes(32).toString('hex')}`;
  }

  async createApiKey(userId: string, name: string, expiresInDays?: number) {
    const key = this.generateApiKey();

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        name,
        key,
        expiresAt: expiresInDays
          ? new Date(Date.now() + expiresInDays * 86400000)
          : null,
      },
    });

    return { id: apiKey.id, name: apiKey.name, key: apiKey.key, createdAt: apiKey.createdAt };
  }

  async getUserApiKeys(userId: string) {
    return this.prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeApiKey(id: string, userId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, userId },
    });

    if (!key) throw new BadRequestException('API key not found');

    await this.prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'API key revoked' };
  }

  async deleteApiKey(id: string, userId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, userId },
    });

    if (!key) throw new BadRequestException('API key not found');

    await this.prisma.apiKey.delete({ where: { id } });
    return { message: 'API key deleted' };
  }
}
