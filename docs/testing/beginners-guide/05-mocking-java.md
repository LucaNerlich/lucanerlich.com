---
title: "Mocking in Java with Mockito"
sidebar_label: "Mocking (Java)"
description: Mockito setup, @Mock and @InjectMocks, when().thenReturn(), verify(), ArgumentCaptor, mocking exceptions, and spy objects.
slug: /testing/beginners-guide/mocking-java
tags: [testing, beginners, java, mockito, mocking]
keywords:
  - mockito setup
  - @Mock @InjectMocks
  - when thenReturn
  - verify mockito
  - ArgumentCaptor
  - mockito spy
sidebar_position: 5
---

# Mocking in Java with Mockito

Mockito is the standard mocking library for Java. It integrates seamlessly with JUnit 5 and lets you replace real dependencies with controlled fakes. When your service class depends on a repository that talks to a database, Mockito lets you define exactly what that repository returns for each test — without starting a database.

## Adding Mockito

### Maven

```xml
<dependency>
    <groupId>org.mockito</groupId>
    <artifactId>mockito-junit-jupiter</artifactId>
    <version>5.12.0</version>
    <scope>test</scope>
</dependency>
```

`mockito-junit-jupiter` includes the core Mockito library plus the JUnit 5 extension that processes `@Mock`, `@Spy`, and `@InjectMocks` annotations automatically.

### Gradle

```kotlin
testImplementation("org.mockito:mockito-junit-jupiter:5.12.0")
```

### Enable the Extension

Add `@ExtendWith(MockitoExtension.class)` to your test class:

```java
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    // @Mock and @InjectMocks work here
}
```

## Creating Mocks

### @Mock Annotation

`@Mock` creates a mock of the annotated type. All methods return defaults (`null`, `0`, `false`, or empty collections) unless you configure them.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Test
    void findByIdReturnsUser() {
        // Will be covered with when() below
    }
}
```

### Programmatic Mock Creation

You can also create mocks programmatically when you do not use the extension:

```java
UserRepository userRepository = Mockito.mock(UserRepository.class);
```

## @InjectMocks — Injecting Mocks into the Class Under Test

`@InjectMocks` creates an instance of the class under test and injects all available `@Mock` fields into it. Mockito tries constructor injection first, then setter injection, then field injection.

```java
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;   // constructed with the mocks above

    @Test
    void registersUserAndSendsWelcomeEmail() throws Exception {
        // userService has real logic; its dependencies are mocks
    }
}
```

This is equivalent to:

```java
UserService userService = new UserService(userRepository, emailService);
```

Prefer constructor injection in your production classes — it makes `@InjectMocks` work reliably and the dependencies explicit.

## Stubbing with when().thenReturn()

Stubbing defines what a mock method returns when called with specific arguments.

```java
import static org.mockito.Mockito.*;

@Test
void findByIdReturnsUser() {
    User alice = new User(1L, "Alice", "alice@example.com");
    when(userRepository.findById(1L)).thenReturn(Optional.of(alice));

    Optional<User> result = userService.findById(1L);

    assertThat(result).isPresent();
    assertThat(result.get().getName()).isEqualTo("Alice");
}

@Test
void findByIdReturnsEmptyWhenNotFound() {
    when(userRepository.findById(99L)).thenReturn(Optional.empty());

    Optional<User> result = userService.findById(99L);

    assertThat(result).isEmpty();
}
```

### Argument Matchers

When you do not care about the exact argument value, use matchers from `org.mockito.ArgumentMatchers`:

```java
import static org.mockito.ArgumentMatchers.*;

// Match any Long
when(userRepository.findById(anyLong())).thenReturn(Optional.of(alice));

// Match any non-null string
when(emailService.send(anyString(), anyString())).thenReturn(true);

// Match a specific type
when(userRepository.save(any(User.class))).thenReturn(alice);

// Mixing: you must use matchers for ALL arguments or none
when(repo.findByNameAndStatus(eq("Alice"), anyString()))
    .thenReturn(List.of(alice));
