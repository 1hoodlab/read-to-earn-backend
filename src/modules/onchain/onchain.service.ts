import { Injectable } from '@nestjs/common';
import * as ethers from 'ethers';
import { NETWORK_RPC_URL, SIGNER_PRIVATE_KEY } from 'src/constant';

export type MessageType = {
  from: string;
  tokenId: number;
  nonce: number;
  value: any;
};
@Injectable()
export class OnchainService {
  private wallet: ethers.Wallet;
  constructor() {
    const provider = new ethers.providers.JsonRpcProvider(NETWORK_RPC_URL);
    this.wallet = new ethers.Wallet(SIGNER_PRIVATE_KEY, provider);
  }

  async signMessage(domain: ethers.TypedDataDomain, types, message: MessageType) {
    const signature = await this.wallet._signTypedData(domain, types, message);
    return ethers.utils.splitSignature(signature);
   
  }
}
