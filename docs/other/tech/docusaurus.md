# Docusaurus

## Page Setup

Development and Hosting is trivial. [Docusaurus](https://docusaurus.io/docs) comes with very sensible defaults and can
be easily extended.
Regular React code and be combined with easy to write markdown.

[Vercel](https://vercel.com) with its `hobby` plan supports Docusaurus v2 out of the box and for free. Just login,
connect your repository and add a custom domain.

Done.

## Search

Use the official Aligola / Docsearch integration. Alternatively use this
plugin: https://github.com/lelouch77/docusaurus-lunr-search

## Plugins

List here https://docusaurus.io/community/resources>.

### Mermaid Diagrams

- [Plugin](https://github.com/sjwall/mdx-mermaid)
- [Documentation](https://mermaid-js.github.io/mermaid)

````
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

## Using Infima Styling

[Infima Components](https://infima.dev/docs/components)

Docusaurus comes with the Infima Styling Library by default. Therefore, we can just "copy paste" component examples into
`.jsx` and `.mdx` pages.

Here is an example alert:

<div class="alert alert--primary" role="alert">
    <button aria-label="Close" class="clean-btn close" type="button"><span aria-hidden="true">×</span></button>
    This is a <strong>primary</strong> alert. You should probably pay attention to it.
</div>

And as a `success` variant without a closable `x`:

<div class="alert alert--success" role="alert">
    This is a <strong>primary</strong> alert. You should probably pay attention to it.
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
```rust {2–3} title="main.rs"
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
