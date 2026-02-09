---
title: "Regular Expressions"
sidebar_label: "Regular Expressions"
description: Master JavaScript regular expressions -- patterns, character classes, quantifiers, groups, lookaheads, and practical validation examples.
slug: /javascript/beginners-guide/regular-expressions
tags: [javascript, beginners, regex, validation]
keywords:
  - javascript regex
  - regular expressions
  - pattern matching
  - form validation regex
  - string matching
sidebar_position: 15
---

# Regular Expressions

A **regular expression** (regex) is a pattern that describes a set of strings. You use them to search, validate, extract, and replace text. They look cryptic at first, but once you learn the building blocks, they become a powerful tool.

## Creating a regex

Two ways to create a regular expression in JavaScript:

```js
// Literal syntax (most common)
const pattern = /hello/;

// Constructor syntax (useful when the pattern is dynamic)
const pattern2 = new RegExp("hello");
```

Use the literal syntax when the pattern is known at write time. Use the constructor when you need to build the pattern from a variable:

```js
const searchTerm = "hello";
const dynamic = new RegExp(searchTerm, "i"); // case-insensitive
```

## Core methods

### `test()` -- does the pattern match?

Returns `true` or `false`:

```js
const pattern = /hello/;

console.log(pattern.test("hello world")); // true
console.log(pattern.test("goodbye"));     // false
```

### `match()` -- find matches in a string

Returns an array of matches, or `null`:

```js
const text = "The year 2025 and 2026";

console.log(text.match(/\d+/));  // ["2025"] -- first match only
console.log(text.match(/\d+/g)); // ["2025", "2026"] -- all matches (g flag)
console.log(text.match(/xyz/));  // null -- no match
```

### `replace()` -- find and replace

```js
const text = "Hello World";

console.log(text.replace(/world/i, "JavaScript")); // "Hello JavaScript"
console.log("aaa bbb ccc".replace(/\s+/g, "-"));   // "aaa-bbb-ccc"
```

### `search()` -- find the index of the first match

```js
const text = "Learn JavaScript today";

console.log(text.search(/javascript/i)); // 6
console.log(text.search(/python/i));     // -1 (not found)
```

### `split()` -- split a string by a pattern

```js
const csv = "one, two,  three,four";

console.log(csv.split(/\s*,\s*/)); // ["one", "two", "three", "four"]
```

### `matchAll()` -- iterate over all matches with details

```js
const text = "price: $42.99, tax: $3.50";
const pattern = /\$(\d+\.\d{2})/g;

for (const match of text.matchAll(pattern)) {
    console.log(`Full match: ${match[0]}, amount: ${match[1]}, index: ${match.index}`);
}
```

Result:
```text
Full match: $42.99, amount: 42.99, index: 7
Full match: $3.50, amount: 3.50, index: 20
```

## Character classes

Character classes match **one character** from a set:

| Pattern | Matches | Example |
|---------|---------|---------|
| `\d` | Any digit (0--9) | `\d\d` matches `"42"` |
| `\D` | Any non-digit | `\D` matches `"a"` |
| `\w` | Word character (a--z, A--Z, 0--9, _) | `\w+` matches `"hello_42"` |
| `\W` | Non-word character | `\W` matches `" "`, `"!"` |
| `\s` | Whitespace (space, tab, newline) | `\s+` matches `"  "` |
| `\S` | Non-whitespace | `\S+` matches `"hello"` |
| `.` | Any character except newline | `a.c` matches `"abc"`, `"a1c"` |

### Custom character classes

```js
// Matches one vowel
/[aeiou]/.test("hello"); // true

// Matches one consonant (negated class)
/[^aeiou]/.test("hello"); // true

// Ranges
/[a-z]/.test("m");   // true -- lowercase letter
/[A-Z]/.test("M");   // true -- uppercase letter
/[0-9]/.test("5");   // true -- same as \d
/[a-zA-Z]/.test("x"); // true -- any letter
```

## Quantifiers

Quantifiers specify **how many times** a pattern should match:

| Quantifier | Meaning | Example |
|-----------|---------|---------|
| `*` | Zero or more | `a*` matches `""`, `"a"`, `"aaa"` |
| `+` | One or more | `a+` matches `"a"`, `"aaa"` but not `""` |
| `?` | Zero or one | `colou?r` matches `"color"` and `"colour"` |
| `{n}` | Exactly n | `\d{4}` matches `"2025"` |
| `{n,}` | n or more | `\d{2,}` matches `"42"`, `"123"`, `"9999"` |
| `{n,m}` | Between n and m | `\d{2,4}` matches `"42"`, `"123"`, `"2025"` |

