import React, {useId} from 'react';
import type {Currency, Person, Split} from '../_lib/types';
import type {SplitDraft} from '../_lib/expenseInput';
import {draftFromPeople, toggleParticipant} from '../_lib/splitDraft';
import {amountPlaceholder, currencySymbol} from '../_lib/money';
import type {Messages} from '../_lib/messages';
import styles from '../splitter.module.css';

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
    const groupId = useId();
    const toggle = (id: string) => onChange(toggleParticipant(people, draft, id));

    const payerInSplit = draft.participants.includes(paidBy);

    return (
        <div className={styles.splitFields}>
            <div className={styles.fieldLabel} role="group" aria-labelledby={groupId}>
                <span id={groupId}>{t('participants')}</span>
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
                                    <span>{person.name} ({t('weight')})</span>
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
