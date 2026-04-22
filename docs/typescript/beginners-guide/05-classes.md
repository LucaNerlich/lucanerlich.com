---
title: "Classes"
sidebar_label: "Classes"
description: TypeScript class syntax, access modifiers, readonly, constructors, inheritance, abstract classes, and implementing interfaces.
slug: /typescript/beginners-guide/classes
tags: [typescript, beginners]
keywords:
  - typescript classes
  - access modifiers
  - public private protected
  - abstract class
  - typescript inheritance
  - implements interface
sidebar_position: 5
---

# Classes

TypeScript builds on JavaScript's ES2015 class syntax and adds a full suite of access modifiers, readonly properties,
abstract classes, and compile-time checks that make object-oriented code significantly safer. If you are coming from
Java or C#, much of this will feel familiar - with some important differences.

## Basic class syntax

```typescript
class BankAccount {
    balance: number;
    owner: string;

    constructor(owner: string, initialBalance: number) {
        this.owner = owner;
        this.balance = initialBalance;
    }

    deposit(amount: number): void {
        if (amount <= 0) throw new Error("Amount must be positive");
        this.balance += amount;
    }

    withdraw(amount: number): void {
        if (amount > this.balance) throw new Error("Insufficient funds");
        this.balance -= amount;
    }

    getStatement(): string {
        return `${this.owner}: $${this.balance.toFixed(2)}`;
    }
}

const account = new BankAccount("Alice", 1000);
account.deposit(500);
account.withdraw(200);
console.log(account.getStatement()); // Alice: $1300.00
```

## Access modifiers

TypeScript adds three access modifiers that control where a class member can be accessed:

| Modifier    | Accessible from                                      |
|-------------|------------------------------------------------------|
| `public`    | Anywhere (the default - you rarely write it explicitly) |
| `private`   | Only within the class body                           |
| `protected` | Within the class body and all subclasses             |

```typescript
class Employee {
    public name: string;         // accessible everywhere
    protected department: string; // accessible in this class and subclasses
    private salary: number;      // accessible only in this class

    constructor(name: string, department: string, salary: number) {
        this.name = name;
        this.department = department;
        this.salary = salary;
    }

    public getInfo(): string {
        return `${this.name} (${this.department})`;
    }

    protected getSalaryBand(): string {
        if (this.salary < 50000) return "junior";
        if (this.salary < 100000) return "mid";
        return "senior";
    }

    private formatSalary(): string {
        return `$${this.salary.toLocaleString()}`;
    }
}

const emp = new Employee("Alice", "Engineering", 95000);
console.log(emp.name);              // OK
console.log(emp.getInfo());         // OK
// console.log(emp.salary);         // Error: Property 'salary' is private
// console.log(emp.department);     // Error: Property 'department' is protected
```

> **Important:** TypeScript's access modifiers are compile-time only. The compiled JavaScript has no concept of
> `private` or `protected` - the properties are still accessible at runtime. For true private fields, use the
> JavaScript `#` syntax (ECMAScript private fields), which does enforce privacy at runtime.

### ECMAScript private fields vs TypeScript private

```typescript
class SecureAccount {
    #pin: number;              // True runtime privacy (ECMAScript)
    private balance: number;   // Compile-time only privacy (TypeScript)

    constructor(pin: number, balance: number) {
        this.#pin = pin;
        this.balance = balance;
    }

    validate(input: number): boolean {
        return this.#pin === input;
    }
}

const acc = new SecureAccount(1234, 500);
// acc.#pin;      // SyntaxError at runtime (true private)
// acc.balance;   // TypeScript error only (accessible at runtime via JS)
```

## Constructor shorthand

Instead of declaring properties and assigning them in the constructor separately, use parameter properties:

```typescript
// Verbose version
class Product {
    public name: string;
    private price: number;
    protected category: string;
    public readonly sku: string;

    constructor(name: string, price: number, category: string, sku: string) {
        this.name = name;
        this.price = price;
        this.category = category;
        this.sku = sku;
    }
}

// Shorthand -- equivalent, much less boilerplate
class Product {
    constructor(
        public name: string,
        private price: number,
        protected category: string,
        public readonly sku: string,
    ) {}

    getPrice(): number {
        return this.price;
    }
}
```

This is idiomatic TypeScript. The modifier in the constructor parameter declaration creates and assigns the property
automatically.

## Readonly properties

`readonly` on a class property means it can only be assigned in the constructor:

