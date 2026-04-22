---
title: "Structs & Enums"
sidebar_label: "Structs & Enums"
description: "Defining structs, field init shorthand, tuple structs, unit structs, impl blocks, methods, associated functions, enums, enum variants with data, Option, and Result."
slug: /rust/beginners-guide/structs-and-enums
tags: [rust, beginners]
keywords:
  - rust structs
  - rust enums
  - rust impl
  - rust methods
  - rust Option
  - rust Result
sidebar_position: 6
---

# Structs & Enums

So far we have used built-in types - integers, booleans, strings, tuples, arrays. Now it is time to define your own
types. Rust gives you two tools for this: **structs** (group related data together) and **enums** (define a type that
can be one of several variants).

## Structs

A struct groups named fields into a single type:

```rust
struct User {
    name: String,
    email: String,
    age: u32,
    active: bool,
}

fn main() {
    let user = User {
        name: String::from("Alice"),
        email: String::from("alice@example.com"),
        age: 30,
        active: true,
    };

    println!("{} ({}) - age {}", user.name, user.email, user.age);
}
```

Access fields with dot notation: `user.name`, `user.age`.

### Mutable structs

To modify a struct, the entire binding must be `mut` - Rust does not allow marking individual fields as mutable:

```rust
fn main() {
    let mut user = User {
        name: String::from("Alice"),
        email: String::from("alice@example.com"),
        age: 30,
        active: true,
    };

    user.age = 31;
    user.email = String::from("alice@newdomain.com");

    println!("{}, age {}", user.name, user.age);
}

struct User {
    name: String,
    email: String,
    age: u32,
    active: bool,
}
```

### Field init shorthand

When a variable has the same name as a struct field, you can use the shorthand:

```rust
struct User {
    name: String,
    email: String,
    age: u32,
    active: bool,
}

fn create_user(name: String, email: String) -> User {
    User {
        name,    // same as name: name
        email,   // same as email: email
        age: 0,
        active: true,
    }
}

fn main() {
    let user = create_user(String::from("Bob"), String::from("bob@example.com"));
    println!("{}", user.name);
}
```

### Struct update syntax

Create a new struct from an existing one, overriding some fields:

```rust
struct User {
    name: String,
    email: String,
    age: u32,
    active: bool,
}

fn main() {
    let user1 = User {
        name: String::from("Alice"),
        email: String::from("alice@example.com"),
        age: 30,
        active: true,
    };

    let user2 = User {
        email: String::from("bob@example.com"),
        name: String::from("Bob"),
        ..user1 // Take remaining fields from user1
    };

    println!("{}, age {}", user2.name, user2.age); // Bob, age 30
}
```

> **Important:** The `..user1` syntax **moves** any non-Copy fields. In this example, `age` (u32) and `active` (bool)
> are copied, but if we had used `..user1` without overriding `name` and `email`, those `String` fields would be moved
> and `user1` would no longer be valid.

### Tuple structs

Tuple structs have a name but no field names - they look like named tuples:

```rust
struct Color(u8, u8, u8);
struct Point(f64, f64, f64);

fn main() {
    let red = Color(255, 0, 0);
    let origin = Point(0.0, 0.0, 0.0);

    println!("Red: ({}, {}, {})", red.0, red.1, red.2);
    println!("Origin: ({}, {}, {})", origin.0, origin.1, origin.2);
}
```

Tuple structs are useful when you want to distinguish between types that have the same shape. `Color(255, 0, 0)` and
`Point(255.0, 0.0, 0.0)` are different types even though they both hold three numbers.

### Unit structs

Structs with no fields are called **unit structs**:

```rust
struct Marker;

fn main() {
    let _m = Marker;
}
```

Unit structs are rare but useful for type-level markers and when implementing traits (chapter 11) on a type that carries
no data.

## Adding behavior with impl blocks

Structs are just data. To add behavior (methods and functions), use an `impl` block:

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        2.0 * (self.width + self.height)
    }

    fn is_square(&self) -> bool {
        (self.width - self.height).abs() < f64::EPSILON
    }
}

fn main() {
    let rect = Rectangle { width: 10.0, height: 5.0 };

    println!("Area: {}", rect.area());
    println!("Perimeter: {}", rect.perimeter());
    println!("Square? {}", rect.is_square());
}
```

### The self parameter

The first parameter of a method determines how it accesses the struct:

| Parameter    | Meaning                            | When to use                        |
|-------------|------------------------------------|------------------------------------|
| `&self`     | Immutable borrow of the instance   | Reading data (most common)         |
| `&mut self` | Mutable borrow of the instance     | Modifying data                     |
| `self`      | Takes ownership of the instance    | Consuming/transforming the struct  |

```rust
struct Counter {
    count: u32,
}

