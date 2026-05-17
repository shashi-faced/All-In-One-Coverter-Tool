import { Controller, Get, Put, Param, Res, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Get('download/:key')
  @Public()
  @ApiOperation({ summary: 'Download file by storage key' })
  async downloadFile(@Param('key') key: string, @Res() res: Response) {
    const buffer = await this.storageService.download(key);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${key.split('/').pop()}"`,
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  }

  @Put('download/:key')
  @Public()
  @ApiOperation({ summary: 'Upload file by storage key (Local storage mock)' })
  async uploadFile(
    @Param('key') key: string,
    @Req() req: any,
  ) {
    let buffer: Buffer;
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else if (req.body instanceof Uint8Array) {
      buffer = Buffer.from(req.body);
    } else {
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        chunks.push(chunk as Buffer);
      }
      buffer = Buffer.concat(chunks);
    }
    await this.storageService.uploadBuffer(decodeURIComponent(key), buffer);
    return { success: true };
  }
}
