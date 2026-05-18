import React, {useEffect, useReducer, useRef, useState} from 'react';
import type {Action, AppState} from './_lib/types';
import {emptyState, newId} from './_lib/types';

const pluralRules = new Intl.PluralRules('en', {type: 'cardinal'});
import {encodeState, decodeState} from './_lib/urlState';
import PeopleManager from './_components/PeopleManager';
import ExpenseForm from './_components/ExpenseForm';
import ExpenseList from './_components/ExpenseList';
import ResultsPanel from './_components/ResultsPanel';
import styles from './splitter.module.css';

const reducer = (state: AppState, action: Action): AppState => {
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

const SplitterApp: React.FC = () => {
    const [state, dispatch] = useReducer(reducer, undefined, emptyState);
    const hydratedRef = useRef(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const decoded = decodeState(hash);
            if (decoded) dispatch({type: 'HYDRATE', state: decoded});
        }
        hydratedRef.current = true;
    }, []);

    useEffect(() => {
        if (!hydratedRef.current) return;
        const handle = window.setTimeout(() => {
            const encoded = encodeState(state);
            const newHash = '#' + encoded;
            if (window.location.hash !== newHash) {
                window.history.replaceState(
                    null,
                    '',
                    window.location.pathname + window.location.search + newHash,
                );
            }
        }, 150);
        return () => window.clearTimeout(handle);
    }, [state]);

    const handleRemovePerson = (id: string) => {
        const person = state.people.find(p => p.id === id);
        if (!person) return;
        const expenseCount = state.expenses.filter(e => e.paidBy === id).length;
        if (expenseCount > 0) {
            const expenseWord = pluralRules.select(expenseCount) === 'one' ? 'expense' : 'expenses';
            const ok = window.confirm(
                `${person.name} paid ${expenseCount} ${expenseWord}. Remove them and those expenses?`,
            );
            if (!ok) return;
        }
        dispatch({type: 'REMOVE_PERSON', id});
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard blocked — no-op
        }
    };

    const handleReset = () => {
        if (state.people.length === 0 && state.expenses.length === 0) return;
        const ok = window.confirm('Clear all people and expenses?');
        if (ok) dispatch({type: 'HYDRATE', state: emptyState()});
    };

    return (
        <main className={styles.app}>
            <header className={styles.header}>
                <h1 className={styles.title}>Splitter</h1>
                <p className={styles.subtitle}>
                    Who owes whom how much. Your data lives in this page's URL —
                    bookmark or share the link to keep or send the session.
                </p>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleCopyLink}
                    >
                        {copied ? 'Copied!' : 'Copy share link'}
                    </button>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={handleReset}
                        aria-label="Reset session"
                    >
                        Reset
                    </button>
                </div>
            </header>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>People</h2>
                <PeopleManager
                    people={state.people}
                    onAdd={name => dispatch({type: 'ADD_PERSON', name})}
                    onRemove={handleRemovePerson}
                />
            </section>

            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Add expense</h2>
                <ExpenseForm
                    people={state.people}
                    onAdd={(description, cents, paidBy) =>
                        dispatch({type: 'ADD_EXPENSE', description, cents, paidBy})
                    }
                />
            </section>

            {state.expenses.length > 0 && (
                <section className={styles.card}>
                    <h2 className={styles.sectionTitle}>Expenses</h2>
                    <ExpenseList
                        expenses={state.expenses}
                        people={state.people}
                        onRemove={id => dispatch({type: 'REMOVE_EXPENSE', id})}
                    />
                </section>
            )}

            <ResultsPanel state={state} />
        </main>
    );
};

export default SplitterApp;
