import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
export interface JwtDto {
  userId: string;
  /**
   * Issued at
   */
  iat: number;
  /**
   * Expiration time
   */
  exp: number;

  role: string;
}
export class SignInWithMetamakasDto {
  @ApiProperty()
  @IsString()
  wallet_address: string;

  @ApiProperty()
  @IsString()
  msg_signature: string;
}

export class SignInDto {
  @ApiProperty()
  @IsString()
  username: string; // can using email

  @ApiProperty()
  @IsString()
  password: string;
}

export class SignUpDto {
  @ApiProperty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class GoogleTokenDto {
  @ApiProperty()
  @IsString()
  token: string;
}
