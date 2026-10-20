import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {downloadText} from './io';

describe('downloadText', () => {
    it('revokes the blob URL only after the download task', () => {
        const globals = globalThis as unknown as {
            window?: unknown;
            document?: unknown;
        };
        const savedWindow = globals.window;
        const savedDocument = globals.document;
        const savedCreate = URL.createObjectURL;
        const savedRevoke = URL.revokeObjectURL;
        const calls: string[] = [];
        let scheduled: (() => void) | undefined;

        globals.window = {
            setTimeout: (callback: () => void) => {
                scheduled = callback;
            },
        };
        globals.document = {
            createElement: () => ({
                click: () => calls.push('click'),
            }),
        };
        URL.createObjectURL = () => 'blob:test';
        URL.revokeObjectURL = () => {
            calls.push('revoke');
        };

        try {
            downloadText('session.json', '{}', 'application/json');
            // Revoking in the same task can cancel a download the browser has
            // not started yet.
            assert.deepEqual(calls, ['click']);
            assert.ok(scheduled, 'revoke must be deferred');
            scheduled();
            assert.deepEqual(calls, ['click', 'revoke']);
        } finally {
            globals.window = savedWindow;
            globals.document = savedDocument;
            URL.createObjectURL = savedCreate;
            URL.revokeObjectURL = savedRevoke;
        }
    });
});
