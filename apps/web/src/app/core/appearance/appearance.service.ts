import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, effect, inject, signal } from '@angular/core';

export const INTERFACE_THEMES = ['futuristic', 'pixel'] as const;
export type InterfaceTheme = (typeof INTERFACE_THEMES)[number];
export const AGENT_APPEARANCES = ['original', 'pixel'] as const;
export type AgentAppearance = (typeof AGENT_APPEARANCES)[number];
const AGENT_KEY = 'luma.agent-appearance.v1';
const STORAGE_KEY = 'luma.interface-theme.v1';

/** Browser preference only. Independent of workspace data and map renderer. */
@Injectable({ providedIn: 'root' })
export class AppearanceService {
  private readonly document = inject(DOCUMENT);
  readonly agentAppearances = AGENT_APPEARANCES;
  readonly agents = signal<AgentAppearance>(this.restoreAgent());
  readonly themes = INTERFACE_THEMES;
  readonly theme = signal<InterfaceTheme>(this.restore());

  constructor() {
    this.apply();
    effect(() => {
      this.apply();
      try {
        this.document.defaultView?.localStorage.setItem(STORAGE_KEY, this.theme());
        this.document.defaultView?.localStorage.setItem(AGENT_KEY, this.agents());
      } catch {}
    });
    const sync = (event: StorageEvent) => {
      if (event.key === AGENT_KEY) this.setAgentAppearance(event.newValue || 'original');
      if (event.key === STORAGE_KEY) this.setTheme(event.newValue || 'futuristic');
    };
    this.document.defaultView?.addEventListener('storage', sync);
    inject(DestroyRef).onDestroy(() =>
      this.document.defaultView?.removeEventListener('storage', sync),
    );
  }
  setTheme(value: string): void {
    if (INTERFACE_THEMES.includes(value as InterfaceTheme)) this.theme.set(value as InterfaceTheme);
  }
  setAgentAppearance(value: string): void {
    if (AGENT_APPEARANCES.includes(value as AgentAppearance))
      this.agents.set(value as AgentAppearance);
  }
  private restoreAgent(): AgentAppearance {
    try {
      return this.document.defaultView?.localStorage.getItem(AGENT_KEY) === 'pixel'
        ? 'pixel'
        : 'original';
    } catch {
      return 'original';
    }
  }
  private restore(): InterfaceTheme {
    try {
      return this.document.defaultView?.localStorage.getItem(STORAGE_KEY) === 'pixel'
        ? 'pixel'
        : 'futuristic';
    } catch {
      return 'futuristic';
    }
  }
  private apply(): void {
    this.document.documentElement.dataset['interfaceTheme'] = this.theme();
    this.document.documentElement.dataset['agentAppearance'] = this.agents();
  }
}
