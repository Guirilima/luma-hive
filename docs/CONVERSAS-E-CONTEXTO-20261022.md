# Lacunas de migração: conversas e contexto de execução

Referência: instalação local do SquadCode. Destino: Luma Hive, Angular 20. Esta revisão trata dos contratos com o modelo e dos fluxos de conversa; não é uma nova certificação de todas as telas do produto.

## Levantamento e implementação

| O que ficou incompleto | O que foi restaurado |
| --- | --- |
| A reunião tinha uma instrução genérica e curta | Condução consultiva do comandante, pauta, responsabilidades, perguntas curtas, passagem de palavra e convite de especialistas. |
| O projeto inteiro era enviado como se fosse um documento | Contexto próprio da reunião: documentos editados, ADRs numerados, squad, resumo das features e pauta. Logs e outputs ilustrativos não são despejados nessa conversa. |
| Instruções comuns acrescentavam documentos salvos sobre o rascunho da reunião | O contexto específico da conversa substitui esse anexo genérico; o rascunho atual é a referência. |
| A personalidade não incluía as regras do modo de conversa | Identidade, convenções e SOUL, com orientação de linguagem natural e cumprimento já utilizado. |
| A rodada permitia até oito falas | Limite original de três falas, com acréscimo para convidados e prevenção de ciclos. |
| Uma pergunta antiga podia continuar definindo o destinatário | A última mensagem relevante determina quem responde: menção explícita, autor da pergunta imediatamente anterior ou comandante. O indicador “Para” acompanha a mesma regra. |
| Os convidados não recebiam quem chamou e a demanda | Convite com origem e motivo; ordem dos convidados preservada; convidados só opinam, aguardam resposta se perguntarem e depois saem. Não escrevem documentos nem encadeiam convites. |
| Assentos vazios não tinham o mesmo fallback | O comandante assume os documentos do especialista ausente. |
| Menções no corpo da mensagem eram texto comum | Menções clicáveis que inserem o agente no campo de mensagem, preservando blocos de código e a sanitização do Angular. Aliases de funções também funcionam. |
| Perguntas tinham controles sem o visual original | Opções com o estilo de pílulas já usado no original. |
| O telefone não recebia a visão das features e da squad | Resumo das sprints, estado e rota das features, squad, escopo, feature/ADR em foco e histórico delimitado. JSON técnico permanece visível quando é parte da resposta. |
| Uma opção no telefone podia duplicar a mensagem do usuário | Uma única mensagem por escolha. |
| Coescrita de feature enviava o objeto completo | Formulário atual, dependências, outras features, limites do projeto e histórico. Título só muda se estiver vazio ou se a pessoa pedir. |
| JSON com quebras de linha não escapadas falhava | Leitura tolerante do mesmo formato aceito pelo original; opções nulas/malformadas não interrompem a conversa. |
| Etapas tinham contexto e handoff reduzidos | Objetivo da sprint, rota, instrução do comandante, entregas das dependências, outputs da execução atual e destinatário do próximo handoff. Registros simulados continuam identificados. |
| Subagentes recebiam apenas o perfil genérico | Instruções específicas de atendimento ao colega: responder à demanda, respeitar a especialidade e não avançar a rota ou assumir a etapa inteira. |

Os módulos `conversation-prompts.ts` e `stage-prompts.ts`, em `apps/web/src/app/core/execution/`, concentram esses contratos. Os componentes continuam responsáveis pela interface e pela orquestração de suas interações. O frontend antigo não é carregado no Angular.

## Validação

As duas aplicações foram abertas pelo Playwright com o mesmo Atlas Commerce, em cópias SQLite isoladas nas portas 4327/4328. Os bancos e as conversas das portas principais 4317/4318 foram preservados.

Os cenários de transporte controlado verificam: passagem VANGUARD → ECHO, perguntas com opções, resposta ao autor da pergunta, retorno posterior ao comandante, aliases, convites ordenados, convidado aguardando resposta, limite de rodadas, documentos e desfazer, telefone e opções sem duplicação, JSON técnico, coescrita de feature, JSON com quebras de linha, cancelamento, repetição após erro, mensagens em fila e contexto das etapas. Os prompts enviados ao processo CLI também são inspecionados.

As respostas controladas só existem nas instâncias de revisão. Nenhum executável ou modo de simulação foi instalado na configuração principal. Evidências, capturas e registros ficam em `previews/conversation-recovery-20261022/`, pasta ignorada pelo Git.

Resultado final: **14 cenários em cada aplicação, 28 casos aprovados**, sem erros JavaScript registrados. Os casos conferem o contexto enviado e a reação da interface a respostas estruturadas; não certificam a escolha espontânea do modelo.

Após autorização explícita, a conferência real foi executada com GPT-6 Luna e esforço low. Foram seis chamadas, três por aplicação, em cópias isoladas. A disponibilidade foi conferida no catálogo do CLI e o preço nas [fontes oficiais](https://developers.openai.com/api/docs/models/gpt-6-luna). O CLI não informou cobrança monetária; o registro de uso fica em `native-results.json`.

Compilação Angular/Node realizada. Testes unitários não foram executados nem alterados. Nenhum stage, commit ou push foi realizado.

## Usar

A versão compilada é servida pela aplicação já iniciada em `http://127.0.0.1:4318`. Recarregue a aba para receber o frontend atualizado. Para comparar uma conversa desde o início, use o mesmo histórico e documentos nos dois lados; conversas anteriores não foram apagadas.


## Resultado da conferência com LLM real — 23/10/2026

Na pergunta “Como estamos aqui?”, os dois modelos fizeram um resumo consultivo do kickoff, sem encaminhar para outro agente. Na solicitação explícita de passagem de palavra, o original chamou ECHO, que fez uma pergunta com três opções. O Luma negou que houvesse um canal de encaminhamento. Essa falha de interpretação motivou uma correção adicional: as instruções agora explicam que `next`, `ask` e `invite` são processados pelo aplicativo e não dependem de ferramentas nativas do CLI. Também foi restaurada a delimitação entre instruções do agente e mensagem da conversa no adaptador.

A última chamada real confirmou a correção: VANGUARD retornou `{"next":"ECHO"}` e o aplicativo solicitou o turno de ECHO. A segunda chamada foi deliberadamente bloqueada antes de chegar ao provedor, pois o limite autorizado de seis chamadas reais já havia sido consumido. Assim, o encaminhamento corrigido foi comprovado com o modelo real; a resposta real final de ECHO no Luma não foi executada nessa última rodada. Perguntas, botões e encadeamento completo continuam cobertos pelos cenários locais com respostas controladas.

Os modelos, bancos, chats e configurações das aplicações principais foram preservados. O modelo econômico foi selecionado somente nas cópias de verificação. Não houve commit, push ou execução de testes unitários.

Após a correção identificada na conferência real, os 14 cenários pareados foram repetidos: 28 casos aprovados, sem erros JavaScript. O backend principal foi reiniciado e a comparação do SHA-256 do workspace antes/depois confirmou a preservação integral dos dados e das configurações.
