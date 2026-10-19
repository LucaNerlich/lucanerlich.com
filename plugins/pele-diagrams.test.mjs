import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {render} from 'pele';
import peleDiagrams from './pele-diagrams.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const VALID_FENCE = 'flowchart LR\n    A[Start] --> B[Done]';
const INVALID_FENCE = 'flowchart LR\n    A -->';
const TITLED_FENCE =
    'flowchart LR\n    accTitle: Sign-in flow\n    accDescr: The browser signs in.\n    A[Start] --> B[Done]';

/**
 * Collects ```mermaid fences, including the copy-paste fences that sit inside a
 * ````markdown block, and honours the fence length so nesting is not mistaken
 * for a diagram.
 */
function extractFences(text, quoted = false, out = []) {
    const lines = text.split('\n');
    let index = 0;
    while (index < lines.length) {
        const open = lines[index].match(/^(\s*)(`{3,})(.*)$/);
        if (!open) {
            index += 1;
            continue;
        }
        const [, indent, fence, info] = open;
        const lang = info.trim().split(/\s+/)[0];
        const body = [];
        let end = index + 1;
        let closed = false;
        while (end < lines.length) {
            const close = lines[end].match(/^(\s*)(`{3,})\s*$/);
            if (close && close[1] === indent && close[2].length >= fence.length) {
                closed = true;
                break;
            }
            body.push(lines[end]);
            end += 1;
        }
        if (!closed) {
            index += 1;
            continue;
        }
        if (lang === 'mermaid') {
            out.push({quoted, line: index + 1, source: body.join('\n')});
        } else if (['markdown', 'md', ''].includes(lang)) {
            extractFences(body.join('\n'), true, out);
        }
        index = end + 1;
    }
    return out;
}

function markdownFiles(dir) {
    return fs.readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
        if (entry.name.startsWith('.')) {
            return [];
        }
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return markdownFiles(full);
        }
        return /\.mdx?$/.test(entry.name) ? [full] : [];
    });
}

function fenceTree(value, line) {
    return {
        type: 'root',
        children: [
            {type: 'paragraph', children: [{type: 'text', value: 'prose'}]},
            {type: 'code', lang: 'mermaid', value, position: {start: {line}, end: {line: line + 2}}},
        ],
    };
}

const svgOf = (node) => node.attributes[0].value;
const idsOf = (svg) => [...svg.matchAll(/(?<=\s)id="([^"]+)"/g)].map((match) => match[1]);

test('renders a mermaid fence to an SVG element and leaves other fences alone', async () => {
    const tree = fenceTree(VALID_FENCE, 12);
    tree.children.push({type: 'code', lang: 'javascript', value: 'const a = 1;'});

    await peleDiagrams()(tree, {path: 'docs/example.mdx'});

    const element = tree.children[1];
    assert.equal(element.type, 'mdxJsxFlowElement');
    assert.equal(element.name, 'mermaid');
    assert.deepEqual(element.position, {start: {line: 12}, end: {line: 14}});
    const [svgAttribute] = element.attributes;
    assert.equal(svgAttribute.name, 'svg');
    assert.match(svgAttribute.value, /^<svg /);
    assert.match(svgAttribute.value, /class="pele pele-flowchart"/);
    assert.match(svgAttribute.value, /data-id="A"/);
    assert.equal(tree.children[0].children[0].value, 'prose', 'prose is untouched');
    assert.equal(tree.children[2].lang, 'javascript', 'other code fences stay code');
});

test('keeps the accessibility ids of several diagrams on one page apart', async () => {
    const tree = {
        type: 'root',
        children: [
            {type: 'code', lang: 'mermaid', value: TITLED_FENCE, position: {start: {line: 1}}},
            {
                type: 'blockquote',
                children: [{type: 'code', lang: 'mermaid', value: TITLED_FENCE, position: {start: {line: 20}}}],
            },
        ],
    };

    await peleDiagrams()(tree, {path: 'docs/example.mdx'});

    const svgs = [svgOf(tree.children[0]), svgOf(tree.children[1].children[0])];
    const ids = svgs.flatMap(idsOf);
    assert.equal(ids.length, 4, 'each diagram carries a title id and a description id');
    assert.equal(new Set(ids).size, ids.length, 'no id is used twice on the page');
    for (const svg of svgs) {
        for (const reference of svg.matchAll(/(?<=\s)aria-(?:labelledby|describedby)="([^"]+)"/g)) {
            assert.ok(svg.includes(`id="${reference[1]}"`), `aria reference ${reference[1]} resolves in its diagram`);
        }
    }
});

test('an invalid diagram fails the build with file and line', async () => {
    await assert.rejects(
        peleDiagrams()(fenceTree(INVALID_FENCE, 42), {path: 'docs/example.mdx'}),
        (error) => {
            assert.match(error.message, /^docs\/example\.mdx:42: invalid Mermaid diagram \(syntax\)/);
            return true;
        },
    );
});

test('every mermaid fence in the repository renders', () => {
    // The blog is disabled in docusaurus.config.ts, so its fences are not built.
    const files = ['docs', 'src/pages'].flatMap((dir) => markdownFiles(path.join(ROOT, dir)));
    const fences = files.flatMap((file) => {
        const relative = path.relative(ROOT, file);
        return extractFences(fs.readFileSync(file, 'utf8')).map((fence) => ({...fence, file: relative}));
    });
    assert.ok(fences.length > 200, `expected the site's diagrams, found ${fences.length}`);

    const failures = [];
    for (const fence of fences) {
        try {
            // Run the fence through the plugin, not render() alone, so the
            // wiring and the file:line error path are exercised too.
            peleDiagrams()(fenceTree(fence.source, fence.line), {path: fence.file});
        } catch (error) {
            failures.push(`${fence.file}:${fence.line}${fence.quoted ? ' (copy-paste source)' : ''}: ${error.message}`);
        }
    }
    assert.deepEqual(failures, []);
});
