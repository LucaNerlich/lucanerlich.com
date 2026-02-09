---
title: "Gradle"
sidebar_label: "Gradle"
description: Learn Gradle with Kotlin DSL -- project structure, dependency management, building fat JARs, and improving the REST API project with Jackson for JSON handling.
slug: /java/beginners-guide/gradle
tags: [java, beginners, gradle, build-tools]
keywords:
  - java gradle
  - gradle kotlin dsl
  - build.gradle.kts
  - gradle dependencies
  - gradle fat jar
sidebar_position: 14
---

# Gradle

Gradle is the other major build tool in the Java ecosystem. It is newer than Maven, uses code (Kotlin or Groovy) instead of XML for configuration, and is generally faster thanks to incremental builds and a build cache. This chapter shows how to set up the same REST API project with Gradle using the **Kotlin DSL** (`build.gradle.kts`).

## Maven vs Gradle

| Feature | Maven | Gradle |
|---------|-------|--------|
| Configuration | XML (`pom.xml`) | Kotlin/Groovy (`build.gradle.kts`) |
| Speed | Good | Faster (incremental builds, daemon, cache) |
| Flexibility | Convention-based, less customizable | Highly customizable |
| Learning curve | Lower (XML is declarative) | Moderate (Kotlin DSL is a real language) |
| Ecosystem | Largest, most enterprise projects | Growing, default for Android/Kotlin |
| IDE support | Excellent in all IDEs | Excellent in IntelliJ, good in others |

Neither is "better" -- pick whichever your team or project uses. Both solve the same problems.

## Installing Gradle

### macOS (Homebrew)

```bash
brew install gradle
```

### Windows

