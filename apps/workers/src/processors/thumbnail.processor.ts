import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../utils/logger';

const logger = new Logger('ThumbnailProcessor');

export async function createThumbnail(data: { fileId: string; inputPath: string; format: string }) {
  const { inputPath, format } = data;
  const thumbnailDir = path.join(process.cwd(), 'tmp', 'thumbnails');
  fs.mkdirSync(thumbnailDir, { recursive: true });

  const thumbnailPath = path.join(thumbnailDir, `${path.basename(inputPath)}_thumb.jpg`);

  try {
    if (['png', 'jpg', 'jpeg', 'webp', 'avif', 'gif', 'bmp', 'tiff'].includes(format.toLowerCase())) {
      const sharp = require('sharp');
      await sharp(inputPath)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 70 })
        .toFile(thumbnailPath);
    } else if (['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'].includes(format.toLowerCase())) {
      const ffmpeg = require('fluent-ffmpeg');
      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .screenshot({
            timestamps: ['10%'],
            filename: path.basename(thumbnailPath),
            folder: thumbnailDir,
            size: '200x200',
          })
          .on('end', resolve)
          .on('error', reject);
      });
    } else if (format.toLowerCase() === 'pdf') {
      const { execSync } = require('child_process');
      execSync(`magick convert -density 150 "${inputPath}[0]" -resize 200x200 -quality 70 "${thumbnailPath}"`, { stdio: 'pipe' });
    }

    logger.info(`Thumbnail created: ${thumbnailPath}`);
    return thumbnailPath;
  } catch (error: any) {
    logger.error(`Thumbnail creation failed: ${error.message}`);
    return null;
  }
}
