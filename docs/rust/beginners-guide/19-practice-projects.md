---
title: "Practice Projects"
sidebar_label: "Practice Projects"
description: Eight hands-on project ideas -- from beginner to advanced -- to reinforce everything you learned in the Rust Beginners Guide.
slug: /rust/beginners-guide/practice-projects
tags: [rust, beginners, projects]
keywords:
  - rust project ideas
  - rust practice
  - rust learning projects
  - rust beginner projects
  - rust portfolio
sidebar_position: 19
---

# Practice Projects

You have finished the guide. The best way to make the knowledge stick is to build something on your own. This chapter
proposes eight projects of increasing difficulty. Each one tells you what to build, which chapters it draws from, and
enough hints to get started - but the implementation is up to you. Figuring out the details is where the real learning
happens.

Pick one that interests you and start building.

| Difficulty       | Project                         | Key chapters | Time estimate |
|------------------|---------------------------------|-------------|---------------|
| **Beginner**     | Guess the Number                | 1-4        | 1-2 hours    |
| **Beginner**     | Unit Converter                  | 2-4, 6     | 2-3 hours    |
| **Intermediate** | Markdown to HTML Converter      | 5, 8, 9, 10 | 4-8 hours    |
| **Intermediate** | Personal Expense Tracker (CLI)  | 6-9, 14    | 4-8 hours    |
| **Intermediate** | File Duplicate Finder           | 8, 9, 13, 16 | 4-6 hours   |
| **Advanced**     | Chat Server                     | 9, 11, 16   | 8-12 hours   |
| **Advanced**     | Static Site Generator           | 8-11, 13   | 10-16 hours  |
| **Advanced**     | HTTP Load Tester                | 11, 13, 16, 17 | 8-12 hours |

---

## Beginner projects

These projects reinforce the fundamentals: variables, control flow, functions, and basic I/O. You should be comfortable
with chapters 1-6 before starting.

### Project 1 - Guess the Number

**Difficulty:** Beginner | **Chapters:** 1-4 | **Time:** 1-2 hours

Build a terminal game where the computer picks a random number and the player guesses until they find it. This is the
classic first Rust project.

#### What you will build

- A program that generates a random number between 1 and 100
- A loop that reads user input, parses it to a number, and compares it to the secret
- Feedback after each guess: "too high", "too low", or "correct!"
- A count of how many attempts it took

#### Skills practiced

- Reading user input with `std::io::stdin().read_line()`
- Parsing strings to numbers with `.parse::<u32>()`
- `loop`, `match`, and `break` (chapter 3)
- Using an external crate (`rand`) for random number generation (chapter 10)

#### Hints

- Add `rand` as a dependency: `cargo add rand`
- Generate the number with `rand::random_range(1..=100)`
- `read_line` appends a newline - use `.trim()` before parsing
- Handle the `Err` case from `.parse()` gracefully (print "please enter a number" and `continue`)
- Track attempts with a `mut` counter

#### Stretch goals

- Add difficulty levels (easy: 1-50, medium: 1-100, hard: 1-1000)
- Let the player choose the range
- Store high scores (fewest guesses) in a file with `serde_json`

---

### Project 2 - Unit Converter

**Difficulty:** Beginner | **Chapters:** 2-4, 6 | **Time:** 2-3 hours

Build a CLI tool that converts between units: temperature, distance, weight, and more. Focus on clean code with enums,
structs, and well-named functions.

#### What you will build

- Support for at least three unit categories: temperature (C/F/K), distance (km/miles/meters/feet), and weight
  (kg/lbs/grams/ounces)
- A simple CLI interface: the user enters a value, source unit, and target unit
- Clear output with formatted results

#### Skills practiced

- Enums for unit categories and individual units (chapter 6)
- `match` for dispatching conversion logic (chapter 3, 7)
- Functions with clear signatures (chapter 4)
- `impl` blocks with methods (chapter 6)
- Parsing user input

#### Hints

