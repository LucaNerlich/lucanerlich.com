---
title: "Practice Projects"
sidebar_label: "Practice Projects"
description: "Six hands-on project ideas -- from beginner to advanced -- to reinforce everything you learned in the PHP Beginners Guide."
slug: /php/beginners-guide/practice-projects
tags: [php, beginners, projects]
keywords:
  - php project ideas
  - php practice
  - php learning projects
  - php beginner projects
  - php portfolio
sidebar_position: 17
---

# Practice Projects

You have finished the guide. The best way to make the knowledge stick is to build something on your own. This chapter proposes six projects of increasing difficulty. Each one tells you what to build, which chapters it draws from, and enough hints to get started -- but the implementation is up to you. Figuring out the details is where the real learning happens.

Pick one that interests you and start building.

| Difficulty            | Project                    | Key chapters | Time estimate |
|-----------------------|----------------------------|--------------|---------------|
| **Beginner**          | CLI Quiz Game              | 1--6, 11     | 2--4 hours    |
| **Beginner**          | Contact Form with Email    | 1--7, 14     | 2--4 hours    |
| **Intermediate**      | URL Shortener              | 1--12        | 4--8 hours    |
| **Intermediate--Advanced** | Blog with Authentication | 1--14, 16    | 8--16 hours   |
| **Advanced**          | REST API                   | 1--14        | 8--12 hours   |
| **Advanced**          | Task Manager with Full CRUD| All          | 12--20 hours  |

---

## 1. CLI Quiz Game

**Difficulty:** Beginner | **Chapters:** 1--6, 11

Build a terminal-based quiz game that reads questions from a JSON file, presents multiple-choice options, and tracks the player's score. This project reinforces fundamentals without touching the web.

### What you will practice

- Variables, types, and operators (chapters 1--3)
- Control flow: loops and conditionals (chapter 4)
- Functions for reusable logic (chapter 5)
- Arrays for questions and answers (chapter 6)
- File I/O: reading JSON with `file_get_contents` and `json_decode` (chapter 11)

### Data model

Store questions in a JSON file. Each question has a structure like:

```php
<?php

// questions.json structure
[
    {
        "question": "What is the capital of France?",
        "options": ["London", "Paris", "Berlin", "Madrid"],
        "correct": 1
    }
]
```

### Key features

- Read questions from `questions.json`
- Display one question at a time with numbered options
- Accept user input via `readline()` or `fgets(STDIN)`
- Validate input and handle invalid choices
- Track correct answers and display final score
- Shuffle questions or options for variety

### Stretch goals

- Add a timer per question
- Support multiple quiz categories (separate JSON files)
- Store high scores in a file
- Add a "hint" option that eliminates one wrong answer

---

## 2. Contact Form with Email

**Difficulty:** Beginner | **Chapters:** 1--7, 14

Build a web contact form that validates user input and sends emails using PHPMailer. This project introduces form handling, validation, and Composer packages.

### What you will practice

- Forms and HTTP (chapter 7): `$_POST`, `$_GET`, form submission
- Input validation: required fields, email format, length limits
- Composer and packages (chapter 14): install PHPMailer
- Basic security: escaping output, CSRF considerations

### Data model

No database required. The form collects:

| Field      | Type   | Validation                    |
|------------|--------|-------------------------------|
| `name`     | string | Required, 2--100 chars        |
| `email`    | string | Required, valid email format  |
| `subject`  | string | Required, 5--200 chars        |
| `message`  | text   | Required, 10--5000 chars      |

### Key features

- HTML form with `method="post"` and `action` pointing to a PHP script
- Server-side validation with clear error messages
- Use PHPMailer to send the message to a configured address
- Display success or error feedback to the user
- Re-display the form with user input when validation fails

### Stretch goals

- Add a honeypot field to reduce spam
- Implement rate limiting (one submission per IP per hour)
- Add file attachment support with size and type validation
- Send a copy of the message to the submitter

---

## 3. URL Shortener

**Difficulty:** Intermediate | **Chapters:** 1--12

Build a URL shortener that stores links in a database, generates short codes, and redirects visitors while tracking click counts. This project combines routing, database CRUD, and HTTP redirects.

### What you will practice

- Database design and PDO (chapter 12)
- CRUD operations: create, read, update
- Routing: parse the request path to determine the short code
- HTTP redirects: `header('Location: ...')` and `exit`
- String manipulation for generating short codes

### Data model

| Table   | Columns                                              |
|---------|------------------------------------------------------|
| `links` | `id` (PK), `short_code` (unique), `original_url`, `clicks` (int, default 0), `created_at` |

### Key features

- Form or API to create a short link: input URL, generate unique 6--8 character code
- `GET /s/{shortCode}`: look up the link, increment `clicks`, redirect to `original_url`
- Return 404 if the short code does not exist
- Admin or CLI view to list links with click counts
- Validate URLs before storing (must start with `http://` or `https://`)

### Stretch goals

- Add expiration dates for links
- Track click metadata (timestamp, referer) in a separate table
- Add a simple web interface for creating and managing links
- Support custom short codes (user-provided slugs)

---

## 4. Blog with Authentication

**Difficulty:** Intermediate--Advanced | **Chapters:** 1--14, 16

Build a full blog with user registration, login, posts with categories and tags, comments, and an admin panel. This project ties together OOP, sessions, database relations, and file uploads.

### What you will practice

