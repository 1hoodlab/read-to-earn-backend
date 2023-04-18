import { ApiProperty } from '@nestjs/swagger';

// you can add validate using class-validator
export class SingleFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  blog: string;
}
