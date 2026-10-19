/**
 * Renders the SVG that plugins/pele-diagrams.mjs generated at build time, then
 * hands the diagram to Pele's zoom. Zoom only activates for diagrams that had
 * to be scaled down to fit the column, so the page stays static for the rest.
 */
import {useEffect, useRef} from 'react';
import styles from './styles.module.css';

const ZOOM_LABELS = {zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset zoom'};

export default function Mermaid({svg}) {
    const container = useRef(null);

    useEffect(() => {
        const element = container.current;
        if (!element) {
            return undefined;
        }
        let zoom;
        let cancelled = false;
        // Pele's zoom is a separate fragment that a wide diagram loads on
        // demand; every other diagram renders without it.
        import('pele/core')
            .then(({enableZoom}) => {
                if (!cancelled) {
                    zoom = enableZoom(element, {labels: ZOOM_LABELS});
                }
            })
            .catch(() => {
                // The diagram is on the page already; zoom is an addition.
            });
        return () => {
            cancelled = true;
            zoom?.destroy();
        };
    }, [svg]);

    if (typeof svg !== 'string') {
        throw new Error(
            'Mermaid diagram without a build-time SVG: register plugins/pele-diagrams.mjs as a docs remark plugin and keep markdown.mermaid disabled.',
        );
    }
    return (
        <div
            ref={container}
            className={styles.container}
            // The SVG comes from Pele at build time, which escapes diagram text.
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: svg}}
        />
    );
}
