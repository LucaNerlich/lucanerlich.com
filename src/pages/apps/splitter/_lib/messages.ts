// Lightweight UI copy. The docs site is English-first; German is offered when
// the browser locale starts with `de` (the html lang attribute is only a
// fallback -- Docusaurus renders the site's single locale there).
// No i18n framework required.

export type Locale = 'en' | 'de';

type Dict = Record<string, string>;

const en = {
    title: 'Splitter',
    subtitle:
        'Who owes whom how much. Your session lives in the page URL (?s=…) and is also saved in this browser -- share the link to send it to others (works in WhatsApp and similar apps).',
    copyLink: 'Copy share link',
    copyLinkFailed: 'Could not build the share link for this session.',
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
    exportFailed: 'Could not export the session.',
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
    importConfirm: 'Replace the current session with the imported file?',
    resetConfirm: 'Clear all people and expenses?',
    description: 'Description',
    optional: '(optional)',
    descriptionPlaceholder: 'Dinner, taxi, groceries…',
    amount: 'Amount',
    paidBy: 'Paid by',
    split: 'Split',
    actions: 'Actions',
    untitledExpense: 'Untitled expense',
    removeExpense: 'Remove expense {name}',
    editExpense: 'Edit expense {name}',
    duplicateExpense: 'Duplicate expense {name}',
    personName: "Person's name",
    addFirstPersonPlaceholder: 'Add first person…',
    addAnotherPlaceholder: 'Add another…',
    add: 'Add',
    alreadyInList: '{name} is already in the list.',
    noPeopleOption: '- add people first -',
    addPersonFirst: 'Add at least one person first.',
    importError: 'Could not import that JSON file.',
    emptyTwoPeople: 'Add at least two people to see who owes whom.',
    emptyAddExpense: 'Add an expense to see the settlement.',
    renamePerson: 'Rename {name}',
    removePersonPaidDeleted: '{count} expenses they paid will be deleted',
    removePersonPaidDeletedOne: '1 expense they paid will be deleted',
    removePersonJoinedResplit: '{count} expenses they joined will be re-split',
    removePersonJoinedResplitOne: '1 expense they joined will be re-split',
    removePersonConfirm: '{name}: {parts}. Remove them?',
    listJoin: ' and ',
    calcIntro:
        'Each expense is allocated to its participants (equal, shares, percent, or exact amounts) in integer cents. Balance = paid - obligation. Positive means owed money; negative means they owe.',
    calcFormulas: 'Formulas',
    calcUnequalNote:
        'Unequal modes use weights / percents (largest remainder) or exact cent amounts. Obligation is the sum of shares across expenses.',
    calcSteps: 'Calculation steps',
    calcTotalSpent: 'Total spent',
    calcPerExpenseShares: 'Per-expense shares',
    calcUntitledExpense: 'Untitled expense',
    calcBalance: 'Balance (paid - obligation)',
    calcTransfers: 'Transfers',
    calcAllZero: 'All balances are zero, so no transfers are needed.',
    calcMatchNote:
        'Match largest debtors with largest creditors until everyone is settled (at most N - 1 transfers).',
    calcPayerCovers: ', payer covers',
    calcRemainderNote: '(+ remainder cents)',
    calcAriaTotal: 'Total T equals the sum of all expense amounts',
    calcAriaEqualSplit: 'For an equal split, share is floor of expense over participants',
    calcAriaBalance: 'Balance equals amount paid minus total obligation',
    removePerson: 'Remove {name}',
    weight: 'weight',
    removeExpenseConfirm: 'Remove "{name}" and every mark it paid?',
    errorPickParticipant: 'Pick at least one participant.',
    errorParticipantsUnique: 'Participants must be unique.',
    errorPositiveWeight: 'Every participant needs a positive share weight.',
    errorWeightsOutside: 'Share weights include someone outside the split.',
    errorMissingPercent: 'Every participant needs a percent.',
    errorNegativePercent: 'Every participant needs a non-negative percent.',
    errorPercentsOutside: 'Percents include someone outside the split.',
    errorPercentSum: 'Percents must sum to 100 (currently {sum}).',
    errorExactCents: 'Every participant needs an exact amount in cents.',
    errorExactOutside: 'Exact amounts include someone outside the split.',
    errorExactSum: 'Exact amounts must sum to the expense ({total}, got {got}).',
    errorExactInvalid: 'Every participant needs a valid exact amount.',
    errorAmountFormat:
        'Enter an amount like {example} (at most two decimals, no thousands separators).',
    errorAmountPositive: 'Amount must be greater than 0.',
    errorChoosePayer: 'Choose who paid.',
} satisfies Dict;

/** A catalog message plus the values its `{placeholders}` take. */
export type MessageError = {
    key: keyof typeof en;
    params?: Record<string, string | number>;
};

