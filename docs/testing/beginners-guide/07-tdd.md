---
title: "Test-Driven Development (TDD)"
sidebar_label: "TDD"
description: The red-green-refactor cycle, when TDD makes sense, a worked example building a shopping cart in both TypeScript and Java, and common TDD pitfalls.
slug: /testing/beginners-guide/tdd
tags: [testing, beginners, tdd, test-driven-development, jest, junit]
keywords:
  - test driven development
  - red green refactor
  - tdd example
  - tdd shopping cart
  - tdd typescript
  - tdd java
sidebar_position: 7
---

# Test-Driven Development (TDD)

Test-Driven Development turns the usual order on its head: instead of writing code and then testing it, you write a failing test first, then write just enough code to make it pass, then clean up the code. This cycle — **red, green, refactor** — is repeated for every small piece of behaviour.

TDD is not about having tests. It is about using tests to *drive* the design of your code. The tests you write before the code act as a specification, and the act of writing them forces you to think about the API, edge cases, and error handling before you are too deep in implementation to change course.

## The Red–Green–Refactor Cycle

```text
   ┌─────────────┐
   │  1. RED     │  Write a test that fails
   │  (failing)  │  because the code doesn't exist yet
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  2. GREEN   │  Write the minimal code
   │  (passing)  │  to make the test pass
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │  3. REFACTOR│  Clean up the code without
   │  (still ok) │  breaking any tests
   └──────┬──────┘
          │
          └──────── repeat ──────►
```

**Red**: Write one test that describes the next small piece of behaviour. Run the tests — the new test must fail (if it passes, either the test is wrong or the feature already exists). The failure proves the test is actually checking something.

**Green**: Write the simplest code possible to make the test pass. Resist the urge to be clever — you can clean up in refactor. A hardcoded return value is often sufficient for the first pass.

**Refactor**: With all tests green, improve the code's structure, remove duplication, rename for clarity. Run the tests again to confirm nothing broke.

## When TDD Makes Sense

TDD is not a silver bullet. It is most valuable when:

- The **business logic is complex** — tax calculation, pricing rules, state machines
- The **API design is unclear** — writing the test first forces you to decide how the code will be used
- You are **fixing a bug** — write a test that reproduces the bug, then fix it
- Working in an **unfamiliar area** — tests give you early confidence signals

TDD tends to be less productive when:

- You are doing **UI layout** or visual styling
- You are writing **exploratory code** (spike/proof of concept) — throw it away and rewrite with TDD when you know what you are building
- The problem is **completely clear and simple** — sometimes just writing the code is faster

The goal is to make TDD a habit for the code that matters, not a religion applied everywhere.

## Worked Example: Shopping Cart (TypeScript)

We will build a `ShoppingCart` class step by step using TDD. The rules:
- A cart holds line items (product name, quantity, unit price)
- Adding the same product increases the quantity
- Removing an item decreases quantity; if quantity hits 0, the item is removed
- The total is the sum of `quantity * unitPrice` for all items
- Applying a percentage discount reduces the total

### Step 1 — Red: Empty cart has zero total

```typescript
// src/cart/cart.test.ts
import { ShoppingCart } from './cart';

describe('ShoppingCart', () => {
    let cart: ShoppingCart;

    beforeEach(() => {
        cart = new ShoppingCart();
    });

    it('starts with a total of 0', () => {
        expect(cart.getTotal()).toBe(0);
    });
});
```

Running the tests: **RED** — `ShoppingCart` does not exist.

### Step 2 — Green: Minimal implementation

```typescript
// src/cart/cart.ts
export class ShoppingCart {
    getTotal(): number {
        return 0;
    }
}
```

Tests: **GREEN**.

### Step 3 — Red: Adding an item increases total

```typescript
it('adds an item and updates the total', () => {
    cart.addItem('apple', 3, 1.50);
    expect(cart.getTotal()).toBe(4.50);
});
```

**RED** — `addItem` does not exist.

### Step 4 — Green: Track items

```typescript
interface LineItem {
    name: string;
    quantity: number;
    unitPrice: number;
}

export class ShoppingCart {
    private items: LineItem[] = [];

    addItem(name: string, quantity: number, unitPrice: number): void {
        this.items.push({ name, quantity, unitPrice });
    }

    getTotal(): number {
        return this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    }
}
```

**GREEN**.

### Step 5 — Red: Adding same item merges quantity

```typescript
it('merges quantity when the same item is added twice', () => {
    cart.addItem('apple', 2, 1.50);
    cart.addItem('apple', 1, 1.50);
    expect(cart.getTotal()).toBe(4.50);   // 3 × 1.50
    expect(cart.getItemCount()).toBe(1);  // one unique item type
});
```

**RED** — quantities are not merged and `getItemCount` does not exist.

### Step 6 — Green + Refactor

```typescript
export class ShoppingCart {
    private items: Map<string, LineItem> = new Map();

    addItem(name: string, quantity: number, unitPrice: number): void {
        if (quantity <= 0) throw new Error('Quantity must be positive');
        const existing = this.items.get(name);
        if (existing) {
            existing.quantity += quantity;
        } else {
            this.items.set(name, { name, quantity, unitPrice });
        }
    }

    getTotal(): number {
        let sum = 0;
        for (const item of this.items.values()) {
            sum += item.quantity * item.unitPrice;
        }
        return Math.round(sum * 100) / 100;
    }

    getItemCount(): number {
        return this.items.size;
    }
}
```

**GREEN**. Note the refactor to `Map` — using a name as a key naturally prevents duplicates.

### Step 7 — Red: Remove item

