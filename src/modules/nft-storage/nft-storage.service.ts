import { HttpService } from '@nestjs/axios';
import { nft_storage_token } from './../../constant/index';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CIDString, NFTStorage } from 'nft.storage';
import { catchError, lastValueFrom, map } from 'rxjs';
import { AxiosError } from 'axios';

@Injectable()
export class NftStorageService {
  private storage: NFTStorage;
  private logger = new Logger(NFTStorage.name);

  constructor(private readonly httpService: HttpService) {
    this.storage = new NFTStorage({ token: nft_storage_token });
  }

  async storeMarkdownFile(file: any): Promise<CIDString> {
    return await this.storage.storeBlob(file);
  }

  async getMarkdownFile(cid: string) {
    try {
      const status = await this.storage.check(cid);

      if (!status) throw new HttpException('CID not found', 400);

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
      return null;
    }
  }
}
