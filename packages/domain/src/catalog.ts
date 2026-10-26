import data from './catalog.json';
import portraits from './portraits.json';
import { Agent, Conventions, Role, uuid } from './models';
export const ROLES = data.roles as Record<string, Role>;
export const PRESETS = [
  ...Object.values(data.presets).flat(),
  ...data.categories.flatMap((c) => c.presets),
].filter((p, i, all) => all.findIndex((a) => a.name === p.name) === i) as {
  name: string;
  role: string;
  icon: string;
  description?: string;
  specialty?: string;
  style?: string;
  conv?: { template: string; subsets: string[] };
}[];
export const CATEGORIES = data.categories;
export const ICONS = data.icons as Record<string, string>;
export const PORTRAITS = portraits as Record<string, string>;
export const CONVENTION_FAMILIES = data.conventionFamilies;
export const CONVENTION_SUBSETS = data.conventionSubsets;
type ConventionAgent = Pick<Agent, 'role'> & Partial<Pick<Agent, 'name' | 'specialty' | 'icon'>>;
export function conventionFamily(agent: ConventionAgent): string {
  const role = agent.role,
    text = (String(agent.specialty || '') + ' ' + String(agent.icon || '')).toLowerCase();
  if (role === 'commander') return 'commander';
  if (role === 'architect') return 'adr';
  if (role === 'po') return 'prd';
  if (['backend', 'dba'].includes(role)) {
    if (/supabase/.test(text)) return 'supabase';
    if (/firebase|firestore/.test(text)) return 'firebase';
  }
  if (['node', 'java', 'dotnet', 'react', 'angular'].includes(role)) return role;
  if (role === 'backend') {
    for (const [pattern, family] of [
      [/node/, 'node'],
      [/python|fastapi|django/, 'python'],
      [/\bgo\b|golang/, 'go'],
      [/php|laravel|symfony/, 'php'],
      [/java|spring/, 'java'],
      [/c#|\.net|csharp|dotnet/, 'dotnet'],
    ] as [RegExp, string][])
      if (pattern.test(text)) return family;
    return 'backend';
  }
  if (role === 'frontend') {
    for (const [pattern, family] of [
      [/vue|nuxt/, 'vue'],
      [/next/, 'next'],
      [/react/, 'react'],
      [/angular/, 'angular'],
      [/html|vanilla|\bjs\b/, 'vanilla'],
    ] as [RegExp, string][])
      if (pattern.test(text)) return family;
    return 'frontend';
  }
  return (
    (
      {
        dba: 'dba',
        devops: 'devops',
        qa: 'qa',
        mobile: 'mobile',
        security: 'security',
        data: 'data',
        designer: 'design',
        docs: 'docs',
        pm: 'pm',
      } as Record<string, string>
    )[role] || 'general'
  );
}
export const defaultConventions = (
  source: string | ConventionAgent,
  preset?: { template?: string; subsets?: string[] },
): Conventions => {
  const agent = typeof source === 'string' ? { role: source } : source,
    family = conventionFamily(agent),
    families = CONVENTION_FAMILIES as Record<
      string,
      { templates: { key: string; content: string; hint?: { source: string; flags: string } }[] }
    >,
    text = [agent.specialty, agent.icon, agent.name].join(' '),
    templates = families[family]?.templates || families['general'].templates;
  const template =
    templates.find((t) => t.key === preset?.template) ||
    templates.find((t) => t.hint?.source && new RegExp(t.hint.source, t.hint.flags).test(text)) ||
    templates[0];
  let style = ((data.conventionStyles as Record<string, string[]>)[family] || []).slice();
  const t = text.toLowerCase();
  if (family === 'mobile')
    style = /flutter|dart/.test(t)
      ? ['style-dart']
      : /react/.test(t)
        ? ['style-ts']
        : /swift|ios/.test(t)
          ? ['style-swift']
          : /kotlin|android/.test(t)
            ? ['style-kotlin']
            : [];
  if (family === 'devops')
    style = /terraform|iac/.test(t)
      ? ['style-hcl', 'style-shell']
      : /docker|kubernetes|ci\/cd|\bgit\b/.test(t)
        ? ['style-yaml', 'style-shell']
        : ['style-shell'];
  if (family === 'dba')
    style = /mongo/.test(t) ? ['style-js'] : /redis/.test(t) ? [] : ['style-sql'];
  if (family === 'data')
    style = /kafka|stream/.test(t)
      ? []
      : /analytics|\bbi\b/.test(t)
        ? ['style-sql']
        : ['style-sql', 'style-python'];
  const keys = [...new Set([...style, ...(preset?.subsets || [])])];
  return {
    family,
    template: template.key,
    base: template.content,
    subsets: keys
      .map((key) => CONVENTION_SUBSETS.find((s) => s.key === key))
      .filter((s): s is NonNullable<typeof s> => !!s)
      .map((s) => ({
        id: uuid('conv'),
        name: s.name,
        content: s.content,
        source: 'builtin:' + s.key,
      })),
  };
};
export function makeAgent(role = 'backend', name?: string): Agent {
  const r = ROLES[role] || ROLES['custom'],
    preset = PRESETS.find((p) => p.name === (name || r.name));
  const soul =
    (data.souls as Record<string, { soul: string; hellos: string[] }>)[name || r.name] ||
    data.genericSoul;
  return {
    id: uuid('agent'),
    name: name || r.name,
    role,
    specialty: preset?.specialty || '',
    description: preset?.description || r.description,
    prompt:
      r.prompt +
      (preset?.style ? '\n' + preset.style : '') +
      (preset?.specialty
        ? '\nEspecialização: ' +
          preset.specialty +
          '. Prefira os padrões, ferramentas e boas práticas dessa stack.'
        : ''),
    icon: preset?.icon || r.icon,
    provider: 'codex',
    model: 'inherit',
    effort: '',
    tools: [
      'Read',
      'Glob',
      'Grep',
      ...(['commander', 'architect', 'po', 'qa'].includes(role) ? [] : ['Edit', 'Write']),
    ],
    image: '',
    template: name || r.name,
    productionStage: 'ready',
    soul: soul.soul,
    hellos: [...soul.hellos],
    conventions: defaultConventions(
      { role, name: name || r.name, specialty: preset?.specialty, icon: preset?.icon || r.icon },
      preset?.conv,
    ),
    hex: { ...r.hex },
    desk: '',
    linkId: '',
    nextId: '',
  };
}
export function portrait(agent: Agent): string {
  if (agent.image) return agent.image;
  const names = data.avatars as Record<string, string>;
  return PORTRAITS[
    names[agent.template] || names[agent.name] || names[ROLES[agent.role]?.name] || 'commander'
  ];
}
