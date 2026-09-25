---
title: Docusaurus
description: "Notes on building documentation sites with Docusaurus: setup, hosting, and useful plugins."
---

# Docusaurus

## Page Setup

Development and hosting are straightforward. [Docusaurus](https://docusaurus.io/docs) comes with sensible defaults,
can be extended easily, and lets you mix React components with Markdown or MDX.

[Vercel](https://vercel.com) can host a Docusaurus 3 site without extra setup. Connect your repository, configure the
build command, and add a custom domain if you need one.

Done.

## Search

Use the official Algolia / DocSearch integration. Alternatively use this
plugin: https://github.com/lelouch77/docusaurus-lunr-search

## Using Infima Styling

[Infima Components](https://infima.dev/docs/components)

Docusaurus comes with the Infima Styling Library by default. Therefore, we can just "copy paste" component examples into
`.jsx` and `.mdx` pages.

Here is an example alert:

<div class="alert alert-primary" role="alert">
    This is a <strong>primary</strong> alert. You should probably pay attention to it.
</div>

And as a `success` variant:

<div class="alert alert-success" role="alert">
    This is a <strong>success</strong> alert. Everything worked as expected.
</div>

## Code Fence Line Highlighting

To highlight a specific line, specify the line-range in the code fences' title line

````markdown title="code fence block"
```rust {2} title="main.rs"
fn main() {
    println!("This line is highlighted.");
}
```
````

```rust {2} title="main.rs"
fn main() {
    println!("This line is highlighted.");
}
```

This also works with a number range

````markdown title="code fence block"
```rust {2-3} title="main.rs"
fn main() {
    println!("This line is highlighted.");
    println!("This line is also highlighted.");
}
```
````

```rust {2-3} title="main.rs"
fn main() {
    println!("This line is highlighted.");
    println!("This line is also highlighted.");
}
```
