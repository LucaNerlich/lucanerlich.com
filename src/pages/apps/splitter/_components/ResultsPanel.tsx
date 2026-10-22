import React, {useMemo, useState} from 'react';
import type {AppState} from '../_lib/types';
import {transferKey} from '../_lib/types';
import {summarize} from '../_lib/settlement';
import {indexPeople, nameFrom} from '../_lib/people';
import {formatMoney, formatSignedMoney} from '../_lib/money';
import {transfersAsText} from '../_lib/io';
import type {Messages} from '../_lib/messages';
import CalculationSteps from './CalculationSteps';
import styles from '../splitter.module.css';

type Props = {
    state: AppState;
    messages: Messages;
    onTogglePaid: (key: string) => void;
};

const ResultsPanel: React.FC<Props> = ({state, messages, onTogglePaid}) => {
    const {balances, transfers, totalCents, perPersonCents, breakdowns, paid, owed} = useMemo(
        () => summarize(state),
        [state],
    );
    const peopleIndex = useMemo(() => indexPeople(state.people), [state.people]);
    const [copied, setCopied] = useState(false);
    const {t} = messages;

    if (state.people.length < 2 || state.expenses.length === 0) {
        return (
            <section className={styles.card}>
                <h2 className={styles.sectionTitle}>{t('settlement')}</h2>
                <p className={styles.muted}>
                    {state.people.length < 2
                        ? t('emptyTwoPeople')
                        : t('emptyAddExpense')}
                </p>
            </section>
        );
    }

    const nameOf = (id: string) => nameFrom(peopleIndex, id);

    const copyTransfers = async () => {
        const text = transfersAsText(state, transfers, state.currency);
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // Clipboard blocked: show the text so the action is not a no-op.
            window.prompt(t('copyTransfers'), text);
        }
    };

    return (
        <section className={`${styles.card} ${styles.printSettlement}`}>
            <h2 className={styles.sectionTitle}>{t('settlement')}</h2>
            <div className={styles.summary}>
                <div>
                    <span className={styles.summaryLabel}>{t('totalSpent')}</span>
                    <span className={styles.summaryValue}>
                        {formatMoney(totalCents, state.currency)}
                    </span>
                </div>
                <div>
                    <span className={styles.summaryLabel}>{t('perPerson')}</span>
                    <span className={styles.summaryValue}>
                        {formatMoney(perPersonCents, state.currency)}
                    </span>
                </div>
            </div>

            <h3 className={styles.subSectionTitle}>{t('balances')}</h3>
            <ul className={styles.balanceList}>
                {state.people.map(p => {
                    const net = balances.get(p.id) ?? 0;
                    const cls =
                        net > 0
                            ? styles.balancePositive
                            : net < 0
                              ? styles.balanceNegative
                              : styles.balanceZero;
                    return (
                        <li key={p.id} className={styles.balanceRow}>
                            <span>{p.name}</span>
                            <span className={cls}>
                                {formatSignedMoney(net, state.currency)}
                            </span>
                        </li>
                    );
                })}
            </ul>

            <div className={styles.transferHeader}>
                <h3 className={styles.subSectionTitle}>{t('transfers')}</h3>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={copyTransfers}
                >
                    {copied ? t('copied') : t('copyTransfers')}
                </button>
            </div>
            {transfers.length === 0 ? (
                <p className={styles.muted}>{t('everyoneSettled')}</p>
            ) : (
                <ul className={styles.transferList}>
                    {transfers.map(tr => {
                        const key = transferKey(tr.from, tr.to, tr.cents);
                        const paid = state.paidTransferKeys.includes(key);
                        return (
                            <li
                                key={key}
                                className={`${styles.transferRow} ${paid ? styles.transferPaid : ''}`}
                            >
                                <label className={styles.paidCheck}>
                                    <input
                                        type="checkbox"
                                        checked={paid}
                                        onChange={() => onTogglePaid(key)}
                                        aria-label={`${t('markPaid')}: ${nameOf(tr.from)} → ${nameOf(tr.to)}`}
                                    />
                                    <span className={styles.paidLabel}>{t('markPaid')}</span>
                                </label>
                                <span className={styles.transferFrom}>{nameOf(tr.from)}</span>
                                <span className={styles.transferArrow} aria-hidden>
                                    →
                                </span>
                                <span className={styles.transferTo}>{nameOf(tr.to)}</span>
                                <span className={styles.transferAmount}>
                                    {formatMoney(tr.cents, state.currency)}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}

            <details className={styles.calcDetails}>
                <summary className={styles.calcSummary}>{t('howMathWorks')}</summary>
                <CalculationSteps
                    state={state}
                    totalCents={totalCents}
                    balances={balances}
                    paid={paid}
                    owed={owed}
                    transfers={transfers}
                    breakdowns={breakdowns}
                    messages={messages}
                />
            </details>
        </section>
    );
};

export default ResultsPanel;
