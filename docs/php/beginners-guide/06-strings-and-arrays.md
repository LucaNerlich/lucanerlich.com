---
title: "Strings & Arrays"
sidebar_label: "Strings & Arrays"
description: Master PHP strings -- concatenation, heredoc, common functions, and multibyte handling. Then dive into indexed and associative arrays, looping, essential functions, and practical examples.
slug: /php/beginners-guide/strings-and-arrays
tags: [php, beginners]
keywords:
  - php strings
  - php arrays
  - php string functions
  - php array functions
  - php foreach
sidebar_position: 6
---

# Strings & Arrays

Strings and arrays are two of the most used data types in PHP. You will work with them constantly - building messages,
processing user input, storing lists of data, and transforming collections. This chapter gives you a solid foundation in
both.

## Strings

You already met strings in chapter 2. Here we go deeper: concatenation, heredoc and nowdoc, and the most useful
string functions.

### String recap - single vs double quotes

Recall from chapter 2:

- **Single quotes** (`'...'`): Literal text. Variables and most escape sequences are not interpreted.
- **Double quotes** (`"..."`): Variables are interpolated, and escape sequences like `\n` and `\t` work.

```php
<?php

$name = 'Alice';

echo 'Hello, $name!';   // Output: Hello, $name!  (literal)
echo "Hello, $name!";   // Output: Hello, Alice!  (interpolated)
```

> **Tip:** Use single quotes when you have plain text with no variables. Use double quotes when you need variable
> interpolation or escape sequences.

### String concatenation

The **dot operator** (`.`) joins strings together. You can chain it to build longer strings:

```php
<?php

$first = 'Hello';
$second = 'World';
$greeting = $first . ', ' . $second . '!';

echo $greeting;  // Output: Hello, World!
```

The **concatenation assignment operator** (`.=`) appends to an existing string:

```php
<?php

$message = 'Hello';
$message .= ', ';
$message .= 'World';
$message .= '!';

echo $message;  // Output: Hello, World!
```

This is useful when you build a string piece by piece in a loop or conditional:

```php
<?php

$output = '';
$items = ['apple', 'banana', 'cherry'];

foreach ($items as $item) {
    $output .= '- ' . $item . "\n";
}

echo $output;
// Output:
// - apple
// - banana
// - cherry
```

### Heredoc and nowdoc syntax

When you have long blocks of text with many variables, heredoc and nowdoc keep your code readable.

**Heredoc** behaves like double-quoted strings - variables are interpolated:

```php
<?php

$name = 'Alice';
$role = 'Developer';

$text = <<<EOT
Hello, $name!

You have been assigned the role of $role.
Please complete the onboarding form by Friday.

Best regards,
The Team
EOT;

echo $text;
```

The closing identifier (`EOT` in this example) must be on its own line, at the start of the line, with no spaces
before it, and followed by a semicolon. You can use any identifier - `EOT`, `END`, `HTML`, etc. - as long as it
matches at the start and end.

**Nowdoc** behaves like single-quoted strings - no variable interpolation:

```php
<?php

$template = <<<'EOT'
This is a literal string.
No $variables are expanded here.
Use nowdoc for templates or SQL that should stay exactly as written.
EOT;

echo $template;
```

The only difference is that the opening identifier is wrapped in single quotes: `<<<'EOT'`.

> **Note:** Heredoc and nowdoc are especially useful for embedding HTML, SQL, or multi-line text without escaping
> quotes everywhere.

### Common string functions

PHP has dozens of string functions. Here are the ones you will use most often:

| Function            | Description                                      | Example                                      |
|---------------------|--------------------------------------------------|----------------------------------------------|
| `strlen($str)`      | Number of bytes (not characters) in string       | `strlen('Hello')` → `5`                      |
| `strtolower($str)`  | Convert to lowercase                             | `strtolower('HELLO')` → `'hello'`            |
| `strtoupper($str)`  | Convert to uppercase                             | `strtoupper('hello')` → `'HELLO'`            |
| `trim($str)`        | Remove whitespace from both ends                  | `trim('  hi  ')` → `'hi'`                    |
| `ltrim($str)`       | Remove whitespace from left                       | `ltrim('  hi')` → `'hi'`                     |
| `rtrim($str)`       | Remove whitespace from right                     | `rtrim('hi  ')` → `'hi'`                     |
| `str_replace($search, $replace, $str)` | Replace all occurrences              | `str_replace('a', 'o', 'cat')` → `'cot'`     |
| `strpos($haystack, $needle)` | Position of first occurrence (or `false`) | `strpos('hello', 'l')` → `2`          |
| `substr($str, $start, $length)` | Extract a substring                    | `substr('hello', 1, 3)` → `'ell'`            |
| `explode($delimiter, $str)` | Split string into array by delimiter      | `explode(',', 'a,b,c')` → `['a','b','c']`    |
| `implode($glue, $arr)` | Join array elements into string              | `implode('-', [1,2,3])` → `'1-2-3'`          |
| `str_contains($haystack, $needle)` | True if string contains substring (PHP 8+) | `str_contains('hello', 'ell')` → `true` |
| `str_starts_with($haystack, $needle)` | True if string starts with substring (PHP 8+) | `str_starts_with('hello', 'he')` → `true` |
| `str_ends_with($haystack, $needle)` | True if string ends with substring (PHP 8+) | `str_ends_with('hello', 'lo')` → `true` |
| `sprintf($format, ...$args)` | Build string from format and values          | `sprintf('Hi %s', 'Alice')` → `'Hi Alice'`   |

