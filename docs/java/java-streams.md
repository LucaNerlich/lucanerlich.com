---
title: "Streams and Collectors"
sidebar_label: "Streams and Collectors"
sidebar_position: 1
description: "Java Streams API guide: filter, map, flatMap, reduce, collect, groupingBy, parallel streams, and common pitfalls with practical examples."
tags: [java, streams, functional, collections]
---

# Streams and Collectors

The **Streams API** (since Java 8) provides a functional, declarative way to process
collections. Instead of writing imperative loops, you build pipelines of operations
that filter, transform, and aggregate data.

## Quick start

```java
List<String> names = List.of("Alice", "Bob", "Charlie", "Diana", "Eve");

List<String> result = names.stream()
    .filter(name -> name.length() > 3)
    .map(String::toUpperCase)
    .sorted()
    .toList();

// result: [ALICE, CHARLIE, DIANA]
```

Every stream pipeline has three parts:

1. **Source** -- a collection, array, generator, or I/O channel
2. **Intermediate operations** -- lazy transformations (filter, map, sorted, distinct, ...)
3. **Terminal operation** -- triggers execution and produces a result (collect, forEach, reduce, count, ...)

---

## Creating streams

```java
// From a collection
List<String> list = List.of("a", "b", "c");
Stream<String> s1 = list.stream();

// From an array
String[] array = {"a", "b", "c"};
Stream<String> s2 = Arrays.stream(array);

// From static values
Stream<String> s3 = Stream.of("a", "b", "c");

// Empty stream
Stream<String> s4 = Stream.empty();

// Infinite stream (use with limit!)
Stream<Double> randoms = Stream.generate(Math::random).limit(5);

// Iterate (seed + unary operator)
Stream<Integer> counting = Stream.iterate(0, n -> n + 2).limit(10);
// 0, 2, 4, 6, 8, 10, 12, 14, 16, 18

// Primitive streams (avoid boxing)
IntStream ints = IntStream.range(1, 100);      // 1..99
LongStream longs = LongStream.rangeClosed(1, 100); // 1..100
DoubleStream doubles = DoubleStream.of(1.0, 2.5, 3.7);
```

---

## Intermediate operations

All intermediate operations are **lazy** -- they do not execute until a terminal
operation is called.

### filter

Keep elements matching a predicate:

```java
List<Integer> evens = IntStream.rangeClosed(1, 20)
    .filter(n -> n % 2 == 0)
    .boxed()
    .toList();
// [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

### map

Transform each element:

```java
List<Integer> lengths = List.of("hello", "world", "!")
    .stream()
    .map(String::length)
    .toList();
// [5, 5, 1]
```

### flatMap

Flatten nested structures (one-to-many transformation):

```java
List<List<String>> nested = List.of(
    List.of("a", "b"),
    List.of("c", "d"),
    List.of("e")
);

List<String> flat = nested.stream()
    .flatMap(Collection::stream)
    .toList();
// [a, b, c, d, e]
```

Practical example -- splitting sentences into words:

```java
List<String> sentences = List.of("Hello world", "Java streams are powerful");

List<String> words = sentences.stream()
    .flatMap(s -> Arrays.stream(s.split("\\s+")))
    .toList();
// [Hello, world, Java, streams, are, powerful]
```

### distinct, sorted, peek

```java
List<Integer> numbers = List.of(3, 1, 4, 1, 5, 9, 2, 6, 5);

List<Integer> result = numbers.stream()
    .distinct()                          // remove duplicates
    .sorted()                            // natural order
    .peek(n -> System.out.print(n + " ")) // debug: 1 2 3 4 5 6 9
    .toList();
// [1, 2, 3, 4, 5, 6, 9]
```

### limit and skip

```java
List<Integer> page = IntStream.rangeClosed(1, 100)
    .boxed()
    .skip(20)     // skip first 20
    .limit(10)    // take next 10
    .toList();
// [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
```

### mapToInt, mapToLong, mapToDouble

Avoid boxing overhead by switching to primitive streams:

```java
double average = List.of("hello", "world", "hi")
    .stream()
    .mapToInt(String::length)
    .average()
    .orElse(0.0);
// 3.666...
```

---

## Terminal operations

### collect

The most versatile terminal operation. Used with `Collectors` to produce lists, maps,
strings, and custom aggregations.

```java
// To list (Java 16+ shorthand)
List<String> list = stream.toList();

