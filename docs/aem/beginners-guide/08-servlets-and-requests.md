---
title: "Servlets & Request Handling"
sidebar_label: "Servlets & Requests"
description: Writing Sling servlets - resource-type vs path binding, selectors and extensions, safe vs all methods, reading request input safely, and returning JSON to the client.
slug: /aem/beginners-guide/servlets-and-requests
tags: [aem, beginners]
keywords:
    - aem servlet
    - sling servlet
    - SlingSafeMethodsServlet
    - aem json endpoint
    - sling selectors
sidebar_position: 8
---

# Servlets & Request Handling

Sling Models render content into components. But sometimes you need a custom **endpoint** - a URL that
returns JSON for a frontend, handles a form POST, or performs an action. That is what a **Sling
servlet** is for. This chapter shows how requests are routed to servlets and how to write them safely.

## How Sling routes a request

Recall from [The JCR & Sling](./02-jcr-and-sling.md) that Sling resolves a request to a **resource**,
then picks a **script or servlet** based on the resource's `sling:resourceType`, the **selectors**, the
**extension**, and the HTTP **method**. A servlet is just another way to render a resource - bound
either to a resource type or to a fixed path.

```text
GET /content/mysite/en/products.list.json
                      |        |    |
                      |        |    +-- extension: json
                      |        +------- selector:  list
                      +---------------- resource:  the products page
```

## Two ways to bind a servlet

| Binding | Annotation | Use when |
|---------|-----------|----------|
| **Resource type** (preferred) | `@SlingServletResourceTypes` | The servlet renders a resource/component. Cacheable, RESTful, dispatcher-friendly |
| **Path** | `@SlingServletPaths` | A standalone utility endpoint not tied to content (use sparingly) |

**Prefer resource-type binding.** Path-bound servlets bypass Sling's resource resolution and access
control, are harder to cache, and must be explicitly allowed through the Dispatcher. Adobe discourages
them for anything content-related.

### Resource-type-bound servlet (returns JSON)

This servlet responds to `<page>.children.json` and returns the page's child pages as JSON:

```java title="core/.../servlets/ChildPagesServlet.java"
import com.day.cq.wcm.api.Page;
import com.day.cq.wcm.api.PageManager;
import com.google.gson.Gson;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.apache.sling.servlets.annotations.SlingServletResourceTypes;
import org.osgi.service.component.annotations.Component;

import javax.servlet.Servlet;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Component(service = Servlet.class)
@SlingServletResourceTypes(
    resourceTypes = "mysite/components/page",
    selectors = "children",
    extensions = "json",
    methods = "GET"
)
public class ChildPagesServlet extends SlingSafeMethodsServlet {

    @Override
    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response)
            throws IOException {

        Resource resource = request.getResource();
        PageManager pageManager = resource.getResourceResolver().adaptTo(PageManager.class);
        Page current = pageManager != null ? pageManager.getContainingPage(resource) : null;

        List<String> titles = new ArrayList<>();
        if (current != null) {
            Iterator<Page> children = current.listChildren();
            while (children.hasNext()) {
                titles.add(children.next().getTitle());
            }
        }

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(new Gson().toJson(titles));
    }
}
```

### Safe vs all methods

| Base class | Handles | Use for |
|------------|---------|---------|
| `SlingSafeMethodsServlet` | GET, HEAD (read-only) | Read endpoints, JSON APIs |
| `SlingAllMethodsServlet` | GET, POST, PUT, DELETE | Endpoints that modify content or handle forms |

Extend the **narrowest** base class that does the job - a read endpoint should not accept POST.

## Handling a POST safely

A form handler extends `SlingAllMethodsServlet` and **must validate input**. Untrusted request
parameters must never flow into JCR paths, queries, or commands (see the project security rules and
[Input Validation](../infrastructure/security.mdx)):

```java title="core/.../servlets/ContactFormServlet.java"
@Component(service = Servlet.class)
@SlingServletResourceTypes(
    resourceTypes = "mysite/components/contactform",
    methods = "POST",
    extensions = "json"
)
public class ContactFormServlet extends SlingAllMethodsServlet {

    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response)
            throws IOException {

        String email = request.getParameter("email");

        // Validate BEFORE using the value for anything.
        if (email == null || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            response.setStatus(SlingHttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("{\"error\":\"invalid email\"}");
            return;
        }

        // ... persist via a service user / send via a service, never an admin session ...

        response.setContentType("application/json");
        response.getWriter().write("{\"status\":\"ok\"}");
    }
}
```

:::warning Validate every request parameter
Request parameters, headers, and selectors are **untrusted input**. Validate and constrain them
before using them in a query, a path, or a service call. Never build a JCR path by concatenating a
raw parameter. See [Security & Permissions](./19-security-and-permissions.md).
:::

## Servlet or Sling Model Exporter?

If you only need to expose a component's data as JSON, you usually do **not** need a servlet - a
[Sling Model Exporter](./07-sling-models.md#sling-model-exporters) (`.model.json`) is simpler and
cacheable. Reach for a servlet when you need custom routing, query logic, an action endpoint, or a
response shape that does not map to a single component.

## Selectors, extensions, and caching

- **Selectors** (`page.children.json`) let one resource expose multiple representations. They are part
  of the URL, so they are **cacheable** by the Dispatcher and CDN - prefer them over query parameters
  for cacheable reads.
- **Extension** sets the response type convention (`.json`, `.csv`, `.xml`).
- Keep GET endpoints **idempotent and cacheable**; put anything that mutates behind POST.

## Summary

You learned:

- A **servlet** is a custom endpoint that renders a resource, routed like any Sling request
- Prefer **resource-type binding** (`@SlingServletResourceTypes`) over path binding
- Extend **`SlingSafeMethodsServlet`** for reads, **`SlingAllMethodsServlet`** for writes
- **Validate all request input** before using it
- Use **selectors + extensions** for cacheable representations
- A **Sling Model Exporter** is often a simpler alternative to a read-only servlet

## Official Documentation

- [Servlets and Request Handling (Experience League)](https://experienceleague.adobe.com/en/docs/experience-manager-learn/foundation/development/understand-java-api-best-practices)
- [Apache Sling Servlets & Scripts](https://sling.apache.org/documentation/the-sling-engine/servlets.html)
- [Servlets deep dive](../backend/servlets.mdx) - registration patterns, selectors, and security on this site

Next up: [Templates & Policies](./09-templates-and-policies.md) - editable templates, template types,
component policies, and the Style System.
