import { CHINESE_KOREAN_READ_TIME, WORDS_PER_MIN } from 'src/constant';

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
    } if (time >= 0.5 && time < 1.5) {
      return '1 minute';
    }
    return `${Math.ceil(time)} minutes`;
  }
