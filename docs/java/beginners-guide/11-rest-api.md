---
title: "Building a REST API"
sidebar_label: "REST API"
description: Build a REST API with Java's built-in HttpServer -- HTTP basics, request handling, JSON serialization, routing, and exposing the task manager over HTTP.
slug: /java/beginners-guide/rest-api
tags: [java, beginners, rest, api, http]
keywords:
  - java rest api
  - java httpserver
  - json java
  - http server java
  - api without framework
sidebar_position: 11
---

# Building a REST API

In the previous chapter, the task manager ran from the command line. Now we will expose it over HTTP so any client -- a browser, a mobile app, or `curl` -- can interact with it. We will use Java's built-in `com.sun.net.httpserver.HttpServer`, requiring zero external dependencies.

## HTTP and REST basics

**HTTP** is the protocol the web runs on. A client sends a **request**, the server sends a **response**.

A request has:
- **Method:** `GET`, `POST`, `PUT`, `DELETE`
- **Path:** `/api/tasks`, `/api/tasks/1`
- **Headers:** metadata (content type, auth tokens)
- **Body:** data (for `POST`/`PUT`)

A response has:
- **Status code:** `200 OK`, `201 Created`, `404 Not Found`, `400 Bad Request`
- **Headers:** metadata (content type, cache control)
- **Body:** the data (usually JSON)

**REST** (Representational State Transfer) is a convention for designing APIs around resources:

| Action | Method | Path | Description |
|--------|--------|------|-------------|
| List all tasks | `GET` | `/api/tasks` | Returns all tasks |
| Get one task | `GET` | `/api/tasks/{id}` | Returns a specific task |
| Create a task | `POST` | `/api/tasks` | Creates and returns a new task |
| Update a task | `PUT` | `/api/tasks/{id}` | Updates and returns the task |
| Delete a task | `DELETE` | `/api/tasks/{id}` | Deletes the task |

## Project structure

We will extend the task manager from the previous chapter:

```text
task-api/
├── Task.java              # Task record (reused)
├── TaskStore.java          # File persistence (reused)
├── JsonHelper.java         # JSON serialization/parsing
├── TaskHandler.java        # HTTP request handler
└── ApiServer.java          # Server setup and main method
```

Copy `Task.java` and `TaskStore.java` from the previous chapter. We will add three new files.

## Step 1: JSON helpers

Since we are not using any libraries, we need simple helper methods to convert tasks to/from JSON. For our small data model, manual JSON is straightforward:

```java
// JsonHelper.java

import java.util.List;

public class JsonHelper {

    /**
     * Convert a Task to a JSON string.
     */
    public static String taskToJson(Task task) {
        return """
                {"id":%d,"description":"%s","done":%b}""".formatted(
                task.id(),
                escapeJson(task.description()),
                task.done()
        );
    }

    /**
     * Convert a list of tasks to a JSON array string.
     */
    public static String tasksToJson(List<Task> tasks) {
        if (tasks.isEmpty()) {
            return "[]";
        }

        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < tasks.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(taskToJson(tasks.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Parse a description field from a JSON request body.
     * Expects: {"description": "some text"}
     *
     * This is a minimal parser for our specific use case.
     */
    public static String parseDescription(String json) {
        // Find "description" key and extract its string value
        String key = "\"description\"";
        int keyIndex = json.indexOf(key);
        if (keyIndex == -1) {
            throw new IllegalArgumentException("Missing 'description' field");
        }

        // Find the colon after the key
        int colonIndex = json.indexOf(':', keyIndex + key.length());
        if (colonIndex == -1) {
            throw new IllegalArgumentException("Invalid JSON format");
        }

        // Find the opening quote of the value
        int openQuote = json.indexOf('"', colonIndex + 1);
        if (openQuote == -1) {
            throw new IllegalArgumentException("Invalid JSON: description must be a string");
        }

        // Find the closing quote (handle escaped quotes)
        int closeQuote = findClosingQuote(json, openQuote + 1);
        if (closeQuote == -1) {
            throw new IllegalArgumentException("Invalid JSON: unterminated string");
        }

        return unescapeJson(json.substring(openQuote + 1, closeQuote));
    }

    /**
     * Create an error JSON response.
     */
    public static String errorJson(String message) {
        return """
                {"error":"%s"}""".formatted(escapeJson(message));
    }

    // ── Internal helpers ──────────────────────────────────────

    private static String escapeJson(String s) {
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static String unescapeJson(String s) {
        return s.replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t");
    }

    private static int findClosingQuote(String s, int start) {
        for (int i = start; i < s.length(); i++) {
            if (s.charAt(i) == '"' && s.charAt(i - 1) != '\\') {
                return i;
            }
        }
        return -1;
    }
}
```

