---
title: "Project: CLI Task Manager"
sidebar_label: "Project: CLI Task Manager"
description: Build a complete command-line task manager in Java -- CRUD operations, file-based persistence, input validation, and packaging as a runnable JAR.
slug: /java/beginners-guide/project-cli-task-manager
tags: [java, beginners, project, cli]
keywords:
  - java cli project
  - task manager java
  - java jar
  - command line application
  - java project
sidebar_position: 10
---

# Project: CLI Task Manager

Time to put everything together. In this chapter you will build a command-line task manager that supports creating,
listing, completing, and deleting tasks -- all persisted to a file. Then you will package it as a runnable JAR.

## What we are building

A CLI tool called `tasks` with this interface:

```text
java -jar tasks.jar add "Buy groceries"
java -jar tasks.jar list
java -jar tasks.jar done 1
java -jar tasks.jar delete 1
```

Features:

- **Add** tasks with a description
- **List** all tasks (showing ID, status, and description)
- **Complete** a task by ID
- **Delete** a task by ID
- **Persist** tasks to a file between runs
- **Validate** user input and show helpful error messages

## Project structure

```text
task-manager/
├── Task.java           # Task record
├── TaskStore.java       # File persistence
├── TaskApp.java         # CLI logic and main method
└── tasks.dat            # Data file (created at runtime)
```

Create a directory called `task-manager/` and add the files below.

## Step 1: the `Task` model

A simple record representing a task:

```java
// Task.java

public record Task(int id, String description, boolean done) {

    private static final String DELIMITER = "|";

    /**
     * Serialize this task to a single line for file storage.
     */
    public String toLine() {
        return id + DELIMITER + description + DELIMITER + done;
    }

    /**
     * Deserialize a task from a stored line.
     *
     * @throws IllegalArgumentException if the line is malformed
     */
    public static Task fromLine(String line) {
        String[] parts = line.split("\\|", 3);
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid task line: " + line);
        }

        int id = Integer.parseInt(parts[0].trim());
        String description = parts[1].trim();
        boolean done = Boolean.parseBoolean(parts[2].trim());

        return new Task(id, description, done);
    }

    /**
     * Create a completed version of this task.
     */
    public Task complete() {
        return new Task(id, description, true);
    }

    @Override
    public String toString() {
        String status = done ? "[x]" : "[ ]";
        return String.format("%s %3d: %s", status, id, description);
    }
}
```

Key points:

- Records auto-generate `equals`, `hashCode`, and accessor methods
- `toLine` / `fromLine` handle serialization (pipe-delimited, one task per line)
- `complete()` returns a new `Task` with `done = true` (records are immutable)
- `toString()` formats nicely for display: `[ ]   1: Buy groceries`

## Step 2: the `TaskStore` (persistence)

Handles loading and saving tasks to a file:

```java
// TaskStore.java

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class TaskStore {

    private final Path filePath;

    public TaskStore(Path filePath) {
        this.filePath = filePath;
    }

    /**
     * Load all tasks from the file. Returns an empty list if the file
     * does not exist.
     */
    public List<Task> load() throws IOException {
        if (!Files.exists(filePath)) {
            return new ArrayList<>();
        }

        List<Task> tasks = new ArrayList<>();
        for (String line : Files.readAllLines(filePath)) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                tasks.add(Task.fromLine(trimmed));
            }
        }
        return tasks;
    }

    /**
     * Save all tasks to the file, overwriting previous content.
     */
    public void save(List<Task> tasks) throws IOException {
        List<String> lines = new ArrayList<>();
        for (Task task : tasks) {
            lines.add(task.toLine());
        }
        Files.write(filePath, lines);
    }
}
```

This is the same pattern from the File I/O chapter -- one record per line with a simple delimiter.

## Step 3: the `TaskApp` (CLI logic)

The main class that parses commands and orchestrates everything:

