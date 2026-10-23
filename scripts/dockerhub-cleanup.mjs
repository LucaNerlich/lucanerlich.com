#!/usr/bin/env node
// Purges old tags on Docker Hub for the repositories in .github/dockerhub-cleanup.json.
// Keeps the protected tags plus the newest `keep_last` tags per repository, and
// never deletes a tag younger than `min_age_days`. Runs as a dry run unless
// DRY_RUN=false.

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const API = 'https://hub.docker.com/v2';
const CONFIG = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '.github',
    'dockerhub-cleanup.json',
);

// A tag Docker Hub gives no timestamp is treated as newest, so it is kept.
const pushedAt = tag => {
    const raw = tag.tag_last_pushed ?? tag.last_updated;
    const ms = raw ? Date.parse(raw) : NaN;
    return Number.isFinite(ms) ? ms : Number.POSITIVE_INFINITY;
};

export const selectTagsToDelete = (
    tags,
    {keepLast, minAgeDays, protectedTags},
    now = Date.now(),
) => {
    const keep = new Set(protectedTags);
    [...tags]
        .filter(tag => !keep.has(tag.name))
        .sort((a, b) => pushedAt(b) - pushedAt(a))
        .slice(0, Math.max(0, keepLast))
        .forEach(tag => keep.add(tag.name));
    const cutoff = now - minAgeDays * 86_400_000;
    return tags.filter(tag => !keep.has(tag.name) && pushedAt(tag) < cutoff);
};

// Retry once on a rate limit; anything else is the caller's to handle.
const request = async (fetchImpl, url, init) => {
    let response = await fetchImpl(url, init);
    if (response.status === 429) {
        const wait = Number(response.headers?.get?.('retry-after') ?? 5) * 1000;
        await new Promise(resolve => setTimeout(resolve, wait));
        response = await fetchImpl(url, init);
    }
    return response;
};

const login = async (fetchImpl, username, password) => {
    const response = await request(fetchImpl, `${API}/users/login/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username, password}),
    });
    if (!response.ok) {
        throw new Error(`login failed: ${response.status} ${response.statusText ?? ''}`.trim());
    }
    const {token} = await response.json();
    if (!token) throw new Error('login returned no token');
    return token;
};

const listTags = async (fetchImpl, token, repo) => {
    const tags = [];
    let url = `${API}/repositories/${repo}/tags/?page_size=100&ordering=last_updated`;
    while (url) {
        const response = await request(fetchImpl, url, {headers: {Authorization: `JWT ${token}`}});
        if (!response.ok) throw new Error(`list tags: ${response.status}`);
        const page = await response.json();
        tags.push(...(page.results ?? []));
        url = page.next ?? '';
    }
    return tags;
};

export const run = async ({
    config,
    username,
    password,
    dryRun = true,
    fetchImpl = fetch,
    log = console.log,
}) => {
    const token = await login(fetchImpl, username, password);
    const protectedTags = config.protected ?? ['latest'];
    if (!Array.isArray(protectedTags)) {
        throw new Error('config.protected must be an array of tag names');
    }
    const stats = [];
    for (const name of config.repositories) {
        const repo = name.includes('/') ? name : `${config.namespace}/${name}`;
        const stat = {repo, total: 0, deleted: [], failed: ''};
        stats.push(stat);
        try {
            const tags = await listTags(fetchImpl, token, repo);
            stat.total = tags.length;
            const doomed = selectTagsToDelete(tags, {
                keepLast: config.keep_last ?? 1,
                minAgeDays: config.min_age_days ?? 0,
                protectedTags,
            });
            if (dryRun) {
                stat.deleted = doomed.map(tag => tag.name);
                log(`${repo}: ${tags.length} tags, ${doomed.length} to delete`);
                continue;
            }
            log(`${repo}: ${tags.length} tags, ${doomed.length} to remove`);
            for (const tag of doomed) {
                const response = await request(
                    fetchImpl,
                    `${API}/repositories/${repo}/tags/${encodeURIComponent(tag.name)}/`,
                    {method: 'DELETE', headers: {Authorization: `JWT ${token}`}},
                );
                // A tag another run already removed is the outcome we wanted.
                if (!response.ok && response.status !== 404) {
                    throw new Error(`delete ${tag.name}: ${response.status}`);
                }
                stat.deleted.push(tag.name);
                log(`${repo}: deleted ${tag.name}`);
            }
        } catch (error) {
            // One bad repository must not stop the rest.
            stat.failed = error.message;
            log(`${repo}: FAILED ${error.message}`);
        }
    }
    return stats;
};

const summary = (stats, dryRun) => {
    const lines = [
        `## Docker Hub cleanup (${dryRun ? 'dry run' : 'delete'})`,
        '',
        '| Repository | Tags | Kept | ' + (dryRun ? 'Would delete' : 'Deleted') + ' | Result |',
        '| --- | --- | --- | --- | --- |',
    ];
    for (const stat of stats) {
        const kept = stat.total - stat.deleted.length;
        lines.push(
            `| ${stat.repo} | ${stat.total} | ${kept} | ${stat.deleted.length} | ${stat.failed ? `FAILED: ${stat.failed}` : 'ok'} |`,
        );
    }
    return `${lines.join('\n')}\n`;
};

const main = async () => {
    const username = process.env.DOCKERHUB_USERNAME;
    const password = process.env.DOCKERHUB_TOKEN;
    if (!username || !password) {
        throw new Error('DOCKERHUB_USERNAME and DOCKERHUB_TOKEN must be set');
    }
    const dryRun = process.env.DRY_RUN !== 'false';
    const config = JSON.parse(fs.readFileSync(CONFIG, 'utf8'));
    if (!config.namespace || !Array.isArray(config.repositories) || config.repositories.length === 0) {
        throw new Error(`${CONFIG} needs a namespace and at least one repository`);
    }
    const stats = await run({config, username, password, dryRun});
    if (process.env.GITHUB_STEP_SUMMARY) {
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary(stats, dryRun));
    }
    const failed = stats.filter(stat => stat.failed);
    if (failed.length > 0) {
        throw new Error(`${failed.length} repositories failed: ${failed.map(stat => stat.repo).join(', ')}`);
    }
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    main().catch(error => {
        console.error(`::error::${error.message}`);
        process.exitCode = 1;
    });
}
