import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {buildExpenseInput, type SplitDraft} from './expenseInput';
import {draftFromPeople} from './splitDraft';

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
        assert.equal(result.error?.key, 'errorAmountFormat');
        assert.match(String(result.error?.params?.example), /^\d/);
    });

    it('rejects a non-positive amount before the payer check', () => {
        const result = buildExpenseInput(draft(), '', '0', '', 'EUR');
        assert.equal(result.input, null);
        assert.equal(result.error?.key, 'errorAmountPositive');
    });

    it('requires a payer before building the split', () => {
        const result = buildExpenseInput(draft({participants: []}), '', '12.50', '', 'EUR');
        assert.equal(result.input, null);
        assert.equal(result.error?.key, 'errorChoosePayer');
    });

    it('reports split build errors after the payer check', () => {
        const result = buildExpenseInput(draft({participants: []}), '', '12.50', 'a', 'EUR');
        assert.equal(result.input, null);
        assert.equal(result.error?.key, 'errorPickParticipant');
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
        assert.equal(result.error?.key, 'errorPercentSum');
        assert.equal(result.error?.params?.sum, 90);
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
        assert.equal(result.error?.key, 'errorMissingPercent');

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

describe('person ids that collide with Object.prototype', () => {
    const people = [{id: '__proto__', name: 'Proto'}, {id: 'b', name: 'Bob'}];

    it('keeps a __proto__ participant in shares, percent, and exact splits', () => {
        const cases = [
            {mode: 'shares' as const, field: 'weights' as const, values: ['1', '3'], expected: [1, 3]},
            {mode: 'percent' as const, field: 'percents' as const, values: ['25', '75'], expected: [25, 75]},
            {mode: 'exact' as const, field: 'amounts' as const, values: ['4.00', '8.00'], expected: [400, 800]},
        ];
        for (const {mode, field, values, expected} of cases) {
            const d = draftFromPeople(people);
            d.splitMode = mode;
            d[field]['__proto__'] = values[0];
            d[field].b = values[1];
            const result = buildExpenseInput(d, 'Dinner', '12.00', '__proto__', 'EUR');
            assert.equal(result.error, null, mode);
            assert.equal(result.input?.split.mode, mode);
            const record = result.input?.split.mode === mode ? (result.input.split as Record<string, unknown>)[field] : null;
            assert.deepEqual(Object.entries(record as object), [['__proto__', expected[0]], ['b', expected[1]]], mode);
        }
    });

    it('reads a __proto__ draft value back instead of Object.prototype', () => {
        const d = draftFromPeople(people, {
            participants: ['__proto__', 'b'],
            splitMode: 'exact',
            weights: Object.fromEntries([['__proto__', '1'], ['b', '1']]),
            percents: Object.fromEntries([['__proto__', '50'], ['b', '50']]),
            amounts: Object.fromEntries([['__proto__', '4.00'], ['b', '8.00']]),
        });
        assert.equal(d.amounts['__proto__'], '4.00');
        assert.equal(d.percents['__proto__'], '50');
        assert.equal(d.weights['__proto__'], '1');
    });
});