// To list (mutable, pre-Java 16)
List<String> mutableList = stream.collect(Collectors.toList());

// To set
Set<String> set = stream.collect(Collectors.toSet());

// To specific collection
TreeSet<String> treeSet = stream.collect(Collectors.toCollection(TreeSet::new));
```

### reduce

Combine all elements into a single value:

```java
// Sum
int sum = IntStream.rangeClosed(1, 10).reduce(0, Integer::sum);
// 55

// Product
int product = IntStream.rangeClosed(1, 5).reduce(1, (a, b) -> a * b);
// 120

// Longest string
Optional<String> longest = List.of("short", "medium-ish", "a")
    .stream()
    .reduce((a, b) -> a.length() >= b.length() ? a : b);
// Optional[medium-ish]
```

### forEach

Side effects (printing, logging, sending):

```java
names.stream()
    .filter(n -> n.startsWith("A"))
    .forEach(System.out::println);
```

> Avoid `forEach` for anything other than side effects. If you are building a
> collection, use `collect` or `toList()`.

### count, min, max, findFirst, findAny, anyMatch, allMatch, noneMatch

```java
List<Integer> nums = List.of(3, 7, 2, 9, 4);

long count = nums.stream().filter(n -> n > 5).count();       // 2
Optional<Integer> min = nums.stream().min(Integer::compareTo); // Optional[2]
Optional<Integer> max = nums.stream().max(Integer::compareTo); // Optional[9]
Optional<Integer> first = nums.stream().findFirst();           // Optional[3]

boolean anyBig = nums.stream().anyMatch(n -> n > 8);   // true
boolean allPositive = nums.stream().allMatch(n -> n > 0); // true
boolean noneNeg = nums.stream().noneMatch(n -> n < 0);  // true
```

---

## Collectors deep dive

### toMap

```java
record Person(String name, int age) {}

List<Person> people = List.of(
    new Person("Alice", 30),
    new Person("Bob", 25),
    new Person("Charlie", 35)
);

// Name -> Age map
Map<String, Integer> nameToAge = people.stream()
    .collect(Collectors.toMap(Person::name, Person::age));
// {Alice=30, Bob=25, Charlie=35}
```

**Handling duplicate keys:**

```java
// With merge function (keep the older person)
Map<String, Integer> map = people.stream()
    .collect(Collectors.toMap(
        Person::name,
        Person::age,
        (existing, replacement) -> existing  // merge function
    ));
```

### groupingBy

Group elements by a classifier:

```java
Map<Integer, List<Person>> byAge = people.stream()
    .collect(Collectors.groupingBy(Person::age));

// Group by age decade
Map<Integer, List<Person>> byDecade = people.stream()
    .collect(Collectors.groupingBy(p -> p.age() / 10 * 10));
// {30=[Alice, Charlie], 20=[Bob]}
```

**Downstream collectors:**

```java
// Count per group
Map<Integer, Long> countByDecade = people.stream()
    .collect(Collectors.groupingBy(
        p -> p.age() / 10 * 10,
        Collectors.counting()
    ));
// {30=2, 20=1}

// Names per group
Map<Integer, List<String>> namesByDecade = people.stream()
    .collect(Collectors.groupingBy(
        p -> p.age() / 10 * 10,
        Collectors.mapping(Person::name, Collectors.toList())
    ));
// {30=[Alice, Charlie], 20=[Bob]}

// Average age per group
Map<String, Double> avgAgeByFirstLetter = people.stream()
    .collect(Collectors.groupingBy(
        p -> p.name().substring(0, 1),
        Collectors.averagingInt(Person::age)
    ));
```

### partitioningBy

Split into two groups (true/false):

```java
Map<Boolean, List<Person>> partitioned = people.stream()
    .collect(Collectors.partitioningBy(p -> p.age() >= 30));
// {true=[Alice, Charlie], false=[Bob]}
```

### joining

Concatenate strings:

```java
String csv = people.stream()
    .map(Person::name)
    .collect(Collectors.joining(", "));
// "Alice, Bob, Charlie"

String withBrackets = people.stream()
    .map(Person::name)
    .collect(Collectors.joining(", ", "[", "]"));
// "[Alice, Bob, Charlie]"
```

### summarizingInt / summarizingDouble

Get all stats at once:

```java
IntSummaryStatistics stats = people.stream()
    .collect(Collectors.summarizingInt(Person::age));

