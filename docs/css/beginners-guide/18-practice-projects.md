---
title: "Practice Projects"
sidebar_label: "Practice Projects"
description: Six hands-on CSS projects from beginner to advanced -- personal profile card, navigation bar, photo gallery, landing page, dashboard layout, and CSS art.
slug: /css/beginners-guide/practice-projects
tags: [css, beginners, projects]
keywords:
    - css practice projects
    - css beginner projects
    - learn css by building
    - css portfolio project
    - css project ideas
sidebar_position: 18
---

# Practice Projects

The best way to solidify everything you have learned is to build real things. Below are six projects, ordered from
beginner to advanced. Each one lists what you will build, which skills it practises, and a few hints to get you started.

No step-by-step hand-holding; that is the point. Apply the knowledge from chapters 1--17, use DevTools to debug, and
figure things out.

## Project 1: Personal Profile Card

**Difficulty:** Beginner

### What you will build

A centred card showing a profile photo (or placeholder), name, a short bio, and links to social profiles. Think of it as
a mini "about me" page -- a single card floating in the centre of the screen.

### Skills practised

- Box model (padding, margin, border)
- Typography (font-family, font-size, line-height)
- Colours and backgrounds
- `border-radius` (circular profile image)
- Centring with Flexbox
- Hover effects on links

### Hints

- Start with the HTML structure: a container `div` with an `img`, `h2`, `p`, and a list of links
- Use `border-radius: 50%` on the image with a fixed `width` and `height` for a circular photo
- Centre the card with `display: flex; justify-content: center; align-items: center; min-height: 100vh` on the `body`
- Add a subtle `box-shadow` to the card
- Style the social links as inline-block buttons with `background-color`, `padding`, and `border-radius`
- Add a `transition` on hover to change the button colour smoothly

### Chapters used

1 (Introduction), 3 (Box Model), 4 (Colours & Typography), 7 (Flexbox), 10 (Backgrounds & Shadows), 11 (Transitions)

---

## Project 2: Navigation Bar

**Difficulty:** Beginner

### What you will build

A responsive navigation bar with a logo on the left, links in the middle or right, and a mobile-friendly layout. On
small screens, the links stack vertically or hide behind a toggle.

### Skills practised

- Flexbox for horizontal layout
- Responsive design (media queries, mobile-first)
- Pseudo-classes (`:hover`, `:focus-visible`)
- Transitions for smooth hover effects
- `position: sticky` for scroll behaviour
- Link styling

### Hints

- Use `display: flex; justify-content: space-between; align-items: center` on the nav container
- Style links as `display: inline-block` with `padding` and remove default underlines
- Add `:hover` and `:focus-visible` styles for accessibility
- At small screen widths, switch to `flex-direction: column` and show a hamburger icon (or use a checkbox hack for a
  pure-CSS toggle)
- Make the nav sticky with `position: sticky; top: 0; z-index: 100`
- Give the nav a background colour so content does not show through when scrolling

### Chapters used

2 (Selectors), 6 (Display & Positioning), 7 (Flexbox), 9 (Responsive Design), 11 (Transitions), 12 (Pseudo-classes)

---

## Project 3: Photo Gallery

**Difficulty:** Intermediate

### What you will build

A responsive photo gallery that displays images in a grid. On hover, each image shows a caption overlay. The grid adapts
to the screen size -- four columns on desktop, two on tablet, one on mobile.

### Skills practised

- CSS Grid with `auto-fit` and `minmax()`
- Responsive images (`object-fit: cover`)
- Positioning (overlay with `position: absolute`)
- Transitions and transforms (hover effects)
- Media queries or auto-fit for responsive columns

### Hints

- Use `display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px` for a responsive grid
  with no media queries
- Each gallery item is `position: relative` with `overflow: hidden`
- The caption is `position: absolute; bottom: 0; left: 0; right: 0` with a semi-transparent background
- Start the caption off-screen with `transform: translateY(100%)` and transition it to `translateY(0)` on hover
- Use `object-fit: cover` on images with a fixed `height` to maintain consistent card sizes
- Add `border-radius` to the gallery items for rounded corners

### Chapters used

3 (Box Model), 8 (CSS Grid), 9 (Responsive Design), 10 (Backgrounds & Shadows), 11 (Transitions)

---

## Project 4: Landing Page

**Difficulty:** Intermediate

### What you will build

