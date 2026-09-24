---
title: "Dates and Time in JavaScript: Date, Time Zones, and Temporal"
sidebar_label: "Dates and Time"
description: Learn JavaScript Date, parsing, time zones, DST, date arithmetic, JSON serialization, and Temporal with safe, modern examples.
slug: /javascript/dates-and-time
tags: [javascript, typescript, dates, time-zones, temporal]
keywords:
  - JavaScript Date
  - JavaScript time zones
  - JavaScript date parsing
  - Temporal API
  - daylight saving time JavaScript
  - date-fns
  - Luxon
sidebar_position: 6
---

# Dates and Time in JavaScript: Date, Time Zones, and Temporal

JavaScript date handling is tricky because a `Date` represents an exact UTC instant, while most product requirements use
calendar concepts such as "the due date is March 1" or "run this job at 09:00 in Europe/Berlin". Mixing those concepts
causes off-by-one-day bugs, daylight saving time bugs, and broken API payloads.

Unless stated otherwise, examples that show local time assume the `Europe/Berlin` time zone. Prefer examples that use
`toISOString()` or `getUTC*` when you need output that does not depend on the machine's local time zone.

## Quick start

```ts
const createdAt = new Date("2026-02-02T14:30:00Z");

console.log(createdAt.toISOString());
console.log(createdAt.getTime());
console.log(createdAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
}));
```

Result:

```text
2026-02-02T14:30:00.000Z
1770042600000
2 Feb 2026, 15:30
```

## Date and time checklist

- **Store instants as UTC ISO strings** such as `2026-02-02T14:30:00.000Z`.
- **Use `toISOString()` for API payloads** unless the API explicitly asks for another format.
- **Do not parse non-ISO date strings** such as `"03/01/2026"` or `"March 1, 2026"`.
- **Remember that `Date` months are zero-indexed** in numeric constructors.
- **Use UTC methods for instant arithmetic** and local methods only when you intentionally want local calendar behavior.
- **Treat `Date` as mutable** and clone it before changing it.
- **Use `Intl.DateTimeFormat` or `toLocaleString` with a `timeZone` option** for user-facing formatting.
- **Use Temporal or a library** for calendar dates, time-zone-aware arithmetic, and immutable date values.

## Date basics

A JavaScript `Date` stores a number: milliseconds since the Unix epoch (`1970-01-01T00:00:00.000Z`). The value is an
instant in UTC, even though local getter methods display that instant in the host time zone.

```ts
const epoch = new Date(0);
const fixed = new Date(1_700_000_000_000);

console.log(epoch.toISOString());
console.log(fixed.getTime());
console.log(Date.now() <= new Date().getTime());
```

Result:

```text
1970-01-01T00:00:00.000Z
1700000000000
true
```

### Creating dates

Prefer ISO strings with an explicit `Z` or numeric offset when you create an instant. Use `Date.UTC` when you want the
numeric constructor without local-time interpretation.

```ts
const fromIso = new Date("2026-02-02T14:30:00Z");
const fromOffset = new Date("2026-02-02T15:30:00+01:00");
const fromUtcParts = new Date(Date.UTC(2026, 1, 2, 14, 30));

console.log(fromIso.toISOString());
console.log(fromOffset.toISOString());
console.log(fromUtcParts.toISOString());
```

Result:

```text
2026-02-02T14:30:00.000Z
2026-02-02T14:30:00.000Z
2026-02-02T14:30:00.000Z
```

### Months are zero-indexed

In numeric constructors and setters, January is `0` and December is `11`. This is one of the most common `Date` bugs.

```ts
const january = new Date(Date.UTC(2026, 0, 15));
const december = new Date(Date.UTC(2026, 11, 15));

console.log(january.toISOString().slice(0, 10));
console.log(december.toISOString().slice(0, 10));
```

Result:

```text
2026-01-15
2026-12-15
```

### Date is mutable

