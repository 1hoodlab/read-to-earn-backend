import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CIDString, NFTStorage } from 'nft.storage';
import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NftStorageService {
  private storage: NFTStorage;
  private logger = new Logger(NFTStorage.name);

  constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) {
    this.storage = new NFTStorage({ token: this.configService.get<string>('NFT_STORAGE_TOKEN') });
  }

  async storeMarkdownFile(file: any): Promise<CIDString> {
    return await this.storage.storeBlob(file);
  }

  async getMarkdownFile(cid: string): Promise<string | undefined> {
    try {
      const status = await this.storage.check(cid);

      if (!status) throw new HttpException('CID not found', HttpStatus.BAD_REQUEST);

      const request = this.httpService
        .get(`https://${cid}.ipfs.nftstorage.link/`)
        .pipe(map((res) => res.data))
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happend!';
          }),
        );

      return await lastValueFrom(request);
    } catch (error) {
      this.logger.error(error.response);
      return undefined;
    }
  }
}
