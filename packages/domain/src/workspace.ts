import {
  Agent,
  Feature,
  FeatureStatus,
  Project,
  Settings,
  Squad,
  Workspace,
  LAYOUTS,
  LOCALES,
  PROVIDERS,
  STATUSES,
  TOOLS,
  uuid,
  timestamp,
} from './models';
import { makeAgent, ROLES, PORTRAITS } from './catalog';
import { SLOTS, officeSlot } from './office';
import atlasExample from './atlas-example.json';
import interfaceCatalog from './interface-catalog.json';
export const defaultSettings = (): Settings => ({
  locale: 'pt-BR',
  layout: 'office-3d',
  motion: true,
  quality: 'high',
  cityShape: 'flat',
  stepMs: 1800,
  mode: 'demo',
  timeoutSec: 900,
  concurrency: 2,
  addDirs: [],
  providers: {
    codex: { path: '', permission: 'workspace-write', model: '', effort: '' },
    devin: { path: '', permission: 'accept-edits', model: '', effort: '' },
    antigravity: { path: '', permission: 'accept-edits', model: '', effort: '' },
  },
});
export const makeFeature = (index: number, extra: Partial<Feature> = {}): Feature => ({
  id: uuid('feature'),
  key: 'F' + String(index).padStart(2, '0'),
  title: '',
  description: '',
  criteria: '',
  scope: 'fullstack',
  priority: 'P1',
  status: 'backlog',
  dependencies: [],
  route: [],
  briefs: [],
  currentAgentId: null,
  step: 0,
  outputs: [],
  context: '',
  tasks: '',
  sprintId: '',
  setup: false,
  ...extra,
});
export function makeProject(name: string, squad: Squad, index = 1): Project {
  const sprint = { id: uuid('sprint'), name: 'Sprint 01', goal: '' };
  const p: Project = {
    id: uuid('project'),
    code: 'OP-' + String(index).padStart(3, '0'),
    name,
    folder: `op-${String(index).padStart(3, '0')}-${slug(name)}`.slice(0, 80),
    squadId: squad.id,
    commanderId: squad.commanderId,
    agentIds: [...squad.agentIds],
    briefing: '',
    vision: '',
    scopeIn: '',
    scopeOut: '',
    glossary: '',
    architecture: '',
    adrs: [],
    sprints: [sprint],
    features: [],
    logs: [],
    handoffs: [],
    createdAt: timestamp(),
  };
  ensureSetup(p);
  return p;
}
export function ensureSetup(p: Project): void {
  if (!p.sprints.length) p.sprints.push({ id: uuid('sprint'), name: 'Sprint 01', goal: '' });
  let setup = p.features.find((f) => f.setup);
  if (!setup) {
    setup = makeFeature(0, {
      title: 'Setup do projeto',
      description:
        'Preparar estrutura, stack, dependências, build, testes e README na pasta da operação.',
      criteria:
        'Instalação e execução documentadas. Build e testes verificados. Nenhuma regra de negócio nesta etapa.',
      scope: 'setup',
      priority: 'P0',
      setup: true,
      sprintId: p.sprints[0].id,
    });
    p.features.unshift(setup);
  }
  setup.dependencies = [];
  setup.sprintId = p.sprints[0].id;
  for (const f of p.features)
    if (f !== setup) {
      f.setup = false;
      f.dependencies = [...new Set([setup.id, ...f.dependencies])];
    }
}
export function createWorkspace(name: string, example = false): Workspace {
  if (example) return normalizeWorkspace(atlasExample);
  const agents = ['commander', 'architect', 'po', 'backend', 'frontend', 'qa'].map((r) =>
    makeAgent(r),
  );
  const squad: Squad = {
    id: uuid('squad'),
    name: 'SQUAD ALPHA',
    commanderId: agents[0].id,
    adrId: agents[1].id,
    prdId: agents[2].id,
    operatorIds: agents.slice(3).map((a) => a.id),
    agentIds: agents.map((a) => a.id),
    createdAt: timestamp(),
  };
  const project = makeProject(name, squad);
  assignDesks(agents);
  return {
    version: 3,
    agents,
    squads: [squad],
    projects: [project],
    projectId: project.id,
    settings: defaultSettings(),
    chats: {},
    conventionLibrary: { templates: [], subsets: [] },
  };
}
export const slug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'operation';
export const squadMembers = (s: Squad) => [
  ...new Set([s.commanderId, s.adrId, s.prdId, ...s.operatorIds].filter(Boolean)),
];
export function assignDesks(agents: Agent[]): void {
  const taken = new Set<string>();
  const order = ['A', 'B', 'C', 'LAB', 'REC', 'CMD', 'R'];
  const slots = [...SLOTS]
    .sort((a, b) => order.indexOf(a.room) - order.indexOf(b.room))
    .map((slot) => slot.id);
  for (const a of [...agents].sort(
    (a, b) =>
      (a.role === 'commander' ? 0 : ['architect', 'po'].includes(a.role) ? 1 : 2) -
      (b.role === 'commander' ? 0 : ['architect', 'po'].includes(b.role) ? 1 : 2),
  )) {
    a.desk = officeSlot(a.desk)?.id || a.desk;
    if (!slots.includes(a.desk) || taken.has(a.desk)) {
      const room =
        a.role === 'commander' ? 'CMD' : ['architect', 'po'].includes(a.role) ? 'REC' : 'A';
      a.desk =
        slots.find((s) => s.startsWith(room) && !taken.has(s)) ||
        slots.find((s) => !taken.has(s)) ||
        '';
    }
    taken.add(a.desk);
  }
}
export function hasDependencyCycle(features: Feature[]): boolean {
  const byId = new Map(features.map((f) => [f.id, f.dependencies])),
    active = new Set<string>(),
    done = new Set<string>();
  function visit(id: string): boolean {
    if (active.has(id)) return true;
    if (done.has(id)) return false;
    active.add(id);
    for (const next of byId.get(id) || []) if (visit(next)) return true;
    active.delete(id);
    done.add(id);
    return false;
  }
  return features.some((f) => visit(f.id));
}
export const dependenciesReady = (f: Feature, p: Project) =>
  f.dependencies.every((id) => p.features.find((x) => x.id === id)?.status === 'done');
