import {
  Controller, Post, Get, Delete, Body, Param, Query,
  UseInterceptors, UploadedFile, Headers, Req,
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

  private getUserId(req: any, sessionId: string): string {
    if (req.user && req.user.id) {
      return req.user.id;
    }
    return sessionId || 'anonymous';
  }

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate file upload' })
  async initiateUpload(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Body() body: { fileName: string; fileSize: number; mimeType: string },
  ) {
    return this.uploadService.initiateUpload(
      this.getUserId(req, sessionId),
      body.fileName,
      body.fileSize,
      body.mimeType,
    );
  }

  @Post('complete/:uploadId')
  @ApiOperation({ summary: 'Complete chunked upload' })
  async completeUpload(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Param('uploadId') uploadId: string,
    @Body() body: { fileId: string },
  ) {
    return this.uploadService.completeChunkedUpload(body.fileId, uploadId, this.getUserId(req, sessionId));
  }

  @Post('direct')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Direct file upload' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5368709120 } }))
  async uploadDirect(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadDirect(this.getUserId(req, sessionId), file);
  }

  @Get('files')
  @ApiOperation({ summary: 'List files' })
  async listFiles(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.uploadService.getUserFiles(this.getUserId(req, sessionId), page, limit);
  }

  @Delete('files/:id')
  @ApiOperation({ summary: 'Delete file' })
  async deleteFile(
    @Req() req: any,
    @Headers('x-session-id') sessionId: string,
    @Param('id') id: string,
  ) {
    return this.uploadService.deleteFile(id, this.getUserId(req, sessionId));
  }
}
