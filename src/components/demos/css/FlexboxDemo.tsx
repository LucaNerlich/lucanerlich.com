import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell, RangeControl, SelectControl} from '../DemoShell';
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
                    <SelectControl
                            id={ids.direction}
                            label="flex-direction"
                            value={direction}
                            options={DIRECTIONS.map((option) => ({value: option, label: option}))}
                            onChange={(next) => setDirection(next as typeof direction)}
                        />
                    <SelectControl
                            id={ids.justify}
                            label="justify-content"
                            value={justify}
                            options={JUSTIFY.map((option) => ({value: option, label: option}))}
                            onChange={(next) => setJustify(next as typeof justify)}
                        />
                    <SelectControl
                            id={ids.align}
                            label="align-items"
                            value={align}
                            options={ALIGN.map((option) => ({value: option, label: option}))}
                            onChange={(next) => setAlign(next as typeof align)}
                        />
                    <SelectControl
                            id={ids.wrap}
                            label="flex-wrap"
                            value={wrap}
                            options={WRAP.map((option) => ({value: option, label: option}))}
                            onChange={(next) => setWrap(next as typeof wrap)}
                        />
                    <RangeControl
                            id={ids.gap}
                            label="gap"
                            min={0}
                            max={40}
                            value={gap}
                            unit="px"
                            onChange={setGap}
                        />
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
            <div className={styles.container} style={containerStyle} data-direction={direction}>
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
