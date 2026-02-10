---
title: "Records, Sealed Classes, and Modern Java"
sidebar_label: "Modern Java Features"
sidebar_position: 2
description: "Guide to modern Java features: records, sealed classes, pattern matching, text blocks, var, and a version-by-version feature table from Java 11 to 21."
tags: [java, records, sealed-classes, pattern-matching]
---

# Records, Sealed Classes, and Modern Java

Java has evolved dramatically since Java 8. This page covers the most impactful features
introduced in Java 11 through 21 -- the features that change how you write everyday code.

## Feature table by version

| Feature                               | Java version | Status  |
|---------------------------------------|--------------|---------|
| `var` (local variable type inference) | 10           | Final   |
| HTTP Client API                       | 11           | Final   |
| Switch expressions                    | 14           | Final   |
| Text blocks                           | 15           | Final   |
| Records                               | 16           | Final   |
| Pattern matching for `instanceof`     | 16           | Final   |
| Sealed classes                        | 17           | Final   |
| Pattern matching for `switch`         | 21           | Final   |
| Record patterns                       | 21           | Final   |
| Virtual threads                       | 21           | Final   |
| Sequenced collections                 | 21           | Final   |
| String templates                      | 22 (preview) | Preview |

---

## Records

Records are **immutable data carriers** -- classes that hold data and nothing else.
They eliminate the boilerplate of constructors, getters, `equals()`, `hashCode()`,
and `toString()`.

### Basic record

```java
// Before records: ~40 lines of boilerplate
record Point(int x, int y) {}

// The compiler generates:
// - Constructor: Point(int x, int y)
// - Accessors:   x(), y()     (not getX() -- no "get" prefix)
// - equals()     based on all fields
// - hashCode()   based on all fields
// - toString()   "Point[x=1, y=2]"

Point p = new Point(1, 2);
System.out.println(p.x());       // 1
System.out.println(p);           // Point[x=1, y=2]
System.out.println(p.equals(new Point(1, 2))); // true
```

### Compact constructor (validation)

```java
record Email(String address) {
    // Compact constructor -- no parameter list, fields assigned automatically
    Email {
        if (address == null || !address.contains("@")) {
            throw new IllegalArgumentException("Invalid email: " + address);
        }
        address = address.toLowerCase().strip();
    }
}

Email e = new Email("  USER@Example.COM  ");
System.out.println(e.address()); // "user@example.com"
```

### Records with methods

Records can have instance methods, static methods, and implement interfaces:

```java
record Money(BigDecimal amount, String currency) implements Comparable<Money> {

    // Static factory
    static Money usd(double amount) {
        return new Money(BigDecimal.valueOf(amount), "USD");
    }

    // Instance method
    Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }

    @Override
    public int compareTo(Money other) {
        return this.amount.compareTo(other.amount);
    }
}
```

### When to use records vs classes

| Use a record when...                           | Use a class when...               |
|------------------------------------------------|-----------------------------------|
| Data is immutable                              | You need mutable state            |
| Identity is based on data (value semantics)    | Identity is based on reference    |
| You need `equals/hashCode` based on all fields | You need custom `equals` logic    |
| Few fields, no inheritance needed              | You need to extend a class        |
| DTOs, API responses, value objects             | Entities with behaviour, services |

---

## Sealed classes

Sealed classes **restrict which classes can extend them**. This enables exhaustive
pattern matching -- the compiler knows all possible subtypes.

```java
// Only Circle, Rectangle, and Triangle can extend Shape
sealed interface Shape permits Circle, Rectangle, Triangle {}

record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}
```

### Exhaustive pattern matching

With sealed types, the compiler checks that you handle all cases:

```java
double area(Shape shape) {
    return switch (shape) {
        case Circle c    -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t  -> 0.5 * t.base() * t.height();
        // No default needed -- compiler knows all cases are covered
    };
}
```

### Sealed class hierarchies

```java
sealed abstract class Vehicle permits Car, Truck, Motorcycle {}

final class Car extends Vehicle {        // final -- cannot be extended further
    // ...
}

sealed class Truck extends Vehicle permits PickupTruck, SemiTruck {}
// Truck can only be extended by PickupTruck and SemiTruck

final class PickupTruck extends Truck {}
final class SemiTruck extends Truck {}

non-sealed class Motorcycle extends Vehicle {}
// non-sealed -- anyone can extend Motorcycle
```

| Modifier     | Meaning                                          |
|--------------|--------------------------------------------------|
| `sealed`     | Only the listed subtypes can extend this class   |
| `final`      | Cannot be extended at all                        |
| `non-sealed` | Opens up the hierarchy again (anyone can extend) |

---

## Pattern matching

### Pattern matching for instanceof (Java 16)

Eliminates redundant casts:

```java
// Before
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}

// After -- binding variable 's' is in scope after the check
if (obj instanceof String s) {
    System.out.println(s.length());
}

// Works with negation too
if (!(obj instanceof String s)) {
    return; // s is NOT in scope here
}
// s IS in scope here (the method only continues if obj is a String)
System.out.println(s.length());
```

### Pattern matching for switch (Java 21)

```java
String describe(Object obj) {
    return switch (obj) {
        case Integer i when i > 0 -> "positive integer: " + i;
        case Integer i            -> "non-positive integer: " + i;
        case String s             -> "string of length " + s.length();
        case null                 -> "null";
        default                   -> "unknown: " + obj.getClass().getSimpleName();
    };
}
```

