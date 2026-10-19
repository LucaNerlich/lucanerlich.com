import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell, RangeControl, SelectControl} from '../DemoShell';
import styles from './GridDemo.module.css';

const TEMPLATES = [
    '1fr 1fr 1fr',
    '1fr 2fr 1fr',
    'repeat(auto-fit, minmax(120px, 1fr))',
    '200px 1fr',
] as const;

export default function GridDemo(): ReactNode {
    const ids = {
        template: useId(),
        gap: useId(),
        width: useId(),
    };
    const [template, setTemplate] = useState<(typeof TEMPLATES)[number]>('1fr 1fr 1fr');
    const [gap, setGap] = useState(12);
    const [width, setWidth] = useState(100);

    const gridStyle = {
        gridTemplateColumns: template,
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
                    <SelectControl
                            id={ids.template}
                            label="grid-template-columns"
                            value={template}
                            options={TEMPLATES.map((option) => ({value: option, label: option}))}
                            onChange={(next) => setTemplate(next as typeof template)}
                        />
                    <RangeControl
                            id={ids.gap}
                            label="gap"
                            min={0}
                            max={32}
                            value={gap}
                            unit="px"
                            onChange={setGap}
                        />
                    <RangeControl
                            id={ids.width}
                            label="container width"
                            min={40}
                            max={100}
                            value={width}
                            unit="%"
                            onChange={setWidth}
                        />
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