export function projectGaps(p: Project): string[] {
  const fields = [
    'name',
    'briefing',
    'vision',
    'scopeIn',
    'scopeOut',
    'glossary',
    'architecture',
  ] as const;
  const missing = fields.filter((key) => !p[key]?.trim()).map((key) => 'project.' + key);
  if (!p.adrs.length || p.adrs.some((a) => !a.title.trim() || !a.content.trim()))
    missing.push('project.adrs');
  return missing;
}
export function refreshBlocked(p: Project): void {
  for (const f of p.features)
    if (['ready', 'blocked'].includes(f.status))
      f.status = dependenciesReady(f, p) ? 'ready' : 'blocked';
}
export function normalizeWorkspace(input: unknown, forImport = false): Workspace {
  const raw = structuredClone(input) as Workspace & {
    version: number;
    settings: Settings & {
      runtime?: Record<string, unknown>;
      squadView?: string;
      pixelOffice?: boolean;
      mapQuality?: string;
    };
  };
  if (
    !raw ||
    ![2, 3].includes(raw.version) ||
    !Array.isArray(raw.agents) ||
    !Array.isArray(raw.projects) ||
    !Array.isArray(raw.squads) ||
    raw.agents.length > 200 ||
    !raw.projects.length ||
    raw.projects.length > 100
  )
    throw Error('Invalid workspace format');
  const identities = new Set<string>();
  const check = (id: string) => {
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(id) || identities.has(id))
      throw Error('Invalid or duplicated identifier');
    identities.add(id);
  };
  const settings = defaultSettings(),
    saved = raw.settings || {},
    old = saved.runtime;
  const importedVersion = Number(raw.version);
  raw.version = 3;
  raw.settings = {
    ...settings,
    ...saved,
    providers: { ...settings.providers, ...saved.providers },
  };
  if (old && importedVersion === 2) {
    raw.settings.mode = old['mode'] === 'demo' ? 'demo' : 'live';
    raw.settings.timeoutSec = Number(old['timeoutSec']) || 900;
    raw.settings.concurrency = Number(old['concurrency']) || 2;
    for (const provider of PROVIDERS)
      raw.settings.providers[provider] = {
        path: String(old[provider + 'Path'] || ''),
        permission: String(
          old[provider === 'codex' ? 'permissionMode' : provider + 'PermissionMode'] ||
            settings.providers[provider].permission,
        ),
        model: provider === 'codex' ? String(old['model'] || '') : '',
        effort:
          provider === 'codex'
            ? (String(old['effort'] || '') as Settings['providers']['codex']['effort'])
            : '',
      };
    raw.settings.layout = saved.pixelOffice
      ? 'office-pixel'
      : saved.squadView === 'city'
        ? 'city-3d'
        : 'office-3d';
  }
  if (importedVersion === 2 && !saved.layout)
    raw.settings.layout = saved.pixelOffice
      ? 'office-pixel'
      : saved.squadView === 'city'
        ? 'city-3d'
        : 'office-3d';
  raw.settings.quality =
    saved.quality === 'low'
      ? 'low'
      : saved.quality === 'high'
        ? 'high'
        : saved.mapQuality === 'low'
          ? 'low'
          : 'high';
  delete raw.settings.runtime;
  delete raw.settings.squadView;
  delete raw.settings.pixelOffice;
  delete raw.settings.mapQuality;
  if (!LOCALES.includes(raw.settings.locale)) raw.settings.locale = settings.locale;
  if (!LAYOUTS.includes(raw.settings.layout)) raw.settings.layout = settings.layout;
  raw.settings.timeoutSec = Math.max(10, Math.min(7200, Number(raw.settings.timeoutSec) || 900));
  raw.settings.concurrency = Math.max(1, Math.min(8, Number(raw.settings.concurrency) || 2));
  raw.settings.stepMs = Math.max(100, Math.min(10000, Number(raw.settings.stepMs) || 1800));
  raw.settings.addDirs = Array.isArray(raw.settings.addDirs)
    ? raw.settings.addDirs.filter((d) => typeof d === 'string')
    : [];
  raw.chats = raw.chats || {};
  raw.conventionLibrary = raw.conventionLibrary || { templates: [], subsets: [] };
  raw.conventionLibrary.templates = (raw.conventionLibrary.templates || [])
    .filter((t) => t && typeof t.content === 'string')
    .slice(0, 100);
  raw.conventionLibrary.subsets = (raw.conventionLibrary.subsets || [])
    .filter((t) => t && typeof t.content === 'string')
    .slice(0, 100);
  raw.agents = raw.agents.map((a) => {
    check(a.id);
    if (!ROLES[a.role]) a.role = 'custom';
    const base = makeAgent(a.role, a.name);
    const agent = { ...base, ...a, icon: interfaceCatalog.icons.includes(a.icon) ? a.icon : '' };
    if (!PROVIDERS.includes(agent.provider)) agent.provider = 'codex';
    agent.tools = (a.tools || []).filter((t) => TOOLS.includes(t));
    if (
      agent.image &&
      !Object.values(PORTRAITS).includes(agent.image) &&
      !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(agent.image)
    )
      agent.image = '';
    if (!agent.hex || !Number.isInteger(agent.hex.q) || !Number.isInteger(agent.hex.r))
      agent.hex = { ...ROLES[a.role].hex };
    return agent;
  });
  for (const agent of raw.agents) {
    if (!agent.conventions || typeof agent.conventions.base !== 'string')
      agent.conventions = makeAgent(agent.role, agent.name).conventions;
    agent.conventions.subsets = Array.isArray(agent.conventions.subsets)
      ? agent.conventions.subsets.filter((s) => s && typeof s.content === 'string')
      : [];
  }
  const agentIds = new Set(raw.agents.map((a) => a.id));
  for (const agent of raw.agents) {
    if (!agentIds.has(agent.linkId) || agent.linkId === agent.id) agent.linkId = '';
    if (!agentIds.has(agent.nextId) || agent.nextId === agent.id) agent.nextId = '';
    let next = agent.linkId;
    const visited = new Set([agent.id]);
    while (next) {
      if (visited.has(next)) {
        agent.linkId = '';
        break;
      }
      visited.add(next);
      next = raw.agents.find((a) => a.id === next)?.linkId || '';
    }
  }
  for (const s of raw.squads) {
    check(s.id);
    s.operatorIds = (s.operatorIds || []).filter((id) => agentIds.has(id));
    s.agentIds = squadMembers(s).filter((id) => agentIds.has(id));
  }
  for (const p of raw.projects) {
    check(p.id);
    if (!Array.isArray(p.features) || p.features.length > 500) throw Error('Invalid features');
    const squad = raw.squads.find((q) => q.id === p.squadId);
    p.agentIds = squad ? [...squad.agentIds] : (p.agentIds || []).filter((id) => agentIds.has(id));
    if (squad) p.commanderId = squad.commanderId;
    p.sprints = p.sprints || [];
    for (const s of p.sprints) check(s.id);
    p.adrs = p.adrs || [];
    p.logs = (p.logs || []).slice(-1000);
    p.handoffs = p.handoffs || [];
    if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.folder)) p.folder = slug(p.code + '-' + p.name);
    for (const f of p.features) {
      check(f.id);
      Object.assign(f, { ...makeFeature(1), ...f });
      if (!['done', 'review'].includes(f.status))
        f.route = f.route.filter((id) => p.agentIds.includes(id));
      if (!STATUSES.includes(f.status)) f.status = 'backlog';
      if (forImport && f.status === 'running') {
        f.status = 'ready';
        f.currentAgentId = null;
      }
      f.dependencies = [...new Set(f.dependencies)].filter(
        (id) => id !== f.id && p.features.some((x) => x.id === id),
      );
      if (!p.sprints.some((s) => s.id === f.sprintId)) f.sprintId = p.sprints[0]?.id || '';
    }
    ensureSetup(p);
    if (hasDependencyCycle(p.features)) throw Error('Feature dependency cycle');
    refreshBlocked(p);
  }
  if (!raw.projects.some((p) => p.id === raw.projectId)) raw.projectId = raw.projects[0].id;
  return raw;
}

