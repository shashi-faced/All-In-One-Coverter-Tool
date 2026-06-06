import { Module } from '@nestjs/common';
import { ConversionController } from './conversion.controller';
import { ConversionService } from './conversion.service';
import { QueueModule } from '../queue/queue.module';
import { UploadModule } from '../upload/upload.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [QueueModule, UploadModule, StorageModule],
  controllers: [ConversionController],
  providers: [ConversionService],
  exports: [ConversionService],
})
export class ConversionModule {}
