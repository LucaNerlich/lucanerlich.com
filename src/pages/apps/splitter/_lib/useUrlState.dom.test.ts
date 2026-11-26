// The hydrate generation is what remounts the local-stateful components when
// a session is replaced with one that reuses the same ids (demo reload,
// popstate). This is the only DOM test in the suite: React needs a document,
// so it installs happy-dom's globals before importing react-dom.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {Window} from 'happy-dom';

const window = new Window({url: 'https://example.com/apps/splitter/'});
const globals = globalThis as unknown as Record<string, unknown>;
globals.window = window;
globals.document = window.document;
Object.defineProperty(globalThis, 'navigator', {value: window.navigator, configurable: true});
globals.HTMLElement = window.HTMLElement;
globals.Node = window.Node;
globals.Event = window.Event;
globals.IS_REACT_ACT_ENVIRONMENT = true;

const {act, createElement, useState} = await import('react');
const {createRoot} = await import('react-dom/client');
const {useUrlState} = await import('./useUrlState');

type Action = {type: 'HYDRATE'; state: number};
type Api = {dispatch: (action: Action) => void; ready: boolean; hydrations: number};

let mounts = 0;
let api: Api | null = null;

const Child = () => {
    const [mount] = useState(() => ++mounts);
    return createElement('span', {'data-mount': mount}, String(mount));
};

const Harness = () => {
    const [, dispatch, ready, hydrations] = useUrlState<number, Action>({
        reducer: (current, action) => (action.type === 'HYDRATE' ? action.state : current),
        init: () => 0,
        codec: {encode: value => String(value), decode: raw => (raw ? Number(raw) : null)},
        hydrate: decoded => ({type: 'HYDRATE', state: decoded}),
        isHydrate: action => action.type === 'HYDRATE',
        store: {read: () => '', write: () => {}},
        debounceMs: 0,
    });
    api = {dispatch, ready, hydrations};
    return createElement('div', null, createElement(Child, {key: hydrations}));
};

describe('useUrlState hydrate generation', () => {
    it('remounts keyed children for two hydrates with identical ids', async () => {
        const container = window.document.createElement('div');
        window.document.body.appendChild(container);
        const root = createRoot(container);
        await act(async () => {
            root.render(createElement(Harness));
        });
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
        });
        assert.equal(api?.ready, true, 'mount hydrate finished');

        const before = mounts;
        await act(async () => {
            api?.dispatch({type: 'HYDRATE', state: 42});
        });
        assert.equal(api?.hydrations, 1);
        await act(async () => {
            api?.dispatch({type: 'HYDRATE', state: 42});
        });
        assert.equal(api?.hydrations, 2);
        assert.equal(mounts, before + 2, 'the keyed child remounted for each hydrate');

        await act(async () => {
            root.unmount();
        });
        window.close();
    });
});
