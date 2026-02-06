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
properties.put("group.1_property.value", "some-property-value1);
properties.put("group.2_property", "some-property-name2");
properties.put("group.2_property.value", "some-property-value2);

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

When the query does not need to be sanitized,
`resourceResolver.findResources()` can be used
to query content in a simpler way which is more similar to a classic SQL query.

The below query searches for nodes below a given path.
These nodes need to have the resourceType of the TestModel and the nodes paths needs to include the given locale.

```java
final String myQuery = "SELECT * FROM [nt:base] AS s " +
                "WHERE ISDESCENDANTNODE([/content/experience-fragments]) " +
                "AND [sling:resourceType] = '" + TestModel.RESOURCE_TYPE + "'  " +
                "AND [jcr:path] LIKE '%" + locale.toLowerCase() + "%'";
final Iterator<Resource> questionResources = request.getResourceResolver().findResources(myQuery, Query.JCR_SQL2);
```

## Session API / JCR API

To use the JCR API, add the jackrabbit-standalone-2.4.0.jar file to your Java application’s class path. You can obtain
this JAR file from the Java JCR API web page at [jackrabbit.apache.org](https://jackrabbit.apache.org/jcr/jcr-api.html).

```java
import javax.jcr.Repository;
import javax.jcr.Session;
import javax.jcr.SimpleCredentials;
import javax.jcr.Node;

import org.apache.jackrabbit.commons.JcrUtils;
import org.apache.jackrabbit.core.TransientRepository;

// class XX function yy

try {
    //Create a connection to the CQ repository running on local host
    Repository repository = JcrUtils.getRepository("http://localhost:4503/crx/server");

    //Create a Session
    javax.jcr.Session session = repository.login(new SimpleCredentials("admin", "admin".toCharArray()));

    //Create a node that represents the root node
    Node root = session.getRootNode();

    // Store content
    Node adobe = root.addNode("adobe");
    Node day = adobe.addNode("day");
    day.setProperty("message", "Adobe CQ is part of the Adobe Digital Marketing Suite!");

    // Retrieve content
    Node node = root.getNode("adobe/day");
    System.out.println(node.getPath());
    System.out.println(node.getProperty("message").getString());

    // Save the session changes and log out
    session.save();
    session.logout();
} catch (Exception e) {
  e.printStackTrace();
}

Avoid hardcoding credentials in production code; use service users and configuration instead.
```

## Groovy Console

[Groovy Console Github](https://github.com/icfnext/aem-groovy-console)

Simple Query Example

```groovy
/*
SQL QUERY with Groovy Script.
@author Hashim Khan */
/*This method is used to Query the JCR and find results as per the Query.*/
def buildQuery(page, term) {
    def queryManager = session.workspace.queryManager;
    def statement = 'select * from nt:base where jcr:path like \'' + page.path + '/%\' and sling:resourceType = \'' + term + '\'';
    /*Here term is the sling:resourceType property value*/
    queryManager.createQuery(statement, 'sql');
}

/*Defined Content Hierarchy */
final def page = getPage('/content/geometrixx/en/')
/*Template which is searched in the content hierarchy */
final def query = buildQuery(page, 'geometrixx/components/contentpage');
final def result = query.execute()
final def count = result.getRows().getSize();

println 'No Of pages found = ' + result.nodes.size();

result.nodes.each {
    node - >
        println 'nodePath::' + node.path
}
```

// > delete all jcr:language props below backoffice

```groovy
//delete all jcr:language props below backoffice
import javax.jcr.Session

Session session = slingRequest.getResourceResolver().adaptTo(Session.class)

def buildQuery() {
    def queryManager = session.workspace.queryManager

    def statement = "/jcr:root/content/eurowings//*[@jcr:language]"
    queryManager.createQuery(statement, 'xpath')
}

final def query = buildQuery()
final def result = query.execute()

result.nodes.each { node ->
    String nodePath = node.path
    if (nodePath.contains('backoffice')) {
        println 'Deleting prop below  :' + nodePath
        node.getProperty('jcr:language').remove()
        session.save()
    }
}
```

[Further Groovy Examples on Github](https://github.com/hashimkhan786/aem-groovy-scripts)

## Delete Inbox Notifications

To delete AEM Inbox Notifications, just delete `/var/taskmanagement/tasks`.
Locally via CRX/DE and on deployed environments via "empty" Content-Package.

## References

[^1]  https://experienceleague.adobe.com/docs/experience-manager-65/deploying/practices/best-practices-for-queries-and-indexing.html?lang=en#jcrquerycheatsheet>

## See also

- [Architecture](../architecture.mdx)
- [Node operations](./node-operations.mdx)
- [Content fragments](./content-fragments.md)
- [Replication and activation](./replication-activation.mdx)
- [GraphQL](./graphql.mdx)
- [Sling models](../backend/sling-models.mdx)
- [Groovy console](../groovy-console.mdx)
- [Security basics](../infrastructure/security.mdx)
