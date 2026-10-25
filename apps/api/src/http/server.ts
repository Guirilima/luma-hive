import { UsageService } from '../usage/usage.service';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config';
import { WorkspaceRepository } from '../storage/workspace.repository';
import { RunService } from '../runs/run.service';
import { CatalogService } from '../providers/catalog';
import { resolveExecutable, capture } from '../providers/process';
import { PROVIDERS, Provider, RunRequest } from '../../../../packages/domain/src/models';
import { HttpError, requireValue } from '../shared/errors';
import { checkRequest, token } from './security';
const json = (response: http.ServerResponse, status: number, data: unknown) => {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(data));
};
export async function body(request: http.IncomingMessage): Promise<unknown> {
  let text = '';
  for await (const chunk of request) {
    text += chunk;
    if (Buffer.byteLength(text) > 64 * 1024 * 1024) throw new HttpError(413, 'Request too large');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, 'Invalid JSON');
  }
}
export function createServer(
  repository: WorkspaceRepository,
  runs: RunService,
  catalog = new CatalogService(),
): http.Server {
  const usage = new UsageService(repository);
  const handler = async (request: http.IncomingMessage, response: http.ServerResponse) => {
    const url = new URL(request.url || '/', `http://127.0.0.1:${config.port}`),
      method = request.method;
    checkRequest(request, config.port, url);
    const parts = url.pathname.split('/').filter(Boolean);
    if (method === 'GET' && url.pathname === '/api/session') return json(response, 200, { token });
    if (url.pathname === '/api/workspace') {
      if (method === 'GET') return json(response, 200, repository.read());
      if (method === 'PUT') {
        const payload = (await body(request)) as { workspace: unknown; rev: string };
        return json(response, 200, repository.save(payload.workspace, payload.rev));
      }
    }
    if (method === 'POST' && url.pathname === '/api/setup')
      return json(response, 201, repository.save(await body(request), '', true));
    if (method === 'GET' && url.pathname === '/api/workspace/snapshots')
      return json(response, 200, { snapshots: repository.snapshots() });
    if (method === 'GET' && parts[1] === 'workspace' && parts[2] === 'snapshots' && parts[3]) {
      const workspace = repository.snapshot(parts[3]);
      requireValue(workspace, 'Version not found', 404);
      return json(response, 200, { workspace });
    }
    if (method === 'POST' && url.pathname === '/api/config') {
      const value = (await body(request)) as { concurrency: number };
      requireValue(
        Number.isInteger(value.concurrency) && value.concurrency >= 1 && value.concurrency <= 8,
        'Invalid concurrency',
      );
      runs.concurrency = value.concurrency;
      return json(response, 200, { ok: true, maxConcurrent: runs.concurrency });
    }
    if (method === 'GET' && url.pathname === '/api/usage') {
      return json(response, 200, await usage.snapshot(url.searchParams.get('refresh') === '1'));
    }
    if (method === 'GET' && ['/api/health', '/api/models'].includes(url.pathname)) {
      const provider = (url.searchParams.get('provider') || 'codex') as Provider;
      requireValue(PROVIDERS.includes(provider), 'Invalid provider');
      const defaultBin = { codex: 'codex', devin: 'devin', antigravity: 'agy' },
        executable = await resolveExecutable(
          url.searchParams.get('path') ||
            process.env['LUMA_' + provider.toUpperCase() + '_BIN'] ||
            defaultBin[provider],
        );
      if (url.pathname === '/api/models') {
        requireValue(executable, 'CLI executable not found', 503);
        return json(response, 200, {
          ok: true,
          ...(await catalog.read(provider, executable!, url.searchParams.get('refresh') === '1')),
        });
      }
      let version: string | null = null,
        runtimeError: string | null = null;
      if (executable) {
        try {
          version = (await capture(executable, ['--version'], 10000)).trim().slice(0, 200);
        } catch (e) {
          runtimeError = (e as Error).message;
        }
      } else runtimeError = 'CLI executable not found';
      return json(response, 200, {
        ok: true,
        provider,
        executable,
        version,
        runtimeError,
        dbReady: repository.read().exists,
        dbPath: repository.file,
        projectsDir: config.projectsDir,
        activeRuns: runs.active.size,
        maxConcurrent: runs.concurrency,
      });
    }
    if (url.pathname === '/api/runs') {
      if (method === 'GET')
        return json(response, 200, {
          runs: repository.runs(url.searchParams.get('projectId') || ''),
        });
      if (method === 'POST')
        return json(response, 201, { run: await runs.start((await body(request)) as RunRequest) });
    }
    if (parts[1] === 'runs' && parts[2]) {
      if (parts[3] === 'events' && method === 'GET')
        return runs.events(
          parts[2],
          response,
          Number(request.headers['last-event-id'] || url.searchParams.get('after') || 0),
        );
      if (parts[3] === 'cancel' && method === 'POST') {
        runs.cancel(parts[2]);
        return json(response, 200, { ok: true });
      }
      if (method === 'GET') {
        const run = repository.run(parts[2]);
        requireValue(run, 'Run not found', 404);
        return json(response, 200, { run, events: repository.events(parts[2]) });
      }
    }
    if (url.pathname.startsWith('/api/')) throw new HttpError(404, 'Endpoint not found');
    if (method !== 'GET' && method !== 'HEAD') throw new HttpError(405, 'Method not allowed');
    let name;
    try {
      name = decodeURIComponent(url.pathname);
    } catch {
      throw new HttpError(400, 'Invalid path');
    }
    let file = path.resolve(config.webDir, '.' + name);
    requireValue(
      file === config.webDir || file.startsWith(config.webDir + path.sep),
      'Invalid static path',
      403,
    );
    if (!path.extname(file)) file = path.join(config.webDir, 'index.html');
    const mime: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2',
    };
    try {
      const data = await fs.readFile(file);
      response.writeHead(200, {
        'content-type': mime[path.extname(file)] || 'application/octet-stream',
        'x-content-type-options': 'nosniff',
        'cache-control': path.extname(file) === '.html' ? 'no-store' : 'public, max-age=3600',
      });
      response.end(method === 'HEAD' ? undefined : data);
    } catch {
      throw new HttpError(404, 'Application build not found. Run npm.cmd run build.');
    }
  };
  return http.createServer((request, response) => {
    void handler(request, response).catch((error: Error & { status?: number }) => {
      if (!response.headersSent)
        json(response, error.status || 400, { ok: false, error: error.message });
      else response.end();
    });
  });
}
