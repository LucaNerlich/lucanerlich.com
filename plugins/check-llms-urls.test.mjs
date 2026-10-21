import {after, test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import plugin from './check-llms-urls.js';

const dirs = [];

const run = (content, routes) => {
    const siteDir = fs.mkdtempSync(path.join(os.tmpdir(), 'llms-'));
    dirs.push(siteDir);
    fs.mkdirSync(path.join(siteDir, 'static'), {recursive: true});
    fs.writeFileSync(path.join(siteDir, 'static', 'llms.txt'), content);
    return plugin().postBuild({siteDir, routesPaths: routes});
};

after(() => {
    for (const dir of dirs) {
        fs.rmSync(dir, {recursive: true, force: true});
    }
});

test('checks markdown links, autolinks, http:// and www. forms', async () => {
    const content = [
        '- [A](https://lucanerlich.com/a/)',
        '<https://lucanerlich.com/b/>',
        'https://lucanerlich.com/c/',
        'http://www.lucanerlich.com/d/',
    ].join('\n');
    // Empty routes: every form must show up as missing, not just be tolerated.
    await assert.rejects(run(content, []), (error) => {
        for (const listed of ['/a/', '/b/', '/c/', '/d/']) {
            assert.ok(error.message.includes(listed), `missing ${listed}`);
        }
        return true;
    });
});

test('trims sentence punctuation from a prose URL', async () => {
    await run('See https://lucanerlich.com/aem/, which covers it.\n', ['/aem']);
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

test('rejects a lookalike host instead of checking only its path', async () => {
    await assert.rejects(
        run('[A](https://lucanerlich.com.example.com/a/)\n', ['/a']),
        /lucanerlich\.com\.example\.com/,
    );
});

test('accepts the www host', async () => {
    await run('[A](https://www.lucanerlich.com/a/)\n', ['/a']);
});