export const FEATURE_SCOPES: Record<string, string> = {
  setup: 'Setup do projeto',
  fullstack: 'Full-stack',
  backend: 'Backend',
  frontend: 'Frontend',
  architect: 'Arquitetura',
  po: 'Produto',
  qa: 'Qualidade',
  mobile: 'Mobile',
  pm: 'Gestão de projeto',
  designer: 'Design / UX',
  devops: 'Infraestrutura / DevOps',
  security: 'Segurança',
  data: 'Dados / Pipelines',
  docs: 'Documentação',
};
export const ROLE_FAMILY: Record<string, string[]> = {
  backend: ['backend', 'node', 'java', 'dotnet', 'dba'],
  frontend: ['frontend', 'react', 'angular'],
};
export function scopeRoles(scope: string): string[] {
  return (
    (
      {
        setup: ['architect', 'backend', 'frontend', 'qa'],
        fullstack: ['po', 'architect', 'backend', 'frontend', 'qa'],
        backend: ['po', 'architect', 'backend', 'qa'],
        frontend: ['po', 'architect', 'frontend', 'qa'],
        mobile: ['po', 'architect', 'mobile', 'qa'],
      } as Record<string, string[]>
    )[scope] || [scope]
  );
}
export function featureRoute(
  feature: Feature,
  agents: Agent[],
): { route: string[]; missing: string[] } {
  if (feature.route.length && feature.route.every((id) => agents.some((a) => a.id === id)))
    return { route: [...feature.route], missing: [] };
  const route: string[] = [],
    missing: string[] = [];
  for (const role of scopeRoles(feature.setup ? 'setup' : feature.scope)) {
    const agent = (ROLE_FAMILY[role] || [role])
      .map((r) => agents.find((a) => a.role === r))
      .find(Boolean);
    if (agent) route.push(agent.id);
    else missing.push(role);
  }
  return { route: [...new Set(route)], missing };
}
