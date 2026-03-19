---
title: "Modern PHP Features"
sidebar_label: "Modern PHP"
description: PHP 8.0 through 8.4 highlights including named arguments, enums, readonly properties, property hooks, and choosing your PHP version.
slug: /php/beginners-guide/modern-php
tags: [php, beginners]
keywords:
  - php 8 features
  - php enums
  - php readonly
  - php 8.4
  - modern php
sidebar_position: 15
---

# Modern PHP Features

PHP has evolved significantly since version 7. In this chapter you will tour the most important features added in PHP 8.0 through 8.4. These improvements make your code safer, more expressive, and easier to maintain. You will learn when and how to use each feature, and how to choose the right PHP version for your projects.

## PHP 8.0

PHP 8.0, released in November 2020, introduced the JIT compiler, attributes, and several language features that changed how many developers write PHP.

### Named Arguments

Instead of passing arguments by position, you can pass them by name. This makes function calls clearer and lets you skip optional parameters.

```php
<?php

function createUser(string $name, string $email, bool $active = true): array
{
    return [
        'name'   => $name,
        'email'  => $email,
        'active' => $active,
    ];
}

// Positional: you must pass all arguments up to the one you want to change
$user = createUser('Alice', 'alice@example.com', false);

// Named: skip defaults and specify only what you need
$user = createUser(name: 'Alice', email: 'alice@example.com', active: false);

// Mix positional and named (positional must come first)
$user = createUser('Alice', 'alice@example.com', active: false);
```

Named arguments work especially well with functions that have many optional parameters:

```php
<?php

// Without named args: which flag is which?
htmlspecialchars($str, ENT_QUOTES, 'UTF-8', true);

// With named args: self-documenting
htmlspecialchars($str, double_encode: false);
```

> **Tip:** Use named arguments when a function has several optional parameters or when the meaning of positional arguments is not obvious.

### Match Expression

The `match` expression is a stricter, more powerful alternative to `switch`. It returns a value, does strict comparison, and does not fall through. See [Control Flow](./04-control-flow.md) for a full recap.

```php
<?php

$status = 404;

$message = match ($status) {
    200 => 'OK',
    404 => 'Not Found',
    500 => 'Server Error',
    default => 'Unknown',
};
```

### Union Types

You can declare that a parameter or return type accepts multiple types using the union operator `|`:

```php
<?php

function formatId(int|string $id): string
{
    return (string) $id;
}

function findUser(int $id): User|false
{
    $user = $db->fetch($id);
    return $user ?: false;
}
```

| Union type | Meaning |
|------------|---------|
| `int\|string` | Accepts either an integer or a string |
| `int\|false` | Returns an integer or `false` (common for functions that can fail) |
| `string\|null` | Accepts a string or `null` |

> **Note:** `?Type` is shorthand for `Type|null`. So `?string` means `string|null`.

### Nullsafe Operator

When chaining method calls, a single `null` in the chain would normally cause an error. The nullsafe operator `?->` short-circuits and returns `null` instead:

```php
<?php

$user = getUserById(42);
$country = $user?->getAddress()?->getCountry()?->getName();

// If $user is null, or getAddress() returns null, or getCountry() returns null,
// $country is null without any errors
```

Without the nullsafe operator you would need nested null checks:

```php
<?php

$country = null;
if ($user !== null) {
    $address = $user->getAddress();
    if ($address !== null) {
        $countryObj = $address->getCountry();
        if ($countryObj !== null) {
            $country = $countryObj->getName();
        }
    }
}
```

### Constructor Property Promotion

You can declare and assign class properties directly in the constructor parameters, reducing boilerplate:

```php
<?php

// Before PHP 8.0
class User
{
    private string $name;
    private string $email;

    public function __construct(string $name, string $email)
    {
        $this->name  = $name;
        $this->email = $email;
    }
}

// With constructor property promotion (PHP 8.0+)
class User
{
    public function __construct(
        private string $name,
        private string $email,
    ) {
    }
}
```

You can mix promoted and regular properties. Promoted properties are assigned before the constructor body runs:

```php
<?php

class Product
{
    public function __construct(
        private string $name,
        private float $price,
        public readonly string $sku,
    ) {
        // $this->name, $this->price, $this->sku are already set
    }
}
```

## PHP 8.1

PHP 8.1 added enums, fibers, readonly properties, and several type system improvements.

### Enums

Enums represent a fixed set of named values. They are type-safe and can carry additional data.

#### Basic Enums

```php
<?php

enum Status
{
    case Pending;
    case Approved;
    case Rejected;
}

$status = Status::Approved;

if ($status === Status::Approved) {
    echo 'The request is approved.';
}
```

