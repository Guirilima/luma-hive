import type { Delegation } from './observability';
export type Locale = 'pt-BR' | 'en' | 'es';
export type MapLayout = 'office-3d' | 'office-pixel' | 'city-3d';
export type Provider = 'codex' | 'devin' | 'antigravity';
export type Effort = '' | 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'ultra';
export type FeatureStatus = 'backlog' | 'blocked' | 'ready' | 'running' | 'review' | 'done';
export interface Role {
  label: string;
  short: string;
  name: string;
  description: string;
  prompt: string;
  icon: string;
  hex: { q: number; r: number };
  model: string;
  portrait?: string;
}
export interface Conventions {
  family: string;
  template: string;
  base: string;
  subsets: { id: string; name: string; content: string; source?: string }[];
}
export interface Agent {
  id: string;
  name: string;
  role: string;
  specialty: string;
  description: string;
  prompt: string;
  icon: string;
  provider: Provider;
  model: string;
  effort: Effort;
  tools: string[];
  image: string;
  template: string;
  productionStage: 'discovery' | 'identity' | 'prompt' | 'validation' | 'ready';
  soul: string;
  hellos: string[];
  conventions: Conventions;
  hex: { q: number; r: number };
  desk: string;
  linkId: string;
  nextId: string;
}
export interface Squad {
  id: string;
  name: string;
  commanderId: string;
  adrId: string;
  prdId: string;
  operatorIds: string[];
  agentIds: string[];
  createdAt: string;
}
export interface Output {
  agentId: string;
  at: string;
  text: string;
  simulated: boolean;
  error?: boolean;
  costUsd?: number | null;
  durationMs?: number;
  sessionId?: string | null;
  usage?: Record<string, number> | null;
  runId?: string;
}
export interface Feature {
  id: string;
  key: string;
  title: string;
  description: string;
  criteria: string;
  scope: string;
  priority: 'P0' | 'P1' | 'P2';
  status: FeatureStatus;
  dependencies: string[];
  route: string[];
  briefs: string[];
  currentAgentId: string | null;
  step: number;
  outputs: Output[];
  context: string;
  tasks: string;
  sprintId: string;
  setup: boolean;
}
export interface Sprint {
  id: string;
  name: string;
  goal: string;
}
export interface Log {
  id: string;
  at: string;
  agentId: string | null;
  type: string;
  message: string;
  simulated: boolean;
}
export interface Handoff {
  checkpointId?: string;
  id: string;
  at: string;
  from: string;
  to: string;
  featureId: string;
  context: string;
  manual: boolean;
  simulated: boolean;
}
export interface Adr {
  id: string;
  title: string;
  status: string;
  date: string;
  content: string;
}
export interface Project {
  id: string;
  code: string;
  name: string;
  folder: string;
  squadId: string;
  commanderId: string;
  agentIds: string[];
  briefing: string;
  vision: string;
  scopeIn: string;
  scopeOut: string;
  glossary: string;
  architecture: string;
  adrs: Adr[];
  features: Feature[];
  sprints: Sprint[];
  logs: Log[];
  handoffs: Handoff[];
  createdAt: string;
}
export interface ProviderSettings {
  path: string;
  permission: string;
  model: string;
  effort: Effort;
}
export interface Settings {
  squadNodes?: 'icon' | 'photo';
  locale: Locale;
  layout: MapLayout;
  motion: boolean;
  quality: 'high' | 'low';
  cityShape: 'flat' | 'planet';
  teamsChat?: number;
  opsChat?: number;
  stepMs: number;
  mode: 'live' | 'demo';
  timeoutSec: number;
  concurrency: number;
  addDirs: string[];
  providers: Record<Provider, ProviderSettings>;
}
export interface ChatChoice {
  id: string;
  label: string;
  arg?: string;
  key?: string;
  title?: string;
  tag?: string;
  tone?: string;
}
export interface ChatMessage {
  updated?: string[];
  retry?: string;
  plan?: {
    items: { featureId: string; route: string[]; briefs: string[]; missing?: string[] }[];
    status: 'awaiting' | 'approved' | 'cancelled';
    source?: 'commander' | 'default' | 'demo';
    label?: string;
  };
  options?: ChatChoice[];
  list?: ChatChoice[];
  used?: boolean;
  agentId?: string;
  featureId?: string;
  kind?: string;
  from?: string;
  to?: string;
  activities?: RunEvent[];
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  at: string;
  simulated: boolean;
  runId?: string;
}
export interface ConventionEntry {
  id: string;
  name: string;
  family?: string;
  content: string;
  createdAt: string;
}
export interface Workspace {
  version: 3;
  agents: Agent[];
  squads: Squad[];
  projects: Project[];
  projectId: string;
  settings: Settings;
  chats: Record<string, ChatMessage[]>;
  conventionLibrary: { templates: ConventionEntry[]; subsets: ConventionEntry[] };
}
export interface WorkspaceEnvelope {
  ok: boolean;
  exists: boolean;
  workspace: Workspace | null;
  rev: string;
  path: string;
  savedAt: string;
  conflict?: boolean;
}
export interface Model {
  id: string;
  label: string;
  description: string;
  isDefault: boolean;
  defaultEffort: string;
  efforts: { value: string; description: string }[];
  family?: string;
}
export interface Health {
  ok: boolean;
  provider: Provider;
  version: string | null;
  executable: string | null;
  runtimeError: string | null;
  dbReady: boolean;
  dbPath: string;
  projectsDir: string;
  activeRuns: number;
  maxConcurrent: number;
}
export interface RunRequest {
  operationId?: string;
  checkpointId?: string;
  provider: Provider;
  projectId: string;
  project: string;
  agentId: string;
  featureId?: string;
  kind: string;
  prompt: string;
  systemPrompt: string;
  options: {
    model?: string;
    effort?: string;
    permissionMode?: string;
    timeoutSec?: number;
    tools?: string[];
    addDirs?: string[];
    executable?: string;
    agents?: Record<
      string,
      { description: string; prompt: string; tools: string[]; model?: string; effort?: string }
    >;
  };
}
export interface RunEvent {
  seq: number;
  at: string;
  type: 'start' | 'text' | 'tool' | 'tool-result' | 'stderr' | 'result' | 'init' | 'agent';
  activityId?: string;
  sourceAgentId?: string;
  sourceAgentName?: string;
  sourceSessionId?: string;
  delegation?: Delegation;
  usageScope?: 'self' | 'inclusive' | 'unknown';
  command?: { executable: string; args: string[]; cwd: string; pid?: number };
  model?: string;
  permissionMode?: string;
  provider?: Provider;
  callId?: string;
  text?: string;
  name?: string;
  input?: unknown;
  error?: boolean;
  usage?: Record<string, number> | null;
  durationMs?: number;
  sessionId?: string | null;
  costUsd?: number | null;
}
export interface Run {
  operationId?: string;
  checkpointId?: string;
  agentName?: string;
  projectName?: string;
  featureName?: string;
  featureKey?: string;
  sprintId?: string;
  sprintName?: string;
  model?: string;
  id: string;
  projectId: string;
  agentId: string;
  featureId: string;
  provider: Provider;
  kind: string;
  status: 'running' | 'done' | 'failed' | 'cancelled';
  startedAt: string;
  endedAt: string | null;
  result: RunEvent | null;
}
export const PROVIDERS: Provider[] = ['codex', 'devin', 'antigravity'];
export const LOCALES: Locale[] = ['pt-BR', 'en', 'es'];
export const LAYOUTS: MapLayout[] = ['office-3d', 'office-pixel', 'city-3d'];
export const STATUSES: FeatureStatus[] = [
  'backlog',
  'blocked',
  'ready',
  'running',
  'review',
  'done',
];
export const TOOLS = [
  'Read',
  'Glob',
  'Grep',
  'Edit',
  'Write',
  'Bash',
  'WebFetch',
  'WebSearch',
  'NotebookEdit',
];
export const uuid = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;
export const timestamp = () => new Date().toISOString();
