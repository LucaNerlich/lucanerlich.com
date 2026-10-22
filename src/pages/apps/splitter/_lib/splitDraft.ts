// Draft helpers for the add form and the inline editor. Pure, so the seeding
// rules (which participants start checked) are testable without React.

import type {Person, Split} from './types';
import type {SplitDraft} from './expenseInput';
import {centsToInput} from './money';

export const draftFromPeople = (people: Person[], previous?: SplitDraft): SplitDraft => {
    const ids = people.map(p => p.id);
    const next: SplitDraft = {
        // No previous draft means "untouched": seed everyone. With a previous
        // draft the selection is the user's, including a deliberately empty one.
        participants: previous
            ? previous.participants.filter(id => ids.includes(id))
            : ids,
        splitMode: previous?.splitMode ?? 'equal',
        weights: {},
        percents: {},
        amounts: {},
    };
    for (const id of next.participants) {
        next.weights[id] = previous?.weights[id] ?? '1';
        next.percents[id] = previous?.percents[id] ?? '';
        next.amounts[id] = previous?.amounts[id] ?? '';
    }
    if (next.splitMode === 'percent') {
        const missing = next.participants.filter(id => !previous?.percents[id]);
        if (missing.length === next.participants.length && next.participants.length > 0) {
            const each = Math.floor(10000 / next.participants.length);
            next.participants.forEach((id, index) => {
                const share = index === next.participants.length - 1
                    ? 10000 - each * index
                    : each;
                next.percents[id] = (share / 100).toFixed(2);
            });
        }
    }
    return next;
};

// Checking a participant is a people change: seed their values through the
// same rules as a fresh draft, or the shares form shows a weight the draft
// does not have and refuses to submit.
export const toggleParticipant = (people: Person[], draft: SplitDraft, id: string): SplitDraft =>
    draftFromPeople(people, {
        ...draft,
        participants: draft.participants.includes(id)
            ? draft.participants.filter(x => x !== id)
            : [...draft.participants, id],
    });

export const draftAfterAdd = (draft: SplitDraft): SplitDraft => ({    // Exact amounts are absolute cents and only fit the total just added, so
    // they are never reusable; the weight modes carry over.
    ...draft,
    amounts: {},
    splitMode: draft.splitMode === 'exact' ? 'equal' : draft.splitMode,
});

export const draftFromExpense = (
    people: Person[],
    expense: {
        participants: string[];
        split: Split;
        cents: number;
    },
): SplitDraft => {
    const draft = draftFromPeople(people);
    draft.participants = expense.participants.filter(id => people.some(p => p.id === id));
    draft.splitMode = expense.split.mode;
    if (expense.split.mode === 'shares') {
        for (const id of draft.participants) {
            draft.weights[id] = String(expense.split.weights[id] ?? 1);
        }
    } else if (expense.split.mode === 'percent') {
        for (const id of draft.participants) {
            draft.percents[id] = String(expense.split.percents[id] ?? 0);
        }
    } else if (expense.split.mode === 'exact') {
        for (const id of draft.participants) {
            draft.amounts[id] = centsToInput(expense.split.amounts[id] ?? 0);
        }
    }
    return draft;
};
