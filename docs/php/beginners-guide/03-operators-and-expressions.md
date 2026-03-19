---
title: "Operators & Expressions"
sidebar_label: "Operators & Expressions"
description: Learn how PHP combines values with operators -- arithmetic, assignment, comparison, logical, and string concatenation. Understand loose vs strict comparison and operator precedence.
slug: /php/beginners-guide/operators-and-expressions
tags: [php, beginners]
keywords:
  - php operators
  - php expressions
  - php comparison
  - php string concatenation
  - php operator precedence
sidebar_position: 3
---

# Operators & Expressions

In the previous chapter, you learned how to store values in variables. Now you need to **combine** them -- add numbers,
compare values, join strings, and make decisions. This chapter covers everything you need to know about operators and
expressions in PHP.

## What is an expression? What is an operator?

An **expression** is any piece of code that produces a value. When you write `$x + 5`, that evaluates to a number.
When you write `$name . '!'`, that evaluates to a string. An expression can be as simple as a variable or a literal, or
as complex as a chain of operations.

An **operator** is a symbol (or keyword) that performs an operation on one or more values. Think of it as a verb: the
operator tells PHP what to do with the values around it. For example, `+` adds two numbers, `.` joins two strings,
and `===` checks if two values are identical.

```php
<?php

$price = 19.99;
$quantity = 3;
$total = $price * $quantity;   // $price, $quantity, and $total are expressions; * is the operator

echo $total;  // Output: 59.97
```

PHP has many categories of operators. We will cover them one by one.

## Arithmetic operators

Arithmetic operators work on numbers. They perform the same math you learned in school:

| Operator | Name          | Example          | Result |
|----------|---------------|------------------|--------|
| `+`      | Addition      | `10 + 3`         | `13`   |
| `-`      | Subtraction   | `10 - 3`         | `7`    |
| `*`      | Multiplication| `10 * 3`         | `30`   |
| `/`      | Division      | `10 / 3`         | `3.333...` |
| `%`      | Modulus       | `10 % 3`         | `1`    |
| `**`     | Exponentiation| `2 ** 8`         | `256`  |

The **modulus** operator (`%`) returns the remainder after division. `10 % 3` is `1` because 10 divided by 3 leaves a
remainder of 1.

```php
<?php

$a = 10;
$b = 3;

echo $a + $b;   // 13
echo $a - $b;   // 7
echo $a * $b;   // 30
echo $a / $b;   // 3.3333333333333
echo $a % $b;   // 1

$base = 2;
$exp = 8;
echo $base ** $exp;  // 256 (2 to the power of 8)
```

> **Note:** Division of two integers in PHP 8+ always produces a float. If you divide `10 / 3`, you get `3.333...` --
> not a truncated integer. Use `intdiv(10, 3)` if you need integer division (result: `3`).

## Assignment operators

The assignment operator `=` stores a value in a variable. You already know this from chapter 2. PHP also provides
**compound assignment** operators that combine a calculation with assignment:

| Operator | Meaning          | Example         | Equivalent to      |
|----------|------------------|-----------------|--------------------|
| `=`      | Assign           | `$x = 5`        | Assign 5 to `$x`   |
| `+=`     | Add and assign   | `$x += 3`       | `$x = $x + 3`      |
| `-=`     | Subtract and assign | `$x -= 2`    | `$x = $x - 2`      |
| `*=`     | Multiply and assign | `$x *= 4`    | `$x = $x * 4`      |
| `/=`     | Divide and assign   | `$x /= 2`    | `$x = $x / 2`      |
| `%=`     | Modulus and assign  | `$x %= 3`    | `$x = $x % 3`      |
| `**=`    | Exponent and assign | `$x **= 2`   | `$x = $x ** 2`     |
| `.=`     | Concatenate and assign | `$s .= '!'` | `$s = $s . '!'` |
| `??=`    | Null coalescing assign | `$x ??= 10` | Assign only if `$x` is null |

The compound operators save you from typing the variable name twice:

```php
<?php

$count = 10;
$count += 5;   // $count is now 15
$count -= 3;   // $count is now 12
$count *= 2;   // $count is now 24

$message = 'Hello';
$message .= ', World!';   // $message is now 'Hello, World!';

$name = null;
$name ??= 'Guest';   // $name is assigned 'Guest' only because it was null
echo $name;          // Output: Guest

$age = 25;
$age ??= 99;   // $age stays 25 -- it was not null, so we do not assign
echo $age;     // Output: 25
```

> **Tip:** Use `??=` when you want to set a default value only if the variable is missing or null. It is common
> for configuration or optional parameters.

## String concatenation with the dot (.) operator

In many languages, you use `+` to join strings. In PHP, **the dot (`.`)** is the string concatenation operator. This is
unique to PHP and often surprises beginners coming from JavaScript, Java, or Python.

```php
<?php

$first = 'Hello';
$second = 'World';

$greeting = $first . ' ' . $second;   // 'Hello World'
echo $greeting;
```

The dot operator **glues** strings together. It does not add spaces for you -- you must include them explicitly:

```php
<?php

$firstName = 'Alice';
$lastName = 'Smith';

// Wrong -- no space between names:
echo $firstName . $lastName;   // 'AliceSmith'

// Correct -- add a space:
echo $firstName . ' ' . $lastName;   // 'Alice Smith'
```

You can chain multiple concatenations:

```php
<?php

$greeting = 'Hello';
$name = 'Alice';
$punctuation = '!';

$message = $greeting . ', ' . $name . $punctuation;
echo $message;   // Output: Hello, Alice!
```

If you concatenate a non-string with a string, PHP converts it automatically:

```php
<?php

$age = 30;
$text = 'I am ' . $age . ' years old.';   // $age becomes '30' in the string
echo $text;   // Output: I am 30 years old.
```

> **Note:** In PHP 8+, you can also use string interpolation with curly braces inside double quotes: `"Hello, {$name}!"`.
> That is often more readable than concatenation for simple cases. For complex strings, concatenation is still useful.

## Comparison operators

Comparison operators let you check if two values are equal, different, or ordered. They always return a boolean
(`true` or `false`).

### Loose vs strict comparison

PHP has two kinds of equality:

- **`==`** (loose): Converts types before comparing. `0 == false` is `true` because both are "falsy."
- **`===`** (strict): Compares both value and type. `0 === false` is `false` because one is an integer and one is a
  boolean.

The same applies to inequality:

- **`!=`** (loose): Not equal after type juggling
- **`!==`** (strict): Not equal in value or type

### Full comparison table

| Operator | Name          | Example          | Result |
|----------|---------------|------------------|--------|
| `==`     | Equal (loose) | `5 == '5'`       | `true` |
| `===`    | Identical (strict) | `5 === '5'` | `false` |
| `!=`     | Not equal (loose)   | `5 != '5'` | `false` |
| `!==`    | Not identical (strict) | `5 !== '5'` | `true` |
| `<`      | Less than     | `3 < 5`          | `true` |
| `>`      | Greater than  | `3 > 5`          | `false` |
| `<=`     | Less than or equal | `5 <= 5` | `true` |
| `>=`     | Greater than or equal | `5 >= 3` | `true` |
| `<=>`    | Spaceship     | `5 <=> 3`        | `1`    |

The **spaceship operator** (`<=>`) returns `-1`, `0`, or `1` depending on whether the left operand is less than, equal
to, or greater than the right operand. It is useful for sorting:

```php
<?php

var_dump(5 <=> 3);   // 1  (5 is greater)
var_dump(3 <=> 5);   // -1 (3 is less)
var_dump(5 <=> 5);   // 0  (equal)
```

### Surprising loose comparison results

Loose comparison (`==`) can produce surprising results because PHP converts types before comparing:

```php
<?php

var_dump(0 == 'hello');   // bool(true) in PHP 8 -- 'hello' is converted to 0
var_dump('' == false);    // bool(true)
var_dump(0 == false);     // bool(true)
var_dump('' == 0);        // bool(true) in PHP 8
var_dump('0' == 0);       // bool(true)
var_dump('42' == 42);     // bool(true)
```

| Comparison | Result |
|------------|--------|
| `0 == 'hello'` | `true` (string 'hello' becomes 0 in numeric context) |
| `'' == false` | `true` (empty string and false are both falsy) |
| `0 == false` | `true` (0 and false are both falsy) |
| `'0' == 0` | `true` (string '0' converts to integer 0) |
| `'42' == 42` | `true` (string '42' converts to integer 42) |
| `null == ''` | `true` (both are falsy) |

> **Warning:** These loose comparisons are a common source of bugs. A string like `'hello'` becoming equal to `0` can
> break validation logic. **Always prefer `===` and `!==`** unless you have a specific reason to use loose comparison.

### Why strict comparison is preferred

With strict comparison, you avoid type juggling entirely:

```php
<?php

var_dump(0 === false);    // bool(false) -- different types
var_dump('' === false);   // bool(false) -- different types
var_dump(42 === 42);      // bool(true) -- same type and value
var_dump(42 === '42');    // bool(false) -- int vs string
```

Your code behaves predictably. If you expect a string, you get a string. If you expect an integer, you get an integer.
No silent conversions.

## Logical operators

Logical operators combine boolean values. They are used in conditions and loops.

| Operator | Name | Example | Result |
|----------|------|---------|--------|
| `&&` | Logical AND | `true && false` | `false` |
| `\|\|` | Logical OR | `true \|\| false` | `true` |
| `!` | Logical NOT | `!true` | `false` |
| `and` | Logical AND (lower precedence) | `true and false` | `false` |
| `or` | Logical OR (lower precedence) | `true or false` | `true` |
| `xor` | Logical XOR | `true xor true` | `false` |

### AND and OR

- **AND** (`&&`): Both sides must be true for the result to be true.

```php
<?php

$age = 25;
$hasTicket = true;

var_dump($age >= 18 && $hasTicket);   // true -- both conditions are true
```

- **OR** (`||`): At least one side must be true for the result to be true.

```php
<?php

$isWeekend = true;
$isHoliday = false;

var_dump($isWeekend || $isHoliday);   // true -- at least one is true
```

