import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {allocateByWeights, allocateEqual, allocateExpense, validateSplit} from './split';
import {computeBalances, computeSettlement, summarize} from './settlement';
import {applyAction} from './model';
import {decodeState, encodeState} from './urlState';
import {demoState} from './demo';
import type {AppState, Expense} from './types';
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
    it('round-trips v2 state', () => {
        const state = demoState();
        const again = decodeState(encodeState(state));
        assert.ok(again);
        assert.equal(again!.expenses.length, state.expenses.length);
        assert.equal(again!.currency, 'EUR');
    });

    it('migrates v1 wire', () => {
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
        const state = decodeState(encoded);
        assert.ok(state);
        assert.equal(state!.v, 2);
        assert.deepEqual(state!.expenses[0].participants, ['a', 'b']);
        assert.equal(state!.expenses[0].split.mode, 'equal');
    });
});

describe('model', () => {
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
