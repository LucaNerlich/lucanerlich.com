---
title: "Pattern Matching"
sidebar_label: "Pattern Matching"
description: "match exhaustiveness, destructuring structs and enums, if let, while let, the matches! macro, match guards, the wildcard pattern, nested patterns, and matching on Option and Result."
slug: /rust/beginners-guide/pattern-matching
tags: [rust, beginners]
keywords:
  - rust pattern matching
  - rust match
  - rust if let
  - rust destructuring
  - rust match guard
  - rust while let
sidebar_position: 7
---

# Pattern Matching

Pattern matching is one of Rust's most powerful features. You got a taste of `match` in chapters 3 and 6 - now we go
deep. By the end of this chapter, you will use pattern matching fluently to destructure data, handle variants, and write
expressive conditional logic.

## match is exhaustive

The `match` expression must cover **every possible value** of the type being matched. The compiler enforces this:

```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn action(light: &TrafficLight) -> &str {
    match light {
        TrafficLight::Red => "stop",
        TrafficLight::Yellow => "caution",
        TrafficLight::Green => "go",
    }
}

fn main() {
    let light = TrafficLight::Green;
    println!("{}", action(&light));
}
```

If you remove one arm, the compiler rejects it:

```text
error[E0004]: non-exhaustive patterns: `TrafficLight::Green` not covered
```

This is a safety feature - you can never forget to handle a case. If you add a new variant to an enum, the compiler
tells you every `match` that needs updating.

## The wildcard pattern _

When you do not want to list every case, use `_` as a catch-all:

```rust
fn describe_number(n: i32) -> &'static str {
    match n {
        0 => "zero",
        1 => "one",
        2 => "two",
        _ => "many",
    }
}

fn main() {
    println!("{}", describe_number(0));   // zero
    println!("{}", describe_number(42));  // many
}
```

`_` matches anything and is used as the last arm. If you want to bind the value without using it, prefix with `_`:

```rust
fn main() {
    let pair = (1, 2);

    match pair {
        (0, _) => println!("First is zero"),
        (_, 0) => println!("Second is zero"),
        _ => println!("Neither is zero"),
    }
}
```

## Destructuring

Patterns can pull apart (destructure) structs, enums, tuples, and references.

### Destructuring tuples

```rust
fn main() {
    let point = (3, -7);

    match point {
        (0, 0) => println!("Origin"),
        (x, 0) => println!("On x-axis at {x}"),
        (0, y) => println!("On y-axis at {y}"),
        (x, y) => println!("Point at ({x}, {y})"),
    }
}
```

### Destructuring structs

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let point = Point { x: 5, y: -3 };

    match point {
        Point { x: 0, y: 0 } => println!("Origin"),
        Point { x, y: 0 } => println!("On x-axis at {x}"),
        Point { x: 0, y } => println!("On y-axis at {y}"),
        Point { x, y } => println!("({x}, {y})"),
    }
}
```

You can also destructure with `let`:

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let point = Point { x: 10, y: 20 };
    let Point { x, y } = point;
    println!("x = {x}, y = {y}");
}
```

### Destructuring enums

This is where pattern matching truly shines:

```rust
#[derive(Debug)]
enum Message {
    Quit,
    Echo(String),
    Move { x: i32, y: i32 },
    Color(u8, u8, u8),
}

fn process(msg: &Message) {
    match msg {
        Message::Quit => println!("Quitting"),
        Message::Echo(text) => println!("Echo: {text}"),
        Message::Move { x, y } => println!("Moving to ({x}, {y})"),
        Message::Color(r, g, b) => println!("Color: rgb({r}, {g}, {b})"),
    }
}

fn main() {
    let messages = [
        Message::Echo(String::from("hello")),
        Message::Move { x: 10, y: 20 },
        Message::Color(255, 128, 0),
        Message::Quit,
    ];

    for msg in &messages {
        process(msg);
    }
}
```

### Nested destructuring

Patterns can be nested arbitrarily deep:

```rust
struct Point {
    x: i32,
    y: i32,
}

enum Shape {
    Circle { center: Point, radius: f64 },
    Rect { top_left: Point, bottom_right: Point },
}

fn describe(shape: &Shape) {
    match shape {
        Shape::Circle {
            center: Point { x, y },
            radius,
        } => println!("Circle at ({x}, {y}) with radius {radius}"),
        Shape::Rect {
            top_left: Point { x: x1, y: y1 },
            bottom_right: Point { x: x2, y: y2 },
        } => println!("Rectangle from ({x1}, {y1}) to ({x2}, {y2})"),
    }
}

fn main() {
    let shape = Shape::Circle {
        center: Point { x: 0, y: 0 },
        radius: 5.0,
    };
    describe(&shape);
}
```

## Multiple patterns with |

Use `|` (or) to match any of several patterns:

```rust
fn main() {
    let number = 4;

    match number {
        1 | 2 => println!("one or two"),
        3 | 4 => println!("three or four"),
        _ => println!("something else"),
    }
}
```

## Match guards

Add an `if` condition to a match arm for extra filtering:

```rust
fn main() {
    let number = 4;

    match number {
        n if n < 0 => println!("{n} is negative"),
        n if n == 0 => println!("zero"),
        n if n % 2 == 0 => println!("{n} is positive and even"),
        n => println!("{n} is positive and odd"),
    }
}
```

Guards are checked **after** the pattern matches. They do not count as exhaustive coverage, so you usually still need a
catch-all arm.

## Binding with @

The `@` operator lets you bind a value to a name while also testing it against a pattern:

```rust
fn main() {
    let age = 25;

    match age {
        n @ 0..=12 => println!("{n} -- child"),
        n @ 13..=17 => println!("{n} -- teenager"),
        n @ 18..=64 => println!("{n} -- adult"),
        n @ 65.. => println!("{n} -- senior"),
        _ => unreachable!(),
    }
}
```

