---
title: Multi-Site-Manager
keywords: [ 'Multi-Site-Manager', 'MSM' ]
---
# Multi-Site-Manager | MSM

> Rollout — The process Synchronizes from the source to the live copy, Can be triggered by an author (on a blueprint
> page) or by a system event (as defined by the rollout configuration).

> Synchronize — manual request for synchronization, made from the live copy pages. The changes from the master pages are
> synchronized to the live copy pages.

The product default 'Standard Rollout Configuration' is located here `/libs/msm/wcm/rolloutconfigs/default`.

## Custom Rollout Configuration

1. Copy the default rollout action from `/libs/msm/wcm/rolloutconfigs/default` to
   `/apps/msm/<your-project>/rolloutconfigs/default`
2. Add this folder to the `filter.xml` -> `<filter root="/apps/msm/<your-project>"/>`
3. Customize the actions as needed
    - You could add [your custom action](#custom-rollout-action) like this:
      `<CustomAction jcr:primaryType="cq:LiveSyncAction"/>`. Node equals your `LiveActionFactory.LIVE_ACTION_NAME`

**Execution Order**

Rollout Configs are being executed in the order of their jcr node structure.
You can specify this order in your `sling:orderedFolder` node in your repository at
`apps/msm/<your-project>/rolloutconfigs/.content.xml`

```xml title="apps/msm/<your-project>/rolloutconfigs/.content.xml"
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:sling="http://sling.apache.org/jcr/sling/1.0"
          jcr:primaryType="sling:OrderedFolder"
          jcr:title="Rollout Configurations">
    <pageMove/>
    <default/>
    <customRolloutConfig/>
</jcr:root>
```

### Structural Changes and Page Moves

The default "Standard Rollout Configuration" does not handle page moves.
Please read
the [official documentation](https://experienceleague.adobe.com/en/docs/experience-manager-65/content/sites/administering/introduction/msm-best-practices#structure-changes-and-rollouts)
for further explanation.

> Moving pages in a blueprint will not result in corresponding pages being moved in live copies after rollout with
> standard rollout configuration:

> The reason for this behavior is that a page move implicitly includes a page delete. This could potentially lead to
> unexpected behavior on publish, as deleting pages on author automatically deactivates corresponding content on publish.
> This can also have a knock-on effect on related items such as links, bookmarks, and others.

1. Create a custom rollout configuration
2. Add **only** the product `<PageMoveAction jcr:primaryType="cq:LiveSyncAction"/>`
3. Add or set the rollout configurations on your live-copy page properties.

```xml title="/apps/msm/<your-project>/rolloutconfigs/pageMove"
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:cq="http://www.day.com/jcr/cq/1.0"
          cq:trigger="rollout"
          jcr:description="ThePageMoveAction applies when a page has been moved in the blueprint.
The action copies rather than moves the (related) Live Copy page from the location before the move to the location after.
The PageMoveAction does not change the Live Copy page at the location before the move. Therefore, for consecutive rollout configurations it has the status of a live relationship without a blueprint."
          jcr:primaryType="cq:RolloutConfig"
          jcr:title="PageMove Rollout Config">
    <PageMoveAction jcr:primaryType="cq:LiveSyncAction"/>
</jcr:root>
```

## Custom Rollout Action

Do create a custom rollout action, the following steps are required:

1. Implement a `com.day.cq.wcm.msm.api.LiveActionFactory`
2. Implement a `com.day.cq.wcm.msm.api.LiveAction`
3. Add this action to a custom rollout configuration

```java title="core/src/main/java/com/core/listeners/rollout/CustomActionFactory.java"
package com.core.listeners.rollout;

import com.day.cq.wcm.api.WCMException;
import com.day.cq.wcm.msm.api.ActionConfig;
import com.day.cq.wcm.msm.api.LiveAction;
import com.day.cq.wcm.msm.api.LiveActionFactory;
import com.day.cq.wcm.msm.api.LiveRelationship;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.commons.json.JSONException;
import org.apache.sling.commons.json.io.JSONWriter;
import org.osgi.service.component.annotations.Component;

@Component(
    service = LiveActionFactory.class,
    immediate = true,
    property = {
        LiveActionFactory.LIVE_ACTION_NAME + "=" + CustomActionFactory.ACTION_NAME,
    }
)
public class CustomActionFactory implements LiveActionFactory<LiveAction> {

    static final String ACTION_NAME = "CustomAction";

    @Override
    public String createsAction() {
        return ACTION_NAME;
    }

    @Override
    public LiveAction createAction(final Resource resource) {
        return new CustomAction();
    }

    private static final class CustomAction implements LiveAction {
        @Override
        public String getName() {
            return ACTION_NAME;
        }

        @Override
        public void execute(final Resource source, final Resource target, final LiveRelationship relation, final boolean autoSave, final boolean isResetRollout) throws WCMException {
            // implement your custom logic here
        }
        
        // The following overlays are required due to implemented product interface
        
        /************* Deprecated *************/
        @Deprecated
        @Override
        public void execute(final ResourceResolver resolver, final LiveRelationship relation, final ActionConfig config, final boolean autoSave) throws WCMException {
        }

        @Deprecated
        @Override
        public void execute(final ResourceResolver resolver, final LiveRelationship relation, final ActionConfig config, final boolean autoSave, final boolean isResetRollout) throws WCMException {
        }

        @Deprecated
        @Override
        public String getTitle() {
            return "";
        }

        @Deprecated
        @Override
        public int getRank() {
            return 0;
        }

        @Deprecated
        @Override
        public String[] getPropertiesNames() {
            return new String[0];
        }

        @Deprecated
        @Override
        public String getParameterName() {
            return "";
        }

        @Deprecated
        @Override
        public void write(final JSONWriter out) throws JSONException {
        }
    }
}
```

## Links

- [Best Practices](https://experienceleague.adobe.com/en/docs/experience-manager-65/content/sites/administering/introduction/msm-best-practices)
- [Creating a new Rollout Configuration](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/implementing/configuring-and-extending/msm#creating-a-new-rollout-configuration)
- [Rollout cq:trigger Enum](https://developer.adobe.com/experience-manager/reference-materials/6-5/javadoc/com/day/cq/wcm/msm/api/RolloutManager.Trigger.html)
- [Product Rollout Actions](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/sites/administering/reusing-content/msm/live-copy-sync-config#synchronization-actions)