```

### Returning Different Values for Consecutive Calls

```java
when(userRepository.findById(1L))
    .thenReturn(Optional.of(alice))    // first call
    .thenReturn(Optional.empty())       // second call
    .thenThrow(new RuntimeException("DB error"));  // third call
```

### thenAnswer() — Dynamic Return Values

Use `thenAnswer` when the return value depends on the argument:

```java
when(userRepository.findById(anyLong())).thenAnswer(invocation -> {
    Long id = invocation.getArgument(0);
    if (id < 0) throw new IllegalArgumentException("Invalid ID");
    return Optional.of(new User(id, "User " + id, "user" + id + "@example.com"));
});
```

## Verifying Interactions

`verify()` asserts that a mock method was called, optionally specifying how many times and with what arguments.

```java
@Test
void registrationSendsWelcomeEmail() throws Exception {
    User newUser = new User(null, "Bob", "bob@example.com");
    when(userRepository.save(any(User.class)))
        .thenReturn(new User(2L, "Bob", "bob@example.com"));

    userService.register(newUser);

    // Verify the email was sent exactly once
    verify(emailService, times(1)).send("bob@example.com", "Welcome!");

    // Verify the user was saved
    verify(userRepository).save(newUser);  // times(1) is the default
}

@Test
void noEmailSentWhenRegistrationFails() {
    when(userRepository.save(any())).thenThrow(new RuntimeException("DB down"));

    assertThrows(RuntimeException.class, () -> userService.register(new User()));

    // Verify emailService was never touched
    verifyNoInteractions(emailService);
}
```

### Verification Modes

```java
verify(mock, times(3)).someMethod();
verify(mock, never()).someMethod();
verify(mock, atLeast(1)).someMethod();
verify(mock, atMost(2)).someMethod();
verify(mock, atLeastOnce()).someMethod();
```

### verifyNoMoreInteractions

After verifying the calls you care about, assert nothing unexpected happened:

```java
verify(userRepository).save(any());
verify(emailService).send(anyString(), anyString());
verifyNoMoreInteractions(userRepository, emailService);
```

## ArgumentCaptor — Capturing Arguments for Inspection

When the argument passed to a mock is complex and you want to inspect its fields, use `ArgumentCaptor`:

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private OrderService orderService;

    @Captor
    private ArgumentCaptor<Order> orderCaptor;

    @Test
    void createsOrderWithCorrectTotalPrice() {
        List<LineItem> items = List.of(
            new LineItem("apple", 2, 1.50),
            new LineItem("bread", 1, 2.00)
        );

        orderService.placeOrder("customer-1", items);

        verify(orderRepository).save(orderCaptor.capture());

        Order savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getCustomerId()).isEqualTo("customer-1");
        assertThat(savedOrder.getTotal()).isEqualByComparingTo("5.00");
        assertThat(savedOrder.getItems()).hasSize(2);
    }
}
```

`@Captor` is a shorthand annotation equivalent to `ArgumentCaptor.forClass(Order.class)`.

## Mocking Exceptions

Use `thenThrow()` to simulate error scenarios:

```java
@Test
void throwsServiceExceptionWhenDbIsDown() {
    when(userRepository.findById(any()))
        .thenThrow(new DataAccessException("Connection refused"));

    assertThatThrownBy(() -> userService.findById(1L))
        .isInstanceOf(UserServiceException.class)
        .hasMessageContaining("Unable to retrieve user");
}

@Test
void sendsEmailOnce_evenWhenFirstAttemptFails() {
    // First call throws, second call succeeds
    when(emailService.send(anyString(), anyString()))
        .thenThrow(new EmailException("SMTP timeout"))
        .thenReturn(true);

    userService.registerWithRetry(new User(null, "Carol", "carol@example.com"));

    verify(emailService, times(2)).send(anyString(), anyString());
}
```

For void methods, use `doThrow()`:

```java
// void methods cannot use when()...thenThrow()
doThrow(new AuditException("Audit failed"))
    .when(auditService).log(any());

assertThrows(AuditException.class, () -> userService.deleteUser(1L));
```

