// Regression test for #574: the blog plugin is disabled, so every post's
// default /blog/<slug>/ route needs a redirect. A new or renamed post that
// misses one ships a silent 404.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync} from 'node:fs';
import {redirects} from './redirects';

const redirectFroms = new Set(
    redirects.flatMap(entry => (Array.isArray(entry.from) ? entry.from : [entry.from])),
);

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
