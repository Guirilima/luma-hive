import { Agent, ChatMessage, Feature, Project, Squad } from '@domain/models';
import { ROLES } from '@domain/catalog';

export interface ConversationTurn {
  prompt: string;
  systemPrompt: string;
  greeting?: string;
  project?: Project;
}
export interface MeetingGuest {
  by: string;
  reason: string;
}
export interface MeetingReply {
  agent: Agent;
  text: string;
  updated: string[];
}
const clip = (text: string, max: number) =>
  String(text || '')
    .trim()
    .slice(0, max);
const names = (list: string[]) =>
  list.length > 1 ? list.slice(0, -1).join(', ') + ' e ' + list.at(-1) : list[0] || '';
export const conversationRole = (a: Agent) => a.specialty || ROLES[a.role]?.label || a.role;
const fields = {
  briefing: 'Briefing',
  vision: 'Visão do produto',
  scopeIn: 'Dentro do escopo',
  scopeOut: 'Fora do escopo',
  glossary: 'Glossário',
  architecture: 'Visão de arquitetura',
};
export function ownedDocuments(agent: Agent, members: Agent[]): string[] {
  const owner: Record<string, string> = {
    briefing: 'commander',
    vision: 'po',
    scopeIn: 'po',
    scopeOut: 'po',
    glossary: 'po',
    architecture: 'architect',
    adrs: 'architect',
  };
  return Object.entries(owner)
    .filter(
      ([, role]) => (members.some((a) => a.role === role) ? role : 'commander') === agent.role,
    )
    .map(([key]) => key);
}
export const meetingAliases = (a: Agent) => [
  a.name,
  ...(a.role === 'commander'
    ? ['comandante']
    : a.role === 'po'
      ? ['prd']
      : a.role === 'architect'
        ? ['adr', 'arquiteto']
        : []),
];
const askRule =
  '"ask": {"question":"pergunta curta","options":["opção 1","opção 2"]} para perguntar com 2 a 4 opções curtas de escolha única. As opções viram botões e a pessoa também pode responder escrevendo. Use quando uma escolha ajudar a decidir; a pergunta vai só aí, não a repita no texto.';
const coWriteRules = [
  'Responda com mensagens curtas de chat, até 5 frases, no jeito da sua SOUL. Se faltar informação importante, faça no máximo 2 perguntas.',
  'A mensagem é conversa: texto corrido, sem travessões, sem listas e sem negrito. Markdown, listas e subtítulos ficam só dentro dos campos do JSON, sempre sem emojis.',
  'Se houver o que atualizar, uma pergunta com opções ou um colega para chamar, termine com UM bloco ```json contendo só as chaves necessárias.',
  askRule,
  'Parta do conteúdo atual do formulário: preserve o que a pessoa escreveu e mude só o necessário. Cada valor do JSON substitui o campo inteiro.',
];

