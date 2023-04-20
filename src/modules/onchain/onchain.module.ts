import { Module } from '@nestjs/common';
import { OnchainService } from './onchain.service';

@Module({
  exports: [OnchainService],
  providers: [OnchainService],
})
export class OnchainModule {}
