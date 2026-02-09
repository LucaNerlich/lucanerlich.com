---
title: "Testing"
sidebar_label: "Testing"
description: Write your first Java tests -- JUnit 5 setup, assertions, test structure, parameterized tests, and testing the Task Manager and REST API.
slug: /java/beginners-guide/testing
tags: [java, beginners, testing, junit]
keywords:
  - java testing
  - junit 5
  - unit tests
  - test driven development
  - assertj
sidebar_position: 17
---

# Testing

Tests are code that verifies other code works correctly. They catch bugs early, give you confidence to refactor, and serve as living documentation of how your code is supposed to behave.

## Why test?

Without tests, every change is risky. You edit one function, and something unrelated breaks -- but you do not find out until a user reports it. With tests:

- **Catch bugs early** -- a failing test tells you immediately that something broke.
- **Refactor with confidence** -- change the implementation, run the tests, know it still works.
- **Document behavior** -- tests show exactly what the code is supposed to do.
- **Prevent regressions** -- once a bug is fixed and a test is added, that bug can never come back silently.

## Setting up JUnit 5

### With Maven (chapter 13)

Add to `pom.xml`:

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
```

### With Gradle (chapter 14)

Add to `build.gradle.kts`:

```kotlin
dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")
}

tasks.test {
    useJUnitPlatform()
}
```

### Test file location

Tests live in a parallel `src/test/java/` directory, mirroring the main source structure:

```text
project/
├── src/
│   ├── main/java/
│   │   └── taskapi/
│   │       ├── Task.java
│   │       ├── TaskStore.java
│   │       └── ApiServer.java
│   └── test/java/
│       └── taskapi/
│           ├── TaskTest.java
│           ├── TaskStoreTest.java
│           └── ApiServerTest.java
├── pom.xml (or build.gradle.kts)
```

## Your first test

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {

    @Test
    void addsTwoNumbers() {
        int result = Calculator.add(2, 3);
        assertEquals(5, result);
    }

    @Test
    void addingZeroChangesNothing() {
        assertEquals(7, Calculator.add(7, 0));
        assertEquals(7, Calculator.add(0, 7));
    }
}
```

### Running tests

```bash
# Maven
mvn test

# Gradle
gradle test
```

Output:
```text
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
```

### Test naming conventions

- Test class: `ThingTest` or `ThingTests` (e.g., `TaskStoreTest`)
- Test method: describes the behavior being tested
- Use `@DisplayName` for human-readable names in reports

```java
@Test
@DisplayName("should reject negative quantities")
void rejectsNegativeQuantity() {
    assertThrows(IllegalArgumentException.class,
        () -> new Order("Widget", -1));
}
```

## Assertions

JUnit 5 provides assertions in `org.junit.jupiter.api.Assertions`:

### Basic assertions

```java
@Test
void basicAssertions() {
    // Equality
    assertEquals(4, 2 + 2);
    assertEquals("hello", "HELLO".toLowerCase());

    // Boolean
    assertTrue(5 > 3);
    assertFalse(5 < 3);

    // Null
    assertNull(null);
    assertNotNull("value");

    // Same reference
    String a = "hello";
    String b = a;
    assertSame(a, b);
}
```

### Assertion messages

Add a message that appears when the assertion fails:

```java
assertEquals(100, account.getBalance(),
    "Balance should be 100 after deposit");
```

### `assertThrows` -- verify exceptions

```java
@Test
void throwsOnInvalidInput() {
    IllegalArgumentException ex = assertThrows(
        IllegalArgumentException.class,
        () -> divide(10, 0)
    );
    assertEquals("Cannot divide by zero", ex.getMessage());
}
```

### `assertAll` -- check multiple conditions at once

```java
@Test
void userHasCorrectProperties() {
    User user = new User("Ada", "ada@example.com", 36);

    assertAll("user properties",
        () -> assertEquals("Ada", user.name()),
        () -> assertEquals("ada@example.com", user.email()),
        () -> assertEquals(36, user.age())
    );
}
```

