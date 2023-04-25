import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ClaimStatus, Role, news, user } from '@prisma/client';
import { TypedDataDomain, ethers } from 'ethers';
import { PaginatedResult } from 'src/_serivces/pagination.service';
import { generateRandom, wordsReadTime } from 'src/_serivces/util.service';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { AuthService } from '../auth/services/auth.service';
import { NftStorageService } from '../nft-storage/nft-storage.service';
import { MessageType, OnchainService } from '../onchain/onchain.service';
import { ClaimTokenDto, ClaimTokenResponseDto, CreateNewsInputDto, CreateUserClaimNewsDto, GetNewsAll } from './dto/news.dto';
import { NewsService } from './news.service';
import { ConfigService } from '@nestjs/config';
import { DATA_DOMAIN_NAME, DATA_DOMAIN_VERSION } from 'src/constant';

// reference: https://restfulapi.net/resource-naming/
@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly nftStorageService: NftStorageService,
    private readonly onchainService: OnchainService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiBearerAuth()
  @Post('managed-news')
  @Roles([Role.writer])
  async createNews(@User() user: user, @Body() news: CreateNewsInputDto): Promise<news> {
    const content = await this.nftStorageService.getMarkdownFile(news.cid);

    if (!content) throw new HttpException('CID not found', HttpStatus.BAD_REQUEST);

    return await this.newsService.createNews(news, wordsReadTime(content).wordTime, user);
  }
  @Public()
  @Get(':slug')
  async getNewsDetail(@Param('slug') slug: string): Promise<news> {
    const news = await this.newsService.findNewsBySlug(slug);
    if (!news) throw new HttpException('News not found!', HttpStatus.BAD_REQUEST);

    return news;
  }

  @Public()
  @Get('managed-news')
  async getNewsAll(@Query() query: GetNewsAll): Promise<PaginatedResult<any>> {
    const { page, perPage, keyword = '' } = query;
    return await this.newsService.getNewsAll({ page, perPage, keyword });
  }

  // BE của nextJS sẽ gọi API create-claim và truyền vào slug và token của người dùng
  // BE của nextJS có nhiệm vụ tracking việc đọc của người dùng nếu hoàn thành nhiệm vụ thì gọi create-claim
  // nên gửi user token trong thẻ header: x-user-token

  @ApiBearerAuth()
  @Post('managed-claim')
  @Roles([Role.root])
  async createUserClaimNews(@Headers('x-reader-token') readerToken: string, @Body() body: CreateUserClaimNewsDto) {
    if (!readerToken) throw new HttpException("Please add 'x-reader-token' to header", HttpStatus.BAD_REQUEST);

    const user = await this.authService.getUserFromToken(readerToken);
    const news = await this.newsService.findNewsBySlug(body.slug);

    const userClaimNews = await this.newsService.findUserClaimNewsById(user.id, news.id);
    if (userClaimNews) throw new HttpException('User Claim News is Exist!', HttpStatus.BAD_REQUEST);

    const transactionId = `transaction#${user.id}_${news.id}_${generateRandom()}`;
    return await this.newsService.createUserClaimNews(transactionId, user.id, news.id);
  }

  @ApiBearerAuth()
  @Get('claims')
  @Roles([Role.writer, Role.reader])
  async getListUserClaimNews(@User() user: user): Promise<any> {
    return this.newsService.getListClaimNews(user.id);
  }

  @ApiBearerAuth()
  @Roles([Role.reader])
  @Put('managed-claim')
  async claimToken(@User() user: user, @Body() body: ClaimTokenDto): Promise<ClaimTokenResponseDto> {
    if (!user.wallet_address) throw new HttpException('Please link wallet!', HttpStatus.BAD_REQUEST);

    const news = await this.newsService.findNewsById(body.news_id);
    if (!news) throw new HttpException('News not found!', HttpStatus.BAD_REQUEST);

    const userClaimNews = await this.newsService.findUserClaimNewsById(user.id, body.news_id);

    if (!userClaimNews || userClaimNews.status === ClaimStatus.failure || userClaimNews.status === ClaimStatus.success)
      throw new HttpException('You not claim token here!', HttpStatus.BAD_REQUEST);

    const domain: TypedDataDomain = {
      name: DATA_DOMAIN_NAME,
      version: DATA_DOMAIN_VERSION,
      verifyingContract: this.configService.get<string>('SNEWS_CONTRACT_ADDRESS'),
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
