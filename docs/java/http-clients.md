---
title: "HTTP Clients: java.net.http, OkHttp, and Apache HttpClient"
sidebar_label: "HTTP Clients"
sidebar_position: 9
description: "Java HTTP client guide: java.net.http HttpClient (sync and async), timeouts, retries, JSON handling, and comparison with OkHttp and Apache HttpClient."
tags: [java, http, networking]
---

# HTTP Clients

Since Java 11, the JDK ships with a modern, built-in HTTP client (`java.net.http.HttpClient`)
that supports HTTP/1.1, HTTP/2, synchronous and asynchronous requests, and WebSocket.
For most use cases, you no longer need a third-party library.

## java.net.http.HttpClient (Java 11+)

### Basic GET request

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .header("Accept", "application/json")
    .GET()  // default, can be omitted
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

System.out.println(response.statusCode()); // 200
System.out.println(response.body());       // {"name":"Alice",...}
System.out.println(response.headers().map()); // all headers
```

### POST with JSON body

```java
String json = """
    {
      "name": "Alice",
      "email": "alice@example.com"
    }
    """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
```

### Other HTTP methods

```java
// PUT
HttpRequest put = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .header("Content-Type", "application/json")
    .PUT(HttpRequest.BodyPublishers.ofString(json))
    .build();

// DELETE
HttpRequest delete = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .DELETE()
    .build();

// PATCH (use method())
HttpRequest patch = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users/1"))
    .header("Content-Type", "application/json")
    .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
    .build();
```

---

## Client configuration

### Timeouts

```java
HttpClient client = HttpClient.newBuilder()
    .connectTimeout(Duration.ofSeconds(5))
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/slow"))
    .timeout(Duration.ofSeconds(10))  // per-request timeout
    .build();

try {
    HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
} catch (HttpTimeoutException e) {
    System.err.println("Request timed out: " + e.getMessage());
}
```

### HTTP/2 and redirects

```java
HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)       // prefer HTTP/2
    .followRedirects(HttpClient.Redirect.NORMAL) // follow 3xx redirects
    .build();
```

### Authentication

```java
HttpClient client = HttpClient.newBuilder()
    .authenticator(new Authenticator() {
        @Override
        protected PasswordAuthentication getPasswordAuthentication() {
            return new PasswordAuthentication("user", "pass".toCharArray());
        }
    })
    .build();
```

### Custom headers on every request

The built-in client does not have a global interceptor. Create a helper:

```java
class ApiClient {
    private final HttpClient client = HttpClient.newHttpClient();
    private final String baseUrl;
    private final String apiKey;