`assertAll` runs every assertion even if one fails, so you see all failures at once.

### `assertTimeout` -- verify performance

```java
@Test
void completesInTime() {
    assertTimeout(Duration.ofSeconds(2), () -> {
        // Code that should finish within 2 seconds
        Thread.sleep(100);
    });
}
```

## Test structure: Arrange-Act-Assert

Every test follows the same three-step pattern:

```java
@Test
void completingATaskMarksItDone() {
    // Arrange -- set up the test data
    Task task = new Task(1, "Write tests", false);

    // Act -- perform the action being tested
    Task completed = task.withDone(true);

    // Assert -- verify the result
    assertTrue(completed.done());
    assertEquals("Write tests", completed.description());
}
```

This pattern keeps tests focused and readable:
1. **Arrange** -- create objects, prepare data
2. **Act** -- call the method you are testing
3. **Assert** -- check the result

## Setup and teardown

### `@BeforeEach` -- runs before every test

```java
class TaskStoreTest {

    private TaskStore store;

    @BeforeEach
    void setUp() {
        store = new TaskStore();
        store.add("Write introduction");
        store.add("Add error handling");
    }

    @Test
    void startsWithTwoTasks() {
        assertEquals(2, store.all().size());
    }

    @Test
    void addingTaskIncreasesCount() {
        store.add("Write tests");
        assertEquals(3, store.all().size());
    }
}
```

Each test gets a fresh `TaskStore` -- tests do not affect each other.

### `@AfterEach` -- runs after every test

```java
@AfterEach
void tearDown() {
    // Clean up resources -- delete temp files, close connections
    tempFile.delete();
}
```

### `@BeforeAll` / `@AfterAll` -- run once for the entire class

```java
@BeforeAll
static void setUpOnce() {
    // Expensive setup that only needs to happen once
    // Must be static
}

@AfterAll
static void tearDownOnce() {
    // Cleanup after all tests in this class
}
```

## Testing the Task Manager

Let us write tests for the Task Manager from chapter 10. Assume we have:

```java
record Task(int id, String description, boolean done) {}

class TaskStore {
    private final List<Task> tasks = new ArrayList<>();
    private int nextId = 1;

    public Task add(String description) { ... }
    public Optional<Task> findById(int id) { ... }
    public boolean complete(int id) { ... }
    public boolean delete(int id) { ... }
    public List<Task> all() { ... }
}
```

### CRUD tests

```java
class TaskStoreTest {

    private TaskStore store;

    @BeforeEach
    void setUp() {
        store = new TaskStore();
    }

    @Test
    @DisplayName("add() creates a new task with auto-incremented ID")
    void addCreatesTask() {
        Task task = store.add("Learn testing");

        assertEquals(1, task.id());
        assertEquals("Learn testing", task.description());
        assertFalse(task.done());
    }

    @Test
    @DisplayName("add() assigns sequential IDs")
    void addAssignsSequentialIds() {
        Task first = store.add("First");
        Task second = store.add("Second");

        assertEquals(1, first.id());
        assertEquals(2, second.id());
    }

    @Test
    @DisplayName("findById() returns the task when it exists")
    void findByIdReturnsTask() {
        store.add("Learn testing");

        Optional<Task> found = store.findById(1);

        assertTrue(found.isPresent());
        assertEquals("Learn testing", found.get().description());
    }

    @Test
    @DisplayName("findById() returns empty when task does not exist")
    void findByIdReturnsEmptyForMissingTask() {
        Optional<Task> found = store.findById(999);

        assertTrue(found.isEmpty());
    }

    @Test
    @DisplayName("complete() marks a task as done")
    void completeMarksTaskDone() {
        store.add("Learn testing");

        boolean result = store.complete(1);

        assertTrue(result);
        assertTrue(store.findById(1).get().done());
    }

    @Test
    @DisplayName("complete() returns false for non-existent task")
    void completeReturnsFalseForMissingTask() {
        assertFalse(store.complete(999));
    }

    @Test
    @DisplayName("delete() removes the task")
    void deleteRemovesTask() {
        store.add("Learn testing");

        boolean result = store.delete(1);

        assertTrue(result);
        assertTrue(store.findById(1).isEmpty());
        assertEquals(0, store.all().size());
    }

    @Test
    @DisplayName("all() returns all tasks")
    void allReturnsAllTasks() {
        store.add("First");
        store.add("Second");
        store.add("Third");

        List<Task> all = store.all();

        assertEquals(3, all.size());
    }
}
```

