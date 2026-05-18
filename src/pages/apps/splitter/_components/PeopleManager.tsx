import React, {useState} from 'react';
import type {Person} from '../_lib/types';
import styles from '../splitter.module.css';

type Props = {
    people: Person[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
};

const PeopleManager: React.FC<Props> = ({people, onAdd, onRemove}) => {
    const [name, setName] = useState('');

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        onAdd(trimmed);
        setName('');
    };

    return (
        <div>
            <form onSubmit={submit} className={styles.inlineForm}>
                <input
                    type="text"
                    value={name}
                    placeholder="Person's name"
                    onChange={e => setName(e.target.value)}
                    className={styles.input}
                    aria-label="Person's name"
                />
                <button type="submit" className={styles.primaryButton}>
                    Add person
                </button>
            </form>
            {people.length === 0 ? (
                <p className={styles.muted}>Add at least two people to start splitting.</p>
            ) : (
                <ul className={styles.chips}>
                    {people.map(p => (
                        <li key={p.id} className={styles.chip}>
                            <span>{p.name}</span>
                            <button
                                type="button"
                                className={styles.chipRemove}
                                onClick={() => onRemove(p.id)}
                                aria-label={`Remove ${p.name}`}
                                title={`Remove ${p.name}`}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PeopleManager;
