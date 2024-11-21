# Extending the Responsive Grid

When implementing custom components during a project, one task that often pops up, is the need for implementing a
custom 'container' component. This would allow authors to drag and drop child components, instead of authoring content
only via the dialog.

## Issue

In some situations, it might be easier for the AEM editor to create and author content by placing grouped content in
subcomponents, instead of cramming everything into one huge dialog. As a developer, it is necessary to reuse a
responsive grid / parsys, as well as enrich it with needed additional properties.

A classic example is a footer "quicklinks" container, take a look at the adobe footer for example

![adobe-footer](/images/aem/responsive-grid/adobe-footer.jpg)

It consists of five columns, each with *n* Link + Title entries. We could build this in one big dialog, with either a
tab for each column, a multifield with sets of entries or some other combination of dynamic + static content authoring.

## Solution

A possible smarter move here is, to separate this arrangement into reusable components. A single container and *n*
columns. The container itself might include some configuration parameters, such as a title, the amount of displayed
columns, a logo image etc, whereas a single column component is responsible for its collection of link entries, its
title and so one.

By placing the container component on a page, an author can now drag and drop any amount of column components into it.
The author is also able to leverage the responsive grid layout system to rearange the columns based on each device
viewport, as well as reordering them.

From an editors perspective, this solution allows for more freedom and ease of use, while content authoring.

This solution is a little more complex on development side, than having a hardcoded list of columns, but it is highly
flexible and can easily be reused and transformed for a multitude of situations.

### JCR Nodes

The final assembly of jcr nodes is very simple, our container component and *n* child resources, in this case '
quicklinkcolumns'.

![container-jcr](/images/aem/responsive-grid/quicklinkscontainer-jcr.jpg)

### Java Sling Model

The core of this approach is the integration of the responsive grid in our sling model. Since we want to export
additional properties (just 'text' in this case), we need to write our own sling model and also export the responsive
grid properties.

To avoid any duplicate code oder manualy delegation via accessing the object and exposing variables via getter methods,
we combine a couple of annotations. We use `@Self` to inject the responsiveGrid from the request itself. `@Via` to
reference a its resource and most
importantly [Lomboks @Delegate](https://projectlombok.org/features/experimental/Delegate) to forward all methods we
implemented from the ContainerExporter to the responsiveGrid. Additionally, we need to exclude the call
to `getExportedType()`, because we need to keep the QuicklinksContainers own resourceType during .model.json export.

```java
public class QuicklinksContainer {
  // [...]
  interface Excluded {
         String getExportedType();
  }

  @Self
  @Via(type = ResourceSuperType.class)
  @Delegate(types = ResponsiveGridExporter.class, excludes = Excluded.class)
  private ResponsiveGrid responsiveGrid;
  // [...]
}
```

The following is our finalized sling model. For demonstration purposes, it also references an OSGi service.

```java
package com.mysite.core.models.quicklinks;

import com.adobe.cq.export.json.ComponentExporter;
import com.adobe.cq.export.json.ContainerExporter;
import com.adobe.cq.export.json.ExporterConstants;
import com.day.cq.wcm.foundation.model.responsivegrid.ResponsiveGrid;
import com.day.cq.wcm.foundation.model.responsivegrid.export.ResponsiveGridExporter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mysite.core.services.ImageService;
import lombok.experimental.Delegate;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.models.annotations.DefaultInjectionStrategy;
import org.apache.sling.models.annotations.Exporter;
import org.apache.sling.models.annotations.Model;
import org.apache.sling.models.annotations.Via;
import org.apache.sling.models.annotations.injectorspecific.OSGiService;
import org.apache.sling.models.annotations.injectorspecific.Self;
import org.apache.sling.models.annotations.injectorspecific.ValueMapValue;
import org.apache.sling.models.annotations.via.ResourceSuperType;

@Model(adaptables = SlingHttpServletRequest.class,
        adapters = {QuicklinksContainer.class, ComponentExporter.class, ContainerExporter.class},
        resourceType = QuicklinksContainer.RESOURCE_TYPE,
        defaultInjectionStrategy = DefaultInjectionStrategy.OPTIONAL)
@Exporter(name = ExporterConstants.SLING_MODEL_EXPORTER_NAME, extensions = ExporterConstants.SLING_MODEL_EXTENSION)

public class QuicklinksContainer implements ComponentExporter, ContainerExporter {
    
    interface Excluded {
        String getExportedType();
    }
    
    public static final String RESOURCE_TYPE = "mysite/components/quicklinks/quicklinkscontainer";
    
    @OSGiService
    @JsonIgnore
    private ImageService imageService;
    
    @Self
    @Via(type = ResourceSuperType.class)
    @Delegate(types = ResponsiveGridExporter.class, excludes = Excluded.class)
    private ResponsiveGrid responsiveGrid;
    
    @ValueMapValue
    public String text;
    
    public String getText() {
        return text;
    }
    
    @Override
    public String getExportedType() {
        return RESOURCE_TYPE;
    }
}
```

### React Component

The corresponding React component extends the responsiveGrid provided by Adobe. In this we reference our custom
property 'text. Furthermore, we need to pass all container props (exported by our responsiveGrid from the Java Sling
Model) to the targeted div -> our new custom responsive grid container. `this.childComponents`
and `this.placeholderComponent` directly call
into `ui.frontend/node_modules/@adobe/aem-react-editable-components/dist/components/Container.d.ts`.

