import { Injectable } from '@nestjs/common';
import { toMoney } from '@lib/money';
import { AccountRepo } from '@common/repos/account.repo';
import { AccountResponseDto, accountSelect } from './dto';

@Injectable()
export class AccountsService {
    constructor(private readonly accountRepo: AccountRepo) {}

    async findAll(userId: string): Promise<AccountResponseDto[]> {
        const accounts = await this.accountRepo.findMany({
            where: { userId },
            orderBy: { openedAt: 'asc' },
            select: accountSelect,
        });

        return accounts.map(
            ({ availableMinor, currentMinor, openedAt, ...account }) => ({
                ...account,
                available: toMoney(availableMinor, account.currency),
                current: toMoney(currentMinor, account.currency),
                openedAt: openedAt.toISOString(),
            }),
        );
    }
}
