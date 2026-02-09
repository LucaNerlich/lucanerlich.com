---
title: "Generics and Type Erasure"
sidebar_label: "Generics"
sidebar_position: 4
description: "Java Generics guide: generic classes, methods, bounded types, wildcards, PECS principle, type erasure, and common patterns."
tags: [java, generics, type-system]
---

# Generics and Type Erasure

Generics let you write code that works with any type while catching type errors at
**compile time** instead of at runtime. They eliminate casts, prevent `ClassCastException`,
and make APIs self-documenting.

## Quick start

```java
// Without generics -- runtime ClassCastException risk
List rawList = new ArrayList();
rawList.add("hello");
Integer n = (Integer) rawList.get(0); // ClassCastException at runtime!

// With generics -- compile-time safety
List<String> typedList = new ArrayList<>();
typedList.add("hello");
// typedList.add(42);       // Compile error!
String s = typedList.get(0); // No cast needed
```

---

## Generic classes

```java
public class Pair<A, B> {
    private final A first;
    private final B second;

    public Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    public A first() { return first; }
    public B second() { return second; }

    @Override
    public String toString() {
        return "(" + first + ", " + second + ")";
    }
}

// Usage
Pair<String, Integer> nameAge = new Pair<>("Alice", 30);
String name = nameAge.first();   // no cast
Integer age = nameAge.second();  // no cast
```

With records (Java 16+), this becomes a one-liner:

```java
record Pair<A, B>(A first, B second) {}
```

---

## Generic methods

A method can introduce its own type parameters independently of the class:

```java
public class Utils {

    // <T> declares the type parameter before the return type
    public static <T> List<T> repeat(T item, int times) {
        List<T> result = new ArrayList<>();
        for (int i = 0; i < times; i++) {
            result.add(item);
        }
        return result;
    }

    // Multiple type parameters
    public static <K, V> Map<K, V> mapOf(K key, V value) {
        return Map.of(key, value);
    }
}

// The compiler infers T from the argument
List<String> hellos = Utils.repeat("hello", 3);
List<Integer> ones = Utils.repeat(1, 5);
```

---

## Bounded type parameters

### Upper bound (`extends`)

Restrict a type parameter to be a subtype of a specific class or interface:

```java
// T must be Comparable
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

max("apple", "banana"); // "banana"
max(3, 7);              // 7

// Multiple bounds (class first, then interfaces)
public static <T extends Number & Comparable<T>> T clamp(T value, T min, T max) {
    if (value.compareTo(min) < 0) return min;
    if (value.compareTo(max) > 0) return max;
    return value;
}
```

---

## Wildcards

Wildcards (`?`) represent an unknown type. They appear in **variable declarations**
and **method parameters**, not in class/method definitions.

### Unbounded wildcard (`?`)

```java
// Accepts a list of any type
void printAll(List<?> list) {
    for (Object item : list) {
        System.out.println(item);
    }
}

printAll(List.of("a", "b"));
printAll(List.of(1, 2, 3));
```

### Upper-bounded wildcard (`? extends T`)

"Anything that is T or a subtype of T" -- **read-only** (producer):

```java
// Can read Number from any List of Number subtypes
double sum(List<? extends Number> numbers) {
    double total = 0;
    for (Number n : numbers) {
        total += n.doubleValue();
    }
    return total;
}

sum(List.of(1, 2, 3));         // List<Integer> -- works
sum(List.of(1.5, 2.5));        // List<Double>  -- works
// numbers.add(42);             // Compile error! Can't add to ? extends
```

### Lower-bounded wildcard (`? super T`)

"Anything that is T or a supertype of T" -- **write-only** (consumer):

```java
// Can write Integer into any List that accepts Integer or its supertypes
void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
    list.add(3);
}

List<Number> numbers = new ArrayList<>();
addNumbers(numbers); // works

List<Object> objects = new ArrayList<>();
addNumbers(objects); // works

// Reading from ? super gives Object (not very useful)
```

---

## PECS: Producer Extends, Consumer Super

The **PECS** principle (coined by Joshua Bloch) determines which wildcard to use:

