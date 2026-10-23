import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {paidAndOwed, summarize} from './settlement';
import {demoState} from './demo';

describe('balances', () => {
    it('net the paid and owed maps into the summary balances', () => {
        const state = demoState();
        const {balances, paid, owed} = summarize(state);
        for (const [id, cents] of balances) {
            assert.equal(cents, (paid.get(id) ?? 0) - (owed.get(id) ?? 0));
        }
        assert.equal([...balances.values()].reduce((a, b) => a + b, 0), 0);
    });

    it('sum to zero', () => {
        const state = demoState();
        const total = [...summarize(state).balances.values()].reduce((a, b) => a + b, 0);
        assert.equal(total, 0);
    });

    it('net paid minus owed', () => {
        const state = demoState();
        const summary = summarize(state);
        const direct = paidAndOwed(state);
        for (const [id, cents] of summary.balances) {
            // The panel reads these maps off the summary, so assert that pair too.
            assert.equal((summary.paid.get(id) ?? 0) - (summary.owed.get(id) ?? 0), cents);
            assert.equal((direct.paid.get(id) ?? 0) - (direct.owed.get(id) ?? 0), cents);
        }
    });
});
