import type {Currency} from './types';

export const toCents = (value: string | number): number | null => {
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
};

export const fromCents = (cents: number): number => cents / 100;

export const formatMoney = (cents: number, currency: Currency): string => {
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
    }).format(fromCents(cents));
};
