import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateNewsInputDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  thumbnail: string;

  @ApiProperty()
  @IsString()
  content_url: string;

  @ApiProperty()
  @IsString()
  cid: string;

  @ApiProperty()
  @IsString()
  total_supply: string;

  @ApiProperty()
  token_id: number;

  @ApiProperty()
  slug: string;

  @ApiProperty()
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

export class ClaimToken {
  @ApiProperty()
  news_id: number;
}

export type ClaimTokenResponse = {
  transaction_id: string;
  v: number;
  r: string;
  s: string;
  slug: string;
};
