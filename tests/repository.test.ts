import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { WorkspaceRepository } from '../apps/api/src/storage/workspace.repository';
import { createWorkspace } from '../packages/domain/src/workspace';
import { Run, timestamp } from '../packages/domain/src/models';
test('SQLite is created on explicit setup; optimistic updates preserve snapshots', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-store-test-')),
    repo = new WorkspaceRepository(dir);
  try {
    assert.equal(repo.read().exists, false);
    assert.equal(fs.existsSync(repo.file), false);
    const ws = createWorkspace('Store'),
      created = repo.save(ws, '', true);
    assert.ok(fs.existsSync(repo.file));
    assert.throws(() => repo.save(ws, '', true), /already exists/);
    ws.projects[0].name = 'Updated';
    const saved = repo.save(ws, created.rev);
    assert.notEqual(saved.rev, created.rev);
    assert.throws(() => repo.save(ws, created.rev), /another tab/);
    assert.equal(repo.read().workspace?.projects[0].name, 'Updated');
    const version = repo.snapshots()[0];
    assert.equal(repo.snapshot(version.id)?.projects[0].name, 'Store');
  } finally {
    repo.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
test('run events replay in order and unfinished runs become failed on restart', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'luma-runs-test-'));
  let repo = new WorkspaceRepository(dir);
  try {
    repo.save(createWorkspace('History'), '', true);
    const run: Run = {
      id: 'run-test',
      provider: 'codex',
      projectId: 'p',
      agentId: 'a',
      featureId: '',
      kind: 'chat',
      status: 'running',
      startedAt: timestamp(),
      endedAt: null,
      result: null,
    };
    repo.insertRun(run);
    repo.event(run.id, { seq: 1, at: timestamp(), type: 'text', text: 'hello' });
    repo.event(run.id, { seq: 2, at: timestamp(), type: 'text', text: 'world' });
    assert.equal(repo.events(run.id, 1).length, 1);
    repo.close();
    repo = new WorkspaceRepository(dir);
    assert.equal(repo.run(run.id)?.status, 'failed');
    assert.equal(repo.events(run.id)[1].text, 'world');
  } finally {
    repo.close();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
