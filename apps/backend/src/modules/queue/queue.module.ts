import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QueueService } from './queue.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

const CONVERSION_QUEUE = 'conversion';
const THUMBNAIL_QUEUE = 'thumbnail';
const CLEANUP_QUEUE = 'cleanup';

@Module({
  imports: [
    BullModule.registerQueueAsync(
      {
        name: CONVERSION_QUEUE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          connection: {
            host: config.get<string>('redis.host', 'localhost'),
            port: config.get<number>('redis.port', 6379),
            password: config.get<string>('redis.password'),
            db: config.get<number>('redis.db', 0),
          },
          defaultJobOptions: {
            attempts: config.get<number>('queue.defaultJobAttempts', 3),
            backoff: {
              type: 'exponential',
              delay: config.get<number>('queue.defaultBackoffDelay', 5000),
            },
            removeOnComplete: {
              age: 24 * 3600,
              count: 100,
            },
            removeOnFail: {
              age: 7 * 24 * 3600,
              count: 1000,
            },
          },
        }),
      },
      {
        name: THUMBNAIL_QUEUE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          connection: {
            host: config.get<string>('redis.host', 'localhost'),
            port: config.get<number>('redis.port', 6379),
            password: config.get<string>('redis.password'),
            db: config.get<number>('redis.db', 0),
          },
        }),
      },
      {
        name: CLEANUP_QUEUE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          connection: {
            host: config.get<string>('redis.host', 'localhost'),
            port: config.get<number>('redis.port', 6379),
            password: config.get<string>('redis.password'),
            db: config.get<number>('redis.db', 0),
          },
        }),
      },
    ),
  ],
  providers: [QueueService],
  exports: [QueueService, BullModule],
})
export class QueueModule {
  static CONVERSION_QUEUE = CONVERSION_QUEUE;
  static THUMBNAIL_QUEUE = THUMBNAIL_QUEUE;
  static CLEANUP_QUEUE = CLEANUP_QUEUE;
}
