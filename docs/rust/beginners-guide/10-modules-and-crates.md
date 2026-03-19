---
title: "Modules & Crates"
sidebar_label: "Modules & Crates"
description: "Organizing code with mod, pub, and use, file-based module structure, re-exports, library vs binary crates, workspaces, Cargo.toml dependencies, crates.io, semantic versioning, and feature flags."
slug: /rust/beginners-guide/modules-and-crates
tags: [rust, beginners]
keywords:
  - rust modules
  - rust crates
  - rust mod
  - rust pub use
  - rust Cargo.toml
  - rust crates.io
sidebar_position: 10
---

# Modules & Crates

As your code grows beyond a single file, you need a way to organize it. Rust uses **modules** to group related code
within a project and **crates** to package and share code between projects.

## Key terminology

| Term             | Meaning                                                          |
|------------------|------------------------------------------------------------------|
| **Crate**        | A compilation unit -- either a binary (runs) or a library (imported) |
| **Module**       | A namespace within a crate that groups related items             |
| **Package**      | A `Cargo.toml` + one or more crates                             |
| **Workspace**    | Multiple packages managed together                               |

## Modules with mod

Define a module with the `mod` keyword:

```rust
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    pub fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }

    fn internal_helper() -> i32 {
        42
    }
}

fn main() {
    println!("{}", math::add(3, 4));
    println!("{}", math::multiply(3, 4));
    // math::internal_helper(); // Error: function is private
}
```

By default, everything in a module is **private**. Use `pub` to make items accessible from outside the module.

### Nested modules

Modules can be nested:

```rust
mod network {
    pub mod http {
        pub fn get(url: &str) -> String {
            format!("GET {url}")
        }
    }

    pub mod tcp {
        pub fn connect(addr: &str) -> String {
            format!("Connected to {addr}")
        }
    }
}

fn main() {
    println!("{}", network::http::get("https://example.com"));
    println!("{}", network::tcp::connect("127.0.0.1:8080"));
}
```

## Visibility rules

| Keyword         | Visibility                                    |
|----------------|-----------------------------------------------|
| (nothing)      | Private to the current module                 |
| `pub`          | Public -- accessible from anywhere            |
| `pub(crate)`   | Public within the current crate only          |
| `pub(super)`   | Public to the parent module                   |

```rust
mod outer {
    pub mod inner {
        pub fn public_fn() {}
        pub(crate) fn crate_only() {}
        pub(super) fn parent_only() {}
        fn private_fn() {}
    }

    pub fn test() {
        inner::public_fn();    // OK
        inner::crate_only();   // OK (same crate)
        inner::parent_only();  // OK (we are the parent)
        // inner::private_fn(); // Error: private
    }
}
```

## The use keyword

Typing full paths like `network::http::get` gets tedious. `use` brings items into scope:

```rust
mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }
}

use math::add;

fn main() {
    println!("{}", add(3, 4)); // No need for math:: prefix
}
```

### use with aliases

```rust
use std::collections::HashMap as Map;

fn main() {
    let mut m = Map::new();
    m.insert("key", "value");
    println!("{:?}", m);
}
```

### Grouping use statements

```rust
use std::collections::{HashMap, HashSet, BTreeMap};
use std::io::{self, Read, Write};
```

`use std::io::{self, Read}` imports both `std::io` (the module itself) and `std::io::Read`.

## File-based modules

For real projects, you put modules in separate files. Rust maps the module tree to the file system.

### Method 1 -- a file per module

```text
src/
├── main.rs
├── math.rs
└── network.rs
```

`src/main.rs`:

```rust
mod math;
mod network;

fn main() {
    println!("{}", math::add(3, 4));
    println!("{}", network::connect("localhost"));
}
```

`src/math.rs`:

```rust
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

`src/network.rs`:

```rust
pub fn connect(addr: &str) -> String {
    format!("Connected to {addr}")
}
```

`mod math;` tells Rust to look for `src/math.rs` (or `src/math/mod.rs`).

### Method 2 -- a directory with mod.rs

For modules with sub-modules, use a directory:

```text
src/
├── main.rs
└── network/
    ├── mod.rs
    ├── http.rs
    └── tcp.rs
```

`src/network/mod.rs`:

```rust
pub mod http;
pub mod tcp;
```

`src/network/http.rs`:

```rust
pub fn get(url: &str) -> String {
    format!("GET {url}")
}
```

### Method 3 -- directory with named file (modern style)

Instead of `mod.rs`, you can use a file named after the module:

```text
src/
├── main.rs
├── network.rs        ← declares sub-modules
└── network/
    ├── http.rs
    └── tcp.rs
```

`src/network.rs`:

```rust
pub mod http;
pub mod tcp;
```

This is the modern convention -- it avoids having many files all named `mod.rs`.

## Re-exports with pub use

Re-exports let you expose items from sub-modules at a higher level:

```rust
mod internal {
    pub mod math {
        pub fn add(a: i32, b: i32) -> i32 {
            a + b
        }
    }
}

pub use internal::math::add;

