import React, {useMemo} from 'react';
import type {AppState} from '../_lib/types';
import type {ExpenseBreakdown, Transfer} from '../_lib/settlement';
import {indexPeople, nameFrom} from '../_lib/people';
import {formatMoney, formatSignedMoney} from '../_lib/money';
import {payerCoversOthers} from '../_lib/split';
import styles from '../splitter.module.css';

type Props = {
    state: AppState;
    totalCents: number;
    balances: Map<string, number>;
    transfers: Transfer[];
    breakdowns: ExpenseBreakdown[];
};

const Formula: React.FC<{children: React.ReactNode; ariaLabel: string}> = ({
    children,
    ariaLabel,
}) => (
    <div className={styles.formula} role="math" aria-label={ariaLabel}>
        {children}
    </div>
);

const CalculationSteps: React.FC<Props> = ({
    state,
    totalCents,
    balances,
    transfers,
    breakdowns,
}) => {
    const peopleIndex = useMemo(() => indexPeople(state.people), [state.people]);
    const nameOf = (id: string) => nameFrom(peopleIndex, id);
    const currency = state.currency;

    const paid = useMemo(() => {
        const paidMap = new Map<string, number>();
        for (const p of state.people) paidMap.set(p.id, 0);
        for (const {expense} of breakdowns) {
            paidMap.set(expense.paidBy, (paidMap.get(expense.paidBy) ?? 0) + expense.cents);
        }
        return paidMap;
    }, [state.people, breakdowns]);

    const obligation = useMemo(() => {
        const map = new Map<string, number>();
        for (const p of state.people) map.set(p.id, 0);
        for (const {shares} of breakdowns) {
            for (const [id, cents] of shares) {
                map.set(id, (map.get(id) ?? 0) + cents);
            }
        }
        return map;
    }, [state.people, breakdowns]);

    const expenseTerms = breakdowns
        .map(b => formatMoney(b.expense.cents, currency))
        .join(' + ');

    return (
        <div className={styles.calcBlock}>
            <p className={styles.muted}>
                Each expense is allocated to its participants (equal, shares, percent, or
                exact amounts) in integer cents. Balance = paid − obligation. Positive means
                owed money; negative means they owe.
            </p>

            <h4 className={styles.calcHeading}>Formulas</h4>
            <div className={styles.formulaList}>
                <Formula ariaLabel="Total T equals the sum of all expense amounts">
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                        <mrow>
                            <mi>T</mi>
                            <mo>=</mo>
                            <munderover>
                                <mo>∑</mo>
                                <mrow>
                                    <mi>i</mi>
                                    <mo>=</mo>
                                    <mn>1</mn>
                                </mrow>
                                <mi>m</mi>
                            </munderover>
                            <msub>
                                <mi>e</mi>
                                <mi>i</mi>
                            </msub>
                        </mrow>
                    </math>
                </Formula>
                <Formula ariaLabel="For an equal split, share is floor of expense over participants">
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                        <mrow>
                            <msub>
                                <mi>S</mi>
                                <mi>p</mi>
                            </msub>
                            <mo>=</mo>
                            <mrow>
                                <mo fence="true" stretchy="false">⌊</mo>
                                <mfrac>
                                    <msub>
                                        <mi>e</mi>
                                        <mi>i</mi>
                                    </msub>
                                    <msub>
                                        <mi>N</mi>
                                        <mi>i</mi>
                                    </msub>
                                </mfrac>
                                <mo fence="true" stretchy="false">⌋</mo>
                            </mrow>
                            <mtext>&nbsp;(+ remainder cents)</mtext>
                        </mrow>
                    </math>
                    <span className={styles.formulaCaption}>
                        Unequal modes use weights / percents (largest remainder) or exact
                        cent amounts. Obligation is the sum of shares across expenses.
                    </span>
                </Formula>
                <Formula ariaLabel="Balance equals amount paid minus total obligation">
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                        <mrow>
                            <msub>
                                <mi>B</mi>
                                <mi>p</mi>
                            </msub>
                            <mo>=</mo>
                            <msub>
                                <mi>P</mi>
                                <mi>p</mi>
                            </msub>
                            <mo>−</mo>
                            <msub>
                                <mi>O</mi>
                                <mi>p</mi>
                            </msub>
                        </mrow>
                    </math>
                </Formula>
            </div>

            <h4 className={styles.calcHeading}>Calculation steps</h4>
            <ol className={styles.calcSteps}>
                <li>
                    <span className={styles.calcStepLabel}>Total spent</span>
                    <code className={styles.calcInline}>
                        T = {expenseTerms} = {formatMoney(totalCents, currency)}
                    </code>
                </li>
                <li>
                    <span className={styles.calcStepLabel}>Per-expense shares</span>
                    <ul className={styles.calcSubList}>
                        {breakdowns.map(({expense, shares}) => {
                            const label = expense.description || 'Untitled expense';
                            const parts = [...shares.entries()]
                                .map(
                                    ([id, cents]) =>
                                        `${nameOf(id)} ${formatMoney(cents, currency)}`,
                                )
                                .join(', ');
                            return (
                                <li key={expense.id}>
                                    <code className={styles.calcInline}>
                                        {label} ({formatMoney(expense.cents, currency)},{' '}
                                        {expense.split.mode}
                                        {payerCoversOthers(expense) ? ', payer covers' : ''}):{' '}
                                        {parts}
                                    </code>
                                </li>
                            );
                        })}
                    </ul>
                </li>
                <li>
                    <span className={styles.calcStepLabel}>
                        Balance (paid − obligation)
                    </span>
                    <ul className={styles.calcSubList}>
                        {state.people.map(p => {
                            const paidAmt = paid.get(p.id) ?? 0;
                            const owedAmt = obligation.get(p.id) ?? 0;
                            const net = balances.get(p.id) ?? 0;
                            return (
                                <li key={p.id}>
                                    <code className={styles.calcInline}>
                                        B<sub>{p.name}</sub> = {formatMoney(paidAmt, currency)} −{' '}
                                        {formatMoney(owedAmt, currency)} ={' '}
                                        {formatSignedMoney(net, currency)}
                                    </code>
                                </li>
                            );
                        })}
                    </ul>
                </li>
                <li>
                    <span className={styles.calcStepLabel}>Transfers</span>
                    {transfers.length === 0 ? (
                        <span className={styles.calcNote}>
                            All balances are zero, so no transfers are needed.
                        </span>
                    ) : (
                        <>
                            <span className={styles.calcNote}>
                                Match largest debtors with largest creditors until everyone
                                is settled (at most N − 1 transfers).
                            </span>
                            <ul className={styles.calcSubList}>
                                {transfers.map(tr => (
                                    <li key={`${tr.from}-${tr.to}-${tr.cents}`}>
                                        <code className={styles.calcInline}>
                                            {nameOf(tr.from)} → {nameOf(tr.to)}:{' '}
                                            {formatMoney(tr.cents, currency)}
                                        </code>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </li>
            </ol>
        </div>
    );
};

export default CalculationSteps;
