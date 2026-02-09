---
title: "Control Flow"
sidebar_label: "Control Flow"
description: Learn Java control flow — if/else, switch expressions, for/while/do-while loops, enhanced for-each, break, continue, and common patterns.
slug: /java/beginners-guide/control-flow
tags: [java, beginners, control-flow, loops]
keywords:
  - java if else
  - java switch
  - java for loop
  - java while loop
  - enhanced for
sidebar_position: 3
---

# Control Flow

Control flow statements let your program make decisions and repeat actions. Java's control flow is similar to other C-family languages, but with some Java-specific features like enhanced switch and for-each.

## `if` / `else if` / `else`

```java
int temperature = 25;

if (temperature > 30) {
    System.out.println("It's hot");
} else if (temperature > 20) {
    System.out.println("It's warm");
} else if (temperature > 10) {
    System.out.println("It's cool");
} else {
    System.out.println("It's cold");
}
```

Result:
```text
It's warm
```

Rules:
- The condition must be a `boolean` expression. Java does not coerce integers or objects — `if (1)` is a compile error.
- Only the first matching branch executes.
- Always use braces `{}`, even for single-line bodies.

### Combining conditions

```java
int age = 25;
boolean hasLicense = true;

if (age >= 18 && hasLicense) {
    System.out.println("You can drive");
}

boolean isWeekend = true;
boolean isHoliday = false;

if (isWeekend || isHoliday) {
    System.out.println("Day off!");
}

boolean isLoggedIn = false;
if (!isLoggedIn) {
    System.out.println("Please log in");
}
```

Result:
```text
You can drive
Day off!
Please log in
```

## Ternary operator

A one-line `if`/`else`:

```java
int age = 20;
String status = (age >= 18) ? "adult" : "minor";
System.out.println(status);
```

Result:
```text
adult
```

Use it for simple assignments. Do not nest ternaries — they become unreadable.

## `switch` — classic

Compare a value against multiple options:

```java
String day = "Monday";

switch (day) {
    case "Monday":
    case "Tuesday":
    case "Wednesday":
    case "Thursday":
    case "Friday":
        System.out.println("Weekday");
        break;
    case "Saturday":
    case "Sunday":
        System.out.println("Weekend");
        break;
    default:
        System.out.println("Unknown day");
}
```

Result:
```text
Weekday
```

**Always include `break`** — without it, execution falls through to the next case.

Supported types: `byte`, `short`, `int`, `char`, `String`, and enums.

## Enhanced `switch` (Java 14+)

The modern switch uses arrow syntax and eliminates the need for `break`:

```java
String day = "Saturday";

String type = switch (day) {
    case "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" -> "Weekday";
    case "Saturday", "Sunday" -> "Weekend";
    default -> "Unknown";
};

System.out.println(type);
```

Result:
```text
Weekend
```

Key differences:
- Arrow `->` instead of colon `:`
- No fall-through — no `break` needed
- Can return a value (switch **expression**)
- Multiple values per case with commas

### Switch with blocks

```java
int dayNumber = 3;

String name = switch (dayNumber) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> {
        System.out.println("Processing day 3...");
        yield "Wednesday"; // 'yield' returns from a block
    }
    case 4 -> "Thursday";
    case 5 -> "Friday";
    default -> "Weekend";
};

System.out.println(name);
```

Result:
```text
Processing day 3...
Wednesday
```

Use `yield` to return a value from a multi-statement block in a switch expression.

## `for` loop

```java
for (int i = 0; i < 5; i++) {
    System.out.println("Iteration " + i);
}
```

Result:
```text
Iteration 0
Iteration 1
Iteration 2
Iteration 3
Iteration 4
```

The three parts:
1. **Initialization:** `int i = 0` — runs once
2. **Condition:** `i < 5` — checked before each iteration
3. **Update:** `i++` — runs after each iteration

### Counting backwards

```java
for (int i = 5; i > 0; i--) {
    System.out.println(i);
}
```

Result:
```text
5
4
3
2
1
```

### Stepping by more than one

```java
for (int i = 0; i <= 10; i += 2) {
    System.out.println(i);
}
```