- Model units as enums: `enum Temperature { Celsius, Fahrenheit, Kelvin }`
- Write conversion functions like `fn convert(value: f64, from: &Unit, to: &Unit) -> Result<f64, String>`
- Use a top-level `enum Category { Temperature, Distance, Weight }` to organize the menu
- For parsing user input, `match input.trim().to_lowercase().as_str()` is useful

#### Stretch goals

- Add `clap` for proper argument parsing (`convert 100 km miles`)
- Support chained conversions (e.g., Celsius to Kelvin to Fahrenheit)
- Add currency conversion using exchange rates from a JSON file

---

## Intermediate projects

These projects require ownership thinking, error handling, file I/O, and collections. You should be comfortable with
chapters 1-13 before starting.

### Project 3 - Markdown to HTML Converter

**Difficulty:** Intermediate | **Chapters:** 5, 8, 9, 10 | **Time:** 4-8 hours

Build a tool that reads a subset of Markdown and produces HTML. This is a parsing exercise that forces you to work with
strings, ownership, and pattern matching.

#### What you will build

- Support for headings (`#`, `##`, `###`), paragraphs, bold (`**text**`), italic (`*text*`), inline code
  (`` `code` ``), code blocks (triple backticks), links (`[text](url)`), and unordered lists (`- item`)
- A CLI that reads from a file and writes HTML to stdout or a file
- Proper error handling for file I/O

#### Skills practiced

- String processing with `.lines()`, `.chars()`, `.starts_with()` (chapter 8)
- Ownership and borrowing - building a new `String` from a `&str` (chapter 5)
- Pattern matching on string content (chapter 7)
- File I/O with `std::fs` (chapter 9)
- Module organization - parser, renderer, CLI in separate modules (chapter 10)

#### Hints

- Process the input line by line. Each line can be classified: heading, list item, code fence, blank line, or paragraph
  text
- Track state: are you inside a code block? inside a list? Use an enum:
  `enum State { Normal, CodeBlock, List }`
- For inline formatting (bold, italic, code, links), write a separate function that processes a single line
- Use a `Vec<String>` to accumulate output lines, then `.join("\n")` at the end
- Do not try to handle every Markdown edge case - focus on the common patterns

#### Stretch goals

- Add support for numbered lists and blockquotes
- Add a `--watch` flag that re-converts when the source file changes
- Support YAML frontmatter and strip it from the output

---

### Project 4 - Personal Expense Tracker (CLI)

**Difficulty:** Intermediate | **Chapters:** 6-9, 14 | **Time:** 4-8 hours

Build a CLI application for tracking personal expenses. This is similar to the task manager in chapter 14 but with
richer data, filtering, and reporting.

#### What you will build

- Add expenses with amount, category, description, and date
- List expenses with optional filters (by category, date range, month)
- Summary reports: total per category, monthly totals, average daily spend
- Persistent storage in a JSON file

#### Skills practiced

- Structs with derived traits (chapter 6, 11)
- Enums for categories (chapter 6)
- `clap` for subcommands and arguments (chapter 14)
- `serde` for serialization (chapter 14)
- Iterators: `.filter()`, `.map()`, `.fold()`, `.group_by()` patterns (chapter 13)
- Error handling with `thiserror` (chapter 9)

#### Data model

```rust
enum Category {
    Food,
    Transport,
    Housing,
    Entertainment,
    Utilities,
    Other(String),
}

struct Expense {
    id: u32,
    amount: f64,
    category: Category,
    description: String,
    date: String, // YYYY-MM-DD
}
```

#### Hints

- Structure subcommands: `add`, `list`, `summary`, `remove`
- For `list --category food --month 2026-03`, parse the filters from `clap` args and chain `.filter()` calls on the
  expense iterator
- For the summary, use a `HashMap<String, f64>` to accumulate totals per category
- Store the date as a `String` in `YYYY-MM-DD` format to avoid pulling in a date library. Or use the `chrono` crate
  if you want real date parsing.

#### Stretch goals

- Add a `budget` subcommand that sets monthly budgets per category and warns when exceeded
- Export to CSV
- Add an `import` command that reads expenses from a CSV file
- Use `rusqlite` instead of JSON for storage

---

### Project 5 - File Duplicate Finder

