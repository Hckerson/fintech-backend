import { Period } from '@common/enums/period';
import { flowsByKey } from './cash-flow';

const KEYS = ['2026-08', '2026-09'];
const at = (iso: string) => new Date(iso);

describe('flowsByKey', () => {
    it('splits money in from money out per period', () => {
        const flows = flowsByKey(Period.MONTH, KEYS, [
            { amountMinor: 50_000n, postedAt: at('2026-09-02T10:00:00Z') },
            { amountMinor: -20_000n, postedAt: at('2026-09-15T10:00:00Z') },
            { amountMinor: -5_000n, postedAt: at('2026-08-31T23:59:59Z') },
        ]);

        expect(flows.get('2026-09')).toEqual({
            inflow: 50_000n,
            outflow: 20_000n,
        });
        expect(flows.get('2026-08')).toEqual({ inflow: 0n, outflow: 5_000n });
    });

    it('keeps an empty period at zero', () => {
        expect(flowsByKey(Period.MONTH, KEYS, []).get('2026-08')).toEqual({
            inflow: 0n,
            outflow: 0n,
        });
    });

    it('ignores unposted and out-of-range movements', () => {
        const flows = flowsByKey(Period.MONTH, KEYS, [
            { amountMinor: 900n, postedAt: null },
            { amountMinor: 900n, postedAt: at('2026-07-31T12:00:00Z') },
        ]);

        expect([...flows.values()]).toEqual([
            { inflow: 0n, outflow: 0n },
            { inflow: 0n, outflow: 0n },
        ]);
    });

    it('keeps amounts beyond the safe integer range exact', () => {
        const huge = 9_007_199_254_740_993n;
        const flows = flowsByKey(Period.MONTH, KEYS, [
            { amountMinor: huge, postedAt: at('2026-09-01T00:00:00Z') },
        ]);

        expect(flows.get('2026-09')?.inflow).toBe(huge);
    });
});
