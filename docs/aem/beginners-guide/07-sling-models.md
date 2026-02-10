---
title: "Sling Models"
sidebar_label: "Sling Models"
description: Injecting JCR content into Java models -- annotations, adaptables, child resources, OSGi services, exporters, and best practices.
slug: /aem/beginners-guide/sling-models
tags: [aem, beginners]
keywords:
  - aem sling models
  - aem @Model
  - aem @ValueMapValue
  - aem sling model annotations
  - aem model exporter
sidebar_position: 7
---

# Sling Models

Sling Models are the bridge between the JCR and your Java code. They let you annotate a POJO (Plain Old Java Object) so
that Sling automatically injects content properties, child resources, and OSGi services. Every non-trivial component
should have a Sling Model.

## Basic Sling Model

```java
package com.mysite.core.models;

import org.apache.sling.api.resource.Resource;
import org.apache.sling.models.annotations.Default;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;

@Model(adaptables = Resource.class)
public class TitleModel {

    @ValueMapValue
    @Default(values = "Default Title")
    private String title;

    @ValueMapValue
    @Default(values = "h2")
    private String headingLevel;

    public String getTitle() {
        return title;
    }

    public String getHeadingLevel() {
        return headingLevel;
    }
}
```

Used in HTL:

```html
<div data-sly-use.model="com.mysite.core.models.TitleModel">
    <h2 data-sly-element="${model.headingLevel}">${model.title}</h2>
</div>
```

## Adaptables -- Resource vs SlingHttpServletRequest

The `adaptables` parameter defines what the model can be adapted from:

| Adaptable                       | Use when                                                        | Available injectors                                                   |
|---------------------------------|-----------------------------------------------------------------|-----------------------------------------------------------------------|
| `Resource.class`                | You only need resource properties and children                  | `@ValueMapValue`, `@ChildResource`, `@ResourcePath`                   |
| `SlingHttpServletRequest.class` | You need the request, session, selectors, or request attributes | All of the above plus `@RequestAttribute`, `@ScriptVariable`, `@Self` |

```java
// Resource-based (simpler, preferred when sufficient)
@Model(adaptables = Resource.class)
public class SimpleModel { ... }

// Request-based (more powerful)
@Model(adaptables = SlingHttpServletRequest.class)
public class RequestAwareModel { ... }
```

> **Best practice:** Use `Resource.class` when possible. It is simpler, more testable, and works in non-request
> contexts (e.g., background jobs).

## Injection annotations

### @ValueMapValue -- read properties

Injects a JCR property from the resource's `ValueMap`:

```java
@ValueMapValue
private String title;        // reads ./title

@ValueMapValue
private boolean featured;    // reads ./featured

@ValueMapValue
private Calendar publishDate; // reads ./publishDate

@ValueMapValue(name = "jcr:title")
private String pageTitle;    // reads ./jcr:title (specify name when it differs)
```

Supported types: `String`, `Boolean`/`boolean`, `Integer`/`int`, `Long`/`long`, `Double`/`double`, `Calendar`,
`String[]`, and more.

### @ChildResource -- read child nodes

Injects child resources (useful for multifields):

```java
@ChildResource
private List<Resource> links;  // reads ./links child node's children

@ChildResource(name = "socialLinks")
private List<Resource> socials; // reads ./socialLinks children
```

For typed multifield items, create a nested model:

```java
@Model(adaptables = Resource.class)
public class LinkItem {
    @ValueMapValue
    private String label;

    @ValueMapValue
    private String url;

    @ValueMapValue
    @Default(booleanValues = false)
    private boolean openInNewTab;

    public String getLabel() { return label; }
    public String getUrl() { return url; }
    public boolean isOpenInNewTab() { return openInNewTab; }
}
```

Then inject the list:

```java
@Model(adaptables = Resource.class)
public class NavigationModel {

    @ChildResource
    private List<LinkItem> links;

    public List<LinkItem> getLinks() {
        return links != null ? links : Collections.emptyList();
    }
}
```

### @Self -- inject the adaptable itself

```java
@Model(adaptables = Resource.class)
public class PageModel {

    @Self
    private Resource resource;

    public String getPath() {
        return resource.getPath();
    }
}
```

With request-based models, `@Self` gives you the request:

```java
@Model(adaptables = SlingHttpServletRequest.class)
public class SearchModel {

    @Self
    private SlingHttpServletRequest request;

    public String getQuery() {
        return request.getParameter("q");
    }
}
```

### @OSGiService -- inject OSGi services

```java
@Model(adaptables = Resource.class)
public class ArticleListModel {

    @OSGiService
    private QueryBuilder queryBuilder;

    @Self
    private Resource resource;

    public List<Article> getArticles() {
        ResourceResolver resolver = resource.getResourceResolver();
        // Use queryBuilder to find articles...
        return articles;
    }
}
```

### @ScriptVariable -- inject HTL global objects

Only available with `SlingHttpServletRequest` adaptable:

```java
@Model(adaptables = SlingHttpServletRequest.class)
public class PageHeaderModel {

    @ScriptVariable
    private Page currentPage;

    @ScriptVariable
    private Style currentStyle;

    public String getPageTitle() {
        return currentPage.getTitle();
    }
}
```

### @RequestAttribute -- read parameters from HTL

When HTL passes parameters to the model:

```html
<div data-sly-use.model="${'com.mysite.core.models.ListModel' @ maxItems=5}">
```

```java
@Model(adaptables = SlingHttpServletRequest.class)
public class ListModel {

    @RequestAttribute
    @Default(intValues = 10)
    private int maxItems;
}
```

### @ResourcePath -- inject a resource by path

