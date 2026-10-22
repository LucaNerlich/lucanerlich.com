// Regression test for the same-label sibling collision in sortSidebarItems
// (issue #123): each category must resolve to its own directory path, not the
// last-written label mapping.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readdirSync, statSync} from 'node:fs';
import {sidebarGroups, sidebarOrder, sortSidebarItems} from './sidebar-order';

const category = (label: string, docId: string) => ({
    type: 'category',
    label,
    items: [{type: 'doc', id: docId}],
});

describe('sortSidebarItems', () => {
    it('orders same-labelled sibling categories by their own directory', () => {
        // Two categories share the label 'Guides' under 'aem'; the parent's
        // order array lists 'architecture' before 'recipes'. The input lists
        // them in the opposite order, so only a correct path resolution can
        // produce the expected output.
        const categoriesMetadata = {
            'aem/recipes': {label: 'Guides'},
            'aem/architecture': {label: 'Guides'},
        };
        const items = [
            category('Guides', 'aem/recipes/overview'),
            category('Guides', 'aem/architecture/overview'),
        ];

        const sorted = sortSidebarItems(items, 'aem', categoriesMetadata);

        assert.deepEqual(
            sorted.map((item) => item.items[0].id),
            ['aem/architecture/overview', 'aem/recipes/overview'],
        );
    });

    it('emits every doc in a visual group exactly once', () => {
        const keys = sidebarGroups.java.flatMap((group) => group.items);
        // Reverse the input so the first group member is not the first item.
        const items = [...keys].reverse().map((key) => ({
            type: 'doc',
            id: `java/${key}`,
        }));

        const sorted = sortSidebarItems(items, 'java', {});

        const ids: string[] = [];
        const collect = (entries: any[]) => {
            for (const entry of entries) {
                if (entry.type === 'doc') ids.push(entry.id);
                else if (entry.items) collect(entry.items);
            }
        };
        collect(sorted);

        assert.equal(ids.length, keys.length);
        assert.deepEqual(
            [...ids].sort(),
            keys.map((key) => `java/${key}`).sort(),
        );

        const core = sorted.find(
            (item: any) => item.type === 'category' && item.label === 'Core Language',
        );
        assert.ok(core);
        assert.equal(core.items.length, sidebarGroups.java[0].items.length);
    });
});

// Regression test for #660: `sidebarOrder` and `sidebarGroups` name docs by
// hand, and a renamed page otherwise drops silently to the end of its section.
const baseDir = (dir: string): string => (dir === '.' ? 'docs' : `docs/${dir}`);

const isDirectory = (path: string): boolean => {
    try {
        return statSync(path).isDirectory();
    } catch {
        return false;
    }
};

const hasDoc = (dir: string, key: string): boolean => {
    const entries = new Set(readdirSync(baseDir(dir)));
    return entries.has(`${key}.md`) || entries.has(`${key}.mdx`);
};

describe('sidebar configuration', () => {
    it('resolves every ordered key to a doc or a category directory', () => {
        const stale: string[] = [];
        for (const [dir, keys] of Object.entries(sidebarOrder)) {
            for (const key of keys) {
                const categoryDir = isDirectory(`${baseDir(dir)}/${key}`);
                if (!hasDoc(dir, key) && !categoryDir) stale.push(`${baseDir(dir)}/${key}`);
            }
        }
        assert.deepEqual(stale, [], `sidebarOrder keys with no doc or directory: ${stale.join(', ')}`);
    });

    it('resolves every visual group member to a doc', () => {
        const missing: string[] = [];
        for (const [dir, groups] of Object.entries(sidebarGroups)) {
            for (const group of groups) {
                for (const key of group.items) {
                    if (!hasDoc(dir, key)) missing.push(`${baseDir(dir)}/${key}`);
                }
            }
        }
        assert.deepEqual(missing, [], `sidebarGroups members with no doc: ${missing.join(', ')}`);
    });
});
