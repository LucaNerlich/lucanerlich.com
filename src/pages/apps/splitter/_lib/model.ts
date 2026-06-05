// Splitter domain module.
// Owns every state transition and the invariants behind them, so the React
// reducer is a thin adapter and the rules are testable through one interface.

import type {Action, AppState} from './types';
import {newId} from './types';

/**
 * Applies a domain action to the current state and returns the next state.
 * All invariants live here:
 *   - person names are trimmed and must be non-empty
 *   - removing a person cascades to the expenses they paid
 *   - expense amounts must be positive cents
 *   - an expense must be paid by a known person
 */
export const applyAction = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'HYDRATE':
            return action.state;
        case 'ADD_PERSON': {
            const name = action.name.trim();
            if (!name) return state;
            return {...state, people: [...state.people, {id: newId(), name}]};
        }
        case 'REMOVE_PERSON':
            return {
                ...state,
                people: state.people.filter(p => p.id !== action.id),
                expenses: state.expenses.filter(e => e.paidBy !== action.id),
            };
        case 'ADD_EXPENSE': {
            if (action.cents <= 0) return state;
            if (!state.people.some(p => p.id === action.paidBy)) return state;
            return {
                ...state,
                expenses: [
                    ...state.expenses,
                    {id: newId(), description: action.description.trim(), cents: action.cents, paidBy: action.paidBy},
                ],
            };
        }
        case 'REMOVE_EXPENSE':
            return {...state, expenses: state.expenses.filter(e => e.id !== action.id)};
        default:
            return state;
    }
};
