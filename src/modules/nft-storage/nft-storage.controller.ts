import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { markdownFilter } from './util';
import { SingleFileDto } from './dto/index.dto';
import { FastifyFileInterceptor } from 'src/interceptor/fastify-file-interceptor';
import { NftStorageService } from './nft-storage.service';
import { UPLOAD_FIELD } from './constants';
import { CIDString } from 'nft.storage';
import { HttpService } from '@nestjs/axios';

@Controller('nft-storage')
@ApiTags('Nft.Storage')
export class NftStorageController {
  constructor(private readonly nftStorageService: NftStorageService, private readonly httpService: HttpService) {}
  @ApiConsumes('multipart/form-data')
  @Post('news')
  @UseInterceptors(FastifyFileInterceptor(UPLOAD_FIELD, { fileFilter: markdownFilter }))
  async uploadBlogContent(@UploadedFile() file: Express.Multer.File, @Body() body: SingleFileDto): Promise<CIDString> {
    const someData = new Blob([file.buffer]);
    return await this.nftStorageService.storeMarkdownFile(someData);
  }

  @Get('content/:cid')
  async getContent(@Param('cid') cid: string): Promise<any> {
    return await this.nftStorageService.getMarkdownFile(cid);
  }
}
