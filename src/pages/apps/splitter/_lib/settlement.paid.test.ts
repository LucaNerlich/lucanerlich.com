import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {paidAndOwed, summarize} from './settlement';
import {demoState} from './demo';

describe('paid and owed', () => {
    it('nets to the balances the settlement uses', () => {
        const state = demoState();
        const summary = summarize(state);
        for (const person of state.people) {
            const paid = summary.paid.get(person.id) ?? 0;
            const owed = summary.owed.get(person.id) ?? 0;
            assert.equal(paid - owed, summary.balances.get(person.id) ?? 0);
        }
    });

    it('is the same map summarize exposes when called directly', () => {
        const state = demoState();
        const summary = summarize(state);
        const {paid, owed} = paidAndOwed(state);
        assert.deepEqual([...paid], [...summary.paid]);
        assert.deepEqual([...owed], [...summary.owed]);
    });
});
