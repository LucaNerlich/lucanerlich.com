// ------------------------------------------------------------------
// Imports
// ------------------------------------------------------------------

import type {CSSProperties, ReactNode} from 'react';
import {useEffect, useId, useRef, useState} from 'react';

import styles from './ResizableDemoShell.module.css';

// ------------------------------------------------------------------
// Prop types
// ------------------------------------------------------------------

type RenderPanel = (content: ReactNode, className?: string) => ReactNode;

type ResizableDemoShellProps = {
    title: string;
    ariaLabel?: string;
    hint?: string;
    initialWidth?: number;
    minWidth?: number;
    maxWidth?: number;
    sliderLabel?: string;
    lockedPanel?: boolean;
    children: ReactNode | ((renderPanel: RenderPanel) => ReactNode);
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
    ariaLabel,
    hint = 'Drag the right edge of the panel, or use the slider.',
    initialWidth = 420,
    minWidth = 180,
    maxWidth = 720,
    sliderLabel = 'Width',
    lockedPanel = false,
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
        if (lockedPanel || !panel || typeof ResizeObserver === 'undefined') {
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
    }, [effectiveMinWidth, effectiveMaxWidth, lockedPanel]);

    const panelStyle = {
        width: `${width}px`,
        '--demo-min-width': `${effectiveMinWidth}px`,
    } as CSSProperties;

    const panelClassName = lockedPanel
        ? `${styles.panel} ${styles.panelLocked}`
        : styles.panel;

    const renderPanel: RenderPanel = (content, className) => (
        <div
            className={className ? `${panelClassName} ${className}` : panelClassName}
            style={panelStyle}
        >
            {content}
        </div>
    );

    return (
        <section className={styles.shell} aria-label={ariaLabel ?? title}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.hint}>{hint}</p>
                <div className={styles.controls}>
                    <label className={styles.sliderLabel} htmlFor={sliderId}>
                        {sliderLabel}
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
                {typeof children === 'function'
                    ? children(renderPanel)
                    : (
                        <div
                            ref={panelRef}
                            className={panelClassName}
                            style={panelStyle}
                            onPointerUp={lockedPanel ? undefined : syncWidthFromPanel}
                            onTouchEnd={lockedPanel ? undefined : syncWidthFromPanel}
                        >
                            {children}
                        </div>
                    )}
                {footer ? <p className={styles.footer}>{footer}</p> : null}
            </div>
        </section>
    );
}
