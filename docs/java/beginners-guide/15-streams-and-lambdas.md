---
title: "Streams & Lambdas"
sidebar_label: "Streams & Lambdas"
description: Functional Java -- lambda expressions, method references, the Stream API, and practical data processing pipelines.
slug: /java/beginners-guide/streams-and-lambdas
tags: [java, beginners, streams, lambdas, functional]
keywords:
  - java streams
  - java lambdas
  - functional interfaces
  - stream api
  - method references
sidebar_position: 15
---

# Streams & Lambdas

Java 8 introduced **lambdas** and the **Stream API**, bringing functional programming to Java. Instead of writing loops
that describe *how* to process data step by step, you build pipelines that describe *what* you want -- filter this,
transform that, collect the result.

## Lambda expressions

A **lambda** is an anonymous function -- a function without a name that you can pass around like a value:

```java
// Before lambdas: anonymous class
Comparator<String> byLength = new Comparator<String>() {
    @Override
    public int compare(String a, String b) {
        return Integer.compare(a.length(), b.length());
    }
};

// With a lambda: same behavior, much less code
Comparator<String> byLength = (a, b) -> Integer.compare(a.length(), b.length());
```

### Lambda syntax

```java
// Full syntax
(String a, String b) -> { return Integer.compare(a.length(), b.length()); }

// Type inference -- compiler knows the types
(a, b) -> { return Integer.compare(a.length(), b.length()); }

// Single expression -- no braces, no return keyword
(a, b) -> Integer.compare(a.length(), b.length())

// Single parameter -- no parentheses needed
name -> name.toUpperCase()

// No parameters
() -> System.out.println("Hello")
```

**Rules:**

- If the body is a single expression, omit `{}` and `return`.
- If there is exactly one parameter, omit the parentheses.
- If there are zero or two+ parameters, parentheses are required.

## Functional interfaces

A lambda can only be used where a **functional interface** is expected -- an interface with exactly one abstract method.
Java provides many built-in ones:

| Interface             | Method                  | Use case                         |
|-----------------------|-------------------------|----------------------------------|
| `Predicate<T>`        | `boolean test(T t)`     | Filtering -- is this item valid? |
| `Function<T, R>`      | `R apply(T t)`          | Transforming -- convert T to R   |
| `Consumer<T>`         | `void accept(T t)`      | Side effects -- print, log, save |
| `Supplier<T>`         | `T get()`               | Producing -- create a value      |
| `Comparator<T>`       | `int compare(T a, T b)` | Ordering -- sort items           |
| `UnaryOperator<T>`    | `T apply(T t)`          | Transform T to T (same type)     |
| `BiFunction<T, U, R>` | `R apply(T t, U u)`     | Two inputs, one output           |

```java
import java.util.function.*;

Predicate<String> isLong = s -> s.length() > 5;
Function<String, Integer> toLength = s -> s.length();
Consumer<String> print = s -> System.out.println(s);
Supplier<String> greeting = () -> "Hello!";

System.out.println(isLong.test("Hello"));     // false
System.out.println(isLong.test("Hello!"));    // true
System.out.println(toLength.apply("Java"));   // 4
print.accept("Lambda!");                       // Lambda!
System.out.println(greeting.get());            // Hello!
```

### Composing functions

Functional interfaces can be chained:

```java
Predicate<String> isLong = s -> s.length() > 5;
Predicate<String> startsWithJ = s -> s.startsWith("J");

// AND
Predicate<String> longAndJ = isLong.and(startsWithJ);
System.out.println(longAndJ.test("JavaScript")); // true
System.out.println(longAndJ.test("Java"));        // false

// OR
Predicate<String> longOrJ = isLong.or(startsWithJ);
System.out.println(longOrJ.test("Java")); // true

// NEGATE
Predicate<String> isShort = isLong.negate();
System.out.println(isShort.test("Hi")); // true

// Function chaining
Function<String, String> trim = String::trim;
Function<String, String> upper = String::toUpperCase;
Function<String, String> trimThenUpper = trim.andThen(upper);

System.out.println(trimThenUpper.apply("  hello  ")); // "HELLO"
```

## Method references

A **method reference** is shorthand for a lambda that just calls an existing method:

| Type                         | Lambda                      | Method reference      |
|------------------------------|-----------------------------|-----------------------|
| Static method                | `s -> Integer.parseInt(s)`  | `Integer::parseInt`   |
| Instance method on parameter | `s -> s.toUpperCase()`      | `String::toUpperCase` |
| Instance method on object    | `s -> printer.print(s)`     | `printer::print`      |
| Constructor                  | `s -> new StringBuilder(s)` | `StringBuilder::new`  |

```java
List<String> names = List.of("grace", "ada", "alan");

// Lambda
names.stream().map(s -> s.toUpperCase()).toList();

// Method reference -- shorter, same result
names.stream().map(String::toUpperCase).toList();
// ["GRACE", "ADA", "ALAN"]
```

Use method references when the lambda simply delegates to a single method call. Use lambdas when you need additional
logic.

## The Stream API

A **stream** is a sequence of elements that you process through a pipeline:

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Diana", "Eve");

List<String> result = names.stream()       // 1. Create a stream
    .filter(n -> n.length() > 3)           // 2. Intermediate: keep names longer than 3
    .map(String::toUpperCase)              // 3. Intermediate: convert to uppercase
    .sorted()                              // 4. Intermediate: sort alphabetically
    .toList();                             // 5. Terminal: collect into a List

System.out.println(result); // [ALICE, CHARLIE, DIANA]
```

Every pipeline has three parts:

1. **Source** -- where the data comes from (`list.stream()`, `Stream.of(...)`, `Arrays.stream(...)`)
2. **Intermediate operations** -- transform the stream (lazy -- nothing happens until a terminal operation)
3. **Terminal operation** -- triggers processing and produces a result

### Streams are lazy

Intermediate operations are not executed until a terminal operation is called. This means:

- No unnecessary work is done
- Operations are fused -- the stream processes each element through the entire pipeline before moving to the next

### Streams are single-use

```java
Stream<String> stream = names.stream();
stream.forEach(System.out::println); // Works
stream.forEach(System.out::println); // IllegalStateException -- stream already consumed
```

## Intermediate operations

### `filter()` -- keep matching elements

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

List<Integer> evens = numbers.stream()
    .filter(n -> n % 2 == 0)
    .toList();
// [2, 4, 6, 8, 10]
```

### `map()` -- transform each element

```java
List<String> names = List.of("alice", "bob", "charlie");

List<Integer> lengths = names.stream()
    .map(String::length)
    .toList();
// [5, 3, 7]
```

### `flatMap()` -- flatten nested collections

```java
List<List<String>> nested = List.of(
    List.of("a", "b"),
    List.of("c", "d"),
    List.of("e")
);

List<String> flat = nested.stream()
    .flatMap(List::stream)
    .toList();
// [a, b, c, d, e]
```

### `sorted()` -- sort elements

```java
List<String> names = List.of("Charlie", "Alice", "Bob");

// Natural order
names.stream().sorted().toList();
// [Alice, Bob, Charlie]

// Custom comparator
names.stream().sorted(Comparator.comparingInt(String::length)).toList();
// [Bob, Alice, Charlie]

// Reversed
names.stream().sorted(Comparator.reverseOrder()).toList();
// [Charlie, Bob, Alice]
```

### `distinct()` -- remove duplicates

```java
List<Integer> numbers = List.of(1, 2, 2, 3, 3, 3);

numbers.stream().distinct().toList();
// [1, 2, 3]
```

### `peek()` -- debug without changing the stream

```java
List<String> result = names.stream()
    .filter(n -> n.length() > 3)
    .peek(n -> System.out.println("After filter: " + n))
    .map(String::toUpperCase)
    .peek(n -> System.out.println("After map: " + n))
    .toList();
```

`peek()` is useful for debugging but should not be used for side effects in production code.

### `limit()` and `skip()`

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);

numbers.stream().limit(3).toList();  // [1, 2, 3]
numbers.stream().skip(7).toList();   // [8, 9, 10]
numbers.stream().skip(2).limit(3).toList(); // [3, 4, 5]
```

## Terminal operations

### `toList()` -- collect into a list

```java
List<String> result = names.stream()
    .filter(n -> n.length() > 3)
    .toList(); // Immutable list (Java 16+)
```

### `forEach()` -- perform an action on each element

```java
names.stream().forEach(System.out::println);
```

### `count()`

```java
long count = names.stream()
    .filter(n -> n.length() > 3)
    .count();
