---
title: "Testing"
sidebar_label: "Testing"
description: "Unit tests with #[test], the cfg(test) module, assert macros, testing panics, integration tests in the tests/ directory, doc tests, cargo test options, and test organization."
slug: /rust/beginners-guide/testing
tags: [rust, beginners]
keywords:
  - rust testing
  - rust unit tests
  - rust integration tests
  - rust doc tests
  - rust cargo test
  - rust assert
sidebar_position: 15
---

# Testing

Rust has a built-in test framework -- no external test runner needed. You write tests right next to your code, run them
with `cargo test`, and get fast, reliable feedback.

## Writing your first test

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn test_add_negative() {
        assert_eq!(add(-1, 1), 0);
    }
}
```

Run with:

```bash
cargo test
```

```text
running 2 tests
test tests::test_add ... ok
test tests::test_add_negative ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Key elements:

- `#[cfg(test)]` -- this module is only compiled when running tests
- `mod tests` -- a conventional name for the test module
- `use super::*` -- import everything from the parent module
- `#[test]` -- marks a function as a test
- `assert_eq!` -- asserts two values are equal

## Assert macros

| Macro                        | What it checks                           |
|------------------------------|------------------------------------------|
| `assert!(expr)`              | `expr` is `true`                         |
| `assert_eq!(left, right)`    | `left == right`                          |
| `assert_ne!(left, right)`    | `left != right`                          |

All three accept an optional custom message:

```rust
#[test]
fn test_with_message() {
    let result = 2 + 2;
    assert_eq!(result, 4, "Math is broken: 2 + 2 = {result}");
}
```

When a test fails, `assert_eq!` shows both the expected and actual values:

```text
thread 'tests::test_example' panicked at 'assertion `left == right` failed
  left: 4
 right: 5'
```

## Testing for panics

Use `#[should_panic]` to verify that code panics:

```rust
fn divide(a: i32, b: i32) -> i32 {
    if b == 0 {
        panic!("Division by zero");
    }
    a / b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn test_divide_by_zero() {
        divide(10, 0);
    }

    #[test]
    #[should_panic(expected = "Division by zero")]
    fn test_divide_by_zero_message() {
        divide(10, 0);
    }
}
```

`expected = "..."` checks that the panic message contains the given string. This prevents the test from passing for
the wrong panic.

## Tests that return Result

Tests can return `Result<(), E>` instead of panicking, allowing you to use `?`:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_parse() -> Result<(), Box<dyn std::error::Error>> {
        let number: i32 = "42".parse()?;
        assert_eq!(number, 42);
        Ok(())
    }
}
```

This is useful when the test involves operations that return `Result`.

## Ignoring tests

```rust
#[test]
#[ignore]
fn expensive_test() {
    // This test takes a long time
    std::thread::sleep(std::time::Duration::from_secs(60));
}
```

Run ignored tests explicitly:

```bash
cargo test -- --ignored        # Run only ignored tests
cargo test -- --include-ignored # Run all tests including ignored
```

## Test organization

### Unit tests -- same file as the code

Unit tests live in a `#[cfg(test)]` module inside the source file they test:

```text
src/
├── main.rs
├── math.rs        ← contains fn add() and mod tests
└── parser.rs      ← contains fn parse() and mod tests
```

This is the standard pattern. Unit tests can access private functions because they are inside the same module.

### Integration tests -- separate tests/ directory

Integration tests live in a top-level `tests/` directory and test your crate as an external consumer:

```text
my-crate/
├── Cargo.toml
├── src/
│   └── lib.rs
└── tests/
    ├── integration_test.rs
    └── cli_test.rs
```

`tests/integration_test.rs`:

```rust
use my_crate::add;

#[test]
fn test_add_from_outside() {
    assert_eq!(add(2, 3), 5);
}
```

Integration tests:

- Only test the **public** API
- Each file in `tests/` is compiled as a separate crate
- Use `use my_crate::...` to import from your library
- Only work with library crates (`src/lib.rs`), not binary crates (`src/main.rs`)

### Shared test helpers

To share code between integration tests, put helpers in `tests/common/mod.rs`:

```text
tests/
├── common/
│   └── mod.rs      ← shared helpers
├── test_one.rs
└── test_two.rs
```

`tests/common/mod.rs`:

