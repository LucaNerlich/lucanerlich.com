// ------------------------------------------------------------------
// Imports
// ------------------------------------------------------------------

import type {CSSProperties, ReactNode} from 'react';
import {useEffect, useId, useRef, useState} from 'react';

import styles from './ResizableDemoShell.module.css';

// ------------------------------------------------------------------
// Prop types
// ------------------------------------------------------------------

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

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function ResizableDemoShell({
    title,
    hint = 'Drag the right edge of the panel, or use the slider.',
    initialWidth = 420,
    minWidth = 180,
    maxWidth = 720,
    children,
    footer,
}: ResizableDemoShellProps): ReactNode {
    const effectiveMinWidth = Math.max(0, minWidth);
    const effectiveMaxWidth = Math.max(effectiveMinWidth, maxWidth);
    const effectiveInitialWidth = clamp(initialWidth, effectiveMinWidth, effectiveMaxWidth);

    const sliderId = useId();
    const panelRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(effectiveInitialWidth);

    const applyObservedWidth = (rawWidth: number) => {
        if (!Number.isFinite(rawWidth)) {
            return;
        }
        const next = clamp(Math.round(rawWidth), effectiveMinWidth, effectiveMaxWidth);
        setWidth((current) => (current === next ? current : next));
    };

    const syncWidthFromPanel = () => {
        const panel = panelRef.current;
        if (!panel) {
            return;
        }
        applyObservedWidth(panel.getBoundingClientRect().width);
    };

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel || typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (!entry) {
                return;
            }
            const observed = entry.borderBoxSize?.[0]?.inlineSize
                ?? entry.contentRect.width;
            if (!Number.isFinite(observed)) {
                return;
            }
            const next = clamp(Math.round(observed), effectiveMinWidth, effectiveMaxWidth);
            setWidth((current) => (current === next ? current : next));
        });

        observer.observe(panel);
        return () => observer.disconnect();
    }, [effectiveMinWidth, effectiveMaxWidth]);

    const panelStyle = {
        width: `${width}px`,
        '--demo-min-width': `${effectiveMinWidth}px`,
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
                            min={effectiveMinWidth}
                            max={effectiveMaxWidth}
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
