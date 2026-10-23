import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {paidAndOwed, summarize} from './settlement';
import {demoState} from './demo';

describe('balances', () => {
    it('sum to zero', () => {
        const state = demoState();
        const total = [...summarize(state).balances.values()].reduce((a, b) => a + b, 0);
        assert.equal(total, 0);
    });

    it('net paid minus owed', () => {
        const state = demoState();
        const summary = summarize(state);
        const direct = paidAndOwed(state);
        // Iterate the paid map: a balance dropped for a person who paid must fail.
        for (const [id, cents] of direct.paid) {
            assert.ok(summary.balances.has(id), `no balance for ${id}`);
            assert.equal(summary.balances.get(id), cents - (direct.owed.get(id) ?? 0));
        }
        for (const [id, cents] of summary.balances) {
            // The panel reads these maps off the summary, so assert that pair too.
            assert.equal((summary.paid.get(id) ?? 0) - (summary.owed.get(id) ?? 0), cents);
            assert.equal((direct.paid.get(id) ?? 0) - (direct.owed.get(id) ?? 0), cents);
        }
    });
});
