---
title: "Map, Set, WeakMap & WeakSet"
sidebar_label: "Map & Set"
description: Learn JavaScript's keyed collections - Map, Set, WeakMap, and WeakSet - when to use them instead of objects and arrays, set operations, and common pitfalls.
slug: /javascript/beginners-guide/maps-and-sets
tags: [javascript, beginners, map, set, collections]
keywords:
  - javascript map
  - javascript set
  - weakmap
  - weakset
  - set operations
  - remove duplicates javascript
sidebar_position: 18
---

# Map, Set, WeakMap & WeakSet

Objects and arrays cover most everyday needs, but JavaScript has four more built-in collections that solve specific
problems better:

| Collection | Stores                     | Use it when you need                                  |
|------------|----------------------------|-------------------------------------------------------|
| `Map`      | Key-value pairs            | A dictionary with any key type, frequent adds/removes |
| `Set`      | Unique values              | Deduplication and fast "have I seen this?" checks     |
| `WeakMap`  | Object keys -> values      | Extra data attached to objects you do not own         |
| `WeakSet`  | Unique objects             | Marking objects without keeping them alive            |

## Why not just use an object?

Plain objects work as dictionaries, but they have limits:

```js
const scores = {};
const ada = { name: "Ada" };
const alan = { name: "Alan" };

// Object keys are always strings (or symbols) - objects get converted to "[object Object]"
scores[ada] = 10;
scores[alan] = 20;

console.log(scores[ada]);         // 20 (!) - both keys became "[object Object]"
console.log(Object.keys(scores)); // ["[object Object]"]
```

Objects also:

- Inherit keys from `Object.prototype`, so `"toString" in {}` is `true`.
- Reorder integer-like keys: `Object.keys({ b: 1, 2: "x", a: 2, 1: "y" })` returns `["1", "2", "b", "a"]`.
- Have no built-in size - you need `Object.keys(obj).length`.

A `Map` fixes all of these.

## Map

### Creating and using a Map

```js
const ages = new Map();

ages.set("Ada", 36);
ages.set("Alan", 41);

console.log(ages.get("Ada"));   // 36
console.log(ages.get("Grace")); // undefined
console.log(ages.has("Alan"));  // true
console.log(ages.size);         // 2

ages.delete("Alan");            // returns true if the key existed
console.log(ages.size);         // 1

ages.clear();                   // remove everything
console.log(ages.size);         // 0
```

`set()` returns the map itself, so you can chain calls:

```js
const colors = new Map()
    .set("red", "#ff0000")
    .set("green", "#00ff00");
```

You can also create a Map from an array of `[key, value]` pairs:

```js
const capitals = new Map([
    ["France", "Paris"],
    ["Japan", "Tokyo"],
]);

console.log(capitals.get("Japan")); // "Tokyo"
```

### Any value can be a key

Keys keep their type. The number `1` and the string `"1"` are different keys, and objects are compared **by
reference**:

```js
const map = new Map();
const ada = { name: "Ada" };
const alan = { name: "Alan" };

map.set(1, "number one");
map.set("1", "string one");
map.set(ada, 10);
map.set(alan, 20);

console.log(map.get(1));    // "number one"
console.log(map.get("1"));  // "string one"
console.log(map.get(ada));  // 10
console.log(map.get(alan)); // 20

// A different object with the same contents is a different key
console.log(map.get({ name: "Ada" })); // undefined
```

Map compares keys with the "SameValueZero" algorithm. It works like `===`, except that `NaN` matches `NaN`:

```js
const map = new Map([[NaN, "not a number"]]);
console.log(map.get(NaN)); // "not a number"
```

### Iterating over a Map

A Map remembers the **insertion order** of its keys, and iterating it gives you `[key, value]` pairs:

```js
const stock = new Map([
    ["apples", 5],
    ["pears", 0],
    ["plums", 12],
]);

for (const [fruit, count] of stock) {
    console.log(`${fruit}: ${count}`);
}

console.log([...stock.keys()]);   // ["apples", "pears", "plums"]
console.log([...stock.values()]); // [5, 0, 12]
console.log([...stock.entries()]); // [["apples", 5], ["pears", 0], ["plums", 12]]

// forEach passes the value first, then the key
stock.forEach((count, fruit) => {
    console.log(fruit, count);
});
```

Result of the `for...of` loop:

```text
apples: 5
pears: 0
plums: 12
```

### Converting between objects and Maps

```js
const settings = { theme: "dark", fontSize: 16 };

// Object -> Map
const settingsMap = new Map(Object.entries(settings));

// Map -> Object (keys must be strings or symbols to survive)
const backToObject = Object.fromEntries(settingsMap);
console.log(backToObject); // { theme: "dark", fontSize: 16 }
```