A complete landing page with: a full-screen hero section, a features grid, a testimonial carousel (or list), a pricing
table, and a footer. Use a custom colour scheme with CSS custom properties and make it fully responsive.

### Skills practised

- Full page layout (Grid and/or Flexbox)
- CSS custom properties (design tokens)
- Responsive design (mobile-first, `clamp()` for fluid typography)
- Gradients and shadows for visual depth
- `min-height: 100vh` for the hero section
- Multiple backgrounds (gradient overlay on hero image)

### Hints

- Start by defining your design tokens in `:root` -- primary colour, text colour, background, spacing scale, fonts
- The hero section uses `min-height: 100vh`, a background image with a dark gradient overlay, and centred white text
- The features section uses CSS Grid: `repeat(auto-fit, minmax(280px, 1fr))`
- Use `clamp()` for all heading font sizes so they scale smoothly
- The pricing table is a flex row (or grid) with cards. Highlight the recommended plan with a modifier class
  (e.g., `.pricing-card--recommended`)
- The footer uses a multi-column flex layout for link groups

### Chapters used

4 (Colours & Typography), 5 (Units & Sizing), 7 (Flexbox), 8 (CSS Grid), 9 (Responsive Design), 10 (Backgrounds &
Shadows), 13 (Custom Properties)

---

## Project 5: Dashboard Layout

**Difficulty:** Advanced

### What you will build

An admin dashboard with: a fixed sidebar navigation, a top bar, a main content area with stat cards and a data table,
and a dark mode toggle. The sidebar collapses on mobile.

### Skills practised

- CSS Grid with `grid-template-areas` for the overall layout
- Custom properties for theming (light/dark mode)
- `position: sticky` for the top bar
- Media queries for responsive sidebar
- Pseudo-classes and pseudo-elements for UI details
- Transitions for dark mode colour changes

### Hints

- Define the layout with grid-template-areas:
  ```
  "sidebar topbar"
  "sidebar main"
  ```
- The sidebar has `grid-area: sidebar` with a fixed width. On mobile, hide it or transform it off-screen
- Use `data-theme="dark"` on the `<html>` element and redefine all colour custom properties in a
  `[data-theme="dark"]` rule
- Add `transition: background-color 0.3s, color 0.3s` to `body` for smooth theme switching
- Stat cards use Flexbox or Grid inside the main area
- The data table uses `:nth-child(even)` for striped rows and `:hover` for row highlighting
- The dark mode toggle is a simple button that adds/removes the `data-theme` attribute via JavaScript

### Chapters used

6 (Display & Positioning), 7 (Flexbox), 8 (CSS Grid), 9 (Responsive Design), 12 (Pseudo-classes), 13 (Custom
Properties), 14 (Specificity & Cascade)

---

## Project 6: CSS Art Challenge

**Difficulty:** Advanced

### What you will build

A purely decorative illustration made entirely with CSS -- no images, no SVGs, no JavaScript. Ideas: a landscape scene
(mountains, sun, clouds), an animal face, a retro game character, or a geometric pattern.

### Skills practised

- Pseudo-elements (`::before`, `::after`) for extra shapes
- Gradients (linear, radial, conic) for colour and texture
- `border-radius` for circles and organic shapes
- Transforms (rotate, scale, skew, translate) for positioning shapes
- `clip-path` for complex shapes
- `box-shadow` for duplication and glow effects
- Animations for movement (optional)

### Hints

- Start with a single `div` as your canvas. Use its `::before` and `::after` for additional shapes -- that gives you
  three elements from one HTML tag
