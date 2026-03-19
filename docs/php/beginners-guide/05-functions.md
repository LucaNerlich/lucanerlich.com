---
title: "Functions"
sidebar_label: "Functions"
description: Defining and calling functions, parameters and return values, type declarations, variable scope, closures, arrow functions, and built-in PHP functions.
slug: /php/beginners-guide/functions
tags: [php, beginners]
keywords:
  - php functions
  - php parameters
  - php closures
  - php type hints
  - php arrow functions
sidebar_position: 5
---

# Functions

A function is a reusable block of code that performs a specific task. Instead of writing the same logic over and over, you define it once and call it whenever you need it. This chapter teaches you how to create functions, pass data in and out, and use PHP's modern function features.

## What is a function? Why use functions?

A function is a named block of code that you can execute by calling its name. Think of it as a recipe -- you write the steps once, and whenever you need the result, you follow the recipe.

### The DRY principle

**DRY** stands for **Don't Repeat Yourself**. If you find yourself copying and pasting the same code in multiple places, that is a sign you should extract it into a function. When you fix a bug or improve the logic, you fix it in one place instead of hunting through dozens of copies.

### Readability and reusability

Functions make your code easier to read. A well-named function like `calculateTax($price)` tells you what is happening without forcing you to read every line of the calculation. They also make code reusable -- you can call the same function from different parts of your program, or even from other projects.

## Defining a function

You define a function with the `function` keyword, followed by the function name, parentheses, and a block of code in curly braces:

```php
<?php

function greet() {
    echo 'Hello, World!';
}
```

The syntax is:

```
function functionName() {
    // code to run
}
```

### Naming conventions

PHP function names follow these rules:

- Must start with a letter or underscore
- Can contain letters, numbers, and underscores
- Are **case-insensitive** for the function name itself (unlike variables) -- `greet()`, `Greet()`, and `GREET()` all refer to the same function

> **Note:** PHP developers commonly use **snake_case** for function names (`calculate_total`, `get_user_by_id`). This differs from many other languages that use camelCase. The PSR-12 coding standard recommends camelCase for methods (functions inside classes), but snake_case remains widespread for standalone functions.

| Valid   | Invalid    |
|---------|------------|
| `greet` | `2greet` (cannot start with number) |
| `get_user` | `get user` (no spaces) |
| `calculateTax` | (avoid mixed styles; pick one) |

## Calling a function

To run a function, you write its name followed by parentheses. If the function takes no arguments, the parentheses are empty:

```php
<?php

function greet() {
    echo 'Hello, World!';
}

greet();   // Output: Hello, World!
greet();   // Output: Hello, World! (you can call it again)
```

The function runs each time you call it. You can call it from anywhere in your script, as long as the function is defined before the call (or loaded from another file).

## Parameters and arguments

Functions become much more useful when they accept **parameters** -- values you pass in when you call the function. The names you use in the function definition are **parameters**; the values you pass when calling are **arguments**.

### Single parameter

```php
<?php

function greet(string $name) {
    echo "Hello, $name!";
}

greet('Alice');   // Output: Hello, Alice!
greet('Bob');     // Output: Hello, Bob!
```

Here, `$name` is the parameter. When you call `greet('Alice')`, the string `'Alice'` is the argument, and it is assigned to `$name` inside the function.

### Multiple parameters

You separate parameters with commas:

```php
<?php

function add(int $a, int $b) {
    echo $a + $b;
}

add(3, 5);   // Output: 8
add(10, 20); // Output: 30
```

The order of arguments must match the order of parameters. The first argument goes to the first parameter, the second to the second, and so on.

### Parameter order matters

```php
<?php

function describe(string $name, int $age) {
    echo "$name is $age years old.";
}

describe('Alice', 30);  // Output: Alice is 30 years old.
describe(30, 'Alice');  // Wrong! 30 goes to $name, 'Alice' to $age -- type error or confusing output
```

## Return values

Many functions compute a value and give it back to the caller. You use the `return` keyword to send a value back:

```php
<?php

function add(int $a, int $b): int {
    return $a + $b;
}

$result = add(3, 5);
echo $result;  // Output: 8
```

When PHP hits `return`, it immediately exits the function and passes the value back. Any code after `return` in that function never runs.

### Functions that return vs functions that echo

There is an important distinction:

| Approach | Use when | Example |
|----------|----------|---------|
| **Return** a value | The caller needs to use the result (store it, pass it elsewhere, or decide how to display it) | `$total = calculateTotal($items);` |
| **Echo** (or print) | The function's job is to output directly to the screen | `displayHeader();` |

> **Tip:** Prefer **returning** values over echoing them. Returning makes functions more flexible -- the caller can echo, log, or process the result. Functions that echo are harder to test and reuse.

