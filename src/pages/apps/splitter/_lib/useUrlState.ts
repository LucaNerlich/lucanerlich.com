// Reusable URL-persisted reducer.
//
// Owns the persistence lifecycle that was previously hand-wired into the view:
//   - hydrate from the store once on mount and on hashchange navigation
//   - debounce writes back to the store on every state change
//   - guard against writing before the first hydrate has run
//   - skip the initial write when no valid state was read from the URL, so
//     fresh visits don't gain a junk hash and foreign hashes survive
//
// The codec (encode/decode) and the store (read/write) are adapters, so the
// same interface drives the live URL hash in production and an in-memory store
// in tests or future apps.

import {useEffect, useReducer, useRef} from 'react';
import type {Dispatch, Reducer} from 'react';

export type Codec<S> = {
    encode: (state: S) => string;
    decode: (raw: string) => S | null;
};

export type StateStore = {
    read: () => string;
    write: (encoded: string) => void;
};

/**
 * Default store backed by the URL hash. Reads everything after `#`, and writes
 * via `history.replaceState` so it never adds browser history entries.
 */
export const hashStore = (): StateStore => ({
    read: () => window.location.hash.slice(1),
    write: encoded => {
        const newHash = '#' + encoded;
        if (window.location.hash !== newHash) {
            window.history.replaceState(
                null,
                '',
                window.location.pathname + window.location.search + newHash,
            );
        }
    },
});

type UseUrlStateArgs<S, A> = {
    reducer: Reducer<S, A>;
    init: () => S;
    codec: Codec<S>;
    /** Builds the action that loads a decoded state into the reducer. */
    hydrate: (decoded: S) => A;
    store?: StateStore;
    debounceMs?: number;
};

export function useUrlState<S, A>({
    reducer,
    init,
    codec,
    hydrate,
    store,
    debounceMs = 150,
}: UseUrlStateArgs<S, A>): [S, Dispatch<A>] {
    const [state, dispatch] = useReducer(reducer, undefined, init);
    const storeRef = useRef<StateStore | null>(null);
    const hydratedRef = useRef(false);
    const hadInitialStateRef = useRef(false);
    const wroteOnceRef = useRef(false);

    if (storeRef.current === null) {
        storeRef.current = store ?? hashStore();
    }

    useEffect(() => {
        const raw = storeRef.current!.read();
        if (raw) {
            const decoded = codec.decode(raw);
            if (decoded) {
                hadInitialStateRef.current = true;
                dispatch(hydrate(decoded));
            }
        }
        hydratedRef.current = true;
        // Mount-only hydrate; adapters are captured in refs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Writes go through replaceState and never fire hashchange, so
        // back/forward navigation between shared links is the only source.
        const onHashChange = () => {
            const raw = storeRef.current!.read();
            if (!raw) return;
            const decoded = codec.decode(raw);
            if (decoded) dispatch(hydrate(decoded));
        };
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hydratedRef.current) return;
        // Skip the initial write unless a valid state was hydrated: an empty
        // hash must stay empty and a foreign/corrupt hash (anchors, links
        // from other apps or versions) must not be clobbered. All writes
        // after user interaction behave as before.
        if (!wroteOnceRef.current && !hadInitialStateRef.current) {
            wroteOnceRef.current = true;
            return;
        }
        wroteOnceRef.current = true;
        const handle = window.setTimeout(() => {
            storeRef.current!.write(codec.encode(state));
        }, debounceMs);
        return () => window.clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, debounceMs]);

    return [state, dispatch];
}
