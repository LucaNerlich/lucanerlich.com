---
title: "Unit Testing in Java with JUnit 5"
sidebar_label: "Unit Testing (Java)"
description: JUnit 5 setup with Maven and Gradle, @Test, lifecycle annotations, Assertions, @DisplayName, @Nested, and parameterised tests.
slug: /testing/beginners-guide/unit-testing-java
tags: [testing, beginners, java, junit, junit5]
keywords:
  - junit 5 setup
  - junit 5 maven
  - junit 5 gradle
  - @Test @BeforeEach
  - @Nested
  - parameterized tests java
sidebar_position: 3
---

# Unit Testing in Java with JUnit 5

JUnit 5 is the current standard test framework for Java. It is a significant evolution from JUnit 4 — modular, extensible, and much more expressive. If you have written tests before in JUnit 4, many concepts carry over; the annotations and some APIs have changed, but the philosophy is the same. If you are starting fresh, JUnit 5 is what you should learn.

JUnit 5 is composed of three sub-projects:
- **JUnit Platform** — the foundation for launching tests on the JVM
- **JUnit Jupiter** — the new programming model (the annotations you write)
- **JUnit Vintage** — backwards-compatibility layer for running JUnit 3/4 tests

In practice you add one dependency and work entirely with Jupiter.

## Setting Up JUnit 5

### With Maven

Add to `pom.xml`:

```xml
<dependencies>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.11.0</version>
        <scope>test</scope>
    </dependency>
</dependencies>

<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.3.1</version>
        </plugin>
    </plugins>
</build>
```

The `junit-jupiter` artifact is an aggregator that pulls in `junit-jupiter-api`, `junit-jupiter-engine`, and `junit-jupiter-params`. Maven Surefire 3.x supports JUnit 5 natively.

Run tests with:

```bash
mvn test
```

### With Gradle

Add to `build.gradle.kts`:

```kotlin
dependencies {
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.0")
}

tasks.test {
    useJUnitPlatform()
}
```

Run tests with:

```bash
./gradlew test
```

### Recommended: Also Add AssertJ

AssertJ provides a fluent assertion API that is much more readable than JUnit's built-in `Assertions` class. Add it alongside JUnit:

```xml
<!-- Maven -->
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <version>3.26.3</version>
    <scope>test</scope>
</dependency>
```

```kotlin
// Gradle
testImplementation("org.assertj:assertj-core:3.26.3")
```

## Test File Conventions

Java tests live in `src/test/java` and mirror the package structure of the production code in `src/main/java`. Test classes are conventionally named with a `Test` suffix:

```text
src/
  main/java/com/example/
    cart/
      CartService.java
    pricing/
      PricingEngine.java
  test/java/com/example/
    cart/
      CartServiceTest.java
    pricing/
      PricingEngineTest.java
```

## Your First Test

Here is the class under test:

```java
// src/main/java/com/example/math/MathUtils.java
package com.example.math;

public class MathUtils {

    public int add(int a, int b) {
        return a + b;
    }

    public double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Division by zero");
        }
        return a / b;
    }
}
```

And the tests:

```java
// src/test/java/com/example/math/MathUtilsTest.java
package com.example.math;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MathUtilsTest {

    private final MathUtils math = new MathUtils();

    @Test
    void addReturnsSumOfTwoPositiveNumbers() {
        int result = math.add(2, 3);
        assertEquals(5, result);
    }

    @Test
    void addHandlesNegativeNumbers() {
        assertEquals(-3, math.add(-1, -2));
    }

    @Test
    void divideReturnCorrectQuotient() {
        assertEquals(5.0, math.divide(10.0, 2.0));
    }

    @Test
    void divideThrowsWhenDivisorIsZero() {
        assertThrows(ArithmeticException.class, () -> math.divide(10.0, 0));
    }
}
```

## The @Test Annotation

`@Test` marks a method as a test case. The method must be:
- `void` return type
- Not `private` (package-private is fine; the framework uses reflection)
- In a non-abstract class

JUnit 5 creates a **new instance of the test class for each test method** by default. This means fields set in `setUp` methods or directly (like `new MathUtils()` above) are always fresh. This intentional isolation prevents state from leaking between tests.

## Lifecycle Annotations

| Annotation | Runs | Use for |
|---|---|---|
| `@BeforeEach` | Before each test method | Create fresh objects, reset mocks |
| `@AfterEach` | After each test method | Release resources, clean database rows |
| `@BeforeAll` | Once before all tests (static) | Start a server, connect to a database |
| `@AfterAll` | Once after all tests (static) | Stop the server, close the connection |

