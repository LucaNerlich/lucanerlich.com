---
title: "Error Handling"
sidebar_label: "Error Handling"
description: "panic! vs recoverable errors, Result in depth, the ? operator, unwrap and expect, custom error types, the From trait for error conversion, the thiserror crate, and when to panic vs return a Result."
slug: /rust/beginners-guide/error-handling
tags: [rust, beginners]
keywords:
  - rust error handling
  - rust Result
  - rust question mark operator
  - rust panic
  - rust thiserror
  - rust custom errors
sidebar_position: 9
---

# Error Handling

Rust does not have exceptions. Instead, it splits errors into two categories: **unrecoverable** errors (the program
must stop) and **recoverable** errors (the caller can handle the problem). This chapter shows you how to handle both.

## Unrecoverable errors with panic!

`panic!` crashes the program immediately with an error message:

```rust
fn main() {
    panic!("Something went terribly wrong");
}
```

```text
thread 'main' panicked at 'Something went terribly wrong', src/main.rs:2:5
```

You also get panics from:
- Array out-of-bounds access: `numbers[100]`
- Integer overflow in debug mode
- Calling `.unwrap()` on a `None` or `Err`

`panic!` is for bugs - situations that should never happen if the code is correct. It is **not** for expected
failures like "file not found" or "invalid user input".

### Backtraces

Set the environment variable `RUST_BACKTRACE=1` to see a full stack trace on panic:

```bash
RUST_BACKTRACE=1 cargo run
```

This is invaluable for debugging.

## Recoverable errors with Result

For errors the caller can handle, use `Result<T, E>`:

```rust
use std::fs;

fn main() {
    let content = fs::read_to_string("config.txt");

    match content {
        Ok(text) => println!("Config: {text}"),
        Err(error) => println!("Could not read config: {error}"),
    }
}
```

`fs::read_to_string` returns `Result<String, std::io::Error>`. It is either `Ok(content)` or `Err(error)`.

### Handling different error kinds

```rust
use std::fs;
use std::io::ErrorKind;

fn main() {
    match fs::read_to_string("config.txt") {
        Ok(text) => println!("{text}"),
        Err(error) => match error.kind() {
            ErrorKind::NotFound => println!("File not found -- using defaults"),
            ErrorKind::PermissionDenied => println!("No permission to read file"),
            other => println!("Unexpected error: {other:?}"),
        },
    }
}
```

## unwrap and expect

For quick prototyping or when you are certain the operation will succeed:

```rust
fn main() {
    // unwrap -- get the value or panic
    let number: i32 = "42".parse().unwrap();

    // expect -- same as unwrap but with a custom panic message
    let port: u16 = "8080".parse().expect("PORT must be a valid number");

    println!("{number}, {port}");
}
```

| Method      | On Ok/Some | On Err/None                    |
|-------------|-----------|--------------------------------|
| `unwrap()`  | Returns T | Panics with generic message    |
| `expect(m)` | Returns T | Panics with custom message `m` |

> **Warning:** Do not use `unwrap()` in production code unless you have proven the `Err` case is impossible. Use
> `expect()` at minimum - the custom message helps with debugging.

## The ? operator

The `?` operator is Rust's ergonomic way to propagate errors. It replaces verbose `match` chains:

### Without ?

```rust
use std::fs;
use std::io;

fn read_username() -> Result<String, io::Error> {
    let content = match fs::read_to_string("username.txt") {
        Ok(c) => c,
        Err(e) => return Err(e),
    };
    Ok(content.trim().to_string())
}

fn main() {
    match read_username() {
        Ok(name) => println!("Hello, {name}"),
        Err(e) => println!("Error: {e}"),
    }
}
```

### With ?

```rust
use std::fs;
use std::io;

fn read_username() -> Result<String, io::Error> {
    let content = fs::read_to_string("username.txt")?;
    Ok(content.trim().to_string())
}

fn main() {
    match read_username() {
        Ok(name) => println!("Hello, {name}"),
        Err(e) => println!("Error: {e}"),
    }
}
```

`?` does exactly what the `match` version does: if the result is `Ok`, extract the value. If it is `Err`, return the
error from the current function immediately.

### Chaining ?

You can chain multiple `?` operations:

```rust
use std::fs;
use std::io;

fn read_first_line(path: &str) -> Result<String, io::Error> {
    let content = fs::read_to_string(path)?;
    let first_line = content.lines().next().unwrap_or("").to_string();
    Ok(first_line)
}

fn main() {
    match read_first_line("data.txt") {
        Ok(line) => println!("First line: {line}"),
        Err(e) => println!("Error: {e}"),
    }
}
```

### ? in main

You can use `?` in `main` by changing its return type:

```rust
use std::fs;
use std::io;

fn main() -> Result<(), io::Error> {
    let content = fs::read_to_string("config.txt")?;
    println!("{content}");
    Ok(())
}
```

If the program exits with an `Err`, Rust prints the error message and exits with a non-zero code.

### ? with Option

The `?` operator also works with `Option<T>`:

```rust
fn first_even(numbers: &[i32]) -> Option<i32> {
    let first = numbers.first()?; // Returns None if empty
    if first % 2 == 0 {
        Some(*first)
    } else {
        None
    }
}

fn main() {
    println!("{:?}", first_even(&[2, 4, 6]));  // Some(2)
    println!("{:?}", first_even(&[1, 3, 5]));  // None
    println!("{:?}", first_even(&[]));          // None
}
```