#### Backed Enums

Enums can be backed by `string` or `int` values, useful for database storage or API responses:

```php
<?php

enum Priority: string
{
    case Low    = 'low';
    case Medium = 'medium';
    case High   = 'high';
}

$priority = Priority::High;
echo $priority->value;  // "high"
```

#### Using Enums

```php
<?php

function processOrder(Status $status): void
{
    match ($status) {
        Status::Pending => queueForReview(),
        Status::Approved => shipOrder(),
        Status::Rejected => notifyCustomer(),
    };
}
```

#### from() and tryFrom()

For backed enums, `from()` returns the enum case for a given value, or throws if invalid. `tryFrom()` returns `null` instead of throwing:

```php
<?php

$priority = Priority::from('high');  // Priority::High
$priority = Priority::tryFrom('invalid');  // null
```

#### Enums with Methods

Enums can have methods and implement interfaces:

```php
<?php

enum Priority: string
{
    case Low    = 'low';
    case Medium = 'medium';
    case High   = 'high';

    public function label(): string
    {
        return match ($this) {
            self::Low    => 'Low priority',
            self::Medium => 'Medium priority',
            self::High   => 'High priority',
        };
    }
}
```

### Fibers

Fibers provide cooperative multitasking -- lightweight, user-space threads that you can pause and resume. They are used internally by async frameworks like ReactPHP and Amp. For most application code you will not use fibers directly; libraries built on top of them handle the complexity.

> **Note:** Fibers are an advanced feature. You typically interact with them through async libraries rather than writing fiber code yourself.

### Readonly Properties

A `readonly` property can be assigned only once -- in the constructor or at declaration:

```php
<?php

class Config
{
    public readonly string $apiKey;

    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }
}

$config = new Config('secret-123');
// $config->apiKey = 'other';  // Error: Cannot modify readonly property
```

> **Warning:** Readonly properties cannot be unset or modified after initialization. Use them for values that should never change after object creation.

### Intersection Types

Intersection types require a value to satisfy multiple types at once, using `&`:

```php
<?php

function countAndIterate(Countable&Iterator $collection): void
{
    echo 'Count: ' . $collection->count() . "\n";
    foreach ($collection as $item) {
        echo $item . "\n";
    }
}
```

### First-Class Callable Syntax

You can create a callable from a function or method using `...` without wrapping it in a closure:

```php
<?php

$callable = strlen(...);
$callable('hello');  // 5

$callable = explode(...);
$callable(',', 'a,b,c');  // ['a', 'b', 'c']

$obj = new MyClass();
$callable = $obj->method(...);
$callable($arg1, $arg2);
```

This is equivalent to `fn(...$args) => strlen(...$args)` but cleaner.

## PHP 8.2

PHP 8.2 added readonly classes, improved type syntax, and performance improvements.

### Readonly Classes

Mark an entire class as `readonly` so that every instance property is implicitly readonly:

```php
<?php

readonly class Point
{
    public function __construct(
        public float $x,
        public float $y,
    ) {
    }
}

$p = new Point(1.0, 2.0);
// $p->x = 3.0;  // Error: Cannot modify readonly property
```

> **Note:** Readonly classes cannot have untyped or static properties. All instance properties must be typed.

### Disjunctive Normal Form (DNF) Types

DNF allows you to combine intersection and union types in a structured way. The form `(A&B)|C` means "either (A and B) or C":

```php
<?php

function process((Countable&Iterator)|null $collection): void
{
    if ($collection === null) {
        return;
    }
    foreach ($collection as $item) {
        echo $item . "\n";
    }
}
```

### true, false, and null as Standalone Types

You can use `true`, `false`, and `null` as types for precise return declarations:

```php
<?php

function isValid(string $input): bool
{
    return strlen($input) > 0;
}

// More precise: returns true on success, false on failure
function tryParse(string $input): true|false
{
    // ...
}

// Null as a standalone type
function getConfig(): Config|null
{
    return $config ?? null;
}
```

## PHP 8.3

PHP 8.3 brought typed constants, JSON validation, and the `#[Override]` attribute.

### Typed Class Constants

Class constants can now have types:

```php
<?php

class App
{
    public const string VERSION = '1.0';
    public const array CONFIG_KEYS = ['api_key', 'timeout'];
}
```

### json_validate()

Validate that a string is valid JSON without decoding it. Useful when you only need to check validity:

```php
<?php

if (json_validate($response)) {
    $data = json_decode($response);
    // ...
}
```

### #[Override] Attribute

