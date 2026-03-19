---
title: "Functions"
sidebar_label: "Functions"
description: Defining functions, parameters and return types, the difference between expressions and statements, implicit returns, the unit type, nested functions, diverging functions, and documentation comments.
slug: /rust/beginners-guide/functions
tags: [rust, beginners]
keywords:
  - rust functions
  - rust return type
  - rust expressions vs statements
  - rust fn
  - rust documentation comments
sidebar_position: 4
---

# Functions

Functions are the building blocks of any Rust program. You have already used one -- `fn main()` -- in every example so
far. This chapter covers how to define your own functions, pass parameters, return values, and write documentation.

## Defining a function

Functions are declared with the `fn` keyword:

```rust
fn greet() {
    println!("Hello!");
}

fn main() {
    greet();
    greet();
}
```

```text
Hello!
Hello!
```

Conventions:

- Function names use **snake_case** -- lowercase with underscores: `calculate_area`, `parse_input`, `is_valid`
- Functions can be defined before or after `main` -- Rust does not care about declaration order

## Parameters

Functions can accept parameters. You **must** declare the type of every parameter:

```rust
fn greet(name: &str) {
    println!("Hello, {name}!");
}

fn add(a: i32, b: i32) {
    println!("{a} + {b} = {}", a + b);
}

fn main() {
    greet("Alice");
    greet("Bob");
    add(3, 7);
}
```

```text
Hello, Alice!
Hello, Bob!
3 + 7 = 10
```

Unlike `let` bindings where types can be inferred, function parameters always need explicit type annotations. This is a
deliberate design choice -- it makes function signatures self-documenting.

## Return values

Specify the return type with `->` after the parameter list:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    let result = add(3, 7);
    println!("3 + 7 = {result}");
}
```

Notice that `a + b` has **no semicolon** and no `return` keyword. In Rust, the last expression in a function body is
the return value. This is the most common way to return values.

You *can* use `return` for early returns:

```rust
fn absolute(x: i32) -> i32 {
    if x < 0 {
        return -x;
    }
    x
}

fn main() {
    println!("{}", absolute(-5)); // 5
    println!("{}", absolute(3));  // 3
}
```

> **Tip:** Use `return` for early exits from the middle of a function. For the final expression, omit both `return` and
> the semicolon -- this is idiomatic Rust.

## Expressions vs statements

This distinction is fundamental in Rust.

- **Expression** -- evaluates to a value. Examples: `5`, `a + b`, `if x > 0 { x } else { -x }`, a function call
- **Statement** -- performs an action but does **not** produce a value. Examples: `let x = 5;`, a `fn` declaration

```rust
fn main() {
    // This is a statement (let binding) -- it does not produce a value
    let x = 5;

    // This is an expression -- it evaluates to 6
    let y = {
        let inner = x + 1;
        inner // No semicolon -- this is the block's return value
    };

    println!("x = {x}, y = {y}");
}
```

The practical consequence: adding a semicolon to the last line of a block turns the expression into a statement,
and the block returns `()` instead.

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b; // Oops -- semicolon makes this a statement
}
```

```text
error[E0308]: mismatched types
 --> src/main.rs:1:31
  |
1 | fn add(a: i32, b: i32) -> i32 {
  |    ---                     ^^^ expected `i32`, found `()`
  |    |
  |    implicitly returns `()` as its body has no tail expression
2 |     a + b;
  |          - help: remove this semicolon to return this value
```

The compiler even tells you to remove the semicolon. This is one of the most common beginner mistakes, and the fix is
always the same: remove the trailing semicolon on the last expression.

## The unit type ()

Functions that do not return a value return the **unit type** `()`. These two definitions are equivalent:

```rust
fn greet() {
    println!("Hello!");
}

fn greet_explicit() -> () {
    println!("Hello!");
}
```

`()` is Rust's equivalent of `void` in C or Java. You rarely write it explicitly -- it is the default when there is no
`->` return type.

## Multiple return values with tuples

Rust does not have multiple return values, but you can return a tuple:

```rust
fn divide(a: f64, b: f64) -> (f64, f64) {
    let quotient = a / b;
    let remainder = a % b;
    (quotient, remainder)
}

fn main() {
    let (q, r) = divide(17.0, 5.0);
    println!("17 / 5 = {q} remainder {r}");
}
```

