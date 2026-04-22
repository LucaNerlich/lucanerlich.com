---
title: "Collections"
sidebar_label: "Collections"
description: "Vec for dynamic arrays, String for owned UTF-8 text, and HashMap for key-value storage -- creating, accessing, iterating, and common patterns."
slug: /rust/beginners-guide/collections
tags: [rust, beginners]
keywords:
  - rust Vec
  - rust String
  - rust HashMap
  - rust collections
  - rust vector
  - rust dynamic array
sidebar_position: 8
---

# Collections

Arrays and tuples have fixed sizes known at compile time. When you need data structures that can grow and shrink at
runtime, you use the standard library's **collections**. The three you will use most are `Vec<T>`, `String`, and
`HashMap<K, V>`.

All three store data on the heap and manage their own memory through ownership.

## Vec - a dynamic array

`Vec<T>` (pronounced "vector") is a growable, heap-allocated list of values of type `T`:

### Creating vectors

```rust
fn main() {
    // Empty vector with explicit type
    let mut numbers: Vec<i32> = Vec::new();

    // Using the vec! macro (most common)
    let colors = vec!["red", "green", "blue"];

    // With initial capacity (avoids reallocations if you know the size)
    let mut buffer: Vec<u8> = Vec::with_capacity(1024);

    numbers.push(1);
    numbers.push(2);
    numbers.push(3);

    println!("{:?}", numbers); // [1, 2, 3]
    println!("{:?}", colors);  // ["red", "green", "blue"]
    println!("Buffer capacity: {}", buffer.capacity()); // 1024
}
```

### Accessing elements

```rust
fn main() {
    let numbers = vec![10, 20, 30, 40, 50];

    // Indexing -- panics if out of bounds
    let third = numbers[2];
    println!("Third: {third}");

    // .get() -- returns Option<&T>, safe
    match numbers.get(10) {
        Some(n) => println!("Got {n}"),
        None => println!("Index out of bounds"),
    }
}
```

Prefer `.get()` when the index might be invalid. Use direct indexing (`numbers[i]`) when you are certain the index is
valid.

### Modifying vectors

```rust
fn main() {
    let mut v = vec![1, 2, 3];

    v.push(4);          // Add to the end
    v.pop();             // Remove from the end (returns Option<T>)
    v.insert(1, 10);    // Insert at index 1
    v.remove(0);         // Remove at index 0
    v.extend([5, 6, 7]); // Append multiple values

    println!("{:?}", v); // [10, 2, 3, 5, 6, 7]
}
```

| Method         | What it does                        | Returns            |
|---------------|-------------------------------------|--------------------|
| `push(val)`   | Append to end                       | `()`               |
| `pop()`       | Remove and return last element      | `Option<T>`        |
| `insert(i, v)`| Insert at index                     | `()`               |
| `remove(i)`   | Remove at index, shift remaining    | `T`                |
| `len()`       | Number of elements                  | `usize`            |
| `is_empty()`  | Whether the vector has no elements  | `bool`             |
| `contains(&v)`| Whether a value is in the vector    | `bool`             |
| `sort()`      | Sort in place (requires `Ord`)      | `()`               |
| `dedup()`     | Remove consecutive duplicates       | `()`               |
| `retain(f)`   | Keep only elements matching predicate| `()`              |

### Iterating

```rust
fn main() {
    let names = vec!["Alice", "Bob", "Charlie"];

    // Immutable iteration (borrows the vector)
    for name in &names {
        println!("Hello, {name}");
    }

    // Mutable iteration
    let mut scores = vec![85, 92, 78];
    for score in &mut scores {
        *score += 5; // Dereference to modify
    }
    println!("{:?}", scores); // [90, 97, 83]

    // Consuming iteration (moves the vector)
    for name in names {
        println!("Goodbye, {name}");
    }
    // names is no longer valid here
}
```

| Syntax          | Borrows as   | Elements are | Vector after loop |
|----------------|-------------|-------------|-------------------|
| `for x in &v`  | `&T`        | References  | Still valid       |
| `for x in &mut v` | `&mut T` | Mut refs    | Still valid       |
| `for x in v`   | `T`         | Owned       | Moved (invalid)   |

### Slicing vectors

Vectors can produce slices, just like arrays:

```rust
fn sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

fn main() {
    let v = vec![1, 2, 3, 4, 5];

    println!("Sum of all: {}", sum(&v));
    println!("Sum of first 3: {}", sum(&v[..3]));
}
```

Functions that accept `&[T]` work with both arrays and vectors, making them very flexible.

## String - owned UTF-8 text

We covered `String` vs `&str` in chapter 5. Here we go deeper into `String` as a collection.

