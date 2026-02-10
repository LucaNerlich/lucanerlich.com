---
title: "Authentication & Permissions"
sidebar_label: "Authentication & Permissions"
description: The Users & Permissions plugin, JWT authentication, user registration, roles, API tokens, and controlling access to your Strapi API.
slug: /strapi/beginners-guide/authentication-and-permissions
tags: [strapi, beginners]
keywords:
  - strapi authentication
  - strapi jwt
  - strapi roles permissions
  - strapi api tokens
  - strapi user registration
sidebar_position: 6
---

# Authentication & Permissions

A public-read API is fine for a blog, but most applications need to control who can create, update, and delete content. Strapi ships with the **Users & Permissions** plugin -- a complete auth system built in.

## How authentication works in Strapi

```mermaid
sequenceDiagram
    participant Client
    participant Strapi
    participant DB["Database"]

    Client->>Strapi: POST /api/auth/local (email + password)
    Strapi->>DB: Verify credentials
    DB-->>Strapi: User record
    Strapi-->>Client: JWT token + user data

    Client->>Strapi: GET /api/posts (Authorization: Bearer JWT)
    Strapi->>Strapi: Verify JWT, resolve role
    Strapi->>DB: Query with role permissions
    DB-->>Strapi: Results
    Strapi-->>Client: Filtered response
```

The flow:

1. The client sends credentials (email + password) to the **auth endpoint**
2. Strapi verifies them and returns a **JWT** (JSON Web Token)
3. The client includes the JWT in subsequent requests via the `Authorization` header
4. Strapi decodes the JWT, identifies the user and their **role**, and enforces **permissions**

## Two types of users

Strapi has two completely separate user systems:

| Type | Purpose | Table | Auth |
|------|---------|-------|------|
| **Admin users** | Access the admin panel | `admin_users` | Admin JWT |
| **API users** | Access the REST/GraphQL API | `up_users` | Users & Permissions JWT |

Admin users are managed in Settings > Administration. API users are managed via the Users & Permissions plugin. They do not share accounts, tokens, or permissions.

This chapter focuses on **API users**.

## User registration

### Enable registration

By default, user registration is enabled. You can configure it in **Settings** > **Users & Permissions** > **Advanced settings**:

- **Enable sign-ups** -- toggle registration on/off
- **Default role for new users** -- which role new users get (default: `Authenticated`)
- **One account per email** -- prevent duplicate accounts
- **Enable email confirmation** -- require email verification before login

### Register a user

```bash
curl -X POST http://localhost:1337/api/auth/local/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Response:

```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "documentId": "user123",
    "username": "johndoe",
    "email": "john@example.com",
    "provider": "local",
    "confirmed": true,
    "blocked": false,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z"
  }
}
```

The response includes the JWT immediately -- the user is logged in upon registration.

## Login

```bash
curl -X POST http://localhost:1337/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "SecurePass123!"
  }'
```

The `identifier` field accepts either a username or email.

Response format is identical to registration: `{ jwt, user }`.

## Using the JWT

Include the JWT in the `Authorization` header for authenticated requests:

```bash
# Create a post (requires Authenticated role with create permission)
curl -X POST http://localhost:1337/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "data": {
      "title": "My Authenticated Post",
      "slug": "my-authenticated-post"
    }
  }'
```

If the token is missing or invalid, Strapi returns a `401 Unauthorized` error. If the user's role lacks the required permission, it returns `403 Forbidden`.

## JWT configuration

The JWT secret and expiration are configured via environment variables:

```bash
# .env
JWT_SECRET=your-secret-key-here
```

The default token expiration is **30 days**. You can change it in `config/plugins.ts`:

```javascript
// config/plugins.ts
module.exports = ({ env }) => ({
  "users-permissions": {
    config: {
      jwt: {
        expiresIn: "7d", // 7 days
      },
    },
  },
});
```

> **Security note:** Use a strong, random JWT secret in production. Never commit it to version control -- use environment variables.

## Roles and permissions

Strapi ships with two default roles:

| Role | Description |
|------|-------------|
| **Public** | Unauthenticated requests (no JWT) |
| **Authenticated** | Logged-in users (valid JWT) |

### Configuring permissions

1. Go to **Settings** > **Roles** (under Users & Permissions)
2. Click a role (e.g., **Authenticated**)
3. For each content type, toggle the allowed actions:

| Action | HTTP method | Description |
|--------|-------------|-------------|
| **find** | `GET /api/posts` | List entries |
| **findOne** | `GET /api/posts/:id` | Get single entry |
| **create** | `POST /api/posts` | Create entry |
| **update** | `PUT /api/posts/:id` | Update entry |
| **delete** | `DELETE /api/posts/:id` | Delete entry |

4. Click **Save**

### Example permission setup for a blog

| Content type | Public | Authenticated |
|-------------|--------|---------------|
| **Post** | find, findOne | find, findOne, create |
| **Author** | find, findOne | find, findOne |
| **Category** | find, findOne | find, findOne |
| **Tag** | find, findOne | find, findOne |
| **Site Settings** | find | find |
| **User** | -- | find (me) |

This setup allows:

- Anyone can **read** posts, authors, categories, and tags
- Only logged-in users can **create** posts
- Only admins (via the admin panel) can **update** and **delete**

### Creating custom roles

You can create additional roles for finer-grained access:

1. Go to **Settings** > **Roles**
2. Click **Add new role**
3. Name it (e.g., **Editor**, **Moderator**, **Premium User**)
4. Configure permissions for each content type
5. Click **Save**

Example custom roles:

| Role | Permissions |
|------|-------------|
| **Editor** | CRUD on posts, read on everything else |
| **Moderator** | Update and delete on posts, read on everything |
| **Premium User** | Read on premium content (custom content type) |

### Assigning roles to users

In the admin panel:

1. Go to **Content Manager** > **User** (under Users & Permissions)
2. Click a user
3. Change their **Role** in the sidebar
4. Click **Save**

## API tokens

API tokens are an alternative to JWT for server-to-server communication. They are created in the admin panel and do not require user authentication.

### Creating an API token

1. Go to **Settings** > **API Tokens**
2. Click **Create new API Token**
3. Configure:

| Field | Description |
|-------|-------------|
| **Name** | A descriptive name (e.g., "Frontend build", "CI/CD") |
| **Description** | What the token is used for |
| **Token duration** | Unlimited, 7 days, 30 days, 90 days |
| **Token type** | Read-only, Full access, or Custom |

4. For **Custom** type, configure permissions per content type (like roles)
5. Click **Save** -- the token is displayed **once**. Copy it immediately.

### Using API tokens

```bash
curl http://localhost:1337/api/posts \
  -H "Authorization: Bearer your-api-token-here"
