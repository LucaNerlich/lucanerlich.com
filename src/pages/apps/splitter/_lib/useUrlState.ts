// Reusable URL-persisted reducer.
//
// Owns the persistence lifecycle that was previously hand-wired into the view:
//   - hydrate from the store once on mount (falling back to an optional
//     secondary store such as localStorage) and on hashchange navigation
//   - debounce writes back to the store(s) on every state change
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

/**
 * Store backed by `localStorage` under `key`. Storage can be unavailable
 * (private mode, disabled cookies, quota), so every access fails soft: reads
 * fall back to an empty string and failed writes are dropped.
 */
export const localStore = (key: string): StateStore => ({
    read: () => {
        try {
            return window.localStorage.getItem(key) ?? '';
        } catch {
            return '';
        }
    },
    write: encoded => {
        try {
            window.localStorage.setItem(key, encoded);
        } catch {
            // storage unavailable or full - the URL hash still holds the state
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
    /**
     * Optional secondary store (e.g. localStorage). Read on mount only when
     * the primary store holds no valid state; written alongside the primary.
     */
    fallbackStore?: StateStore;
    debounceMs?: number;
};

export function useUrlState<S, A>({
    reducer,
    init,
    codec,
    hydrate,
    store,
    fallbackStore,
    debounceMs = 150,
}: UseUrlStateArgs<S, A>): [S, Dispatch<A>] {
    const [state, dispatch] = useReducer(reducer, undefined, init);
    const storeRef = useRef<StateStore | null>(null);
    const fallbackRef = useRef<StateStore | undefined>(fallbackStore);
    const hydratedRef = useRef(false);
    const hadInitialStateRef = useRef(false);
    const wroteOnceRef = useRef(false);

    if (storeRef.current === null) {
        storeRef.current = store ?? hashStore();
    }

    useEffect(() => {
        // A valid shared link always wins; the fallback store only restores
        // the last session when the URL carries no usable state.
        for (const source of [storeRef.current!, fallbackRef.current]) {
            const raw = source?.read();
            if (!raw) continue;
            const decoded = codec.decode(raw);
            if (decoded) {
                hadInitialStateRef.current = true;
                dispatch(hydrate(decoded));
                break;
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
            // An empty hash keeps the current state on purpose: it is also the
            // last session in the fallback store, so resetting here would wipe it.
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
            const encoded = codec.encode(state);
            storeRef.current!.write(encoded);
            fallbackRef.current?.write(encoded);
        }, debounceMs);
        return () => window.clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, debounceMs]);

    return [state, dispatch];
}
