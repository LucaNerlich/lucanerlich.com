import type {ReactNode} from 'react';
import {useEffect, useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell, RangeControl, SelectControl} from '../DemoShell';
import styles from './AsyncTimelineDemo.module.css';

type Mode = 'sequential' | 'all' | 'race';
type Bar = {
    label: string;
    start: number;
    duration: number;
};

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

export default function AsyncTimelineDemo(): ReactNode {
    const ids = {
        mode: useId(),
        a: useId(),
        b: useId(),
        c: useId(),
    };
    const [mode, setMode] = useState<Mode>('sequential');
    const [delayA, setDelayA] = useState(800);
    const [delayB, setDelayB] = useState(500);
    const [delayC, setDelayC] = useState(1200);
    const [bars, setBars] = useState<Bar[]>([]);
    const [elapsed, setElapsed] = useState<number | null>(null);
    const [running, setRunning] = useState(false);

    // After a run the chart and elapsed time are frozen. Changing the
    // scenario must drop that stale result, otherwise the demo shows
    // sequential bars under a Promise.all selection.
    useEffect(() => {
        setBars([]);
        setElapsed(null);
    }, [mode, delayA, delayB, delayC]);

    const run = async () => {
        if (running) {
            return;
        }
        setRunning(true);
        setBars([]);
        setElapsed(null);
        const started = performance.now();
        const delays = [delayA, delayB, delayC];
        const labels = ['task A', 'task B', 'task C'];

        try {
            if (mode === 'sequential') {
                let cursor = 0;
                const nextBars: Bar[] = [];
                for (let index = 0; index < delays.length; index += 1) {
                    const duration = delays[index];
                    nextBars.push({label: labels[index], start: cursor, duration});
                    setBars([...nextBars]);
                    await wait(duration);
                    cursor += duration;
                }
            } else if (mode === 'all') {
                setBars(delays.map((duration, index) => ({
                    label: labels[index],
                    start: 0,
                    duration,
                })));
                await Promise.all(delays.map((duration) => wait(duration)));
            } else {
                setBars(delays.map((duration, index) => ({
                    label: labels[index],
                    start: 0,
                    duration,
                })));
                await Promise.race(delays.map((duration) => wait(duration)));
            }
            setElapsed(Math.round(performance.now() - started));
        } finally {
            setRunning(false);
        }
    };

    const maxDuration = Math.max(
        1,
        ...bars.map((bar) => bar.start + bar.duration),
        mode === 'sequential' ? delayA + delayB + delayC : Math.max(delayA, delayB, delayC),
    );

    return (
        <DemoShell
            title="Sequential vs parallel timeline"
            hint="Run the same three fake tasks sequentially, with Promise.all, or with Promise.race."
            footer={elapsed === null ? 'Press Run to compare wall-clock time.' : `Finished in about ${elapsed} ms`}
            controls={
                <>
                    <SelectControl
                        id={ids.mode}
                        label="mode"
                        value={mode}
                        disabled={running}
                        options={[
                            {value: 'sequential', label: 'sequential await'},
                            {value: 'all', label: 'Promise.all'},
                            {value: 'race', label: 'Promise.race'},
                        ]}
                        onChange={(next) => setMode(next as Mode)}
                    />
                    <RangeControl
                        id={ids.a}
                        label="task A delay"
                        min={100}
                        max={1500}
                        step={100}
                        value={delayA}
                        unit="ms"
                        disabled={running}
                        onChange={setDelayA}
                    />
                    <RangeControl
                        id={ids.b}
                        label="task B delay"
                        min={100}
                        max={1500}
                        step={100}
                        value={delayB}
                        unit="ms"
                        disabled={running}
                        onChange={setDelayB}
                    />
                    <RangeControl
                        id={ids.c}
                        label="task C delay"
                        min={100}
                        max={1500}
                        step={100}
                        value={delayC}
                        unit="ms"
                        disabled={running}
                        onChange={setDelayC}
                    />
                    <div className={shell.buttonRow}>
                        <button
                            type="button"
                            className={`${shell.button} ${shell.buttonPrimary}`}
                            onClick={() => {
                                void run();
                            }}
                            disabled={running}
                        >
                            {running ? 'Running…' : 'Run'}
                        </button>
                    </div>
                </>
            }
        >
            <div className={styles.chart} aria-live="polite">
                {(bars.length === 0
                    ? [
                        {label: 'task A', start: 0, duration: delayA},
                        {label: 'task B', start: mode === 'sequential' ? delayA : 0, duration: delayB},
                        {
                            label: 'task C',
                            start: mode === 'sequential' ? delayA + delayB : 0,
                            duration: delayC,
                        },
                    ]
                    : bars
                ).map((bar) => (
                    <div key={bar.label} className={styles.row}>
                        <span className={styles.label}>{bar.label}</span>
                        <div className={styles.track}>
                            <div
                                className={styles.bar}
                                style={{
                                    marginLeft: `${(bar.start / maxDuration) * 100}%`,
                                    width: `${(bar.duration / maxDuration) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </DemoShell>
    );
}