## Spy Objects

A **spy** wraps a real object, delegating all method calls to the original implementation by default, while allowing you to stub or verify individual methods.

```java
@ExtendWith(MockitoExtension.class)
class CachingServiceTest {

    @Spy
    private List<String> spyList = new ArrayList<>();

    @Test
    void addElementAndVerify() {
        spyList.add("one");
        spyList.add("two");

        verify(spyList, times(2)).add(anyString());
        assertThat(spyList).hasSize(2);  // real add() was called
    }

    @Test
    void stubSizeWhileKeepingRealAdd() {
        spyList.add("real element");

        // Override one method; others stay real
        doReturn(100).when(spyList).size();

        assertThat(spyList.size()).isEqualTo(100);   // stubbed
        assertThat(spyList.get(0)).isEqualTo("real element");  // real
    }
}
```

Spies are useful when you want to test a real class but stub a specific expensive method (like a network call). Use mocks by default and reach for spies only when testing code that cannot be refactored for dependency injection.

## BDD-Style Stubbing with BDDMockito

Mockito ships a `BDDMockito` class that aligns its API with Given/When/Then:

```java
import static org.mockito.BDDMockito.*;

@Test
void givenUserExists_whenFindById_thenReturnsUser() {
    // Given
    given(userRepository.findById(1L)).willReturn(Optional.of(alice));

    // When
    Optional<User> result = userService.findById(1L);

    // Then
    then(userRepository).should().findById(1L);
    assertThat(result).contains(alice);
}
```

## A Complete Example: UserService

```java
// src/main/java/com/example/user/UserService.java
package com.example.user;

public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public User register(String name, String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email already registered: " + email);
        }
        User saved = userRepository.save(new User(null, name, email));
        emailService.sendWelcome(saved.getEmail(), saved.getName());
        return saved;
    }

    public User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("User not found: " + id));
    }
}
```

```java
// src/test/java/com/example/user/UserServiceTest.java
package com.example.user;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private UserService userService;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Nested
    @DisplayName("register")
    class Register {

        @Test
        @DisplayName("saves the user and sends welcome email")
        void savesUserAndSendsEmail() {
            when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
            when(userRepository.save(any(User.class)))
                .thenReturn(new User(1L, "Alice", "alice@example.com"));

            userService.register("Alice", "alice@example.com");

            verify(userRepository).save(userCaptor.capture());
            assertThat(userCaptor.getValue().getName()).isEqualTo("Alice");

            verify(emailService).sendWelcome("alice@example.com", "Alice");
        }

        @Test
        @DisplayName("throws DuplicateEmailException when email already registered")
        void throwsWhenEmailAlreadyExists() {
            when(userRepository.existsByEmail("alice@example.com")).thenReturn(true);

            assertThatThrownBy(() -> userService.register("Alice", "alice@example.com"))
                .isInstanceOf(DuplicateEmailException.class)
                .hasMessageContaining("alice@example.com");

            verifyNoInteractions(emailService);
        }
    }

    @Nested
    @DisplayName("findById")
    class FindById {

        @Test
        @DisplayName("returns the user when found")
        void returnsUserWhenFound() {
            User alice = new User(1L, "Alice", "alice@example.com");
            when(userRepository.findById(1L)).thenReturn(Optional.of(alice));

            User result = userService.findById(1L);

            assertThat(result.getName()).isEqualTo("Alice");
        }

        @Test
        @DisplayName("throws UserNotFoundException when user does not exist")
        void throwsWhenNotFound() {
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.findById(99L))
                .isInstanceOf(UserNotFoundException.class)
                .hasMessageContaining("99");
        }
    }
}
```

This pattern — `@Mock` for dependencies, `@InjectMocks` for the class under test, `when()` for stubbing, `verify()` for interaction checks — covers the vast majority of Java unit testing scenarios. Chapter 6 moves on to integration tests where some of these mocks are replaced with real infrastructure.
