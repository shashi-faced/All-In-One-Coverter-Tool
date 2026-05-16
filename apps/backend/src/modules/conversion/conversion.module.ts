import { Module } from '@nestjs/common';
import { ConversionController } from './conversion.controller';
import { ConversionService } from './conversion.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  controllers: [ConversionController],
  providers: [ConversionService],
  exports: [ConversionService],
})
export class ConversionModule {}
