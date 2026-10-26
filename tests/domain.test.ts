import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createWorkspace,
  normalizeWorkspace,
  makeFeature,
  hasDependencyCycle,
  refreshBlocked,
  dependenciesReady,
} from '../packages/domain/src/workspace';
import { PORTRAITS, makeAgent, PRESETS } from '../packages/domain/src/catalog';
import { PixelPaths, PIXEL_ROOMS } from '../apps/web/src/app/features/map/renderers/pixel-paths';
import { MESSAGES } from '../apps/web/src/app/core/i18n/messages';
test('new operations contain setup and unique assigned desks', () => {
  const w = createWorkspace('Luma');
  assert.equal(w.version, 3);
  assert.equal(w.projects[0].features[0].setup, true);
  assert.equal(w.settings.layout, 'office-3d');
  assert.equal(new Set(w.agents.map((a) => a.desk)).size, w.agents.length);
  assert.ok(w.agents[0].conventions.base.length > 20);
  assert.ok(PRESETS.length > 60);
});
test('setup must be approved before dependent features can run', () => {
  const w = createWorkspace('Example', true),
    p = w.projects[0],
    f = p.features[1];
  f.status = 'ready';
  refreshBlocked(p);
  assert.equal(f.status, 'blocked');
  assert.equal(dependenciesReady(f, p), false);
  p.features[0].status = 'done';
  refreshBlocked(p);
  assert.equal(f.status, 'ready');
});
test('dependency cycles are rejected before persistence', () => {
  const w = createWorkspace('Cycle', true),
    p = w.projects[0];
  p.features[1].dependencies.push(p.features[2].id);
  p.features[2].dependencies.push(p.features[1].id);
  assert.equal(hasDependencyCycle(p.features), true);
  assert.throws(() => normalizeWorkspace(w), /cycle/);
});
test('v2 imports keep providers and map preference and reset interrupted feature', () => {
  const w = createWorkspace('Import', true),
    old: any = structuredClone(w);
  old.version = 2;
  old.settings = {
    pixelOffice: true,
    squadView: 'office',
    motion: true,
    runtime: {
      mode: 'codex',
      codexPath: 'codex',
      devinPath: 'devin',
      antigravityPath: 'agy',
      permissionMode: 'read-only',
      devinPermissionMode: 'smart',
      antigravityPermissionMode: 'plan',
      timeoutSec: 300,
      concurrency: 3,
    },
  };
  old.projects[0].features[1].status = 'running';
  old.agents[3].provider = 'devin';
  const result = normalizeWorkspace(old, true);
  assert.equal(result.version, 3);
  assert.equal(result.settings.layout, 'office-pixel');
  assert.equal(result.settings.providers.devin.permission, 'smart');
  assert.equal(result.settings.providers.codex.permission, 'read-only');
  assert.equal(result.settings.timeoutSec, 300);
  assert.equal(result.agents[3].provider, 'devin');
  assert.notEqual(result.projects[0].features[1].status, 'running');
});
test('unsafe image URLs are rejected, gallery assets and embedded photos are kept', () => {
  const w = createWorkspace('Photos');
  w.agents[0].image = Object.values(PORTRAITS)[0];
  w.agents[1].image = 'https://tracker.example/secret';
  const saved = normalizeWorkspace(w);
  assert.equal(saved.agents[0].image, w.agents[0].image);
  assert.equal(saved.agents[1].image, '');
});
test('unknown languages/layouts fall back without changing agent identity', () => {
  const w: any = createWorkspace('Preferences');
  w.settings.locale = 'fr';
  w.settings.layout = 'missing';
  const result = normalizeWorkspace(w);
  assert.equal(result.settings.locale, 'pt-BR');
  assert.equal(result.settings.layout, 'office-3d');
  assert.equal(result.agents[0].id, w.agents[0].id);
});
test('pixel routes connect every department through door and corridor nodes', () => {
  const paths = new PixelPaths();
  for (const from of PIXEL_ROOMS)
    for (const to of PIXEL_ROOMS) {
      const route = paths.route(from.id, to.id);
      assert.equal(route[0].id, from.id);
      assert.equal(route.at(-1)?.id, to.id);
      if (from.id !== to.id) assert.ok(route.some((node) => node.id.endsWith(':entry')));
    }
  assert.deepEqual(paths.route('missing', 'command'), []);
});
test('all locales have the same UI keys', () => {
  const keys = Object.keys(MESSAGES['pt-BR']).sort();
  for (const locale of ['en', 'es'] as const) {
    assert.deepEqual(Object.keys(MESSAGES[locale]).sort(), keys);
    for (const value of Object.values(MESSAGES[locale])) assert.ok(value.trim());
  }
});
