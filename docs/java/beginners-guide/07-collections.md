---
title: "Collections"
sidebar_label: "Collections"
description: Learn Java collections -- ArrayList, HashMap, HashSet, iterating, generics, immutable collections, and choosing the right collection.
slug: /java/beginners-guide/collections
tags: [java, beginners, collections, generics]
keywords:
  - java arraylist
  - java hashmap
  - java collections
  - java generics
  - immutable collections
sidebar_position: 7
---

# Collections

Arrays have a fixed size. Collections are dynamic data structures that grow and shrink as needed. The Java Collections
Framework provides `List`, `Set`, and `Map` -- the three data structures you will use in almost every program.

## Arrays -- a quick recap

Arrays are fixed-size, typed containers:

```java
int[] numbers = {10, 20, 30};
String[] names = new String[3];
names[0] = "Ada";
names[1] = "Bob";
names[2] = "Charlie";

System.out.println(numbers.length);
System.out.println(java.util.Arrays.toString(numbers));
System.out.println(java.util.Arrays.toString(names));
```

Result:

```text
3
[10, 20, 30]
[Ada, Bob, Charlie]
```

Arrays are fine for fixed-size data. When you need to add, remove, or search dynamically, use collections.

## Generics -- type parameters

Collections use **generics** to specify what type they hold:

```java
import java.util.ArrayList;
import java.util.List;

List<String> names = new ArrayList<>();  // only holds Strings
names.add("Ada");
names.add("Bob");
// names.add(42); // compile error -- wrong type

String first = names.get(0); // no cast needed
System.out.println(first);
```

Result:

```text
Ada
```

The `<String>` part is the **type parameter**. It tells the compiler what the list contains, catching errors at compile
time instead of runtime.

**Note:** generics work with objects only -- you cannot use primitives (`int`, `double`, etc.). Use wrapper classes (
`Integer`, `Double`) instead:

```java
List<Integer> numbers = new ArrayList<>();
numbers.add(42);     // autoboxing: int → Integer
int value = numbers.get(0); // unboxing: Integer → int
```

## `ArrayList` -- dynamic arrays

The most commonly used collection. An ordered, resizable list:

```java
import java.util.ArrayList;
import java.util.List;

List<String> fruits = new ArrayList<>();

// Adding
fruits.add("apple");
fruits.add("banana");
fruits.add("cherry");
System.out.println(fruits);

// Accessing by index
System.out.println(fruits.get(0));
System.out.println(fruits.get(2));

// Size
System.out.println("Size: " + fruits.size());

// Modifying
fruits.set(1, "blueberry");
System.out.println(fruits);

// Removing
fruits.remove("cherry");
System.out.println(fruits);

// Removing by index
fruits.remove(0);
System.out.println(fruits);
```

Result:

```text
[apple, banana, cherry]
apple
cherry
Size: 3
[apple, blueberry, cherry]
[apple, blueberry]
[blueberry]
```

### Checking contents

```java
List<String> colors = new ArrayList<>(List.of("red", "green", "blue"));

System.out.println(colors.contains("green"));
System.out.println(colors.contains("yellow"));
System.out.println(colors.indexOf("blue"));
System.out.println(colors.indexOf("yellow")); // -1 = not found
System.out.println(colors.isEmpty());
```

Result:

```text
true
false
2
-1
false
```

### Iterating

```java
List<String> names = List.of("Ada", "Bob", "Charlie");

// Enhanced for-each (preferred)
for (String name : names) {
    System.out.println(name);
}

// Index-based
for (int i = 0; i < names.size(); i++) {
    System.out.println(i + ": " + names.get(i));
}

// forEach with lambda
names.forEach(name -> System.out.println("Hello, " + name));
```

Result:

```text
Ada
Bob
Charlie
0: Ada
1: Bob
2: Charlie
Hello, Ada
Hello, Bob
Hello, Charlie
```

### Sorting

```java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

List<String> names = new ArrayList<>(List.of("Charlie", "Ada", "Bob"));
Collections.sort(names);
System.out.println(names);

List<Integer> numbers = new ArrayList<>(List.of(30, 10, 20, 50, 40));
Collections.sort(numbers);
System.out.println(numbers);

// Reverse sort
numbers.sort(Collections.reverseOrder());
System.out.println(numbers);
```

