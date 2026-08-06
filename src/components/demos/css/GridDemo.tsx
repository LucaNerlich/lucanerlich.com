import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './GridDemo.module.css';

const TEMPLATES = {
    '1fr 1fr 1fr': '1fr 1fr 1fr',
    '1fr 2fr 1fr': '1fr 2fr 1fr',
    'repeat(auto-fit, minmax(120px, 1fr))': 'repeat(auto-fit, minmax(120px, 1fr))',
    '200px 1fr': '200px 1fr',
} as const;

export default function GridDemo(): ReactNode {
    const ids = {
        template: useId(),
        gap: useId(),
        width: useId(),
    };
    const [template, setTemplate] = useState<keyof typeof TEMPLATES>('1fr 1fr 1fr');
    const [gap, setGap] = useState(12);
    const [width, setWidth] = useState(100);

    const gridStyle = {
        gridTemplateColumns: TEMPLATES[template],
        gap: `${gap}px`,
        width: `${width}%`,
    } as CSSProperties;

    return (
        <DemoShell
            title="CSS Grid playground"
            hint="Change track definitions and shrink the grid container -- especially useful with auto-fit + minmax."
            footer="With auto-fit and minmax, columns drop as the container gets narrower -- no media query required."
            controls={
                <>
                    <label className={shell.control} htmlFor={ids.template}>
                        <span className={shell.controlLabel}>grid-template-columns</span>
                        <select
                            id={ids.template}
                            className={shell.select}
                            value={template}
                            onChange={(event) => setTemplate(event.target.value as typeof template)}
                        >
                            {Object.keys(TEMPLATES).map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.gap}>
                        <span className={shell.controlLabel}>gap</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.gap}
                                className={shell.range}
                                type="range"
                                min={0}
                                max={32}
                                value={gap}
                                onChange={(event) => setGap(Number(event.target.value))}
                            />
                            <span className={shell.value}>{gap}px</span>
                        </div>
                    </label>
                    <label className={shell.control} htmlFor={ids.width}>
                        <span className={shell.controlLabel}>container width</span>
                        <div className={shell.controlRow}>
                            <input
                                id={ids.width}
                                className={shell.range}
                                type="range"
                                min={40}
                                max={100}
                                value={width}
                                onChange={(event) => setWidth(Number(event.target.value))}
                            />
                            <span className={shell.value}>{width}%</span>
                        </div>
                    </label>
                </>
            }
        >
            <div className={styles.stage}>
                <div className={styles.grid} style={gridStyle}>
                    {Array.from({length: 6}, (_, index) => (
                        <div key={index} className={styles.item}>
                            {index + 1}
                        </div>
                    ))}
                </div>
            </div>
        </DemoShell>
    );
}
