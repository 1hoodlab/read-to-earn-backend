export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  graphql?: GraphqlConfig;
  security: SecurityConfig;
  onchain: OnchainConfig;
}

export interface OnchainConfig {
  network_rpc_url: string;
  snews_contract_address: string;
  signer_private_key: string;
  nft_storage_token: string;
}
export interface NestConfig {
  address: string;
  port: number | string;
  version: string;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  schemaDestination: string;
  sortSchema: boolean;
}

export interface SecurityConfig {
  expiresIn: string;
  bcryptSaltOrRound: string | number;
  expiresInEmail: string;
}