```

### `reduce()` -- combine all elements into one

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

// Sum
int sum = numbers.stream().reduce(0, Integer::sum);
// 15

// Concatenate strings
String joined = List.of("a", "b", "c").stream()
    .reduce("", (a, b) -> a + b);
// "abc"

// Find the longest name
Optional<String> longest = names.stream()
    .reduce((a, b) -> a.length() >= b.length() ? a : b);
```

### `findFirst()` and `findAny()`

```java
Optional<String> first = names.stream()
    .filter(n -> n.startsWith("A"))
    .findFirst();
// Optional[Alice]
```

### `anyMatch()`, `allMatch()`, `noneMatch()`

```java
List<Integer> numbers = List.of(1, 2, 3, 4, 5);

numbers.stream().anyMatch(n -> n > 4);  // true
numbers.stream().allMatch(n -> n > 0);  // true
numbers.stream().noneMatch(n -> n < 0); // true
```

### `min()` and `max()`

```java
Optional<Integer> max = numbers.stream().max(Integer::compareTo);
// Optional[5]

Optional<String> shortest = names.stream()
    .min(Comparator.comparingInt(String::length));
```

## Collectors

The `Collectors` utility class provides powerful terminal operations:

```java
import java.util.stream.Collectors;
```

### `toSet()`

```java
Set<String> uniqueNames = names.stream()
    .map(String::toUpperCase)
    .collect(Collectors.toSet());
```

### `toMap()`

```java
Map<String, Integer> nameLengths = names.stream()
    .collect(Collectors.toMap(
        name -> name,         // key
        String::length        // value
    ));
// {Alice=5, Bob=3, Charlie=7}
```

### `joining()`

```java
String csv = names.stream()
    .collect(Collectors.joining(", "));
// "Alice, Bob, Charlie"

String withBrackets = names.stream()
    .collect(Collectors.joining(", ", "[", "]"));
// "[Alice, Bob, Charlie]"
```

### `groupingBy()`

```java
Map<Integer, List<String>> byLength = names.stream()
    .collect(Collectors.groupingBy(String::length));
// {3=[Bob, Eve], 5=[Alice, Diana], 7=[Charlie]}
```

### `partitioningBy()`

```java
Map<Boolean, List<String>> partitioned = names.stream()
    .collect(Collectors.partitioningBy(n -> n.length() > 4));
// {false=[Bob, Eve], true=[Alice, Charlie, Diana]}
```

### `counting()` and `summarizingInt()`

```java
Map<Integer, Long> countByLength = names.stream()
    .collect(Collectors.groupingBy(String::length, Collectors.counting()));
// {3=2, 5=2, 7=1}

IntSummaryStatistics stats = names.stream()
    .collect(Collectors.summarizingInt(String::length));
System.out.println(stats.getAverage()); // 4.6
System.out.println(stats.getMax());     // 7
System.out.println(stats.getCount());   // 5
```

## Using streams with the Task Manager

Let us apply streams to the Task Manager from chapter 10. Assume we have a list of tasks:

```java
record Task(int id, String description, boolean done) {}

List<Task> tasks = List.of(
    new Task(1, "Write introduction", true),
    new Task(2, "Add error handling", false),
    new Task(3, "Write tests", false),
    new Task(4, "Deploy to server", false),
    new Task(5, "Update documentation", true)
);
```

### Filter and display

```java
// Incomplete tasks
List<Task> pending = tasks.stream()
    .filter(t -> !t.done())
    .toList();
// [Task[id=2, ...], Task[id=3, ...], Task[id=4, ...]]

// Completed task descriptions
List<String> completedDescriptions = tasks.stream()
    .filter(Task::done)
    .map(Task::description)
    .toList();
// ["Write introduction", "Update documentation"]
```

### Statistics

```java
long pendingCount = tasks.stream().filter(t -> !t.done()).count();
// 3

boolean allDone = tasks.stream().allMatch(Task::done);
// false

Optional<Task> firstPending = tasks.stream()
    .filter(t -> !t.done())
    .findFirst();
// Optional[Task[id=2, ...]]
```

### Grouping

```java
Map<Boolean, List<Task>> byStatus = tasks.stream()
    .collect(Collectors.partitioningBy(Task::done));
// {true=[Task 1, Task 5], false=[Task 2, Task 3, Task 4]}
```

### Building a summary string

