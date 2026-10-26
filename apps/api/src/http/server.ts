import { OperationService } from '../workflow/operation.service';
import { MemoryService } from '../workflow/memory.service';
import { AttentionService } from '../workflow/attention.service';
import { ObservabilityService } from '../observability/observability.service';
import type { ObservationFilters } from '../../../../packages/domain/src/observability';
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
  const observations = new ObservabilityService(repository);
  const operations = new OperationService(repository, runs);
  const memory = new MemoryService(repository);
  const attention = new AttentionService(repository, operations, memory);
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
        operations.validateWorkspaceUpdate(payload.workspace as any);
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
    if (method === 'GET' && url.pathname === '/api/attention')
      return json(response, 200, {
        items: attention.list(
          url.searchParams.get('projectId') || '',
          url.searchParams.get('acknowledged') === '1',
        ),
      });
    if (method === 'POST' && parts[1] === 'attention' && parts[2] && parts[3] === 'acknowledge')
      return json(response, 200, attention.acknowledge(decodeURIComponent(parts[2])));
    if (url.pathname === '/api/memory') {
      if (method === 'GET')
        return json(response, 200, {
          entries: memory.list(url.searchParams.get('projectId') || ''),
        });
      if (method === 'POST')
        return json(response, 201, { entry: memory.create(await body(request)) });
    }
    if (method === 'PATCH' && parts[1] === 'memory' && parts[2])
      return json(response, 200, { entry: memory.update(parts[2], await body(request)) });
    if (url.pathname === '/api/operations') {
      if (method === 'GET')
        return json(response, 200, {
          operations: operations.list(url.searchParams.get('projectId') || ''),
        });
      if (method === 'POST')
        return json(response, 201, { operation: operations.start(await body(request)) });
    }
    if (parts[1] === 'operations' && parts[2]) {
      if (method === 'POST' && parts[3] === 'action') {
        const input = (await body(request)) as any;
        return json(response, 200, {
          operation: await operations.action(
            parts[2],
            input.action,
            input.acknowledge === true,
            input.stageId,
          ),
        });
      }
      if (method === 'GET') return json(response, 200, { operation: operations.get(parts[2]) });
    }
    if (method === 'GET' && url.pathname === '/api/observability') {
      const period = url.searchParams.get('period') || 'month';
      requireValue(['week', 'month', 'all'].includes(period), 'Invalid period');
      const provider = url.searchParams.get('provider') || '';
      requireValue(!provider || PROVIDERS.includes(provider as Provider), 'Invalid provider');
      const offset = Number(url.searchParams.get('offset') || 0),
        limit = Number(url.searchParams.get('limit') || 50);
      requireValue(
        Number.isInteger(offset) &&
          offset >= 0 &&
          Number.isInteger(limit) &&
          limit >= 1 &&
          limit <= 200,
        'Invalid pagination',
      );
      for (const key of ['projectId', 'sprintId', 'agentId', 'model'])
        requireValue((url.searchParams.get(key) || '').length <= 160, 'Invalid filter');
      return json(
        response,
        200,
        observations.snapshot(
          {
            projectId: url.searchParams.get('projectId') || '',
            sprintId: url.searchParams.get('sprintId') || '',
            agentId: url.searchParams.get('agentId') || '',
            model: url.searchParams.get('model') || '',
            provider,
            period: period as ObservationFilters['period'],
          },
          offset,
          limit,
        ),
      );
    }
    if (method === 'GET' && parts[1] === 'runs' && parts[2] && parts[3] === 'trace')
      return json(response, 200, observations.trace(parts[2]));
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
      if (method === 'POST') {
        const input = (await body(request)) as RunRequest;
        requireValue(
          input.kind !== 'step' || !operations.hasOpen(input.projectId),
          'recovery.alreadyOpen',
          409,
        );
        delete input.operationId;
        delete input.checkpointId;
        return json(response, 201, { run: await runs.start(input) });
      }
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
  const server = http.createServer((request, response) => {
    void handler(request, response).catch((error: Error & { status?: number }) => {
      if (!response.headersSent)
        json(response, error.status || 400, { ok: false, error: error.message });
      else response.end();
    });
  });
  server.on('shutdown', () => operations.shutdown());
  server.on('close', () => operations.shutdown());
  return server;
}
