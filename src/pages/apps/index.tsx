import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './apps.module.css';

type AppEntry = {
    slug: string;
    title: string;
    description: string;
    icon: string;
};

const APPS: AppEntry[] = [
    {
        slug: 'splitter',
        title: 'Splitter',
        description:
            'Who owes whom how much. Per-expense participants, unequal splits, multi-currency, shareable ?s= URL sessions.',
        icon: '🧮',
    },
];

export default function AppsIndex(): React.ReactElement {
    return (
        <Layout
            title="Apps"
            description="Small self-contained web apps."
        >
            <main className={styles.page}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Apps</h1>
                    <p className={styles.subtitle}>
                        Small, self-contained tools. No accounts, no backend - each app's
                        state lives entirely in your browser or its URL.
                    </p>
                </header>
                <ul className={styles.grid}>
                    {APPS.map(app => (
                        <li key={app.slug}>
                            <Link to={`/apps/${app.slug}/`} className={styles.card}>
                                <span className={styles.icon} aria-hidden>
                                    {app.icon}
                                </span>
                                <h2 className={styles.cardTitle}>{app.title}</h2>
                                <p className={styles.cardDescription}>{app.description}</p>
                                <span className={styles.cardOpen}>Open →</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </main>
        </Layout>
    );
}
