---
title: "JSON Parsing in JavaScript: Safe Patterns and Practical Tips"
sidebar_label: "JSON Parsing"
description: Learn safe JSON parsing and serialization in JavaScript with TypeScript examples. Cover JSON.parse, JSON.stringify, revivers, validation, and common pitfalls.
slug: /javascript/json-parsing
tags: [javascript, typescript, json, parsing]
keywords:
  - JSON parsing
  - JSON.parse
  - JSON.stringify
  - safe JSON parsing
  - JSON validation
sidebar_position: 5
---

# JSON Parsing in JavaScript: Safe Patterns and Practical Tips

JSON is the default data format for web APIs, config files, and lightweight storage. But parsing JSON safely is more than calling `JSON.parse`. You need to consider **error handling**, **validation**, **types**, and **serialization** so the data you read is trustworthy and predictable. This guide covers the full workflow with TypeScript examples and expected results.

## Quick start

```ts
const json = '{"id":1,"name":"Ada"}';
const user = JSON.parse(json) as { id: number; name: string };

console.log(user.name);
```

Result:
```text
Ada
```

## JSON parsing checklist

- **Wrap `JSON.parse` in try/catch** for invalid input.
- **Validate the shape** before you use the data.
- **Keep JSON small** if you parse frequently.
- **Serialize with stable keys** if you compare outputs.
- **Avoid lossy types** (like `Date` or `BigInt`) without a plan.

## Basic parsing with error handling

```ts
function safeParse<T>(input: string): { ok: true; value: T } | { ok: false; error: string } {
    try {
        return { ok: true, value: JSON.parse(input) as T };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { ok: false, error: message };
    }
}

const result = safeParse<{ id: number }>('{"id": 1}');
console.log(result);
```

Result:
```text
{ ok: true, value: { id: 1 } }
```

## Validating the shape

Parsing JSON only gives you `any`. Always validate before using it.

```ts
type User = { id: number; name: string };

function isUser(value: unknown): value is User {
    if (typeof value !== "object" || value === null) return false;
    const v = value as Record<string, unknown>;
    return typeof v.id === "number" && typeof v.name === "string";
}

const parsed = JSON.parse('{"id": 7, "name": "Ada"}') as unknown;
console.log(isUser(parsed));
```

Result:
```text
true
```

## JSON.stringify basics

Use `JSON.stringify` for API payloads, cache values, or logging. It only supports JSON-safe types.

```ts
const data = { id: 1, name: "Ada", active: true };
const jsonText = JSON.stringify(data);

console.log(jsonText);
```

Result:
```text
{"id":1,"name":"Ada","active":true}
```

## Pretty printing

For debug logs or config files, format JSON with indentation.

```ts
const pretty = JSON.stringify({ id: 1, name: "Ada" }, null, 2);
console.log(pretty);
```

Result:
```text
{
  "id": 1,
  "name": "Ada"
}
```

## Reviver for data transformations

The `reviver` option lets you transform values during parse, such as converting dates.

```ts
const input = '{"createdAt":"2026-02-02T14:30:00Z"}';

const withDates = JSON.parse(input, (key, value) => {
    if (key === "createdAt" && typeof value === "string") {
        return new Date(value);
    }
    return value;
}) as { createdAt: Date };

console.log(withDates.createdAt.toISOString());
```

Result:
```text
2026-02-02T14:30:00.000Z
```

## Replacer for controlling output

The `replacer` option lets you control which keys are included.

```ts
const user = { id: 1, name: "Ada", token: "secret" };
const publicJson = JSON.stringify(user, ["id", "name"]);

console.log(publicJson);
```

Result:
```text
{"id":1,"name":"Ada"}
```

## Filter unknown fields

If you need a strict schema, discard unknown keys so extra fields do not leak into your domain model.

```ts
type PublicUser = { id: number; name: string };

function toPublicUser(value: Record<string, unknown>): PublicUser {
    return { id: Number(value.id), name: String(value.name) };
}

const raw = JSON.parse('{"id":1,"name":"Ada","role":"admin"}') as Record<string, unknown>;
console.log(toPublicUser(raw));
```

