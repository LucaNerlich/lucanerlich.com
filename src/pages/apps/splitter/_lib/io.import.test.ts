import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {importJson} from './io';
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

    it('rejects an unknown currency instead of rewriting it to EUR', async () => {
        assert.equal(await importJson(fileWith({...demoState(), currency: 'XYZ'})), null);
    });

    it('imports the same session when ids and currency are valid', async () => {
        const state = demoState();
        const imported = await importJson(fileWith(state));
        assert.equal(imported?.expenses.length, state.expenses.length);
        assert.equal(imported?.currency, state.currency);
    });
});
