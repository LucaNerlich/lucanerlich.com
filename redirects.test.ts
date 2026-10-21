// Regression test for #574 and #630: every redirect source needs an entry,
// and every entry needs a target that exists. The blog plugin is disabled, so
// a missing source or a typo in `to` ships a silent 404.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import {redirects} from './redirects';

const redirectFroms = new Set(
    redirects.flatMap(entry => (Array.isArray(entry.from) ? entry.from : [entry.from])),
);

// Targets are checked against what Docusaurus emitted, so they are verified
// by the same routing rules the site serves. `pnpm build` runs before
// `pnpm test` in CI; without a build the target test is skipped, not passed.
const hasTarget = (to: string): boolean => existsSync(join('build', to, 'index.html'));

describe('blog post redirects', () => {
    it('redirects every post its default slug route', () => {
        const posts = readdirSync('blog').filter(file => file.endsWith('.md'));
        assert.ok(posts.length > 0, 'no blog posts found to check');
        for (const file of posts) {
            const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
            assert.ok(
                redirectFroms.has(`/blog/${slug}/`),
                `missing redirect for /blog/${slug}/ (from blog/${file})`,
            );
        }
    });
});

describe('redirect targets', () => {
    const skip = existsSync(join('build', 'index.html')) ? false : 'run pnpm build first';

    it('tells a built route from a missing one', {skip}, () => {
        assert.equal(hasTarget('/'), true);
        assert.equal(hasTarget('/definitely-not-a-route/'), false);
    });

    it('points every redirect at a built page', {skip}, () => {
        for (const {from, to} of redirects) {
            assert.ok(
                hasTarget(to),
                `${Array.isArray(from) ? from.join(', ') : from} redirects to ${to}, which has no built page`,
            );
        }
    });
});
