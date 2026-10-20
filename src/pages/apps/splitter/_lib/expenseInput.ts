// Shared draft -> expense pipeline for the add form and the inline editor:
// parse the amount, check the payer, build the split, validate it. Both forms
// call `buildExpenseInput` so error precedence and copy cannot diverge.

import type {Currency, ExpenseInput, Split} from './types';
import {equalSplit} from './types';
import {amountExample, toCents} from './money';
import {validateSplit} from './split';

export type SplitDraft = {
    participants: string[];
    splitMode: Split['mode'];
    weights: Record<string, string>;
    percents: Record<string, string>;
    amounts: Record<string, string>;
};

export const buildSplit = (draft: SplitDraft): {split: Split; error: string | null} => {
    if (draft.participants.length === 0) {
        return {split: equalSplit(), error: 'Pick at least one participant.'};
    }
    if (draft.splitMode === 'equal') return {split: equalSplit(), error: null};

    if (draft.splitMode === 'shares') {
        const weights: Record<string, number> = {};
        for (const id of draft.participants) {
            const w = Number(draft.weights[id]);
            if (!Number.isFinite(w) || w <= 0) {
                return {split: equalSplit(), error: 'Every participant needs a positive share weight.'};
            }
            weights[id] = w;
        }
        return {split: {mode: 'shares', weights}, error: null};
    }

    if (draft.splitMode === 'percent') {
        const percents: Record<string, number> = {};
        for (const id of draft.participants) {
            const raw = draft.percents[id];
            // Empty is not 0: Number('') would allocate a silent zero share.
            if (raw === undefined || String(raw).trim() === '') {
                return {split: equalSplit(), error: 'Every participant needs a percent.'};
            }
            const p = Number(String(raw).replace(',', '.'));
            if (!Number.isFinite(p) || p < 0) {
                return {split: equalSplit(), error: 'Every participant needs a non-negative percent.'};
            }
            percents[id] = p;
        }
        return {split: {mode: 'percent', percents}, error: null};
    }

    const amounts: Record<string, number> = {};
    for (const id of draft.participants) {
        const cents = toCents(draft.amounts[id] ?? '');
        if (cents === null || cents < 0) {
            return {split: equalSplit(), error: 'Every participant needs a valid exact amount.'};
        }
        amounts[id] = cents;
    }
    return {split: {mode: 'exact', amounts}, error: null};
};

/**
 * Parse, build, and validate one expense from form state. Error precedence:
 * amount format -> non-positive amount -> missing payer -> split build ->
 * split validation. Returns the input to submit, or the first error.
 */
export const buildExpenseInput = (
    draft: SplitDraft,
    description: string,
    amount: string,
    paidBy: string,
    currency: Currency,
): {input: ExpenseInput | null; error: string | null} => {
    const cents = toCents(amount);
    if (cents === null) {
        return {
            input: null,
            error: `Enter an amount like ${amountExample(currency)} (at most two decimals, no thousands separators).`,
        };
    }
    if (cents <= 0) {
        return {input: null, error: 'Amount must be greater than 0.'};
    }
    if (!paidBy) {
        return {input: null, error: 'Choose who paid.'};
    }
    const {split, error} = buildSplit(draft);
    if (error) {
        return {input: null, error};
    }
    const splitError = validateSplit(split, draft.participants, cents);
    if (splitError) {
        return {input: null, error: splitError};
    }
    return {
        input: {
            description: description.trim(),
            cents,
            paidBy,
            participants: draft.participants,
            split,
        },
        error: null,
    };
};
