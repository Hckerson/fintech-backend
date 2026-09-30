import { ApiProperty } from '@nestjs/swagger';

export class MoneyDto {
    @ApiProperty({
        example: '-125000',
        description: 'Signed integer in minor units.',
    })
    amountMinor: string;

    @ApiProperty({ example: 'GBP', description: 'ISO 4217 code.' })
    currency: string;
}
