import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeAgent } from '../packages/domain/src/catalog';
import { defaultSettings, createWorkspace, projectGaps } from '../packages/domain/src/workspace';
import { resolveAgentSelection, allowedEfforts } from '../packages/domain/src/model-selection';
import { Model } from '../packages/domain/src/models';
const catalog: Model[] = [
  {
    id: 'sol',
    label: 'Sol',
    description: '',
    isDefault: true,
    defaultEffort: 'medium',
    efforts: [
      { value: 'low', description: '' },
      { value: 'high', description: '' },
    ],
  },
  { id: 'luna', label: 'Luna', description: '', isDefault: false, defaultEffort: '', efforts: [] },
];
test('blank global effort preserves per-agent effort', () => {
  const agent = makeAgent(),
    settings = defaultSettings();
  agent.model = 'sol';
  agent.effort = 'high';
  assert.deepEqual(resolveAgentSelection(agent, settings, catalog), {
    model: 'sol',
    effort: 'high',
  });
  settings.providers.codex.effort = 'low';
  assert.equal(resolveAgentSelection(agent, settings, catalog).effort, 'low');
});
test('global model has precedence and incompatible effort is omitted', () => {
  const agent = makeAgent(),
    settings = defaultSettings();
  agent.model = 'sol';
  agent.effort = 'high';
  settings.providers.codex.model = 'luna';
  assert.deepEqual(resolveAgentSelection(agent, settings, catalog), { model: 'luna', effort: '' });
  assert.deepEqual(allowedEfforts('codex', 'luna', catalog), ['']);
});
test('provider defaults are independent', () => {
  const agent = makeAgent(),
    settings = defaultSettings();
  agent.provider = 'devin';
  agent.model = 'sol';
  settings.providers.codex.model = 'luna';
  assert.equal(resolveAgentSelection(agent, settings, catalog).model, 'sol');
});
test('operation execution requires product documentation and an ADR', () => {
  const p = createWorkspace('Gate').projects[0];
  assert.ok(projectGaps(p).includes('project.briefing'));
  for (const key of [
    'briefing',
    'vision',
    'scopeIn',
    'scopeOut',
    'glossary',
    'architecture',
  ] as const)
    p[key] = 'Defined';
  assert.deepEqual(projectGaps(p), ['project.adrs']);
  p.adrs.push({
    id: 'adr-test',
    title: 'Decision',
    status: 'Proposto',
    date: '',
    content: 'Reasoned decision',
  });
  assert.deepEqual(projectGaps(p), []);
});
