---
title: "Maven"
sidebar_label: "Maven"
description: Learn Apache Maven -- project structure, dependency management, building fat JARs, and improving the REST API project with Gson for JSON handling.
slug: /java/beginners-guide/maven
tags: [java, beginners, maven, build-tools]
keywords:
  - java maven
  - pom.xml
  - maven dependencies
  - fat jar maven
  - maven project
sidebar_position: 13
---

# Maven

So far we have compiled and packaged everything by hand with `javac` and `jar`. That works for small projects, but it
quickly becomes painful when you need external libraries, multiple source directories, or automated testing. **Build
tools** solve this.

Apache Maven is the most widely used build tool in the Java ecosystem. It handles compilation, dependency management,
testing, and packaging with a single `pom.xml` configuration file.

## Installing Maven

### macOS (Homebrew)

```bash
brew install maven
```

### Windows

Download from [maven.apache.org](https://maven.apache.org/download.cgi), extract, and add the `bin/` directory to your
`PATH`.

### Linux (Ubuntu/Debian)

```bash
sudo apt install maven -y
```

### Verify

```bash
mvn --version
```

Result:

```text
Apache Maven 3.9.6
Maven home: /opt/homebrew/Cellar/maven/3.9.6/libexec
Java version: 21.0.2, vendor: Homebrew
```

## Creating a Maven project

Maven follows a strict directory convention:

```text
task-api-maven/
├── pom.xml                      # Project Object Model (build config)
└── src/
    ├── main/
    │   └── java/                # Application source code
    │       └── taskapi/
    │           ├── Task.java
    │           ├── TaskStore.java
    │           ├── JsonHelper.java
    │           ├── TaskHandler.java
    │           └── ApiServer.java
    └── test/
        └── java/                # Test source code (optional for now)
            └── taskapi/
```

### The `pom.xml`

The POM (Project Object Model) is the heart of a Maven project. Create `pom.xml` in the project root:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- Project coordinates -->
    <groupId>com.example</groupId>
    <artifactId>task-api</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>Task API</name>
    <description>A simple REST API for task management</description>

    <!-- Java version -->
    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <!-- Dependencies -->
    <dependencies>
        <!-- Gson for JSON processing -->
        <dependency>
            <groupId>com.google.code.gson</groupId>
            <artifactId>gson</artifactId>
            <version>2.11.0</version>
        </dependency>
    </dependencies>

    <!-- Build configuration -->
    <build>
        <plugins>
            <!-- Create a fat JAR with all dependencies included -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.6.0</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals>
                            <goal>shade</goal>
                        </goals>
                        <configuration>
                            <transformers>
                                <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                                    <mainClass>taskapi.ApiServer</mainClass>
                                </transformer>
                            </transformers>
                        </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

Key elements:

| Element         | Purpose                                        |
|-----------------|------------------------------------------------|
| `groupId`       | Your organization (like a Java package prefix) |
| `artifactId`    | The project name                               |
| `version`       | The project version                            |
| `properties`    | Java version, encoding, and other settings     |
| `dependencies`  | External libraries Maven downloads for you     |
| `build/plugins` | Plugins that customize the build process       |

### Project coordinates

The combination of `groupId`, `artifactId`, and `version` uniquely identifies your project (and any dependency). This is
called **GAV coordinates**:

```text
com.google.code.gson:gson:2.11.0
     groupId         artifactId  version
```

## Maven commands

```bash
# Compile the source code
mvn compile

# Run tests
mvn test

# Package into a JAR
mvn package

# Clean build output
mvn clean

# Clean, then package (most common)
mvn clean package

# Install to local repository (for use as a dependency in other projects)
mvn install
```

### Maven lifecycle

Maven has a fixed build lifecycle. Each phase runs all previous phases:

```text
validate → compile → test → package → verify → install → deploy
```

When you run `mvn package`, Maven automatically runs `validate`, `compile`, and `test` first.

## Improving the REST API with Gson

In chapter 11, we built JSON helpers by hand. With Maven, we can add **Gson** (Google's JSON library) as a dependency
and replace all that manual work.

### Updated `Task.java`

Move your files into the Maven structure under `src/main/java/taskapi/` and add a `package` declaration:

```java
// src/main/java/taskapi/Task.java
package taskapi;

public record Task(int id, String description, boolean done) {

    private static final String DELIMITER = "|";

    public String toLine() {
        return id + DELIMITER + description + DELIMITER + done;
    }

    public static Task fromLine(String line) {
        String[] parts = line.split("\\|", 3);
        if (parts.length != 3) {
            throw new IllegalArgumentException("Invalid task line: " + line);
        }
        return new Task(
            Integer.parseInt(parts[0].trim()),
            parts[1].trim(),
            Boolean.parseBoolean(parts[2].trim())
        );
    }

    public Task complete() {
        return new Task(id, description, true);
    }
}
```

### Updated `TaskStore.java`

```java
// src/main/java/taskapi/TaskStore.java
package taskapi;

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

    public List<Task> load() throws IOException {
        if (!Files.exists(filePath)) {
            return new ArrayList<>();
        }
        List<Task> tasks = new ArrayList<>();
        for (String line : Files.readAllLines(filePath)) {
            if (!line.isBlank()) {
                tasks.add(Task.fromLine(line.trim()));
            }
        }
        return tasks;
    }

    public void save(List<Task> tasks) throws IOException {
        List<String> lines = new ArrayList<>();
        for (Task task : tasks) {
            lines.add(task.toLine());
        }
        Files.write(filePath, lines);
    }
}
```

### Replace `JsonHelper` with Gson

Delete `JsonHelper.java` entirely. Gson handles serialization automatically:

```java
// src/main/java/taskapi/TaskHandler.java
package taskapi;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonSyntaxException;
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
    private final Gson gson = new Gson();

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
        List<Task> tasks = store.load();
        sendJson(exchange, 200, tasks);
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

        CreateTaskRequest request;
        try {
            request = gson.fromJson(body, CreateTaskRequest.class);
        } catch (JsonSyntaxException e) {
            sendError(exchange, 400, "Invalid JSON");
            return;
        }

        if (request == null || request.description() == null
                || request.description().isBlank()) {
            sendError(exchange, 400, "Description is required");
            return;
        }

        List<Task> tasks = store.load();
        int nextId = tasks.stream().mapToInt(Task::id).max().orElse(0) + 1;
        Task task = new Task(nextId, request.description(), false);
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
        String json = gson.toJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
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

    // ── Request/Response records ──────────────────────────────

    private record CreateTaskRequest(String description) {}
    private record ErrorResponse(String error) {}
    private record MessageResponse(String message) {}
    private record HealthResponse(String status) {}
}
```

Look at what changed:

- **No more `JsonHelper`** -- `gson.toJson(object)` serializes any object to JSON automatically
- **`gson.fromJson(body, Class)`** parses JSON into a typed object -- no manual string parsing
- **Request/response records** give structure to the API contract
- **Type safety** -- if the JSON does not match the record, Gson throws `JsonSyntaxException`

### Updated `ApiServer.java`

```java
// src/main/java/taskapi/ApiServer.java
package taskapi;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Path;

public class ApiServer {

    private static final int PORT = 8080;
    private static final Path DATA_FILE = Path.of("tasks.dat");

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/", new TaskHandler(DATA_FILE));
        server.start();

        System.out.println("Task API running on http://localhost:" + PORT);
        System.out.println("Press Ctrl+C to stop.");
    }
}
```

## Build and run

```bash
mvn clean package
```

Result:

```text
[INFO] --- maven-shade-plugin:3.6.0:shade (default) @ task-api ---
[INFO] Including com.google.code.gson:gson:jar:2.11.0 in the shaded jar.
[INFO] BUILD SUCCESS
```

Maven compiles your code, downloads Gson, runs any tests, and creates a fat JAR in the `target/` directory:

```bash
java -jar target/task-api-1.0.0.jar
```

Result:

```text
Task API running on http://localhost:8080
Press Ctrl+C to stop.
```

The fat JAR includes Gson inside it -- no separate library files needed.

## How dependencies work

When you add a dependency to `pom.xml`, Maven:

1. Checks your **local repository** (`~/.m2/repository/`) for the library
2. If not found, downloads it from **Maven Central** (the public repository)
3. Adds it to the compilation and runtime classpath

You never download JAR files manually. Maven handles everything.

### Finding dependencies

Search [search.maven.org](https://search.maven.org/) or [mvnrepository.com](https://mvnrepository.com/) for libraries.
Copy the `<dependency>` XML snippet into your `pom.xml`.

### Dependency scope

```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.11.0</version>
    <scope>compile</scope> <!-- default, included in JAR -->
</dependency>

<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope> <!-- only available during testing -->
</dependency>
```

| Scope               | Available during         | Included in JAR         |
|---------------------|--------------------------|-------------------------|
| `compile` (default) | Compile + test + runtime | Yes                     |
| `test`              | Test only                | No                      |
| `provided`          | Compile + test           | No (server provides it) |
| `runtime`           | Test + runtime           | Yes                     |

## Maven wrapper

The Maven wrapper lets anyone build your project without installing Maven globally. Generate it:

```bash
mvn wrapper:wrapper
```

This creates `mvnw` (Unix) and `mvnw.cmd` (Windows) scripts plus a `.mvn/` directory. Commit these to version control.

Now anyone can build with:

```bash
./mvnw clean package
```

The wrapper downloads the correct Maven version automatically.

## Deploy with Maven

Update the deploy script from chapter 12:

```bash
#!/bin/bash
set -euo pipefail

SERVER="deploy@YOUR_SERVER_IP"
REMOTE_PATH="/opt/task-api"

echo "Building..."
mvn clean package -q

echo "Uploading..."
rsync -avz target/task-api-1.0.0.jar "$SERVER:$REMOTE_PATH/task-api.jar"

echo "Restarting..."
ssh "$SERVER" "sudo systemctl restart task-api"

echo "Checking health..."
sleep 3
curl -sf https://yoursite.com/api/health && echo " -- OK" || echo " -- FAILED"
```

## Summary

- **Maven** handles compilation, dependencies, testing, and packaging with a single `pom.xml`.
- Add libraries like Gson by declaring a `<dependency>` -- Maven downloads them automatically.
- The **maven-shade-plugin** builds a fat JAR with all dependencies bundled inside.
- Standard directory layout: `src/main/java/`, `src/test/java/`, `target/`.
- `mvn clean package` is the one command to build everything.
- Use the **Maven wrapper** (`mvnw`) so builds work without a global Maven installation.
- Gson replaces manual JSON handling with `gson.toJson()` and `gson.fromJson()`.

For advanced Maven topics (BOMs, multi-module projects, profiles, and plugins), see the [Maven deep dive](../maven.md).

Next up: [Gradle](./14-gradle.md) -- the modern alternative to Maven.
