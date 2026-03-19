---
title: "Variables & Data Types"
sidebar_label: "Variables & Types"
description: Declaring variables with the dollar sign, understanding PHP's data types, working with constants, type juggling, and inspecting values with var_dump.
slug: /php/beginners-guide/variables-and-types
tags: [php, beginners]
keywords:
  - php variables
  - php data types
  - php var_dump
  - php constants
  - php type juggling
sidebar_position: 2
---

# Variables & Data Types

Every program needs to store and work with data. In PHP, you store data in **variables**. This chapter covers how to
create variables, what kinds of data PHP can handle, and how PHP's type system works.

## What is a variable?

A variable is a named container for a value. Think of it as a labeled box -- you put something in the box and refer to
it by name later.

In PHP, every variable starts with a **dollar sign** (`$`):

```php
<?php

$name = 'Alice';
$age = 30;

echo $name;  // Output: Alice
echo $age;   // Output: 30
```

### Variable naming rules

- Must start with `$` followed by a letter or underscore: `$name`, `$_count`, `$firstName`
- Can contain letters, numbers, and underscores after the first character: `$item2`, `$total_price`
- **Case-sensitive**: `$name` and `$Name` are two different variables
- Cannot start with a number after the `$`: `$2things` is invalid
- Cannot contain spaces: `$my name` is invalid -- use `$myName` or `$my_name`

> **Tip:** PHP developers commonly use either **camelCase** (`$firstName`) or **snake_case** (`$first_name`). Pick one
> style and stick with it. The PSR-12 coding standard recommends camelCase for variables.

### Assigning values

The `=` sign is the **assignment operator**. It does not mean "equals" in the mathematical sense -- it means "store this
value in this variable":

```php
<?php

$message = 'Hello';       // Store the string 'Hello' in $message
$message = 'Goodbye';     // Overwrite with a new value -- the old one is gone
echo $message;             // Output: Goodbye
```

You can also assign the value of one variable to another:

```php
<?php

$a = 10;
$b = $a;    // $b is now 10
$a = 20;    // Changing $a does not affect $b
echo $b;    // Output: 10
```

## Data types

PHP has eight fundamental data types. Don't worry about memorizing them all right now -- we will use them throughout the
guide.

### Scalar types (single values)

| Type      | Description                       | Example                          |
|-----------|-----------------------------------|----------------------------------|
| `string`  | Text wrapped in quotes            | `'Hello'`, `"World"`             |
| `int`     | Whole numbers                     | `42`, `-7`, `0`                  |
| `float`   | Decimal numbers                   | `3.14`, `-0.5`, `2.0`           |
| `bool`    | True or false                     | `true`, `false`                  |

### Compound types (collections)

| Type      | Description                       | Example                          |
|-----------|-----------------------------------|----------------------------------|
| `array`   | Ordered collection of values      | `[1, 2, 3]`, `['a' => 1]`       |
| `object`  | Instance of a class               | `new DateTime()`                 |

### Special types

| Type       | Description                      | Example                          |
|------------|----------------------------------|----------------------------------|
| `null`     | Represents "no value"            | `null`                           |
| `resource` | Reference to an external resource| File handle, database connection |

Let's explore each scalar type in detail.

## Strings

A string is a sequence of characters -- any text. PHP supports two main ways to define strings:

### Single quotes

```php
<?php

$greeting = 'Hello, World!';
$path = 'C:\Users\Documents';   // Backslashes are literal in single quotes
```

Single-quoted strings are treated **literally**. PHP does not interpret variables or most escape sequences inside them.
The only exceptions are `\'` (escaped single quote) and `\\` (escaped backslash).

### Double quotes

```php
<?php

$name = 'Alice';
$greeting = "Hello, $name!";   // Output: Hello, Alice!
$line = "First line\nSecond line";  // \n becomes an actual newline
```

Double-quoted strings **do** interpret variables and escape sequences:

| Sequence | Meaning          |
|----------|------------------|
| `\n`     | Newline          |
| `\t`     | Tab              |
| `\\`     | Literal backslash|
| `\"`     | Literal quote    |
| `$var`   | Variable value   |

### When to use which?

- Use **single quotes** when you have plain text with no variables inside
- Use **double quotes** when you need to embed variables or escape sequences

```php
<?php

$who = 'World';

// Both produce the same output:
echo "Hello, $who!";       // Variable interpolation
echo 'Hello, ' . $who . '!';  // String concatenation with the dot operator
```

The dot (`.`) operator joins strings together. We will cover it more in chapter 3.

### String length

```php
<?php

$text = 'Hello';
echo strlen($text);  // Output: 5
```

