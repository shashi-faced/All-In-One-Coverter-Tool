import * as fs from 'fs';
import { Logger } from '../utils/logger';

const logger = new Logger('CleanupProcessor');

export async function cleanupFiles(data: { fileId: string; storagePath: string }) {
  const { storagePath } = data;

  try {
    if (fs.existsSync(storagePath)) {
      fs.unlinkSync(storagePath);
      logger.info(`Cleaned up file: ${storagePath}`);
    }
  } catch (error: any) {
    logger.error(`Cleanup failed for ${storagePath}: ${error.message}`);
  }
}
