import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {buildExpenseInput, type SplitDraft} from './expenseInput';

const draft = (overrides: Partial<SplitDraft> = {}): SplitDraft => ({
    participants: ['a', 'b'],
    splitMode: 'equal',
    weights: {},
    percents: {},
    amounts: {},
    ...overrides,
});

describe('buildExpenseInput error precedence', () => {
    it('rejects a malformed amount before every other check', () => {
        const result = buildExpenseInput(draft({participants: []}), '', 'abc', '', 'EUR');
        assert.equal(result.input, null);
        assert.match(result.error ?? '', /^Enter an amount like /);
    });

    it('rejects a non-positive amount before the payer check', () => {
        const result = buildExpenseInput(draft(), '', '0', '', 'EUR');
        assert.equal(result.input, null);
        assert.equal(result.error, 'Amount must be greater than 0.');
    });

    it('requires a payer before building the split', () => {
        const result = buildExpenseInput(draft({participants: []}), '', '12.50', '', 'EUR');
        assert.equal(result.input, null);
        assert.equal(result.error, 'Choose who paid.');
    });

    it('reports split build errors after the payer check', () => {
        const result = buildExpenseInput(draft({participants: []}), '', '12.50', 'a', 'EUR');
        assert.equal(result.input, null);
        assert.equal(result.error, 'Pick at least one participant.');
    });

    it('reports split validation errors last', () => {
        const result = buildExpenseInput(
            draft({splitMode: 'percent', percents: {a: '50', b: '40'}}),
            '',
            '12.50',
            'a',
            'EUR',
        );
        assert.equal(result.input, null);
        assert.equal(result.error, 'Percents must sum to 100 (currently 90).');
    });

    it('rejects a blank percent instead of saving it as a zero share', () => {
        const result = buildExpenseInput(
            draft({splitMode: 'percent', percents: {a: '100', b: ''}}),
            '',
            '12.50',
            'a',
            'EUR',
        );
        assert.equal(result.input, null);
        assert.equal(result.error, 'Every participant needs a percent.');

        const explicitZero = buildExpenseInput(
            draft({splitMode: 'percent', percents: {a: '100', b: '0'}}),
            '',
            '12.50',
            'a',
            'EUR',
        );
        assert.equal(explicitZero.error, null);
        assert.deepEqual(explicitZero.input?.split, {mode: 'percent', percents: {a: 100, b: 0}});
    });

    it('builds the trimmed input on success', () => {
        const result = buildExpenseInput(draft(), '  Dinner  ', '12.50', 'a', 'EUR');
        assert.equal(result.error, null);
        assert.deepEqual(result.input, {
            description: 'Dinner',
            cents: 1250,
            paidBy: 'a',
            participants: ['a', 'b'],
            split: {mode: 'equal'},
        });
    });
});
