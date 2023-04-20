import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ClaimStatus, Role, news, user } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { ClaimToken, CreateNewsInputDto, GetNewsAll } from './dto/news.dto';
import { NewsService } from './news.service';
import { NftStorageService } from '../nft-storage/nft-storage.service';
import { wordsReadTime } from 'src/_serivces/util.service';
import { User } from 'src/decorators/user.decorator';
import { Public } from 'src/decorators/public.decorator';
import { PaginatedResult } from 'src/_serivces/pagination.service';
import { SNEWS_CONTRACT_ADDRESS } from 'src/constant';
import { MessageType, OnchainService } from '../onchain/onchain.service';
import { TypedDataDomain, ethers } from 'ethers';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly nftStorageService: NftStorageService,
    private readonly onchainService: OnchainService,
  ) {}

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
    const news = await this.newsService.findNewsBySlug(slug);
    if (!news) throw new HttpException('News not found!', 400);

    return news;
  }

  @Public()
  @Get('/all')
  async getNewsAll(@Query() query: GetNewsAll): Promise<PaginatedResult<any>> {
    const { page, perPage, keyword = '' } = query;
    return await this.newsService.getNewsAll({ page, perPage, keyword });
  }

  @Post('/claim')
  async claimToken(@User() user: user, @Body() body: ClaimToken): Promise<any> {
    if (!user.wallet_address) throw new HttpException('Please link wallet!', 400);

    const news = await this.newsService.findNewsById(body.news_id);
    if (!news) throw new HttpException('News not found!', 400);

    const userClaimNews = await this.newsService.findUserClaimNewsById(user.id, body.news_id);

    if (!userClaimNews || userClaimNews.status === ClaimStatus.failure || userClaimNews.status === ClaimStatus.success)
      throw new HttpException('You not claim token here!', 400);

    const domain: TypedDataDomain = {
      name: 'SNews',
      version: '1.0',
      verifyingContract: SNEWS_CONTRACT_ADDRESS,
    };
    const types = {
      Claim: [
        { name: 'from', type: 'address' },
        { name: 'tokenId', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'value', type: 'uint256' },
      ],
    };

    let userClaimNonce = await this.newsService.countUserClaimNews(user.id);

    const message: MessageType = {
      from: user.wallet_address,
      tokenId: news.token_id,
      nonce: userClaimNonce + 1,
      value: ethers.utils.parseEther(news.total_supply),
    };
    let signMessage = await this.onchainService.signMessage(domain, types, message);

    return {
      r: signMessage.r,
      v: signMessage.v,
      s: signMessage.s,
      transaction_id: userClaimNews.transaction_id,
      slug: news.slug,
    };
  }
}
