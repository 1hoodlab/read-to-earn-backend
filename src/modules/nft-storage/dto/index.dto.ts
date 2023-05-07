import { ApiProperty } from '@nestjs/swagger';

// you can add validate using class-validator
export class SingleFileDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  markdown_file: string;
}

export class SingleFileImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: string;
}

export class GetContentDto {
  @ApiProperty({ type: 'string' })
  cid: string;
}
