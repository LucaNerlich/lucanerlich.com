import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function SplitterPage(): React.ReactElement {
    return (
        <Layout
            title="Splitter"
            description="Split shared expenses fairly. State lives in the URL — share the link to share the session."
        >
            <BrowserOnly
                fallback={<div style={{padding: '2rem', textAlign: 'center'}}>Loading…</div>}
            >
                {() => {
                    const SplitterApp = require('./_SplitterApp').default;
                    return <SplitterApp />;
                }}
            </BrowserOnly>
        </Layout>
    );
}
