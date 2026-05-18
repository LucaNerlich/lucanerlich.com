export type Currency = 'EUR';

export type Person = {
    id: string;
    name: string;
};

export type Expense = {
    id: string;
    description: string;
    cents: number;
    paidBy: string;
};

export type AppState = {
    v: 1;
    currency: Currency;
    people: Person[];
    expenses: Expense[];
};

export type Action =
    | {type: 'HYDRATE'; state: AppState}
    | {type: 'ADD_PERSON'; name: string}
    | {type: 'REMOVE_PERSON'; id: string}
    | {type: 'ADD_EXPENSE'; description: string; cents: number; paidBy: string}
    | {type: 'REMOVE_EXPENSE'; id: string};

export const emptyState = (): AppState => ({
    v: 1,
    currency: 'EUR',
    people: [],
    expenses: [],
});

export const newId = (): string =>
    Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 4);
