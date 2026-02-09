---
title: "Variables, Types & Operators"
sidebar_label: "Variables & Types"
description: Learn Java's primitive types, String basics, type casting, var, final, arithmetic, comparison, and logical operators.
slug: /java/beginners-guide/variables-and-types
tags: [java, beginners, variables, types]
keywords:
  - java variables
  - java data types
  - primitive types
  - type casting
  - java operators
sidebar_position: 2
---

# Variables, Types & Operators

Java is a **statically typed** language -- every variable has a declared type, and the compiler enforces it. This chapter covers all the primitive types, strings, type casting, and operators.

## Declaring variables

```java
int age = 25;
String name = "Ada";
double price = 9.99;
boolean isActive = true;

System.out.println(age);
System.out.println(name);
System.out.println(price);
System.out.println(isActive);
```

Result:
```text
25
Ada
9.99
true
```

A variable declaration has three parts: **type**, **name**, and (optionally) an **initial value**.

```java
int count;          // declaration without initialization
count = 10;         // assignment
int total = 100;    // declaration with initialization
```

### `final` -- constants

`final` prevents reassignment (similar to `const` in JavaScript):

```java
final int MAX_RETRIES = 3;
System.out.println(MAX_RETRIES);

// MAX_RETRIES = 5; // error: cannot assign a value to final variable
```

Result:
```text
3
```

Convention: constants use `UPPER_SNAKE_CASE`.

### `var` -- type inference (Java 10+)

The compiler can infer the type from the right-hand side:

```java
var message = "Hello";   // inferred as String
var count = 42;          // inferred as int
var pi = 3.14;           // inferred as double

System.out.println(message.getClass().getSimpleName());
System.out.println(((Object) count).getClass().getSimpleName());
```

Result:
```text
String
Integer
```

`var` is just syntactic sugar -- the variable is still statically typed. You cannot reassign it to a different type:

```java
var x = 10;
// x = "hello"; // error: incompatible types
```

Use `var` when the type is obvious from the right side. Prefer explicit types when clarity matters.

## Primitive types

Java has **eight** primitive types. They store values directly (not as objects):

| Type | Size | Range | Default | Example |
|------|------|-------|---------|---------|
| `byte` | 8 bits | -128 to 127 | 0 | `byte b = 100;` |
| `short` | 16 bits | -32,768 to 32,767 | 0 | `short s = 30000;` |
| `int` | 32 bits | ~-2.1 billion to ~2.1 billion | 0 | `int i = 42;` |
| `long` | 64 bits | ~-9.2 quintillion to ~9.2 quintillion | 0L | `long l = 123456789L;` |
| `float` | 32 bits | ~7 decimal digits | 0.0f | `float f = 3.14f;` |
| `double` | 64 bits | ~15 decimal digits | 0.0 | `double d = 3.14;` |
| `boolean` | 1 bit* | `true` or `false` | false | `boolean b = true;` |
| `char` | 16 bits | Unicode character | '\u0000' | `char c = 'A';` |

*boolean actual size depends on the JVM implementation.

### `int` and `long`

```java
int population = 8_000_000;         // underscores for readability
long worldPopulation = 8_000_000_000L; // 'L' suffix for long literals

System.out.println(population);
System.out.println(worldPopulation);
```

Result:
```text
8000000
8000000000
```

Without the `L` suffix, the compiler treats a number literal as `int`. If the value exceeds `int` range, you get a compile error.

### `double` and `float`

```java
double precise = 3.141592653589793;
float less = 3.14f; // 'f' suffix required for float literals

System.out.println(precise);
System.out.println(less);
System.out.println(0.1 + 0.2); // same floating-point quirk as any language
```

Result:
```text
3.141592653589793
3.14
0.30000000000000004
```

Use `double` by default. Use `float` only when memory is a concern (e.g., graphics, large arrays).

### `boolean`

```java
boolean isJavaFun = true;
boolean isColdOutside = false;

System.out.println(isJavaFun);
System.out.println(isColdOutside);
```

Result:
```text
true
false
```

Unlike JavaScript, Java does **not** coerce other types to booleans. `if (1)` is a compile error -- only `boolean` expressions are allowed in conditions.

### `char`

A single Unicode character, wrapped in single quotes:

```java
char letter = 'A';
char digit = '7';
char emoji = '★';

System.out.println(letter);
System.out.println(digit);
System.out.println(emoji);
System.out.println((int) letter); // numeric value
```

Result:
```text
A
7
★
65
```

## Strings

`String` is not a primitive -- it is a class. But it is so fundamental that it has special support:

```java
String greeting = "Hello, world!";
System.out.println(greeting);
System.out.println(greeting.length());
```

Result:
```text
Hello, world!
13
```

### Strings are immutable

Once created, a `String` cannot be changed. Methods like `toUpperCase()` return a **new** string:

```java
String original = "hello";
String upper = original.toUpperCase();

System.out.println(original); // unchanged
System.out.println(upper);
```

Result:
```text
hello
HELLO
```

### Common string methods

```java
String s = "Hello, World!";

System.out.println(s.length());              // 13
System.out.println(s.charAt(0));             // H
System.out.println(s.substring(7));          // World!
System.out.println(s.substring(0, 5));       // Hello
System.out.println(s.toLowerCase());         // hello, world!
System.out.println(s.toUpperCase());         // HELLO, WORLD!
System.out.println(s.contains("World"));     // true
System.out.println(s.startsWith("Hello"));   // true
System.out.println(s.indexOf("World"));      // 7
System.out.println(s.replace("World", "Java")); // Hello, Java!
System.out.println(s.trim());               // trims whitespace
System.out.println(s.isEmpty());            // false
System.out.println(s.isBlank());            // false (Java 11+)
```

Result:
```text
13
H
World!
Hello
hello, world!
HELLO, WORLD!
true
true
7
Hello, Java!
Hello, World!
false
false
```

### String comparison -- use `equals`, not `==`

```java
String a = "hello";
String b = "hello";
String c = new String("hello");

System.out.println(a == b);       // true (same string pool reference)
System.out.println(a == c);       // false (different objects!)
System.out.println(a.equals(c));  // true (same content)
```

Result:
```text
true
false
true
```

**Always use `.equals()` to compare strings.** The `==` operator compares object references, not content. It sometimes works due to string interning, but it is unreliable.

### String concatenation

```java
String first = "Hello";
String second = "World";

// + operator
String combined = first + ", " + second + "!";
System.out.println(combined);

// String.format
String formatted = String.format("%s is %d years old", "Ada", 36);
System.out.println(formatted);

// printf (prints directly, no newline by default)
System.out.printf("Price: $%.2f%n", 9.99);
```

Result:
```text
Hello, World!
Ada is 36 years old
Price: $9.99
```

Common format specifiers: `%s` (string), `%d` (integer), `%f` (float/double), `%.2f` (2 decimal places), `%n` (newline).

### Text blocks (Java 15+)

Multi-line strings with `"""`:

```java
String json = """
        {
            "name": "Ada",
            "age": 36
        }
        """;
System.out.println(json);
```

Result:
```text
{
    "name": "Ada",
    "age": 36
}
```

The indentation of the closing `"""` determines the left margin.

## Type casting

### Widening (automatic)

Going from a smaller type to a larger type is automatic and safe:

```java
int intValue = 42;
long longValue = intValue;     // int → long (automatic)
double doubleValue = intValue; // int → double (automatic)

System.out.println(longValue);
System.out.println(doubleValue);
```

Result:
```text
42
42.0
```

Widening order: `byte` → `short` → `int` → `long` → `float` → `double`

### Narrowing (explicit cast required)

Going from a larger type to a smaller type requires an explicit cast and may lose data:

```java
double pi = 3.14159;
int truncated = (int) pi; // double → int (truncates, does not round)

System.out.println(truncated);

long big = 130;
byte small = (byte) big; // 130 overflows byte range (-128 to 127)
System.out.println(small);
```

Result:
```text
3
-126
```

The `130` overflows `byte` and wraps around. Be careful with narrowing casts.

### Parsing strings to numbers

```java
int num = Integer.parseInt("42");
double dec = Double.parseDouble("3.14");
long big = Long.parseLong("1000000");

System.out.println(num);
System.out.println(dec);
System.out.println(big);
```

Result:
```text
42
3.14
1000000
```

Invalid input throws `NumberFormatException`:

```java
try {
    int bad = Integer.parseInt("abc");
} catch (NumberFormatException e) {
    System.out.println("Cannot parse: " + e.getMessage());
}
```

Result:
```text
Cannot parse: For input string: "abc"
```

### Numbers to strings

```java
String s1 = String.valueOf(42);
String s2 = Integer.toString(42);
String s3 = "" + 42; // concatenation trick

System.out.println(s1);
System.out.println(s2);
System.out.println(s3);
```

Result:
```text
42
42
42
```

## Wrapper classes

Each primitive has a corresponding **wrapper class** that turns it into an object:

| Primitive | Wrapper |
|-----------|---------|
| `int` | `Integer` |
| `long` | `Long` |
| `double` | `Double` |
| `float` | `Float` |
| `boolean` | `Boolean` |
| `char` | `Character` |
| `byte` | `Byte` |
| `short` | `Short` |

Java **autoboxes** -- it automatically converts between primitives and wrappers:

```java
Integer boxed = 42;        // autoboxing: int → Integer
int unboxed = boxed;       // unboxing: Integer → int

System.out.println(boxed);
System.out.println(unboxed);
```

Result:
```text
42
42
```

Wrapper classes are needed when working with collections (chapter 7) because collections cannot hold primitives.

