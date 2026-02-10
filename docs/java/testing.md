---
title: "Testing: JUnit 5, Mockito, and AssertJ"
sidebar_label: "Testing"
sidebar_position: 11
description: "Java testing guide: JUnit 5, Mockito mocking, AssertJ fluent assertions, parameterised tests, test patterns, and what to mock vs what not to mock."
tags: [java, testing, junit, mockito, assertj]
---

# Testing: JUnit 5, Mockito, and AssertJ

Good tests give you confidence to refactor, document behaviour, and catch regressions
early. This page covers the modern Java testing stack: **JUnit 5** for test structure,
**Mockito** for mocking dependencies, and **AssertJ** for readable assertions.

## Maven dependencies

```xml
<dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>5.11.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.14.0</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.assertj</groupId>
    <artifactId>assertj-core</artifactId>
    <version>3.26.0</version>
    <scope>test</scope>
</dependency>
```

---

## JUnit 5 basics

### Test lifecycle

```java
import org.junit.jupiter.api.*;

class UserServiceTest {

    @BeforeAll
    static void setupOnce() {
        // runs once before all tests (static)
    }

    @BeforeEach
    void setup() {
        // runs before each test
    }

    @Test
    void shouldCreateUser() {
        // test logic
    }

    @Test
    @DisplayName("User creation fails with blank name")
    void shouldFailWithBlankName() {
        // test logic
    }

    @AfterEach
    void teardown() {
        // runs after each test
    }

    @AfterAll
    static void cleanupOnce() {
        // runs once after all tests (static)
    }
}
```

### Assertions (JUnit built-in)

```java
import static org.junit.jupiter.api.Assertions.*;

@Test
void builtInAssertions() {
    assertEquals(4, 2 + 2);
    assertNotEquals("foo", "bar");
    assertTrue(list.isEmpty());
    assertFalse(list.contains("x"));
    assertNull(result);
    assertNotNull(user);
    assertThrows(IllegalArgumentException.class, () -> service.create(null));
    assertTimeout(Duration.ofSeconds(2), () -> slowOperation());

    // Grouped assertions (all run, even if some fail)
    assertAll(
        () -> assertEquals("Alice", user.name()),
        () -> assertEquals(30, user.age()),
        () -> assertNotNull(user.email())
    );
}
```

---

## @Nested tests

Group related tests for better organisation and shared setup:

```java
class OrderServiceTest {

    @Nested
    @DisplayName("When order is empty")
    class EmptyOrder {

        private Order order;

        @BeforeEach
        void setup() {
            order = new Order();
        }

        @Test
        void totalShouldBeZero() {
            assertEquals(BigDecimal.ZERO, order.total());
        }

        @Test
        void shouldHaveNoItems() {
            assertTrue(order.items().isEmpty());
        }
    }

    @Nested
    @DisplayName("When order has items")
    class OrderWithItems {

        private Order order;

        @BeforeEach
        void setup() {
            order = new Order();
            order.addItem(new Item("Book", new BigDecimal("19.99")));
            order.addItem(new Item("Pen", new BigDecimal("2.50")));
        }

        @Test
        void shouldCalculateTotal() {
            assertEquals(new BigDecimal("22.49"), order.total());
        }

        @Test
        void shouldContainTwoItems() {
            assertEquals(2, order.items().size());
        }
    }
}
```

---

## Parameterised tests

Run the same test with different inputs:

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.*;

@ParameterizedTest
@ValueSource(strings = {"hello", "world", "java"})
void shouldNotBeEmpty(String input) {
    assertFalse(input.isEmpty());
}

@ParameterizedTest
@NullAndEmptySource
@ValueSource(strings = {"  ", "\t", "\n"})
void shouldRejectBlankInput(String input) {
    assertThrows(IllegalArgumentException.class, () -> service.process(input));
}

@ParameterizedTest
@CsvSource({
    "1, 1, 2",
    "2, 3, 5",
    "10, -5, 5",
    "0, 0, 0"
})
void shouldAdd(int a, int b, int expected) {
    assertEquals(expected, calculator.add(a, b));
}

@ParameterizedTest
@MethodSource("provideUsers")
void shouldValidateUser(User user, boolean expectedValid) {
    assertEquals(expectedValid, validator.isValid(user));
}

static Stream<Arguments> provideUsers() {
    return Stream.of(
        Arguments.of(new User("Alice", "alice@example.com"), true),
        Arguments.of(new User("", "alice@example.com"), false),
        Arguments.of(new User("Bob", ""), false),
        Arguments.of(new User(null, null), false)
    );
}

