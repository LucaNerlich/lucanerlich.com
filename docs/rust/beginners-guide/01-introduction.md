---
title: "Introduction & Environment Setup"
sidebar_label: "Introduction"
description: What Rust is, why it exists, how it compares to other languages, installing the toolchain with rustup, writing your first program, understanding Cargo, setting up your editor, and reading compiler errors.
slug: /rust/beginners-guide/introduction
tags: [rust, beginners]
keywords:
  - rust introduction
  - learn rust
  - rustup install
  - cargo basics
  - hello world rust
  - rust beginner
sidebar_position: 1
---

# Introduction & Environment Setup

Rust is a systems programming language focused on **safety**, **speed**, and **concurrency**. This guide takes you from
zero Rust knowledge to deploying a REST API on a VPS -- step by step, no prior Rust experience required.

## How this guide is structured

| Part                              | Chapters | What you will learn                                              |
|-----------------------------------|----------|------------------------------------------------------------------|
| **1 -- Getting Started**          | 1--4     | Install Rust, variables, control flow, functions                 |
| **2 -- The Ownership System**     | 5--7     | Ownership, borrowing, structs, enums, pattern matching           |
| **3 -- Building Blocks**          | 8--10    | Collections, error handling, modules and crates                  |
| **4 -- Intermediate Concepts**    | 11--13   | Traits, generics, lifetimes, iterators, closures                 |
| **5 -- Real-World Rust**          | 14--16   | CLI project, testing, concurrency                                |
| **6 -- Production**               | 17--18   | REST API with Actix Web, deployment to a VPS with nginx & Docker |
| **7 -- Practice**                 | 19       | Eight project ideas from beginner to advanced                    |

By the end you will have built a CLI task manager and a REST API -- and you will know how to compile, test, and deploy
Rust programs in production. Chapter 19 suggests further projects to solidify your skills.

## What is Rust?

Rust is a **compiled, statically typed** language created by Mozilla and first released in 2015. It was designed to give
you the performance of C and C++ without the memory bugs that plague those languages.

Three things define Rust:

1. **Memory safety without garbage collection** -- Rust prevents null pointer dereferences, use-after-free, and data
   races at compile time. No garbage collector runs at runtime.
2. **Zero-cost abstractions** -- high-level features (iterators, generics, pattern matching) compile down to code that
   is just as fast as hand-written low-level code.
3. **Fearless concurrency** -- the type system prevents data races, so you can write multi-threaded code with
   confidence.

Rust has been the **most loved programming language** on the Stack Overflow Developer Survey for multiple years running.
It is used in production by companies like Mozilla (Firefox), Cloudflare, Discord, Dropbox, Microsoft, Amazon (AWS), and
Google (Android, Chromium).

## How Rust compares to other languages

If you are coming from another language, this table helps set expectations:

| Aspect              | Rust                            | C / C++                       | Java                        | Python                        |
|---------------------|---------------------------------|-------------------------------|-----------------------------|-------------------------------|
| **Memory mgmt**     | Ownership system (compile-time) | Manual (malloc/free, new/del) | Garbage collector           | Garbage collector             |
| **Performance**     | Native machine code             | Native machine code           | JVM bytecode (JIT)          | Interpreted (slow)            |
| **Type system**     | Static, strong, inferred        | Static, weak                  | Static, strong              | Dynamic, strong               |
| **Null safety**     | No null -- uses `Option<T>`     | Null pointers everywhere      | Null pointers everywhere    | `None` (runtime errors)       |
| **Concurrency**     | Compile-time data race safety   | Manual (easy to get wrong)    | Threads + synchronized      | GIL limits true parallelism   |
| **Compile speed**   | Slower than C, faster than C++  | Fast (C), slow (C++)          | Fast                        | No compilation step           |
| **Learning curve**  | Steep (ownership, lifetimes)    | Steep (manual memory)         | Moderate                    | Gentle                        |
| **Error handling**  | `Result<T, E>` (no exceptions) | Return codes / exceptions     | Exceptions                  | Exceptions                    |

