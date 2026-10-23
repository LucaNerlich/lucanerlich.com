import React, {useMemo, useRef, useState} from 'react';
import type {Action, AppState} from './_lib/types';
import {emptyState} from './_lib/types';
import {applyAction, expensesAffectedByRemoval, expensesDeletedByRemoval} from './_lib/model';
import {buildShareUrl, decodeState, encodeState} from './_lib/urlState';
import {localStore, queryStore, useUrlState} from './_lib/useUrlState';
import {demoState} from './_lib/demo';
import {createMessages} from './_lib/messages';
import PeopleManager from './_components/PeopleManager';
import ExpenseForm from './_components/ExpenseForm';
import ExpenseList from './_components/ExpenseList';
import ResultsPanel from './_components/ResultsPanel';
import SessionBar from './_components/SessionBar';
import styles from './splitter.module.css';

const SplitterApp: React.FC = () => {
    const messages = useMemo(() => createMessages(), []);
    const {t} = messages;
    const [state, dispatch] = useUrlState<AppState, Action>({
        reducer: applyAction,
        init: emptyState,
        codec: {encode: encodeState, decode: decodeState},
        hydrate: decoded => ({type: 'HYDRATE', state: decoded}),
        // Query param (`?s=`) so chat apps that truncate at `#` keep the payload.
        // queryStore still reads legacy `#…` links.
        store: queryStore(),
        fallbackStore: localStore('splitter:v1'),
    });
    const [copied, setCopied] = useState(false);
    // The expenses section unmounts with its last row; focus lands here instead.
    const addExpenseHeadingRef = useRef<HTMLHeadingElement>(null);
    const lastPaidBy = state.expenses[state.expenses.length - 1]?.paidBy;

    // Returns whether the removal actually happened, so the list only moves
    // focus when the confirm was accepted.
    const handleRemovePerson = (id: string): boolean => {
        const person = state.people.find(p => p.id === id);
        if (!person) return false;
        // Warn about the whole cascade: paid expenses are deleted, the ones
        // the person only joined are re-split.
        const affected = expensesAffectedByRemoval(state, id);
        if (affected.length > 0) {
            const deleted = expensesDeletedByRemoval(state, id).length;
            const resplit = affected.length - deleted;
            const count = (
                one: Parameters<typeof t>[0],
                many: Parameters<typeof t>[0],
                n: number,
            ): string => n === 1 ? t(one) : t(many).replace('{count}', String(n));
            const parts = [
                deleted > 0 ? count('removePersonPaidDeletedOne', 'removePersonPaidDeleted', deleted) : '',
                resplit > 0 ? count('removePersonJoinedResplitOne', 'removePersonJoinedResplit', resplit) : '',
            ].filter(Boolean);
            const ok = window.confirm(
                t('removePersonConfirm')
                    .replace('{parts}', () => parts.join(t('listJoin')))
                    .replace('{name}', () => person.name),
            );
            if (!ok) return false;
        }
        dispatch({type: 'REMOVE_PERSON', id});
        return true;
    };

    const handleCopyLink = async () => {
        let shareUrl: string;
        try {
            // Always mint a `?s=` link (never `#…`) so WhatsApp/iMessage keep
            // the full session when the URL becomes a hyperlink.
            shareUrl = await buildShareUrl(window.location.href, state);
        } catch {
            // Without a payload there is nothing shareable to offer.
            window.alert(t('copyLinkFailed'));
            return;
        }
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard blocked: offer the URL for manual copying instead of
            // leaving the button looking dead.
            window.prompt(t('copyLink'), shareUrl);
        }
    };

    const handleReset = () => {
        if (state.people.length === 0 && state.expenses.length === 0) return;
        const ok = window.confirm(t('resetConfirm'));
        if (ok) dispatch({type: 'HYDRATE', state: emptyState()});
    };

    const handleLoadDemo = () => {
        if (state.people.length > 0 || state.expenses.length > 0) {
            const ok = window.confirm(t('loadDemoConfirm'));
            if (!ok) return;
        }
        dispatch({type: 'HYDRATE', state: demoState()});
    };

    return (
        <main className={styles.app}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('title')}</h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>
                <div className={styles.headerActions}>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={handleCopyLink}
                    >
                        {copied ? t('copied') : t('copyLink')}
                    </button>
                    <button
                        type="button"
                        className={styles.linkButton}
                        onClick={handleReset}
                    >
                        {t('reset')}
                    </button>
                </div>
            </header>

            <section className={`${styles.card} ${styles.noPrint}`}>
                <SessionBar
                    state={state}
                    messages={messages}
                    onCurrency={currency => dispatch({type: 'SET_CURRENCY', currency})}
                    onImport={next => dispatch({type: 'HYDRATE', state: next})}
                    onLoadDemo={handleLoadDemo}
                />
            </section>

            <section className={`${styles.card} ${styles.noPrint}`}>
                <h2 className={styles.sectionTitle}>{t('people')}</h2>
                <PeopleManager
                    people={state.people}
                    messages={messages}
                    onAdd={name => dispatch({type: 'ADD_PERSON', name})}
                    onRemove={handleRemovePerson}
                    onRename={(id, name) => dispatch({type: 'RENAME_PERSON', id, name})}
                />
            </section>

            <section className={`${styles.card} ${styles.noPrint}`}>
                <h2 ref={addExpenseHeadingRef} tabIndex={-1} className={styles.sectionTitle}>
                    {t('addExpense')}
                </h2>
                <ExpenseForm
                    people={state.people}
                    currency={state.currency}
                    lastPaidBy={lastPaidBy}
                    messages={messages}
                    onAdd={expense => dispatch({type: 'ADD_EXPENSE', expense})}
                />
            </section>

            {state.expenses.length > 0 && (
                <section className={`${styles.card} ${styles.noPrint}`}>
                    <h2 className={styles.sectionTitle}>{t('expenses')}</h2>
                    <ExpenseList
                        expenses={state.expenses}
                        people={state.people}
                        currency={state.currency}
                        messages={messages}
                        onRemove={id => dispatch({type: 'REMOVE_EXPENSE', id})}
                        onDuplicate={id => dispatch({type: 'DUPLICATE_EXPENSE', id})}
                        onUpdate={(id, expense) =>
                            dispatch({type: 'UPDATE_EXPENSE', id, expense})
                        }
                        emptyFocusRef={addExpenseHeadingRef}
                    />
                </section>
            )}

            <ResultsPanel
                state={state}
                messages={messages}
                onTogglePaid={key => dispatch({type: 'TOGGLE_TRANSFER_PAID', key})}
            />
        </main>
    );
};

export default SplitterApp;
