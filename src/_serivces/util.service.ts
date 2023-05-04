import { CHINESE_KOREAN_READ_TIME, WORDS_PER_MIN } from 'src/constant';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
export function totalWordCount(str: string): number {
  return (str.match(/\w+/g) || []).length;
}
export function otherLanguageReadTime(string) {
  const pattern = '[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]';
  const reg = new RegExp(pattern, 'g');
  const count = (string.match(reg) || []).length;
  const time = count / CHINESE_KOREAN_READ_TIME;
  const formattedString = string.replace(reg, '');
  return {
    count,
    time,
    formattedString,
  };
}

export function wordsReadTime(string, wordsPerMin = WORDS_PER_MIN) {
  const { count: characterCount, time: otherLanguageTime, formattedString } = otherLanguageReadTime(string);
  const wordCount = totalWordCount(formattedString);
  const wordTime = wordCount / wordsPerMin;
  return {
    characterCount,
    otherLanguageTime,
    wordTime,
    wordCount,
  };
}

export function humanizeTime(time) {
  if (time < 0.5) {
    return 'less than a minute';
  }
  if (time >= 0.5 && time < 1.5) {
    return '1 minute';
  }
  return `${Math.ceil(time)} minutes`;
}

export function generateRandom() {
  return nanoid(10);
}

export function generateSignInMessage(wallet_address: string, nonce: string) {
  return `Welcome to Snews!\n\nClick to sign in and accept the Snews Terms of Service and Privacy Policy.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nYour authentication status will reset after 24 hours.\n\nWallet address:\n${wallet_address}\n\nNonce:\n${nonce}`;
}
