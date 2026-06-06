import {
  Controller, Post, Get, Delete, Body, Param, Query, Headers, Req,
  UseInterceptors, UploadedFile, Res, BadRequestException, RequestTimeoutException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ConversionService } from './conversion.service';
import { UploadService } from '../upload/upload.service';
import { StorageService } from '../storage/storage.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Conversion')
@Public()
@Controller('convert')
export class ConversionController {
  constructor(
    private conversionService: ConversionService,
    private uploadService: UploadService,
    private storageService: StorageService,
  ) {}

  private getUserId(req: any, sessionId: string): string {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    return sessionId || 'anonymous';
  }

  @Post()
  @ApiOperation({ summary: 'Create a new conversion job' })
  async createConversion(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Body() body: { fileId: string; outputFormat: string; options?: Record<string, unknown> },
  ) {
    return this.conversionService.createConversion(
      this.getUserId(req, sessionId),
      body.fileId,
      body.outputFormat.toUpperCase(),
      body.options,
    );
  }

  @Post('sync')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Synchronously upload, convert, and download file' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5368709120 } }))
  async convertSync(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('outputFormat') outputFormat: string,
    @Body('options') optionsStr: string,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!outputFormat) {
      throw new BadRequestException('outputFormat is required');
    }

    const userId = this.getUserId(req, sessionId);

    // Parse options if provided
    let options: Record<string, unknown> = {};
    if (optionsStr) {
      try {
        options = typeof optionsStr === 'string' ? JSON.parse(optionsStr) : optionsStr;
      } catch {
        options = {};
      }
    }

    // 1. Upload the file directly
    const uploadedFile = await this.uploadService.uploadDirect(userId, file);
    const fileId = uploadedFile.id;

    // 2. Trigger the conversion
    const conversionResult = await this.conversionService.createConversion(
      userId,
      fileId,
      outputFormat.toUpperCase(),
      options,
    );
    const jobId = conversionResult.id;

    // 3. Poll database for job status
    let completedJob: any = null;
    const maxAttempts = 60; // 30 seconds max (60 * 500ms)
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const job = await this.conversionService.getConversion(jobId, userId);
      if (job.status === 'COMPLETED') {
        completedJob = job;
        break;
      }
      if (job.status === 'FAILED') {
        throw new BadRequestException(`Conversion failed: ${job.error || 'Unknown error'}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!completedJob) {
      throw new RequestTimeoutException('Conversion timed out');
    }

    // 4. Download output file buffer and stream it back
    const buffer = await this.storageService.download(completedJob.outputPath);
    const outputFilename = completedJob.outputPath.split('/').pop() || `converted_${jobId}`;

    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${outputFilename}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Get('formats')
  @ApiOperation({ summary: 'Get supported conversion formats' })
  async getFormats() {
    return this.conversionService.getSupportedFormats();
  }

  @Get('history')
  @ApiOperation({ summary: 'Get conversion history' })
  async getHistory(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.conversionService.getUserConversions(this.getUserId(req, sessionId), page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversion status' })
  async getStatus(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ) {
    return this.conversionService.getConversion(id, this.getUserId(req, sessionId));
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed conversion' })
  async retryConversion(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ) {
    return this.conversionService.retryConversion(id, this.getUserId(req, sessionId));
  }

  @Post('batch')
  @ApiOperation({ summary: 'Batch conversion' })
  async batchConversion(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Body() body: { items: { fileId: string; outputFormat: string; options?: Record<string, unknown> }[] },
  ) {
    const results = await Promise.all(
      body.items.map((item) =>
        this.conversionService.createConversion(this.getUserId(req, sessionId), item.fileId, item.outputFormat.toUpperCase(), item.options),
      ),
    );
    return results;
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download conversion output' })
  async downloadConversion(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ) {
    return this.conversionService.getConversion(id, this.getUserId(req, sessionId));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel conversion' })
  async cancelConversion(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ) {
    return this.conversionService.cancelConversion(id, this.getUserId(req, sessionId));
  }
}
