import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { NftStorageService } from '../nft-storage/nft-storage.service';
import { HttpService } from '@nestjs/axios';
import { NftStorageModule } from '../nft-storage/nft-storage.module';
import { OnchainModule } from '../onchain/onchain.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NftStorageModule, OnchainModule, AuthModule],
  providers: [NewsService],
  exports: [NewsService],
  controllers: [NewsController],
})
export class NewsModule {}