**Difficulty:** Intermediate | **Chapters:** 8, 9, 13, 16 | **Time:** 4-6 hours

Build a tool that scans a directory tree and finds files with identical content. This project exercises file I/O,
hashing, collections, and optionally parallelism.

#### What you will build

- Recursively walk a directory and compute a hash (SHA-256 or similar) for each file
- Group files by hash and report groups with more than one file
- Display the duplicates with file paths and sizes
- Option to output as JSON

#### Skills practiced

- File system traversal with `std::fs::read_dir` or the `walkdir` crate
- Reading files with `std::fs::read` (chapter 9)
- `HashMap<String, Vec<PathBuf>>` for grouping (chapter 8)
- Iterator chaining: walk, filter, map, collect (chapter 13)
- Error handling for permission errors and symlinks (chapter 9)
- Optional: parallel hashing with threads or `rayon` (chapter 16)

#### Hints

- Start simple: read the entire file into memory and hash it. This works fine for reasonable file sizes.
- Use the `sha2` crate for hashing: `cargo add sha2`
- For large files, hash in chunks to avoid loading everything into memory
- Skip files larger than a configurable threshold
- First pass: group files by size. Only hash files that share a size with at least one other file. This dramatically
  reduces the number of hashes computed.

#### Stretch goals

- Add a `--delete` flag that interactively asks which duplicate to keep
- Parallelize hashing with `rayon` or `std::thread` for large directory trees
- Add a progress bar with the `indicatif` crate
- Support hard link detection (same inode = not a duplicate)

---

## Advanced projects

These projects combine multiple systems: networking, concurrency, traits, generics, and async. They are substantial and
may take multiple sessions to complete.

### Project 6 - Chat Server

**Difficulty:** Advanced | **Chapters:** 9, 11, 16 | **Time:** 8-12 hours

Build a simple TCP chat server where multiple clients connect, send messages, and see messages from other users in real
time.

#### What you will build

- A TCP server that accepts multiple connections concurrently
- Each client sets a username on connect
- Messages from any client are broadcast to all other connected clients
- A simple client that reads from stdin and displays incoming messages

#### Skills practiced

- TCP networking with `std::net::TcpListener` and `TcpStream`
- Concurrency: one thread per client, or async with tokio (chapter 16)
- Shared state: `Arc<Mutex<Vec<TcpStream>>>` for the client list (chapter 16)
- Message framing: how do you know where one message ends and the next begins?
- Error handling for disconnections

#### Hints

- Start with the server. `TcpListener::bind("127.0.0.1:8080")` gives you a listener. Call `.incoming()` and spawn a
  thread for each connection.
- Share the list of connected clients with `Arc<Mutex<HashMap<String, TcpStream>>>` where the key is the username
- When a message arrives from one client, iterate over all other clients and write the message to their streams.
  Handle `BrokenPipe` errors by removing disconnected clients.
- For message framing, the simplest approach is newline-delimited: each message ends with `\n`. Use `BufReader` and
  `.read_line()`.
- The client can use two threads: one reading stdin and sending to the server, one reading from the server and printing
  to stdout.

#### Stretch goals

- Add chat rooms / channels that users can join and leave
- Add private messages (`/msg username hello`)
- Switch from threads to async with `tokio::net::TcpListener`
- Add a `/users` command that lists connected users

---

### Project 7 - Static Site Generator

**Difficulty:** Advanced | **Chapters:** 8-11, 13 | **Time:** 10-16 hours

Build a minimal static site generator that turns Markdown files into a website. This is a real-world tool that exercises
file I/O, string processing, templating, traits, and project organization.

#### What you will build

- Read Markdown files from a `content/` directory
- Parse YAML frontmatter (title, date, template)
- Convert Markdown to HTML (reuse or extend Project 3, or use the `pulldown-cmark` crate)
- Apply HTML templates with placeholder substitution (`{{ title }}`, `{{ content }}`, `{{ date }}`)
- Write generated HTML to an `output/` directory, preserving the directory structure
- Generate an index page listing all posts

#### Skills practiced

