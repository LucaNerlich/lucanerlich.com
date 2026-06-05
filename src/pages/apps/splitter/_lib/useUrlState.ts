// Reusable URL-persisted reducer.
//
// Owns the persistence lifecycle that was previously hand-wired into the view:
//   - hydrate from the store once on mount
//   - debounce writes back to the store on every state change
//   - guard against writing before the first hydrate has run
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

    if (storeRef.current === null) {
        storeRef.current = store ?? hashStore();
    }

    useEffect(() => {
        const raw = storeRef.current!.read();
        if (raw) {
            const decoded = codec.decode(raw);
            if (decoded) dispatch(hydrate(decoded));
        }
        hydratedRef.current = true;
        // Mount-only hydrate; adapters are captured in refs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!hydratedRef.current) return;
        const handle = window.setTimeout(() => {
            storeRef.current!.write(codec.encode(state));
        }, debounceMs);
        return () => window.clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, debounceMs]);

    return [state, dispatch];
}