Destructuring the tuple at the call site (`let (q, r) = ...`) is the idiomatic way to handle this.

## Functions as values

Functions can be passed around as values, stored in variables, and passed to other functions:

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn apply(f: fn(i32, i32) -> i32, x: i32, y: i32) -> i32 {
    f(x, y)
}

fn main() {
    let result = apply(add, 3, 4);
    println!("{result}"); // 7
}
```

`fn(i32, i32) -> i32` is a **function pointer type**. We will explore closures (anonymous functions) in chapter 13,
which are more flexible.

## Nested functions

You can define functions inside other functions:

```rust
fn main() {
    fn square(x: i32) -> i32 {
        x * x
    }

    println!("{}", square(5)); // 25
}
```

Nested functions cannot access variables from the enclosing scope. For that, you need closures (chapter 13).

## Diverging functions

Some functions never return. Their return type is `!` (the "never" type):

```rust
fn crash() -> ! {
    panic!("This function never returns");
}
```

You will encounter `!` with:

- `panic!()` -- terminates the program
- `std::process::exit()` -- exits the process
- Infinite loops that never break

You do not need to write diverging functions often, but understanding `!` helps when reading error messages.

## Documentation comments

Rust has a built-in documentation system. Use `///` for documentation comments on functions, structs, and other items:

```rust
/// Calculates the area of a rectangle.
///
/// # Arguments
///
/// * `width` - The width of the rectangle
/// * `height` - The height of the rectangle
///
/// # Examples
///
/// ```
/// let area = calculate_area(5.0, 3.0);
/// assert_eq!(area, 15.0);
/// ```
fn calculate_area(width: f64, height: f64) -> f64 {
    width * height
}

fn main() {
    println!("{}", calculate_area(5.0, 3.0));
}
```

Run `cargo doc --open` to generate and view HTML documentation for your project. Documentation comments support
Markdown formatting and the code examples inside `/// ```...` blocks are actually compiled and run as tests when
you run `cargo test` (these are called **doc tests** -- more in chapter 15).

### Module-level documentation

Use `//!` at the top of a file for module-level documentation:

```rust
//! # My Library
//!
//! This module provides utility functions for calculations.

/// Adds two numbers.
fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

## A complete example

Here is a small temperature converter that demonstrates functions, parameters, return values, and expression-based
returns:

```rust
/// Converts Celsius to Fahrenheit.
fn celsius_to_fahrenheit(celsius: f64) -> f64 {
    celsius * 9.0 / 5.0 + 32.0
}

/// Converts Fahrenheit to Celsius.
fn fahrenheit_to_celsius(fahrenheit: f64) -> f64 {
    (fahrenheit - 32.0) * 5.0 / 9.0
}

/// Returns a description of the temperature.
fn describe_temperature(celsius: f64) -> &'static str {
    match celsius as i32 {
        ..=0 => "freezing",
        1..=15 => "cold",
        16..=25 => "comfortable",
        26..=35 => "warm",
        _ => "hot",
    }
}

fn main() {
    let temps_c = [0.0, 20.0, 37.0, 100.0];

    for c in temps_c {
        let f = celsius_to_fahrenheit(c);
        let desc = describe_temperature(c);
        println!("{c:.1}°C = {f:.1}°F ({desc})");
    }

    println!();
    println!("Body temperature: {:.1}°C", fahrenheit_to_celsius(98.6));
}
```

```text
0.0°C = 32.0°F (freezing)
20.0°C = 68.0°F (comfortable)
37.0°C = 98.6°F (hot)
100.0°C = 212.0°F (hot)

Body temperature: 37.0°C
```

## Summary

- Functions are declared with `fn`, use `snake_case`, and require type annotations on parameters
- Return types are specified with `->` after the parameter list
- The last expression (without semicolon) is the return value -- this is idiomatic Rust
- `return` is used for early exits, not for the final value
- Expressions produce values; statements do not
- Adding a semicolon to the last line of a block turns it into a statement (returns `()`)
- Tuples can return multiple values
- `///` documentation comments support Markdown and generate HTML docs with `cargo doc`

Next up: [Ownership & Borrowing](./05-ownership-and-borrowing.md) -- the heart of Rust. This is the chapter that
separates Rust from every other language, and the one most beginners struggle with. We will take it slow with plenty of
diagrams.
