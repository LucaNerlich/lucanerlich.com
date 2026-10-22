// @ts-check

// Build-time guard for static/llms.txt (see issue #127): every
// lucanerlich.com URL listed in the file must resolve to a route in the
// built site. The slugs live in two places - doc frontmatter and llms.txt -
// and this check fails the build when they drift apart.

const fs = require('fs');
const path = require('path');

// Match the host independently of the link notation: markdown links,
// autolinks, http:// or a www. prefix are all entries the guard must see.
// Lookalike hosts (`lucanerlich.com.example.com`) are matched on purpose so
// the hostname check below can reject them instead of treating them as
// external links the guard never sees.
const LINK_PATTERN = /https?:\/\/(?:www\.)?lucanerlich\.com[^)\s>]*/gi;

/** Hosts the guard accepts as the site's own. */
const SITE_HOSTS = new Set(['lucanerlich.com', 'www.lucanerlich.com']);

/**
 * A trailing dot is the DNS-absolute form of the same host, so compare without
 * it. `URL` lowercases the host already.
 *
 * @param {URL} url
 * @returns {string}
 */
function hostOf(url) {
    return url.hostname.replace(/\.$/, '');
}

/**
 * Route paths and llms.txt URLs may differ only by a trailing slash;
 * compare both forms on equal footing.
 *
 * @param {string} pathname
 * @returns {string}
 */
function normalizePathname(pathname) {
    return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

/** @type {import('@docusaurus/types').PluginModule} */
module.exports = function checkLlmsUrlsPlugin() {
    return {
        name: 'check-llms-urls',
        async postBuild({siteDir, routesPaths}) {
            const content = fs.readFileSync(path.join(siteDir, 'static', 'llms.txt'), 'utf8');
            const listed = [...content.matchAll(LINK_PATTERN)].map((match) =>
                // A prose URL can be followed by sentence punctuation or quotes.
                new URL(match[0].replace(/[.,;:"'`]+$/, '')),
            );
            // A non-default port is a different origin even on the right host.
            const foreign = listed.find((url) => !SITE_HOSTS.has(hostOf(url)) || url.port !== '');
            if (foreign) {
                throw new Error(
                    `static/llms.txt links ${foreign.host}, which is not the site`,
                );
            }
            const listedPaths = listed.map((url) => url.pathname);
            // An empty match set would make the guard pass vacuously.
            if (listedPaths.length === 0) {
                throw new Error('static/llms.txt lists no lucanerlich.com URLs');
            }
            const routePaths = new Set(routesPaths.map(normalizePathname));
            const missing = listedPaths.filter((listed) => !routePaths.has(normalizePathname(listed)));
            if (missing.length > 0) {
                throw new Error(
                    `static/llms.txt lists ${missing.length} URL(s) with no matching route:\n` +
                        missing.map((listed) => `  ${listed}`).join('\n'),
                );
            }
        },
    };
};
