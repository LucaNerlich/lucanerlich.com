// Splitter domain module.
// Owns every state transition and the invariants behind them, so the React
// reducer is a thin adapter and the rules are testable through one interface.

import type {Action, AppState, Expense, ExpenseInput} from './types';
import {equalSplit, newId} from './types';
import {validateSplit} from './split';

/**
 * Every expense the given person paid. Removing a person cascades to exactly
 * these expenses, so the reducer and any "what will this delete?" preview share
 * one definition of the cascade instead of each re-deriving it from raw state.
 */
export const expensesPaidBy = (state: AppState, personId: string): Expense[] =>
    state.expenses.filter(e => e.paidBy === personId);

const normalizeExpenseInput = (
    state: AppState,
    input: ExpenseInput,
): ExpenseInput | null => {
    if (input.cents <= 0 || !Number.isSafeInteger(input.cents)) return null;
    if (!state.people.some(p => p.id === input.paidBy)) return null;

    const known = new Set(state.people.map(p => p.id));
    const participants = [...new Set(input.participants)].filter(id => known.has(id));
    if (participants.length === 0) return null;

    const split = input.split.mode === 'equal' ? equalSplit() : input.split;
    if (validateSplit(split, participants, input.cents)) return null;

    return {
        description: input.description.trim(),
        cents: input.cents,
        paidBy: input.paidBy,
        participants,
        split,
    };
};

const stripPersonFromExpenses = (expenses: Expense[], personId: string): Expense[] =>
    expenses
        .filter(e => e.paidBy !== personId)
        .map(e => {
            const participants = e.participants.filter(id => id !== personId);
            if (participants.length === 0) return null;
            if (e.split.mode === 'equal') {
                return {...e, participants};
            }
            if (e.split.mode === 'shares') {
                const weights = {...e.split.weights};
                delete weights[personId];
                const next = {...e, participants, split: {mode: 'shares' as const, weights}};
                return validateSplit(next.split, participants, next.cents) ? null : next;
            }
            if (e.split.mode === 'percent') {
                // Dropping a person invalidates percent totals - fall back to equal.
                return {...e, participants, split: equalSplit()};
            }
            const amounts = {...e.split.amounts};
            delete amounts[personId];
            // Exact amounts no longer sum - fall back to equal.
            return {...e, participants, split: equalSplit()};
        })
        .filter((e): e is Expense => e !== null);

/**
 * Applies a domain action to the current state and returns the next state.
 */
export const applyAction = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'HYDRATE':
            return action.state;
        case 'ADD_PERSON': {
            const name = action.name.trim();
            if (!name) return state;
            const lower = name.toLocaleLowerCase();
            if (state.people.some(p => p.name.toLocaleLowerCase() === lower)) return state;
            return {...state, people: [...state.people, {id: newId(), name}]};
        }
        case 'REMOVE_PERSON': {
            return {
                ...state,
                people: state.people.filter(p => p.id !== action.id),
                expenses: stripPersonFromExpenses(state.expenses, action.id),
                paidTransferKeys: state.paidTransferKeys.filter(key => {
                    const [from, to] = key.split('|');
                    return from !== action.id && to !== action.id;
                }),
            };
        }
        case 'RENAME_PERSON': {
            const name = action.name.trim();
            if (!name) return state;
            const lower = name.toLocaleLowerCase();
            if (
                state.people.some(
                    p => p.id !== action.id && p.name.toLocaleLowerCase() === lower,
                )
            ) {
                return state;
            }
            return {
                ...state,
                people: state.people.map(p => (p.id === action.id ? {...p, name} : p)),
            };
        }
        case 'ADD_EXPENSE': {
            const normalized = normalizeExpenseInput(state, action.expense);
            if (!normalized) return state;
            return {
                ...state,
                expenses: [...state.expenses, {id: newId(), ...normalized}],
            };
        }
        case 'UPDATE_EXPENSE': {
            const normalized = normalizeExpenseInput(state, action.expense);
            if (!normalized) return state;
            return {
                ...state,
                expenses: state.expenses.map(e =>
                    e.id === action.id ? {id: e.id, ...normalized} : e,
                ),
            };
        }
        case 'REMOVE_EXPENSE':
            return {...state, expenses: state.expenses.filter(e => e.id !== action.id)};
        case 'DUPLICATE_EXPENSE': {
            const source = state.expenses.find(e => e.id === action.id);
            if (!source) return state;
            const copy: Expense = {
                ...source,
                id: newId(),
                split:
                    source.split.mode === 'equal'
                        ? equalSplit()
                        : source.split.mode === 'shares'
                          ? {mode: 'shares', weights: {...source.split.weights}}
                          : source.split.mode === 'percent'
                            ? {mode: 'percent', percents: {...source.split.percents}}
                            : {mode: 'exact', amounts: {...source.split.amounts}},
                participants: [...source.participants],
            };
            return {...state, expenses: [...state.expenses, copy]};
        }
        case 'SET_CURRENCY':
            return {...state, currency: action.currency};
        case 'TOGGLE_TRANSFER_PAID': {
            const has = state.paidTransferKeys.includes(action.key);
            return {
                ...state,
                paidTransferKeys: has
                    ? state.paidTransferKeys.filter(k => k !== action.key)
                    : [...state.paidTransferKeys, action.key],
            };
        }
        case 'CLEAR_PAID_TRANSFERS':
            return {...state, paidTransferKeys: []};
        default:
            return state;
    }
};
