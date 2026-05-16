import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ConversionModule } from './modules/conversion/conversion.module';
import { QueueModule } from './modules/queue/queue.module';
import { StorageModule } from './modules/storage/storage.module';
import { BillingModule } from './modules/billing/billing.module';
import { AdminModule } from './modules/admin/admin.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { UploadModule } from './modules/upload/upload.module';
import { UsageModule } from './modules/usage/usage.module';
import { HealthModule } from './modules/health/health.module';
import { WebsocketModule } from './websocket/websocket.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const retryStrategy = (times: number) => {
          if (times > 3) return null;
          return Math.min(times * 2000, 5000);
        };
        return {
          connection: {
            host: config.get<string>('redis.host', 'localhost'),
            port: config.get<number>('redis.port', 6379),
            password: config.get<string>('redis.password'),
            db: config.get<number>('redis.db', 0),
            retryStrategy,
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
          },
          defaultJobOptions: {
            attempts: 1,
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 100 },
          },
        };
      },
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    ConversionModule,
    QueueModule,
    StorageModule,
    BillingModule,
    AdminModule,
    AnalyticsModule,
    ApiKeysModule,
    UploadModule,
    UsageModule,
    HealthModule,
    WebsocketModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
