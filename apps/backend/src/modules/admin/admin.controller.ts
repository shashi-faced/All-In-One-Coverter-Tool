import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async getUsers(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminService.getUsers(page, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Post('users/:id')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(
    @Param('id') id: string,
    @Body() data: { role?: string; isActive?: boolean },
  ) {
    return this.adminService.updateUser(id, data);
  }

  @Get('analytics/conversions')
  @ApiOperation({ summary: 'Conversion analytics' })
  async getConversionAnalytics(@Query('days') days = 30) {
    return this.adminService.getConversionAnalytics(days);
  }

  @Get('analytics/revenue')
  @ApiOperation({ summary: 'Revenue analytics' })
  async getRevenueAnalytics(@Query('days') days = 30) {
    return this.adminService.getRevenueAnalytics(days);
  }
}
