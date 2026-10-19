import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell, RangeControl, SelectControl} from '../DemoShell';
import styles from './TransitionDemo.module.css';

const EASINGS = ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'] as const;

export default function TransitionDemo(): ReactNode {
    const ids = {
        duration: useId(),
        easing: useId(),
    };
    const [duration, setDuration] = useState(300);
    const [easing, setEasing] = useState<(typeof EASINGS)[number]>('ease');
    const [active, setActive] = useState(false);

    const cardStyle = {
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: easing,
    } as CSSProperties;

    return (
        <DemoShell
            title="Transition playground"
            hint="Toggle the card state and feel how duration and easing change the motion."
            footer="transition: transform, box-shadow, and background-color use the same duration and easing."
            controls={
                <>
                    <RangeControl
                            id={ids.duration}
                            label="duration"
                            min={50}
                            max={1200}
                            step={50}
                            value={duration}
                            unit="ms"
                            onChange={setDuration}
                        />
                    <SelectControl
                            id={ids.easing}
                            label="easing"
                            value={easing}
                            options={EASINGS.map((option) => ({value: option, label: option}))}
                            onChange={(next) => setEasing(next as typeof easing)}
                        />
                    <div className={shell.buttonRow}>
                        <button
                            type="button"
                            className={`${shell.button} ${shell.buttonPrimary}`}
                            onClick={() => setActive((value) => !value)}
                        >
                            {active ? 'Reset' : 'Play transition'}
                        </button>
                    </div>
                </>
            }
        >
            <div className={styles.stage}>
                <div
                    className={`${styles.card} ${active ? styles.cardActive : ''}`}
                    style={cardStyle}
                >
                    Hover-like state
                </div>
            </div>
        </DemoShell>
    );
}