Result:

```text
[Ada, Bob, Charlie]
[10, 20, 30, 40, 50]
[50, 40, 30, 20, 10]
```

### Custom sorting

```java
import java.util.ArrayList;
import java.util.List;

record Person(String name, int age) {}

List<Person> people = new ArrayList<>(List.of(
    new Person("Charlie", 25),
    new Person("Ada", 36),
    new Person("Bob", 17)
));

// Sort by age
people.sort((a, b) -> Integer.compare(a.age(), b.age()));
System.out.println(people);

// Sort by name
people.sort((a, b) -> a.name().compareTo(b.name()));
System.out.println(people);
```

Result:

```text
[Person[name=Bob, age=17], Person[name=Charlie, age=25], Person[name=Ada, age=36]]
[Person[name=Ada, age=36], Person[name=Bob, age=17], Person[name=Charlie, age=25]]
```

## `HashMap` -- key-value pairs

A map stores key-value pairs. Keys are unique; values can repeat:

```java
import java.util.HashMap;
import java.util.Map;

Map<String, Integer> ages = new HashMap<>();

// Adding entries
ages.put("Ada", 36);
ages.put("Bob", 25);
ages.put("Charlie", 30);
System.out.println(ages);

// Accessing
System.out.println(ages.get("Ada"));
System.out.println(ages.get("Unknown")); // null if key not found

// Safe access with default
System.out.println(ages.getOrDefault("Unknown", 0));

// Size
System.out.println("Size: " + ages.size());

// Checking
System.out.println(ages.containsKey("Bob"));
System.out.println(ages.containsValue(25));

// Removing
ages.remove("Charlie");
System.out.println(ages);
```

Result:

```text
{Ada=36, Bob=25, Charlie=30}
36
null
0
Size: 3
true
true
{Ada=36, Bob=25}
```

**Note:** `HashMap` does not guarantee insertion order. If you need order, use `LinkedHashMap`.

### Iterating over maps

```java
Map<String, String> capitals = Map.of(
    "Germany", "Berlin",
    "France", "Paris",
    "Japan", "Tokyo"
);

// Keys
for (String country : capitals.keySet()) {
    System.out.println(country);
}

// Values
for (String city : capitals.values()) {
    System.out.println(city);
}

// Key-value pairs (most common)
for (Map.Entry<String, String> entry : capitals.entrySet()) {
    System.out.println(entry.getKey() + " → " + entry.getValue());
}

// forEach with lambda
capitals.forEach((country, city) ->
    System.out.println(country + ": " + city)
);
```

Result:

```text
Germany
France
Japan
Berlin
Paris
Tokyo
Germany → Berlin
France → Paris
Japan → Tokyo
Germany: Berlin
France: Paris
Japan: Tokyo
```

### Practical: counting occurrences

```java
String[] words = {"apple", "banana", "apple", "cherry", "banana", "apple"};
Map<String, Integer> counts = new HashMap<>();

for (String word : words) {
    counts.put(word, counts.getOrDefault(word, 0) + 1);
}

System.out.println(counts);
```

Result:

```text
{banana=2, cherry=1, apple=3}
```

Or using `merge`:

```java
Map<String, Integer> counts = new HashMap<>();
for (String word : words) {
    counts.merge(word, 1, Integer::sum);
}
```

## `HashSet` -- unique elements

A set stores unique values with no duplicates and no guaranteed order:

```java
import java.util.HashSet;
import java.util.Set;

Set<String> tags = new HashSet<>();

tags.add("java");
tags.add("programming");
tags.add("java");      // duplicate -- ignored
tags.add("tutorial");

System.out.println(tags);
System.out.println("Size: " + tags.size());
System.out.println(tags.contains("java"));

tags.remove("tutorial");
System.out.println(tags);
```

Result:

```text
[java, tutorial, programming]
Size: 3
true
[java, programming]
```

### Set operations

