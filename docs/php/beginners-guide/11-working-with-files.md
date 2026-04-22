---
title: "Working with Files"
sidebar_label: "Files"
description: Reading and writing files, CSV and JSON, directory operations, file uploads, path functions, and security best practices.
slug: /php/beginners-guide/working-with-files
tags: [php, beginners]
keywords:
  - php file handling
  - php read write files
  - php csv json
  - php file uploads
  - php file security
sidebar_position: 11
---

# Working with Files

PHP gives you powerful tools to read, write, and manage files on the server. Whether you are loading configuration, storing logs, handling uploads, or persisting data, you need to understand how file operations work and how to do them safely. In this chapter you will learn the core file functions, work with CSV and JSON, handle uploads, and build a simple note-taking app.

## Why Work with Files?

Files are everywhere in web applications. You use them for:

| Use case | Example |
|----------|---------|
| **Configuration** | Loading `.env`, `config.json`, or `.ini` files |
| **Logs** | Appending error or access logs for debugging |
| **Uploads** | Storing user-uploaded images, documents, or media |
| **Data storage** | Saving data without a database - CSV, JSON, or plain text |
| **CSV/JSON** | Importing or exporting tabular or structured data |

Even when you use a database, you often read config files, write logs, and handle uploads. File operations are a fundamental skill.

## Reading Files

PHP offers several ways to read files. Choose based on file size and how you need the data.

### file_get_contents() - Simplest

For small files, `file_get_contents()` reads the entire file into a string:

```php
<?php

$content = file_get_contents('config.txt');
echo $content;

// Returns false on failure
$content = file_get_contents('missing.txt');
if ($content === false) {
    echo 'Could not read file';
}
```

> **Tip:** Use strict comparison (`=== false`) because an empty file returns an empty string, which is falsy but not `false`.

### file() - Into an Array of Lines

`file()` reads the file and returns an array of lines. Useful when you process line by line:

```php
<?php

$lines = file('data.txt');
foreach ($lines as $line) {
    echo trim($line) . "\n";
}

// Skip empty lines
$lines = file('data.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
```

### fopen, fgets, fclose - Line by Line for Large Files

For large files, loading everything into memory is wasteful. Use a file handle and read line by line:

```php
<?php

$handle = fopen('large-log.txt', 'r');
if ($handle === false) {
    die('Could not open file');
}

while (($line = fgets($handle)) !== false) {
    // Process one line at a time
    echo $line;
}

fclose($handle);
```

Always close the handle with `fclose()` when you are done. For very large files, this pattern keeps memory usage low.

| Function | Use when |
|----------|----------|
| `file_get_contents()` | Small files, need whole content as string |
| `file()` | Small files, need array of lines |
| `fopen` / `fgets` / `fclose` | Large files, stream line by line |

## Writing Files

Writing follows a similar pattern: simple one-shot writes vs. controlled streaming.

### file_put_contents() - Simplest

`file_put_contents()` writes a string to a file in one call:

```php
<?php

$data = "Hello, World!\n";
$bytes = file_put_contents('output.txt', $data);

if ($bytes === false) {
    echo 'Write failed';
} else {
    echo "Wrote $bytes bytes";
}
```

By default it **overwrites** the file. To append instead, use the `FILE_APPEND` flag:

```php
<?php

file_put_contents('log.txt', date('Y-m-d H:i:s') . " - User logged in\n", FILE_APPEND);
```

### fopen, fwrite, fclose - More Control

When you need to write in chunks or control the mode explicitly:

```php
<?php

$handle = fopen('output.txt', 'w');  // 'w' = write, truncate; 'a' = append
if ($handle === false) {
    die('Could not open file');
}

fwrite($handle, "First line\n");
fwrite($handle, "Second line\n");

fclose($handle);
```

| Mode | Behavior |
|------|----------|
| `r` | Read only, file must exist |
| `w` | Write only, truncate or create |
| `a` | Append, create if missing |
| `x` | Write only, fail if file exists |

## File Existence and Info

Before reading or writing, you often need to check if a file exists and what it is.

```php
<?php

$path = 'config.json';

if (file_exists($path)) {
    echo 'Path exists';
}

if (is_file($path)) {
    echo 'It is a file (not a directory)';
}

if (is_dir('uploads/')) {
    echo 'It is a directory';
}

$size = filesize($path);       // Size in bytes
$mtime = filemtime($path);     // Last modified timestamp
$mtimeReadable = date('Y-m-d H:i:s', $mtime);
```

> **Note:** `file_exists()` returns true for both files and directories. Use `is_file()` or `is_dir()` when you need to distinguish.

## Working with CSV Files

CSV (comma-separated values) is common for spreadsheets and data exchange. PHP provides `fgetcsv()` and `fputcsv()`.

### Reading CSV

