import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('conversion') private conversionQueue: Queue,
    @InjectQueue('thumbnail') private thumbnailQueue: Queue,
    @InjectQueue('cleanup') private cleanupQueue: Queue,
  ) {}

  async addConversionJob(data: {
    jobId: string;
    userId: string;
    fileId: string;
    inputPath: string;
    inputFormat: string;
    outputFormat: string;
    options: Record<string, unknown>;
    priority: number;
  }) {
    const job = await this.conversionQueue.add(
      `convert:${data.jobId}`,
      data,
      {
        jobId: data.jobId,
        priority: data.priority,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    this.logger.log(`Conversion job added: ${data.jobId}`);
    return job;
  }

  async addThumbnailJob(data: {
    fileId: string;
    inputPath: string;
    format: string;
  }) {
    return this.thumbnailQueue.add(`thumbnail:${data.fileId}`, data);
  }

  async addCleanupJob(data: {
    fileId: string;
    storagePath: string;
    delay?: number;
  }) {
    return this.cleanupQueue.add(
      `cleanup:${data.fileId}`,
      data,
      { delay: data.delay || 24 * 60 * 60 * 1000 },
    );
  }

  async cancelJob(jobId: string) {
    const job = await this.conversionQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.conversionQueue.getWaitingCount(),
      this.conversionQueue.getActiveCount(),
      this.conversionQueue.getCompletedCount(),
      this.conversionQueue.getFailedCount(),
      this.conversionQueue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + delayed,
    };
  }

  async getQueueJobs(status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed', start = 0, end = 20) {
    return this.conversionQueue.getJobs(status, start, end);
  }
}
