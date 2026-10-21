import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {encodeQuietly, hydrateFromStores, writeToStores} from './useUrlState';
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

describe('store writes', () => {
    it('still writes the fallback when the primary store throws', () => {
        const written: string[] = [];
        writeToStores(
            [
                {
                    read: () => '',
                    write: () => {
                        throw new Error('QuotaExceededError');
                    },
                },
                {read: () => '', write: encoded => written.push(encoded)},
            ],
            'payload',
        );
        assert.deepEqual(written, ['payload']);
    });
});

describe('store reads', () => {
    it('skips a throwing store and hydrates from the next one', async () => {
        let applied = 0;
        const hydrated = await hydrateFromStores({
            stores: [
                {
                    read: () => {
                        throw new Error('SecurityError');
                    },
                    write: () => {},
                },
                {read: () => 'payload', write: () => {}},
            ],
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

describe('encodeQuietly', () => {
    it('returns null instead of rejecting when the codec throws', async () => {
        const codec = {
            encode: () => {
                throw new Error('CompressionStream is not defined');
            },
            decode: () => null,
        };
        assert.equal(await encodeQuietly(codec, {}), null);
    });

    it('passes an async codec payload through', async () => {
        const codec = {encode: async () => 'z.payload', decode: () => null};
        assert.equal(await encodeQuietly(codec, {}), 'z.payload');
    });
});