```java
// TaskApp.java

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

public class TaskApp {

    private static final Path DATA_FILE = Path.of("tasks.dat");
    private final TaskStore store;

    public TaskApp() {
        this.store = new TaskStore(DATA_FILE);
    }

    // ── Commands ──────────────────────────────────────────────

    void addTask(String description) throws IOException {
        List<Task> tasks = store.load();
        int nextId = tasks.stream()
                .mapToInt(Task::id)
                .max()
                .orElse(0) + 1;

        Task task = new Task(nextId, description, false);
        tasks.add(task);
        store.save(tasks);

        System.out.println("Added: " + task);
    }

    void listTasks() throws IOException {
        List<Task> tasks = store.load();

        if (tasks.isEmpty()) {
            System.out.println("No tasks yet. Add one with: add \"description\"");
            return;
        }

        long total = tasks.size();
        long completed = tasks.stream().filter(Task::done).count();

        System.out.println("Tasks (" + completed + "/" + total + " completed):");
        System.out.println("─".repeat(50));

        for (Task task : tasks) {
            System.out.println(task);
        }
    }

    void completeTask(int id) throws IOException {
        List<Task> tasks = store.load();

        boolean found = false;
        for (int i = 0; i < tasks.size(); i++) {
            if (tasks.get(i).id() == id) {
                Task completed = tasks.get(i).complete();
                tasks.set(i, completed);
                store.save(tasks);
                System.out.println("Completed: " + completed);
                found = true;
                break;
            }
        }

        if (!found) {
            System.err.println("Error: no task with ID " + id);
        }
    }

    void deleteTask(int id) throws IOException {
        List<Task> tasks = store.load();
        int sizeBefore = tasks.size();

        tasks.removeIf(task -> task.id() == id);

        if (tasks.size() == sizeBefore) {
            System.err.println("Error: no task with ID " + id);
            return;
        }

        store.save(tasks);
        System.out.println("Deleted task " + id);
    }

    // ── CLI parsing ───────────────────────────────────────────

    void run(String[] args) {
        if (args.length == 0) {
            printUsage();
            return;
        }

        String command = args[0].toLowerCase();

        try {
            switch (command) {
                case "add" -> {
                    if (args.length < 2) {
                        System.err.println("Error: missing task description");
                        System.err.println("Usage: add \"description\"");
                        return;
                    }
                    String description = String.join(" ",
                            java.util.Arrays.copyOfRange(args, 1, args.length));
                    addTask(description);
                }
                case "list" -> listTasks();
                case "done" -> {
                    if (args.length < 2) {
                        System.err.println("Error: missing task ID");
                        System.err.println("Usage: done <id>");
                        return;
                    }
                    completeTask(parseId(args[1]));
                }
                case "delete" -> {
                    if (args.length < 2) {
                        System.err.println("Error: missing task ID");
                        System.err.println("Usage: delete <id>");
                        return;
                    }
                    deleteTask(parseId(args[1]));
                }
                default -> {
                    System.err.println("Unknown command: " + command);
                    printUsage();
                }
            }
        } catch (IOException e) {
            System.err.println("File error: " + e.getMessage());
        }
    }

    private int parseId(String input) {
        try {
            return Integer.parseInt(input);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid ID: " + input + " (must be a number)");
        }
    }

    private void printUsage() {
        System.out.println("""
                Task Manager -- a simple CLI to-do list

                Usage:
                  add <description>   Add a new task
                  list                List all tasks
                  done <id>           Mark a task as completed
                  delete <id>         Delete a task

                Examples:
                  add Buy groceries
                  add "Learn Java"
                  list
                  done 1
                  delete 2
                """);
    }

    // ── Entry point ───────────────────────────────────────────

    public static void main(String[] args) {
        new TaskApp().run(args);
    }
}
```

## Step 4: compile and test

Compile all files:

```bash
cd task-manager
javac Task.java TaskStore.java TaskApp.java
```

Test each command:

```bash
java TaskApp add "Buy groceries"
```

Result:

```text
Added: [ ]   1: Buy groceries
```

```bash
java TaskApp add "Learn Java"
java TaskApp add "Build a project"
java TaskApp list
```

