---
title: "Component Dialogs"
sidebar_label: "Component Dialogs"
description: Touch UI dialogs with Granite/Coral -- field types, tabs, multifields, image upload, validation, and conditional visibility.
slug: /aem/beginners-guide/component-dialogs
tags: [aem, beginners]
keywords:
  - aem dialog
  - aem touch ui dialog
  - aem granite ui
  - aem coral ui
  - aem multifield
sidebar_position: 6
---

# Component Dialogs

Dialogs are the authoring interface for components. When an author double-clicks a component on a page, a dialog opens
with form fields for configuring it. Every value the author enters is stored as a JCR property on the component's
content node.

## Dialog structure

All Touch UI dialogs follow the same nested XML structure. Here is the skeleton:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
          xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
          xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          jcr:primaryType="nt:unstructured"
          jcr:title="Component Name"
          sling:resourceType="cq/gui/components/authoring/dialog">
    <content jcr:primaryType="nt:unstructured"
             sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <!-- Tabs or fields go here -->
        </items>
    </content>
</jcr:root>
```

The dialog lives in `_cq_dialog/.content.xml` inside the component folder.

## Common field types

### Textfield -- single-line text

```xml
<title jcr:primaryType="nt:unstructured"
       sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
       fieldLabel="Title"
       fieldDescription="Enter the component title"
       name="./title"
       required="{Boolean}true"
       maxlength="100"/>
```

### Textarea -- multi-line text

```xml
<description jcr:primaryType="nt:unstructured"
             sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
             fieldLabel="Description"
             name="./description"
             rows="5"/>
```

### Rich Text Editor (RTE)

```xml
<richText jcr:primaryType="nt:unstructured"
          sling:resourceType="cq/gui/components/authoring/dialog/richtext"
          fieldLabel="Body Text"
          name="./text"
          useFixedInlineToolbar="{Boolean}true"/>
```

### Number field

```xml
<count jcr:primaryType="nt:unstructured"
       sling:resourceType="granite/ui/components/coral/foundation/form/numberfield"
       fieldLabel="Item Count"
       name="./count"
       min="{Long}1"
       max="{Long}100"
       step="{Long}1"
       value="{Long}10"/>
```

### Checkbox

```xml
<featured jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
          text="Featured"
          name="./featured"
          value="{Boolean}true"
          uncheckedValue="{Boolean}false"/>
```

### Select (dropdown)

```xml
<alignment jcr:primaryType="nt:unstructured"
           sling:resourceType="granite/ui/components/coral/foundation/form/select"
           fieldLabel="Alignment"
           name="./alignment">
    <items jcr:primaryType="nt:unstructured">
        <left jcr:primaryType="nt:unstructured"
              text="Left" value="left" selected="{Boolean}true"/>
        <center jcr:primaryType="nt:unstructured"
                text="Center" value="center"/>
        <right jcr:primaryType="nt:unstructured"
               text="Right" value="right"/>
    </items>
</alignment>
```

### Path browser -- select a page or asset

```xml
<link jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
      fieldLabel="Link"
      fieldDescription="Select a page"
      name="./linkPath"
      rootPath="/content"
      filter="hierarchyNotFile"/>
```

| `filter` value     | Shows                  |
|--------------------|------------------------|
| `hierarchyNotFile` | Pages only (no assets) |
| `nosystem`         | Hides system paths     |
| (none)             | Shows everything       |

### Image upload (file upload)

```xml
<image jcr:primaryType="nt:unstructured"
       sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
       fieldLabel="Image"
       name="./file"
       fileNameParameter="./fileName"
       fileReferenceParameter="./fileReference"
       allowUpload="{Boolean}true"
       mimeTypes="[image/gif,image/jpeg,image/png,image/svg+xml,image/webp]"/>
```

### Hidden field

```xml
<type jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/form/hidden"
      name="./sling:resourceType"
      value="mysite/components/hero"/>
```

### Date picker

```xml
<eventDate jcr:primaryType="nt:unstructured"
           sling:resourceType="granite/ui/components/coral/foundation/form/datepicker"
           fieldLabel="Event Date"
           name="./eventDate"
           type="date"
           displayedFormat="YYYY-MM-DD"/>