fn main() {
    println!("{}", add(3, 4)); // Short path
}
```

This is how library crates create a clean public API -- internal structure can be deeply nested while the public
interface stays flat.

## Binary vs library crates

| Crate type | Entry point     | Created with         | Produces        |
|-----------|-----------------|----------------------|-----------------|
| Binary    | `src/main.rs`   | `cargo new my-app`   | An executable   |
| Library   | `src/lib.rs`    | `cargo new my-lib --lib` | A `.rlib` file |

A package can have **both**: one `src/main.rs` (binary) and one `src/lib.rs` (library).

### Creating a library crate

```bash
cargo new my-lib --lib
```

`src/lib.rs`:

```rust
pub fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}
```

Other crates can depend on this library.

## Cargo.toml -- managing dependencies

### Adding dependencies

```toml
[package]
name = "my-app"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
```

Or use the `cargo add` command:

```bash
cargo add serde --features derive
cargo add serde_json
cargo add tokio --features full
```

`cargo add` modifies `Cargo.toml` for you and fetches the latest compatible version.

### Version syntax

| Syntax     | Meaning                        | Example                |
|-----------|--------------------------------|------------------------|
| `"1"`     | Any 1.x.y (SemVer compatible) | 1.0.0, 1.5.3, 1.99.0  |
| `"1.2"`   | Any 1.2.x                     | 1.2.0, 1.2.15         |
| `"1.2.3"` | Any compatible (^1.2.3)       | 1.2.3, 1.3.0, 1.99.0  |
| `"=1.2.3"`| Exactly this version           | 1.2.3 only            |

Rust uses **SemVer** (Semantic Versioning): `MAJOR.MINOR.PATCH`. Cargo automatically picks the latest compatible
version within the specified range.

### Cargo.lock

`Cargo.lock` records the exact versions resolved for every dependency. It ensures reproducible builds:

- **Applications**: Commit `Cargo.lock` to version control
- **Libraries**: Do not commit `Cargo.lock` (let consumers resolve versions)

## Using external crates

Once a dependency is in `Cargo.toml`, use it with `use`:

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
struct Config {
    host: String,
    port: u16,
}

fn main() {
    let config = Config {
        host: String::from("localhost"),
        port: 8080,
    };

    let json = serde_json::to_string_pretty(&config).unwrap();
    println!("{json}");

    let parsed: Config = serde_json::from_str(&json).unwrap();
    println!("{:?}", parsed);
}
```

## Feature flags

Crates can have optional features that enable extra functionality:

```toml
[dependencies]
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["rt-multi-thread", "macros"] }
```

Without `features = ["derive"]`, the `#[derive(Serialize)]` macro would not be available. Feature flags keep crate
compile times small by only including what you need.

## Workspaces

For large projects with multiple related crates, use a **workspace**:

```text
my-workspace/
├── Cargo.toml        ← workspace root
├── app/              ← binary crate
│   ├── Cargo.toml
│   └── src/main.rs
├── core/             ← library crate
│   ├── Cargo.toml
│   └── src/lib.rs
└── utils/            ← library crate
    ├── Cargo.toml
    └── src/lib.rs
```

Root `Cargo.toml`:

```toml
[workspace]
members = ["app", "core", "utils"]
```

Benefits:
- Shared `target/` directory (faster builds)
- Shared `Cargo.lock` (consistent dependency versions)
- Build all crates with `cargo build` from the root

## Exploring crates.io

[crates.io](https://crates.io/) is the public registry for Rust crates. Some essential crates every Rust developer
should know:

| Crate          | Purpose                              |
|---------------|--------------------------------------|
| `serde`       | Serialization/deserialization        |
| `serde_json`  | JSON support                         |
| `tokio`       | Async runtime                        |
| `clap`        | CLI argument parsing                 |
| `anyhow`      | Easy error handling (applications)   |
| `thiserror`   | Custom error types (libraries)       |
| `reqwest`     | HTTP client                          |
| `tracing`     | Structured logging                   |
| `rand`        | Random number generation             |
| `chrono`      | Date and time                        |
| `regex`       | Regular expressions                  |

Check [docs.rs](https://docs.rs/) for auto-generated documentation of any crate.

## Summary

- **Modules** (`mod`) organize code into namespaces within a crate
- Everything is **private by default** -- use `pub` to expose items
- **`use`** brings items into scope to avoid long paths
- File-based modules map `mod foo;` to `src/foo.rs` or `src/foo/mod.rs`
- **Re-exports** (`pub use`) create clean public APIs
- A crate is either a **binary** (`src/main.rs`) or a **library** (`src/lib.rs`)
- **Cargo.toml** declares dependencies; `cargo add` is the easiest way to add them
- **Feature flags** enable optional crate functionality
- **Workspaces** manage multi-crate projects
- **crates.io** is the public registry; **docs.rs** hosts documentation

Next up: [Traits & Generics](./11-traits-and-generics.md) -- defining shared behavior with traits, writing generic
code, and understanding the standard library's most important traits.
