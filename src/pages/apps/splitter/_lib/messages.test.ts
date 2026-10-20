import {afterEach, describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {createMessages} from './messages';

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');

const setLocaleSignals = (navigatorLanguage: string | undefined, htmlLang: string | undefined) => {
    if (navigatorLanguage === undefined) {
        Reflect.deleteProperty(globalThis, 'navigator');
    } else {
        Object.defineProperty(globalThis, 'navigator', {
            value: {language: navigatorLanguage},
            configurable: true,
        });
    }
    if (htmlLang === undefined) {
        Reflect.deleteProperty(globalThis, 'document');
    } else {
        Object.defineProperty(globalThis, 'document', {
            value: {documentElement: {lang: htmlLang}},
            configurable: true,
        });
    }
};

afterEach(() => {
    if (originalNavigator) {
        Object.defineProperty(globalThis, 'navigator', originalNavigator);
    } else {
        Reflect.deleteProperty(globalThis, 'navigator');
    }
    if (originalDocument) {
        Object.defineProperty(globalThis, 'document', originalDocument);
    } else {
        Reflect.deleteProperty(globalThis, 'document');
    }
});

describe('createMessages locale detection', () => {
    it('uses the de catalog for German browser locales', () => {
        setLocaleSignals('de-DE', 'en');
        assert.equal(createMessages().t('reset'), 'Zurücksetzen');
    });

    it('keeps English for non-German browser locales', () => {
        setLocaleSignals('en-US', 'en');
        assert.equal(createMessages().t('reset'), 'Reset');
    });

    it('falls back to the html lang attribute when the browser locale is missing', () => {
        setLocaleSignals(undefined, 'de');
        assert.equal(createMessages().t('reset'), 'Zurücksetzen');
    });

    it('translates the calculation panel and removal-sentence keys', () => {
        const de = createMessages('de');
        const en = createMessages('en');
        assert.equal(de.t('calcFormulas'), 'Formeln');
        assert.equal(de.t('calcSteps'), 'Rechenschritte');
        assert.match(de.t('removePersonPaidDeleted'), /Ausgabe/);
        assert.match(de.t('removePersonJoinedResplitOne'), /Ausgabe/);
        // The removal sentence is filled by two replacements, so both slots
        // must survive in both catalogs.
        for (const t of [en, de]) {
            assert.match(t.t('removePersonConfirm'), /\{name\}/);
            assert.match(t.t('removePersonConfirm'), /\{parts\}/);
        }
        assert.notEqual(de.t('calcAriaTotal'), en.t('calcAriaTotal'));
    });
});