Using this method, we can handle and our additonal properties and customize the responsive grids wrapping dom, as well
as forwarding all needed properties to the responsiveGrid itself.

```jsx
import {MapTo, ResponsiveGrid, withComponentMappingContext} from '@adobe/aem-react-editable-components';
import React from "react";

const ContainerConfig = {
    emptyLabel: 'Quicklinks Container',

    isEmpty: function (props) {
        return !props || !props[':itemsOrder'] || props[':itemsOrder'].length === 0;
    }
};

export default class QuicklinksContainer extends ResponsiveGrid {

    render() {
        if (ContainerConfig.isEmpty(this.props)) {
            return (
                <div>
                    Quicklinks Container
                </div>
            );
        }
        return (
            <div>
                <h1>{this.props.text}</h1>

                <div {...this.containerProps}>
                    {this.childComponents}
                    {this.placeholderComponent}
                </div>
            </div>
        );
    }
}

MapTo('mysite/components/quicklinks/quicklinkscontainer')(withComponentMappingContext(QuicklinksContainer), ContainerConfig);
```

### .model.json export

To wrap things up, the following .model.json snippet demonstrates our exported QuicklinksContainer, including the needed
responsiveGrid properties and classes, as well as all child resources, which were placed in the responsiveGrid by the
aem editor.

```json
{
    "text": "My custom footer",
    "columnClassNames": {
        "quicklinkscolumn2": "aem-GridColumn aem-GridColumn--default--12",
        "quicklinkscolumn1": "aem-GridColumn aem-GridColumn--default--12"
    },
    "exportedAllowedComponents": {
        "applicable": false,
        "components": []
    },
    "columnCount": 12,
    "gridClassNames": "aem-Grid aem-Grid--12 aem-Grid--default--12",
    ":type": "mysite/components/quicklinks/quicklinkscontainer",
    ":itemsOrder": [
        "quicklinkscolumn1",
        "quicklinkscolumn2"
    ],
    ":items": {
        "quicklinkscolumn1": {
            "linksPath": {
                "jcr:primaryType": "nt:unstructured",
                "item0": {
                    "jcr:primaryType": "nt:unstructured",
                    "path": "/content/mysite/fr/en/home",
                    "title": "link1"
                },
                "item1": {
                    "jcr:primaryType": "nt:unstructured",
                    "path": "/content/mysite/fr/en/discover",
                    "title": "link2"
                }
            },
            "title": "My Column",
            ":type": "mysite/components/quicklinks/quicklinkscolumn"
        },
        "quicklinkscolumn2": {
            "linksPath": {
                "jcr:primaryType": "nt:unstructured",
                "item0": {
                    "jcr:primaryType": "nt:unstructured",
                    "path": "/content/mysite/fr/en/home",
                    "title": "link 3"
                },
                "item1": {
                    "jcr:primaryType": "nt:unstructured",
                    "path": "/content/mysite/fr/en/home",
                    "title": "link 4"
                }
            },
            "title": "Second Link Column",
            ":type": "mysite/components/quicklinks/quicklinkscolumn"
        }
    }
}
```

Thanks for reading!

luca

## Links & Downloads

- [AEM Responsive Grid System](https://adobe-marketing-cloud.github.io/aem-responsivegrid/)
- [Official Documentation - Responsive Layout](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/sites/authoring/features/responsive-layout.html#authoring)
