import type {AppState} from './types';
import {equalSplit} from './types';

/** Deterministic sample trip so "Try example" is stable across reloads. */
export const demoState = (): AppState => {
    const alice = 'demo01al';
    const bob = 'demo01bo';
    const carol = 'demo01ca';
    return {
        v: 2,
        currency: 'EUR',
        people: [
            {id: alice, name: 'Alice'},
            {id: bob, name: 'Bob'},
            {id: carol, name: 'Carol'},
        ],
        expenses: [
            {
                id: 'demoex01',
                description: 'Dinner',
                cents: 7200,
                paidBy: alice,
                participants: [alice, bob, carol],
                split: equalSplit(),
            },
            {
                id: 'demoex02',
                description: 'Museum (Alice+Bob)',
                cents: 3200,
                paidBy: bob,
                participants: [alice, bob],
                split: equalSplit(),
            },
            {
                id: 'demoex03',
                description: 'Taxi',
                cents: 2700,
                paidBy: carol,
                participants: [alice, bob, carol],
                split: {
                    mode: 'shares',
                    weights: {[alice]: 1, [bob]: 1, [carol]: 2},
                },
            },
            {
                id: 'demoex04',
                description: 'Groceries for cabin',
                cents: 4500,
                paidBy: alice,
                // Payer covers for others -- Alice paid but is not in the split.
                participants: [bob, carol],
                split: equalSplit(),
            },
        ],
        paidTransferKeys: [],
    };
};
