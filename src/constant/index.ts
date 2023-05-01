export const WORDS_PER_MIN = 275;
export const IMAGE_READ_TIME = 12;
export const CHINESE_KOREAN_READ_TIME = 500;

// config for sign message on blockchain
export const DATA_DOMAIN_NAME = 'SNews';
export const DATA_DOMAIN_VERSION = '1.0';

export const CreateNewsEvent =
  'event CreateNews(uint256 indexed tokenId,address indexed ownerAddress,string slug,uint256 totalSupply,uint8 paymentToken)';
export const ClaimTokenEvent = 'event ClaimToken(uint256 indexed tokenId,address readerAddress,uint256 tokenValue,string transactionId)';

export const Event = {
  CreateNewsEvent: CreateNewsEvent,
  ClaimTokenEvent: ClaimTokenEvent,
};
