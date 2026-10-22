import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {decodeState} from './urlState';

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