### Edge case tests

```java
@Test
@DisplayName("add() trims whitespace from description")
void addTrimsWhitespace() {
    Task task = store.add("  Learn testing  ");
    assertEquals("Learn testing", task.description());
}

@Test
@DisplayName("add() rejects empty description")
void addRejectsEmptyDescription() {
    assertThrows(IllegalArgumentException.class,
        () -> store.add(""));
}

@Test
@DisplayName("add() rejects null description")
void addRejectsNullDescription() {
    assertThrows(IllegalArgumentException.class,
        () -> store.add(null));
}

@Test
@DisplayName("deleting a task does not affect other tasks' IDs")
void deleteDoesNotAffectOtherIds() {
    store.add("First");
    store.add("Second");
    store.add("Third");

    store.delete(2);

    assertTrue(store.findById(1).isPresent());
    assertTrue(store.findById(2).isEmpty());
    assertTrue(store.findById(3).isPresent());
}
```

### Testing file persistence

```java
import java.nio.file.*;

class TaskStorePersistenceTest {

    private Path tempFile;
    private TaskStore store;

    @BeforeEach
    void setUp() throws Exception {
        tempFile = Files.createTempFile("tasks", ".dat");
        store = new TaskStore(tempFile);
    }

    @AfterEach
    void tearDown() throws Exception {
        Files.deleteIfExists(tempFile);
    }

    @Test
    @DisplayName("tasks survive save and reload")
    void tasksSurviveReload() {
        store.add("Persistent task");
        store.save();

        // Create a new store from the same file
        TaskStore reloaded = new TaskStore(tempFile);
        reloaded.load();

        assertEquals(1, reloaded.all().size());
        assertEquals("Persistent task", reloaded.all().get(0).description());
    }

    @Test
    @DisplayName("completed status is persisted")
    void completedStatusIsPersisted() {
        store.add("Task to complete");
        store.complete(1);
        store.save();

        TaskStore reloaded = new TaskStore(tempFile);
        reloaded.load();

        assertTrue(reloaded.findById(1).get().done());
    }
}
```

## Parameterized tests

Test the same logic with multiple inputs using `@ParameterizedTest`:

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

class ValidationTest {

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "  \t  "})
    @DisplayName("rejects blank descriptions")
    void rejectsBlankDescriptions(String description) {
        TaskStore store = new TaskStore();
        assertThrows(IllegalArgumentException.class,
            () -> store.add(description));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Buy milk", "Learn Java", "Write tests"})
    @DisplayName("accepts valid descriptions")
    void acceptsValidDescriptions(String description) {
        TaskStore store = new TaskStore();
        Task task = store.add(description);
        assertEquals(description, task.description());
    }
}
```

### `@CsvSource` -- multiple parameters per test case

```java
@ParameterizedTest
@CsvSource({
    "1, true",
    "2, false",
    "3, false"
})
@DisplayName("checks task completion status")
void checksCompletionStatus(int id, boolean expectedDone) {
    TaskStore store = new TaskStore();
    store.add("Task 1"); // id 1
    store.add("Task 2"); // id 2
    store.add("Task 3"); // id 3
    store.complete(1);

    assertEquals(expectedDone, store.findById(id).get().done());
}
```

### `@MethodSource` -- complex test data from a method

```java
@ParameterizedTest
@MethodSource("invalidDescriptions")
@DisplayName("rejects invalid descriptions")
void rejectsInvalidDescriptions(String description, String reason) {
    TaskStore store = new TaskStore();
    IllegalArgumentException ex = assertThrows(
        IllegalArgumentException.class,
        () -> store.add(description)
    );
    // Optionally verify the error message relates to the reason
    assertNotNull(ex.getMessage());
}

