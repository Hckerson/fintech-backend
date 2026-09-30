import { ApiProperty } from '@nestjs/swagger';
import { MoneyDto } from '@common/dto';
import { AccountKind, AccountState } from 'generated/prisma/enums';

export class AccountResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty({ enum: AccountKind })
    kind: AccountKind;

    @ApiProperty({ example: '4821' })
    last4: string;

    @ApiProperty({ example: 'GBP' })
    currency: string;

    @ApiProperty({ type: MoneyDto })
    available: MoneyDto;

    @ApiProperty({ type: MoneyDto })
    current: MoneyDto;

    @ApiProperty({ enum: AccountState })
    state: AccountState;

    @ApiProperty({ format: 'date-time' })
    openedAt: string;
}

export const accountSelect = {
    id: true,
    name: true,
    kind: true,
    last4: true,
    currency: true,
    state: true,
    availableMinor: true,
    currentMinor: true,
    openedAt: true,
} as const;
