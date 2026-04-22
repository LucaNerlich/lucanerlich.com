---
title: Modify and Query the JCR
sidebar_position: 1
tags: [aem, jcr, repository]
---

# Modify and Query the JCR

## JCR Queries

I highly recommend downloading and "studying"
the [JCR Query Cheatsheet](https://experienceleague.adobe.com/docs/experience-manager-65/assets/JCR_query_cheatsheet-v1.1.pdf) [^1].

### QueryBuilder

The QueryBuilder API executes a query which can be customized via
a [predicates](https://experienceleague.adobe.com/docs/experience-manager-cloud-service/content/implementing/developing/full-stack/search/query-builder-predicates.html?lang=en)
hashmap.
The below configuration creates a query that searches for nodes below a given path,
that have two predefined property key/value pairs.

Using the QueryBuilder is strongly advised when you need to sanitze input.
For example in a servlet, where the user can customize the query via request parameter.

```java
final HashMap<String, String> properties = new HashMap<>();
// predicates
properties.put("path", "/content/mysite");
properties.put("group.1_property", "some-property-name1");
properties.put("group.1_property.value", "some-property-value1");
properties.put("group.2_property", "some-property-name2");
properties.put("group.2_property.value", "some-property-value2");

// config
properties.put("p.offset", "0");
properties.put("p.limit", "-1");
```

The above configuration can be passed to the QueryBuilder.

```java
@Reference
private QueryBuilder builder;

private List<Hit> executeQuery(SlingHttpServletRequest request, HashMap<String, String> properties) {
    final Session session = request.getResourceResolver().adaptTo(Session.class);
    final com.day.cq.search.Query query = builder.createQuery(PredicateGroup.create(properties), session);
    final SearchResult result = query.getResult();
    return result.getHits();
}
```

### SQL2

`resourceResolver.findResources()` runs a JCR-SQL2 query directly. Use it when **all query inputs
are constants under your control** - the JCR-SQL2 grammar has no parameter binding, so any
user-controlled string concatenated into the statement is a query injection risk. For any query
fed by request parameters, use the QueryBuilder above (or pre-validate inputs against a strict
allowlist before building the statement).

The example below only references constants (the resource type and a fixed path), so string
construction is safe:

```java
final String myQuery = "SELECT * FROM [nt:base] AS s " +
                "WHERE ISDESCENDANTNODE([/content/experience-fragments]) " +
                "AND [sling:resourceType] = '" + TestModel.RESOURCE_TYPE + "'";
final Iterator<Resource> results = request.getResourceResolver().findResources(myQuery, Query.JCR_SQL2);
```

If you need to narrow by locale or another caller-supplied value, validate it against an
allowlist first:

```java
// Only accept known locales -- never concatenate raw request input.
private static final Set<String> ALLOWED_LOCALES = Set.of("en", "de", "fr");

if (!ALLOWED_LOCALES.contains(locale)) {
    return Collections.emptyIterator();
}
final String myQuery = "SELECT * FROM [nt:base] AS s " +
                "WHERE ISDESCENDANTNODE([/content/experience-fragments/" + locale + "]) " +
                "AND [sling:resourceType] = '" + TestModel.RESOURCE_TYPE + "'";
```

## Session API / JCR API

Inside an AEM bundle, never open a JCR `Session` directly with credentials. Instead, obtain a
service `ResourceResolver` and adapt it to a `Session` - this gives you a session scoped to a
service user with the minimum privileges it needs. See
[Security basics](../infrastructure/security.mdx) for setting up the service user mapping.

```java
import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

import org.apache.sling.api.resource.LoginException;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ResourceResolverFactory;

import java.util.Map;

@Reference
private ResourceResolverFactory resolverFactory;

private static final Map<String, Object> AUTH_INFO = Map.of(
        ResourceResolverFactory.SUBSERVICE, "my-write-service");

public void writeMessage() {
    try (ResourceResolver resolver = resolverFactory.getServiceResourceResolver(AUTH_INFO)) {
        Session session = resolver.adaptTo(Session.class);
        if (session == null) {
            return;
        }

        Node root = session.getRootNode();
        Node adobe = root.hasNode("adobe") ? root.getNode("adobe") : root.addNode("adobe");
        Node day = adobe.hasNode("day") ? adobe.getNode("day") : adobe.addNode("day");
        day.setProperty("message", "Hello from a service user");

        session.save();
    } catch (LoginException | RepositoryException e) {
        LOG.error("Failed to write message", e);
    }
}
```

:::danger Never use `admin:admin` or `loginAdministrative()`
Hardcoded `admin` credentials and `loginAdministrative()` both grant unrestricted repository
access. Always route access through a sub-service scoped to the minimum privileges it needs.
:::

### Remote access from outside AEM

If you truly need to talk to a running AEM instance from an **external** Java client (migrations,
tooling, tests), connect over HTTP via `JcrUtils.getRepository()` - but treat it as dev-only and
pull credentials from configuration, never source. The default local-SDK author port is `4502`.

```java
import javax.jcr.Repository;
import javax.jcr.Session;
import javax.jcr.SimpleCredentials;
import org.apache.jackrabbit.commons.JcrUtils;

// Credentials come from environment / config -- never hardcode in committed code.
Repository repository = JcrUtils.getRepository("http://localhost:4502/crx/server");
Session session = repository.login(
        new SimpleCredentials(System.getenv("AEM_USER"), System.getenv("AEM_PASS").toCharArray()));
```

## Groovy Console

[Groovy Console Github](https://github.com/orbinson/aem-groovy-console)

:::warning Dev / ops only
The Groovy Console runs arbitrary code as the admin user. Never expose it on Publish, and restrict
access on Author to trusted operators. These examples are written for ad-hoc debugging and
maintenance - don't copy their string-concatenation shape into production servlets.
:::

### Simple query example

Find all pages below a given path that use a specific `sling:resourceType`. Uses `JCR-SQL2` (the
legacy `sql` language is deprecated and gone in modern Oak).

```groovy
def findByResourceType(rootPath, resourceType) {
    def queryManager = session.workspace.queryManager
    def statement = "SELECT * FROM [nt:base] " +
            "WHERE ISDESCENDANTNODE([${rootPath}]) " +
            "AND [sling:resourceType] = '${resourceType}'"
    queryManager.createQuery(statement, 'JCR-SQL2')
}

final def query = findByResourceType('/content/geometrixx/en', 'geometrixx/components/contentpage')
final def result = query.execute()

println "No of pages found = ${result.nodes.size()}"

result.nodes.each { node ->
    println "nodePath:: ${node.path}"
}
```

### Bulk cleanup example

Remove `jcr:language` properties from every node below `/content/eurowings/backoffice`.

```groovy
import javax.jcr.Session

Session session = resourceResolver.adaptTo(Session.class)

def queryManager = session.workspace.queryManager
def statement = "SELECT * FROM [nt:base] " +
        "WHERE ISDESCENDANTNODE([/content/eurowings/backoffice]) " +
        "AND [jcr:language] IS NOT NULL"
def result = queryManager.createQuery(statement, 'JCR-SQL2').execute()

result.nodes.each { node ->
    println "Deleting jcr:language on :: ${node.path}"
    node.getProperty('jcr:language').remove()
}

session.save()
```

[Further Groovy Examples on Github](https://github.com/hashimkhan786/aem-groovy-scripts)

## Delete Inbox Notifications

To delete AEM Inbox Notifications, just delete `/var/taskmanagement/tasks`.
Locally via CRX/DE and on deployed environments via "empty" Content-Package.

## References

[^1]: <https://experienceleague.adobe.com/docs/experience-manager-65/deploying/practices/best-practices-for-queries-and-indexing.html?lang=en#jcrquerycheatsheet>

## See also

- [Architecture](../architecture.mdx)
- [Node operations](./node-operations.mdx)
- [Content fragments](./content-fragments.md)
- [Replication and activation](./replication-activation.mdx)
- [GraphQL](./graphql.mdx)
- [Sling models](../backend/sling-models.mdx)
- [Groovy console](../groovy-console.mdx)
- [Security basics](../infrastructure/security.mdx)
