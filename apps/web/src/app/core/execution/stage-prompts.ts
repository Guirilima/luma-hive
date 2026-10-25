import { Agent, Feature, Project } from '@domain/models';
import { conversationRole } from './conversation-prompts';

export const calledAgentInstructions = [
  '# Chamado por um colega',
  'Um colega da squad chamou você no meio da etapa dele. Faça só o que ele pediu, dentro da sua especialidade, na pasta do projeto (o diretório de trabalho atual). Não refaça a etapa dele e não avance a rota.',
  'Responda para ele no idioma solicitado, de forma objetiva: o que você decidiu ou fez, os arquivos que alterou e o que ele precisa saber para continuar. Não declare testes ou verificações que não executou.',
].join('\n');

/** The handoff includes approved dependencies and only outputs produced in this run. */
export function stagePrompt(
  project: Project,
  feature: Feature,
  agent: Agent,
  team: Agent[],
  runStart: number,
): string {
  const clip = (s: string, n: number) => String(s || '').slice(0, n);
  const route = feature.route.map((id) => team.find((a) => a.id === id));
  const next = route[feature.step + 1],
    sprint = project.sprints.find((s) => s.id === feature.sprintId);
  const dependencies = feature.dependencies
    .map((id) => project.features.find((f) => f.id === id))
    .filter((f): f is Feature => !!f)
    .map((f) => {
      const output = [...f.outputs].reverse().find((o) => !o.error);
      return `- ${f.key} / ${f.title}${output ? `\n  ${output.simulated ? 'Registro de exemplo, sem evidência de execução real' : 'Entrega aprovada'} (${team.find((a) => a.id === output.agentId)?.name || 'agente'}):\n  ${clip(output.text, 2000).replace(/\n/g, '\n  ')}` : ''}`;
    })
    .join('\n');
  const previous = feature.outputs
    .slice(runStart)
    .filter((o) => !o.error)
    .slice(-4)
    .map(
      (o) => `### ${team.find((a) => a.id === o.agentId)?.name || 'Agente'}\n${clip(o.text, 6000)}`,
    )
    .join('\n\n');
  const mates = team.filter((a) => a.id !== agent.id && a.provider === agent.provider);
  return [
    `# Operação ${project.code}: ${project.name}`,
    `## Briefing do projeto\n${project.briefing || '(sem briefing)'}`,
    `## Sua atribuição\nVocê é ${agent.name}, ${conversationRole(agent)}. Etapa ${feature.step + 1} de ${route.length} da rota: ${route.map((a) => a?.name || '?').join(' > ')}.`,
    `## Feature ${feature.key}: ${feature.title}\nPrioridade: ${feature.priority} / Área: ${feature.scope}${sprint ? ' / Sprint: ' + sprint.name + (sprint.goal ? '\nObjetivo da sprint: ' + sprint.goal : '') : ''}\n\nEscopo:\n${feature.description || '(não detalhado)'}\n\nCritérios de aceitação:\n${feature.criteria}\n\nTarefas:\n${feature.tasks}`,
    dependencies ? `## Dependências já aprovadas\n${dependencies}` : '',
    feature.context ? `## Contexto de handoff registrado\n${clip(feature.context, 6000)}` : '',
    previous ? `## Entregas anteriores nesta rota\n${previous}` : '',
    feature.briefs.length === feature.route.length && feature.briefs[feature.step]
      ? `## Instrução do comandante para você\n${feature.briefs[feature.step]}`
      : '',
    mates.length
      ? `## Colegas que você pode chamar\nUse o mecanismo de subagentes do seu provedor com o identificador luma-* abaixo. Explique o que precisa e o contexto. O colega trabalha na mesma pasta e devolve a resposta para você. Não delegue a sua etapa inteira.\n${mates.map((a) => `- luma-${a.id}: ${a.name}, ${conversationRole(a)}`).join('\n')}`
      : '',
    `## Entrega esperada\nSiga rigorosamente o guia de convenções e boas práticas anexado às suas instruções. Trabalhe na pasta desta operação, o diretório de trabalho atual (projects/${project.folder}): todo código, teste e documento fica dentro dela. Execute a sua parte respeitando o seu papel. Não declare testes ou verificações que não executou.\n${next ? `Ao terminar, responda com um resumo de handoff para ${next.name} (${conversationRole(next)}): o que foi feito, arquivos alterados, decisões, pendências e o próximo passo.` : 'Você é a última etapa. Responda com um relatório para a revisão humana: o que foi entregue, arquivos alterados, evidências de verificação executadas, lacunas e riscos.'}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