- `clip-path: polygon(...)` creates triangles, pentagons, and custom shapes
- `box-shadow` can be used without blur or spread to duplicate shapes (multiple comma-separated values)
- Gradients can create stripes, circles, and complex patterns
- Use `position: absolute` on everything inside a `position: relative` container for pixel-perfect placement
- Build iteratively: start with simple shapes, layer on details
- Browse [CSS-Tricks](https://css-tricks.com) and [CodePen](https://codepen.io) for inspiration

### Chapters used

6 (Display & Positioning), 10 (Backgrounds & Shadows), 11 (Transitions & Animations), 12 (Pseudo-elements)

---

## Tips for all projects

1. **Start with HTML** -- get the structure right before writing CSS
2. **Add the CSS reset** from chapter 3 to every project
3. **Define custom properties first** -- colours, fonts, spacing, radii
4. **Work mobile-first** -- base styles for small screens, enhance for larger
5. **Use DevTools constantly** -- inspect, edit live, then copy values back
6. **Commit often** -- save working states so you can revert mistakes
7. **Do not copy solutions** -- the struggle is where the learning happens

Pick one that interests you and start building. When you finish it, move to the next difficulty level.

---

## Hobby project ideas

The six projects above are structured exercises. Below is a looser collection of smaller builds you can tackle whenever
you want extra practice. Each one focuses on a specific slice of CSS and can be finished in an afternoon or a weekend.

### Recreate a favourite website's header

Pick any website you visit daily -- a news site, a streaming service, a social platform -- and recreate **just the
header and navigation** from scratch. Do not look at their source code; work from a screenshot. You will be surprised
how many layout details you only notice when you try to reproduce them.

**You will practise:** Flexbox, positioning, responsive nav, font matching, spacing precision.

### Build a "style this page" challenge

Write a single plain HTML file with a heading, a few paragraphs, a list, a table, a blockquote, a form, and some
images. Save it. Then create **three completely different stylesheets** for the same HTML -- one minimal and modern, one
bold and colourful, one dark and moody. Switch between them by swapping the `<link>` tag. The constraint of not changing
the HTML forces you to think creatively about what CSS alone can achieve.

**You will practise:** Typography, colour systems, custom properties, selector variety, the separation of structure and
presentation.

### Animated loading screen

Build a full-screen loading animation using only CSS -- no JavaScript, no images. Ideas: spinning rings, bouncing dots,
a progress bar that fills, morphing shapes, a pulsing logo. The goal is to push `@keyframes`, transforms, and timing
functions as far as you can.

**You will practise:** Keyframe animations, transforms, timing functions, pseudo-elements, `animation-delay` for
staggered effects.

### Responsive email template

Email clients have notoriously limited CSS support -- no Grid, limited Flexbox, no custom properties. Build a simple
newsletter layout (header, hero image, two-column content block, footer) using only `<table>` for layout and inline
styles. Then test it by sending it to yourself. It is a humbling exercise that deepens your appreciation for modern CSS.

**You will practise:** Table-based layout, inline styles, the box model under constraints, cross-client testing.

### CSS-only toggle components

Build a set of interactive UI elements using **no JavaScript** -- only the `:checked` pseudo-class and hidden checkbox
inputs. Ideas: an accordion (expandable sections), a tab component, a star rating widget, a dropdown menu, or a light/dark
mode switch. The checkbox hack teaches you a lot about selector combinators and creative state management.

**You will practise:** Adjacent sibling selectors, `:checked`, pseudo-elements, transitions, `display` toggling.

### Pixel-perfect clone of a design mockup

Find a free design mockup on Dribbble, Figma Community, or a CSS challenge site like
[Frontend Mentor](https://www.frontendmentor.io). Build it pixel-for-pixel. Overlay your result on the mockup to
compare. This is the closest exercise to real-world front-end work, where designers hand you a Figma file and expect
an exact match.

**You will practise:** Every chapter -- spacing, typography, colours, layout, responsive breakpoints, shadows,
transitions.

### Personal blog theme

Design and build a simple blog layout: a homepage listing post titles and dates, and a single-post page with a readable
article layout. Focus on typography -- pick a font pairing (one for headings, one for body), set a comfortable
`max-width` with `ch` units, tune `line-height`, and add a dark mode toggle with custom properties. Keep it minimal but
polished.

**You will practise:** Typography, `ch` units, custom properties, dark mode, Grid or Flexbox for layout, responsive
design.

### Form styling deep dive

Build a registration or checkout form and make it look polished. Style every native input type: text, email, password,
number, date, checkbox, radio, select, textarea, and a submit button. Add focus states, validation states (`:valid`,
`:invalid`), placeholder styling, and disabled states. Form styling exercises many CSS features that other projects skip.

**You will practise:** Form pseudo-classes, `:focus-visible`, `accent-color`, custom checkbox/radio (pseudo-elements),
transitions, `outline`.

### CSS Zen Garden revisited

The classic [CSS Zen Garden](http://www.csszengarden.com) challenge: take an existing HTML file and create a completely
unique design using only CSS. Download the HTML from the site and build your own stylesheet. It is the ultimate test of
CSS creativity under constraints.

**You will practise:** Everything. Selectors, the cascade, backgrounds, positioning, transforms, animations, pseudo-
elements -- all without touching the HTML.
