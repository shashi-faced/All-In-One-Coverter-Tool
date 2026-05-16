import { Worker } from 'bullmq';
import { Logger } from './utils/logger';
import { config } from './config';
import { processConversion } from './processors/conversion.processor';
import { createThumbnail } from './processors/thumbnail.processor';
import { cleanupFiles } from './processors/cleanup.processor';

const logger = new Logger('WorkerMain');

async function start() {
  logger.info(`Starting worker: ${config.worker.name}`);

  const connection = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  };

  const conversionWorker = new Worker(
    'conversion',
    async (job) => {
      logger.info(`Processing conversion job: ${job.id}`);
      logger.info(`Job data:`, job.data);

      try {
        const result = await processConversion(job, (progress) => {
          job.updateProgress(progress);
        });
        logger.info(`Conversion job completed: ${job.id}`);
        return result;
      } catch (error: any) {
        logger.error(`Conversion job failed: ${job.id}`, error);
        throw error;
      }
    },
    {
      connection,
      concurrency: config.worker.concurrency,
      maxStalledCount: 3,
      stalledInterval: 30000,
      lockDuration: 120000,
      settings: {
        backoffStrategy: (attemptsMade: number) => Math.min(attemptsMade * 5000, 60000),
      },
    },
  );

  const thumbnailWorker = new Worker(
    'thumbnail',
    async (job) => {
      logger.info(`Processing thumbnail job: ${job.id}`);
      await createThumbnail(job.data);
    },
    { connection, concurrency: 2 },
  );

  const cleanupWorker = new Worker(
    'cleanup',
    async (job) => {
      logger.info(`Processing cleanup job: ${job.id}`);
      await cleanupFiles(job.data);
    },
    { connection, concurrency: 1 },
  );

  conversionWorker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  conversionWorker.on('failed', (job, error) => {
    logger.error(`Job ${job?.id} failed: ${error.message}`);
  });

  conversionWorker.on('error', (error) => {
    logger.error(`Worker error: ${error.message}`);
  });

  logger.info(`Workers started successfully`);

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down...');
    await conversionWorker.close();
    await thumbnailWorker.close();
    await cleanupWorker.close();
    process.exit(0);
  });
}

start().catch((error) => {
  logger.error('Failed to start workers', error);
  process.exit(1);
});
