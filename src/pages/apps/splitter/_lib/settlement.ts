// Greedy minimum-transactions settlement.
// Note: the optimal minimum-transactions problem is NP-hard. Greedy matching
// of largest debtor with largest creditor produces at most N-1 transactions
// and is near-optimal in practice - the standard trade-off for this kind of
// "splitwise"-style UX.

import type {AppState} from './types';

export type Transfer = {from: string; to: string; cents: number};

// The single definition of how a bill is split: each person's fair share of
// `totalCents`, in integer cents. The remainder cent from an uneven split is
// distributed deterministically to the first `total mod N` people in id-sorted
// order, so the shares sum to exactly `totalCents`. Everything that needs a
// per-person obligation derives from here rather than re-deriving the math.
export const fairShares = (totalCents: number, sortedIds: string[]): Map<string, number> => {
    const shares = new Map<string, number>();
    const N = sortedIds.length;
    if (N === 0) return shares;

    const baseShare = Math.floor(totalCents / N);
    const remainder = totalCents - baseShare * N;
    sortedIds.forEach((id, i) => shares.set(id, baseShare + (i < remainder ? 1 : 0)));
    return shares;
};

// Returns a Map<personId, netCents> where positive = is owed, negative = owes.
// All amounts are integer cents; balances sum to exactly 0 because every
// person's obligation comes from the same `fairShares` distribution.
export const computeBalances = (state: AppState): Map<string, number> => {
    const balances = new Map<string, number>();
    for (const p of state.people) balances.set(p.id, 0);

    if (state.people.length === 0) return balances;

    const collator = new Intl.Collator('en', {sensitivity: 'variant'});
    const sortedIds = [...state.people.map(p => p.id)].sort(collator.compare);

    let total = 0;
    for (const e of state.expenses) {
        if (balances.has(e.paidBy)) {
            balances.set(e.paidBy, (balances.get(e.paidBy) ?? 0) + e.cents);
            total += e.cents;
        }
    }

    for (const [id, share] of fairShares(total, sortedIds)) {
        balances.set(id, (balances.get(id) ?? 0) - share);
    }

    return balances;
};

export const computeSettlement = (balances: Map<string, number>): Transfer[] => {
    const creditors: {id: string; cents: number}[] = [];
    const debtors: {id: string; cents: number}[] = [];

    for (const [id, cents] of balances) {
        if (cents > 0) creditors.push({id, cents});
        else if (cents < 0) debtors.push({id, cents: -cents});
    }

    creditors.sort((a, b) => b.cents - a.cents);
    debtors.sort((a, b) => b.cents - a.cents);

    const transfers: Transfer[] = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
        const d = debtors[i];
        const c = creditors[j];
        const amount = Math.min(d.cents, c.cents);
        if (amount > 0) {
            transfers.push({from: d.id, to: c.id, cents: amount});
        }
        d.cents -= amount;
        c.cents -= amount;
        if (d.cents === 0) i++;
        if (c.cents === 0) j++;
    }

    return transfers;
};

export type Summary = {
    totalCents: number;
    perPersonCents: number;
    balances: Map<string, number>;
    transfers: Transfer[];
};

// Single source of truth for everything the results view shows. Computing the
// total, balances, per-person share and transfers in one place keeps the money
// math in integer cents and stops callers re-deriving the total themselves.
export const summarize = (state: AppState): Summary => {
    const totalCents = state.expenses.reduce((acc, e) => acc + e.cents, 0);
    const balances = computeBalances(state);
    const transfers = computeSettlement(balances);
    const N = state.people.length;
    // Display-only average for the "Per person" line. The exact obligations live
    // in `balances` (via `fairShares`); when the bill does not divide evenly the
    // individual shares differ by a cent, so this rounded average is a headline
    // figure, not a per-person amount anyone actually owes.
    const perPersonCents = N > 0 ? Math.round(totalCents / N) : 0;
    return {totalCents, perPersonCents, balances, transfers};
};
