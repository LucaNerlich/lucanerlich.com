/**
 * Renders the SVG that plugins/pele-diagrams.mjs generated at build time.
 * Pele's output is deterministic and takes its colors from CSS variables, so
 * no diagram code runs in the browser.
 */
import styles from './styles.module.css';

export default function Mermaid({svg}) {
    if (typeof svg !== 'string') {
        throw new Error(
            'Mermaid diagram without a build-time SVG: register plugins/pele-diagrams.mjs as a docs remark plugin and keep markdown.mermaid disabled.',
        );
    }
    return (
        <div
            className={styles.container}
            // The SVG comes from Pele at build time, which escapes diagram text.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: svg}}
        />
    );
}
