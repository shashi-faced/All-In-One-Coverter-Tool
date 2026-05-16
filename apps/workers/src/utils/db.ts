import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { Logger } from './logger';

const logger = new Logger('Database');

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: config.database.url } },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function updateConversionStatus(
  conversionId: string,
  status: string,
  progress: number,
  error?: string,
) {
  try {
    const data: any = {
      status,
      progress,
      updatedAt: new Date(),
    };

    if (status === 'PROCESSING' && !data.startedAt) {
      data.startedAt = new Date();
    }

    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }

    if (error) {
      data.error = error;
    }

    await prisma.conversion.update({
      where: { id: conversionId },
      data,
    });
  } catch (err) {
    logger.error(`Failed to update conversion ${conversionId}`, err);
  }
}

export async function addJobLog(
  conversionId: string,
  stage: string,
  message: string,
  progress?: number,
) {
  try {
    await prisma.jobLog.create({
      data: {
        conversionId,
        stage,
        message,
        progress,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    logger.error(`Failed to add job log for ${conversionId}`, err);
  }
}