Examples:

```php
<?php

$text = '  Hello, World!  ';
echo strlen(trim($text));        // 13 (trimmed length)
echo strtolower($text);          // "  hello, world!  "
echo str_replace('World', 'PHP', $text);  // "  Hello, PHP!  "

$csv = 'apple,banana,cherry';
$fruits = explode(',', $csv);    // ['apple', 'banana', 'cherry']
echo implode(' | ', $fruits);    // "apple | banana | cherry"

if (str_contains($text, 'World')) {
    echo 'Found World!';
}

$name = 'Alice';
$age = 30;
echo sprintf('Name: %s, Age: %d', $name, $age);  // "Name: Alice, Age: 30"
```

Common `sprintf` placeholders: `%s` (string), `%d` (integer), `%f` (float), `%.2f` (float with 2 decimals).

> **Warning:** `strpos()` returns `0` when the needle is at the start of the string. Since `0` is falsy in PHP, always
> use strict comparison: `if (strpos($haystack, $needle) !== false)`.

### Multibyte strings - a note on Unicode

`strlen()` counts **bytes**, not characters. For ASCII text that is fine. For Unicode (e.g. emoji, accented characters,
Chinese), one character can use multiple bytes:

```php
<?php

$emoji = '👋';
echo strlen($emoji);  // 4 (bytes) -- not 1 character!
```

For Unicode-aware string handling, use the **mbstring** extension:

| Function        | Multibyte equivalent |
|-----------------|----------------------|
| `strlen()`      | `mb_strlen($str, 'UTF-8')` |
| `strpos()`      | `mb_strpos($haystack, $needle, 0, 'UTF-8')` |
| `substr()`      | `mb_substr($str, $start, $length, 'UTF-8')` |
| `strtolower()`  | `mb_strtolower($str, 'UTF-8')` |
| `strtoupper()`  | `mb_strtoupper($str, 'UTF-8')` |

> **Tip:** If your application handles user input in multiple languages or emoji, prefer the `mb_*` functions. The
> mbstring extension is usually enabled by default in PHP.

## Arrays

An **array** is an ordered collection of values. You can store numbers, strings, booleans, other arrays, or a mix.
Arrays are one of PHP's most powerful features.

### What is an array?

Think of an array as a list or a row of boxes. Each box holds a value, and each box has a position (or a label) so you
can access it. Arrays can grow and shrink as you add or remove elements.

### Indexed arrays

An **indexed array** uses numeric keys starting from 0. You create one with square brackets or the `array()` function:

```php
<?php

$numbers = [1, 2, 3, 4, 5];
$colors = array('red', 'green', 'blue');

// Both are equivalent. The short syntax [] is preferred in modern PHP.
```

You access elements by their **index** (position). Indexing is **zero-based** - the first element is at index 0:

```php
<?php

$fruits = ['apple', 'banana', 'cherry'];

echo $fruits[0];   // apple
echo $fruits[1];   // banana
echo $fruits[2];   // cherry
```

### Adding and removing elements

**Append to the end** with `$arr[] = value` or `array_push()`:

```php
<?php

$items = ['a', 'b'];
$items[] = 'c';           // ['a', 'b', 'c']
array_push($items, 'd');  // ['a', 'b', 'c', 'd']
```

**Remove from the end** with `array_pop()`:

```php
<?php

$stack = [1, 2, 3];
$last = array_pop($stack);   // $last is 3, $stack is [1, 2]
```

**Remove from the beginning** with `array_shift()`:

```php
<?php

$queue = ['first', 'second', 'third'];
$first = array_shift($queue);  // $first is 'first', $queue is ['second', 'third']
```

