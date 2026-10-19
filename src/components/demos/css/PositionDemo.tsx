import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell, RangeControl, SelectControl} from '../DemoShell';
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
                    <SelectControl
                            id={ids.position}
                            label="position"
                            value={position}
                            options={POSITIONS.map((option) => ({value: option, label: option}))}
                            onChange={(next) => setPosition(next as typeof position)}
                        />
                    <RangeControl
                            id={ids.top}
                            label="top"
                            min={0}
                            max={120}
                            value={top}
                            unit="px"
                            disabled={position === 'static'}
                            onChange={setTop}
                        />
                    <RangeControl
                            id={ids.left}
                            label="left"
                            min={0}
                            max={160}
                            value={left}
                            unit="px"
                            disabled={position === 'static'}
                            onChange={setLeft}
                        />
                    <RangeControl
                            id={ids.z}
                            label="z-index"
                            min={0}
                            max={5}
                            value={zIndex}
                            unit=""
                            onChange={setZIndex}
                        />
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
