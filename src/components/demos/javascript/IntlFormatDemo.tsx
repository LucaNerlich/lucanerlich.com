import type {ReactNode} from 'react';
import {useId, useMemo, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './IntlFormatDemo.module.css';

const LOCALES = ['en-US', 'de-DE', 'fr-FR', 'ja-JP', 'ar-EG'] as const;
const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP'] as const;

export default function IntlFormatDemo(): ReactNode {
    const ids = {
        locale: useId(),
        currency: useId(),
        amount: useId(),
        date: useId(),
    };
    const [locale, setLocale] = useState<(typeof LOCALES)[number]>('en-US');
    const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>('USD');
    const [amount, setAmount] = useState(1234.56);
    const [dateValue, setDateValue] = useState('2026-08-06T15:30');

    const outputs = useMemo(() => {
        const date = new Date(dateValue);
        const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
        return {
            number: new Intl.NumberFormat(locale).format(amount),
            currency: new Intl.NumberFormat(locale, {
                style: 'currency',
                currency,
            }).format(amount),
            date: new Intl.DateTimeFormat(locale, {
                dateStyle: 'full',
                timeStyle: 'short',
            }).format(safeDate),
            relative: new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}).format(-3, 'day'),
            list: new Intl.ListFormat(locale, {style: 'long', type: 'conjunction'}).format([
                'React',
                'TypeScript',
                'Intl',
            ]),
        };
    }, [amount, currency, dateValue, locale]);

    return (
        <DemoShell
            title="Intl format studio"
            hint="Change locale and inputs to see how the same data renders for different audiences."
            footer="Output uses the browser's built-in Intl APIs -- no extra libraries."
            controls={
                <>
                    <label className={shell.control} htmlFor={ids.locale}>
                        <span className={shell.controlLabel}>locale</span>
                        <select
                            id={ids.locale}
                            className={shell.select}
                            value={locale}
                            onChange={(event) => setLocale(event.target.value as typeof locale)}
                        >
                            {LOCALES.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.currency}>
                        <span className={shell.controlLabel}>currency</span>
                        <select
                            id={ids.currency}
                            className={shell.select}
                            value={currency}
                            onChange={(event) => setCurrency(event.target.value as typeof currency)}
                        >
                            {CURRENCIES.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.amount}>
                        <span className={shell.controlLabel}>amount</span>
                        <input
                            id={ids.amount}
                            className={shell.input}
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(event) => setAmount(Number(event.target.value))}
                        />
                    </label>
                    <label className={shell.control} htmlFor={ids.date}>
                        <span className={shell.controlLabel}>date</span>
                        <input
                            id={ids.date}
                            className={shell.input}
                            type="datetime-local"
                            value={dateValue}
                            onChange={(event) => setDateValue(event.target.value)}
                        />
                    </label>
                </>
            }
        >
            <dl className={styles.results}>
                <div>
                    <dt>NumberFormat</dt>
                    <dd>{outputs.number}</dd>
                </div>
                <div>
                    <dt>NumberFormat (currency)</dt>
                    <dd>{outputs.currency}</dd>
                </div>
                <div>
                    <dt>DateTimeFormat</dt>
                    <dd>{outputs.date}</dd>
                </div>
                <div>
                    <dt>RelativeTimeFormat</dt>
                    <dd>{outputs.relative}</dd>
                </div>
                <div>
                    <dt>ListFormat</dt>
                    <dd>{outputs.list}</dd>
                </div>
            </dl>
        </DemoShell>
    );
}
