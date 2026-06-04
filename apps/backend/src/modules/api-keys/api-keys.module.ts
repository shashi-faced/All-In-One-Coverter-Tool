import { Module } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller';
import { DeveloperController } from './developer.controller';
import { ApiKeysService } from './api-keys.service';

@Module({
  controllers: [ApiKeysController, DeveloperController],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
