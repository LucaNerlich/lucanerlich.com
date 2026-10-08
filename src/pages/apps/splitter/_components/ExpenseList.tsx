import React, {useMemo, useState} from 'react';
import type {Currency, Expense, ExpenseInput, Person} from '../_lib/types';
import {indexPeople, nameFrom} from '../_lib/people';
import {amountExample, centsToInput, currencySymbol, formatMoney, toCents} from '../_lib/money';
import {validateSplit} from '../_lib/split';
import {payerCoversOthers} from '../_lib/split';
import type {Messages} from '../_lib/messages';
import SplitFields, {buildSplit, draftFromExpense, type SplitDraft} from './SplitFields';
import styles from '../splitter.module.css';

type Props = {
    expenses: Expense[];
    people: Person[];
    currency: Currency;
    messages: Messages;
    onRemove: (id: string) => void;
    onDuplicate: (id: string) => void;
    onUpdate: (id: string, expense: ExpenseInput) => void;
};

const ExpenseList: React.FC<Props> = ({
    expenses,
    people,
    currency,
    messages,
    onRemove,
    onDuplicate,
    onUpdate,
}) => {
    const peopleIndex = useMemo(() => indexPeople(people), [people]);
    const nameOf = (id: string) => nameFrom(peopleIndex, id);
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th className={styles.numCell}>Amount</th>
                        <th>Paid by</th>
                        <th>Split</th>
                        <th aria-label="Actions" />
                    </tr>
                </thead>
                <tbody>
                    {expenses.map(e => {
                        const label = e.description || 'Untitled expense';
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
                                            onClick={() =>
                                                setEditingId(editingId === e.id ? null : e.id)
                                            }
                                        >
                                            {messages.t('edit')}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.linkButton}
                                            onClick={() => onDuplicate(e.id)}
                                        >
                                            {messages.t('duplicate')}
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.chipRemove}
                                            onClick={() => onRemove(e.id)}
                                            aria-label={`Remove expense ${label}`}
                                            title={messages.t('remove')}
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                                {editingId === e.id && (
                                    <tr>
                                        <td colSpan={5}>
                                            <ExpenseEditor
                                                expense={e}
                                                people={people}
                                                currency={currency}
                                                messages={messages}
                                                onCancel={() => setEditingId(null)}
                                                onSave={input => {
                                                    onUpdate(e.id, input);
                                                    setEditingId(null);
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
    const [error, setError] = useState<string | null>(null);

    const save = (e: React.FormEvent) => {
        e.preventDefault();
        const cents = toCents(amount);
        if (cents === null || cents <= 0) {
            setError(`Enter an amount like ${amountExample(currency)}.`);
            return;
        }
        const {split, error: buildError} = buildSplit(draft);
        if (buildError) {
            setError(buildError);
            return;
        }
        const splitError = validateSplit(split, draft.participants, cents);
        if (splitError) {
            setError(splitError);
            return;
        }
        onSave({
            description: description.trim(),
            cents,
            paidBy,
            participants: draft.participants,
            split,
        });
    };

    return (
        <form onSubmit={save} className={styles.expenseEditor}>
            <div className={styles.expenseFormGrid}>
                <label className={styles.fieldLabel}>
                    <span>Description</span>
                    <input
                        className={styles.input}
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    <span>Amount ({currencySymbol(currency)})</span>
                    <input
                        className={styles.input}
                        value={amount}
                        inputMode="decimal"
                        onChange={e => setAmount(e.target.value)}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    <span>Paid by</span>
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
            {error && <p className={styles.error}>{error}</p>}
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
