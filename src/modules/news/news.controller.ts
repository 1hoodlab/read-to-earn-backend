import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, news, user } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateNewsInputDto, GetNewsAll } from './dto/news.dto';
import { NewsService } from './news.service';
import { NftStorageService } from '../nft-storage/nft-storage.service';
import { wordsReadTime } from 'src/_serivces/util.service';
import { User } from 'src/decorators/user.decorator';
import { Public } from 'src/decorators/public.decorator';
import { PaginatedResult } from 'src/_serivces/pagination.service';

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
  @Public()
  @Get(':slug')
  async getNewsDetail(@Param('slug') slug: string): Promise<news> {
    const news = await this.newsService.findNews(slug);
    if (!news) throw new HttpException('News not found!', 400);

    return news;
  }

  @Public()
  @Get('/all')
  async getNewsAll(@Query() query: GetNewsAll): Promise<PaginatedResult<any>> {
    const { page, perPage, keyword = '' } = query;
    return await this.newsService.getNewsAll({ page, perPage, keyword });
  }
}
