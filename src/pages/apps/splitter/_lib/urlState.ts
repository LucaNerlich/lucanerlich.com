import type {AppState, Expense, Person} from './types';

type WirePerson = [string, string];
type WireExpense = [string, string, number, string];

type Wire = {
    v: 1;
    c: string;
    p: WirePerson[];
    e: WireExpense[];
};

const toWire = (state: AppState): Wire => ({
    v: 1,
    c: state.currency,
    p: state.people.map(p => [p.id, p.name]),
    e: state.expenses.map(e => [e.id, e.description, e.cents, e.paidBy]),
});

const fromWire = (w: Wire): AppState => {
    const seen = new Set<string>();
    const people = w.p
        .map(([id, name]): Person => ({id: String(id), name: String(name)}))
        .filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });
    const personIds = new Set(people.map(p => p.id));
    // Drop anything that would break the settlement math: expenses paid by an
    // unknown person and non-positive or non-safe cent values. Validating here
    // keeps `computeBalances` and `summarize` seeing the same expense set.
    const expenses = w.e
        .filter(([, , cents, paidBy]) => Number.isSafeInteger(cents) && cents > 0 && personIds.has(String(paidBy)))
        .map(([id, description, cents, paidBy]): Expense => ({
            id: String(id),
            description: String(description),
            cents,
            paidBy: String(paidBy),
        }));
    return {v: 1, currency: 'EUR', people, expenses};
};

const toBase64Url = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (s: string): Uint8Array => {
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
};

export const encodeState = (state: AppState): string => {
    const json = JSON.stringify(toWire(state));
    const bytes = new TextEncoder().encode(json);
    return toBase64Url(bytes);
};

export const decodeState = (encoded: string): AppState | null => {
    if (!encoded) return null;
    try {
        const bytes = fromBase64Url(encoded);
        const json = new TextDecoder().decode(bytes);
        const wire = JSON.parse(json) as Wire;
        if (!wire || wire.v !== 1 || !Array.isArray(wire.p) || !Array.isArray(wire.e)) {
            return null;
        }
        return fromWire(wire);
    } catch {
        return null;
    }
};
