const EUR = new Intl.NumberFormat(undefined, {style: 'currency', currency: 'EUR'});

export const toCents = (value: string | number): number | null => {
    const n = typeof value === 'number' ? value : parseFloat(value);
    if (!Number.isFinite(n)) return null;
    return Math.round(n * 100);
};

export const fromCents = (cents: number): number => cents / 100;

export const formatMoney = (cents: number): string => EUR.format(fromCents(cents));
