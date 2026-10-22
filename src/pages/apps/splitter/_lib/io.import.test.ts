import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {importJson} from './io';
import {encodeState, decodeState} from './urlState';
import {demoState} from './demo';

const fileWith = (state: object): string =>
    JSON.stringify({format: 'lucanerlich.splitter', version: 2, state});

describe('import validation', () => {
    it('rejects a file whose expenses repeat an id', async () => {
        const state = demoState();
        const [first, second] = state.expenses;
        const duplicate = {...second, id: first.id};
        assert.equal(await importJson(fileWith({...state, expenses: [first, duplicate]})), null);
    });

    it('rejects ids that only differ by JSON type', async () => {
        const state = demoState();
        const [first, second] = state.expenses;
        assert.equal(
            await importJson(fileWith({...state, expenses: [{...first, id: 5}, {...second, id: '5'}]})),
            null,
        );
    });

    it('rejects an unknown currency instead of rewriting it to EUR', async () => {
        assert.equal(await importJson(fileWith({...demoState(), currency: 'XYZ'})), null);
    });

    it('rejects a person id the wire format cannot carry', async () => {
        const state = demoState();
        const [first, ...rest] = state.people;
        // No expenses: with them, the dangling paidBy would fail the check first.
        const badIds: unknown[] = ['', `${first.id}|extra`, ['a|b'], ['']];
        for (const id of badIds) {
            assert.equal(
                await importJson(fileWith({
                    ...state,
                    expenses: [],
                    people: [{...first, id: id as string}, ...rest],
                })),
                null,
                `id ${JSON.stringify(id)} must be rejected`,
            );
        }
    });

    it('rejects an encoded-only payload with an unsafe person id', async () => {
        const state = demoState();
        const people = [{...state.people[0], id: ''}, ...state.people.slice(1)];
        const encoded = await encodeState({...state, people, expenses: []});
        assert.equal(await importJson(JSON.stringify({encoded})), null);
    });

    it('round-trips a split keyed by __proto__', async () => {
        const weights = Object.create(null) as Record<string, number>;
        weights.__proto__ = 1;
        weights.b = 3;
        const state = {
            ...demoState(),
            people: [{id: '__proto__', name: 'Proto'}, {id: 'b', name: 'Bob'}],
            expenses: [{
                id: 'e1',
                description: 'x',
                cents: 400,
                paidBy: '__proto__',
                participants: ['__proto__', 'b'],
                split: {mode: 'shares' as const, weights},
            }],
        };
        const decoded = await decodeState(await encodeState(state));
        const split = decoded?.expenses[0].split;
        assert.equal(split?.mode, 'shares');
        assert.equal(split.mode === 'shares' ? split.weights.__proto__ : undefined, 1);
    });

    it('imports the same session when ids and currency are valid', async () => {
        const state = demoState();
        const imported = await importJson(fileWith(state));
        assert.equal(imported?.expenses.length, state.expenses.length);
        assert.equal(imported?.currency, state.currency);
    });
});
