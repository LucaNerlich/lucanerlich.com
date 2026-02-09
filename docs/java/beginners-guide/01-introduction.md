---
title: "Introduction & Environment Setup"
sidebar_label: "Introduction"
description: What Java is, how the JDK/JRE/JVM relate, installing the JDK, compiling and running your first program, and choosing an IDE.
slug: /java/beginners-guide/introduction
tags: [java, beginners]
keywords:
  - java introduction
  - learn java
  - jdk install
  - javac
  - hello world java
sidebar_position: 1
---

# Introduction & Environment Setup

Java is one of the most widely used programming languages in the world. It powers Android apps, enterprise backends, cloud services, and everything in between. This guide takes you from zero to deploying a REST API on a VPS — no prior Java experience required.

## What is Java?

Java is a **statically typed, compiled, object-oriented** programming language. That means:

1. **Statically typed** — you declare the type of every variable. The compiler catches type errors before the program runs.
2. **Compiled** — you turn source code (`.java` files) into bytecode (`.class` files) before running it.
3. **Object-oriented** — code is organized into classes and objects (covered in chapter 5).

Java was created in 1995 by James Gosling at Sun Microsystems. Its design philosophy is **"write once, run anywhere"** — compiled Java code runs on any platform that has a Java Virtual Machine.

## JDK, JRE, JVM — what is what?

These three terms come up constantly. Here is what they mean:

```text
┌──────────────────────────────── JDK ────────────────────────────────┐
│                                                                     │
│   Development tools: javac (compiler), jar, javadoc, jshell, ...   │
│                                                                     │
│   ┌──────────────────────────── JRE ────────────────────────────┐   │
│   │                                                             │   │
│   │   Standard library (java.lang, java.util, java.io, ...)    │   │
│   │                                                             │   │
│   │   ┌──────────────────────── JVM ────────────────────────┐   │   │
│   │   │                                                     │   │   │
│   │   │   Runs bytecode (.class files)                      │   │   │
│   │   │   Handles memory (garbage collection)               │   │   │
│   │   │   Platform-specific (one per OS/architecture)       │   │   │
│   │   │                                                     │   │   │
│   │   └─────────────────────────────────────────────────────┘   │   │
│   │                                                             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Component | What it is | Who needs it |
|-----------|-----------|--------------|
| **JVM** | The virtual machine that executes Java bytecode | Everyone running Java |
| **JRE** | JVM + standard libraries | Users running Java programs |
| **JDK** | JRE + development tools (`javac`, `jar`, etc.) | Developers writing Java |

You need the **JDK** — it includes everything.

## How Java code runs

Unlike languages like Python or JavaScript, Java has an explicit compilation step:

```text
Hello.java  →  javac  →  Hello.class  →  java  →  Output
 (source)     (compile)   (bytecode)     (run)
```

1. You write source code in a `.java` file.
2. `javac` (the Java compiler) compiles it into **bytecode** — a `.class` file.
3. `java` (the JVM launcher) runs the bytecode.

The bytecode is platform-independent. The same `.class` file runs on Windows, macOS, and Linux — as long as a JVM is installed.

## Installing the JDK

Download and install the latest **LTS** (Long Term Support) version. As of this writing, that is **Java 21**.

### macOS (with Homebrew)

```bash
brew install openjdk@21
```

After installation, follow the instructions Homebrew prints to add it to your `PATH`. Typically:

```bash
sudo ln -sfn $(brew --prefix)/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

### Windows