```

### Color picker

```xml
<bgColor jcr:primaryType="nt:unstructured"
         sling:resourceType="granite/ui/components/coral/foundation/form/colorfield"
         fieldLabel="Background Color"
         name="./backgroundColor"
         value="#ffffff"/>
```

## Tabs

Most components group fields into tabs:

```xml
<tabs jcr:primaryType="nt:unstructured"
      sling:resourceType="granite/ui/components/coral/foundation/tabs"
      maximized="{Boolean}true">
    <items jcr:primaryType="nt:unstructured">
        <content jcr:primaryType="nt:unstructured"
                 jcr:title="Content"
                 sling:resourceType="granite/ui/components/coral/foundation/container"
                 margin="{Boolean}true">
            <items jcr:primaryType="nt:unstructured">
                <!-- Content fields -->
            </items>
        </content>
        <style jcr:primaryType="nt:unstructured"
               jcr:title="Style"
               sling:resourceType="granite/ui/components/coral/foundation/container"
               margin="{Boolean}true">
            <items jcr:primaryType="nt:unstructured">
                <!-- Style fields -->
            </items>
        </style>
    </items>
</tabs>
```

A common tab pattern:

| Tab          | Fields                                             |
|--------------|----------------------------------------------------|
| **Content**  | Title, text, image -- the main content             |
| **Style**    | Alignment, color, size -- visual configuration     |
| **Advanced** | ID, CSS class, accessibility -- technical settings |

## Multifield -- repeatable field groups

Multifields let authors add multiple items of the same structure:

```xml
<links jcr:primaryType="nt:unstructured"
       sling:resourceType="granite/ui/components/coral/foundation/form/multifield"
       fieldLabel="Links"
       composite="{Boolean}true">
    <field jcr:primaryType="nt:unstructured"
           sling:resourceType="granite/ui/components/coral/foundation/container"
           name="./links">
        <items jcr:primaryType="nt:unstructured">
            <label jcr:primaryType="nt:unstructured"
                   sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                   fieldLabel="Label"
                   name="./label"
                   required="{Boolean}true"/>
            <url jcr:primaryType="nt:unstructured"
                 sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
                 fieldLabel="URL"
                 name="./url"
                 rootPath="/content"/>
            <openInNewTab jcr:primaryType="nt:unstructured"
                          sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
                          text="Open in new tab"
                          name="./openInNewTab"
                          value="{Boolean}true"/>
        </items>
    </field>
</links>
```

Setting `composite="{Boolean}true"` stores each item as a **child node** with sub-properties. Without `composite`
(or with `composite="{Boolean}false"`), each item is stored as a **single property value** -- this only works for
simple, single-field multifields (e.g., a list of strings), not for multi-property items like the example above.

With `composite=true`:

```
component-node/
└── links/
    ├── item0/
    │   ├── label = "Home"
    │   ├── url = "/content/mysite/en"
    │   └── openInNewTab = false
    └── item1/
        ├── label = "Blog"
        ├── url = "/content/mysite/en/blog"
        └── openInNewTab = false
