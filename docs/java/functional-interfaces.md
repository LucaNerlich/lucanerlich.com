---
title: "Functional Interfaces and Lambdas"
sidebar_label: "Functional Interfaces"
sidebar_position: 5
description: "Java functional interfaces guide: Function, Predicate, Consumer, Supplier, method references, composition, and writing custom functional interfaces."
tags: [java, functional, lambdas]
---

# Functional Interfaces and Lambdas

A **functional interface** is an interface with exactly one abstract method. Lambdas and
method references are shorthand for implementing these interfaces. Together, they are the
foundation of Java's functional programming style -- streams, Optional, and
CompletableFuture all depend on them.

## Quick start

```java
// Lambda implementing Predicate<String>
Predicate<String> isLong = s -> s.length() > 5;

// Method reference implementing Function<String, Integer>
Function<String, Integer> toLength = String::length;

// Using them
List<String> names = List.of("Alice", "Bob", "Charlie", "Diana");

List<Integer> longNameLengths = names.stream()
    .filter(isLong)
    .map(toLength)
    .toList();
// [7, 5]... wait -- "Charlie" (7) and "Diana" (5)? No, Diana is 5 which is not > 5.
// Result: [7] (only "Charlie")
```

---

## Built-in functional interfaces

Java provides a rich set in `java.util.function`:

### Core four

| Interface        | Signature           | Purpose               | Example                   |
|------------------|---------------------|-----------------------|---------------------------|
| `Function<T, R>` | `R apply(T t)`      | Transform T to R      | `String::length`          |
| `Predicate<T>`   | `boolean test(T t)` | Test a condition      | `s -> s.isEmpty()`        |
| `Consumer<T>`    | `void accept(T t)`  | Perform a side effect | `System.out::println`     |
| `Supplier<T>`    | `T get()`           | Produce a value       | `() -> new ArrayList<>()` |

### Two-argument variants

| Interface             | Signature                | Example                        |
|-----------------------|--------------------------|--------------------------------|
| `BiFunction<T, U, R>` | `R apply(T t, U u)`      | `(a, b) -> a + b`              |
| `BiPredicate<T, U>`   | `boolean test(T t, U u)` | `(s, len) -> s.length() > len` |
| `BiConsumer<T, U>`    | `void accept(T t, U u)`  | `map::put`                     |

### Specialised variants

| Interface           | Signature                 | Avoids                |
|---------------------|---------------------------|-----------------------|
| `UnaryOperator<T>`  | `T apply(T t)`            | `Function<T, T>`      |
| `BinaryOperator<T>` | `T apply(T t1, T t2)`     | `BiFunction<T, T, T>` |
| `IntFunction<R>`    | `R apply(int value)`      | Boxing                |
| `ToIntFunction<T>`  | `int applyAsInt(T value)` | Boxing                |
| `IntPredicate`      | `boolean test(int value)` | Boxing                |
| `IntConsumer`       | `void accept(int value)`  | Boxing                |
| `IntSupplier`       | `int getAsInt()`          | Boxing                |

---

## Lambda syntax

```java
// Full form
(String s) -> { return s.length(); }

// Inferred parameter type
(s) -> { return s.length(); }

// Single parameter -- parentheses optional
s -> { return s.length(); }

// Single expression -- braces and return optional
s -> s.length()

// No parameters
() -> System.out.println("hello")

// Multiple parameters
(a, b) -> a + b

// Multiple statements (need braces and return)
(a, b) -> {
    int sum = a + b;
    System.out.println("Sum: " + sum);
    return sum;
}
```

---

## Method references

Method references are a shorthand for lambdas that just call an existing method:

| Type                           | Syntax                | Equivalent lambda            |
|--------------------------------|-----------------------|------------------------------|
| Static method                  | `Integer::parseInt`   | `s -> Integer.parseInt(s)`   |
| Instance method (on parameter) | `String::toUpperCase` | `s -> s.toUpperCase()`       |
| Instance method (on object)    | `System.out::println` | `s -> System.out.println(s)` |
| Constructor                    | `ArrayList::new`      | `() -> new ArrayList<>()`    |

```java
List<String> words = List.of("hello", "world");

// Static method reference
List<Integer> parsed = List.of("1", "2", "3").stream()
    .map(Integer::parseInt)
    .toList();

// Instance method reference (on each element)
List<String> upper = words.stream()
    .map(String::toUpperCase)
    .toList();

// Bound instance method reference (on a specific object)
words.stream().forEach(System.out::println);

// Constructor reference
List<List<String>> lists = words.stream()
    .map(w -> List.of(w.split("")))
    .toList();
```

---

## Composing functions

Functional interfaces provide default methods for composition:

### Function composition

```java
Function<String, String> trim = String::strip;
Function<String, String> lower = String::toLowerCase;
Function<String, Integer> length = String::length;

// andThen: apply trim, then lower, then length
Function<String, Integer> pipeline = trim.andThen(lower).andThen(length);
pipeline.apply("  Hello World  "); // 11

// compose: apply lower first, then trim (reverse order)
Function<String, String> composed = trim.compose(lower);
composed.apply("  HELLO  "); // "hello"
```

