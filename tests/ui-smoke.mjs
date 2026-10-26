import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { fileURLToPath } from 'node:url';
let base = process.env.LUMA_TEST_URL,
  server,
  temp;
if (!base) {
  const listener = net.createServer();
  await new Promise((resolve) => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  temp = await fs.mkdtemp(path.join(os.tmpdir(), 'luma-ui-test-'));
  const fake = fileURLToPath(new URL('./fake-cli.mjs', import.meta.url));
  server = spawn(process.execPath, ['dist/api/apps/api/src/main.js'], {
    windowsHide: true,
    stdio: 'ignore',
    env: {
      ...process.env,
      LUMA_PORT: String(port),
      LUMA_DATA_DIR: path.join(temp, 'data'),
      LUMA_PROJECTS_DIR: path.join(temp, 'projects'),
      LUMA_CODEX_BIN: fake,
      LUMA_DEVIN_BIN: fake,
      LUMA_ANTIGRAVITY_BIN: fake,
    },
  });
  base = 'http://127.0.0.1:' + port;
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(base + '/api/session');
      if (response.ok) break;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
await fs.mkdir('previews/screenshots', { recursive: true });
const browser = await chromium.launch({
  headless: true,
  channel: process.env.LUMA_TEST_BROWSER || 'msedge',
  args: ['--use-angle=swiftshader', '--enable-webgl'],
});
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } }),
  errors = [];
