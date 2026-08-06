import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './PositionDemo.module.css';

const POSITIONS = ['static', 'relative', 'absolute', 'sticky'] as const;

export default function PositionDemo(): ReactNode {
    const ids = {
        position: useId(),
        top: useId(),
        left: useId(),
        z: useId(),
    };
    const [position, setPosition] = useState<(typeof POSITIONS)[number]>('relative');
    const [top, setTop] = useState(24);
    const [left, setLeft] = useState(24);
    const [zIndex, setZIndex] = useState(1);

    const boxStyle = {
        position,
        top: position === 'static' ? undefined : `${top}px`,
        left: position === 'static' ? undefined : `${left}px`,
        zIndex,
    } as CSSProperties;

    return (
        <DemoShell
            title="Position playground"
            hint="Scroll the frame and change position. sticky sticks within the scroll parent; absolute leaves normal flow."
            footer="The pink box is the positioned element. Grey siblings stay in normal document flow."
            controls={
                <>
                    <label className={shell.control} htmlFor={ids.position}>
                        <span className={shell.controlLabel}>position</span>
                        <select
                            id={ids.position}
                            className={shell.select}
                            value={position}
                            onChange={(event) => setPosition(event.target.value as typeof position)}
                        >
                            {POSITIONS.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.top}>
                        <span className={shell.controlLabel}>top</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.top}
                                className={shell.range}
                                type="range"
                                min={0}
                                max={120}
                                value={top}
                                disabled={position === 'static'}
                                onChange={(event) => setTop(Number(event.target.value))}
                            />
                            <span className={shell.value}>{top}px</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.left}>
                        <span className={shell.controlLabel}>left</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.left}
                                className={shell.range}
                                type="range"
                                min={0}
                                max={160}
                                value={left}
                                disabled={position === 'static'}
                                onChange={(event) => setLeft(Number(event.target.value))}
                            />
                            <span className={shell.value}>{left}px</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.z}>
                        <span className={shell.controlLabel}>z-index</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.z}
                                className={shell.range}
                                type="range"
                                min={0}
                                max={5}
                                value={zIndex}
                                onChange={(event) => setZIndex(Number(event.target.value))}
                            />
                            <span className={shell.value}>{zIndex}</span>
                        </div>
                    </label>
                </>
            }
        >
            <div className={styles.frame}>
                <div className={styles.parent}>
                    <div className={styles.sibling}>Sibling A</div>
                    <div className={styles.target} style={boxStyle}>
                        position: {position}
                    </div>
                    <div className={`${styles.sibling} ${styles.siblingOverlap}`}>Sibling B (z-index: 2)</div>
                    <div className={styles.filler}>Scroll content</div>
                    <div className={styles.filler}>More content</div>
                    <div className={styles.filler}>Keep scrolling</div>
                </div>
            </div>
        </DemoShell>
    );
}
