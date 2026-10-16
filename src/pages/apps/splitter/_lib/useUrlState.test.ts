import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {hydrateFromStores} from './useUrlState';
import {demoState} from './demo';

describe('mount hydrate', () => {
    it('skips a late hydrate after the user acted during the decode', async () => {
        let userActed = false;
        let applied = 0;
        let release = () => {};
        const gate = new Promise<void>(resolve => {
            release = resolve;
        });
        const pending = hydrateFromStores({
            stores: [{read: () => 'payload', write: () => {}}],
            decode: async () => {
                await gate;
                return demoState();
            },
            hydrate: () => {
                applied += 1;
            },
            isCancelled: () => false,
            hasUserActed: () => userActed,
        });
        userActed = true; // the user clicks while the decode is still pending
        release();
        assert.equal(await pending, true);
        assert.equal(applied, 0);
    });

    it('applies the hydrate when the user has not acted', async () => {
        let applied = 0;
        const hydrated = await hydrateFromStores({
            stores: [{read: () => 'payload', write: () => {}}],
            decode: () => demoState(),
            hydrate: () => {
                applied += 1;
            },
            isCancelled: () => false,
            hasUserActed: () => false,
        });
        assert.equal(hydrated, true);
        assert.equal(applied, 1);
    });
});
