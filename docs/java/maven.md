---
title: "Maven: Project Structure, Dependencies, and Profiles"
sidebar_label: "Maven"
sidebar_position: 13
description: "Maven guide: POM structure, dependency management, BOM imports, multi-module projects, profiles, useful plugins, and comparison with Gradle."
tags: [java, maven, build-tools]
---

# Maven: Project Structure, Dependencies, and Profiles

**Apache Maven** is the most widely used build tool in the Java ecosystem. It follows a
convention-over-configuration approach: if you follow the standard directory layout,
Maven knows how to compile, test, package, and deploy your project with minimal
configuration.

## Standard directory layout

```text
my-project/
├── pom.xml                  # Project Object Model (build config)
├── src/
│   ├── main/
│   │   ├── java/            # Application source code
│   │   └── resources/       # Config files, templates, etc.
│   └── test/
│       ├── java/            # Test source code
│       └── resources/       # Test-specific config files
└── target/                  # Build output (generated, not committed)
```

---

## POM basics

Every Maven project is defined by a `pom.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

        <!-- Dependency versions (centralised) -->
        <jackson.version>2.17.0</jackson.version>
        <junit.version>5.11.0</junit.version>
    </properties>

    <dependencies>
        <!-- Compile dependency -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
        </dependency>

        <!-- Test dependency -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

---

## Maven coordinates

Every artifact is identified by three coordinates:

```text
groupId:artifactId:version

com.fasterxml.jackson.core:jackson-databind:2.17.0
```

| Coordinate   | Purpose                | Convention                                          |
|--------------|------------------------|-----------------------------------------------------|
| `groupId`    | Organisation / company | Reverse domain: `com.example`, `org.apache`         |
| `artifactId` | Project name           | Lowercase, hyphenated: `my-app`, `jackson-databind` |
| `version`    | Release version        | SemVer: `1.2.3`, `-SNAPSHOT` for development        |
| `packaging`  | Output format          | `jar` (default), `war`, `pom`, `bundle`             |

---

## Dependency scopes

| Scope               | Compile | Test | Runtime | Packaged | Use case                                    |
|---------------------|---------|------|---------|----------|---------------------------------------------|
| `compile` (default) | Yes     | Yes  | Yes     | Yes      | Most dependencies                           |
| `test`              | No      | Yes  | No      | No       | JUnit, Mockito, AssertJ                     |
| `provided`          | Yes     | Yes  | No      | No       | Servlet API, Lombok (provided by container) |
| `runtime`           | No      | Yes  | Yes     | Yes      | JDBC drivers, SLF4J backends                |
| `system`            | Yes     | Yes  | No      | No       | Local JARs (avoid)                          |
| `import`            | --      | --   | --      | --       | BOM imports (in `<dependencyManagement>`)   |

---

## Dependency management

### Centralise versions with `<dependencyManagement>`

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
            <version>${jackson.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- In child modules or <dependencies>, no version needed: -->
<dependencies>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
        <!-- version inherited from dependencyManagement -->
    </dependency>
</dependencies>
```

### BOM (Bill of Materials) imports

Import a BOM to manage an entire library's versions:

```xml
<dependencyManagement>
    <dependencies>
        <!-- Jackson BOM: manages all Jackson module versions -->
        <dependency>
            <groupId>com.fasterxml.jackson</groupId>
            <artifactId>jackson-bom</artifactId>
            <version>2.17.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>

        <!-- JUnit BOM -->
        <dependency>
            <groupId>org.junit</groupId>
            <artifactId>junit-bom</artifactId>
            <version>5.11.0</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<!-- Now use Jackson / JUnit artifacts without specifying versions -->
<dependencies>
    <dependency>
        <groupId>com.fasterxml.jackson.core</groupId>
        <artifactId>jackson-databind</artifactId>
    </dependency>
    <dependency>
        <groupId>com.fasterxml.jackson.datatype</groupId>
        <artifactId>jackson-datatype-jsr310</artifactId>
    </dependency>
</dependencies>
```

### Excluding transitive dependencies

```xml
<dependency>
    <groupId>org.some.library</groupId>
    <artifactId>some-lib</artifactId>
    <version>1.0</version>
    <exclusions>
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

---

## Multi-module projects

A **parent POM** defines shared configuration; child modules inherit from it.

```text
my-project/
├── pom.xml              # Parent POM (packaging: pom)
├── core/
│   └── pom.xml          # Core module
├── api/
│   └── pom.xml          # API module (depends on core)
└── web/
    └── pom.xml          # Web module (depends on api)
```

### Parent POM

```xml
<project>
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>core</module>
        <module>api</module>
        <module>web</module>
    </modules>

    <properties>
        <java.version>21</java.version>
        <!-- shared properties -->
    </properties>

    <dependencyManagement>
        <!-- centralised versions for all modules -->
    </dependencyManagement>

    <build>
        <pluginManagement>
            <!-- centralised plugin versions -->
        </pluginManagement>
    </build>
</project>
```

### Child module

```xml
<project>
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.example</groupId>
        <artifactId>my-project</artifactId>
        <version>1.0.0-SNAPSHOT</version>
    </parent>

    <artifactId>core</artifactId>

    <dependencies>
        <!-- version inherited from parent's dependencyManagement -->
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
    </dependencies>
</project>
```

### Inter-module dependencies

```xml
<!-- api/pom.xml depends on core -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>core</artifactId>
    <version>${project.version}</version>