Every `set*` method changes the existing object. Clone a date before changing it if another variable still references
the original.

```ts
const dueAt = new Date("2026-01-10T00:00:00Z");
const alias = dueAt;

alias.setUTCDate(alias.getUTCDate() + 1);

console.log(dueAt.toISOString());
```

Result:

```text
2026-01-11T00:00:00.000Z
```

Clone first when you need a new value:

```ts
const dueAt = new Date("2026-01-10T00:00:00Z");
const nextDay = new Date(dueAt);

nextDay.setUTCDate(nextDay.getUTCDate() + 1);

console.log(dueAt.toISOString());
console.log(nextDay.toISOString());
```

Result:

```text
2026-01-10T00:00:00.000Z
2026-01-11T00:00:00.000Z
```

## Parsing dates safely

Use ISO 8601 strings. For instants, include `Z` or an explicit numeric offset:

```ts
console.log(new Date("2026-03-01T00:00:00Z").toISOString());
console.log(new Date("2026-03-01T01:00:00+01:00").toISOString());
```

Result:

```text
2026-03-01T00:00:00.000Z
2026-03-01T00:00:00.000Z
```

### Date-only vs date-time strings

This is a dangerous parsing edge case:

- `new Date("2026-03-01")` is parsed as **UTC midnight**.
- `new Date("2026-03-01T00:00")` is parsed as **local time** because it has no `Z` or offset.

In `Europe/Berlin`, local midnight on March 1, 2026 is one hour before UTC midnight:

```ts
const dateOnly = new Date("2026-03-01");
const localDateTime = new Date("2026-03-01T00:00");

console.log(dateOnly.toISOString());
console.log(localDateTime.toISOString());
```

Result when the local time zone is `Europe/Berlin`:

```text
2026-03-01T00:00:00.000Z
2026-02-28T23:00:00.000Z
```

Use a plain string like `"2026-03-01"` for a calendar date, or use Temporal's `PlainDate`. Do not convert it to `Date`
unless you have chosen the time zone and time of day intentionally.

### Do not parse non-ISO strings

Non-ISO date strings are implementation-defined. Browsers and Node versions can disagree about formats like
`"03/01/2026"` or `"1 Mar 2026"`.

```ts
// Avoid this. It may mean March 1, January 3, or be invalid depending on the runtime and locale.
const unsafe = new Date("03/01/2026");

console.log(Number.isNaN(unsafe.getTime()));
```

Instead, parse a known format yourself or require an ISO input:

```ts
const input = "2026-03-01T00:00:00Z";
const instant = new Date(input);

if (Number.isNaN(instant.getTime())) {
    throw new Error("Invalid date");
}

console.log(instant.toISOString());
```

Result:

```text
2026-03-01T00:00:00.000Z
```

## Time zones and daylight saving time

A `Date` does not store a time zone. It stores one UTC instant, then local methods project that instant into the host
time zone.

### Local getters vs UTC getters

The same instant can have a different calendar date in UTC and in the local time zone.

```ts
const instant = new Date("2026-02-28T23:30:00Z");

console.log(instant.getUTCDate());
console.log(instant.getDate());
```

Result when the local time zone is `Europe/Berlin`:

```text
28
1
```

Use `getUTC*` methods for protocol, storage, and server-side calculations that should not depend on the host time zone.
Use local getters only for local calendar behavior or display.

### Adding 24 hours is not the same as adding one calendar day

When daylight saving time starts in Berlin on March 29, 2026, the clock jumps from 02:00 to 03:00. Adding exactly
24 hours keeps elapsed time constant; `setDate(getDate() + 1)` keeps the local calendar date and wall-clock time.

```ts
const MS_PER_HOUR = 60 * 60 * 1000;

function formatLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:${minute}`;
}

const start = new Date("2026-03-28T12:00:00");
const plus24Hours = new Date(start.getTime() + 24 * MS_PER_HOUR);
const plusOneCalendarDay = new Date(start);

