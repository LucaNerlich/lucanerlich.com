import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {allocateByWeights, allocateEqual, allocateExpense, validateSplit} from './split';
import {computeBalances, computeSettlement, summarize} from './settlement';
import {applyAction, expensesAffectedByRemoval, expensesDeletedByRemoval} from './model';
import {
    COMPRESSED_PREFIX,
    MAX_INFLATED_BYTES,
    SHARE_PARAM,
    buildShareUrl,
    decodeState,
    encodeState,
    readEncodedFromUrl,
    writeEncodedToUrl,
} from './urlState';
import {demoState} from './demo';
import {exportCsv, exportJson, importJson} from './io';
import type {AppState, Expense, Split} from './types';
import {emptyState, equalSplit} from './types';

describe('allocateEqual', () => {
    it('distributes remainder cents to first sorted ids', () => {
        const shares = allocateEqual(100, ['b', 'a', 'c']);
        assert.equal([...shares.values()].reduce((a, b) => a + b, 0), 100);
        assert.equal(shares.get('a'), 34);
        assert.equal(shares.get('b'), 33);
        assert.equal(shares.get('c'), 33);
    });

    it('handles exact division', () => {
        const shares = allocateEqual(90, ['x', 'y', 'z']);
        assert.deepEqual(
            [...shares.entries()].sort(),
            [
                ['x', 30],
                ['y', 30],
                ['z', 30],
            ],
        );
    });
});

describe('allocateByWeights', () => {
    it('uses largest remainder so cents sum exactly', () => {
        const shares = allocateByWeights(
            100,
            new Map([
                ['a', 1],
                ['b', 1],
                ['c', 1],
            ]),
        );
        assert.equal([...shares.values()].reduce((a, b) => a + b, 0), 100);
    });

    it('respects 2:1 weights', () => {
        const shares = allocateByWeights(
            300,
            new Map([
                ['a', 2],
                ['b', 1],
            ]),
        );
        assert.equal(shares.get('a'), 200);
        assert.equal(shares.get('b'), 100);
    });

    it('does not overflow on extreme weights', () => {
        const shares = allocateByWeights(
            1000,
            new Map([
                ['a', 1e308],
                ['b', 1e308],
            ]),
        );
        for (const value of shares.values()) assert.ok(Number.isFinite(value));
        assert.equal([...shares.values()].reduce((a, b) => a + b, 0), 1000);
    });

    it('keeps the sum exact for amounts above 2^53 when dividing', () => {
        const total = 9007199254740162;
        const shares = allocateByWeights(
            total,
            new Map([
                ['a', 2],
                ['b', 3],
            ]),
        );
        assert.equal([...shares.values()].reduce((a, b) => a + b, 0), total);
    });
});

describe('allocateExpense modes', () => {
    const base: Expense = {
        id: 'e1',
        description: 'x',
        cents: 1000,
        paidBy: 'a',
        participants: ['a', 'b'],
        split: equalSplit(),
    };

    it('equal', () => {
        const shares = allocateExpense(base);
        assert.equal(shares.get('a'), 500);
        assert.equal(shares.get('b'), 500);
    });

    it('percent', () => {
        const shares = allocateExpense({
            ...base,
            split: {mode: 'percent', percents: {a: 70, b: 30}},
        });
        assert.equal(shares.get('a'), 700);
        assert.equal(shares.get('b'), 300);
    });

    it('exact', () => {
        const shares = allocateExpense({
            ...base,
            split: {mode: 'exact', amounts: {a: 250, b: 750}},
        });
        assert.equal(shares.get('a'), 250);
        assert.equal(shares.get('b'), 750);
    });

    it('rejects bad percent totals', () => {
        assert.ok(
            validateSplit({mode: 'percent', percents: {a: 50, b: 40}}, ['a', 'b'], 100),
        );
    });
});

