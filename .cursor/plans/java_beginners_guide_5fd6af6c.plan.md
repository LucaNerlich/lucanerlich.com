---
name: Java Beginners Guide
overview: Create a comprehensive 12-chapter Java Beginners Guide as a new subcategory under `docs/java/beginners-guide/`, progressing from absolute basics (JDK setup, variables, OOP) through building a CLI task manager, then exposing it as a REST API using the built-in `HttpServer`, and finally deploying the JAR to a VPS with nginx as a reverse proxy. Zero external dependencies; compilation starts with `javac` throughout.
todos:
  - id: category-json
    content: Create `docs/java/beginners-guide/_category_.json` with label and generated-index link
    status: completed
  - id: ch01
    content: "Write chapter 01: Introduction & Environment Setup (JDK, javac, Hello World)"
    status: completed
  - id: ch02
    content: "Write chapter 02: Variables, Types & Operators (primitives, String, casting, operators)"
    status: completed
  - id: ch03
    content: "Write chapter 03: Control Flow (if/else, switch, loops)"
    status: completed
  - id: ch04
    content: "Write chapter 04: Methods (static methods, overloading, varargs, scope)"
    status: completed
  - id: ch05
    content: "Write chapter 05: Classes & Objects (OOP basics, constructors, encapsulation, records)"
    status: completed
  - id: ch06
    content: "Write chapter 06: Inheritance & Interfaces (extends, implements, polymorphism, sealed)"
    status: completed
  - id: ch07
    content: "Write chapter 07: Collections (List, Map, Set, generics intro, cross-link existing guide)"
    status: completed
  - id: ch08
    content: "Write chapter 08: Error Handling (exceptions, try-with-resources, cross-link existing guide)"
    status: completed
  - id: ch09
    content: "Write chapter 09: File I/O (Path, Files, reading/writing, CSV parsing)"
    status: completed
  - id: ch10
    content: "Write chapter 10: Project -- CLI Task Manager (CRUD, file persistence, runnable JAR)"
    status: completed
  - id: ch11
    content: "Write chapter 11: REST API (built-in HttpServer, JSON helpers, expose task manager)"
    status: completed
  - id: ch12
    content: "Write chapter 12: Deploy to VPS (systemd service, nginx reverse proxy, HTTPS)"
    status: completed
  - id: sidebar
    content: Update sidebar-order.ts to order the beginners guide and its chapters
    status: completed
isProject: false
---

# Java Beginners Guide

## Structure

New subcategory at `docs/java/beginners-guide/` following the same pattern as the JavaScript beginners guide and `[docs/design-patterns/creational/](docs/design-patterns/creational/)` -- a `_category_.json` with individual `.md` files per chapter.

### Files to create

- `docs/java/beginners-guide/_category_.json` -- category metadata with `generated-index` landing page
- 12 chapter files (detailed below)

### Files to modify

- `[sidebar-order.ts](sidebar-order.ts)` -- add `'java'` and `'java/beginners-guide'` keys to pin the guide first in the Java sidebar and order the chapters

## Chapter Outline

Each chapter follows the same style as the JavaScript guide and existing Java docs (e.g., `[docs/java/collections.md](docs/java/collections.md)`): comprehensive `.md` files with code examples, expected output, and practical exercises. All code uses `javac`/`java` directly -- no build tool required.

### Part 1: Java Fundamentals

1. `**01-introduction.md**` -- What is Java, JDK vs JRE vs JVM, installing the JDK (LTS), choosing an IDE (IntelliJ / VS Code), `javac` and `java` commands, first "Hello World", packages, `main` method anatomy, comments, semicolons and braces
2. `**02-variables-and-types.md**` -- Primitive types (`int`, `long`, `double`, `float`, `boolean`, `char`, `byte`, `short`), `String` basics, `var` (type inference), type casting (widening/narrowing), `final`, arithmetic/comparison/logical operators, operator precedence, `Math` class
3. `**03-control-flow.md**` -- `if`/`else if`/`else`, ternary, `switch` (classic + enhanced with arrows + pattern matching preview), `for`/`while`/`do-while`, enhanced `for-each`, `break`/`continue`, labeled loops, common patterns (FizzBuzz)
4. `**04-methods.md**` -- Defining and calling `static` methods, parameters and return types, method overloading, `void` methods, early return / guard clauses, varargs, pass-by-value semantics, scope, recursion basics
5. `**05-classes-and-objects.md**` -- Classes vs objects, fields, constructors, `this`, access modifiers (`private`/`public`/`protected`/package-private), getters/setters, encapsulation, `toString`, `equals`/`hashCode`, `static` fields and methods, records (Java 16+), builder pattern intro
6. `**06-inheritance-and-interfaces.md**` -- `extends`, method overriding, `super`, `abstract` classes, `interface`, `implements`, default methods, polymorphism, `instanceof` + pattern matching, sealed classes (Java 17+), when to use inheritance vs composition

