---
title: "Search & Indexing"
sidebar_label: "Search & Indexing"
description: Querying content with QueryBuilder and JCR-SQL2, why unindexed queries are dangerous, and how to define and deploy the Oak indexes that keep queries fast.
slug: /aem/beginners-guide/search-and-indexing
tags: [aem, beginners]
keywords:
    - aem query
    - aem querybuilder
    - aem oak index
    - jcr-sql2
    - aem traversal
sidebar_position: 14
---

# Search & Indexing

You now have pages, assets, and Content Fragments. The moment you build a navigation, a "related
articles" list, or a search page, you run a **query** -- and a query that is not backed by an **index**
can quietly bring an instance to its knees. This chapter is the beginner's view; the
[Search & Indexing](../content/search-and-indexing.mdx) reference goes deeper.

## Ways to query

| API | Looks like | Use it for |
|-----|-----------|------------|
| **QueryBuilder** | A map of predicates | Most application code -- readable, composable, paginated |
| **JCR-SQL2** | SQL-ish text | Complex conditions, scripts, the Groovy Console |
| **XPath** | XPath 2.0 | Legacy; avoid in new code |

All three run on the same Oak query engine and use the same indexes. QueryBuilder is the default in
AEM application code:

```java
Map<String, String> params = new HashMap<>();
params.put("path", "/content/mysite");
params.put("type", "cq:Page");
params.put("property", "jcr:content/cq:template");
params.put("property.value", "/conf/mysite/settings/wcm/templates/article");
params.put("orderby", "@jcr:content/cq:lastModified");
params.put("orderby.sort", "desc");
params.put("p.limit", "10");

SearchResult result = queryBuilder
    .createQuery(PredicateGroup.create(params), resourceResolver.adaptTo(Session.class))
    .getResult();
```

The equivalent JCR-SQL2 (see [The JCR & Sling](./02-jcr-and-sling.md) for syntax):

```sql
SELECT * FROM [cq:Page] AS page
WHERE ISDESCENDANTNODE(page, '/content/mysite')
  AND page.[jcr:content/cq:template] = '/conf/mysite/settings/wcm/templates/article'
ORDER BY page.[jcr:content/cq:lastModified] DESC
```

## Why unindexed queries are dangerous

Oak does not index every property. If no index matches your query, Oak **traverses** the content tree
node by node and logs:

```text
Traversed 10000 nodes ... consider creating an index or changing the query
```

On a large repository this is slow on author and can **take down publish** under traffic. Treat the
warning as a bug to fix, not noise.

:::danger Never ship a traversal to production
A query that traverses thousands of nodes per request will not survive real traffic. Always confirm a
query is index-backed before you ship it.
:::

## What an index is

An Oak index is a definition under `/oak:index` that tells the query engine how to look up nodes by
certain properties without scanning the tree. The two you will use:

- **Property index** -- fast exact-match on one or few properties.
- **Lucene index** -- the standard custom index in AEM; supports exact match, sorting, and full-text.

### A simple property index

```xml title="ui.apps/.../jcr_root/_oak_index/mysiteTemplate/.content.xml"
<?xml version="1.0" encoding="UTF-8"?>
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:oak="http://jackrabbit.apache.org/oak/ns/1.0"
          jcr:primaryType="oak:QueryIndexDefinition"
          type="property"
          propertyNames="[cq:template]"
          reindex="{Boolean}true"/>
```

### A Lucene index (property + sort)

```xml title="ui.apps/.../jcr_root/_oak_index/mysiteArticle-custom-1/.content.xml"
<jcr:root xmlns:jcr="http://www.jcp.org/jcr/1.0" xmlns:nt="http://www.jcp.org/jcr/nt/1.0"
          xmlns:oak="http://jackrabbit.apache.org/oak/ns/1.0"
          jcr:primaryType="oak:QueryIndexDefinition"
          type="lucene"
          async="[async]"
          compatVersion="{Long}2"
          evaluatePathRestrictions="{Boolean}true">
    <indexRules jcr:primaryType="nt:unstructured">
        <cq:Page jcr:primaryType="nt:unstructured">
            <properties jcr:primaryType="nt:unstructured">
                <template jcr:primaryType="nt:unstructured"
                          name="jcr:content/cq:template"
                          propertyIndex="{Boolean}true"/>
                <lastModified jcr:primaryType="nt:unstructured"
                              name="jcr:content/cq:lastModified"
                              ordered="{Boolean}true"
                              type="Date"/>
            </properties>
        </cq:Page>
    </indexRules>
</jcr:root>
```

Commit index definitions to Git under `ui.apps` and deploy them like any other code -- never
hand-create them in CRXDE on a real environment (they will drift and be lost on deploy). On AEM as a
Cloud Service, custom indexes must follow the `<name>-custom-<N>` naming convention.

## Check your query with Explain Query

Before shipping, run the query through the **Explain Query** tool to confirm it uses an index and is
not traversing:

```text
/libs/granite/operations/content/diagnosistools/queryExplainTool.html
```

Paste your query; the tool reports which index is used (or warns about a traversal) and the estimated
cost.

## Best practices

- **Constrain by `path` and `type`** -- the tightest scope is the cheapest query.
- **Index for the exact filter + sort** your code runs, then verify with Explain Query.
- **Paginate** with `p.limit`; never load an unbounded result set.
- **Reindex off-peak** -- it is I/O heavy.
- Prefer **one well-designed Lucene index** over many tiny property indexes.

## Summary

You learned:

- The three query options (**QueryBuilder**, **JCR-SQL2**, XPath) and when to use each
- Why an **unindexed query traverses** the repository and is dangerous in production
- The difference between a **property index** and a **Lucene index**, with deployable examples
- How to verify a query with the **Explain Query** tool
- Indexing **best practices** and the AEMaaCS naming convention

## Official Documentation

- [Content Search & Indexing (Experience League)](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/operations/indexing)
- [Oak Query & Indexing (Apache Jackrabbit Oak)](https://jackrabbit.apache.org/oak/docs/query/query-engine.html)
- [Search & Indexing deep dive](../content/search-and-indexing.mdx) - full index definitions and tooling on this site

Next up: [Multi-Site Manager & i18n](./15-multi-site-manager-and-i18n.md) - Blueprints, Live Copies,
language copies, and the translation framework.