plusOneCalendarDay.setDate(plusOneCalendarDay.getDate() + 1);

console.log(formatLocal(plus24Hours));
console.log(formatLocal(plusOneCalendarDay));
console.log((plusOneCalendarDay.getTime() - start.getTime()) / MS_PER_HOUR);
```

Result when the local time zone is `Europe/Berlin`:

```text
2026-03-29 13:00
2026-03-29 12:00
23
```

Choose the operation that matches the domain:

- Use elapsed milliseconds for timeouts, TTLs, and "24 hours from now".
- Use calendar operations for "same local time tomorrow" or "next billing day".

### Store and transmit UTC ISO strings

`toISOString()` is stable and unambiguous.

```ts
const scheduledAt = new Date("2026-02-02T14:30:00Z");

console.log(scheduledAt.toISOString());
```

Result:

```text
2026-02-02T14:30:00.000Z
```

`JSON.stringify` calls `Date.prototype.toJSON`, which returns an ISO string. `JSON.parse` does not revive it back into a
`Date`; use a reviver when you need `Date` objects again. See the JSON guide's
[reviver for data transformations](./json-parsing-guide.md#reviver-for-data-transformations) section.

```ts
const json = JSON.stringify({
    createdAt: new Date("2026-02-02T14:30:00Z"),
});
const parsed = JSON.parse(json) as { createdAt: string };

console.log(json);
console.log(typeof parsed.createdAt);
```

Result:

```text
{"createdAt":"2026-02-02T14:30:00.000Z"}
string
```

## Formatting dates and times

Use `Intl.DateTimeFormat` or `toLocaleString` for display. Formatting is a presentation concern, so keep storage and API
payloads separate from formatted strings. For a full formatting guide, see
[JavaScript Intl API formatting](./javascript-intl-api-formatting.mdx).

```ts
const publishedAt = new Date("2026-02-02T14:30:00Z");

console.log(publishedAt.toLocaleString("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Berlin",
}));
```

Result:

```text
2 Feb 2026, 15:30
```

Always pass `timeZone` when output must be reproducible. Otherwise the same code formats differently on a server in UTC,
a developer laptop in Berlin, and a user device in New York.

## Arithmetic and comparisons

### Compare dates with getTime

Relational operators on `Date` objects work because JavaScript coerces them to timestamps, but `getTime()` makes the
comparison explicit and easier to read.

```ts
const startsAt = new Date("2026-02-02T14:30:00Z");
const endsAt = new Date("2026-02-02T15:00:00Z");

console.log(startsAt.getTime() < endsAt.getTime());
```

Result:

```text
true
```

### Difference in days

For elapsed days between UTC instants, subtract timestamps and divide by the number of milliseconds in a day.

```ts
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const checkIn = Date.UTC(2026, 0, 10);
const checkOut = Date.UTC(2026, 0, 14);

console.log((checkOut - checkIn) / MS_PER_DAY);
```

Result:

```text
4
```

Do not use that formula for local calendar dates across daylight saving time. A local "day" can be 23 or 25 hours.

### End-of-month overflow

`Date` setters normalize overflow instead of constraining to the last valid day. In 2026, February has 28 days, so
"January 31 plus one month" overflows to March 3.

```ts
const date = new Date(Date.UTC(2026, 0, 31));

date.setUTCMonth(date.getUTCMonth() + 1);