### Part 2: Working with Data

1. `**07-collections.md**` -- `ArrayList`, `HashMap`, `HashSet`, iterating (for-each, iterator), generics intro (`List<String>`), `Collections` utility methods, immutable collections (`List.of`, `Map.of`), choosing the right collection. Cross-link to existing [Collections deep dive](docs/java/collections.md)
2. `**08-error-handling.md**` -- `try`/`catch`/`finally`, checked vs unchecked exceptions, `throws`, creating custom exceptions, `try-with-resources` and `AutoCloseable`, multi-catch, exception best practices. Cross-link to existing [Error Handling guide](docs/java/error-handling.md)
3. `**09-file-io.md**` -- `java.nio.file.Path` and `Files`, reading/writing text files, reading line by line, `BufferedReader`/`BufferedWriter`, creating/deleting/listing directories, simple CSV parsing, text-based data persistence

### Part 3: Building and Deploying

1. `**10-project-cli-task-manager.md**` -- Design and build a CLI task manager from scratch: task model (record or class), file-based persistence (one task per line or simple delimited format), CRUD operations via command-line arguments, input validation, packaging as a runnable JAR with `jar`, running with `java -jar`. Ties together chapters 1-9.
2. `**11-rest-api.md**` -- Introduction to HTTP and REST concepts, using `com.sun.net.httpserver.HttpServer` (zero dependencies), creating handlers for GET/POST/PUT/DELETE, request parsing (path, query params, body), manual JSON response building, manual JSON request parsing (helper methods), error responses, refactoring the CLI task manager into an API. Cross-link to existing [HTTP Clients guide](docs/java/http-clients.md)
3. `**12-deploy-vps-nginx.md**` -- Building a fat JAR, transferring to a VPS with `rsync`/`scp`, creating a `systemd` service unit for the Java process, configuring nginx as a reverse proxy (`proxy_pass`), HTTPS with Let's Encrypt, basic monitoring (`journalctl`), health check endpoint, update/deploy workflow

## Cross-links to existing Java content

The beginners guide will link to these existing deeper guides where relevant:


| Chapter               | Links to                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Ch 7 (Collections)    | `[docs/java/collections.md](docs/java/collections.md)`                                                                   |
| Ch 8 (Error Handling) | `[docs/java/error-handling.md](docs/java/error-handling.md)`                                                             |
| Ch 11 (REST API)      | `[docs/java/http-clients.md](docs/java/http-clients.md)`, `[docs/java/json-processing.md](docs/java/json-processing.md)` |


## Key differences from the JavaScript guide

- **OOP focus:** Java is class-based; chapters 5-6 cover OOP in depth (the JS guide did not need this)
- **No browser/DOM chapters:** replaced by collections, error handling, and file I/O
- **Compilation step:** every chapter shows `javac` + `java` commands
- **Typed language:** more emphasis on types, generics, and the compiler catching errors
- **Deployment:** JAR + systemd service + nginx reverse proxy (vs static files served by nginx directly)

## Integration with sidebar

Add to `[sidebar-order.ts](sidebar-order.ts)`:

```typescript
'java': [
    'beginners-guide',
],

'java/beginners-guide': [
    '01-introduction',
    '02-variables-and-types',
    '03-control-flow',
    '04-methods',
    '05-classes-and-objects',
    '06-inheritance-and-interfaces',
    '07-collections',
    '08-error-handling',
    '09-file-io',
    '10-project-cli-task-manager',
    '11-rest-api',
    '12-deploy-vps-nginx',
],
```

