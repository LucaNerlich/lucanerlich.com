---
name: JS Beginners Guide
overview: Create a comprehensive 12-chapter JavaScript Beginners Guide as a new subcategory under `docs/javascript/beginners-guide/`, progressing from absolute basics (variables, types) through DOM manipulation and building a vanilla website, to deploying on a VPS with nginx. All content will be fully written with code examples and expected outputs, matching the depth of existing guides.
todos:
  - id: category-json
    content: Create `docs/javascript/beginners-guide/_category_.json` with label and generated-index link
    status: completed
  - id: ch01
    content: "Write chapter 01: Introduction & Environment Setup"
    status: completed
  - id: ch02
    content: "Write chapter 02: Variables, Types & Operators"
    status: completed
  - id: ch03
    content: "Write chapter 03: Control Flow"
    status: completed
  - id: ch04
    content: "Write chapter 04: Functions"
    status: completed
  - id: ch05
    content: "Write chapter 05: Arrays"
    status: completed
  - id: ch06
    content: "Write chapter 06: Objects"
    status: completed
  - id: ch07
    content: "Write chapter 07: HTML & CSS Essentials"
    status: completed
  - id: ch08
    content: "Write chapter 08: The DOM"
    status: completed
  - id: ch09
    content: "Write chapter 09: Events & Interactivity"
    status: completed
  - id: ch10
    content: "Write chapter 10: Working with Data"
    status: completed
  - id: ch11
    content: "Write chapter 11: Project -- Build a Complete Website"
    status: completed
  - id: ch12
    content: "Write chapter 12: Deploying to a VPS with Nginx"
    status: completed
  - id: sidebar
    content: Update `sidebar-order.ts` to order the beginners guide and its chapters
    status: completed
isProject: false
---

# JavaScript Beginners Guide

## Structure

New subcategory at `docs/javascript/beginners-guide/` following the same pattern as `[docs/design-patterns/creational/](docs/design-patterns/creational/)` -- a `_category_.json` with individual `.md` files per chapter.

### Files to create

- `docs/javascript/beginners-guide/_category_.json` -- category metadata with `generated-index` landing page
- 12 chapter files (detailed below)

### Files to modify

- `[sidebar-order.ts](sidebar-order.ts)` -- add a `javascript` key to pin `beginners-guide` at the top of the JavaScript section, and a `javascript/beginners-guide` key to order the chapters

## Chapter Outline

Each chapter will be a comprehensive `.md` file (~300-500+ lines) with frontmatter, code examples, expected outputs, and practical exercises -- matching the style of existing guides like `[docs/javascript/async-await-guide.md](docs/javascript/async-await-guide.md)`.

### Part 1: JavaScript Fundamentals

1. `**01-introduction.md**` -- What is JavaScript, brief history, where it runs (browser + Node.js), installing Node.js, using browser dev tools, choosing an editor, first "Hello World" in both browser and terminal
2. `**02-variables-and-types.md**` -- `let`/`const`/`var` and when to use each, primitive types (string, number, bigint, boolean, null, undefined, symbol), `typeof`, type coercion pitfalls, template literals, type conversion
3. `**03-control-flow.md**` -- `if`/`else if`/`else`, ternary operator, `switch`, `for`/`while`/`do-while` loops, `for...of`/`for...in`, `break`/`continue`, nested loops, common patterns
4. `**04-functions.md**` -- Function declarations vs expressions vs arrow functions, parameters and defaults, rest parameters, return values, scope (block vs function), hoisting, closures introduction, callbacks
5. `**05-arrays.md**` -- Creating arrays, indexing, `length`, mutating methods (`push`/`pop`/`shift`/`unshift`/`splice`), iteration methods (`map`/`filter`/`reduce`/`find`/`some`/`every`/`forEach`), destructuring, spread operator, sorting
6. `**06-objects.md**` -- Object literals, property access (dot vs bracket), adding/modifying/deleting properties, methods and `this`, destructuring, spread/rest, `Object.keys`/`values`/`entries`, JSON stringify/parse, nested objects

### Part 2: The Browser and the DOM

1. `**07-html-css-essentials.md**` -- HTML document structure, semantic elements, forms, links, images, CSS selectors, box model, display/positioning, flexbox basics, responsive design with media queries -- just enough to build pages for the JS guide
2. `**08-the-dom.md**` -- What is the DOM, `document.querySelector`/`querySelectorAll`, modifying text/HTML/attributes/classes/styles, creating and removing elements, traversing the tree, `document.createElement`, `appendChild`/`insertBefore`
3. `**09-events.md**` -- `addEventListener`, the event object, event bubbling and capturing, event delegation, preventing defaults, form events, keyboard and mouse events, `DOMContentLoaded`, practical interactive examples
4. `**10-working-with-data.md**` -- The Fetch API, promises (brief, linking to the existing async guide for depth), `async`/`await` basics, handling JSON responses, error handling with fetch, `localStorage`/`sessionStorage`, building a data-driven page

### Part 3: Building and Deploying

1. `**11-project-build-a-website.md**` -- Plan and build a multi-page vanilla website: file/folder structure, shared navigation, interactive components (theme toggle, form validation, dynamic content loading), CSS organization, testing locally
2. `**12-deploy-vps-nginx.md**` -- Choosing a VPS provider, initial server setup (SSH keys, firewall), installing nginx, uploading files (scp/rsync), nginx configuration for static sites, HTTPS with Let's Encrypt/certbot, basic hardening, verifying the deployment

## Integration Points

- Add `beginners-guide` to `[sidebar-order.ts](sidebar-order.ts)` under a new `'javascript'` key so it appears first in the JavaScript sidebar
- Add a `'javascript/beginners-guide'` key to order all 12 chapters
- Cross-link from chapter 10 to the existing `[async-await-guide.md](docs/javascript/async-await-guide.md)` for deeper async coverage
- Cross-link from chapter 6 to the existing `[json-parsing-guide.md](docs/javascript/json-parsing-guide.md)`
- Cross-link from chapter 9 to `[user-input-sanitization.md](docs/javascript/user-input-sanitization.md)`

