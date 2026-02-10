---
title: "JSON Processing: Jackson and Gson"
sidebar_label: "JSON Processing"
sidebar_position: 10
description: "Java JSON processing guide: Jackson ObjectMapper, annotations, custom serializers, polymorphism, Gson comparison, and common pitfalls."
tags: [java, json, jackson, gson]
---

# JSON Processing: Jackson and Gson

JSON is the lingua franca of web APIs. Java does not include a built-in JSON library,
so you need either **Jackson** (the de facto standard) or **Gson** (Google's lighter
alternative). This page focuses on Jackson with a Gson comparison at the end.

## Jackson setup

Maven dependency:

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.17.0</version>
</dependency>
```

---

## ObjectMapper basics

`ObjectMapper` is the central class. **Reuse a single instance** -- it is thread-safe
and expensive to create.

### Serialisation (Java to JSON)

```java
ObjectMapper mapper = new ObjectMapper();

record User(String name, String email, int age) {}

User user = new User("Alice", "alice@example.com", 30);
String json = mapper.writeValueAsString(user);
// {"name":"Alice","email":"alice@example.com","age":30}

// Pretty-printed
String pretty = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(user);
```

### Deserialisation (JSON to Java)

```java
String json = """
    {"name":"Alice","email":"alice@example.com","age":30}
    """;

User user = mapper.readValue(json, User.class);
// User[name=Alice, email=alice@example.com, age=30]

// From file
User user = mapper.readValue(new File("user.json"), User.class);

// From InputStream
User user = mapper.readValue(inputStream, User.class);

// From byte[]
User user = mapper.readValue(bytes, User.class);
```

### Deserialising generic types

```java
// List<User> -- cannot use List<User>.class directly
List<User> users = mapper.readValue(json, new TypeReference<List<User>>() {});

// Map<String, Object>
Map<String, Object> map = mapper.readValue(json, new TypeReference<>() {});
```

---

## ObjectMapper configuration

```java
ObjectMapper mapper = new ObjectMapper()
    // Don't fail on unknown JSON properties
    .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    // Don't fail on empty beans
    .configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false)

    // Use ISO-8601 for dates (instead of timestamps)
    .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)

    // Register Java 8 date/time module
    .registerModule(new JavaTimeModule())

    // Pretty print
    .enable(SerializationFeature.INDENT_OUTPUT);
```

### Common modules

| Module                 | Dependency                       | Purpose                                            |
|------------------------|----------------------------------|----------------------------------------------------|
| `JavaTimeModule`       | `jackson-datatype-jsr310`        | Java 8+ date/time (`LocalDate`, `Instant`, etc.)   |
| `Jdk8Module`           | `jackson-datatype-jdk8`          | `Optional` support                                 |
| `ParameterNamesModule` | `jackson-module-parameter-names` | Constructor parameter names (avoid `@JsonCreator`) |
| `KotlinModule`         | `jackson-module-kotlin`          | Kotlin data classes                                |

---

## Annotations

### Field-level annotations

```java
record Product(
    @JsonProperty("product_name")     // JSON field name differs from Java
    String name,

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    String id,                        // serialised but not deserialised

    @JsonIgnore                       // excluded from JSON entirely
    String internalCode,

    @JsonFormat(pattern = "yyyy-MM-dd")
    LocalDate releaseDate,

    @JsonInclude(JsonInclude.Include.NON_NULL)
    String optionalField              // omitted from JSON if null
) {}
```

### Class-level annotations

```java
@JsonIgnoreProperties(ignoreUnknown = true)   // ignore unknown JSON fields
@JsonInclude(JsonInclude.Include.NON_NULL)     // omit all null fields
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class) // snake_case
record ApiResponse(
    int statusCode,
    String errorMessage,
    List<Item> items
) {}

// JSON output: {"status_code":200,"items":[...]}
// (errorMessage omitted because it's null)
```

### @JsonCreator for custom construction

```java
record Money(BigDecimal amount, String currency) {

    @JsonCreator
    Money(
        @JsonProperty("amount") BigDecimal amount,
        @JsonProperty("currency") String currency
    ) {
        this.amount = amount;
        this.currency = currency.toUpperCase();
    }
}
```

---

## Custom serialisers and deserialisers

### Custom serialiser

```java
public class MoneySerializer extends JsonSerializer<Money> {
    @Override
    public void serialize(Money value, JsonGenerator gen, SerializerProvider provider)
            throws IOException {
        gen.writeStartObject();
        gen.writeStringField("amount", value.amount().toPlainString());
        gen.writeStringField("currency", value.currency());
        gen.writeEndObject();
    }
}

// Register on the class
@JsonSerialize(using = MoneySerializer.class)
record Money(BigDecimal amount, String currency) {}

