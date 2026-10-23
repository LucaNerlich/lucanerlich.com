import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {decodeState, encodeState} from './urlState';

// Bare base64url JSON is the legacy (uncompressed) wire shape.
const legacy = (wire: unknown): string =>
    Buffer.from(JSON.stringify(wire)).toString('base64url');

const people = [['a', 'Ada'], ['b', 'Bob']];

describe('decodeState expense ids', () => {
    it('keeps one row per id in a v1 payload', async () => {
        const decoded = await decodeState(legacy({
            v: 1,
            c: 'EUR',
            p: people,
            e: [
                ['dup', 'first', 500, 'a'],
                ['dup', 'second', 300, 'a'],
            ],
        }));
        assert.deepEqual(decoded?.expenses.map(e => e.description), ['first']);
    });

    it('keeps one row per id in a v2 payload', async () => {
        const decoded = await decodeState(legacy({
            v: 2,
            c: 'EUR',
            p: people,
            e: [
                ['dup', 'first', 500, 'a', ['a'], 'eq'],
                ['dup', 'second', 300, 'a', ['a'], 'eq'],
            ],
        }));
        assert.deepEqual(decoded?.expenses.map(e => e.description), ['first']);
    });

    it('keeps one row per id in a v3 payload', async () => {
        const decoded = await decodeState(legacy([
            3,
            'EUR',
            people,
            [
                ['dup', 'first', 500, 0, 0, 'eq'],
                ['dup', 'second', 300, 0, 0, 'eq'],
            ],
            [],
        ]));
        assert.deepEqual(decoded?.expenses.map(e => e.description), ['first']);
    });
});

describe('decodeState person ids', () => {
    it('rejects a v3 payload whose person id contains the transfer delimiter', async () => {
        const decoded = await decodeState(legacy([
            3,
            'EUR',
            [['a', 'Ada'], ['b|c', 'Bob']],
            [],
            [],
        ]));
        assert.equal(decoded, null);
    });

    it('rejects a v2 payload with an empty person id', async () => {
        const decoded = await decodeState(legacy({
            v: 2,
            c: 'EUR',
            p: [['', 'Ada'], ['b', 'Bob']],
            e: [],
        }));
        assert.equal(decoded, null);
    });

    it('rejects an unsafe id through the compressed share-link round trip', async () => {
        const state = {
            v: 2 as const,
            currency: 'EUR' as const,
            people: [{id: 'a|b', name: 'Ada'}],
            expenses: [],
            paidTransferKeys: [],
        };
        assert.equal(await decodeState(await encodeState(state)), null);
    });

    it('still decodes a payload whose ids are wire-safe', async () => {
        const decoded = await decodeState(legacy([
            3,
            'EUR',
            [['a1', 'Ada'], ['b2', 'Bob']],
            [],
            [],
        ]));
        assert.deepEqual(decoded?.people.map(p => p.id), ['a1', 'b2']);
    });
});