**Add to the beginning** with `array_unshift()`:

```php
<?php

$list = ['b', 'c'];
array_unshift($list, 'a');  // ['a', 'b', 'c']
```

**Remove a specific element** with `unset()`:

```php
<?php

$arr = [10, 20, 30];
unset($arr[1]);   // Removes index 1; $arr is [10, 30]
// Note: indices are NOT renumbered. $arr[0] is 10, $arr[2] is 30.
```

> **Note:** `unset()` removes the key entirely. The array does not automatically reindex. Use `array_values()` to
> reindex: `$arr = array_values($arr);`

### Associative arrays

An **associative array** uses string (or integer) keys that you choose. Instead of positions, you use meaningful names:

```php
<?php

$user = [
    'name' => 'Alice',
    'email' => 'alice@example.com',
    'age' => 30,
];

echo $user['name'];   // Alice
echo $user['email'];  // alice@example.com
```

Use associative arrays when each value has a clear label - user data, configuration, key-value pairs. Use indexed
arrays when order matters and you do not need named keys.

### Multidimensional arrays

Arrays can contain other arrays. That gives you **multidimensional arrays** - arrays of arrays:

```php
<?php

$students = [
    ['name' => 'Alice', 'grade' => 85],
    ['name' => 'Bob', 'grade' => 92],
    ['name' => 'Carol', 'grade' => 78],
];

echo $students[0]['name'];   // Alice
echo $students[1]['grade'];  // 92
```

You can nest as deeply as you need. Access nested values by chaining indices: `$data['users'][0]['email']`.

### Looping through arrays

**foreach** is the standard way to iterate over arrays. Two forms:

**By value only:**

```php
<?php

$fruits = ['apple', 'banana', 'cherry'];

foreach ($fruits as $fruit) {
    echo $fruit . "\n";
}
// apple
// banana
// cherry
```

**By key and value:**

```php
<?php

$scores = ['Alice' => 85, 'Bob' => 92, 'Carol' => 78];

foreach ($scores as $name => $score) {
    echo "$name: $score\n";
}
// Alice: 85
// Bob: 92
// Carol: 78
```

**for loop with count()** when you need the index:

```php
<?php

$items = ['a', 'b', 'c'];

for ($i = 0; $i < count($items); $i++) {
    echo "Index $i: " . $items[$i] . "\n";
}
```

> **Tip:** Prefer `foreach` when you do not need the numeric index. It is clearer and avoids off-by-one errors.

### Essential array functions

| Function                         | Description                                  | Example                                           |
|----------------------------------|----------------------------------------------|---------------------------------------------------|
| `count($arr)`                    | Number of elements                           | `count([1,2,3])` → `3`                            |
| `in_array($needle, $arr)`        | True if value exists in array                | `in_array('b', ['a','b','c'])` → `true`           |
| `array_key_exists($key, $arr)`   | True if key exists                           | `array_key_exists('x', ['x'=>1])` → `true`        |
| `array_merge($arr1, $arr2)`      | Merge arrays (values appended)               | `array_merge([1,2],[3,4])` → `[1,2,3,4]`          |
| `array_slice($arr, $offset, $len)` | Extract portion of array                   | `array_slice([1,2,3,4], 1, 2)` → `[2,3]`          |
| `array_splice($arr, $offset, $len, $replacement)` | Remove/replace portion                  | Modifies array in place                           |
| `array_map($callback, $arr)`    | Apply function to each element               | `array_map('strtoupper', ['a','b'])` → `['A','B']` |
| `array_filter($arr, $callback)` | Keep only elements where callback is truthy  | `array_filter([1,0,2,0,3])` → `[1,2,3]`           |
| `array_reduce($arr, $callback, $initial)` | Reduce to single value                 | Sum, product, concatenation                        |
| `sort($arr)`                    | Sort by value (reindexes)                    | Modifies in place                                  |
| `asort($arr)`                   | Sort by value (keeps keys)                   | Modifies in place                                  |
| `ksort($arr)`                   | Sort by key                                  | Modifies in place                                  |
| `rsort($arr)`                   | Sort by value, descending                    | Modifies in place                                  |
| `array_unique($arr)`            | Remove duplicate values                      | Returns new array                                  |
| `array_reverse($arr)`           | Reverse order                                | Returns new array                                  |
| `array_keys($arr)`              | Get all keys                                 | `array_keys(['a'=>1,'b'=>2])` → `['a','b']`       |
| `array_values($arr)`            | Get all values (reindex)                     | `array_values(['x'=>1,'y'=>2])` → `[1,2]`         |

