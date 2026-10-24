import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {Currency, Expense, ExpenseInput, Person} from '../_lib/types';
import {indexPeople, nameFrom} from '../_lib/people';
import {centsToInput, currencySymbol, formatMoney} from '../_lib/money';
import {payerCoversOthers} from '../_lib/split';
import {buildExpenseInput, type SplitDraft} from '../_lib/expenseInput';
import type {Messages, MessageError} from '../_lib/messages';
import {formatError} from '../_lib/messages';
import SplitFields from './SplitFields';
import {draftFromExpense, draftFromPeople} from '../_lib/splitDraft';
import styles from '../splitter.module.css';

type Props = {
    expenses: Expense[];
    people: Person[];
    currency: Currency;
    messages: Messages;
    /** When false, mutations no-op upstream — keep controls disabled. */
    ready: boolean;
    onRemove: (id: string) => void;
    onDuplicate: (id: string) => void;
    onUpdate: (id: string, expense: ExpenseInput) => void;
    /** Always-mounted target for focus when the last row goes. */
    emptyFocusRef?: React.RefObject<HTMLHeadingElement | null>;
};

const ExpenseList: React.FC<Props> = ({
    expenses,
    people,
    currency,
    messages,
    ready,
    onRemove,
    onDuplicate,
    onUpdate,
    emptyFocusRef,
}) => {
    const peopleIndex = useMemo(() => indexPeople(people), [people]);
    const nameOf = (id: string) => nameFrom(peopleIndex, id);
    const [editingId, setEditingId] = useState<string | null>(null);
    const openerRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const rowRefs = useRef(new Map<string, HTMLButtonElement>());

    // Closing the editor unmounts the focused control; hand focus back to the
    // row button that opened it instead of dropping it on <body>.
    const closeEditor = () => {
        openerRef.current?.focus();
        setEditingId(null);
    };

    // Deleting removes the focused row too, so focus moves to the next row's
    // Edit button (or the previous one, or the list itself for the last row).
    const remove = (expense: Expense): void => {
        if (!ready) return;
        const label = expense.description || messages.t('untitledExpense');
        if (!window.confirm(messages.t('removeExpenseConfirm').replace('{name}', () => label))) {
            return;
        }
        const index = expenses.findIndex(e => e.id === expense.id);
        const survivor = expenses[index + 1] ?? expenses[index - 1];
        onRemove(expense.id);
        const target = survivor ? rowRefs.current.get(survivor.id) : undefined;
        // The list unmounts with its last row, so that case needs a target
        // outside this section.
        (target ?? emptyFocusRef?.current ?? listRef.current)?.focus();
    };

    return (
        <div
            className={styles.tableWrap}
            ref={listRef}
            tabIndex={-1}
            role="group"
            aria-label={messages.t('expenses')}
        >
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>{messages.t('description')}</th>
                        <th className={styles.numCell}>{messages.t('amount')}</th>
                        <th>{messages.t('paidBy')}</th>
                        <th>{messages.t('split')}</th>
                        <th aria-label={messages.t('actions')} />
                    </tr>
                </thead>
                <tbody>
                    {expenses.map(e => {
                        const label = e.description || messages.t('untitledExpense');
                        const editorId = `expense-editor-${e.id}`;
                        const participantNames = e.participants
                            .map(id => nameOf(id))
                            .join(', ');
                        const splitKeys = {
                            equal: 'splitEqual',
                            shares: 'splitShares',
                            percent: 'splitPercent',
                            exact: 'splitExact',
                        } as const;
                        const splitLabel = `${messages.t(splitKeys[e.split.mode])} · ${participantNames}`;
                        return (
                            <React.Fragment key={e.id}>
                                <tr>
                                    <td className={e.description ? undefined : styles.muted}>
                                        {label}
                                        {payerCoversOthers(e) && (
                                            <div className={styles.calcNote}>
                                                {messages.t('payerCoversNote')}
                                            </div>
                                        )}
                                    </td>
                                    <td className={styles.numCell}>
                                        {formatMoney(e.cents, currency)}
                                    </td>
                                    <td>{nameOf(e.paidBy)}</td>
                                    <td className={styles.splitCell}>{splitLabel}</td>
                                    <td className={styles.actionCell}>
                                        <button
                                            type="button"
                                            className={styles.linkButton}
                                            ref={el => {
                                                if (el) rowRefs.current.set(e.id, el);
                                                else rowRefs.current.delete(e.id);
                                            }}
                                            disabled={!ready}
                                            onClick={event => {
                                                openerRef.current = event.currentTarget;
                                                setEditingId(editingId === e.id ? null : e.id);
                                            }}
                                            aria-expanded={editingId === e.id}
                                            aria-controls={editingId === e.id ? editorId : undefined}
                                            aria-label={messages
                                                .t('editExpense')
                                                .replace('{name}', () => label)}
                                        >
                                            {messages.t('edit')}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.linkButton}
                                            disabled={!ready}
                                            onClick={() => onDuplicate(e.id)}
                                            aria-label={messages
                                                .t('duplicateExpense')
                                                .replace('{name}', () => label)}
                                        >
                                            {messages.t('duplicate')}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.chipRemove}
                                            disabled={!ready}
                                            onClick={() => remove(e)}
                                            aria-label={messages.t('removeExpense').replace('{name}', () => label)}
                                            title={messages.t('remove')}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                                {editingId === e.id && (
                                    <tr id={editorId}>
                                        <td colSpan={5}>
                                            <ExpenseEditor
                                                expense={e}
                                                people={people}
                                                currency={currency}
                                                messages={messages}
                                                onCancel={closeEditor}
                                                onSave={input => {
                                                    onUpdate(e.id, input);
                                                    closeEditor();
                                                }}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

type EditorProps = {
    expense: Expense;
    people: Person[];
    currency: Currency;
    messages: Messages;
    onSave: (expense: ExpenseInput) => void;
    onCancel: () => void;
};

const ExpenseEditor: React.FC<EditorProps> = ({
    expense,
    people,
    currency,
    messages,
    onSave,
    onCancel,
}) => {
    const [description, setDescription] = useState(expense.description);
    const [amount, setAmount] = useState(centsToInput(expense.cents));
    const [paidBy, setPaidBy] = useState(expense.paidBy);
    const [draft, setDraft] = useState<SplitDraft>(() => draftFromExpense(people, expense));
    const [error, setError] = useState<MessageError | null>(null);

    // The people list can change while this editor is open (for example a
    // participant is removed). Drop ids that no longer exist and keep the
    // user's in-progress values for the ones that do.
    useEffect(() => {
        setDraft(prev => draftFromPeople(people, prev));
    }, [people]);

    useEffect(() => {
        if (!people.some(p => p.id === paidBy)) {
            setPaidBy(people[0]?.id ?? '');
        }
    }, [people, paidBy]);

    const save = (e: React.FormEvent) => {
        e.preventDefault();
        const {input, error: inputError} = buildExpenseInput(
            draft,
            description,
            amount,
            paidBy,
            currency,
        );
        if (!input) {
            setError(inputError);
            return;
        }
        onSave(input);
    };

    return (
        <form onSubmit={save} className={styles.expenseEditor}>
            <div className={styles.expenseFormGrid}>
                <label className={styles.fieldLabel}>
                    <span>{messages.t('description')}</span>
                    <input
                        className={styles.input}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    <span>{messages.t('amount')} ({currencySymbol(currency)})</span>
                    <input
                        className={styles.input}
                        value={amount}
                        inputMode="decimal"
                        onChange={e => setAmount(e.target.value)}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    <span>{messages.t('paidBy')}</span>
                    <select
                        className={styles.select}
                        value={paidBy}
                        onChange={e => setPaidBy(e.target.value)}
                    >
                        {people.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <SplitFields
                people={people}
                paidBy={paidBy}
                currency={currency}
                draft={draft}
                onChange={setDraft}
                messages={messages}
            />
            {error && <p className={styles.error} role="alert">{formatError(messages, error)}</p>}
            <div className={styles.headerActions}>
                <button type="submit" className={styles.primaryButton}>
                    {messages.t('save')}
                </button>
                <button type="button" className={styles.secondaryButton} onClick={onCancel}>
                    {messages.t('cancel')}
                </button>
            </div>
        </form>
    );
};

export default ExpenseList;
