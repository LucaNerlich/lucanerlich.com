---
title: "Configuration and Deployment"
sidebar_position: 8
description: "Strapi configuration and deployment: environment config, database setup, server settings, production hardening, Docker, PM2, and cloud deployment."
tags: [strapi, configuration, deployment, docker, production]
---

# Configuration and Deployment

Strapi's configuration system is environment-aware and file-based. Getting it right is the difference between a smooth deployment and hours of debugging.

## Project structure (config files)

```
config/
├── admin.js          # Admin panel settings
├── api.js            # API settings (response format, pagination)
├── database.js       # Database connection
├── middlewares.js     # Global middleware stack
├── plugins.js        # Plugin configuration
└── server.js         # Server host, port, cron
```

All files can be `.js` or `.ts` and receive the `env` helper to read environment variables.

---

## Environment-based configuration

Strapi supports per-environment overrides via `config/env/{environment}/`:

```
config/
├── database.js            # Default (development)
├── server.js
└── env/
    ├── production/
    │   ├── database.js    # Production overrides
    │   ├── server.js
    │   └── plugins.js
    └── staging/
        └── database.js    # Staging overrides
```

The environment is set via `NODE_ENV`:

```bash
NODE_ENV=production node_modules/.bin/strapi start
```

---

## Database configuration

### SQLite (development default)

```js
// config/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'sqlite',
    connection: {
      filename: env('DATABASE_FILENAME', '.tmp/data.db'),
    },
    useNullAsDefault: true,
  },
});
```

### PostgreSQL (recommended for production)

```js
// config/env/production/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT', true),
      },
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 2),
      max: env.int('DATABASE_POOL_MAX', 10),
    },
  },
});
```

### MySQL / MariaDB

```js
// config/env/production/database.js
module.exports = ({ env }) => ({
  connection: {
    client: 'mysql2',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD'),
    },
  },
});
```

---

## Server configuration

```js
// config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'http://localhost:1337'),
  app: {
    keys: env.array('APP_KEYS'),
  },
  // Enable cron jobs
  cron: {
    enabled: true,
  },
});
```

---

## Plugin configuration

```js
// config/plugins.js
module.exports = ({ env }) => ({
  // Email
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', 'smtp.example.com'),
        port: env.int('SMTP_PORT', 587),
        auth: {
          user: env('SMTP_USERNAME'),
          pass: env('SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'noreply@example.com'),
        defaultReplyTo: env('SMTP_REPLY_TO', 'noreply@example.com'),
      },
    },
  },
  // Upload
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_ACCESS_SECRET'),
          },
          region: env('AWS_REGION', 'eu-central-1'),
          params: {
            Bucket: env('AWS_BUCKET'),
          },
        },
      },
    },
  },
  // i18n
  i18n: {
    enabled: true,
  },
});
```

---

## Environment variables (.env)

```bash
# .env (never commit to git!)
HOST=0.0.0.0
PORT=1337
PUBLIC_URL=https://cms.example.com

APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=random-salt-value
ADMIN_JWT_SECRET=random-jwt-secret
TRANSFER_TOKEN_SALT=random-transfer-salt
JWT_SECRET=random-user-jwt-secret

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=secure-password

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=user
SMTP_PASSWORD=pass

AWS_ACCESS_KEY_ID=AKIA...
AWS_ACCESS_SECRET=...
AWS_REGION=eu-central-1
AWS_BUCKET=my-strapi-uploads
```

---

## Docker deployment

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS builder
RUN apk add --no-cache build-base gcc autoconf automake libtool zlib-dev libpng-dev vips-dev

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
ENV NODE_ENV=production
RUN yarn build

# Production stage
FROM node:20-alpine
RUN apk add --no-cache vips-dev

WORKDIR /app
COPY --from=builder /app ./

ENV NODE_ENV=production
EXPOSE 1337

CMD ["yarn", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  strapi:
    build: .
    restart: unless-stopped
    ports:
      - '1337:1337'
    environment:
      NODE_ENV: production
      DATABASE_CLIENT: postgres
      DATABASE_HOST: db
      DATABASE_PORT: 5432
      DATABASE_NAME: strapi
      DATABASE_USERNAME: strapi
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      APP_KEYS: ${APP_KEYS}
      API_TOKEN_SALT: ${API_TOKEN_SALT}
      ADMIN_JWT_SECRET: ${ADMIN_JWT_SECRET}
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - strapi-uploads:/app/public/uploads
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: strapi
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  strapi-uploads:
  postgres-data:
```

---

## PM2 deployment (VPS)

```js
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'strapi',
      cwd: '/srv/strapi',
      script: 'yarn',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,          // Strapi does not support clustering
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};
```

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## Production hardening checklist

| Action | Why |
|--------|-----|
| Set strong, unique `APP_KEYS` | Used for session encryption and cookie signing |
| Use separate `ADMIN_JWT_SECRET` and `JWT_SECRET` | Admin and API auth should have different secrets |
| Enable HTTPS (reverse proxy) | Never serve Strapi directly over HTTP in production |
| Set `PUBLIC_URL` | Required for correct absolute URLs in emails and media |
| Use PostgreSQL or MySQL | SQLite is not suitable for production |
| Configure upload provider | Use S3/Cloudinary instead of local filesystem for scalability |
| Set `NODE_ENV=production` | Disables dev features, enables optimisations |
| Enable rate limiting | Protects admin login and API endpoints |
| Disable GraphQL Playground | Leaks schema information in production |
| Run behind a reverse proxy | Nginx, Caddy, or Traefik for TLS termination and caching |
| Set up backups | Automate database + uploads backups |

---

## Cron jobs

```js
// config/server.js
module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  cron: {
    enabled: true,
    tasks: {
      // Run every day at midnight
      '0 0 * * *': async ({ strapi }) => {
        strapi.log.info('Running daily cleanup...');
        // Delete drafts older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await strapi.db.query('api::article.article').deleteMany({
          where: {
            publishedAt: null,
            createdAt: { $lt: thirtyDaysAgo.toISOString() },
          },
        });
      },
      // Run every hour
      '0 * * * *': async ({ strapi }) => {
        // Refresh external data cache
        await strapi.service('api::external.external').refreshCache();
      },
    },
  },
});
```

---

## Common pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Missing `APP_KEYS` in production | Strapi won't start | Generate 4 random strings |
| SQLite in production | Data corruption under concurrent load | Switch to PostgreSQL |
| No `PUBLIC_URL` | Media URLs point to `localhost` | Set the public-facing URL |
| Committing `.env` to git | Secrets exposed | Add `.env` to `.gitignore` |
| Running as root | Security risk | Use a non-root user in Docker/VPS |
| No health check endpoint | Uptime monitoring is blind | Strapi provides `GET /_health` |

---

## See also

- [Authentication and Permissions](./authentication-and-permissions.md) -- securing the deployed instance
- [File Uploads and Media](./file-uploads-and-media.md) -- configuring upload providers
- [Admin Panel Customization](./admin-panel-customization.md) -- admin server configuration