```typescript
class Circle {
    public readonly radius: number;
    public readonly area: number;

    constructor(radius: number) {
        this.radius = radius;
        this.area = Math.PI * radius * radius;
    }
}

const c = new Circle(5);
console.log(c.radius); // 5
console.log(c.area);   // 78.539...
// c.radius = 10;       // Error: Cannot assign to 'radius' because it is a read-only property
```

## Getters and setters

Getters and setters allow computed or validated property access:

```typescript
class Temperature {
    private _celsius: number;

    constructor(celsius: number) {
        this._celsius = celsius;
    }

    get celsius(): number {
        return this._celsius;
    }

    set celsius(value: number) {
        if (value < -273.15) {
            throw new RangeError("Temperature below absolute zero");
        }
        this._celsius = value;
    }

    get fahrenheit(): number {
        return (this._celsius * 9) / 5 + 32;
    }

    set fahrenheit(value: number) {
        this.celsius = ((value - 32) * 5) / 9;
    }

    get kelvin(): number {
        return this._celsius + 273.15;
    }
}

const temp = new Temperature(100);
console.log(temp.fahrenheit); // 212
temp.fahrenheit = 32;
console.log(temp.celsius);    // 0
```

## Static members

Static properties and methods belong to the class itself, not to instances:

```typescript
class IdGenerator {
    private static counter = 0;

    static generate(): string {
        IdGenerator.counter++;
        return `id-${IdGenerator.counter.toString().padStart(6, "0")}`;
    }

    static reset(): void {
        IdGenerator.counter = 0;
    }
}

console.log(IdGenerator.generate()); // id-000001
console.log(IdGenerator.generate()); // id-000002
IdGenerator.reset();
console.log(IdGenerator.generate()); // id-000001
```

A practical static factory pattern:

```typescript
class Config {
    private static instance: Config | null = null;
    private readonly settings: Map<string, string>;

    private constructor() {
        this.settings = new Map();
    }

    static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();
        }
        return Config.instance;
    }

    set(key: string, value: string): void {
        this.settings.set(key, value);
    }

    get(key: string): string | undefined {
        return this.settings.get(key);
    }
}

// Singleton pattern: always the same instance
const config = Config.getInstance();
config.set("theme", "dark");
```

## Inheritance

Classes extend other classes with `extends`:

```typescript
class Animal {
    constructor(
        public readonly name: string,
        protected sound: string,
    ) {}

    speak(): string {
        return `${this.name} says "${this.sound}"`;
    }

    describe(): string {
        return `I am ${this.name}`;
    }
}

class Dog extends Animal {
    constructor(
        name: string,
        private breed: string,
    ) {
        super(name, "woof"); // must call super() before accessing this
    }

    fetch(item: string): string {
        return `${this.name} fetches the ${item}!`;
    }

    override describe(): string {
        return `${super.describe()}, a ${this.breed}`;
    }
}

class Cat extends Animal {
    constructor(name: string, private indoor: boolean) {
        super(name, "meow");
    }

    override describe(): string {
        const type = this.indoor ? "indoor" : "outdoor";
        return `${super.describe()}, an ${type} cat`;
    }
}

const dog = new Dog("Rex", "German Shepherd");
const cat = new Cat("Whiskers", true);

console.log(dog.speak());    // Rex says "woof"
console.log(dog.fetch("ball")); // Rex fetches the ball!
console.log(cat.describe()); // I am Whiskers, an indoor cat
```

> **Use the `override` keyword** (TypeScript 4.3+) when overriding a parent method. If you typo the method name,
> TypeScript will catch it: `override speek()` would be an error because `speek` does not exist in the parent.

### Method resolution

When a subclass overrides a method, the most derived version is called:

```typescript
const animals: Animal[] = [dog, cat];
animals.forEach(a => console.log(a.speak())); // Polymorphism works as expected
```

## Implementing interfaces

A class can implement one or more interfaces with `implements`. This guarantees the class has all required members:

```typescript
interface Serializable {
    serialize(): string;
    deserialize(data: string): void;
}

interface Validatable {
    validate(): boolean;
    getErrors(): string[];
}

class UserForm implements Serializable, Validatable {
    private errors: string[] = [];

    constructor(
        public name: string,
        public email: string,
        public age: number,
    ) {}

    validate(): boolean {
        this.errors = [];

        if (this.name.trim().length < 2) {
            this.errors.push("Name must be at least 2 characters");
        }

        if (!/^[^@]+@[^@]+\.[^@]+$/.test(this.email)) {
            this.errors.push("Invalid email address");
        }

        if (this.age < 18 || this.age > 120) {
            this.errors.push("Age must be between 18 and 120");
        }

        return this.errors.length === 0;
    }

    getErrors(): string[] {
        return [...this.errors];
    }

    serialize(): string {
        return JSON.stringify({ name: this.name, email: this.email, age: this.age });
    }

    deserialize(data: string): void {
        const parsed = JSON.parse(data);
        this.name = parsed.name;
        this.email = parsed.email;
        this.age = parsed.age;
    }
}

const form = new UserForm("Alice", "alice@example.com", 30);
if (form.validate()) {
    console.log(form.serialize());
} else {
    console.error(form.getErrors());
}
```

