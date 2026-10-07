import type {AppState, Currency} from './types';
import {decodeState, encodeState} from './urlState';
import {formatMoney, formatSignedMoney} from './money';
import {indexPeople, nameFrom} from './people';
import type {Transfer} from './settlement';
import {summarize} from './settlement';
import {transferKey} from './types';

export const exportJson = (state: AppState): string =>
    JSON.stringify(
        {
            format: 'lucanerlich.splitter',
            version: 2,
            encoded: encodeState(state),
            state,
        },
        null,
        2,
    );

export const importJson = (raw: string): AppState | null => {
    try {
        const data = JSON.parse(raw) as {
            encoded?: string;
            state?: AppState;
            people?: AppState['people'];
            expenses?: AppState['expenses'];
            currency?: Currency;
            paidTransferKeys?: string[];
        };
        if (typeof data.encoded === 'string') {
            return decodeState(data.encoded);
        }
        if (data.state && Array.isArray(data.state.people) && Array.isArray(data.state.expenses)) {
            return decodeState(
                encodeState({
                    ...data.state,
                    v: 2,
                    paidTransferKeys: data.state.paidTransferKeys ?? [],
                }),
            );
        }
        if (Array.isArray(data.people) && Array.isArray(data.expenses)) {
            return decodeState(
                encodeState({
                    v: 2,
                    currency: data.currency ?? 'EUR',
                    people: data.people,
                    expenses: data.expenses,
                    paidTransferKeys: data.paidTransferKeys ?? [],
                }),
            );
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
    return [header.join(','), ...rows].join('\n') + '\n';
};

const csvEscape = (value: string): string => {
    if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
    return value;
};

export const transfersAsText = (
    state: AppState,
    transfers: Transfer[],
    currency: Currency,
): string => {
    const names = indexPeople(state.people);
    if (transfers.length === 0) return 'Everyone is settled up.';
    return transfers
        .map(t => {
            const paid = state.paidTransferKeys.includes(transferKey(t.from, t.to, t.cents));
            const line = `${nameFrom(names, t.from)} → ${nameFrom(names, t.to)}: ${formatMoney(t.cents, currency)}`;
            return paid ? `${line} (paid)` : line;
        })
        .join('\n');
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
            lines.push(
                `- ${nameFrom(names, t.from)} → ${nameFrom(names, t.to)}: ${formatMoney(t.cents, state.currency)}`,
            );
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
    URL.revokeObjectURL(url);
};
