const EUR = new Intl.NumberFormat(undefined, {style: 'currency', currency: 'EUR'});

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
    const match = value.trim().match(/^(\d+)(?:[.,](\d{0,2}))?$/);
    if (!match) return null;
    const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
    return Number.isSafeInteger(cents) ? cents : null;
};

export const fromCents = (cents: number): number => cents / 100;

export const formatMoney = (cents: number): string => EUR.format(fromCents(cents));
