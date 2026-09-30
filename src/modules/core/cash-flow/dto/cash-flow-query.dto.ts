import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO4217CurrencyCode, IsOptional } from 'class-validator';
import { CashFlowRange } from '@common/enums/cash-flow';

export class CashFlowQueryDto {
    @ApiProperty({ enum: CashFlowRange })
    @IsEnum(CashFlowRange)
    range: CashFlowRange;

    @ApiProperty({
        required: false,
        example: 'GBP',
        description: "Defaults to the currency of the member's oldest account.",
    })
    @IsOptional()
    @IsISO4217CurrencyCode()
    currency?: string;
}