```java
import org.junit.jupiter.api.*;
import java.util.ArrayList;
import java.util.List;

class ListServiceTest {

    private List<String> list;

    @BeforeEach
    void setUp() {
        list = new ArrayList<>();
        list.add("initial");
    }

    @AfterEach
    void tearDown() {
        list.clear();
    }

    @Test
    void addElement() {
        list.add("new");
        assertEquals(2, list.size());
    }

    @Test
    void removeElement() {
        list.remove("initial");
        assertTrue(list.isEmpty());
    }
}
```

`@BeforeAll` and `@AfterAll` require `static` methods unless you configure the test instance lifecycle to `PER_CLASS`:

```java
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ExpensiveSetupTest {

    private DatabaseConnection connection;

    @BeforeAll
    void connectToDb() {  // not static because of PER_CLASS
        connection = DatabaseConnection.connect("jdbc:h2:mem:test");
    }

    @AfterAll
    void closeDb() {
        connection.close();
    }
}
```

## The Assertions Class

JUnit Jupiter ships `org.junit.jupiter.api.Assertions` with static methods for common checks:

```java
import static org.junit.jupiter.api.Assertions.*;

// Equality
assertEquals(expected, actual);
assertEquals(expected, actual, "failure message");
assertNotEquals(unexpected, actual);

// Booleans
assertTrue(condition);
assertFalse(condition);

// Null checks
assertNull(object);
assertNotNull(object);

// Arrays
assertArrayEquals(new int[]{1, 2}, result);

// Exceptions
assertThrows(IllegalArgumentException.class, () -> service.create(null));

// Multiple assertions — all run even if one fails
assertAll("user fields",
    () -> assertEquals("Alice", user.getName()),
    () -> assertEquals(30, user.getAge()),
    () -> assertNotNull(user.getEmail())
);
```

### AssertJ: A More Readable Alternative

AssertJ's fluent API reads like a sentence:

```java
import static org.assertj.core.api.Assertions.*;

// Instead of: assertEquals("Alice", user.getName())
assertThat(user.getName()).isEqualTo("Alice");

// Strings
assertThat(message).startsWith("Error")
                   .contains("not found")
                   .endsWith(".");

// Collections
assertThat(users).hasSize(3)
                 .extracting(User::getName)
                 .containsExactlyInAnyOrder("Alice", "Bob", "Carol");

// Numbers
assertThat(price).isPositive()
                 .isLessThan(BigDecimal.valueOf(1000));

// Exceptions
assertThatThrownBy(() -> service.findById(-1))
    .isInstanceOf(IllegalArgumentException.class)
    .hasMessageContaining("must be positive");
```

## @DisplayName

By default, JUnit uses the method name as the test label. `@DisplayName` lets you write a human-readable sentence:

```java
@Test
@DisplayName("Cart total is zero when cart is empty")
void emptyCartHasZeroTotal() {
    Cart cart = new Cart();
    assertEquals(0.0, cart.getTotal());
}

@Test
@DisplayName("Adding an item with quantity 0 throws IllegalArgumentException")
void addItemWithZeroQuantityThrows() {
    assertThrows(IllegalArgumentException.class,
        () -> new Cart().addItem("apple", 0, 1.50));
}
```

The display name appears in IDE test runners and CI reports.

## @Nested

`@Nested` lets you group related tests inside inner classes, mirroring the `describe` blocks from JavaScript:

```java
import org.junit.jupiter.api.Nested;

class CartServiceTest {

    private CartService cart;

    @BeforeEach
    void setUp() {
        cart = new CartService();
    }

    @Nested
    @DisplayName("addItem")
    class AddItem {

        @Test
        @DisplayName("increases the item count by one")
        void increasesItemCount() {
            cart.addItem("apple", 2, 1.50);
            assertEquals(1, cart.getItemCount());
        }

        @Test
        @DisplayName("updates the total price correctly")
        void updatesTotalPrice() {
            cart.addItem("apple", 2, 1.50);
            assertEquals(3.00, cart.getTotal(), 0.001);
        }

        @Nested
        @DisplayName("when the same item is added twice")
        class WhenSameItemAddedTwice {

            @BeforeEach
            void addAppleTwice() {
                cart.addItem("apple", 1, 1.50);
                cart.addItem("apple", 1, 1.50);
            }

            @Test
            @DisplayName("merges quantity instead of creating a duplicate entry")
            void mergesQuantity() {
                assertEquals(1, cart.getItemCount()); // still one item type
                assertEquals(2, cart.getItem("apple").getQuantity());
            }
        }
    }

    @Nested
    @DisplayName("removeItem")
    class RemoveItem {

        @Test
        @DisplayName("does nothing when item is not in cart")
        void doesNothingForMissingItem() {
            assertDoesNotThrow(() -> cart.removeItem("ghost"));
        }
    }
}
```

