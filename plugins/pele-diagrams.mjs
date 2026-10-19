/**
 * Render ```mermaid fences to inline SVG at build time with Pele
 * (https://pele.run). Pele draws without a DOM, so `pnpm build` renders every
 * diagram and fails on invalid syntax -- the client-side renderer this replaces
 * only failed in the browser.
 *
 * Pele is ESM-only and this file is loaded through jiti, so the renderer is
 * imported lazily, the same shape as Docusaurus's own Mermaid remark plugin.
 */
import {createHash} from 'node:crypto';

/** Infima's base font stack; CSS `--pele-font` replaces it in the browser. */
const DEFAULT_FONT_FAMILY =
    'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif';

let pele;

async function loadPele() {
    pele ??= import('pele');
    return pele;
}

/** Accessibility ids have to be unique per page, so they derive from the file and the fence position. */
function idPrefix(filePath, index) {
    return `pele-${createHash('sha1').update(`${filePath}:${index}`).digest('hex').slice(0, 8)}-`;
}

function relativePath(filePath) {
    const cwd = `${process.cwd()}/`;
    return filePath.startsWith(cwd) ? filePath.slice(cwd.length) : filePath;
}

/**
 * @param {{fontFamily?: string, fontSize?: number}} [options]
 * @returns {(tree: import('mdast').Root, file: import('vfile').VFile) => Promise<void>}
 */
export default function peleDiagrams(options = {}) {
    const fontFamily = options.fontFamily ?? DEFAULT_FONT_FAMILY;
    const fontSize = options.fontSize ?? 16;

    return async (tree, file) => {
        const {PeleError, render} = await loadPele();
        const filePath = file?.path ?? file?.history?.[0] ?? '<unknown>';
        let index = 0;

        const toMermaidElement = (fence, fenceIndex) => {
            let svg;
            try {
                ({svg} = render(fence.value, {
                    fontFamily,
                    fontSize,
                    idPrefix: idPrefix(filePath, fenceIndex),
                }));
            } catch (error) {
                if (!(error instanceof PeleError)) {
                    throw error;
                }
                const line = fence.position?.start?.line;
                const where = line ? `${relativePath(filePath)}:${line}` : relativePath(filePath);
                throw new Error(
                    `${where}: invalid Mermaid diagram (${error.code})\n${error.message}`,
                    {cause: error},
                );
            }
            return {
                type: 'mdxJsxFlowElement',
                name: 'mermaid',
                attributes: [{type: 'mdxJsxAttribute', name: 'svg', value: svg}],
                children: [],
                position: fence.position,
            };
        };

        const walk = (node) => {
            if (node.type === 'code' && node.lang === 'mermaid') {
                const element = toMermaidElement(node, index);
                index += 1;
                return element;
            }
            if (Array.isArray(node.children)) {
                node.children = node.children.map(walk);
            }
            return node;
        };

        walk(tree);
    };
}
