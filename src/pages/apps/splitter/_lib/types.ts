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
    | {type: 'TOGGLE_TRANSFER_PAID'; key: string};

// Bounds on what a session may contain: the lists render every row, and a
// crafted share link must not be able to freeze the tab. Enforced when
// decoding and when the app creates rows, so a session the app builds is
// always one it can read back.
export const MAX_PEOPLE = 200;
export const MAX_EXPENSES = 2000;

export const emptyState = (): AppState => ({
    v: 2,
    currency: 'EUR',
    people: [],
    expenses: [],
    paidTransferKeys: [],
});

export const newId = (): string =>
    Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4);

// Transfer keys join the ids with `|`, and the wire codecs read an empty id as
// "missing", so a person id must be a non-empty string free of the delimiter.
export const isWireSafePersonId = (id: string): boolean =>
    typeof id === 'string' && id.length > 0 && !id.includes('|');

// Ids can be any wire-safe string, including `__proto__`. A plain `{}` would
// then drop an assignment and read back `Object.prototype`, so id-keyed maps
// are created without a prototype.
export const idRecord = <T>(): Record<string, T> => Object.create(null);

export const transferKey = (from: string, to: string, cents: number): string =>
    `${from}|${to}|${cents}`;

export const equalSplit = (): Split => ({mode: 'equal'});
