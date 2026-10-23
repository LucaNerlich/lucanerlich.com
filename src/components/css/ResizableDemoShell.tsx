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
    // Width the two-column grid actually offers; the slider must not claim
    // more than the panel can occupy.
    const [slotMax, setSlotMax] = useState(effectiveMaxWidth);

    // Width at pointerdown, so a click that never dragged is not mistaken for
    // a resize (the rendered width is clamped to the slot).
    const pointerStartWidth = useRef<number | null>(null);

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
        const observed = Math.round(panel.getBoundingClientRect().width);
        const start = pointerStartWidth.current;
        pointerStartWidth.current = null;
        // No armed press (a pointerup that did not start on the panel) or an
        // unchanged width is not a resize.
        if (start === null || observed === start) {
            return;
        }
        applyObservedWidth(observed);
    };

    // The inline max-width stops a native drag at the cap, so the release can
    // land outside the panel; listen on the window or the width state stays
    // stale while the panel renders the clamped width. This is the only sync
    // path: a second handler on the panel would clear the snapshot first and
    // re-apply the clamped width on the same release.
    const armWidthSync = () => {
        pointerStartWidth.current = panelRef.current
            ? Math.round(panelRef.current.getBoundingClientRect().width)
            : null;
        const done = () => {
            window.removeEventListener('pointerup', done);
            window.removeEventListener('pointercancel', done);
            syncWidthFromPanel();
        };
        window.addEventListener('pointerup', done);
        window.addEventListener('pointercancel', done);
    };

    useEffect(() => {
        const panel = panelRef.current;
        if (!panel || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const column = panel.parentElement ?? panel;

        const updateSlot = () => {
            const style = window.getComputedStyle(column);
            const available = Math.floor(
                column.clientWidth
                - parseFloat(style.paddingLeft || '0')
                - parseFloat(style.paddingRight || '0'),
            );
            if (!Number.isFinite(available) || available <= 0) {
                return;
            }
            const next = clamp(available, effectiveMinWidth, effectiveMaxWidth);
            setSlotMax((current) => (current === next ? current : next));
        };

        updateSlot();
        const observer = new ResizeObserver(updateSlot);
        observer.observe(column);
        return () => observer.disconnect();
    }, [effectiveMinWidth, effectiveMaxWidth]);

    const visibleWidth = Math.min(width, slotMax);

    const panelStyle = {
        width: `${visibleWidth}px`,
        // Bound the native resize handle too; JS clamping on pointer-up alone
        // lets the panel grow past the cap and jump back.
        maxWidth: `min(100%, ${effectiveMaxWidth}px)`,
        '--demo-min-width': `${effectiveMinWidth}px`,
    } as CSSProperties;

    const panelClassName = lockedPanel
        ? `${styles.panel} ${styles.panelLocked}`
        : styles.panel;

    const renderPanel: RenderPanel = (content, className) => (
        <div
            ref={panelRef}
            className={className ? `${panelClassName} ${className}` : panelClassName}
            style={panelStyle}
            onPointerDown={lockedPanel ? undefined : armWidthSync}
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
                            max={slotMax}
                            step={1}
                            value={visibleWidth}
                            onChange={(event) => {
                                const next = Math.min(Number(event.target.value), slotMax);
                                setWidth(next);
                                // Native resize mutates the inline width; write it back so the
                                // slider always reclaims control even before React commits.
                                if (panelRef.current) {
                                    panelRef.current.style.width = `${next}px`;
                                }
                            }}
                        />
                    </label>
                    <span className={styles.widthBadge}>{visibleWidth}px</span>
                </div>
            </div>
            <div className={styles.body}>
                {typeof children === 'function'
                    ? children(renderPanel)
                    : renderPanel(children)}
                {footer ? <p className={styles.footer}>{footer}</p> : null}
            </div>
        </section>
    );
}
