---
title: "Iterators & Closures"
sidebar_label: "Iterators & Closures"
description: "Closure syntax, capturing variables, Fn/FnMut/FnOnce traits, the Iterator trait, iterator adaptors like map/filter/fold/collect, chaining, lazy evaluation, and the difference between iter, into_iter, and iter_mut."
slug: /rust/beginners-guide/iterators-and-closures
tags: [rust, beginners]
keywords:
  - rust closures
  - rust iterators
  - rust map filter
  - rust collect
  - rust Fn trait
  - rust into_iter
sidebar_position: 13
---

# Iterators & Closures

Closures are anonymous functions you can store in variables and pass around. Iterators provide a way to process
sequences of elements lazily and efficiently. Together, they enable a functional programming style that is both
expressive and zero-cost in Rust.

## Closures

A closure is a function without a name, defined inline with `|parameters| body`:

```rust
fn main() {
    let add = |a, b| a + b;
    let greet = |name: &str| format!("Hello, {name}!");

    println!("{}", add(3, 4));       // 7
    println!("{}", greet("Alice"));  // Hello, Alice!
}
```

Unlike regular functions, closures:

- Can **capture** variables from their surrounding scope
- Infer parameter and return types (explicit annotations are optional)
- Are each their own unique, anonymous type

### Capturing variables

Closures can use variables from the enclosing scope:

```rust
fn main() {
    let multiplier = 3;
    let multiply = |x| x * multiplier;

    println!("{}", multiply(5));  // 15
    println!("{}", multiply(10)); // 30
}
```

`multiply` captures `multiplier` by reference. The closure borrows `multiplier` for as long as it is used.

### How closures capture

Closures capture in three ways, from least to most restrictive:

| Capture mode      | Trait     | When used                             |
|-------------------|-----------|---------------------------------------|
| By reference      | `Fn`      | Closure only reads the captured value |
| By mutable ref    | `FnMut`   | Closure modifies the captured value   |
| By value (move)   | `FnOnce`  | Closure takes ownership               |

Rust automatically chooses the least restrictive mode needed:

```rust
fn main() {
    let name = String::from("Alice");

    // Captures by reference (Fn) -- only reads name
    let greet = || println!("Hello, {name}!");
    greet();
    greet(); // Can call multiple times
    println!("{name}"); // name is still valid

    // Captures by mutable reference (FnMut)
    let mut count = 0;
    let mut increment = || {
        count += 1;
        count
    };
    println!("{}", increment()); // 1
    println!("{}", increment()); // 2

    // Captures by value with move
    let data = vec![1, 2, 3];
    let owns_data = move || {
        println!("{:?}", data);
    };
    owns_data();
    // println!("{:?}", data); // Error: data was moved into the closure
}
```

The `move` keyword forces a closure to take ownership of all captured variables. This is essential for threads (chapter
16) where data must be moved to another thread.

### Closures as function parameters

Use the `Fn` traits to accept closures:

```rust
fn apply_twice<F: Fn(i32) -> i32>(f: F, value: i32) -> i32 {
    f(f(value))
}

fn main() {
    let double = |x| x * 2;
    let add_three = |x| x + 3;

    println!("{}", apply_twice(double, 5));    // 20
    println!("{}", apply_twice(add_three, 5)); // 11
}
```

| Trait      | Meaning                                | Calling         |
|-----------|----------------------------------------|-----------------|
| `Fn`      | Can be called multiple times, no mutation | Most flexible  |
| `FnMut`   | Can be called multiple times, may mutate | Mutable access |
| `FnOnce`  | Can be called only once (consumes captured data) | Most restrictive |

The hierarchy: every `Fn` is also `FnMut`, and every `FnMut` is also `FnOnce`.

> **Tip:** Accept `Fn` when possible, `FnMut` if the closure needs to mutate, and `FnOnce` if it needs to take
> ownership. This gives callers maximum flexibility.

### Returning closures

```rust
fn make_adder(n: i32) -> impl Fn(i32) -> i32 {
    move |x| x + n
}

fn main() {
    let add_five = make_adder(5);
    println!("{}", add_five(10)); // 15
    println!("{}", add_five(20)); // 25
}
```