console.log(date.toISOString().slice(0, 10));
```

Result:

```text
2026-03-03
```

This behavior is sometimes useful, but it is rarely what users expect for subscription renewals, due dates, or calendar
scheduling. Temporal's default month arithmetic constrains this case to the last valid day.

## Temporal

Temporal is the modern JavaScript date and time API. It separates concepts that `Date` mixes together:

- `Temporal.Instant` for an exact UTC instant.
- `Temporal.PlainDate` for a calendar date without a time or time zone.
- `Temporal.PlainTime` for a clock time without a date or time zone.
- `Temporal.PlainDateTime` for a date and time without a time zone.
- `Temporal.ZonedDateTime` for a date, time, and IANA time zone.
- `Temporal.Duration` for an amount of time.

At the time of writing (2026), Temporal is unflagged in Firefox 139 (May 2025), Chrome and Edge 144 (January 2026), and
Node.js 26. It is not yet available in stable Safari, and Node.js 22 does not provide it. Use a production polyfill such
as `@js-temporal/polyfill` or `temporal-polyfill` until your supported runtimes all ship Temporal. Check current support
on [Can I use: Temporal](https://caniuse.com/temporal).

The examples below need a polyfill import in Node.js 22, stable Safari, and older browsers:

```ts
import { Temporal } from "@js-temporal/polyfill";
```

### Temporal.Now

Use `Temporal.Now` when you need the current date, time, or instant. Pass a time zone when the result is a local calendar
value.

```ts
import { Temporal } from "@js-temporal/polyfill";

const todayInBerlin = Temporal.Now.plainDateISO("Europe/Berlin");
const exactNow = Temporal.Now.instant();

console.log(todayInBerlin instanceof Temporal.PlainDate);
console.log(exactNow instanceof Temporal.Instant);
```

Result:

```text
true
true
```

### PlainDate, PlainTime, and PlainDateTime

Use plain types for values that are not instants. A birthday, deadline date, or store opening time should not be forced
through `Date`.

```ts
import { Temporal } from "@js-temporal/polyfill";

const date = Temporal.PlainDate.from("2026-02-02");
const time = Temporal.PlainTime.from("14:30");
const dateTime = Temporal.PlainDateTime.from("2026-02-02T14:30");

console.log(date.toString());
console.log(time.toString());
console.log(dateTime.toString());
```

Result:

```text
2026-02-02
14:30:00
2026-02-02T14:30:00
```

### ZonedDateTime and Instant

Use `ZonedDateTime` for "same local time tomorrow" and `Instant` for exact moments in time.

```ts
import { Temporal } from "@js-temporal/polyfill";

const meeting = Temporal.ZonedDateTime.from("2026-03-28T12:00:00+01:00[Europe/Berlin]");
const sameLocalTimeTomorrow = meeting.add({ days: 1 });
const twentyFourHoursLater = meeting.add({ hours: 24 });
const instant = Temporal.Instant.from("2026-02-02T14:30:00Z");

console.log(sameLocalTimeTomorrow.toString());
console.log(twentyFourHoursLater.toString());
console.log(instant.toString());
```

Result:

```text
2026-03-29T12:00:00+02:00[Europe/Berlin]
2026-03-29T13:00:00+02:00[Europe/Berlin]
2026-02-02T14:30:00Z
```

### Duration, add, until, and since

Temporal values are immutable. Methods such as `add`, `until`, and `since` return new values.

```ts
import { Temporal } from "@js-temporal/polyfill";

const start = Temporal.PlainDate.from("2026-02-02");
const nextWeek = start.add({ weeks: 1 });
const duration = start.until(nextWeek);

console.log(start.toString());
console.log(nextWeek.toString());
console.log(duration.toString());
console.log(nextWeek.since(start).days);
```

Result:

```text
2026-02-02
2026-02-09
P7D
7
```

### PlainDate.compare

Use the built-in comparator for sorting plain dates.

```ts
import { Temporal } from "@js-temporal/polyfill";

const dates = ["2026-03-01", "2026-01-01", "2026-02-01"]
    .map((value) => Temporal.PlainDate.from(value))
    .sort(Temporal.PlainDate.compare);

console.log(dates.map((date) => date.toString()).join(", "));
```

Result:

```text
2026-01-01, 2026-02-01, 2026-03-01
```

### How Temporal fixes Date problems

Temporal makes calendar arithmetic explicit and immutable. With the default `overflow: "constrain"` behavior, adding one
month to January 31 gives the last valid day in February instead of overflowing into March.

```ts
import { Temporal } from "@js-temporal/polyfill";

