import { Injectable } from '@nestjs/common';
import { toMoney } from '@lib/money';
import { periodSeries } from '@lib/period';
import { Flow, flowsByKey } from '@lib/cash-flow';
import { AccountRepo } from '@common/repos/account.repo';
import { TransactionRepo } from '@common/repos/transaction.repo';
import { TransactionStatus } from 'generated/prisma/enums';
import { CASH_FLOW_WINDOW, DEFAULT_CURRENCY } from '@common/enums/cash-flow';
import { CashFlowQueryDto, CashFlowSeriesResponseDto } from './dto';

@Injectable()
export class CashFlowService {
    constructor(
        private readonly accountRepo: AccountRepo,
        private readonly transactionRepo: TransactionRepo,
    ) {}

    async series(
        userId: string,
        { range, currency }: CashFlowQueryDto,
    ): Promise<CashFlowSeriesResponseDto> {
        const [oldest] = await this.accountRepo.findMany({
            where: { userId },
            orderBy: { openedAt: 'asc' },
            select: { currency: true },
            take: 1,
        });
        const code = currency ?? oldest?.currency ?? DEFAULT_CURRENCY;
        const { period, length } = CASH_FLOW_WINDOW[range];
        const { start, end, keys } = periodSeries(period, length, new Date());

        const movements = await this.transactionRepo.findMany({
            where: {
                account: { userId },
                currency: code,
                status: TransactionStatus.POSTED,
                postedAt: { gte: start, lt: end },
            },
            select: { amountMinor: true, postedAt: true },
        });
        const flows = flowsByKey(period, keys, movements);
        const money = ({ inflow, outflow }: Flow) => ({
            inflow: toMoney(inflow, code),
            outflow: toMoney(outflow, code),
            net: toMoney(inflow - outflow, code),
        });
        const total = [...flows.values()].reduce(
            (sum, flow) => ({
                inflow: sum.inflow + flow.inflow,
                outflow: sum.outflow + flow.outflow,
            }),
            { inflow: 0n, outflow: 0n },
        );

        return {
            range,
            granularity: period,
            currency: code,
            points: [...flows].map(([key, flow]) => ({
                periodStart: new Date(key).toISOString(),
                ...money(flow),
            })),
            totals: money(total),
        };
    }
}
