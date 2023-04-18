import { nft_storage_token } from './../../constant/index';
import { Injectable } from '@nestjs/common';
import { CarReader, FilesSource, NFTStorage } from 'nft.storage';

@Injectable()
export class NftStorageService {
  constructor() {}

  async storeMardownFile(file: any): Promise<any> {
    const storage = new NFTStorage({ token: nft_storage_token });
    return await storage.storeBlob(file);
  }
}