```typescript
it('removes an item from the cart', () => {
    cart.addItem('apple', 2, 1.50);
    cart.addItem('bread', 1, 2.00);
    cart.removeItem('apple');
    expect(cart.getItemCount()).toBe(1);
    expect(cart.getTotal()).toBe(2.00);
});

it('does nothing when removing an item not in the cart', () => {
    expect(() => cart.removeItem('ghost')).not.toThrow();
});
```

### Step 8 — Green

```typescript
removeItem(name: string): void {
    this.items.delete(name);
}
```

**GREEN**.

### Step 9 — Red: Percentage discount

```typescript
it('applies a percentage discount to the total', () => {
    cart.addItem('laptop', 1, 1000.00);
    cart.applyDiscount(10);  // 10% off
    expect(cart.getTotal()).toBe(900.00);
});

it('throws when discount is out of range', () => {
    expect(() => cart.applyDiscount(101)).toThrow('Discount must be between 0 and 100');
    expect(() => cart.applyDiscount(-5)).toThrow('Discount must be between 0 and 100');
});
```

### Step 10 — Green

```typescript
private discountPercent = 0;

applyDiscount(percent: number): void {
    if (percent < 0 || percent > 100) {
        throw new Error('Discount must be between 0 and 100');
    }
    this.discountPercent = percent;
}

getTotal(): number {
    let sum = 0;
    for (const item of this.items.values()) {
        sum += item.quantity * item.unitPrice;
    }
    const discounted = sum * (1 - this.discountPercent / 100);
    return Math.round(discounted * 100) / 100;
}
```

All tests **GREEN**. The final `cart.ts` is a clean, well-tested class built entirely by tests driving the design.

## Worked Example: Shopping Cart (Java)

The same exercise in Java, abbreviated to show the pattern without repeating every step:

```java
// src/test/java/com/example/cart/ShoppingCartTest.java
@ExtendWith(MockitoExtension.class)
class ShoppingCartTest {

    private ShoppingCart cart;

    @BeforeEach
    void setUp() {
        cart = new ShoppingCart();
    }

    @Test
    @DisplayName("starts with a total of zero")
    void emptyCartHasZeroTotal() {
        assertThat(cart.getTotal()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("adds an item and updates the total")
    void addItemUpdatesTotal() {
        cart.addItem("apple", 3, new BigDecimal("1.50"));
        assertThat(cart.getTotal()).isEqualByComparingTo("4.50");
    }

    @Test
    @DisplayName("merges quantity when the same item is added twice")
    void addSameItemMergesQuantity() {
        cart.addItem("apple", 2, new BigDecimal("1.50"));
        cart.addItem("apple", 1, new BigDecimal("1.50"));
        assertThat(cart.getTotal()).isEqualByComparingTo("4.50");
        assertThat(cart.getItemCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("throws when quantity is zero or negative")
    void throwsForInvalidQuantity() {
        assertThatThrownBy(() -> cart.addItem("apple", 0, new BigDecimal("1.50")))
            .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    @DisplayName("applies a percentage discount")
    void appliesDiscount() {
        cart.addItem("laptop", 1, new BigDecimal("1000.00"));
        cart.applyDiscount(10);
        assertThat(cart.getTotal()).isEqualByComparingTo("900.00");
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 101})
    @DisplayName("throws for discount out of range")
    void throwsForInvalidDiscount(int discount) {
        assertThatThrownBy(() -> cart.applyDiscount(discount))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("between 0 and 100");
    }
}
```

The implementation emerges test by test. The final `ShoppingCart.java`:

```java
// src/main/java/com/example/cart/ShoppingCart.java
package com.example.cart;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

public class ShoppingCart {

    private final Map<String, LineItem> items = new LinkedHashMap<>();
    private int discountPercent = 0;

    public void addItem(String name, int quantity, BigDecimal unitPrice) {
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");
        items.merge(name, new LineItem(name, quantity, unitPrice),
            (existing, newItem) -> existing.withQuantity(existing.quantity() + quantity));
    }

    public void removeItem(String name) {
        items.remove(name);
    }

    public void applyDiscount(int percent) {
        if (percent < 0 || percent > 100) {
            throw new IllegalArgumentException("Discount must be between 0 and 100");
        }
        this.discountPercent = percent;
    }

    public BigDecimal getTotal() {
        BigDecimal subtotal = items.values().stream()
            .map(item -> item.unitPrice().multiply(BigDecimal.valueOf(item.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal multiplier = BigDecimal.ONE
            .subtract(BigDecimal.valueOf(discountPercent).divide(BigDecimal.valueOf(100)));
        return subtotal.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    public int getItemCount() {
        return items.size();
    }

    record LineItem(String name, int quantity, BigDecimal unitPrice) {
        LineItem withQuantity(int newQty) {
            return new LineItem(name, newQty, unitPrice);
        }
    }
}
```

## Common TDD Pitfalls

### Writing too much code before going green

If your green step requires 50 lines, you wrote too much in the red step. Each red step should describe one tiny behaviour. Break it down.

### Not refactoring

After green, many developers skip refactor and move straight to the next red. Duplication accumulates and the design degrades. Always take a few minutes in refactor to clean up.

### Testing implementation instead of behaviour

A test that breaks every time you rename a private method is testing implementation. Tests should assert *what* the code does, not *how*. Focus on inputs and outputs, not internal state.

### Mocking everything

Tests that stub every dependency in the class under test often end up testing the mocking framework, not the code. Write a focused unit test that exercises real logic; save mocking for external dependencies.

### TDD as a checkbox

TDD only adds value when you genuinely think about the API while writing the test. Going through the motions — writing a trivial test, writing the obvious code, repeating — produces test coverage without design insight.

TDD is a skill that improves with practice. Start with a small, well-defined feature and work through the cycle a few times. The feedback loop it creates — write test, see it fail for the right reason, make it pass, clean up — becomes genuinely addictive once it clicks.
