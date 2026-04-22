---
title: "Variables & Types"
sidebar_label: "Variables & Types"
description: Declaring variables with let, understanding immutability by default, the mut keyword, shadowing, scalar types, compound types, type inference, type annotations, constants, and numeric overflow.
slug: /rust/beginners-guide/variables-and-types
tags: [rust, beginners]
keywords:
  - rust variables
  - rust types
  - rust let
  - rust mut
  - rust shadowing
  - rust integers
sidebar_position: 2
---

# Variables & Types

Every program needs to store data. In Rust, you declare variables with `let`, and they are **immutable by default**.
This chapter covers how Rust handles variables, what types are available, and why immutability is the default.

## Declaring variables with let

```rust
fn main() {
    let x = 5;
    println!("x is {x}");
}
```

`let x = 5;` creates a variable named `x` and binds the value `5` to it. Rust **infers** the type - it figures out
that `5` is an integer (`i32` by default) without you telling it.

## Immutability by default

In most languages, variables are mutable - you can change their value whenever you want. Rust flips this: variables are
**immutable by default**. You have to explicitly opt in to mutability.

Try this:

```rust
fn main() {
    let x = 5;
    x = 10; // This will not compile
    println!("x is {x}");
}
```

The compiler rejects this:

```text
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:3:5
  |
2 |     let x = 5;
  |         - first assignment to `x`
  |         |
  |         help: consider making this binding mutable: `mut x`
3 |     x = 10;
  |     ^^^^^^ cannot assign twice to immutable variable
```

Why does Rust do this? Immutability makes code easier to reason about. If a value cannot change, you never have to worry
about some other part of the code modifying it unexpectedly. When you need a value to change, you say so explicitly with
`mut`.

## Making variables mutable with mut

Add `mut` to opt in to mutability:

```rust
fn main() {
    let mut x = 5;
    println!("x is {x}");
    x = 10;
    println!("x is now {x}");
}
```

```text
x is 5
x is now 10
```

> **Tip:** Only use `mut` when you actually need to change a variable. The compiler (and clippy) will warn you if you
> mark a variable as `mut` but never modify it.

## Shadowing

Rust lets you declare a new variable with the same name as a previous one. This is called **shadowing** - the new
variable "shadows" the old one:

```rust
fn main() {
    let x = 5;
    let x = x + 1;
    let x = x * 2;
    println!("x is {x}"); // x is 12
}
```

Shadowing is **not** the same as `mut`. Each `let x` creates a **new** variable that happens to reuse the name. This
means you can even change the type:

```rust
fn main() {
    let spaces = "   "; // &str (a string slice)
    let spaces = spaces.len(); // usize (an integer)
    println!("{spaces} spaces");
}
```

With `mut`, you cannot change the type - the compiler expects the same type throughout. With shadowing, you create an
entirely new binding.

When to use shadowing vs `mut`:

| Use case                                | Approach         |
|-----------------------------------------|------------------|
| Transform a value and keep the name     | Shadowing        |
| Change the type of a value              | Shadowing        |
| Increment a counter in a loop           | `mut`            |
| Build up a string over multiple steps   | `mut`            |

## Scalar types

Scalar types represent a single value. Rust has four scalar types.

### Integers

Integers are whole numbers. Rust provides signed and unsigned variants in several sizes:

| Size    | Signed  | Unsigned | Range (signed)                            |
|---------|---------|----------|-------------------------------------------|
| 8-bit   | `i8`    | `u8`     | -128 to 127                               |
| 16-bit  | `i16`   | `u16`    | -32,768 to 32,767                         |
| 32-bit  | `i32`   | `u32`    | -2 billion to 2 billion (approx.)         |
| 64-bit  | `i64`   | `u64`    | Very large range                          |
| 128-bit | `i128`  | `u128`   | Extremely large range                     |
| arch    | `isize` | `usize`  | Depends on platform (32-bit or 64-bit)    |