`strlen()` returns the number of characters in a string. We cover more string functions in chapter 6.

## Integers

Integers are whole numbers -- no decimal point:

```php
<?php

$positive = 42;
$negative = -17;
$zero = 0;

echo $positive;  // Output: 42
```

PHP integers can be very large. On a 64-bit system, they range from approximately -9.2 quintillion to +9.2 quintillion.
If a calculation exceeds this range, PHP automatically converts the result to a float.

### Different number formats

```php
<?php

$decimal = 255;        // Decimal (base 10)
$hex = 0xFF;           // Hexadecimal (base 16) -- also 255
$octal = 0377;         // Octal (base 8) -- also 255
$binary = 0b11111111;  // Binary (base 2) -- also 255
```

You will mostly use decimal numbers, but hexadecimal is common for colors (`0xFF0000` for red) and binary for bitwise
operations.

## Floats

Floats (also called doubles) are numbers with a decimal point:

```php
<?php

$pi = 3.14159;
$temperature = -12.5;
$scientific = 1.2e3;   // 1200.0 (scientific notation)
```

> **Warning:** Floating-point numbers have precision limits. Never compare floats for exact equality:

```php
<?php

$result = 0.1 + 0.2;
echo $result;  // Output: 0.30000000000000004

// Don't do this:
var_dump($result == 0.3);  // May be false!

// Instead, compare with a small margin:
var_dump(abs($result - 0.3) < 0.00001);  // true
```

This is not a PHP bug -- it is how floating-point arithmetic works in every programming language.

## Booleans

A boolean is either `true` or `false`. Booleans are used for conditions and logic:

```php
<?php

$isActive = true;
$isDeleted = false;

if ($isActive) {
    echo 'This user is active';
}
```

### Values that are "falsy"

PHP treats certain values as `false` when used in a boolean context (like an `if` statement):

| Value              | Considered |
|--------------------|------------|
| `false`            | falsy      |
| `0`                | falsy      |
| `0.0`              | falsy      |
| `''` (empty string)| falsy     |
| `'0'`              | falsy      |
| `[]` (empty array) | falsy      |
| `null`             | falsy      |
| Everything else    | truthy     |

> **Note:** The string `'0'` being falsy surprises many beginners. This is a PHP quirk you should be aware of.

## Null

`null` means "no value" or "nothing." A variable is `null` if:

- You explicitly assign `null` to it
- You declared it but never assigned a value
- You used `unset()` on it

```php
<?php

$data = null;
echo is_null($data);  // Output: 1 (true)

$name = 'Alice';
unset($name);
// $name is now undefined -- accessing it produces a warning
```

## Inspecting values with var_dump

When you are learning (and even when you are experienced), you will constantly want to check what a variable contains
and what type it is. The most useful tool for this is `var_dump()`:

```php
<?php

$name = 'Alice';
$age = 30;
$price = 9.99;
$isActive = true;
$nothing = null;

var_dump($name);      // string(5) "Alice"
var_dump($age);       // int(30)
var_dump($price);     // float(9.99)
var_dump($isActive);  // bool(true)
var_dump($nothing);   // NULL
```

`var_dump()` shows you both the **type** and the **value** of a variable. It is far more useful than `echo` for
debugging because `echo` hides type information:

```php
<?php

echo true;   // Output: 1 -- you can't tell it was a boolean
echo false;  // Output: (nothing!) -- false produces no output
echo null;   // Output: (nothing!)

var_dump(true);   // bool(true) -- now you know exactly what it is
var_dump(false);  // bool(false)
var_dump(null);   // NULL
```

> **Tip:** Use `var_dump()` liberally while learning. Whenever something does not behave as you expect, dump the
> variable to see its actual type and value. Other useful functions: `print_r()` for arrays and `gettype()` for just
> the type name.

## Constants

A constant is like a variable that cannot be changed after it is defined. Constants are useful for values that should
stay the same throughout your program:

```php
<?php

define('TAX_RATE', 0.19);
echo TAX_RATE;  // Output: 0.19

// Or using the const keyword (preferred in modern PHP):
const MAX_RETRIES = 3;
echo MAX_RETRIES;  // Output: 3
```

### Constants vs variables

| Feature                  | Variable (`$name`)         | Constant (`NAME`)          |
|--------------------------|----------------------------|----------------------------|
| Prefix                   | `$`                        | No prefix                  |
| Can be changed           | Yes                        | No                         |
| Case                     | Case-sensitive             | Case-sensitive             |
| Scope                    | Local (function-scoped)    | Global (available everywhere) |
| Naming convention        | camelCase or snake_case    | UPPER_SNAKE_CASE           |

