---
title: "Practice Projects"
sidebar_label: "Practice Projects"
description: Six hands-on project ideas -- from beginner to advanced -- to reinforce everything you learned in the Strapi 5 Beginners Guide.
slug: /strapi/beginners-guide/practice-projects
tags: [strapi, beginners, projects]
keywords:
  - strapi project ideas
  - strapi practice
  - strapi learning projects
  - strapi portfolio
  - strapi tutorial projects
sidebar_position: 17
---

# Practice Projects

You have finished the guide. The best way to make the knowledge stick is to build something. This chapter proposes six
projects of increasing complexity. Each one tells you which chapters it draws from, what to build, and enough detail to
get started - but the implementation is up to you. No step-by-step hand-holding; that is the point.

Pick one that interests you and start building.

## 1. Recipe Book API

**Difficulty:** Beginner | **Chapters:** 1-6

Build a recipe API that a cooking website or mobile app could consume. Focus on clean content modeling, proper
relations, and a well-structured REST API.

### What you will practice

- Content type design (chapters 2-3)
- Components for reusable field groups (chapter 2)
- Relations: recipes belong to categories, recipes have many ingredients (chapter 3)
- Draft/publish workflow (chapter 4)
- REST API: filtering, sorting, pagination, population (chapter 5)
- Public vs authenticated permissions (chapter 6)

### Data model

| Content type         | Kind       | Key fields                                                                |
|----------------------|------------|---------------------------------------------------------------------------|
| **Recipe**           | Collection | `title`, `slug`, `description` (blocks), `prepTime` (integer), `cookTime` (integer), `servings` (integer), `difficulty` (enum: easy/medium/hard), `image` (media) |
| **Category**         | Collection | `name`, `slug`, `description`                                            |
| **Ingredient**       | Component  | `name` (string), `amount` (string), `unit` (enum: g/ml/cups/tbsp/tsp/pieces) |
| **Nutrition**        | Component  | `calories` (integer), `protein` (decimal), `carbs` (decimal), `fat` (decimal) |
| **Site Settings**    | Single     | `siteName`, `tagline`, `recipesPerPage` (integer)                        |

**Relations:** Recipe belongs to Category (many-to-one). Recipes use the Ingredient component as a repeatable list and
Nutrition as a single component.

### Stretch goals

- Add a Tag collection type with many-to-many relation to Recipe
- Create a "featured recipes" custom endpoint that returns the 5 most recent recipes marked as featured
- Add a search endpoint that filters recipes by ingredient name

---

## 2. Event Calendar with Registration

**Difficulty:** Intermediate | **Chapters:** 1-8

Build an event management API where users can browse events and register for them. This project forces you beyond
basic CRUD into custom business logic.

### What you will practice

- All beginner skills (chapters 1-6)
- Custom controllers and services with business logic (chapter 7)
- Custom routes and policies (chapter 8)
- Input validation in services
- Transactional logic (check capacity before accepting a registration)

### Data model

| Content type      | Kind       | Key fields                                                                           |
|-------------------|------------|--------------------------------------------------------------------------------------|
| **Event**         | Collection | `title`, `slug`, `description` (blocks), `date` (datetime), `location` (string), `capacity` (integer), `image` (media) |
| **Registration**  | Collection | `event` (relation to Event), `user` (relation to User), `registeredAt` (datetime), `status` (enum: confirmed/waitlisted/cancelled) |
| **Organizer**     | Collection | `name`, `email`, `bio`                                                               |

**Relations:** Event belongs to Organizer (many-to-one). Registration links Event and User (both many-to-one).

### Key features to implement

1. **Custom `POST /api/events/:documentId/register` endpoint** - checks if the event is in the future, if capacity
   has not been reached, and if the user is not already registered. Returns 400 with a clear message if any check fails.
2. **Custom `DELETE /api/events/:documentId/register` endpoint** - cancels the current user's registration and
   promotes the first waitlisted registration to confirmed.
3. **`is-not-full` policy** - reusable policy that checks event capacity before allowing registration.
4. **`registrations-count` virtual field** - override the Event `findOne` controller to include a count of confirmed
   registrations in the response.

### Stretch goals

- Add a cron job that automatically cancels registrations for past events
- Send a notification (log message or webhook) when an event reaches 80% capacity
- Add an `is-organizer` policy so only the event's organizer can update or delete it

---

## 3. Link Shortener

**Difficulty:** Intermediate | **Chapters:** 7-9

A URL shortener with a tiny data model but heavy emphasis on custom routes, lifecycle hooks, and non-CRUD behavior.
This teaches you that Strapi can power more than just content APIs.