@ParameterizedTest
@EnumSource(value = DayOfWeek.class, names = {"SATURDAY", "SUNDAY"})
void shouldBeWeekend(DayOfWeek day) {
    assertTrue(calendar.isWeekend(day));
}
```

---

## AssertJ fluent assertions

AssertJ provides a fluent, IDE-friendly assertion API that is far more readable than
JUnit's built-in assertions:

```java
import static org.assertj.core.api.Assertions.*;

@Test
void assertJExamples() {
    // Strings
    assertThat(name).isEqualTo("Alice");
    assertThat(name).startsWith("Al").endsWith("ce").hasSize(5);
    assertThat(name).isNotBlank().doesNotContain("Bob");

    // Numbers
    assertThat(age).isGreaterThan(18).isLessThanOrEqualTo(100);
    assertThat(price).isCloseTo(19.99, within(0.01));

    // Collections
    assertThat(names)
        .hasSize(3)
        .contains("Alice", "Bob")
        .doesNotContain("Eve")
        .containsExactly("Alice", "Bob", "Charlie");

    assertThat(users)
        .extracting(User::name)
        .containsExactlyInAnyOrder("Alice", "Bob", "Charlie");

    assertThat(users)
        .filteredOn(u -> u.age() > 25)
        .extracting(User::name)
        .containsOnly("Alice", "Charlie");

    // Maps
    assertThat(map)
        .containsKey("name")
        .containsEntry("name", "Alice")
        .hasSize(3);

    // Exceptions
    assertThatThrownBy(() -> service.process(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("must not be null");

    assertThatCode(() -> service.process("valid"))
        .doesNotThrowAnyException();

    // Optional
    assertThat(optional).isPresent().contains("Alice");
    assertThat(emptyOptional).isEmpty();
}
```

---

## Mockito

### Basic mocking

```java
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    UserRepository userRepository;

    @Mock
    EmailService emailService;

    @InjectMocks
    UserService userService;  // injects mocks into constructor/fields

    @Test
    void shouldFindUser() {
        // Arrange
        User alice = new User("1", "Alice", "alice@example.com");
        when(userRepository.findById("1")).thenReturn(Optional.of(alice));

        // Act
        User result = userService.findUser("1");

        // Assert
        assertThat(result.name()).isEqualTo("Alice");
        verify(userRepository).findById("1");
    }
}
```

### Stubbing patterns

```java
// Return value
when(repo.findById("1")).thenReturn(Optional.of(user));

// Return different values on consecutive calls
when(repo.findAll()).thenReturn(List.of(user1)).thenReturn(List.of(user1, user2));

// Throw exception
when(repo.findById("bad")).thenThrow(new RuntimeException("DB down"));

// Answer (dynamic return based on input)
when(repo.save(any())).thenAnswer(invocation -> {
    User saved = invocation.getArgument(0);
    return new User(UUID.randomUUID().toString(), saved.name(), saved.email());
});

// Void methods
doNothing().when(emailService).send(any());
doThrow(new RuntimeException("SMTP error")).when(emailService).send(any());
```

### Verification

```java
// Was called exactly once (default)
verify(repo).findById("1");

// Call count
verify(repo, times(2)).findById(any());
verify(repo, never()).delete(any());
verify(repo, atLeastOnce()).findAll();
verify(repo, atMost(3)).save(any());

// Argument verification
verify(emailService).send(argThat(email ->
    email.to().equals("alice@example.com") && email.subject().contains("Welcome")
));

// No more interactions
verifyNoMoreInteractions(repo);
verifyNoInteractions(emailService);
```

### Argument captors

Capture arguments for detailed assertion:

```java
@Captor
ArgumentCaptor<Email> emailCaptor;

@Test
void shouldSendWelcomeEmail() {
    userService.createUser(new CreateUserRequest("Alice", "alice@example.com"));

    verify(emailService).send(emailCaptor.capture());
    Email sentEmail = emailCaptor.getValue();

    assertThat(sentEmail.to()).isEqualTo("alice@example.com");
    assertThat(sentEmail.subject()).isEqualTo("Welcome, Alice!");
    assertThat(sentEmail.body()).contains("Thank you for signing up");
}
```

### Spies

A spy wraps a real object -- calls go to the real implementation unless stubbed:

```java
@Spy
List<String> spyList = new ArrayList<>();

@Test
void spyExample() {
    spyList.add("one");
    spyList.add("two");

    verify(spyList, times(2)).add(any());
    assertThat(spyList).hasSize(2); // real list behaviour

    // Override specific method
    doReturn(100).when(spyList).size();
    assertThat(spyList.size()).isEqualTo(100);
}
```

---

## Test patterns

### Arrange-Act-Assert (AAA)

```java
@Test
void shouldApplyDiscount() {
    // Arrange
    Order order = new Order(List.of(
        new Item("Book", new BigDecimal("20.00")),
        new Item("Pen", new BigDecimal("5.00"))
    ));
    DiscountService discountService = new DiscountService();

    // Act
    BigDecimal total = discountService.applyDiscount(order, 0.10);

    // Assert
    assertThat(total).isEqualByComparingTo(new BigDecimal("22.50"));
}
```

### Test fixtures with @BeforeEach

```java
class OrderServiceTest {
    private OrderService orderService;
    private Order sampleOrder;

    @BeforeEach
    void setup() {
        orderService = new OrderService();
        sampleOrder = new Order(List.of(
            new Item("Book", new BigDecimal("20.00"))
        ));
    }

    @Test
    void shouldCalculateTotal() { /* ... */ }

    @Test
    void shouldApplyTax() { /* ... */ }
}
```

### Builder pattern for test data

```java
class TestUsers {
    static User.Builder aUser() {
        return User.builder()
            .id(UUID.randomUUID().toString())
            .name("Test User")
            .email("test@example.com")
            .age(25);
    }

    static User alice() {
        return aUser().name("Alice").email("alice@example.com").build();
    }

    static User bob() {
        return aUser().name("Bob").email("bob@example.com").age(30).build();
    }
}

// In tests
User user = TestUsers.aUser().name("Custom").build();
```

---

## What to mock vs what not to mock

| Mock                                     | Don't mock                               |
|------------------------------------------|------------------------------------------|
| External services (HTTP, email, payment) | Value objects and DTOs                   |
| Database repositories                    | Pure functions (no side effects)         |
| Third-party APIs                         | Simple data structures                   |
| Time/clock (`Clock`)                     | The class under test itself              |
| File system operations                   | Static utility methods (test indirectly) |
| Message queues                           | Immutable objects (records)              |

> If you find yourself mocking everything, your design might have too many
> dependencies. Consider simplifying or restructuring.

---

## Testing exceptions

```java
// JUnit 5
@Test
void shouldThrowOnInvalidInput() {
    IllegalArgumentException ex = assertThrows(
        IllegalArgumentException.class,
        () -> service.process(null)
    );
    assertEquals("Input must not be null", ex.getMessage());
}

// AssertJ (more fluent)
@Test
void shouldThrowOnInvalidInput() {
    assertThatThrownBy(() -> service.process(null))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Input must not be null")
        .hasNoCause();
}
```

---

## Temporary files and directories

```java
import org.junit.jupiter.api.io.TempDir;

@Test
void shouldWriteToFile(@TempDir Path tempDir) throws IOException {
    Path file = tempDir.resolve("output.txt");
    Files.writeString(file, "hello");

    assertThat(Files.readString(file)).isEqualTo("hello");
}
// tempDir and its contents are deleted automatically after the test
```

---

## Common pitfalls

| Pitfall                                               | Problem                                | Fix                                                                       |
|-------------------------------------------------------|----------------------------------------|---------------------------------------------------------------------------|
| Testing implementation, not behaviour                 | Tests break on every refactor          | Test public API outcomes, not internal method calls                       |
| Too many mocks                                        | Tests are fragile and hard to read     | Favour integration tests for complex flows; mock only external boundaries |
| Not verifying interactions                            | Mock is set up but never checked       | Use `verify()` to confirm expected calls                                  |
| Shared mutable state between tests                    | Tests pass individually, fail together | Use `@BeforeEach` for fresh state per test                                |
| Ignoring test names                                   | Hard to understand failures            | Use `@DisplayName` and descriptive method names                           |
| Mocking final classes/methods                         | Mockito throws errors                  | Add `mockito-inline` or use interfaces                                    |
| `@Mock` without `@ExtendWith(MockitoExtension.class)` | Mocks are null                         | Always add the extension                                                  |

---

## See also

- [Error Handling](./error-handling.md) -- testing exception scenarios
- [Dependency Injection](./dependency-injection.md) -- testable code through DI
- [HTTP Clients](./http-clients.md) -- mocking HTTP calls in tests
- [JSON Processing](./json-processing.md) -- testing serialisation/deserialisation