```php
<?php

$handle = fopen('products.csv', 'r');
if ($handle === false) {
    die('Could not open CSV');
}

$header = fgetcsv($handle);  // First row as column names
$rows = [];

while (($row = fgetcsv($handle)) !== false) {
    $rows[] = array_combine($header, $row);
}

fclose($handle);

foreach ($rows as $row) {
    echo $row['name'] . ': ' . $row['price'] . "\n";
}
```

`fgetcsv()` returns an array of values for each line. Use `array_combine()` with the header row to get associative arrays.

### Writing CSV

```php
<?php

$data = [
    ['name', 'price', 'stock'],
    ['Widget', '9.99', '100'],
    ['Gadget', '24.99', '50'],
];

$handle = fopen('export.csv', 'w');
if ($handle === false) {
    die('Could not create file');
}

foreach ($data as $row) {
    fputcsv($handle, $row);
}

fclose($handle);
```

`fputcsv()` handles escaping commas and quotes automatically.

## Working with JSON Files

JSON is ideal for config files and structured data. Use `json_encode()` and `json_decode()`.

### Reading JSON

```php
<?php

$json = file_get_contents('config.json');
$config = json_decode($json, true);  // true = associative array

if (json_last_error() !== JSON_ERROR_NONE) {
    die('Invalid JSON: ' . json_last_error_msg());
}

echo $config['site_name'];
```

### Writing JSON

```php
<?php

$config = [
    'site_name' => 'My App',
    'debug' => false,
    'max_upload_mb' => 5,
];

$json = json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
file_put_contents('config.json', $json);
```

`JSON_PRETTY_PRINT` makes the file human-readable. Always check `json_last_error()` after `json_decode()`.

## Directory Operations

You often need to list, create, or remove directories.

### scandir() - List Contents

```php
<?php

$entries = scandir('uploads/');
foreach ($entries as $entry) {
    if ($entry === '.' || $entry === '..') {
        continue;
    }
    echo $entry . "\n";
}
```

### mkdir() and rmdir()

```php
<?php

// Create directory (recursive = create parent dirs if needed)
if (!is_dir('data/backups')) {
    mkdir('data/backups', 0755, true);
}

// Remove empty directory
if (is_dir('temp')) {
    rmdir('temp');
}
```

### glob() - Pattern Matching

```php
<?php

$txtFiles = glob('data/*.txt');
$allMd = glob('docs/**/*.md');  // Recursive with **

foreach ($txtFiles as $file) {
    echo basename($file) . "\n";
}
```

## File Permissions

On Unix-like systems, files have read, write, and execute permissions for owner, group, and others.

```php
<?php

// Check if readable/writable
if (is_readable('config.json')) {
    $content = file_get_contents('config.json');
}

if (is_writable('log.txt')) {
    file_put_contents('log.txt', $data, FILE_APPEND);
}

// Change permissions (e.g. 0644 = rw-r--r--)
chmod('config.json', 0644);
```

> **Warning:** Be careful with `chmod()`. Giving write access to "others" (e.g. 0666) can be a security risk on a shared server.

## File Uploads

When users submit files via a form, PHP stores them temporarily. You must validate and move them to a safe location.

### The $_FILES Superglobal

```html
<form action="upload.php" method="post" enctype="multipart/form-data">
    <input type="file" name="document" accept=".pdf,.txt">
    <button type="submit">Upload</button>
</form>
```

The form **must** have `enctype="multipart/form-data"` for file uploads.

```php
<?php

// upload.php
$file = $_FILES['document'];

echo $file['name'];      // Original filename
echo $file['type'];      // MIME type (from client -- do not trust)
echo $file['size'];      // Size in bytes
echo $file['tmp_name'];  // Temporary path on server
echo $file['error'];     // UPLOAD_ERR_OK = 0 means success
```

### move_uploaded_file()

Never use the temp path directly. Move the file to your upload directory:

```php
<?php

$uploadDir = __DIR__ . '/uploads/';
$allowedTypes = ['application/pdf', 'text/plain'];
$maxSize = 2 * 1024 * 1024;  // 2 MB

if ($_FILES['document']['error'] !== UPLOAD_ERR_OK) {
    die('Upload failed');
}

if ($_FILES['document']['size'] > $maxSize) {
    die('File too large');
}

if (!in_array($_FILES['document']['type'], $allowedTypes)) {
    die('Invalid file type');
}

$safeName = basename($_FILES['document']['name']);
$target = $uploadDir . $safeName;

if (move_uploaded_file($_FILES['document']['tmp_name'], $target)) {
    echo 'Upload successful';
} else {
    echo 'Move failed';
}
```

### Security Considerations

- **Validate file type** - Do not trust `$_FILES['type']`. Check extension and optionally use `finfo_file()` for MIME detection
- **Limit size** - Enforce `upload_max_filesize` and `post_max_size` in `php.ini`, and check `$_FILES['size']` in code
- **Restrict upload directory** - Store uploads outside the web root or in a directory that cannot execute PHP
- **Use unique filenames** - Avoid overwriting; e.g. `uniqid() . '_' . $originalName`

