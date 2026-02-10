---
title: "HTL Templates"
sidebar_label: "HTL Templates"
description: The HTML Template Language in depth -- expressions, block statements, global objects, the Use API, and best practices.
slug: /aem/beginners-guide/htl-templates
tags: [aem, beginners]
keywords:
  - aem htl
  - aem sightly
  - aem data-sly
  - aem html template language
  - aem use api
sidebar_position: 5
---

# HTL Templates

HTL (HTML Template Language, formerly Sightly) is AEM's server-side templating language. It replaces JSP and is the
standard for all component rendering. HTL is designed to be **secure by default** -- it automatically escapes output to
prevent XSS attacks.

## Expressions

Expressions output values using `${}` syntax:

```html
<!-- Simple property output -->
<h1>${properties.jcr:title}</h1>

<!-- With a Sling Model -->
<p>${model.description}</p>

<!-- Literal string -->
<span>${'Hello, World!'}</span>
```

### Expression options

Options modify how values are rendered:

```html
<!-- Context (escaping mode) -->
<a href="${link.url @ context='uri'}">${link.text}</a>

<!-- Format -->
<p>${'Price: {0}' @ format=product.price}</p>

<!-- i18n translation -->
<span>${'Read More' @ i18n}</span>

<!-- Join an array -->
<p>${model.tags @ join=', '}</p>
```

### Display contexts

HTL automatically picks an escaping context, but you can override it - here are some of the often used context options:

| Context          | Use for         | Example                                                      |
|------------------|-----------------|--------------------------------------------------------------|
| `html` (default) | HTML content    | `<p>${text}</p>`                                             |
| `text`           | Plain text      | `<title>${title @ context='text'}</title>`                   |
| `attribute`      | HTML attributes | `<div class="${cssClass @ context='attribute'}">`            |
| `uri`            | URLs            | `<a href="${url @ context='uri'}">`                          |
| `scriptString`   | JS strings      | `var x = "${val @ context='scriptString'}"`                  |
| `unsafe`         | No escaping     | `${richText @ context='unsafe'}` -- use with extreme caution |

> **Security:** Never use `context='unsafe'` unless you are absolutely sure the content is safe. HTL's automatic
> escaping is one of its strongest features.

## Block statements

Block statements are HTML attributes prefixed with `data-sly-`. They control rendering logic.

### data-sly-use -- load a model or object

```html
<!-- Load a Sling Model -->
<div data-sly-use.model="com.mysite.core.models.ArticleModel">
    <h1>${model.title}</h1>
</div>

<!-- Load another HTL template -->
<div data-sly-use.template="partials/header.html">
    <!-- template is now available -->
</div>

<!-- Pass parameters -->
<div data-sly-use.model="${'com.mysite.core.models.ListModel' @ limit=5}">
    <!-- model receives limit=5 -->
</div>
```

The variable name after the dot (e.g., `.model`) is the identifier you use in expressions.

### data-sly-test -- conditional rendering

```html
<!-- Show only if title exists -->
<h1 data-sly-test="${model.title}">${model.title}</h1>

<!-- If/else pattern -->
<div data-sly-test.hasItems="${model.items.size > 0}">
    <p>Found ${model.items.size} items</p>
</div>
<div data-sly-test="${!hasItems}">
    <p>No items found.</p>
</div>

<!-- Falsy values: null, empty string, 0, false, empty collection -->
<p data-sly-test="${model.description}">${model.description}</p>
```

The `data-sly-test` attribute doubles as a variable assignment when you add an identifier (`.hasItems`).

### data-sly-list -- iterate over collections

```html
<ul data-sly-list.item="${model.articles}">
    <li>
        <h3>${item.title}</h3>
        <p>${item.excerpt}</p>
        <span>Item ${itemList.index + 1} of ${itemList.count}</span>
    </li>
</ul>
```

List helper variables:

| Variable          | Description               |
|-------------------|---------------------------|
| `itemList.index`  | Zero-based index          |
| `itemList.count`  | Total items               |
| `itemList.first`  | True if first item        |
| `itemList.last`   | True if last item         |
| `itemList.middle` | True if not first or last |
| `itemList.odd`    | True if index is odd      |
| `itemList.even`   | True if index is even     |

### data-sly-repeat -- iterate and keep the host element

Unlike `data-sly-list` (which removes the host element), `data-sly-repeat` keeps it:

```html
<!-- data-sly-list: <ul> rendered once, <li> repeated -->
<ul>
    <li data-sly-list="${model.items}">${item.name}</li>
</ul>

<!-- data-sly-repeat: <div> itself is repeated -->
<div data-sly-repeat="${model.cards}" class="card">
    <h3>${item.title}</h3>
</div>
<!-- Outputs multiple <div class="card"> elements -->
```

### data-sly-resource -- include another component

```html
<!-- Include a child component -->
<div data-sly-resource="${'header' @ resourceType='mysite/components/header'}"></div>

<!-- Include with selectors -->
<div data-sly-resource="${'sidebar' @ resourceType='mysite/components/sidebar',
                          selectors='compact'}"></div>

<!-- Include with decoration tag control -->
<div data-sly-resource="${'text' @ resourceType='mysite/components/text',
                          decorationTagName='article'}"></div>
```

This is how components include other components -- it triggers a full Sling resource resolution for the child.

### data-sly-include -- include an HTL file

```html
<!-- Include a static HTL fragment -->
<div data-sly-include="partials/footer.html"></div>

<!-- Include from a different component -->
<div data-sly-include="${'path/to/template.html' @ prependPath='/apps'}"></div>
```

Unlike `data-sly-resource`, `data-sly-include` does **not** trigger resource resolution -- it just inlines the HTL file.

### data-sly-template / data-sly-call -- reusable templates

Define a reusable template block and call it:

```html
<!-- Define a template (in the same file or an included file) -->
<template data-sly-template.card="${@ title, description, link}">
    <div class="card">
        <h3>${title}</h3>
        <p>${description}</p>
        <a href="${link @ context='uri'}">Read more</a>
    </div>
</template>

<!-- Call the template -->
<div data-sly-list="${model.articles}">
    <div data-sly-call="${card @ title=item.title,
                          description=item.excerpt,
                          link=item.path}"></div>
</div>
```

This is how you create reusable UI fragments within HTL.

### data-sly-element -- change the HTML tag

```html
<!-- Dynamically set the heading level -->
<h2 data-sly-element="${model.headingLevel || 'h2'}">${model.title}</h2>
<!-- Could render as <h1>, <h2>, <h3>, etc. -->
```

### data-sly-attribute -- set HTML attributes

```html
<!-- Single attribute -->
<div data-sly-attribute.id="${model.anchorId}">Content</div>

<!-- Multiple attributes from a map -->
<div data-sly-attribute="${model.attributes}">Content</div>

<!-- Conditional attribute -->
<input data-sly-attribute.disabled="${model.isDisabled ? 'disabled' : ''}"/>
```

### data-sly-text -- set text content

```html
<!-- Replace inner text (auto-escaped) -->
<p data-sly-text="${model.description}">Placeholder text</p>
```

The placeholder text is shown at design time and replaced at render time.

### data-sly-unwrap -- remove the host element

```html
<!-- Remove the <div> wrapper, keep the content -->
<div data-sly-unwrap>
    <p>This paragraph has no wrapping div.</p>
</div>
```

Useful when you need a container for HTL logic but do not want it in the output.

## Global objects

HTL provides several global objects available in every template:

| Object                    | Type                       | Description                                    |
|---------------------------|----------------------------|------------------------------------------------|
| `properties`              | `ValueMap`                 | Properties of the current resource             |
| `pageProperties`          | `ValueMap`                 | Properties of the current page's `jcr:content` |
| `inheritedPageProperties` | `ValueMap`                 | Page properties with inheritance               |
| `currentPage`             | `Page`                     | The current page object                        |
| `currentNode`             | `Node`                     | The current JCR node                           |
| `resource`                | `Resource`                 | The current Sling resource                     |
| `request`                 | `SlingHttpServletRequest`  | The current request                            |
| `response`                | `SlingHttpServletResponse` | The current response                           |
| `log`                     | `Logger`                   | SLF4J logger                                   |
| `wcmmode`                 | `WCMMode`                  | Current WCM mode (edit, preview, disabled)     |
| `currentDesign`           | `Design`                   | Current page design                            |
| `currentStyle`            | `Style`                    | Current component policy                       |

### Common usage