### Built-in constants

PHP provides many pre-defined constants:

```php
<?php

echo PHP_VERSION;    // e.g. "8.3.12"
echo PHP_INT_MAX;    // e.g. 9223372036854775807
echo PHP_EOL;        // End-of-line character for the current OS
echo PHP_OS;         // e.g. "Darwin", "Linux", "WINNT"
echo PHP_FLOAT_MAX;  // Largest representable float
```

## Type juggling

PHP is a **dynamically typed** language. You do not declare the type of a variable -- PHP figures it out from the value
you assign:

```php
<?php

$value = '42';       // $value is a string
$value = 42;         // Now $value is an integer
$value = 42.0;       // Now $value is a float
$value = true;       // Now $value is a boolean
```

PHP also **automatically converts** types when needed. This is called **type juggling**:

```php
<?php

$result = '10' + 5;        // '10' is converted to integer 10, result is 15
$result = '10 apples' + 5; // '10 apples' is converted to 10, result is 15
$result = true + true;     // true is 1, result is 2
$result = 'hello' + 5;     // 'hello' is 0, result is 5
```

> **Warning:** Type juggling can cause subtle bugs. The string `'10 apples'` silently becomes the number `10`. In
> modern PHP (8.0+), some of these conversions emit deprecation notices. Always be explicit about conversions when the
> intent is not obvious.

### Explicit type casting

You can manually convert types using casting:

```php
<?php

$string = '42';
$integer = (int) $string;     // 42
$float = (float) $string;     // 42.0
$boolean = (bool) $string;    // true (non-empty, non-"0" string)
$asString = (string) 42;      // "42"
```

### Checking types

```php
<?php

$value = 42;

var_dump(is_int($value));     // bool(true)
var_dump(is_string($value));  // bool(false)
var_dump(is_float($value));   // bool(false)
var_dump(is_bool($value));    // bool(false)
var_dump(is_null($value));    // bool(false)
var_dump(is_array($value));   // bool(false)

echo gettype($value);         // "integer"
```

## Loose vs strict comparison -- a preview

This topic comes up constantly in PHP. The `==` operator performs type juggling before comparing:

```php
<?php

var_dump(0 == 'hello');   // bool(true) in PHP 7, bool(false) in PHP 8
var_dump('' == false);    // bool(true)
var_dump(0 == false);     // bool(true)
var_dump('' == 0);        // bool(true) in PHP 7, bool(false) in PHP 8
```

The `===` operator compares **both value and type** -- no juggling:

```php
<?php

var_dump(0 === false);    // bool(false) -- different types
var_dump('' === false);   // bool(false) -- different types
var_dump(42 === 42);      // bool(true) -- same type and value
var_dump(42 === '42');    // bool(false) -- int vs string
```

> **Tip:** Always use `===` (strict comparison) unless you have a specific reason to use `==`. This avoids an entire
> class of bugs. We cover operators in detail in the next chapter.

## Putting it together

Here is a small script that uses everything from this chapter. Create a file called `profile.php`:

```php
<?php

const SITE_NAME = 'My PHP App';

$firstName = 'Alice';
$lastName = 'Smith';
$age = 30;
$height = 1.72;
$isStudent = false;
$nickname = null;

echo "=== $firstName's Profile ===\n\n";

echo 'Full name: ' . $firstName . ' ' . $lastName . "\n";
echo "Age: $age\n";
echo 'Height: ' . $height . " m\n";
echo 'Student: ' . ($isStudent ? 'Yes' : 'No') . "\n";
echo 'Nickname: ' . ($nickname ?? 'None') . "\n";
echo 'Site: ' . SITE_NAME . "\n";

echo "\n--- Debug Info ---\n";
var_dump($firstName);
var_dump($age);
var_dump($height);
var_dump($isStudent);
var_dump($nickname);
```

Run it:

```bash
php profile.php
```

## Summary

- Variables start with `$` and are case-sensitive
- PHP has four scalar types: `string`, `int`, `float`, `bool`
- `null` represents "no value"
- Use `var_dump()` to inspect a variable's type and value -- it is your best debugging friend
- Constants are defined with `define()` or `const` and cannot be changed
- PHP is dynamically typed -- variables can hold any type and PHP converts between types automatically (type juggling)
- Always prefer `===` (strict) over `==` (loose) for comparisons
- Use single quotes for plain strings, double quotes when you need variable interpolation

Next up: [Operators & Expressions](./03-operators-and-expressions.md) -- arithmetic, comparisons, logical operators,
the null coalescing operator, and how to combine them into expressions.
