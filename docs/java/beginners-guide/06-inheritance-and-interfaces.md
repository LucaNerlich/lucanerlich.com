---
title: "Inheritance & Interfaces"
sidebar_label: "Inheritance & Interfaces"
description: Learn Java inheritance, method overriding, abstract classes, interfaces, polymorphism, sealed classes, and composition vs inheritance.
slug: /java/beginners-guide/inheritance-and-interfaces
tags: [java, beginners, oop, inheritance, interfaces]
keywords:
  - java inheritance
  - java interfaces
  - polymorphism
  - abstract class
  - sealed classes
sidebar_position: 6
---

# Inheritance & Interfaces

Inheritance lets you build new classes on top of existing ones. Interfaces define contracts that classes must fulfill. Together, they enable **polymorphism** -- treating different types through a common interface.

## Inheritance with `extends`

A child class (subclass) inherits fields and methods from a parent class (superclass):

```java
class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    String speak() {
        return name + " makes a sound";
    }
}

class Dog extends Animal {
    String breed;

    Dog(String name, String breed) {
        super(name); // call the parent constructor
        this.breed = breed;
    }
}

class Cat extends Animal {
    Cat(String name) {
        super(name);
    }
}
```

```java
Dog dog = new Dog("Rex", "Labrador");
Cat cat = new Cat("Whiskers");

System.out.println(dog.speak());   // inherited from Animal
System.out.println(dog.name);      // inherited field
System.out.println(dog.breed);     // Dog's own field
System.out.println(cat.speak());
```

Result:
```text
Rex makes a sound
Rex
Labrador
Whiskers makes a sound
```

### `super`

`super` refers to the parent class:
- `super(...)` calls the parent constructor (must be the first statement in the child constructor)
- `super.method()` calls the parent's version of an overridden method

## Method overriding

A subclass can replace a parent method with its own implementation:

```java
class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    String speak() {
        return name + " makes a sound";
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name);
    }

    @Override
    String speak() {
        return name + " says: Woof!";
    }
}

class Cat extends Animal {
    Cat(String name) {
        super(name);
    }

    @Override
    String speak() {
        return name + " says: Meow!";
    }
}
```

```java
Animal dog = new Dog("Rex");
Animal cat = new Cat("Whiskers");
Animal animal = new Animal("Unknown");

System.out.println(dog.speak());
System.out.println(cat.speak());
System.out.println(animal.speak());
```

Result:
```text
Rex says: Woof!
Whiskers says: Meow!
Unknown makes a sound
```

**Always use `@Override`** -- the compiler will catch mistakes like misspelling the method name.

## Polymorphism

The `dog` and `cat` variables above are declared as `Animal`, but they call their own overridden `speak()` methods. This is **polymorphism** -- the same method call behaves differently depending on the actual object type.

```java
Animal[] animals = {
    new Dog("Rex"),
    new Cat("Whiskers"),
    new Dog("Bella"),
    new Cat("Luna"),
};

for (Animal animal : animals) {
    System.out.println(animal.speak());
}
```

Result:
```text
Rex says: Woof!
Whiskers says: Meow!
Bella says: Woof!
Luna says: Meow!
```

The loop does not know or care whether each element is a `Dog` or `Cat`. It just calls `speak()`, and the right version runs. This is the core power of OOP.

## Abstract classes

An `abstract` class cannot be instantiated. It is designed to be extended:

```java
abstract class Shape {
    String color;

    Shape(String color) {
        this.color = color;
    }

    // Abstract method -- subclasses MUST implement this
    abstract double area();

    // Concrete method -- subclasses inherit this
    String describe() {
        return color + " shape with area " + String.format("%.2f", area());
    }
}

class Circle extends Shape {
    double radius;

    Circle(String color, double radius) {
        super(color);
        this.radius = radius;
    }

    @Override
    double area() {
        return Math.PI * radius * radius;
    }
}

class Rectangle extends Shape {
    double width, height;

    Rectangle(String color, double width, double height) {
        super(color);
        this.width = width;
        this.height = height;
    }

    @Override
    double area() {
        return width * height;
    }
}
```

```java
// Shape s = new Shape("red"); // compile error -- cannot instantiate abstract class

Circle circle = new Circle("red", 5);
Rectangle rect = new Rectangle("blue", 4, 6);

System.out.println(circle.describe());
System.out.println(rect.describe());
```

Result:
```text
red shape with area 78.54
blue shape with area 24.00
```

Use abstract classes when you want to share code (fields, methods) between related classes while forcing subclasses to implement specific behavior.

## Interfaces

An interface defines a **contract** -- a set of methods that implementing classes must provide:

```java
interface Printable {
    String format();  // abstract by default
}

interface Exportable {
    byte[] export();
}

class Report implements Printable, Exportable {
    private String title;
    private String content;

    Report(String title, String content) {
        this.title = title;
        this.content = content;
    }

    @Override
    public String format() {
        return "=== " + title + " ===\n" + content;
    }

    @Override
    public byte[] export() {
        return format().getBytes();
    }
}
```

```java
Report report = new Report("Q1 Sales", "Revenue: $1.2M");
System.out.println(report.format());
System.out.println("Export size: " + report.export().length + " bytes");
```

Result:
```text
=== Q1 Sales ===
Revenue: $1.2M
Export size: 30 bytes
```

Key differences from abstract classes:
- A class can implement **multiple** interfaces but extend only **one** class
- Interfaces cannot have instance fields (only `static final` constants)
- All methods are `public` by default

### Default methods

Interfaces can provide default implementations (Java 8+):

