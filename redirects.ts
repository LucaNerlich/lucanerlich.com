// Client-side redirect data, lifted out of docusaurus.config.ts so the redirect
// list has one home and one place to be validated. Consumed by
// @docusaurus/plugin-client-redirects.
//
// To add a redirect: append an entry below. The duplicate-`from` guard at the
// bottom fails the build if two entries claim the same source path, so a new
// redirect can never silently shadow an existing one.

type Redirect = {from: string | string[]; to: string};

const entries: Redirect[] = [
    // Legacy /docs/ prefix redirects
    {from: '/docs/aem/component-dialogs/', to: '/aem/component-dialogs/'},
    {from: '/docs/aem/groovy-console/', to: '/aem/groovy-console/'},
    {from: '/docs/aem/extending-responsive-grid/', to: '/aem/ui/extending-responsive-grid/'},
    {from: '/docs/category/aem/', to: '/aem/'},
    {from: '/docs/aem/ui/overlays/', to: '/aem/ui/overlays/'},

    // Sidebar reorganization: components group
    {from: '/aem/core-components/', to: '/aem/components/core-components/'},
    {from: '/aem/dialog-validation/', to: '/aem/components/dialog-validation/'},
    {from: '/aem/annotations/child-resource/', to: '/aem/components/annotations/child-resource/'},
    {from: '/aem/annotations/externalized-value-map-value/', to: '/aem/components/annotations/externalized-value-map-value/'},

    // Sidebar reorganization: backend group
    {from: '/aem/sling-models/', to: '/aem/backend/sling-models/'},
    {from: '/aem/servlets/', to: '/aem/backend/servlets/'},
    {from: '/aem/filter/', to: '/aem/backend/filter/'},
    {from: '/aem/event-listener/', to: '/aem/backend/event-listener/'},
    {from: '/aem/osgi-configuration/', to: '/aem/backend/osgi-configuration/'},
    {from: '/aem/java-best-practices/', to: '/aem/backend/java-best-practices/'},
    {from: '/aem/workflows/', to: '/aem/backend/workflows/'},

    // Sidebar reorganization: content group
    {from: '/aem/jcr/', to: '/aem/content/jcr/'},
    {from: '/aem/node-operations/', to: '/aem/content/node-operations/'},
    {from: '/aem/content-fragments/', to: '/aem/content/content-fragments/'},
    {from: '/aem/graphql/', to: '/aem/content/graphql/'},
    {from: '/aem/replication-activation/', to: '/aem/content/replication-activation/'},
    {from: '/aem/multi-site-manager-msm/', to: '/aem/content/multi-site-manager-msm/'},

    // Sidebar reorganization: infrastructure group
    {from: '/aem/aem-dev-setup/', to: '/aem/infrastructure/aem-dev-setup/'},
    {from: '/aem/cloud-service/', to: '/aem/infrastructure/cloud-service/'},
    {from: '/aem/deployment/', to: '/aem/infrastructure/deployment/'},
    {from: '/aem/dispatcher-configuration/', to: '/aem/infrastructure/dispatcher-configuration/'},
    {from: '/aem/performance/', to: '/aem/infrastructure/performance/'},
    {from: '/aem/security/', to: '/aem/infrastructure/security/'},
    {from: '/aem/testing/', to: '/aem/infrastructure/testing/'},
    {from: '/aem/email/', to: '/aem/infrastructure/email/'},
    {from: '/aem/helix/', to: '/aem/edge-delivery-services/'},
    {from: '/aem/aio-app-builder/', to: '/aem/infrastructure/aio-app-builder/'},

    // Sidebar reorganization: ui group
    {from: '/aem/extending-responsive-grid/', to: '/aem/ui/extending-responsive-grid/'},

    // Merged pages: dynamic-pathbrowser + assets-siderail -> custom-dialog-widgets
    {from: '/aem/ui/dynamic-pathbrowser-rootpath/', to: '/aem/ui/custom-dialog-widgets/'},
    {from: '/aem/ui/assets-siderail/', to: '/aem/ui/custom-dialog-widgets/'},

    // Flattened other/tech/ into other/
    {from: '/other/tech/commands/', to: '/git/'},
    {from: '/other/commands/', to: '/git/'},
    {from: '/other/tech/docusaurus/', to: '/other/docusaurus/'},
    {from: '/other/tech/local-llm-for-coding/', to: '/other/local-llm-for-coding/'},
    {from: '/other/tech/mermaid-diagrams/', to: '/other/mermaid-diagrams/'},
    {from: '/other/tech/my-shell-setup/', to: '/other/my-shell-setup/'},
    {from: '/other/tech/sql-guide/', to: '/other/sql-guide/'},

    // Building for the Web group: defensive redirects from the new
    // file-path-implied URLs back to the canonical slug URLs (which
    // were preserved across the move via explicit slug frontmatter).
    {from: '/building-for-the-web/content-modeling/', to: '/content-modeling/'},
    {from: '/building-for-the-web/semantic-html/', to: '/semantic-html/'},
    {from: '/building-for-the-web/web-performance/', to: '/web-performance/'},
    {from: '/building-for-the-web/build-a-blog/', to: '/build-a-blog/'},
    {from: '/building-for-the-web/web-content/', to: '/web-content/'},
    {from: '/building-for-the-web/web-content/overview/', to: '/web-content/website-content-and-presentation/'},

    // Web Content split: section anchors on the monolith are now
    // standalone pages; map the closest path-level guesses.
    {from: '/web-content/overview/', to: '/web-content/website-content-and-presentation/'},
    {from: '/web-content/readability/', to: '/web-content/readability-and-typography/'},
    {from: '/web-content/typography/', to: '/web-content/readability-and-typography/'},
    {from: '/web-content/headings/', to: '/web-content/structure-and-hierarchy/'},
    {from: '/web-content/page-structure/', to: '/web-content/structure-and-hierarchy/'},
    {from: '/web-content/visual-hierarchy/', to: '/web-content/structure-and-hierarchy/'},
    {from: '/web-content/forms/', to: '/web-content/forms-and-interactions/'},
    {from: '/web-content/links/', to: '/web-content/forms-and-interactions/'},
    {from: '/web-content/microcopy/', to: '/web-content/microcopy-and-error-states/'},
    {from: '/web-content/error-states/', to: '/web-content/microcopy-and-error-states/'},
    {from: '/web-content/empty-states/', to: '/web-content/microcopy-and-error-states/'},
    {from: '/web-content/color/', to: '/web-content/color-and-contrast/'},
    {from: '/web-content/contrast/', to: '/web-content/color-and-contrast/'},
    {from: '/web-content/images/', to: '/web-content/images-and-media/'},
    {from: '/web-content/media/', to: '/web-content/images-and-media/'},
    {from: '/web-content/navigation/', to: '/web-content/information-architecture/'},
    {from: '/web-content/ia/', to: '/web-content/information-architecture/'},

    // Beginners-guide category indexes: the shared "Beginners Guide"
    // label previously auto-generated ugly, non-descriptive
    // /category/beginners-guide-N/ URLs. Each category now has an
    // explicit slug; these redirects preserve the old links.
    {from: '/category/beginners-guide/', to: '/aem/beginners-guide/'},
    {from: '/category/beginners-guide-1/', to: '/strapi/beginners-guide/'},
    {from: '/category/beginners-guide-2/', to: '/git/beginners-guide/'},
    {from: '/category/beginners-guide-3/', to: '/css/beginners-guide/'},
    {from: '/category/beginners-guide-4/', to: '/javascript/beginners-guide/'},
    {from: '/category/beginners-guide-5/', to: '/java/beginners-guide/'},
    {from: '/category/beginners-guide-6/', to: '/php/beginners-guide/'},
    {from: '/category/beginners-guide-7/', to: '/rust/beginners-guide/'},
    {from: '/category/beginners-guide-8/', to: '/docker/beginners-guide/'},
    {from: '/category/beginners-guide-9/', to: '/linux/beginners-guide/'},
    {from: '/category/beginners-guide-10/', to: '/testing/beginners-guide/'},
    {from: '/category/beginners-guide-11/', to: '/typescript/beginners-guide/'},
];

// One place to catch a duplicate source path before it ships a silently
// shadowed redirect. Runs when the config is evaluated at build time.
const seen = new Set<string>();
for (const entry of entries) {
    const froms = Array.isArray(entry.from) ? entry.from : [entry.from];
    for (const from of froms) {
        if (seen.has(from)) {
            throw new Error(`Duplicate redirect "from": ${from}`);
        }
        seen.add(from);
    }
}

export const redirects: Redirect[] = entries;