Result:
```text
{ id: 1, name: "Ada" }
```

## Stable JSON for comparisons

JSON output is not stable if key order varies. If you compare JSON strings (for caching or hashing), normalize key order.

```ts
function stableStringify(value: Record<string, unknown>): string {
    const sortedKeys = Object.keys(value).sort();
    const normalized: Record<string, unknown> = {};
    for (const key of sortedKeys) normalized[key] = value[key];
    return JSON.stringify(normalized);
}

const left = stableStringify({ b: 2, a: 1 });
const right = stableStringify({ a: 1, b: 2 });

console.log(left === right);
```

Result:
```text
true
```

## Handling optional values

Prefer defaults when fields are missing. This avoids undefined checks everywhere.

```ts
type Settings = { theme?: string; pageSize?: number };

function normalizeSettings(raw: Settings): Required<Settings> {
    return {
        theme: raw.theme ?? "dark",
        pageSize: raw.pageSize ?? 20,
    };
}

const parsedSettings = JSON.parse('{"theme":"light"}') as Settings;
console.log(normalizeSettings(parsedSettings));
```

Result:
```text
{ theme: "light", pageSize: 20 }
```

## JSON limitations to remember

JSON does not support `undefined`, functions, or `BigInt`. Dates are serialized as strings. Plan for these conversions.

```ts
const payload = { id: 1, createdAt: new Date("2026-02-02T14:30:00Z") };
const text = JSON.stringify(payload);

console.log(text);
```

Result:
```text
{"id":1,"createdAt":"2026-02-02T14:30:00.000Z"}
```

## Redacting before logging

When you log parsed JSON, mask secrets or tokens to reduce risk.

```ts
function redact(value: Record<string, unknown>): Record<string, unknown> {
    const copy = { ...value };
    if (typeof copy.token === "string") copy.token = "***";
    return copy;
}

const payload = { id: 1, token: "secret-token" };
console.log(redact(payload));
```

Result:
```text
{ id: 1, token: "***" }
```

## Avoid parsing JSON repeatedly

If you read the same JSON value often, parse once and reuse.

```ts
const jsonBlob = '{"items":[1,2,3,4]}';
const data = JSON.parse(jsonBlob) as { items: number[] };
const total = data.items.reduce((acc, v) => acc + v, 0);

console.log(total);
```

Result:
```text
10
```

## Common pitfalls

- **Trusting unvalidated JSON**: parsing is not validation.
- **Ignoring parse errors**: always handle invalid input.
- **Comparing raw JSON strings**: key order can differ.
- **Assuming dates stay dates**: they become strings.
- **Serializing sensitive data**: avoid exposing secrets.

## Best practices

- **Use `safeParse` helpers** with explicit error handling.
- **Validate types** with small type guards.
- **Keep JSON payloads small** for frequent parsing.
- **Normalize optional fields** to consistent shapes.
- **Document serialization rules** in your API contract.

## FAQ: JSON parsing in JavaScript

### How do I parse JSON safely?

Use `try/catch` or a helper that returns a result object.

```ts
const parsed = safeParse<{ ok: boolean }>('{"ok": true}');
console.log(parsed.ok);
```

Result:
```text
true
```

### How do I parse JSON into a TypeScript type?

Parse to `unknown`, then validate with a type guard.

```ts
const raw = JSON.parse('{"id": 1, "name": "Ada"}') as unknown;
console.log(isUser(raw));
```

Result:
```text
true
```

### How do I stringify JSON with formatting?

Use the `space` parameter of `JSON.stringify`.

```ts
const formatted = JSON.stringify({ id: 1 }, null, 2);
console.log(formatted);
```

Result:
```text
{
  "id": 1
}
```

## Summary

Safe JSON handling is about more than parsing. Validate shapes, handle errors, normalize defaults, and control serialization. Those habits make your data layer resilient and your code easier to maintain.
