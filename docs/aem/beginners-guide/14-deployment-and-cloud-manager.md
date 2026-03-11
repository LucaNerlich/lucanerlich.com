---
title: "Deployment & Cloud Manager"
sidebar_label: "Deployment & Cloud Manager"
description: Git repo structure, Cloud Manager pipelines, environments, Rapid Development Environments, content transfer, and going to production.
slug: /aem/beginners-guide/deployment-and-cloud-manager
tags: [aem, beginners]
keywords:
  - aem cloud manager
  - aem deployment
  - aem pipeline
  - aem rapid development environment
  - aem content transfer
sidebar_position: 14
---

# Deployment & Cloud Manager

In AEM as a Cloud Service, you do not deploy by copying files to a server. Instead, you push code to a **Git repository
** and **Cloud Manager** builds, tests, and deploys it through a pipeline. This chapter covers the entire path from code
to production.

## The deployment model

```mermaid
flowchart LR
    Dev["Developer"]
    Git["Git Repository"]
    CM["Cloud Manager"]
    Build["Build & Test"]
    DevEnv["Dev Environment"]
    Stage["Stage Environment"]
    Prod["Production"]

    Dev -->|"git push"| Git
    Git -->|"Triggers"| CM
    CM --> Build
    Build -->|"Deploy"| DevEnv
    DevEnv -->|"Promote"| Stage
    Stage -->|"Approve & promote"| Prod
```

| Step                  | What happens                                                 |
|-----------------------|--------------------------------------------------------------|
| **Push**              | Developer pushes code to the Cloud Manager Git repo          |
| **Build**             | Maven builds the project, runs tests, validates code quality |
| **Deploy to Dev**     | The `all` package is deployed to the development environment |
| **Approve & go live** | Business approval, then deploy to production                 |

## Cloud Manager

Cloud Manager is Adobe's CI/CD platform for AEMaaCS. It provides:

- **Git repository** -- managed Git for your project
- **Build pipelines** -- Maven builds, code quality, security scans
- **Environments** -- dev, stage, production
- **Monitoring** -- logs, metrics, alerts

### Accessing Cloud Manager

