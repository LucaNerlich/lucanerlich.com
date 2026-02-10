---
title: "Optionals"
sidebar_label: "Optionals"
description: Avoid NullPointerException with Java's Optional -- creation, unwrapping, chaining, and best practices for handling missing values.
slug: /java/beginners-guide/optionals
tags: [java, beginners, optional, null-safety]
keywords:
  - java optional
  - nullpointerexception
  - optional of
  - optional map
  - null safety
sidebar_position: 16
---

# Optionals

`NullPointerException` is the most common runtime error in Java. It happens when you call a method on a `null`
reference:

```java
String name = null;
System.out.println(name.length()); // NullPointerException
```

`Optional<T>` is a container that either holds a value or is empty. It forces you to explicitly handle the "no value"
case instead of hoping `null` never shows up.

## The problem with `null`

Consider a method that looks up a user by ID:

```java
// Returns null if the user is not found
User findUser(int id) {
    for (User user : users) {
        if (user.id() == id) return user;
    }
    return null;
}

// Caller must remember to check for null
User user = findUser(42);
System.out.println(user.name()); // NullPointerException if user is null
```

The problem: nothing in the method signature tells the caller that `null` is possible. The `null` check is easy to
forget, and the crash happens somewhere far from the actual cause.

## Creating Optionals

### `Optional.of()` -- value must not be null

```java
Optional<String> name = Optional.of("Ada");
System.out.println(name); // Optional[Ada]

// Throws NullPointerException immediately -- fail fast
Optional<String> bad = Optional.of(null); // NullPointerException
```

Use `of()` when you are certain the value is not null. It fails fast if you are wrong.

### `Optional.ofNullable()` -- value might be null

```java
String input = getUserInput(); // might return null

Optional<String> name = Optional.ofNullable(input);
// Optional[Ada] if input is "Ada"
// Optional.empty if input is null
```

Use `ofNullable()` when the value comes from code you do not control (database lookups, map gets, method calls that
might return null).

### `Optional.empty()` -- no value

```java
Optional<String> empty = Optional.empty();
System.out.println(empty); // Optional.empty
```

## Unwrapping values

### `isPresent()` and `isEmpty()`

```java
Optional<String> name = Optional.of("Ada");

if (name.isPresent()) {
    System.out.println("Name: " + name.get());
}

Optional<String> empty = Optional.empty();
if (empty.isEmpty()) {
    System.out.println("No name provided");
}
```

### `get()` -- avoid this

`get()` throws `NoSuchElementException` if the Optional is empty. It defeats the purpose of Optional:

```java
Optional<String> empty = Optional.empty();
empty.get(); // NoSuchElementException -- just as bad as NullPointerException
```

**Never call `get()` without checking `isPresent()` first.** And if you are checking `isPresent()` before `get()`, there
is always a better alternative below.

### `orElse()` -- provide a default value

```java
String name = Optional.ofNullable(input).orElse("Anonymous");
```

If the Optional has a value, `orElse()` returns it. If empty, it returns the default.

### `orElseGet()` -- compute the default lazily

```java
String name = Optional.ofNullable(input)
    .orElseGet(() -> generateDefaultName());
```

The supplier is only called if the Optional is empty. Use this when computing the default is expensive.

**`orElse()` vs `orElseGet()`:**

```java
// orElse: default is always evaluated (even when not needed)
String name = optionalName.orElse(expensiveComputation()); // computed every time

// orElseGet: default is only evaluated when needed
String name = optionalName.orElseGet(() -> expensiveComputation()); // computed only if empty
```

### `orElseThrow()` -- throw if empty

```java
String name = Optional.ofNullable(input)
    .orElseThrow(() -> new IllegalArgumentException("Name is required"));
```

Use this when a missing value is a genuine error condition.

### `ifPresent()` -- do something with the value

```java
Optional.ofNullable(input).ifPresent(name -> {
    System.out.println("Hello, " + name);
});
```

### `ifPresentOrElse()` -- handle both cases

```java
Optional.ofNullable(input).ifPresentOrElse(
    name -> System.out.println("Hello, " + name),
    () -> System.out.println("Hello, stranger")
);
```

## Transforming Optionals

### `map()` -- transform the value if present

```java
Optional<String> name = Optional.of("  Ada Lovelace  ");

Optional<String> trimmed = name.map(String::trim);
// Optional[Ada Lovelace]

Optional<Integer> length = name.map(String::trim).map(String::length);
// Optional[13]

// If the Optional is empty, map returns empty
Optional<String> empty = Optional.<String>empty().map(String::trim);
// Optional.empty
```

`map()` is the most important Optional method. It lets you chain transformations without ever checking for null:

```java
// Without Optional -- null checks everywhere
String city = null;
if (user != null) {
    Address address = user.getAddress();
    if (address != null) {
        city = address.getCity();
    }
}

// With Optional -- clean pipeline
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("Unknown");
```

### `flatMap()` -- when the transformation itself returns Optional

```java
// getAddress() returns Optional<Address>
Optional<String> city = Optional.ofNullable(user)
    .flatMap(User::getAddress)   // returns Optional<Address>, not Optional<Optional<Address>>
    .map(Address::getCity)
    .orElse("Unknown");
```

Use `map()` when the function returns a plain value. Use `flatMap()` when the function returns an `Optional`.

### `filter()` -- keep the value only if it matches

```java
Optional<String> name = Optional.of("Ada");

Optional<String> longName = name.filter(n -> n.length() > 5);
// Optional.empty (Ada is only 3 characters)

Optional<String> shortName = name.filter(n -> n.length() <= 5);
// Optional[Ada]
```

### Chaining everything together

