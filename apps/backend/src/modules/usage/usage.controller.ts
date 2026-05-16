import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { UsageService } from './usage.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Usage')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('usage')
export class UsageController {
  constructor(private usageService: UsageService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get today usage' })
  async getTodayUsage(@CurrentUser() user: any) {
    return this.usageService.getUserDailyUsage(user.id);
  }
}
