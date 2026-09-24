---
title: "ES Modules"
sidebar_label: "ES Modules"
description: Learn JavaScript ES modules - imports, exports, browser modules, dynamic import, top-level await, Node.js ESM, import maps, and bundlers.
slug: /javascript/beginners-guide/modules
tags: [javascript, beginners, modules, esm]
keywords:
  - javascript modules
  - ES modules
  - import export
  - dynamic import
  - Node.js ESM
sidebar_position: 17
---

# ES Modules

As programs grow, putting everything in one JavaScript file becomes hard to maintain. **ES modules** let you split code
into files and explicitly choose what each file shares.

Modules help you:

- Reuse code without copying it
- Keep private helper functions private
- Avoid global variables
- Make dependencies visible with `import` statements
- Let browsers and tools load only the code they need

The website project in [Build a Website](./11-project-build-a-website.md) already uses modules for Web Components.

## Named exports

A file can export multiple named values:

```js
// math.js
export const pi = 3.14159;

export function add(a, b) {
    return a + b;
}

export function circleArea(radius) {
    return pi * radius * radius;
}
```

Import named exports with matching names:

```js
// main.js
import { add, circleArea } from "./math.js";

console.log(add(2, 3));
console.log(circleArea(2));
```

Result:

```text
5
12.56636
```

Named exports are usually the clearest choice because the imported names are explicit.

## Default exports

A module can also have one default export:

```js
// logger.js
export default function log(message) {
    console.log(`[app] ${message}`);
}
```

Import a default export with any local name:

```js
// main.js
import log from "./logger.js";

log("Started");
```

Result:

```text
[app] Started
```

Default exports are common for a file whose main purpose is one class, function, or component. Prefer named exports
when a file exposes several related values.

## Export lists

You can define values first and export them at the end:

```js
const taxRate = 0.19;

function calculateTax(amount) {
    return amount * taxRate;
}

function calculateTotal(amount) {
    return amount + calculateTax(amount);
}

export { calculateTax, calculateTotal };
```

This style keeps the public API visible in one place.

## Renaming imports and exports

Use `as` when names would conflict or when a local name should be clearer:

```js
// text.js
function format(value) {
    return String(value).trim().toLowerCase();
}

export { format as formatText };
```

```js
// main.js
import { formatText as normalizeText } from "./text.js";

console.log(normalizeText("  Hello  "));
```

Result:

```text
hello
```

## Namespace imports

Use `* as` to import a module as an object:

```js
// math.js
export function add(a, b) {
    return a + b;
}

export function multiply(a, b) {
    return a * b;
}
```

```js
// main.js
import * as math from "./math.js";

console.log(math.add(2, 3));
console.log(math.multiply(4, 5));
```

Result:

```text
5
20
```

Namespace imports are useful when a module has many related exports, but avoid using them as a dumping ground.

## Re-exports

Re-export from another module to create a small public entry point:

```js
// shapes/circle.js
export function circleArea(radius) {
    return Math.PI * radius * radius;
}
```

```js
// shapes/square.js
export function squareArea(side) {
    return side * side;
}
```

```js
// shapes/index.js
export { circleArea } from "./circle.js";
export { squareArea } from "./square.js";
```

```js
// main.js
import { circleArea, squareArea } from "./shapes/index.js";

console.log(circleArea(2).toFixed(2));
console.log(squareArea(4));
```

Result:

```text
12.57
16
```

Re-export files are sometimes called "barrels". Use them when they simplify imports, but avoid very large barrels that
hide what code is actually used.

## Browser modules

In browsers, load an ES module with `type="module"`:

```html
<script type="module" src="./main.js"></script>
```

Browser modules have important rules:

- They are deferred by default, so they run after the HTML document has been parsed.
- They always run in strict mode.
- Top-level variables stay in module scope; they do not become properties on `window`.
- Module files are loaded with CORS rules. Opening an HTML file with `file://` usually does not work. Use a local HTTP
  server instead.
- Relative imports need `./`, `../`, or `/`.
- In browsers without a bundler, relative imports need the file extension: `./math.js`, not `./math`.

```js
// main.js
import { add } from "./math.js";

console.log(add(2, 3));
```

The `./` is required. A bare specifier such as `"math"` only works when a bundler or import map knows what it means.

## Module scope

Each module has its own top-level scope:

```js
// user.js
const name = "Ada";

export function getName() {
    return name;
}
```

```js
// main.js
import { getName } from "./user.js";

const name = "Grace";

console.log(getName());
console.log(name);
```

Result:

```text
Ada
Grace
```

The two `name` variables do not conflict because they live in different modules.

## Modules evaluate once

A module runs once, then its exports are reused by every importer:

```js
// counter.js
let count = 0;

export function increment() {
    count += 1;
    return count;
}
```

```js
// first.js
import { increment } from "./counter.js";

console.log(increment());
```

```js
// second.js
import { increment } from "./counter.js";

console.log(increment());
```

If `first.js` and `second.js` run in the same module graph, they share the same `count`.

Result:

```text
1
2
```

This behavior is useful for singletons such as shared configuration, caches, or connection managers. Be careful with
mutable shared state because every importer sees the same module instance.

## Live bindings

Imported bindings are **live**. If the exporting module changes a value, importers see the updated value:

```js
// counter.js
export let count = 0;

export function increment() {
    count += 1;
}
```

