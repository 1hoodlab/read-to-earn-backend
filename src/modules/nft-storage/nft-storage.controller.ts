import { Body, Controller, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { markdownFilter } from './util';
import { SingleFileDto } from './dto/single-file.dto';
import { FastifyFileInterceptor } from 'src/interceptor/fastify-file-interceptor';
import { NftStorageService } from './nft-storage.service';
import { NFTStorage } from 'nft.storage';

@Controller('nft-storage')
@ApiTags('Upload')
export class NftStorageController {
  constructor(private readonly nftStorageService: NftStorageService) {}
  @ApiConsumes('multipart/form-data')
  @Post('blog')
  @UseInterceptors(FastifyFileInterceptor('blog', { fileFilter: markdownFilter }))
  async uploadBlogContent(@Req() req: Request, @UploadedFile() file: Express.Multer.File, @Body() body: SingleFileDto) {
    const someData = new Blob([file.buffer]);
    return await this.nftStorageService.storeMardownFile(someData);
  }
}
