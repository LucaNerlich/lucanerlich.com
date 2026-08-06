import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './BoxModelDemo.module.css';

export default function BoxModelDemo(): ReactNode {
    const ids = {
        width: useId(),
        padding: useId(),
        border: useId(),
        margin: useId(),
        sizing: useId(),
    };
    const [width, setWidth] = useState(220);
    const [padding, setPadding] = useState(24);
    const [border, setBorder] = useState(8);
    const [margin, setMargin] = useState(16);
    const [boxSizing, setBoxSizing] = useState<'content-box' | 'border-box'>('content-box');

    const boxStyle = {
        width: `${width}px`,
        padding: `${padding}px`,
        borderWidth: `${border}px`,
        boxSizing,
    } as CSSProperties;

    const contentWidth = width;
    const borderBoxWidth = boxSizing === 'border-box'
        ? width
        : width + padding * 2 + border * 2;
    const totalWithMargin = borderBoxWidth + margin * 2;

    return (
        <DemoShell
            title="Box model explorer"
            hint="Adjust padding, border, and margin. Toggle box-sizing to see how width is calculated."
            footer={`Content width ${contentWidth}px · border-box width ${borderBoxWidth}px · with margin ${totalWithMargin}px`}
            controls={
                <>
                    <label className={shell.control} htmlFor={ids.width}>
                        <span className={shell.controlLabel}>width</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.width}
                                className={shell.range}
                                type="range"
                                min={120}
                                max={320}
                                value={width}
                                onChange={(event) => setWidth(Number(event.target.value))}
                            />
                            <span className={shell.value}>{width}px</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.padding}>
                        <span className={shell.controlLabel}>padding</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.padding}
                                className={shell.range}
                                type="range"
                                min={0}
                                max={48}
                                value={padding}
                                onChange={(event) => setPadding(Number(event.target.value))}
                            />
                            <span className={shell.value}>{padding}px</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.border}>
                        <span className={shell.controlLabel}>border</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.border}
                                className={shell.range}
                                type="range"
                                min={0}
                                max={20}
                                value={border}
                                onChange={(event) => setBorder(Number(event.target.value))}
                            />
                            <span className={shell.value}>{border}px</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.margin}>
                        <span className={shell.controlLabel}>margin</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.margin}
                                className={shell.range}
                                type="range"
                                min={0}
                                max={40}
                                value={margin}
                                onChange={(event) => setMargin(Number(event.target.value))}
                            />
                            <span className={shell.value}>{margin}px</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.sizing}>
                        <span className={shell.controlLabel}>box-sizing</span>
                        <select
                            id={ids.sizing}
                            className={shell.select}
                            value={boxSizing}
                            onChange={(event) => setBoxSizing(event.target.value as typeof boxSizing)}
                        >
                            <option value="content-box">content-box</option>
                            <option value="border-box">border-box</option>
                        </select>
                    </label>
                </>
            }
        >
            <div className={styles.stage}>
                <div className={styles.marginLayer} style={{padding: `${margin}px`}}>
                    <div className={styles.legend}>margin</div>
                    <div className={styles.box} style={boxStyle}>
                        <div className={styles.content}>content</div>
                    </div>
                </div>
            </div>
        </DemoShell>
    );
}
