export type Currency =
    | 'EUR'
    | 'USD'
    | 'GBP'
    | 'CHF'
    | 'PLN'
    | 'CZK'
    | 'SEK'
    | 'NOK'
    | 'DKK';

export const CURRENCIES: readonly Currency[] = [
    'EUR',
    'USD',
    'GBP',
    'CHF',
    'PLN',
    'CZK',
    'SEK',
    'NOK',
    'DKK',
] as const;

export const isCurrency = (value: string): value is Currency =>
    (CURRENCIES as readonly string[]).includes(value);

export type Person = {
    id: string;
    name: string;
};

export type Split =
    | {mode: 'equal'}
    | {mode: 'shares'; weights: Record<string, number>}
    | {mode: 'percent'; percents: Record<string, number>}
    | {mode: 'exact'; amounts: Record<string, number>};

export type Expense = {
    id: string;
    description: string;
    cents: number;
    paidBy: string;
    /** Non-empty subset of people who share this expense. */
    participants: string[];
    split: Split;
};

export type AppState = {
    v: 2;
    currency: Currency;
    people: Person[];
    expenses: Expense[];
    /** Keys of transfers marked paid: `${from}|${to}|${cents}`. */
    paidTransferKeys: string[];
};

export type ExpenseInput = {
    description: string;
    cents: number;
    paidBy: string;
    participants: string[];
    split: Split;
};

export type Action =
    | {type: 'HYDRATE'; state: AppState}
    | {type: 'ADD_PERSON'; name: string}
    | {type: 'REMOVE_PERSON'; id: string}
    | {type: 'RENAME_PERSON'; id: string; name: string}
    | {type: 'ADD_EXPENSE'; expense: ExpenseInput}
    | {type: 'UPDATE_EXPENSE'; id: string; expense: ExpenseInput}
    | {type: 'REMOVE_EXPENSE'; id: string}
    | {type: 'DUPLICATE_EXPENSE'; id: string}
    | {type: 'SET_CURRENCY'; currency: Currency}
    | {type: 'TOGGLE_TRANSFER_PAID'; key: string}
    | {type: 'CLEAR_PAID_TRANSFERS'};

export const emptyState = (): AppState => ({
    v: 2,
    currency: 'EUR',
    people: [],
    expenses: [],
    paidTransferKeys: [],
});

export const newId = (): string =>
    Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4);

export const transferKey = (from: string, to: string, cents: number): string =>
    `${from}|${to}|${cents}`;

export const equalSplit = (): Split => ({mode: 'equal'});
