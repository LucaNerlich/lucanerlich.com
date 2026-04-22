---
title: "Concurrency"
sidebar_label: "Concurrency"
description: "Spawning threads, move closures for threads, message passing with channels (mpsc), shared state with Arc and Mutex, the Send and Sync traits, and an introduction to async/await with tokio."
slug: /rust/beginners-guide/concurrency
tags: [rust, beginners]
keywords:
  - rust concurrency
  - rust threads
  - rust async await
  - rust Arc Mutex
  - rust channels
  - rust Send Sync
sidebar_position: 16
---

# Concurrency

Rust's ownership system prevents data races at compile time - a feature called **fearless concurrency**. This chapter
covers threads, message passing, shared state, and a brief introduction to async programming.

## Spawning threads

Use `std::thread::spawn` to create a new thread:

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..=5 {
            println!("  spawned thread: {i}");
            thread::sleep(Duration::from_millis(100));
        }
    });

    for i in 1..=3 {
        println!("main thread: {i}");
        thread::sleep(Duration::from_millis(150));
    }

    handle.join().unwrap();
    println!("Both threads finished.");
}
```

`thread::spawn` takes a closure and returns a `JoinHandle`. Call `.join()` to wait for the thread to finish.

## move closures for threads

Threads must own their data. Use `move` to transfer ownership into the closure:

```rust
use std::thread;

fn main() {
    let message = String::from("Hello from main");

    let handle = thread::spawn(move || {
        println!("{message}");
    });

    // println!("{message}"); // Error: message was moved

    handle.join().unwrap();
}
```

Without `move`, the compiler would reject this - the spawned thread might outlive `message`. `move` ensures the thread
owns everything it needs.

## Message passing with channels

Channels let threads communicate by sending messages. Rust's standard library provides `mpsc` (multiple producer,
single consumer):

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        let messages = vec!["hello", "from", "the", "thread"];
        for msg in messages {
            tx.send(msg).unwrap();
        }
    });

    for received in rx {
        println!("Got: {received}");
    }
}
```

```text
Got: hello
Got: from
Got: the
Got: thread
```

- `mpsc::channel()` creates a sender (`tx`) and receiver (`rx`)
- `tx.send(value)` sends a value (moves it into the channel)
- The `for received in rx` loop receives messages until the sender is dropped
- The sender is moved into the spawned thread with `move`

### Multiple producers

Clone the sender for multiple threads:

```rust
use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    for id in 0..3 {
        let tx_clone = tx.clone();
        thread::spawn(move || {
            tx_clone.send(format!("Message from thread {id}")).unwrap();
        });
    }

    drop(tx); // Drop the original sender so the receiver knows when all senders are done

    for msg in rx {
        println!("{msg}");
    }
}
```

## Shared state with Arc and Mutex

When multiple threads need to access the same data, use `Arc<Mutex<T>>`:

- **`Mutex<T>`** - mutual exclusion, ensures only one thread accesses the data at a time
- **`Arc<T>`** - atomically reference-counted smart pointer, enables shared ownership across threads

```rust
use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final count: {}", *counter.lock().unwrap()); // 10
}
```

How it works:

1. `Arc::new(Mutex::new(0))` creates a shared, thread-safe counter
2. `Arc::clone(&counter)` creates a new reference (not a deep copy - just increments a reference count)
3. `counter.lock().unwrap()` acquires the lock, returning a `MutexGuard` that auto-unlocks when dropped
4. Each thread increments the counter while holding the lock

> **Warning:** `Mutex` can deadlock if you acquire multiple locks in different orders. Keep critical sections short and
> prefer channels when possible.

### When to use channels vs shared state

| Approach       | Use when                                           |
|---------------|---------------------------------------------------|
| **Channels**   | Threads produce data for another thread to consume |
| **Arc<Mutex>** | Multiple threads read/write the same data          |

Channels are generally simpler and less error-prone. Use shared state only when channels are not a good fit.

## Send and Sync traits

Rust uses two marker traits to enforce thread safety:

| Trait    | Meaning                                          |
|---------|--------------------------------------------------|
| `Send`  | The type can be transferred to another thread    |
| `Sync`  | The type can be referenced from multiple threads |

