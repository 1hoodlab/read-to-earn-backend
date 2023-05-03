export const WORDS_PER_MIN = 275;
export const IMAGE_READ_TIME = 12;
export const CHINESE_KOREAN_READ_TIME = 500;

// config for sign message on blockchain
export const DATA_DOMAIN_NAME = process.env.DATA_DOMAIN_NAME as string;
export const DATA_DOMAIN_VERSION = process.env.DATA_DOMAIN_VERSION as string;

export const CreateNewsEvent =
  'event CreateNews(uint256 indexed tokenId,address indexed ownerAddress,string slug,uint256 totalSupply,uint8 paymentToken)';
export const ClaimTokenEvent = 'event ClaimToken(uint256 indexed tokenId,address readerAddress,uint256 tokenValue,string transactionId)';

export const Event = {
  CreateNewsEvent: CreateNewsEvent,
  ClaimTokenEvent: ClaimTokenEvent,
};
