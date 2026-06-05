// Greedy minimum-transactions settlement.
// Note: the optimal minimum-transactions problem is NP-hard. Greedy matching
// of largest debtor with largest creditor produces at most N-1 transactions
// and is near-optimal in practice - the standard trade-off for this kind of
// "splitwise"-style UX.

import type {AppState} from './types';

export type Transfer = {from: string; to: string; cents: number};

// Returns a Map<personId, netCents> where positive = is owed, negative = owes.
// All amounts are integer cents; balances sum to exactly 0 (the remainder
// cent of total/N is distributed deterministically to the first
// `total mod N` people in id-sorted order).
export const computeBalances = (state: AppState): Map<string, number> => {
    const balances = new Map<string, number>();
    for (const p of state.people) balances.set(p.id, 0);

    if (state.people.length === 0) return balances;

    const collator = new Intl.Collator('en', {sensitivity: 'variant'});
    const sortedIds = [...state.people.map(p => p.id)].sort(collator.compare);
    const N = state.people.length;

    let total = 0;
    for (const e of state.expenses) {
        if (balances.has(e.paidBy)) {
            balances.set(e.paidBy, (balances.get(e.paidBy) ?? 0) + e.cents);
            total += e.cents;
        }
    }

    const baseShare = Math.floor(total / N);
    const remainder = total - baseShare * N;
    for (let i = 0; i < N; i++) {
        const id = sortedIds[i];
        const share = baseShare + (i < remainder ? 1 : 0);
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
