import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import styles from './ResizableDemoShell.module.css';

type ResizableDemoShellProps = {
    title: string;
    hint?: string;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    children: ReactNode;
    footer?: ReactNode;
};

export default function ResizableDemoShell({
    title,
    hint = 'Drag the right edge of the panel, or use the slider.',
    initialWidth = 420,
    minWidth = 180,
    maxWidth = 720,
    children,
    footer,
}: ResizableDemoShellProps): ReactNode {
    const sliderId = useId();
    const [width, setWidth] = useState(initialWidth);

    return (
        <section className={styles.shell} aria-label={title}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.hint}>{hint}</p>
                <div className={styles.controls}>
                    <label className={styles.sliderLabel} htmlFor={sliderId}>
                        Width
                        <input
                            id={sliderId}
                            className={styles.slider}
                            type="range"
                            min={minWidth}
                            max={maxWidth}
                            step={1}
                            value={width}
                            onChange={(event) => setWidth(Number(event.target.value))}
                        />
                    </label>
                    <span className={styles.widthBadge}>{width}px</span>
                </div>
            </div>
            <div className={styles.body}>
                <div
                    className={styles.panel}
                    style={{'--demo-width': `${width}px`} as CSSProperties}
                    onMouseUp={(event) => {
                        const next = Math.round(event.currentTarget.getBoundingClientRect().width);
                        if (Number.isFinite(next) && next !== width) {
                            setWidth(Math.min(maxWidth, Math.max(minWidth, next)));
                        }
                    }}
                >
                    {children}
                </div>
                {footer ? <p className={styles.footer}>{footer}</p> : null}
            </div>
        </section>
    );
}
