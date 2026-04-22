---
title: "Composer & Packages"
sidebar_label: "Composer"
description: Dependency management with Composer, installing packages, PSR-4 autoloading, semantic versioning, and security best practices.
slug: /php/beginners-guide/composer-and-packages
tags: [php, beginners]
keywords:
  - php composer
  - composer packages
  - php dependency management
  - composer autoload
  - php packages
sidebar_position: 14
---

# Composer & Packages

PHP has a rich ecosystem of libraries for logging, HTTP requests, date handling, email, testing, and more. Instead of reinventing the wheel, you install and reuse these packages. **Composer** is the standard tool for managing PHP dependencies. In this chapter you will learn how to install Composer, create projects, add packages, configure autoloading, and keep your dependencies secure.

## What is Composer?

Composer is the de facto **dependency manager** for PHP. It downloads packages from [Packagist](https://packagist.org/) (the main PHP package registry), installs them into your project, and generates an autoloader so you can use them without manual `require` statements.

### Why Dependency Management Matters

| Benefit | What it means |
|---------|---------------|
| **Don't reinvent the wheel** | Use battle-tested libraries for logging, HTTP, dates, and more instead of writing your own |
| **Version management** | Specify which versions you need; Composer resolves conflicts and installs compatible versions |
| **Community packages** | Thousands of packages are maintained by the PHP community - you get fixes and features without writing code |
| **Reproducible builds** | `composer.lock` ensures everyone gets the exact same dependency versions |

Without Composer, you would manually download libraries, place them in your project, and manage `require` paths yourself. Composer automates all of that.

## Installing Composer

Composer is a command-line tool. Install it once per system (or per project if you use the installer).

### macOS (Homebrew)

```bash
brew install composer
```

### Linux (curl installer)

```bash
php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
php composer-setup.php --install-dir=/usr/local/bin --filename=composer
php -r "unlink('composer-setup.php');"
```

### Windows

Download and run the [Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe) installer. It will detect PHP and add Composer to your PATH.

### Verify Installation

```bash
composer --version
```

You should see output like `Composer version 2.x.x`.

> **Note:** Composer requires PHP 7.2.5 or newer. Run `php -v` to check your PHP version.

## Creating a Project

Start a new project or add Composer to an existing one with `composer init`.

### composer init

In your project directory, run:

```bash
composer init
```

Composer will prompt you for package name, description, author, and dependencies. You can answer the prompts or press Enter to skip. When done, it creates a `composer.json` file.

### The composer.json File

`composer.json` is the manifest for your project. It defines metadata, dependencies, and autoloading.

```json
{
    "name": "acme/my-app",
    "description": "A sample PHP application",
    "type": "project",
    "require": {
        "php": "^8.1"
    },
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

| Field | Purpose |
|-------|---------|
| `name` | Vendor/package name (e.g. `acme/my-app`) |
| `description` | Short description of the project |
| `type` | Usually `project` for applications, `library` for reusable packages |
| `require` | Production dependencies and their version constraints |
| `autoload` | How Composer should load your classes (PSR-4, classmap, etc.) |

You can edit `composer.json` by hand or use Composer commands to modify it.

## Requiring Packages

To add a package, use `composer require`:

```bash
composer require monolog/monolog
```

Composer will:

1. **Download** the package and its dependencies into `vendor/`
2. **Update** `composer.json` to add the package to `require`
3. **Create or update** `composer.lock` with exact versions
4. **Regenerate** the autoloader

You can require multiple packages at once:

```bash
composer require guzzlehttp/guzzle vlucas/phpdotenv
```

To add a dev-only dependency (e.g. for testing), use `--dev`:

```bash
composer require --dev phpunit/phpunit
```

## composer.lock - Lock Your Versions

After running `composer require` or `composer update`, Composer creates or updates `composer.lock`. This file records the **exact** versions of every installed package.

### Why You Commit composer.lock

| Reason | Explanation |
|--------|-------------|
| **Reproducibility** | Everyone on the team and every deployment gets the same versions |
| **Stability** | No surprise breakages when a maintainer releases a new patch |
| **Auditability** | You know exactly what is running in production |

> **Tip:** Always commit `composer.lock` to version control for applications. For libraries, some teams omit it - but for apps, commit it.

### composer install vs composer update

| Command | When to use | What it does |
|---------|-------------|--------------|
| `composer install` | After cloning a repo or deploying | Reads `composer.lock` and installs those exact versions. Does not change `composer.lock`. |
| `composer update` | When you want newer versions | Resolves versions from `composer.json`, updates packages, and writes a new `composer.lock`. |

Use `composer install` for deployments. Use `composer update` when you intentionally want to upgrade dependencies.

## The vendor/ Directory

Composer installs all packages into the `vendor/` directory. Its structure looks like this:

```
vendor/
├── autoload.php          # Include this to load everything
├── composer/             # Composer metadata and autoload maps
├── monolog/
│   └── monolog/          # The monolog package
├── guzzlehttp/
│   └── guzzle/           # The guzzle package
└── ...
```

### Never Edit vendor/

Packages in `vendor/` are managed by Composer. Any changes you make will be overwritten the next time you run `composer install` or `composer update`. If you need to customize a package, fork it, use a patch, or extend it in your own code.

### Add vendor/ to .gitignore

You do not commit `vendor/` to version control. It is large and reproducible from `composer.json` and `composer.lock`. Add this to your `.gitignore`:

```
/vendor/
```

Anyone who clones the repo runs `composer install` to recreate `vendor/`.

## Autoloading with Composer

Without Composer, you would write `require 'path/to/SomeClass.php';` for every file. Composer generates an **autoloader** that loads classes on demand when you use them.

### PSR-4 Explained

PSR-4 is a standard that maps **namespaces** to **directories**. The namespace `App\Services\UserService` maps to `src/Services/UserService.php` when you configure:

```json
"autoload": {
    "psr-4": {
        "App\\": "src/"
    }
}
```

The `App\` prefix is stripped and replaced with `src/`. So:

| Class | File path |
|-------|-----------|
| `App\Services\UserService` | `src/Services/UserService.php` |
| `App\Models\Product` | `src/Models/Product.php` |

### Using the Autoloader

At the top of your application entry point (e.g. `public/index.php` or `index.php`), add:

```php
<?php

require __DIR__ . '/../vendor/autoload.php';
```

After that, any class from your project or installed packages is available without manual `require` statements:

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

$log = new Logger('my-app');
$log->pushHandler(new StreamHandler('app.log', Logger::DEBUG));
$log->info('Application started');
```

## Organizing Your Own Code with PSR-4

You can use PSR-4 for your own classes, not just third-party packages.

### Create a src/ Directory

Place your classes under `src/` and use a namespace that matches your project:

```
my-app/
├── composer.json
├── src/
│   ├── Services/
│   │   └── UserService.php
│   └── Models/
│       └── Product.php
└── vendor/
```

### Namespace Convention

Use a unique vendor prefix (e.g. `App`, `Acme`, or your company name) to avoid collisions:

```php
<?php

namespace App\Services;

class UserService
{
    public function findById(int $id): ?array
    {
        // ...
    }
}
```

### Configure composer.json

```json
"autoload": {
    "psr-4": {
        "App\\": "src/"
    }
}
```

### Regenerate the Autoloader

After adding new classes or changing the autoload config, run:

```bash
composer dump-autoload
```

Composer rebuilds the autoload map so your new classes are found.

## Popular PHP Packages

| Package | Purpose |
|---------|---------|
| **monolog/monolog** | Logging to files, streams, or external services |
| **guzzlehttp/guzzle** | HTTP client for APIs and web requests |
| **nesbot/carbon** | Date and time manipulation with a fluent API |
| **phpmailer/phpmailer** | Sending email (SMTP, sendmail, etc.) |
| **fakerphp/faker** | Generate fake data for tests and seeding |
| **phpunit/phpunit** | Unit and integration testing framework |
| **vlucas/phpdotenv** | Load environment variables from `.env` files |

Install any of these with `composer require vendor/package`.

## Using a Package: Examples

### Monolog for Logging

```bash
composer require monolog/monolog
```

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Monolog\Level;

$log = new Logger('my-app');
$log->pushHandler(new StreamHandler('logs/app.log', Level::Debug));

$log->info('User logged in', ['user_id' => 42]);
$log->error('Payment failed', ['order_id' => 123]);
```

### Carbon for Date Manipulation

```bash
composer require nesbot/carbon
```

```php
<?php

require __DIR__ . '/vendor/autoload.php';

use Carbon\Carbon;

$now = Carbon::now();
echo $now->format('Y-m-d H:i:s');

$tomorrow = Carbon::tomorrow();
$lastWeek = Carbon::now()->subWeek();
$diff = $now->diffForHumans($lastWeek);  // "1 week ago"
```

> **Tip:** Carbon extends PHP's `DateTime` and adds many convenience methods. It is widely used in Laravel and other PHP projects.

## Composer Scripts

You can define custom scripts in `composer.json` and run them with `composer run-script` or `composer run`.

### Defining Scripts

```json
{
    "scripts": {
        "test": "phpunit",
        "lint": "phpcs src/",
        "serve": "php -S localhost:8000 -t public"
    }
}
```

### Running Scripts

```bash
composer run-script test
composer run test
composer test
```

All three forms work. Scripts can call PHP scripts, shell commands, or other Composer commands.

> **Note:** Composer provides built-in events (e.g. `post-install-cmd`, `pre-update-cmd`) that you can hook into for automation.

## Semantic Versioning

Packages follow **semantic versioning** (semver): `MAJOR.MINOR.PATCH`. Composer uses version constraints to decide which versions to install.

### Common Constraints

| Constraint | Meaning | Example |
|------------|---------|---------|
| `^1.2.3` | Compatible with 1.2.3, allow updates to any 1.x (not 2.0) | `^1.0` allows 1.0, 1.1, 1.9 |
| `~1.2.3` | Allow patch updates only (1.2.x, not 1.3) | `~1.2` allows 1.2.0, 1.2.9 |
| `1.2.3` | Exact version | No updates |
| `>=1.0 <2.0` | Range | 1.x but not 2.x |

### What ^ and ~ Mean in Practice

- `^1.0` - "1.0 or higher, but less than 2.0" - allows minor and patch updates
- `~1.2` - "1.2.x" - allows only patch updates (1.2.0, 1.2.1, etc.)

When you run `composer update`, Composer picks the newest version that satisfies your constraints.

## Security

Dependencies can contain vulnerabilities. Composer helps you stay secure.

### composer audit

Composer 2.4+ includes a built-in security checker:

```bash
composer audit
```

It checks your installed packages against a database of known vulnerabilities and reports any issues.

### Keeping Dependencies Updated

| Practice | Why |
|----------|-----|
| Run `composer update` periodically | Get security patches and bug fixes |
| Run `composer audit` in CI | Catch vulnerabilities before deployment |
| Pin critical packages if needed | Use exact versions for packages with a history of breaking changes |

> **Warning:** Always test after running `composer update`. New versions can introduce breaking changes even within the same major version.

## Summary

- Composer is the standard PHP dependency manager - it downloads packages, manages versions, and generates an autoloader
- Install Composer via Homebrew (macOS), the curl installer (Linux), or the Windows installer; verify with `composer --version`
- Use `composer init` to create a project; `composer.json` defines metadata, dependencies, and autoloading
- Use `composer require vendor/package` to add packages; Composer updates `composer.json`, creates `composer.lock`, and installs into `vendor/`
- Commit `composer.lock` for applications; use `composer install` for deployments, `composer update` when upgrading
- Never edit `vendor/`; add it to `.gitignore`
- PSR-4 maps namespaces to directories; configure in `autoload.psr-4` and `require vendor/autoload.php`
- Organize your code under `src/` with namespaces; run `composer dump-autoload` after adding classes
- Use `composer run script-name` for custom scripts; understand `^` and `~` for version constraints
- Run `composer audit` and keep dependencies updated for security

Next up: [Modern PHP Features](./15-modern-php.md) - PHP 8.0 through 8.4 highlights including named arguments, enums, readonly properties, and more.
