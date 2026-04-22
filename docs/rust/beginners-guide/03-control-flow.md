---
title: "Control Flow"
sidebar_label: "Control Flow"
description: "if/else as expressions, loop, while, for with ranges and iterators, break and continue with labels, early introduction to match, and returning values from blocks."
slug: /rust/beginners-guide/control-flow
tags: [rust, beginners]
keywords:
  - rust if else
  - rust loops
  - rust for loop
  - rust match
  - rust control flow
  - rust expressions
sidebar_position: 3
---

# Control Flow

Control flow determines which code runs and how many times. Rust has the usual suspects - `if`, `while`, `for` - but
with a twist: most control flow constructs are **expressions** that return values. This is one of the things that makes
Rust code concise and elegant.

## if / else

The basics look like most C-family languages:

```rust
fn main() {
    let temperature = 22;

    if temperature > 30 {
        println!("It's hot!");
    } else if temperature > 15 {
        println!("It's nice.");
    } else {
        println!("It's cold.");
    }
}
```

Key differences from other languages:

- **No parentheses** around the condition - `if temperature > 30`, not `if (temperature > 30)`
- The condition **must** be a `bool`. Rust does not treat integers, strings, or other types as truthy/falsy.

This will not compile:

```rust
fn main() {
    let number = 1;
    if number {  // Error: expected bool, found integer
        println!("truthy");
    }
}
```

You must be explicit: `if number != 0 { ... }`.

### if as an expression

In Rust, `if` is an **expression** - it returns a value. This means you can use it on the right side of a `let`
binding:

```rust
fn main() {
    let temperature = 22;

    let description = if temperature > 30 {
        "hot"
    } else if temperature > 15 {
        "nice"
    } else {
        "cold"
    };

    println!("It's {description}.");
}
```

This is like a ternary operator in other languages (`condition ? a : b`), but more readable and scalable.

> **Important:** When using `if` as an expression, both branches must return the **same type**. This will not compile:
>
> ```rust
> let value = if true { 5 } else { "nope" };
> // Error: `if` and `else` have incompatible types
> ```

Also note that the branches do **not** end with a semicolon - the last expression in a block is the return value. We
will explore this more in the next chapter on functions.

## Loops

Rust has three kinds of loops: `loop`, `while`, and `for`.

### loop - infinite loops

`loop` runs forever until you explicitly `break`:

```rust
fn main() {
    let mut count = 0;

    loop {
        count += 1;
        if count == 5 {
            break;
        }
    }

    println!("Counted to {count}");
}
```

#### Returning values from loop

Since `loop` is an expression, you can return a value from it via `break`:

```rust
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;
        }
    };

    println!("Result: {result}"); // Result: 20
}
```

This is a pattern you will see when searching for a value - loop until you find it, then `break` with the result.

### while - conditional loops

`while` loops run as long as a condition is true:

```rust
fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{number}!");
        number -= 1;
    }

    println!("Liftoff!");
}
```

```text
3!
2!
1!
Liftoff!
```

### for - iterating over collections

`for` is the most common loop in Rust. It iterates over anything that implements the `Iterator` trait:

```rust
fn main() {
    let fruits = ["apple", "banana", "cherry"];

    for fruit in fruits {
        println!("I like {fruit}");
    }
}
```

#### Ranges

Use ranges to generate sequences of numbers:

```rust
fn main() {
    // 1 to 5 (inclusive start, exclusive end)
    for i in 1..6 {
        println!("{i}");
    }

    // 1 to 5 (inclusive on both ends)
    for i in 1..=5 {
        println!("{i}");
    }

    // Countdown with rev()
    for i in (1..=5).rev() {
        println!("{i}");
    }
}
```

| Range syntax | Meaning                    | Example         |
|-------------|----------------------------|-----------------|
| `1..6`      | 1, 2, 3, 4, 5             | Exclusive end   |
| `1..=5`     | 1, 2, 3, 4, 5             | Inclusive end    |
| `(1..6).rev()` | 5, 4, 3, 2, 1          | Reversed        |

#### Iterating with index

Use `enumerate()` when you need both the index and the value:

```rust
fn main() {
    let colors = ["red", "green", "blue"];

    for (index, color) in colors.iter().enumerate() {
        println!("{index}: {color}");
    }
}
```

```text
0: red
1: green
2: blue
```

### for vs while - which to use

Prefer `for` over `while` when iterating over a collection. `for` is:

- **Safer** - no risk of off-by-one errors or out-of-bounds access
- **Clearer** - the intent is obvious
- **Faster** - the compiler can eliminate bounds checks

