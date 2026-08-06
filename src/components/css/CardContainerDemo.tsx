import type {ReactNode} from 'react';

import ResizableDemoShell from './ResizableDemoShell';
import styles from './CardContainerDemo.module.css';

export default function CardContainerDemo(): ReactNode {
    return (
        <ResizableDemoShell
            title="Card that adapts to its container"
            footer="At about 380px the card switches from stacked to horizontal. The title uses cqi units."
            initialWidth={460}
        >
            <div className={styles.container}>
                <article className={styles.card}>
                    <div className={styles.media} aria-hidden="true" />
                    <div className={styles.body}>
                        <p className={styles.kicker}>Component</p>
                        <h4 className={styles.title}>Same card, different slot sizes</h4>
                        <p className={styles.copy}>
                            This layout responds to the panel width -- not the browser viewport. Drop the
                            same component in a sidebar or a main column and it still fits.
                        </p>
                        <p className={styles.meta}>powered by @container</p>
                    </div>
                </article>
            </div>
        </ResizableDemoShell>
    );
}