- Traits: define a `Renderable` trait for pages and posts (chapter 11)
- Generics: template-engine functions that work with any `Renderable` (chapter 11)
- Module organization: parser, renderer, template engine, CLI (chapter 10)
- Iterators for processing file lists (chapter 13)
- File I/O and path manipulation (chapter 9)
- Error handling across multiple subsystems (chapter 9)

#### Hints

- Define a `Page` struct: `title`, `date`, `content_html`, `template_name`, `slug`, `source_path`
- For templates, read `.html` files from a `templates/` directory. Replace `{{ title }}` and `{{ content }}` with
  simple `.replace()` calls. A full template engine is overkill.
- Use `pulldown-cmark` for Markdown conversion: `cargo add pulldown-cmark`
- For frontmatter, split the file at `---` delimiters and parse the YAML with the `serde_yaml` crate
- Generate the index page by sorting all pages by date and rendering them into an HTML list

#### Stretch goals

- Add a `--watch` mode that rebuilds when files change (use the `notify` crate)
- Add a built-in development server with `actix-web` that serves the output directory
- Support Sass/SCSS compilation for stylesheets
- Add tag pages that list all posts with a given tag
- Add an RSS feed generator

---

### Project 8 - HTTP Load Tester

**Difficulty:** Advanced | **Chapters:** 11, 13, 16, 17 | **Time:** 8-12 hours

Build a command-line tool that sends concurrent HTTP requests to a URL and reports performance statistics. This is a
practical tool for benchmarking APIs and exercises async, concurrency, and statistics.

#### What you will build

- Accept a URL, number of total requests, and concurrency level as arguments
- Send HTTP requests concurrently using async tasks
- Collect response times, status codes, and error counts
- Report statistics: min, max, mean, median, P95, P99 response times, requests per second, error rate

#### Skills practiced

- Async programming with `tokio` (chapter 16)
- HTTP client with `reqwest` (chapter 10 crates)
- Closures and iterators for statistics calculations (chapter 13)
- Traits: define a `Reporter` trait for different output formats (chapter 11)
- `clap` for CLI arguments (chapter 14)
- Concurrency control with `tokio::sync::Semaphore`

#### Hints

- Use `reqwest` for HTTP: `cargo add reqwest --features rustls-tls`
- Use `tokio::sync::Semaphore` to limit concurrency. Acquire a permit before each request, release after.
- Collect results in a `Vec<RequestResult>` where `RequestResult` holds `duration`, `status_code`, and
  `error: Option<String>`
- For percentiles, sort the durations and index: P95 is at `sorted[len * 95 / 100]`
- Start without async - send requests sequentially first. Then add concurrency.
- Use `tokio::time::Instant` to measure request duration

#### Stretch goals

- Add support for POST requests with a JSON body from a file
- Add a `--duration` flag to run for a fixed time instead of a fixed count
- Output a latency histogram to the terminal using Unicode block characters
- Support reading URLs from a file for multi-endpoint testing
- Add a `--json` flag that outputs results as JSON for integration with other tools

---

## Tips for all projects

- **Start small.** Get the simplest version working before adding features. A "guess the number" that works is better
  than a half-finished chat server.
- **Fight the compiler, then trust it.** When the borrow checker rejects your code, read the error message carefully -
  it almost always tells you the fix. Once it compiles, you can be confident there are no data races or dangling
  references.
- **Use `cargo clippy` constantly.** Clippy catches common mistakes and suggests idiomatic improvements. Run it after
  every feature addition.
- **Write tests as you go.** Even a few `#[test]` functions for core logic save time debugging later (chapter 15).
- **Read the docs.** Every crate has documentation on [docs.rs](https://docs.rs). The Rust standard library docs are
  excellent - search for the type or method you need.
- **Commit often.** Use git to save working states. When an experiment goes wrong, `git stash` or `git checkout` gets
  you back on track.
- **Do not clone everything.** If the compiler says a value was moved, think about whether you need a reference (`&`)
  instead of `.clone()`. Reaching for `.clone()` is fine while learning, but try to remove unnecessary clones as you get
  comfortable.

You have the knowledge. Now go build something.
