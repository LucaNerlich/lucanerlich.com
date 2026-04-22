---
title: "Traits & Generics"
sidebar_label: "Traits & Generics"
description: "Defining traits, implementing traits for types, default methods, generic functions and structs, trait bounds, where clauses, standard library traits, derive macros, and trait objects."
slug: /rust/beginners-guide/traits-and-generics
tags: [rust, beginners]
keywords:
  - rust traits
  - rust generics
  - rust trait bounds
  - rust derive
  - rust Display
  - rust Debug
sidebar_position: 11
---

# Traits & Generics

Traits define **shared behavior**. Generics let you write code that works with **many types**. Together, they are the
foundation of Rust's type system and the key to writing reusable, flexible code.

## Defining a trait

A trait is a collection of methods that a type can implement:

```rust
trait Summary {
    fn summarize(&self) -> String;
}
```

This says: "Any type that implements `Summary` must have a `summarize` method that takes `&self` and returns a
`String`."

## Implementing a trait

```rust
trait Summary {
    fn summarize(&self) -> String;
}

struct Article {
    title: String,
    author: String,
    content: String,
}

struct Tweet {
    username: String,
    text: String,
}

impl Summary for Article {
    fn summarize(&self) -> String {
        format!("{} by {} -- {}", self.title, self.author, &self.content[..50])
    }
}

impl Summary for Tweet {
    fn summarize(&self) -> String {
        format!("@{}: {}", self.username, self.text)
    }
}

fn main() {
    let article = Article {
        title: String::from("Rust is Great"),
        author: String::from("Alice"),
        content: String::from("Rust provides memory safety without garbage collection and more features"),
    };

    let tweet = Tweet {
        username: String::from("rustlang"),
        text: String::from("Rust 1.84 is out!"),
    };

    println!("{}", article.summarize());
    println!("{}", tweet.summarize());
}
```

Different types, same interface. This is polymorphism without inheritance.

## Default methods

Traits can provide default implementations:

```rust
trait Summary {
    fn summarize_author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.summarize_author())
    }
}

struct Tweet {
    username: String,
    text: String,
}

impl Summary for Tweet {
    fn summarize_author(&self) -> String {
        format!("@{}", self.username)
    }
    // summarize() uses the default implementation
}

fn main() {
    let tweet = Tweet {
        username: String::from("rustlang"),
        text: String::from("Hello!"),
    };
    println!("{}", tweet.summarize()); // (Read more from @rustlang...)
}
```

Types can override default methods or rely on them.

## Traits as parameters

Use traits to accept any type that implements a behavior:

```rust
trait Summary {
    fn summarize(&self) -> String;
}

fn notify(item: &impl Summary) {
    println!("Breaking news: {}", item.summarize());
}
```

`&impl Summary` means "any reference to a type that implements `Summary`". This is syntactic sugar for a **trait
bound** (see below).

## Generics

Generics let you write functions and types that work with any type:

### Generic functions

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in &list[1..] {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("Largest number: {}", largest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("Largest char: {}", largest(&chars));
}
```

`<T: PartialOrd>` means "T can be any type that supports comparison". Without this bound, the compiler would reject
`item > largest` because not all types can be compared.

### Generic structs

```rust
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Self {
        Self { x, y }
    }
}

impl Point<f64> {
    fn distance_from_origin(&self) -> f64 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}

fn main() {
    let int_point = Point::new(5, 10);
    let float_point = Point::new(1.0, 4.0);

    println!("{:?}", int_point);
    println!("{:?}", float_point);
    println!("Distance: {:.2}", float_point.distance_from_origin());

    // int_point.distance_from_origin(); // Error: only defined for Point<f64>
}
```

You can implement methods for **all** `Point<T>` or only for specific types like `Point<f64>`.

### Multiple generic types

```rust
#[derive(Debug)]
struct Pair<A, B> {
    first: A,
    second: B,
}

fn main() {
    let pair = Pair {
        first: "hello",
        second: 42,
    };
    println!("{:?}", pair);
}
```

## Trait bounds

Trait bounds constrain what types a generic can accept. There are several ways to write them:

### impl Trait syntax (simple)

```rust
fn print_summary(item: &impl std::fmt::Display) {
    println!("{item}");
}
```

### Trait bound syntax (explicit)

```rust
fn print_summary<T: std::fmt::Display>(item: &T) {
    println!("{item}");
}
```

### Multiple bounds with +

```rust
use std::fmt;

fn print_and_debug<T: fmt::Display + fmt::Debug>(item: &T) {
    println!("Display: {item}");
    println!("Debug: {item:?}");
}
```

### where clauses (complex bounds)

When bounds get long, use `where`:

```rust
use std::fmt;

fn process<T, U>(t: &T, u: &U) -> String
where
    T: fmt::Display + Clone,
    U: fmt::Debug + Default,
{
    format!("{t} and {u:?}")
}
```

`where` clauses are equivalent to inline bounds but more readable for complex signatures.

## Standard library traits

These traits come up constantly. Understanding them is essential.

### Debug - debug printing

```rust
#[derive(Debug)]
struct Config {
    host: String,
    port: u16,
}