/** Same role/conventions and SOUL contract as the original chats; no execution context is appended. */
export function conversationIdentity(agent: Agent, greeting = ''): string {
  const guide = [
    agent.conventions.base.trim(),
    ...agent.conventions.subsets
      .filter((s) => s.content.trim())
      .map((s) => `## ${s.name || 'Subset'}\n${s.content.trim()}`),
  ]
    .filter(Boolean)
    .join('\n\n');
  const base = [
    agent.prompt.trim(),
    guide
      ? '# Convenções e boas práticas (obrigatório)\nSiga este guia em todo código, nome, estrutura, teste e entrega desta etapa. Se o repositório já tiver um padrão diferente, siga o padrão do repositório e registre a divergência na entrega.\n\n' +
        guide
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')
    .slice(0, 99000);
  const soul =
    !agent.soul.trim() && !greeting.trim()
      ? ''
      : [
          '## SOUL: como você conversa',
          agent.soul,
          'A SOUL é o seu temperamento, não um personagem. Converse como uma pessoa de verdade mandando mensagem para um colega de trabalho: primeira pessoa, frases naturais e variadas, no seu ritmo e com o seu humor.',
          'Nada de bordões, trocadilhos repetidos ou metáforas temáticas forçadas. Se uma comparação vier natural, uma basta.',
          'Nunca use travessão (— ou –) nem hífen como pontuação. Use vírgula, ponto ou dois-pontos.',
          'Não abra com "Claro!", "Boa pergunta" ou "Ótima pergunta!", não feche com "Espero ter ajudado" ou "Em resumo", não use títulos, negrito ou listas com marcadores na mensagem e não termine toda mensagem com uma pergunta genérica.',
          'Você está sempre de prontidão: responde na hora, pronto para agir.',
          'A SOUL muda só o tom da conversa: não muda as regras, o conteúdo técnico nem o formato do JSON dos campos.',
          greeting
            ? `Você abriu esta conversa dizendo: "${greeting}". Não repita o cumprimento.`
            : '',
        ]
          .filter(Boolean)
          .join('\n');
  return [base, soul].filter(Boolean).join('\n\n');
}

/** Split a queued batch from earlier history, including repeated user messages. */
export function conversationRound(messages: ChatMessage[], pending: string[]) {
  let before = messages.length;
  for (let n = pending.length - 1; n >= 0; n--) {
    for (let i = before - 1; i >= 0; i--) {
      if (messages[i].role === 'user' && messages[i].text === pending[n]) {
        before = i;
        break;
      }
    }
  }
  return { history: messages.slice(0, before), pending };
}
function historyText(history: ChatMessage[], team: Agent[], max: number): string {
  return history
    .filter((m) => m.role !== 'system')
    .slice(-max)
    .map(
      (m) =>
        `${m.role === 'user' ? 'Pessoa' : team.find((a) => a.id === m.agentId)?.name || 'Agente'}: ${m.text}`,
    )
    .join('\n\n');
}
function featuresText(project: Project, team: Agent[], status = false): string {
  return project.sprints
    .map((s) => {
      const list = project.features.filter((f) => f.sprintId === s.id);
      if (!list.length && !status) return '';
      return (
        `### ${s.name}${s.goal ? ': ' + s.goal : ''}\n` +
        (list
          .map(
            (f) =>
              `- ${f.key}: ${f.title} (${status ? f.status : f.scope}, ${f.priority}${status && f.route.length ? ', rota: ' + f.route.map((id) => team.find((a) => a.id === id)?.name || id).join(' → ') : ''})`,
          )
          .join('\n') || '(sem features)')
      );
    })
    .filter(Boolean)
    .join('\n');
}

export function meetingTurn(input: {
  agent: Agent;
  project: Project;
  squad?: Squad;
  team: Agent[];
  members: Agent[];
  guests: Record<string, MeetingGuest>;
  history: ChatMessage[];
  pending: string[];
  round: MeetingReply[];
}): ConversationTurn {
  const { agent, project, squad, team, members, guests, history, pending, round } = input;
  const guest = guests[agent.id],
    mates = members.filter((a) => a.id !== agent.id),
    own = ownedDocuments(agent, members);
  const pool = team.filter((a) => !members.some((m) => m.id === a.id));
  const parts = (a: Agent) =>
    `${a.name} (${conversationRole(a)}) escreve ${names(ownedDocuments(a, members).map((k) => (k === 'adrs' ? 'os ADRs' : fields[k as keyof typeof fields].toLowerCase())))}`;
  const role =
    agent.role === 'commander'
      ? 'Você é o comandante e organizador da reunião: conduz a pauta (briefing, visão do produto, escopo, glossário e arquitetura com ADRs) e escreve o briefing (objetivo, usuários, restrições, prioridades e definição de pronto).'
      : agent.role === 'po'
        ? 'Você é o reconhecedor PRD: escreve a visão do produto, o escopo (dentro e fora) e o glossário, sempre coerentes com o briefing.'
        : 'Você é o reconhecedor ADR: escreve a visão geral da arquitetura e registra as decisões em ADRs, com ao menos um ADR completo (contexto, decisão e consequências).';
  const systemPrompt = guest
    ? [
        '# Agent Teams: convidado numa reunião de kickoff',
        `Você (${agent.name}, ${conversationRole(agent)}) foi chamado para uma reunião online da sua squad por ${guest.by}. A demanda: ${guest.reason || 'contribuir com a sua especialidade para os primeiros documentos da operação'}. Não execute nada, não use ferramentas e não escreva código.`,
        `Na reunião, ${mates
          .filter((a) => !guests[a.id])
          .map(parts)
          .join(
            '; ',
          )}. Os documentos são deles: você não escreve campos, diz o que eles precisam levar em conta, citando-os com @CODINOME.`,
        'Responda a demanda com a sua especialidade, direto ao ponto (até 4 frases), falando com a pessoa como numa chamada. Depois de responder, você sai da chamada. Não passe a palavra nem convide outros agentes.',
        'Se precisar de uma decisão da pessoa antes, termine com UM bloco ```json com ' + askRule,
        'A mensagem é conversa: texto corrido, no jeito da sua SOUL, sem travessões, sem listas, sem negrito e sem emojis.',
      ].join('\n')
    : [
        '# Agent Teams: reunião de kickoff',
        `Você está numa reunião online com a pessoa e com ${names(mates.map((a) => a.name))}, da sua squad, para co-escrever os primeiros documentos de uma operação. A conversa é consultiva: vocês entendem o que a pessoa quer, propõem caminhos e escrevem juntos. Não execute nada, não use ferramentas e não escreva código.`,
        role,
        `Na reunião, ${mates
          .filter((a) => !guests[a.id])
          .map(parts)
          .join('; ')}.`,
        agent.role === 'commander'
          ? 'Você conduz: siga a pauta pelo que ainda falta (veja "## Pauta"), faça uma ou duas perguntas por vez, resuma o que ficou decidido e escreva o briefing assim que ele estiver claro. Quando o assunto for de um colega, passe a palavra a ele com "next" em vez de responder ou escrever no lugar dele.'
          : 'O comandante conduz a reunião. Responda à sua parte, escreva os seus campos e, se precisar de uma decisão, pergunte à pessoa. Não devolva a palavra só por devolver.',
        round.length
          ? `${names(round.map((r) => r.agent.name))} já falou nesta rodada: não repita o que foi dito, complemente com a sua parte.`
          : '',
        `Fale com a pessoa, como numa chamada, sem conversar só entre vocês. Cite os colegas sempre com @CODINOME. Para passar a palavra, escreva @CODINOME no texto e mande "next".`,
        'A pessoa direciona perguntas com @: quando ela marcar você, responda direto a ela.',
        'O canal de encaminhamento desta reunião é implementado pelo aplicativo, fora das ferramentas nativas do CLI. O aplicativo lê o JSON da sua resposta e executa o próximo turno do colega. As ferramentas nativas estarem desabilitadas não impede esse encaminhamento.',
        mates.length
          ? 'Quando a pessoa pedir a palavra de um colega disponível, escreva uma frase curta para ela e termine com um bloco JSON como este (use o codinome solicitado):\n\u0060\u0060\u0060json\n' +
            JSON.stringify({ next: mates[0].name }) +
            '\n\u0060\u0060\u0060\nNão invoque spawn_agent nem outra ferramenta para isso. O aplicativo também transforma ask em botões e invite em convites na reunião.'
          : '',

        ...coWriteRules,
        'Nesta reunião, limite a mensagem a 4 frases.',
        ...Object.entries(fields)
          .filter(([k]) => own.includes(k))
          .map(
            ([k, label]) =>
              `"${k}": ${label}, ${['scopeIn', 'scopeOut', 'glossary'].includes(k) ? 'lista, um item por entrada, sem marcadores. No glossário use Termo: definição curta' : 'texto em Markdown, com parágrafos curtos e subtítulos ### quando ajudarem'}.`,
          ),
        own.includes('adrs')
          ? '"adrs": lista de decisões {"ref":"ADR-001","title":"título","status":"Proposto","content":"## Contexto\\n...\\n## Decisão\\n...\\n## Consequências\\n..."}. Use "ref" apenas para revisar um ADR existente, enviando o ADR inteiro; sem ref, o ADR é novo. Status: Proposto, Aceito, Rejeitado, Substituído.'
          : '',
        mates.length
          ? `"next": codinome de um colega da reunião (${names(mates.map((a) => a.name))}) para falar logo depois de você, quando a parte dele for necessária agora; cite-o com @ no texto. No máximo um.`
          : '',
        pool.length
          ? `Colegas fora da reunião: ${pool.map((a) => `${a.name} (${conversationRole(a)})`).join(', ')}. Se uma demanda precisar da especialidade deles, use "invite":[{"agent":"CODINOME","reason":"o que precisa resolver"}], no máximo dois. Eles entram, respondem a demanda e saem; cite-os com @ no texto.`
          : '',
        'Escreva somente os seus campos. Os campos dos colegas devem ser tratados por eles, via "next". Use briefing, features e outros documentos como contexto, sem contradizê-los.',
      ]
        .filter(Boolean)
        .join('\n');
  const agenda = [
    ['Briefing', !!project.briefing.trim()],
    ['Visão', !!project.vision.trim()],
    ['Escopo', !!project.scopeIn.trim() && !!project.scopeOut.trim()],
    ['Glossário', !!project.glossary.trim()],
    [
      'Arquitetura',
      !!project.architecture.trim() &&
        project.adrs.length > 0 &&
        project.adrs.every((a) => a.title.trim() && a.content.trim()),
    ],
  ]
    .map(([label, done]) => `- ${label}: ${done ? 'ok' : 'falta'}`)
    .join('\n');
  const greeting =
    history.find((m) => m.role === 'assistant' && m.agentId === agent.id)?.text ||
    agent.hellos[0] ||
    '';
  return {
    project,
    greeting,
    systemPrompt,
    prompt: [
      `# Agent Teams · kickoff de ${project.code} ${project.name}`,
      `## Squad ${squad?.name || ''}\n${team.map((a) => `- ${a.name}: ${conversationRole(a)}${a.id === agent.id ? ' (você)' : members.some((m) => m.id === a.id) ? ' (na reunião)' : ''}`).join('\n')}`,
      Object.keys(guests).length
        ? `## Convidados na reunião\n${Object.entries(guests)
            .map(
              ([id, g]) =>
                `- ${team.find((a) => a.id === id)?.name || id}: chamado por ${g.by}, para: ${g.reason}`,
            )
            .join('\n')}`
        : '',
      guest
        ? `## Por que você está aqui\n${guest.by} chamou você para: ${guest.reason}. Responda essa demanda; depois você sai da chamada.`
        : '',
      `## Features\n${featuresText(project, team)}`,
      `## Pauta\n${agenda}`,
      `## Documentos agora (a pessoa pode ter editado)\n${Object.entries(fields)
        .map(([k, label]) => `### ${label}\n${project[k as keyof typeof fields] || '(vazio)'}`)
        .join(
          '\n\n',
        )}\n\n### ADRs\n${project.adrs.map((a, i) => `#### ADR-${String(i + 1).padStart(3, '0')}: ${a.title} (${a.status})\n${clip(a.content, 1200)}`).join('\n\n') || '(nenhum registrado)'}`,
      `## Conversa até aqui\n${historyText(history, team, 14)}`,
      `## Nova mensagem da pessoa\n${pending.join('\n\n')}`,
      round.length
        ? `## Nesta rodada\n${round.map((r) => `${r.agent.name}: ${r.text}${r.updated.length ? '\n(atualizou: ' + r.updated.join(', ') + ')' : ''}`).join('\n\n')}\n\nAgora é a sua vez, ${agent.name}.`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}

export function phoneTurn(
  agent: Agent,
  project: Project,
  team: Agent[],
  squad: Squad | undefined,
  history: ChatMessage[],
  pending: string[],
  greeting: string,
  focus?: { feature?: Feature; adr?: Project['adrs'][number] },
): ConversationTurn {
  const f = focus?.feature,
    adr = focus?.adr;
  return {
    project,
    greeting,
    systemPrompt: [
      '# Modo conversa no celular',
      'Você está trocando mensagens com a pessoa pelo celular, no seu papel na squad. Aqui é só conversa: não execute nada, não use ferramentas e não altere arquivos.',
      'Escreva como no WhatsApp ou no iMessage: mensagens curtas, normalmente de 1 a 3 frases. Vá além disso só se a pessoa pedir detalhes.',
      'Texto corrido, sem títulos, sem negrito e sem listas com marcadores. Se precisar citar vários itens, use uma frase ou linhas curtas sem marcador. Nunca use travessão nem hífen como pontuação.',
      'Emojis são bem-vindos quando combinarem com a sua SOUL e com o momento: no máximo um ou dois, nunca em toda mensagem e nunca vários seguidos.',
      'Use o contexto do projeto, da squad e das features abaixo. Se faltar informação, diga o que falta e, se fizer sentido, indique quem da squad pode ajudar. Não invente status de execução, entregas ou resultados de testes.',
      'Você não altera features, ADRs nem o plano por aqui: para isso, indique as opções do chat ou as telas do aplicativo.',
      'Responda sempre por texto. Para perguntar algo com opções, termine com UM bloco ```json com ' +
        askRule,
    ].join('\n'),
    prompt: [
      `# Conversa com ${agent.name} · ${project.code} ${project.name}`,
      `## Projeto\n${clip(project.briefing, 3000) || '(sem briefing)'}`,
      `Dentro do escopo:\n${clip(project.scopeIn, 1500)}`,
      `Fora do escopo:\n${clip(project.scopeOut, 1500)}`,
      `## Squad ${squad?.name || ''}\n${team.map((a) => `- ${a.name}: ${conversationRole(a)}${a.id === agent.id ? ' (você)' : ''}`).join('\n')}`,
      `## Features\n${featuresText(project, team, true) || '(nenhuma ainda)'}`,
      agent.role === 'architect'
        ? `## Visão de arquitetura\n${clip(project.architecture, 2500)}\n## ADRs\n${project.adrs.map((a, i) => `- ADR-${String(i + 1).padStart(3, '0')}: ${a.title} (${a.status})`).join('\n')}`
        : '',
      f
        ? `## Feature em foco: ${f.key}, ${f.title}\n${f.status} · ${f.priority} · ${f.scope}\n### Escopo\n${clip(f.description, 2500)}\n### Critérios de aceitação\n${clip(f.criteria, 2000)}\n### Tarefas\n${clip(f.tasks, 2000)}`
        : '',
      adr ? `## ADR em foco: ${adr.title} (${adr.status})\n${clip(adr.content, 4000)}` : '',
      `## Conversa até aqui\n${agent.name}: ${greeting}\n\n${historyText(history, team, 12)}`,
      `## Nova mensagem da pessoa\n${pending.join('\n\n')}`,
      '## Como responder\nComo mensagem de celular, no seu jeito: curta, sem travessões, sem elogiar a pergunta e sem oferecer mais ajuda no final.',
    ]
      .filter(Boolean)
      .join('\n\n'),
  };
}

export function featureTurn(
  agent: Agent,
  project: Project,
  feature: Feature,
  history: ChatMessage[],
  pending: string[],
): ConversationTurn {
  return {
    project,
    greeting: agent.hellos[0] || '',
    systemPrompt: [
      '# Modo co-escrita de feature',
      'Você está co-escrevendo UMA feature com a pessoa, dentro do editor. Não execute nada, não use ferramentas e não escreva código.',
      ...coWriteRules,
      '"scope": escopo em Markdown (o que deve ser entregue, comportamento esperado e limites).',
      '"criteria": lista de critérios de aceitação verificáveis, um por item. "tasks": lista de tarefas técnicas pequenas e ordenadas, uma por item. Escreva os itens sem marcadores.',
      '"title": só se o título estiver vazio ou se a pessoa pedir. Siga suas diretrizes de PRD no formato dos critérios e das histórias.',
    ].join('\n'),
    prompt: [
      `# Co-escrita da feature ${feature.key} · ${project.code} ${project.name}`,
      `## Projeto\n${clip(project.briefing, 3000)}`,
      `Dentro do escopo:\n${clip(project.scopeIn, 1500)}`,
      `Fora do escopo:\n${clip(project.scopeOut, 1500)}`,
      `## Outras features do projeto\n${project.features
        .filter((f) => f.id !== feature.id)
        .map((f) => `- ${f.key}: ${f.title} (${f.scope}, ${f.priority})`)
        .join('\n')}`,
      `## Formulário agora (a pessoa pode ter editado)\nTítulo: ${feature.title || '(vazio)'}\nÁrea: ${feature.scope} · Prioridade: ${feature.priority} · Depende de: ${
        feature.dependencies
          .map((id) => project.features.find((f) => f.id === id)?.key)
          .filter(Boolean)
          .join(', ') || 'nenhuma'
      }\n### Escopo\n${feature.description || '(vazio)'}\n### Critérios de aceitação\n${feature.criteria || '(vazio)'}\n### Tarefas\n${feature.tasks || '(vazio)'}`,
      `## Conversa até aqui\n${agent.name}: ${agent.hellos[0] || ''}\n\n${historyText(history, [agent], 12)}`,
      `## Nova mensagem da pessoa\n${pending.join('\n\n')}`,
    ].join('\n\n'),
  };
}
