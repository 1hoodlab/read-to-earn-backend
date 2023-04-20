import { Module } from '@nestjs/common';
import { NftStorageService } from './nft-storage.service';
import { NftStorageController } from './nft-storage.controller';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  providers: [NftStorageService],
  controllers: [NftStorageController],
  exports: [NftStorageService],
})
export class NftStorageModule {}
