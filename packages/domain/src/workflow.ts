import type { Effort, Provider, Workspace, ChatMessage } from './models';
export type MemoryKind = 'decision' | 'constraint' | 'lesson';
export interface MemorySource {
  kind: 'manual' | 'adr' | 'run' | 'chat';
  ref: string;
  excerpt: string;
}
export interface MemoryEntry {
  id: string;
  projectId: string;
  title: string;
  content: string;
  kind: MemoryKind;
  state: 'proposed' | 'approved' | 'archived';
  version: number;
  createdAt: string;
  updatedAt: string;
  approvedAt: string | null;
  source: MemorySource;
  history: {
    at: string;
    action: string;
    version: number;
    title: string;
    content: string;
    actor: 'local-user';
  }[];
}
export interface CheckpointAttempt {
  runId: string;
  at: string;
  state: 'running' | 'confirmed' | 'failed' | 'uncertain';
}
export interface Checkpoint {
  id: string;
  featureId: string;
  featureKey: string;
  agentId: string;
  index: number;
  runStart: number;
  state: 'pending' | 'launching' | 'running' | 'confirmed' | 'failed' | 'uncertain';
  runId: string | null;
  confirmedAt: string | null;
  attempts: CheckpointAttempt[];
}
export interface DurableOperation {
  id: string;
  projectId: string;
  state: 'running' | 'pausing' | 'paused' | 'interrupted' | 'blocked' | 'completed' | 'cancelled';
  nextAt?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt: string;
  current: number;
  reason: string;
  detail: string;
  stages: Checkpoint[];
  routes: Record<string, string[]>;
  selections: Record<string, { model: string; effort: Effort }>;
  audit: { at: string; action: string; stageId?: string }[];
}
export type AttentionKind =
  'question' | 'approval' | 'review' | 'failure' | 'permission' | 'blocked' | 'recovery' | 'memory';
export interface AttentionItem {
  id: string;
  projectId: string;
  projectName: string;
  kind: AttentionKind;
  title: string;
  detail: string;
  at: string;
  agentId?: string;
  featureId?: string;
  runId?: string;
  chatKey?: string;
  messageId?: string;
  operationId?: string;
  memoryId?: string;
  provider?: Provider;
  acknowledgedAt?: string;
}

/** Menus and suggested navigation actions are not questions awaiting an answer. */
export function pendingQuestions(
  workspace: Workspace,
  projectId: string,
): { key: string; message: ChatMessage }[] {
  return Object.entries(workspace.chats)
    .filter(([key]) => key.startsWith(projectId + ':'))
    .flatMap(([key, messages]) => {
      const lastUser = messages.map((m) => m.role).lastIndexOf('user');
      return messages
        .slice(lastUser + 1)
        .filter(
          (m) =>
            m.role === 'assistant' &&
            !m.used &&
            [...(m.options || []), ...(m.list || [])].some((o) => o.id === 'answer'),
        )
        .map((message) => ({ key, message }));
    });
}
