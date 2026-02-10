---
title: "Concurrency: Threads, Executors, and Virtual Threads"
sidebar_label: "Concurrency"
sidebar_position: 6
description: "Java concurrency guide: threads, ExecutorService, CompletableFuture, virtual threads, thread safety, and common pitfalls."
tags: [java, concurrency, threads, virtual-threads]
---

# Concurrency: Threads, Executors, and Virtual Threads

Java's concurrency model has evolved from raw threads (Java 1.0) through the
`ExecutorService` framework (Java 5) to **Virtual Threads** (Java 21). This page covers
the practical patterns you need for everyday concurrent programming.

## Thread basics

```java
// Option 1: Runnable (preferred -- does not return a value)
Runnable task = () -> System.out.println("Hello from " + Thread.currentThread().getName());
Thread thread = new Thread(task);
thread.start();   // starts a new OS thread
thread.join();    // wait for completion

// Option 2: Callable (returns a value, can throw)
Callable<Integer> computation = () -> {
    Thread.sleep(1000);
    return 42;
};
```

> Never call `thread.run()` -- that executes on the current thread. Always use
> `thread.start()`.

---

## ExecutorService

Instead of managing threads manually, use an `ExecutorService` to manage a **thread pool**:

```java
// Fixed thread pool -- good for CPU-bound work
ExecutorService executor = Executors.newFixedThreadPool(4);

// Submit tasks
Future<Integer> future = executor.submit(() -> {
    Thread.sleep(1000);
    return 42;
});

// Get result (blocks until done)
Integer result = future.get();              // 42
Integer result = future.get(5, TimeUnit.SECONDS); // with timeout

// Shut down when done
executor.shutdown();
executor.awaitTermination(10, TimeUnit.SECONDS);
```

### Thread pool types

| Factory method                      | Behaviour                                      | Use case                             |
|-------------------------------------|------------------------------------------------|--------------------------------------|
| `newFixedThreadPool(n)`             | Fixed number of threads                        | CPU-bound work (n = number of cores) |
| `newCachedThreadPool()`             | Creates threads as needed, reuses idle threads | Short-lived, bursty I/O tasks        |
| `newSingleThreadExecutor()`         | Single thread, tasks queued                    | Sequential background processing     |
| `newScheduledThreadPool(n)`         | Scheduled/periodic execution                   | Timed tasks, polling                 |
| `newVirtualThreadPerTaskExecutor()` | One virtual thread per task (Java 21+)         | High-concurrency I/O                 |

---

## CompletableFuture

`CompletableFuture` is Java's equivalent of JavaScript's `Promise` -- it supports
chaining, combining, and error handling:

### Basic chaining

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchUserName(userId))      // runs on ForkJoinPool
    .thenApply(name -> name.toUpperCase())         // transform result
    .thenApply(name -> "Hello, " + name);          // chain another transform

String greeting = future.join(); // blocks and returns result
// "Hello, ALICE"
```

### Error handling

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> riskyOperation())
    .thenApply(String::toUpperCase)
    .exceptionally(ex -> {
        System.err.println("Failed: " + ex.getMessage());
        return "DEFAULT";
    });
```

### Combining futures

```java
CompletableFuture<String> nameFuture = CompletableFuture.supplyAsync(() -> fetchName());
CompletableFuture<Integer> ageFuture = CompletableFuture.supplyAsync(() -> fetchAge());

// Combine two futures
CompletableFuture<String> combined = nameFuture.thenCombine(ageFuture,
    (name, age) -> name + " is " + age + " years old");

// Wait for all
CompletableFuture<Void> all = CompletableFuture.allOf(nameFuture, ageFuture);
all.join();

// Wait for first
CompletableFuture<Object> any = CompletableFuture.anyOf(nameFuture, ageFuture);
```

### Running on a specific executor

```java
ExecutorService myPool = Executors.newFixedThreadPool(4);

CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchData(), myPool)         // run on myPool
    .thenApplyAsync(data -> process(data), myPool); // also on myPool
```

### Timeout (Java 9+)

```java
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> slowOperation())
    .orTimeout(5, TimeUnit.SECONDS)                    // throws TimeoutException
    .completeOnTimeout("fallback", 5, TimeUnit.SECONDS); // returns default
```

---

## Virtual Threads (Java 21)

**Virtual threads** are lightweight threads managed by the JVM, not the OS. You can
create millions of them without exhausting memory or OS thread limits.

### Creating virtual threads

```java
// Option 1: Thread.startVirtualThread
Thread vt = Thread.startVirtualThread(() -> {
    System.out.println("Running on: " + Thread.currentThread());
});

// Option 2: Thread.ofVirtual()
Thread vt = Thread.ofVirtual()
    .name("my-vthread")
    .start(() -> doWork());

// Option 3: ExecutorService (recommended for production)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<String>> futures = new ArrayList<>();

    for (int i = 0; i < 10_000; i++) {
        futures.add(executor.submit(() -> fetchData()));
    }

    for (Future<String> f : futures) {
        System.out.println(f.get());
    }
} // auto-shutdown
```

### Virtual vs platform threads