## Iterators

An iterator produces a sequence of values one at a time. The `Iterator` trait has one required method:

```rust
trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

Each call to `next()` returns `Some(value)` or `None` when the sequence is exhausted.

### Creating iterators

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    let mut iter = numbers.iter();

    println!("{:?}", iter.next()); // Some(1)
    println!("{:?}", iter.next()); // Some(2)
    println!("{:?}", iter.next()); // Some(3)
    println!("{:?}", iter.next()); // Some(4)
    println!("{:?}", iter.next()); // Some(5)
    println!("{:?}", iter.next()); // None
}
```

### iter vs into_iter vs iter_mut

This is a common source of confusion:

| Method       | Yields    | Consumes collection? | Use when                    |
|-------------|-----------|---------------------|-----------------------------|
| `.iter()`    | `&T`      | No                  | You need to read elements   |
| `.iter_mut()`| `&mut T`  | No                  | You need to modify elements |
| `.into_iter()`| `T`      | Yes                 | You need owned elements     |

```rust
fn main() {
    let numbers = vec![1, 2, 3];

    // .iter() -- borrows, collection stays valid
    for n in numbers.iter() {
        println!("{n}"); // n is &i32
    }
    println!("Still valid: {:?}", numbers);

    // .iter_mut() -- mutable borrow
    let mut numbers = vec![1, 2, 3];
    for n in numbers.iter_mut() {
        *n *= 10; // n is &mut i32
    }
    println!("Modified: {:?}", numbers);

    // .into_iter() -- takes ownership
    let numbers = vec![1, 2, 3];
    for n in numbers.into_iter() {
        println!("{n}"); // n is i32 (owned)
    }
    // numbers is no longer valid
}
```

> **Note:** A `for` loop calls `.into_iter()` implicitly. Writing `for n in numbers` is the same as
> `for n in numbers.into_iter()`. Use `for n in &numbers` for `.iter()` and `for n in &mut numbers` for `.iter_mut()`.

## Iterator adaptors

Adaptors transform an iterator into another iterator. They are **lazy** -- they do nothing until consumed.

### map -- transform each element

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    let doubled: Vec<i32> = numbers.iter().map(|n| n * 2).collect();

    println!("{:?}", doubled); // [2, 4, 6, 8, 10]
}
```

### filter -- keep elements matching a predicate

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let evens: Vec<&i32> = numbers.iter().filter(|n| *n % 2 == 0).collect();

    println!("{:?}", evens); // [2, 4, 6, 8, 10]
}
```

### Chaining adaptors

The real power is chaining multiple operations:

```rust
fn main() {
    let words = vec!["hello", "world", "foo", "bar", "rust"];

    let result: Vec<String> = words
        .iter()
        .filter(|w| w.len() > 3)
        .map(|w| w.to_uppercase())
        .collect();

    println!("{:?}", result); // ["HELLO", "WORLD", "RUST"]
}
```

### Common adaptors

| Adaptor              | What it does                                |
|---------------------|---------------------------------------------|
| `map(f)`            | Transform each element                      |
| `filter(f)`         | Keep elements where `f` returns true        |
| `enumerate()`       | Pair each element with its index            |
| `zip(other)`        | Pair elements from two iterators            |
| `take(n)`           | Take the first n elements                   |
| `skip(n)`           | Skip the first n elements                   |
| `chain(other)`      | Concatenate two iterators                   |
| `flatten()`         | Flatten nested iterators                    |
| `flat_map(f)`       | Map then flatten                            |
| `peekable()`        | Allow peeking at the next element           |
| `inspect(f)`        | Call `f` on each element for debugging      |
| `rev()`             | Reverse (requires `DoubleEndedIterator`)    |

## Consuming iterators

Adaptors are lazy. **Consumers** drive the iteration and produce a final value.

### collect -- gather into a collection

```rust
fn main() {
    let chars: Vec<char> = "hello".chars().collect();
    println!("{:?}", chars); // ['h', 'e', 'l', 'l', 'o']

    let csv = vec!["Alice", "Bob", "Charlie"];
    let joined: String = csv.into_iter().collect::<Vec<&str>>().join(", ");
    println!("{joined}"); // Alice, Bob, Charlie
}
```

