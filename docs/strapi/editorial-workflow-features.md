---
title: "Editorial Workflow Features"
sidebar_position: 4
description: "Strapi 5 editorial workflow features: Content History, Review Workflows, Preview, Releases, Strapi AI, Audit Logs, and Draft & Publish."
tags: [strapi, editorial-workflow, preview, releases, audit-logs]
---

# Editorial Workflow Features

Strapi 5 gives editorial teams more than a basic edit-and-publish screen. Depending on the license tier, the admin panel
can keep short-term version history, enforce review stages, preview drafts in a frontend, coordinate release batches,
show audit logs, and add AI assistance for routine authoring tasks.

## Feature overview

| Feature | What it does | Plan tier | Config needed |
|---------|--------------|-----------|---------------|
| Draft & Publish | Keeps draft and published versions separate; REST uses `status=draft` or `status=published`. | Community, Growth, Enterprise | Enable Draft & Publish on each content type. |
| Content History | Records entry versions edited from the Content Manager and lets editors restore an older version into the current draft. | Growth, Enterprise | Enabled by eligible license; optional `history.retentionDays` to shorten retention. |
| Review Workflows | Adds configurable stages, assignees, role permissions, and a required stage before publishing. | Enterprise | Configure workflows in the admin panel; content types must use Draft & Publish. |
| Preview | Generates frontend preview URLs for draft or published entries. Live side-by-side preview is available on paid tiers. | URL preview: Community, Growth, Enterprise; Live Preview: Growth, Enterprise | `config/admin` `preview.enabled`, `allowedOrigins`, and `handler`. |
| Releases | Groups many publish/unpublish actions and can schedule the batch for a date, time, and timezone. | Growth, Enterprise | Enable Draft & Publish and use the Releases UI. |
| Strapi AI | Adds AI help in the admin panel for content modeling, content translation, and image metadata generation. | Growth only | Eligible license or trial; optional `ai.enabled: false` to disable. |
| Audit Logs | Records admin activity such as content and configuration changes for compliance review. | Enterprise | Enabled by Enterprise license; optional `auditLogs.retentionDays`. |

## Content History

Content History is a short-term safety net for editors. It records versions when entries are changed from the Content
Manager UI, showing who changed an entry and when. It is not a permanent archive and it does not record changes made by
custom scripts, lifecycle hooks, cron jobs, or direct API writes.

Retention depends on the license:

- Growth keeps versions for 14 days.
- Enterprise keeps versions for 30 days by default and can support longer retention by contract, up to the documented
  license limit.
- A cleanup job permanently removes versions older than the retention period.

You can shorten the retention period in `config/admin` without exceeding the license limit:

```ts
// config/admin.ts
export default () => ({
    history: {
        retentionDays: 14,
    },
});
```

To restore a version, open the entry in the Content Manager, open its history, compare the recorded versions, and choose
**Restore**. Strapi copies the selected version into the current draft, so review it before publishing.

## Review Workflows

Review Workflows turn "someone should check this" into an explicit editorial pipeline. A workflow is made of stages such
as **To do**, **In progress**, **Ready to review**, and **Reviewed**. Stages are customizable.

Review Workflows can:

- assign entries to users for review;
- restrict which roles can move an entry into or out of a stage;
- require an entry to reach a specific stage before it can be published;
- notify integrations when the review stage changes.

The webhook event for stage changes is:

```text
review-workflows.updateEntryStage
```

Use that event for Slack notifications, project-management updates, or external approval systems. Review Workflows are an
Enterprise feature and work best when Draft & Publish is enabled on the content types that need approvals.

## Preview and Live Preview

Preview connects Strapi entries to a frontend URL. Configure it in `config/admin` with the exact `preview` shape used by
Strapi 5: `enabled`, then `config.allowedOrigins` and `config.handler`.

