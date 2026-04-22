---
title: "Transitions & Animations"
sidebar_label: "Transitions & Animations"
description: CSS transitions for smooth state changes, transform functions (translate, rotate, scale, skew), keyframe animations, timing functions, and performance tips.
slug: /css/beginners-guide/transitions-and-animations
tags: [css, beginners]
keywords:
    - css transitions
    - css animations
    - css keyframes
    - css transform
    - css timing functions
sidebar_position: 11
---

# Transitions & Animations

Transitions smoothly animate CSS property changes. Keyframe animations create more complex, multi-step sequences. Both
make interfaces feel responsive and polished.

## Transitions

A transition tells the browser: "When this property changes, animate the change over time instead of switching
instantly."

### The transition property

```css
.button {
    background-color: #4a90d9;
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.button:hover {
    background-color: #2d6cb4;
}
```

Without the `transition`, the colour would change instantly on hover. With it, the colour fades smoothly over 0.2
seconds.

### Transition syntax

```css
transition: property duration timing-function delay;
```

| Part              | Example      | What it does                                    |
|-------------------|--------------|-------------------------------------------------|
| `property`        | `background-color` | Which CSS property to animate               |
| `duration`        | `0.2s`       | How long the animation takes                    |
| `timing-function` | `ease`       | The acceleration curve                          |
| `delay`           | `0.1s`       | Wait before starting (optional)                 |

### Transitioning multiple properties

List them separated by commas:

```css
.card {
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}
```

Or use `all` to transition every property that changes:

```css
.card {
    transition: all 0.2s ease;
}
```

> **Note:** `transition: all` is convenient but can cause unintended animations (e.g., width changes during layout
> shifts). Prefer listing specific properties.

### Timing functions

The timing function controls the animation's acceleration curve:

| Value                  | Behaviour                                    |
|------------------------|----------------------------------------------|
| `ease` (default)       | Slow start, fast middle, slow end            |
| `linear`               | Constant speed throughout                    |
| `ease-in`              | Slow start, fast end                         |
| `ease-out`             | Fast start, slow end                         |
| `ease-in-out`          | Slow start and end, fast middle              |
| `cubic-bezier(x,y,x,y)` | Custom curve                               |

For UI interactions, `ease` or `ease-out` feel the most natural. `linear` is good for continuous animations like
progress bars.

> **Tip:** Keep transition durations short - 0.15s to 0.3s for hover effects. Longer durations (0.3s-0.5s) work for
> larger movements like panels sliding in.

### Which properties can be transitioned?

Not every CSS property can be smoothly animated. Properties that can be transitioned include:

- **Colour properties:** `color`, `background-color`, `border-color`
- **Size properties:** `width`, `height`, `padding`, `margin`, `font-size`
- **Transform properties:** `transform` (translate, scale, rotate)
- **Opacity:** `opacity`
- **Shadow:** `box-shadow`, `text-shadow`

Properties that **cannot** be transitioned: `display`, `font-family`, `background-image`, `position`.

## CSS transforms

Transforms change an element's position, size, or rotation **without affecting the layout around it**. Other elements
behave as if the transform did not happen.

### translate

Moves an element:

```css
.box:hover {
    transform: translateX(20px);
    transform: translateY(-10px);
    transform: translate(20px, -10px);
}
```

### scale

Resizes an element:

```css
.box:hover {
    transform: scale(1.1);
}

.box:active {
    transform: scale(0.95);
}
```

`scale(1.1)` makes the element 10% larger. `scale(0.95)` makes it 5% smaller. You can scale axes independently:
`scaleX(1.5)`, `scaleY(0.8)`.

### rotate

Rotates an element:

```css
.icon:hover {
    transform: rotate(45deg);
}
```

Positive values rotate clockwise; negative values rotate counter-clockwise.

### skew

Slants an element:

```css
.slanted {
    transform: skewX(-5deg);
}
```

### Combining transforms

Chain multiple transforms in one declaration:

```css
.card:hover {
    transform: translateY(-4px) scale(1.02) rotate(1deg);
}
```

Order matters - transforms are applied right to left.

### transform-origin

By default, transforms originate from the element's **centre**. Change the origin point:

```css
.box {
    transform-origin: top left;
}

.box:hover {
    transform: rotate(10deg);
}
```

The element rotates around its top-left corner instead of its centre.

## Keyframe animations

Transitions animate between two states (e.g., hover on/off). Keyframe animations can have **multiple steps** and run
**automatically** without user interaction.

### Defining keyframes

```css
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```

Or use percentages for multi-step animations:

```css
@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
    100% {
        transform: scale(1);
    }
}
```

### Applying animations

```css
.card {
    animation: fadeIn 0.5s ease;
}
```

### The animation shorthand

```css
animation: name duration timing-function delay iteration-count direction fill-mode;
```

| Part              | Example       | What it does                                        |
|-------------------|---------------|-----------------------------------------------------|
| `name`            | `fadeIn`      | References the `@keyframes` name                    |
| `duration`        | `0.5s`        | How long one cycle takes                            |
| `timing-function` | `ease`       | Acceleration curve                                  |
| `delay`           | `0.2s`        | Wait before starting                                |
| `iteration-count` | `infinite`   | How many times to repeat (default: `1`)             |
| `direction`       | `alternate`  | Play forward, backward, or both                     |
| `fill-mode`       | `forwards`   | What state to keep after the animation ends         |

### animation-iteration-count

```css
.spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
```

`infinite` loops forever. A number like `3` plays three times and stops.

### animation-direction

| Value              | Behaviour                                    |
|--------------------|----------------------------------------------|
| `normal`           | Plays forward each cycle                     |
| `reverse`          | Plays backward each cycle                    |
| `alternate`        | Forward, then backward, then forward...      |
| `alternate-reverse`| Backward, then forward, then backward...     |

```css
.bounce {
    animation: bounce 1s ease-in-out infinite alternate;
}

@keyframes bounce {
    from {
        transform: translateY(0);
    }
    to {
        transform: translateY(-20px);
    }
}
```

### animation-fill-mode

Controls the element's style before and after the animation:

| Value      | Behaviour                                              |
|------------|--------------------------------------------------------|
| `none`     | No styles applied outside animation (default)          |
| `forwards` | Keeps the final keyframe styles after animation ends   |
| `backwards`| Applies the first keyframe styles during the delay     |
| `both`     | Combines `forwards` and `backwards`                    |

```css
.fade-in {
    opacity: 0;
    animation: fadeIn 0.5s ease 0.2s forwards;
}
```

Without `forwards`, the element would snap back to `opacity: 0` after the animation finishes.

### animation-play-state

Pause and resume animations:

```css
.animation {
    animation: spin 2s linear infinite;
}

.animation:hover {
    animation-play-state: paused;
}
```

## Performance considerations

Not all CSS properties are equally cheap to animate. The browser handles layout changes (width, height, margin) by
recalculating positions of surrounding elements. This is expensive.

### The safe list

These properties are **cheap to animate** because they skip layout and paint:

- `transform` (translate, scale, rotate)
- `opacity`

Avoid animating: `width`, `height`, `top`, `left`, `margin`, `padding`, `border-width`.

Instead of animating `top`:

```css
/* Slow */
.box {
    position: relative;
    top: 0;
    transition: top 0.2s;
}
.box:hover {
    top: -10px;
}

/* Fast */
.box {
    transition: transform 0.2s;
}
.box:hover {
    transform: translateY(-10px);
}
```

### will-change

Hints to the browser that an element will be animated, so it can optimise ahead of time:

```css
.card {
    will-change: transform;
    transition: transform 0.2s ease;
}
```

> **Note:** Only use `will-change` on elements that will actually be animated. Overusing it wastes GPU memory.

### Respecting user preferences

Some users experience motion sickness from animations. Respect their preference:

```css
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
```

This effectively disables all animations for users who have turned on the "reduce motion" setting in their operating
system.

## Common animation patterns

### Fade in on scroll (CSS only)

```css
.fade-in {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
    opacity: 1;
    transform: translateY(0);
}
```

The `.visible` class is typically added by JavaScript when the element enters the viewport.

### Button press effect

```css
.button {
    transition: transform 0.1s ease;
}

.button:hover {
    transform: translateY(-2px);
}

.button:active {
    transform: translateY(1px);
}
```

### Loading spinner

```css
.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e0e0e0;
    border-top-color: #4a90d9;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
```

## What you learned

- **Transitions** smoothly animate property changes between two states
- The `transition` shorthand takes property, duration, timing-function, and delay
- **Transforms** (translate, scale, rotate, skew) change appearance without affecting layout
- **Keyframe animations** define multi-step sequences with `@keyframes` and the `animation` property
- `animation-fill-mode: forwards` keeps the end state; `infinite` loops forever
- Animate only `transform` and `opacity` for best performance
- Always respect `prefers-reduced-motion` for accessibility

## Next step

Transitions and transforms make your interfaces dynamic. The next chapter covers **pseudo-classes and pseudo-elements**
- special selectors that target element states and create virtual elements.