### NOT

The `!` operator inverts a boolean:

```php
<?php

$isActive = false;
var_dump(!$isActive);   // true -- NOT false is true
```

### and/or keywords vs &&/||

PHP has two forms of AND and OR:

- `&&` and `||` have **higher precedence** than assignment
- `and` and `or` have **lower precedence** than assignment

This matters when you mix them with assignment:

```php
<?php

// With && -- assignment happens first, then the condition
$result = false && $x = true;   // $result is false; $x is never assigned
var_dump($x);   // undefined variable (or null in PHP 8+)

// With and -- the whole expression is evaluated differently
$result = false and $x = true;   // $result is false; $x IS assigned true
var_dump($x);   // true
```

> **Tip:** Use `&&` and `||` in conditions. They are the standard and behave the same as in most languages. Reserve
> `and` and `or` for rare cases where you intentionally want lower precedence.

## Ternary operator

The ternary operator is a shorthand for a simple `if/else` that returns a value:

```php
condition ? value_if_true : value_if_false
```

```php
<?php

$age = 20;
$status = $age >= 18 ? 'adult' : 'minor';
echo $status;   // Output: adult

$score = 85;
$grade = $score >= 90 ? 'A' : ($score >= 80 ? 'B' : 'C');   // Nested ternary
echo $grade;   // Output: B
```

> **Note:** Nested ternaries can be hard to read. If you have more than one level, consider using a regular `if/else`
> or a `match` expression instead (covered in the next chapter).

## Null coalescing operator

The null coalescing operator (`??`) returns the left operand if it is not null, otherwise the right operand:

```php
<?php

$name = null;
$display = $name ?? 'Guest';   // $name is null, so use 'Guest'
echo $display;   // Output: Guest

$age = 25;
$displayAge = $age ?? 0;   // $age is not null, so use 25
echo $displayAge;   // Output: 25
```

It is useful for optional values or missing array keys:

```php
<?php

$config = ['theme' => 'dark'];
$theme = $config['theme'] ?? 'light';        // 'dark' -- key exists
$font = $config['font'] ?? 'sans-serif';     // 'sans-serif' -- key missing

$user = null;
$username = $user?->name ?? 'Anonymous';   // Works with nullsafe operator (PHP 8+)
```

The `??=` operator assigns only when the variable is null:

```php
<?php

$options = [];
$options['debug'] ??= false;   // Assigns false because key does not exist
$options['debug'] ??= true;    // Does nothing -- key already exists
```

## Operator precedence

When PHP evaluates an expression with multiple operators, it follows **precedence** rules -- the same way math follows
"multiplication before addition." Here is a simplified table of common operators, from highest to lowest precedence:

| Precedence | Operators |
|------------|-----------|
| Highest | `**` |
| | `!`, `~`, `+`, `-` (unary) |
| | `*`, `/`, `%` |
| | `+`, `-`, `.` |
| | `<`, `<=`, `>`, `>=`, `<=>` |
| | `==`, `===`, `!=`, `!==` |
| | `&&` |
| | `\|\|` |
| | `??` |
| | `? :` (ternary) |
| | `=`, `+=`, `-=`, etc. |
| Lowest | `and`, `or`, `xor` |

Example:

```php
<?php

$result = 2 + 3 * 4;   // 3 * 4 first (12), then 2 + 12 = 14
echo $result;           // Output: 14

$result = (2 + 3) * 4; // Parentheses override: 5 * 4 = 20
echo $result;           // Output: 20
```

> **Tip:** When in doubt, use parentheses. `($a && $b) || $c` is clearer than relying on precedence alone. Readability
> matters more than saving a few characters.

## Putting it together

Here is a small script that uses everything from this chapter:

```php
<?php

$price = 19.99;
$quantity = 3;
$total = $price * $quantity;

$discount = 0.1;   // 10%
$total -= $total * $discount;

$greeting = 'Your total is ';
$greeting .= '$' . number_format($total, 2);

$isFree = $total > 0 ? false : true;
$status = $isFree ? 'Free!' : 'Due';

$shipping = null;
$shipping ??= 5.99;

echo $greeting . ' (' . $status . ")\n";
echo 'Shipping: $' . $shipping . "\n";
echo 'Strict check: ' . ($total === 53.97 ? 'exact match' : 'rounded') . "\n";
```

## Summary

- An **expression** produces a value; an **operator** performs an operation on values
- Arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
- Assignment: `=`, `+=`, `-=`, `*=`, `/=`, `.=`, `??=`
- String concatenation uses the **dot (`.`)** operator -- unique to PHP
- Comparison: prefer `===` and `!==` (strict) over `==` and `!=` (loose) to avoid bugs
- Logical: `&&`, `||`, `!` for conditions; `and`/`or` have lower precedence
- Ternary: `condition ? a : b` for simple choices
- Null coalescing: `??` for defaults when a value is null; `??=` for assign-if-null
- Use parentheses when operator precedence is unclear

Next up: [Control Flow](./04-control-flow.md) -- if/else, switch, match, loops, and how to control the flow of your
program.