This is intentionally minimal -- it handles our specific data format. For production APIs, use a library like Jackson or Gson. See the [JSON Processing guide](../json-processing.md) for library-based approaches.

## Step 2: the request handler

The handler processes HTTP requests and routes them to the right action:

```java
// TaskHandler.java

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

    public TaskHandler(Path dataFile) {
        this.store = new TaskStore(dataFile);
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        try {
            // Route: /api/tasks
            if (path.equals("/api/tasks")) {
                switch (method) {
                    case "GET" -> handleListTasks(exchange);
                    case "POST" -> handleCreateTask(exchange);
                    default -> sendResponse(exchange, 405,
                            JsonHelper.errorJson("Method not allowed"));
                }
            }
            // Route: /api/tasks/{id}
            else if (path.startsWith("/api/tasks/")) {
                int id = parseIdFromPath(path);
                switch (method) {
                    case "GET" -> handleGetTask(exchange, id);
                    case "PUT" -> handleUpdateTask(exchange, id);
                    case "DELETE" -> handleDeleteTask(exchange, id);
                    default -> sendResponse(exchange, 405,
                            JsonHelper.errorJson("Method not allowed"));
                }
            }
            // Route: /api/health
            else if (path.equals("/api/health") && method.equals("GET")) {
                sendResponse(exchange, 200, """
                        {"status":"ok"}""");
            }
            // Unknown route
            else {
                sendResponse(exchange, 404,
                        JsonHelper.errorJson("Not found: " + path));
            }
        } catch (IllegalArgumentException e) {
            sendResponse(exchange, 400, JsonHelper.errorJson(e.getMessage()));
        } catch (Exception e) {
            System.err.println("Internal error: " + e.getMessage());
            sendResponse(exchange, 500,
                    JsonHelper.errorJson("Internal server error"));
        }
    }

    // ── Handlers ──────────────────────────────────────────────

    private void handleListTasks(HttpExchange exchange) throws IOException {
        List<Task> tasks = store.load();
        String json = JsonHelper.tasksToJson(tasks);
        sendResponse(exchange, 200, json);
    }

    private void handleGetTask(HttpExchange exchange, int id) throws IOException {
        List<Task> tasks = store.load();
        Task task = findTask(tasks, id);

        if (task == null) {
            sendResponse(exchange, 404,
                    JsonHelper.errorJson("Task not found: " + id));
            return;
        }

        sendResponse(exchange, 200, JsonHelper.taskToJson(task));
    }

    private void handleCreateTask(HttpExchange exchange) throws IOException {
        String body = readRequestBody(exchange);
        String description = JsonHelper.parseDescription(body);

        if (description.isBlank()) {
            sendResponse(exchange, 400,
                    JsonHelper.errorJson("Description cannot be empty"));
            return;
        }

        List<Task> tasks = store.load();
        int nextId = tasks.stream()
                .mapToInt(Task::id)
                .max()
                .orElse(0) + 1;

        Task task = new Task(nextId, description, false);
        tasks.add(task);
        store.save(tasks);

        sendResponse(exchange, 201, JsonHelper.taskToJson(task));
    }

    private void handleUpdateTask(HttpExchange exchange, int id)
            throws IOException {
        List<Task> tasks = store.load();

        for (int i = 0; i < tasks.size(); i++) {
            if (tasks.get(i).id() == id) {
                Task completed = tasks.get(i).complete();
                tasks.set(i, completed);
                store.save(tasks);
                sendResponse(exchange, 200, JsonHelper.taskToJson(completed));
                return;
            }
        }

        sendResponse(exchange, 404,
                JsonHelper.errorJson("Task not found: " + id));
    }

    private void handleDeleteTask(HttpExchange exchange, int id)
            throws IOException {
        List<Task> tasks = store.load();
        boolean removed = tasks.removeIf(t -> t.id() == id);

        if (!removed) {
            sendResponse(exchange, 404,
                    JsonHelper.errorJson("Task not found: " + id));
            return;
        }

        store.save(tasks);
        sendResponse(exchange, 200,
                JsonHelper.errorJson("Deleted task " + id));
    }

    // ── Utilities ─────────────────────────────────────────────

    private int parseIdFromPath(String path) {
        String[] segments = path.split("/");
        String idString = segments[segments.length - 1];
        try {
            return Integer.parseInt(idString);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid task ID: " + idString);
        }
    }

    private Task findTask(List<Task> tasks, int id) {
        for (Task task : tasks) {
            if (task.id() == id) {
                return task;
            }
        }
        return null;
    }

    private String readRequestBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String body)
            throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }
}
```