1. Log in to [Adobe Experience Cloud](https://experience.adobe.com/)
2. Navigate to **Cloud Manager**
3. Select your program (a program maps to one AEM project)

### Programs and environments

```mermaid
flowchart TD
    Program["Program (My Site)"]
    Dev["Dev Environment"]
    Stage["Stage Environment"]
    Prod["Production Environment"]
    RDE["RDE (Rapid Dev)"]

    Program --> Dev
    Program --> Stage
    Program --> Prod
    Program --> RDE
```

| Environment    | Purpose                                    | Access                |
|----------------|--------------------------------------------|-----------------------|
| **Dev**        | Development and integration testing        | Developers            |
| **Stage**      | Pre-production testing, UAT                | QA team, stakeholders |
| **Production** | Live site                                  | End users             |
| **RDE**        | Rapid Development Env (no pipeline needed) | Developers            |

## Git repository

Cloud Manager provides a managed Git repository. Your project structure maps to it:

```
repository-root/
├── pom.xml
├── core/
├── ui.apps/
├── ui.content/
├── ui.config/
├── ui.frontend/
├── all/
├── dispatcher/
└── it.tests/
```

### Connecting your local project

```bash
# Add Cloud Manager as a remote
git remote add adobe https://git.cloudmanager.adobe.com/<org>/<program>/

# Push your code
git push adobe main
```

Or use Cloud Manager's Git directly as your primary repo. Many teams use GitHub/GitLab as the primary repo and sync to
Cloud Manager via CI/CD.

## Pipelines

Pipelines automate the build-test-deploy process.

### Full-stack pipeline stages

```mermaid
flowchart LR
    Source["Source Code"]
    Build["Maven Build"]
    Unit["Unit Tests"]
    Quality["Code Quality"]
    Security["Security Scan"]
    Deploy["Deploy"]
    Functional["Functional Tests"]
    UI["UI Tests"]

    Source --> Build
    Build --> Unit
    Unit --> Quality
    Quality --> Security
    Security --> Deploy
    Deploy --> Functional
    Functional --> UI
```

1. **Maven Build** -- compiles your project (`mvn clean install`)
2. **Unit Tests** -- runs `core/` tests
3. **Code Quality** -- static analysis checks (coverage, bugs, maintainability)
4. **Security Scan** -- checks for known vulnerabilities
5. **Deploy** -- installs packages on the target environment
6. **Functional Tests** -- runs integration tests (`it.tests/`)
7. **UI Tests** -- runs end-to-end browser tests (if configured)

### Creating a pipeline

1. In Cloud Manager, go to **Pipelines**
2. Click **Add Pipeline**
3. Choose **Production** or **Non-Production**
4. Select the pipeline type (Full-stack)
5. Configure the trigger:
    - **On Git Changes** -- auto-trigger on push
    - **Manual** -- trigger manually
6. Select the Git branch
7. Configure quality gates (code coverage thresholds, etc.)

### Running a pipeline

1. Click **Run** on the pipeline
2. Watch the stages execute in the Cloud Manager UI
3. If a stage fails, review the logs:
    - Build logs for compilation errors
    - Test logs for test failures
    - Quality logs for static analysis findings

### Code quality gates

Cloud Manager enforces quality gates:

| Gate area              | Typical expectation                       |
|------------------------|-------------------------------------------|
| **Unit test coverage** | Meets configured threshold                |
| **Reliability**        | No blocking/high-severity defects         |
| **Security**           | No blocking/high-severity vulnerabilities |
| **Maintainability**    | Within acceptable quality thresholds      |

Failing quality gates blocks deployment. You can override non-critical failures, but this requires manager approval.

## Rapid Development Environments (RDE)

RDEs are **fast-iteration environments** for developers. Unlike the full pipeline (which takes 30--60 minutes), RDE
deployments take **seconds**.

### Setting up an RDE

1. In Cloud Manager, create an RDE environment
2. Install the AEM RDE CLI plugin:

```bash
aio plugins:install @adobe/aio-cli-plugin-aem-rde
```

3. Connect to your RDE:

```bash
aio aem:rde:setup
```

### Deploying to RDE

```bash
# Deploy the entire project
aio aem:rde:install all/target/mysite.all-1.0-SNAPSHOT.zip

# Deploy just the core bundle (fast!)
aio aem:rde:install core/target/mysite.core-1.0-SNAPSHOT.jar

# Deploy a content package
aio aem:rde:install ui.apps/target/mysite.ui.apps-1.0-SNAPSHOT.zip

# Deploy Dispatcher config
aio aem:rde:install dispatcher/src --type dispatcher
```

### RDE workflow

```mermaid
flowchart LR
    Code["Edit Code"]
    Build["mvn install (local)"]
    Deploy["aio aem:rde:install"]
    Test["Test on RDE"]
    Iterate["Iterate"]

    Code --> Build
    Build --> Deploy
    Deploy --> Test
    Test --> Iterate
    Iterate --> Code
```

The cycle time is dramatically shorter than a full pipeline. Use RDEs for:

- Trying out new features
- Debugging deployment issues
- Testing OSGi configurations
- Validating Dispatcher rules

> **Note:** RDE is for development only. Always use the full pipeline for stage and production.

## Environment-specific configuration

OSGi configurations vary by environment using run mode folders (chapter 3):

```
ui.config/src/main/content/jcr_root/apps/mysite/osgiconfig/
├── config/                    # All environments
├── config.author/             # Author instances
├── config.publish/            # Publish instances
├── config.dev/                # Dev environment
├── config.stage/              # Stage environment
└── config.prod/               # Production
```

### Environment variables

AEMaaCS supports environment-specific variables in Cloud Manager:

1. Go to **Environments** > select your environment
2. Click **Configuration**
3. Add variables:

| Variable       | Type     | Example        |
|----------------|----------|----------------|
| `API_KEY`      | Secret   | `sk-abc123...` |
| `ANALYTICS_ID` | Standard | `UA-12345-1`   |
| `FEATURE_FLAG` | Standard | `true`         |

Access in OSGi configs:

```json
{
    "api.key": "$[secret:API_KEY]",
    "analytics.id": "$[env:ANALYTICS_ID]"
}
```

The `$[env:...]` and `$[secret:...]` placeholders are resolved by AEM at config loading time. To use these values in
Java, read them through the OSGi configuration -- not directly from the environment:

```java
@Component(service = AnalyticsService.class)
@Designate(ocd = AnalyticsConfig.class)
public class AnalyticsServiceImpl implements AnalyticsService {

    private String analyticsId;

    @Activate
    protected void activate(AnalyticsConfig config) {
        // The value comes from the .cfg.json that references $[env:ANALYTICS_ID]
        this.analyticsId = config.analytics_id();
    }
}
```

## Monitoring and logs

### Cloud Manager logs

Access logs from Cloud Manager:

1. Go to **Environments** > select environment
2. Click **Logs**
3. Available logs:

| Log            | Contains         |
|----------------|------------------|
| **aemerror**   | AEM error log    |
| **aemrequest** | HTTP request log |
| **aemaccess**  | Access log       |
| **dispatcher** | Dispatcher log   |
| **cdn**        | CDN log          |

### Log tailing

Use the CLI to tail logs in real time:

```bash
aio aem:log:tail --environment <env-id> --service author --name aemerror
```

## Going to production -- checklist

Before your first production deployment:

| Area             | Check                                          |
|------------------|------------------------------------------------|
| **Code quality** | All quality gates pass                         |
| **Tests**        | Unit, integration, and UI tests pass           |
| **Dispatcher**   | Config validated with Dispatcher SDK           |
| **Performance**  | Load testing completed                         |
| **Security**     | Security scan passes, sensitive paths blocked  |
| **SEO**          | Sitemap, robots.txt, canonical URLs, meta tags |
| **Analytics**    | Tracking configured and verified               |
| **Content**      | Content authored and reviewed                  |
| **Redirects**    | Old URL redirects configured                   |
| **DNS**          | Domain pointed to Adobe CDN                    |
| **SSL**          | Certificate provisioned via Cloud Manager      |
| **Monitoring**   | Alerts configured for errors and performance   |

> For deeper deployment patterns, see
> the [Deployment](/aem/infrastructure/deployment), [Cloud Service](/aem/infrastructure/cloud-service), [Testing](/aem/infrastructure/testing),
> and [Security Basics](/aem/infrastructure/security) references.

## Summary

You learned:

- The **deployment model** -- Git > Cloud Manager > pipeline > environments
- **Cloud Manager** -- Git, pipelines, environments, monitoring
- **Pipeline stages** -- build, test, code quality, security, deploy
- **Rapid Development Environments** -- fast iteration with the RDE CLI
- **Environment-specific config** -- run modes, environment variables
- **Monitoring** -- logs, tailing
- **Production checklist** -- what to verify before going live

## Congratulations

You have completed the AEM Beginners Guide! You now understand:

- The **AEM technology stack** (JCR, Sling, OSGi)
- How to **build components** (HTL, dialogs, Sling Models)
- How to **create pages** (templates, policies, Core Components, client libraries)
- **Headless content delivery** (Content Fragments, GraphQL)
- **Multi-site and multi-language** management (MSM, i18n)
- **Production operations** (Dispatcher, Cloud Manager, deployment)

From here, explore the [AEM reference documentation](/aem/architecture) for deep dives into specific topics, and start
building your own AEM project!
