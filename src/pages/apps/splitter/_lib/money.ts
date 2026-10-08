import type {Currency} from './types';

type Formatters = {
    money: Intl.NumberFormat;
    signed: Intl.NumberFormat;
    plain: Intl.NumberFormat;
    symbol: string;
    placeholder: string;
    example: string;
};

const cache = new Map<Currency, Formatters>();

const buildFormatters = (currency: Currency): Formatters => {
    const money = new Intl.NumberFormat(undefined, {style: 'currency', currency});
    const signed = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        signDisplay: 'exceptZero',
    });
    const plain = new Intl.NumberFormat(undefined, {
        minimumFractionDigits: money.resolvedOptions().minimumFractionDigits,
        maximumFractionDigits: money.resolvedOptions().maximumFractionDigits,
    });
    return {
        money,
        signed,
        plain,
        symbol: money.formatToParts(0).find(part => part.type === 'currency')?.value ?? currency,
        placeholder: plain.format(0),
        example: plain.format(12.5),
    };
};

export const formattersFor = (currency: Currency): Formatters => {
    let cached = cache.get(currency);
    if (!cached) {
        cached = buildFormatters(currency);
        cache.set(currency, cached);
    }
    return cached;
};

export const toCents = (value: string | number): number | null => {
    if (typeof value === 'number') {
        if (!Number.isFinite(value)) return null;
        const cents = Math.round(value * 100);
        return Number.isSafeInteger(cents) ? cents : null;
    }
    // Parse the decimal string directly so locale decimals ('1,5') and float
    // rounding errors cannot silently produce wrong amounts. Only digits with
    // an optional '.' or ',' separator and at most two fraction digits are
    // accepted; everything else (scientific notation, thousands separators)
    // is rejected as invalid.
    const match = value.trim().match(/^(?=[.,]?\d)(\d*)(?:[.,](\d{0,2}))?$/);
    if (!match) return null;
    const cents = Number(match[1] || '0') * 100 + Number((match[2] ?? '').padEnd(2, '0'));
    return Number.isSafeInteger(cents) ? cents : null;
};

export const fromCents = (cents: number): number => cents / 100;

export const formatMoney = (cents: number, currency: Currency = 'EUR'): string =>
    formattersFor(currency).money.format(fromCents(cents));

/** Balance-style output with locale sign placement. */
export const formatSignedMoney = (cents: number, currency: Currency = 'EUR'): string =>
    formattersFor(currency).signed.format(fromCents(cents));

export const currencySymbol = (currency: Currency = 'EUR'): string =>
    formattersFor(currency).symbol;

export const amountPlaceholder = (currency: Currency = 'EUR'): string =>
    formattersFor(currency).placeholder;

export const amountExample = (currency: Currency = 'EUR'): string =>
    formattersFor(currency).example;

/** Plain decimal string for inputs, always with a dot (form-safe). */
export const centsToInput = (cents: number): string => (cents / 100).toFixed(2);