</dependency>
```

The **reactor** builds modules in dependency order automatically:

```bash
mvn clean install   # builds core → api → web
```

---

## Profiles

Profiles let you customise the build for different environments:

```xml
<profiles>
    <!-- Activated by default -->
    <profile>
        <id>dev</id>
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
        <properties>
            <db.url>jdbc:h2:mem:devdb</db.url>
        </properties>
    </profile>

    <!-- Activated explicitly: mvn package -P prod -->
    <profile>
        <id>prod</id>
        <properties>
            <db.url>jdbc:postgresql://prod-db:5432/myapp</db.url>
        </properties>
    </profile>

    <!-- Activated by JDK version -->
    <profile>
        <id>java21</id>
        <activation>
            <jdk>21</jdk>
        </activation>
        <dependencies>
            <!-- Java 21-specific dependencies -->
        </dependencies>
    </profile>

    <!-- Activated by OS -->
    <profile>
        <id>mac</id>
        <activation>
            <os><family>mac</family></os>
        </activation>
    </profile>
</profiles>
```

```bash
mvn package -P prod        # activate prod profile
mvn package -P prod,staging # multiple profiles
mvn help:active-profiles    # see which profiles are active
```

---

## Useful plugins

### Compiler plugin

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.13.0</version>
    <configuration>
        <release>${java.version}</release>
        <parameters>true</parameters> <!-- for Jackson, Spring parameter names -->
    </configuration>
</plugin>
```

### Surefire (unit tests)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.3.0</version>
    <configuration>
        <includes>
            <include>**/*Test.java</include>
            <include>**/*Tests.java</include>
        </includes>
    </configuration>
</plugin>
```

### Failsafe (integration tests)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-failsafe-plugin</artifactId>
    <version>3.3.0</version>
    <executions>
        <execution>
            <goals>
                <goal>integration-test</goal>
                <goal>verify</goal>
            </goals>
        </execution>
    </executions>
</plugin>
<!-- Integration tests follow the pattern *IT.java or *IntegrationTest.java -->
```

### Shade (fat JAR)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.6.0</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals><goal>shade</goal></goals>
            <configuration>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>com.example.Main</mainClass>
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
</plugin>
```

### Enforcer (project rules)

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-enforcer-plugin</artifactId>
    <version>3.5.0</version>
    <executions>
        <execution>
            <id>enforce</id>
            <goals><goal>enforce</goal></goals>
            <configuration>
                <rules>
                    <requireMavenVersion>
                        <version>[3.9.0,)</version>
                    </requireMavenVersion>
                    <requireJavaVersion>
                        <version>[21,)</version>
                    </requireJavaVersion>
                    <banDuplicateClasses/>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

---

## Common Maven commands

| Command                                   | Purpose                                               |
|-------------------------------------------|-------------------------------------------------------|
| `mvn clean`                               | Delete `target/`                                      |
| `mvn compile`                             | Compile main sources                                  |
| `mvn test`                                | Run unit tests                                        |
| `mvn package`                             | Compile + test + package (JAR/WAR)                    |
| `mvn install`                             | Package + install to local `.m2` repository           |
| `mvn dependency:tree`                     | Print dependency tree                                 |
| `mvn dependency:analyze`                  | Find unused / undeclared dependencies                 |
| `mvn versions:display-dependency-updates` | Show available dependency updates                     |
| `mvn help:effective-pom`                  | Show the fully resolved POM (all inheritance applied) |

---

## Maven vs Gradle

| Aspect               | Maven                               | Gradle                                 |
|----------------------|-------------------------------------|----------------------------------------|
| **Configuration**    | XML (`pom.xml`)                     | Groovy/Kotlin DSL (`build.gradle.kts`) |
| **Convention**       | Strong (standard layout)            | Flexible (but more setup)              |
| **Build speed**      | Moderate                            | Faster (incremental, daemon)           |
| **Learning curve**   | Lower (well-documented conventions) | Higher (DSL, scripting)                |
| **Plugin ecosystem** | Very large                          | Large (growing)                        |
| **IDE support**      | Excellent (IntelliJ, Eclipse)       | Excellent (IntelliJ, VS Code)          |
| **Multi-module**     | Reactor, parent POMs                | Composite builds, included builds      |
| **Popular in**       | Enterprise Java, AEM                | Android, Spring Boot, Kotlin           |

> Both are excellent. Maven is the safer choice for enterprise Java projects.
> Gradle is faster and more flexible, especially for large builds and Android.

---

## Common pitfalls

| Pitfall                             | Problem                                     | Fix                                               |
|-------------------------------------|---------------------------------------------|---------------------------------------------------|
| Hardcoded versions everywhere       | Inconsistent versions across modules        | Use `<properties>` and `<dependencyManagement>`   |
| Missing `<scope>test</scope>`       | Test libraries leak into production JAR     | Always set scope for JUnit, Mockito, etc.         |
| `mvn install` for local development | Unnecessary (IDE resolves modules directly) | Use `mvn verify` unless you need the JAR in `.m2` |
| Relying on transitive dependencies  | Build breaks when upstream changes          | Declare every dependency you use directly         |
| SNAPSHOT versions in releases       | Unpredictable builds                        | Use release versions for production artifacts     |
| Circular module dependencies        | Build fails                                 | Restructure to break the cycle                    |
| Not using `.mvn/maven.config`       | Every developer uses different flags        | Add common flags: `--fail-at-end --threads 1C`    |

---

## See also

- [Testing](./testing.md) -- Surefire/Failsafe integration
- [Logging](./logging.md) -- logging dependencies and exclusions
- [Dependency Injection](./dependency-injection.md) -- modular project structure
- [JSON Processing](./json-processing.md) -- Jackson dependency management