stats.getCount();   // 3
stats.getSum();     // 90
stats.getMin();     // 25
stats.getMax();     // 35
stats.getAverage(); // 30.0
```

---

## Parallel streams

Parallel streams split the workload across multiple CPU cores using the common
ForkJoinPool:

```java
long count = IntStream.rangeClosed(1, 10_000_000)
    .parallel()
    .filter(n -> isPrime(n))
    .count();
```

### When parallel streams help

| Scenario | Parallel benefit |
|----------|-----------------|
| Large dataset (100k+ elements) | Likely beneficial |
| CPU-intensive computation per element | Beneficial |
| Simple operations (filter, map) on small lists | No benefit (overhead > gain) |
| I/O-bound operations | No benefit (use async instead) |
| Order-dependent operations | Harmful (forces sequential coordination) |

### When to avoid

```java
// BAD: mutating shared state in parallel
List<Integer> results = new ArrayList<>(); // NOT thread-safe!
numbers.parallelStream().forEach(results::add); // Race condition!

// GOOD: let the collector handle accumulation
List<Integer> results = numbers.parallelStream()
    .filter(n -> n > 0)
    .toList();
```

---

## Practical examples

### Word frequency counter

```java
String text = "the quick brown fox jumps over the lazy dog the fox";

Map<String, Long> wordFreq = Arrays.stream(text.split("\\s+"))
    .collect(Collectors.groupingBy(
        String::toLowerCase,
        Collectors.counting()
    ));
// {the=3, quick=1, brown=1, fox=2, jumps=1, over=1, lazy=1, dog=1}
```

### CSV line parsing

```java
record Product(String name, double price, String category) {}

List<Product> products = Files.lines(Path.of("products.csv"))
    .skip(1) // skip header
    .map(line -> line.split(","))
    .map(parts -> new Product(parts[0].trim(), Double.parseDouble(parts[1].trim()), parts[2].trim()))
    .toList();

// Most expensive per category
Map<String, Optional<Product>> mostExpensive = products.stream()
    .collect(Collectors.groupingBy(
        Product::category,
        Collectors.maxBy(Comparator.comparingDouble(Product::price))
    ));
```

### Flattening nested objects

```java
record Order(String customer, List<String> items) {}

List<Order> orders = List.of(
    new Order("Alice", List.of("Book", "Pen")),
    new Order("Bob", List.of("Laptop", "Mouse", "Keyboard")),
    new Order("Alice", List.of("Notebook"))
);

// All unique items across all orders
Set<String> allItems = orders.stream()
    .flatMap(order -> order.items().stream())
    .collect(Collectors.toSet());
// [Book, Pen, Laptop, Mouse, Keyboard, Notebook]

// Items per customer
Map<String, List<String>> itemsByCustomer = orders.stream()
    .collect(Collectors.groupingBy(
        Order::customer,
        Collectors.flatMapping(o -> o.items().stream(), Collectors.toList())
    ));
// {Alice=[Book, Pen, Notebook], Bob=[Laptop, Mouse, Keyboard]}
```

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Reusing a stream | Streams can only be consumed once; second terminal op throws `IllegalStateException` | Create a new stream from the source |
| Mutating state in `forEach` | Race conditions with parallel streams; violates functional contract | Use `collect` or `reduce` instead |
| `Stream.of(array)` with primitives | `Stream.of(new int[]{1,2,3})` creates `Stream<int[]>`, not `Stream<Integer>` | Use `Arrays.stream(array)` or `IntStream.of(1,2,3)` |
| Forgetting terminal operation | Intermediate ops are lazy; nothing happens without a terminal op | Always end with `collect`, `forEach`, `count`, etc. |
| Infinite streams without `limit` | `Stream.generate(...)` or `Stream.iterate(...)` runs forever | Always add `.limit(n)` |
| `peek` for business logic | `peek` is for debugging; it may not execute for short-circuiting ops | Use `map` + side effect, or process after collecting |
| `Optional.get()` without check | Throws `NoSuchElementException` if empty | Use `orElse`, `orElseThrow`, or `ifPresent` |
| Parallel stream on small data | Thread coordination overhead exceeds the computation benefit | Only use parallel for large datasets with CPU-bound work |

---

## See also

- [Functional Interfaces and Lambdas](./functional-interfaces.md) -- the building blocks streams use
- [Optionals](./optionals.md) -- handling empty results from stream operations
- [Collections](./collections.md) -- choosing the right source collection
- [Modern Java Features](./modern-java-features.md) -- records, pattern matching
