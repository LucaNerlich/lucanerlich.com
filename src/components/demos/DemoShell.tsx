import type {ReactNode} from 'react';

import styles from './DemoShell.module.css';

type DemoShellProps = {
    title: string;
    hint?: string;
    controls?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
};

export default function DemoShell({
    title,
    hint,
    controls,
    footer,
    children,
}: DemoShellProps): ReactNode {
    return (
        <section className={styles.shell} aria-label={title}>
            <div className={styles.header}>
                <h3 className={styles.title}>{title}</h3>
                {hint ? <p className={styles.hint}>{hint}</p> : null}
            </div>
            {controls ? <div className={styles.controls}>{controls}</div> : null}
            <div className={styles.body}>{children}</div>
            {footer ? <p className={styles.footer}>{footer}</p> : null}
        </section>
    );
}

export {styles as demoShellStyles};
