---
title: "Integration Testing"
sidebar_label: "Integration Testing"
description: What makes a test an integration test, testing database interactions, testing HTTP endpoints with Supertest and MockMvc, and Docker-based testing with Testcontainers.
slug: /testing/beginners-guide/integration-testing
tags: [testing, beginners, integration, supertest, mockmvc, testcontainers, docker]
keywords:
  - integration testing
  - supertest node
  - mockmvc spring
  - testcontainers
  - testing with docker
  - database integration test
sidebar_position: 6
---

# Integration Testing

Unit tests verify individual pieces in isolation. Integration tests verify that those pieces work correctly together. The word "together" is the key: an integration test deliberately allows some real infrastructure — a database, an HTTP server, a message queue — to participate in the test.

This chapter covers the two most common integration test targets: **database interactions** and **HTTP endpoints**, for both Node.js/TypeScript (using Supertest) and Java/Spring (using MockMvc and Spring Boot Test), plus **Testcontainers** for running real databases in Docker.

## What Qualifies as an Integration Test?

A test is an integration test when:

- It exercises more than one component working together
- It involves infrastructure (real or in-memory) such as a database, file system, or HTTP layer
- Setup and teardown are more involved than constructing a single object

Integration tests are slower than unit tests but catch a class of bugs that unit tests miss:
- SQL queries that are syntactically correct but semantically wrong
- ORM mapping mismatches between your entity and the database schema
- HTTP status codes and response shapes that differ from what the controller claims to return
- Transaction rollback behaviour under error conditions

## Integration Testing in Node.js with Supertest

[Supertest](https://github.com/ladjs/supertest) lets you make real HTTP requests to your Express/Fastify/Koa application without starting a server on a port.

### Setup

```bash
npm install --save-dev supertest @types/supertest
```

### The Application Under Test

```typescript
// src/app.ts
import express from 'express';

export const app = express();
app.use(express.json());

const users: { id: number; name: string; email: string }[] = [];
let nextId = 1;

app.get('/users/:id', (req, res) => {
    const user = users.find(u => u.id === Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
});

app.post('/users', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'name and email are required' });
    }
    const user = { id: nextId++, name, email };
    users.push(user);
    return res.status(201).json(user);
});
```

### Writing the Integration Tests

```typescript
// src/app.test.ts
import request from 'supertest';
import { app } from './app';

describe('User API', () => {

    describe('POST /users', () => {
        it('creates a user and returns 201 with the new resource', async () => {
            const response = await request(app)
                .post('/users')
                .send({ name: 'Alice', email: 'alice@example.com' })
                .expect(201)
                .expect('Content-Type', /json/);

            expect(response.body).toMatchObject({
                id: expect.any(Number),
                name: 'Alice',
                email: 'alice@example.com',
            });
        });

        it('returns 400 when name is missing', async () => {
            const response = await request(app)
                .post('/users')
                .send({ email: 'alice@example.com' })
                .expect(400);

            expect(response.body.error).toBe('name and email are required');
        });

        it('returns 400 when body is empty', async () => {
            await request(app).post('/users').send({}).expect(400);
        });
    });

    describe('GET /users/:id', () => {
        let createdId: number;

        beforeEach(async () => {
            const res = await request(app)
                .post('/users')
                .send({ name: 'Bob', email: 'bob@example.com' });
            createdId = res.body.id;
        });

        it('returns the user when found', async () => {
            const response = await request(app)
                .get(`/users/${createdId}`)
                .expect(200);

            expect(response.body.name).toBe('Bob');
        });

        it('returns 404 for a non-existent user', async () => {
            await request(app).get('/users/99999').expect(404);
        });
    });
});
```

### Adding a Real Database

For real persistence testing, connect to SQLite in-memory (or Postgres via Testcontainers — see below):

```typescript
// src/db.ts
import Database from 'better-sqlite3';

export const db = new Database(':memory:');
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    )
`);
```

```typescript
// src/userRepository.ts
import { db } from './db';

export interface User { id: number; name: string; email: string; }

export function createUser(name: string, email: string): User {
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const result = stmt.run(name, email);
    return { id: result.lastInsertRowid as number, name, email };
}

export function findUserById(id: number): User | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}
```

```typescript
// src/userRepository.test.ts (integration test — hits a real DB)
import { createUser, findUserById } from './userRepository';
import { db } from './db';

