import type {ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './AsyncTimelineDemo.module.css';

type Mode = 'sequential' | 'all' | 'race';
type Bar = {
    label: string;
    start: number;
    duration: number;
    ok: boolean;
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
                    nextBars.push({label: labels[index], start: cursor, duration, ok: true});
                    setBars([...nextBars]);
                    await wait(duration);
                    cursor += duration;
                }
            } else if (mode === 'all') {
                setBars(delays.map((duration, index) => ({
                    label: labels[index],
                    start: 0,
                    duration,
                    ok: true,
                })));
                await Promise.all(delays.map((duration) => wait(duration)));
            } else {
                setBars(delays.map((duration, index) => ({
                    label: labels[index],
                    start: 0,
                    duration,
                    ok: true,
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
                    <label className={shell.control} htmlFor={ids.mode}>
                        <span className={shell.controlLabel}>mode</span>
                        <select
                            id={ids.mode}
                            className={shell.select}
                            value={mode}
                            onChange={(event) => setMode(event.target.value as Mode)}
                        >
                            <option value="sequential">sequential await</option>
                            <option value="all">Promise.all</option>
                            <option value="race">Promise.race</option>
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.a}>
                        <span className={shell.controlLabel}>task A delay</span>
                        <div className={shell.controlRow}>
                            <input id={ids.a} className={shell.range} type="range" min={100} max={1500} step={100} value={delayA} onChange={(e) => setDelayA(Number(e.target.value))} />
                            <span className={shell.value}>{delayA}ms</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.b}>
                        <span className={shell.controlLabel}>task B delay</span>
                        <div className={shell.controlRow}>
                            <input id={ids.b} className={shell.range} type="range" min={100} max={1500} step={100} value={delayB} onChange={(e) => setDelayB(Number(e.target.value))} />
                            <span className={shell.value}>{delayB}ms</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.c}>
                        <span className={shell.controlLabel}>task C delay</span>
                        <div className={shell.controlRow}>
                            <input id={ids.c} className={shell.range} type="range" min={100} max={1500} step={100} value={delayC} onChange={(e) => setDelayC(Number(e.target.value))} />
                            <span className={shell.value}>{delayC}ms</span>
                        </div>
                    </label>
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
                        {label: 'task A', start: 0, duration: delayA, ok: true},
                        {label: 'task B', start: mode === 'sequential' ? delayA : 0, duration: delayB, ok: true},
                        {
                            label: 'task C',
                            start: mode === 'sequential' ? delayA + delayB : 0,
                            duration: delayC,
                            ok: true,
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
