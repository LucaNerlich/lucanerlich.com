---
title: "Control Flow"
sidebar_label: "Control Flow"
description: Making decisions with if/else/elseif, switch and match, looping with while, do-while, for and foreach, and combining control structures in real programs.
slug: /php/beginners-guide/control-flow
tags: [php, beginners]
keywords:
  - php control flow
  - php if else
  - php loops
  - php switch match
  - php foreach
sidebar_position: 4
---

# Control Flow

So far you have learned how to store data in variables and how to combine values with operators. But programs would be
useless if they always did the same thing. You need your code to **make decisions** and **repeat actions**. That is what
**control flow** is about - directing the path your program takes based on conditions, and running blocks of code
multiple times.

## What is control flow?

Control flow is the order in which statements are executed. By default, PHP runs your code from top to bottom, one line
at a time. Control flow structures let you:

- **Branch** - choose between different paths (e.g., "if the user is logged in, show the dashboard; otherwise show the
  login form")
- **Loop** - repeat a block of code (e.g., "display each item in the shopping cart")

Without control flow, every program would execute the same sequence of statements every time. With it, you can build
applications that respond to user input, process lists of data, and handle different situations.

## if statements

The simplest way to make a decision is the `if` statement. You provide a condition in parentheses, and if that
condition evaluates to a truthy value, the block of code inside the braces runs.

### Basic syntax

```php
<?php

$age = 18;

if ($age >= 18) {
    echo 'You are an adult.';
}
```

The structure is:

1. The keyword `if`
2. A condition in parentheses `($age >= 18)`
3. A block of code in curly braces `{ ... }`

If the condition is true, PHP executes the block. If it is false, PHP skips the block entirely.

### Indentation and braces

Always indent the code inside the braces. Use four spaces consistently. The braces `{` and `}` define the **block** -
everything between them runs only when the condition is true. For a single statement, PHP allows you to omit braces,
but you should **always use them** - it prevents bugs when you add more lines later:

```php
<?php

$score = 85;

if ($score >= 60) {
    echo "You passed!\n";
    echo "Your grade is on the way.";
}

// Avoid: if ($x > 0) echo 'positive';
// Preferred: always use braces
if ($x > 0) {
    echo 'positive';
}
```

## else and elseif

Often you want to do one thing when a condition is true and something else when it is false. Use `else`:

```php
<?php

$temperature = 25;

if ($temperature > 30) {
    echo "It's hot outside.";
} else {
    echo "It's not too hot.";
}
```

When you have multiple conditions to check, chain them with `elseif`:

```php
<?php

$grade = 72;

if ($grade >= 90) {
    echo 'A';
} elseif ($grade >= 80) {
    echo 'B';
} elseif ($grade >= 70) {
    echo 'C';
} elseif ($grade >= 60) {
    echo 'D';
} else {
    echo 'F';
}
```

PHP evaluates the conditions from top to bottom. As soon as one is true, that block runs and the rest are skipped. The
`else` block (if present) runs only when **all** previous conditions are false.

> **Tip:** Order your conditions from most specific to least specific. If you put `$grade >= 60` first, it would match
> 90, 80, and 70 too - and the later conditions would never run.

## Truthy and falsy recap

Conditions in `if` statements are evaluated in a boolean context. As you learned in [chapter 2](./02-variables-and-types.md),
PHP treats certain values as falsy:

| Value              | In boolean context |
|--------------------|--------------------|
| `false`            | falsy              |
| `0`                | falsy              |
| `0.0`              | falsy              |
| `''` (empty string)| falsy              |
| `'0'`              | falsy              |
| `[]` (empty array) | falsy              |
| `null`             | falsy              |
| Everything else    | truthy             |

So you can write `if ($name)` - an empty string is falsy, so the `else` block runs. For explicit checks, many
developers prefer `if ($name !== '')` or `if ($name !== null)` to make the intent clearer.

## switch statement

When you have many possible values for a single variable and want to run different code for each, `switch` can be
cleaner than a long chain of `elseif`:

```php
<?php

$day = 'Monday';

switch ($day) {
    case 'Monday':
        echo 'Start of the work week.';
        break;
    case 'Friday':
        echo 'Almost the weekend!';
        break;
    case 'Saturday':
    case 'Sunday':
        echo 'Weekend!';
        break;
    default:
        echo 'Midweek.';
        break;
}
```

### How switch works

1. PHP evaluates the expression in `switch ($day)`
2. It compares that value to each `case` label
3. When a match is found, execution starts at that `case` and continues **until a `break`** (or the end of the switch)
4. The `default` case runs if no other case matches

### The break keyword

**You must use `break`** to stop execution and exit the switch. Without it, PHP **falls through** to the next case -
execution continues into the following cases until it hits a `break`. Fall-through is rarely what you want. Forgetting
`break` is a common bug. Sometimes developers intentionally omit it when multiple cases should run the same code (like
`Saturday` and `Sunday` in the earlier example).

### default case

The `default` case is optional but recommended. It handles any value that does not match the other cases:

```php
<?php

$command = 'unknown';

switch ($command) {
    case 'start':
        echo 'Starting...';
        break;
    case 'stop':
        echo 'Stopping...';
        break;
    default:
        echo "Unknown command: $command";
        break;
}
```

## match expression (PHP 8)

PHP 8 introduced the `match` expression as a modern alternative to `switch`. It has important differences:

1. **Strict comparison** - `match` uses `===`, so `'1'` and `1` are not the same
2. **Returns a value** - you can assign the result to a variable
3. **No fall-through** - each arm runs independently; no `break` needed
4. **Exhaustive** - if no case matches and there is no default, PHP throws an error

```php
<?php

$status = 404;

$message = match ($status) {
    200 => 'OK',
    301 => 'Moved Permanently',
    404 => 'Not Found',
    500 => 'Server Error',
    default => 'Unknown status',
};

echo $message;  // Output: Not Found
```

You can match multiple values per arm:

```php
<?php

$code = 'ERR_TIMEOUT';
$hint = match ($code) {
    'ERR_TIMEOUT', 'ERR_NETWORK' => 'Check your connection.',
    'ERR_AUTH' => 'Please log in again.',
    default => 'Something went wrong.',
};
```

> **Note:** `match` is an expression, not a statement. It produces a value. Use it when you want to assign the result;
> use `switch` when you are only executing side effects (like echoing) and not capturing a return value.

## while loop

A `while` loop repeats a block of code **as long as** a condition is true:

```php
<?php

$count = 0;

while ($count < 5) {
    echo $count . "\n";
    $count++;
}
```

The condition is checked **before** each iteration. If it is false from the start, the loop body never runs.

### Loop variable

The variable `$count` is often called the **loop variable** or **counter**. You must update it inside the loop;
otherwise the condition never becomes false and you get an **infinite loop**:

```php
<?php

// DANGER -- infinite loop! $count never changes.
$count = 0;
while ($count < 5) {
    echo $count . "\n";
    // Forgot $count++;
}
```

> **Warning:** An infinite loop will run forever until you stop it (Ctrl+C in the terminal) or the script hits a memory
> limit. Always ensure your loop condition can eventually become false.

## do-while loop

The `do-while` loop is like `while`, but it checks the condition **after** each iteration. That means the loop body
**always runs at least once**:

```php
<?php

$input = '';

do {
    $input = readline('Enter "yes" to continue: ');
} while ($input !== 'yes');

echo 'You entered yes.';
```

Use `do-while` when you need to execute the block at least once before checking - for example, when prompting for
input until the user provides a valid value.

## for loop

The `for` loop is the classic counting loop. It combines initialization, condition, and increment in one line:

```php
<?php

for ($i = 0; $i < 5; $i++) {
    echo $i . "\n";
}
```

The structure is:

```
for (initialization; condition; increment) {
    // body
}
```

1. **Initialization** (`$i = 0`) - runs once before the loop starts
2. **Condition** (`$i < 5`) - checked before each iteration; if false, the loop stops
3. **Increment** (`$i++`) - runs after each iteration

The `for` loop is ideal when you know how many times you want to repeat - for example, iterating a fixed number of
times or over a range of indices.

## foreach loop

The **foreach** loop is the most common loop in PHP. It iterates over arrays (and other iterable values) without
managing an index yourself.

### Value only

```php
<?php

$fruits = ['apple', 'banana', 'cherry'];

foreach ($fruits as $fruit) {
    echo $fruit . "\n";
}
```

Each element of the array is assigned to `$fruit` in turn. You do not need to worry about array length or indices.

### Key and value

When you need both the key and the value:

```php
<?php

$ages = [
    'Alice' => 30,
    'Bob' => 25,
    'Carol' => 35,
];

foreach ($ages as $name => $age) {
    echo "$name is $age years old.\n";
}
```

The syntax is `foreach ($array as $key => $value)`. For indexed arrays, the key is the numeric index.

> **Tip:** In real PHP code, you will use `foreach` more than `for` or `while`. Arrays are central to PHP, and
> `foreach` is the natural way to process them.

## break and continue

Sometimes you want to exit a loop early or skip an iteration. Use `break` and `continue`:

### break - exit the loop

`break` immediately stops the loop and continues execution after it:

```php
<?php

$numbers = [3, 7, 2, 9, 4];
$found = false;

foreach ($numbers as $n) {
    if ($n === 9) {
        $found = true;
        break;  // Stop the loop now
    }
}

echo $found ? 'Found 9' : '9 not found';
```

### continue - skip to the next iteration

`continue` skips the rest of the current iteration and jumps to the next one:

```php
<?php

for ($i = 0; $i < 6; $i++) {
    if ($i % 2 === 0) {
        continue;  // Skip even numbers
    }
    echo $i . "\n";
}
```

`break` and `continue` work with `for`, `foreach`, `while`, and `do-while`. They also work with `switch` (break only).

## Nesting

You can put control structures inside other control structures. This is called **nesting**.

### Nested if statements

```php
<?php

$age = 25;
$hasTicket = true;

if ($age >= 18) {
    if ($hasTicket) {
        echo 'You may enter.';
    } else {
        echo 'You need a ticket.';
    }
} else {
    echo 'You must be 18 or older.';
}
```

### Nested loops

```php
<?php

$matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
];

foreach ($matrix as $row) {
    foreach ($row as $cell) {
        echo $cell . ' ';
    }
    echo "\n";
}
```

### When to refactor

Deep nesting (three or four levels) becomes hard to read and maintain. If you find yourself nesting heavily, consider
extracting logic into a **function** (covered in the next chapter), using early returns to reduce nesting, or
restructuring conditions to flatten the logic.

## Practical example: grading system

Here is a complete example that combines `if`/`elseif`/`else`, `switch`, and `foreach` to build a simple grading system:

```php
<?php

$scores = [
    'Alice' => 92,
    'Bob' => 67,
    'Carol' => 88,
    'Dave' => 45,
    'Eve' => 78,
];

$gradeLabels = [
    'A' => 'Excellent',
    'B' => 'Good',
    'C' => 'Satisfactory',
    'D' => 'Needs Improvement',
    'F' => 'Fail',
];

foreach ($scores as $student => $score) {
    // Determine letter grade
    if ($score >= 90) {
        $grade = 'A';
    } elseif ($score >= 80) {
        $grade = 'B';
    } elseif ($score >= 70) {
        $grade = 'C';
    } elseif ($score >= 60) {
        $grade = 'D';
    } else {
        $grade = 'F';
    }

    // Get label using match
    $label = match ($grade) {
        'A' => $gradeLabels['A'],
        'B' => $gradeLabels['B'],
        'C' => $gradeLabels['C'],
        'D' => $gradeLabels['D'],
        'F' => $gradeLabels['F'],
    };

    // Output
    $status = ($grade !== 'F') ? 'Pass' : 'Fail';
    echo "$student: $score -> $grade ($label) - $status\n";
}
```

This example shows:

- `foreach` to iterate over the students and scores
- `if`/`elseif`/`else` to compute the letter grade
- `match` to look up the grade label
- The ternary operator `? :` for a simple pass/fail status

## Summary

- **Control flow** lets your program branch (make decisions) and loop (repeat actions)
- **if/else/elseif** - use for conditional execution; always use braces and order conditions from most to least specific
- **switch** - use for many values of one variable; remember `break` to avoid fall-through; include `default` for
  safety
- **match** (PHP 8) - strict comparison, returns a value, no fall-through; use when you need to assign a result
- **while** - repeats while a condition is true; ensure the condition can become false to avoid infinite loops
- **do-while** - like while but runs at least once; useful for input validation
- **for** - classic counting loop with initialization, condition, and increment
- **foreach** - the most common loop in PHP; iterates over arrays with `as $value` or `as $key => $value`
- **break** - exit a loop (or switch) immediately
- **continue** - skip to the next iteration of a loop
- **Nesting** - you can nest control structures; refactor into functions when nesting gets deep

Next up: [Functions](./05-functions.md) - defining reusable blocks of code, parameters, return values, type
declarations, and anonymous functions.