```rust
pub fn setup_test_data() -> Vec<i32> {
    vec![1, 2, 3, 4, 5]
}
```

`tests/test_one.rs`:

```rust
mod common;

#[test]
fn test_with_shared_data() {
    let data = common::setup_test_data();
    assert_eq!(data.len(), 5);
}
```

## Doc tests

Code examples in documentation comments are compiled and run as tests:

```rust
/// Adds two numbers.
///
/// # Examples
///
/// ```
/// use my_crate::add;
///
/// assert_eq!(add(2, 3), 5);
/// assert_eq!(add(-1, 1), 0);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

When you run `cargo test`, the examples in `///` comments are tested automatically. This ensures your documentation
examples always work.

### Hiding boilerplate in doc tests

Use `# ` to hide lines from the rendered docs while still compiling them:

```rust
/// Returns the first element.
///
/// ```
/// # use my_crate::first;
/// let numbers = vec![1, 2, 3];
/// assert_eq!(first(&numbers), Some(&1));
/// ```
pub fn first<T>(items: &[T]) -> Option<&T> {
    items.first()
}
```

Lines starting with `# ` are compiled but hidden in the generated documentation.

## cargo test options

| Command                        | What it does                              |
|-------------------------------|-------------------------------------------|
| `cargo test`                  | Run all tests                             |
| `cargo test test_name`        | Run tests matching a name                 |
| `cargo test -- --nocapture`   | Show `println!` output during tests       |
| `cargo test -- --test-threads=1` | Run tests sequentially (not in parallel) |
| `cargo test -- --ignored`     | Run only `#[ignore]` tests                |
| `cargo test --lib`            | Run only unit tests                       |
| `cargo test --test integration_test` | Run a specific integration test file |
| `cargo test --doc`            | Run only doc tests                        |

> **Tip:** By default, `cargo test` captures stdout. If you want to see `println!` output from tests, add
> `-- --nocapture`.

## Testing the task manager

Let's add tests to the task manager from chapter 14. Here are unit tests for `TaskStore`:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::NamedTempFile;

    fn temp_store() -> (TaskStore, NamedTempFile) {
        let file = NamedTempFile::new().unwrap();
        let store = TaskStore::new(file.path());
        (store, file)
    }

    #[test]
    fn test_add_task() {
        let (store, _file) = temp_store();
        let task = store.add(String::from("Test task")).unwrap();
        assert_eq!(task.id, 1);
        assert_eq!(task.description, "Test task");
        assert!(!task.done);
    }

    #[test]
    fn test_list_empty() {
        let (store, _file) = temp_store();
        let tasks = store.load().unwrap();
        assert!(tasks.is_empty());
    }

    #[test]
    fn test_complete_task() {
        let (store, _file) = temp_store();
        store.add(String::from("Task 1")).unwrap();
        let completed = store.complete(1).unwrap();
        assert!(completed.done);
    }

    #[test]
    fn test_complete_nonexistent() {
        let (store, _file) = temp_store();
        let result = store.complete(99);
        assert!(result.is_err());
    }

    #[test]
    fn test_remove_task() {
        let (store, _file) = temp_store();
        store.add(String::from("Task 1")).unwrap();
        let removed = store.remove(1).unwrap();
        assert_eq!(removed.description, "Task 1");
        assert!(store.load().unwrap().is_empty());
    }
}
```

> **Note:** This example uses the `tempfile` crate (`cargo add tempfile --dev`) to create temporary files that are
> automatically cleaned up. The `--dev` flag adds it as a dev-dependency, meaning it is only compiled for tests.

## Summary

- `#[test]` marks a function as a test; `#[cfg(test)]` compiles a module only for testing
- `assert!`, `assert_eq!`, `assert_ne!` are the core assertion macros
- `#[should_panic]` tests that code panics; `expected` checks the message
- Tests can return `Result` for `?` support
- **Unit tests** live in the same file, inside `mod tests`
- **Integration tests** live in `tests/` and test the public API
- **Doc tests** run code examples from documentation comments
- `cargo test` runs everything; use filters and flags to run subsets

Next up: [Concurrency](./16-concurrency.md) -- threads, message passing, shared state with `Arc<Mutex<T>>`, the
`Send` and `Sync` traits, and a brief introduction to `async`/`await`.
