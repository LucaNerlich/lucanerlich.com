// Reusable URL-persisted reducer.
//
// Owns the persistence lifecycle that was previously hand-wired into the view:
//   - hydrate from the store once on mount (falling back to an optional
//     secondary store such as localStorage) and on browser navigation
//   - debounce writes back to the store(s) on every state change
//   - guard against writing before the first hydrate has run
//   - skip the initial write when no valid state was read from the URL, so
//     fresh visits don't gain a junk query/hash and foreign URLs survive
//
// The codec (encode/decode) and the store (read/write) are adapters, so the
// same interface drives the live URL in production and an in-memory store
// in tests or future apps. Encode/decode may be async (compressed payloads).

import {useEffect, useReducer, useRef, useState} from 'react';
import type {Dispatch, Reducer} from 'react';
import {readEncodedFromUrl, writeEncodedToUrl} from './urlState';

export type Codec<S> = {
    encode: (state: S) => string | Promise<string>;
    decode: (raw: string) => S | null | Promise<S | null>;
};

export type StateStore = {
    read: () => string;
    write: (encoded: string) => void;
};

/**
 * Legacy store backed by the URL hash. Prefer `queryStore` for shareable
 * links -- chat apps often truncate clickable URLs at `#`.
 */
export const hashStore = (): StateStore => ({
    read: () => window.location.hash.slice(1),
    write: encoded => {
        const newHash = encoded ? '#' + encoded : '';
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
 * Store backed by the `?s=` query param (see `SHARE_PARAM`). Reads fall back
 * to a legacy `#…` hash so older shared links still open. Writes always use
 * the query param and clear the hash.
 */
export const queryStore = (): StateStore => ({
    read: () => readEncodedFromUrl(new URL(window.location.href)),
    write: encoded => {
        const next = writeEncodedToUrl(new URL(window.location.href), encoded);
        const href = next.pathname + next.search + next.hash;
        const current =
            window.location.pathname + window.location.search + window.location.hash;
        if (href !== current) {
            window.history.replaceState(null, '', href);
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
            // storage unavailable or full - the URL still holds the state
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
    const [ready, setReady] = useState(false);
    const storeRef = useRef<StateStore | null>(null);
    const fallbackRef = useRef<StateStore | undefined>(fallbackStore);
    const hadInitialStateRef = useRef(false);
    const wroteOnceRef = useRef(false);
    const codecRef = useRef(codec);
    codecRef.current = codec;

    if (storeRef.current === null) {
        // Default to query-param persistence so freshly shared links survive
        // chat-app URL truncation at `#`.
        storeRef.current = store ?? queryStore();
    }

    useEffect(() => {
        let cancelled = false;
        void (async () => {
            // A valid shared link always wins; the fallback store only restores
            // the last session when the URL carries no usable state.
            for (const source of [storeRef.current!, fallbackRef.current]) {
                const raw = source?.read();
                if (!raw) continue;
                const decoded = await Promise.resolve(codecRef.current.decode(raw));
                if (cancelled) return;
                if (decoded) {
                    hadInitialStateRef.current = true;
                    dispatch(hydrate(decoded));
                    break;
                }
            }
            if (!cancelled) setReady(true);
        })();
        return () => {
            cancelled = true;
        };
        // Mount-only hydrate; adapters are captured in refs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Writes go through replaceState. Back/forward between shared links
        // fires popstate (query) and, for legacy links, hashchange.
        let navigationSequence = 0;
        let cancelled = false;
        const onNavigate = () => {
            const sequence = ++navigationSequence;
            void (async () => {
                const raw = storeRef.current!.read();
                // An empty URL payload keeps the current state on purpose: it is
                // also the last session in the fallback store, so resetting here
                // would wipe it.
                if (!raw) return;
                const decoded = await Promise.resolve(codecRef.current.decode(raw));
                if (!cancelled && sequence === navigationSequence && decoded) {
                    dispatch(hydrate(decoded));
                }
            })();
        };
        window.addEventListener('popstate', onNavigate);
        window.addEventListener('hashchange', onNavigate);
        return () => {
            cancelled = true;
            window.removeEventListener('popstate', onNavigate);
            window.removeEventListener('hashchange', onNavigate);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!ready) return;
        // Skip the initial write unless a valid state was hydrated: an empty
        // URL must stay empty and a foreign/corrupt fragment (anchors, links
        // from other apps or versions) must not be clobbered. All writes
        // after user interaction behave as before.
        if (!wroteOnceRef.current && !hadInitialStateRef.current) {
            wroteOnceRef.current = true;
            return;
        }
        wroteOnceRef.current = true;
        const scheduledUrl = window.location.href;
        let cancelled = false;
        const handle = window.setTimeout(() => {
            void (async () => {
                const encoded = await Promise.resolve(codecRef.current.encode(state));
                if (cancelled || window.location.href !== scheduledUrl) return;
                storeRef.current!.write(encoded);
                fallbackRef.current?.write(encoded);
            })();
        }, debounceMs);
        return () => {
            cancelled = true;
            window.clearTimeout(handle);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state, debounceMs, ready]);

    return [state, dispatch];
}