A `String` is essentially a `Vec<u8>` that is guaranteed to contain valid UTF-8. It grows and shrinks like a vector.

### Creating strings

```rust
fn main() {
    let s1 = String::new();                    // Empty
    let s2 = String::from("hello");            // From a literal
    let s3 = "hello".to_string();              // Same as above
    let s4 = format!("{} {}", "hello", "world"); // With formatting

    println!("{s1:?}, {s2}, {s3}, {s4}");
}
```

### Growing strings

```rust
fn main() {
    let mut s = String::from("Hello");

    s.push(' ');                // Append a single char
    s.push_str("world");       // Append a string slice
    s += "!";                   // Concatenation with +=

    println!("{s}"); // Hello world!
}
```

### String concatenation

```rust
fn main() {
    let greeting = String::from("Hello");
    let name = String::from("world");

    // Using format! (recommended -- does not move anything)
    let message = format!("{greeting}, {name}!");

    // Using + (moves the left operand)
    let combined = greeting + ", " + &name + "!";
    // greeting is moved and no longer valid
    // name is still valid (only borrowed)

    println!("{message}");
    println!("{combined}");
}
```

> **Tip:** Prefer `format!()` for concatenation. It is more readable and does not move any of its arguments.

### Indexing - why you cannot do s[0]

```rust
fn main() {
    let s = String::from("hello");
    // let c = s[0]; // Error: String cannot be indexed by integer
}
```

Rust strings are UTF-8 encoded. A single "character" might be 1-4 bytes. Indexing by byte offset could land in the
middle of a multi-byte character, which would be invalid. Instead, use:

```rust
fn main() {
    let hello = String::from("Здравствуйте"); // Russian "Hello"

    // Iterate over characters
    for c in hello.chars() {
        print!("{c} ");
    }
    println!();

    // Iterate over bytes
    for b in hello.bytes() {
        print!("{b} ");
    }
    println!();

    // Get the nth character (not efficient for large strings)
    if let Some(c) = hello.chars().nth(0) {
        println!("First character: {c}"); // З
    }

    // Slice by byte range (panics if not at a char boundary)
    let slice = &hello[0..4]; // First 2 Russian characters (2 bytes each)
    println!("Slice: {slice}");
}
```

### Useful String methods

| Method               | What it does                            | Returns         |
|---------------------|----------------------------------------|-----------------|
| `len()`             | Byte length (not character count!)     | `usize`         |
| `is_empty()`        | Whether the string is empty            | `bool`          |
| `contains("sub")`   | Substring search                       | `bool`          |
| `starts_with("x")`  | Prefix check                           | `bool`          |
| `ends_with("x")`    | Suffix check                           | `bool`          |
| `trim()`            | Remove leading/trailing whitespace     | `&str`          |
| `to_lowercase()`    | Lowercase copy                         | `String`        |
| `to_uppercase()`    | Uppercase copy                         | `String`        |
| `replace("a", "b")` | Replace all occurrences               | `String`        |
| `split(",")`        | Split by delimiter                     | Iterator        |
| `chars()`           | Iterator over Unicode characters       | Iterator        |
| `lines()`           | Iterator over lines                    | Iterator        |

## HashMap - key-value storage

`HashMap<K, V>` stores key-value pairs with O(1) average lookup time:

### Creating and inserting

```rust
use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();

    scores.insert(String::from("Alice"), 95);
    scores.insert(String::from("Bob"), 87);
    scores.insert(String::from("Charlie"), 92);

    println!("{:?}", scores);
}
```

> **Note:** `HashMap` is not in the prelude - you must `use std::collections::HashMap;`.

### Creating from iterators

```rust
use std::collections::HashMap;

fn main() {
    let names = vec!["Alice", "Bob", "Charlie"];
    let ages = vec![30, 25, 35];

    let people: HashMap<&str, i32> = names.into_iter().zip(ages).collect();

    println!("{:?}", people);
}
```

### Accessing values

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();
    scores.insert("Alice", 95);
    scores.insert("Bob", 87);

    // .get() returns Option<&V>
    match scores.get("Alice") {
        Some(score) => println!("Alice: {score}"),
        None => println!("Alice not found"),
    }

    // Direct indexing -- panics if key does not exist
    // let score = scores["Charlie"]; // PANICS

    // Check existence
    if scores.contains_key("Bob") {
        println!("Bob is in the map");
    }
}
```

### Updating values

```rust
use std::collections::HashMap;

