---
title: "Object-Oriented Programming Basics"
sidebar_label: "OOP Basics"
description: Classes and objects, properties and methods, constructors, visibility modifiers, getters and setters, static members, class constants, and a practical Product and ShoppingCart example.
slug: /php/beginners-guide/oop-basics
tags: [php, beginners]
keywords:
  - php oop
  - php classes
  - php objects
  - php visibility
  - php constructors
sidebar_position: 8
---

# Object-Oriented Programming Basics

Object-oriented programming (OOP) is a way of organizing code around "things" -- real-world or conceptual objects -- instead of procedures. Instead of a long list of functions that pass data around, you group related data and behavior into objects. This chapter introduces classes, objects, properties, methods, constructors, visibility, and other OOP fundamentals in PHP.

## What is OOP? Why use it?

**Object-oriented programming** structures your code around objects. An object bundles data (properties) and the operations that work on that data (methods) into a single unit. Think of a car: it has properties like color, speed, and fuel level, and methods like `start()`, `accelerate()`, and `brake()`. You do not need separate functions scattered across your codebase -- the car object knows how to operate on itself.

### Organizing code around things

Procedural code focuses on steps: "do this, then do that." OOP focuses on things: "this object has this data and can do these actions." When you model a user, a product, or an order, you create a class that describes what that thing is and what it can do. Each user, product, or order in your program becomes an instance of that class -- an object.

### Real-world analogy

A **class** is like a blueprint for a house. It defines the structure -- rooms, doors, windows -- but it is not a house you can live in. An **object** is the actual house built from that blueprint. You can build many houses from the same blueprint; each house is a separate instance with its own state (different furniture, different occupants), but they all share the same structure.

OOP helps you:

- **Encapsulate** data and behavior together
- **Reuse** code through classes and inheritance
- **Model** real-world concepts more naturally
- **Maintain** large codebases by keeping related logic in one place

## Classes and objects

A **class** is a blueprint. An **object** is an instance of that class. You define a class once, then create as many objects from it as you need.

### Defining a class

Use the `class` keyword followed by the class name and a block of code:

```php
<?php

class User {
}
```

The class body can be empty -- you have defined a minimal class. By convention, class names use **PascalCase** (each word capitalized).

### Creating objects

Use the `new` keyword to create an object from a class:

```php
<?php

class User {
}

$user = new User();
$anotherUser = new User();
```

Each `new User()` creates a separate object. `$user` and `$anotherUser` are two distinct instances, even though they share the same class structure.

> **Note:** The parentheses after the class name are required when creating an object. You can omit them only when the constructor takes no arguments, but including them is standard practice.

## Properties

**Properties** are variables that belong to a class. They hold the data for each object. Each object has its own copy of the properties.

### Declaring properties

Declare properties inside the class body. You can give them default values:

```php
<?php

class User {
    public string $name = '';
    public int $age = 0;
    public bool $active = true;
}
```

### Accessing properties

Use the object operator `->` to read or write a property on an object:

```php
<?php

class User {
    public string $name = '';
    public int $age = 0;
}

$user = new User();
$user->name = 'Alice';
$user->age = 30;

echo $user->name;  // Output: Alice
echo $user->age;   // Output: 30
```

Each object has its own `$name` and `$age`. Changing `$user->name` does not affect another `User` object.

### Initializing values

You can initialize properties with literal values or expressions. As of PHP 8.0, you can use constructor promotion to simplify property declaration -- you will see that when we cover constructors.

## Methods

**Methods** are functions defined inside a class. They define the behavior of objects. The difference between a function and a method is simple: a method belongs to a class and is called on an object.

### Defining methods

Define a method like a function, but inside the class body:

```php
<?php

class User {
    public string $name = '';

    public function greet(): string {
        return "Hello, {$this->name}!";
    }
}
```

### Calling methods

Use the object operator `->` to call a method on an object:

```php
<?php

$user = new User();
$user->name = 'Alice';

echo $user->greet();  // Output: Hello, Alice!
```

The method runs in the context of that object, so it can access that object's properties.

### Function vs method

| Term      | Meaning                                                |
|-----------|--------------------------------------------------------|
| **Function** | A standalone block of code, called by name: `greet()` |
| **Method**   | A function inside a class, called on an object: `$user->greet()` |

Methods can receive parameters and return values, just like functions. They can also access the object's properties and other methods.

## The $this keyword

Inside a class, `$this` refers to the **current object** -- the instance on which the method was called. Use `$this` to access the object's properties and methods from within the class.

```php
<?php

class User {
    public string $name = '';
    public int $age = 0;

    public function greet(): string {
        return "Hello, {$this->name}!";
    }

    public function isAdult(): bool {
        return $this->age >= 18;
    }

    public function describe(): string {
        return "{$this->name} is {$this->age} years old.";
    }
}

$user = new User();
$user->name = 'Bob';
$user->age = 25;

echo $user->greet();     // Output: Hello, Bob!
echo $user->describe();  // Output: Bob is 25 years old.
var_dump($user->isAdult());  // Output: bool(true)
```

