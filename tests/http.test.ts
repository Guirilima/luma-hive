import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createServer } from '../apps/api/src/http/server';
import { config } from '../apps/api/src/config';
import { WorkspaceRepository } from '../apps/api/src/storage/workspace.repository';
import { RunService } from '../apps/api/src/runs/run.service';
import { createWorkspace } from '../packages/domain/src/workspace';
import { RunRequest } from '../packages/domain/src/models';
import { request as httpRequest } from 'node:http';
test('HTTP rejects invalid hosts/origins/tokens; authorized fake runs stream and persist', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'luma-http-test-')),
    repository = new WorkspaceRepository(dir),
    runner = new RunService(repository, path.join(dir, 'projects')),
    server = createServer(repository, runner);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number },
    base = `http://127.0.0.1:${address.port}`,
    originalPort = config.port;
  config.port = address.port;
  const headers = { host: `127.0.0.1:${config.port}` };
  try {
    assert.equal((await fetch(base + '/api/workspace', { headers })).status, 401);
    const evilStatus = await new Promise<number>((resolve) => {
      httpRequest(base + '/api/session', { headers: { host: 'evil.example' } }, (response) => {
        response.resume();
        resolve(response.statusCode || 0);
      }).end();
    });
    assert.equal(evilStatus, 421);
    assert.equal(
      (
        await fetch(base + '/api/session', {
          headers: { ...headers, origin: 'https://evil.example' },
        })
      ).status,
      403,
    );
    const { token } = (await (await fetch(base + '/api/session', { headers })).json()) as {
      token: string;
    };
    const auth = { ...headers, 'x-luma-token': token, 'content-type': 'application/json' },
      w = createWorkspace('HTTP');
    let response = await fetch(base + '/api/setup', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify(w),
    });
    assert.equal(response.status, 201);
    response = await fetch(base + '/api/setup', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify(w),
    });
    assert.equal(response.status, 409);
    const request: RunRequest = {
      provider: 'codex',
      projectId: w.projects[0].id,
      project: w.projects[0].folder,
      agentId: w.agents[0].id,
      kind: 'chat',
      prompt: 'TEST',
      systemPrompt: '',
      options: {
        executable: fileURLToPath(new URL('./fake-cli.mjs', import.meta.url)),
        tools: [],
        permissionMode: 'read-only',
        timeoutSec: 10,
      },
    };
    response = await fetch(base + '/api/runs', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ ...request, project: '../escape' }),
    });
    assert.equal(response.status, 400);
    response = await fetch(base + '/api/runs', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify(request),
    });
    assert.equal(response.status, 201);
    const { run } = (await response.json()) as { run: { id: string } };
    const events = await (
      await fetch(base + `/api/runs/${run.id}/events`, { headers: auth })
    ).text();
    assert.match(events, /Verified fake CLI result/);
    assert.equal(repository.run(run.id)?.status, 'done');
    assert.equal(repository.run(run.id)?.result?.usage?.['input_tokens'], 7);
    const hold = await runner.start({ ...request, prompt: 'HOLD' });
    runner.cancel(hold.id);
    await new Promise((resolve) => setTimeout(resolve, 800));
    assert.equal(repository.run(hold.id)?.status, 'cancelled');
  } finally {
    runner.shutdown();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    repository.close();
    config.port = originalPort;
    await fs.rm(dir, { recursive: true, force: true });
  }
});