### Predicate composition

```java
Predicate<String> isNotEmpty = s -> !s.isEmpty();
Predicate<String> isShort = s -> s.length() < 5;
Predicate<String> startsWithA = s -> s.startsWith("A");

// Combine with and, or, negate
Predicate<String> shortNonEmptyStartingWithA =
    isNotEmpty.and(isShort).and(startsWithA);

Predicate<String> longOrStartsWithA =
    isShort.negate().or(startsWithA);

List<String> names = List.of("Alice", "Bob", "Al", "", "Charlie", "Amy");

List<String> result = names.stream()
    .filter(shortNonEmptyStartingWithA)
    .toList();
// [Al, Amy]
```

### Consumer chaining

```java
Consumer<String> log = s -> System.out.println("LOG: " + s);
Consumer<String> save = s -> database.save(s);

// andThen: log first, then save
Consumer<String> logAndSave = log.andThen(save);
logAndSave.accept("event happened");
```

---

## Writing custom functional interfaces

Use `@FunctionalInterface` to enforce exactly one abstract method:

```java
@FunctionalInterface
interface Validator<T> {
    boolean isValid(T value);

    // Default methods are allowed
    default Validator<T> and(Validator<T> other) {
        return value -> this.isValid(value) && other.isValid(value);
    }

    default Validator<T> or(Validator<T> other) {
        return value -> this.isValid(value) || other.isValid(value);
    }

    default Validator<T> negate() {
        return value -> !this.isValid(value);
    }
}

// Usage
Validator<String> notBlank = s -> s != null && !s.isBlank();
Validator<String> maxLength = s -> s.length() <= 100;
Validator<String> noHtml = s -> !s.contains("<");

Validator<String> safeInput = notBlank.and(maxLength).and(noHtml);

safeInput.isValid("Hello");          // true
safeInput.isValid("");               // false
safeInput.isValid("<script>alert"); // false
```

### Functional interface with generics

```java
@FunctionalInterface
interface Transformer<T, R> {
    R transform(T input);

    default <V> Transformer<T, V> andThen(Transformer<R, V> after) {
        return input -> after.transform(this.transform(input));
    }
}

Transformer<String, Integer> toLength = String::length;
Transformer<Integer, Boolean> isEven = n -> n % 2 == 0;

Transformer<String, Boolean> hasEvenLength = toLength.andThen(isEven);
hasEvenLength.transform("hello"); // false (5 is odd)
hasEvenLength.transform("Java");  // true (4 is even)
```

---

## Practical examples

### Configurable retry logic

```java
public static <T> T retry(Supplier<T> action, int maxAttempts, Predicate<Exception> retryable) {
    for (int attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return action.get();
        } catch (Exception e) {
            if (attempt == maxAttempts || !retryable.test(e)) {
                throw e;
            }
        }
    }
    throw new IllegalStateException("unreachable");
}

// Usage
String result = retry(
    () -> httpClient.send(request),      // Supplier<String>
    3,                                   // max attempts
    e -> e instanceof IOException        // Predicate<Exception>
);
```

### Strategy pattern with lambdas

```java
record Order(double total) {}

// Instead of a Strategy interface with implementations:
Function<Order, Double> flatDiscount = order -> order.total() - 10;
Function<Order, Double> percentDiscount = order -> order.total() * 0.9;
Function<Order, Double> noDiscount = Order::total;

// Select strategy at runtime
Function<Order, Double> strategy = isPremium ? percentDiscount : flatDiscount;
double finalPrice = strategy.apply(new Order(100.0));
```

---

## Common pitfalls

| Pitfall                        | Problem                                                                 | Fix                                                                                      |
|--------------------------------|-------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| Checked exceptions in lambdas  | `Function<T,R>` does not allow checked exceptions                       | Wrap in try/catch inside the lambda, or create a custom functional interface that throws |
| Capturing mutable variables    | `for (int i...)` -- lambda captures effectively final variables only    | Use a final copy or IntStream                                                            |
| `this` in lambdas              | `this` refers to the enclosing class, not the lambda                    | Expected behavior, but can be surprising                                                 |
| Overusing lambdas              | Complex multi-line lambdas are hard to read                             | Extract to a named method and use a method reference                                     |
| Missing `@FunctionalInterface` | Non-annotated interfaces can accidentally gain a second abstract method | Always annotate custom functional interfaces                                             |

---

## See also

- [Streams and Collectors](./java-streams.md) -- streams consume functional interfaces
- [Optionals](./optionals.md) -- Optional uses Function, Predicate, Supplier
- [Generics and Type Erasure](./generics.md) -- generic functional interfaces
- [Modern Java Features](./modern-java-features.md) -- lambdas + records + sealed types
