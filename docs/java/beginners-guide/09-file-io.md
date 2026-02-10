---
title: "File I/O"
sidebar_label: "File I/O"
description: Learn Java file I/O -- Path, Files, reading and writing text files, directories, BufferedReader/Writer, and simple CSV parsing.
slug: /java/beginners-guide/file-io
tags: [java, beginners, file-io, nio]
keywords:
  - java file io
  - java nio files
  - read file java
  - write file java
  - csv parsing java
sidebar_position: 9
---

# File I/O

Programs need to persist data beyond their runtime. The simplest way is to read and write files. Java's `java.nio.file`
package (NIO.2) provides a clean, modern API for file operations.

## `Path` -- representing file locations

A `Path` represents a file or directory location:

```java
import java.nio.file.Path;

Path file = Path.of("data.txt");
Path absolute = Path.of("/home/user/documents/report.txt");
Path nested = Path.of("data", "users", "config.json");

System.out.println(file);
System.out.println(absolute);
System.out.println(nested);
System.out.println(file.toAbsolutePath());
System.out.println(nested.getFileName());
System.out.println(nested.getParent());
```

Result:

```text
data.txt
/home/user/documents/report.txt
data/users/config.json
/current/working/directory/data.txt
config.json
data/users
```

`Path` is just a representation -- the file does not need to exist yet.

## `Files` -- the workhorse class

`java.nio.file.Files` provides static methods for all file operations. Most methods are one-liners.

## Reading files

### Read the entire file as a string

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

