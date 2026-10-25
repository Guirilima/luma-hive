import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CatalogService, normalizeDevin } from '../apps/api/src/providers/catalog';
import { prepare, createDecoder } from '../apps/api/src/providers/adapters';
import { RunRequest } from '../packages/domain/src/models';
const fake = fileURLToPath(new URL('./fake-cli.mjs', import.meta.url));
test('catalogs use CLI data and Codex pagination instead of a fixed list', async () => {
  const service = new CatalogService(),
    codex = await service.read('codex', fake);
  assert.deepEqual(
    codex.models.map((m) => m.id),
    ['model-sol', 'model-luna'],
  );
  assert.equal(codex.defaultModel, 'model-sol');
  assert.equal(codex.models[0].efforts[1].value, 'high');
  const devin = await service.read('devin', fake);
  assert.equal(devin.models.length, 2);
  const agy = await service.read('antigravity', fake);
  assert.equal(agy.models[0].efforts.length, 2);
});
test('nested Devin models are deduplicated', () => {
  const models = normalizeDevin({
    families: [{ name: 'OpenAI', models: [{ model_uid: 'gpt', label: 'GPT' }, { id: 'gpt' }] }],
  });
  assert.equal(models.length, 1);
  assert.equal(models[0].family, 'OpenAI');
});
test('read-only/no-tools adapters restrict actions and keep complex prompts off the shell', async () => {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'luma-adapter-test-'));
  try {
    const request: RunRequest = {
      provider: 'codex',
      projectId: 'p',
      project: 'p',
      agentId: 'a',
      kind: 'chat',
      prompt: 'quotes " $() & are data',
      systemPrompt: 'system',
      options: { permissionMode: 'read-only', tools: [], model: 'model-sol' },
    };
    const codex = await prepare(request, temp, temp, 'test');
    assert.ok(codex.args.includes('read-only'));
    assert.ok(codex.args.includes('mcp_servers={}'));
    assert.ok(!codex.args.some((a) => a.includes('$()')));
    request.provider = 'devin';
    const devin = await prepare(request, temp, temp, 'devin');
    assert.ok(devin.args.includes('--config'));
    const cfg = JSON.parse(await fs.readFile(devin.cleanup[1], 'utf8'));
    assert.ok(cfg.permissions.deny.includes('exec'));
    request.provider = 'antigravity';
    const agy = await prepare(request, temp, temp, 'agy');
    const markdown = await fs.readFile(agy.cleanup[0], 'utf8');
    assert.match(markdown, /tools: \[\]/);
  } finally {
    await fs.rm(temp, { recursive: true, force: true });
  }
});
test('chunked streams normalize text, tools, usage and failures', () => {
  const decoder = createDecoder('codex'),
    chunks = [
      '{"type":"thread.started","thread_id":"s"}\n{"type":"item.completed","item":{"id":"x","type":"agent_mes',
      'sage","text":"Hello"}}\n{"type":"turn.completed","usage":{"input_tokens":10}}\n',
    ];
  assert.equal(decoder.feed(chunks[0]).length, 0);
  assert.equal(decoder.feed(chunks[1])[0].text, 'Hello');
  assert.equal(decoder.finish()?.usage?.['input_tokens'], 10);
  const failed = createDecoder('antigravity');
  failed.feed(
    JSON.stringify({ event: 'result', result: { status: 'FAILED', error: 'Denied' } }) + '\n',
  );
  assert.equal(failed.finish()?.error, true);
});