### Greedy vs lazy

By default, quantifiers are **greedy** -- they match as much as possible:

```js
const html = '<b>bold</b> and <i>italic</i>';

// Greedy: matches from first < to last >
console.log(html.match(/<.+>/)[0]);  // "<b>bold</b> and <i>italic</i>"

// Lazy (add ?): matches from first < to first >
console.log(html.match(/<.+?>/)[0]); // "<b>"
```

Add `?` after any quantifier to make it lazy (match as little as possible).

## Anchors

Anchors match a **position**, not a character:

| Anchor | Matches |
|--------|---------|
| `^` | Start of string (or start of line with `m` flag) |
| `$` | End of string (or end of line with `m` flag) |
| `\b` | Word boundary |

```js
// Must start with "Hello"
/^Hello/.test("Hello world");  // true
/^Hello/.test("Say Hello");    // false

// Must end with a digit
/\d$/.test("Room 42");   // true
/\d$/.test("42 rooms");  // false

// Whole string must be digits only
/^\d+$/.test("12345");   // true
/^\d+$/.test("123abc");  // false

// Word boundary -- match whole words
/\bcat\b/.test("the cat sat");      // true
/\bcat\b/.test("concatenate");      // false
```

## Groups

### Capturing groups

Parentheses `()` create groups that capture matched text:

```js
const datePattern = /(\d{4})-(\d{2})-(\d{2})/;
const match = "2025-01-15".match(datePattern);

console.log(match[0]); // "2025-01-15" -- full match
console.log(match[1]); // "2025" -- first group (year)
console.log(match[2]); // "01" -- second group (month)
console.log(match[3]); // "15" -- third group (day)
```

### Named groups

Give groups descriptive names with `(?<name>...)`:

```js
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = "2025-01-15".match(datePattern);

console.log(match.groups.year);  // "2025"
console.log(match.groups.month); // "01"
console.log(match.groups.day);   // "15"
```

Named groups make complex patterns much more readable.

### Non-capturing groups

When you need grouping but do not need to capture the match, use `(?:...)`:

```js
// Captures "http" or "https" -- but we do not need the captured value
const url = /(?:https?):\/\/(\S+)/;
const match = "https://example.com".match(url);

console.log(match[1]); // "example.com" -- only the host is captured
```

### Backreferences

Reference a previously captured group within the same pattern:

```js
// Match repeated words
const repeated = /\b(\w+)\s+\1\b/;

console.log(repeated.test("the the"));     // true
console.log(repeated.test("the quick"));   // false
```

`\1` refers to whatever was captured by the first group.

### Groups in `replace()`

Use `$1`, `$2`, etc. to reference groups in the replacement string:

```js
// Swap first and last name
const name = "Lovelace, Ada";
const swapped = name.replace(/(\w+), (\w+)/, "$2 $1");
console.log(swapped); // "Ada Lovelace"

// Named groups use $<name>
const date = "15/01/2025";
const iso = date.replace(
    /(?<day>\d{2})\/(?<month>\d{2})\/(?<year>\d{4})/,
    "$<year>-$<month>-$<day>"
);
console.log(iso); // "2025-01-15"
```

## Flags

Flags modify how the pattern is applied:

| Flag | Name | Effect |
|------|------|--------|
| `g` | Global | Find all matches, not just the first |
| `i` | Case-insensitive | `a` matches both `a` and `A` |
| `m` | Multiline | `^` and `$` match start/end of each line |
| `s` | Dotall | `.` matches newline characters too |
| `u` | Unicode | Enables full Unicode matching |
| `v` | Unicode sets | Extended Unicode character classes (ES2024) |

```js
// Global + case-insensitive
"Hello hello HELLO".match(/hello/gi); // ["Hello", "hello", "HELLO"]

// Multiline -- ^ matches each line start
const text = "line one\nline two\nline three";
text.match(/^line/gm); // ["line", "line", "line"]

// Dotall -- . matches newlines
/first.+last/s.test("first\nlast");  // true
/first.+last/.test("first\nlast");   // false (without s flag)
```

## Alternation

Use `|` for "or":

