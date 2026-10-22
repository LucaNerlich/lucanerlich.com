import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {draftAfterAdd, draftFromExpense, draftFromPeople, toggleParticipant} from './splitDraft';
import type {Person} from './types';

const people: Person[] = [
    {id: 'a', name: 'Alice'},
    {id: 'b', name: 'Bob'},
];

describe('draftFromPeople', () => {
    it('seeds every person while the draft is untouched', () => {
        // Every people change before the user edits the split passes no
        // previous draft, so people added one at a time all get checked.
        assert.deepEqual(draftFromPeople([]).participants, []);
        assert.deepEqual(draftFromPeople([people[0]]).participants, ['a']);
        assert.deepEqual(draftFromPeople(people).participants, ['a', 'b']);
    });

    it('keeps a deliberately emptied list once the draft is touched', () => {
        const emptied = {...draftFromPeople(people), participants: []};
        assert.deepEqual(draftFromPeople(people, emptied).participants, []);
    });

    it('drops people who no longer exist', () => {
        const draft = draftFromPeople(people);
        assert.deepEqual(
            draftFromPeople([people[0]], draft).participants,
            ['a'],
        );
    });

    it('prefills percents only when none were set', () => {
        const percent = {...draftFromPeople(people), splitMode: 'percent' as const};
        const filled = draftFromPeople(people, percent);
        assert.deepEqual(filled.percents, {a: '50.00', b: '50.00'});
        const kept = draftFromPeople(people, {...filled, percents: {a: '70', b: '30'}});
        assert.deepEqual(kept.percents, {a: '70', b: '30'});
    });
});

describe('toggleParticipant', () => {
    const three = [...people, {id: 'c', name: 'Cleo'}];
    const shares = {...draftFromPeople(people), splitMode: 'shares' as const};

    it('seeds the value the shares field displays for a new participant', () => {
        const next = toggleParticipant(three, shares, 'c');
        assert.deepEqual(next.participants, ['a', 'b', 'c']);
        assert.equal(next.weights.c, '1');
    });

    it('keeps the existing values and drops the unchecked participant', () => {
        const edited = {...shares, weights: {a: '2', b: '3'}};
        assert.deepEqual(toggleParticipant(three, edited, 'b').weights, {a: '2'});
    });
});

describe('draftAfterAdd', () => {
    it('drops exact amounts and falls back to the equal mode', () => {
        const exact = {
            ...draftFromPeople(people),
            splitMode: 'exact' as const,
            amounts: {a: '15.00', b: '15.00'},
        };
        const next = draftAfterAdd(exact);
        assert.deepEqual(next.amounts, {});
        assert.equal(next.splitMode, 'equal');
    });

    it('clears stale exact amounts even when the mode was switched back', () => {
        const equalWithAmounts = {
            ...draftFromPeople(people),
            amounts: {a: '15.00', b: '15.00'},
        };
        assert.deepEqual(draftAfterAdd(equalWithAmounts).amounts, {});
        assert.equal(draftAfterAdd(equalWithAmounts).splitMode, 'equal');
    });

    it('keeps the reusable weight modes as they are', () => {
        for (const mode of ['equal', 'shares', 'percent'] as const) {
            const draft = {...draftFromPeople(people), splitMode: mode};
            const next = draftAfterAdd(draft);
            assert.equal(next.splitMode, mode);
            assert.deepEqual(next.participants, draft.participants);
            assert.deepEqual(next.weights, draft.weights);
            assert.deepEqual(next.percents, draft.percents);
            assert.deepEqual(next.amounts, {});
        }
    });
});

describe('draftFromExpense', () => {
    it('copies the expense participants and split values', () => {
        const draft = draftFromExpense(people, {
            participants: ['b'],
            split: {mode: 'exact', amounts: {b: 500}},
            cents: 500,
        });
        assert.deepEqual(draft.participants, ['b']);
        assert.equal(draft.splitMode, 'exact');
        assert.equal(draft.amounts.b, '5.00');
    });
});
