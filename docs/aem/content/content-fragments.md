---
title: Content Fragments
sidebar_position: 3
tags: [aem, content-fragments, headless]
---

# Content Fragments

> Creating and Managing Content Fragments in AEM with Java

Content Fragments in Adobe Experience Manager provide a powerful way to manage structured content. This guide
demonstrates how to programmatically create and relate content fragments using Java.

The code has been shortened for the sake of readability. Add proper logging statements if necessary.

## Creating a Content Fragment

```java
private ContentFragment createFragment(
    ResourceResolver resolver,
    String modelPath,
    String folderPath,
    String title,
    Consumer<ContentFragment> contentSetter) {
    
    // Resolve the model resource
    final Resource modelResource = resolver.resolve(modelPath);
    if (ResourceUtil.isNonExistingResource(modelResource)) {
        return null;
    }

    // Get the fragment template
    final FragmentTemplate template = modelResource.adaptTo(FragmentTemplate.class);
    if (template == null) {
        return null;
    }

    // Create unique name for the fragment
    final String uniqueName = ResourceUtil.createUniqueChildName(
        resolver.resolve(folderPath), 
        title
    );

    // Create the fragment
    final ContentFragment fragment = template.createFragment(
        resolver.resolve(folderPath),
        uniqueName,
        title
    );

    // Set content fields if provided
    if (contentSetter != null) {
        contentSetter.accept(fragment);
    }

    return fragment;
}
```

## Setting Text Content

To set text content on a fragment field:

```java
private void setTextContent(ContentFragment fragment, String elementName, String content) {
    fragment.getElement(elementName).setContent(content, "text/plain");
}
```

## Creating References Between Fragments

One of the most powerful features is the ability to reference other fragments:

```java
private void setFragmentReferences(ContentFragment fragment, String elementName, List<ContentFragment> references) {
    // Filter out any null references
    List<ContentFragment> validRefs = references.stream()
        .filter(Objects::nonNull)
        .collect(Collectors.toList());

    if (validRefs.isEmpty()) {
        return;
    }

    // Set the references
    final FragmentData value = fragment.getElement(elementName).getValue();
    final String[] paths = validRefs.stream()
        .map(ref -> ref.adaptTo(Resource.class).getPath())
        .toArray(String[]::new);
    value.setValue(paths);
    fragment.getElement(elementName).setValue(value);
}
```

## Complete Example

Here's a complete example for creating a parent fragment with child fragments:

```java
// 1. Create resource resolver
try (ResourceResolver resolver = getServiceResolver()) {
    // 2. Create base folder structure
    Resource parentFolder = setupFolders(resolver);
    
    // 3. Create main content fragment
    ContentFragment mainFragment = createFragment(
        resolver,
        "/conf/models/my-parent-model",
        parentFolder.getPath(),
        "Main Fragment",
        fragment -> {
            setTextContent(fragment, "title", "My Fragment Title");
            setTextContent(fragment, "description", "This is the main fragment");
        }
    );
    
    // 4. Create child fragments
    List<ContentFragment> childFragments = new ArrayList<>();
    for (int i = 0; i < 3; i++) {
        ContentFragment child = createFragment(
            resolver,
            "/conf/models/child-model",
            parentFolder.getPath() + "/children",
            "Child " + i,
            fragment -> {
                setTextContent(fragment, "title", "Child " + i);
                setTextContent(fragment, "content", "Content for child " + i);
            }
        );
        childFragments.add(child);
    }
    
    // 5. Link child fragments to parent
    setFragmentReferences(mainFragment, "children", childFragments);
    
    // 6. Commit changes
    resolver.commit();
}
```

## Best Practices

- Always handle exceptions properly
- Create logical folder structures for your fragments
- Use unique names for fragments
- Validate input before creating fragments
- Check for null references before setting them
- Use a dedicated service user when mutating content

## See also

- [GraphQL](./graphql.mdx)
- [Node operations](./node-operations.mdx)
- [Replication and activation](./replication-activation.mdx)
