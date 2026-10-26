import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MemoryEntry, MemoryKind } from '@domain/workflow';
import { Run } from '@domain/models';
import { ApiService } from '../../core/api/api.service';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { I18nService, TranslatePipe } from '../../core/i18n/i18n.service';
import { download } from '../../core/ui/dialog.service';
@Component({
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  templateUrl: './memory.component.html',
  styleUrl: './workflow.css',
})
export class MemoryComponent {
  readonly api = inject(ApiService);
  readonly store = inject(WorkspaceStore);
  readonly workflow = inject(WorkflowService);
  readonly i18n = inject(I18nService);
  private readonly route = inject(ActivatedRoute);
  readonly project = signal(
    this.route.snapshot.queryParamMap.get('project') || this.store.project()?.id || '',
  );
  readonly entries = signal<MemoryEntry[]>([]);
  readonly selected = signal(this.route.snapshot.queryParamMap.get('entry') || '');
  readonly editing = signal<MemoryEntry | null>(null);
  readonly status = signal('');
  readonly search = signal('');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly runs = signal<Run[]>([]);
  readonly current = computed(() => this.entries().find((m) => m.id === this.selected()) || null);
  readonly visible = computed(() =>
    this.entries().filter(
      (m) =>
        (!this.status() || m.state === this.status()) &&
        (!this.search() ||
          (m.title + ' ' + m.content)
            .toLocaleLowerCase()
            .includes(this.search().toLocaleLowerCase())),
    ),
  );
  readonly currentProject = computed(() =>
    this.store.workspace()?.projects.find((p) => p.id === this.project()),
  );
  draft = {
    title: '',
    content: '',
    kind: 'decision' as MemoryKind,
    sourceKind: 'manual',
    sourceRef: '',
  };
  constructor() {
    void this.load().then(() => {
      const kind = this.route.snapshot.queryParamMap.get('sourceKind'),
        ref = this.route.snapshot.queryParamMap.get('sourceRef');
      if (kind && ref) {
        this.draft.sourceKind = kind;
        this.draft.sourceRef = ref;
        this.sourceChanged();
      }
    });
  }
  private generation = 0;
  async load() {
    const generation = ++this.generation,
      project = this.project();
    this.error.set('');
    try {
      const [memory, runs] = await Promise.all([
        this.api.memories(this.project()),
        this.api.runs(this.project()),
      ]);
      if (generation !== this.generation || project !== this.project()) return;
      this.entries.set(memory.entries);
      requestAnimationFrame(() =>
        document.querySelector('.memory-card.selected')?.scrollIntoView({ block: 'center' }),
      );
      this.runs.set(runs.runs.filter((r) => r.result));
    } catch (e) {
      this.error.set(this.i18n.text((e as Error).message));
    }
  }
  switchProject(id: string) {
    this.project.set(id);
    this.selected.set('');
    this.reset();
    void this.load();
  }
  reset() {
    this.editing.set(null);
    this.draft = { title: '', content: '', kind: 'decision', sourceKind: 'manual', sourceRef: '' };
  }
  edit(entry: MemoryEntry) {
    this.editing.set(entry);
    this.draft = {
      title: entry.title,
      content: entry.content,
      kind: entry.kind,
      sourceKind: entry.source.kind,
      sourceRef: entry.source.ref,
    };
  }
  sourceChanged() {
    let title = '',
      content = '';
    if (this.draft.sourceKind === 'adr') {
      const a = this.currentProject()?.adrs.find((a) => a.id === this.draft.sourceRef);
      title = a?.title || '';
      content = a?.content || '';
    } else if (this.draft.sourceKind === 'run') {
      const r = this.runs().find((r) => r.id === this.draft.sourceRef);
      title = r?.featureName || r?.agentName || '';
      content = r?.result?.text || '';
    } else if (this.draft.sourceKind === 'chat') {
      const m = Object.entries(this.store.workspace()?.chats || {})
        .filter(([key]) => key.startsWith(this.project() + ':'))
        .flatMap(([, messages]) => messages)
        .find((m) => m.id === this.draft.sourceRef);
      content = m?.text || '';
    }
    if (title) this.draft.title = title.slice(0, 160);
    if (content) this.draft.content = content.slice(0, 12000);
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const editing = this.editing();
      const result = editing
        ? await this.api.updateMemory(editing.id, {
            ...this.draft,
            action: 'edit',
            version: editing.version,
          })
        : await this.api.createMemory({ ...this.draft, projectId: this.project() });
      this.selected.set(result.entry.id);
      this.reset();
      await this.load();
      await this.workflow.refresh();
    } catch (e) {
      this.error.set(this.i18n.text((e as Error).message));
    } finally {
      this.busy.set(false);
    }
  }
  async action(entry: MemoryEntry, action: 'approve' | 'archive') {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.api.updateMemory(entry.id, {
        version: entry.version,
        action,
        confirm: action === 'approve',
      });
      await this.load();
      await this.workflow.refresh();
    } catch (e) {
      this.error.set(this.i18n.text((e as Error).message));
    } finally {
      this.busy.set(false);
    }
  }
  export() {
    download(
      'luma-project-memory-' + this.project() + '.json',
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          projectId: this.project(),
          entries: this.entries(),
        },
        null,
        2,
      ),
    );
  }
}
