// Regression test for #586: the printed summary and the transfer list formatters
// both have to show a paid transfer as paid; they drifted once already.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {settlementSummaryText, transfersAsText} from './io';
import {createMessages} from './messages';
import type {AppState} from './types';

const paidState: AppState = {
    v: 2,
    currency: 'EUR',
    people: [
        {id: 'a', name: 'Alice'},
        {id: 'b', name: 'Bob'},
    ],
    expenses: [
        {
            id: 'e1',
            description: 'Lunch',
            cents: 1000,
            paidBy: 'a',
            participants: ['a', 'b'],
            split: {mode: 'equal'},
        },
    ],
    paidTransferKeys: ['b|a|500'],
};

const transfers = [{from: 'b', to: 'a', cents: 500}];
const en = createMessages('en');
const de = createMessages('de');

describe('transfer formatters', () => {
    it('marks a paid transfer in the list and the printed summary', () => {
        assert.match(transfersAsText(paidState, transfers, 'EUR', en), /\(paid\)$/);
        assert.match(settlementSummaryText(paidState, en), /- Bob → Alice: €5\.00 \(paid\)/);
    });

    it('leaves an unpaid transfer unmarked in both', () => {
        const unpaid: AppState = {...paidState, paidTransferKeys: []};
        assert.doesNotMatch(transfersAsText(unpaid, transfers, 'EUR', en), /\(paid\)/);
        assert.doesNotMatch(settlementSummaryText(unpaid, en), /\(paid\)/);
    });

    it('uses the active catalog for the printed and copied text', () => {
        assert.match(transfersAsText(paidState, transfers, 'EUR', de), /\(bezahlt\)$/m);
        assert.match(settlementSummaryText(paidState, de), /^Splitter-Abrechnung$/m);
        assert.match(settlementSummaryText(paidState, de), /^Gesamt: /m);
        assert.doesNotMatch(settlementSummaryText(paidState, de), /Balances|Transfers|Total:/);
    });
});