Use the `#[Override]` attribute to signal that a method is intended to override a parent method. PHP will error if the parent method does not exist:

```php
<?php

class Child extends Parent
{
    #[Override]
    public function doSomething(): void
    {
        // If Parent::doSomething() is removed or renamed, you get an error
    }
}
```

### Dynamic Class Constant Fetch

Fetch a class constant by name using a variable:

```php
<?php

class Config
{
    public const string API_KEY = 'key';
    public const string TIMEOUT = 'timeout';
}

$constantName = 'API_KEY';
$value = Config::{$constantName};
```

## PHP 8.4

PHP 8.4 introduces property hooks, asymmetric visibility, and other refinements.

### Property Hooks

Property hooks let you define custom get and set behavior for properties without separate getter/setter methods. A property with hooks can be "backed" (stores a value) or "virtual" (computed from other properties):

```php
<?php

class User
{
    public string $name {
        get => strtoupper($this->name);
        set => trim($value);
    }
}

// Virtual property -- no backing storage, computed from other properties
class Rectangle
{
    public function __construct(
        public int $height,
        public int $width,
    ) {
    }

    public int $area {
        get => $this->height * $this->width;
    }
}
```

> **Note:** Property hooks are incompatible with `readonly` properties. Use asymmetric visibility if you need to restrict writes.

### Asymmetric Visibility

You can make a property publicly readable but only writable from within the class:

```php
<?php

class Product
{
    public private(set) string $name;

    public function __construct(string $name)
    {
        $this->name = $name;
    }

    public function rename(string $name): void
    {
        $this->name = $name;  // Allowed inside the class
    }
}

$p = new Product('Widget');
echo $p->name;       // Allowed
// $p->name = 'New';  // Error: Cannot modify from outside
```

### new Without Parentheses

In PHP 8.4 you can omit parentheses when instantiating with `new` in many contexts:

```php
<?php

$obj = new MyClass;
$items = [new Item, new Item, new Item];
```

### Lazy Objects

Lazy objects defer initialization until properties are first accessed. This can improve performance when creating many objects where only some are used. The feature is intended for framework and library authors.

## Choosing Your PHP Version

Deciding which PHP version to use depends on your project, dependencies, and hosting environment.

### Checking Your Version

```bash
php -v
```

In code:

```php
<?php

echo PHP_VERSION;  // e.g. "8.3.2"
```

### Version Requirements

| PHP Version | Release Date | End of Security Support |
|-------------|--------------|-------------------------|
| 8.0 | Nov 2020 | Nov 2023 |
| 8.1 | Nov 2021 | Nov 2025 |
| 8.2 | Dec 2022 | Dec 2026 |
| 8.3 | Nov 2023 | Nov 2027 |
| 8.4 | Nov 2024 | Nov 2028 |

> **Warning:** Use a version that still receives security updates. PHP 8.0 and earlier are no longer supported.

### Upgrading

1. **Check your dependencies** -- run `composer update` and fix any incompatibilities. Many packages require PHP 8.1+ or 8.2+.
2. **Run your test suite** -- if you have tests, run them on the new version.
3. **Review deprecation notices** -- PHP often deprecates features before removing them. Fix deprecations before upgrading.
4. **Use static analysis** -- tools like PHPStan or Psalm can catch type and compatibility issues.

### Docker as an Option

If your system PHP version does not match your project needs, use Docker to run a specific version:

```dockerfile
FROM php:8.3-cli
COPY . /app
WORKDIR /app
RUN composer install --no-dev
CMD ["php", "app.php"]
```

Or use a version in `composer.json`:

```json
{
    "require": {
        "php": "^8.3"
    }
}
```

This ensures your project runs on PHP 8.3 or higher. Use the same constraint in Docker or CI to keep environments consistent.

## Summary

- **PHP 8.0:** Named arguments, match expression, union types, nullsafe operator (`?->`), and constructor property promotion
- **PHP 8.1:** Enums (basic and backed), fibers, readonly properties, intersection types, and first-class callable syntax
- **PHP 8.2:** Readonly classes, DNF types, and `true`/`false`/`null` as standalone types
- **PHP 8.3:** Typed class constants, `json_validate()`, `#[Override]` attribute, and dynamic class constant fetch
- **PHP 8.4:** Property hooks, asymmetric visibility, `new` without parentheses, and lazy objects
- Choose a PHP version that receives security updates; check dependencies and run tests before upgrading; use Docker to standardize your environment

Next up: [Building a Web Application](./16-building-a-web-application.md) -- putting everything together into a complete Notes app with MVC, routing, database, and authentication.
