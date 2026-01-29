---
title: Dynamic PathBrowser RootPath
sidebar_position: 5
tags: [aem, ui, dialogs]
---

# Dynamic PathBrowser (PathField) RootPath

The Granite [Pathfield](https://lucanerlich.com/aem/component-dialogs/#pathfield) has a property called `rootPath`.
This determines the root folder / path of the pathfield, when the user opens the widget. However, this value is hardcoded serverside, via the dialog.xml and cannot be changed via JavaScript.

We therefore need a way to change the rootPath dynamically.

![img.png](attachments/dynamic-rootpath.png)

## Solution

We need to define a custom resource type and use it on our dialog.xml structure

```xml title="apps/my.sites/components/some-component/_cq_dialog/.content.xml"
<link1 jcr:primaryType="nt:unstructured"
    sling:resourceType="my.sites/widgets/pathbrowser-dynamic"
    fieldLabel="Some Link"
    name="./someLink"/>
```

## See also

- [Component dialogs](../component-dialogs.mdx)
- [Touch UI (Author UI)](./touch-ui.mdx)

In your `ui.apps` add a new component:

```xml title="apps/my.sites/widgets/pathbrowser-dynamic/.content.xml"
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:sling="http://sling.apache.org/jcr/sling/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
          xmlns:jcr="http://www.jcp.org/jcr/1.0"
          jcr:primaryType="nt:unstructured"
          sling:resourceSuperType="granite/ui/components/coral/foundation/form/pathfield"/>
```

```jsp title="apps/my.sites/widgets/pathbrowser-dynamic/pathbrowser-dynamic.jsp"
<%@page session="false"
        import="org.apache.commons.lang3.StringUtils,
                org.apache.sling.api.SlingHttpServletRequest,
                org.apache.sling.api.resource.Resource,
                org.apache.sling.api.resource.ResourceWrapper,
                org.apache.sling.api.resource.ValueMap,
                org.apache.sling.api.wrappers.ValueMapDecorator,
                java.util.HashMap" %>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %>
<%@taglib prefix="cq" uri="http://www.day.com/taglibs/cq/1.0" %>
<cq:defineObjects/>
<sling:defineObjects/>
<%
    final String computedRootPath = computeRootPath(slingRequest);
    final ValueMap original = resource.getValueMap();
    final HashMap<String, Object> modified = new HashMap<>();

    // Copy all original properties
    for (String key : original.keySet()) {
        modified.put(key, original.get(key));
    }

    // Override rootPath
    modified.put("rootPath", computedRootPath);
    final ValueMap wrappedValueMap = new ValueMapDecorator(modified);

    // Wrap the resource to override properties
    final Resource wrappedResource = new ResourceWrapper(resource) {
        @Override
        public ValueMap getValueMap() {
            return wrappedValueMap;
        }

        @Override
        public <AdapterType> AdapterType adaptTo(Class<AdapterType> type) {
            if (type == ValueMap.class) {
                return (AdapterType) wrappedValueMap;
            }
            return super.adaptTo(type);
        }
    };

    // Forward to the parent component with modified resource
%><sling:include resource="<%= wrappedResource %>"
                 resourceType="granite/ui/components/coral/foundation/form/pathfield"/><%
%>

<%!
    private String computeRootPath(SlingHttpServletRequest request) {
        final String contentPath = getContentPath(request);

        if (StringUtils.isNotBlank(contentPath) && contentPath.startsWith("/content/")) {
            final String[] pathParts = contentPath.split("/");
            if (pathParts.length >= 3) {
                return "/" + pathParts[1] + "/" + pathParts[2];
            }
        }

        // return the default root path
        return "/content/my-site";
    }

    private String getContentPath(SlingHttpServletRequest request) {
        final String referer = request.getHeader("Referer");
        if (StringUtils.isNotBlank(referer) && referer.contains("/editor.html/")) {
            int startIdx = referer.indexOf("/editor.html/") + "/editor.html".length();
            String pathAfterEditor = referer.substring(startIdx);

            int endIdx = pathAfterEditor.indexOf("?");
            if (endIdx == -1) {
                endIdx = pathAfterEditor.indexOf("#");
            }
            if (endIdx > 0) {
                pathAfterEditor = pathAfterEditor.substring(0, endIdx);
            }

            return pathAfterEditor;
        }

        final String item = request.getParameter("item");
        if (StringUtils.isNotBlank(item)) {
            return item;
        }

        return null;
    }
%>
```