Result:

```text
Added: [ ]   2: Learn Java
Added: [ ]   3: Build a project
Tasks (0/3 completed):
──────────────────────────────────────────────────
[ ]   1: Buy groceries
[ ]   2: Learn Java
[ ]   3: Build a project
```

```bash
java TaskApp done 2
java TaskApp list
```

Result:

```text
Completed: [x]   2: Learn Java
Tasks (1/3 completed):
──────────────────────────────────────────────────
[ ]   1: Buy groceries
[x]   2: Learn Java
[ ]   3: Build a project
```

```bash
java TaskApp delete 1
java TaskApp list
```

Result:

```text
Deleted task 1
Tasks (1/2 completed):
──────────────────────────────────────────────────
[x]   2: Learn Java
[ ]   3: Build a project
```

```bash
java TaskApp
```

Result:

```text
Task Manager -- a simple CLI to-do list

Usage:
  add <description>   Add a new task
  list                List all tasks
  done <id>           Mark a task as completed
  delete <id>         Delete a task

Examples:
  add Buy groceries
  add "Learn Java"
  list
  done 1
  delete 2
```

## Step 5: package as a runnable JAR

A **JAR** (Java ARchive) bundles your `.class` files into a single file that can be run with `java -jar`.

### Create a manifest file

Create `MANIFEST.MF`:

```text
Main-Class: TaskApp
```

**Important:** the manifest file must end with a newline.

### Build the JAR

```bash
jar cfm tasks.jar MANIFEST.MF *.class
```

Breakdown:

- `c` -- create a new archive
- `f` -- output to a file (`tasks.jar`)
- `m` -- include a manifest file (`MANIFEST.MF`)
- `*.class` -- include all compiled class files

### Run the JAR

```bash
java -jar tasks.jar list
java -jar tasks.jar add "Deploy to VPS"
java -jar tasks.jar list
```

Result:

```text
Tasks (1/2 completed):
──────────────────────────────────────────────────
[x]   2: Learn Java
[ ]   3: Build a project
Added: [ ]   4: Deploy to VPS
Tasks (1/3 completed):
──────────────────────────────────────────────────
[x]   2: Learn Java
[ ]   3: Build a project
[ ]   4: Deploy to VPS
```

You now have a single `tasks.jar` file that can be run anywhere Java is installed.

### Build script

Create `build.sh` to automate compilation and packaging:

```bash
#!/bin/bash
set -euo pipefail

echo "Compiling..."
javac Task.java TaskStore.java TaskApp.java

echo "Packaging..."
jar cfm tasks.jar MANIFEST.MF *.class

echo "Done! Run with: java -jar tasks.jar"
```

```bash
chmod +x build.sh
./build.sh
```

## What you have built

This project ties together everything from chapters 1–9:

| Concept           | Where it is used                                                |
|-------------------|-----------------------------------------------------------------|
| Variables & types | Task fields, command parsing, ID handling                       |
| Control flow      | Switch for commands, loop for listing                           |
| Methods           | `addTask`, `listTasks`, `completeTask`, `deleteTask`, `parseId` |
| Classes & objects | `TaskApp`, `TaskStore` -- encapsulated responsibilities         |
| Records           | `Task` -- immutable data with auto-generated methods            |
| Collections       | `ArrayList` for in-memory task list, `removeIf`, streams        |
| Error handling    | `try/catch` for IOException, validation for bad input           |
| File I/O          | `Files.readAllLines`, `Files.write` for persistence             |

## Summary

- A CLI application parses command-line arguments from `String[] args`.
- Separate concerns: **model** (`Task`), **persistence** (`TaskStore`), **UI** (`TaskApp`).
- Records with `toLine`/`fromLine` methods handle serialization.
- Input validation with clear error messages makes the tool user-friendly.
- `jar cfm` packages `.class` files into a runnable JAR with a manifest.

Next up: [Building a REST API](./11-rest-api.md) -- exposing the task manager over HTTP.
