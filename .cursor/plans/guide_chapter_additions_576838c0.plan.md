---
name: Guide chapter additions
overview: Add 2 new chapters to the JavaScript beginners guide (Error Handling, Regular Expressions) and 3 new chapters to the Java beginners guide (Streams & Lambdas, Optionals, Testing).
todos:
  - id: js-error-handling
    content: Create 14-error-handling.md in JS beginners guide
    status: completed
  - id: js-regex
    content: Create 15-regular-expressions.md in JS beginners guide
    status: completed
  - id: js-updates
    content: Update JS sidebar-order, intro table, and ch 13 ending
    status: completed
  - id: java-streams
    content: Create 15-streams-and-lambdas.md in Java beginners guide
    status: completed
  - id: java-optionals
    content: Create 16-optionals.md in Java beginners guide
    status: completed
  - id: java-testing
    content: Create 17-testing.md in Java beginners guide
    status: completed
  - id: java-updates
    content: Update Java sidebar-order, intro table, and ch 14 ending
    status: completed
isProject: false
---

# Add New Chapters to JS and Java Beginners Guides

## JavaScript Guide -- 2 new chapters

### Chapter 14: Error Handling

**File:** `docs/javascript/beginners-guide/14-error-handling.md`

**Placement:** After TypeScript (ch 13), but logically this is a core skill. It slots in as a standalone topic after the TypeScript chapter since the fundamentals (ch 1-6) flow naturally without it, and having it after TypeScript lets us show both JS and TS error patterns.

**Content outline:**

- The `Error` object -- `message`, `name`, `stack`, `cause`
- `try` / `catch` / `finally` -- basic syntax and flow
- Common error types: `TypeError`, `RangeError`, `ReferenceError`, `SyntaxError`
- Throwing custom errors -- `throw new Error("...")`, custom error classes
- Error handling with async/await -- `try`/`catch` around `await`, `.catch()` on promises
- Error handling in the DOM -- handling failed fetch, user input errors, showing UI feedback
- Patterns: guard clauses, fail-fast, error boundaries concept
- Anti-patterns: empty catch blocks, swallowing errors, catching too broadly
- Cross-link to the standalone [error handling reference](docs/javascript/javascript-error-handling.md) for TypeScript patterns and advanced topics

### Chapter 15: Regular Expressions

**File:** `docs/javascript/beginners-guide/15-regular-expressions.md`

**Content outline:**

- What regex is and when to use it
- Creating patterns -- literal (`/pattern/`) and `new RegExp()`
- Core methods: `test()`, `match()`, `replace()`, `search()`, `split()`
- Character classes: `\d`, `\w`, `\s`, `.`, `[abc]`, `[^abc]`, ranges
- Quantifiers: `*`, `+`, `?`, `{n}`, `{n,m}`
- Anchors: `^`, `$`, `\b`
- Groups and capturing: `()`, named groups `(?<name>...)`, backreferences
- Flags: `g`, `i`, `m`, `s`, `u`
- Lookahead and lookbehind: `(?=...)`, `(?!...)`, `(?<=...)`, `(?<!...)`
- Practical examples: email validation, URL parsing, extracting data, search-and-replace
- Common pitfalls: greedy vs lazy matching, escaping special characters, catastrophic backtracking
- Regex in form validation (tying back to the contact form in ch 11)

### Supporting updates (JS)

- **[sidebar-order.ts](sidebar-order.ts):** Add `'14-error-handling'` and `'15-regular-expressions'` to the `'javascript/beginners-guide'` array
- **[01-introduction.md](docs/javascript/beginners-guide/01-introduction.md):** Update the structure table to add Part 5 (Error Handling, Regular Expressions)
- **[13-typescript.md](docs/javascript/beginners-guide/13-typescript.md):** Update the summary/ending to link to the next chapter

---

## Java Guide -- 3 new chapters

### Chapter 15: Streams & Lambdas

**File:** `docs/java/beginners-guide/15-streams-and-lambdas.md`

**Placement:** After Gradle (ch 14). Builds on collections (ch 7) and introduces functional Java.

**Content outline:**

- Lambdas -- syntax, functional interfaces (`Predicate`, `Function`, `Consumer`, `Supplier`)
- Method references -- `String::toUpperCase`, `System.out::println`
- The Stream pipeline -- source, intermediate ops, terminal ops
- Key operations: `filter()`, `map()`, `flatMap()`, `sorted()`, `distinct()`
- Terminal operations: `collect()`, `toList()`, `forEach()`, `reduce()`, `count()`
- Collectors: `toList()`, `toSet()`, `toMap()`, `groupingBy()`, `joining()`
- Practical examples using the Task Manager data model from ch 10
- Optional integration (bridge to ch 16)
- When NOT to use streams (readability, performance, side effects)
- Cross-link to standalone [Streams and Collectors](docs/java/java-streams.md) and [Functional Interfaces](docs/java/functional-interfaces.md) for advanced topics

### Chapter 16: Optionals

**File:** `docs/java/beginners-guide/16-optionals.md`

**Content outline:**

- The `null` problem -- `NullPointerException` and why it is Java's most common bug
- Creating Optionals: `Optional.of()`, `Optional.ofNullable()`, `Optional.empty()`
- Consuming values: `isPresent()`, `ifPresent()`, `orElse()`, `orElseGet()`, `orElseThrow()`
- Transforming: `map()`, `flatMap()`, `filter()`
- Chaining Optionals in a pipeline
- Practical examples: refactoring the Task Manager's `findById()` to return `Optional<Task>`
- Anti-patterns: `Optional` as field type, `Optional.get()` without check, wrapping everything
- Best practices: when to use Optional vs null vs exceptions
- Cross-link to standalone [Optionals reference](docs/java/optionals.md)

### Chapter 17: Testing

**File:** `docs/java/beginners-guide/17-testing.md`

**Content outline:**

- Why testing matters -- catching bugs early, refactoring confidence, documentation
- Adding JUnit 5 to Maven/Gradle (building on ch 13-14)
- First test: `@Test`, assertions (`assertEquals`, `assertTrue`, `assertThrows`)
- Test structure: Arrange-Act-Assert pattern
- Testing the Task Manager: CRUD operations, edge cases, file persistence
- `@BeforeEach` / `@AfterEach` -- setup and teardown
- `@ParameterizedTest` -- testing with multiple inputs
- `@DisplayName` -- readable test names
- Testing the REST API: starting the server in tests, sending HTTP requests
- Assertions with AssertJ (brief intro, show the fluent style)
- What makes a good test: fast, isolated, repeatable, self-validating
- Cross-link to standalone [Testing reference](docs/java/testing.md) for Mockito and advanced patterns

### Supporting updates (Java)

- **[sidebar-order.ts](sidebar-order.ts):** Add `'15-streams-and-lambdas'`, `'16-optionals'`, `'17-testing'` to the `'java/beginners-guide'` array
- **[01-introduction.md](docs/java/beginners-guide/01-introduction.md):** Update the structure table to add Part 5 (Streams, Optionals, Testing)
- **[14-gradle.md](docs/java/beginners-guide/14-gradle.md):** Update ending to link to the next chapter

---

## Consistency checks

- No em dashes -- use `--` throughout
- Use same frontmatter format as existing chapters (title, sidebar_label, description, slug, tags, keywords, sidebar_position)
- Cross-link to standalone reference docs where they exist for deeper reading