const de: Record<keyof typeof en, string> = {
    ...en,
    title: 'Splitter',
    subtitle:
        'Wer wem wie viel schuldet. Die Sitzung steckt in der URL (?s=…) und wird auch lokal gespeichert -- Link teilen (auch in WhatsApp).',
    copyLink: 'Link kopieren',
    copyLinkFailed: 'Der Freigabe-Link für diese Sitzung konnte nicht erstellt werden.',
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
    exportFailed: 'Die Sitzung konnte nicht exportiert werden.',
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
    importConfirm: 'Aktuelle Sitzung durch die importierte Datei ersetzen?',
    resetConfirm: 'Alle Personen und Ausgaben löschen?',
    description: 'Beschreibung',
    optional: '(optional)',
    descriptionPlaceholder: 'Abendessen, Taxi, Einkäufe…',
    amount: 'Betrag',
    paidBy: 'Bezahlt von',
    split: 'Aufteilung',
    actions: 'Aktionen',
    untitledExpense: 'Unbenannte Ausgabe',
    removeExpense: 'Ausgabe {name} entfernen',
    editExpense: 'Ausgabe {name} bearbeiten',
    duplicateExpense: 'Ausgabe {name} duplizieren',
    personName: 'Name der Person',
    addFirstPersonPlaceholder: 'Erste Person hinzufügen…',
    addAnotherPlaceholder: 'Weitere Person hinzufügen…',
    add: 'Hinzufügen',
    alreadyInList: '{name} steht bereits in der Liste.',
    noPeopleOption: '- zuerst Personen hinzufügen -',
    addPersonFirst: 'Füge zuerst mindestens eine Person hinzu.',
    importError: 'Die JSON-Datei konnte nicht importiert werden.',
    emptyTwoPeople: 'Füge mindestens zwei Personen hinzu, um die Schulden zu sehen.',
    emptyAddExpense: 'Füge eine Ausgabe hinzu, um den Ausgleich zu sehen.',
    renamePerson: '{name} umbenennen',
    removePersonPaidDeleted: '{count} Ausgaben, die die Person bezahlt hat, werden gelöscht',
    removePersonPaidDeletedOne: '1 Ausgabe, die die Person bezahlt hat, wird gelöscht',
    removePersonJoinedResplit: '{count} Ausgaben, an denen die Person beteiligt war, werden neu aufgeteilt',
    removePersonJoinedResplitOne: '1 Ausgabe, an der die Person beteiligt war, wird neu aufgeteilt',
    removePersonConfirm: '{name}: {parts}. Person entfernen?',
    listJoin: ' und ',
    calcIntro:
        'Jede Ausgabe wird in ganzen Cent auf die Beteiligten verteilt (gleich, Anteile, Prozent oder genaue Beträge). Saldo = bezahlt - Anteil. Positiv heißt Guthaben, negativ heißt Schulden.',
    calcFormulas: 'Formeln',
    calcUnequalNote:
        'Ungleiche Modi nutzen Gewichte / Prozente (größter Rest) oder genaue Cent-Beträge. Der Anteil ist die Summe über alle Ausgaben.',
    calcSteps: 'Rechenschritte',
    calcTotalSpent: 'Gesamt ausgegeben',
    calcPerExpenseShares: 'Anteile pro Ausgabe',
    calcUntitledExpense: 'Unbenannte Ausgabe',
    calcBalance: 'Saldo (bezahlt - Anteil)',
    calcTransfers: 'Überweisungen',
    calcAllZero: 'Alle Salden sind null, es sind keine Überweisungen nötig.',
    calcMatchNote:
        'Größte Schuldner mit größten Gläubigern ausgleichen, bis alle beglichen sind (höchstens N - 1 Überweisungen).',
    calcPayerCovers: ', Zahler legt aus',
    calcRemainderNote: '(+ Rest-Cent)',
    calcAriaTotal: 'Summe T entspricht der Summe aller Ausgaben',
    calcAriaEqualSplit: 'Bei gleicher Aufteilung ist der Anteil die Abrundung der Ausgabe geteilt durch die Beteiligten',
    calcAriaBalance: 'Saldo entspricht dem bezahlten Betrag minus dem gesamten Anteil',
    removePerson: '{name} entfernen',
    weight: 'Gewicht',
    removeExpenseConfirm: '"{name}" und die zugehörigen Bezahlt-Markierungen entfernen?',
    errorPickParticipant: 'Wähle mindestens eine beteiligte Person aus.',
    errorParticipantsUnique: 'Die beteiligten Personen müssen eindeutig sein.',
    errorPositiveWeight: 'Jede beteiligte Person braucht ein positives Gewicht.',
    errorWeightsOutside: 'Die Gewichte enthalten jemanden außerhalb der Aufteilung.',
    errorMissingPercent: 'Jede beteiligte Person braucht einen Prozentwert.',
    errorNegativePercent: 'Jede beteiligte Person braucht einen Prozentwert von mindestens 0.',
    errorPercentsOutside: 'Die Prozentwerte enthalten jemanden außerhalb der Aufteilung.',
    errorPercentSum: 'Die Prozentwerte müssen 100 ergeben (aktuell {sum}).',
    errorExactCents: 'Jede beteiligte Person braucht einen genauen Betrag in Cent.',
    errorExactOutside: 'Die genauen Beträge enthalten jemanden außerhalb der Aufteilung.',
    errorExactSum: 'Die genauen Beträge müssen die Ausgabe ergeben ({total}, erhalten {got}).',
    errorExactInvalid: 'Jede beteiligte Person braucht einen gültigen genauen Betrag.',
    errorAmountFormat:
        'Gib einen Betrag wie {example} ein (höchstens zwei Nachkommastellen, keine Tausendertrennzeichen).',
    errorAmountPositive: 'Der Betrag muss größer als 0 sein.',
    errorChoosePayer: 'Wähle aus, wer bezahlt hat.',
};

const catalogs: Record<Locale, Dict> = {en, de};

const detectLocale = (): Locale => {
    const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';
    const htmlLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
    const lang = (browserLang || htmlLang || 'en').toLowerCase();
    return lang.startsWith('de') ? 'de' : 'en';
};

export type Messages = {
    t: (key: keyof typeof en) => string;
};

export const createMessages = (locale: Locale = detectLocale()): Messages => {
    const dict = catalogs[locale] ?? en;
    return {
        t: key => dict[key] ?? en[key] ?? String(key),
    };
};

/** Render a validator error, filling its `{placeholders}` from `params`. */
export const formatError = (messages: Messages, error: MessageError): string => {
    let text = messages.t(error.key);
    for (const [name, value] of Object.entries(error.params ?? {})) {
        text = text.replace(`{${name}}`, () => String(value));
    }
    return text;
};
