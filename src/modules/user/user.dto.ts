import { ApiProperty } from '@nestjs/swagger';

export class LinkAccountOnCHainDto {
    @ApiProperty()
    wallet_address: string;

    @ApiProperty()
    signature: string;
    
}
