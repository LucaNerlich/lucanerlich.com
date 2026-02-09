---
title: "Methods"
sidebar_label: "Methods"
description: Learn Java methods — defining and calling static methods, parameters, return types, overloading, varargs, scope, and recursion.
slug: /java/beginners-guide/methods
tags: [java, beginners, methods]
keywords:
  - java methods
  - static methods
  - method overloading
  - varargs
  - java scope
sidebar_position: 4
---

# Methods

A method is a reusable block of code that performs a specific task. In Java, every piece of code lives inside a method, and every method lives inside a class.

## Defining and calling methods

Until we cover classes and objects (next chapter), all our methods are `static` — they belong to the class itself rather than to an instance.

```java
public class Greeter {

    static String greet(String name) {
        return "Hello, " + name + "!";
    }

    public static void main(String[] args) {
        String message = greet("Ada");
        System.out.println(message);
    }
}
```

Result:
```text
Hello, Ada!
```

Anatomy:
- `static` — belongs to the class, not to an instance
- `String` — the return type
- `greet` — the method name
- `(String name)` — the parameter list (type + name)
- `return` — sends a value back to the caller

## `void` methods

Methods that do not return a value use `void`:

```java
static void logMessage(String level, String text) {
    System.out.println("[" + level + "] " + text);
}

public static void main(String[] args) {
    logMessage("INFO", "Server started");
    logMessage("WARN", "Disk usage high");
}
```

Result:
```text
[INFO] Server started
[WARN] Disk usage high
```

## Parameters and return types

Parameters are the inputs; the return type is the output. Java is strict about types:

```java
static int add(int a, int b) {
    return a + b;
}

static double divide(double a, double b) {
    return a / b;
}

static boolean isEven(int number) {
    return number % 2 == 0;
}

public static void main(String[] args) {
    System.out.println(add(3, 4));
    System.out.println(divide(10.0, 3.0));
    System.out.println(isEven(7));
}
```

Result:
```text
7
3.3333333333333335
false
```

If you declare a return type, you **must** return a value on every code path. The compiler enforces this:

```java
// Compile error: missing return statement
static int broken(int x) {
    if (x > 0) {
        return x;
    }
    // what about x <= 0? The compiler won't allow this.
}
```

## Early return (guard clauses)

Return early to handle edge cases at the top of a method:

```java
static String classify(int score) {
    if (score < 0 || score > 100) {
        return "Invalid score";
    }
    if (score >= 90) {
        return "A";
    }
    if (score >= 80) {
        return "B";
    }
    if (score >= 70) {
        return "C";
    }
    return "F";
}

public static void main(String[] args) {
    System.out.println(classify(95));
    System.out.println(classify(82));
    System.out.println(classify(55));
    System.out.println(classify(-1));
}
```

Result:
```text
A
B
F
Invalid score
```

Guard clauses keep code flat instead of deeply nested. Prefer them over large `if-else` chains.

## Method overloading

Multiple methods can share the same name if their **parameter lists differ** (different number or types of parameters):

```java
static int add(int a, int b) {
    return a + b;
}

static int add(int a, int b, int c) {
    return a + b + c;
}

static double add(double a, double b) {
    return a + b;
}

public static void main(String[] args) {
    System.out.println(add(1, 2));       // calls int add(int, int)
    System.out.println(add(1, 2, 3));    // calls int add(int, int, int)
    System.out.println(add(1.5, 2.5));   // calls double add(double, double)
}
```

Result:
```text
3
6
4.0
```

The compiler decides which overload to call based on the argument types. This is called **compile-time polymorphism**.

**Note:** you cannot overload by return type alone — the parameter list must differ.

## Varargs

Accept a variable number of arguments using `...`:

```java
static int sum(int... numbers) {
    int total = 0;
    for (int n : numbers) {
        total += n;
    }
    return total;
}

public static void main(String[] args) {
    System.out.println(sum(1, 2, 3));
    System.out.println(sum(10, 20, 30, 40));
    System.out.println(sum());
}
```

Result:
```text
6
100
0
```

Inside the method, `numbers` is an `int[]` (array). Rules:
- Only **one** varargs parameter per method
- It must be the **last** parameter

```java
static void log(String level, String... messages) {
    for (String msg : messages) {
        System.out.println("[" + level + "] " + msg);
    }
}

public static void main(String[] args) {
    log("INFO", "Server started", "Listening on port 8080");
}
```