impl Counter {
    fn value(&self) -> u32 {
        self.count
    }

    fn increment(&mut self) {
        self.count += 1;
    }

    fn into_value(self) -> u32 {
        self.count
    }
}

fn main() {
    let mut counter = Counter { count: 0 };
    counter.increment();
    counter.increment();
    println!("Count: {}", counter.value()); // 2

    let final_value = counter.into_value(); // counter is moved (consumed)
    println!("Final: {final_value}");
    // println!("{}", counter.value()); // Error: counter was moved
}
```

### Associated functions (constructors)

Functions in an `impl` block that do **not** take `self` are called **associated functions**. They are called with `::`
syntax, like `String::from()`. The most common use is constructors:

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn new(width: f64, height: f64) -> Self {
        Self { width, height }
    }

    fn square(size: f64) -> Self {
        Self { width: size, height: size }
    }

    fn area(&self) -> f64 {
        self.width * self.height
    }
}

fn main() {
    let rect = Rectangle::new(10.0, 5.0);
    let sq = Rectangle::square(7.0);

    println!("Rectangle: {}", rect.area());
    println!("Square: {}", sq.area());
}
```

`Self` (with a capital S) refers to the type the `impl` block is for - in this case, `Rectangle`.

> **Tip:** Rust has no built-in constructor keyword. The convention is to define a `new` associated function. Unlike
> constructors in Java or C++, `new` is just a convention - there is nothing special about the name.

### Multiple impl blocks

You can have multiple `impl` blocks for the same type. This is sometimes useful for organization:

```rust
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn new(width: f64, height: f64) -> Self {
        Self { width, height }
    }
}

impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }
}
```

## Printing structs with Debug

If you try to print a struct with `println!("{}")`, you will get an error. Rust requires types to implement the
`Display` trait for `{}` formatting. For debugging, use `{:?}` with the `Debug` trait, which you can auto-derive:

```rust
#[derive(Debug)]
struct Rectangle {
    width: f64,
    height: f64,
}

fn main() {
    let rect = Rectangle { width: 10.0, height: 5.0 };

    println!("{:?}", rect);   // Single-line debug output
    println!("{:#?}", rect);  // Pretty-printed debug output
}
```

```text
Rectangle { width: 10.0, height: 5.0 }
Rectangle {
    width: 10.0,
    height: 5.0,
}
```

`#[derive(Debug)]` is a **derive macro** that auto-generates the `Debug` implementation. We will cover traits and
derive macros in chapter 11.

## Enums

An enum defines a type that can be **one of several variants**:

```rust
enum Direction {
    North,
    South,
    East,
    West,
}

fn main() {
    let heading = Direction::North;

    match heading {
        Direction::North => println!("Going up"),
        Direction::South => println!("Going down"),
        Direction::East => println!("Going right"),
        Direction::West => println!("Going left"),
    }
}
```

Each variant is accessed through the enum name: `Direction::North`, `Direction::South`, etc.

### Enums with data

Unlike enums in most languages, Rust enum variants can **carry data**:

```rust
enum Shape {
    Circle(f64),                    // radius
    Rectangle(f64, f64),            // width, height
    Triangle { a: f64, b: f64, c: f64 }, // named fields
}

fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle(radius) => std::f64::consts::PI * radius * radius,
        Shape::Rectangle(w, h) => w * h,
        Shape::Triangle { a, b, c } => {
            let s = (a + b + c) / 2.0;
            (s * (s - a) * (s - b) * (s - c)).sqrt()
        }
    }
}

fn main() {
    let shapes = [
        Shape::Circle(5.0),
        Shape::Rectangle(10.0, 3.0),
        Shape::Triangle { a: 3.0, b: 4.0, c: 5.0 },
    ];

    for shape in &shapes {
        println!("Area: {:.2}", area(shape));
    }
}
```

This is incredibly powerful. An enum variant can hold:
- No data (`North`)
- A single value (`Circle(f64)`)
- Multiple values (`Rectangle(f64, f64)`)
- Named fields (`Triangle { a, b, c }`)

### Enums with impl

Just like structs, enums can have methods:

```rust
#[derive(Debug)]
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

impl Coin {
    fn value_in_cents(&self) -> u32 {
        match self {
            Coin::Penny => 1,
            Coin::Nickel => 5,
            Coin::Dime => 10,
            Coin::Quarter => 25,
        }
    }
}

fn main() {
    let coin = Coin::Quarter;
    println!("{:?} = {} cents", coin, coin.value_in_cents());
}
```

## Option - Rust's replacement for null

Rust has **no null**. Instead, it uses the `Option<T>` enum from the standard library:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

