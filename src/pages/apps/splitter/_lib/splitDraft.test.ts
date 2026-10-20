import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {draftFromExpense, draftFromPeople} from './splitDraft';
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
