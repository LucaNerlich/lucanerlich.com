---
title: JavaScript Intl API: Currency, Date, and Number Formatting (TypeScript)
description: Learn currency formatting, date formatting, number formatting, list formatting, and more with the JavaScript Intl API. Practical TypeScript examples and best practices.
slug: /javascript/intl-api-formatting
tags: [javascript, typescript, intl, i18n, localization]
keywords:
  - JavaScript Intl API
  - currency formatting
  - date formatting
  - number formatting
  - Intl.NumberFormat
  - Intl.DateTimeFormat
  - list formatting
  - relative time formatting
  - TypeScript Intl
sidebar_position: 1
---

# JavaScript Intl API: Currency, Date, and Number Formatting (TypeScript)

The JavaScript Intl API is the built-in way to handle **currency formatting**, **date formatting**, **number formatting**, and a lot more. This guide walks through the most useful Intl features with expressive TypeScript examples you can drop into any app.

## Quick start: currency and date formatting

```ts
const amount = 1234.56;
const createdAt = new Date("2026-02-02T14:30:00Z");

const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    currencyDisplay: "code",
});

const dateTime = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
});

console.log(currency.format(amount));
console.log(dateTime.format(createdAt));
```

## Intl.NumberFormat: numbers, currency, units, percent

### Number formatting with locale and grouping

```ts
const number = 9876543.21;

const compact = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
});

const noGrouping = new Intl.NumberFormat("en-US", {
    useGrouping: false,
    maximumFractionDigits: 2,
});

console.log(compact.format(number));
console.log(noGrouping.format(number));
```

### Currency formatting with precise rounding

```ts
const price = 19.995;

const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
});

const eurCode = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    currencyDisplay: "code",
    maximumFractionDigits: 2,
});

console.log(usd.format(price));
console.log(eurCode.format(price));
```

### Unit and percent formatting

```ts
const speed = 88.5;
const ratio = 0.237;

const kmPerHour = new Intl.NumberFormat("en-US", {
    style: "unit",
    unit: "kilometer-per-hour",
    unitDisplay: "short",
    maximumFractionDigits: 1,
});

const percent = new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: 1,
});

console.log(kmPerHour.format(speed));
console.log(percent.format(ratio));
```

### Format to parts for custom UI

`formatToParts` is ideal if you need to style currency symbols or decimals separately.

```ts
const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const parts = money.formatToParts(1234.5);
const currencySymbol = parts.find((p) => p.type === "currency")?.value ?? "";
const integer = parts.find((p) => p.type === "integer")?.value ?? "";
const fraction = parts.find((p) => p.type === "fraction")?.value ?? "";

console.log({ currencySymbol, integer, fraction });
```

## Intl.DateTimeFormat: dates, times, time zones

### Date and time styles

```ts
const now = new Date("2026-02-02T14:30:00Z");

const longDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "UTC",
});

const shortDate = new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "UTC",
});

console.log(longDate.format(now));
console.log(shortDate.format(now));
```

### Time zone aware formatting

```ts
const meeting = new Date("2026-02-02T16:00:00Z");

const nyc = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
});

const berlin = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
});

console.log(nyc.format(meeting));
console.log(berlin.format(meeting));
```

### Range formatting

```ts
const start = new Date("2026-02-02T08:00:00Z");
const end = new Date("2026-02-02T10:30:00Z");

const range = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
});

console.log(range.formatRange(start, end));
```

### Format to parts for dates

```ts
const dateParts = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
}).formatToParts(new Date("2026-02-02T14:30:00Z"));

const day = dateParts.find((p) => p.type === "day")?.value ?? "";
const month = dateParts.find((p) => p.type === "month")?.value ?? "";
const year = dateParts.find((p) => p.type === "year")?.value ?? "";

console.log({ day, month, year });
```

## Intl.ListFormat: list formatting

```ts
const tools = ["TypeScript", "Docusaurus", "Intl API"];

const list = new Intl.ListFormat("en-US", {
    style: "long",
    type: "conjunction",
});

console.log(list.format(tools));
```

## Intl.RelativeTimeFormat: relative time

```ts
const rtf = new Intl.RelativeTimeFormat("en-US", {
    numeric: "auto",
    style: "long",
});

console.log(rtf.format(-1, "day"));
console.log(rtf.format(3, "week"));
```

## Intl.PluralRules: pluralization

```ts
const rule = new Intl.PluralRules("en-US");

const messages = {
    one: "You have 1 message",
    other: "You have {count} messages",
};

function formatMessages(count: number): string {
    const key = rule.select(count);
    return messages[key as keyof typeof messages].replace("{count}", String(count));
}

console.log(formatMessages(1));
console.log(formatMessages(5));
```

## Intl.Collator: locale-aware sorting

```ts
const items = ["file-2", "file-10", "file-1"];

const collator = new Intl.Collator("en-US", {
    numeric: true,
    sensitivity: "base",
});

items.sort(collator.compare);
console.log(items);
```

## Intl.DisplayNames: user-friendly labels

```ts
const display = new Intl.DisplayNames("en-US", { type: "currency" });

console.log(display.of("USD"));
console.log(display.of("EUR"));
```

## Intl.Segmenter: split text by words or graphemes

```ts
const text = "Intl API makes i18n easier.";

const wordSegmenter = new Intl.Segmenter("en-US", { granularity: "word" });
const words = Array.from(wordSegmenter.segment(text))
    .filter((segment) => segment.isWordLike)
    .map((segment) => segment.segment);

console.log(words);
```

## Intl.Locale and supported values

```ts
const locale = new Intl.Locale("en-US", { calendar: "gregory" });

console.log(locale.baseName);
console.log(locale.calendar);

if (typeof Intl.supportedValuesOf === "function") {
    const currencies = Intl.supportedValuesOf("currency").slice(0, 5);
    console.log(currencies);
}
```

## Practical tips for production usage

- **Cache formatters**: create them once and reuse, formatters are expensive to construct.
- **Prefer Intl.*Format over toLocaleString**: formatters are clearer and easier to test.
- **Store numbers and dates as data**: format at the UI boundary to avoid mixed locales.
- **Pick explicit locales** when formatting server-side (avoid environment surprises).

```ts
const numberFormatCache = new Map<string, Intl.NumberFormat>();

function getNumberFormat(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = `${locale}:${JSON.stringify(options)}`;
    const cached = numberFormatCache.get(key);
    if (cached) return cached;
    const formatter = new Intl.NumberFormat(locale, options);
    numberFormatCache.set(key, formatter);
    return formatter;
}
```

## FAQ: Intl API for currency and date formatting

### How do I format currency in JavaScript?

Use `Intl.NumberFormat` with `style: "currency"` and a `currency` code.

```ts
const usd = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

console.log(usd.format(1234.56));
```

### How do I format dates with Intl in JavaScript?

Use `Intl.DateTimeFormat` with `dateStyle`, `timeStyle`, and an optional `timeZone`.

```ts
const fmt = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "UTC",
});

console.log(fmt.format(new Date()));
```

### Is the Intl API supported in TypeScript?

Yes. TypeScript ships type definitions for Intl, so you get full type safety and IntelliSense by default.
