import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {run, selectTagsToDelete} from './dockerhub-cleanup.mjs';

const NOW = Date.parse('2026-10-22T12:00:00Z');
const tag = (name, hoursAgo) => ({
    name,
    tag_last_pushed: new Date(NOW - hoursAgo * 3_600_000).toISOString(),
});
const OPTIONS = {keepLast: 1, minAgeDays: 0, protectedTags: ['latest']};

describe('selectTagsToDelete', () => {
    it('keeps latest and the newest tag, deleting the older ones', () => {
        const tags = [tag('latest', 100), tag('build-new', 2), tag('build-old', 50)];
        assert.deepEqual(
            selectTagsToDelete(tags, OPTIONS, NOW).map(entry => entry.name),
            ['build-old'],
        );
    });

    it('keeps tags younger than minAgeDays even past keepLast', () => {
        const tags = [tag('build-1', 1), tag('build-2', 2), tag('build-3', 3)];
        assert.deepEqual(selectTagsToDelete(tags, {...OPTIONS, minAgeDays: 1}, NOW), []);
    });

    it('keeps a tag Docker Hub gave no timestamp', () => {
        assert.deepEqual(selectTagsToDelete([{name: 'mystery'}], OPTIONS, NOW), []);
    });

    it('does not let a protected tag consume a keep_last slot', () => {
        const tags = [tag('latest', 1), tag('build-new', 2), tag('build-mid', 3), tag('build-old', 24)];
        assert.deepEqual(
            selectTagsToDelete(tags, {...OPTIONS, keepLast: 2}, NOW).map(entry => entry.name),
            ['build-old'],
        );
    });
});

const jsonResponse = body => ({
    ok: true,
    status: 200,
    json: async () => body,
    headers: {get: () => null},
});

const fakeFetch = (calls, tagsByRepo) => async (url, init = {}) => {
    const method = init.method ?? 'GET';
    calls.push({url, method});
    if (url.endsWith('/users/login/')) return jsonResponse({token: 't'});
    if (method === 'DELETE') return {ok: true, status: 204, headers: {get: () => null}};
    const repo = url.match(/repositories\/([^/]+\/[^/]+)\/tags/)[1];
    return jsonResponse({results: tagsByRepo[repo] ?? [], next: null});
};

const config = repositories => ({
    namespace: 'lnhh',
    keep_last: 1,
    min_age_days: 0,
    protected: ['latest'],
    repositories,
});

describe('run', () => {
    it('deletes every tag outside the keep set', async () => {
        const calls = [];
        const fetchImpl = fakeFetch(calls, {
            'lnhh/app': [tag('latest', 1), tag('new', 2), tag('old', 40)],
        });
        const stats = await run({
            config: config(['app']),
            username: 'u',
            password: 'p',
            dryRun: false,
            fetchImpl,
            log: () => {},
        });
        assert.deepEqual(stats[0].deleted, ['old']);
        const deletes = calls.filter(call => call.method === 'DELETE');
        assert.equal(deletes.length, 1);
        assert.match(deletes[0].url, /\/repositories\/lnhh\/app\/tags\/old\/$/);
    });

    it('deletes nothing in a dry run', async () => {
        const calls = [];
        const fetchImpl = fakeFetch(calls, {
            'lnhh/app': [tag('latest', 1), tag('new', 2), tag('old', 40)],
        });
        const stats = await run({
            config: config(['app']),
            username: 'u',
            password: 'p',
            dryRun: true,
            fetchImpl,
            log: () => {},
        });
        assert.deepEqual(stats[0].deleted, ['old']);
        assert.equal(calls.filter(call => call.method === 'DELETE').length, 0);
    });

    it('follows pagination', async () => {
        const calls = [];
        const fetchImpl = async (url, init = {}) => {
            calls.push({url, method: init.method ?? 'GET'});
            if (url.endsWith('/users/login/')) return jsonResponse({token: 't'});
            if (url.includes('page=2')) return jsonResponse({results: [tag('old', 90)], next: null});
            return jsonResponse({
                results: [tag('latest', 1), tag('new', 2)],
                next: 'https://hub.docker.com/v2/repositories/lnhh/app/tags/?page=2',
            });
        };
        const stats = await run({
            config: config(['app']),
            username: 'u',
            password: 'p',
            dryRun: true,
            fetchImpl,
            log: () => {},
        });
        assert.equal(stats[0].total, 3);
        assert.deepEqual(stats[0].deleted, ['old']);
    });

    it('keeps going when one repository fails', async () => {
        const fetchImpl = async (url, init = {}) => {
            if (url.endsWith('/users/login/')) return jsonResponse({token: 't'});
            if (url.includes('/repositories/lnhh/bad/')) {
                return {ok: false, status: 403, headers: {get: () => null}};
            }
            return jsonResponse({results: [], next: null});
        };
        const stats = await run({
            config: config(['bad', 'good']),
            username: 'u',
            password: 'p',
            dryRun: false,
            fetchImpl,
            log: () => {},
        });
        assert.match(stats[0].failed, /403/);
        assert.equal(stats[1].failed, '');
    });

    it('is a dry run when dryRun is omitted', async () => {
        const calls = [];
        const fetchImpl = fakeFetch(calls, {
            'lnhh/app': [tag('latest', 1), tag('new', 2), tag('old', 40)],
        });
        const stats = await run({
            config: config(['app']),
            username: 'u',
            password: 'p',
            fetchImpl,
            log: () => {},
        });
        assert.deepEqual(stats[0].deleted, ['old']);
        assert.equal(calls.filter(call => call.method === 'DELETE').length, 0);
    });

    it('does not report a failed delete as deleted', async () => {
        const fetchImpl = async (url, init = {}) => {
            if (url.endsWith('/users/login/')) return jsonResponse({token: 't'});
            if (init.method === 'DELETE') return {ok: false, status: 500, headers: {get: () => null}};
            return jsonResponse({results: [tag('latest', 1), tag('new', 2), tag('old', 40)], next: null});
        };
        const stats = await run({
            config: config(['app']),
            username: 'u',
            password: 'p',
            dryRun: false,
            fetchImpl,
            log: () => {},
        });
        assert.deepEqual(stats[0].deleted, []);
        assert.match(stats[0].failed, /delete old: 500/);
    });

    it('rejects a protected value that is not an array', async () => {
        const fetchImpl = fakeFetch([], {});
        await assert.rejects(
            run({
                config: {...config(['app']), protected: 'latest'},
                username: 'u',
                password: 'p',
                dryRun: true,
                fetchImpl,
                log: () => {},
            }),
            /config\.protected must be an array/,
        );
    });
});