`collect` can produce many types -- `Vec`, `String`, `HashMap`, `HashSet`, and more.

### fold -- reduce to a single value

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    let sum = numbers.iter().fold(0, |acc, n| acc + n);
    let product = numbers.iter().fold(1, |acc, n| acc * n);

    println!("Sum: {sum}");       // 15
    println!("Product: {product}"); // 120
}
```

`fold` takes an initial accumulator value and a closure that combines the accumulator with each element.

### Other consumers

| Consumer     | What it does                                    |
|-------------|------------------------------------------------|
| `collect()`  | Gather into a collection                        |
| `fold(init, f)` | Reduce to a single value                    |
| `sum()`      | Sum all elements (requires `Sum` trait)         |
| `product()`  | Multiply all elements                           |
| `count()`    | Count elements                                  |
| `any(f)`     | True if any element satisfies `f`               |
| `all(f)`     | True if all elements satisfy `f`                |
| `find(f)`    | First element matching `f` (returns `Option`)   |
| `position(f)`| Index of first match (returns `Option<usize>`)  |
| `min()` / `max()` | Smallest / largest element               |
| `for_each(f)` | Call `f` on each element (like a for loop)    |

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    println!("Sum: {}", numbers.iter().sum::<i32>());
    println!("Any even? {}", numbers.iter().any(|n| n % 2 == 0));
    println!("All positive? {}", numbers.iter().all(|n| *n > 0));
    println!("First even: {:?}", numbers.iter().find(|n| *n % 2 == 0));
    println!("Max: {:?}", numbers.iter().max());
}
```

## Lazy evaluation

Adaptors do not execute until a consumer drives the iterator. This means no intermediate collections are created:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Nothing happens here -- the chain is lazy
    let iter = numbers.iter().filter(|n| *n % 2 == 0).map(|n| n * 10);

    // Only now does the computation happen
    let result: Vec<i32> = iter.collect();
    println!("{:?}", result); // [20, 40, 60, 80, 100]
}
```

This is efficient -- Rust processes each element through the entire chain before moving to the next, avoiding
intermediate `Vec` allocations.

## A complete example

Processing a list of students:

```rust
#[derive(Debug)]
struct Student {
    name: String,
    grade: u32,
}

fn main() {
    let students = vec![
        Student { name: String::from("Alice"), grade: 92 },
        Student { name: String::from("Bob"), grade: 67 },
        Student { name: String::from("Charlie"), grade: 85 },
        Student { name: String::from("Diana"), grade: 91 },
        Student { name: String::from("Eve"), grade: 73 },
    ];

    let honor_roll: Vec<&str> = students
        .iter()
        .filter(|s| s.grade >= 85)
        .map(|s| s.name.as_str())
        .collect();

    let average: f64 = students.iter().map(|s| s.grade as f64).sum::<f64>()
        / students.len() as f64;

    let highest = students.iter().max_by_key(|s| s.grade).unwrap();

    println!("Honor roll: {:?}", honor_roll);
    println!("Average grade: {average:.1}");
    println!("Highest: {} ({})", highest.name, highest.grade);
}
```

```text
Honor roll: ["Alice", "Charlie", "Diana"]
Average grade: 81.6
Highest: Alice (92)
```

## Summary

- **Closures** are anonymous functions defined with `|params| body`
- Closures capture variables from their scope by reference, mutable reference, or ownership (`move`)
- The `Fn`, `FnMut`, and `FnOnce` traits describe how closures capture and how often they can be called
- **Iterators** produce sequences via the `next()` method
- `.iter()` borrows, `.iter_mut()` mutably borrows, `.into_iter()` takes ownership
- **Adaptors** (`map`, `filter`, `take`, etc.) are lazy -- they build a chain of transformations
- **Consumers** (`collect`, `fold`, `sum`, `find`, etc.) drive the iteration and produce results
- Chains of adaptors are zero-cost -- no intermediate collections

Next up: [Project: CLI Task Manager](./14-project-cli-task-manager.md) -- putting everything together to build a
complete command-line application with argument parsing, file storage, and proper error handling.