Without `@`, you would have to use a guard: `18..=64 if true => ...` and then you would not have the value bound.

## if let - matching a single pattern

When you only care about **one** variant and want to ignore the rest, `if let` is more concise than `match`:

```rust
fn main() {
    let maybe_number: Option<i32> = Some(42);

    // With match
    match maybe_number {
        Some(n) => println!("Got {n}"),
        None => {} // Do nothing
    }

    // Equivalent with if let
    if let Some(n) = maybe_number {
        println!("Got {n}");
    }
}
```

`if let` is syntactic sugar for a `match` with one arm and a wildcard for everything else. You can add an `else`:

```rust
fn main() {
    let config_value: Option<&str> = None;

    if let Some(val) = config_value {
        println!("Config: {val}");
    } else {
        println!("Using default config");
    }
}
```

Use `if let` when:
- You only care about one variant
- A full `match` would have an empty `_ => {}` arm
- The code is more readable without listing every case

Use `match` when:
- You need to handle multiple variants
- You want the compiler to enforce exhaustiveness

## while let - looping on a pattern

`while let` loops as long as a pattern matches:

```rust
fn main() {
    let mut stack = vec![1, 2, 3, 4, 5];

    while let Some(top) = stack.pop() {
        println!("{top}");
    }
    // Prints: 5, 4, 3, 2, 1
}
```

`Vec::pop()` returns `Option<T>` - `Some(value)` when there are elements, `None` when empty. The `while let` keeps
going until `pop()` returns `None`.

## let else - early exit on pattern failure

`let else` (stabilized in Rust 1.65) lets you bind a pattern or diverge:

```rust
fn process_name(name: Option<&str>) {
    let Some(name) = name else {
        println!("No name provided");
        return;
    };

    println!("Processing: {name}");
}

fn main() {
    process_name(Some("Alice"));
    process_name(None);
}
```

The `else` branch must diverge - it must `return`, `break`, `continue`, or `panic!`. This is great for reducing
nesting when you want to "unwrap or bail out early".

## The matches! macro

The `matches!` macro returns `true` if a value matches a pattern:

```rust
#[derive(Debug)]
enum Status {
    Active,
    Inactive,
    Banned,
}

fn main() {
    let status = Status::Active;

    let is_active = matches!(status, Status::Active);
    let is_restricted = matches!(status, Status::Inactive | Status::Banned);

    println!("Active: {is_active}");
    println!("Restricted: {is_restricted}");
}
```

This is a concise alternative to writing a `match` that returns `true` or `false`.

## Matching on Option and Result

Since `Option` and `Result` are enums, pattern matching works naturally:

### Option patterns

```rust
fn describe_option(opt: Option<i32>) {
    match opt {
        Some(0) => println!("Zero"),
        Some(n) if n > 0 => println!("Positive: {n}"),
        Some(n) => println!("Negative: {n}"),
        None => println!("Nothing"),
    }
}

fn main() {
    describe_option(Some(42));
    describe_option(Some(-3));
    describe_option(Some(0));
    describe_option(None);
}
```

### Result patterns

```rust
fn parse_and_double(input: &str) -> Result<i32, String> {
    match input.parse::<i32>() {
        Ok(n) => Ok(n * 2),
        Err(e) => Err(format!("Failed to parse '{input}': {e}")),
    }
}

fn main() {
    match parse_and_double("21") {
        Ok(n) => println!("Result: {n}"),
        Err(e) => println!("Error: {e}"),
    }

    match parse_and_double("abc") {
        Ok(n) => println!("Result: {n}"),
        Err(e) => println!("Error: {e}"),
    }
}
```

## Patterns in function parameters

Function parameters can be patterns too:

```rust
fn print_coordinates(&(x, y): &(i32, i32)) {
    println!("({x}, {y})");
}

fn main() {
    let point = (3, 5);
    print_coordinates(&point);
}
```

## A complete example

Here is a small command processor that demonstrates many pattern matching techniques:

```rust
#[derive(Debug)]
enum Command {
    Set { key: String, value: String },
    Get(String),
    Delete(String),
    List,
    Exit,
}

fn execute(cmd: &Command) {
    match cmd {
        Command::Set { key, value } => {
            println!("SET {key} = {value}");
        }
        Command::Get(key) | Command::Delete(key) => {
            let action = if matches!(cmd, Command::Get(_)) {
                "GET"
            } else {
                "DELETE"
            };
            println!("{action} {key}");
        }
        Command::List => println!("LIST all keys"),
        Command::Exit => println!("Goodbye!"),
    }
}

fn main() {
    let commands = [
        Command::Set {
            key: String::from("name"),
            value: String::from("Alice"),
        },
        Command::Get(String::from("name")),
        Command::List,
        Command::Delete(String::from("name")),
        Command::Exit,
    ];

    for cmd in &commands {
        execute(cmd);
    }
}
```

## Summary

- `match` is **exhaustive** - you must cover every possible value
- `_` is the wildcard that matches anything
- Destructure tuples, structs, enums, and nested types in patterns
- `|` matches multiple patterns; match guards add `if` conditions
- `@` binds a value while testing against a pattern
- `if let` is concise for single-pattern matching
- `while let` loops until a pattern no longer matches
- `let else` binds a pattern or diverges (early exit)
- `matches!` returns a boolean for quick pattern checks
- Patterns work in `match`, `if let`, `while let`, `let`, function parameters, and `for` loops

Next up: [Collections](./08-collections.md) - `Vec<T>`, `String`, and `HashMap<K, V>` - the standard library's
most-used data structures.