## Abstract classes

Abstract classes cannot be instantiated directly - they exist to be extended. They can contain abstract method
declarations (which must be implemented by subclasses) and concrete implementations:

```typescript
abstract class Shape {
    abstract area(): number;
    abstract perimeter(): number;

    // Concrete method shared by all shapes
    describe(): string {
        return `Area: ${this.area().toFixed(2)}, Perimeter: ${this.perimeter().toFixed(2)}`;
    }

    isLargerThan(other: Shape): boolean {
        return this.area() > other.area();
    }
}

class Circle extends Shape {
    constructor(private radius: number) {
        super();
    }

    override area(): number {
        return Math.PI * this.radius ** 2;
    }

    override perimeter(): number {
        return 2 * Math.PI * this.radius;
    }
}

class Rectangle extends Shape {
    constructor(
        private width: number,
        private height: number,
    ) {
        super();
    }

    override area(): number {
        return this.width * this.height;
    }

    override perimeter(): number {
        return 2 * (this.width + this.height);
    }
}

// const shape = new Shape(); // Error: Cannot create an instance of an abstract class

const shapes: Shape[] = [new Circle(5), new Rectangle(4, 6)];
shapes.forEach(s => console.log(s.describe()));
```

### Abstract vs interface: when to use which

| Aspect                | Abstract class                              | Interface                              |
|-----------------------|---------------------------------------------|----------------------------------------|
| Concrete methods      | Yes - can implement shared logic           | No - only method signatures           |
| State (properties)    | Yes - can hold state with access modifiers | No - only property declarations       |
| Multiple inheritance  | No - a class can extend only one           | Yes - a class can implement many      |
| Constructor logic     | Yes - can have constructor code            | No - no constructors                  |
| Best for              | Shared implementation in a hierarchy        | Contracts / capabilities / duck typing |

## Putting it together: a repository pattern

```typescript
interface Repository<T, ID> {
    findById(id: ID): Promise<T | null>;
    findAll(): Promise<T[]>;
    save(entity: T): Promise<T>;
    delete(id: ID): Promise<void>;
}

interface User {
    id: number;
    name: string;
    email: string;
}

abstract class BaseRepository<T extends { id: number }> implements Repository<T, number> {
    protected items = new Map<number, T>();

    async findById(id: number): Promise<T | null> {
        return this.items.get(id) ?? null;
    }

    async findAll(): Promise<T[]> {
        return Array.from(this.items.values());
    }

    async delete(id: number): Promise<void> {
        this.items.delete(id);
    }

    abstract save(entity: T): Promise<T>;
}

class UserRepository extends BaseRepository<User> {
    private nextId = 1;

    override async save(user: User): Promise<User> {
        const toSave = user.id ? user : { ...user, id: this.nextId++ };
        this.items.set(toSave.id, toSave);
        return toSave;
    }

    async findByEmail(email: string): Promise<User | null> {
        for (const user of this.items.values()) {
            if (user.email === email) return user;
        }
        return null;
    }
}

const repo = new UserRepository();
const alice = await repo.save({ id: 0, name: "Alice", email: "alice@example.com" });
const found = await repo.findByEmail("alice@example.com");
console.log(found?.name); // Alice
```

## Summary

- TypeScript classes build on ES2015 class syntax with access modifiers, readonly, and abstract members
- `public` (default), `private`, and `protected` control member visibility at compile time
- **Constructor shorthand** (`constructor(public name: string)`) declares and assigns in one step
- `readonly` properties can only be set in the constructor
- **Getters and setters** allow computed or validated property access
- **Static members** belong to the class, not instances - useful for factories and singletons
- `extends` creates a subclass; call `super()` in the constructor and `super.method()` to access parent methods
- Use the `override` keyword when overriding parent methods for compile-time safety
- `implements` enforces that a class satisfies one or more interfaces
- **Abstract classes** cannot be instantiated; they provide shared logic while requiring subclasses to implement specific methods

Next up: [Generics](./06-generics.md) - generic functions, interfaces, classes, constraints with `extends`, default
type parameters, and `keyof` / `typeof`.
