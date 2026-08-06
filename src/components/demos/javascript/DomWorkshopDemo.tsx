import type {ReactNode} from 'react';
import {useId, useState} from 'react';

import DemoShell, {demoShellStyles as shell} from '../DemoShell';
import styles from './DomWorkshopDemo.module.css';

export default function DomWorkshopDemo(): ReactNode {
    const ids = {
        text: useId(),
        highlight: useId(),
    };
    const [draft, setDraft] = useState('Hello from the DOM');
    const [title, setTitle] = useState('Hello from the DOM');
    const [highlight, setHighlight] = useState(false);
    const [items, setItems] = useState(['Item 1', 'Item 2']);
    const [log, setLog] = useState('Ready. Use the controls to mutate the sample tree.');

    return (
        <DemoShell
            title="DOM workshop"
            hint="Each control mirrors a common DOM API. The sample tree updates immediately."
            footer={log}
            controls={
                <>
                    <label className={shell.control} htmlFor={ids.text}>
                        <span className={shell.controlLabel}>title text</span>
                        <input
                            id={ids.text}
                            className={shell.input}
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                        />
                    </label>
                    <div className={shell.buttonRow}>
                        <button
                            type="button"
                            className={`${shell.button} ${shell.buttonPrimary}`}
                            onClick={() => {
                                setTitle(draft);
                                setLog(`title.textContent = "${draft}"`);
                            }}
                        >
                            Set textContent
                        </button>
                        <button
                            type="button"
                            className={shell.button}
                            onClick={() => {
                                const next = `Item ${items.length + 1} (createElement)`;
                                setItems((current) => [...current, next]);
                                setLog('list.append(document.createElement("li"))');
                            }}
                        >
                            append item
                        </button>
                        <button
                            type="button"
                            className={shell.button}
                            onClick={() => {
                                if (items.length <= 1) {
                                    setLog('Kept at least one list item.');
                                    return;
                                }
                                setItems((current) => current.slice(0, -1));
                                setLog('list.lastElementChild.remove()');
                            }}
                        >
                            remove last
                        </button>
                    </div>
                    <label className={`${shell.control} ${shell.checkboxLabel}`} htmlFor={ids.highlight}>
                        <input
                            id={ids.highlight}
                            type="checkbox"
                            checked={highlight}
                            onChange={(event) => {
                                const checked = event.target.checked;
                                setHighlight(checked);
                                setLog(`card.classList.toggle("highlight", ${checked})`);
                            }}
                        />
                        classList toggle highlight
                    </label>
                </>
            }
        >
            <article className={`${styles.card} ${highlight ? styles.highlight : ''}`}>
                <h4 className={styles.title}>{title}</h4>
                <ul className={styles.list}>
                    {items.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </article>
        </DemoShell>
    );
}
