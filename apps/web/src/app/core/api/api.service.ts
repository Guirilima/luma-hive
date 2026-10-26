import type { DurableOperation, MemoryEntry, AttentionItem } from '@domain/workflow';
import type { ObservationFilters, ObservationSnapshot, RunTrace } from '@domain/observability';
import { UsageSnapshot } from '@domain/usage';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  Health,
  Model,
  Provider,
  Run,
  RunEvent,
  RunRequest,
  Workspace,
  WorkspaceEnvelope,
} from '@domain/models';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private token = '';
  async connect(): Promise<void> {
    const session = await firstValueFrom(this.http.get<{ token: string }>('/api/session'));
    this.token = session.token;
  }
  async request<T>(method: string, url: string, body?: unknown): Promise<T> {
    try {
      return await firstValueFrom(
        this.http.request<T>(method, url, { body, headers: { 'x-luma-token': this.token } }),
      );
    } catch (e) {
      const error = e as HttpErrorResponse;
      throw Object.assign(Error(error.error?.error || error.message), { status: error.status });
    }
  }
  workspace(): Promise<WorkspaceEnvelope> {
    return this.request('GET', '/api/workspace');
  }
  create(workspace: Workspace): Promise<WorkspaceEnvelope> {
    return this.request('POST', '/api/setup', workspace);
  }
  save(workspace: Workspace, rev: string): Promise<WorkspaceEnvelope> {
    return this.request('PUT', '/api/workspace', { workspace, rev });
  }
  health(provider: Provider, path = ''): Promise<Health> {
    return this.request('GET', `/api/health?provider=${provider}&path=${encodeURIComponent(path)}`);
  }
  models(
    provider: Provider,
    path = '',
    refresh = false,
  ): Promise<{ models: Model[]; defaultModel: string }> {
    return this.request(
      'GET',
      `/api/models?provider=${provider}&path=${encodeURIComponent(path)}&refresh=${refresh ? '1' : '0'}`,
    );
  }
  snapshots(): Promise<{ snapshots: { id: string; createdAt: string; label: string }[] }> {
    return this.request('GET', '/api/workspace/snapshots');
  }
  snapshot(id: string): Promise<{ workspace: Workspace }> {
    return this.request('GET', '/api/workspace/snapshots/' + id);
  }
  usage(refresh = false): Promise<UsageSnapshot> {
    return this.request('GET', '/api/usage' + (refresh ? '?refresh=1' : ''));
  }
  observations(filters: ObservationFilters, offset = 0): Promise<ObservationSnapshot> {
    const query = new URLSearchParams({ ...filters, offset: String(offset), limit: '50' });
    return this.request('GET', '/api/observability?' + query.toString());
  }
  runTrace(id: string): Promise<RunTrace> {
    return this.request('GET', '/api/runs/' + encodeURIComponent(id) + '/trace');
  }
  operations(): Promise<{ operations: DurableOperation[] }> {
    return this.request('GET', '/api/operations');
  }
  startOperation(input: unknown): Promise<{ operation: DurableOperation }> {
    return this.request('POST', '/api/operations', input);
  }
  operationAction(
    id: string,
    action: string,
    acknowledge = false,
    stageId?: string,
  ): Promise<{ operation: DurableOperation }> {
    return this.request('POST', '/api/operations/' + encodeURIComponent(id) + '/action', {
      action,
      acknowledge,
      stageId,
    });
  }
  attention(acknowledged = false): Promise<{ items: AttentionItem[] }> {
    return this.request('GET', '/api/attention' + (acknowledged ? '?acknowledged=1' : ''));
  }
  acknowledgeAttention(id: string) {
    return this.request('POST', '/api/attention/' + encodeURIComponent(id) + '/acknowledge', {});
  }
  memories(projectId: string): Promise<{ entries: MemoryEntry[] }> {
    return this.request('GET', '/api/memory?projectId=' + encodeURIComponent(projectId));
  }
  createMemory(input: unknown): Promise<{ entry: MemoryEntry }> {
    return this.request('POST', '/api/memory', input);
  }
  updateMemory(id: string, input: unknown): Promise<{ entry: MemoryEntry }> {
    return this.request('PATCH', '/api/memory/' + encodeURIComponent(id), input);
  }
  runs(projectId = ''): Promise<{ runs: Run[] }> {
    return this.request('GET', '/api/runs?projectId=' + encodeURIComponent(projectId));
  }
  run(id: string): Promise<{ run: Run; events: RunEvent[] }> {
    return this.request('GET', '/api/runs/' + id);
  }
  start(request: RunRequest): Promise<{ run: Run }> {
    return this.request('POST', '/api/runs', request);
  }
  cancel(id: string): Promise<unknown> {
    return this.request('POST', '/api/runs/' + id + '/cancel', {});
  }
  subscribe(id: string, onEvent: (event: RunEvent) => void, onError: () => void): () => void {
    const source = new EventSource(
      '/api/runs/' + id + '/events?token=' + encodeURIComponent(this.token),
    );
    let seq = 0;
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as RunEvent;
      if (payload.seq <= seq) return;
      seq = payload.seq;
      onEvent(payload);
      if (payload.type === 'result') source.close();
    };
    source.onerror = () => {
      source.close();
      onError();
    };
    return () => source.close();
  }
}
