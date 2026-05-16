import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('API Keys')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Create new API key' })
  async createKey(
    @CurrentUser() user: any,
    @Body() body: { name: string; expiresInDays?: number },
  ) {
    return this.apiKeysService.createApiKey(user.id, body.name, body.expiresInDays);
  }

  @Get()
  @ApiOperation({ summary: 'List API keys' })
  async listKeys(@CurrentUser() user: any) {
    return this.apiKeysService.getUserApiKeys(user.id);
  }

  @Post(':id/revoke')
  @ApiOperation({ summary: 'Revoke API key' })
  async revokeKey(@CurrentUser() user: any, @Param('id') id: string) {
    return this.apiKeysService.revokeApiKey(id, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete API key' })
  async deleteKey(@CurrentUser() user: any, @Param('id') id: string) {
    return this.apiKeysService.deleteApiKey(id, user.id);
  }
}