Key points:
- `HttpHandler` is the interface from `com.sun.net.httpserver` -- implement `handle(HttpExchange)`
- Routing is manual -- check the path and method to determine the action
- Responses are always JSON with the appropriate status code
- Errors are caught and returned as JSON error responses

## Step 3: the server

```java
// ApiServer.java

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
        System.out.println("Endpoints:");
        System.out.println("  GET    /api/tasks       -- list all tasks");
        System.out.println("  GET    /api/tasks/{id}   -- get a task");
        System.out.println("  POST   /api/tasks       -- create a task");
        System.out.println("  PUT    /api/tasks/{id}   -- complete a task");
        System.out.println("  DELETE /api/tasks/{id}   -- delete a task");
        System.out.println("  GET    /api/health      -- health check");
        System.out.println();
        System.out.println("Press Ctrl+C to stop.");
    }
}
```

The server:
- Listens on port 8080
- Routes all `/api/*` requests to `TaskHandler`
- Prints the available endpoints on startup

## Step 4: compile and run

```bash
cd task-api
javac Task.java TaskStore.java JsonHelper.java TaskHandler.java ApiServer.java
java ApiServer
```

Result:
```text
Task API running on http://localhost:8080
Endpoints:
  GET    /api/tasks       -- list all tasks
  GET    /api/tasks/{id}   -- get a task
  POST   /api/tasks       -- create a task
  PUT    /api/tasks/{id}   -- complete a task
  DELETE /api/tasks/{id}   -- delete a task
  GET    /api/health      -- health check

Press Ctrl+C to stop.
```

## Step 5: test with `curl`

Open a new terminal and test each endpoint:

### Health check

```bash
curl http://localhost:8080/api/health
```

Result:
```json
{"status":"ok"}
```

### Create tasks

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"description": "Buy groceries"}'
```

Result:
```json
{"id":1,"description":"Buy groceries","done":false}
```

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"description": "Learn Java REST APIs"}'
```

Result:
```json
{"id":2,"description":"Learn Java REST APIs","done":false}
```

### List all tasks

```bash
curl http://localhost:8080/api/tasks
```

Result:
```json
[{"id":1,"description":"Buy groceries","done":false},{"id":2,"description":"Learn Java REST APIs","done":false}]
```

### Get a single task

```bash
curl http://localhost:8080/api/tasks/1
```

Result:
```json
{"id":1,"description":"Buy groceries","done":false}
```

### Complete a task

```bash
curl -X PUT http://localhost:8080/api/tasks/1
```

Result:
```json
{"id":1,"description":"Buy groceries","done":true}
```

### Delete a task

```bash
curl -X DELETE http://localhost:8080/api/tasks/2
```

Result:
```json
{"error":"Deleted task 2"}
```

### Error handling

```bash
curl http://localhost:8080/api/tasks/999
```

Result:
```json
{"error":"Task not found: 999"}
```

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{}'
```

Result:
```json
{"error":"Missing 'description' field"}
```

## Step 6: package as a JAR

Create `MANIFEST.MF`:

```text
Main-Class: ApiServer
```

Build:

```bash
javac *.java
jar cfm task-api.jar MANIFEST.MF *.class
```

Run:

```bash
java -jar task-api.jar
```

The JAR is self-contained -- it uses only built-in Java libraries, so it runs anywhere Java is installed.

## What you have built

| Component | Purpose |
|-----------|---------|
| `Task.java` | Data model (reused from CLI project) |
| `TaskStore.java` | File persistence (reused from CLI project) |
| `JsonHelper.java` | Manual JSON serialization/parsing |
| `TaskHandler.java` | HTTP routing and request handling |
| `ApiServer.java` | Server configuration and startup |

The API follows REST conventions with proper:
- HTTP methods (`GET`, `POST`, `PUT`, `DELETE`)
- Status codes (`200`, `201`, `400`, `404`, `405`, `500`)
- JSON content type headers
- Error responses in a consistent format

For building more complex APIs, you would typically use a framework. See the [HTTP Clients guide](../http-clients.md) for how to consume HTTP APIs from Java.

## Summary

- Java's built-in `HttpServer` provides a zero-dependency HTTP server.
- A `HttpHandler` processes each request -- check the method and path to route.
- Send JSON responses with `Content-Type: application/json` and appropriate status codes.
- Manual JSON works for simple models -- use Jackson or Gson for complex data.
- The same `Task` and `TaskStore` classes from the CLI project power the API.
- Package as a JAR for easy distribution.

Next up: [Deploying to a VPS with Nginx](./12-deploy-vps-nginx.md) -- putting your API on the internet.