```java
String result = Optional.ofNullable(input)
    .map(String::trim)
    .filter(s -> !s.isEmpty())
    .map(String::toUpperCase)
    .orElse("N/A");
```

This reads like a sentence: "Take the input, trim it, keep it if non-empty, uppercase it, or default to N/A."

## Refactoring the Task Manager

In the CLI Task Manager from chapter 10, finding a task by ID returns null if not found. Let us refactor it to use
Optional:

### Before -- returning null

```java
public Task findById(int id) {
    for (Task task : tasks) {
        if (task.id() == id) return task;
    }
    return null; // Caller might forget to check
}

// Caller
Task task = manager.findById(42);
if (task != null) {
    System.out.println(task.description());
} else {
    System.out.println("Task not found");
}
```

### After -- returning Optional

```java
public Optional<Task> findById(int id) {
    return tasks.stream()
        .filter(t -> t.id() == id)
        .findFirst();
}

// Caller -- must handle the empty case
manager.findById(42).ifPresentOrElse(
    task -> System.out.println(task.description()),
    () -> System.out.println("Task not found")
);

// Or with orElseThrow for the REST API
Task task = manager.findById(id)
    .orElseThrow(() -> new IllegalArgumentException("Task " + id + " not found"));
```

The return type `Optional<Task>` makes it clear that the task might not exist. The compiler forces the caller to handle
it.

### Using Optional with streams

```java
// Find the first incomplete task's description
String nextTask = tasks.stream()
    .filter(t -> !t.done())
    .map(Task::description)
    .findFirst()
    .orElse("All tasks complete!");

// Find a task and transform it
String display = manager.findById(42)
    .map(t -> String.format("[%s] %s", t.done() ? "x" : " ", t.description()))
    .orElse("Task not found");
```

## `Optional` with collections

### `Map.get()` returns null

```java
Map<String, Integer> scores = Map.of("Ada", 95, "Grace", 88);

// Unsafe -- get() returns null for missing keys
Integer score = scores.get("Alan"); // null
score.intValue(); // NullPointerException

// Safe -- wrap in Optional
int safeScore = Optional.ofNullable(scores.get("Alan")).orElse(0);
// 0
```

### `stream()` on Optional (Java 9+)

Convert an Optional into a stream (0 or 1 elements):

```java
// Useful when flatMapping a list of Optionals
List<Optional<String>> optionals = List.of(
    Optional.of("Ada"),
    Optional.empty(),
    Optional.of("Grace")
);

List<String> names = optionals.stream()
    .flatMap(Optional::stream)
    .toList();
// [Ada, Grace]
```

## Anti-patterns

### Using `Optional.get()` without checking

```java
// Bad -- defeats the purpose of Optional
Optional<String> name = findName();
String value = name.get(); // Might throw NoSuchElementException

// Good
String value = findName().orElse("Unknown");
```

### Using Optional as a field type

```java
// Bad -- Optional is not meant for fields
class User {
    private Optional<String> nickname; // Don't do this
}

// Good -- use null for fields, Optional for return types
class User {
    private String nickname; // Can be null

    public Optional<String> getNickname() {
        return Optional.ofNullable(nickname);
    }
}
```

`Optional` is designed for **return types** -- it signals that a method might not return a value. Using it for fields,
parameters, or collections adds overhead and complexity.

### Using Optional as a method parameter

```java
// Bad -- forces callers to wrap their values
void greet(Optional<String> name) { ... }
greet(Optional.of("Ada")); // Awkward

// Good -- use overloading or a default parameter
void greet(String name) { ... }
void greet() { greet("World"); }
```

### Wrapping everything in Optional

```java
// Bad -- unnecessary wrapping
Optional<String> name = Optional.of("Ada");
if (name.isPresent()) {
    System.out.println(name.get());
}

// Good -- just use the value directly when you know it exists
String name = "Ada";
System.out.println(name);
```

Only use Optional when a value genuinely might be absent.

### `isPresent()` + `get()` instead of functional methods

```java
// Bad -- imperative style defeats the purpose
if (optional.isPresent()) {
    return optional.get().toUpperCase();
} else {
    return "N/A";
}

// Good -- functional style
return optional.map(String::toUpperCase).orElse("N/A");
```

## When to use what

| Situation                               | Use                                    |
|-----------------------------------------|----------------------------------------|
| Method might not return a value         | `Optional<T>` return type              |
| Providing a default for a missing value | `orElse()` or `orElseGet()`            |
| Missing value is an error               | `orElseThrow()`                        |
| Transforming a value that might be null | `Optional.ofNullable(x).map(...)`      |
| Field that can be null                  | Plain `null` (Optional for the getter) |
| Collection that can be empty            | Return empty collection, not Optional  |
| Method parameter                        | Plain type with `@Nullable` annotation |

## Summary

- **`NullPointerException`** is Java's most common error -- `Optional` helps prevent it.
- **`Optional.of()`** for non-null values, **`Optional.ofNullable()`** for possibly-null values, **`Optional.empty()`**
  for no value.
- **`orElse()`** and **`orElseGet()`** provide defaults; **`orElseThrow()`** fails with a clear error.
- **`map()`** transforms the value; **`flatMap()`** unwraps nested Optionals; **`filter()`** conditionally keeps the
  value.
- **Chain operations** to build readable pipelines: `optional.map(...).filter(...).orElse(...)`.
- Use Optional for **return types**, not for fields, parameters, or collections.
- **Never call `get()`** without knowing the Optional is non-empty -- use `orElse` or `orElseThrow` instead.

For advanced patterns including Optional with CompletableFuture and custom utility methods, see
the [Optionals reference](/java/optionals).

Next up: [Testing](./17-testing.md) -- writing tests for the Task Manager with JUnit 5.