const renewalDate = Temporal.PlainDate.from("2026-01-31").add({ months: 1 });

console.log(renewalDate.toString());
```

Result:

```text
2026-02-28
```

Temporal also avoids the date-only parsing trap:

```ts
import { Temporal } from "@js-temporal/polyfill";

const calendarDate = Temporal.PlainDate.from("2026-03-01");

console.log(calendarDate.toString());
```

Result:

```text
2026-03-01
```

## Libraries

Temporal is the long-term platform direction, but libraries are still useful when you need broad runtime support or
framework integration today.

- **date-fns** provides small, function-based helpers that work with `Date`.
- **Luxon** provides immutable date-time objects, IANA time zone support, and strong Intl integration.
- **Day.js** provides a small Moment-like API with plugins for UTC, time zones, and durations.
- **Moment** is in maintenance mode. Avoid starting new projects with it unless you are maintaining existing Moment code.

## Common pitfalls

- Parsing `"YYYY-MM-DD"` into `Date` when the domain value is a calendar date, not an instant.
- Parsing non-ISO strings and assuming every runtime interprets them the same way.
- Forgetting that numeric `Date` constructors and setters use zero-indexed months.
- Mutating a shared `Date` with `setDate`, `setMonth`, or another setter.
- Adding `24 * 60 * 60 * 1000` when the domain requirement is "tomorrow at the same local time".
- Comparing formatted date strings instead of timestamps or Temporal values.
- Assuming `JSON.parse` returns `Date` objects for ISO strings.
- Formatting without an explicit `timeZone` in server-side rendering or tests.

## Best practices

- Store API timestamps as UTC ISO strings with `Z`.
- Keep calendar dates as date-only strings or `Temporal.PlainDate`, not as midnight `Date` objects.
- Validate parsed dates with `Number.isNaN(date.getTime())`.
- Use `getTime()` for instant comparisons.
- Use `getUTC*` and `setUTC*` methods for UTC calculations.
- Use `Intl.DateTimeFormat` or `toLocaleString` with `timeZone` for display.
- Use Temporal or a library for recurring events, billing dates, date-only values, and time-zone-aware arithmetic.
- Document the assumed time zone in examples, tests, and business rules.

## FAQ: dates and time in JavaScript

### Should I store dates as strings or numbers?

For API payloads and databases, a UTC ISO string is usually the clearest interchange format. A timestamp number is useful
for sorting, cache keys, and low-level storage, but it is less self-describing.

### Why does my date move to the previous day?

You probably parsed a date-only string into `Date` or displayed an instant in a different time zone. `Date` stores an
instant, not a calendar date. Use a date-only string or `Temporal.PlainDate` when the value is a calendar date.

### Is `Date.parse` safe?

It is safe for the ISO format JavaScript specifies, such as `2026-02-02T14:30:00Z`. Avoid non-ISO strings because their
behavior is implementation-defined.

### Should I use UTC everywhere?

Use UTC for instants, storage, and transmission. Do not use UTC to erase business time zones. A meeting at 09:00 in
Europe/Berlin, a store opening time, or a monthly billing date needs calendar and time-zone rules.

### Should I use Temporal now?

Use Temporal directly only when your supported runtimes include it. For production apps in 2026, use a polyfill or a
library if you need stable behavior in Safari, Node.js 22, or older browsers.

## Summary

`Date` is good at representing instants, but it mixes UTC storage, local display, mutable setters, and permissive parsing.
Use ISO strings with explicit offsets, keep calendar dates out of `Date`, format with `Intl`, and be deliberate about
daylight saving time. For new date-heavy code, Temporal gives you immutable, precise types for instants, calendar dates,
plain times, durations, and time-zone-aware date-times.
