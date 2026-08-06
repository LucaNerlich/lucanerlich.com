import type {ReactNode} from 'react';
import {useEffect, useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './StorageDemo.module.css';

const LOCAL_KEY = 'docs-demo:local-note';
const SESSION_KEY = 'docs-demo:session-note';

function readStore(store: Storage, key: string): string {
    try {
        return store.getItem(key) ?? '';
    } catch {
        return '';
    }
}

export default function StorageDemo(): ReactNode {
    const ids = {
        local: useId(),
        session: useId(),
    };
    const [localNote, setLocalNote] = useState('');
    const [sessionNote, setSessionNote] = useState('');
    const [status, setStatus] = useState('Notes stay in this browser only.');

    useEffect(() => {
        setLocalNote(readStore(window.localStorage, LOCAL_KEY));
        setSessionNote(readStore(window.sessionStorage, SESSION_KEY));
    }, []);

    const save = (target: 'local' | 'session') => {
        try {
            if (target === 'local') {
                window.localStorage.setItem(LOCAL_KEY, localNote);
                setStatus('Saved to localStorage. Reload the page -- it should still be here.');
            } else {
                window.sessionStorage.setItem(SESSION_KEY, sessionNote);
                setStatus('Saved to sessionStorage. Reload keeps it; a new tab starts empty.');
            }
        } catch {
            setStatus('Storage write failed (blocked or full).');
        }
    };

    const clearAll = () => {
        window.localStorage.removeItem(LOCAL_KEY);
        window.sessionStorage.removeItem(SESSION_KEY);
        setLocalNote('');
        setSessionNote('');
        setStatus('Cleared both demo keys.');
    };

    return (
        <DemoShell
            title="localStorage vs sessionStorage"
            hint="Save a note in each store, then reload or open a new tab to compare persistence."
            footer={status}
            controls={
                <div className={shell.buttonRow}>
                    <button type="button" className={shell.button} onClick={clearAll}>
                        Clear demo keys
                    </button>
                </div>
            }
        >
            <div className={styles.grid}>
                <label className={styles.card} htmlFor={ids.local}>
                    <span className={styles.label}>localStorage</span>
                    <textarea
                        id={ids.local}
                        className={styles.textarea}
                        rows={3}
                        value={localNote}
                        onChange={(event) => setLocalNote(event.target.value)}
                        placeholder="Survives reloads and new tabs"
                    />
                    <button
                        type="button"
                        className={`${shell.button} ${shell.buttonPrimary}`}
                        onClick={() => save('local')}
                    >
                        Save local
                    </button>
                </label>
                <label className={styles.card} htmlFor={ids.session}>
                    <span className={styles.label}>sessionStorage</span>
                    <textarea
                        id={ids.session}
                        className={styles.textarea}
                        rows={3}
                        value={sessionNote}
                        onChange={(event) => setSessionNote(event.target.value)}
                        placeholder="Survives reload, not a new tab"
                    />
                    <button
                        type="button"
                        className={`${shell.button} ${shell.buttonPrimary}`}
                        onClick={() => save('session')}
                    >
                        Save session
                    </button>
                </label>
            </div>
        </DemoShell>
    );
}
