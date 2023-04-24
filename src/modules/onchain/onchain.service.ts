import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ethers from 'ethers';

export type MessageType = {
  from: string;
  tokenId: number;
  nonce: number;
  value: any;
};
@Injectable()
export class OnchainService {
  private wallet: ethers.Wallet;
  constructor(private readonly configService: ConfigService) {
    const provider = new ethers.providers.JsonRpcProvider(this.configService.get<'string'>('NETWORK_RPC_URL'));
    this.wallet = new ethers.Wallet(this.configService.get<'string'>('SIGNER_PRIVATE_KEY'), provider);
  }

  async signMessage(domain: ethers.TypedDataDomain, types, message: MessageType) {
    const signature = await this.wallet._signTypedData(domain, types, message);
    return ethers.utils.splitSignature(signature);
  }
}