```html
<!-- Page title -->
<title>${currentPage.title || currentPage.name}</title>

<!-- Component properties -->
<p>${properties.text}</p>

<!-- WCM mode checks (useful for edit-only UI) -->
<div data-sly-test="${wcmmode.edit || wcmmode.preview}">
    <p>Editing placeholder: configure this component.</p>
</div>

<!-- Logging (output goes to AEM logs, not HTML) -->
${'Debug: rendering article' @ log}
```

## The Use API

The Use API connects HTL to Java (or JavaScript) logic. There are several approaches, from simplest to most powerful:

### 1. Direct Sling Model (recommended)

```html
<div data-sly-use.model="com.mysite.core.models.ArticleModel">
    ${model.title}
</div>
```

This is the standard approach and the one you should use for most components.

### 2. Use API with parameters

When you need to pass parameters from HTL to the model:

```java
@Model(adaptables = SlingHttpServletRequest.class)
public class PaginationModel {

    @RequestAttribute
    private int currentPage;

    @RequestAttribute
    private int totalPages;

    // ...
}
```

```html
<div data-sly-use.pagination="${'com.mysite.core.models.PaginationModel'
                                @ currentPage=3, totalPages=10}">
    Page ${pagination.currentPage} of ${pagination.totalPages}
</div>
```

### 3. HTL Use objects (JavaScript -- deprecated)

Server-side JavaScript Use objects are deprecated in AEMaaCS. Use Sling Models instead.

## Practical example -- Article Card component

Let's build a realistic component that combines what we have learned:

```html
<!-- article-card.html -->
<template data-sly-template.articleCard="${@ article}">
    <article class="cmp-article-card"
             data-sly-test="${article}">
        <div data-sly-test="${article.image}"
             class="cmp-article-card__image">
            <img src="${article.image @ context='uri'}"
                 alt="${article.imageAlt}"
                 loading="lazy"/>
        </div>
        <div class="cmp-article-card__content">
            <h3 data-sly-element="${article.headingLevel || 'h3'}"
                class="cmp-article-card__title">
                <a href="${article.link @ context='uri'}">${article.title}</a>
            </h3>
            <p data-sly-test="${article.excerpt}"
               class="cmp-article-card__excerpt">
                ${article.excerpt}
            </p>
            <span class="cmp-article-card__date">${article.formattedDate}</span>
            <ul data-sly-test="${article.tags}"
                class="cmp-article-card__tags">
                <li data-sly-repeat="${article.tags}"
                    class="cmp-article-card__tag">
                    ${item}
                </li>
            </ul>
        </div>
    </article>
</template>

<div data-sly-use.model="com.mysite.core.models.ArticleCardModel"
     data-sly-call="${articleCard @ article=model}">
</div>
```

This template:

- Defines a reusable `articleCard` template block
- Conditionally renders the image, excerpt, and tags
- Uses `data-sly-element` for dynamic heading levels
- Uses `data-sly-repeat` for tag pills
- Properly escapes URLs with `context='uri'`

## HTL best practices

1. **Always use Sling Models** -- put logic in Java, not HTL
2. **Never use `context='unsafe'`** -- unless you truly understand the risks
3. **Keep templates simple** -- if the HTL logic is complex, move it to the model
4. **Use `data-sly-template`/`data-sly-call`** for reusable fragments
5. **Follow BEM naming** with `cmp-` prefix for CSS classes
6. **Provide edit placeholders** using `wcmmode.edit` checks
7. **Use `data-sly-test`** to guard against null values

> For the full HTL specification and advanced patterns, see the [HTL Templates (Sightly)](/aem/htl-templates) reference.
> For customizing the authoring UI itself, see [Overlays](/aem/ui/overlays)
> and [Render Conditions](/aem/ui/render-conditions).

## Summary

You learned:

- **Expressions** (`${}`) with options for formatting, context, and i18n
- **Display contexts** for secure output escaping
- All major **block statements**: `data-sly-use`, `data-sly-test`, `data-sly-list`, `data-sly-repeat`,
  `data-sly-resource`, `data-sly-include`, `data-sly-template`/`data-sly-call`, `data-sly-element`,
  `data-sly-attribute`, `data-sly-text`, `data-sly-unwrap`
- **Global objects** available in every template
- The **Use API** for connecting to Sling Models
- A practical **Article Card** example combining multiple features
- HTL **best practices**

Next up: [Component Dialogs](./06-component-dialogs.md) -- Touch UI dialogs with Granite/Coral, field types, tabs,
multifields, validation, and conditional fields.