## Path Functions

PHP provides helpers to work with paths safely.

```php
<?php

$path = '/var/www/html/uploads/photo.jpg';

basename($path);   // photo.jpg
dirname($path);    // /var/www/html/uploads

$info = pathinfo($path);
// $info['dirname']   = /var/www/html/uploads
// $info['basename']  = photo.jpg
// $info['extension'] = jpg
// $info['filename']  = photo

realpath('uploads/');  // Resolves . and .. to absolute path
```

`realpath()` returns `false` if the path does not exist. Use it to validate paths and prevent traversal attacks.

## Security

File operations are a common source of vulnerabilities. Follow these rules:

### Never Trust Filenames from Users

A user can submit `../../../etc/passwd` as a filename. Always sanitize:

```php
<?php

$userFilename = $_FILES['doc']['name'];
$safeName = basename($userFilename);  // Strips directory parts
```

### Path Traversal Prevention

When building paths from user input, validate with `realpath()`:

```php
<?php

$baseDir = realpath(__DIR__ . '/uploads/');
$userPath = $baseDir . '/' . basename($_GET['file']);
$realPath = realpath($userPath);

if ($realPath === false || strpos($realPath, $baseDir) !== 0) {
    die('Invalid path');
}
```

### Validate File Types

- Whitelist allowed extensions
- Use `finfo_file()` for server-side MIME detection
- Store uploads with a safe extension or omit extension

### Restrict Upload Directories

- Keep uploads outside the document root, or
- Use a directory that prevents PHP execution (e.g. `.htaccess` with `php_flag engine off`)

## Practical Example: Simple Note-Taking App

A minimal app that stores notes as text files in a `notes/` directory:

```php
<?php

// notes.php
$notesDir = __DIR__ . '/notes/';

if (!is_dir($notesDir)) {
    mkdir($notesDir, 0755, true);
}

// Create note
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['title'])) {
    $title = preg_replace('/[^a-zA-Z0-9_-]/', '', $_POST['title']);
    if ($title === '') {
        die('Invalid title');
    }
    $content = $_POST['content'] ?? '';
    $path = $notesDir . $title . '.txt';
    file_put_contents($path, $content);
    header('Location: notes.php');
    exit;
}

// Delete note
if (isset($_GET['delete'])) {
    $name = basename($_GET['delete'], '.txt');
    $path = $notesDir . $name . '.txt';
    if (is_file($path) && realpath($path) && strpos(realpath($path), realpath($notesDir)) === 0) {
        unlink($path);
    }
    header('Location: notes.php');
    exit;
}

// List notes
$files = glob($notesDir . '*.txt');
$notes = [];
foreach ($files as $f) {
    $name = basename($f, '.txt');
    $notes[$name] = file_get_contents($f);
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Notes</title>
</head>
<body>
    <h1>My Notes</h1>
    <form method="post">
        <input type="text" name="title" placeholder="Note title" required>
        <textarea name="content" placeholder="Content"></textarea>
        <button type="submit">Save</button>
    </form>
    <ul>
        <?php foreach ($notes as $title => $content): ?>
        <li>
            <strong><?= htmlspecialchars($title) ?></strong>
            <a href="?delete=<?= urlencode($title) ?>.txt">Delete</a>
            <pre><?= htmlspecialchars($content) ?></pre>
        </li>
        <?php endforeach; ?>
    </ul>
</body>
</html>
```

This example:

- Sanitizes the title with `preg_replace` to allow only safe characters
- Uses `basename()` for delete to prevent path traversal
- Validates the delete path with `realpath()` and a prefix check
- Stores notes as plain text files

> **Note:** For production, you would add authentication, CSRF protection, and more robust validation. This is a learning example.

## Summary

- Use `file_get_contents()` for small files; use `fopen`/`fgets`/`fclose` for large files line by line
- Use `file_put_contents()` for simple writes; use `FILE_APPEND` to append
- Check `file_exists()`, `is_file()`, `is_dir()` before reading; use `filesize()` and `filemtime()` for metadata
- Use `fgetcsv()` and `fputcsv()` for CSV; use `json_encode()` and `json_decode()` for JSON
- Use `scandir()`, `mkdir()`, `rmdir()`, and `glob()` for directory operations
- `chmod()`, `is_readable()`, and `is_writable()` help with permissions
- Use `$_FILES` and `move_uploaded_file()` for uploads; validate type, size, and path
- Use `basename()`, `dirname()`, `pathinfo()`, and `realpath()` for safe path handling
- Never trust user-supplied filenames; prevent path traversal and validate file types

Next up: [Working with Databases](./12-working-with-databases.md) - PDO, MySQL, CRUD operations, prepared statements, and transactions.