When you call `$user->greet()`, `$this` inside `greet()` refers to `$user`. You cannot use `$this` outside a class -- it is only valid inside instance methods.

> **Warning:** `$this` is not available in static methods. Static methods belong to the class, not to an object, so there is no "current object."

## Constructors

A **constructor** is a special method that runs automatically when you create a new object. It is the perfect place to initialize properties or perform setup logic.

### The __construct method

In PHP, the constructor is named `__construct`. PHP calls it when you use `new`:

```php
<?php

class User {
    public string $name;
    public int $age;

    public function __construct(string $name, int $age) {
        $this->name = $name;
        $this->age = $age;
    }
}

$user = new User('Alice', 30);
echo $user->name;  // Output: Alice
echo $user->age;   // Output: 30
```

You pass arguments to the constructor when creating the object: `new User('Alice', 30)`.

### Constructor parameters

Constructor parameters work like function parameters. You can use type declarations, default values, and variadic parameters:

```php
<?php

class Product {
    public string $name;
    public float $price;

    public function __construct(string $name, float $price = 0.0) {
        $this->name = $name;
        $this->price = $price;
    }
}

$product = new Product('Widget');
$product2 = new Product('Gadget', 19.99);
```

### Constructor property promotion (PHP 8.0+)

PHP 8.0 introduced **constructor property promotion** -- add `public`, `private`, or `protected` before a constructor parameter to automatically create and assign that property:

```php
<?php

class User {
    public function __construct(
        public string $name,
        public int $age,
    ) {
    }
}

$user = new User('Alice', 30);
echo $user->name;  // Output: Alice
```

This reduces boilerplate when you have many properties to initialize.

## Visibility modifiers

Visibility modifiers control **who can access** a property or method. PHP has three levels: `public`, `private`, and `protected`.

### public

`public` members are accessible from anywhere -- inside the class, in subclasses, and from outside the class.

### private

`private` members are accessible only from **inside the class** that defines them. Not from subclasses, not from outside.

### protected

`protected` members are accessible from inside the class and from **subclasses**. Not from outside the class. You will use this more when you learn inheritance.

### Access levels summary

| Modifier   | Inside class | In subclass | From outside |
|------------|--------------|-------------|--------------|
| `public`   | Yes          | Yes         | Yes          |
| `protected`| Yes          | Yes         | No           |
| `private`  | Yes          | No          | No           |

### Example

```php
<?php

class BankAccount {
    public string $owner;
    private float $balance = 0.0;

    public function __construct(string $owner) {
        $this->owner = $owner;
    }

    public function deposit(float $amount): void {
        if ($amount > 0) {
            $this->balance += $amount;
        }
    }

    public function getBalance(): float {
        return $this->balance;
    }
}

$account = new BankAccount('Alice');
$account->deposit(100.0);
echo $account->owner;        // OK -- public
echo $account->getBalance(); // OK -- public method exposes balance
// $account->balance = 999;  // Error -- cannot access private property
```

By making `$balance` private, you prevent code outside the class from changing it directly. The only way to modify it is through `deposit()`, which can enforce rules (e.g., positive amounts only).

> **Tip:** Default to `private` for properties. Expose only what is necessary through public methods. This is called **encapsulation** -- hiding implementation details and controlling how data is accessed.

## Getters and setters

When you make a property `private`, external code cannot read or write it directly. **Getters** and **setters** are public methods that provide controlled access.

### Why use getters and setters?

- **Validation** -- a setter can reject invalid values (e.g., negative price, empty name)
- **Computed values** -- a getter can derive a value instead of storing it
- **Consistency** -- you can add logging, caching, or side effects in one place
- **Future flexibility** -- you can change how data is stored without breaking callers

### Implementing getters and setters

```php
<?php

class Product {
    private string $name = '';
    private float $price = 0.0;

    public function getName(): string {
        return $this->name;
    }

    public function setName(string $name): void {
        $name = trim($name);
        if ($name === '') {
            throw new InvalidArgumentException('Name cannot be empty');
        }
        $this->name = $name;
    }

    public function getPrice(): float {
        return $this->price;
    }

    public function setPrice(float $price): void {
        if ($price < 0) {
            throw new InvalidArgumentException('Price cannot be negative');
        }
        $this->price = $price;
    }
}

$product = new Product();
$product->setName('Widget');
$product->setPrice(19.99);
echo $product->getName();   // Output: Widget
echo $product->getPrice();  // Output: 19.99
// $product->setPrice(-5);  // Throws InvalidArgumentException
```

The setter validates input before assigning. The getter simply returns the value. Callers interact with the object through these methods instead of touching properties directly.

## Static properties and methods

Sometimes you need data or behavior that belongs to the **class itself**, not to individual objects. Use the `static` keyword for that.

### Static properties