### Record patterns (Java 21)

Deconstruct records directly in patterns:

```java
record Point(int x, int y) {}

void printCoords(Object obj) {
    if (obj instanceof Point(int x, int y)) {
        System.out.println("x=" + x + ", y=" + y);
    }
}

// In switch
String quadrant(Point p) {
    return switch (p) {
        case Point(var x, var y) when x > 0 && y > 0 -> "I";
        case Point(var x, var y) when x < 0 && y > 0 -> "II";
        case Point(var x, var y) when x < 0 && y < 0 -> "III";
        case Point(var x, var y) when x > 0 && y < 0 -> "IV";
        default -> "on axis";
    };
}
```

### Nested record patterns

```java
record Address(String city, String country) {}
record Customer(String name, Address address) {}

String greeting(Customer c) {
    return switch (c) {
        case Customer(var name, Address(_, var country))
            when country.equals("DE") -> "Hallo " + name;
        case Customer(var name, Address(_, var country))
            when country.equals("FR") -> "Bonjour " + name;
        case Customer(var name, _) -> "Hello " + name;
    };
}
```

---

## Switch expressions (Java 14)

Switch can now return a value and use arrow syntax:

```java
// Expression (returns a value)
String dayType = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "Weekday";
    case SATURDAY, SUNDAY -> "Weekend";
};

// Multi-line with yield
int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case WEDNESDAY -> 9;
    case THURSDAY, SATURDAY -> 8;
};
```

---

## Text blocks (Java 15)

Multi-line strings without escape character chaos:

```java
// Before
String json = "{\n" +
    "  \"name\": \"Alice\",\n" +
    "  \"age\": 30\n" +
    "}";

// After
String json = """
    {
      "name": "Alice",
      "age": 30
    }
    """;

// SQL
String sql = """
    SELECT u.name, u.email
    FROM users u
    WHERE u.active = true
      AND u.created > :since
    ORDER BY u.name
    """;
```

Text blocks strip common leading whitespace. The closing `"""` position determines
the indentation baseline.

---

## Local variable type inference (`var`, Java 10)

```java
// The compiler infers the type
var names = List.of("Alice", "Bob", "Charlie"); // List<String>
var map = new HashMap<String, List<Integer>>(); // HashMap<String, List<Integer>>

// Useful for complex generic types
var entrySet = map.entrySet(); // Set<Map.Entry<String, List<Integer>>>

// Works in for-loops
for (var entry : map.entrySet()) {
    var key = entry.getKey();
    var values = entry.getValue();
}
```

### When to use `var`

| Use `var`                                                            | Avoid `var`                                     |
|----------------------------------------------------------------------|-------------------------------------------------|
| Type is obvious from the right side (`var list = new ArrayList<>()`) | Type is not obvious (`var result = process()`)  |
| Complex generic types that add noise                                 | Method parameters or return types (not allowed) |
| Local variables in short methods                                     | When the type name adds documentation value     |

---

## Sequenced collections (Java 21)

New interfaces that add first/last access to ordered collections:

```java
// SequencedCollection adds: getFirst(), getLast(), reversed()
List<String> list = new ArrayList<>(List.of("a", "b", "c"));
String first = list.getFirst(); // "a"
String last = list.getLast();   // "c"
List<String> rev = list.reversed(); // [c, b, a] (view, not copy)

// SequencedMap adds: firstEntry(), lastEntry(), reversed()
var map = new LinkedHashMap<String, Integer>();
map.put("one", 1);
map.put("two", 2);
map.put("three", 3);

Map.Entry<String, Integer> first = map.firstEntry(); // one=1
Map.Entry<String, Integer> last = map.lastEntry();   // three=3
```

---

## Best practices

### Prefer records for data classes

If a class is just data (DTO, API response, value object), use a record. You get
immutability, value equality, and zero boilerplate.

### Use sealed types for domain models

If you know all the variants (payment types, shapes, AST nodes), seal the hierarchy.
The compiler enforces exhaustive handling.

### Adopt pattern matching gradually

Start with `instanceof` patterns (simple, safe), then move to switch patterns for
complex dispatch logic.

### Don't overuse `var`

`var` is great for reducing noise in local variables where the type is obvious. Don't
use it when the type name provides important documentation.

---

## Common pitfalls

| Pitfall                         | Problem                                                                              | Fix                                                                 |
|---------------------------------|--------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| Records are not beans           | Records use `name()` not `getName()`, which breaks some frameworks                   | Use `@JsonProperty` or configure Jackson for records                |
| Records cannot extend classes   | Records implicitly extend `java.lang.Record`                                         | Use interfaces (records can implement multiple interfaces)          |
| Sealed class in different file  | `permits` clause requires all subtypes in the same package (or same file for nested) | Keep sealed hierarchies in the same package                         |
| `var` with diamond operator     | `var list = new ArrayList<>()` infers `ArrayList<Object>`                            | Either specify the type or use `var list = new ArrayList<String>()` |
| Pattern matching variable scope | Binding variables are only in scope where the pattern is guaranteed to match         | Be careful with negated conditions and `else` branches              |

---

## See also

- [Streams and Collectors](./java-streams.md) -- streams use records heavily
- [Generics and Type Erasure](./generics.md) -- generic types and wildcards
- [Functional Interfaces](./functional-interfaces.md) -- lambdas and method references
- [Collections](./collections.md) -- sequenced collections