```

In your Sling Model, use `@ChildResource` to read multifield items (covered in the next chapter).

### Reading file upload values in a Sling Model

When using `fileupload` with `fileReferenceParameter="./fileReference"`, the author-selected DAM asset path is stored as
a String property. Read it with `@ValueMapValue`:

```java
@Model(adaptables = Resource.class,
       defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
public class ImageComponentModel {

    @ValueMapValue
    private String fileReference; // DAM asset path, e.g. "/content/dam/mysite/hero.jpg"

    public String getFileReference() {
        return fileReference;
    }
}
```

## The name attribute

The `name` attribute on each field controls where the value is stored in the JCR:

| Name value            | Stored at                                    |
|-----------------------|----------------------------------------------|
| `./title`             | `title` property on the component node       |
| `./jcr:title`         | `jcr:title` property (standard JCR property) |
| `./links/item0/label` | Nested under `links/item0` child node        |

The `./` prefix means "relative to the current resource" (the component's content node).

## Practical example -- Hero component dialog

A complete dialog for a Hero banner component:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
          xmlns:granite="http://www.adobe.com/jcr/granite/1.0"
          xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          jcr:primaryType="nt:unstructured"
          jcr:title="Hero"
          sling:resourceType="cq/gui/components/authoring/dialog">
    <content jcr:primaryType="nt:unstructured"
             sling:resourceType="granite/ui/components/coral/foundation/container">
        <items jcr:primaryType="nt:unstructured">
            <tabs jcr:primaryType="nt:unstructured"
                  sling:resourceType="granite/ui/components/coral/foundation/tabs"
                  maximized="{Boolean}true">
                <items jcr:primaryType="nt:unstructured">
                    <!-- Content Tab -->
                    <content jcr:primaryType="nt:unstructured"
                             jcr:title="Content"
                             sling:resourceType="granite/ui/components/coral/foundation/container"
                             margin="{Boolean}true">
                        <items jcr:primaryType="nt:unstructured">
                            <columns jcr:primaryType="nt:unstructured"
                                     sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                                     margin="{Boolean}true">
                                <items jcr:primaryType="nt:unstructured">
                                    <column jcr:primaryType="nt:unstructured"
                                            sling:resourceType="granite/ui/components/coral/foundation/container">
                                        <items jcr:primaryType="nt:unstructured">
                                            <heading jcr:primaryType="nt:unstructured"
                                                     sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                                                     fieldLabel="Heading"
                                                     name="./heading"
                                                     required="{Boolean}true"/>
                                            <subheading jcr:primaryType="nt:unstructured"
                                                        sling:resourceType="granite/ui/components/coral/foundation/form/textarea"
                                                        fieldLabel="Subheading"
                                                        name="./subheading"
                                                        rows="3"/>
                                            <image jcr:primaryType="nt:unstructured"
                                                   sling:resourceType="cq/gui/components/authoring/dialog/fileupload"
                                                   fieldLabel="Background Image"
                                                   name="./file"
                                                   fileReferenceParameter="./fileReference"
                                                   mimeTypes="[image/jpeg,image/png,image/webp]"/>
                                            <ctaLabel jcr:primaryType="nt:unstructured"
                                                      sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
                                                      fieldLabel="CTA Label"
                                                      name="./ctaLabel"/>
                                            <ctaLink jcr:primaryType="nt:unstructured"
                                                     sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
                                                     fieldLabel="CTA Link"
                                                     name="./ctaLink"
                                                     rootPath="/content"/>
                                        </items>
                                    </column>
                                </items>
                            </columns>
                        </items>
                    </content>
                    <!-- Style Tab -->
                    <style jcr:primaryType="nt:unstructured"
                           jcr:title="Style"
                           sling:resourceType="granite/ui/components/coral/foundation/container"
                           margin="{Boolean}true">
                        <items jcr:primaryType="nt:unstructured">
                            <columns jcr:primaryType="nt:unstructured"
                                     sling:resourceType="granite/ui/components/coral/foundation/fixedcolumns"
                                     margin="{Boolean}true">
                                <items jcr:primaryType="nt:unstructured">
                                    <column jcr:primaryType="nt:unstructured"
                                            sling:resourceType="granite/ui/components/coral/foundation/container">
                                        <items jcr:primaryType="nt:unstructured">
                                            <overlay jcr:primaryType="nt:unstructured"
                                                     sling:resourceType="granite/ui/components/coral/foundation/form/select"
                                                     fieldLabel="Overlay"
                                                     name="./overlay">
                                                <items jcr:primaryType="nt:unstructured">
                                                    <none jcr:primaryType="nt:unstructured"
                                                          text="None" value="none"/>
                                                    <light jcr:primaryType="nt:unstructured"
                                                           text="Light" value="light"/>
                                                    <dark jcr:primaryType="nt:unstructured"
                                                          text="Dark" value="dark" selected="{Boolean}true"/>
                                                </items>
                                            </overlay>
                                            <fullWidth jcr:primaryType="nt:unstructured"
                                                       sling:resourceType="granite/ui/components/coral/foundation/form/checkbox"
                                                       text="Full Width"
                                                       name="./fullWidth"
                                                       value="{Boolean}true"/>
                                        </items>
                                    </column>
                                </items>
                            </columns>
                        </items>
                    </style>
                </items>
            </tabs>
        </items>
    </content>
</jcr:root>
```

> For more dialog patterns and the full Granite UI component reference, see
> the [Touch UI Component Dialogs](/aem/component-dialogs) reference. See also [Coral UI](/aem/ui/coral-ui) for the
> underlying design system and [Custom Dialog Widgets](/aem/ui/custom-dialog-widgets) for building your own field types.

## Conditional field visibility (show/hide)

A common requirement is showing or hiding fields based on the value of another field. Granite UI supports this with the
`granite:class` and `showhide` target pattern. For example, show a "Link URL" field only when the author selects "Custom
Link" from a dropdown:

```xml
<!-- The controlling field: a select dropdown -->
<linkType jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/select"
          fieldLabel="Link Type"
          name="./linkType"
          granite:class="cq-dialog-dropdown-showhide">
    <granite:data jcr:primaryType="nt:unstructured"
                  cq-dialog-dropdown-showhide-target=".link-type-showhide-target"/>
    <items jcr:primaryType="nt:unstructured">
        <none jcr:primaryType="nt:unstructured"
              text="None" value="none"/>
        <page jcr:primaryType="nt:unstructured"
              text="Page Link" value="page"/>
        <custom jcr:primaryType="nt:unstructured"
                text="Custom URL" value="custom"/>
    </items>
</linkType>

<!-- Shown only when linkType = "page" -->
<pagePath jcr:primaryType="nt:unstructured"
          sling:resourceType="granite/ui/components/coral/foundation/form/pathfield"
          fieldLabel="Page"
          name="./pagePath"
          rootPath="/content"
          granite:class="hide link-type-showhide-target">
    <granite:data jcr:primaryType="nt:unstructured"
                  showhidetargetvalue="page"/>
</pagePath>

<!-- Shown only when linkType = "custom" -->
<customUrl jcr:primaryType="nt:unstructured"
           sling:resourceType="granite/ui/components/coral/foundation/form/textfield"
           fieldLabel="Custom URL"
           name="./customUrl"
           granite:class="hide link-type-showhide-target">
    <granite:data jcr:primaryType="nt:unstructured"
                  showhidetargetvalue="custom"/>
</customUrl>
```

How it works:

1. The controlling field has `granite:class="cq-dialog-dropdown-showhide"` and a `granite:data` child that specifies the
   CSS target class via `cq-dialog-dropdown-showhide-target`
2. Each conditional field has `granite:class="hide <target-class>"` (hidden by default) and a `granite:data` child with
   `showhidetargetvalue` matching the dropdown value that should reveal it
3. AEM's built-in `cq-dialog-dropdown-showhide` client library handles the show/hide logic automatically

## Hiding inherited dialog fields

When your proxy component extends a Core Component and you want to **remove** a field from the inherited dialog, use
`granite:hide`:

```xml
<!-- In your proxy component's _cq_dialog/.content.xml, target the inherited field by node name -->
<subtitle jcr:primaryType="nt:unstructured"
          granite:hide="{Boolean}true"/>
```

This hides the `subtitle` field without needing to rewrite the entire dialog. The field must be referenced by the same
node name used in the parent dialog.

## Summary

You learned:

- Dialog **structure** -- the nested XML hierarchy of containers, tabs, and fields
- Common **field types**: textfield, textarea, RTE, numberfield, checkbox, select, pathfield, file upload, datepicker,
  colorfield, hidden
- **Tabs** for organizing fields into logical groups
- **Multifield** for repeatable field groups
- The **`name` attribute** and how it maps to JCR properties
- A complete **Hero component dialog** example
- **Conditional visibility** with the dropdown show/hide pattern
- **`granite:hide`** for removing inherited dialog fields in proxy components

Next up: [Sling Models](./07-sling-models.md) -- injecting content into Java models, common annotations, adapters,
exporters, and best practices.