```java
String summary = tasks.stream()
    .map(t -> String.format("[%s] %s", t.done() ? "x" : " ", t.description()))
    .collect(Collectors.joining("\n"));

System.out.println(summary);
```

Result:

```text
[x] Write introduction
[ ] Add error handling
[ ] Write tests
[ ] Deploy to server
[x] Update documentation
```

## Creating streams

Beyond `list.stream()`, there are several ways to create streams:

```java
// From values
Stream<String> stream = Stream.of("a", "b", "c");

// From an array
int[] numbers = {1, 2, 3};
IntStream intStream = Arrays.stream(numbers);

// Infinite stream (use with limit)
Stream<Integer> counting = Stream.iterate(0, n -> n + 1).limit(10);
// 0, 1, 2, 3, 4, 5, 6, 7, 8, 9

// Generate (infinite, use with limit)
Stream<Double> randoms = Stream.generate(Math::random).limit(5);

// Range
IntStream range = IntStream.range(1, 6);     // 1, 2, 3, 4, 5
IntStream closed = IntStream.rangeClosed(1, 5); // 1, 2, 3, 4, 5

// From a string's characters
IntStream chars = "hello".chars();

// From lines of a file
Stream<String> lines = Files.lines(Path.of("data.txt"));
```

## Primitive streams

Java provides specialized streams for primitives to avoid boxing overhead:

| Stream         | For type | Key extra methods               |
|----------------|----------|---------------------------------|
| `IntStream`    | `int`    | `sum()`, `average()`, `range()` |
| `LongStream`   | `long`   | `sum()`, `average()`, `range()` |
| `DoubleStream` | `double` | `sum()`, `average()`            |

```java
int sum = IntStream.rangeClosed(1, 100).sum();
// 5050

OptionalDouble avg = IntStream.of(1, 2, 3, 4, 5).average();
// OptionalDouble[3.0]
```

Convert between object and primitive streams:

```java
// Object stream -> IntStream
IntStream lengths = names.stream().mapToInt(String::length);

// IntStream -> Stream<Integer>
Stream<Integer> boxed = IntStream.range(1, 5).boxed();
```

## When NOT to use streams

Streams are not always the best choice:

### Simple loops are clearer

```java
// Stream -- overkill for a simple operation
names.stream().forEach(System.out::println);

// Simple loop -- clearer intent
for (String name : names) {
    System.out.println(name);
}
```

### Side effects do not belong in streams

```java
// Bad -- modifying external state inside a stream
List<String> results = new ArrayList<>();
names.stream()
    .filter(n -> n.length() > 3)
    .forEach(results::add); // Side effect!

// Good -- collect the result
List<String> results = names.stream()
    .filter(n -> n.length() > 3)
    .toList();
```

### Performance-critical code

Streams have overhead from creating objects and method calls. For tight inner loops processing millions of elements
where every nanosecond counts, a plain `for` loop may be faster. Profile before optimizing.

### Checked exceptions

Lambdas do not play well with checked exceptions:

```java
// Does not compile -- lambda cannot throw checked exception
files.stream().map(Files::readString).toList();

// Workaround: wrap in a try/catch
files.stream()
    .map(path -> {
        try {
            return Files.readString(path);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    })
    .toList();
```

If every lambda needs a try/catch, a loop is usually cleaner.

## Summary

- **Lambdas** are anonymous functions: `(params) -> expression`.
- **Functional interfaces** (`Predicate`, `Function`, `Consumer`, `Supplier`) define the shape of a lambda.
- **Method references** (`String::toUpperCase`) are shorthand for simple lambdas.
- **Streams** process collections declaratively through pipelines of filter/map/collect.
- **Intermediate operations** (`filter`, `map`, `sorted`, `distinct`) are lazy -- they do not run until a terminal
  operation.
- **Terminal operations** (`toList`, `forEach`, `reduce`, `count`) trigger the pipeline and produce a result.
- **Collectors** (`groupingBy`, `joining`, `toMap`) provide powerful aggregation.
- Use streams for data processing pipelines; use loops for simple iterations and side effects.

For advanced patterns including custom collectors, parallel streams, and function composition, see
the [Streams and Collectors reference](/java/java-streams)
and [Functional Interfaces reference](/java/functional-interfaces).

Next up: [Optionals](./16-optionals.md) -- eliminating `NullPointerException` with Java's `Optional<T>`.
