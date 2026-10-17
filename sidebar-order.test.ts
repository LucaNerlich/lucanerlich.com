// Regression test for the same-label sibling collision in sortSidebarItems
// (issue #123): each category must resolve to its own directory path, not the
// last-written label mapping.
import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {sortSidebarItems} from './sidebar-order';

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
});
