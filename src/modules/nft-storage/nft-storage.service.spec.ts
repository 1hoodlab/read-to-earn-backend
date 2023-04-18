import { Test, TestingModule } from '@nestjs/testing';
import { NftStorageService } from './nft-storage.service';

describe('NftStorageService', () => {
  let service: NftStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NftStorageService],
    }).compile();

    service = module.get<NftStorageService>(NftStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