```java
interface Logger {
    void log(String message);

    default void info(String message) {
        log("[INFO] " + message);
    }

    default void error(String message) {
        log("[ERROR] " + message);
    }
}

class ConsoleLogger implements Logger {
    @Override
    public void log(String message) {
        System.out.println(message);
    }
}
```

```java
Logger logger = new ConsoleLogger();
logger.info("Server started");
logger.error("Connection failed");
```

Result:
```text
[INFO] Server started
[ERROR] Connection failed
```

`ConsoleLogger` only implements `log()`. The `info()` and `error()` methods come from the interface defaults.

### Static methods in interfaces

```java
interface Validator {
    boolean isValid(String input);

    static Validator nonEmpty() {
        return input -> input != null && !input.isEmpty();
    }

    static Validator minLength(int min) {
        return input -> input != null && input.length() >= min;
    }
}
```

```java
Validator v = Validator.minLength(3);
System.out.println(v.isValid("ab"));
System.out.println(v.isValid("abc"));
```

Result:
```text
false
true
```

## `instanceof` and pattern matching

Check an object's type at runtime:

```java
Animal animal = new Dog("Rex");

if (animal instanceof Dog) {
    System.out.println("It's a dog!");
}
```

Result:
```text
It's a dog!
```

### Pattern matching (Java 16+)

Combines the type check and cast in one step:

```java
static void describe(Object obj) {
    if (obj instanceof String s) {
        System.out.println("String of length " + s.length());
    } else if (obj instanceof Integer i) {
        System.out.println("Integer: " + i);
    } else if (obj instanceof double[] arr) {
        System.out.println("Double array of length " + arr.length);
    } else {
        System.out.println("Something else: " + obj.getClass().getSimpleName());
    }
}

public static void main(String[] args) {
    describe("Hello");
    describe(42);
    describe(new double[]{1.0, 2.0, 3.0});
}
```

Result:
```text
String of length 5
Integer: 42
Double array of length 3
```

No need for a separate cast -- `s`, `i`, and `arr` are already the correct type.

## Sealed classes (Java 17+)

Sealed classes restrict which classes can extend them:

```java
sealed interface Shape permits Circle, Rectangle, Triangle {}

record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
record Triangle(double base, double height) implements Shape {}
```

```java
static double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t -> 0.5 * t.base() * t.height();
    };
}

public static void main(String[] args) {
    System.out.printf("Circle: %.2f%n", area(new Circle(5)));
    System.out.printf("Rectangle: %.2f%n", area(new Rectangle(4, 6)));
    System.out.printf("Triangle: %.2f%n", area(new Triangle(3, 8)));
}
```

Result:
```text
Circle: 78.54
Rectangle: 24.00
Triangle: 12.00
```

The compiler knows all possible subtypes, so the switch is exhaustive -- no `default` case needed. If you add a new shape, the compiler forces you to handle it everywhere.

## Abstract class vs interface

| Feature | Abstract class | Interface |
|---------|---------------|-----------|
| Inheritance | Single (`extends`) | Multiple (`implements`) |
| Fields | Yes (instance + static) | Only `static final` |
| Constructors | Yes | No |
| Default methods | Yes (regular methods) | Yes (`default` keyword) |
| Use when | Classes share code and state | Classes share a contract |

**Rule of thumb:** use interfaces for defining capabilities ("what can it do?"), use abstract classes for sharing implementation between related classes ("what is it?").

## Composition over inheritance

Inheritance creates tight coupling. Prefer **composition** -- having an object contain another object -- when possible:

```java
// Instead of: class EmailNotifier extends Logger
// Prefer: class EmailNotifier that HAS a Logger

class EmailNotifier {
    private final Logger logger;

    EmailNotifier(Logger logger) {
        this.logger = logger;
    }

    void notify(String recipient, String message) {
        // send email logic here...
        logger.info("Email sent to " + recipient);
    }
}
```

```java
Logger logger = new ConsoleLogger();
EmailNotifier notifier = new EmailNotifier(logger);
notifier.notify("ada@example.com", "Welcome!");
```

Result:
```text
[INFO] Email sent to ada@example.com
```

Benefits:
- `EmailNotifier` is not tied to a specific `Logger` implementation
- You can swap loggers at runtime
- No fragile base class problem

**Guideline:** "Is-a" → inheritance (`Dog` **is an** `Animal`). "Has-a" → composition (`Car` **has an** `Engine`).

## The `Object` class

Every class in Java implicitly extends `Object`. That is where `toString()`, `equals()`, `hashCode()`, and other methods come from:

```java
class MyClass {
    // implicitly: class MyClass extends Object
}
```

Methods inherited from `Object`:
- `toString()` -- string representation
- `equals(Object)` -- content equality
- `hashCode()` -- hash code for collections
- `getClass()` -- runtime class information
- `clone()` -- shallow copy (avoid -- use copy constructors instead)

## Summary

- **`extends`** creates a subclass that inherits fields and methods from a parent class.
- **`super`** calls the parent constructor or methods.
- **`@Override`** marks a method that replaces a parent method -- the compiler verifies it.
- **Polymorphism**: a parent type variable can hold any subclass instance; method calls dispatch to the actual type.
- **Abstract classes** cannot be instantiated and can force subclasses to implement methods.
- **Interfaces** define contracts; a class can implement multiple interfaces.
- **Default methods** in interfaces provide shared implementation.
- **`instanceof`** + pattern matching (Java 16+) checks and casts in one step.
- **Sealed classes** (Java 17+) restrict which classes can extend/implement them.
- Prefer **composition** over inheritance when the relationship is "has-a" rather than "is-a".

Next up: [Collections](./07-collections.md) -- Java's powerful data structures for lists, maps, and sets.
