// Greedy minimum-transactions settlement over per-expense allocations.
// Note: the optimal minimum-transactions problem is NP-hard. Greedy matching
// of largest debtor with largest creditor produces at most N-1 transactions
// and is near-optimal in practice - the standard trade-off for this kind of
// "splitwise"-style UX.

import type {AppState, Expense} from './types';
import {allocateExpense} from './split';

export type Transfer = {from: string; to: string; cents: number};

/** @deprecated Prefer allocateEqual from ./split - kept as a thin alias for tests/callers. */
export {allocateEqual as fairShares} from './split';

export type ExpenseBreakdown = {
    expense: Expense;
    shares: Map<string, number>;
};

/**
 * Per-expense obligation maps. Each `shares` map sums to that expense's cents
 * when allocation succeeds; failed allocations are omitted.
 */
export const expenseBreakdowns = (state: AppState): ExpenseBreakdown[] => {
    const known = new Set(state.people.map(p => p.id));
    const out: ExpenseBreakdown[] = [];
    for (const expense of state.expenses) {
        if (!known.has(expense.paidBy)) continue;
        const participants = expense.participants.filter(id => known.has(id));
        if (participants.length === 0) continue;
        const normalized: Expense = {...expense, participants};
        const shares = allocateExpense(normalized);
        if (shares.size === 0) continue;
        out.push({expense: normalized, shares});
    }
    return out;
};

// Returns a Map<personId, netCents> where positive = is owed, negative = owes.
// Balances sum to 0 when every expense allocates cleanly.
export const computeBalances = (state: AppState): Map<string, number> => {
    const balances = new Map<string, number>();
    for (const p of state.people) balances.set(p.id, 0);

    for (const {expense, shares} of expenseBreakdowns(state)) {
        balances.set(expense.paidBy, (balances.get(expense.paidBy) ?? 0) + expense.cents);
        for (const [id, share] of shares) {
            balances.set(id, (balances.get(id) ?? 0) - share);
        }
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
    breakdowns: ExpenseBreakdown[];
};

export const summarize = (state: AppState): Summary => {
    const breakdowns = expenseBreakdowns(state);
    const totalCents = breakdowns.reduce((acc, b) => acc + b.expense.cents, 0);
    const balances = computeBalances(state);
    const transfers = computeSettlement(balances);
    const N = state.people.length;
    // Display-only average. Exact obligations live in `balances` / breakdowns.
    const perPersonCents = N > 0 ? Math.round(totalCents / N) : 0;
    return {totalCents, perPersonCents, balances, transfers, breakdowns};
};