```rust
fn main() {
    let numbers = [10, 20, 30, 40, 50];

    // Prefer this (for)
    for number in numbers {
        println!("{number}");
    }

    // Over this (while with index)
    let mut i = 0;
    while i < numbers.len() {
        println!("{}", numbers[i]);
        i += 1;
    }
}
```

## break and continue

`break` exits a loop. `continue` skips to the next iteration:

```rust
fn main() {
    for i in 1..=10 {
        if i % 3 == 0 {
            continue; // Skip multiples of 3
        }
        if i > 7 {
            break; // Stop at 7
        }
        println!("{i}");
    }
}
```

```text
1
2
4
5
7
```

### Loop labels

When you have nested loops, `break` and `continue` apply to the innermost loop by default. Use labels to target an
outer loop:

```rust
fn main() {
    'outer: for x in 0..5 {
        for y in 0..5 {
            if x + y > 4 {
                continue 'outer; // Skip to the next iteration of the outer loop
            }
            println!("({x}, {y})");
        }
    }
}
```

Labels start with a single quote and a name: `'outer`, `'inner`, `'search`, etc.

## match - a first look

`match` is Rust's version of a switch statement, but much more powerful. We will cover it in depth in chapter 7 -
here is just enough to get started:

```rust
fn main() {
    let number = 3;

    match number {
        1 => println!("one"),
        2 => println!("two"),
        3 => println!("three"),
        _ => println!("something else"),
    }
}
```

Key points:

- Each arm has a **pattern** (`1`, `2`, `3`) and a **body** (the code after `=>`)
- `_` is a **wildcard** that matches anything - like `default` in a switch
- `match` is **exhaustive** - you must cover every possible value. The `_` arm typically handles "everything else"
- `match` is an **expression** - it returns a value

### match as an expression

```rust
fn main() {
    let number = 2;

    let word = match number {
        1 => "one",
        2 => "two",
        3 => "three",
        _ => "other",
    };

    println!("{word}");
}
```

### Matching ranges and multiple values

```rust
fn main() {
    let score = 85;

    let grade = match score {
        90..=100 => "A",
        80..=89 => "B",
        70..=79 => "C",
        60..=69 => "D",
        _ => "F",
    };

    println!("Grade: {grade}");
}
```

```rust
fn main() {
    let day = "Wednesday";

    let kind = match day {
        "Saturday" | "Sunday" => "weekend",
        _ => "weekday",
    };

    println!("{day} is a {kind}");
}
```

`match` becomes incredibly powerful when combined with enums and pattern matching - we will explore this in chapters 6
and 7.

## Blocks as expressions

In Rust, a **block** (`{ ... }`) is an expression. The last expression in a block (without a semicolon) becomes the
block's value:

```rust
fn main() {
    let y = {
        let x = 3;
        x + 1
    };

    println!("y is {y}"); // y is 4
}
```

Notice `x + 1` has **no semicolon**. If you add one, the block returns `()` (the unit type) instead:

```rust
fn main() {
    let y = {
        let x = 3;
        x + 1; // <- semicolon makes this a statement, block returns ()
    };

    println!("y is {y:?}"); // y is ()
}
```

This distinction between **expressions** (produce a value) and **statements** (do not produce a value) is fundamental
to Rust and carries into functions, `if`, `match`, and loops.

> **Tip:** If the compiler tells you "expected `i32`, found `()`", you probably have an extra semicolon on the last
> line of a block.

## Putting it together

Here is a small program that combines everything from this chapter:

```rust
fn main() {
    let target = 42;
    let mut guess = 0;

    let attempts = loop {
        guess += 7;
        if guess >= target {
            break guess / 7;
        }
    };

    let status = if guess == target { "exact" } else { "overshoot" };

    let message = match attempts {
        1..=3 => "Fast!",
        4..=6 => "Not bad.",
        _ => "Took a while.",
    };

    println!("Found {guess} in {attempts} attempts ({status}). {message}");
}
```

## Summary

- `if`/`else` does not need parentheses and is an **expression** (returns a value)
- Conditions must be `bool` - no truthy/falsy
- `loop` runs forever until `break`; can return a value via `break value`
- `while` loops on a condition
- `for` iterates over ranges and collections - prefer it over `while` for iteration
- `break` and `continue` work with loop labels for nested loops
- `match` is an exhaustive, expression-based pattern matcher (much more in chapter 7)
- Blocks are expressions - the last line (without semicolon) is the return value

Next up: [Functions](./04-functions.md) - defining functions, parameters, return types, the difference between
expressions and statements, and documentation comments.