`Option<T>` is either `Some(value)` (there is a value) or `None` (there is no value). It is so common that `Some` and
`None` are available without the `Option::` prefix.

```rust
fn find_first_even(numbers: &[i32]) -> Option<i32> {
    for &n in numbers {
        if n % 2 == 0 {
            return Some(n);
        }
    }
    None
}

fn main() {
    let numbers = [1, 3, 5, 8, 11];

    match find_first_even(&numbers) {
        Some(n) => println!("First even number: {n}"),
        None => println!("No even numbers found"),
    }
}
```

Why is this better than null?

- You **cannot** accidentally use an `Option<T>` as if it were a `T`. The compiler forces you to handle the `None` case.
- Null pointer exceptions are impossible.
- It is always clear from the type signature whether a function can return "no value".

### Common Option methods

```rust
fn main() {
    let some_number: Option<i32> = Some(42);
    let no_number: Option<i32> = None;

    // unwrap -- get the value or panic
    println!("{}", some_number.unwrap()); // 42
    // println!("{}", no_number.unwrap()); // PANICS!

    // unwrap_or -- get the value or a default
    println!("{}", no_number.unwrap_or(0)); // 0

    // is_some / is_none
    println!("{}", some_number.is_some()); // true
    println!("{}", no_number.is_none());   // true

    // map -- transform the inner value
    let doubled = some_number.map(|n| n * 2);
    println!("{:?}", doubled); // Some(84)
}
```

> **Warning:** Avoid using `.unwrap()` in production code - it panics on `None`. Use `match`, `if let`, `unwrap_or`,
> or the `?` operator (chapter 9) instead.

## Result - Rust's approach to errors

`Result<T, E>` is like `Option`, but the "failure" case carries an error:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

You use `Result` when an operation might fail:

```rust
fn divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err(String::from("Cannot divide by zero"))
    } else {
        Ok(a / b)
    }
}

fn main() {
    match divide(10.0, 3.0) {
        Ok(result) => println!("10 / 3 = {result:.4}"),
        Err(e) => println!("Error: {e}"),
    }

    match divide(10.0, 0.0) {
        Ok(result) => println!("10 / 0 = {result}"),
        Err(e) => println!("Error: {e}"),
    }
}
```

```text
10 / 3 = 3.3333
Error: Cannot divide by zero
```

We will cover `Result` and error handling in much more depth in chapter 9.

## Combining structs and enums

Structs and enums work beautifully together:

```rust
#[derive(Debug)]
struct Order {
    id: u32,
    item: String,
    quantity: u32,
    status: OrderStatus,
}

#[derive(Debug)]
enum OrderStatus {
    Pending,
    Shipped { tracking_number: String },
    Delivered,
    Cancelled { reason: String },
}

impl Order {
    fn new(id: u32, item: String, quantity: u32) -> Self {
        Self {
            id,
            item,
            quantity,
            status: OrderStatus::Pending,
        }
    }

    fn ship(&mut self, tracking: String) {
        self.status = OrderStatus::Shipped {
            tracking_number: tracking,
        };
    }

    fn describe(&self) -> String {
        match &self.status {
            OrderStatus::Pending => format!("Order #{}: {} (pending)", self.id, self.item),
            OrderStatus::Shipped { tracking_number } => {
                format!("Order #{}: {} (shipped, tracking: {})", self.id, self.item, tracking_number)
            }
            OrderStatus::Delivered => format!("Order #{}: {} (delivered)", self.id, self.item),
            OrderStatus::Cancelled { reason } => {
                format!("Order #{}: {} (cancelled: {})", self.id, self.item, reason)
            }
        }
    }
}

fn main() {
    let mut order = Order::new(1, String::from("Rust Book"), 1);
    println!("{}", order.describe());

    order.ship(String::from("TR-12345"));
    println!("{}", order.describe());
}
```

```text
Order #1: Rust Book (pending)
Order #1: Rust Book (shipped, tracking: TR-12345)
```

## Summary

- **Structs** group related fields into a named type
- **Field init shorthand** and **struct update syntax** reduce boilerplate
- **Tuple structs** have a name but unnamed fields
- **`impl` blocks** add methods and associated functions to structs and enums
- Methods take `&self`, `&mut self`, or `self` to control access
- Associated functions (like `new`) are called with `::` and act as constructors
- **Enums** define a type that can be one of several variants, each optionally carrying data
- **`Option<T>`** replaces null - it is either `Some(value)` or `None`
- **`Result<T, E>`** represents success or failure - `Ok(value)` or `Err(error)`
- `#[derive(Debug)]` lets you print structs and enums with `{:?}`

Next up: [Pattern Matching](./07-pattern-matching.md) - `match` exhaustiveness, destructuring, `if let`, `while let`,
guards, and nested patterns.
