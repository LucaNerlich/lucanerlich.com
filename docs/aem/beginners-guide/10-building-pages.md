---
title: "Building Pages"
sidebar_label: "Building Pages"
description: Using Core Components, the responsive grid, navigation, header and footer, building a homepage and article page, and page properties.
slug: /aem/beginners-guide/building-pages
tags: [aem, beginners]
keywords:
  - aem core components
  - aem responsive grid
  - aem navigation
  - aem page building
  - aem layout container
sidebar_position: 10
---

# Building Pages

With components, templates, and client libraries in place, it is time to build actual pages. In this chapter we will
assemble a homepage and an article page using Core Components and the responsive grid.

## Core Components

AEM Core Components are production-ready, accessible, and SEO-optimized components maintained by Adobe. Your project
uses them through proxy components (chapter 8).

### Commonly used Core Components

| Component               | What it does                                                 |
|-------------------------|--------------------------------------------------------------|
| **Title**               | Heading (H1--H6) with link option                            |
| **Text**                | Rich text content                                            |
| **Image**               | Responsive images with lazy loading                          |
| **Button**              | Link button with label and icon                              |
| **Teaser**              | Card with image, title, description, and CTA                 |
| **List**                | Dynamic list of child pages, tagged pages, or search results |
| **Navigation**          | Site navigation tree                                         |
| **Language Navigation** | Language switcher                                            |
| **Breadcrumb**          | Breadcrumb trail                                             |
| **Container**           | Layout container (responsive grid)                           |
| **Tabs**                | Tabbed content                                               |
| **Accordion**           | Collapsible content panels                                   |
| **Carousel**            | Rotating content panels                                      |
| **Experience Fragment** | Include an Experience Fragment                               |
| **Content Fragment**    | Render a Content Fragment                                    |
| **Embed**               | Embed external content (YouTube, etc.)                       |
| **Separator**           | Visual separator                                             |

The Maven archetype creates proxy components for all of these. They appear in the component browser under your project's
component group.

## Page anatomy

A typical AEM page has this structure:

```mermaid
flowchart TD
    Page["Page Component"]
    Head["Head (meta, CSS)"]
    Header["Header (navigation, logo)"]
    Main["Main Content Area"]
    Footer["Footer (links, copyright)"]
    Scripts["Scripts (JS)"]

    Page --> Head
    Page --> Header
    Page --> Main
    Page --> Footer
    Page --> Scripts

    Main --> Hero["Hero / Banner"]
    Main --> Content["Content Container"]
    Content --> Title["Title"]
    Content --> Text["Text"]
    Content --> Image["Image"]
    Content --> Cards["Card Grid"]
```

### Header

The header typically contains:

- **Logo** -- linked to the homepage
- **Navigation** -- the Navigation Core Component
- **Language switcher** -- the Language Navigation component
- **Search** -- optional search component

The header is defined as a **locked component** in the template structure. It reads content from a dedicated header
Experience Fragment or from page properties.

### Main content area

The main area is a **responsive grid** (layout container) where authors drop in components. Templates define which
components are allowed here.

### Footer

Like the header, the footer is typically locked in the template and reads from a shared source (Experience Fragment or
configuration).

## Building the homepage

Let's build a homepage step by step:

### 1. Create the page

1. Go to **Sites** > **My Site** > **English**
2. Click **Create** > **Page**
3. Select the **Landing Page** template (or your homepage template)
4. Title: **Home**, Name: `home`
5. Click **Create** and **Open**

### 2. Add a Hero component

1. In the editor, click the layout container
2. From the component browser (side panel), drag a **Teaser** (or your custom Hero) onto the page
3. Configure it:
    - **Title:** Welcome to My Site
    - **Description:** We build amazing digital experiences
    - **Image:** Upload or select from DAM
    - **Link:** Point to an article page
    - **CTA:** Learn More

### 3. Add content sections

Add a **Container** component to create a content section. Inside it:

1. **Title** component -- "Latest Articles"
2. **List** component -- configured to show child pages from `/content/mysite/en/blog`, sorted by date, limited to 3
   items
3. **Button** component -- "View All Articles" linking to the blog listing page

### 4. Use layout mode for responsive design

1. Switch to **Layout** mode (ruler icon in the toolbar)
2. Select a component and drag its resize handles
3. Set column widths per breakpoint:
    - Desktop: Cards in a 3-column grid (4+4+4)
    - Tablet: 2-column grid (6+6)
    - Phone: Full width (12)

## Building an article page

### 1. Create the page

1. Navigate to **My Site** > **English** > **Blog**
2. Create a new page with the **Article Page** template
3. Title: **Getting Started with AEM Components**

### 2. Set page properties

Click the **Page Information** button (top left) > **Open Properties**:

