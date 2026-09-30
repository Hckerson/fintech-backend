import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@common/dto';
import { Period } from '@common/enums/period';
import { CashFlowRange } from '@common/enums/cash-flow';

export class CashFlowTotalsDto {
    @ApiProperty({ type: MoneyDto })
    inflow: MoneyDto;

    @ApiProperty({ type: MoneyDto })
    outflow: MoneyDto;

    @ApiProperty({ type: MoneyDto })
    net: MoneyDto;
}

export class CashFlowPointDto extends CashFlowTotalsDto {
    @ApiProperty({ format: 'date-time' })
    periodStart: string;
}

export class CashFlowSeriesResponseDto {
    @ApiProperty({ enum: CashFlowRange })
    range: CashFlowRange;

    @ApiProperty({ enum: Period })
    granularity: Period;

    @ApiProperty({ example: 'GBP' })
    currency: string;

    @ApiProperty({ type: [CashFlowPointDto] })
    points: CashFlowPointDto[];

    @ApiProperty({ type: CashFlowTotalsDto })
    totals: CashFlowTotalsDto;
}