static Stream<Arguments> invalidDescriptions() {
    return Stream.of(
        Arguments.of(null, "null"),
        Arguments.of("", "empty string"),
        Arguments.of("   ", "only whitespace"),
        Arguments.of("ab", "too short")
    );
}
```

## Testing the REST API

Testing the HTTP server from chapter 11 requires starting it in the test and sending real HTTP requests:

```java
import java.net.http.*;
import java.net.URI;

class ApiServerTest {

    private static HttpServer server;
    private static final int PORT = 0; // Random available port

    private HttpClient client;
    private String baseUrl;

    @BeforeEach
    void setUp() throws Exception {
        // Start a fresh server for each test
        TaskStore store = new TaskStore();
        server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/", new TaskHandler(store));
        server.start();

        int actualPort = server.getAddress().getPort();
        baseUrl = "http://localhost:" + actualPort;
        client = HttpClient.newHttpClient();
    }

    @AfterEach
    void tearDown() {
        server.stop(0);
    }

    @Test
    @DisplayName("GET /api/tasks returns empty list initially")
    void getTasksReturnsEmptyList() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/api/tasks"))
            .GET()
            .build();

        HttpResponse<String> response = client.send(request,
            HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertEquals("[]", response.body());
    }

    @Test
    @DisplayName("POST /api/tasks creates a new task")
    void postCreatesTask() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/api/tasks"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(
                "{\"description\":\"Test task\"}"))
            .build();

        HttpResponse<String> response = client.send(request,
            HttpResponse.BodyHandlers.ofString());

        assertEquals(201, response.statusCode());
        assertTrue(response.body().contains("Test task"));
    }

    @Test
    @DisplayName("GET /api/tasks returns created tasks")
    void getReturnsCreatedTasks() throws Exception {
        // Create a task first
        HttpRequest post = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/api/tasks"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(
                "{\"description\":\"First task\"}"))
            .build();
        client.send(post, HttpResponse.BodyHandlers.ofString());

        // Now list tasks
        HttpRequest get = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/api/tasks"))
            .GET()
            .build();

        HttpResponse<String> response = client.send(get,
            HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("First task"));
    }

    @Test
    @DisplayName("DELETE /api/tasks/1 removes the task")
    void deleteRemovesTask() throws Exception {
        // Create a task
        HttpRequest post = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/api/tasks"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(
                "{\"description\":\"To delete\"}"))
            .build();
        client.send(post, HttpResponse.BodyHandlers.ofString());

        // Delete it
        HttpRequest delete = HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + "/api/tasks/1"))
            .DELETE()
            .build();

        HttpResponse<String> response = client.send(delete,
            HttpResponse.BodyHandlers.ofString());

        assertEquals(200, response.statusCode());
    }
}
```

**Key patterns:**
- Use port `0` to let the OS assign a random free port -- avoids conflicts when running tests in parallel.
- Start a fresh server in `@BeforeEach` so tests are isolated.
- Stop the server in `@AfterEach` to free the port.

## AssertJ -- fluent assertions

JUnit's built-in assertions work, but [AssertJ](https://assertj.github.io/doc/) provides a more readable, fluent style:

### Adding AssertJ

**Maven:**
```xml
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <version>3.26.3</version>
    <scope>test</scope>
</dependency>
```

**Gradle:**
```kotlin
testImplementation("org.assertj:assertj-core:3.26.3")
```

### Side-by-side comparison

```java
import static org.assertj.core.api.Assertions.*;