fn main() {
    let mut scores = HashMap::new();

    // Overwrite
    scores.insert("Alice", 95);
    scores.insert("Alice", 100); // Overwrites 95

    // Insert only if key does not exist
    scores.entry("Bob").or_insert(87);
    scores.entry("Bob").or_insert(50); // Does nothing -- Bob already exists

    // Update based on current value
    let text = "hello world wonderful world";
    let mut word_count = HashMap::new();

    for word in text.split_whitespace() {
        let count = word_count.entry(word).or_insert(0);
        *count += 1;
    }

    println!("{:?}", word_count);
    // {"hello": 1, "world": 2, "wonderful": 1}
}
```

The **entry API** is one of the most useful patterns in Rust:

| Method                 | What it does                                      |
|-----------------------|---------------------------------------------------|
| `entry(key)`          | Returns an `Entry` for the key                    |
| `.or_insert(val)`     | Insert `val` if key is missing, return `&mut V`   |
| `.or_insert_with(f)`  | Insert result of closure `f` if key is missing    |
| `.or_default()`       | Insert `Default::default()` if key is missing     |
| `.and_modify(f)`      | Call `f` on existing value if key exists           |

### Iterating

```rust
use std::collections::HashMap;

fn main() {
    let mut map = HashMap::new();
    map.insert("one", 1);
    map.insert("two", 2);
    map.insert("three", 3);

    // Iterate over key-value pairs
    for (key, value) in &map {
        println!("{key}: {value}");
    }

    // Iterate over keys only
    for key in map.keys() {
        println!("Key: {key}");
    }

    // Iterate over values only
    for value in map.values() {
        println!("Value: {value}");
    }
}
```

> **Note:** `HashMap` iteration order is **not guaranteed**. If you need ordered keys, use `BTreeMap` from the standard
> library instead.

### Ownership and HashMap

When inserting owned values (like `String`), ownership moves into the map:

```rust
use std::collections::HashMap;

fn main() {
    let key = String::from("color");
    let value = String::from("blue");

    let mut map = HashMap::new();
    map.insert(key, value);

    // key and value are moved -- they are no longer valid here
    // println!("{key}"); // Error: value moved

    // References (&str, &i32, etc.) are copied, not moved
    let mut ref_map = HashMap::new();
    let name = "Alice";
    ref_map.insert(name, 42);
    println!("{name}"); // Still valid -- &str is Copy
}
```

## Choosing the right collection

| Need                                  | Use              |
|---------------------------------------|------------------|
| Ordered list, grow/shrink at end      | `Vec<T>`         |
| Key-value lookup, unordered           | `HashMap<K, V>`  |
| Key-value lookup, ordered by key      | `BTreeMap<K, V>` |
| Unique values, fast membership test   | `HashSet<T>`     |
| Unique values, ordered                | `BTreeSet<T>`    |
| Double-ended queue                    | `VecDeque<T>`    |
| Growable UTF-8 text                   | `String`         |

For most programs, `Vec`, `String`, and `HashMap` cover 90% of use cases.

## A complete example

A simple in-memory contact book:

```rust
use std::collections::HashMap;

struct ContactBook {
    contacts: HashMap<String, Contact>,
}

struct Contact {
    email: String,
    phone: Option<String>,
}

impl ContactBook {
    fn new() -> Self {
        Self {
            contacts: HashMap::new(),
        }
    }

    fn add(&mut self, name: String, email: String, phone: Option<String>) {
        self.contacts.insert(name, Contact { email, phone });
    }

    fn find(&self, name: &str) -> Option<&Contact> {
        self.contacts.get(name)
    }

    fn list(&self) {
        if self.contacts.is_empty() {
            println!("No contacts.");
            return;
        }
        for (name, contact) in &self.contacts {
            let phone = contact.phone.as_deref().unwrap_or("N/A");
            println!("{name}: {} (phone: {phone})", contact.email);
        }
    }
}

fn main() {
    let mut book = ContactBook::new();

    book.add(
        String::from("Alice"),
        String::from("alice@example.com"),
        Some(String::from("+1-555-0100")),
    );
    book.add(
        String::from("Bob"),
        String::from("bob@example.com"),
        None,
    );

    book.list();

    if let Some(contact) = book.find("Alice") {
        println!("\nFound Alice: {}", contact.email);
    }
}
```

## Summary

- **`Vec<T>`** is a growable array - `push`, `pop`, `insert`, `remove`, iterate with `for x in &v`
- **`String`** is a growable UTF-8 string - `push_str`, `format!`, no direct indexing, use `.chars()` for characters
- **`HashMap<K, V>`** stores key-value pairs - `.insert()`, `.get()`, `.entry()` API for conditional inserts
- All three own their data on the heap and are dropped when they go out of scope
- Accept `&[T]` and `&str` in function parameters for maximum flexibility
- The entry API is the idiomatic way to update or insert HashMap values

Next up: [Error Handling](./09-error-handling.md) - `Result<T, E>` in depth, the `?` operator, custom error types,
and when to `panic!` vs return an error.
