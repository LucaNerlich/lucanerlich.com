// Integer-cent allocation for one expense across participants.
// Every public helper returns a Map whose values sum exactly to `totalCents`
// (or an empty map when allocation is impossible), so settlement never drifts.

import type {Expense, Split} from './types';

const collator = new Intl.Collator('en', {sensitivity: 'variant'});

export const sortIds = (ids: Iterable<string>): string[] =>
    [...ids].sort(collator.compare);

/**
 * Equal split: floor division with remainder cents given to the first
 * `total mod N` ids in sorted order.
 */
export const allocateEqual = (totalCents: number, ids: string[]): Map<string, number> => {
    const shares = new Map<string, number>();
    const sorted = sortIds(ids);
    const N = sorted.length;
    if (N === 0 || totalCents < 0 || !Number.isSafeInteger(totalCents)) return shares;

    const baseShare = Math.floor(totalCents / N);
    const remainder = totalCents - baseShare * N;
    sorted.forEach((id, i) => shares.set(id, baseShare + (i < remainder ? 1 : 0)));
    return shares;
};

/**
 * Largest-remainder (Hamilton) method for positive weights.
 * Invalid / non-positive weights are treated as missing.
 */
export const allocateByWeights = (
    totalCents: number,
    weights: Map<string, number>,
): Map<string, number> => {
    const shares = new Map<string, number>();
    if (totalCents < 0 || !Number.isSafeInteger(totalCents)) return shares;

    const entries = [...weights.entries()]
        .filter(([, w]) => Number.isFinite(w) && w > 0)
        .map(([id, w]) => [id, w] as const);
    if (entries.length === 0) return shares;

    const sorted = entries.sort((a, b) => collator.compare(a[0], b[0]));
    const totalWeight = sorted.reduce((acc, [, w]) => acc + w, 0);
    if (!(totalWeight > 0)) return shares;

    type Row = {id: string; base: number; frac: number};
    const rows: Row[] = sorted.map(([id, w]) => {
        const exact = (totalCents * w) / totalWeight;
        const base = Math.floor(exact);
        return {id, base, frac: exact - base};
    });
    let assigned = rows.reduce((acc, r) => acc + r.base, 0);
    let left = totalCents - assigned;

    // Highest fractional part first; ties broken by sorted id (already sorted).
    const order = [...rows].sort((a, b) => b.frac - a.frac || collator.compare(a.id, b.id));
    for (const row of order) {
        if (left <= 0) break;
        row.base += 1;
        left -= 1;
    }
    for (const row of rows) shares.set(row.id, row.base);
    return shares;
};

export const validateSplit = (
    split: Split,
    participants: string[],
    totalCents: number,
): string | null => {
    const set = new Set(participants);
    if (participants.length === 0) return 'Pick at least one participant.';
    if (new Set(participants).size !== participants.length) {
        return 'Participants must be unique.';
    }

    if (split.mode === 'equal') return null;

    if (split.mode === 'shares') {
        for (const id of participants) {
            const w = split.weights[id];
            if (!Number.isFinite(w) || w <= 0) {
                return 'Every participant needs a positive share weight.';
            }
        }
        for (const id of Object.keys(split.weights)) {
            if (!set.has(id)) return 'Share weights include someone outside the split.';
        }
        return null;
    }

    if (split.mode === 'percent') {
        let sum = 0;
        for (const id of participants) {
            const p = split.percents[id];
            if (!Number.isFinite(p) || p < 0) {
                return 'Every participant needs a non-negative percent.';
            }
            sum += p;
        }
        for (const id of Object.keys(split.percents)) {
            if (!set.has(id)) return 'Percents include someone outside the split.';
        }
        // Allow tiny float noise around 100.
        if (Math.abs(sum - 100) > 0.001) {
            return `Percents must sum to 100 (currently ${sum}).`;
        }
        return null;
    }

    // exact
    let sum = 0;
    for (const id of participants) {
        const a = split.amounts[id];
        if (!Number.isSafeInteger(a) || a < 0) {
            return 'Every participant needs an exact amount in cents.';
        }
        sum += a;
    }
    for (const id of Object.keys(split.amounts)) {
        if (!set.has(id)) return 'Exact amounts include someone outside the split.';
    }
    if (sum !== totalCents) {
        return `Exact amounts must sum to the expense (${totalCents} cents, got ${sum}).`;
    }
    return null;
};

/**
 * Allocate one expense across its participants according to its split mode.
 * Returns an empty map when the expense cannot be allocated.
 */
export const allocateExpense = (expense: Expense): Map<string, number> => {
    const ids = [...new Set(expense.participants)];
    if (ids.length === 0) return new Map();
    if (validateSplit(expense.split, ids, expense.cents)) return new Map();

    const {split, cents} = expense;
    if (split.mode === 'equal') return allocateEqual(cents, ids);

    if (split.mode === 'shares') {
        const weights = new Map<string, number>();
        for (const id of ids) weights.set(id, split.weights[id] ?? 0);
        return allocateByWeights(cents, weights);
    }

    if (split.mode === 'percent') {
        const weights = new Map<string, number>();
        for (const id of ids) weights.set(id, split.percents[id] ?? 0);
        return allocateByWeights(cents, weights);
    }

    const amounts = new Map<string, number>();
    for (const id of ids) amounts.set(id, split.amounts[id] ?? 0);
    return amounts;
};

/** True when the payer is not among the people who owe a share. */
export const payerCoversOthers = (expense: Expense): boolean =>
    !expense.participants.includes(expense.paidBy);
