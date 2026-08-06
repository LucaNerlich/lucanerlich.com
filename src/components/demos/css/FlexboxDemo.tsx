import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './FlexboxDemo.module.css';

const DIRECTIONS = ['row', 'row-reverse', 'column', 'column-reverse'] as const;
const JUSTIFY = ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] as const;
const ALIGN = ['stretch', 'flex-start', 'center', 'flex-end', 'baseline'] as const;
const WRAP = ['nowrap', 'wrap', 'wrap-reverse'] as const;

export default function FlexboxDemo(): ReactNode {
    const ids = {
        direction: useId(),
        justify: useId(),
        align: useId(),
        wrap: useId(),
        gap: useId(),
        grow: useId(),
    };
    const [direction, setDirection] = useState<(typeof DIRECTIONS)[number]>('row');
    const [justify, setJustify] = useState<(typeof JUSTIFY)[number]>('flex-start');
    const [align, setAlign] = useState<(typeof ALIGN)[number]>('stretch');
    const [wrap, setWrap] = useState<(typeof WRAP)[number]>('nowrap');
    const [gap, setGap] = useState(12);
    const [growSecond, setGrowSecond] = useState(false);

    const containerStyle = {
        flexDirection: direction,
        justifyContent: justify,
        alignItems: align,
        flexWrap: wrap,
        gap: `${gap}px`,
    } as CSSProperties;

    return (
        <DemoShell
            title="Flexbox playground"
            hint="Change container properties and watch the items rearrange on the main and cross axes."
            footer="Item 2 can optionally take flex-grow: 1 so it absorbs free space along the main axis."
            controls={
                <>
                    <label className={shell.control} htmlFor={ids.direction}>
                        <span className={shell.controlLabel}>flex-direction</span>
                        <select
                            id={ids.direction}
                            className={shell.select}
                            value={direction}
                            onChange={(event) => setDirection(event.target.value as typeof direction)}
                        >
                            {DIRECTIONS.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.justify}>
                        <span className={shell.controlLabel}>justify-content</span>
                        <select
                            id={ids.justify}
                            className={shell.select}
                            value={justify}
                            onChange={(event) => setJustify(event.target.value as typeof justify)}
                        >
                            {JUSTIFY.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.align}>
                        <span className={shell.controlLabel}>align-items</span>
                        <select
                            id={ids.align}
                            className={shell.select}
                            value={align}
                            onChange={(event) => setAlign(event.target.value as typeof align)}
                        >
                            {ALIGN.map((value) => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    </label>
                    <label className={shell.control} htmlFor={ids.wrap}>
                        <span className={shell.controlLabel}>flex-wrap</span>
                        <select
                            id={ids.wrap}
                            className={shell.select}
                            value={wrap}
                            onChange={(event) => setWrap(event.target.value as typeof wrap)}
                        >
                            {WRAP.map((value) => (
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
                                max={40}
                                value={gap}
                                onChange={(event) => setGap(Number(event.target.value))}
                            />
                            <span className={shell.value}>{gap}px</span>
                        </div>
                    </label>
                    <label className={`${shell.control} ${shell.checkboxLabel}`} htmlFor={ids.grow}>
                        <input
                            id={ids.grow}
                            type="checkbox"
                            checked={growSecond}
                            onChange={(event) => setGrowSecond(event.target.checked)}
                        />
                        flex-grow on item 2
                    </label>
                </>
            }
        >
            <div className={styles.container} style={containerStyle}>
                <div className={styles.item}>1</div>
                <div className={`${styles.item} ${styles.itemTall}`} style={{flexGrow: growSecond ? 1 : 0}}>
                    2
                </div>
                <div className={styles.item}>3</div>
                <div className={`${styles.item} ${styles.itemWide}`}>4</div>
            </div>
        </DemoShell>
    );
}
