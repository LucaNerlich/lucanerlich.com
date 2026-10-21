import type {AppState, Currency, Expense} from './types';
import {decodeState, encodeState} from './urlState';
import {formatMoney, formatSignedMoney} from './money';
import {indexPeople, nameFrom} from './people';
import type {Transfer} from './settlement';
import {summarize} from './settlement';
import {validateSplit} from './split';
import {isCurrency, transferKey} from './types';

// Normalization drops anything it cannot resolve, so a file must be valid
// before it is encoded: otherwise a restore reports success after losing rows
// or silently rewriting a split. Leniency stays in decodeState for shared links.
const isRestorable = (state: {
    currency: Currency;
    people: AppState['people'];
    expenses: Expense[];
    paidTransferKeys: string[];
}): boolean => {
    const ids = new Set(state.people.map(p => p.id));
    if (ids.size !== state.people.length) return false;
    // A duplicate expense id makes the reducer edit and delete both rows at once.
    if (new Set(state.expenses.map(e => e.id)).size !== state.expenses.length) return false;
    if (!isCurrency(state.currency)) return false;
    const validExpense = (e: Expense): boolean =>
        Number.isSafeInteger(e.cents)
        && e.cents > 0
        && ids.has(e.paidBy)
        && e.participants.length > 0
        && new Set(e.participants).size === e.participants.length
        && e.participants.every(id => ids.has(id))
        && !validateSplit(e.split, e.participants, e.cents);
    const validKey = (key: string): boolean => {
        const [from, to, cents] = key.split('|');
        return ids.has(from)
            && ids.has(to)
            && Number.isSafeInteger(Number(cents))
            && Number(cents) > 0;
    };
    return state.expenses.every(validExpense) && state.paidTransferKeys.every(validKey);
};

export const exportJson = async (state: AppState): Promise<string> =>
    JSON.stringify(
        {
            format: 'lucanerlich.splitter',
            version: 2,
            encoded: await encodeState(state),
            state,
        },
        null,
        2,
    );

export const importJson = async (raw: string): Promise<AppState | null> => {
    try {
        const data = JSON.parse(raw) as {
            encoded?: string;
            state?: AppState;
            people?: AppState['people'];
            expenses?: AppState['expenses'];
            currency?: Currency;
            paidTransferKeys?: string[];
        };
        if ('state' in data) {
            if (!data.state || !Array.isArray(data.state.people) || !Array.isArray(data.state.expenses)) {
                return null;
            }
            const source = {
                ...data.state,
                v: 2 as const,
                paidTransferKeys: data.state.paidTransferKeys ?? [],
            };
            if (!isRestorable(source)) return null;
            // Prefer the editable `state` object (may be newer than `encoded`),
            // and normalize through encode/decode so invariants hold.
            const decoded = await decodeState(await encodeState(source));
            // Counts are a backstop for anything normalization still drops.
            return decoded
                && decoded.people.length === source.people.length
                && decoded.expenses.length === source.expenses.length
                ? decoded
                : null;
        }
        if (typeof data.encoded === 'string') {
            return decodeState(data.encoded);
        }
        if (Array.isArray(data.people) && Array.isArray(data.expenses)) {
            const source = {
                v: 2 as const,
                currency: data.currency ?? ('EUR' as const),
                people: data.people,
                expenses: data.expenses,
                paidTransferKeys: data.paidTransferKeys ?? [],
            };
            if (!isRestorable(source)) return null;
            const decoded = await decodeState(await encodeState(source));
            return decoded
                && decoded.people.length === source.people.length
                && decoded.expenses.length === source.expenses.length
                ? decoded
                : null;
        }
        return null;
    } catch {
        return null;
    }
};

export const exportCsv = (state: AppState): string => {
    const names = indexPeople(state.people);
    const header = ['description', 'amount', 'currency', 'paid_by', 'participants', 'split_mode'];
    const rows = state.expenses.map(e => {
        const participants = e.participants.map(id => nameFrom(names, id)).join(';');
        const amount = (e.cents / 100).toFixed(2);
        return [
            csvEscape(e.description),
            amount,
            state.currency,
            csvEscape(nameFrom(names, e.paidBy)),
            csvEscape(participants),
            e.split.mode,
        ].join(',');
    });
    // Excel on Windows reads a BOM-less UTF-8 CSV with the ANSI codepage.
    return '\uFEFF' + [header.join(','), ...rows].join('\n') + '\n';
};

const csvEscape = (value: string): string => {
    const literal = /^[=+@\-\t\r\n]/.test(value) ? `'${value}` : value;
    return `"${literal.replace(/"/g, '""')}"`;
};

const transferLine = (
    state: AppState,
    names: ReturnType<typeof indexPeople>,
    transfer: Transfer,
    currency: Currency,
): string => {
    const line = `${nameFrom(names, transfer.from)} → ${nameFrom(names, transfer.to)}: ${formatMoney(transfer.cents, currency)}`;
    return state.paidTransferKeys.includes(transferKey(transfer.from, transfer.to, transfer.cents))
        ? `${line} (paid)`
        : line;
};

export const transfersAsText = (
    state: AppState,
    transfers: Transfer[],
    currency: Currency,
): string => {
    const names = indexPeople(state.people);
    if (transfers.length === 0) return 'Everyone is settled up.';
    return transfers.map(t => transferLine(state, names, t, currency)).join('\n');
};

export const settlementSummaryText = (state: AppState): string => {
    const {totalCents, balances, transfers} = summarize(state);
    const names = indexPeople(state.people);
    const lines: string[] = [
        'Splitter settlement',
        `Currency: ${state.currency}`,
        `Total: ${formatMoney(totalCents, state.currency)}`,
        '',
        'Balances:',
    ];
    for (const p of state.people) {
        const net = balances.get(p.id) ?? 0;
        lines.push(`- ${p.name}: ${formatSignedMoney(net, state.currency)}`);
    }
    lines.push('', 'Transfers:');
    if (transfers.length === 0) {
        lines.push('- Everyone is settled up.');
    } else {
        for (const t of transfers) {
            lines.push(`- ${transferLine(state, names, t, state.currency)}`);
        }
    }
    return lines.join('\n');
};

export const downloadText = (filename: string, text: string, mime: string): void => {
    const blob = new Blob([text], {type: mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    // Revoking in the same task can cancel a download the browser has not
    // started yet (Chromium 41380177, Mozilla 1282407).
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
};
