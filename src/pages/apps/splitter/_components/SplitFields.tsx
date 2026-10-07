import React from 'react';
import type {Currency, Person, Split} from '../_lib/types';
import {equalSplit} from '../_lib/types';
import {amountPlaceholder, centsToInput, currencySymbol, toCents} from '../_lib/money';
import type {Messages} from '../_lib/messages';
import styles from '../splitter.module.css';

export type SplitDraft = {
    participants: string[];
    splitMode: Split['mode'];
    weights: Record<string, string>;
    percents: Record<string, string>;
    amounts: Record<string, string>;
};

export const draftFromPeople = (people: Person[], previous?: SplitDraft): SplitDraft => {
    const ids = people.map(p => p.id);
    const participants =
        previous?.participants.filter(id => ids.includes(id)) ??
        ids;
    const next: SplitDraft = {
        participants: participants.length > 0 ? participants : ids,
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
            const each = (100 / next.participants.length).toFixed(2);
            for (const id of next.participants) next.percents[id] = each;
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

export const buildSplit = (draft: SplitDraft): {split: Split; error: string | null} => {
    if (draft.participants.length === 0) {
        return {split: equalSplit(), error: 'Pick at least one participant.'};
    }
    if (draft.splitMode === 'equal') return {split: equalSplit(), error: null};

    if (draft.splitMode === 'shares') {
        const weights: Record<string, number> = {};
        for (const id of draft.participants) {
            const w = Number(draft.weights[id]);
            if (!Number.isFinite(w) || w <= 0) {
                return {split: equalSplit(), error: 'Every participant needs a positive share weight.'};
            }
            weights[id] = w;
        }
        return {split: {mode: 'shares', weights}, error: null};
    }

    if (draft.splitMode === 'percent') {
        const percents: Record<string, number> = {};
        for (const id of draft.participants) {
            const p = Number(String(draft.percents[id]).replace(',', '.'));
            if (!Number.isFinite(p) || p < 0) {
                return {split: equalSplit(), error: 'Every participant needs a non-negative percent.'};
            }
            percents[id] = p;
        }
        return {split: {mode: 'percent', percents}, error: null};
    }

    const amounts: Record<string, number> = {};
    for (const id of draft.participants) {
        const cents = toCents(draft.amounts[id] ?? '');
        if (cents === null || cents < 0) {
            return {split: equalSplit(), error: 'Every participant needs a valid exact amount.'};
        }
        amounts[id] = cents;
    }
    return {split: {mode: 'exact', amounts}, error: null};
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
                        onChange({
                            ...draft,
                            splitMode: e.target.value as Split['mode'],
                        })
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
