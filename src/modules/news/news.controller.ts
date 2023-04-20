import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, news, user } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateNewsInputDto } from './dto/news.dto';
import { NewsService } from './news.service';
import { NftStorageService } from '../nft-storage/nft-storage.service';
import { wordsReadTime } from 'src/_serivces/util.service';
import { User } from 'src/decorators/user.decorator';
import { Public } from 'src/decorators/public.decorator';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(private readonly newsService: NewsService, private readonly nftStorageService: NftStorageService) {}

  @Post('create')
  @Roles([Role.writer])
  async createNews(@User() user: user, @Body() news: CreateNewsInputDto): Promise<news> {
    const content = await this.nftStorageService.getMarkdownFile(news.cid);

    if (!content) throw new HttpException('CID not found', 400);

    return await this.newsService.createNews(news, wordsReadTime(content).wordTime, user);
  }
}