```php
<?php

// Less flexible -- always outputs
function addAndEcho(int $a, int $b): void {
    echo $a + $b;
}

// More flexible -- caller decides what to do
function add(int $a, int $b): int {
    return $a + $b;
}

$sum = add(3, 5);
echo $sum;           // Output: 8
$double = add(3, 5) * 2;  // Can use in expressions
```

## Default parameter values

You can give a parameter a **default value**. If the caller does not pass an argument, the default is used:

```php
<?php

function greet(string $name = 'World') {
    echo "Hello, $name!";
}

greet('Alice');  // Output: Hello, Alice!
greet();         // Output: Hello, World! (uses default)
```

### Rules for default parameters

- Parameters with defaults must come **after** parameters without defaults
- You can have multiple parameters with defaults

```php
<?php

// Valid
function greet(string $name, string $punctuation = '!') {
    echo "Hello, $name$punctuation";
}

// Invalid -- PHP will error
// function greet(string $punctuation = '!', string $name) { }
```

## Type declarations

PHP lets you declare the **type** of each parameter and the **return type** of the function. This helps catch bugs early and makes your code self-documenting.

### Parameter types

Place the type before the parameter name:

```php
<?php

function add(int $a, int $b): int {
    return $a + $b;
}

add(3, 5);     // OK
add(3, '5');   // OK -- PHP coerces '5' to 5
add(3.7, 5);   // OK -- PHP coerces 3.7 to 3 (truncates)
add('hello', 5);  // TypeError in PHP 8+
```

### Return types

Add a colon and the type after the closing parenthesis:

```php
<?php

function getFullName(string $first, string $last): string {
    return "$first $last";
}

function isAdult(int $age): bool {
    return $age >= 18;
}
```

### Common type declarations

| Type   | Description        | Example                    |
|--------|--------------------|----------------------------|
| `int`  | Integer            | `function count(): int`    |
| `float`| Floating-point     | `function average(): float`|
| `string` | Text             | `function getName(): string` |
| `bool` | True or false      | `function isValid(): bool` |
| `array`| Array (any)        | `function getList(): array`|

## Nullable types, union types, and void

PHP offers several ways to handle optional or multiple types.

### Nullable types

If a parameter or return value can be `null`, prefix the type with a question mark:

```php
<?php

function findUser(int $id): ?string {
    if ($id === 1) {
        return 'Alice';
    }
    return null;  // No user found
}

$name = findUser(1);   // 'Alice'
$name = findUser(99);  // null
```

`?string` means "string or null". It is shorthand for `string|null`.

### Union types

When a value can be one of several types, use a union:

```php
<?php

function formatId(int|string $id): string {
    return (string) $id;
}

formatId(42);    // OK
formatId('42');  // OK
```

### Void return type

Functions that do not return anything (they only echo, or have no return at all) should declare `void`:

```php
<?php

function sayHello(string $name): void {
    echo "Hello, $name!";
}
```

## Variable scope

Variables inside a function are **local** -- they exist only inside that function. Variables outside are in the **global** scope.

### Local scope

```php
<?php

$message = 'Global';

function showMessage() {
    $message = 'Local';
    echo $message;  // Output: Local
}

showMessage();
echo $message;  // Output: Global
```

The `$message` inside the function is a completely different variable. Changing it does not affect the global `$message`.

### Why global variables are problematic

Using global state makes code hard to understand and test. When a function depends on a global variable, you cannot tell what it needs just by looking at its signature. It also makes it easy for different parts of your program to interfere with each other.

### The global keyword (and why to avoid it)

PHP provides a `global` keyword to access global variables from inside a function:

```php
<?php

$counter = 0;

function increment() {
    global $counter;
    $counter++;
}

increment();
echo $counter;  // Output: 1
```

> **Warning:** Avoid `global`. It creates hidden dependencies and makes code harder to maintain. Instead, pass values as parameters and return results. If you need shared state, consider using a class or dependency injection.

## Variadic parameters

Sometimes you want a function to accept **any number** of arguments. Use the spread operator `...` before the parameter name:

```php
<?php

function sum(int ...$numbers): int {
    $total = 0;
    foreach ($numbers as $n) {
        $total += $n;
    }
    return $total;
}

echo sum(1, 2, 3);        // Output: 6
echo sum(1, 2, 3, 4, 5);  // Output: 15
echo sum(10);              // Output: 10
```

The `...$numbers` parameter collects all arguments into an array. You can combine it with regular parameters, but the variadic parameter must come last:

```php
<?php

function greet(string $greeting, string ...$names): string {
    return $greeting . ', ' . implode(' and ', $names) . '!';
}

echo greet('Hello', 'Alice', 'Bob');  // Output: Hello, Alice and Bob!
```

## Anonymous functions (closures)

An **anonymous function** is a function without a name. You assign it to a variable or pass it to another function. In PHP, anonymous functions are implemented as **closures**.

### Basic syntax

