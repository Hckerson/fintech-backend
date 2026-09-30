import { Period } from './period';

export enum CashFlowRange {
    DAYS_30 = '30d',
    DAYS_90 = '90d',
    MONTHS_12 = '12m',
}

export const CASH_FLOW_WINDOW: Record<
    CashFlowRange,
    { period: Period; length: number }
> = {
    [CashFlowRange.DAYS_30]: { period: Period.DAY, length: 30 },
    [CashFlowRange.DAYS_90]: { period: Period.DAY, length: 90 },
    [CashFlowRange.MONTHS_12]: { period: Period.MONTH, length: 12 },
};

export const DEFAULT_CURRENCY = 'GBP';