| Role | Wildcard | You can... | Example |
|------|----------|-----------|---------|
| **Producer** (you read from it) | `? extends T` | Read T values | `List<? extends Number>` -- read Number |
| **Consumer** (you write to it) | `? super T` | Write T values | `List<? super Integer>` -- add Integer |
| **Both** (read and write) | `T` (exact type) | Read and write | `List<Integer>` |

### Real-world example: `Collections.copy`

```java
// src is a producer (we read from it) → extends
// dest is a consumer (we write to it) → super
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (int i = 0; i < src.size(); i++) {
        dest.set(i, src.get(i));
    }
}
```

---

## Type erasure

Java generics are a **compile-time feature**. At runtime, all generic type information
is erased:

```java
// At compile time
List<String> strings = new ArrayList<>();
List<Integer> ints = new ArrayList<>();

// At runtime, both are just ArrayList
strings.getClass() == ints.getClass(); // true!
strings.getClass().getName();          // "java.util.ArrayList"
```

### Consequences of erasure

| What you cannot do | Why |
|-------------------|-----|
| `new T()` | The runtime does not know what T is |
| `new T[10]` | Cannot create generic arrays |
| `instanceof List<String>` | Type parameter is erased at runtime |
| `T.class` | Type parameter has no Class object |
| Overload on generic type (`foo(List<String>)` vs `foo(List<Integer>)`) | Same erasure: both become `foo(List)` |

### Workaround: type tokens

Pass the `Class<T>` explicitly when you need runtime type information:

```java
public <T> T deserialize(String json, Class<T> type) {
    // ObjectMapper can use the Class to know the target type
    return objectMapper.readValue(json, type);
}

User user = deserialize(json, User.class);
```

### Workaround: generic arrays

```java
// Cannot do: T[] array = new T[10];
// Workaround:
@SuppressWarnings("unchecked")
T[] array = (T[]) new Object[10];

// Or use a List<T> instead (preferred)
```

---

## Common patterns

### Generic factory

```java
interface Factory<T> {
    T create();
}

class StringFactory implements Factory<String> {
    @Override
    public String create() { return "hello"; }
}

// Usage with lambda
Factory<List<String>> listFactory = ArrayList::new;
List<String> list = listFactory.create();
```

### Self-referencing generics (Comparable pattern)

```java
// T extends Comparable<T> -- "T can compare with itself"
public class SortableList<T extends Comparable<T>> {
    private final List<T> items = new ArrayList<>();

    public void add(T item) { items.add(item); }

    public T min() {
        return items.stream().min(Comparable::compareTo).orElseThrow();
    }
}
```

### Generic builder (self-type)

```java
abstract class Builder<T, B extends Builder<T, B>> {
    protected String name;

    @SuppressWarnings("unchecked")
    public B name(String name) {
        this.name = name;
        return (B) this;
    }

    public abstract T build();
}

class UserBuilder extends Builder<User, UserBuilder> {
    private int age;

    public UserBuilder age(int age) {
        this.age = age;
        return this;
    }

    @Override
    public User build() {
        return new User(name, age);
    }
}

// Fluent API works without casts
User user = new UserBuilder().name("Alice").age(30).build();
```

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Raw types | `List list = new ArrayList()` loses type safety | Always specify the type: `List<String>` |
| `instanceof` with generics | `obj instanceof List<String>` does not compile (erasure) | Use `obj instanceof List<?>` and cast, or use type tokens |
| Generic array creation | `new T[10]` does not compile | Use `(T[]) new Object[10]` with `@SuppressWarnings`, or use `List<T>` |
| Heap pollution | Mixing raw types with generics causes runtime `ClassCastException` | Avoid raw types; heed compiler warnings |
| Overloading with same erasure | `void foo(List<String>)` and `void foo(List<Integer>)` clash | Rename one method, or use a single generic method |
| Recursive bounds confusion | `<T extends Comparable<T>>` looks circular but is valid | T must be a type that can compare with itself |

---

## See also

- [Collections](./collections.md) -- generic collections in practice
- [Streams and Collectors](./java-streams.md) -- generic stream operations
- [Functional Interfaces](./functional-interfaces.md) -- `Function<T,R>`, `Predicate<T>`
- [Modern Java Features](./modern-java-features.md) -- records, sealed types