Download the installer from [Adoptium](https://adoptium.net/) (Eclipse Temurin) and run it. Make sure to check "Add to PATH" during installation.

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install openjdk-21-jdk -y
```

### Verify the installation

Open a terminal and run:

```bash
java --version
```

Result:
```text
openjdk 21.0.2 2024-01-16
OpenJDK Runtime Environment (build 21.0.2+13)
OpenJDK 64-Bit Server VM (build 21.0.2+13, mixed mode)
```

The exact version may differ — anything Java 17 or higher is fine for this guide.

Also check the compiler:

```bash
javac --version
```

Result:
```text
javac 21.0.2
```

## Choosing an IDE

Java is verbose enough that a good IDE makes a big difference. Popular choices:

| IDE | Notes |
|-----|-------|
| **IntelliJ IDEA Community** | Free, best Java IDE, excellent refactoring and debugging |
| **IntelliJ IDEA Ultimate** | Paid, adds web/enterprise features |
| **VS Code** | Free, lightweight, needs the Java extension pack |
| **Eclipse** | Free, traditional, large plugin ecosystem |

If you have no preference, start with [IntelliJ IDEA Community Edition](https://www.jetbrains.com/idea/download/) — it is free and has the best Java tooling.

For this guide, all examples are compiled and run from the terminal so you can use any editor.

## Your first Java program

Create a file called `Hello.java`:

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}
```

Compile it:

```bash
javac Hello.java
```

This creates `Hello.class` in the same directory. Run it:

```bash
java Hello
```

Result:
```text
Hello, world!
```

### Anatomy of the program

Let us break down every part:

```java
public class Hello {                    // 1. Class declaration
    public static void main(String[] args) {  // 2. Main method
        System.out.println("Hello, world!");  // 3. Print statement
    }
}
```

1. **`public class Hello`** — every Java file contains a class. The class name must match the filename (`Hello.java` → `class Hello`). `public` means other classes can access it.

2. **`public static void main(String[] args)`** — the entry point. The JVM looks for this exact signature when you run the program.
   - `public` — accessible from outside the class
   - `static` — belongs to the class itself, not to an instance (more on this in chapter 5)
   - `void` — returns nothing
   - `main` — the method name the JVM looks for
   - `String[] args` — command-line arguments as an array of strings

3. **`System.out.println("Hello, world!")`** — prints text to the terminal followed by a newline.

### `println` vs `print`

```java
public class PrintDemo {
    public static void main(String[] args) {
        System.out.println("Line 1"); // prints + newline
        System.out.println("Line 2");
        System.out.print("No ");      // prints without newline
        System.out.print("newline ");
        System.out.println("here");
    }
}
```

Result:
```text
Line 1
Line 2
No newline here
```

## One file, one public class

Java enforces a strict rule: **each `.java` file can contain at most one `public` class**, and the filename must match that class name.

```java
// File: Calculator.java — the filename MUST be Calculator.java
public class Calculator {
    public static void main(String[] args) {
        System.out.println("Calculator");
    }
}
```

If the filename does not match, `javac` will refuse to compile:

```text
error: class Calculator is public, should be declared in a file named Calculator.java
```

## Packages

Packages organize classes into namespaces. They match the directory structure:

```text
src/
└── com/
    └── example/
        └── app/
            └── Main.java
```

```java
package com.example.app;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from a package!");
    }
}
```

Compile and run from the `src/` directory:

```bash
javac com/example/app/Main.java
java com.example.app.Main
```

Result:
```text
Hello from a package!
```

For the early chapters of this guide, we will skip packages to keep things simple. We introduce them properly in the project chapters.

## Comments

```java
// Single-line comment

/*
 * Multi-line comment.
 * Can span several lines.
 */

/**
 * Javadoc comment — used to generate documentation.
 * Placed before classes, methods, and fields.
 *
 * @param name the user's name
 * @return a greeting string
 */
public static String greet(String name) {
    return "Hello, " + name;
}
```

Use comments to explain **why**, not **what**. The code should be clear enough to explain what it does.

## Semicolons, braces, and whitespace

Java requires:
- A **semicolon** `;` at the end of every statement
- **Curly braces** `{}` to define blocks (class bodies, method bodies, loops, etc.)

Whitespace (spaces, tabs, newlines) is ignored by the compiler, but consistent indentation is essential for readability. The Java convention is **4 spaces per indent level** (not tabs).

```java
// Good — readable
public class Example {
    public static void main(String[] args) {
        if (true) {
            System.out.println("Indented correctly");
        }
    }
}

// Legal but unreadable
public class Example{public static void main(String[] args){if(true){System.out.println("Don't do this");}}}
```

## `jshell` — interactive Java

Java includes `jshell`, an interactive REPL (Read-Eval-Print Loop) for quick experiments:

```bash
jshell
```

```text
|  Welcome to JShell -- Version 21.0.2
|  For an introduction type: /help intro

jshell> System.out.println("Hello from jshell!")
Hello from jshell!

jshell> int x = 10;
x ==> 10

jshell> x * 3
$3 ==> 30

jshell> /exit
|  Goodbye
```

`jshell` is useful for trying things out. You do not need a class or `main` method — just type expressions.

## How this guide is structured

| Part | Chapters | What you will learn |
|------|----------|-------------------|
| **1 — Fundamentals** | 1–6 | Variables, types, control flow, methods, OOP (classes, inheritance, interfaces) |
| **2 — Working with Data** | 7–9 | Collections, error handling, file I/O |
| **3 — Build & Deploy** | 10–12 | CLI task manager, REST API, deploy to a VPS with nginx |

Each chapter builds on the previous one. Code examples include expected output so you can verify your work. By chapter 12, you will have a running REST API on the internet.

## Summary

- Java is a statically typed, compiled, object-oriented language.
- The **JDK** includes the compiler (`javac`), the JVM (`java`), and standard libraries.
- Install the latest LTS version (Java 21+) and use any IDE — IntelliJ IDEA Community is recommended.
- Java source (`.java`) is compiled to bytecode (`.class`), then run by the JVM.
- Every program needs a `public static void main(String[] args)` method.
- The filename must match the public class name.
- Use `jshell` for quick experiments.

Next up: [Variables, Types & Operators](./02-variables-and-types.md) — how Java handles data.