## Arithmetic operators

```java
System.out.println(10 + 3);  // 13  -- addition
System.out.println(10 - 3);  // 7   -- subtraction
System.out.println(10 * 3);  // 30  -- multiplication
System.out.println(10 / 3);  // 3   -- integer division (truncates!)
System.out.println(10 % 3);  // 1   -- remainder (modulo)
System.out.println(10.0 / 3); // 3.3333... -- double division
```

Result:
```text
13
7
30
3
1
3.3333333333333335
```

**Integer division truncates.** `10 / 3` is `3`, not `3.33`. If you want decimal division, at least one operand must be a `double` or `float`.

### Increment and decrement

```java
int count = 5;
count++;
System.out.println(count); // 6

count--;
System.out.println(count); // 5

// Prefix vs postfix
int a = 5;
System.out.println(a++); // prints 5, then increments
System.out.println(a);   // 6

int b = 5;
System.out.println(++b); // increments first, then prints 6
```

Result:
```text
6
5
5
6
6
```

### Compound assignment

```java
int x = 10;
x += 5;  System.out.println(x); // 15
x -= 3;  System.out.println(x); // 12
x *= 2;  System.out.println(x); // 24
x /= 4;  System.out.println(x); // 6
x %= 4;  System.out.println(x); // 2
```

Result:
```text
15
12
24
6
2
```

## Comparison operators

All comparisons return `boolean`:

```java
System.out.println(5 > 3);   // true
System.out.println(5 < 3);   // false
System.out.println(5 >= 5);  // true
System.out.println(5 <= 4);  // false
System.out.println(5 == 5);  // true
System.out.println(5 != 3);  // true
```

Result:
```text
true
false
true
false
true
true
```

**For primitives**, `==` compares values and works correctly. **For objects** (including `String`), use `.equals()` to compare content.

## Logical operators

```java
System.out.println(true && true);   // true  -- AND
System.out.println(true && false);  // false
System.out.println(false || true);  // true  -- OR
System.out.println(false || false); // false
System.out.println(!true);         // false  -- NOT
System.out.println(!false);        // true
```

Result:
```text
true
false
true
false
false
true
```

### Short-circuit evaluation

`&&` stops at the first `false`; `||` stops at the first `true`:

```java
String name = null;

// Without short-circuit -- would throw NullPointerException
// if (name.length() > 0) { ... }

// With short-circuit -- safe, because the first condition is false
if (name != null && name.length() > 0) {
    System.out.println("Name: " + name);
} else {
    System.out.println("No name provided");
}
```

Result:
```text
No name provided
```

## The `Math` class

Common math operations:

```java
System.out.println(Math.abs(-42));       // 42
System.out.println(Math.max(10, 20));    // 20
System.out.println(Math.min(10, 20));    // 10
System.out.println(Math.pow(2, 10));     // 1024.0
System.out.println(Math.sqrt(144));      // 12.0
System.out.println(Math.round(3.7));     // 4
System.out.println(Math.floor(3.9));     // 3.0
System.out.println(Math.ceil(3.1));      // 4.0
System.out.println(Math.random());       // random double between 0.0 and 1.0
```

Result:
```text
42
20
10
1024.0
12.0
4
3.0
4.0
0.7231... (varies)
```

### Random integers in a range

```java
// Random int between 1 and 6 (inclusive) -- like a dice roll
int dice = (int) (Math.random() * 6) + 1;
System.out.println("Dice: " + dice);
```

## Operator precedence

From highest to lowest (simplified):

| Priority | Operators |
|----------|-----------|
| 1 | `()` (parentheses) |
| 2 | `++` `--` `!` (unary) |
| 3 | `*` `/` `%` |
| 4 | `+` `-` |
| 5 | `<` `<=` `>` `>=` |
| 6 | `==` `!=` |
| 7 | `&&` |
| 8 | `\|\|` |
| 9 | `=` `+=` `-=` etc. |

When in doubt, use parentheses to make your intent explicit:

```java
// Unclear
int result = 2 + 3 * 4; // 14 (multiplication first)

// Clear
int result2 = 2 + (3 * 4); // 14 -- same but intent is obvious
int result3 = (2 + 3) * 4; // 20 -- different result
```

## Summary

- Java has **8 primitive types** -- `int` and `double` are the most common.
- `String` is a class, not a primitive. It is immutable. Always compare with `.equals()`.
- `final` makes a variable constant. `var` lets the compiler infer the type.
- Integer division truncates -- use `double` for decimal results.
- Widening casts are automatic; narrowing casts require `(type)` and may lose data.
- Wrapper classes (`Integer`, `Double`, etc.) autobox between primitives and objects.
- Use `&&` and `||` for short-circuit logic.
- Use parentheses when operator precedence is unclear.

Next up: [Control Flow](./03-control-flow.md) -- decisions and loops.
