---
title: "Error Handling"
sidebar_label: "Error Handling"
description: Learn Java error handling -- try/catch/finally, checked vs unchecked exceptions, custom exceptions, try-with-resources, and best practices.
slug: /java/beginners-guide/error-handling
tags: [java, beginners, exceptions, error-handling]
keywords:
  - java exceptions
  - try catch
  - checked exceptions
  - try-with-resources
  - custom exceptions
sidebar_position: 8
---

# Error Handling

Things go wrong. Files are missing, network requests fail, users enter bad data. Java uses **exceptions** to handle errors in a structured way. This chapter covers the essentials.

## The basics: `try` / `catch`

Wrap risky code in `try` and handle the error in `catch`:

```java
try {
    int result = 10 / 0;
    System.out.println(result);
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
}

System.out.println("Program continues");
```

Result:
```text
Error: / by zero
Program continues
```

Without the `try`/`catch`, the program would crash. With it, the error is caught, handled, and execution continues.

## The exception hierarchy

```text
Throwable
├── Error                     (don't catch these)
│   ├── OutOfMemoryError
│   └── StackOverflowError
└── Exception
    ├── RuntimeException      (unchecked)
    │   ├── NullPointerException
    │   ├── IllegalArgumentException
    │   ├── IndexOutOfBoundsException
    │   ├── ArithmeticException
    │   └── ClassCastException
    └── IOException           (checked)
        ├── FileNotFoundException
        └── SocketException
```

### Checked vs unchecked

| | Checked | Unchecked |
|---|---------|-----------|
| **Extends** | `Exception` | `RuntimeException` |
| **Compiler enforcement** | Must be caught or declared with `throws` | No enforcement |
| **Cause** | External factors (files, network, I/O) | Programming bugs |
| **Examples** | `IOException`, `SQLException` | `NullPointerException`, `IllegalArgumentException` |

The compiler forces you to handle checked exceptions. Unchecked exceptions indicate bugs that should be fixed in the code.

## `finally`

The `finally` block always runs -- whether an exception occurred or not:

```java
try {
    System.out.println("Trying...");
    int result = 10 / 2;
    System.out.println("Result: " + result);
} catch (ArithmeticException e) {
    System.out.println("Error: " + e.getMessage());
} finally {
    System.out.println("This always runs");
}
```

Result:
```text
Trying...
Result: 5
This always runs
```

`finally` is commonly used for cleanup (closing files, connections). But in modern Java, **try-with-resources** is preferred (covered below).

## Catching multiple exceptions

### Multiple catch blocks

```java
try {
    String text = null;
    System.out.println(text.length());
} catch (NullPointerException e) {
    System.out.println("Null pointer: " + e.getMessage());
} catch (Exception e) {
    System.out.println("Other error: " + e.getMessage());
}
```

Result:
```text
Null pointer: Cannot invoke "String.length()" because "text" is null
```

Order matters -- catch the most specific exception first. `Exception` catches everything, so it must come last.

### Multi-catch (Java 7+)

Handle several exception types the same way:

```java
try {
    // some risky code
    String[] args = {};
    String value = args[0];
    int number = Integer.parseInt(value);
} catch (ArrayIndexOutOfBoundsException | NumberFormatException e) {
    System.out.println("Bad input: " + e.getMessage());
}
```

Result:
```text
Bad input: Index 0 out of bounds for length 0
```

## Throwing exceptions

Use `throw` to signal an error:

```java
static int divide(int a, int b) {
    if (b == 0) {
        throw new IllegalArgumentException("Divisor cannot be zero");
    }
    return a / b;
}

public static void main(String[] args) {
    System.out.println(divide(10, 2));

    try {
        System.out.println(divide(10, 0));
    } catch (IllegalArgumentException e) {
        System.out.println("Error: " + e.getMessage());
    }
}
```

Result:
```text
5
Error: Divisor cannot be zero
```

### `throws` declaration

For checked exceptions, declare them in the method signature:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

static String readFile(String filename) throws IOException {
    return Files.readString(Path.of(filename));
}

public static void main(String[] args) {
    try {
        String content = readFile("data.txt");
        System.out.println(content);
    } catch (IOException e) {
        System.out.println("File error: " + e.getMessage());
    }
}
```

Result (when file does not exist):
```text
File error: data.txt
```

The `throws IOException` tells callers: "this method might throw an `IOException` -- you must handle it."

## Custom exceptions

Create your own exceptions for domain-specific errors:

```java
// Unchecked (extends RuntimeException)
class InsufficientFundsException extends RuntimeException {
    private final double balance;
    private final double amount;

    InsufficientFundsException(double balance, double amount) {
        super(String.format("Cannot withdraw %.2f from balance %.2f", amount, balance));
        this.balance = balance;
        this.amount = amount;
    }

    double getBalance() { return balance; }
    double getAmount() { return amount; }
}
```

```java
class BankAccount {
    private double balance;

    BankAccount(double balance) {
        this.balance = balance;
    }

    void withdraw(double amount) {
        if (amount > balance) {
            throw new InsufficientFundsException(balance, amount);
        }
        balance -= amount;
    }

    double getBalance() { return balance; }
}
```

```java
BankAccount account = new BankAccount(100);

