import { Period } from '@common/enums/period';
import { periodKey } from './period';

export interface Flow {
    inflow: bigint;
    outflow: bigint;
}

export interface Movement {
    amountMinor: bigint;
    postedAt: Date | null;
}

export const flowsByKey = (
    period: Period,
    keys: string[],
    movements: Movement[],
): Map<string, Flow> => {
    const flows = new Map(
        keys.map((key) => [key, { inflow: 0n, outflow: 0n }]),
    );
    for (const { amountMinor, postedAt } of movements) {
        const flow = postedAt && flows.get(periodKey(period, postedAt));
        if (!flow) continue;
        if (amountMinor > 0n) flow.inflow += amountMinor;
        else flow.outflow -= amountMinor;
    }
    return flows;
};
