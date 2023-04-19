import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

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