```php
<?php

$greet = function (string $name) {
    return "Hello, $name!";
};

echo $greet('Alice');  // Output: Hello, Alice!
```

Notice the semicolon after the closing brace -- you are assigning the function to a variable, so the statement must end with `;`.

### The use keyword

Anonymous functions do not automatically see variables from the outer scope. Use the `use` keyword to bring them in:

```php
<?php

$prefix = 'Mr. ';

$greet = function (string $name) use ($prefix) {
    return "$prefix$name";
};

echo $greet('Smith');  // Output: Mr. Smith
```

You can capture multiple variables: `use ($a, $b, $c)`. By default, variables are captured by value. To capture by reference (so changes inside the closure affect the outer variable), add `&`:

```php
<?php

$count = 0;
$increment = function () use (&$count) {
    $count++;
};
$increment();
$increment();
echo $count;  // Output: 2
```

## Arrow functions

**Arrow functions** are a shorter syntax for simple closures. They were introduced in PHP 7.4. Use `fn` instead of `function`, and `=>` instead of `return`:

```php
<?php

$double = fn(int $x) => $x * 2;
echo $double(5);  // Output: 10

$add = fn(int $a, int $b) => $a + $b;
echo $add(3, 4);  // Output: 7
```

### Arrow function rules

- Arrow functions have **exactly one expression** -- no curly braces or multiple statements
- The expression is automatically returned
- They **automatically capture** variables from the outer scope -- no `use` needed

```php
<?php

$multiplier = 3;
$triple = fn($x) => $x * $multiplier;
echo $triple(10);  // Output: 30
```

> **Note:** Arrow functions are ideal for short callbacks. For more complex logic, use a regular anonymous function or a named function.

## Built-in functions

PHP ships with hundreds of built-in functions. You do not need to define them -- they are always available:

| Category | Examples | Purpose |
|----------|----------|---------|
| Strings  | `strlen`, `str_replace`, `substr`, `strtolower` | Manipulate text |
| Arrays   | `count`, `array_map`, `array_filter`, `array_merge` | Work with arrays |
| Math     | `abs`, `round`, `min`, `max`, `rand` | Numeric operations |
| Type     | `is_int`, `is_string`, `gettype` | Check types |
| Output   | `echo`, `print`, `var_dump`, `print_r` | Display values |
| Files    | `file_exists`, `file_get_contents`, `file_put_contents` | File operations |

You will use these constantly. The official documentation at [php.net/manual/en/funcref.php](https://www.php.net/manual/en/funcref.php) lists every function with examples. When you need to do something, search there first -- chances are PHP already has a function for it.

```php
<?php

$text = 'Hello, World!';
echo strlen($text);           // Output: 13
echo strtoupper($text);        // Output: HELLO, WORLD!

$numbers = [3, 1, 4, 1, 5];
echo count($numbers);         // Output: 5
echo max($numbers);           // Output: 5
```

## Practical example: temperature converter

Here is a small program that combines parameters, return values, type declarations, default values, and multiple functions:

```php
<?php

function celsiusToFahrenheit(float $celsius): float {
    return ($celsius * 9 / 5) + 32;
}

function fahrenheitToCelsius(float $fahrenheit): float {
    return ($fahrenheit - 32) * 5 / 9;
}

function formatTemperature(float $value, string $unit = 'C'): string {
    return round($value, 1) . '°' . $unit;
}

// Convert 25°C to Fahrenheit
$celsius = 25.0;
$fahrenheit = celsiusToFahrenheit($celsius);
echo formatTemperature($celsius) . ' = ' . formatTemperature($fahrenheit, 'F');
// Output: 25°C = 77°F

echo "\n";

// Convert 98.6°F to Celsius
$f = 98.6;
$c = fahrenheitToCelsius($f);
echo formatTemperature($f, 'F') . ' = ' . formatTemperature($c);
// Output: 98.6°F = 37°C
```

Each function has a single responsibility: convert one way, convert the other way, or format the output. The `formatTemperature` function uses a default parameter for the unit, so you can omit it when displaying Celsius. This structure is easy to read, test, and extend.

## Summary

- Functions let you reuse code and follow the DRY principle
- Define with `function name(params) { }`; call with `name(args)`
- Parameters receive data; use `return` to send data back
- Prefer returning values over echoing -- it makes functions more flexible
- Use default parameter values for optional arguments
- Add type declarations for parameters and return types to catch errors and document behavior
- Use `?type` for nullable, `type1|type2` for unions, and `void` when nothing is returned
- Variables inside functions are local; avoid `global`
- Variadic parameters (`...$args`) accept any number of arguments
- Anonymous functions and arrow functions provide compact syntax for callbacks
- PHP has many built-in functions -- check [php.net](https://www.php.net/manual/en/) before writing your own

Next up: [Strings & Arrays](./06-strings-and-arrays.md) -- string manipulation functions, indexed and associative arrays, multidimensional arrays, and essential array functions.