> **Important:** You cannot mix `?` on `Result` and `Option` in the same function. The function must return either
> `Result` or `Option`.

## Custom error types

For libraries and larger applications, define your own error types:

### Simple approach - enum

```rust
use std::fmt;
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    NotFound(String),
    ParseError(ParseIntError),
    InvalidInput(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound(name) => write!(f, "Not found: {name}"),
            AppError::ParseError(e) => write!(f, "Parse error: {e}"),
            AppError::InvalidInput(msg) => write!(f, "Invalid input: {msg}"),
        }
    }
}
```

### Converting between error types with From

The `?` operator automatically converts errors using the `From` trait. Implement `From` to enable this:

```rust
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    NotFound(String),
    ParseError(ParseIntError),
    InvalidInput(String),
}

impl From<ParseIntError> for AppError {
    fn from(error: ParseIntError) -> Self {
        AppError::ParseError(error)
    }
}

fn parse_age(input: &str) -> Result<u32, AppError> {
    let age: u32 = input.parse()?; // ParseIntError automatically converts to AppError
    if age > 150 {
        return Err(AppError::InvalidInput("Age too high".to_string()));
    }
    Ok(age)
}
```

### The thiserror crate

Writing `Display` and `From` implementations by hand is tedious. The `thiserror` crate automates it:

```toml
[dependencies]
thiserror = "2"
```

```rust
use thiserror::Error;

#[derive(Debug, Error)]
enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Parse error: {0}")]
    ParseError(#[from] std::num::ParseIntError),

    #[error("IO error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

fn load_config(path: &str) -> Result<i32, AppError> {
    let content = std::fs::read_to_string(path)?; // io::Error → AppError
    let value: i32 = content.trim().parse()?;      // ParseIntError → AppError
    Ok(value)
}

fn main() {
    match load_config("config.txt") {
        Ok(val) => println!("Config value: {val}"),
        Err(e) => println!("Error: {e}"),
    }
}
```

`#[from]` auto-generates the `From` implementation. `#[error("...")]` auto-generates `Display`. This is the
recommended approach for applications and libraries.

### The anyhow crate

For applications (not libraries), the `anyhow` crate provides a catch-all error type:

```toml
[dependencies]
anyhow = "1"
```

```rust
use anyhow::{Context, Result};

fn load_config(path: &str) -> Result<i32> {
    let content = std::fs::read_to_string(path)
        .context("Failed to read config file")?;
    let value: i32 = content.trim().parse()
        .context("Config value must be an integer")?;
    Ok(value)
}

fn main() -> Result<()> {
    let config = load_config("config.txt")?;
    println!("Config: {config}");
    Ok(())
}
```

| Crate       | Use case     | Error type      | Notes                         |
|-------------|-------------|-----------------|-------------------------------|
| `thiserror` | Libraries   | Custom enums    | Structured, pattern-matchable |
| `anyhow`    | Applications| `anyhow::Error` | Easy, any error, context()    |

Use `thiserror` when callers need to match on specific error variants. Use `anyhow` when you just want to propagate
errors with context messages.

## When to panic vs return Result

| Situation                               | Use                   |
|-----------------------------------------|-----------------------|
| Bug in your code (should never happen)  | `panic!`              |
| Invalid hardcoded value                 | `panic!` / `unreachable!` |
| Prototype / example code                | `unwrap()` / `expect()` |
| User input validation                   | `Result`              |
| File I/O                                | `Result`              |
| Network operations                      | `Result`              |
| Parsing external data                   | `Result`              |
| Library functions                       | `Result` (almost always) |

The rule of thumb: if the caller could reasonably recover from the error, return `Result`. If it indicates a
programming mistake, `panic!` is appropriate.

## Common Result methods

```rust
fn main() {
    let ok: Result<i32, String> = Ok(42);
    let err: Result<i32, String> = Err(String::from("oops"));

    // map -- transform the Ok value
    let doubled = ok.map(|n| n * 2); // Ok(84)

    // map_err -- transform the Err value
    let prefixed = err.map_err(|e| format!("Error: {e}")); // Err("Error: oops")

    // unwrap_or -- default on error
    let value = err.unwrap_or(0); // 0

    // unwrap_or_else -- default with closure
    let value2 = err.unwrap_or_else(|_| 99); // 99

    // and_then -- chain Result-returning operations
    let parsed: Result<i32, String> = Ok(String::from("42"))
        .and_then(|s| s.parse::<i32>().map_err(|e| e.to_string()));

    // is_ok / is_err
    println!("ok is ok: {}", ok.is_ok());     // true
    println!("err is err: {}", err.is_err()); // true

    println!("{doubled:?}, {prefixed:?}, {value}, {value2}, {parsed:?}");
}
```

## Summary

- **`panic!`** is for unrecoverable errors (bugs). It crashes the program.
- **`Result<T, E>`** is for recoverable errors. Functions return `Ok(value)` or `Err(error)`.
- **`?`** propagates errors concisely - it returns `Err` early or extracts the `Ok` value.
- **`unwrap()`** and **`expect()`** extract values but panic on errors - avoid in production.
- Custom error enums with `Display` and `From` give structured, typed error handling.
- **`thiserror`** automates custom error boilerplate (best for libraries).
- **`anyhow`** provides a universal error type with context (best for applications).
- Panic for bugs; return `Result` for expected failures.

Next up: [Modules & Crates](./10-modules-and-crates.md) - organizing code into modules, using external crates, and
understanding Cargo's dependency system.
