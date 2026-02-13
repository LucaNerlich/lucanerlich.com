---
title: Cloud Sandbox Setup
sidebar_position: 1
tags: [ aem, setup, cloud-development, sandbox ]
---

# Cloud Sandbox Setup

This post describes how to setup a Cloud Sandbox development environment.
It is required, that your company or organization has assigned you a Cloud Sandbox environment.
In most cases, these are not _self-service_ and need to be payed for.

<div class="alert alert--warning" role="alert">
This guide assumes you have access to a Cloud Sandbox environment and are familiar with AEM development.
This guide additionally assumes, that you have Maven 3 and Java JDK 21 installed.
</div>

## General Setup Steps

1. Download the latest AEM SDK from
   the [Adobe Software Distribution](https://experience.adobe.com/#/downloads/content/software-distribution/en/aemcloud.html),
   login using your Adobe Account / SSO.
    - At the time of writing, the latest version is `AEM SDK for AEM v2026.2.24288.20260204T121510Z-260100`
2. Ensure you have access or are able to create a new sandbox via
   the [Experience Cloud](https://experience.adobe.com/) - Cloud Manager.
    - Note, when unused, it is possible that the sandbox might get deleted automatically.
3. In your Cloud Manager Program, note down your Git Repository information, via 'Program -> Overview -> Pipelines ->
   `{} Access Repo Info`'.
    - You will need the URL and Password, to setup the Cloud Git as a second origin later.
    - I suggest to also setup a personal repository (in GitHub etc) to store your code, in case your Sandbox gets
      archived.
4. Create a new local AEM project, buy using the Maven AEM Archetype.
    - For a more in-depth guide, read my [local development setup post](./aem-dev-setup.md).
    - https://github.com/adobe/aem-project-archetype
    - https://experienceleague.adobe.com/en/docs/experience-manager-core-components/using/developing/archetype/overview
5. Boot up a local Author and Publish instance
6. Deploy your initial maven archetype code to the local Author instance
    - `mvn clean install -PautoInstallSinglePackage`
7. Initialize your local Git repository and push your code to your private repository
8. Add your Cloud Git repository as a second origin to your local Git repository
    1. `git remote add cloudmanager https://git.cloudmanager.adobe.com/some-org/some-program`
    2. `git push cloudmanager main`
9. Create a new deployment pipeline in Cloud Manager and deploy your main branch

### Example Maven Archetype Command

```bash
mvn -B org.apache.maven.plugins:maven-archetype-plugin:3.3.1:generate \
 -D archetypeGroupId=com.adobe.aem \
 -D archetypeArtifactId=aem-project-archetype \
 -D archetypeVersion=56\
 -D appTitle="My Site" \
 -D appId="mysite" \
 -D groupId="com.mysite" \
 -D includeExamples="y" \
 -D includeErrorHandler="y" \
 -D datalayer="n"
```