Result:
```text
[INFO] Server started
[INFO] Listening on port 8080
```

## Pass-by-value

Java is **always pass-by-value**. For primitives, the value is copied. For objects, the **reference** is copied (not the object itself).

### Primitives are copied

```java
static void tryToChange(int x) {
    x = 999;
    System.out.println("Inside method: " + x);
}

public static void main(String[] args) {
    int value = 42;
    tryToChange(value);
    System.out.println("After method: " + value);
}
```

Result:
```text
Inside method: 999
After method: 42
```

The original `value` is unchanged — the method received a copy.

### Object references are copied

```java
static void addItem(java.util.List<String> list) {
    list.add("added by method");
}

public static void main(String[] args) {
    var items = new java.util.ArrayList<String>();
    items.add("original");
    addItem(items);
    System.out.println(items);
}
```

Result:
```text
[original, added by method]
```

The method receives a copy of the **reference** — it points to the same list object. So modifications to the object are visible to the caller. But reassigning the reference inside the method does not affect the caller:

```java
static void reassign(java.util.List<String> list) {
    list = new java.util.ArrayList<>(); // this only changes the local copy
    list.add("new list");
    System.out.println("Inside: " + list);
}

public static void main(String[] args) {
    var items = new java.util.ArrayList<String>();
    items.add("original");
    reassign(items);
    System.out.println("After: " + items);
}
```

Result:
```text
Inside: [new list]
After: [original]
```

## Scope

Variables are only accessible within the block where they are declared:

```java
static void example() {
    int x = 10;

    if (x > 5) {
        int y = 20;
        System.out.println(x + y); // both accessible here
    }

    // System.out.println(y); // compile error: y is not accessible here
    System.out.println(x); // x is still accessible
}
```

Result:
```text
30
10
```

Method parameters are scoped to the method body. Variables declared in `for` loops are scoped to the loop:

```java
for (int i = 0; i < 3; i++) {
    System.out.println(i);
}
// System.out.println(i); // compile error: i is not accessible here
```

## Recursion

A method that calls itself:

```java
static int factorial(int n) {
    if (n <= 1) {
        return 1; // base case
    }
    return n * factorial(n - 1); // recursive case
}

public static void main(String[] args) {
    System.out.println(factorial(5));  // 5 * 4 * 3 * 2 * 1
    System.out.println(factorial(0));
    System.out.println(factorial(10));
}
```

Result:
```text
120
1
3628800
```

Every recursive method needs:
1. A **base case** that stops the recursion
2. A **recursive case** that moves toward the base case

Without a base case, the method calls itself forever and throws `StackOverflowError`.

### Fibonacci

```java
static int fibonacci(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

public static void main(String[] args) {
    for (int i = 0; i <= 10; i++) {
        System.out.print(fibonacci(i) + " ");
    }
    System.out.println();
}
```

Result:
```text
0 1 1 2 3 5 8 13 21 34 55
```

This naive implementation is slow for large `n` because it recalculates the same values repeatedly. For production code, use iteration or memoization.

## Practical example: utility methods

A common pattern is to group related utility methods in a class:

```java
public class StringUtils {

    static boolean isNullOrEmpty(String s) {
        return s == null || s.isEmpty();
    }

    static String capitalize(String s) {
        if (isNullOrEmpty(s)) {
            return s;
        }
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }

    static String repeat(String s, int times) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < times; i++) {
            sb.append(s);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        System.out.println(isNullOrEmpty(""));
        System.out.println(isNullOrEmpty("hello"));
        System.out.println(capitalize("java"));
        System.out.println(repeat("ab", 3));
    }
}
```

Result:
```text
true
false
Java
ababab
```

## Summary

- Methods have a return type, name, and parameter list. Use `void` for no return value.
- `static` methods belong to the class — we will see instance methods in the next chapter.
- **Guard clauses** (early returns) keep methods flat and readable.
- **Overloading** lets multiple methods share a name with different parameter lists.
- **Varargs** (`type... name`) accept a variable number of arguments as an array.
- Java is **pass-by-value** — primitives are copied, object references are copied (but the object they point to is shared).
- **Scope** is block-level — variables exist only within their enclosing `{}`.
- **Recursion** requires a base case to avoid `StackOverflowError`.

Next up: [Classes & Objects](./05-classes-and-objects.md) — the heart of Java's object-oriented programming.
