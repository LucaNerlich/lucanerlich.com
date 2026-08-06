import type {CSSProperties, ReactNode} from 'react';
import {useId, useState} from 'react';

import shellStyles from './ResizableDemoShell.module.css';
import styles from './ContainerVsMediaDemo.module.css';

export default function ContainerVsMediaDemo(): ReactNode {
    const sliderId = useId();
    const [width, setWidth] = useState(360);

    const panelStyle = {
        width: `${width}px`,
    } as CSSProperties;

    return (
        <section className={shellStyles.shell} aria-label="Container queries vs media queries">
            <div className={shellStyles.header}>
                <h3 className={shellStyles.title}>Same slot width, different query type</h3>
                <p className={shellStyles.hint}>
                    Use the slider to resize the shared slot. The media-query widget only changes
                    when the viewport crosses 768px. The container-query widget changes with the
                    slot.
                </p>
                <div className={shellStyles.controls}>
                    <label className={shellStyles.sliderLabel} htmlFor={sliderId}>
                        Slot width
                        <input
                            id={sliderId}
                            className={shellStyles.slider}
                            type="range"
                            min={200}
                            max={520}
                            step={1}
                            value={width}
                            onChange={(event) => setWidth(Number(event.target.value))}
                        />
                    </label>
                    <span className={shellStyles.widthBadge}>{width}px</span>
                </div>
            </div>
            <div className={shellStyles.body}>
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <p className={styles.label}>@media (viewport)</p>
                        <div
                            className={`${shellStyles.panel} ${shellStyles.panelLocked}`}
                            style={panelStyle}
                        >
                            <article className={`${styles.widget} ${styles.mediaWidget}`}>
                                <p className={styles.badge}>
                                    <span className={styles.srOnly}>Media query state</span>
                                </p>
                                <div>
                                    <h4 className={styles.title}>Viewport-driven</h4>
                                    <p className={styles.copy}>
                                        Shrinking this panel does nothing. Open DevTools device mode
                                        or resize the browser window to see it change.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                    <div className={styles.column}>
                        <p className={styles.label}>@container (slot)</p>
                        <div
                            className={`${shellStyles.panel} ${shellStyles.panelLocked} ${styles.panel}`}
                            style={panelStyle}
                        >
                            <article className={`${styles.widget} ${styles.containerWidget}`}>
                                <p className={styles.badge}>
                                    <span className={styles.srOnly}>Container query state</span>
                                </p>
                                <div>
                                    <h4 className={styles.title}>Container-driven</h4>
                                    <p className={styles.copy}>
                                        This widget flips layout around 320px of panel width -- useful
                                        for sidebars, cards, and reusable components.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
                <p className={shellStyles.footer}>
                    Tip: keep the browser wide (above 768px) while moving the slider so the left widget
                    stays on its wide styles while the right one still adapts.
                </p>
            </div>
        </section>
    );
}