try {
    account.withdraw(50);
    System.out.println("Balance: " + account.getBalance());

    account.withdraw(80);
} catch (InsufficientFundsException e) {
    System.out.println("Error: " + e.getMessage());
    System.out.println("Tried to withdraw: " + e.getAmount());
}
```

Result:
```text
Balance: 50.0
Error: Cannot withdraw 80.00 from balance 50.00
Tried to withdraw: 80.0
```

### When to use checked vs unchecked

- **Unchecked (`RuntimeException`):** programming errors, invalid arguments, illegal state -- the caller cannot reasonably recover.
- **Checked (`Exception`):** recoverable situations like file not found, network timeout -- the caller should be forced to handle it.

In practice, most modern Java code favors unchecked exceptions.

## Try-with-resources

Automatically closes resources (files, connections, streams) when the `try` block finishes:

```java
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

try (BufferedReader reader = new BufferedReader(new FileReader("example.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Error reading file: " + e.getMessage());
}
// reader is automatically closed here, even if an exception occurred
```

Resources in the `try(...)` declaration must implement `AutoCloseable`. This pattern replaces the old `try/finally` approach for cleanup and is less error-prone.

### Multiple resources

```java
try (
    var reader = new BufferedReader(new FileReader("input.txt"));
    var writer = new java.io.BufferedWriter(new java.io.FileWriter("output.txt"))
) {
    String line;
    while ((line = reader.readLine()) != null) {
        writer.write(line.toUpperCase());
        writer.newLine();
    }
} catch (IOException e) {
    System.out.println("I/O error: " + e.getMessage());
}
// both reader and writer are closed automatically
```

## Common exceptions and what they mean

| Exception | When it happens |
|-----------|----------------|
| `NullPointerException` | Calling a method on `null` |
| `ArrayIndexOutOfBoundsException` | Array index is negative or >= length |
| `StringIndexOutOfBoundsException` | String index out of range |
| `NumberFormatException` | Parsing a non-numeric string as a number |
| `IllegalArgumentException` | Method called with invalid arguments |
| `IllegalStateException` | Object is in wrong state for the operation |
| `ClassCastException` | Invalid type cast |
| `IOException` | File/network I/O failure |
| `FileNotFoundException` | File does not exist |
| `StackOverflowError` | Infinite recursion |
| `OutOfMemoryError` | JVM ran out of memory |

## Exception best practices

### 1. Catch specific exceptions

```java
// Bad -- catches everything, including bugs
try {
    riskyOperation();
} catch (Exception e) {
    System.out.println("Something failed");
}

// Good -- catches only what you expect
try {
    riskyOperation();
} catch (IOException e) {
    System.out.println("I/O failed: " + e.getMessage());
}
```

### 2. Do not swallow exceptions

```java
// Bad -- error disappears silently
try {
    riskyOperation();
} catch (IOException e) {
    // empty catch block -- the worst thing you can do
}

// Good -- at least log it
try {
    riskyOperation();
} catch (IOException e) {
    System.err.println("Warning: " + e.getMessage());
}
```

### 3. Use exceptions for exceptional situations

```java
// Bad -- using exceptions for control flow
try {
    int value = Integer.parseInt(input);
    process(value);
} catch (NumberFormatException e) {
    useDefaultValue();
}

// Better -- check first
if (input.matches("-?\\d+")) {
    int value = Integer.parseInt(input);
    process(value);
} else {
    useDefaultValue();
}
```

### 4. Include context in error messages

```java
// Bad
throw new IllegalArgumentException("Invalid value");

// Good
throw new IllegalArgumentException("Age must be positive, got: " + age);
```

### 5. Prefer unchecked exceptions for programming errors

```java
// Good -- caller made a mistake
public void setAge(int age) {
    if (age < 0) {
        throw new IllegalArgumentException("Age cannot be negative: " + age);
    }
    this.age = age;
}
```

### 6. Use try-with-resources for all closeable resources

Always prefer try-with-resources over manual `finally` blocks for closing resources.

## Practical example: safe user input parsing

```java
import java.util.Scanner;

static int readInt(Scanner scanner, String prompt) {
    while (true) {
        System.out.print(prompt);
        String input = scanner.nextLine().trim();

        try {
            return Integer.parseInt(input);
        } catch (NumberFormatException e) {
            System.out.println("'" + input + "' is not a valid number. Try again.");
        }
    }
}

public static void main(String[] args) {
    Scanner scanner = new Scanner(System.in);
    int age = readInt(scanner, "Enter your age: ");
    System.out.println("Your age is: " + age);
}
```

For a comprehensive guide covering Result/Either patterns and advanced exception strategies, see the [Error Handling deep dive](../error-handling.md).

## Summary

- **`try`/`catch`** catches exceptions and prevents crashes.
- **Checked exceptions** (`IOException`) must be caught or declared; **unchecked** (`RuntimeException`) do not.
- **`throw`** signals an error; **`throws`** declares what a method might throw.
- **Custom exceptions** add domain-specific context to errors.
- **Try-with-resources** automatically closes files and connections -- always use it.
- Catch specific exceptions, never swallow them, and include context in messages.

Next up: [File I/O](./09-file-io.md) -- reading and writing files.