try {
    String content = Files.readString(Path.of("example.txt"));
    System.out.println(content);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

### Read all lines as a list

```java
try {
    var lines = Files.readAllLines(Path.of("example.txt"));
    System.out.println("Lines: " + lines.size());

    for (String line : lines) {
        System.out.println(line);
    }
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

### Read line by line (memory-efficient for large files)

```java
try (var reader = Files.newBufferedReader(Path.of("large-file.txt"))) {
    String line;
    int count = 0;
    while ((line = reader.readLine()) != null) {
        count++;
        if (count <= 3) {
            System.out.println(line);
        }
    }
    System.out.println("Total lines: " + count);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

`Files.readString` and `readAllLines` load the entire file into memory. For files larger than a few hundred MB, use
`newBufferedReader` or `lines()`:

```java
try (var stream = Files.lines(Path.of("large-file.txt"))) {
    long count = stream.count();
    System.out.println("Lines: " + count);
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

## Writing files

### Write a string

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.IOException;

try {
    String content = "Hello, file!\nSecond line.\nThird line.";
    Files.writeString(Path.of("output.txt"), content);
    System.out.println("File written");
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

Result:

```text
File written
```

The file `output.txt` now contains:

```text
Hello, file!
Second line.
Third line.
```

### Write a list of lines

```java
import java.util.List;

try {
    List<String> lines = List.of("Line 1", "Line 2", "Line 3");
    Files.write(Path.of("output.txt"), lines);
    System.out.println("Lines written");
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

### Append to a file

```java
import java.nio.file.StandardOpenOption;

try {
    Files.writeString(
        Path.of("log.txt"),
        "New log entry\n",
        StandardOpenOption.CREATE,
        StandardOpenOption.APPEND
    );
    System.out.println("Appended");
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

`StandardOpenOption.CREATE` creates the file if it does not exist. `APPEND` adds to the end instead of overwriting.

### Write line by line (BufferedWriter)

For writing many lines efficiently:

```java
try (var writer = Files.newBufferedWriter(Path.of("output.txt"))) {
    for (int i = 1; i <= 5; i++) {
        writer.write("Line " + i);
        writer.newLine();
    }
    System.out.println("Written with BufferedWriter");
} catch (IOException e) {
    System.out.println("Error: " + e.getMessage());
}
```

Result:

```text
Written with BufferedWriter
```

## Checking file properties

```java
Path path = Path.of("example.txt");

System.out.println("Exists: " + Files.exists(path));
System.out.println("Is file: " + Files.isRegularFile(path));
System.out.println("Is directory: " + Files.isDirectory(path));
System.out.println("Is readable: " + Files.isReadable(path));
System.out.println("Is writable: " + Files.isWritable(path));

if (Files.exists(path)) {
    System.out.println("Size: " + Files.size(path) + " bytes");
    System.out.println("Last modified: " + Files.getLastModifiedTime(path));
}
```

## Working with directories

### Create directories

```java
// Create a single directory
Files.createDirectory(Path.of("data"));

// Create nested directories (like mkdir -p)
Files.createDirectories(Path.of("data/users/profiles"));
```

### List directory contents

```java
try (var entries = Files.list(Path.of("."))) {
    entries.forEach(System.out::println);
}
```

### Walk a directory tree

```java
try (var walk = Files.walk(Path.of("src"))) {
    walk.filter(Files::isRegularFile)
        .filter(p -> p.toString().endsWith(".java"))
        .forEach(System.out::println);
}
```

This recursively finds all `.java` files under `src/`.

### Delete files and directories

```java
// Delete a file
Files.deleteIfExists(Path.of("temp.txt"));

// Delete an empty directory
Files.deleteIfExists(Path.of("empty-dir"));
```

Directories must be empty before deleting. To delete a directory tree, walk it in reverse order.

### Copy and move

```java
// Copy
Files.copy(Path.of("source.txt"), Path.of("copy.txt"));

// Move (rename)
Files.move(Path.of("old-name.txt"), Path.of("new-name.txt"));

// Copy with overwrite
import java.nio.file.StandardCopyOption;
Files.copy(
    Path.of("source.txt"),
    Path.of("dest.txt"),
    StandardCopyOption.REPLACE_EXISTING
);
```

## Simple CSV parsing

CSV (Comma-Separated Values) is a common plain-text data format. For simple cases, you can parse it manually:

### Reading CSV

Given a file `users.csv`:

```text
name,age,city
Ada,36,London
Bob,25,Berlin
Charlie,30,Tokyo
```

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

record User(String name, int age, String city) {}

static List<User> readUsers(Path file) throws IOException {
    List<User> users = new ArrayList<>();
    List<String> lines = Files.readAllLines(file);

    // Skip header (first line)
    for (int i = 1; i < lines.size(); i++) {
        String line = lines.get(i).trim();
        if (line.isEmpty()) continue;

        String[] parts = line.split(",");
        if (parts.length != 3) {
            System.err.println("Skipping invalid line: " + line);
            continue;
        }

        String name = parts[0].trim();
        int age = Integer.parseInt(parts[1].trim());
        String city = parts[2].trim();
        users.add(new User(name, age, city));
    }

    return users;
}

public static void main(String[] args) {
    try {
        List<User> users = readUsers(Path.of("users.csv"));
        for (User user : users) {
            System.out.println(user);
        }
    } catch (IOException e) {
        System.out.println("Error reading CSV: " + e.getMessage());
    }
}
```

Result:

```text
User[name=Ada, age=36, city=London]
User[name=Bob, age=25, city=Berlin]
User[name=Charlie, age=30, city=Tokyo]
```

### Writing CSV

```java
static void writeUsers(Path file, List<User> users) throws IOException {
    List<String> lines = new ArrayList<>();
    lines.add("name,age,city"); // header

    for (User user : users) {
        lines.add(user.name() + "," + user.age() + "," + user.city());
    }

    Files.write(file, lines);
}

public static void main(String[] args) {
    List<User> users = List.of(
        new User("Diana", 28, "Paris"),
        new User("Eve", 32, "Madrid")
    );

    try {
        writeUsers(Path.of("new-users.csv"), users);
        System.out.println("CSV written");

        // Verify
        String content = Files.readString(Path.of("new-users.csv"));
        System.out.println(content);
    } catch (IOException e) {
        System.out.println("Error: " + e.getMessage());
    }
}
```

Result:

```text
CSV written
name,age,city
Diana,28,Paris
Eve,32,Madrid
```

**Note:** this simple approach does not handle commas or quotes inside values. For production CSV handling, use a
library like OpenCSV or Apache Commons CSV.

## Text-based data persistence

A simple approach for small applications -- store data as one record per line:

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.List;

record Task(int id, String title, boolean done) {

    // Serialize to a line
    String toLine() {
        return id + "|" + title + "|" + done;
    }

    // Deserialize from a line
    static Task fromLine(String line) {
        String[] parts = line.split("\\|");
        return new Task(
            Integer.parseInt(parts[0]),
            parts[1],
            Boolean.parseBoolean(parts[2])
        );
    }
}

static List<Task> loadTasks(Path file) throws IOException {
    if (!Files.exists(file)) {
        return new ArrayList<>();
    }

    List<Task> tasks = new ArrayList<>();
    for (String line : Files.readAllLines(file)) {
        if (!line.isBlank()) {
            tasks.add(Task.fromLine(line));
        }
    }
    return tasks;
}

static void saveTasks(Path file, List<Task> tasks) throws IOException {
    List<String> lines = new ArrayList<>();
    for (Task task : tasks) {
        lines.add(task.toLine());
    }
    Files.write(file, lines);
}
```

```java
Path dataFile = Path.of("tasks.dat");

// Create some tasks
List<Task> tasks = new ArrayList<>();
tasks.add(new Task(1, "Learn Java", false));
tasks.add(new Task(2, "Build a project", false));
tasks.add(new Task(3, "Deploy to VPS", false));

// Save
saveTasks(dataFile, tasks);
System.out.println("Saved " + tasks.size() + " tasks");

// Load
List<Task> loaded = loadTasks(dataFile);
for (Task task : loaded) {
    System.out.println(task);
}
```

Result:

```text
Saved 3 tasks
Task[id=1, title=Learn Java, done=false]
Task[id=2, title=Build a project, done=false]
Task[id=3, title=Deploy to VPS, done=false]
```

This pattern -- serialize to a simple text format, one record per line -- is the foundation of the CLI project in the
next chapter.

## Summary

- **`Path`** represents file/directory locations; **`Files`** provides all operations.
- `Files.readString` / `readAllLines` for small files; `newBufferedReader` / `lines()` for large files.
- `Files.writeString` / `write` for writing; use `StandardOpenOption.APPEND` to append.
- **Try-with-resources** for readers and writers -- always.
- `Files.exists`, `isRegularFile`, `isDirectory` for checking properties.
- `Files.createDirectories` for creating paths; `Files.walk` for recursive traversal.
- Simple CSV/text formats work well for small data persistence needs.

Next up: [Project: CLI Task Manager](./10-project-cli-task-manager.md) -- building a complete command-line application.
