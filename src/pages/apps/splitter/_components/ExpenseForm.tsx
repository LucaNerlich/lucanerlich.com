import React, {useEffect, useRef, useState} from 'react';
import type {Person} from '../_lib/types';
import {toCents} from '../_lib/money';
import styles from '../splitter.module.css';

type Props = {
    people: Person[];
    onAdd: (description: string, cents: number, paidBy: string) => void;
};

const ExpenseForm: React.FC<Props> = ({people, onAdd}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState<string>(people[0]?.id ?? '');
    const [error, setError] = useState<string | null>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!people.some(p => p.id === paidBy)) {
            setPaidBy(people[0]?.id ?? '');
        }
    }, [people, paidBy]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const cents = toCents(amount);
        if (cents === null) {
            setError('Enter an amount like 12.50 or 12,50 (at most two decimals).');
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
        onAdd(description.trim(), cents, paidBy);
        setDescription('');
        setAmount('');
        descriptionRef.current?.focus();
    };

    const disabled = people.length === 0;

    return (
        <form onSubmit={submit} className={styles.expenseForm}>
            <div className={styles.expenseFormGrid}>
                <label className={styles.fieldLabel}>
                    <span>Description <span className={styles.optional}>(optional)</span></span>
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
                    <span>Amount (€)</span>
                    <input
                        type="text"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="0.00"
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
            {error && <p className={styles.error}>{error}</p>}
            <div>
                <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={disabled}
                >
                    Add expense
                </button>
                {disabled && (
                    <span className={styles.mutedInline}>Add at least one person first.</span>
                )}
            </div>
        </form>
    );
};

export default ExpenseForm;
