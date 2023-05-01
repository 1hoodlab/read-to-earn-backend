import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ethers from 'ethers';
import { ClaimTokenEvent, CreateNewsEvent, Event } from 'src/constant';

export type MessageType = {
  from: string;
  tokenId: number;
  nonce: number;
  value: any;
};
@Injectable()
export class OnchainService {
  private wallet: ethers.Wallet;
  private provider: ethers.ethers.providers.JsonRpcProvider;
  constructor(private readonly configService: ConfigService) {
    this.provider = new ethers.providers.JsonRpcProvider(this.configService.get<'string'>('NETWORK_RPC_URL'));
    this.wallet = new ethers.Wallet(this.configService.get<'string'>('SIGNER_PRIVATE_KEY'), this.provider);
  }

  async signMessage(domain: ethers.TypedDataDomain, types, message: MessageType) {
    const signature = await this.wallet._signTypedData(domain, types, message);
    return ethers.utils.splitSignature(signature);
  }

  async decodeTxHash(txhash: string) {
    let transactionReceipt = await this.provider.getTransactionReceipt(txhash);

    const iface = new ethers.utils.Interface([CreateNewsEvent, ClaimTokenEvent]);
    return iface.parseLog(transactionReceipt.logs[transactionReceipt.logs.length - 1]).args;
  }
}
