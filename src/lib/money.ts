export const toMoney = (amountMinor: bigint, currency: string) => ({
    amountMinor: amountMinor.toString(),
    currency,
});