Examples:

```php
<?php

$nums = [3, 1, 4, 1, 5];
sort($nums);           // [1, 1, 3, 4, 5]
$unique = array_unique($nums);  // [1, 3, 4, 5]

$names = ['alice', 'bob', 'carol'];
$upper = array_map('strtoupper', $names);  // ['ALICE', 'BOB', 'CAROL']

$scores = [10, 20, 30];
$sum = array_reduce($scores, fn($carry, $n) => $carry + $n, 0);  // 60
```

### Destructuring with list() and short syntax

You can unpack array values into variables in one step:

```php
<?php

$point = [10, 20];
list($x, $y) = $point;
echo "$x, $y";  // 10, 20

// Short syntax (PHP 7.1+):
[$x, $y] = $point;
```

With associative arrays, use the key names:

```php
<?php

$user = ['name' => 'Alice', 'email' => 'alice@example.com'];
['name' => $name, 'email' => $email] = $user;
echo $name;   // Alice
echo $email;  // alice@example.com
```

### The spread operator in arrays

PHP 7.4+ supports the **spread operator** (`...`) to merge arrays or insert elements:

```php
<?php

$first = [1, 2, 3];
$second = [4, 5, 6];
$merged = [...$first, ...$second];  // [1, 2, 3, 4, 5, 6]

$middle = ['x', 'y'];
$all = [0, ...$middle, 9];  // [0, 'x', 'y', 9]
```

This is cleaner than `array_merge()` when you want to combine arrays or inject elements at specific positions.

### Practical example - shopping list and gradebook

Here is a complete example that uses strings and arrays together. It builds a shopping list, manipulates it, and then
processes a simple gradebook:

```php
<?php

// --- Shopping list ---
$shoppingList = ['milk', 'bread', 'eggs'];
$shoppingList[] = 'butter';
$shoppingList[] = 'cheese';

// Remove 'eggs' (find position and unset)
$index = array_search('eggs', $shoppingList);
if ($index !== false) {
    unset($shoppingList[$index]);
    $shoppingList = array_values($shoppingList);
}

// Build a formatted string
$listStr = implode(', ', $shoppingList);
echo "Shopping list: $listStr\n";

// --- Student gradebook ---
$grades = [
    ['name' => 'Alice', 'scores' => [85, 90, 88]],
    ['name' => 'Bob', 'scores' => [78, 82, 80]],
    ['name' => 'Carol', 'scores' => [92, 95, 90]],
];

foreach ($grades as $student) {
    $name = $student['name'];
    $scores = $student['scores'];
    $average = array_reduce($scores, fn($c, $n) => $c + $n, 0) / count($scores);
    $average = round($average, 1);
    echo sprintf("%s: %.1f average\n", $name, $average);
}
```

Output:

```
Shopping list: milk, bread, butter, cheese
Alice: 87.7 average
Bob: 80.0 average
Carol: 92.3 average
```

This example uses indexed and associative arrays, `foreach`, `array_search`, `array_values`, `implode`, `array_reduce`,
`count`, `round`, and `sprintf` - all concepts from this chapter.

## Summary

- Strings: Use single quotes for literals, double quotes for interpolation. Concatenate with `.` and `.=`
- Heredoc (`<<<EOT`) interpolates variables; nowdoc (`<<<'EOT'`) does not
- Essential string functions: `strlen`, `strtolower`, `strtoupper`, `trim`, `str_replace`, `strpos`, `substr`, `explode`, `implode`, `str_contains`, `str_starts_with`, `str_ends_with`, `sprintf`
- For Unicode, use `mb_strlen`, `mb_substr`, and other `mb_*` functions
- Arrays: Indexed arrays use numeric keys (0-based); associative arrays use named keys
- Add/remove: `$arr[] = x`, `array_push`, `array_pop`, `array_shift`, `array_unshift`, `unset`
- Loop with `foreach ($arr as $value)` or `foreach ($arr as $key => $value)`
- Essential array functions: `count`, `in_array`, `array_key_exists`, `array_merge`, `array_slice`, `array_map`, `array_filter`, `array_reduce`, `sort`, `asort`, `ksort`, `array_unique`, `array_keys`, `array_values`
- Destructure with `[$a, $b] = $arr` or `['key' => $var] = $arr`
- Spread operator: `[...$arr1, ...$arr2]` merges arrays

Next up: [Working with Forms & HTTP](./07-forms-and-http.md) - HTML forms, GET and POST requests, superglobals, input
validation, and building a contact form.
