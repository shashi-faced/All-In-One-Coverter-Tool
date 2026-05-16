import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UsageService } from './usage.service';
import { UsageController } from './usage.controller';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [UsageController],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