| Tab              | Property                 | Value                                           |
|------------------|--------------------------|-------------------------------------------------|
| **Basic**        | Title                    | Getting Started with AEM Components             |
| **Basic**        | Subtitle                 | A guide for new AEM developers                  |
| **Basic**        | Description              | Learn how to create your first AEM component... |
| **Basic**        | Tags                     | Select relevant tags                            |
| **Advanced**     | Featured Image           | Select from DAM                                 |
| **Social Media** | og:title, og:description | For social sharing                              |

### 3. Add content

In the page editor:

1. **Title** -- Article title (auto-populated from page title)
2. **Image** -- Featured image
3. **Text** -- Article body with rich text formatting
4. **Accordion** -- FAQ section at the bottom
5. **Teaser** -- Related articles at the bottom

### 4. Preview and publish

1. Click **Preview** to see the page without editing chrome
2. Click **Page Information** > **Publish Page** to publish to the Publish instance

## Page properties in code

Page properties are stored on the `jcr:content` node of the page. Access them in Sling Models:

```java
@Model(adaptables = SlingHttpServletRequest.class)
public class ArticlePageModel {

    @ScriptVariable
    private Page currentPage;

    public String getTitle() {
        return currentPage.getTitle();
    }

    public String getDescription() {
        return currentPage.getDescription();
    }

    public Calendar getLastModified() {
        return currentPage.getLastModified();
    }

    public String getFeaturedImage() {
        ValueMap props = currentPage.getProperties();
        return props.get("featuredImage", String.class);
    }

    public String[] getTags() {
        Tag[] tags = currentPage.getTags();
        return Arrays.stream(tags)
            .map(Tag::getTitle)
            .toArray(String[]::new);
    }
}
```

## Navigation

The Navigation Core Component builds a navigation tree from the site structure:

```
/content/mysite/en
├── home
├── about
├── services
│   ├── consulting
│   └── development
├── blog
│   ├── article-1
│   └── article-2
└── contact
```

Configure the Navigation component:

| Property                    | Value                | Effect                    |
|-----------------------------|----------------------|---------------------------|
| **Navigation Root**         | `/content/mysite/en` | Start point               |
| **Exclude Root Level**      | 1                    | Skip the root page        |
| **Structure Depth**         | 2                    | Show 2 levels of pages    |
| **Collect all child pages** | No                   | Only show navigable pages |

Pages can opt out of navigation via the **Hide in Navigation** property in page properties.

## Content reuse with Experience Fragments

Experience Fragments are reusable content blocks that can appear on multiple pages:

### Create a header Experience Fragment

1. Go to **Experience Fragments** in the navigation
2. Create a new fragment under `/content/experience-fragments/mysite/en/header`
3. Add Logo, Navigation, and Language Navigation components
4. Publish the fragment

### Include on pages

In the template structure, add an **Experience Fragment** component (locked) and point it to the header fragment. Every
page using this template gets the same header.

When you update the fragment, all pages automatically reflect the change.

## Authoring tips for content authors

### Drag and drop

- Drag components from the side panel onto the page
- Drag to reorder components within a container
- Use the **component toolbar** (appears when you select a component) for edit, configure, copy, cut, delete

### Quick edit vs dialog

- **Quick edit** -- click the component once to edit text inline
- **Dialog** -- click the wrench icon or double-click for the full configuration dialog

### Preview vs Edit mode

Toggle between modes in the page toolbar:

| Mode          | What it shows                                   |
|---------------|-------------------------------------------------|
| **Edit**      | Full authoring chrome, component placeholders   |
| **Layout**    | Responsive column resizing                      |
| **Preview**   | Page as visitors see it                         |
| **Targeting** | Personalization targeting                       |
| **Timewarp**  | View the page as it was at a specific date/time |

> For more on Core Components, see the [Core Components](/aem/components/core-components) reference. See
> also [Experience Fragments](/aem/content/experience-fragments) for reusable content blocks
> and [Tags and Taxonomies](/aem/content/tags-taxonomies) for content classification.

## Summary

You learned:

- **Core Components** -- the standard library of production-ready components
- **Page anatomy** -- header, main content area, footer
- Building a **homepage** with Hero, Lists, and responsive layout
- Building an **article page** with content components and page properties
- Accessing **page properties** in Sling Models
- The **Navigation** component and site structure
- **Experience Fragments** for reusable content blocks
- **Authoring tips** for content editors

Your site now has pages with content. The next chapter moves to headless -- delivering content as structured data via
Content Fragments and GraphQL.

Next up: [Content Fragments & GraphQL](./11-content-fragments-and-graphql.md) -- Content Fragment Models, creating
fragments, the AEM GraphQL API, persisted queries, and headless content delivery.
