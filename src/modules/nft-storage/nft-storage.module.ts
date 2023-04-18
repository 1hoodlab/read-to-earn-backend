import { Module } from '@nestjs/common';
import { NftStorageService } from './nft-storage.service';
import { NftStorageController } from './nft-storage.controller';

@Module({
  providers: [NftStorageService],
  controllers: [NftStorageController]
})
export class NftStorageModule {}