describe('settlement with participants and payer-covers', () => {
    it('balances sum to zero for demo trip', () => {
        const state = demoState();
        const balances = computeBalances(state);
        const sum = [...balances.values()].reduce((a, b) => a + b, 0);
        assert.equal(sum, 0);
        const {transfers} = summarize(state);
        assert.ok(transfers.length > 0);
        assert.ok(computeSettlement(balances).length === transfers.length);
    });

    it('derives the per-expense breakdown once per summarize', () => {
        // summarize must pass its breakdowns to computeBalances instead of
        // letting it re-derive them: a second traversal reads state.expenses.
        let expenseReads = 0;
        const counted = new Proxy(demoState(), {
            get(target, prop, receiver) {
                if (prop === 'expenses') expenseReads += 1;
                return Reflect.get(target, prop, receiver);
            },
        });
        const summary = summarize(counted);
        assert.equal(expenseReads, 1);
        assert.ok(summary.breakdowns.length > 0);
    });

    it('payer outside participants is owed the full expense', () => {
        const state: AppState = {
            v: 2,
            currency: 'EUR',
            people: [
                {id: 'a', name: 'A'},
                {id: 'b', name: 'B'},
            ],
            expenses: [
                {
                    id: 'e',
                    description: 'Gift',
                    cents: 4000,
                    paidBy: 'a',
                    participants: ['b'],
                    split: equalSplit(),
                },
            ],
            paidTransferKeys: [],
        };
        const balances = computeBalances(state);
        assert.equal(balances.get('a'), 4000);
        assert.equal(balances.get('b'), -4000);
    });
});

