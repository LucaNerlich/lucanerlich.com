import type {Currency} from './types';

// All user-facing money output goes through Intl, using the visitor's locale
// (`undefined`), so symbols, separators and sign placement match their system.
const CURRENCY: Currency = 'EUR';
const MONEY = new Intl.NumberFormat(undefined, {style: 'currency', currency: CURRENCY});
const SIGNED_MONEY = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: CURRENCY,
    signDisplay: 'exceptZero',
});
const PLAIN_AMOUNT = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: MONEY.resolvedOptions().minimumFractionDigits,
    maximumFractionDigits: MONEY.resolvedOptions().maximumFractionDigits,
});

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

export const formatMoney = (cents: number): string => MONEY.format(fromCents(cents));

/** Balance-style output: "+€5.00" / "-€5.00" / "€0.00", sign placed by the locale. */
export const formatSignedMoney = (cents: number): string => SIGNED_MONEY.format(fromCents(cents));

/** Locale currency symbol, e.g. "€", for field labels. */
export const currencySymbol: string =
    MONEY.formatToParts(0).find(part => part.type === 'currency')?.value ?? CURRENCY;

/** Locale-formatted zero amount ("0.00" / "0,00") for input placeholders. */
export const amountPlaceholder: string = PLAIN_AMOUNT.format(0);

/** Locale-formatted sample amount ("12.50" / "12,50") for validation hints. */
export const amountExample: string = PLAIN_AMOUNT.format(12.5);
