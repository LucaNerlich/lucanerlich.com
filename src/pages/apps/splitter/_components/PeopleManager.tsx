import React, {useEffect, useRef, useState} from 'react';
import type {Person} from '../_lib/types';
import type {Messages} from '../_lib/messages';
import styles from '../splitter.module.css';

type Props = {
    people: Person[];
    messages: Messages;
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
    onRename: (id: string, name: string) => void;
};

const PeopleManager: React.FC<Props> = ({
    people,
    messages,
    onAdd,
    onRemove,
    onRename,
}) => {
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const renameCancelled = useRef(false);
    // The chip button is replaced by the rename input, so the opener is a new
    // element after every close; keep the mounted ones and focus after render.
    const openerRefs = useRef(new Map<string, HTMLButtonElement>());
    const [refocusId, setRefocusId] = useState<string | null>(null);

    useEffect(() => {
        if (!refocusId) return;
        openerRefs.current.get(refocusId)?.focus();
        setRefocusId(null);
    }, [refocusId]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        const lower = trimmed.toLocaleLowerCase();
        if (people.some(p => p.name.toLocaleLowerCase() === lower)) {
            setError(messages.t('alreadyInList').replace('{name}', () => trimmed));
            return;
        }
        setError(null);
        onAdd(trimmed);
        setName('');
    };

    const startRename = (p: Person) => {
        renameCancelled.current = false;
        setEditingId(p.id);
        setEditName(p.name);
        setError(null);
    };

    // refocus is false for the blur path: the user moved focus somewhere
    // deliberate, so only Enter/Escape hand it back to the chip.
    const commitRename = (refocus = false) => {
        if (!editingId) return;
        const trimmed = editName.trim();
        if (!trimmed) {
            if (refocus) setRefocusId(editingId);
            setEditingId(null);
            return;
        }
        const lower = trimmed.toLocaleLowerCase();
        if (
            people.some(
                p => p.id !== editingId && p.name.toLocaleLowerCase() === lower,
            )
        ) {
            setError(messages.t('alreadyInList').replace('{name}', () => trimmed));
            return;
        }
        onRename(editingId, trimmed);
        if (refocus) setRefocusId(editingId);
        setEditingId(null);
    };

    return (
        <>
            <form onSubmit={submit} className={styles.tagInputWrap}>
                {people.map(p =>
                    editingId === p.id ? (
                        <span key={p.id} className={styles.chipEdit}>
                            <input
                                className={styles.tagInput}
                                value={editName}
                                autoFocus
                                aria-label={messages.t('renamePerson').replace('{name}', () => p.name)}
                                aria-invalid={error ? true : undefined}
                                onChange={e => setEditName(e.target.value)}
                                onBlur={() => {
                                    if (renameCancelled.current) {
                                        renameCancelled.current = false;
                                        return;
                                    }
                                    commitRename();
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        commitRename(true);
                                    }
                                    if (e.key === 'Escape') {
                                        renameCancelled.current = true;
                                        setRefocusId(editingId);
                                        setEditingId(null);
                                        setError(null);
                                    }
                                }}
                            />
                        </span>
                    ) : (
                        <span key={p.id} className={styles.chip}>
                            <button
                                type="button"
                                className={styles.chipName}
                                ref={el => {
                                    if (el) openerRefs.current.set(p.id, el);
                                }}
                                onClick={() => startRename(p)}
                                title={messages.t('rename')}
                            >
                                {p.name}
                            </button>
                            <button
                                type="button"
                                className={styles.chipRemove}
                                onClick={() => onRemove(p.id)}
                                aria-label={messages.t('removePerson').replace('{name}', () => p.name)}
                                title={messages.t('removePerson').replace('{name}', () => p.name)}
                            >
                                ×
                            </button>
                        </span>
                    ),
                )}
                <input
                    type="text"
                    value={name}
                    placeholder={people.length === 0 ? messages.t('addFirstPersonPlaceholder') : messages.t('addAnotherPlaceholder')}
                    onChange={e => {
                        setName(e.target.value);
                        if (error) setError(null);
                    }}
                    className={styles.tagInput}
                    aria-label={messages.t('personName')}
                    aria-invalid={error && !editingId ? true : undefined}
                />
                <button type="submit" className={styles.primaryButton}>
                    {messages.t('add')}
                </button>
            </form>
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </>
    );
};

export default PeopleManager;