The biggest adjustment for most beginners is the **ownership system** -- Rust's approach to memory management. We cover
it thoroughly in chapter 5. For now, just know that the Rust compiler is strict, and that is a good thing. It catches
bugs that would be runtime crashes in other languages.

## Prerequisites

Before we start, make sure you have:

- **A computer** running macOS, Linux, or Windows (with WSL2 recommended on Windows)
- **A terminal** -- Terminal.app on macOS, any terminal emulator on Linux, or Windows Terminal with WSL2
- **A text editor** -- we will set up VS Code with rust-analyzer shortly
- **Basic command line knowledge** -- navigating directories, running commands

You do **not** need to know C, C++, or any other systems language. This guide assumes no prior Rust experience.

## Install Rust with rustup

Rust is installed and managed through **rustup**, the official toolchain installer. It handles the compiler (`rustc`),
the package manager (`cargo`), and the standard library.

### macOS and Linux

Open your terminal and run:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the prompts -- the default installation is fine. When it finishes, restart your terminal (or run
`source $HOME/.cargo/env`) and verify:

```bash
rustc --version
cargo --version
```

You should see version numbers for both. At the time of writing, the latest stable release is Rust 1.84.

### Windows

On Windows, the recommended approach is to use WSL2 (Windows Subsystem for Linux) and then install Rust inside WSL
using the same curl command above. This gives you a Linux environment that works identically to the examples in this
guide.

