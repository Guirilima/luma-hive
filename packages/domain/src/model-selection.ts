import { Agent, Effort, Model, Provider, Settings } from './models';
export function allowedEfforts(provider: Provider, model: string, catalog: Model[]): Effort[] {
  const info =
    model && model !== 'inherit'
      ? catalog.find((m) => m.id === model)
      : catalog.find((m) => m.isDefault);
  return info
    ? ['', ...info.efforts.map((e) => e.value as Effort)]
    : provider === 'codex'
      ? ['', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra']
      : [''];
}
export function resolveAgentSelection(
  agent: Agent,
  settings: Settings,
  catalog: Model[],
): { model: string; effort: Effort } {
  const config = settings.providers[agent.provider],
    model = config.model || (agent.model !== 'inherit' ? agent.model : '');
  const available = allowedEfforts(agent.provider, model, catalog);
  const effort =
    config.effort && available.includes(config.effort)
      ? config.effort
      : available.includes(agent.effort)
        ? agent.effort
        : '';
  return { model, effort };
}