```java
Set<Integer> a = Set.of(1, 2, 3, 4, 5);
Set<Integer> b = Set.of(4, 5, 6, 7, 8);

// Union
Set<Integer> union = new HashSet<>(a);
union.addAll(b);
System.out.println("Union: " + union);

// Intersection
Set<Integer> intersection = new HashSet<>(a);
intersection.retainAll(b);
System.out.println("Intersection: " + intersection);

// Difference (a - b)
Set<Integer> difference = new HashSet<>(a);
difference.removeAll(b);
System.out.println("Difference: " + difference);
```

Result:

```text
Union: [1, 2, 3, 4, 5, 6, 7, 8]
Intersection: [4, 5]
Difference: [1, 2, 3]
```

### Removing duplicates from a list

```java
List<String> withDuplicates = List.of("a", "b", "a", "c", "b");
List<String> unique = new ArrayList<>(new HashSet<>(withDuplicates));
System.out.println(unique);
```

Result:

```text
[a, b, c]
```

**Note:** this does not preserve order. For order-preserving dedup, use `LinkedHashSet`.

## Immutable collections

Collections created with `List.of`, `Set.of`, and `Map.of` are **immutable** -- they cannot be modified:

```java
List<String> immutable = List.of("a", "b", "c");
System.out.println(immutable);

try {
    immutable.add("d"); // throws UnsupportedOperationException
} catch (UnsupportedOperationException e) {
    System.out.println("Cannot modify immutable list");
}
```

Result:

```text
[a, b, c]
Cannot modify immutable list
```

To create a modifiable collection from an immutable one:

```java
List<String> mutable = new ArrayList<>(List.of("a", "b", "c"));
mutable.add("d"); // works fine
System.out.println(mutable);
```

Result:

```text
[a, b, c, d]
```

## `Collections` utility methods

```java
import java.util.Collections;

List<Integer> numbers = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9));

Collections.sort(numbers);
System.out.println("Sorted: " + numbers);

Collections.reverse(numbers);
System.out.println("Reversed: " + numbers);

Collections.shuffle(numbers);
System.out.println("Shuffled: " + numbers);

System.out.println("Min: " + Collections.min(numbers));
System.out.println("Max: " + Collections.max(numbers));
System.out.println("Frequency of 1: " + Collections.frequency(numbers, 1));
```

Result:

```text
Sorted: [1, 1, 3, 4, 5, 9]
Reversed: [9, 5, 4, 3, 1, 1]
Shuffled: [3, 1, 9, 5, 4, 1]
Min: 1
Max: 9
Frequency of 1: 2
```

## Choosing the right collection

| Need                             | Use             | Why                                |
|----------------------------------|-----------------|------------------------------------|
| Ordered list, access by index    | `ArrayList`     | Fast random access, fast iteration |
| Unique elements, no order needed | `HashSet`       | O(1) add/remove/contains           |
| Unique elements, insertion order | `LinkedHashSet` | Like `HashSet` but ordered         |
| Unique elements, sorted          | `TreeSet`       | Elements kept in natural order     |
| Key-value pairs, no order        | `HashMap`       | O(1) get/put                       |
| Key-value pairs, insertion order | `LinkedHashMap` | Like `HashMap` but ordered         |
| Key-value pairs, sorted keys     | `TreeMap`       | Keys kept in natural order         |
| Queue (FIFO)                     | `ArrayDeque`    | Fast add/remove at both ends       |

For a comprehensive guide covering concurrent collections and advanced usage, see
the [Collections deep dive](../collections.md).

## Summary

- **`ArrayList`** -- the go-to ordered, resizable list. Use it unless you need something else.
- **`HashMap`** -- key-value lookup in O(1). Use `getOrDefault` and `merge` for clean code.
- **`HashSet`** -- stores unique elements. Good for membership tests and deduplication.
- **Generics** (`<String>`, `<Integer>`) enforce type safety at compile time.
- **Immutable collections** (`List.of`, `Map.of`, `Set.of`) prevent accidental modification.
- **`Collections`** utility class provides sort, shuffle, min, max, and more.
- Use `for-each` or `forEach` with lambdas to iterate.

Next up: [Error Handling](./08-error-handling.md) -- dealing with things that go wrong.
