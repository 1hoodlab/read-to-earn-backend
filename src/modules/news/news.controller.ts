import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ClaimStatus, Role, news, user } from '@prisma/client';
import { BigNumber, TypedDataDomain, ethers } from 'ethers';
import { PaginatedResult } from 'src/_serivces/pagination.service';
import { generateRandom, wordsReadTime } from 'src/_serivces/util.service';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { AuthService } from '../auth/services/auth.service';
import { NftStorageService } from '../nft-storage/nft-storage.service';
import { MessageType, OnchainService } from '../onchain/onchain.service';
import {
  ClaimTokenDto,
  ClaimTokenResponseDto,
  CreateNewsInputDto,
  CreateUserClaimNewsDto,
  GetNewsAll,
  UpdateStatusUserClaimNewsDto,
} from './dto/news.dto';
import { NewsService } from './news.service';
import { ConfigService } from '@nestjs/config';
import { DATA_DOMAIN_NAME, DATA_DOMAIN_VERSION, Event } from 'src/constant';
import { Logger, Result } from 'ethers/lib/utils';
import { Storage } from '@google-cloud/storage';
import { FastifyFileInterceptor } from 'src/interceptor/fastify-file-interceptor';
import { UPLOAD_FIELD } from '../nft-storage/constants';
import { imageFilter } from '../nft-storage/util';
import { SingleFileImageDto } from '../nft-storage/dto/index.dto';
import { join } from 'path';
import { nanoid } from 'nanoid';
import urlcat from 'urlcat';

// reference: https://restfulapi.net/resource-naming/
@Controller('news')
@ApiTags('News')
export class NewsController {
  private storage: Storage;

  private logger = new Logger(NewsController.name);
  constructor(
    private readonly newsService: NewsService,
    private readonly nftStorageService: NftStorageService,
    private readonly onchainService: OnchainService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    this.storage = new Storage({
      keyFilename: '../../../_credentials/gcp-storage.json',
    });
  }

  @ApiBearerAuth()
  @Roles(['root', 'writer'])
  @Post('upload/banner')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FastifyFileInterceptor('file', {
      fileFilter: imageFilter,
    }),
  )
  async uploadBanner(@UploadedFile() file: Express.Multer.File, @Body() body: SingleFileImageDto) {
    try {
      const bucketName = this.configService.get<string>('BUCKET_NAME');
      const bucket = this.storage.bucket(bucketName);
      const filename = nanoid() + '_' + file.originalname;

      await bucket.file(filename).save(file.buffer);
      const publicUrl = urlcat('https://storage.googleapis.com/', '/spirity/:filename', { filename: filename });
      return {
        publicUrl: publicUrl,
      };
    } catch (error) {
      console.log(error);
    }
  }

  @ApiBearerAuth()
  @Post('managed-news')
  @Roles([Role.writer])
  async createNews(@User() user: user, @Body() news: CreateNewsInputDto): Promise<news> {
    const content = await this.nftStorageService.getMarkdownFile(news.cid);

    this.logger.info(`Event: ${Event.CreateNewsEvent} - txhash: ${news.txhash}`);

    if (!content) throw new HttpException('CID not found', HttpStatus.BAD_REQUEST);

    let [tokenId, ownerAddress, slug, totalSupply, paymentToken] = await this.onchainService.decodeTxHash(news.txhash);

    news.payment_token = paymentToken;
    news.slug = slug;
    news.content_url = `https://${news.cid}.ipfs.nftstorage.link/`;

    this.logger.info(content, tokenId, ownerAddress, slug, totalSupply, paymentToken);

    return await this.newsService.createNews(news, wordsReadTime(content).wordTime, user, tokenId.toNumber(), totalSupply.toString());
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

    console.log(user.id, news.id);
    const userClaimNews = await this.newsService.findUserClaimNewsById(user.id, news.id);

    console.log(userClaimNews);
    if (userClaimNews) return userClaimNews;

    const transactionId = `transaction#${user.id}_${news.id}_${generateRandom()}`;
    return await this.newsService.createUserClaimNews(transactionId, user.id, news.id);
  }

  @ApiBearerAuth()
  @Put('managed-claim/status')
  @Roles([Role.root])
  async updateStatusUserClaimNews(@Headers('x-reader-token') readerToken: string, @Body() body: UpdateStatusUserClaimNewsDto): Promise<any> {
    if (!readerToken) throw new HttpException("Please add 'x-reader-token' to header", HttpStatus.BAD_REQUEST);

    const user = await this.authService.getUserFromToken(readerToken);
    const news = await this.newsService.findNewsBySlug(body.slug);

    this.logger.info(body.slug, news.id, user.id);

    const userClaimNews = await this.newsService.findUserClaimNewsById(user.id, news.id);
    if (!userClaimNews) throw new HttpException('User Claim News not found!', HttpStatus.BAD_REQUEST);

    console.log(userClaimNews);

    if (userClaimNews.status !== ClaimStatus.pending) throw new HttpException('update status dont have turn!', HttpStatus.BAD_REQUEST);

    this.logger.info(user.id, news.id, body.status);

    return await this.newsService.updateStatusUserClaimNews(user.id, news.id, body.status);
  }

  @ApiBearerAuth()
  @Get('claims')
  @Roles([Role.writer, Role.reader])
  async getListUserClaimNews(@User() user: user): Promise<any> {
    return this.newsService.getListClaimNews(user.id);
  }

  @ApiBearerAuth()
  @Roles([Role.reader])
  @Get('managed-claim/verify/:txhash')
  async verifyTxHash(@Param('txhash') txhash: string): Promise<any> {
    const [tokenId, readerAddress, tokenValue, transactionId] = await this.onchainService.decodeTxHash(txhash);
    return await this.newsService.updateTokenEarned(transactionId, tokenValue.toString());
  }

  @ApiBearerAuth()
  @Roles([Role.reader])
  @Put('managed-claim')
  async claimToken(@User() user: user, @Body() body: ClaimTokenDto): Promise<ClaimTokenResponseDto> {
    //TODO: check onchain for approve claim news [urgent]
    if (!user.wallet_address) throw new HttpException('Please link wallet!', HttpStatus.BAD_REQUEST);

    const news = await this.newsService.findNewsById(body.news_id);
    if (!news) throw new HttpException('News not found!', HttpStatus.BAD_REQUEST);

    const userClaimNews = await this.newsService.findUserClaimNewsById(user.id, body.news_id);

    console.log(userClaimNews);

    if (!userClaimNews || userClaimNews.status === ClaimStatus.failure || userClaimNews.status !== ClaimStatus.success)
      throw new HttpException('You not claim token here!', HttpStatus.BAD_REQUEST);

    this.logger.info(`verifyingContract: ${this.configService.get<string>('SNEWS_CONTRACT_ADDRESS').toLowerCase()}`);

    const domain: TypedDataDomain = {
      name: DATA_DOMAIN_NAME,
      version: DATA_DOMAIN_VERSION,
      verifyingContract: this.configService.get<string>('SNEWS_CONTRACT_ADDRESS').toLowerCase(),
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

    this.logger.info(userClaimNonce, news.total_supply);

    const message: MessageType = {
      from: user.wallet_address.toLowerCase(),
      tokenId: news.token_id,
      nonce: userClaimNonce,
      value: BigNumber.from(news.total_supply),
    };

    this.logger.info(domain, message);

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