describe('url codec', () => {
    it('discards stale payers while preserving every valid payer index', async () => {
        const state: AppState = {
            ...emptyState(),
            people: [{id: 'a', name: 'A'}, {id: 'b', name: 'B'}],
            expenses: ['a', 'missing', 'b'].map(paidBy => ({
                id: paidBy,
                description: 'Expense',
                cents: 100,
                paidBy,
                participants: ['a', 'b'],
                split: equalSplit(),
            })),
        };
        const decoded = await decodeState(await encodeState(state));
        assert.ok(decoded);
        assert.deepEqual(decoded.expenses, [state.expenses[0], state.expenses[2]]);
    });

    it('round-trips compressed v3 state', async () => {
        const state = demoState();
        state.people[0].name = 'Alice 🏿';
        const encoded = await encodeState(state);
        assert.ok(encoded.startsWith(COMPRESSED_PREFIX));
        assert.deepEqual(await decodeState(encoded), state);
    });

    it('rejects payloads that inflate past the size cap', async () => {
        // A valid v3 wire whose expense description is past the cap: without
        // the cap this would decode to a state, so null here proves it fired.
        const wire = [
            3,
            'EUR',
            [['a', 'A']],
            [['e1', 'x'.repeat(MAX_INFLATED_BYTES + 1024), 100, 0, 0, 'eq']],
            [],
        ];
        const stream = new Blob([new TextEncoder().encode(JSON.stringify(wire))])
            .stream()
            .pipeThrough(new CompressionStream('deflate-raw'));
        const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
        let binary = '';
        for (let i = 0; i < compressed.length; i++) binary += String.fromCharCode(compressed[i]);
        const payload =
            COMPRESSED_PREFIX +
            btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        assert.equal(await decodeState(payload), null);
    });

    it('falls back to equal when decoded splits are invalid after filtering participants', async () => {
        const splits: Split[] = [
            {mode: 'shares', weights: {a: 0, b: 1}},
            {mode: 'percent', percents: {a: 50, b: 40}},
            {mode: 'exact', amounts: {a: 100, b: 100}},
            {mode: 'percent', percents: {a: 50, b: 25, missing: 25}},
        ];
        for (const split of splits) {
            const state: AppState = {
                ...emptyState(),
                people: [{id: 'a', name: 'A'}, {id: 'b', name: 'B'}],
                expenses: [{
                    id: 'e', description: 'Lunch', cents: 1000, paidBy: 'a',
                    participants: ['a', 'b', 'missing'], split,
                }],
            };
            const decoded = await decodeState(await encodeState(state));
            assert.ok(decoded);
            assert.deepEqual(decoded.expenses[0].participants, ['a', 'b']);
            assert.deepEqual(decoded.expenses[0].split, equalSplit());
            assert.equal([...allocateExpense(decoded.expenses[0]).values()].reduce((a, b) => a + b, 0), 1000);
        }
    });

    it('resolves v3 references through deduplicated person ids', async () => {
        const state: AppState = {
            ...emptyState(),
            people: [
                {id: 'a', name: 'A'},
                {id: 'a', name: 'A duplicate'},
                {id: 'b', name: 'B'},
            ],
            expenses: [
                {
                    id: 'e',
                    description: 'Lunch',
                    cents: 1000,
                    paidBy: 'a',
                    participants: ['a', 'b'],
                    split: equalSplit(),
                },
                {
                    id: 'e2',
                    description: 'Fuel',
                    cents: 2000,
                    paidBy: 'a',
                    participants: ['a', 'b'],
                    split: {mode: 'shares', weights: {a: 1, b: 9}},
                },
            ],
        };
        const decoded = await decodeState(await encodeState(state));
        assert.ok(decoded);
        assert.equal(decoded.people.length, 2);
        assert.equal(decoded.expenses[0].paidBy, 'a');
        assert.deepEqual([...decoded.expenses[0].participants].sort(), ['a', 'b']);
        assert.deepEqual(decoded.expenses[1].split, {mode: 'shares', weights: {a: 1, b: 9}});
    });

    it('drops a legacy expense whose participant list resolves empty', async () => {
        const v2 = {
            v: 2 as const,
            c: 'EUR',
            p: [
                ['a', 'Ann'],
                ['b', 'Ben'],
            ] as [string, string][],
            e: [['e1', 'Lunch', 1000, 'a', [], 'eq']] as [
                string,
                string,
                number,
                string,
                string[],
                'eq',
            ][],
            t: [] as string[],
        };
        const encoded = btoa(JSON.stringify(v2)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const state = await decodeState(encoded);
        assert.ok(state);
        assert.equal(state!.expenses.length, 0);
    });

    it('drops a v3 expense whose explicit participant list resolves empty', async () => {
        const encodeWire = async (value: unknown) => {
            const compressed = new Uint8Array(
                await new Response(
                    new Blob([JSON.stringify(value)]).stream().pipeThrough(new CompressionStream('deflate-raw')),
                ).arrayBuffer(),
            );
            let binary = '';
            for (const byte of compressed) binary += String.fromCharCode(byte);
            return COMPRESSED_PREFIX + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        };

        const state = await decodeState(await encodeWire([
            3,
            'EUR',
            [['a', 'A'], ['b', 'B']],
            [
                ['good', 'Lunch', 1000, 0, [1], 'eq'],
                ['bad', 'Broken', 500, 0, [], 'eq'],
            ],
            [],
        ]));
        assert.ok(state);
        assert.deepEqual(state.expenses.map((expense) => expense.id), ['good']);

        const allPeople = await decodeState(await encodeWire([
            3,
            'EUR',
            [['a', 'A'], ['b', 'B']],
            [['everyone', 'Lunch', 1000, 0, 0, 'eq']],
            [],
        ]));
        assert.ok(allPeople);
        assert.deepEqual(allPeople.expenses[0].participants, ['a', 'b']);
    });

    it('migrates legacy uncompressed v1 and v2 base64url payloads', async () => {
        const v1 = {
            v: 1 as const,
            c: 'EUR',
            p: [
                ['a', 'Ann'],
                ['b', 'Ben'],
            ] as [string, string][],
            e: [['e1', 'Lunch', 2000, 'a']] as [string, string, number, string][],
        };
        const json = JSON.stringify(v1);
        const bytes = new TextEncoder().encode(json);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const state = await decodeState(encoded);
        assert.ok(state);
        assert.equal(state!.v, 2);
        assert.deepEqual(state!.expenses[0].participants, ['a', 'b']);
        assert.equal(state!.expenses[0].split.mode, 'equal');

        const v2 = {
            v: 2 as const,
            c: 'EUR',
            p: v1.p,
            e: [['e1', 'Lunch', 2000, 'a', ['a', 'b'], 'eq']] as [
                string,
                string,
                number,
                string,
                string[],
                'eq',
            ][],
            t: [] as string[],
        };
        const v2json = JSON.stringify(v2);
        const v2bytes = new TextEncoder().encode(v2json);
        let v2binary = '';
        for (let i = 0; i < v2bytes.length; i++) v2binary += String.fromCharCode(v2bytes[i]);
        const v2encoded = btoa(v2binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const fromV2 = await decodeState(v2encoded);
        assert.ok(fromV2);
        assert.equal(fromV2!.expenses[0].cents, 2000);
    });

    it('builds WhatsApp-safe query share URLs and prefers ?s= over #', async () => {
        const state = demoState();
        const share = await buildShareUrl('https://lucanerlich.com/apps/splitter/', state);
        const url = new URL(share);
        assert.equal(url.hash, '');
        assert.ok(url.searchParams.get(SHARE_PARAM)?.startsWith(COMPRESSED_PREFIX));

        const legacyHash = new URL('https://lucanerlich.com/apps/splitter/');
        legacyHash.hash = 'legacyPayload';
        assert.equal(readEncodedFromUrl(legacyHash), 'legacyPayload');

        const both = new URL('https://lucanerlich.com/apps/splitter/?s=fromQuery#fromHash');
        assert.equal(readEncodedFromUrl(both), 'fromQuery');

        const written = writeEncodedToUrl(legacyHash, 'abc');
        assert.equal(written.hash, '');
        assert.equal(written.searchParams.get(SHARE_PARAM), 'abc');
    });

    it('compresses typical sessions well under the old uncompressed payload size', async () => {
        // User-reported session shape: 4 people, 3 equal-split expenses.
        const legacy = {
            v: 2 as const,
            c: 'EUR',
            p: [
                ['6se1y9tc', 'luca'],
                ['5kbr0qkc', 'nils'],
                ['f2zrj5eo', 'fabian'],
                ['ml3ctoxz', 'basti'],
            ] as [string, string][],
            e: [
                ['xdmmy59f', 'einkauf', 26500, '6se1y9tc', ['6se1y9tc', '5kbr0qkc', 'f2zrj5eo', 'ml3ctoxz'], 'eq'],
                ['v638lqfu', 'car', 38500, '5kbr0qkc', ['6se1y9tc', '5kbr0qkc', 'f2zrj5eo', 'ml3ctoxz'], 'eq'],
                ['v0lw2hye', 'Alles zusammen', 46400, 'f2zrj5eo', ['6se1y9tc', '5kbr0qkc', 'f2zrj5eo', 'ml3ctoxz'], 'eq'],
            ] as [string, string, number, string, string[], 'eq'][],
            t: [] as string[],
        };
        const legacyJson = JSON.stringify(legacy);
        let binary = '';
        const legacyBytes = new TextEncoder().encode(legacyJson);
        for (let i = 0; i < legacyBytes.length; i++) binary += String.fromCharCode(legacyBytes[i]);
        const legacyPayload = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

        const state = await decodeState(legacyPayload);
        assert.ok(state);
        const compact = await encodeState(state!);
        assert.ok(compact.startsWith(COMPRESSED_PREFIX));
        assert.ok(
            compact.length < legacyPayload.length * 0.6,
            `expected compact ${compact.length} << legacy ${legacyPayload.length}`,
        );
        assert.deepEqual(await decodeState(compact), state);
    });
});

describe('model', () => {
    it('clears paid transfers only when currency changes', () => {
        const state = {...demoState(), paidTransferKeys: ['a|b|100']};
        assert.equal(applyAction(state, {type: 'SET_CURRENCY', currency: 'EUR'}), state);
        assert.deepEqual(applyAction(state, {type: 'SET_CURRENCY', currency: 'USD'}), {
            ...state, currency: 'USD', paidTransferKeys: [],
        });
    });

    it('counts the full removal cascade for the demo trip', () => {
        // The dialog derives its counts from these helpers: deleted (paid or
        // sole participant) vs re-split (only joined). Carol: Taxi is deleted,
        // Dinner and Groceries are re-split.
        const state = demoState();
        const carol = state.people.find(p => p.name === 'Carol')!.id;
        const affected = expensesAffectedByRemoval(state, carol);
        const deleted = expensesDeletedByRemoval(state, carol);
        const resplit = affected.filter(e => !deleted.includes(e));
        assert.equal(affected.length, 3);
        assert.deepEqual(deleted.map(e => e.description), ['Taxi']);
        assert.deepEqual(resplit.map(e => e.description), ['Dinner', 'Groceries for cabin']);
    });

    it('counts a sole-participant expense as deleted, not re-split', () => {
        // REMOVE_PERSON drops expenses whose participant list empties, so the
        // dialog must count them as deleted even when someone else paid them.
        const base = demoState();
        const carol = base.people.find(p => p.name === 'Carol')!.id;
        const alice = base.people.find(p => p.name === 'Alice')!.id;
        const sole: Expense = {
            id: 'sole01',
            description: 'Carol only',
            cents: 100,
            paidBy: alice,
            participants: [carol],
            split: equalSplit(),
        };
        const state: AppState = {...base, expenses: [...base.expenses, sole]};
        const affected = expensesAffectedByRemoval(state, carol);
        const deleted = expensesDeletedByRemoval(state, carol);
        assert.deepEqual(deleted.map(e => e.description), ['Taxi', 'Carol only']);
        assert.equal(affected.length - deleted.length, 2);
    });

    it('renames and duplicates', () => {
        let state = emptyState();
        state = applyAction(state, {type: 'ADD_PERSON', name: 'Ada'});
        state = applyAction(state, {type: 'ADD_PERSON', name: 'Bea'});
        const a = state.people[0].id;
        const b = state.people[1].id;
        state = applyAction(state, {
            type: 'ADD_EXPENSE',
            expense: {
                description: 'Tea',
                cents: 500,
                paidBy: a,
                participants: [a, b],
                split: equalSplit(),
            },
        });
        state = applyAction(state, {type: 'RENAME_PERSON', id: a, name: 'Ada Lovelace'});
        assert.equal(state.people[0].name, 'Ada Lovelace');
        state = applyAction(state, {type: 'DUPLICATE_EXPENSE', id: state.expenses[0].id});
        assert.equal(state.expenses.length, 2);
        assert.notEqual(state.expenses[0].id, state.expenses[1].id);
    });
});

describe('session files', () => {
    it('imports edits to exported state ahead of stale encoded data', async () => {
        const state = demoState();
        const data = JSON.parse(await exportJson(state));
        data.state.people[0].name = 'Edited name';
        assert.deepEqual(await importJson(JSON.stringify(data)), data.state);
        assert.deepEqual(await importJson(JSON.stringify({encoded: data.encoded})), state);
        assert.deepEqual(await importJson(JSON.stringify(state)), state);
    });

    it('rejects malformed state instead of silently restoring encoded data', async () => {
        const encoded = await encodeState(demoState());
        for (const state of [null, {}, {people: [], expenses: null}]) {
            assert.equal(await importJson(JSON.stringify({encoded, state})), null);
        }
    });

    it('rejects an import that would drop rows instead of reporting success', async () => {
        const data = JSON.parse(await exportJson(demoState()));
        data.state.expenses[0].paidBy = 'typo';
        assert.equal(await importJson(JSON.stringify(data)), null);

        const flat = JSON.parse(await exportJson(demoState()));
        flat.state.expenses[0].paidBy = 'typo';
        assert.equal(
            await importJson(
                JSON.stringify({people: flat.state.people, expenses: flat.state.expenses}),
            ),
            null,
        );
    });

    it('quotes CSV text and neutralizes formula prefixes in descriptions and names', () => {
        for (const prefix of ['=', '+', '-', '@', '\t', '\r', '\n']) {
            const state = demoState();
            state.expenses = [state.expenses[0]];
            state.expenses[0].description = `${prefix}SUM(1)`;
            state.people[0].name = `${prefix}Alice`;
            const row = exportCsv(state).slice(exportCsv(state).indexOf('\n') + 1);
            assert.equal(row, `"'${prefix}SUM(1)",72.00,EUR,"'${prefix}Alice","'${prefix}Alice;Bob;Carol",equal\n`);
        }
        const state = demoState();
        state.expenses = [state.expenses[0]];
        state.expenses[0].description = 'Tea, "cake"';
        assert.ok(exportCsv(state).includes('"Tea, ""cake""",72.00'));
    });
});
