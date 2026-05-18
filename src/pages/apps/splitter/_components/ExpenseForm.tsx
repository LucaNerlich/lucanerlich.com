import React, {useEffect, useState} from 'react';
import type {Currency, Person} from '../_lib/types';
import {toCents} from '../_lib/money';
import styles from '../splitter.module.css';

type Props = {
    people: Person[];
    currency: Currency;
    onAdd: (description: string, cents: number, paidBy: string) => void;
};

const ExpenseForm: React.FC<Props> = ({people, currency, onAdd}) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [paidBy, setPaidBy] = useState<string>(people[0]?.id ?? '');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!people.some(p => p.id === paidBy)) {
            setPaidBy(people[0]?.id ?? '');
        }
    }, [people, paidBy]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const trimmed = description.trim();
        if (!trimmed) {
            setError('Description required.');
            return;
        }
        const cents = toCents(amount);
        if (cents === null || cents <= 0) {
            setError('Amount must be greater than 0.');
            return;
        }
        if (!paidBy) {
            setError('Choose who paid.');
            return;
        }
        onAdd(trimmed, cents, paidBy);
        setDescription('');
        setAmount('');
    };

    const disabled = people.length === 0;

    return (
        <form onSubmit={submit} className={styles.expenseForm}>
            <div className={styles.expenseFormGrid}>
                <label className={styles.fieldLabel}>
                    <span>Description</span>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Dinner, taxi, groceries…"
                        disabled={disabled}
                        className={styles.input}
                    />
                </label>
                <label className={styles.fieldLabel}>
                    <span>Amount ({currency})</span>
                    <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        inputMode="decimal"
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
                    >
                        {people.length === 0 ? (
                            <option value="">— add people first —</option>
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
                <button type="submit" className={styles.primaryButton} disabled={disabled}>
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
