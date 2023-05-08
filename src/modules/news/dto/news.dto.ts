import { ApiProperty } from '@nestjs/swagger';
import { ClaimStatus } from '@prisma/client';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateNewsInputDto {
  @ApiProperty({ default: 'title' })
  @IsString()
  title: string;

  @ApiProperty({ default: 'thumbnail' })
  @IsString()
  thumbnail: string;

  @ApiProperty({ default: 'content_url' })
  @IsString()
  content_url: string;

  @ApiProperty({ default: 'cid' })
  @IsString()
  cid: string;

  @ApiProperty({ default: 'txhash' })
  @IsString()
  txhash: string;

  @ApiProperty({ default: 'slug' })
  @IsString()
  slug: string;

  @ApiProperty({ default: 'short_description' })
  @IsString()
  short_description: string;

  @ApiProperty({ default: 'short_content' })
  @IsString()
  short_content: string;


  @ApiProperty({ default: 1 })
  @IsNumber()
  payment_token: number;
}

export class GetNewsAll {
  @ApiProperty({ default: 1 })
  @IsOptional()
  page: number;

  @ApiProperty({ default: 10 })
  @IsOptional()
  perPage: number;

  @ApiProperty({ default: '', required: false })
  @IsOptional()
  keyword: string;
}

export class ClaimTokenDto {
  @ApiProperty()
  @IsNumber()
  news_id: number;
}

export class CreateUserClaimNewsDto {
  @ApiProperty()
  @IsString()
  slug: string;
}

export class UpdateStatusUserClaimNewsDto {
  @ApiProperty()
  @IsString()
  slug: string;

  @ApiProperty()
  @IsString()
  user_id: string;

  @ApiProperty({ enum: ClaimStatus })
  @IsString()
  status: ClaimStatus;
}

export type ClaimTokenResponseDto = {
  transaction_id: string;
  v: number;
  r: string;
  s: string;
  slug: string;
};
