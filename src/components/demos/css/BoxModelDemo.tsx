import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {RangeControl, SelectControl} from '../DemoShell';
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

    const contentWidth = boxSizing === 'border-box'
        ? Math.max(0, width - (padding + border) * 2)
        : width;
    const borderBoxWidth = contentWidth + (padding + border) * 2;
    const totalWithMargin = borderBoxWidth + margin * 2;

    return (
        <DemoShell
            title="Box model explorer"
            hint="Adjust padding, border, and margin. Toggle box-sizing to see how width is calculated."
            footer={`Content width ${contentWidth}px · border-box width ${borderBoxWidth}px · with margin ${totalWithMargin}px`}
            controls={
                <>
                    <RangeControl
                            id={ids.width}
                            label="width"
                            min={120}
                            max={320}
                            value={width}
                            unit="px"
                            onChange={setWidth}
                        />
                    <RangeControl
                            id={ids.padding}
                            label="padding"
                            min={0}
                            max={48}
                            value={padding}
                            unit="px"
                            onChange={setPadding}
                        />
                    <RangeControl
                            id={ids.border}
                            label="border"
                            min={0}
                            max={20}
                            value={border}
                            unit="px"
                            onChange={setBorder}
                        />
                    <RangeControl
                            id={ids.margin}
                            label="margin"
                            min={0}
                            max={40}
                            value={margin}
                            unit="px"
                            onChange={setMargin}
                        />
                    <SelectControl
                        id={ids.sizing}
                        label="box-sizing"
                        value={boxSizing}
                        options={[
                            {value: 'content-box', label: 'content-box'},
                            {value: 'border-box', label: 'border-box'},
                        ]}
                        onChange={(next) => setBoxSizing(next as typeof boxSizing)}
                    />
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
