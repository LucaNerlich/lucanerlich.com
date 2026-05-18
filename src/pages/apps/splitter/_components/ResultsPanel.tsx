import React, {useMemo} from 'react';
import type {AppState} from '../_lib/types';
import {computeBalances, computeSettlement} from '../_lib/settlement';
import {formatMoney} from '../_lib/money';
import styles from '../splitter.module.css';

type Props = {
    state: AppState;
};

const ResultsPanel: React.FC<Props> = ({state}) => {
    const {balances, settlement, totalCents} = useMemo(() => {
        const b = computeBalances(state);
        const s = computeSettlement(b);
        const t = state.expenses.reduce((acc, e) => acc + e.cents, 0);
        return {balances: b, settlement: s, totalCents: t};
    }, [state]);

    if (state.people.length < 2 || state.expenses.length === 0) {
        return (
            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>Settlement</h2>
                <p className={styles.muted}>
                    {state.people.length < 2
                        ? 'Add at least two people to see who owes whom.'
                        : 'Add an expense to see the settlement.'}
                </p>
            </section>
        );
    }

    const nameOf = (id: string) => state.people.find(p => p.id === id)?.name ?? '—';
    const fairShare = totalCents / state.people.length;

    return (
        <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Settlement</h2>
            <div className={styles.summary}>
                <div>
                    <span className={styles.summaryLabel}>Total spent</span>
                    <span className={styles.summaryValue}>
                        {formatMoney(totalCents)}
                    </span>
                </div>
                <div>
                    <span className={styles.summaryLabel}>Per person</span>
                    <span className={styles.summaryValue}>
                        {formatMoney(Math.round(fairShare))}
                    </span>
                </div>
            </div>

            <h3 className={styles.subSectionTitle}>Balances</h3>
            <ul className={styles.balanceList}>
                {state.people.map(p => {
                    const net = balances.get(p.id) ?? 0;
                    const cls =
                        net > 0
                            ? styles.balancePositive
                            : net < 0
                              ? styles.balanceNegative
                              : styles.balanceZero;
                    const sign = net > 0 ? '+' : '';
                    return (
                        <li key={p.id} className={styles.balanceRow}>
                            <span>{p.name}</span>
                            <span className={cls}>
                                {sign}
                                {formatMoney(net)}
                            </span>
                        </li>
                    );
                })}
            </ul>

            <h3 className={styles.subSectionTitle}>Transfers</h3>
            {settlement.length === 0 ? (
                <p className={styles.muted}>Everyone is settled up.</p>
            ) : (
                <ul className={styles.transferList}>
                    {settlement.map((t, i) => (
                        <li key={i} className={styles.transferRow}>
                            <span className={styles.transferFrom}>{nameOf(t.from)}</span>
                            <span className={styles.transferArrow} aria-hidden>
                                →
                            </span>
                            <span className={styles.transferTo}>{nameOf(t.to)}</span>
                            <span className={styles.transferAmount}>
                                {formatMoney(t.cents)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default ResultsPanel;
