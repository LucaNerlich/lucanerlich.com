import type {AppState, Currency, Expense, Person, Split} from './types';
import {equalSplit, isCurrency} from './types';

// Compact wire formats. v1 links keep working; everything encodes as v2.

type WirePerson = [string, string];
type WireExpenseV1 = [string, string, number, string];
type WireSplit =
    | 'eq'
    | ['sh', [string, number][]]
    | ['pct', [string, number][]]
    | ['ex', [string, number][]];
type WireExpenseV2 = [string, string, number, string, string[], WireSplit];

type WireV1 = {
    v: 1;
    c: string;
    p: WirePerson[];
    e: WireExpenseV1[];
};

type WireV2 = {
    v: 2;
    c: string;
    p: WirePerson[];
    e: WireExpenseV2[];
    t?: string[];
};

const splitToWire = (split: Split): WireSplit => {
    if (split.mode === 'equal') return 'eq';
    if (split.mode === 'shares') {
        return ['sh', Object.entries(split.weights)];
    }
    if (split.mode === 'percent') {
        return ['pct', Object.entries(split.percents)];
    }
    return ['ex', Object.entries(split.amounts)];
};

const splitFromWire = (wire: WireSplit): Split => {
    if (wire === 'eq' || wire == null) return equalSplit();
    if (!Array.isArray(wire)) return equalSplit();
    const [kind, entries] = wire;
    if (!Array.isArray(entries)) return equalSplit();
    if (kind === 'sh') {
        const weights: Record<string, number> = {};
        for (const [id, w] of entries) weights[String(id)] = Number(w);
        return {mode: 'shares', weights};
    }
    if (kind === 'pct') {
        const percents: Record<string, number> = {};
        for (const [id, p] of entries) percents[String(id)] = Number(p);
        return {mode: 'percent', percents};
    }
    if (kind === 'ex') {
        const amounts: Record<string, number> = {};
        for (const [id, a] of entries) amounts[String(id)] = Number(a);
        return {mode: 'exact', amounts};
    }
    return equalSplit();
};

const peopleFromWire = (rows: WirePerson[]): Person[] => {
    const seen = new Set<string>();
    return rows
        .map(([id, name]): Person => ({id: String(id), name: String(name)}))
        .filter(p => {
            if (seen.has(p.id)) return false;
            seen.add(p.id);
            return true;
        });
};

const toWire = (state: AppState): WireV2 => ({
    v: 2,
    c: state.currency,
    p: state.people.map(p => [p.id, p.name]),
    e: state.expenses.map(e => [
        e.id,
        e.description,
        e.cents,
        e.paidBy,
        e.participants,
        splitToWire(e.split),
    ]),
    t: state.paidTransferKeys,
});

const fromWireV1 = (w: WireV1): AppState => {
    const people = peopleFromWire(w.p);
    const personIds = new Set(people.map(p => p.id));
    const allIds = people.map(p => p.id);
    const expenses = w.e
        .filter(([, , cents, paidBy]) =>
            Number.isSafeInteger(cents) && cents > 0 && personIds.has(String(paidBy)),
        )
        .map(([id, description, cents, paidBy]): Expense => ({
            id: String(id),
            description: String(description),
            cents,
            paidBy: String(paidBy),
            participants: [...allIds],
            split: equalSplit(),
        }));
    const currency: Currency = isCurrency(w.c) ? w.c : 'EUR';
    return {v: 2, currency, people, expenses, paidTransferKeys: []};
};

const fromWireV2 = (w: WireV2): AppState => {
    const people = peopleFromWire(w.p);
    const personIds = new Set(people.map(p => p.id));
    const expenses = w.e
        .filter(row => {
            const cents = row[2];
            const paidBy = String(row[3]);
            return Number.isSafeInteger(cents) && cents > 0 && personIds.has(paidBy);
        })
        .map((row): Expense => {
            const [id, description, cents, paidBy, participantsRaw, splitRaw] = row;
            const participants = (Array.isArray(participantsRaw) ? participantsRaw : [])
                .map(String)
                .filter(pid => personIds.has(pid));
            const fallback = people.map(p => p.id);
            return {
                id: String(id),
                description: String(description),
                cents,
                paidBy: String(paidBy),
                participants: participants.length > 0 ? [...new Set(participants)] : fallback,
                split: splitFromWire(splitRaw),
            };
        });
    const currency: Currency = isCurrency(w.c) ? w.c : 'EUR';
    const paidTransferKeys = Array.isArray(w.t)
        ? w.t.map(String).filter(Boolean)
        : [];
    return {v: 2, currency, people, expenses, paidTransferKeys};
};

const toBase64Url = (bytes: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (s: string): Uint8Array => {
    const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
    const b64 = s.replace(/-/g, '+').replace(/\//g, '/') + pad;
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
        const wire = JSON.parse(json) as WireV1 | WireV2;
        if (!wire || !Array.isArray(wire.p) || !Array.isArray(wire.e)) return null;
        if (wire.v === 1) return fromWireV1(wire);
        if (wire.v === 2) return fromWireV2(wire);
        return null;
    } catch {
        return null;
    }
};
