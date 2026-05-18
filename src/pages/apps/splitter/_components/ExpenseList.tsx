import React from 'react';
import type {Expense, Person} from '../_lib/types';
import {formatMoney} from '../_lib/money';
import styles from '../splitter.module.css';

type Props = {
    expenses: Expense[];
    people: Person[];
    onRemove: (id: string) => void;
};

const ExpenseList: React.FC<Props> = ({expenses, people, onRemove}) => {
    const nameOf = (id: string) => people.find(p => p.id === id)?.name ?? '—';

    return (
        <div className={styles.tableWrap}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Description</th>
                        <th className={styles.numCell}>Amount</th>
                        <th>Paid by</th>
                        <th aria-label="Remove" />
                    </tr>
                </thead>
                <tbody>
                    {expenses.map(e => (
                        <tr key={e.id}>
                            <td>{e.description}</td>
                            <td className={styles.numCell}>{formatMoney(e.cents)}</td>
                            <td>{nameOf(e.paidBy)}</td>
                            <td className={styles.actionCell}>
                                <button
                                    type="button"
                                    className={styles.chipRemove}
                                    onClick={() => onRemove(e.id)}
                                    aria-label={`Remove expense ${e.description}`}
                                    title="Remove expense"
                                >
                                    ×
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExpenseList;
