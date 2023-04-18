import { Request } from 'express';
import { extname } from 'path';

export const editFileName = (
  req: Request,
  file: Express.Multer.File,
  callback
) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(4)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${name}-${randomName}${fileExtName}`);
};

export const markdownFilter = (
  req: Request,
  file: Express.Multer.File,
  callback
) => {
  if (!file.originalname.match(/\.(md|mdx)$/)) {
    return callback(new Error('Only markdown files are allowed!'), false);
  }
  callback(null, true);
};