### What you will practice

- Custom routes that do not follow CRUD conventions (chapter 8)
- Document Service middleware / lifecycle hooks for auto-generating data (chapter 9)
- Custom controllers with redirect logic (chapter 7)
- Service layer for business logic (chapter 7)

### Data model

| Content type | Kind       | Key fields                                                                                    |
|--------------|------------|-----------------------------------------------------------------------------------------------|
| **Link**     | Collection | `originalUrl` (string, required), `shortCode` (uid, required, unique), `clicks` (integer, default 0), `expiresAt` (datetime, nullable) |

That is it - one content type.

### Key features to implement

1. **Auto-generate `shortCode`** - register a Document Service middleware that generates a random 6-character
   alphanumeric code on `beforeCreate` if no `shortCode` is provided.
2. **`GET /s/:shortCode` redirect endpoint** - a custom route that looks up the link, increments the click counter,
   and returns a 302 redirect to `originalUrl`. Return 404 if not found, 410 if expired.
3. **`GET /api/links/:documentId/stats` endpoint** - returns the link's click count and creation date.
4. **Rate limiting** - add the rate-limiting middleware from chapter 8 to the redirect endpoint to prevent abuse.

### Stretch goals

- Add an optional `password` field; the redirect endpoint requires the password as a query parameter
- Track click metadata (timestamp, referer header) in a separate `Click` collection type for analytics
- Add a bulk-create endpoint that accepts an array of URLs and returns short codes for all of them

---

## 4. Multi-author Blog with Editorial Workflow

**Difficulty:** Intermediate-Advanced | **Chapters:** 1-11

Take the blog you built throughout the guide and level it up with a real editorial workflow, role-based access control,
and TypeScript. This is the closest project to a production system.

### What you will practice

- Everything from the guide (chapters 1-11)
- Custom roles and granular permissions (chapter 6)
- Custom policies for role-based access (chapter 8)
- Lifecycle hooks for notifications (chapter 9)
- Full TypeScript integration (chapter 11)

### Key features to implement

1. **Editorial status field** - add a `reviewStatus` enum to Post: `draft`, `in_review`, `approved`, `rejected`.
   This is separate from Strapi's built-in draft/publish system and tracks the editorial process.
2. **Custom roles** - create `Writer`, `Editor`, and `Admin` roles. Writers can create and submit posts for review.
   Editors can approve or reject. Admins can do everything.
3. **`submit-for-review` endpoint** - `POST /api/posts/:documentId/submit` changes `reviewStatus` from `draft` to
   `in_review`. Only the post's author can submit.
4. **`approve` and `reject` endpoints** - only users with the Editor role can call these. Approving also publishes
   the post.
5. **Lifecycle notification** - send a log message (or webhook) when a post's `reviewStatus` changes, including who
   changed it and the old/new status.
6. **Type everything** - controllers, services, policies, routes, and the register/bootstrap functions should all be
   in TypeScript with proper type annotations.

### Stretch goals

- Add a `Comment` collection type with moderation (approved/pending/rejected)
- Implement revision history by storing previous versions in a `Revision` collection type on each update
- Add an RSS feed endpoint (`GET /api/posts/feed`) that returns the 20 most recent published posts as XML

---

## 5. Personal Portfolio with Dynamic Pages

**Difficulty:** Advanced | **Chapters:** 2, 3, 5, 10

Build a portfolio CMS where every page is assembled from dynamic zone blocks. This project is heavy on content
modeling and light on custom backend logic - the challenge is designing a flexible, editor-friendly schema.

### What you will practice

- Dynamic zones and components (chapter 2)
- Relation design (chapter 3)
- Deep and selective population (chapter 5)
- Media management with an external provider (chapter 10)

### Data model

| Content type      | Kind       | Key fields                                       |
|-------------------|------------|--------------------------------------------------|
| **Page**          | Collection | `title`, `slug`, `blocks` (dynamic zone), `seo` (component) |
| **Project**       | Collection | `title`, `slug`, `description` (blocks), `client` (string), `year` (integer), `tags`, `coverImage` (media), `images` (media, multiple), `liveUrl`, `repoUrl` |
| **Skill**         | Collection | `name`, `level` (enum: beginner/intermediate/advanced/expert), `icon` (media) |
| **Global**        | Single     | `siteName`, `tagline`, `logo` (media), `socialLinks` (repeatable component) |

### Dynamic zone blocks to create