Result:
```text
0
2
4
6
8
10
```

## Enhanced `for-each`

Iterates over arrays and collections without an index:

```java
String[] fruits = {"apple", "banana", "cherry"};

for (String fruit : fruits) {
    System.out.println(fruit);
}
```

Result:
```text
apple
banana
cherry
```

Read as "for each `String fruit` **in** `fruits`". Use for-each when you do not need the index.

## `while` loop

Repeats while a condition is true:

```java
int count = 0;

while (count < 3) {
    System.out.println("Count is " + count);
    count++;
}
```

Result:
```text
Count is 0
Count is 1
Count is 2
```

Use `while` when the number of iterations is unknown:

```java
int number = 1;

while (number < 100) {
    number *= 2;
}

System.out.println(number);
```

Result:
```text
128
```

## `do-while` loop

The body runs **at least once** before the condition is checked:

```java
int attempt = 0;

do {
    attempt++;
    System.out.println("Attempt " + attempt);
} while (attempt < 3);
```

Result:
```text
Attempt 1
Attempt 2
Attempt 3
```

## `break` and `continue`

### `break` — exit the loop early

```java
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;
    }
    System.out.println(i);
}
```

Result:
```text
0
1
2
3
4
```

### `continue` — skip to the next iteration

```java
for (int i = 0; i < 6; i++) {
    if (i % 2 == 0) {
        continue;
    }
    System.out.println(i);
}
```

Result:
```text
1
3
5
```

## Labeled loops

Labels let `break` and `continue` target an outer loop:

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (i == 1 && j == 1) {
            break outer;
        }
        System.out.println("i=" + i + ", j=" + j);
    }
}
```

Result:
```text
i=0, j=0
i=0, j=1
i=0, j=2
i=1, j=0
```

## Nested loops

```java
for (int row = 1; row <= 3; row++) {
    StringBuilder line = new StringBuilder();
    for (int col = 1; col <= 3; col++) {
        line.append("(").append(row).append(",").append(col).append(") ");
    }
    System.out.println(line.toString().trim());
}
```

Result:
```text
(1,1) (1,2) (1,3)
(2,1) (2,2) (2,3)
(3,1) (3,2) (3,3)
```

## Common patterns

### Summing values

```java
int[] numbers = {10, 20, 30, 40, 50};
int sum = 0;

for (int num : numbers) {
    sum += num;
}

System.out.println("Sum: " + sum);
```

Result:
```text
Sum: 150
```

### Finding a value

```java
String[] names = {"Alice", "Bob", "Charlie", "Diana"};
String found = null;

for (String name : names) {
    if (name.startsWith("C")) {
        found = name;
        break;
    }
}

System.out.println("Found: " + found);
```

Result:
```text
Found: Charlie
```

### FizzBuzz

```java
for (int i = 1; i <= 20; i++) {
    if (i % 15 == 0) {
        System.out.println("FizzBuzz");
    } else if (i % 3 == 0) {
        System.out.println("Fizz");
    } else if (i % 5 == 0) {
        System.out.println("Buzz");
    } else {
        System.out.println(i);
    }
}
```

Result:
```text
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
16
17
Fizz
19
Buzz
```

### Multiplication table

```java
int n = 5;
for (int i = 1; i <= n; i++) {
    for (int j = 1; j <= n; j++) {
        System.out.printf("%4d", i * j);
    }
    System.out.println();
}
```

Result:
```text
   1   2   3   4   5
   2   4   6   8  10
   3   6   9  12  15
   4   8  12  16  20
   5  10  15  20  25
```

## Summary

- `if`/`else if`/`else` for branching decisions — conditions must be `boolean`.
- Ternary `? :` for simple one-line conditionals.
- **Classic `switch`** requires `break`; **enhanced `switch`** (Java 14+) uses arrows and eliminates fall-through.
- `for` loop when you know the iteration count.
- Enhanced `for-each` for arrays and collections — cleaner than indexed `for`.
- `while` when the iteration count is unknown; `do-while` when the body must run at least once.
- `break` exits a loop; `continue` skips to the next iteration; labels target outer loops.

Next up: [Methods](./04-methods.md) — reusable blocks of code.
