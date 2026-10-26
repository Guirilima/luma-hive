import { WorkspaceRepository } from '../storage/workspace.repository';
import { OperationService } from './operation.service';
import { MemoryService } from './memory.service';
import { AttentionItem, pendingQuestions } from '../../../../packages/domain/src/workflow';
import { timestamp } from '../../../../packages/domain/src/models';
import { requireValue } from '../shared/errors';
export class AttentionService {
  constructor(
    private readonly repo: WorkspaceRepository,
    private readonly operations: OperationService,
    private readonly memory: MemoryService,
  ) {}
  list(projectId = '', includeAcknowledged = false): AttentionItem[] {
    const w = this.repo.read().workspace;
    if (!w) return [];
    const rows: AttentionItem[] = [],
      acks = new Map(
        this.repo
          .records<{ id: string; updatedAt: string }>('attention_acks')
          .map((a) => [a.id, a.updatedAt]),
      );
    const projects = w.projects.filter((p) => !projectId || p.id === projectId),
      ops = this.operations.list();
    for (const p of projects) {
      const base = { projectId: p.id, projectName: p.name };
      for (const { key, message: m } of pendingQuestions(w, p.id))
        rows.push({
          ...base,
          id: 'question:' + m.id,
          kind: 'question',
          title: w.agents.find((a) => a.id === m.agentId)?.name || p.name,
          detail: m.text,
          at: m.at,
          agentId: m.agentId,
          chatKey: key,
          messageId: m.id,
        });
      for (const [key, messages] of Object.entries(w.chats).filter(([key]) =>
        key.startsWith(p.id + ':'),
      ))
        for (const m of messages.filter((m) => m.plan?.status === 'awaiting'))
          rows.push({
            ...base,
            id: 'approval:' + m.id,
            kind: 'approval',
            title: m.plan?.label || p.name,
            detail: 'attention.approvalDetail',
            at: m.at,
            agentId: p.commanderId,
            chatKey: key,
            messageId: m.id,
          });
      for (const f of p.features) {
        if (f.status === 'review')
          rows.push({
            ...base,
            id: 'review:' + f.id,
            kind: 'review',
            title: f.key + ' · ' + f.title,
            detail: 'attention.reviewDetail',
            at: f.outputs.at(-1)?.at || p.createdAt,
            featureId: f.id,
            agentId: f.outputs.at(-1)?.agentId,
          });
        if (f.status === 'blocked')
          rows.push({
            ...base,
            id: 'blocked:' + f.id,
            kind: 'blocked',
            title: f.key + ' · ' + f.title,
            detail:
              f.dependencies
                .map((id) => p.features.find((d) => d.id === id))
                .filter((d) => d && d.status !== 'done')
                .map((d) => d!.key + ' · ' + d!.title)
                .join('\n') || 'attention.blockedDetail',
            at: p.createdAt,
            featureId: f.id,
          });
      }
      for (const op of ops.filter(
        (o) =>
          o.projectId === p.id &&
          (['interrupted', 'blocked', 'paused'].includes(o.state) ||
            o.stages.some((s) => s.state === 'uncertain')),
      )) {
        const s = op.stages[op.current];
        const permission = /denied actions|permission denied|read.only|not permitted/i.test(
          op.detail,
        );
        rows.push({
          ...base,
          id: 'recovery:' + op.id,
          kind: permission
            ? 'permission'
            : s?.state === 'failed'
              ? 'failure'
              : op.reason === 'recovery.dependencies'
                ? 'blocked'
                : 'recovery',
          title: s?.featureKey || p.name,
          detail: op.detail || op.reason || 'recovery.state.' + op.state,
          at: op.updatedAt,
          operationId: op.id,
          provider: s?.runId ? this.repo.run(s.runId)?.provider : undefined,
          featureId: s?.featureId,
          runId: s?.runId || undefined,
          agentId: s?.agentId,
        });
      }
      for (const m of this.memory.list(p.id).filter((m) => m.state === 'proposed'))
        rows.push({
          ...base,
          id: 'memory:' + m.id,
          kind: 'memory',
          title: m.title,
          detail: m.content,
          at: m.updatedAt,
          memoryId: m.id,
        });
    }
    const seen = new Set<string>();
    for (const r of this.repo.observationRuns(0, projectId)) {
      const p = projects.find((p) => p.id === r.projectId);
      if (!p || r.operationId) continue;
      const key = [r.projectId, r.agentId, r.featureId, r.kind].join(':');
      if (seen.has(key)) continue;
      seen.add(key);
      if (
        r.status !== 'failed' ||
        (r.featureId && p.features.find((f) => f.id === r.featureId)?.status === 'done')
      )
        continue;
      const detail = r.result?.text || '',
        permission =
          /denied actions|permission denied|not permitted|not allowed|read.only|access.*denied|somente leitura/i.test(
            detail,
          );
      rows.push({
        id: 'run:' + r.id,
        projectId: p.id,
        projectName: p.name,
        kind: permission ? 'permission' : 'failure',
        title:
          (r.featureKey ? r.featureKey + ' · ' : '') +
          (r.agentName || w.agents.find((a) => a.id === r.agentId)?.name || r.agentId),
        detail,
        at: r.endedAt || r.startedAt,
        runId: r.id,
        featureId: r.featureId,
        agentId: r.agentId,
        provider: r.provider,
        acknowledgedAt: acks.get('run:' + r.id),
      });
    }
    return rows
      .filter((r) => includeAcknowledged || !r.acknowledgedAt)
      .sort((a, b) => b.at.localeCompare(a.at));
  }
  acknowledge(id: string) {
    const item = this.list('', true).find((r) => r.id === id);
    requireValue(
      item && id.startsWith('run:') && ['failure', 'permission'].includes(item.kind),
      'attention.invalidAcknowledge',
    );
    const at = timestamp();
    this.repo.putRecord('attention_acks', { id, projectId: item!.projectId, updatedAt: at });
    return { ok: true };
  }
}