Nested classes can have their own `@BeforeEach` / `@AfterEach`, which compose with the outer class's lifecycle methods.

## Parameterised Tests

Parameterised tests run the same test logic with multiple inputs. This is perfect for boundary conditions and data-driven testing.

### @ValueSource — simple values

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@ParameterizedTest
@ValueSource(strings = {"", " ", "\t", "\n"})
@DisplayName("isBlank returns true for blank strings")
void isBlankForBlankStrings(String input) {
    assertTrue(StringUtils.isBlank(input));
}
```

### @CsvSource — multiple parameters per case

```java
import org.junit.jupiter.params.provider.CsvSource;

@ParameterizedTest(name = "slugify(''{0}'') == ''{1}''")
@CsvSource({
    "Hello World,  hello-world",
    "My Blog Post, my-blog-post",
    "Hello, World!, hello-world",
    "foo  bar,      foo-bar"
})
void slugifyConvertsToSlug(String input, String expected) {
    assertEquals(expected.trim(), StringUtils.slugify(input));
}
```

### @MethodSource — complex objects

```java
import org.junit.jupiter.params.provider.MethodSource;
import java.util.stream.Stream;

static Stream<Arguments> cartTotalProvider() {
    return Stream.of(
        Arguments.of(List.of(), 0.0),
        Arguments.of(List.of(new Item("a", 1, 5.0)), 5.0),
        Arguments.of(List.of(new Item("a", 2, 5.0), new Item("b", 1, 3.0)), 13.0)
    );
}

@ParameterizedTest
@MethodSource("cartTotalProvider")
void cartTotalMatchesExpected(List<Item> items, double expectedTotal) {
    Cart cart = new Cart(items);
    assertEquals(expectedTotal, cart.getTotal(), 0.001);
}
```

### @EnumSource

```java
enum Status { ACTIVE, INACTIVE, PENDING }

@ParameterizedTest
@EnumSource(value = Status.class, names = {"INACTIVE", "PENDING"})
void nonActiveStatusIsNotVisible(Status status) {
    assertFalse(userService.isVisible(new User(status)));
}
```

## Disabling Tests

```java
@Test
@Disabled("Waiting for JIRA-1234 to be fixed")
void temporarilyDisabled() {
    // This test will not run, but will show as skipped in reports
}
```

## A Realistic Example: String Utilities

Matching the JavaScript example from chapter 2, here is the same `StringUtils` in Java:

```java
// src/main/java/com/example/util/StringUtils.java
package com.example.util;

public class StringUtils {

    public static String slugify(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                   .trim()
                   .replaceAll("[^\\w\\s-]", "")
                   .replaceAll("[\\s_-]+", "-")
                   .replaceAll("^-+|-+$", "");
    }

    public static String truncate(String text, int maxLength, String ellipsis) {
        if (text == null) return "";
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - ellipsis.length()) + ellipsis;
    }
}
```

```java
// src/test/java/com/example/util/StringUtilsTest.java
package com.example.util;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import static org.junit.jupiter.api.Assertions.*;

class StringUtilsTest {

    @Nested
    @DisplayName("slugify")
    class Slugify {

        @ParameterizedTest(name = "slugify(''{0}'') == ''{1}''")
        @CsvSource({
            "Hello World,  hello-world",
            "My Blog Post, my-blog-post",
            "Hello World!, hello-world",
            "foo  bar,     foo-bar",
            "'  hello  ',  hello"
        })
        void convertsToSlug(String input, String expected) {
            assertEquals(expected.trim(), StringUtils.slugify(input));
        }

        @Test
        void returnsEmptyStringForNull() {
            assertEquals("", StringUtils.slugify(null));
        }
    }

    @Nested
    @DisplayName("truncate")
    class Truncate {

        @Test
        @DisplayName("returns original string when short enough")
        void returnsOriginalWhenShortEnough() {
            assertEquals("hello", StringUtils.truncate("hello", 10, "…"));
        }

        @Test
        @DisplayName("truncates and appends ellipsis")
        void truncatesLongString() {
            assertEquals("hello w…", StringUtils.truncate("hello world", 8, "…"));
        }

        @Test
        @DisplayName("handles exact length")
        void handlesExactLength() {
            assertEquals("hello", StringUtils.truncate("hello", 5, "…"));
        }

        @Test
        @DisplayName("returns empty string for null input")
        void returnsEmptyForNull() {
            assertEquals("", StringUtils.truncate(null, 10, "…"));
        }
    }
}
```

Run with `mvn test` or `./gradlew test`. IntelliJ IDEA and VS Code with the Java extension can also run individual tests with a green arrow in the gutter. Next, we move to mocking — replacing dependencies your code relies on.
