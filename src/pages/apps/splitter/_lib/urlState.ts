import type {AppState, Currency, Expense, Person, Split} from './types';
import {equalSplit, isCurrency, transferKey} from './types';
import {validateSplit} from './split';

// Compact wire formats.
// - Decode: legacy v1/v2 JSON-in-base64url, plus compressed v3 (`z.` prefix).
// - Encode: always v3 tuple JSON, deflate-raw compressed, `z.` + base64url.
// Share links use `?s=` (see SHARE_PARAM); `#…` still loads for old links.

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

/** Indexed split: person references are indexes into the people array. */
type WireSplitV3 =
    | 'eq'
    | ['sh', [number, number][]]
    | ['pct', [number, number][]]
    | ['ex', [number, number][]];

/**
 * v3 tuple wire (shorter JSON before compression):
 * [3, currency, people, expenses, paidTransfers]
 * Expense: [id, desc, cents, paidByIndex, participantIndexes|0, split]
 * `0` participants means everyone. Paid transfers: [fromIdx, toIdx, cents].
 */
type WireV3 = [
    3,
    string,
    WirePerson[],
    Array<[string, string, number, number, number[] | 0, WireSplitV3]>,
    Array<[number, number, number]>,
];

/** Prefix marking deflate-raw + base64url payloads. */
export const COMPRESSED_PREFIX = 'z.';

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

const splitToWireV3 = (split: Split, indexOf: Map<string, number>): WireSplitV3 => {
    if (split.mode === 'equal') return 'eq';
    const entries = (record: Record<string, number>): [number, number][] => {
        const out: [number, number][] = [];
        for (const [id, value] of Object.entries(record)) {
            const idx = indexOf.get(id);
            if (idx !== undefined) out.push([idx, value]);
        }
        return out;
    };
    if (split.mode === 'shares') return ['sh', entries(split.weights)];
    if (split.mode === 'percent') return ['pct', entries(split.percents)];
    return ['ex', entries(split.amounts)];
};

const splitFromWireV3 = (wire: WireSplitV3, people: Person[]): Split => {
    if (wire === 'eq' || wire == null) return equalSplit();
    if (!Array.isArray(wire)) return equalSplit();
    const [kind, entries] = wire;
    if (!Array.isArray(entries)) return equalSplit();
    const toRecord = (): Record<string, number> => {
        const record: Record<string, number> = {};
        for (const [idx, value] of entries) {
            const person = people[Number(idx)];
            if (person) record[person.id] = Number(value);
        }
        return record;
    };
    if (kind === 'sh') return {mode: 'shares', weights: toRecord()};
    if (kind === 'pct') return {mode: 'percent', percents: toRecord()};
    if (kind === 'ex') return {mode: 'exact', amounts: toRecord()};
    return equalSplit();
};

const toWireV3 = (state: AppState): WireV3 => {
    const indexOf = new Map(state.people.map((p, i) => [p.id, i]));
    const n = state.people.length;
    const participantWire = (participants: string[]): number[] | 0 => {
        const idxs = [...new Set(participants)]
            .map(id => indexOf.get(id))
            .filter((i): i is number => i !== undefined)
            .sort((a, b) => a - b);
        if (idxs.length === n && n > 0 && idxs.every((idx, i) => idx === i)) return 0;
        return idxs;
    };

    return [
        3,
        state.currency,
        state.people.map(p => [p.id, p.name]),
        state.expenses.map(e => [
            e.id,
            e.description,
            e.cents,
            indexOf.get(e.paidBy) ?? 0,
            participantWire(e.participants),
            splitToWireV3(e.split, indexOf),
        ]),
        state.paidTransferKeys
            .map(key => {
                const [from, to, centsRaw] = key.split('|');
                const fromIdx = indexOf.get(from);
                const toIdx = indexOf.get(to);
                const cents = Number(centsRaw);
                if (fromIdx === undefined || toIdx === undefined || !Number.isSafeInteger(cents)) {
                    return null;
                }
                return [fromIdx, toIdx, cents] as [number, number, number];
            })
            .filter((row): row is [number, number, number] => row !== null),
    ];
};

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
            const filteredParticipants = participants.length > 0
                ? [...new Set(participants)]
                : people.map(p => p.id);
            const split = splitFromWire(splitRaw);
            return {
                id: String(id),
                description: String(description),
                cents,
                paidBy: String(paidBy),
                participants: filteredParticipants,
                split: validateSplit(split, filteredParticipants, cents) ? equalSplit() : split,
            };
        });
    const currency: Currency = isCurrency(w.c) ? w.c : 'EUR';
    const paidTransferKeys = Array.isArray(w.t)
        ? w.t.map(String).filter(Boolean)
        : [];
    return {v: 2, currency, people, expenses, paidTransferKeys};
};

