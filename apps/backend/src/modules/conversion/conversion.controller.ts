import { Controller, Post, Get, Delete, Body, Param, Query, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConversionService } from './conversion.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Conversion')
@Public()
@Controller('convert')
export class ConversionController {
  constructor(private conversionService: ConversionService) {}

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
