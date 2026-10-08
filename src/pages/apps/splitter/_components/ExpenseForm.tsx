import React, {useEffect, useRef, useState} from 'react';
import type {Currency, ExpenseInput, Person} from '../_lib/types';
import {amountExample, amountPlaceholder, currencySymbol, toCents} from '../_lib/money';
import {validateSplit} from '../_lib/split';
import type {Messages} from '../_lib/messages';
import SplitFields, {
    buildSplit,
    draftFromPeople,
    type SplitDraft,
} from './SplitFields';
import styles from '../splitter.module.css';

type Props = {
    people: Person[];
    currency: Currency;
    lastPaidBy?: string;
    messages: Messages;
    onAdd: (expense: ExpenseInput) => void;
};

const ExpenseForm: React.FC<Props> = ({
    people,
    currency,
    lastPaidBy,
    messages,
    onAdd,
}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState<string>(lastPaidBy ?? people[0]?.id ?? '');
    const [draft, setDraft] = useState<SplitDraft>(() => draftFromPeople(people));
    const [error, setError] = useState<string | null>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!people.some(p => p.id === paidBy)) {
            setPaidBy(lastPaidBy && people.some(p => p.id === lastPaidBy)
                ? lastPaidBy
                : people[0]?.id ?? '');
        }
    }, [people, paidBy, lastPaidBy]);

    useEffect(() => {
        setDraft(prev => draftFromPeople(people, prev));
    }, [people]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const cents = toCents(amount);
        if (cents === null) {
            setError(
                `Enter an amount like ${amountExample(currency)} (at most two decimals, no thousands separators).`,
            );
            return;
        }
        if (cents <= 0) {
            setError('Amount must be greater than 0.');
            return;
        }
        if (!paidBy) {
            setError('Choose who paid.');
            return;
        }
        const {split, error: splitBuildError} = buildSplit(draft);
        if (splitBuildError) {
            setError(splitBuildError);
            return;
        }
        const splitError = validateSplit(split, draft.participants, cents);
        if (splitError) {
            setError(splitError);
            return;
        }
        onAdd({
            description: description.trim(),
            cents,
            paidBy,
            participants: draft.participants,
            split,
        });
        setDescription('');
        setAmount('');
        // Keep paidBy + split draft for "same as last" speed.
        descriptionRef.current?.focus();
    };

    const disabled = people.length === 0;

    return (
        <form onSubmit={submit} className={styles.expenseForm}>
            <div className={styles.expenseFormGrid}>
                <label className={styles.fieldLabel}>
                    <span>
                        Description <span className={styles.optional}>(optional)</span>
                    </span>
                    <input
                        ref={descriptionRef}
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Dinner, taxi, groceries…"
                        disabled={disabled}
                        className={styles.input}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    <span>Amount ({currencySymbol(currency)})</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder={amountPlaceholder(currency)}
                        disabled={disabled}
                        className={styles.input}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    <span>Paid by</span>
                    <select
                        value={paidBy}
                        onChange={e => setPaidBy(e.target.value)}
                        disabled={disabled}
                        className={styles.select}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                e.currentTarget.form?.requestSubmit();
                            }
                        }}
                    >
                        {people.length === 0 ? (
                            <option value="">- add people first -</option>
                        ) : (
                            people.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))
                        )}
                    </select>
                </label>
            </div>

            {!disabled && (
                <SplitFields
                    people={people}
                    paidBy={paidBy}
                    currency={currency}
                    draft={draft}
                    onChange={setDraft}
                    messages={messages}
                />
            )}

            {error && <p className={styles.error}>{error}</p>}
            <div>
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={disabled}
                >
                    {messages.t('addExpense')}
                </button>
                {disabled && (
                    <span className={styles.mutedInline}>Add at least one person first.</span>
                )}
            </div>
        </form>
    );
};

export default ExpenseForm;