page.on('pageerror', (e) => errors.push(e.message));
let step = 'load';
try {
  await page.goto(base, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { name: 'SEU WORKSPACE' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Nome da primeira operação' }).fill('Luma QA');
  await page.getByRole('button', { name: 'Começar do zero' }).click();
  await expect(page.getByRole('heading', { name: 'CENTRAL DE OPERAÇÕES' })).toBeVisible();
  step = 'map';
  await page.locator('.mode-nav').getByRole('link', { name: 'SQUAD', exact: true }).click();
  await expect(page.locator('.map-node')).toHaveCount(6);
  await page.locator('.map-options select').selectOption('office-pixel');
  await expect(page.locator('.map-node')).toHaveCount(6);
  await expect(page.locator('canvas')).toHaveAttribute('data-ready', 'true');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'previews/screenshots/squad-pixel.png' });
  await page.locator('.map-options select').selectOption('office-3d');
  await expect(page.locator('canvas')).toHaveAttribute('data-ready', 'true');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'previews/screenshots/squad-3d.png' });
  step = 'language';
  await page.locator('.locale-switch').selectOption('en');
  await expect(page.locator('.mode-nav').getByRole('link', { name: 'PROJECTS' })).toBeVisible();
  step = 'agent';
  await page.locator('.right-hud').getByRole('button', { name: 'Edit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Agent studio' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Codename', exact: true }).fill('VANGUARD QA');
  await expect(page.locator('select[name=model] option')).toHaveCount(3);
  await page.getByRole('button', { name: 'Appearance', exact: true }).click();
  await page.locator('.portrait-choice').nth(3).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.locator('.right-hud h2')).toHaveText('VANGUARD QA');
  await expect(page.locator('.right-hud .identity img')).toHaveAttribute(
    'src',
    /assets\/portraits/,
  );
  step = 'new feature';
  await page.locator('.mode-nav').getByRole('link', { name: 'PROJECTS' }).click();
  await page.getByRole('button', { name: 'New feature', exact: false }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Test delivery');
  await page
    .getByRole('textbox', { name: 'Acceptance criteria', exact: true })
    .fill('Verified demo handoff');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Test delivery', exact: false })).toBeVisible();
  step = 'briefing';
  await page.locator('.page-heading .button-group button').first().click();
  for (const [label, value] of [
    ['Briefing', 'Deliver a test app'],
    ['Product vision', 'A verified application'],
    ['In scope', 'Test implementation'],
    ['Out of scope', 'Production deployment'],
    ['Glossary', 'QA: quality assurance'],
    ['Architecture', 'Angular 20 + Node + SQLite'],
  ])
    await page.getByRole('textbox', { name: label, exact: true }).fill(value);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Architecture decisions', exact: true }).click();
  await page.getByRole('button', { name: 'New ADR', exact: false }).click();
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill('Local SQLite');
  await page.locator('textarea[name=content]').fill('Use SQLite for this local workspace.');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('button', { name: 'Features', exact: true }).click();
  step = 'demo execution';
  await page.locator('.feature-row').first().locator('button').last().click();
  await expect(page.getByRole('heading', { name: 'PLAN REVIEW' })).toBeVisible();
  await page.getByRole('button', { name: 'Approve plan and run' }).click();
  await expect(page.locator('.feature-row').first().locator('.tag')).toHaveText('In review', {
    timeout: 25000,
  });
  await page.locator('.feature-row').first().locator('.feature-title').click();
  await expect(page.getByRole('heading', { name: 'Review delivery' })).toBeVisible();
  await expect(page.locator('.review-output')).toHaveCount(3);
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await expect(page.locator('.feature-row').first().locator('.tag')).toHaveText('Done');
  step = 'document';
  await page.getByRole('button', { name: 'Documents', exact: true }).click();
  await page.locator('.document-card').last().getByRole('button', { name: 'Edit' }).click();
  await page.locator('textarea[name=content]').fill('Angular 20 + Node + SQLite');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Angular 20 + Node + SQLite', { exact: true })).toBeVisible();
  step = 'chat';
  await page.locator('.mode-nav').getByRole('link', { name: 'SQUAD', exact: true }).click();
  await page.locator('.right-hud').getByRole('button', { name: 'Chat', exact: true }).click();
  await page
    .getByRole('textbox', { name: 'Message', exact: true })
    .fill('Hello, demonstrate this chat');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.locator('.chat-message.assistant')).toHaveCount(1);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  step = 'settings';
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Execution', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Step timeout (seconds)' }).fill('300');
  await page.getByRole('spinbutton', { name: 'Step interval (ms)' }).fill('600');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('.locale-switch').selectOption('es');
  await expect(page.locator('.mode-nav').getByRole('link', { name: 'PROYECTOS' })).toBeVisible();
  await page.waitForTimeout(700);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('.locale-switch')).toHaveValue('es');
  step = 'pixel Spanish';
  await page.locator('.map-options select').selectOption('office-pixel');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'previews/screenshots/squad-es.png' });
  step = 'meeting/library/spawn';
  await page.locator('.locale-switch').selectOption('en');
  await page.locator('.mode-nav').getByRole('link', { name: 'PROJECTS' }).click();
  await page.getByRole('button', { name: 'AGENT TEAMS', exact: true }).click();
  await expect(page.locator('.meeting-members img')).toHaveCount(3);
  await page
    .getByRole('textbox', { name: 'Message', exact: true })
    .fill('Discuss the operation in demonstration mode');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.locator('.chat-message.assistant')).toHaveCount(3);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await page.locator('.mode-nav').getByRole('link', { name: 'SQUAD', exact: true }).click();
  await page.locator('.right-hud').getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('button', { name: 'Advanced', exact: true }).click();
  page.once('dialog', (dialog) => dialog.accept('QA conventions'));
  await page.getByRole('button', { name: 'Save to library', exact: true }).first().click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page
    .locator('.right-hud')
    .getByRole('button', { name: 'Individual spawn', exact: true })
    .click();
  await page
    .locator('luma-spawn select[name=feature]')
    .selectOption({ label: 'F01 / Test delivery' });
  await page.getByRole('button', { name: 'Run', exact: true }).click();
  await page.locator('.mode-nav').getByRole('link', { name: 'PROJECTS' }).click();
  await page.getByRole('button', { name: 'Features', exact: true }).click();
  await expect(page.locator('.feature-row').nth(1).locator('.tag')).toHaveText('In review');
  await page.locator('.feature-row').nth(1).locator('.feature-title').click();
  await expect(page.locator('.review-output')).toHaveCount(1);
  await page
    .getByRole('textbox', { name: 'Review feedback', exact: true })
    .fill('Try another implementation');
  await page.getByRole('button', { name: 'Request changes', exact: true }).click();
  await expect(page.locator('.feature-row').nth(1).locator('.tag')).toHaveText('Backlog');
  await page.locator('.mode-nav').getByRole('link', { name: 'SQUAD', exact: true }).click();
  await page.locator('.map-options select').selectOption('office-pixel');
  await page.locator('.locale-switch').selectOption('es');
  step = 'responsive';
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'previews/screenshots/mobile.png' });
  await expect(page.locator('.map-options select')).toBeVisible();
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.locator('.locale-switch').selectOption('pt-BR');
  await page.locator('.mode-nav').getByRole('link', { name: 'PAINEL' }).click();
  await page.screenshot({ path: 'previews/screenshots/dashboard.png' });
  await page.waitForTimeout(600);
  assertNoErrors();
  console.log(
    'UI smoke passed: onboarding, maps, locales, agent studio/gallery, features, demo execution/review, documents, chat, settings, persistence, responsive layout.',
  );
} catch (error) {
  await page.screenshot({ path: 'previews/screenshots/failure.png' });
  console.error('Failed step:', step);
  console.error('Browser errors:', errors);
  throw error;
} finally {
  await browser.close();
  if (server) {
    server.kill();
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  if (temp) await fs.rm(temp, { recursive: true, force: true });
}
function assertNoErrors() {
  if (errors.length) throw Error(errors.join('\n'));
}
