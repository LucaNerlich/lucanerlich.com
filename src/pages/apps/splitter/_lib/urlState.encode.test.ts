import {afterEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {decodeState, encodeState} from './urlState';
import {demoState} from './demo';

const original = Object.getOwnPropertyDescriptor(globalThis, 'CompressionStream');

afterEach(() => {
    if (original) Object.defineProperty(globalThis, 'CompressionStream', original);
});

describe('encodeState without CompressionStream', () => {
    it('falls back to an uncompressed payload that still decodes', async () => {
        Reflect.deleteProperty(globalThis, 'CompressionStream');
        const state = demoState();
        const encoded = await encodeState(state);
        assert.ok(!encoded.startsWith('z.'), 'payload should not claim compression');
        const decoded = await decodeState(encoded);
        assert.equal(decoded?.expenses.length, state.expenses.length);
        assert.equal(decoded?.currency, state.currency);
    });
});
