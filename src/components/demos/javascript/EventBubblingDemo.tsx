import type {ReactNode} from 'react';
import {useId, useRef, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './EventBubblingDemo.module.css';

type PhaseLog = {
    id: number;
    label: string;
};

export default function EventBubblingDemo(): ReactNode {
    const stopId = useId();
    const [logs, setLogs] = useState<PhaseLog[]>([]);
    const [stopOnButton, setStopOnButton] = useState(false);
    const nextIdRef = useRef(0);

    const push = (label: string) => {
        nextIdRef.current += 1;
        const id = nextIdRef.current;
        setLogs((current) => [{id, label}, ...current].slice(0, 8));
    };

    return (
        <DemoShell
            title="Event bubbling lab"
            hint="Click the button. Watch the event travel from the target up through parent listeners."
            footer="Toggle stopPropagation on the button to prevent parent handlers from running."
            controls={
                <>
                    <label className={`${shell.control} ${shell.checkboxLabel}`} htmlFor={stopId}>
                        <input
                            id={stopId}
                            type="checkbox"
                            checked={stopOnButton}
                            onChange={(event) => setStopOnButton(event.target.checked)}
                        />
                        stopPropagation on button
                    </label>
                    <div className={shell.buttonRow}>
                        <button type="button" className={shell.button} onClick={() => setLogs([])}>
                            Clear log
                        </button>
                    </div>
                </>
            }
        >
            <div className={styles.layout}>
                <div
                    className={`${styles.box} ${styles.outer}`}
                    onClick={() => push('outer div (bubble)')}
                >
                    outer
                    <div
                        className={`${styles.box} ${styles.middle}`}
                        onClick={() => push('middle div (bubble)')}
                    >
                        middle
                        <button
                            type="button"
                            className={styles.button}
                            onClick={(event) => {
                                push('button (target)');
                                if (stopOnButton) {
                                    event.stopPropagation();
                                    push('propagation stopped');
                                }
                            }}
                        >
                            Click me
                        </button>
                    </div>
                </div>
                <ol className={styles.log} aria-live="polite">
                    {logs.length === 0 ? <li className={styles.empty}>Click the button to see the bubble path.</li> : null}
                    {logs.map((entry) => (
                        <li key={entry.id}>{entry.label}</li>
                    ))}
                </ol>
            </div>
        </DemoShell>
    );
}
