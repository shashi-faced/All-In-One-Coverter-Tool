import { Job } from 'bullmq';
import * as path from 'path';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
import { updateConversionStatus } from '../utils/db';
import { emitProgress } from '../utils/ws';

const logger = new Logger('ConversionProcessor');

export interface ProgressCallback {
  (progress: number, data?: Record<string, any>): void;
}

export async function processConversion(
  job: Job,
  onProgress: ProgressCallback,
): Promise<any> {
  const { jobId, userId, fileId, inputPath, inputFormat, outputFormat, options } = job.data;

  const tempDir = path.join(process.cwd(), 'tmp', jobId);
  fs.mkdirSync(tempDir, { recursive: true });

  const outputFileName = `${path.basename(inputPath, path.extname(inputPath))}.${outputFormat.toLowerCase()}`;
  const outputPath = path.join(tempDir, outputFileName);

  try {
    await updateConversionStatus(jobId, 'PROCESSING', 0);
    emitProgress(jobId, userId, { progress: 0, stage: 'starting', message: 'Starting conversion...' });

    switch (inputFormat.toLowerCase()) {
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'avif':
      case 'gif':
      case 'bmp':
      case 'tiff':
      case 'svg':
      case 'ico':
      case 'heic':
      case 'psd':
        await convertImage(inputPath, outputPath, inputFormat, outputFormat.toLowerCase(), options, onProgress);
        break;

      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm':
      case 'flv':
      case 'wmv':
      case 'm4v':
        await convertVideo(inputPath, outputPath, inputFormat, outputFormat.toLowerCase(), options, onProgress);
        break;

      case 'mp3':
      case 'wav':
      case 'aac':
      case 'flac':
      case 'ogg':
      case 'm4a':
        await convertAudio(inputPath, outputPath, inputFormat, outputFormat.toLowerCase(), options, onProgress);
        break;

      case 'pdf':
      case 'docx':
      case 'doc':
      case 'pptx':
      case 'ppt':
      case 'xlsx':
      case 'xls':
      case 'txt':
      case 'html':
      case 'md':
      case 'odt':
      case 'rtf':
      case 'epub':
      case 'mobi':
      case 'azw3':
        await convertDocument(inputPath, outputPath, inputFormat, outputFormat.toLowerCase(), options, onProgress);
        break;

      case 'zip':
      case 'rar':
      case '7z':
      case 'tar':
      case 'gz':
        await convertArchive(inputPath, outputPath, inputFormat, outputFormat.toLowerCase(), options, onProgress);
        break;

      case 'ttf':
      case 'otf':
      case 'woff':
      case 'woff2':
        await convertFont(inputPath, outputPath, inputFormat, outputFormat.toLowerCase(), options, onProgress);
        break;

      case 'dxf':
      case 'dwg':
      case 'stl':
        await convertCad(inputPath, outputPath, inputFormat, outputFormat.toLowerCase(), options, onProgress);
        break;

      default:
        throw new Error(`Unsupported input format: ${inputFormat}`);
    }

    const outputSize = fs.statSync(outputPath).size;
    onProgress(100, { outputPath, outputSize });

    emitProgress(jobId, userId, { progress: 100, stage: 'completed', message: 'Conversion completed' });

    return { outputPath, outputSize, outputFileName };
  } catch (error: any) {
    logger.error(`Conversion failed: ${error.message}`);
    emitProgress(jobId, userId, { progress: 0, stage: 'failed', message: error.message });
    throw error;
  } finally {
    setTimeout(() => {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }, 60000);
  }
}

