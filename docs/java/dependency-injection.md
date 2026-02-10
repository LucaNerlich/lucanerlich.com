---
title: "Dependency Injection Without a Framework"
sidebar_label: "Dependency Injection"
sidebar_position: 12
description: "Dependency injection in Java: constructor injection by hand, why DI matters, the Service Locator anti-pattern, and a brief intro to Spring, Guice, and OSGi."
tags: [java, dependency-injection, design-patterns, testing]
---

# Dependency Injection Without a Framework

Dependency Injection (DI) is a design principle where a class **receives** its
dependencies from the outside rather than **creating** them internally. You do not need
Spring, Guice, or any framework to apply DI -- it works with plain Java.

## The problem: hard-coded dependencies

```java
// BAD: UserService creates its own dependencies
class UserService {
    private final UserRepository repo = new PostgresUserRepository();
    private final EmailService email = new SmtpEmailService();

    User createUser(String name, String emailAddr) {
        User user = new User(name, emailAddr);
        repo.save(user);
        email.sendWelcome(user);
        return user;
    }
}
```

This is hard to test (you need a real database and SMTP server), hard to reconfigure
(switching from Postgres to MySQL requires editing the class), and violates the
Single Responsibility Principle (the class knows how to construct its dependencies).

---

## Constructor injection

The simplest and most effective form of DI:

```java
// GOOD: dependencies are injected through the constructor
class UserService {
    private final UserRepository repo;
    private final EmailService email;

    UserService(UserRepository repo, EmailService email) {
        this.repo = repo;
        this.email = email;
    }

    User createUser(String name, String emailAddr) {
        User user = new User(name, emailAddr);
        repo.save(user);
        email.sendWelcome(user);
        return user;
    }
}
```

### Why this is better

| Benefit                   | Explanation                                                        |
|---------------------------|--------------------------------------------------------------------|
| **Testability**           | Swap real implementations for test doubles                         |
| **Loose coupling**        | `UserService` depends on interfaces, not concrete classes          |
| **Explicit dependencies** | The constructor signature documents what the class needs           |
| **Immutability**          | Fields can be `final` -- set once, never changed                   |
| **Flexibility**           | Different configurations (dev, staging, prod) without code changes |

### Wiring it together

```java
// Production wiring (the "composition root")
public class Application {
    public static void main(String[] args) {
        DataSource ds = createDataSource();
        UserRepository repo = new PostgresUserRepository(ds);
        EmailService email = new SmtpEmailService("smtp.example.com", 587);
        UserService userService = new UserService(repo, email);

        userService.createUser("Alice", "alice@example.com");
    }
}

// Test wiring
class UserServiceTest {
    @Test
    void shouldCreateUser() {
        UserRepository repo = new InMemoryUserRepository();
        EmailService email = new FakeEmailService();
        UserService service = new UserService(repo, email);

        User user = service.createUser("Alice", "alice@example.com");

        assertThat(repo.findByName("Alice")).isPresent();
        assertThat(email.sentEmails()).hasSize(1);
    }
}
```

---

## Program to interfaces

DI works best when classes depend on **interfaces** (or abstract classes), not
concrete implementations:

```java
// Interface
interface UserRepository {
    void save(User user);
    Optional<User> findById(String id);
    Optional<User> findByName(String name);
    List<User> findAll();
}

// Production implementation
class PostgresUserRepository implements UserRepository {
    private final DataSource dataSource;

    PostgresUserRepository(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void save(User user) {
        // JDBC code
    }
    // ...
}

// Test implementation
class InMemoryUserRepository implements UserRepository {
    private final Map<String, User> store = new HashMap<>();

    @Override
    public void save(User user) {
        store.put(user.id(), user);
    }

    @Override
    public Optional<User> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }
    // ...
}
```

---

## Factory methods for complex wiring

When construction logic gets complex, extract it into a factory:

```java
class ServiceFactory {
    private final Config config;

    ServiceFactory(Config config) {
        this.config = config;
    }

    UserRepository createUserRepository() {
        return switch (config.dbType()) {
            case "postgres" -> new PostgresUserRepository(config.dataSource());
            case "memory"   -> new InMemoryUserRepository();
            default -> throw new IllegalArgumentException("Unknown DB: " + config.dbType());
        };
    }

    EmailService createEmailService() {
        if (config.isTestMode()) {
            return new FakeEmailService();
        }
        return new SmtpEmailService(config.smtpHost(), config.smtpPort());
    }

    UserService createUserService() {
        return new UserService(createUserRepository(), createEmailService());
    }
}
```

---

## The Service Locator anti-pattern

A **Service Locator** is a global registry where classes look up their dependencies
at runtime:

```java
// BAD: Service Locator pattern
class UserService {
    User createUser(String name, String email) {
        // Hidden dependency -- not visible in the constructor
        UserRepository repo = ServiceLocator.get(UserRepository.class);
        EmailService emailSvc = ServiceLocator.get(EmailService.class);
        // ...
    }
}
```

### Why Service Locator is problematic

| Problem                 | Explanation                                             |
|-------------------------|---------------------------------------------------------|
| **Hidden dependencies** | You cannot see what a class needs from its API          |
| **Hard to test**        | Must set up a global registry before each test          |
| **Runtime failures**    | Missing registrations fail at runtime, not compile time |
| **Tight coupling**      | Every class depends on the ServiceLocator itself        |
| **Order-dependent**     | Registration order matters; easy to get wrong           |

> **Rule**: Always prefer constructor injection. The constructor is the single source
> of truth for a class's dependencies.

---

## Method injection (rare)

Sometimes a dependency is only needed for one method, or varies per call:

```java
class ReportGenerator {
    // The formatter varies per report -- inject it into the method
    String generate(Report report, ReportFormatter formatter) {
        return formatter.format(report);
    }
}

// Usage
generator.generate(report, new PdfFormatter());
generator.generate(report, new CsvFormatter());
```

---

## Setter injection (avoid)

```java
// AVOID: allows partially constructed objects
class UserService {
    private UserRepository repo;

    void setUserRepository(UserRepository repo) {
        this.repo = repo;
    }

    User createUser(String name) {
        repo.save(new User(name)); // NullPointerException if setter not called!
        // ...
    }
}
```

> Setter injection leaves the object in an invalid state between construction and
> setter calls. Use constructor injection to guarantee all dependencies are present.

---

## DI in practice: layered architecture

```java
// Data layer
interface OrderRepository { /* ... */ }
class JdbcOrderRepository implements OrderRepository {
    JdbcOrderRepository(DataSource ds) { /* ... */ }
}

// Service layer
class OrderService {
    private final OrderRepository orderRepo;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    OrderService(OrderRepository orderRepo, PaymentService paymentService,
                 NotificationService notificationService) {
        this.orderRepo = orderRepo;
        this.paymentService = paymentService;
        this.notificationService = notificationService;
    }

    void placeOrder(Order order) {
        orderRepo.save(order);
        paymentService.charge(order.customer(), order.total());
        notificationService.sendConfirmation(order);
    }
}

// Composition root
class Application {
    public static void main(String[] args) {
        Config config = Config.load();
        DataSource ds = createDataSource(config);

        // Wire everything together
        OrderRepository orderRepo = new JdbcOrderRepository(ds);
        PaymentService payment = new StripePaymentService(config.stripeKey());
        NotificationService notification = new EmailNotificationService(config.smtpConfig());

        OrderService orderService = new OrderService(orderRepo, payment, notification);

        // Start the application (HTTP server, CLI, etc.)
        new HttpServer(orderService).start(8080);
    }
}
```

---

## When to use a framework

Manual DI (constructor injection + a composition root) works well for small-to-medium
applications. Consider a DI framework when:

| Scenario                                  | Framework                                                  |
|-------------------------------------------|------------------------------------------------------------|
| Large application with dozens of services | **Spring** (most popular, full ecosystem)                  |
| Need lightweight DI only                  | **Guice** (Google, minimal overhead)                       |
| OSGi environment (AEM, Eclipse)           | **OSGi Declarative Services** (`@Component`, `@Reference`) |
| Compile-time DI (GraalVM-friendly)        | **Dagger** (Google, generates code at compile time)        |

### Spring example (for comparison)

```java
@Service
class UserService {
    private final UserRepository repo;
    private final EmailService email;

    // Spring auto-injects via constructor
    UserService(UserRepository repo, EmailService email) {
        this.repo = repo;
        this.email = email;
    }
}
```

Spring does exactly what manual DI does -- it just automates the wiring. The constructor
still receives its dependencies, and the class is still testable without Spring.

---

## Common pitfalls

| Pitfall                                      | Problem                          | Fix                                                                          |
|----------------------------------------------|----------------------------------|------------------------------------------------------------------------------|
| `new` inside business logic                  | Tight coupling, untestable       | Inject the dependency through the constructor                                |
| Static method dependencies                   | Cannot be swapped in tests       | Wrap in an interface (e.g., `Clock` instead of `System.currentTimeMillis()`) |
| God class with 10+ constructor params        | Too many responsibilities        | Split the class; extract collaborators                                       |
| Circular dependencies (A needs B, B needs A) | Stack overflow or design smell   | Introduce a mediator, event bus, or restructure                              |
| Injecting framework classes                  | Tests require the full framework | Depend on your own interfaces; adapt framework classes behind them           |

---

## See also

- [Testing](./testing.md) -- testable code through dependency injection
- [Error Handling](./error-handling.md) -- clean error propagation in layered architectures
- [Logging](./logging.md) -- injecting loggers