    ApiClient(String baseUrl, String apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    HttpRequest.Builder requestBuilder(String path) {
        return HttpRequest.newBuilder()
            .uri(URI.create(baseUrl + path))
            .header("Authorization", "Bearer " + apiKey)
            .header("Accept", "application/json");
    }

    HttpResponse<String> get(String path) throws IOException, InterruptedException {
        return client.send(
            requestBuilder(path).GET().build(),
            HttpResponse.BodyHandlers.ofString()
        );
    }

    HttpResponse<String> post(String path, String body)
            throws IOException, InterruptedException {
        return client.send(
            requestBuilder(path)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build(),
            HttpResponse.BodyHandlers.ofString()
        );
    }
}
```

---

## Async requests

The `sendAsync` method returns a `CompletableFuture`:

```java
HttpClient client = HttpClient.newHttpClient();

CompletableFuture<HttpResponse<String>> future = client.sendAsync(
    HttpRequest.newBuilder(URI.create("https://api.example.com/users")).build(),
    HttpResponse.BodyHandlers.ofString()
);

// Non-blocking chaining
future
    .thenApply(HttpResponse::body)
    .thenApply(body -> parseJson(body))
    .thenAccept(user -> System.out.println("Got: " + user.name()))
    .exceptionally(ex -> {
        System.err.println("Failed: " + ex.getMessage());
        return null;
    });
```

### Parallel requests

```java
List<String> urls = List.of(
    "https://api.example.com/users/1",
    "https://api.example.com/users/2",
    "https://api.example.com/users/3"
);

List<CompletableFuture<String>> futures = urls.stream()
    .map(url -> client.sendAsync(
        HttpRequest.newBuilder(URI.create(url)).build(),
        HttpResponse.BodyHandlers.ofString()
    ).thenApply(HttpResponse::body))
    .toList();

// Wait for all
CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();

List<String> bodies = futures.stream()
    .map(CompletableFuture::join)
    .toList();
```

---

## Body handlers and publishers

### Response body handlers

```java
// String
HttpResponse<String> strResp = client.send(req, HttpResponse.BodyHandlers.ofString());

// byte[]
HttpResponse<byte[]> byteResp = client.send(req, HttpResponse.BodyHandlers.ofByteArray());

// File download
HttpResponse<Path> fileResp = client.send(req,
    HttpResponse.BodyHandlers.ofFile(Path.of("download.zip")));

// Stream of lines
HttpResponse<Stream<String>> lineResp = client.send(req,
    HttpResponse.BodyHandlers.ofLines());

// Discard body
HttpResponse<Void> discardResp = client.send(req, HttpResponse.BodyHandlers.discarding());
```

### Request body publishers

```java
// String
HttpRequest.BodyPublishers.ofString("{\"key\":\"value\"}")

// File
HttpRequest.BodyPublishers.ofFile(Path.of("data.json"))

// byte[]
HttpRequest.BodyPublishers.ofByteArray(bytes)

// No body
HttpRequest.BodyPublishers.noBody()

// Form data
String formBody = "username=alice&password=secret";
HttpRequest.BodyPublishers.ofString(formBody)
// + header("Content-Type", "application/x-www-form-urlencoded")
```

---

## JSON with Jackson

Combine the HTTP client with Jackson for typed JSON handling:

```java
record User(String name, String email, int age) {}

ObjectMapper mapper = new ObjectMapper();

// Deserialize response
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
User user = mapper.readValue(response.body(), User.class);

// Serialize request body
User newUser = new User("Alice", "alice@example.com", 30);
String json = mapper.writeValueAsString(newUser);

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/users"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(json))
    .build();
```

---

## Retry pattern

```java
<T> HttpResponse<T> sendWithRetry(
        HttpClient client,
        HttpRequest request,
        HttpResponse.BodyHandler<T> handler,
        int maxRetries) throws IOException, InterruptedException {

    IOException lastException = null;

    for (int attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            HttpResponse<T> response = client.send(request, handler);
            if (response.statusCode() < 500) {
                return response; // success or client error (no retry)
            }
            // Server error -- retry
            lastException = new IOException("Server error: " + response.statusCode());
        } catch (IOException e) {
            lastException = e;
        }

        if (attempt < maxRetries) {
            long delay = (long) Math.pow(2, attempt) * 1000; // exponential backoff
            Thread.sleep(delay);
        }
    }
    throw lastException;
}

// Usage
HttpResponse<String> response = sendWithRetry(client, request,
    HttpResponse.BodyHandlers.ofString(), 3);
```

---

## Library comparison

| Feature | `java.net.http` | OkHttp | Apache HttpClient 5 |
|---------|----------------|--------|---------------------|
| **JDK version** | 11+ (built-in) | External dependency | External dependency |
| **HTTP/2** | Yes | Yes | Yes |
| **Async** | `CompletableFuture` | `Call.enqueue(Callback)` | `SimpleHttpAsyncClient` |
| **Interceptors** | No (manual) | Yes (built-in chain) | Yes (request/response interceptors) |
| **Connection pooling** | Yes (automatic) | Yes (configurable) | Yes (configurable) |
| **WebSocket** | Yes | Yes | No |
| **Multipart upload** | Manual | `MultipartBody` | `MultipartEntityBuilder` |
| **Cookie handling** | `CookieHandler` | `CookieJar` | `CookieStore` |
| **Bundle size** | 0 KB (JDK) | ~400 KB | ~800 KB |

### When to use which

| Scenario | Recommendation |
|----------|---------------|
| Simple API calls, no extra dependencies | `java.net.http` |
| Need interceptors, logging, retry middleware | OkHttp |
| Enterprise, fine-grained connection management | Apache HttpClient 5 |
| Android development | OkHttp (standard in Android ecosystem) |

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| No timeout configured | Request hangs forever on slow servers | Set both `connectTimeout` and per-request `timeout` |
| Ignoring status codes | Treating 4xx/5xx as success | Check `response.statusCode()` before processing body |
| Not closing InputStream body handlers | Resource leak | Use `ofString()` or ensure streams are closed |
| Creating a new `HttpClient` per request | Misses connection pooling and HTTP/2 multiplexing | Reuse a single `HttpClient` instance |
| Blocking on `CompletableFuture` in async code | Defeats the purpose of async | Chain with `thenApply` / `thenAccept` |
| Hardcoded base URLs | Difficult to test, environment-specific | Inject base URL via configuration |

---

## See also

- [JSON Processing: Jackson and Gson](./json-processing.md) -- serialisation/deserialisation
- [Concurrency](./concurrency.md) -- CompletableFuture, virtual threads for I/O
- [Error Handling](./error-handling.md) -- handling HTTP errors gracefully
- [Testing](./testing.md) -- mocking HTTP clients in tests