```ts
// config/admin.ts
export default ({ env }) => ({
    preview: {
        enabled: true,
        config: {
            allowedOrigins: [env('CLIENT_URL', 'http://localhost:3000')],
            async handler(uid, { documentId, locale, status }) {
                const document = await strapi.documents(uid).findOne({
                    documentId,
                    locale,
                    status,
                });

                const slug = document?.slug ?? '';
                const params = new URLSearchParams({
                    secret: env('PREVIEW_SECRET'),
                    slug,
                    status,
                });

                return `${env('CLIENT_URL')}/api/preview?${params.toString()}`;
            },
        },
    },
});
```

`allowedOrigins` should contain only the frontend origins that may be embedded or opened for preview. The `handler`
receives the content type UID and entry metadata, then returns the frontend URL to open.

A Next.js App Router preview route typically validates a secret, verifies the draft exists in Strapi with
`status=draft`, enables draft mode, and redirects to the page:

```ts
// app/api/preview/route.ts
import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const slug = searchParams.get('slug') ?? '';

    if (secret !== process.env.PREVIEW_SECRET || !slug) {
        return new Response('Invalid preview request', { status: 401 });
    }

    const response = await fetch(
        `${process.env.STRAPI_URL}/api/posts?filters[slug][$eq]=${encodeURIComponent(slug)}&status=draft`,
        { cache: 'no-store' },
    );
    const data = await response.json();

    if (!data.data?.length) {
        return new Response('Draft not found', { status: 404 });
    }

    const draft = await draftMode();
    draft.enable();
    redirect(`/blog/${slug}`);
}
```

If the draft endpoint is not public, add your own authenticated server-to-server request in the route and keep the token
out of client-side code.

Then your page data loader can choose the Strapi status from Next.js draft mode:

```ts
import { draftMode } from 'next/headers';

export async function getPost(slug: string) {
    const draft = await draftMode();
    const status = draft.isEnabled ? 'draft' : 'published';

    const response = await fetch(
        `${process.env.STRAPI_URL}/api/posts?filters[slug][$eq]=${encodeURIComponent(slug)}&status=${status}`,
    );

    return response.json();
}
```

The basic URL preview works with any frontend that can fetch draft content. Live Preview adds the side-by-side editing
experience in the admin panel: the entry form and frontend preview sit together so editors can see the rendered result
while they work. Check the current plan details before promising Live Preview on a Community project.

## Releases

Releases group content actions across content types and locales, then publish or unpublish the whole batch manually or on
a schedule. They are useful for campaign launches, coordinated page sets, and releases that must go live in a specific
timezone.

For the detailed scheduling workflow and caveats, see [Scheduled Publishing](./scheduled-publishing.md).

## Strapi AI

Strapi AI adds assistant features inside the admin panel. Current documented capabilities include AI help in the
Content-Type Builder, AI-assisted translations for localized content, and generated image metadata such as alternative
text and captions in the Media Library.

Strapi AI is currently documented for Growth plans on Strapi 5.30+ and uses AI credits. It can be disabled globally in
`config/admin`:

```ts
// config/admin.ts
export default () => ({
    ai: {
        enabled: false,
    },
});
```

Disable it when a project cannot send content to AI services, when Enterprise policy forbids it, or when you want to
avoid accidental credit usage.

## Audit Logs

Audit Logs record admin activity for compliance and troubleshooting: who changed content, settings, roles, releases, or
other administrative data. They are an Enterprise feature.

Retention is configured in `config/admin` and defaults to the license value unless you set a shorter period:

```ts
// config/admin.ts
export default () => ({
    auditLogs: {
        retentionDays: 90,
    },
});
```

Logs older than the configured retention are permanently deleted. Use external log export or SIEM integration if you need
longer retention than the license supports.

## Draft & Publish recap

Draft & Publish is the foundation for most editorial workflows. A draft can exist separately from the published version,
and Strapi 5 uses the REST `status` parameter instead of the old Strapi v4 `publicationState` parameter:

```http
GET /api/posts?status=draft
GET /api/posts?status=published
```

When a frontend preview or release needs draft content, make sure the API token can read it and use `status=draft` in the
request. For the beginner-level REST walkthrough, see [REST API](./beginners-guide/05-rest-api.md).
