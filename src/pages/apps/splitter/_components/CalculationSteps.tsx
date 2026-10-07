import React, {useMemo} from 'react';
import type {AppState} from '../_lib/types';
import {fairShares, type Transfer} from '../_lib/settlement';
import {indexPeople, nameFrom} from '../_lib/people';
import {formatMoney, formatSignedMoney} from '../_lib/money';
import styles from '../splitter.module.css';

type Props = {
    state: AppState;
    totalCents: number;
    balances: Map<string, number>;
    transfers: Transfer[];
};

const Formula: React.FC<{children: React.ReactNode; ariaLabel: string}> = ({
    children,
    ariaLabel,
}) => (
    <div className={styles.formula} role="math" aria-label={ariaLabel}>
        {children}
    </div>
);

const CalculationSteps: React.FC<Props> = ({state, totalCents, balances, transfers}) => {
    const peopleIndex = useMemo(() => indexPeople(state.people), [state.people]);
    const nameOf = (id: string) => nameFrom(peopleIndex, id);

    const {N, baseShare, remainder, shares, paid} = useMemo(() => {
        const collator = new Intl.Collator('en', {sensitivity: 'variant'});
        const sortedIds = [...state.people.map(p => p.id)].sort(collator.compare);
        const n = sortedIds.length;
        const base = n > 0 ? Math.floor(totalCents / n) : 0;
        const rem = totalCents - base * n;
        const shareMap = fairShares(totalCents, sortedIds);

        const paidMap = new Map<string, number>();
        for (const p of state.people) paidMap.set(p.id, 0);
        for (const e of state.expenses) {
            if (paidMap.has(e.paidBy)) {
                paidMap.set(e.paidBy, (paidMap.get(e.paidBy) ?? 0) + e.cents);
            }
        }

        return {
            N: n,
            baseShare: base,
            remainder: rem,
            shares: shareMap,
            paid: paidMap,
        };
    }, [state, totalCents]);

    const expenseTerms = state.expenses.map(e => formatMoney(e.cents)).join(' + ');

    return (
        <div className={styles.calcBlock}>
            <h3 className={styles.subSectionTitle}>How the math works</h3>
            <p className={styles.muted}>
                Equal split in integer cents. Positive balance means owed money;
                negative means they owe.
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
                <Formula ariaLabel="Base share s equals the floor of T divided by N">
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                        <mrow>
                            <mi>s</mi>
                            <mo>=</mo>
                            <mrow>
                                <mo>⌊</mo>
                                <mfrac>
                                    <mi>T</mi>
                                    <mi>N</mi>
                                </mfrac>
                                <mo>⌋</mo>
                            </mrow>
                            <mo>,</mo>
                            <mi>r</mi>
                            <mo>=</mo>
                            <mi>T</mi>
                            <mo>−</mo>
                            <mi>s</mi>
                            <mo>⋅</mo>
                            <mi>N</mi>
                        </mrow>
                    </math>
                </Formula>
                <Formula ariaLabel="Fair share S of person p equals s, plus one extra cent for each of the first r people by sorted id">
                    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block">
                        <mrow>
                            <msub>
                                <mi>S</mi>
                                <mi>p</mi>
                            </msub>
                            <mo>=</mo>
                            <mi>s</mi>
                            <mo>+</mo>
                            <mrow>
                                <mo>[</mo>
                                <mi>p</mi>
                                <mo>∈</mo>
                                <msub>
                                    <mi>R</mi>
                                    <mi>r</mi>
                                </msub>
                                <mo>]</mo>
                            </mrow>
                        </mrow>
                    </math>
                    <span className={styles.formulaCaption}>
                        <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">
                            <msub>
                                <mi>R</mi>
                                <mi>r</mi>
                            </msub>
                        </math>
                        {' '}
                        = first <em>r</em> person ids in sorted order;{' '}
                        <math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">
                            <mrow>
                                <mo>[</mo>
                                <mi>⋅</mi>
                                <mo>]</mo>
                            </mrow>
                        </math>
                        {' '}
                        is 1 when true and 0 otherwise (Iverson bracket).
                    </span>
                </Formula>
                <Formula ariaLabel="Balance B of person p equals amount paid minus fair share">
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
                                <mi>S</mi>
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
                        T = {expenseTerms} = {formatMoney(totalCents)}
                    </code>
                </li>
                <li>
                    <span className={styles.calcStepLabel}>People and base share</span>
                    <code className={styles.calcInline}>
                        N = {N}
                    </code>
                    <code className={styles.calcInline}>
                        s = ⌊{totalCents} / {N}⌋ = {baseShare} cents (= {formatMoney(baseShare)})
                    </code>
                    <code className={styles.calcInline}>
                        r = {totalCents} − {baseShare}⋅{N} = {remainder}
                        {remainder === 1 ? ' cent' : ' cents'}
                    </code>
                    {remainder > 0 && (
                        <span className={styles.calcNote}>
                            The leftover {remainder === 1 ? 'cent goes' : 'cents go'} to the
                            first {remainder} {remainder === 1 ? 'person' : 'people'} in
                            id-sorted order so shares sum to T exactly.
                        </span>
                    )}
                </li>
                <li>
                    <span className={styles.calcStepLabel}>Fair share per person</span>
                    <ul className={styles.calcSubList}>
                        {state.people.map(p => (
                            <li key={p.id}>
                                <code className={styles.calcInline}>
                                    S<sub>{p.name}</sub> = {formatMoney(shares.get(p.id) ?? 0)}
                                </code>
                            </li>
                        ))}
                    </ul>
                </li>
                <li>
                    <span className={styles.calcStepLabel}>
                        Balance (paid − fair share)
                    </span>
                    <ul className={styles.calcSubList}>
                        {state.people.map(p => {
                            const paidAmt = paid.get(p.id) ?? 0;
                            const shareAmt = shares.get(p.id) ?? 0;
                            const net = balances.get(p.id) ?? 0;
                            return (
                                <li key={p.id}>
                                    <code className={styles.calcInline}>
                                        B<sub>{p.name}</sub> = {formatMoney(paidAmt)} −{' '}
                                        {formatMoney(shareAmt)} = {formatSignedMoney(net)}
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
                                Match largest debtors with largest creditors until
                                everyone is settled (at most N − 1 transfers).
                            </span>
                            <ul className={styles.calcSubList}>
                                {transfers.map(t => (
                                    <li key={`${t.from}-${t.to}`}>
                                        <code className={styles.calcInline}>
                                            {nameOf(t.from)} → {nameOf(t.to)}:{' '}
                                            {formatMoney(t.cents)}
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
