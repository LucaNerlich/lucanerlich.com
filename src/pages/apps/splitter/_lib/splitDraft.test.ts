import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {draftFromExpense, draftFromPeople} from './splitDraft';
import type {Person} from './types';

const people: Person[] = [
    {id: 'a', name: 'Alice'},
    {id: 'b', name: 'Bob'},
];

describe('draftFromPeople', () => {
    it('seeds every person when the first draft is built before hydration', () => {
        // The add form builds its first draft while `people` is still empty.
        assert.deepEqual(draftFromPeople([]).participants, []);
        assert.deepEqual(draftFromPeople(people, draftFromPeople([])).participants, ['a', 'b']);
    });

    it('re-seeds everyone after a people change, even when the list was emptied', () => {
        // No touched flag: a cleared list re-checks everyone on the next people
        // change. Safer than submitting an empty split.
        const emptied = {...draftFromPeople(people), participants: []};
        assert.deepEqual(draftFromPeople(people, emptied).participants, ['a', 'b']);
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
