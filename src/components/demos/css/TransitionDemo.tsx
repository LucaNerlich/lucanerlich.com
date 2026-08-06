import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
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
                    <label className={shell.control} htmlFor={ids.duration}>
                        <span className={shell.controlLabel}>duration</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.duration}
                                className={shell.range}
                                type="range"
                                min={50}
                                max={1200}
                                step={50}
                                value={duration}
                                onChange={(event) => setDuration(Number(event.target.value))}
                            />
                            <span className={shell.value}>{duration}ms</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.easing}>
                        <span className={shell.controlLabel}>easing</span>
                        <select
                            id={ids.easing}
                            className={shell.select}
                            value={easing}
                            onChange={(event) => setEasing(event.target.value as typeof easing)}
                        >
                            {EASINGS.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
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
