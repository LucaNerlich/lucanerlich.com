import type {ReactNode} from 'react';

import styles from './DemoShell.module.css';

type DemoShellProps = {
    title: string;
    hint?: string;
    controls?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
};

export default function DemoShell({
    title,
    hint,
    controls,
    footer,
    children,
}: DemoShellProps): ReactNode {
    return (
        <section className={styles.shell} aria-label={title}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                {hint ? <p className={styles.hint}>{hint}</p> : null}
            </div>
            {controls ? <div className={styles.controls}>{controls}</div> : null}
            <div className={styles.body}>{children}</div>
            {footer ? <p className={styles.footer}>{footer}</p> : null}
        </section>
    );
}

type RangeControlProps = {
    id: string;
    label: string;
    min: number;
    max: number;
    step?: number;
    value: number;
    unit?: string;
    disabled?: boolean;
    onChange: (value: number) => void;
};

export function RangeControl({
    id,
    label,
    min,
    max,
    step = 1,
    value,
    unit = '',
    disabled,
    onChange,
}: RangeControlProps): ReactNode {
    return (
        <label className={styles.control} htmlFor={id}>
            <span className={styles.controlLabel}>{label}</span>
            <div className={styles.controlRow}>
                <input
                    id={id}
                    className={styles.range}
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    disabled={disabled}
                    onChange={(event) => onChange(Number(event.target.value))}
                />
                <span className={styles.value}>{value}{unit}</span>
            </div>
        </label>
    );
}

type SelectControlProps = {
    id: string;
    label: string;
    value: string;
    options: Array<{value: string; label: string}>;
    disabled?: boolean;
    onChange: (value: string) => void;
};

export function SelectControl({
    id,
    label,
    value,
    options,
    disabled,
    onChange,
}: SelectControlProps): ReactNode {
    return (
        <label className={styles.control} htmlFor={id}>
            <span className={styles.controlLabel}>{label}</span>
            <select
                id={id}
                className={styles.select}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </label>
    );
}

export {styles as demoShellStyles};
