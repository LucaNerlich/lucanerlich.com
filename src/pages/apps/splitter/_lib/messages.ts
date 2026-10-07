// Lightweight UI copy. The docs site is English-first; German is offered when
// the page/browser locale starts with `de`. No i18n framework required.

export type Locale = 'en' | 'de';

type Dict = Record<string, string>;

const en: Dict = {
    title: 'Splitter',
    subtitle:
        'Who owes whom how much. Your session lives in this page\'s URL and is also saved in this browser -- share the link to send it to others.',
    copyLink: 'Copy share link',
    copied: 'Copied!',
    reset: 'Reset',
    people: 'People',
    addExpense: 'Add expense',
    expenses: 'Expenses',
    settlement: 'Settlement',
    totalSpent: 'Total spent',
    perPerson: 'Per person avg.',
    balances: 'Balances',
    transfers: 'Transfers',
    everyoneSettled: 'Everyone is settled up.',
    currency: 'Currency',
    tryExample: 'Try example trip',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    exportCsv: 'Export CSV',
    printSummary: 'Print summary',
    copyTransfers: 'Copy transfers',
    howMathWorks: 'How the math works',
    markPaid: 'Paid',
    edit: 'Edit',
    duplicate: 'Duplicate',
    remove: 'Remove',
    rename: 'Rename',
    save: 'Save',
    cancel: 'Cancel',
    participants: 'Split among',
    splitMode: 'Split mode',
    splitEqual: 'Equal',
    splitShares: 'Shares',
    splitPercent: 'Percent',
    splitExact: 'Exact amounts',
    payerCoversNote: 'Payer is not in the split -- they covered for the others.',
    payerInSplitNote: 'Payer is in the split and owes their own share too.',
    loadDemoConfirm: 'Replace the current session with the example trip?',
    resetConfirm: 'Clear all people and expenses?',
};

const de: Dict = {
    ...en,
    title: 'Splitter',
    subtitle:
        'Wer wem wie viel schuldet. Die Sitzung steckt in der URL und wird auch lokal gespeichert -- Link teilen, fertig.',
    copyLink: 'Link kopieren',
    copied: 'Kopiert!',
    reset: 'Zurücksetzen',
    people: 'Personen',
    addExpense: 'Ausgabe hinzufügen',
    expenses: 'Ausgaben',
    settlement: 'Ausgleich',
    totalSpent: 'Gesamt',
    perPerson: 'Ø pro Person',
    balances: 'Salden',
    transfers: 'Überweisungen',
    everyoneSettled: 'Alles ausgeglichen.',
    currency: 'Währung',
    tryExample: 'Beispielreise laden',
    exportJson: 'JSON exportieren',
    importJson: 'JSON importieren',
    exportCsv: 'CSV exportieren',
    printSummary: 'Zusammenfassung drucken',
    copyTransfers: 'Überweisungen kopieren',
    howMathWorks: 'So funktioniert die Rechnung',
    markPaid: 'Bezahlt',
    edit: 'Bearbeiten',
    duplicate: 'Duplizieren',
    remove: 'Entfernen',
    rename: 'Umbenennen',
    save: 'Speichern',
    cancel: 'Abbrechen',
    participants: 'Aufteilen unter',
    splitMode: 'Aufteilung',
    splitEqual: 'Gleichmäßig',
    splitShares: 'Anteile',
    splitPercent: 'Prozent',
    splitExact: 'Genaue Beträge',
    payerCoversNote: 'Zahler ist nicht in der Teilung -- er hat für die anderen ausgelegt.',
    payerInSplitNote: 'Zahler ist in der Teilung und schuldet auch seinen Anteil.',
    loadDemoConfirm: 'Aktuelle Sitzung durch die Beispielreise ersetzen?',
    resetConfirm: 'Alle Personen und Ausgaben löschen?',
};

const catalogs: Record<Locale, Dict> = {en, de};

export const detectLocale = (): Locale => {
    if (typeof document !== 'undefined') {
        const lang = (document.documentElement.lang || navigator.language || 'en').toLowerCase();
        if (lang.startsWith('de')) return 'de';
    }
    return 'en';
};

export type Messages = {
    locale: Locale;
    t: (key: keyof typeof en) => string;
};

export const createMessages = (locale: Locale = detectLocale()): Messages => {
    const dict = catalogs[locale] ?? en;
    return {
        locale,
        t: key => dict[key] ?? en[key] ?? String(key),
    };
};