| Aspect                  | Platform threads             | Virtual threads                                        |
|-------------------------|------------------------------|--------------------------------------------------------|
| **Managed by**          | OS kernel                    | JVM                                                    |
| **Memory per thread**   | ~1 MB stack                  | ~few KB                                                |
| **Max count**           | Thousands                    | Millions                                               |
| **Best for**            | CPU-bound work               | I/O-bound work (HTTP, DB, file)                        |
| **Blocking cost**       | Expensive (blocks OS thread) | Cheap (JVM parks the virtual thread)                   |
| **Thread pool needed**  | Yes                          | No (one per task is fine)                              |
| **Synchronized blocks** | Fine                         | Can "pin" carrier thread (use `ReentrantLock` instead) |

### When to use virtual threads

```java
// GOOD: I/O-bound workload (HTTP calls, DB queries)
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    List<Future<Response>> futures = urls.stream()
        .map(url -> executor.submit(() -> httpClient.send(url)))
        .toList();

    for (var f : futures) {
        process(f.get());
    }
}

// BAD: CPU-bound workload (number crunching)
// Virtual threads add scheduling overhead without benefit
// Use a fixed thread pool sized to CPU cores instead
```

### Avoiding pinning

Virtual threads are **pinned** (cannot be parked) inside `synchronized` blocks when
they perform blocking operations. Use `ReentrantLock` instead:

```java
// BAD: can pin the carrier thread
synchronized (lock) {
    connection.query("SELECT ...");  // blocking I/O inside synchronized
}

// GOOD: ReentrantLock does not pin
private final ReentrantLock lock = new ReentrantLock();

lock.lock();
try {
    connection.query("SELECT ...");
} finally {
    lock.unlock();
}
```

---

## Thread safety

### Immutability (best approach)

```java
// Records are immutable by default
record Config(String host, int port) {}

// Shared safely between threads with no synchronisation needed
Config config = new Config("localhost", 8080);
```

### Atomic variables

```java
AtomicInteger counter = new AtomicInteger(0);

// Thread-safe increment
counter.incrementAndGet();
counter.addAndGet(5);
counter.compareAndSet(5, 10);

// AtomicReference for objects
AtomicReference<String> ref = new AtomicReference<>("initial");
ref.updateAndGet(s -> s.toUpperCase());
```

### Synchronized blocks

```java
private final Object lock = new Object();
private int balance = 0;

void deposit(int amount) {
    synchronized (lock) {
        balance += amount;
    }
}
```

### ReentrantLock

More flexible than `synchronized` (try-lock, timed lock, interruptible):

```java
private final ReentrantLock lock = new ReentrantLock();

void deposit(int amount) {
    lock.lock();
    try {
        balance += amount;
    } finally {
        lock.unlock();  // always in finally!
    }
}

// Try with timeout
if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try { /* critical section */ }
    finally { lock.unlock(); }
} else {
    // Could not acquire lock within timeout
}
```

---

## Practical example: parallel HTTP fetcher

```java
record UrlResult(String url, int status, String body) {}

List<UrlResult> fetchAll(List<String> urls) {
    HttpClient client = HttpClient.newHttpClient();

    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        List<Future<UrlResult>> futures = urls.stream()
            .map(url -> executor.submit(() -> {
                HttpRequest req = HttpRequest.newBuilder(URI.create(url)).build();
                HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
                return new UrlResult(url, resp.statusCode(), resp.body());
            }))
            .toList();

        return futures.stream()
            .map(f -> {
                try { return f.get(10, TimeUnit.SECONDS); }
                catch (Exception e) { return new UrlResult("error", -1, e.getMessage()); }
            })
            .toList();
    }
}
```

---

## Common pitfalls

| Pitfall                                                | Problem                                       | Fix                                                                       |
|--------------------------------------------------------|-----------------------------------------------|---------------------------------------------------------------------------|
| Shared mutable state                                   | Race conditions, data corruption              | Use immutable objects, AtomicXxx, or synchronisation                      |
| `thread.run()` instead of `start()`                    | Runs on the calling thread, not a new thread  | Always call `start()`                                                     |
| Not shutting down ExecutorService                      | Thread pool keeps the JVM alive               | Call `shutdown()` in a finally block or use try-with-resources (Java 21+) |
| Catching `InterruptedException` and ignoring it        | Breaks interrupt-based cancellation           | Re-interrupt: `Thread.currentThread().interrupt()`                        |
| Deadlock                                               | Two threads each waiting for the other's lock | Lock ordering, timeout-based locking, or lock-free designs                |
| `synchronized` with virtual threads                    | Pins the carrier thread during blocking I/O   | Use `ReentrantLock` instead                                               |
| Thread pool sized to available processors for I/O work | Threads block on I/O, pool is underutilised   | Use virtual threads or a larger cached pool for I/O                       |
| `Future.get()` without timeout                         | Blocks forever if the task never completes    | Always use `get(timeout, unit)`                                           |

---

## See also

- [Collections](./collections.md) -- ConcurrentHashMap, BlockingQueue, thread-safe collections
- [HTTP Clients](./http-clients.md) -- async HTTP with CompletableFuture
- [Error Handling](./error-handling.md) -- exception handling in concurrent code
- [Modern Java Features](./modern-java-features.md) -- virtual threads, structured concurrency
