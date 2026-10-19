import React from 'react';
import type {Currency, Person, Split} from '../_lib/types';
import type {SplitDraft} from '../_lib/expenseInput';
import {amountPlaceholder, centsToInput, currencySymbol} from '../_lib/money';
import type {Messages} from '../_lib/messages';
import styles from '../splitter.module.css';

export const draftFromPeople = (people: Person[], previous?: SplitDraft): SplitDraft => {
    const ids = people.map(p => p.id);
    const participants =
        previous?.participants.filter(id => ids.includes(id)) ??
        ids;
    const next: SplitDraft = {
        participants: participants.length > 0 ? participants : previous ? [] : ids,
        splitMode: previous?.splitMode ?? 'equal',
        weights: {},
        percents: {},
        amounts: {},
    };
    for (const id of next.participants) {
        next.weights[id] = previous?.weights[id] ?? '1';
        next.percents[id] = previous?.percents[id] ?? '';
        next.amounts[id] = previous?.amounts[id] ?? '';
    }
    if (next.splitMode === 'percent') {
        const missing = next.participants.filter(id => !previous?.percents[id]);
        if (missing.length === next.participants.length && next.participants.length > 0) {
            const each = Math.floor(10000 / next.participants.length);
            next.participants.forEach((id, index) => {
                const share = index === next.participants.length - 1
                    ? 10000 - each * index
                    : each;
                next.percents[id] = (share / 100).toFixed(2);
            });
        }
    }
    return next;
};

export const draftFromExpense = (
    people: Person[],
    expense: {
        participants: string[];
        split: Split;
        cents: number;
    },
): SplitDraft => {
    const draft = draftFromPeople(people);
    draft.participants = expense.participants.filter(id => people.some(p => p.id === id));
    draft.splitMode = expense.split.mode;
    if (expense.split.mode === 'shares') {
        for (const id of draft.participants) {
            draft.weights[id] = String(expense.split.weights[id] ?? 1);
        }
    } else if (expense.split.mode === 'percent') {
        for (const id of draft.participants) {
            draft.percents[id] = String(expense.split.percents[id] ?? 0);
        }
    } else if (expense.split.mode === 'exact') {
        for (const id of draft.participants) {
            draft.amounts[id] = centsToInput(expense.split.amounts[id] ?? 0);
        }
    }
    return draft;
};

type Props = {
    people: Person[];
    paidBy: string;
    currency: Currency;
    draft: SplitDraft;
    onChange: (draft: SplitDraft) => void;
    messages: Messages;
};

const SplitFields: React.FC<Props> = ({
    people,
    paidBy,
    currency,
    draft,
    onChange,
    messages,
}) => {
    const {t} = messages;
    const toggle = (id: string) => {
        const has = draft.participants.includes(id);
        const participants = has
            ? draft.participants.filter(x => x !== id)
            : [...draft.participants, id];
        onChange(draftFromPeople(people, {...draft, participants}));
    };

    const payerInSplit = draft.participants.includes(paidBy);

    return (
        <div className={styles.splitFields}>
            <div className={styles.fieldLabel}>
                <span>{t('participants')}</span>
                <div className={styles.participantToggles}>
                    {people.map(p => {
                        const checked = draft.participants.includes(p.id);
                        return (
                            <label key={p.id} className={styles.checkChip}>
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggle(p.id)}
                                />
                                {p.name}
                            </label>
                        );
                    })}
                </div>
                {paidBy && (
                    <span className={styles.calcNote}>
                        {payerInSplit ? t('payerInSplitNote') : t('payerCoversNote')}
                    </span>
                )}
            </div>

            <label className={styles.fieldLabel}>
                <span>{t('splitMode')}</span>
                <select
                    className={styles.select}
                    value={draft.splitMode}
                    onChange={e =>
                        onChange(draftFromPeople(people, {
                            ...draft,
                            splitMode: e.target.value as Split['mode'],
                        }))
                    }
                >
                    <option value="equal">{t('splitEqual')}</option>
                    <option value="shares">{t('splitShares')}</option>
                    <option value="percent">{t('splitPercent')}</option>
                    <option value="exact">{t('splitExact')}</option>
                </select>
            </label>

            {draft.splitMode !== 'equal' && (
                <div className={styles.splitInputs}>
                    {draft.participants.map(id => {
                        const person = people.find(p => p.id === id);
                        if (!person) return null;
                        if (draft.splitMode === 'shares') {
                            return (
                                <label key={id} className={styles.fieldLabel}>
                                    <span>{person.name} (weight)</span>
                                    <input
                                        className={styles.input}
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={draft.weights[id] ?? '1'}
                                        onChange={e =>
                                            onChange({
                                                ...draft,
                                                weights: {...draft.weights, [id]: e.target.value},
                                            })
                                        }
                                    />
                                </label>
                            );
                        }
                        if (draft.splitMode === 'percent') {
                            return (
                                <label key={id} className={styles.fieldLabel}>
                                    <span>{person.name} (%)</span>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        inputMode="decimal"
                                        value={draft.percents[id] ?? ''}
                                        onChange={e =>
                                            onChange({
                                                ...draft,
                                                percents: {
                                                    ...draft.percents,
                                                    [id]: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </label>
                            );
                        }
                        return (
                            <label key={id} className={styles.fieldLabel}>
                                <span>
                                    {person.name} ({currencySymbol(currency)})
                                </span>
                                <input
                                    className={styles.input}
                                    type="text"
                                    inputMode="decimal"
                                    placeholder={amountPlaceholder(currency)}
                                    value={draft.amounts[id] ?? ''}
                                    onChange={e =>
                                        onChange({
                                            ...draft,
                                            amounts: {...draft.amounts, [id]: e.target.value},
                                        })
                                    }
                                />
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SplitFields;