describe('UserRepository', () => {
    afterEach(() => {
        db.exec('DELETE FROM users');
    });

    it('persists a user and retrieves it by id', () => {
        const user = createUser('Carol', 'carol@example.com');
        const found = findUserById(user.id);

        expect(found?.name).toBe('Carol');
        expect(found?.email).toBe('carol@example.com');
    });

    it('returns undefined for a missing id', () => {
        expect(findUserById(9999)).toBeUndefined();
    });
});
```

## Integration Testing in Spring Boot with MockMvc

Spring Boot Test provides `@SpringBootTest` to load the full application context and `MockMvc` to make HTTP requests through the web layer without starting a real server.

### Dependencies (Maven)

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

`spring-boot-starter-test` includes JUnit 5, Mockito, AssertJ, MockMvc, and more.

### The Controller Under Test

```java
// src/main/java/com/example/user/UserController.java
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long id) {
        return userService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<UserDto> createUser(@RequestBody @Valid CreateUserRequest request) {
        UserDto created = userService.create(request.getName(), request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
```

### MockMvc Slice Test (@WebMvcTest)

`@WebMvcTest` loads only the web layer (controllers, filters, converters). The service layer is mocked:

```java
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.fasterxml.jackson.databind.ObjectMapper;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @Test
    @DisplayName("GET /users/{id} returns 200 with user JSON when user exists")
    void getUserReturns200() throws Exception {
        UserDto alice = new UserDto(1L, "Alice", "alice@example.com");
        when(userService.findById(1L)).thenReturn(Optional.of(alice));

        mockMvc.perform(get("/users/1")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Alice"))
            .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    @DisplayName("GET /users/{id} returns 404 when user is missing")
    void getUserReturns404() throws Exception {
        when(userService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/users/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /users returns 201 with the created user")
    void createUserReturns201() throws Exception {
        UserDto created = new UserDto(2L, "Bob", "bob@example.com");
        when(userService.create(anyString(), anyString())).thenReturn(created);

        String body = objectMapper.writeValueAsString(
            new CreateUserRequest("Bob", "bob@example.com")
        );

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(2));
    }

    @Test
    @DisplayName("POST /users returns 400 when name is blank")
    void createUserReturns400WhenNameBlank() throws Exception {
        String body = objectMapper.writeValueAsString(
            new CreateUserRequest("", "bob@example.com")
        );

        mockMvc.perform(post("/users")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
            .andExpect(status().isBadRequest());
    }
}
```

### Full Stack with @SpringBootTest

When you need to test the full stack including the repository layer (against a real or in-memory database):

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase  // replaces the configured DataSource with H2 in-memory
class UserIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void createAndRetrieveUser() {
        // Create via API
        ResponseEntity<UserDto> createResponse = restTemplate.postForEntity(
            "/users",
            new CreateUserRequest("Dave", "dave@example.com"),
            UserDto.class
        );
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Long id = createResponse.getBody().getId();

        // Retrieve via API
        ResponseEntity<UserDto> getResponse = restTemplate.getForEntity(
            "/users/" + id,
            UserDto.class
        );
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("Dave");
    }
}
```

## Testcontainers — Real Databases in Docker

In-memory databases (H2, SQLite) are convenient but sometimes behave differently from your production database. Testcontainers starts a real Docker container for each test run:

### Maven

```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <version>1.20.1</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.20.1</version>
    <scope>test</scope>
</dependency>
```

### Using a PostgreSQL Container in JUnit 5

```java
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

@Testcontainers
@SpringBootTest
class UserRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void persistsAndRetrievesUser() {
        User user = userRepository.save(new User(null, "Eve", "eve@example.com"));

        Optional<User> found = userRepository.findById(user.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("eve@example.com");
    }

    @Test
    void findByEmailReturnsCorrectUser() {
        userRepository.save(new User(null, "Frank", "frank@example.com"));

        Optional<User> result = userRepository.findByEmail("frank@example.com");

        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Frank");
    }
}
```

`@Testcontainers` manages the container lifecycle. `@Container` on a `static` field starts the container once for all tests in the class. `@DynamicPropertySource` overrides your application's datasource configuration with the container's dynamic port.

### Testcontainers for Node.js

The Node.js ecosystem also has Testcontainers support:

```bash
npm install --save-dev testcontainers
```

```typescript
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { Pool } from 'pg';

describe('UserRepository (Postgres)', () => {
    let pool: Pool;

    beforeAll(async () => {
        const container = await new PostgreSqlContainer()
            .withDatabase('testdb')
            .start();

        pool = new Pool({ connectionString: container.getConnectionUri() });
        await pool.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE
            )
        `);
    }, 30_000); // allow time for Docker pull

    afterAll(async () => {
        await pool.end();
    });

    it('inserts and retrieves a user', async () => {
        const { rows } = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            ['Grace', 'grace@example.com']
        );
        expect(rows[0].name).toBe('Grace');
    });
});
```

## When to Write Integration Tests

| Scenario | Write an integration test? |
|---|---|
| Simple pure function | No — unit test is enough |
| Service calling a mocked repository | No — unit test with Mockito/jest.fn() |
| Repository writing to and reading from a real DB | Yes |
| HTTP endpoint + serialization + validation + service | Yes (slice test) |
| Full request-response round trip with DB | Yes (@SpringBootTest or Supertest + real DB) |
| External payment API | No — mock at the boundary; contract test separately |

Chapter 7 covers TDD, where you will see how these test types fit into the development workflow.
