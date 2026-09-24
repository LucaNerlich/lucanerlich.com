---
title: "Classes & Prototypes"
sidebar_label: "Classes & Prototypes"
description: Learn JavaScript classes, constructors, methods, fields, private members, inheritance, prototypes, and common class pitfalls.
slug: /javascript/beginners-guide/classes
tags: [javascript, beginners, classes, prototypes]
keywords:
  - javascript classes
  - javascript prototypes
  - private fields
  - class inheritance
  - instanceof
sidebar_position: 16
---

# Classes & Prototypes

A **class** is a template for creating objects that share the same behavior. It gives JavaScript a cleaner syntax for
constructors, methods, inheritance, and private state.

Classes are built on top of JavaScript's prototype system. They do not replace prototypes - they make prototypes easier
to work with.

## Basic class syntax

```js
class User {
    constructor(name, role) {
        this.name = name;
        this.role = role;
    }

    describe() {
        return `${this.name} is a ${this.role}`;
    }
}

const ada = new User("Ada", "developer");

console.log(ada.name);
console.log(ada.describe());
```

Result:

```text
Ada
Ada is a developer
```

Use `new` to create an instance. The `constructor` method runs automatically and initializes the new object.

## Constructors

The constructor is where you set up instance data:

```js
class ShoppingCart {
    constructor(owner) {
        this.owner = owner;
        this.items = [];
    }

    addItem(name, price) {
        this.items.push({ name, price });
    }

    total() {
        return this.items.reduce((sum, item) => sum + item.price, 0);
    }
}

const cart = new ShoppingCart("Ada");
cart.addItem("Book", 20);
cart.addItem("Pen", 3);

console.log(cart.owner);
console.log(cart.total());
```

Result:

```text
Ada
23
```

If you do not write a constructor, JavaScript provides an empty one for you.

## Methods

Methods written inside the class body are shared by all instances:

```js
class Counter {
    constructor() {
        this.value = 0;
    }

    increment() {
        this.value += 1;
        return this.value;
    }

    reset() {
        this.value = 0;
    }
}

const counter = new Counter();

console.log(counter.increment());
console.log(counter.increment());
counter.reset();
console.log(counter.value);
```

Result:

```text
1
2
0
```

Methods usually use `this` to read or change the current instance. If you need a refresher on `this`, see the
[Objects chapter](./06-objects.md).

## Public fields

Public fields are properties declared directly in the class body:

```js
class Task {
    completed = false;

    constructor(title) {
        this.title = title;
    }

    complete() {
        this.completed = true;
    }
}

const task = new Task("Write documentation");

console.log(task.completed);
task.complete();
console.log(task.completed);
```

Result:

```text
false
true
```

Public fields are created on each instance. They are useful for defaults, but do not put shared methods in fields unless
you need a special behavior such as binding `this`.

## Private fields and methods

Private class members start with `#`. They can only be accessed inside the class that declares them:

```js
class BankAccount {
    #balance = 0;

    constructor(owner) {
        this.owner = owner;
    }

    #formatBalance() {
        return `${this.owner}: ${this.#balance}`;
    }

    deposit(amount) {
        if (amount <= 0) {
            throw new RangeError("Deposit must be positive");
        }
        this.#balance += amount;
    }

    getStatement() {
        return this.#formatBalance();
    }

    static hasAccountState(value) {
        return #balance in value;
    }
}

const account = new BankAccount("Ada");
account.deposit(50);

console.log(account.getStatement());
console.log(BankAccount.hasAccountState(account));
console.log(BankAccount.hasAccountState({ owner: "Ada" }));
```

Result:

```text
Ada: 50
true
false
```

The expression `#balance in value` is a **brand check**. It checks whether an object was created with that private field.
It only works inside the class where the private field is declared.

You cannot read `account.#balance` from outside the class. That is a syntax error, not just `undefined`.

## Static members

Static fields and methods belong to the class itself, not to instances:

```js
class IdGenerator {
    static prefix = "user";
    static next = 1;

    static create() {
        const id = `${this.prefix}-${this.next}`;
        this.next += 1;
        return id;
    }
}

console.log(IdGenerator.create());
console.log(IdGenerator.create());
```

Result:

```text
user-1
user-2
```

Instances do not receive static members:

```js
const generator = new IdGenerator();

console.log(typeof IdGenerator.create);
console.log(generator.create);
```

Result:

```text
function
undefined
```

Use static methods for helpers that belong to the class concept, such as `Date.now()` or `Array.isArray()`.

## Static blocks

A static block runs once when the class is evaluated. It is useful when static setup needs more than one expression:

```js
class FeatureFlags {
    static values = new Map();

    static {
        this.values.set("search", true);
        this.values.set("sharing", false);
    }

    static isEnabled(name) {
        return this.values.get(name) === true;
    }
}

console.log(FeatureFlags.isEnabled("search"));
console.log(FeatureFlags.isEnabled("sharing"));
```

Result:

```text
true
false
```

Static blocks can access private static fields too.

## Getters and setters

Getters and setters look like properties, but run code when you read or assign them:

```js
class Temperature {
    #celsius;

    constructor(celsius) {
        this.celsius = celsius;
    }

    get celsius() {
        return this.#celsius;
    }

    set celsius(value) {
        if (value < -273.15) {
            throw new RangeError("Temperature is below absolute zero");
        }
        this.#celsius = value;
    }

    get fahrenheit() {
        return this.#celsius * 9 / 5 + 32;
    }
}

const temperature = new Temperature(20);

console.log(temperature.celsius);
console.log(temperature.fahrenheit);
temperature.celsius = 25;
console.log(temperature.fahrenheit);
```

Result:

```text
20
68
77
```

Use setters carefully. Assignment that looks simple can now throw an error or perform validation.

## Extending a class

Use `extends` to create a subclass:

```js
class Animal {
    constructor(name) {
        this.name = name;
    }

    speak() {
        return `${this.name} makes a sound`;
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);
        this.breed = breed;
    }

    speak() {
        return `${this.name} barks`;
    }

    describe() {
        return `${super.speak()} and is a ${this.breed}`;
    }
}

const dog = new Dog("Mochi", "shiba inu");

console.log(dog.speak());
console.log(dog.describe());
```

Result:

```text
Mochi barks
Mochi makes a sound and is a shiba inu
```

In a subclass constructor, call `super()` before using `this`. `super()` runs the parent constructor. Inside methods,
`super.methodName()` calls a method from the parent class.

Custom error classes are a common place to use `extends Error`. See the
[Error Handling chapter](./14-error-handling.md) for examples.

## `instanceof`

The `instanceof` operator checks whether an object has a constructor's prototype in its prototype chain:

```js
class Animal {}
class Dog extends Animal {}

const dog = new Dog();

console.log(dog instanceof Dog);
console.log(dog instanceof Animal);
console.log(dog instanceof Object);
console.log(dog instanceof Array);
```

Result:

```text
true
true
true
false
```

`instanceof` is useful for class instances and built-in objects. For plain data from JSON or another JavaScript realm,
checking the shape of the object is often safer.

## Classes and prototypes

Class methods live on the class prototype, not directly on each instance:

```js
class TodoList {
    constructor() {
        this.items = [];
    }

    add(item) {
        this.items.push(item);
    }
}

const list = new TodoList();

console.log(Object.hasOwn(list, "items"));
console.log(Object.hasOwn(list, "add"));
console.log(Object.getPrototypeOf(list) === TodoList.prototype);
console.log(TodoList.prototype.add === Object.getPrototypeOf(list).add);
```

Result:

```text
true
false
true
true
```

The `items` property is stored on the instance. The `add` method is stored once on `TodoList.prototype` and shared by
all instances.

### The prototype chain

Inheritance links prototypes together:

```js
class Animal {}
class Dog extends Animal {}

console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);
console.log(Object.getPrototypeOf(Animal.prototype) === Object.prototype);
console.log(Object.getPrototypeOf(Object.prototype));
```

Result:

```text
true
true
null
```

When you access `dog.speak`, JavaScript looks on the `dog` object first, then on `Dog.prototype`, then on
`Animal.prototype`, and continues up the chain.

## `this` pitfalls with callbacks

Class methods are not automatically bound to their instance. If you pass a method as a callback, it can lose `this`:

```js
class ButtonCounter {
    count = 0;

    increment() {
        this.count += 1;
        return this.count;
    }
}

const counter = new ButtonCounter();
const callback = counter.increment;

try {
    console.log(callback());
} catch (error) {
    console.log(error instanceof TypeError);
}
```

Result:

```text
true
```

The method was called without an object before the dot, so `this` is `undefined`.

### Fix with `bind`

```js
class ButtonCounter {
    count = 0;

    increment() {
        this.count += 1;
        return this.count;
    }
}

const counter = new ButtonCounter();
const callback = counter.increment.bind(counter);

console.log(callback());
console.log(callback());
```

Result:

```text
1
2
```

### Fix with an arrow class field

```js
class ButtonCounter {
    count = 0;

    increment = () => {
        this.count += 1;
        return this.count;
    };
}

const counter = new ButtonCounter();
const callback = counter.increment;

console.log(callback());
console.log(callback());
```

Result:

```text
1
2
```

Arrow class fields capture `this` from the instance setup. That makes them convenient for event handlers, but each
instance gets its own function instead of sharing one prototype method.

## Hoisting and the temporal dead zone

Class declarations create a binding before the code runs, but you cannot use the class before the declaration is
evaluated. It is in the **temporal dead zone**:

```js
try {
    new User("Ada");
} catch (error) {
    console.log(error instanceof ReferenceError);
}

class User {
    constructor(name) {
        this.name = name;
    }
}
```

Result:

```text
true
```

This is different from function declarations, which can be called before they appear in the file.

## Class bodies are strict mode

Code inside a class body always runs in strict mode, even if the rest of the file does not:

```js
class StrictExample {
    method() {
        accidentalGlobal = 1;
    }
}

try {
    new StrictExample().method();
} catch (error) {
    console.log(error instanceof ReferenceError);
}
```

Result:

```text
true
```

Strict mode also explains why an unbound class method receives `this` as `undefined` instead of the global object.

## When to prefer plain objects or functions

Classes are useful when you create many similar objects that share behavior:

- UI widgets with instance state
- Domain objects with methods and validation
- Custom errors
- Adapters around external APIs

Prefer plain objects when you only need data:

```js
const user = {
    id: 1,
    name: "Ada",
    role: "admin",
};

console.log(user.name);
```

Result:

```text
Ada
```

Prefer functions or closures when behavior is small and private state can stay local:

```js
function createCounter() {
    let value = 0;

    return {
        increment() {
            value += 1;
            return value;
        },
        get value() {
            return value;
        },
    };
}

const counter = createCounter();

console.log(counter.increment());
console.log(counter.value);
```

Result:

```text
1
1
```

Do not use classes just because they are available. Choose the simplest structure that communicates the idea clearly.

## Summary

- Classes create objects with shared behavior using `constructor`, methods, fields, and `new`.
- Public fields are per-instance properties; private `#fields` and `#methods` are only accessible inside the class.
- Static fields, methods, and blocks belong to the class itself.
- Getters and setters provide property-like access with validation or computed values.
- `extends` and `super` build inheritance chains; `instanceof` checks the prototype chain.
- Class methods live on the prototype. Instance data lives on each object.
- Passing a method as a callback can lose `this`; use `bind` or an arrow class field when needed.
- Classes are in the temporal dead zone before their declaration and class bodies always run in strict mode.
- Prefer plain objects or functions when you only need data or simple behavior.

Next up: [ES Modules](./17-modules.md) - split JavaScript into reusable files with imports and exports.