```java
@Model(adaptables = Resource.class)
public class FooterModel {

    @ResourcePath(path = "/content/mysite/en/jcr:content")
    private Resource siteRoot;

    public String getSiteName() {
        ValueMap props = siteRoot.getValueMap();
        return props.get("jcr:title", "My Site");
    }
}
```

## @PostConstruct -- initialization logic

Run logic after all injections are complete:

```java
@Model(adaptables = Resource.class)
public class ArticleModel {

    @ValueMapValue
    private String title;

    @ValueMapValue
    private String text;

    private int readingTime;

    @PostConstruct
    protected void init() {
        if (text != null) {
            int wordCount = text.split("\\s+").length;
            readingTime = Math.max(1, wordCount / 200);
        }
    }

    public int getReadingTime() {
        return readingTime;
    }
}
```

`@PostConstruct` is called once, after construction and injection. Use it for:

- Computing derived values
- Validation
- Initializing complex state

## Optional injection

By default, `@ValueMapValue` injection is **optional** -- if the property does not exist, the field is `null`. To make
injection required:

```java
@ValueMapValue(injectionStrategy = InjectionStrategy.REQUIRED)
private String title; // Throws exception if missing
```

Or at the model level:

```java
@Model(adaptables = Resource.class, defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class MyModel {
    // All injections are optional by default
    @ValueMapValue
    private String title;   // null if missing, no exception

    @ValueMapValue
    private String text;    // null if missing, no exception
}
```

> **Best practice:** Use `DefaultInjectionStrategy.OPTIONAL` at the model level and provide `@Default` values for fields
> that need them. This prevents exceptions when authors have not filled in all fields.
> Well, _theoretically_, `DefaultInjectionStrategy.REQUIRED` would be ideal, however, in daily development, this most
> often leads to quite a bit of pain.

## Interface-based models with adapters

For better encapsulation, define an interface and use `adapters`:

```java
// Interface (public API)
public interface Hero {
    String getHeading();
    String getSubheading();
    String getImagePath();
    String getCtaLabel();
    String getCtaLink();
}
```

```java
// Implementation
@Model(
    adaptables = Resource.class,
    adapters = Hero.class,
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
public class HeroImpl implements Hero {

    @ValueMapValue
    private String heading;

    @ValueMapValue
    private String subheading;

    @ValueMapValue(name = "fileReference")
    private String imagePath;

    @ValueMapValue
    private String ctaLabel;

    @ValueMapValue
    private String ctaLink;

    @Override
    public String getHeading() { return heading; }

    @Override
    public String getSubheading() { return subheading; }

    @Override
    public String getImagePath() { return imagePath; }

    @Override
    public String getCtaLabel() { return ctaLabel; }

    @Override
    public String getCtaLink() { return ctaLink; }
}
```

I always try to first write down the interface before the implementation. This forces me to think about the public API
and what parts of a possible implementation make sense to expose.

In HTL, reference the interface:

```html
<div data-sly-use.hero="com.mysite.core.models.Hero">
    <h1>${hero.heading}</h1>
</div>
```

Benefits:

- **Testability** -- mock the interface in unit tests
- **Encapsulation** -- hide implementation details
- **Swappability** -- replace the implementation without changing HTL

## Sling Model Exporters

Export your model as JSON (or other formats) for headless use cases:

```java
@Model(
    adaptables = Resource.class,
    adapters = { Hero.class, Exporter.class },
    resourceType = "mysite/components/hero",
    defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL
)
@Exporter(name = "jackson", extensions = "json")
public class HeroImpl implements Hero {
    // ... same as above
}
```

Now you can access the component as JSON:

```bash
curl http://localhost:4502/content/mysite/en/jcr:content/root/container/hero.model.json
```

This is how AEM supports headless delivery of component data.

## Testing Sling Models

Sling Models are testable with `AemContext` from `io.wcm.testing.mock`:

```java
@ExtendWith(AemContextExtension.class)
class HeroImplTest {

    private final AemContext context = new AemContext();

    @Test
    void testHeading() {
        context.build()
            .resource("/content/test", Map.of(
                "sling:resourceType", "mysite/components/hero",
                "heading", "Welcome",
                "subheading", "To our site"
            ))
            .commit();

        Resource resource = context.resourceResolver().getResource("/content/test");
        Hero hero = resource.adaptTo(Hero.class);

        assertEquals("Welcome", hero.getHeading());
        assertEquals("To our site", hero.getSubheading());
    }
}
```

> For the full annotation reference, see
> the [Sling Models and Services](/aem/backend/sling-models), [Sling Model Annotations](/aem/components/annotations/sling-model-annotations),
> and [@ChildResource](/aem/components/annotations/child-resource) references.

## Summary

You learned:

- **Sling Model basics** -- `@Model`, `@ValueMapValue`, `@Default`
- **Adaptables** -- `Resource.class` vs `SlingHttpServletRequest.class`
- **Injection annotations**: `@ValueMapValue`, `@ChildResource`, `@Self`, `@OSGiService`, `@ScriptVariable`,
  `@RequestAttribute`, `@ResourcePath`
- **`@PostConstruct`** for initialization logic
- **Optional vs required** injection strategies
- **Interface-based models** with `adapters` for clean APIs
- **Model Exporters** for JSON output
- **Testing** with AemContext

With components (HTL + dialogs + Sling Models) covered, we are ready to build a complete site. The next chapter covers
templates and policies -- how pages are structured and which components are allowed.

Next up: [Templates & Policies](./08-templates-and-policies.md) -- editable templates, template types, structure vs
initial content, component policies, and page structure.
