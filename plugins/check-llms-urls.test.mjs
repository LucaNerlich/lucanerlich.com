import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import plugin from './check-llms-urls.js';

const run = (content, routes) => {
    const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-'));
    fs.mkdirSync(path.join(siteDir, 'static'), {recursive: true});
    fs.writeFileSync(path.join(siteDir, 'static', 'llms.txt'), content);
    return plugin().postBuild({siteDir, routesPaths: routes});
};

test('checks markdown links, autolinks, http:// and www. forms', async () => {
    await run(
        [
            '- [A](https://lucanerlich.com/a/)',
            '<https://lucanerlich.com/b/>',
            'https://lucanerlich.com/c/',
            'http://www.lucanerlich.com/d/',
        ].join('\n'),
        ['/a', '/b', '/c', '/d'],
    );
});

test('fails when a listed URL has no route', async () => {
    await assert.rejects(
        run('[A](https://lucanerlich.com/missing/)\n', ['/a']),
        /no matching route/,
    );
});

test('fails when no site URL matched at all', async () => {
    await assert.rejects(run('no links here\n', ['/a']), /lists no lucanerlich\.com URLs/);
});
