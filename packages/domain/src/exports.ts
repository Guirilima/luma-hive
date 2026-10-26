import { featureRoute } from './workspace';
import { CONVENTION_FAMILIES, CONVENTION_SUBSETS } from './catalog';
import { Agent, Project, Workspace } from './models';
export interface ExportFile {
  name: string;
  data: string;
}
export const slug = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 75) || 'agent';
export function agentInstructions(agent: Agent): string {
  const text = [
    agent.prompt,
    agent.soul ? `## Personality\n${agent.soul}` : '',
    agent.conventions.base ? `## Conventions\n${agent.conventions.base}` : '',
    ...agent.conventions.subsets.map((s) => `### ${s.name}\n${s.content}`),
    agent.hellos.length ? `## Greetings\n${agent.hellos.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  return text
    .replaceAll('CLAUDE.md', 'AGENTS.md')
    .replaceAll('docs/adr/', 'docs/architecture/adr/')
    .replaceAll('docs/prd/', 'docs/features/');
}
const devinTools: Record<string, string> = {
  Read: 'read',
  Glob: 'glob',
  Grep: 'grep',
  Edit: 'edit',
  Write: 'write',
  Bash: 'exec',
  WebFetch: 'web_fetch',
  WebSearch: 'web_search',
};
const agyTools: Record<string, string> = {
  Read: 'view_file',
  Glob: 'find_by_name',
  Grep: 'grep_search',
  Edit: 'replace_file_content',
  Write: 'write_to_file',
  Bash: 'run_command',
};
export function agentExport(agent: Agent, name = slug(agent.name)): ExportFile {
  const instructions = agentInstructions(agent),
    quoted = JSON.stringify;
  if (agent.provider === 'codex')
    return {
      name: name + '.toml',
      data:
        [
          `name = ${quoted(name)}`,
          `description = ${quoted(agent.description)}`,
          `developer_instructions = ${quoted(instructions)}`,
          `sandbox_mode = ${quoted(agent.tools.some((t) => ['Edit', 'Write', 'Bash'].includes(t)) ? 'workspace-write' : 'read-only')}`,
          ...(agent.model !== 'inherit' ? [`model = ${quoted(agent.model)}`] : []),
          ...(agent.effort ? [`model_reasoning_effort = ${quoted(agent.effort)}`] : []),
        ].join('\n') + '\n',
    };
  if (agent.provider === 'devin')
    return {
      name: name + '.md',
      data: [
        '---',
        `name: ${quoted(name)}`,
        `description: ${quoted(agent.description)}`,
        ...(agent.model !== 'inherit' ? [`model: ${quoted(agent.model)}`] : []),
        `allowed-tools: ${quoted(agent.tools.map((t) => devinTools[t]).filter(Boolean))}`,
        '---',
        '',
        instructions,
        '',
      ].join('\n'),
    };
  return {
    name: name + '.md',
    data: [
      '---',
      `name: ${quoted(name)}`,
      `description: ${quoted(agent.description)}`,
      'mainAgent: false',
      'subagent: true',
      'model: inherit',
      'commandExecutionPolicy: sandbox',
      `tools: ${quoted(agent.tools.map((t) => agyTools[t]).filter(Boolean))}`,
      '---',
      '',
      instructions,
      '',
    ].join('\n'),
  };
}
export function projectExport(workspace: Workspace, project: Project): ExportFile[] {
  const team = project.agentIds
      .map((id) => workspace.agents.find((a) => a.id === id))
      .filter((a): a is Agent => !!a),
    files: ExportFile[] = [],
    names = new Map<string, string>(),
    used = new Set<string>();
  for (const agent of team) {
    const base = slug(agent.name);
    let name = base,
      index = 2;
    while (used.has(name)) name = base + '-' + index++;
    used.add(name);
    names.set(agent.id, name);
    const file = agentExport(agent, name),
      folder =
        agent.provider === 'codex' ? '.codex' : agent.provider === 'devin' ? '.devin' : '.agents';
    files.push(
      { name: folder + '/agents/' + file.name, data: file.data },
      {
        name: 'docs/agents/' + name + '.md',
        data: `# ${agent.name}\n\n${agent.description}\n\nProvider: ${agent.provider}\nModel: ${agent.model}\n\n${agentInstructions(agent)}\n`,
      },
    );
  }
  const features = project.features.map((f) => ({ ...f, route: featureRoute(f, team).route }));
  const route = (ids: string[]) => ids.map((id) => names.get(id) || id).join(' → '),
    title = project.code + ' / ' + project.name;
  files.push({
    name: 'AGENTS.md',
    data: [
      `# ${title}`,
      '',
      'Work only in this operation folder. Read the project documents and feature specification before implementing. Follow the assigned route and conventions. Respect dependencies. Request human review before considering a feature done. Never present simulated outputs as real implementation or validation.',
      '',
      '## Squad',
      ...team.map((a) => `- ${names.get(a.id)} (${a.provider}): ${a.description}`),
      '',
      '## Project documents',
      '- docs/project/briefing.md',
      '- docs/project/product-vision.md',
      '- docs/project/scope.md',
      '- docs/project/glossary.md',
      '- docs/architecture/overview.md',
      '- docs/architecture/adr/',
      '- docs/features/',
      '',
    ].join('\n'),
  });
  files.push(
    { name: 'docs/project/briefing.md', data: `# ${title}\n\n${project.briefing}\n` },
    { name: 'docs/project/product-vision.md', data: `# Product vision\n\n${project.vision}\n` },
    {
      name: 'docs/project/scope.md',
      data: `# Scope\n\n## Included\n${project.scopeIn}\n\n## Excluded\n${project.scopeOut}\n\n## Features\n${project.features.map((f) => `- ${f.key}: ${f.title} (${f.priority}, ${f.scope})`).join('\n')}\n`,
    },
    { name: 'docs/project/glossary.md', data: `# Glossary\n\n${project.glossary}\n` },
    { name: 'docs/architecture/overview.md', data: `# Architecture\n\n${project.architecture}\n` },
  );
  project.adrs.forEach((adr, i) =>
    files.push({
      name: `docs/architecture/adr/ADR-${String(i + 1).padStart(3, '0')}-${slug(adr.title)}.md`,
      data: `# ${adr.title}\n\nStatus: ${adr.status}\nDate: ${adr.date}\n\n${adr.content}\n`,
    }),
  );
  for (const feature of features) {
    const dir = `docs/features/${String(Number(feature.key.replace(/\D/g, '')) || 0).padStart(3, '0')}-${slug(feature.title)}`,
      real = feature.outputs.filter((o) => !o.error && o.simulated === false),
      status =
        ['review', 'done'].includes(feature.status) && !real.length ? 'backlog' : feature.status;
    files.push(
      {
        name: dir + '/spec.md',
        data: [
          '---',
          `id: ${JSON.stringify(feature.key)}`,
          `title: ${JSON.stringify(feature.title)}`,
          `operation: ${JSON.stringify(project.code)}`,
          `area: ${feature.scope}`,
          `priority: ${feature.priority}`,
          `status: ${status}`,
          `sprint: ${JSON.stringify(project.sprints.find((s) => s.id === feature.sprintId)?.name || '')}`,
          `depends_on: ${JSON.stringify(feature.dependencies.map((id) => project.features.find((f) => f.id === id)?.key || id))}`,
          `route: ${JSON.stringify(feature.route.map((id) => names.get(id) || id))}`,
          '---',
          '',
          `# ${feature.key} / ${feature.title}`,
          '',
          `Status: ${status}`,
          `Priority: ${feature.priority}`,
          `Scope: ${feature.scope}`,
          `Sprint: ${project.sprints.find((s) => s.id === feature.sprintId)?.name || ''}`,
          `Dependencies: ${feature.dependencies.map((id) => project.features.find((f) => f.id === id)?.key || id).join(', ')}`,
          `Route: ${route(feature.route)}`,
          '',
          '## Description',
          feature.description,
          '',
          '## Handoff context',
          feature.context,
          '',
          '## Stage instructions',
          ...feature.route.map((id, i) => `${i + 1}. ${names.get(id)}: ${feature.briefs[i] || ''}`),
          '',
          '## Real deliveries',
          ...(real.length
            ? real.map(
                (o) =>
                  `### ${workspace.agents.find((a) => a.id === o.agentId)?.name} / ${o.at}\n\n${o.text}`,
              )
            : ['No real delivery recorded.']),
          ...(feature.outputs.some((o) => o.simulated)
            ? ['', 'Simulation output was intentionally excluded from implementation evidence.']
            : []),
          '',
        ].join('\n'),
      },
      {
        name: dir + '/acceptance-criteria.md',
        data: `# ${feature.key} / Acceptance criteria\n\n${feature.criteria}\n`,
      },
      {
        name: dir + '/tasks.md',
        data: `# ${feature.key} / Tasks\n\n${feature.tasks}\n\n## Assigned stages\n${feature.route.map((id) => '- [ ] ' + names.get(id)).join('\n')}\n- [ ] Human review\n`,
      },
    );
  }
  files.push({
    name: 'docs/project/sprints.md',
    data: project.sprints
      .map(
        (s, i) =>
          `# S${String(i + 1).padStart(2, '0')} / ${s.name}\n\n${s.goal}\n\n${project.features
            .filter((f) => f.sprintId === s.id)
            .map((f) => `- ${f.key}: ${f.title} · ${route(f.route)}`)
            .join('\n')}`,
      )
      .join('\n\n'),
  });
  const codex = team.filter((a) => a.provider === 'codex');
  if (codex.length)
    files.push({
      name: '.codex/config.toml',
      data: [
        '[agents]',
        'enabled = true',
        '',
        ...codex.flatMap((a) => [
          `[agents.${JSON.stringify(names.get(a.id))}]`,
          `description = ${JSON.stringify(a.description)}`,
          `config_file = ${JSON.stringify('agents/' + names.get(a.id) + '.toml')}`,
          '',
        ]),
      ].join('\n'),
    });
  const guideGroups: Record<string, string[]> = {
    frontend: ['frontend', 'angular', 'react', 'designer', 'mobile'],
    backend: ['backend', 'node', 'java', 'dotnet'],
    database: ['dba', 'data'],
    delivery: ['devops', 'qa'],
    security: ['security'],
  };
  for (const [group, roles] of Object.entries(guideGroups)) {
    const selected = team.filter((a) => roles.includes(a.role));
    if (selected.length)
      files.push({
        name: 'docs/conventions/' + group + '-guidelines.md',
        data: selected
          .map(
            (a) =>
              `# ${a.name}\n\n${a.conventions.base}\n\n${a.conventions.subsets.map((s) => `## ${s.name}\n${s.content}`).join('\n\n')}`,
          )
          .join('\n\n'),
      });
  }
  const standards = [
    {
      file: 'coding-style',
      families: [
        'backend',
        'node',
        'java',
        'dotnet',
        'python',
        'go',
        'php',
        'frontend',
        'vanilla',
        'react',
        'angular',
        'vue',
        'next',
        'mobile',
        'qa',
      ],
      groups: ['style', 'quality', 'architecture', 'tests', 'frontend'],
      fallback: ['review-checklist', 'errors'],
    },
    { file: 'api-guidelines', families: [], groups: ['backend'], fallback: ['api-rest'] },
    {
      file: 'database-guidelines',
      families: ['dba', 'supabase', 'firebase', 'data'],
      groups: ['data'],
      fallback: ['migrations', 'sql-naming'],
    },
    {
      file: 'git-conventions',
      families: [],
      groups: ['delivery'],
      fallback: ['commits', 'git-flow'],
    },
    {
      file: 'security-guidelines',
      families: ['security'],
      groups: ['security'],
      fallback: ['security-owasp', 'secrets'],
    },
  ];
  for (const definition of standards) {
    const blocks = new Map<string, { name: string; content: string; agents: string[] }>();
    const add = (name: string, content: string, agentName = '') => {
      const key = name + '\n' + content;
      let block = blocks.get(key);
      if (!block) {
        block = { name, content, agents: [] };
        blocks.set(key, block);
      }
      if (agentName && !block.agents.includes(agentName)) block.agents.push(agentName);
    };
    for (const agent of team) {
      const c = agent.conventions;
      if (definition.families.includes(c.family) && c.base.trim())
        add(c.family, c.base, agent.name);
      for (const subset of c.subsets) {
        const meta = CONVENTION_SUBSETS.find((s) => 'builtin:' + s.key === subset.source);
        if (meta && definition.groups.includes(meta.group))
          add(subset.name, subset.content, agent.name);
      }
    }
    if (!blocks.size)
      for (const key of definition.fallback) {
        const subset = CONVENTION_SUBSETS.find((s) => s.key === key);
        if (subset) add(subset.name, subset.content);
      }
    files.push({
      name: 'docs/standards/' + definition.file + '.md',
      data: [
        `# ${definition.file}`,
        '',
        'Follow existing repository conventions; document conflicts before introducing a different standard.',
        '',
        ...[...blocks.values()].map(
          (b) =>
            `## ${b.name}\n\n${b.content}\n\nSource agents: ${b.agents.join(', ') || 'Catalog defaults'}`,
        ),
        '',
      ].join('\n'),
    });
  }
  files.push({ name: 'docs/architecture/diagrams/.gitkeep', data: '' });
  if (!project.adrs.length) files.push({ name: 'docs/architecture/adr/.gitkeep', data: '' });
  files.push(
    {
      name: 'docs/prompts/planejar-operacao.md',
      data: `# Plan ${title}\n\nRead AGENTS.md, docs/project/, docs/architecture/overview.md, docs/standards/ and the frontmatter of docs/features/*/spec.md. Ask the commander to propose routes and stage instructions for pending features, respecting depends_on and priorities. Identify missing specialists and decisions. Do not implement or change files. Present the plan for human approval.\n`,
    },
    {
      name: 'docs/prompts/executar-feature.md',
      data: `# Execute feature $ARGUMENTS\n\nFind the spec with id: $ARGUMENTS in docs/features/. Read spec.md, acceptance-criteria.md, tasks.md, AGENTS.md and the project/architecture/standards documents. Stop if depends_on contains a feature whose status is not done. Follow route one stage at a time, calling each specialist through its selected CLI. Codex: spawn_agent with agent_type matching .codex/agents/. Devin: run_subagent. Antigravity: invoke_subagent. Share briefing, dependency deliveries, previous stage handoffs and the complete route with every specialist. Record evidence in the spec and tasks. At the end change status to review. Only mark done and verified criteria after explicit human approval. Never use simulated deliveries as implementation evidence.\n`,
    },
    {
      name: 'docs/prompts/executar-sprint.md',
      data: `# Execute sprint $ARGUMENTS\n\nRead docs/project/sprints.md and find the sprint by code or name. Follow dependency and priority order. For every feature not in done or review, run the procedure in docs/prompts/executar-feature.md if all dependencies are done. Features in review still block their dependents. Run one feature at a time. Finish with a report of reviews, blockers and dependencies; never mark done without human approval. These are prompts to copy to the CLI, not installed slash commands.\n`,
    },
  );
  files.push({
    name: 'README.md',
    data: `# ${title}\n\nExported from Luma Hive.\n\nRead AGENTS.md and docs/project/briefing.md. Agent definitions use each selected provider's native format. Model availability and authentication depend on the installed CLI. Features require human review. Simulated deliveries are excluded from implementation evidence.\n`,
  });
  return files;
}
export function zipFiles(files: ExportFile[]): Uint8Array {
  const encoder = new TextEncoder(),
    table = Array.from({ length: 256 }, (_, n) => {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c >>> 0;
    });
  const crc = (data: Uint8Array) => {
    let c = 0xffffffff;
    for (const byte of data) c = table[(c ^ byte) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const date = new Date(),
    time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1),
    day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    parts: Uint8Array[] = [],
    central: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name),
      data = encoder.encode(file.data),
      checksum = crc(data),
      header = new DataView(new ArrayBuffer(30));
    header.setUint32(0, 0x04034b50, true);
    header.setUint16(4, 20, true);
    header.setUint16(6, 0x0800, true);
    header.setUint16(10, time, true);
    header.setUint16(12, day, true);
    header.setUint32(14, checksum, true);
    header.setUint32(18, data.length, true);
    header.setUint32(22, data.length, true);
    header.setUint16(26, name.length, true);
    parts.push(new Uint8Array(header.buffer), name, data);
    const entry = new DataView(new ArrayBuffer(46));
    entry.setUint32(0, 0x02014b50, true);
    entry.setUint16(4, 20, true);
    entry.setUint16(6, 20, true);
    entry.setUint16(8, 0x0800, true);
    entry.setUint16(12, time, true);
    entry.setUint16(14, day, true);
    entry.setUint32(16, checksum, true);
    entry.setUint32(20, data.length, true);
    entry.setUint32(24, data.length, true);
    entry.setUint16(28, name.length, true);
    entry.setUint32(42, offset, true);
    central.push(new Uint8Array(entry.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const size = central.reduce((n, b) => n + b.length, 0),
    end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, size, true);
  end.setUint32(16, offset, true);
  const bytes = new Uint8Array(offset + size + 22);
  let cursor = 0;
  for (const part of [...parts, ...central, new Uint8Array(end.buffer)]) {
    bytes.set(part, cursor);
    cursor += part.length;
  }
  return bytes;
}