Most types are `Send` and `Sync` automatically. Notable exceptions:

- `Rc<T>` is **not** `Send` (use `Arc<T>` instead)
- `Cell<T>` and `RefCell<T>` are **not** `Sync` (use `Mutex<T>` instead)
- Raw pointers are neither `Send` nor `Sync`

You rarely implement these traits yourself. The compiler tells you when a type is not `Send` or `Sync`:

```text
error[E0277]: `Rc<i32>` cannot be sent between threads safely
```

The fix is almost always: replace `Rc` with `Arc`, or `RefCell` with `Mutex`.

## Introduction to async/await

Threads are great for CPU-bound work, but for I/O-bound work (network requests, file I/O, database queries),
**async/await** is more efficient. Instead of one OS thread per task, async lets you run thousands of tasks on a small
thread pool.

Rust's async support requires a **runtime**. The most popular is **tokio**:

```toml
[dependencies]
tokio = { version = "1", features = ["full"] }
```

```rust
use tokio::time::{sleep, Duration};

async fn fetch_data(id: u32) -> String {
    sleep(Duration::from_millis(100)).await;
    format!("Data from source {id}")
}

#[tokio::main]
async fn main() {
    let (a, b, c) = tokio::join!(
        fetch_data(1),
        fetch_data(2),
        fetch_data(3),
    );

    println!("{a}");
    println!("{b}");
    println!("{c}");
}
```

Key concepts:

- `async fn` defines an asynchronous function that returns a `Future`
- `.await` pauses execution until the future completes, releasing the thread for other work
- `tokio::join!` runs multiple futures concurrently
- `#[tokio::main]` sets up the tokio runtime and makes `main` async

### When to use threads vs async

| Approach    | Best for                                    |
|------------|---------------------------------------------|
| **Threads** | CPU-heavy work (computation, compression)  |
| **Async**   | I/O-heavy work (HTTP, databases, files)    |

> **Note:** Async Rust has a steeper learning curve. It is covered briefly here so you know it exists. For a full
> treatment, see the [Async Book](https://rust-lang.github.io/async-book/).

## A complete example - parallel word counter

Count words in multiple files concurrently:

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::thread;

fn count_words(text: &str) -> HashMap<String, usize> {
    let mut counts = HashMap::new();
    for word in text.split_whitespace() {
        let word = word.to_lowercase();
        *counts.entry(word).or_insert(0) += 1;
    }
    counts
}

fn merge_counts(
    target: &mut HashMap<String, usize>,
    source: HashMap<String, usize>,
) {
    for (word, count) in source {
        *target.entry(word).or_insert(0) += count;
    }
}

fn main() {
    let texts = vec![
        "the quick brown fox jumps over the lazy dog",
        "the fox and the dog are friends",
        "quick quick quick fox fox",
    ];

    let results = Arc::new(Mutex::new(HashMap::new()));
    let mut handles = vec![];

    for text in texts {
        let results = Arc::clone(&results);
        let handle = thread::spawn(move || {
            let local_counts = count_words(text);
            let mut global = results.lock().unwrap();
            merge_counts(&mut global, local_counts);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    let final_counts = results.lock().unwrap();
    let mut sorted: Vec<_> = final_counts.iter().collect();
    sorted.sort_by(|a, b| b.1.cmp(a.1));

    for (word, count) in sorted.iter().take(5) {
        println!("{word}: {count}");
    }
}
```

## Summary

- `thread::spawn` creates OS threads; use `move` to transfer data ownership
- `.join()` waits for a thread to finish
- **Channels** (`mpsc`) pass messages between threads - sender moves data, receiver gets it
- **`Arc<Mutex<T>>`** enables shared mutable state across threads
- `Mutex` provides mutual exclusion; `Arc` provides shared ownership
- **`Send`** means a type can be moved to another thread; **`Sync`** means it can be shared by reference
- **async/await** with tokio is efficient for I/O-heavy work
- Rust prevents data races at compile time - the type system enforces thread safety

Next up: [REST API](./17-rest-api.md) - building a web API with Actix Web, routes, handlers, JSON, and a SQLite
database.