| Component           | Category | Fields                                                             |
|---------------------|----------|--------------------------------------------------------------------|
| **Hero**            | `blocks` | `heading`, `subheading`, `backgroundImage` (media), `ctaText`, `ctaUrl` |
| **RichContent**     | `blocks` | `body` (blocks editor)                                             |
| **ProjectGrid**     | `blocks` | `title`, `projects` (relation to Project, many), `columns` (enum: 2/3/4) |
| **SkillList**       | `blocks` | `title`, `skills` (relation to Skill, many)                       |
| **ImageGallery**    | `blocks` | `images` (media, multiple), `layout` (enum: grid/masonry/carousel) |
| **Testimonial**     | `blocks` | `quote` (text), `author` (string), `role` (string), `avatar` (media) |
| **ContactForm**     | `blocks` | `heading`, `description`, `emailTo` (string)                      |

### Key features to implement

1. **Flexible page builder** - editors should be able to compose any page from any combination of blocks.
2. **Deep population endpoint** - `GET /api/pages?populate=deep` or a custom controller that fully populates all
   dynamic zone blocks including nested relations (projects, skills) and media.
3. **Configure an external upload provider** - set up S3 or Cloudinary so portfolio images are served from a CDN.
4. **Optimized list endpoint** - a custom `GET /api/projects` controller that returns only the fields needed for a
   grid card (title, slug, coverImage thumbnail, year, tags).

### Stretch goals

- Add a `BlogPost` collection type and a `LatestPosts` dynamic zone block that auto-populates the 3 most recent posts
- Implement a `sitemap.xml` endpoint that lists all published pages and projects
- Add i18n support for a bilingual portfolio (e.g., English and German)

---

## 6. Reading List API for a Mobile App

**Difficulty:** Advanced | **Chapters:** 5-8, 11-12

Build a backend for a personal reading list app. Every user manages their own books - scoped by authentication. This
project brings together API design, user-scoped data, middleware, TypeScript, and deployment.

### What you will practice

- User-scoped data and ownership policies (chapters 6, 8)
- Custom controllers with filtering and aggregation (chapter 7)
- Route-level middleware (chapter 8)
- Full TypeScript (chapter 11)
- Production deployment configuration (chapter 12)

### Data model

| Content type | Kind       | Key fields                                                                                    |
|--------------|------------|-----------------------------------------------------------------------------------------------|
| **Book**     | Collection | `title`, `author` (string), `isbn` (string, unique), `coverUrl` (string), `pageCount` (integer), `genre` (enum), `addedBy` (relation to User) |
| **Reading**  | Collection | `book` (relation to Book), `user` (relation to User), `status` (enum: to_read/reading/finished/abandoned), `startDate` (date), `finishDate` (date), `rating` (integer, 1-5), `notes` (text) |

**Relations:** Book is shared (many users can have the same book). Reading links a User to a Book with personal status
and notes. Each user only sees their own readings.

### Key features to implement

1. **User-scoped queries** - override the Reading controller so `GET /api/readings` automatically filters by the
   authenticated user. Users must never see each other's reading lists.
2. **`is-owner` policy** - only the reading's owner can update or delete it.
3. **`POST /api/readings` auto-links user** - the create action should automatically set `user` to the authenticated
   user, ignoring any `user` value in the request body.
4. **Stats endpoint** - `GET /api/readings/stats` returns the current user's totals: books by status, average rating,
   total pages read (sum of `pageCount` for finished books).
5. **Rate limiting middleware** - protect the API from abuse since it is designed for mobile clients.
6. **Production config** - configure PostgreSQL, environment-based settings, and API tokens for mobile auth.

### Stretch goals

- Add a `Shelf` collection type (e.g., "Summer 2026", "Favorites") so users can organize books into lists
- Implement a "currently reading" endpoint that returns the single book with status `reading` and calculates days since
  `startDate`
- Add an import endpoint that accepts a Goodreads CSV export and creates Book + Reading entries

---

## Tips for all projects

- **Start with the data model.** Get your content types, components, and relations right before writing any custom code.
  Use the admin panel's Content-Type Builder for exploration, then review the generated JSON schemas.
- **Use Postman or Insomnia.** A REST client with saved requests makes testing much faster than curl.
- **Check permissions early.** A 403 response almost always means you forgot to enable the action in Settings > Roles.
- **Read the error messages.** Strapi's error responses include the status code, error name, and often a helpful
  message. Do not ignore them.
- **Commit often.** Use git to checkpoint working states so you can always roll back a bad experiment.
- **Consult the reference docs.** The [Strapi reference pages](/strapi/) in this guide cover advanced patterns for
  every topic - controllers, relations, middleware, plugins, and more.

You have the knowledge. Now go build something.
