import type {CSSProperties, ReactNode} from 'react';
import {useId, useRef, useState} from 'react';

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

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

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
    const panelRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(initialWidth);

    const syncWidthFromPanel = () => {
        const panel = panelRef.current;
        if (!panel) {
            return;
        }
        const next = clamp(Math.round(panel.getBoundingClientRect().width), minWidth, maxWidth);
        setWidth(next);
    };

    const panelStyle = {
        width: `${width}px`,
    } as CSSProperties;

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
                            onChange={(event) => {
                                const next = Number(event.target.value);
                                setWidth(next);
                                // Native resize mutates the inline width; write it back so the
                                // slider always reclaims control even before React commits.
                                if (panelRef.current) {
                                    panelRef.current.style.width = `${next}px`;
                                }
                            }}
                        />
                    </label>
                    <span className={styles.widthBadge}>{width}px</span>
                </div>
            </div>
            <div className={styles.body}>
                <div
                    ref={panelRef}
                    className={styles.panel}
                    style={panelStyle}
                    onPointerUp={syncWidthFromPanel}
                    onTouchEnd={syncWidthFromPanel}
                >
                    {children}
                </div>
                {footer ? <p className={styles.footer}>{footer}</p> : null}
            </div>
        </section>
    );
}
