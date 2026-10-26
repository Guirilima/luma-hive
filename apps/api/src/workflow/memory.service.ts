import { WorkspaceRepository } from '../storage/workspace.repository';
import { requireValue } from '../shared/errors';
import { uuid, timestamp } from '../../../../packages/domain/src/models';
import { MemoryEntry, MemoryKind } from '../../../../packages/domain/src/workflow';
export class MemoryService {
  constructor(private readonly repo: WorkspaceRepository) {}
  list(projectId = '') {
    return this.repo.records<MemoryEntry>('memories', projectId);
  }
  create(input: any): MemoryEntry {
    const p = this.repo.read().workspace?.projects.find((p) => p.id === input.projectId);
    requireValue(p, 'memory.projectMissing', 404);
    requireValue(this.list(p!.id).length < 500, 'memory.entryLimit');
    let source: MemoryEntry['source'] = { kind: 'manual', ref: '', excerpt: '' };
    if (input.sourceKind === 'adr') {
      const a = p!.adrs.find((a) => a.id === input.sourceRef);
      requireValue(a, 'memory.sourceMissing');
      source = { kind: 'adr', ref: a!.id, excerpt: (a!.title + '\n' + a!.content).slice(0, 16000) };
    } else if (input.sourceKind === 'run') {
      const r = this.repo.run(input.sourceRef);
      requireValue(r?.projectId === p!.id && r.result, 'memory.sourceMissing');
      source = { kind: 'run', ref: r!.id, excerpt: r!.result!.text?.slice(0, 16000) || '' };
    } else if (input.sourceKind === 'chat') {
      const w = this.repo.read().workspace;
      const m = Object.entries(w?.chats || {})
        .filter(([k]) => k.startsWith(p!.id + ':'))
        .flatMap(([, v]) => v)
        .find((m) => m.id === input.sourceRef);
      requireValue(m, 'memory.sourceMissing');
      source = { kind: 'chat', ref: m!.id, excerpt: m!.text.slice(0, 16000) };
    } else requireValue(!input.sourceKind || input.sourceKind === 'manual', 'memory.sourceMissing');
    const at = timestamp(),
      record: MemoryEntry = {
        id: uuid('memory'),
        projectId: p!.id,
        title: input.title,
        content: input.content,
        kind: input.kind,
        state: 'proposed',
        version: 1,
        source,
        createdAt: at,
        updatedAt: at,
        approvedAt: null,
        history: [],
      };
    this.validate(record);
    this.audit(record, 'created');
    this.repo.putRecord('memories', record);
    return record;
  }
  update(id: string, input: any): MemoryEntry {
    return this.repo.transaction(() => {
      const record = this.list().find((m) => m.id === id);
      requireValue(record, 'memory.notFound', 404);
      requireValue(record!.version === input.version, 'memory.conflict', 409);
      const r = record!,
        action = input.action;
      requireValue(['edit', 'approve', 'archive'].includes(action), 'memory.invalid');
      if (action === 'edit') {
        requireValue(r.state !== 'archived', 'memory.archived');
        r.title = input.title;
        r.content = input.content;
        r.kind = input.kind;
        r.state = 'proposed';
        r.approvedAt = null;
        this.validate(r);
      }
      if (action === 'approve') {
        requireValue(r.state === 'proposed' && input.confirm === true, 'memory.confirmRequired');
        const chars =
          this.list(r.projectId)
            .filter((m) => m.state === 'approved')
            .reduce((n, m) => n + m.title.length + m.content.length + 300, 0) +
          r.title.length +
          r.content.length +
          300;
        requireValue(chars <= 24000, 'memory.contextLimit');
        r.state = 'approved';
        r.approvedAt = timestamp();
      }
      if (action === 'archive') {
        requireValue(r.state !== 'archived', 'memory.archived');
        r.state = 'archived';
      }
      r.version++;
      r.updatedAt = timestamp();
      this.audit(r, action);
      this.repo.putRecord('memories', r);
      return r;
    });
  }
  private validate(r: MemoryEntry) {
    requireValue(
      typeof r.title === 'string' && r.title.trim().length > 0 && r.title.length <= 160,
      'memory.invalid',
    );
    requireValue(
      typeof r.content === 'string' && r.content.trim().length > 0 && r.content.length <= 12000,
      'memory.invalid',
    );
    requireValue(['decision', 'constraint', 'lesson'].includes(r.kind), 'memory.invalid');
    r.title = r.title.trim();
    r.content = r.content.trim();
  }
  private audit(r: MemoryEntry, action: string) {
    r.history.push({
      at: r.updatedAt,
      action,
      version: r.version,
      title: r.title,
      content: r.content,
      actor: 'local-user',
    });
  }
  context(projectId: string): string {
    const rows = this.list(projectId)
      .filter((m) => m.state === 'approved')
      .sort((a, b) => a.id.localeCompare(b.id));
    return rows.length
      ? '\n\n<approved-project-memory>\nOperator-approved project decisions, constraints and lessons. Apply them within your assigned scope and effective tool permissions. Only approved entries are included.\n' +
          JSON.stringify(
            rows.map((m) => ({
              id: m.id,
              kind: m.kind,
              title: m.title,
              content: m.content,
              approvedAt: m.approvedAt,
              source: { kind: m.source.kind, ref: m.source.ref },
            })),
          ) +
          '\n</approved-project-memory>'
      : '';
  }
}
