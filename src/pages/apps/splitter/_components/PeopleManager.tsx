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
    const [error, setError] = useState<string | null>(null);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        const lower = trimmed.toLocaleLowerCase();
        if (people.some(p => p.name.toLocaleLowerCase() === lower)) {
            setError(`${trimmed} is already in the list.`);
            return;
        }
        setError(null);
        onAdd(trimmed);
        setName('');
    };

    return (
        <>
            <form onSubmit={submit} className={styles.tagInputWrap}>
                {people.map(p => (
                    <span key={p.id} className={styles.chip}>
                        {p.name}
                        <button
                            type="button"
                            className={styles.chipRemove}
                            onClick={() => onRemove(p.id)}
                            aria-label={`Remove ${p.name}`}
                            title={`Remove ${p.name}`}
                        >
                            ×
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={name}
                    placeholder={people.length === 0 ? 'Add first person…' : 'Add another…'}
                    onChange={e => {
                        setName(e.target.value);
                        if (error) setError(null);
                    }}
                    className={styles.tagInput}
                    aria-label="Person's name"
                    aria-invalid={error ? true : undefined}
                />
                <button type="submit" className={styles.primaryButton}>
                    Add
                </button>
            </form>
            {error && <p className={styles.error} role="alert">{error}</p>}
        </>
    );
};

export default PeopleManager;
