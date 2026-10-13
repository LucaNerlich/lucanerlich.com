/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * Swizzled from @docusaurus/theme-mermaid so a second render cannot delete
 * a diagram that is already on the page. See retargetMermaidSvg.
 */
import React, {useEffect, useRef} from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {
    MermaidContainerClassName,
    useMermaidRenderResult,
} from '@docusaurus/theme-mermaid/client';
import styles from './styles.module.css';

function MermaidErrorFallback({error, tryAgain}) {
    return (
        <div>
            <p>{error.message}</p>
            <button type="button" onClick={tryAgain}>
                Try again
            </button>
        </div>
    );
}

/**
 * Mermaid's renderer removes `document.getElementById(id)` before every draw.
 * The id is also written onto the SVG React commits. A follow-up draw (the
 * color mode settles after hydration, so the effect runs twice with the same
 * theme once `initialize` has caught up) deletes that SVG. When the new markup
 * matches the markup React already committed, React does not write it back
 * and the container stays empty.
 *
 * The id is the CSS scope for the diagram's style block, so it has to move
 * with every reference. The suffix is not an id Mermaid looks up.
 *
 * @param {string} svg
 * @returns {string}
 */
export function retargetMermaidSvg(svg) {
    const match = svg.match(/^<svg\s+id="(mermaid-svg-\d+)"/);
    if (!match) {
        return svg;
    }
    const id = match[1];
    return svg.split(id).join(`${id}-shown`);
}

function MermaidRenderResult({renderResult}) {
    const ref = useRef(null);
    const svg = retargetMermaidSvg(renderResult.svg);
    useEffect(() => {
        const div = ref.current;
        renderResult.bindFunctions?.(div);
    }, [renderResult]);
    return (
        <div
            ref={ref}
            className={`${MermaidContainerClassName} ${styles.container}`}
            // Mermaid sanitizes this string before it is returned (strict).
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{__html: svg}}
        />
    );
}

function MermaidRenderer({value}) {
    const renderResult = useMermaidRenderResult({text: value});
    if (renderResult === null) {
        return null;
    }
    return <MermaidRenderResult renderResult={renderResult} />;
}

export default function Mermaid(props) {
    return (
        <ErrorBoundary
            fallback={(params) => <MermaidErrorFallback {...params} />}>
            <MermaidRenderer {...props} />
        </ErrorBoundary>
    );
}
