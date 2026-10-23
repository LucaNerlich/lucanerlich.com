// @ts-check

// Build-time guard for static/llms.txt (see issue #127): every
// lucanerlich.com URL listed in the file must resolve to a route in the
// built site. The slugs live in two places - doc frontmatter and llms.txt -
// and this check fails the build when they drift apart.

const fs = require('fs');
const path = require('path');

// Match the host independently of the link notation: markdown links,
// autolinks, http:// or a www. prefix are all entries the guard must see.
// Subdomains are matched too, so the hostname check below rejects them
// instead of treating them as external links the guard never sees.
const LINK_PATTERN = /https?:\/\/(?:[\w-]+\.)*lucanerlich\.com[^)\s>]*/gi;

// Markdown destinations without a scheme that still name the site: a
// root-relative path, or a protocol-relative URL. Same-site links written this
// way were invisible to the guard, so a dead slug shipped with a green build.
const RELATIVE_PATTERN = /\]\(\s*(\/\/[^)\s]+|\/(?!\/)[^)\s]*)/g;

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
 * @param {string} raw
 * @returns {URL}
 */
function parseUrl(raw) {
    try {
        return new URL(raw);
    } catch {
        // A malformed port or host must name the entry, not just throw.
        throw new Error(`static/llms.txt has an invalid URL: ${raw}`);
    }
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
                // A prose URL can be followed by sentence punctuation, quotes
                // or markdown emphasis.
                parseUrl(match[0].replace(/[.,;:"'`*_!?]+$/, '')),
            );
            const relativePaths = [];
            for (const match of content.matchAll(RELATIVE_PATTERN)) {
                const destination = match[1];
                if (!destination.startsWith('//')) {
                    relativePaths.push(destination.split(/[?#]/)[0]);
                    continue;
                }
                const url = parseUrl(`https:${destination}`);
                // A protocol-relative link to another host is external, like an
                // absolute one: the guard only owns lucanerlich.com.
                if (!SITE_HOSTS.has(hostOf(url))) continue;
                if (url.port !== '') {
                    throw new Error(`static/llms.txt links ${url.host}, which is not the site`);
                }
                relativePaths.push(url.pathname);
            }
            // A non-default port is a different origin even on the right host.
            const foreign = listed.find((url) => !SITE_HOSTS.has(hostOf(url)) || url.port !== '');
            if (foreign) {
                throw new Error(
                    `static/llms.txt links ${foreign.host}, which is not the site`,
                );
            }
            const listedPaths = [...listed.map((url) => url.pathname), ...relativePaths];
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
