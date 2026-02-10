---
title: "Classes & Objects"
sidebar_label: "Classes & Objects"
description: Learn Java OOP basics -- classes, objects, constructors, access modifiers, encapsulation, toString, equals/hashCode, static members, and records.
slug: /java/beginners-guide/classes-and-objects
tags: [java, beginners, oop, classes]
keywords:
  - java classes
  - java objects
  - constructors
  - encapsulation
  - java records
sidebar_position: 5
---

# Classes & Objects

Java is an **object-oriented** language. Almost everything revolves around classes and objects. A class is a blueprint;
an object is an instance of that blueprint.

## Your first class

```java
public class Dog {
    // Fields (instance variables)
    String name;
    int age;

    // Method
    String bark() {
        return name + " says: Woof!";
    }
}
```

Creating and using objects:

```java
public class Main {
    public static void main(String[] args) {
        Dog dog1 = new Dog();
        dog1.name = "Rex";
        dog1.age = 3;

        Dog dog2 = new Dog();
        dog2.name = "Bella";
        dog2.age = 5;

        System.out.println(dog1.bark());
        System.out.println(dog2.bark());
        System.out.println(dog1.age);
    }
}
```

Result:

```text
Rex says: Woof!
Bella says: Woof!
3
```

- `new Dog()` creates an object (instance) of the `Dog` class
- Each object has its own copy of the fields (`name`, `age`)
- Methods operate on the object's data

## Constructors

A constructor initializes an object when it is created. It has the same name as the class and no return type:

```java
public class User {
    String name;
    int age;

    // Constructor
    User(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
```

```java
User user = new User("Ada", 36);
System.out.println(user.name + " is " + user.age);
```

Result:

```text
Ada is 36
```

### `this`

Inside a method or constructor, `this` refers to the current object. It is commonly used when parameter names match
field names:

```java
User(String name, int age) {
    this.name = name;   // this.name = field, name = parameter
    this.age = age;
}
```

### Default constructor

If you define **no** constructors, Java provides a default no-argument constructor. If you define **any** constructor,
the default is no longer generated:

```java
public class Product {
    String name;
    double price;

    Product(String name, double price) {
        this.name = name;
        this.price = price;
    }
}

// Product p = new Product(); // compile error -- no no-arg constructor
Product p = new Product("Laptop", 999.99); // works
```

### Multiple constructors

```java
public class User {
    String name;
    int age;
    String role;

    User(String name, int age, String role) {
        this.name = name;
        this.age = age;
        this.role = role;
    }

    User(String name, int age) {
        this(name, age, "user"); // calls the other constructor
    }

    User(String name) {
        this(name, 0, "user");
    }
}
```

```java
User u1 = new User("Ada", 36, "admin");
User u2 = new User("Bob", 25);
User u3 = new User("Charlie");

System.out.println(u1.name + " -- " + u1.role);
System.out.println(u2.name + " -- " + u2.role);
System.out.println(u3.name + " -- " + u3.age);
```

Result:

```text
Ada -- admin
Bob -- user
Charlie -- 0
```

`this(...)` calls another constructor in the same class. It must be the **first** statement.

## Access modifiers

Control who can see and use your fields, methods, and classes:

| Modifier                  | Class | Package | Subclass | World |
|---------------------------|-------|---------|----------|-------|
| `public`                  | Yes   | Yes     | Yes      | Yes   |
| `protected`               | Yes   | Yes     | Yes      | No    |
| (none -- package-private) | Yes   | Yes     | No       | No    |
| `private`                 | Yes   | No      | No       | No    |

```java
public class BankAccount {
    private double balance;        // only this class
    String accountHolder;          // package-private
    protected String accountType;  // this class + subclasses + same package
    public String bankName;        // everyone
}
```

## Encapsulation

**Encapsulation** means hiding internal data and exposing it through methods. The pattern: `private` fields + `public`
getters/setters.

```java
public class BankAccount {
    private String owner;
    private double balance;

    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
    }

    // Getter
    public double getBalance() {
        return balance;
    }

    public String getOwner() {
        return owner;
    }

    // Business logic instead of a raw setter
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit must be positive");
        }
        balance += amount;
    }

    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal must be positive");
        }
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        balance -= amount;
    }
}
```

```java
BankAccount account = new BankAccount("Ada", 1000);
System.out.println(account.getOwner());
System.out.println(account.getBalance());

account.deposit(500);
System.out.println(account.getBalance());

account.withdraw(200);
System.out.println(account.getBalance());

// account.balance = 999999; // compile error -- balance is private
```

Result:

```text
Ada
1000.0
1500.0
1300.0
```

Why encapsulation matters:

- You control **how** data is modified (validation in `deposit`/`withdraw`)
- You can change internal representation without breaking callers
- The class enforces its own invariants (balance cannot go negative)

## `toString`

By default, printing an object shows its class name and hash code. Override `toString` for a useful representation:

```java
public class User {
    private String name;
    private int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', age=" + age + "}";
    }
}
```

```java
User user = new User("Ada", 36);
System.out.println(user);
```

Result:

```text
User{name='Ada', age=36}
```

The `@Override` annotation tells the compiler you intend to override a method from a parent class. If you misspell the
method name, the compiler will flag it.

## `equals` and `hashCode`

By default, `==` and `.equals()` compare object **references** (whether they are the same object in memory). Override
both to compare by **content**:

```java
import java.util.Objects;

public class User {
    private String name;
    private int age;

    public User(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return age == user.age && Objects.equals(name, user.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', age=" + age + "}";
    }
}
```