fn main() {
    let config = Config {
        host: String::from("localhost"),
        port: 8080,
    };
    println!("{:?}", config);  // Config { host: "localhost", port: 8080 }
    println!("{:#?}", config); // Pretty-printed
}
```

### Display - user-facing printing

```rust
use std::fmt;

struct Config {
    host: String,
    port: u16,
}

impl fmt::Display for Config {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}:{}", self.host, self.port)
    }
}

fn main() {
    let config = Config {
        host: String::from("localhost"),
        port: 8080,
    };
    println!("{config}"); // localhost:8080
}
```

`Display` is what `{}` uses; `Debug` is what `{:?}` uses. `Display` must be implemented manually; `Debug` can be
derived.

### Clone and Copy

```rust
#[derive(Debug, Clone)]
struct Config {
    host: String,
    port: u16,
}

fn main() {
    let a = Config {
        host: String::from("localhost"),
        port: 8080,
    };
    let b = a.clone(); // Deep copy

    println!("{:?}", a); // Still valid
    println!("{:?}", b);
}
```

- `Clone` - explicit deep copy via `.clone()`
- `Copy` - implicit bitwise copy for stack-only types (requires `Clone`)

### PartialEq and Eq

```rust
#[derive(Debug, PartialEq)]
struct Point {
    x: f64,
    y: f64,
}

fn main() {
    let a = Point { x: 1.0, y: 2.0 };
    let b = Point { x: 1.0, y: 2.0 };
    let c = Point { x: 3.0, y: 4.0 };

    println!("{}", a == b); // true
    println!("{}", a == c); // false
}
```

### Default

```rust
#[derive(Debug, Default)]
struct Config {
    host: String,
    port: u16,
    verbose: bool,
}

fn main() {
    let config = Config::default();
    println!("{:?}", config); // Config { host: "", port: 0, verbose: false }

    let custom = Config {
        port: 3000,
        ..Config::default()
    };
    println!("{:?}", custom);
}
```

### Summary of common derivable traits

| Trait         | What it enables            | Derive? |
|--------------|----------------------------|---------|
| `Debug`      | `{:?}` formatting          | Yes     |
| `Clone`      | `.clone()` deep copy       | Yes     |
| `Copy`       | Implicit copy (stack types)| Yes (requires Clone) |
| `PartialEq`  | `==` and `!=`              | Yes     |
| `Eq`         | Full equality (requires PartialEq) | Yes |
| `PartialOrd` | `<`, `>`, `<=`, `>=`       | Yes     |
| `Ord`        | Total ordering             | Yes (requires PartialOrd + Eq) |
| `Hash`       | Hashing (for HashMap keys) | Yes     |
| `Default`    | `Default::default()`       | Yes     |

## Returning impl Trait

You can return a trait without naming the concrete type:

```rust
fn make_greeting(formal: bool) -> impl std::fmt::Display {
    if formal {
        String::from("Good day, esteemed colleague.")
    } else {
        String::from("Hey!")
    }
}

fn main() {
    println!("{}", make_greeting(true));
    println!("{}", make_greeting(false));
}
```

> **Note:** `impl Trait` in return position means "I return one specific type that implements this trait." Both branches
> must return the **same** concrete type. For returning different types, you need trait objects.

## Trait objects with dyn

When you need to store or return **different types** that share a trait, use **trait objects**:

```rust
trait Animal {
    fn speak(&self) -> &str;
}

struct Dog;
struct Cat;

impl Animal for Dog {
    fn speak(&self) -> &str {
        "Woof!"
    }
}

impl Animal for Cat {
    fn speak(&self) -> &str {
        "Meow!"
    }
}

fn main() {
    let animals: Vec<Box<dyn Animal>> = vec![Box::new(Dog), Box::new(Cat)];

    for animal in &animals {
        println!("{}", animal.speak());
    }
}
```

`Box<dyn Animal>` is a **trait object** - a pointer to any type that implements `Animal`. The actual type is determined
at runtime (dynamic dispatch) rather than compile time (static dispatch).

| Approach           | Syntax              | Dispatch   | Flexibility           |
|-------------------|---------------------|------------|----------------------|
| `impl Trait`      | `fn foo(x: &impl T)` | Static     | One type per call site |
| `dyn Trait`       | `fn foo(x: &dyn T)` | Dynamic    | Different types at runtime |

Prefer generics with `impl Trait` for performance. Use `dyn Trait` when you need to store or return heterogeneous
collections.

## Summary

- **Traits** define shared behavior (like interfaces)
- **Default methods** provide implementations that can be overridden
- **Generics** (`<T>`) let functions and types work with any type
- **Trait bounds** (`T: Display + Debug`) constrain what generics accept
- **`where` clauses** make complex bounds readable
- Derive macros auto-generate common traits: `Debug`, `Clone`, `PartialEq`, `Default`, etc.
- `impl Trait` returns a specific (unnamed) type - static dispatch
- `dyn Trait` enables heterogeneous collections - dynamic dispatch via trait objects

Next up: [Lifetimes](./12-lifetimes.md) - why Rust needs lifetime annotations, the three elision rules, and how to
use lifetimes in function signatures and structs.