If you prefer native Windows, download and run the installer from [rustup.rs](https://rustup.rs). You will also need
the Visual Studio C++ Build Tools.

### What rustup installed

After installation, you have three tools:

| Tool       | What it does                                                |
|------------|-------------------------------------------------------------|
| `rustup`   | Manages Rust versions and components (update, switch, etc.) |
| `rustc`    | The Rust compiler -- turns `.rs` files into executables      |
| `cargo`    | Package manager and build tool -- your main interface to Rust |

You will almost never call `rustc` directly. Instead, you use `cargo`, which calls `rustc` for you and handles
dependencies, building, testing, and more.

### Keeping Rust up to date

Rust releases a new stable version every six weeks. Update with:

```bash
rustup update
```

## Hello, World

Let's write and run your first Rust program -- without Cargo first, so you can see what happens under the hood.

### The manual way (rustc)

Create a file called `main.rs`:

```rust
fn main() {
    println!("Hello, world!");
}
```

Compile and run it:

```bash
rustc main.rs
./main
```

Output:

```text
Hello, world!
```

What just happened:

1. `rustc` compiled `main.rs` into a native binary called `main` (or `main.exe` on Windows).
2. You ran the binary directly -- no virtual machine, no interpreter, no runtime.
3. `fn main()` is the entry point of every Rust program.
4. `println!` is a **macro** (note the `!`). It prints text to the terminal. We will explain macros later -- for now,
   treat it like a function.

### The Cargo way (recommended)

For anything beyond a single file, you use Cargo. Let's create a proper project:

```bash
cargo new hello-rust
cd hello-rust
```

This creates the following structure:

```text
hello-rust/
├── Cargo.toml
└── src/
    └── main.rs
```

| File          | Purpose                                                        |
|---------------|----------------------------------------------------------------|
| `Cargo.toml`  | Project metadata and dependencies (like `package.json` or `pom.xml`) |
| `src/main.rs` | Your source code -- the entry point                            |

Open `src/main.rs` -- Cargo already generated a Hello World program for you:

```rust
fn main() {
    println!("Hello, world!");
}
```

Run it:

```bash
cargo run
```

Output:

```text
   Compiling hello-rust v0.1.0 (/path/to/hello-rust)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.50s
     Running `target/debug/hello-rust`
Hello, world!
```

`cargo run` compiles your code and runs the resulting binary in one step. The compiled binary is stored in
`target/debug/`.

## Understanding Cargo.toml

Open the `Cargo.toml` file:

```toml
[package]
name = "hello-rust"
version = "0.1.0"
edition = "2021"

[dependencies]
```

| Field          | Meaning                                                    |
|----------------|------------------------------------------------------------|
| `name`         | The project name (also the binary name)                    |
| `version`      | Your project's version (semantic versioning)               |
| `edition`      | The Rust edition (2015, 2018, 2021, 2024) -- use the latest |
| `[dependencies]` | External libraries (called **crates**) go here           |

> **Tip:** The `edition` field controls which language features are available. It does **not** affect which compiler
> version you use. Always use the latest edition for new projects.

## Essential Cargo commands

You will use these constantly:

| Command             | What it does                                                |
|---------------------|-------------------------------------------------------------|
| `cargo new <name>`  | Create a new project                                        |
| `cargo run`         | Compile and run (development mode)                          |
| `cargo build`       | Compile without running                                     |
| `cargo build --release` | Compile with optimizations (for production)             |
| `cargo check`       | Check for errors without producing a binary (fast)          |
| `cargo test`        | Run all tests                                               |
| `cargo fmt`         | Format your code (install with `rustup component add rustfmt`) |
| `cargo clippy`      | Run the linter (install with `rustup component add clippy`) |
| `cargo doc --open`  | Generate and open documentation for your project            |

> **Tip:** `cargo check` is much faster than `cargo build` because it skips code generation. Use it frequently while
> developing to catch errors early.

## Set up your editor

### VS Code with rust-analyzer

The recommended setup is **Visual Studio Code** with the **rust-analyzer** extension:

1. Install [VS Code](https://code.visualstudio.com/)
2. Open the Extensions panel (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Search for **rust-analyzer** and install it
4. Open your `hello-rust` project folder in VS Code

rust-analyzer gives you:

- **Real-time error checking** -- errors appear as you type, before you compile
- **Code completion** -- type suggestions, method completions, import suggestions
- **Inline type hints** -- shows inferred types next to variables
- **Go to definition** -- click through to any function, type, or crate
- **Refactoring** -- rename symbols, extract functions

### Other editors

- **IntelliJ IDEA / CLion** -- use the official Rust plugin
- **Neovim / Helix** -- use rust-analyzer as an LSP server
- **Zed** -- has built-in Rust support

Any editor with rust-analyzer support will work. The examples in this guide are editor-agnostic.

## Project structure explained

After running `cargo run`, your project looks like this:

```text
hello-rust/
├── Cargo.toml          # Project manifest
├── Cargo.lock          # Exact dependency versions (auto-generated)
├── src/
│   └── main.rs         # Your source code
└── target/             # Build artifacts (auto-generated, gitignored)
    └── debug/
        └── hello-rust  # Your compiled binary
```

| Item          | Purpose                                                     |
|---------------|-------------------------------------------------------------|
| `Cargo.lock`  | Locks exact dependency versions for reproducible builds     |
| `target/`     | All build output -- never edit, never commit to git         |
| `src/`        | All your Rust source files go here                          |

> **Important:** Add `target/` to your `.gitignore`. Cargo generates a `.gitignore` for you when you create a project
> with `cargo new`, but always verify it is there.

## Reading compiler errors

The Rust compiler is famously strict -- and famously helpful. Let's intentionally write broken code to see what happens.

Change `src/main.rs` to:

```rust
fn main() {
    let greeting = "Hello";
    greeting = "Goodbye";
    println!("{greeting}");
}
```

Run `cargo check`:

```text
error[E0384]: cannot assign twice to immutable variable `greeting`
 --> src/main.rs:3:5
  |
2 |     let greeting = "Hello";
  |         --------
  |         |
  |         first assignment to `greeting`
  |         help: consider making this binding mutable: `mut greeting`
3 |     greeting = "Goodbye";
  |     ^^^^^^^^ cannot assign twice to immutable variable

For more information about this error, try `rustc --explain E0384`.
```

Read this error carefully -- it tells you:

1. **What went wrong** -- you tried to reassign an immutable variable
2. **Where it happened** -- file, line, and column
3. **How to fix it** -- `consider making this binding mutable: mut greeting`
4. **How to learn more** -- `rustc --explain E0384` gives a detailed explanation

This is one of Rust's greatest strengths: the compiler does not just tell you something is wrong, it tells you **how to
fix it**. When you are learning, **read the full error message**. Resist the urge to just look at the first line.

> **Tip:** Run `rustc --explain E0384` (or any error code) for a detailed explanation with examples. This is one of the
> best learning resources built right into the compiler.

### Common beginner errors you will see

| Error                    | What it means                                        | Typical fix                          |
|--------------------------|------------------------------------------------------|--------------------------------------|
| `E0384`                  | Reassigning an immutable variable                    | Add `mut` to the binding             |
| `E0382`                  | Using a value after it has been moved                | Clone the value or use a reference   |
| `E0308`                  | Type mismatch                                        | Fix the type annotation or conversion |
| `E0425`                  | Variable not found in scope                          | Check spelling, check scope          |
| `E0277`                  | A trait bound is not satisfied                       | Implement the required trait          |

Do not memorize these -- the compiler will guide you. This table is just to show you that errors have patterns, and they
become familiar quickly.

## Your first real program

Let's write something slightly more interesting. Replace `src/main.rs` with:

```rust
fn main() {
    let name = "Rustacean";
    let year = 2015;
    let current_year = 2026;
    let age = current_year - year;

    println!("Hello, {name}!");
    println!("Rust was first released in {year}.");
    println!("That was {age} years ago.");
}
```

Run it:

```bash
cargo run
```

```text
Hello, Rustacean!
Rust was first released in 2015.
That was 11 years ago.
```

Things to notice:

- Variables are declared with `let`
- Rust infers the types (`name` is `&str`, `year` is `i32`)
- `println!` uses `{variable_name}` for inline formatting -- no need for placeholder indices
- Variables are **immutable by default** -- you cannot reassign `name` without `mut`

We will explore variables and types in depth in the next chapter.

## The Rust ecosystem at a glance

A few terms you will encounter:

| Term        | Meaning                                                          |
|-------------|------------------------------------------------------------------|
| **Crate**   | A Rust package -- either a library or a binary                   |
| **Cargo**   | The build tool and package manager                               |
| **crates.io** | The public registry of open-source crates (like npm or Maven Central) |
| **rustup**  | The toolchain manager (install, update, switch Rust versions)    |
| **rustc**   | The compiler                                                     |
| **rustfmt** | The official code formatter                                      |
| **clippy**  | The official linter (catches common mistakes and suggests improvements) |
| **docs.rs** | Auto-generated documentation for every crate on crates.io        |

## Useful resources

- [The Rust Programming Language book](https://doc.rust-lang.org/book/) -- the official free book (often called "the book")
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) -- learn by reading annotated examples
- [Rust Playground](https://play.rust-lang.org/) -- run Rust code in your browser without installing anything
- [crates.io](https://crates.io/) -- search for libraries
- [docs.rs](https://docs.rs/) -- documentation for any published crate

## Summary

You now have:

- Rust installed via `rustup` with `rustc` and `cargo`
- A Hello World project created with `cargo new`
- An editor set up with rust-analyzer for real-time feedback
- An understanding of the project structure (`Cargo.toml`, `src/`, `target/`)
- Experience reading and understanding compiler errors

The compiler is your best teacher in Rust. It is strict, but its error messages are some of the best in any programming
language. Trust it.

Next up: [Variables & Types](./02-variables-and-types.md) -- declaring variables, understanding immutability, scalar and
compound types, type inference, and shadowing.