```

API tokens use the same `Authorization: Bearer` header as JWTs. Strapi distinguishes them internally.

### Token types

| Type | Use case |
|------|----------|
| **Read-only** | Static site builds, public frontends |
| **Full access** | CI/CD pipelines, admin scripts (use carefully) |
| **Custom** | Fine-grained control per content type |

> **Security best practice:** Prefer custom tokens with the minimum necessary permissions. Full-access tokens are powerful and should be limited to trusted server environments.

## Getting the current user

Authenticated users can fetch their own profile:

```bash
curl http://localhost:1337/api/users/me \
  -H "Authorization: Bearer YOUR_JWT"
```

Response:

```json
{
  "id": 1,
  "documentId": "user123",
  "username": "johndoe",
  "email": "john@example.com",
  "provider": "local",
  "confirmed": true,
  "blocked": false,
  "role": {
    "id": 1,
    "name": "Authenticated",
    "description": "Default role given to authenticated user.",
    "type": "authenticated"
  }
}
```

### Updating the current user

```bash
curl -X PUT http://localhost:1337/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "username": "john_updated"
  }'
```

## Password management

### Change password

Users can change their password:

```bash
curl -X POST http://localhost:1337/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{
    "currentPassword": "OldPass123!",
    "password": "NewPass456!",
    "passwordConfirmation": "NewPass456!"
  }'
```

### Forgot password

The forgot password flow sends a reset email:

```bash
# Step 1: Request a password reset
curl -X POST http://localhost:1337/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Step 2: Reset with the token from the email
curl -X POST http://localhost:1337/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "code": "resetCodeFromEmail",
    "password": "NewPass789!",
    "passwordConfirmation": "NewPass789!"
  }'
```

> **Note:** Email sending must be configured for forgot password to work. By default, Strapi uses `sendmail`. For production, configure an email provider (e.g., SendGrid, Mailgun) in `config/plugins.ts`.

## Blocking users

Admins can block users to prevent them from authenticating:

1. Go to **Content Manager** > **User**
2. Click the user
3. Toggle **Blocked** to `true`
4. Click **Save**

Blocked users receive a `401 Unauthorized` response when trying to log in.

## Permission flow diagram

```mermaid
flowchart TD
    Request["Incoming Request"]
    HasJWT{"Has JWT?"}
    ValidJWT{"Valid JWT?"}
    HasToken{"Has API Token?"}
    ValidToken{"Valid Token?"}
    PublicRole["Public Role"]
    UserRole["User's Role"]
    TokenPerms["Token Permissions"]
    CheckPerm{"Has Permission?"}
    Allow["200 OK"]
    Deny401["401 Unauthorized"]
    Deny403["403 Forbidden"]

    Request --> HasJWT
    HasJWT -->|Yes| ValidJWT
    HasJWT -->|No| HasToken
    ValidJWT -->|Yes| UserRole
    ValidJWT -->|No| Deny401
    HasToken -->|Yes| ValidToken
    HasToken -->|No| PublicRole
    ValidToken -->|Yes| TokenPerms
    ValidToken -->|No| Deny401
    UserRole --> CheckPerm
    TokenPerms --> CheckPerm
    PublicRole --> CheckPerm
    CheckPerm -->|Yes| Allow
    CheckPerm -->|No| Deny403
```

## Security best practices

1. **Use strong JWT secrets** -- generate a random 256-bit key
2. **Set token expiration** -- do not use unlimited duration in production
3. **Use HTTPS** -- JWTs are base64-encoded, not encrypted. Without HTTPS they can be intercepted
4. **Limit the Public role** -- only grant read access to content that should genuinely be public
5. **Use custom API token types** -- avoid full-access tokens when read-only will do
6. **Block inactive users** -- rather than deleting them
7. **Rotate API tokens** -- set expiration dates and rotate regularly
8. **Do not store JWTs in localStorage** -- if building a frontend, prefer HTTP-only cookies or in-memory storage

> For advanced authentication patterns (SSO, social providers, custom providers), see the [Authentication and Permissions](/strapi/authentication-and-permissions) reference.

## Summary

You learned:

- How **JWT authentication** works in Strapi
- The difference between **admin users** and **API users**
- How to **register**, **log in**, and use JWTs
- How **roles and permissions** control access per content type
- How to create and use **API tokens** for server-to-server communication
- **Password management** (change password, forgot password)
- Security **best practices** for production

Your API is now secured. Public users can read content, authenticated users can create posts, and admins manage everything. In the next chapter we will go deeper -- customizing Strapi's built-in controllers and services.

Next up: [Custom Controllers & Services](./07-custom-controllers-and-services.md) -- extending Strapi's default CRUD, adding business logic in services, and building custom actions.