### Maps and JSON

`JSON.stringify()` does not know about Maps. It silently produces an empty object:

```js
const map = new Map([["a", 1]]);

console.log(JSON.stringify(map));                     // {} (data lost!)
console.log(JSON.stringify(Object.fromEntries(map))); // {"a":1}
console.log(JSON.stringify([...map]));                // [["a",1]]
```

Use the array-of-pairs form if your keys are not strings - you can rebuild the Map with `new Map(JSON.parse(text))`.

### Practical example: counting words

```js
function countWords(text) {
    const counts = new Map();

    for (const word of text.toLowerCase().match(/\w+/g) ?? []) {
        counts.set(word, (counts.get(word) ?? 0) + 1);
    }

    return counts;
}

const counts = countWords("The cat and the hat and the bat");

// Sort by count, highest first
const sorted = [...counts].sort((a, b) => b[1] - a[1]);
console.log(sorted.slice(0, 2)); // [["the", 3], ["and", 2]]
```

### Grouping with `Map.groupBy()`

`Map.groupBy()` (ES2024, Node 21+ and all current browsers) groups the items of an array into a Map using a callback:

```js
const people = [
    { name: "Ada", team: "core" },
    { name: "Alan", team: "infra" },
    { name: "Grace", team: "core" },
];

const byTeam = Map.groupBy(people, (person) => person.team);

console.log(byTeam.get("core").map((p) => p.name)); // ["Ada", "Grace"]
console.log(byTeam.get("infra").length);            // 1
```

`Object.groupBy()` does the same thing but returns a plain object, which is fine when the group keys are strings.

## Set

A `Set` stores **unique** values. Adding a value that is already present does nothing.

```js
const tags = new Set();

tags.add("js");
tags.add("css");
tags.add("js"); // ignored - already in the set

console.log(tags.size);        // 2
console.log(tags.has("css"));  // true
tags.delete("css");
console.log([...tags]);        // ["js"]
```

### Removing duplicates from an array

The most common Set trick:

```js
const numbers = [3, 1, 3, 2, 1];
const unique = [...new Set(numbers)];

console.log(unique); // [3, 1, 2] - first occurrence order is kept
```

### Fast membership checks

`array.includes()` scans the whole array every time. `set.has()` is a near-constant-time lookup, which matters inside
loops:

```js
const blocked = new Set(["spam@example.com", "bot@example.com"]);

const emails = ["ada@example.com", "bot@example.com", "alan@example.com"];
const allowed = emails.filter((email) => !blocked.has(email));

console.log(allowed); // ["ada@example.com", "alan@example.com"]
```

### Objects in a Set are compared by reference

```js
const pairs = new Set([[1, 2], [1, 2]]);
console.log(pairs.size); // 2 - two different array objects

const point = { x: 1 };
const points = new Set([point, point]);
console.log(points.size); // 1 - the same object twice
```

If you need to deduplicate objects by their contents, deduplicate by a key instead:

```js
const users = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Alan" },
    { id: 1, name: "Ada (duplicate)" },
];

const seen = new Set();
const uniqueUsers = users.filter((user) => {
    if (seen.has(user.id)) return false;
    seen.add(user.id);
    return true;
});

console.log(uniqueUsers.map((u) => u.name)); // ["Ada", "Alan"]
```

### Set operations

Modern JavaScript (ES2025 - Node 22+, Chrome 122+, Firefox 127+, Safari 17+) has built-in methods for combining sets.
Each returns a **new** Set (or a boolean) and leaves the originals unchanged:

```js
const frontend = new Set(["html", "css", "js"]);
const backend = new Set(["js", "sql", "docker"]);

console.log([...frontend.union(backend)]);               // ["html", "css", "js", "sql", "docker"]
console.log([...frontend.intersection(backend)]);        // ["js"]
console.log([...frontend.difference(backend)]);          // ["html", "css"]
console.log([...frontend.symmetricDifference(backend)]); // ["html", "css", "sql", "docker"]

const basics = new Set(["html", "css"]);
console.log(basics.isSubsetOf(frontend));   // true
console.log(frontend.isSupersetOf(basics)); // true
console.log(basics.isDisjointFrom(backend)); // true - nothing in common
```

The argument must be a Set (or a Set-like object with `size`, `has()`, and `keys()`). Passing an array throws a
`TypeError` - wrap it first: `frontend.union(new Set(["rust"]))`.

For older environments, the same results with spread and `filter`:

```js
const union = new Set([...frontend, ...backend]);
const intersection = new Set([...frontend].filter((x) => backend.has(x)));
const difference = new Set([...frontend].filter((x) => !backend.has(x)));
```

## WeakMap and WeakSet

`WeakMap` and `WeakSet` hold their keys **weakly**: if nothing else in your program references a key object, the
garbage collector can remove it, and the entry disappears with it. A regular Map would keep the object in memory
for as long as the Map exists.

This comes with restrictions:

- Keys must be objects (or non-registered symbols). Primitive keys throw a `TypeError`.
- They are **not iterable** and have no `size`, `keys()`, or `clear()` - entries can vanish at any time, so listing them
  would not be reliable.
- Available methods: `WeakMap` has `set`, `get`, `has`, `delete`; `WeakSet` has `add`, `has`, `delete`.

```js
const weak = new WeakMap();

weak.set({}, "ok");
weak.set("text", "fails"); // TypeError: Invalid value used as weak map key
```

### Use case: attaching data to objects you do not own

Store extra information about DOM elements or third-party objects without adding properties to them:

```js
const clickCounts = new WeakMap();

function trackClicks(button) {
    button.addEventListener("click", () => {
        const count = (clickCounts.get(button) ?? 0) + 1;
        clickCounts.set(button, count);
        console.log(`Clicked ${count} times`);
    });
}
```

When the button is removed from the page and nothing else references it, its entry in `clickCounts` can be garbage
collected too.

### Use case: caching results per object

```js
const cache = new WeakMap();

function getTotal(order) {
    if (cache.has(order)) {
        return cache.get(order);
    }

    const total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    cache.set(order, total);
    return total;
}

const order = { items: [{ price: 10, qty: 2 }, { price: 5, qty: 1 }] };
console.log(getTotal(order)); // 25 - calculated
console.log(getTotal(order)); // 25 - from the cache
```

This cache assumes an order is not changed after its first calculation. If you mutate `order.items`, the cached total
is stale.

### Use case: marking objects with WeakSet

```js
const processed = new WeakSet();

function processOnce(item) {
    if (processed.has(item)) return;
    processed.add(item);
    console.log("processing", item.id);
}

const job = { id: 7 };
processOnce(job); // "processing 7"
processOnce(job); // (nothing)
```

## Choosing the right collection

| Question                                                      | Use       |
|---------------------------------------------------------------|-----------|
| Fixed shape with known property names (a user, a config)?     | Object    |
| Needs to be sent as JSON as-is?                               | Object    |
| Dictionary with non-string keys or frequent adds and deletes? | `Map`     |
| Ordered list where duplicates are allowed?                    | Array     |
| Unique values, fast `has()` checks, set math?                 | `Set`     |
| Extra data for objects whose lifetime you do not control?     | `WeakMap` |
| Flagging objects without keeping them alive?                  | `WeakSet` |

## Common pitfalls

### Using bracket notation on a Map

```js
const map = new Map();

map["key"] = "value";         // sets a normal property on the Map object - not a Map entry
console.log(map.get("key"));  // undefined
console.log(map.size);        // 0

map.set("key", "value");      // correct
```

### Mutating an object used as a key

Keys are matched by reference, not by contents. Changing an object's properties does not change its key, but creating
a "copy" of it gives you a different key:

```js
const map = new Map();
const user = { id: 1 };
map.set(user, "data");

user.id = 2;
console.log(map.get(user));             // "data" - same reference
console.log(map.get({ ...user }));      // undefined - new object
```

### Forgetting that iterators are used up

`map.keys()`, `map.values()`, and `set.values()` return **iterators**, which can only be consumed once:

```js
const keys = new Map([["a", 1]]).keys();

console.log([...keys]); // ["a"]
console.log([...keys]); // [] - already used up
```

The next chapter explains why.

## Summary

- **`Map`** is a key-value collection that accepts any key type, keeps insertion order, and has a `size`.
- **`Set`** stores unique values - use it to remove duplicates and for fast `has()` lookups.
- Both compare keys with SameValueZero: like `===`, but `NaN` equals `NaN`. Objects are compared by reference.
- Modern Sets have built-in `union`, `intersection`, `difference`, `symmetricDifference`, and subset checks.
- `JSON.stringify()` turns Maps and Sets into `{}` - convert them to objects or arrays first.
- **`WeakMap`** and **`WeakSet`** hold object keys weakly, so entries can be garbage collected. They are not iterable.
- Use plain objects for fixed-shape records and JSON; use Maps for dynamic dictionaries.

Next up: [Iterators & Generators](./19-iterators-and-generators.md) - the protocol behind `for...of`, spread, and
destructuring, and how to write your own lazy sequences.
