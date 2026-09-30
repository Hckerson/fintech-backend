import { faker } from '@faker-js/faker';
import {
    AccountKind,
    PrismaClient,
    TransactionStatus,
} from '../generated/prisma/client';

const CURRENCY = 'GBP';
const MONTHS_OF_HISTORY = 14;
const OPENING_BALANCE = 300_000;

interface Line {
    day: number;
    description: string;
    category: string;
    counterparty: () => string;
    amount: () => number;
}

const between = (min: number, max: number) => () =>
    faker.number.int({ min, max });
const fixed =
    <T>(value: T) =>
    () =>
        value;
const client = () => faker.company.name();

const MONTHLY: Line[] = [
    {
        day: 1,
        description: 'Office rent',
        category: 'Rent',
        counterparty: fixed('Hartley Estates'),
        amount: fixed(-4_200),
    },
    {
        day: 5,
        description: 'Client payment',
        category: 'Sales',
        counterparty: client,
        amount: between(9_000, 16_000),
    },
    {
        day: 8,
        description: 'Software subscriptions',
        category: 'Software',
        counterparty: fixed('Stackwise'),
        amount: fixed(-1_850),
    },
    {
        day: 12,
        description: 'Client payment',
        category: 'Sales',
        counterparty: client,
        amount: between(9_000, 16_000),
    },
    {
        day: 14,
        description: 'Contractor invoice',
        category: 'Contractors',
        counterparty: () => faker.person.fullName(),
        amount: () => -between(4_000, 8_000)(),
    },
    {
        day: 19,
        description: 'Client payment',
        category: 'Sales',
        counterparty: client,
        amount: between(9_000, 16_000),
    },
    {
        day: 25,
        description: 'Payroll',
        category: 'Payroll',
        counterparty: fixed('Payroll run'),
        amount: fixed(-38_000),
    },
];

const minor = (pounds: number) => BigInt(Math.round(pounds * 100));
const reference = () =>
    faker.string.alphanumeric({ length: 10, casing: 'upper' });

const monthlyTransactions = (accountId: string, now: Date) =>
    Array.from(
        { length: MONTHS_OF_HISTORY },
        (_, index) => MONTHS_OF_HISTORY - 1 - index,
    ).flatMap((monthsAgo) =>
        MONTHLY.map((line) => ({
            line,
            postedAt: new Date(
                Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth() - monthsAgo,
                    line.day,
                    10,
                ),
            ),
        }))
            .filter(({ postedAt }) => postedAt <= now)
            .map(({ line, postedAt }) => ({
                accountId,
                currency: CURRENCY,
                status: TransactionStatus.POSTED,
                amountMinor: minor(line.amount()),
                description: line.description,
                counterpartyName: line.counterparty(),
                category: line.category,
                reference: reference(),
                postedAt,
                createdAt: postedAt,
            })),
    );

const settle = async (prisma: PrismaClient, accountId: string) => {
    const rows = await prisma.transaction.findMany({
        where: { accountId },
        select: { amountMinor: true, status: true },
    });
    const posted = rows.filter(
        (row) => row.status === TransactionStatus.POSTED,
    );
    const holds = rows.filter(
        (row) =>
            row.status === TransactionStatus.PENDING && row.amountMinor < 0n,
    );
    const currentMinor = posted.reduce((sum, row) => sum + row.amountMinor, 0n);
    const availableMinor = holds.reduce(
        (sum, row) => sum + row.amountMinor,
        currentMinor,
    );
    await prisma.account.update({
        where: { id: accountId },
        data: { currentMinor, availableMinor },
    });
};

export async function seedLedger(prisma: PrismaClient, userId: string) {
    faker.seed(42);
    const now = new Date();
    const openedAt = new Date(
        Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth() - MONTHS_OF_HISTORY,
            20,
        ),
    );
    const account = (name: string, kind: AccountKind) =>
        prisma.account.create({
            data: {
                userId,
                name,
                kind,
                currency: CURRENCY,
                openedAt,
                last4: faker.string.numeric(4),
            },
        });

    const operating = await account('Operating', AccountKind.OPERATING);
    const reserve = await account('Tax reserve', AccountKind.RESERVE);

    await prisma.transaction.createMany({
        data: [
            {
                accountId: operating.id,
                currency: CURRENCY,
                status: TransactionStatus.POSTED,
                amountMinor: minor(OPENING_BALANCE),
                description: 'Opening deposit',
                counterpartyName: 'Seed round',
                category: 'Financing',
                reference: reference(),
                postedAt: openedAt,
                createdAt: openedAt,
            },
            ...monthlyTransactions(operating.id, now),
            ...[-640, -1_120].map((amount) => ({
                accountId: operating.id,
                currency: CURRENCY,
                status: TransactionStatus.PENDING,
                amountMinor: minor(amount),
                description: 'Card payment',
                counterpartyName: faker.company.name(),
                category: 'Travel',
                reference: reference(),
                createdAt: now,
            })),
            {
                accountId: reserve.id,
                currency: CURRENCY,
                status: TransactionStatus.POSTED,
                amountMinor: minor(28_500),
                description: 'Tax set-aside',
                counterpartyName: 'Operating',
                category: 'Tax',
                reference: reference(),
                postedAt: openedAt,
                createdAt: openedAt,
            },
        ],
    });

    await settle(prisma, operating.id);
    await settle(prisma, reserve.id);
}
