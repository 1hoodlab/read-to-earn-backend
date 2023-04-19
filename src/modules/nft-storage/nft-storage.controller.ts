import { Body, Controller, Get, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { markdownFilter } from './util';
import { GetContentDto, SingleFileDto } from './dto/index.dto';
import { FastifyFileInterceptor } from 'src/interceptor/fastify-file-interceptor';
import { NftStorageService } from './nft-storage.service';
import { UPLOAD_FIELD } from './constants';
import { CIDString } from 'nft.storage';

@Controller('nft-storage')
@ApiTags('Nft.Storage')
export class NftStorageController {
  constructor(private readonly nftStorageService: NftStorageService) {}
  @ApiConsumes('multipart/form-data')
  @Post('news')
  @UseInterceptors(FastifyFileInterceptor(UPLOAD_FIELD, { fileFilter: markdownFilter }))
  async uploadBlogContent(@UploadedFile() file: Express.Multer.File, @Body() body: SingleFileDto): Promise<CIDString> {
    const someData = new Blob([file.buffer]);
    return await this.nftStorageService.storeMardownFile(someData);
  }

  @Get('content')
  async getContent(@Body() cid: GetContentDto) {}
}