```js
const pet = /cat|dog|fish/;

console.log(pet.test("I have a cat")); // true
console.log(pet.test("I have a bird")); // false

// Combine with groups
const protocol = /^(http|https|ftp):\/\//;
console.log(protocol.test("https://example.com")); // true
```

## Lookahead and lookbehind

These assert that a pattern exists (or does not exist) before or after the current position, **without including it in the match**:

| Syntax | Name | Meaning |
|--------|------|---------|
| `(?=...)` | Positive lookahead | Followed by ... |
| `(?!...)` | Negative lookahead | NOT followed by ... |
| `(?<=...)` | Positive lookbehind | Preceded by ... |
| `(?<!...)` | Negative lookbehind | NOT preceded by ... |

```js
// Positive lookahead: digits followed by "px"
"12px 3em 45px".match(/\d+(?=px)/g); // ["12", "45"]

// Negative lookahead: digits NOT followed by "px"
"12px 3em 45px".match(/\d+(?!px)/g); // ["1", "3", "4"]

// Positive lookbehind: digits preceded by "$"
"$42 and €50".match(/(?<=\$)\d+/g); // ["42"]

// Negative lookbehind: digits NOT preceded by "$"
"$42 and 50".match(/(?<!\$)\d+/g); // ["2", "50"]
```

## Practical examples

### Email validation

```js
const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

console.log(emailPattern.test("ada@example.com"));      // true
console.log(emailPattern.test("ada@example"));           // false
console.log(emailPattern.test("not-an-email"));          // false
console.log(emailPattern.test("user+tag@mail.co.uk"));   // true
```

Breaking it down:

| Part | Meaning |
|------|---------|
| `^` | Start of string |
| `[a-zA-Z0-9._%+-]+` | One or more valid characters before @ |
| `@` | The @ symbol |
| `[a-zA-Z0-9.-]+` | Domain name |
| `\.` | A literal dot |
| `[a-zA-Z]{2,}` | Top-level domain (at least 2 letters) |
| `$` | End of string |

### URL extraction

```js
const text = "Visit https://example.com or http://docs.test.org/page for more info";
const urlPattern = /https?:\/\/[^\s]+/g;

console.log(text.match(urlPattern));
// ["https://example.com", "http://docs.test.org/page"]
```

### Password strength check

```js
function checkPassword(password) {
    const checks = [
        { pattern: /.{8,}/,       label: "At least 8 characters" },
        { pattern: /[a-z]/,       label: "Lowercase letter" },
        { pattern: /[A-Z]/,       label: "Uppercase letter" },
        { pattern: /\d/,          label: "A digit" },
        { pattern: /[^a-zA-Z\d]/, label: "A special character" },
    ];

    const results = checks.map(({ pattern, label }) => ({
        label,
        passed: pattern.test(password),
    }));

    return results;
}

const result = checkPassword("Hello42!");
for (const { label, passed } of result) {
    console.log(`${passed ? "PASS" : "FAIL"}: ${label}`);
}
```

Result:
```text
PASS: At least 8 characters
PASS: Lowercase letter
PASS: Uppercase letter
PASS: A digit
PASS: A special character
```

### Extracting data from structured text

```js
const log = `
[2025-01-15 10:30:00] ERROR: Connection timeout
[2025-01-15 10:31:15] INFO: Retry successful
[2025-01-15 10:32:00] ERROR: Disk full
`;

const logPattern = /\[(?<date>[\d-]+) (?<time>[\d:]+)\] (?<level>\w+): (?<message>.+)/g;

for (const match of log.matchAll(logPattern)) {
    const { date, time, level, message } = match.groups;
    console.log(`${level} at ${date} ${time}: ${message}`);
}
```

Result:
```text
ERROR at 2025-01-15 10:30:00: Connection timeout
INFO at 2025-01-15 10:31:15: Retry successful
ERROR at 2025-01-15 10:32:00: Disk full
```

### Search and replace with a function

`replace()` accepts a function as the second argument for dynamic replacements:

```js
const template = "Hello {{name}}, welcome to {{place}}!";
const data = { name: "Ada", place: "London" };

const result = template.replace(/\{\{(\w+)\}\}/g, (fullMatch, key) => {
    return data[key] ?? fullMatch;
});

console.log(result); // "Hello Ada, welcome to London!"
```

### Cleaning user input

