import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    const dbStatus = await this.prisma.$queryRaw`SELECT 1 as alive`
      .then(() => 'healthy')
      .catch(() => 'unhealthy');

    const redisStatus = await new Promise<'healthy' | 'unhealthy'>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.on('connect', () => { socket.destroy(); resolve('healthy'); });
      socket.on('error', () => { socket.destroy(); resolve('unhealthy'); });
      socket.on('timeout', () => { socket.destroy(); resolve('unhealthy'); });
      socket.connect(this.config.get<number>('redis.port', 6380), this.config.get<string>('redis.host', 'localhost'));
    });

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbStatus,
        redis: redisStatus,
        storage: this.config.get<string>('storage.provider', 'local'),
      },
    };
  }
}
