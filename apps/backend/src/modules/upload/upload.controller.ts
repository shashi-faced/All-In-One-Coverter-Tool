import {
  Controller, Post, Get, Delete, Body, Param, Query,
  UseInterceptors, UploadedFile, Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Upload')
@Public()
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  private getUserId(@Headers('x-session-id') sessionId: string): string {
    return sessionId || 'anonymous';
  }

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate file upload' })
  async initiateUpload(
    @Headers('x-session-id') sessionId: string,
    @Body() body: { fileName: string; fileSize: number; mimeType: string },
  ) {
    return this.uploadService.initiateUpload(
      this.getUserId(sessionId),
      body.fileName,
      body.fileSize,
      body.mimeType,
    );
  }

  @Post('complete/:uploadId')
  @ApiOperation({ summary: 'Complete chunked upload' })
  async completeUpload(
    @Headers('x-session-id') sessionId: string,
    @Param('uploadId') uploadId: string,
    @Body() body: { fileId: string },
  ) {
    return this.uploadService.completeChunkedUpload(body.fileId, uploadId, this.getUserId(sessionId));
  }

  @Post('direct')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Direct file upload' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5368709120 } }))
  async uploadDirect(
    @Headers('x-session-id') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadDirect(this.getUserId(sessionId), file);
  }

  @Get('files')
  @ApiOperation({ summary: 'List files' })
  async listFiles(
    @Headers('x-session-id') sessionId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.uploadService.getUserFiles(this.getUserId(sessionId), page, limit);
  }

  @Delete('files/:id')
  @ApiOperation({ summary: 'Delete file' })
  async deleteFile(
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ) {
    return this.uploadService.deleteFile(id, this.getUserId(sessionId));
  }
}
