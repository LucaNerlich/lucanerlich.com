// ------------------------------------------------------------------
// Imports
// ------------------------------------------------------------------

import type {ReactNode} from 'react';

import ResizableDemoShell from './ResizableDemoShell';
import styles from './ContainerVsMediaDemo.module.css';

// ------------------------------------------------------------------
// Component
// ------------------------------------------------------------------

export default function ContainerVsMediaDemo(): ReactNode {
    return (
        <ResizableDemoShell
            title="Same slot width, different query type"
            ariaLabel="Container queries vs media queries"
            hint="Use the slider to resize the shared slot. The media-query widget only changes when the viewport crosses 768px. The container-query widget changes with the slot."
            initialWidth={360}
            minWidth={200}
            maxWidth={520}
            sliderLabel="Slot width"
            lockedPanel
            footer="Tip: keep the browser wide (above 768px) while moving the slider so the left widget stays on its wide styles while the right one still adapts."
        >
            {(renderPanel) => (
                <div className={styles.grid}>
                    <div className={styles.column}>
                        <p className={styles.label}>@media (viewport)</p>
                        {renderPanel(
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
                            </article>,
                        )}
                    </div>
                    <div className={styles.column}>
                        <p className={styles.label}>@container (slot)</p>
                        {renderPanel(
                            <article className={`${styles.widget} ${styles.containerWidget}`}>
                                <p className={styles.badge}>
                                    <span className={styles.srOnly}>Container query state</span>
                                </p>
                                <div>
                                    <h4 className={styles.title}>Container-driven</h4>
                                    <p className={styles.copy}>
                                        This widget flips layout when the panel is about 320px
                                        wide (a 290px container) -- useful for sidebars, cards,
                                        and reusable components.
                                    </p>
                                </div>
                            </article>,
                            styles.panel,
                        )}
                    </div>
                </div>
            )}
        </ResizableDemoShell>
    );
}