Download from [gradle.org](https://gradle.org/install/), extract, and add the `bin/` directory to your `PATH`.

### Linux (SDKMAN -- recommended)

```bash
curl -s "https://get.sdkman.io" | bash
sdk install gradle
```

### Verify

```bash
gradle --version
```

Result:
```text
------------------------------------------------------------
Gradle 8.10
------------------------------------------------------------
Build time:    2024-08-14
Kotlin:        1.9.24
Groovy:        3.0.22
JVM:           21.0.2
```

## Creating a Gradle project

Gradle follows the same directory convention as Maven:

```text
task-api-gradle/
├── build.gradle.kts             # Build configuration (Kotlin DSL)
├── settings.gradle.kts          # Project settings
└── src/
    ├── main/
    │   └── java/
    │       └── taskapi/
    │           ├── Task.java
    │           ├── TaskStore.java
    │           ├── TaskHandler.java
    │           └── ApiServer.java
    └── test/
        └── java/
            └── taskapi/
```

### `settings.gradle.kts`

The settings file names the project:

```kotlin
rootProject.name = "task-api"
```

### `build.gradle.kts`

The build file replaces Maven's `pom.xml`:

```kotlin
plugins {
    java
    application
}

group = "com.example"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    // Jackson for JSON processing
    implementation("com.fasterxml.jackson.core:jackson-databind:2.17.2")
}

application {
    mainClass = "taskapi.ApiServer"
}

// Fat JAR task -- bundles all dependencies into one JAR
tasks.register<Jar>("fatJar") {
    archiveClassifier = "all"
    duplicatesStrategy = DuplicatesStrategy.EXCLUDE

    manifest {
        attributes["Main-Class"] = "taskapi.ApiServer"
    }

    from(sourceSets.main.get().output)

    dependsOn(configurations.runtimeClasspath)
    from({
        configurations.runtimeClasspath.get()
            .filter { it.name.endsWith("jar") }
            .map { zipTree(it) }
    })
}
```

Compare this to the Maven `pom.xml`:
- **Shorter** -- Kotlin DSL is more concise than XML
- **`plugins { java; application }`** -- declares this is a Java application
- **`repositories { mavenCentral() }`** -- where to download dependencies (same Maven Central)
- **`dependencies { implementation(...) }`** -- equivalent to Maven's `<dependency>` block
- **`application { mainClass = ... }`** -- enables `gradle run` to start the app
- **`fatJar` task** -- custom task that creates a fat JAR (equivalent to Maven's shade plugin)

### Gradle vs Maven dependency notation

```text
Maven:
  <groupId>com.fasterxml.jackson.core</groupId>
  <artifactId>jackson-databind</artifactId>
  <version>2.17.2</version>

Gradle:
  implementation("com.fasterxml.jackson.core:jackson-databind:2.17.2")
```

The compact `group:artifact:version` string is much easier to read.

### Dependency configurations

| Gradle | Maven equivalent | Meaning |
|--------|-----------------|---------|
| `implementation` | `compile` | Compile + runtime, not exposed to consumers |
| `api` | `compile` | Compile + runtime, exposed to consumers |
| `testImplementation` | `test` | Test compile + runtime only |
| `compileOnly` | `provided` | Compile only, not in JAR |
| `runtimeOnly` | `runtime` | Runtime only |

## Improving the REST API with Jackson

In the Maven chapter we used Gson. Here we use **Jackson** -- the other popular JSON library -- to show both options. Jackson is the industry default for most Java projects.

### Updated `TaskHandler.java` with Jackson

The source files (`Task.java`, `TaskStore.java`, `ApiServer.java`) are identical to the Maven chapter. Only `TaskHandler.java` changes to use Jackson instead of Gson:

```java
// src/main/java/taskapi/TaskHandler.java
package taskapi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;

public class TaskHandler implements HttpHandler {

    private final TaskStore store;
    private final ObjectMapper mapper = new ObjectMapper();

    public TaskHandler(Path dataFile) {
        this.store = new TaskStore(dataFile);
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        try {
            if (path.equals("/api/tasks")) {
                switch (method) {
                    case "GET" -> handleListTasks(exchange);
                    case "POST" -> handleCreateTask(exchange);
                    default -> sendError(exchange, 405, "Method not allowed");
                }
            } else if (path.startsWith("/api/tasks/")) {
                int id = parseIdFromPath(path);
                switch (method) {
                    case "GET" -> handleGetTask(exchange, id);
                    case "PUT" -> handleUpdateTask(exchange, id);
                    case "DELETE" -> handleDeleteTask(exchange, id);
                    default -> sendError(exchange, 405, "Method not allowed");
                }
            } else if (path.equals("/api/health") && method.equals("GET")) {
                sendJson(exchange, 200, new HealthResponse("ok"));
            } else {
                sendError(exchange, 404, "Not found: " + path);
            }
        } catch (IllegalArgumentException e) {
            sendError(exchange, 400, e.getMessage());
        } catch (Exception e) {
            System.err.println("Internal error: " + e.getMessage());
            sendError(exchange, 500, "Internal server error");
        }
    }

    // ── Handlers ──────────────────────────────────────────────

    private void handleListTasks(HttpExchange exchange) throws IOException {
        sendJson(exchange, 200, store.load());
    }

    private void handleGetTask(HttpExchange exchange, int id) throws IOException {
        Task task = findTaskOrNull(id);
        if (task == null) {
            sendError(exchange, 404, "Task not found: " + id);
            return;
        }
        sendJson(exchange, 200, task);
    }

    private void handleCreateTask(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);

        // Jackson's tree model for flexible parsing
        JsonNode node = mapper.readTree(body);
        JsonNode descNode = node.get("description");

        if (descNode == null || descNode.asText().isBlank()) {
            sendError(exchange, 400, "Description is required");
            return;
        }

        String description = descNode.asText();
        List<Task> tasks = store.load();
        int nextId = tasks.stream().mapToInt(Task::id).max().orElse(0) + 1;
        Task task = new Task(nextId, description, false);
        tasks.add(task);
        store.save(tasks);

        sendJson(exchange, 201, task);
    }

    private void handleUpdateTask(HttpExchange exchange, int id)
            throws IOException {
        List<Task> tasks = store.load();
        for (int i = 0; i < tasks.size(); i++) {
            if (tasks.get(i).id() == id) {
                Task completed = tasks.get(i).complete();
                tasks.set(i, completed);
                store.save(tasks);
                sendJson(exchange, 200, completed);
                return;
            }
        }
        sendError(exchange, 404, "Task not found: " + id);
    }

    private void handleDeleteTask(HttpExchange exchange, int id)
            throws IOException {
        List<Task> tasks = store.load();
        boolean removed = tasks.removeIf(t -> t.id() == id);
        if (!removed) {
            sendError(exchange, 404, "Task not found: " + id);
            return;
        }
        store.save(tasks);
        sendJson(exchange, 200, new MessageResponse("Deleted task " + id));
    }

    // ── Utilities ─────────────────────────────────────────────

    private Task findTaskOrNull(int id) throws IOException {
        for (Task task : store.load()) {
            if (task.id() == id) return task;
        }
        return null;
    }

    private int parseIdFromPath(String path) {
        String[] segments = path.split("/");
        try {
            return Integer.parseInt(segments[segments.length - 1]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid task ID: " + segments[segments.length - 1]);
        }
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private void sendJson(HttpExchange exchange, int status, Object data)
            throws IOException {
        byte[] bytes = mapper.writeValueAsBytes(data);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendError(HttpExchange exchange, int status, String message)
            throws IOException {
        sendJson(exchange, status, new ErrorResponse(message));
    }

    // ── Response records ──────────────────────────────────────

    private record ErrorResponse(String error) {}
    private record MessageResponse(String message) {}
    private record HealthResponse(String status) {}
}
```

### Gson vs Jackson comparison

| Feature | Gson | Jackson |
|---------|------|---------|
| Serialize | `gson.toJson(object)` | `mapper.writeValueAsString(object)` |
| Deserialize | `gson.fromJson(json, Type.class)` | `mapper.readValue(json, Type.class)` |
| Tree model | `JsonObject` / `JsonElement` | `JsonNode` |
| Size | ~300 KB | ~1.7 MB (core + databind + annotations) |
| Performance | Good | Faster for large payloads |
| Ecosystem | Google | Industry standard, Spring default |
| Record support | Works out of the box | Works out of the box (2.12+) |

Both are excellent. Gson is simpler and smaller. Jackson is faster and more feature-rich. Choose based on your project's needs.

## Gradle commands

```bash
# Compile
gradle build

# Run the application directly
gradle run

# Create the fat JAR
gradle fatJar

# Clean build output
gradle clean

# Clean + build
gradle clean build

# List all available tasks
gradle tasks
```

### Running the app

```bash
# Option 1: gradle run (quick, for development)
gradle run

# Option 2: fat JAR (for deployment)
gradle fatJar
java -jar build/libs/task-api-1.0.0-all.jar
```

Result:
```text
Task API running on http://localhost:8080
Press Ctrl+C to stop.
```

## Gradle wrapper

Like Maven, Gradle has a wrapper so builds work without a global installation. Generate it:

```bash
gradle wrapper
```

This creates `gradlew` (Unix), `gradlew.bat` (Windows), and a `gradle/wrapper/` directory. Commit these to version control.

Now anyone can build with:

```bash
./gradlew clean build
./gradlew fatJar
```

The wrapper downloads the correct Gradle version automatically. **Always use the wrapper in CI/CD and shared projects.**

## Build cache and incremental builds

Gradle is faster than Maven mainly because of:

1. **Incremental compilation** -- only recompiles changed files
2. **Build cache** -- reuses outputs from previous builds
3. **Gradle daemon** -- keeps a JVM running in the background

In practice, `gradle build` on an unchanged project takes milliseconds. A full `mvn package` rescans everything.

```bash
# First build
./gradlew build    # ~5 seconds

# Second build (nothing changed)
./gradlew build    # ~0.5 seconds (UP-TO-DATE)
```

## Deploy with Gradle

Update the deploy script from chapter 12:

```bash
#!/bin/bash
set -euo pipefail

SERVER="deploy@YOUR_SERVER_IP"
REMOTE_PATH="/opt/task-api"

echo "Building..."
./gradlew fatJar -q

echo "Uploading..."
rsync -avz build/libs/task-api-1.0.0-all.jar "$SERVER:$REMOTE_PATH/task-api.jar"

echo "Restarting..."
ssh "$SERVER" "sudo systemctl restart task-api"

echo "Checking health..."
sleep 3
curl -sf https://yoursite.com/api/health && echo " -- OK" || echo " -- FAILED"
```

## Which build tool should you use?

| Situation | Recommendation |
|-----------|---------------|
| New project, small team | Either -- personal preference |
| Joining an existing project | Use what the project uses |
| Enterprise / Spring Boot | Maven is more common |
| Android / Kotlin | Gradle is required |
| Need maximum build speed | Gradle |
| Want simplest setup | Maven |

Both Maven and Gradle:
- Download dependencies from Maven Central
- Follow the same `src/main/java` directory layout
- Produce the same JAR output
- Support the same plugins and integrations
- Work with all Java IDEs

The choice rarely matters for the end result. Pick one, learn it well, and switch later if needed.

## Summary

- **Gradle** uses Kotlin DSL (`build.gradle.kts`) instead of XML -- more concise and programmable.
- `implementation("group:artifact:version")` declares dependencies (same Maven Central repository).
- `gradle run` starts the app directly; `gradle fatJar` creates a deployable JAR.
- The **Gradle wrapper** (`gradlew`) ensures reproducible builds without a global installation.
- **Jackson** (`ObjectMapper`) is the industry-standard JSON library -- `writeValueAsString` and `readValue`.
- Gradle's **incremental builds and build cache** make rebuilds significantly faster than Maven.
- **Neither tool is universally better** -- choose based on your team, project, and ecosystem.

For advanced Maven topics (BOMs, multi-module projects, profiles), see the [Maven deep dive](../maven.md).
