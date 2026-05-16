import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
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
}
