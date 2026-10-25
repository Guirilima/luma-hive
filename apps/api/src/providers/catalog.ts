import { Provider, Model } from '../../../../packages/domain/src/models';
import { capture, launch, stopProcess } from './process';
export interface Catalog {
  models: Model[];
  defaultModel: string;
}
const identifier = (id: unknown): id is string =>
  typeof id === 'string' && /^[A-Za-z0-9._\-\[\]]{1,80}$/.test(id);
export function normalizeDevin(node: unknown): Model[] {
  const models = new Map<string, Model>();
  const walk = (value: unknown, family = 'Devin', depth = 0) => {
    if (depth > 20 || models.size >= 1000 || !value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (const item of value) walk(item, family, depth + 1);
      return;
    }
    const item = value as Record<string, unknown>,
      id = item['model_uid'] || item['id'] || item['model'] || item['slug'];
    if (identifier(id) && !Array.isArray(item['models']) && !Array.isArray(item['variants'])) {
      models.set(id, {
        id,
        label: String(item['label'] || item['displayName'] || item['title'] || item['name'] || id),
        description: String(item['description'] || ''),
        isDefault: item['isDefault'] === true || item['default'] === true,
        defaultEffort: '',
        efforts: [],
        family,
      });
      return;
    }
    for (const [key, val] of Object.entries(item))
      if (val && typeof val === 'object')
        walk(
          val,
          ['data', 'result', 'response', 'items', 'models', 'variants', 'families'].includes(key)
            ? String(item['family_label'] || item['name'] || item['family'] || family)
            : key,
          depth + 1,
        );
  };
  walk(node);
  return [...models.values()];
}
export function codexCatalog(executable: string): Promise<Catalog> {
  return new Promise((resolve, reject) => {
    const child = launch(executable, ['app-server', '--listen', 'stdio://']);
    let id = 1,
      buffer = '',
      models: Model[] = [],
      defaultModel = '',
      done = false;
    const cursors = new Set<string>();
    const finish = (error?: Error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      child.stdin.end();
      stopProcess(child);
      error
        ? reject(error)
        : resolve({
            models,
            defaultModel: defaultModel || models.find((m) => m.isDefault)?.id || '',
          });
    };
    const timer = setTimeout(() => finish(Error('Model catalog timed out')), 20000);
    const send = (method: string, params: unknown) =>
      child.stdin.write(JSON.stringify({ id, method, params }) + '\n');
    const next = (cursor: string | null) => {
      id++;
      send('model/list', { cursor, limit: 100, includeHidden: false });
    };
    child.stdin.on('error', (e) => finish(e));
    child.on('error', (e) => finish(e));
    child.on('close', () => finish(Error('CLI closed without catalog')));
    child.stderr.on('data', () => {});
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      buffer += chunk;
      if (buffer.length > 4 * 1024 * 1024) return finish(Error('Catalog too large'));
      let cut: number;
      while ((cut = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, cut);
        buffer = buffer.slice(cut + 1);
        let msg: any;
        try {
          msg = JSON.parse(line);
        } catch {
          continue;
        }
        if (msg.id !== id || done) continue;
        if (msg.error) return finish(Error(msg.error.message || 'Catalog error'));
        if (id === 1) {
          child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n');
          id++;
          send('config/read', { includeLayers: false });
        } else if (id === 2) {
          defaultModel = msg.result?.config?.model || '';
          next(null);
        } else {
          if (!Array.isArray(msg.result?.data)) return finish(Error('Unknown catalog format'));
          for (const m of msg.result.data)
            if (!m.hidden && identifier(m.model) && !models.some((v) => v.id === m.model))
              models.push({
                id: m.model,
                label: m.displayName || m.model,
                description: m.description || '',
                isDefault: !!m.isDefault,
                defaultEffort: m.defaultReasoningEffort || '',
                efforts: (m.supportedReasoningEfforts || []).map((e: any) => ({
                  value: e.reasoningEffort,
                  description: e.description || '',
                })),
              });
          const cursor = msg.result.nextCursor;
          if (cursor) {
            if (cursors.has(cursor) || models.length > 1000)
              return finish(Error('Invalid catalog pagination'));
            cursors.add(cursor);
            next(cursor);
          } else finish();
        }
      }
    });
    send('initialize', {
      clientInfo: { name: 'luma_hive', version: '0.1.0' },
      capabilities: { experimentalApi: true },
    });
  });
}
export class CatalogService {
  private readonly cache = new Map<
    string,
    { at: number; value?: Catalog; pending?: Promise<Catalog> }
  >();
  async read(provider: Provider, executable: string, refresh = false): Promise<Catalog> {
    const key = provider + ':' + executable,
      cache = this.cache.get(key);
    if (cache?.pending) return cache.pending;
    if (!refresh && cache?.value && Date.now() - cache.at < 300000) return cache.value;
    const pending = this.load(provider, executable);
    this.cache.set(key, { at: Date.now(), pending });
    try {
      const value = await pending;
      this.cache.set(key, { at: Date.now(), value });
      return value;
    } catch (e) {
      this.cache.delete(key);
      throw e;
    }
  }
  private async load(provider: Provider, executable: string): Promise<Catalog> {
    if (provider === 'codex') return codexCatalog(executable);
    if (provider === 'devin') {
      const models = normalizeDevin(
        JSON.parse(await capture(executable, ['models', 'list', '--format', 'json'])),
      );
      if (!models.length) throw Error('CLI returned no recognizable models');
      return { models, defaultModel: models.find((m) => m.isDefault)?.id || '' };
    }
    const text = await capture(executable, ['models']),
      models: Model[] = text
        .split(/\r?\n/)
        .map((l) => l.split('\t'))
        .filter(([id, label]) => identifier(id) && label)
        .map(([id, label]) => ({
          id,
          label,
          description: '',
          isDefault: false,
          defaultEffort: id.match(/-(low|medium|high|xhigh|max)$/)?.[1] || '',
          efforts: [],
        }));
    for (const m of models)
      m.efforts = models
        .filter(
          (v) =>
            v.defaultEffort &&
            v.id.replace(/-(low|medium|high|xhigh|max)$/, '') ===
              m.id.replace(/-(low|medium|high|xhigh|max)$/, ''),
        )
        .map((v) => ({ value: v.defaultEffort, description: '' }));
    if (!models.length) throw Error('CLI returned no recognizable models');
    return { models, defaultModel: '' };
  }
}
