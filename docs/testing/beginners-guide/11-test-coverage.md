---
title: "Test Coverage"
sidebar_label: "Test Coverage"
description: Coverage metrics (line, branch, function), configuring Istanbul and JaCoCo, setting thresholds, what good coverage means, and collecting coverage in CI.
slug: /testing/beginners-guide/test-coverage
tags: [testing, beginners, coverage, istanbul, jacoco, ci]
keywords:
  - test coverage
  - code coverage
  - istanbul coverage
  - jacoco
  - coverage thresholds
  - line coverage branch coverage
sidebar_position: 11
---

# Test Coverage

Code coverage tells you how much of your production code is exercised by your test suite. It is one of the most useful — and most misunderstood — metrics in software engineering. This chapter explains what coverage measures, how to configure it for JavaScript (Istanbul/c8) and Java (JaCoCo), and how to use it as a CI quality gate.

## Coverage Metrics

All coverage tools report some combination of the following:

### Line Coverage

The percentage of executable lines hit at least once during a test run. Line coverage is the most intuitive metric and the most commonly cited, but it misses branching logic.

```typescript
function getDiscount(user: User): number {
    if (user.isPremium) {          // line 1 — executed
        return 0.20;               // line 2 — executed (test uses a premium user)
    }
    return 0;                      // line 3 — NOT executed (no test for non-premium)
}
```

Line coverage: 2/3 = 67%. But the non-premium path is never tested.

### Branch Coverage

The percentage of decision branches taken. An `if/else` has two branches; a `switch` with five cases has five. Branch coverage is more thorough than line coverage because it forces tests to exercise both paths of every conditional.

For the function above, branch coverage would flag that the `else` path (line 3) is never reached.

### Function Coverage

The percentage of functions (or methods) that were called at least once. A function with 100% internal line coverage still requires a test to call it.

### Statement Coverage

Similar to line coverage but counts individual statements rather than lines. A one-liner with multiple statements is treated as multiple statements.

### Which Metric to Target?

| Project type | Recommended primary metric |
|---|---|
| Application code | Line + branch coverage |
| Library / utility package | Branch coverage (most thorough) |
| Generated code / data models | Exclude from coverage |
| Legacy code you are adding tests to | Line coverage (achievable) |

## Configuring Istanbul / c8 (JavaScript)

### With Jest

Jest uses Istanbul by default. Configure it in `jest.config.ts`:

```typescript
import type { Config } from 'jest';

const config: Config = {
    collectCoverage: false,  // run with --coverage flag instead
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/**/*.d.ts',
        '!src/**/*.stories.tsx',
        '!src/main.tsx',         // entry point, nothing to test
        '!src/**/index.ts',      // re-export barrel files
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    coverageThresholds: {
        global: {
            lines: 80,
            branches: 75,
            functions: 80,
            statements: 80,
        },
    },
};

export default config;
```

Run with coverage:

```bash
npm run test:coverage
# or
npx jest --coverage
```

Sample output:

```
------------------|---------|----------|---------|---------|
File              | % Stmts | % Branch | % Funcs | % Lines |
------------------|---------|----------|---------|---------|
All files         |   87.50 |    83.33 |   90.00 |   87.50 |
 cart/            |         |          |         |         |
  cart.ts         |   100.0 |    100.0 |   100.0 |   100.0 |
 pricing/         |         |          |         |         |
  pricing.ts      |    75.0 |     66.7 |    80.0 |    75.0 |
  discount.ts     |   100.0 |    100.0 |   100.0 |   100.0 |
------------------|---------|----------|---------|---------|
```

### With Vitest