// Or register on the mapper
SimpleModule module = new SimpleModule();
module.addSerializer(Money.class, new MoneySerializer());
mapper.registerModule(module);
```

### Custom deserialiser

```java
public class MoneyDeserializer extends JsonDeserializer<Money> {
    @Override
    public Money deserialize(JsonParser p, DeserializationContext ctx)
            throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        BigDecimal amount = new BigDecimal(node.get("amount").asText());
        String currency = node.get("currency").asText();
        return new Money(amount, currency);
    }
}

@JsonDeserialize(using = MoneyDeserializer.class)
record Money(BigDecimal amount, String currency) {}
```

---

## Polymorphism

When a JSON field can contain different subtypes, use `@JsonTypeInfo`:

```java
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    property = "type"   // JSON discriminator field
)
@JsonSubTypes({
    @JsonSubTypes.Type(value = Circle.class, name = "circle"),
    @JsonSubTypes.Type(value = Rectangle.class, name = "rectangle")
})
sealed interface Shape permits Circle, Rectangle {}

record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}

// Serialisation
Shape shape = new Circle(5.0);
String json = mapper.writeValueAsString(shape);
// {"type":"circle","radius":5.0}

// Deserialisation
Shape deserialized = mapper.readValue(json, Shape.class);
// Circle[radius=5.0]
```

---

## Working with JSON trees

When you don't have (or want) a POJO:

```java
// Parse to tree
JsonNode root = mapper.readTree(jsonString);

// Navigate
String name = root.get("name").asText();
int age = root.get("age").asInt();
boolean hasEmail = root.has("email");

// Nested access
String city = root.path("address").path("city").asText("Unknown");

// Array iteration
JsonNode items = root.get("items");
for (JsonNode item : items) {
    System.out.println(item.get("name").asText());
}

// Build a tree
ObjectNode node = mapper.createObjectNode();
node.put("name", "Alice");
node.put("age", 30);
node.putArray("tags").add("java").add("dev");
String json = mapper.writeValueAsString(node);
```

---

## Gson comparison

### Setup

```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.11.0</version>
</dependency>
```

### Basic usage

```java
Gson gson = new GsonBuilder()
    .setPrettyPrinting()
    .setDateFormat("yyyy-MM-dd")
    .create();

// Serialise
String json = gson.toJson(user);

// Deserialise
User user = gson.fromJson(json, User.class);

// Generic types
List<User> users = gson.fromJson(json, new TypeToken<List<User>>() {}.getType());
```

### Jackson vs Gson

| Feature                | Jackson                                 | Gson                         |
|------------------------|-----------------------------------------|------------------------------|
| **Performance**        | Faster (streaming parser)               | Slower                       |
| **Annotations**        | `@JsonProperty`, `@JsonIgnore`, etc.    | `@SerializedName`, `@Expose` |
| **Tree model**         | `JsonNode`                              | `JsonElement`                |
| **Module system**      | Yes (Java 8 dates, Kotlin, etc.)        | Limited                      |
| **Streaming API**      | `JsonParser` / `JsonGenerator`          | `JsonReader` / `JsonWriter`  |
| **Null handling**      | Omits nulls by default                  | Includes nulls by default    |
| **Bundle size**        | ~1.5 MB (core + databind + annotations) | ~300 KB                      |
| **Default in Spring**  | Yes                                     | No                           |
| **Default in Android** | No                                      | Common                       |

> **Recommendation**: Use Jackson for server-side Java (it is the Spring default and
> has the richest feature set). Use Gson if you need a smaller footprint or are on
> Android.

---

## Common pitfalls

| Pitfall                              | Problem                                                           | Fix                                                                                   |
|--------------------------------------|-------------------------------------------------------------------|---------------------------------------------------------------------------------------|
| Creating `ObjectMapper` per request  | Expensive (class metadata caching)                                | Create once and reuse                                                                 |
| Unknown properties cause failure     | `UnrecognizedPropertyException` on extra JSON fields              | `FAIL_ON_UNKNOWN_PROPERTIES = false` or `@JsonIgnoreProperties(ignoreUnknown = true)` |
| Java 8 dates serialise as numbers    | `LocalDate` becomes `[2024, 1, 15]`                               | Register `JavaTimeModule`, disable `WRITE_DATES_AS_TIMESTAMPS`                        |
| Circular references                  | `StackOverflowError` during serialisation                         | `@JsonManagedReference` / `@JsonBackReference`, or `@JsonIdentityInfo`                |
| Records need parameter names         | Jackson can't match constructor params without `-parameters` flag | Add `jackson-module-parameter-names` or use `@JsonProperty`                           |
| Mutable `ObjectMapper` after sharing | Thread-safety issues                                              | Configure once, then call `mapper.copy()` if you need a variant                       |
| `Optional` fields                    | Serialised as `{"present":true,"value":"x"}`                      | Register `Jdk8Module` for correct `"x"` / `null` handling                             |

---

## See also

- [HTTP Clients](./http-clients.md) -- sending/receiving JSON over HTTP
- [Modern Java Features](./modern-java-features.md) -- records as JSON DTOs
- [Testing](./testing.md) -- testing JSON serialisation
- [Error Handling](./error-handling.md) -- handling parse errors