// JUnit
assertEquals(3, list.size());
assertTrue(list.contains("Ada"));
assertNotNull(result);

// AssertJ -- reads like English
assertThat(list).hasSize(3);
assertThat(list).contains("Ada");
assertThat(result).isNotNull();
```

### AssertJ examples

```java
@Test
void assertJExamples() {
    List<Task> tasks = List.of(
        new Task(1, "Write code", true),
        new Task(2, "Write tests", false),
        new Task(3, "Deploy", false)
    );

    // Collection assertions
    assertThat(tasks)
        .hasSize(3)
        .extracting(Task::description)
        .contains("Write code", "Write tests", "Deploy");

    // Filtering
    assertThat(tasks)
        .filteredOn(Task::done)
        .hasSize(1)
        .extracting(Task::description)
        .containsExactly("Write code");

    // String assertions
    assertThat("Hello, World!")
        .startsWith("Hello")
        .endsWith("!")
        .contains("World")
        .hasSize(13);

    // Exception assertions
    assertThatThrownBy(() -> divide(10, 0))
        .isInstanceOf(ArithmeticException.class)
        .hasMessageContaining("zero");

    // Optional assertions
    assertThat(Optional.of("Ada"))
        .isPresent()
        .hasValue("Ada");

    assertThat(Optional.empty())
        .isEmpty();
}
```

AssertJ's fluent API provides much better error messages on failure. Instead of "expected true but was false", you get "expected list to contain 'Ada' but it was [Bob, Charlie]".

## What makes a good test

Follow the **FIRST** principles:

| Principle | Meaning |
|-----------|---------|
| **Fast** | Tests should run in milliseconds, not seconds |
| **Isolated** | Each test is independent -- no shared state, no required execution order |
| **Repeatable** | Same result every time, on any machine |
| **Self-validating** | Passes or fails automatically -- no manual inspection |
| **Timely** | Written alongside the code, not months later |

### Dos and Don'ts

| Do | Don't |
|----|-------|
| Test one thing per test | Test multiple unrelated behaviors |
| Use descriptive test names | Name tests `test1`, `test2`, `test3` |
| Test edge cases (empty, null, boundary) | Only test the happy path |
| Keep tests independent | Rely on test execution order |
| Make tests deterministic | Use `Math.random()` or current time |
| Test behavior, not implementation | Assert internal state of private fields |

### How much to test

- **Always test:** public API methods, business logic, edge cases, bug fixes (regression tests).
- **Skip testing:** simple getters/setters, framework code, third-party libraries.
- **Use judgment:** aim for tests that give you confidence, not 100% coverage for its own sake.

## Running tests

### Command line

```bash
# Maven -- run all tests
mvn test

# Maven -- run a specific test class
mvn test -Dtest=TaskStoreTest

# Maven -- run a specific test method
mvn test -Dtest=TaskStoreTest#addCreatesTask

# Gradle -- run all tests
gradle test

# Gradle -- run a specific test class
gradle test --tests taskapi.TaskStoreTest
```

### IDE

Most IDEs (IntelliJ IDEA, VS Code with Java extensions) let you:
- Click the green play button next to a test to run it
- Right-click a test class to run all tests in it
- See results inline with pass/fail icons

## Summary

- **Tests verify behavior** -- they catch bugs early and give you confidence to change code.
- **JUnit 5** is the standard Java testing framework -- add it as a `test` dependency.
- Use the **Arrange-Act-Assert** pattern: set up, perform the action, check the result.
- **`@BeforeEach`** / **`@AfterEach`** ensure each test starts with a clean state.
- **`@ParameterizedTest`** tests the same logic with multiple inputs -- less duplication.
- **Test edge cases**: empty input, null values, boundary conditions, error paths.
- **AssertJ** provides fluent, readable assertions with better error messages.
- Good tests are **fast, isolated, repeatable, and self-validating**.

For advanced patterns including mocking with Mockito, test doubles, integration testing, and test-driven development, see the [Testing reference](/java/testing).