```js
// main.js
import { count, increment } from "./counter.js";

console.log(count);
increment();
console.log(count);
```

Result:

```text
0
1
```

The imported `count` binding is read-only from the importing module. You can read updates, but you cannot assign to
`count` directly in `main.js`.

## Dynamic `import()`

Static imports run before the module body. Dynamic `import()` loads a module when the code reaches that line:

```js
async function loadMath() {
    const math = await import("./math.js");
    return math.add(2, 3);
}

console.log(await loadMath());
```

Result:

```text
5
```

Dynamic import is useful for:

- Loading optional features
- Splitting large applications into smaller chunks
- Loading code only after a user action

`import()` returns a promise that resolves to the module namespace object.

## Top-level await

In ES modules, `await` is allowed at the top level:

```js
// user.js
const response = await Promise.resolve({ name: "Ada" });

export const user = response;
```

```js
// main.js
import { user } from "./user.js";

console.log(user.name);
```

Result:

```text
Ada
```

Modules that import `user.js` wait until its top-level await finishes. Use this carefully - it can delay the startup of
the whole module graph.

## `import.meta.url`

`import.meta.url` contains the URL of the current module. It is useful for building paths relative to the module file:

```js
const dataUrl = new URL("./data/users.json", import.meta.url);

console.log(dataUrl.pathname.endsWith("/data/users.json"));
```

Result:

```text
true
```

In Node.js, `import.meta.url` is a `file:` URL for local files. In browsers, it is the URL from which the module was
loaded.

## CommonJS vs ES modules in Node.js

Node.js supports both CommonJS and ES modules:

| Format   | Export syntax                         | Import syntax                           | Common file extensions       |
|----------|---------------------------------------|-----------------------------------------|------------------------------|
| ESM      | `export function add() {}`            | `import { add } from "./math.js"`       | `.mjs`, or `.js` with ESM    |
| CommonJS | `module.exports = { add }`            | `const { add } = require("./math.cjs")` | `.cjs`, or `.js` with CJS    |

Use `"type": "module"` in `package.json` when `.js` files should be ES modules:

```json
{
    "type": "module"
}
```

Then `.js` files in that package are treated as ES modules. Use `.cjs` for a CommonJS file inside an ESM package, and
`.mjs` for an ESM file inside a CommonJS package. Being explicit avoids surprises.

```js
// math.mjs
export function add(a, b) {
    return a + b;
}
```

```js
// legacy.cjs
const math = require("./math.mjs");

console.log(math.add(2, 3));
```

Result:

```text
5
```

In Node.js 22.12+ and 20.19+, `require()` of ES modules is unflagged for modules that do not use top-level await. If
the ES module uses top-level await, load it from CommonJS with dynamic `import()` instead:

```js
// legacy.cjs
async function main() {
    const math = await import("./math.mjs");
    console.log(math.add(2, 3));
}

main();
```

For new Node.js code, prefer one module system per package. ESM is the modern default for browser-aligned JavaScript.

## Import maps

Import maps let browsers resolve bare specifiers without a bundler:

```html
<script type="importmap">
{
    "imports": {
        "utils/": "/assets/js/utils/"
    }
}
</script>

<script type="module">
    import { formatDate } from "utils/dates.js";

    console.log(formatDate(new Date("2026-09-24T00:00:00Z")));
</script>
```

Import maps are useful for small browser projects, demos, and controlling CDN URLs. In larger applications, a bundler
usually manages this mapping for you.

## Bundlers

Bundlers such as Vite read your module graph and prepare it for production:

- They let you import packages from `node_modules`.
- They transform modern syntax when needed.
- They combine and split files for faster loading.
- They fingerprint assets for caching.
- They provide a development server with hot reload.

For a new browser project, Vite is a common starting point:

```bash
pnpm create vite my-app
cd my-app
pnpm install
pnpm dev
```

Even with a bundler, writing clear ES modules matters. The bundler follows your imports and exports.

## Common mistakes

### Missing `./` in browser imports

```js
// Bad in browsers without a bundler or import map
import { add } from "math.js";

// Good
import { add } from "./math.js";
```

### Forgetting the file extension in browser imports

```js
// Bad in browsers without a bundler
import { add } from "./math";

// Good
import { add } from "./math.js";
```

### Expecting module variables to be global

```js
// main.js
var appName = "Docs";

console.log(window.appName);
```

Result:

```text
undefined
```

In a classic `<script>`, a top-level `var` becomes a property of `window`. In a module, even `var` stays in module scope.
Export values if another module needs them.

## Summary

- ES modules split code into files with explicit `import` and `export` statements.
- Named exports are explicit and work well for most modules; default exports are best when one value is the clear main
  export.
- Imports can be renamed, grouped with `* as`, or re-exported through an entry file.
- Browser modules use `<script type="module">`, are deferred by default, run in strict mode, and need HTTP rather than
  `file://`.
- Relative browser imports need `./` or `../` and usually need the file extension without a bundler.
- Modules evaluate once and exports are live bindings.
- Dynamic `import()` loads modules on demand; top-level await can delay modules that depend on it.
- `import.meta.url` gives the current module URL.
- Node.js supports both CommonJS and ESM. Use `"type": "module"`, `.mjs`, and `.cjs` intentionally.
- Import maps and bundlers help resolve module specifiers and prepare code for browsers.

Next up: [Maps & Sets](./18-maps-and-sets.md) - use keyed collections and unique-value sets effectively.
