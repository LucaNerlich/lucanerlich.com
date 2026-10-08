import React, {useRef} from 'react';
import type {AppState, Currency} from '../_lib/types';
import {CURRENCIES} from '../_lib/types';
import type {Messages} from '../_lib/messages';
import {
    downloadText,
    exportCsv,
    exportJson,
    importJson,
    settlementSummaryText,
} from '../_lib/io';
import styles from '../splitter.module.css';

type Props = {
    state: AppState;
    messages: Messages;
    onCurrency: (currency: Currency) => void;
    onImport: (state: AppState) => void;
    onLoadDemo: () => void;
};

const SessionBar: React.FC<Props> = ({
    state,
    messages,
    onCurrency,
    onImport,
    onLoadDemo,
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const {t} = messages;

    const onFile = async (file: File | null) => {
        if (!file) return;
        const text = await file.text();
        const next = await importJson(text);
        if (!next) {
            window.alert('Could not import that JSON file.');
            return;
        }
        onImport(next);
    };

    return (
        <div className={styles.sessionBar}>
            <label className={styles.fieldLabel}>
                <span>{t('currency')}</span>
                <select
                    className={styles.select}
                    value={state.currency}
                    onChange={e => onCurrency(e.target.value as Currency)}
                >
                    {CURRENCIES.map(c => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </label>
            <div className={styles.sessionActions}>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={onLoadDemo}
                >
                    {t('tryExample')}
                </button>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                        void (async () => {
                            downloadText(
                                'splitter-session.json',
                                await exportJson(state),
                                'application/json',
                            );
                        })();
                    }}
                >
                    {t('exportJson')}
                </button>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => fileRef.current?.click()}
                >
                    {t('importJson')}
                </button>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() =>
                        downloadText('splitter-expenses.csv', exportCsv(state), 'text/csv')
                    }
                    disabled={state.expenses.length === 0}
                >
                    {t('exportCsv')}
                </button>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                        const text = settlementSummaryText(state);
                        const w = window.open('', '_blank');
                        if (!w) return;
                        w.opener = null;
                        w.document.write(
                            `<pre style="font:14px/1.5 system-ui,sans-serif;padding:1.5rem;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
                        );
                        w.document.close();
                        w.focus();
                        w.print();
                    }}
                    disabled={state.expenses.length === 0}
                >
                    {t('printSummary')}
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    accept="application/json,.json"
                    hidden
                    onChange={e => {
                        void onFile(e.target.files?.[0] ?? null);
                        e.target.value = '';
                    }}
                />
            </div>
        </div>
    );
};

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

export default SessionBar;