A static property is shared across all instances of the class. There is only one copy:

```php
<?php

class Counter {
    public static int $count = 0;

    public function __construct() {
        self::$count++;
    }
}

new Counter();
new Counter();
new Counter();
echo Counter::$count;  // Output: 3
```

### Static methods

A static method is called on the class, not on an object. Use the scope resolution operator `::`:

```php
<?php

class MathUtils {
    public static function square(float $n): float {
        return $n * $n;
    }
}

echo MathUtils::square(5);  // Output: 25
```

Inside a static method, you cannot use `$this` -- there is no current object. Use `self::` to reference the class or static members.

### When to use static

| Use case | Example |
|----------|---------|
| **Utility methods** | `MathUtils::square()`, `StringHelper::slugify()` |
| **Factory methods** | `User::createFromArray($data)` |
| **Counters or shared state** | `Counter::$count` |
| **Constants** | `Status::ACTIVE` (see next section) |

> **Warning:** Overusing static can make code hard to test and tightly coupled. Prefer instance methods when the behavior depends on object state. Use static for truly stateless utilities or factory methods.

## Class constants

A **class constant** is a value that never changes and belongs to the class. Define it with `const` inside the class:

```php
<?php

class Status {
    public const PENDING = 'pending';
    public const ACTIVE = 'active';
    public const COMPLETED = 'completed';
}

echo Status::ACTIVE;  // Output: active
```

### Accessing constants

Use the class name and `::` to access a constant: `Status::ACTIVE`. You can also use `self::ACTIVE` from inside the class.

### When to use constants

- **Magic strings or numbers** -- instead of `if ($status === 'active')`, use `if ($status === Status::ACTIVE)`
- **Configuration values** -- e.g., default limits, tax rates
- **Enumerations** -- before PHP 8.1 enums, constants were the common way to define a fixed set of values

```php
<?php

class Product {
    public const TAX_RATE = 0.19;
    private float $price;

    public function getPriceWithTax(): float {
        return $this->price * (1 + self::TAX_RATE);
    }
}
```

Constants are always public, protected, or private. As of PHP 7.1, you can use visibility modifiers: `private const SECRET = 'x';`.

## Practical example: Product and ShoppingCart

Here is a complete example that ties together classes, properties, methods, constructors, visibility, getters, and a simple shopping cart:

```php
<?php

class Product {
    public function __construct(
        private string $name,
        private float $price,
        private int $quantity = 1,
    ) {
    }

    public function getName(): string {
        return $this->name;
    }

    public function getPrice(): float {
        return $this->price;
    }

    public function getQuantity(): int {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): void {
        if ($quantity < 1) {
            throw new InvalidArgumentException('Quantity must be at least 1');
        }
        $this->quantity = $quantity;
    }

    public function getTotal(): float {
        return $this->price * $this->quantity;
    }
}

class ShoppingCart {
    /** @var Product[] */
    private array $items = [];

    public function add(Product $product): void {
        $this->items[] = $product;
    }

    public function remove(int $index): void {
        if (isset($this->items[$index])) {
            array_splice($this->items, $index, 1);
        }
    }

    public function getItems(): array {
        return $this->items;
    }

    public function getTotal(): float {
        $total = 0.0;
        foreach ($this->items as $item) {
            $total += $item->getTotal();
        }
        return $total;
    }

    public function getItemCount(): int {
        return count($this->items);
    }
}

// Usage
$cart = new ShoppingCart();

$product1 = new Product('Widget', 9.99, 2);
$product2 = new Product('Gadget', 24.99);

$cart->add($product1);
$cart->add($product2);

echo "Items in cart: " . $cart->getItemCount() . "\n";  // Output: 2
echo "Total: $" . number_format($cart->getTotal(), 2) . "\n";
// Output: Total: $44.97 (9.99*2 + 24.99)
```

The `Product` class encapsulates name, price, and quantity, with a getter for the line total. The `ShoppingCart` class holds an array of `Product` objects and provides methods to add, remove, and calculate the cart total. Each class has a clear responsibility, and the cart works with `Product` objects without needing to know their internal structure.

## Summary

- OOP organizes code around objects -- things with data (properties) and behavior (methods)
- A class is a blueprint; an object is an instance created with `new ClassName()`
- Properties hold data; access them with `$object->property`
- Methods are functions inside a class; call them with `$object->method()`
- Use `$this` inside a class to refer to the current object
- Constructors (`__construct`) run when an object is created; use them to initialize properties
- Visibility modifiers (`public`, `private`, `protected`) control who can access members
- Prefer private properties with getters and setters for validation and encapsulation
- Static properties and methods belong to the class; access them with `ClassName::member`
- Class constants (`const`) hold fixed values; access them with `ClassName::CONSTANT`
- Build classes that model real concepts and keep related logic together

Next up: [OOP Advanced](./09-oop-advanced.md) -- inheritance, interfaces, abstract classes, traits, and namespaces.
