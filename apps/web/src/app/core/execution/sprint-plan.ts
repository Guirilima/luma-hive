import { Agent, Feature, Project } from '@domain/models';
import { featureRoute } from '@domain/workspace';

export interface PlanItem {
  featureId: string;
  route: string[];
  briefs: string[];
  missing?: string[];
}

const clip = (value: string, max: number) =>
  String(value || '')
    .trim()
    .slice(0, max);
const key = (value: unknown) =>
  String(value || '')
    .trim()
    .toLocaleLowerCase();

export function defaultPlan(features: Feature[], team: Agent[]): PlanItem[] {
  return features.map((f) => {
    const suggested = featureRoute(f, team);
    const route = suggested.missing.length
      ? []
      : suggested.route.filter((id) => team.find((a) => a.id === id)?.role !== 'commander');
    return {
      featureId: f.id,
      route,
      missing: suggested.missing,
      briefs: route.map((id) => {
        const a = team.find((a) => a.id === id)!;
        const responsibility: Record<string, string> = {
          po: 'Refinar o escopo e os critérios de aceitação e deixar o handoff claro para quem implementa.',
          architect: 'Definir contratos, fronteiras e decisões técnicas antes da implementação.',
          backend: 'Implementar a API, as regras de negócio e a persistência.',
          frontend:
            'Implementar a interface com os estados de carregamento, vazio e erro, integrada à API.',
          mobile: 'Implementar as telas do app, integradas à API.',
          qa: 'Verificar a entrega contra os critérios de aceitação e reportar evidências, lacunas e riscos.',
        };
        const setup: Record<string, string> = {
          architect:
            'Definir a estrutura do repositório, a stack e as convenções a partir da arquitetura e das ADRs, sem implementar features.',
          backend:
            'Criar a base do backend: projeto, dependências, configuração, scripts de build e teste e um endpoint de saúde.',
          frontend:
            'Criar a base do frontend: projeto, dependências, estrutura de pastas, lint e um teste de exemplo.',
          mobile:
            'Criar a base do app: projeto, dependências, estrutura de pastas, lint e um teste de exemplo.',
          qa: 'Verificar a base: o projeto instala, roda, passa no lint e nos testes com os comandos do README.',
        };
        return `${f.key} (${f.title}): ${(f.setup ? setup : responsibility)[a.role] || a.description || 'Executar a etapa da sua especialidade.'}`;
      }),
    };
  });
}

export function sprintPlanPrompt(
  project: Project,
  features: Feature[],
  team: Agent[],
  label: string,
): string {
  const suggested = defaultPlan(features, team);
  return [
    `# Operação ${project.code}: ${project.name}`,
    `## Briefing\n${clip(project.briefing, 4000)}`,
    `## O que vai ser executado\n${label}`,
    '## Squad (codinome / papel / descrição)\n' +
      team
        .filter((a) => a.role !== 'commander')
        .map((a) => `- ${a.name} / ${a.role} / ${clip(a.description, 220)}`)
        .join('\n'),
    '## Features para planejar\n' +
      features
        .map((f) =>
          [
            `### ${f.key}: ${f.title}`,
            `Prioridade ${f.priority} / Área ${f.scope} / Dependências: ${
              f.dependencies
                .map((id) => {
                  const dependency = project.features.find((d) => d.id === id);
                  return dependency ? `${dependency.key} (${dependency.status})` : id;
                })
                .join(', ') || 'nenhuma'
            }`,
            `Escopo: ${clip(f.description, 900)}`,
            `Critérios: ${clip(f.criteria, 700)}`,
            `Contexto de handoff: ${clip(f.context, 600)}`,
            `Rota sugerida: ${suggested
              .find((item) => item.featureId === f.id)!
              .route.map((id) => team.find((a) => a.id === id)?.name)
              .join(' > ')}`,
          ].join('\n'),
        )
        .join('\n\n'),
    'Você é o comandante. Monte somente o plano que a pessoa precisa aprovar. Não use ferramentas, não edite arquivos e não execute código.',
    'Defina a ordem dos especialistas usando somente os codinomes da squad. Você coordena e não entra na rota. Respeite as dependências e, quando houver QA, termine com quem verifica a entrega.',
    'Para cada colega da rota, escreva uma instrução concreta de uma ou duas frases sobre o que ele entrega naquela feature.',
    'Primeiro escreva para a squad, no idioma solicitado, de duas a quatro frases sobre a estratégia e a ordem de ataque. Sem listas longas.',
    'Termine com UM bloco ```json neste formato: {"plan":[{"feature":"F02","route":["CODINOME"],"briefs":{"CODINOME":"instrução"}}]}.',
  ].join('\n\n');
}

/** Only the commander's prose belongs in the conversation, including while streaming. */
export function planningSpeech(raw: string): string {
  const prose = raw.split('```')[0];
  if (prose.trimStart().startsWith('{')) return '';
  return prose.replace(/\{\s*"(?:plan|features)"\s*:[\s\S]*$/, '').trim();
}

export function readSprintPlan(
  raw: string,
  features: Feature[],
  team: Agent[],
): { items: PlanItem[]; text: string } | null {
  const blocks = [...raw.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((m) => m[1]);
  const first = raw.indexOf('{'),
    last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) blocks.push(raw.slice(first, last + 1));
  let data: any;
  for (const block of blocks) {
    try {
      const value = JSON.parse(block);
      if (Array.isArray(value.plan) || Array.isArray(value.features)) {
        data = value;
        break;
      }
    } catch {
      /* A partial CLI chunk is not a complete plan. */
    }
  }
  if (!data) return null;
  const entries = data.plan || data.features,
    defaults = defaultPlan(features, team);
  const specialists = team.filter((a) => a.role !== 'commander');
  const resolve = (value: unknown) =>
    specialists.find(
      (a) =>
        key(a.id) === key(value) ||
        key(a.name) === key(value) ||
        key(a.name).replace(/[^\p{L}\p{N}]+/gu, '-') === key(value),
    );
  let accepted = 0;
  const items = features.map((f, index) => {
    const item = entries.find(
      (item: any) => item && (item.featureId === f.id || key(item.feature) === key(f.key)),
    );
    const ids = [
      ...new Set<string>(
        (Array.isArray(item?.route) ? item.route : [])
          .map((id: unknown) => resolve(id)?.id)
          .filter(Boolean),
      ),
    ].slice(0, 12);
    if (!ids.length) return defaults[index];
    accepted++;
    return {
      featureId: f.id,
      route: ids,
      missing: [],
      briefs: ids.map((id, index) => {
        const agent = specialists.find((a) => a.id === id)!;
        const value = Array.isArray(item.briefs)
          ? item.briefs[index]
          : item.briefs?.[agent.name] ||
            item.briefs?.[agent.name.toLowerCase()] ||
            item.briefs?.[id];
        return (
          clip(typeof value === 'string' ? value : '', 2000) ||
          defaults[features.indexOf(f)].briefs[defaults[features.indexOf(f)].route.indexOf(id)] ||
          agent.description
        );
      }),
    };
  });
  return accepted
    ? { items, text: String(data.reply || data.message || data.say || planningSpeech(raw)).trim() }
    : null;
}