```js
// Remove extra whitespace
function normalizeWhitespace(text) {
    return text.replace(/\s+/g, " ").trim();
}

console.log(normalizeWhitespace("  hello   world  \n\n ")); // "hello world"

// Strip HTML tags
function stripTags(html) {
    return html.replace(/<[^>]*>/g, "");
}

console.log(stripTags("<p>Hello <b>world</b></p>")); // "Hello world"
```

### Form validation (tying back to chapter 11)

The contact form in chapter 11 validates email with a simple `includes("@")`. Here is a more thorough version using regex:

```js
function validateField(input) {
    const value = input.value.trim();
    const type = input.type;

    if (input.hasAttribute("required") && value === "") {
        return "This field is required";
    }

    if (type === "email" && value !== "") {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
            return "Please enter a valid email address";
        }
    }

    if (input.dataset.pattern) {
        const customRegex = new RegExp(input.dataset.pattern);
        if (!customRegex.test(value)) {
            return input.dataset.patternMessage || "Invalid format";
        }
    }

    return null; // No error
}
```

Using `data-pattern` attributes lets you add regex validation to any field without changing JavaScript:

```html
<input
    type="text"
    id="phone"
    data-pattern="^\+?[\d\s-]{7,15}$"
    data-pattern-message="Please enter a valid phone number"
>
```

## Common pitfalls

### Forgetting to escape special characters

These characters have special meaning in regex and must be escaped with `\` to match literally:

```text
. * + ? ^ $ { } [ ] ( ) | \ /
```

```js
// Bad -- . matches any character
/1.1/.test("111"); // true (not what you want)

// Good -- \. matches a literal dot
/1\.1/.test("111"); // false
/1\.1/.test("1.1"); // true
```

### The `g` flag and `lastIndex`

A regex with the `g` flag maintains state between calls to `test()`:

```js
const pattern = /a/g;

console.log(pattern.test("abc")); // true
console.log(pattern.test("abc")); // false (!) -- starts searching after the first match
console.log(pattern.test("abc")); // true -- wraps around
```

This is a common source of bugs. If you use `test()` in a loop or a function, either:
- Do not use the `g` flag with `test()`
- Create a new regex each time
- Reset `lastIndex` to 0

### Catastrophic backtracking

Some patterns cause the regex engine to try an exponential number of paths:

```js
// Dangerous -- exponential backtracking on non-matching input
const bad = /^(a+)+$/;

// This takes an extremely long time:
// bad.test("aaaaaaaaaaaaaaaaaaaaaaaaaaab");
```

Avoid nested quantifiers like `(a+)+`, `(a*)*`, or `(a|b)*` when possible. If you need them, use atomic groups or possessive quantifiers (available in some engines, not in JavaScript).

## Quick reference

| Pattern | Meaning |
|---------|---------|
| `.` | Any character (except newline) |
| `\d` / `\D` | Digit / non-digit |
| `\w` / `\W` | Word character / non-word character |
| `\s` / `\S` | Whitespace / non-whitespace |
| `[abc]` | Any of a, b, or c |
| `[^abc]` | Any character except a, b, or c |
| `^` / `$` | Start / end of string |
| `\b` | Word boundary |
| `*` / `+` / `?` | Zero+, one+, zero or one |
| `{n}` / `{n,m}` | Exactly n / between n and m |
| `(...)` | Capturing group |
| `(?:...)` | Non-capturing group |
| `(?<name>...)` | Named group |
| `\1` | Backreference to group 1 |
| `a\|b` | a or b |
| `(?=...)` / `(?!...)` | Positive / negative lookahead |
| `(?<=...)` / `(?<!...)` | Positive / negative lookbehind |

## Summary

- Regular expressions describe patterns for matching, searching, and replacing text.
- Use `/pattern/` literal syntax for static patterns, `new RegExp()` for dynamic ones.
- **`test()`** returns true/false; **`match()`** returns matches; **`replace()`** substitutes.
- **Character classes** (`\d`, `\w`, `\s`, `[...]`) match one character from a set.
- **Quantifiers** (`*`, `+`, `?`, `{n,m}`) specify how many times to match.
- **Anchors** (`^`, `$`, `\b`) match positions, not characters.
- **Groups** capture parts of a match; **named groups** (`(?<name>...)`) make patterns readable.
- **Lookahead/lookbehind** assert context without consuming characters.
- Always escape special characters (`\.`, `\$`, `\\`) when matching them literally.
- Use regex for validation, extraction, and replacement -- but keep patterns readable. If a regex becomes unreadable, break it into smaller pieces or use string methods instead.