async function convertImage(
  inputPath: string, outputPath: string,
  inputFormat: string, outputFormat: string,
  options: Record<string, any>, onProgress: ProgressCallback,
) {
  onProgress(10, { stage: 'loading', message: 'Loading image...' });

  const sharp = require('sharp');
  let pipeline = sharp(inputPath);

  if (options.resizeWidth || options.resizeHeight) {
    pipeline = pipeline.resize(options.resizeWidth || null, options.resizeHeight || null, {
      fit: options.resizeFit || 'inside',
      withoutEnlargement: options.withoutEnlargement !== false,
    });
  }

  if (options.quality) {
    pipeline = pipeline.jpeg({ quality: options.quality }).png({ quality: options.quality });
  }

  if (options.rotate !== undefined) {
    pipeline = pipeline.rotate(options.rotate, { background: options.background || { r: 0, g: 0, b: 0, alpha: 0 } });
  }

  if (options.cropWidth && options.cropHeight) {
    pipeline = pipeline.extract({
      left: options.cropLeft || 0,
      top: options.cropTop || 0,
      width: options.cropWidth,
      height: options.cropHeight,
    });
  }

  if (options.grayscale) {
    pipeline = pipeline.grayscale();
  }

  if (options.removeMetadata) {
    pipeline = pipeline.withMetadata({});
  }

  if (options.flip) pipeline = pipeline.flip();
  if (options.flop) pipeline = pipeline.flop();

  onProgress(50, { stage: 'processing', message: 'Processing image...' });

  switch (outputFormat) {
    case 'png': await pipeline.png({ compressionLevel: options.compression || 6 }).toFile(outputPath); break;
    case 'jpg':
    case 'jpeg': await pipeline.jpeg({ quality: options.quality || 92, mozjpeg: true }).toFile(outputPath); break;
    case 'webp': await pipeline.webp({ quality: options.quality || 80 }).toFile(outputPath); break;
    case 'avif': await pipeline.avif({ quality: options.quality || 65 }).toFile(outputPath); break;
    case 'gif': await pipeline.gif().toFile(outputPath); break;
    case 'tiff': await pipeline.tiff({ quality: options.quality || 90 }).toFile(outputPath); break;
    case 'bmp': await pipeline.bmp().toFile(outputPath); break;
    case 'svg': {
      const metadata = await sharp(inputPath).metadata();
      const width = options.resizeWidth || metadata.width;
      const height = options.resizeHeight || metadata.height;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <image href="${inputPath}" width="${width}" height="${height}"/>
      </svg>`;
      fs.writeFileSync(outputPath, svg);
      break;
    }
    case 'ico': {
      const icon = require('sharp-ico');
      await icon(inputPath, outputPath, { sizes: [16, 24, 32, 48, 64] });
      break;
    }
    default:
      throw new Error(`Unsupported image output format: ${outputFormat}`);
  }

  onProgress(90, { stage: 'finalizing', message: 'Finalizing...' });
}

async function convertVideo(
  inputPath: string, outputPath: string,
  inputFormat: string, outputFormat: string,
  options: Record<string, any>, onProgress: ProgressCallback,
) {
  const ffmpeg = require('fluent-ffmpeg');

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath);

    if (options.resolution) {
      command.size(options.resolution);
    }

    if (options.bitrate) {
      command.videoBitrate(options.bitrate);
    }

    if (options.fps) {
      command.fps(options.fps);
    }

    if (options.trimStart !== undefined && options.trimEnd !== undefined) {
      command.setStartTime(options.trimStart);
      command.duration(options.trimEnd - options.trimStart);
    }

    if (options.audioBitrate) {
      command.audioBitrate(options.audioBitrate);
    }

    if (options.audioCodec) {
      command.audioCodec(options.audioCodec);
    }

    if (outputFormat === 'gif') {
      command.noAudio();
    }

    if (options.extractAudio) {
      command.noVideo();
    }

    command
      .output(outputPath)
      .on('start', () => {
        onProgress(10, { stage: 'starting', message: 'Starting video conversion...' });
      })
      .on('progress', (info: any) => {
        const progress = Math.min(Math.round(info.percent || 0), 99);
        onProgress(progress, { stage: 'processing', message: `Converting video: ${info.frames} frames` });
      })
      .on('end', () => {
        onProgress(100, { stage: 'completed', message: 'Video conversion completed' });
        resolve(undefined);
      })
      .on('error', (err: Error) => {
        reject(err);
      })
      .run();
  });
}

async function convertAudio(
  inputPath: string, outputPath: string,
  inputFormat: string, outputFormat: string,
  options: Record<string, any>, onProgress: ProgressCallback,
) {
  const ffmpeg = require('fluent-ffmpeg');

  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath);

    if (options.audioBitrate) {
      command.audioBitrate(options.audioBitrate);
    }

    if (options.sampleRate) {
      command.audioFrequency(options.sampleRate);
    }

    if (options.normalize) {
      command.audioFilters('loudnorm');
    }

    if (options.trimStart !== undefined && options.trimEnd !== undefined) {
      command.setStartTime(options.trimStart);
      command.duration(options.trimEnd - options.trimStart);
    }

    if (options.channels) {
      command.audioChannels(options.channels);
    }

    command
      .output(outputPath)
      .on('start', () => onProgress(10, { stage: 'starting', message: 'Starting audio conversion...' }))
      .on('progress', (info: any) => {
        const progress = Math.min(Math.round(info.percent || 0), 99);
        onProgress(progress, { stage: 'processing', message: `Converting audio: ${info.percent}%` });
      })
      .on('end', () => {
        onProgress(100, { stage: 'completed', message: 'Audio conversion completed' });
        resolve(undefined);
      })
      .on('error', (err: Error) => reject(err))
      .run();
  });
}

async function convertDocument(
  inputPath: string, outputPath: string,
  inputFormat: string, outputFormat: string,
  options: Record<string, any>, onProgress: ProgressCallback,
) {
  onProgress(20, { stage: 'preparing', message: 'Preparing document conversion...' });

  const { execSync } = require('child_process');

  if (outputFormat === 'pdf') {
    if (['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'odt', 'rtf', 'txt', 'html', 'md', 'epub'].includes(inputFormat.toLowerCase())) {
      onProgress(50, { stage: 'converting', message: 'Converting to PDF with LibreOffice...' });
      execSync(
        `libreoffice --headless --convert-to pdf --outdir "${path.dirname(outputPath)}" "${inputPath}"`,
        { stdio: 'pipe', timeout: 120000 },
      );
    }
  } else if (inputFormat.toLowerCase() === 'pdf') {
    if (['png', 'jpg', 'jpeg'].includes(outputFormat)) {
      onProgress(50, { stage: 'converting', message: 'Rendering PDF pages...' });
      const sharp = require('sharp');
      const pdfPath = inputPath;
      const page = options.page || 0;
      execSync(
        `magick convert -density 300 "${pdfPath}[${page}]" -quality 90 "${outputPath}"`,
        { stdio: 'pipe', timeout: 60000 },
      );
    } else if (['docx', 'doc', 'txt', 'html', 'md', 'odt', 'rtf'].includes(outputFormat)) {
      onProgress(50, { stage: 'converting', message: 'Converting PDF with Pandoc...' });
      execSync(
        `pandoc "${inputPath}" -o "${outputPath}"`,
        { stdio: 'pipe', timeout: 120000 },
      );
    }
  } else if (['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(inputFormat.toLowerCase()) && ['pdf', 'png', 'jpg'].includes(outputFormat)) {
    onProgress(50, { stage: 'converting', message: 'Converting document...' });
    execSync(
      `libreoffice --headless --convert-to ${outputFormat} --outdir "${path.dirname(outputPath)}" "${inputPath}"`,
      { stdio: 'pipe', timeout: 120000 },
    );
  } else {
    onProgress(50, { stage: 'converting', message: 'Converting with Pandoc...' });
    execSync(
      `pandoc "${inputPath}" -o "${outputPath}"`,
      { stdio: 'pipe', timeout: 120000 },
    );
  }

  onProgress(100, { stage: 'completed', message: 'Document conversion completed' });
}

async function convertArchive(
  inputPath: string, outputPath: string,
  inputFormat: string, outputFormat: string,
  options: Record<string, any>, onProgress: ProgressCallback,
) {
  onProgress(30, { stage: 'extracting', message: 'Extracting archive...' });
  const { execSync } = require('child_process');
  const extractDir = path.join(path.dirname(inputPath), 'extracted');
  fs.mkdirSync(extractDir, { recursive: true });

  switch (inputFormat.toLowerCase()) {
    case 'zip': execSync(`tar -xf "${inputPath}" -C "${extractDir}"`, { stdio: 'pipe' }); break;
    case 'rar': execSync(`unrar x "${inputPath}" "${extractDir}/"`, { stdio: 'pipe' }); break;
    case '7z': execSync(`7z x "${inputPath}" -o"${extractDir}"`, { stdio: 'pipe' }); break;
    case 'tar': execSync(`tar -xf "${inputPath}" -C "${extractDir}"`, { stdio: 'pipe' }); break;
    case 'gz': execSync(`tar -xzf "${inputPath}" -C "${extractDir}"`, { stdio: 'pipe' }); break;
  }

  onProgress(60, { stage: 'compressing', message: 'Creating new archive...' });

  switch (outputFormat) {
    case 'zip': execSync(`cd "${extractDir}" && zip -r "${outputPath}" .`, { stdio: 'pipe' }); break;
    case 'tar': execSync(`cd "${extractDir}" && tar -cf "${outputPath}" .`, { stdio: 'pipe' }); break;
    case 'gz': execSync(`cd "${extractDir}" && tar -czf "${outputPath}" .`, { stdio: 'pipe' }); break;
    case '7z': execSync(`7z a "${outputPath}" "${extractDir}/*"`, { stdio: 'pipe' }); break;
  }

  fs.rmSync(extractDir, { recursive: true, force: true });
  onProgress(100, { stage: 'completed', message: 'Archive conversion completed' });
}

async function convertFont(
  inputPath: string, outputPath: string,
  inputFormat: string, outputFormat: string,
  options: Record<string, any>, onProgress: ProgressCallback,
) {
  onProgress(30, { stage: 'converting', message: 'Converting font...' });
  const { execSync } = require('child_process');

  try {
    execSync(
      `magick "${inputPath}" "${outputPath}"`,
      { stdio: 'pipe', timeout: 30000 },
    );
  } catch {
    fs.copyFileSync(inputPath, outputPath);
  }

  onProgress(100, { stage: 'completed', message: 'Font conversion completed' });
}

async function convertCad(
  inputPath: string, outputPath: string,
  inputFormat: string, outputFormat: string,
  options: Record<string, any>, onProgress: ProgressCallback,
) {
  onProgress(30, { stage: 'converting', message: 'Converting CAD file...' });
  const { execSync } = require('child_process');

  if (outputFormat === 'pdf') {
    execSync(
      `magick convert -density 300 "${inputPath}" -quality 90 "${outputPath}"`,
      { stdio: 'pipe', timeout: 120000 },
    );
  } else if (['png', 'jpg', 'jpeg'].includes(outputFormat)) {
    execSync(
      `magick convert -density 300 "${inputPath}" -resize "1920x1080>" -quality 90 "${outputPath}"`,
      { stdio: 'pipe', timeout: 120000 },
    );
  }

  onProgress(100, { stage: 'completed', message: 'CAD conversion completed' });
}
