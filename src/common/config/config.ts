import type { Config } from './config.interface';

const config: Config = {
  onchain: {
    nft_storage_token: process.env.NFT_STORAGE_TOKEN,
    signer_private_key: process.env.SIGNER_PRIVATE_KEY,
    snews_contract_address: process.env.SNEWS_CONTRACT_ADDRESS,
    network_rpc_url: process.env.NETWORK_RPC_URL,
  },
  nest: {
    address: process.env.BACKEND_HOST as string,
    port: process.env.BACKEND_PORT as string,
    version: 'v1',
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: process.env.NODE_ENV !== 'production' ? true : false,
    title: 'Welcome to the Spritiy.JSC',
    description: 'Read to Earn API description',
    version: '0.1',
    path: 'docs',
  },
  security: {
    expiresIn: '7d',
    bcryptSaltOrRound: 10,
    expiresInEmail: '5m',
  },
};

export default (): Config => config;