const fromWireV3 = (w: WireV3): AppState => {
    const people = peopleFromWire(w[2] ?? []);
    const personIds = new Set(people.map(p => p.id));
    const expensesRaw = Array.isArray(w[3]) ? w[3] : [];
    const expenses = expensesRaw
        .filter(row => {
            if (!Array.isArray(row)) return false;
            const cents = row[2];
            const paidBy = people[Number(row[3])]?.id;
            return Number.isSafeInteger(cents) && cents > 0 && !!paidBy && personIds.has(paidBy);
        })
        .map((row): Expense => {
            const [id, description, cents, paidByIdx, participantsRaw, splitRaw] = row;
            const paidBy = people[Number(paidByIdx)].id;
            let participants: string[];
            if (participantsRaw === 0) {
                participants = people.map(p => p.id);
            } else {
                participants = (Array.isArray(participantsRaw) ? participantsRaw : [])
                    .map(idx => people[Number(idx)]?.id)
                    .filter((pid): pid is string => !!pid && personIds.has(pid));
                participants = [...new Set(participants)];
                if (participants.length === 0) participants = people.map(p => p.id);
            }
            const split = splitFromWireV3(splitRaw, people);
            return {
                id: String(id),
                description: String(description),
                cents,
                paidBy,
                participants,
                split: validateSplit(split, participants, cents) ? equalSplit() : split,
            };
        });
    const currency: Currency = isCurrency(String(w[1])) ? (w[1] as Currency) : 'EUR';
    const paidTransferKeys = (Array.isArray(w[4]) ? w[4] : [])
        .map(row => {
            if (!Array.isArray(row) || row.length < 3) return null;
            const from = people[Number(row[0])]?.id;
            const to = people[Number(row[1])]?.id;
            const cents = Number(row[2]);
            if (!from || !to || !Number.isSafeInteger(cents) || cents <= 0) return null;
            return transferKey(from, to, cents);
        })
        .filter((key): key is string => !!key);
    return {v: 2, currency, people, expenses, paidTransferKeys};
};

const parseWire = (json: string): AppState | null => {
    const wire = JSON.parse(json) as WireV1 | WireV2 | WireV3;
    if (Array.isArray(wire)) {
        if (wire[0] === 3) return fromWireV3(wire as WireV3);
        return null;
    }
    if (!wire || !Array.isArray(wire.p) || !Array.isArray(wire.e)) return null;
    if (wire.v === 1) return fromWireV1(wire);
    if (wire.v === 2) return fromWireV2(wire);
    return null;
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

const deflateRaw = async (bytes: Uint8Array): Promise<Uint8Array> => {
    const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
};

const inflateRaw = async (bytes: Uint8Array): Promise<Uint8Array> => {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
};

/** Encode session for URLs: compressed v3 (`z.` + base64url(deflate-raw(json))). */
export const encodeState = async (state: AppState): Promise<string> => {
    const json = JSON.stringify(toWireV3(state));
    const compressed = await deflateRaw(new TextEncoder().encode(json));
    return COMPRESSED_PREFIX + toBase64Url(compressed);
};

/**
 * Decode session payloads:
 * - `z.…` → inflate + v3 (or unexpected JSON)
 * - bare base64url JSON → legacy v1/v2 (and uncompressed experiments)
 */
export const decodeState = async (encoded: string): Promise<AppState | null> => {
    if (!encoded) return null;
    try {
        if (encoded.startsWith(COMPRESSED_PREFIX)) {
            const compressed = fromBase64Url(encoded.slice(COMPRESSED_PREFIX.length));
            const json = new TextDecoder().decode(await inflateRaw(compressed));
            return parseWire(json);
        }
        const bytes = fromBase64Url(encoded);
        const json = new TextDecoder().decode(bytes);
        return parseWire(json);
    } catch {
        return null;
    }
};

// ------------------------------------------------------------------
// Shareable URL shape
// ------------------------------------------------------------------
// Prefer `?s=<payload>` over `#<payload>`. Chat apps (WhatsApp, etc.) often
// truncate the clickable URL at `#`, which drops hash-based sessions. Query
// params stay in the link. Legacy `#…` links still load via readEncodedFromUrl.

/** Query param that carries the encoded session payload. */
export const SHARE_PARAM = 's';

/**
 * Read an encoded session from a URL. Query `s` wins; bare hash is the
 * backward-compatible fallback for older shared links.
 */
export const readEncodedFromUrl = (url: URL): string => {
    const fromQuery = url.searchParams.get(SHARE_PARAM);
    if (fromQuery) return fromQuery;
    const hash = url.hash;
    return hash.startsWith('#') ? hash.slice(1) : hash;
};

/** Write (or clear) the session payload onto a URL using the query param. */
export const writeEncodedToUrl = (url: URL, encoded: string): URL => {
    const next = new URL(url.href);
    if (encoded) next.searchParams.set(SHARE_PARAM, encoded);
    else next.searchParams.delete(SHARE_PARAM);
    // Drop legacy hash so chat apps never see a `#` truncation point we rely on.
    next.hash = '';
    return next;
};

/** Build a WhatsApp-safe share URL for the current session. */
export const buildShareUrl = async (baseHref: string, state: AppState): Promise<string> =>
    writeEncodedToUrl(new URL(baseHref), await encodeState(state)).toString();