Vitest uses c8 (V8's built-in coverage) or Istanbul as the provider:

```typescript
// vite.config.ts
export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',       // or 'istanbul'
            reporter: ['text', 'lcov', 'html'],
            include: ['src/**/*.ts', 'src/**/*.tsx'],
            exclude: [
                'src/**/*.stories.tsx',
                'src/**/*.d.ts',
                'src/main.tsx',
            ],
            thresholds: {
                lines: 80,
                branches: 75,
                functions: 80,
                statements: 80,
            },
        },
    },
});
```

Run:

```bash
npx vitest run --coverage
```

The HTML report is written to `coverage/index.html` and shows exactly which lines are covered, which branches are missed, and which files need more testing.

### Per-File Thresholds

Istanbul and c8 support per-file thresholds to enforce stricter coverage on critical files:

```typescript
coverageThresholds: {
    global: {
        lines: 80,
        branches: 75,
    },
    './src/pricing/pricingEngine.ts': {
        lines: 95,
        branches: 90,
    },
},
```

## Configuring JaCoCo (Java)

JaCoCo is the standard Java coverage tool. It integrates with both Maven and Gradle.

### Maven

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.12</version>
    <executions>
        <!-- Prepare agent before tests -->
        <execution>
            <id>prepare-agent</id>
            <goals><goal>prepare-agent</goal></goals>
        </execution>
        <!-- Generate report after tests -->
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals><goal>report</goal></goals>
        </execution>
        <!-- Enforce thresholds -->
        <execution>
            <id>check</id>
            <phase>verify</phase>
            <goals><goal>check</goal></goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>LINE</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum>
                            </limit>
                            <limit>
                                <counter>BRANCH</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.75</minimum>
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

Run tests and generate report:

```bash
mvn verify
```

The HTML report is at `target/site/jacoco/index.html`.

### Gradle

```kotlin
plugins {
    jacoco
}

jacoco {
    toolVersion = "0.8.12"
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required = true    // for CI tools (SonarQube, Codecov)
        html.required = true
    }
}

tasks.jacocoTestCoverageVerification {
    violationRules {
        rule {
            limit {
                counter = "LINE"
                value = "COVEREDRATIO"
                minimum = "0.80".toBigDecimal()
            }
            limit {
                counter = "BRANCH"
                value = "COVEREDRATIO"
                minimum = "0.75".toBigDecimal()
            }
        }
    }
}

tasks.check {
    dependsOn(tasks.jacocoTestCoverageVerification)
}
```

Run:

```bash
./gradlew check
```

### Excluding Classes from JaCoCo

Generated code (Lombok, MapStruct, JAXB), configuration classes, and entry points should be excluded:

```xml
<!-- Maven exclusions in jacoco plugin config -->
<configuration>
    <excludes>
        <exclude>**/generated/**</exclude>
        <exclude>**/*Application.class</exclude>
        <exclude>**/*Config.class</exclude>
        <exclude>**/*Dto.class</exclude>
    </excludes>
</configuration>
```

```kotlin
// Gradle
tasks.jacocoTestReport {
    classDirectories.setFrom(
        files(classDirectories.files.map {
            fileTree(it) {
                exclude(
                    "**/generated/**",
                    "**/*Application.class",
                    "**/*Config.class",
                )
            }
        })
    )
}
```

## Coverage in CI

Coverage checks should run automatically on every pull request and fail the build if thresholds are not met.

### GitHub Actions (Jest/Vitest)

```yaml
# .github/workflows/test.yml
- name: Run tests with coverage
  run: npm run test:coverage

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    token: ${{ secrets.CODECOV_TOKEN }}
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

[Codecov](https://codecov.io/) (free for public repos) posts a coverage summary comment on every PR, showing which lines changed and whether coverage improved or regressed.

### GitHub Actions (Maven / JaCoCo)

```yaml
- name: Run tests with JaCoCo
  run: mvn verify

- name: Upload coverage report
  uses: actions/upload-artifact@v4
  with:
    name: jacoco-report
    path: target/site/jacoco/
```

For pull request coverage comments, the `jacoco-report` action works well:

```yaml
- name: Post JaCoCo coverage comment
  uses: madrapps/jacoco-report@v1.6.1
  with:
    paths: ${{ github.workspace }}/target/site/jacoco/jacoco.xml
    token: ${{ secrets.GITHUB_TOKEN }}
    min-coverage-overall: 80
    min-coverage-changed-files: 75
```

## What Good Coverage Means (and Doesn't Mean)

### What coverage tells you

- Which code paths have been exercised at least once
- Where there are obvious testing gaps (a function or branch no test touches)
- How much "known unknown" risk your codebase carries

### What coverage does not tell you

- Whether the tests are testing the right thing
- Whether the assertions are meaningful
- Whether edge cases within a covered branch are correct

This test achieves 100% line and function coverage and tests nothing useful:

```typescript
it('does not crash', () => {
    const cart = new ShoppingCart();
    cart.addItem('apple', 1, 1.99);
    cart.getTotal(); // no assertion
});
```

Coverage is a floor, not a ceiling. A module at 50% line coverage almost certainly has gaps worth filling. A module at 95% coverage could still have incorrect logic — coverage just means those lines ran.

## Practical Coverage Targets

| Context | Line | Branch | Notes |
|---|---|---|---|
| Core business logic (pricing, payments) | 90–95% | 85–90% | High-risk code deserves thorough testing |
| Service / application layer | 80–85% | 75–80% | Integration tests count here |
| API controllers / handlers | 70–80% | 65–75% | MockMvc / Supertest covers this |
| Configuration / wiring code | Exclude | Exclude | Nothing to assert |
| Generated code (Protobuf, OpenAPI) | Exclude | Exclude | Not your code |
| Legacy code being retro-fitted | Start at current level; improve 5% per sprint | | Never regress |

Set thresholds that fail fast on genuine regressions but do not block progress with impossible targets. A threshold of 80% line coverage is a healthy default for most projects. Increase it for critical modules via per-file rules.

The next and final chapter puts everything together in a practice project.
