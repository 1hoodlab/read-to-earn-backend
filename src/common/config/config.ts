import type { Config } from './config.interface';

const config: Config = {
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