```java
User a = new User("Ada", 36);
User b = new User("Ada", 36);
User c = new User("Bob", 25);

System.out.println(a == b);       // false -- different objects
System.out.println(a.equals(b));  // true -- same content
System.out.println(a.equals(c));  // false -- different content
```

Result:

```text
false
true
false
```

**Rule:** if you override `equals`, you **must** also override `hashCode`. Collections like `HashMap` and `HashSet`
depend on this contract.

## `static` fields and methods

`static` members belong to the **class**, not to any instance:

```java
public class Counter {
    private static int count = 0; // shared across all instances

    private String label;

    public Counter(String label) {
        this.label = label;
        count++;
    }

    public static int getCount() {
        return count;
    }

    public String getLabel() {
        return label;
    }
}
```

```java
Counter a = new Counter("A");
Counter b = new Counter("B");
Counter c = new Counter("C");

System.out.println("Total counters: " + Counter.getCount());
System.out.println(a.getLabel());
```

Result:

```text
Total counters: 3
A
```

Common uses of `static`:

- **Constants:** `static final double PI = 3.14159;`
- **Utility methods:** `Math.abs()`, `Integer.parseInt()`
- **Factory methods:** creating instances with descriptive names

### Static vs instance

|                             | Static               | Instance          |
|-----------------------------|----------------------|-------------------|
| Belongs to                  | The class            | An object         |
| Accessed via                | `ClassName.method()` | `object.method()` |
| Can access instance fields? | No                   | Yes               |
| Can access static fields?   | Yes                  | Yes               |

## Records (Java 16+)

Records are a concise way to create immutable data classes. They auto-generate the constructor, getters, `toString`,
`equals`, and `hashCode`:

```java
public record Point(int x, int y) {}
```

This single line generates the equivalent of:

- A constructor `Point(int x, int y)`
- Accessor methods `x()` and `y()` (not `getX()`)
- `toString()`: `Point[x=3, y=4]`
- `equals()` and `hashCode()` based on all fields

```java
Point p1 = new Point(3, 4);
Point p2 = new Point(3, 4);
Point p3 = new Point(0, 0);

System.out.println(p1);
System.out.println(p1.x());
System.out.println(p1.y());
System.out.println(p1.equals(p2));
System.out.println(p1.equals(p3));
```

Result:

```text
Point[x=3, y=4]
3
4
true
false
```

### Records with validation

```java
public record User(String name, int age) {
    // Compact constructor for validation
    public User {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Name cannot be blank");
        }
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative");
        }
    }
}
```

```java
User valid = new User("Ada", 36);
System.out.println(valid);

try {
    User invalid = new User("", 25);
} catch (IllegalArgumentException e) {
    System.out.println("Error: " + e.getMessage());
}
```

Result:

```text
User[name=Ada, age=36]
Error: Name cannot be blank
```

### Records with methods

Records can have methods, static fields, and implement interfaces:

```java
public record Rectangle(double width, double height) {

    public double area() {
        return width * height;
    }

    public double perimeter() {
        return 2 * (width + height);
    }
}
```

```java
Rectangle r = new Rectangle(5, 3);
System.out.println("Area: " + r.area());
System.out.println("Perimeter: " + r.perimeter());
```

Result:

```text
Area: 15.0
Perimeter: 16.0
```

**When to use records:** whenever you need a simple data carrier -- DTOs, value objects, configuration, return multiple
values from a method.

## Builder pattern (brief introduction)

For classes with many optional fields, a builder is cleaner than many constructors:

```java
public class HttpRequest {
    private final String url;
    private final String method;
    private final String body;
    private final int timeout;

    private HttpRequest(Builder builder) {
        this.url = builder.url;
        this.method = builder.method;
        this.body = builder.body;
        this.timeout = builder.timeout;
    }

    @Override
    public String toString() {
        return method + " " + url + " (timeout=" + timeout + "ms)";
    }

    static class Builder {
        private final String url;
        private String method = "GET";
        private String body = "";
        private int timeout = 5000;

        Builder(String url) {
            this.url = url;
        }

        Builder method(String method) {
            this.method = method;
            return this;
        }

        Builder body(String body) {
            this.body = body;
            return this;
        }

        Builder timeout(int timeout) {
            this.timeout = timeout;
            return this;
        }

        HttpRequest build() {
            return new HttpRequest(this);
        }
    }
}
```

```java
HttpRequest request = new HttpRequest.Builder("https://api.example.com/users")
        .method("POST")
        .body("{\"name\": \"Ada\"}")
        .timeout(3000)
        .build();

System.out.println(request);
```

Result:

```text
POST https://api.example.com/users (timeout=3000ms)
```

## Organizing files

Java convention:

- One public class per file
- Filename matches the class name: `User.java` → `public class User`
- Package structure matches directory structure
- Classes in lowercase package names: `com.example.app`

```text
src/
├── Main.java
├── model/
│   └── User.java
└── util/
    └── StringUtils.java
```

## Summary

- A **class** is a blueprint; an **object** is an instance created with `new`.
- **Constructors** initialize objects. `this(...)` chains to another constructor.
- **Access modifiers** control visibility: `private` → package-private → `protected` → `public`.
- **Encapsulation**: private fields + public methods. Control access, enforce invariants.
- Override **`toString`** for readable output, **`equals`/`hashCode`** for content comparison.
- **`static`** members belong to the class, not instances -- used for shared state and utility methods.
- **Records** (Java 16+) auto-generate constructors, accessors, `toString`, `equals`, `hashCode`.
- The **builder pattern** handles objects with many optional parameters.

Next up: [Inheritance & Interfaces](./06-inheritance-and-interfaces.md) -- extending classes, implementing contracts,
and polymorphism.