- **Signed** (`i`) - can be negative or positive
- **Unsigned** (`u`) - only zero or positive
- **`i32`** is the default when Rust infers an integer type
- **`usize`** is used for indexing collections (it matches the pointer size of your platform)

```rust
fn main() {
    let age: u8 = 30;           // Explicitly typed as unsigned 8-bit
    let temperature: i32 = -5;  // Explicitly typed as signed 32-bit
    let big: u64 = 1_000_000;   // Underscores for readability
    let default = 42;           // Rust infers i32

    println!("{age}, {temperature}, {big}, {default}");
}
```

> **Tip:** Use underscores in number literals for readability: `1_000_000` is the same as `1000000`.

### Floating-point numbers

Rust has two floating-point types:

| Type  | Size   | Precision       |
|-------|--------|-----------------|
| `f32` | 32-bit | ~7 decimal digits  |
| `f64` | 64-bit | ~15 decimal digits |

`f64` is the default:

```rust
fn main() {
    let pi = 3.14159;        // f64 (default)
    let e: f32 = 2.71828;    // f32 (explicit)

    println!("{pi}, {e}");
}
```

Use `f64` unless you have a specific reason to use `f32` (such as GPU programming or memory constraints).

### Booleans

```rust
fn main() {
    let is_active = true;
    let is_deleted: bool = false;

    println!("{is_active}, {is_deleted}");
}
```

Booleans are one byte in size and have exactly two values: `true` and `false`.

### Characters

The `char` type represents a single Unicode scalar value - not just ASCII:

```rust
fn main() {
    let letter = 'A';
    let emoji = '🦀';
    let kanji = '漢';

    println!("{letter}, {emoji}, {kanji}");
}
```

- `char` literals use **single quotes** (double quotes are for strings)
- A `char` is 4 bytes, representing a Unicode scalar value
- This means `char` can hold any Unicode character, including emojis and CJK characters

## Compound types

Compound types group multiple values into one type.

### Tuples

A tuple groups values of **different types** into a fixed-size collection:

```rust
fn main() {
    let person: (String, u8, bool) = (String::from("Alice"), 30, true);

    // Access elements by index (zero-based)
    println!("Name: {}", person.0);
    println!("Age: {}", person.1);
    println!("Active: {}", person.2);

    // Destructuring
    let (name, age, active) = person;
    println!("{name} is {age}, active: {active}");
}
```

Tuples have a fixed length - once declared, they cannot grow or shrink.

The **unit tuple** `()` is a special case. It represents "no value" and is the default return type of functions that do
not return anything (similar to `void` in Java or C).

### Arrays

Arrays hold multiple values of the **same type** with a **fixed length**:

```rust
fn main() {
    let numbers: [i32; 5] = [1, 2, 3, 4, 5];
    let zeros = [0; 10]; // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    println!("First: {}", numbers[0]);
    println!("Length: {}", numbers.len());
    println!("Zeros: {:?}", zeros);
}
```

- `[i32; 5]` means "an array of 5 `i32` values"
- `[0; 10]` creates an array of 10 zeros
- Arrays are **stack-allocated** and have a fixed size known at compile time
- For a dynamically-sized collection, use `Vec<T>` (covered in chapter 8)

> **Important:** Rust checks array bounds at runtime. Accessing an index out of bounds causes a **panic** (a controlled
> crash) rather than silently reading garbage memory like C would.

```rust
fn main() {
    let numbers = [1, 2, 3];
    println!("{}", numbers[5]); // Panics: index out of bounds
}
```

## Type inference

Rust's type inference is powerful. In most cases, you do not need to write type annotations - the compiler figures it
out:

```rust
fn main() {
    let x = 5;            // i32
    let y = 3.14;         // f64
    let active = true;    // bool
    let name = "Rust";    // &str
    let numbers = [1, 2]; // [i32; 2]
}
```

When the compiler cannot infer the type (usually with generics or ambiguous situations), it will ask you to add an
annotation:

```rust
fn main() {
    // The compiler does not know which numeric type you want here
    let guess: u32 = "42".parse().expect("Not a number");
    println!("{guess}");
}
```

Without the `: u32` annotation, the compiler would say:

```text
error[E0284]: type annotations needed
```

> **Tip:** Let the compiler infer types where it can. Add annotations when it asks, or when the annotation improves
> readability.

## Type annotations

You can always add a type annotation after the variable name with a colon:

```rust
fn main() {
    let count: i32 = 0;
    let ratio: f64 = 0.5;
    let flag: bool = true;
    let initial: char = 'R';

    println!("{count}, {ratio}, {flag}, {initial}");
}
```

This is useful for:
- Clarifying intent when the default inference is not what you want
- Specifying a type when parsing or converting values
- Improving readability for complex expressions

## Constants

Constants are values that are bound to a name and **never** change. Unlike `let` bindings, constants:

- Must have a type annotation
- Must be set to a constant expression (computable at compile time)
- Are conventionally written in `SCREAMING_SNAKE_CASE`
- Can be declared in any scope, including the global scope

```rust
const MAX_POINTS: u32 = 100_000;
const PI: f64 = 3.14159265358979;

fn main() {
    println!("Max points: {MAX_POINTS}");
    println!("Pi: {PI}");
}
```

| Feature          | `let` binding           | `const`                         |
|------------------|-------------------------|---------------------------------|
| Mutability       | Immutable by default, `mut` available | Always immutable        |
| Type annotation  | Optional (inferred)     | Required                        |
| Scope            | Inside functions        | Any scope, including global     |
| Value            | Runtime or compile-time | Must be compile-time evaluable  |
| Shadowing        | Allowed                 | Not allowed                     |

Use `const` for values that are truly constant across your entire program (configuration limits, mathematical constants,
fixed strings). Use `let` for everything else.

## Numeric operations

Rust supports the standard arithmetic operations:

```rust
fn main() {
    let sum = 5 + 10;
    let difference = 95.5 - 4.3;
    let product = 4 * 30;
    let quotient = 56.7 / 32.2;
    let remainder = 43 % 5;

    println!("{sum}, {difference}, {product}, {quotient}, {remainder}");
}
```

> **Important:** Rust does not implicitly convert between numeric types. This will not compile:
>
> ```rust
> let x: i32 = 5;
> let y: f64 = x; // Error: expected f64, found i32
> ```
>
> You must convert explicitly: `let y: f64 = x as f64;`

## Numeric overflow

What happens when a `u8` (max value 255) is set to 256?

- In **debug mode** (`cargo run`), Rust panics at runtime - catching the bug immediately.
- In **release mode** (`cargo run --release`), Rust wraps around (256 becomes 0) - for performance.

If you need specific overflow behavior, use the explicit methods:

```rust
fn main() {
    let x: u8 = 255;

    // These methods make your intent clear
    let wrapped = x.wrapping_add(1);     // 0
    let checked = x.checked_add(1);       // None (safely detected overflow)
    let saturated = x.saturating_add(1);  // 255 (stays at max)

    println!("wrapped: {wrapped}");
    println!("checked: {checked:?}");
    println!("saturated: {saturated}");
}
```

## Summary

You now know:

- Variables are declared with `let` and are **immutable by default**
- Use `mut` to opt in to mutability
- **Shadowing** creates a new variable with the same name (can change type)
- **Scalar types**: integers (`i32`, `u8`, etc.), floats (`f64`, `f32`), `bool`, `char`
- **Compound types**: tuples (mixed types, fixed size), arrays (same type, fixed size)
- Rust infers types but you can add explicit annotations
- `const` is for compile-time constants with required type annotations
- Rust does not implicitly convert between numeric types
- Integer overflow is caught in debug mode and wraps in release mode

Next up: [Control Flow](./03-control-flow.md) - `if`/`else` as expressions, loops, `for` with ranges, and an early
look at `match`.