- OOP basics and advanced (chapters 8--9): models, repositories, services
- Sessions and cookies (chapter 13): login state, CSRF tokens
- Database relations (chapter 12): posts belong to users and categories; comments belong to posts and users
- Forms and file uploads (chapters 7, 11): image upload for post thumbnails
- Composer packages (chapter 14): password hashing, validation, maybe a router

### Data model

| Table       | Key columns                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `users`     | `id`, `email`, `password_hash`, `name`, `created_at`                        |
| `posts`     | `id`, `user_id`, `title`, `slug`, `body`, `thumbnail`, `published_at`, `created_at` |
| `categories`| `id`, `name`, `slug`                                                        |
| `tags`      | `id`, `name`, `slug`                                                        |
| `post_category` | `post_id`, `category_id` (pivot)                                        |
| `post_tag`  | `post_id`, `tag_id` (pivot)                                                 |
| `comments`  | `id`, `post_id`, `user_id`, `body`, `created_at`                            |

### Key features

- User registration and login with password hashing (`password_hash`, `password_verify`)
- Create, edit, delete posts (authenticated users only)
- Assign categories and tags to posts (many-to-many)
- Display posts with pagination, filter by category or tag
- Comment on posts (authenticated users)
- Admin panel: list all posts, moderate comments
- Image upload for post thumbnails with validation (type, size)

### Stretch goals

- Draft vs published workflow
- Rich text editor for post body
- Email notifications for new comments
- Search across posts and comments

---

## 5. REST API

**Difficulty:** Advanced | **Chapters:** 1--14

Build a JSON REST API for a task management system. Focus on proper HTTP semantics, token-based authentication, input validation, and clean API design. No frontend -- test with Postman or curl.

### What you will practice

- Routing: map HTTP method and path to handlers
- JSON responses: `json_encode`, `Content-Type: application/json`
- HTTP status codes: 200, 201, 400, 401, 404, 422, 500
- Token-based authentication (Bearer token or API key)
- Input validation and error response format
- PSR-7 or simple request/response handling

### Data model

| Table    | Key columns                                                    |
|----------|----------------------------------------------------------------|
| `users`  | `id`, `email`, `password_hash`, `api_token` (unique)          |
| `tasks`  | `id`, `user_id`, `title`, `description`, `completed` (bool), `due_date`, `created_at` |

### Key features

- `POST /api/auth/login` -- returns API token
- `GET /api/tasks` -- list tasks for authenticated user (filter, paginate)
- `POST /api/tasks` -- create task (validate `title`, optional `description`, `due_date`)
- `GET /api/tasks/:id` -- get single task (404 if not found or not owner)
- `PUT /api/tasks/:id` -- update task
- `DELETE /api/tasks/:id` -- delete task
- Consistent error format: `{"error": "message", "code": "ERROR_CODE"}`
- Validate `Authorization: Bearer {token}` header; return 401 if missing or invalid

### Stretch goals

- Add task priorities and categories
- Implement rate limiting per token
- Add OpenAPI/Swagger documentation
- Support filtering: `GET /api/tasks?completed=false&due_before=2026-04-01`

---

## 6. Task Manager with Full CRUD

**Difficulty:** Advanced | **Chapters:** All

Build a full-featured task manager using the MVC pattern from chapter 16. Include due dates, priorities, categories, search, filter, pagination, and optional Docker deployment. This project uses everything from the guide.

### What you will practice

- MVC architecture: separate models, views, controllers
- Full CRUD with a clean URL structure
- Database: relations, migrations, indexes
- Forms: validation, CSRF, error display
- Sessions: authentication, flash messages
- File organization: autoloading, config, routing
- Composer: dependencies, autoload
- Optional: Docker for local development and deployment

### Data model

| Table       | Key columns                                                                 |
|-------------|-----------------------------------------------------------------------------|
| `users`     | `id`, `email`, `password_hash`, `name`, `created_at`                        |
| `categories`| `id`, `name`, `color`, `user_id`                                            |
| `tasks`     | `id`, `user_id`, `category_id`, `title`, `description`, `priority` (enum), `due_date`, `completed`, `created_at` |

### Key features

- User registration and login
- Create, read, update, delete tasks
- Assign tasks to categories
- Set priority (low, medium, high) and due date
- List view with filters: by category, priority, completed status, due date range
- Search by title or description
- Pagination for task list
- Clean URLs: `/tasks`, `/tasks/123`, `/tasks/new`, `/tasks/123/edit`
- Flash messages for success and error feedback

### Stretch goals

- Docker Compose: PHP, MySQL, Nginx
- Recurring tasks (daily, weekly)
- Drag-and-drop reordering
- Export tasks to CSV
- Email reminders for overdue tasks

---

## Tips for all projects

- **Start small.** Get the simplest version working before adding features. A quiz that reads one question from JSON is better than a half-finished blog.
- **Use Git from the beginning.** Commit often. When an experiment goes wrong, you can always roll back.
- **Write clean, organized code.** Follow PSR-12 for formatting. Use meaningful variable and function names. Keep files focused.
- **Read the PHP documentation when stuck.** The [official PHP manual](https://www.php.net/manual/en/) is comprehensive -- search for the function or topic you need.
- **Consider using a framework after completing these.** Once you understand the patterns, Laravel or Symfony will feel familiar and will save you time on larger projects.

> **Tip:** If you get stuck, revisit the relevant chapter. The guide is designed so you can jump back to any section for a refresher.

You have the knowledge. Now go build something. Each project you complete will deepen your understanding and give you something tangible to show. Keep building, keep learning, and enjoy the process.
