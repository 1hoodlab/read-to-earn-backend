import { Test, TestingModule } from '@nestjs/testing';
import { NftStorageController } from './nft-storage.controller';

describe('NftStorageController', () => {
  let controller: NftStorageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NftStorageController],
    }).compile();

    controller = module.get<NftStorageController>(NftStorageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
