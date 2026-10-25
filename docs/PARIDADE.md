# Recuperação de layout e funcionalidades

A referência é a base local `SquadCode`, incluindo Codex, Devin, Antigravity e o escritório pixel art. Esta recuperação foi feita no `luma-hive`, mantendo Angular 20, Node e SQLite. Os scripts globais do aplicativo antigo não são carregados.

## Recursos recuperados

| Área             | Comportamento recuperado                                                                                                                                                         | Implementação                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Escritório       | Câmera ortográfica, oito salas, piso quadriculado, janelas com skyline, paredes que se ocultam conforme a câmera, vidro, mobiliário detalhado, plantas e War Room vermelha       | `office-scene.ts`, `three.renderer.ts`, `packages/domain/src/office.ts` |
| Agentes no mapa  | Retratos, cartões distribuídos sem sobreposição, linhas até o posto, seleção, ações rápidas, deslocamento por arraste/clique e criação em posto vazio                            | `features/map/map.component.*`                                          |
| Circulação       | Portas e corredores, reuniões, visitas, calls, pausas, retorno ao posto, sinais de conversa e movimentos relacionados ao planejamento/handoffs                                   | `three.renderer.ts`                                                     |
| Cidade           | Ruas, fachadas, prédios, parques, litoral, praças dos agentes, conexões, planeta, estrelas, atmosfera, seleção e qualidade adaptativa                                            | `city-scene.ts`, `three.renderer.ts`                                    |
| Pixel art        | Arte da POC, treze departamentos, sprites andando, trajetos por portas/corredores, visitas, zoom e navegação                                                                     | `pixel.renderer.ts`, `pixel-paths.ts`                                   |
| Mapas e HUD      | Alternância de perspectiva, transição, zoom/percentual, rotação, foco, progresso da operação, indicadores de atividade e fallback sem WebGL                                      | `map-renderer.ts`, `flat.renderer.ts`, `styles/map.css`                 |
| Handoffs         | Visualização das conexões no mapa, criação manual, histórico, contexto, transferências automáticas e exportação de logs                                                          | `features/handoffs`, `ExecutionService`                                 |
| Projetos         | Lista lateral de operações, documentação inline, briefing, produto, escopos, glossário, arquitetura, ADRs, features e sprints                                                    | `features/projects`, `features/documents`                               |
| Sprints          | Criar, editar, excluir quando vazia, expandir/recolher, transferir e ordenar features, executar uma sprint                                                                       | `projects.component.*`                                                  |
| Features         | Editor, dependências, setup protegido, rotas, instruções por etapa, quadro/lista, coescrita com rascunho preservado e desfazer proposta                                          | `features/features`, `features/chat`                                    |
| Planejamento     | Pipelines originais por escopo, PRD/ADR/implementação/QA, indicação de especialistas ausentes, revisão, aplicação e execução do plano                                            | `featureRoute()`, `scopeRoles()`, `ExecutionService`                    |
| Execução         | Demonstração identificada, execução por CLI, pausa, cancelamento, spawn individual, recuperação de etapa real e revisão humana                                                   | `core/execution`, `apps/api/src/runs`                                   |
| Chat da operação | Painel acoplado, redimensionar/minimizar, participantes, mensagens, transmissão, ferramentas, planos, entregas e handoffs persistidos                                            | `features/operation-room`, `RoomService`                                |
| Agent Teams      | Galeria de participantes, convidar/remover operadores, menções, agenda, documentos compartilhados, editor, ADRs, propostas, desfazer, salvar e confirmação de saída com rascunho | `meeting.component.*`                                                   |
| Agentes          | Identidade, especialidade, personalidade, cumprimentos, ferramentas, modelos, esforço, produção, galeria, ícones, codinomes e restauração de defaults                            | `features/agents`                                                       |
| Conversas        | Cumprimentos e menus por função, status, atribuições, features, ADRs, planejamento, revisões, spawn, conversa livre e cancelamento                                               | `chat.component.*`                                                      |
| Convenções       | Famílias, templates especializados, regras por stack, subsets do catálogo/biblioteca, editor, prévia e desfazer                                                                  | `catalog.ts`, `agent-editor.component.*`                                |
| Squad Studio     | Árvore de comando/inteligência/operadores, lista de squads, seletor de especialidades, presets, retratos/ícones e rascunho sem gravar presets ao cancelar                        | `squad-editor.component.*`                                              |
| Exportação       | Perfis nativos por CLI; ZIP com AGENTS.md, documentos, ADRs, features com frontmatter, critérios, tarefas, sprints, padrões e prompts de orquestração                            | `packages/domain/src/exports.ts`                                        |
| Console          | Eventos, resultados de ferramentas, consultas entre colegas, histórico de processos, replay e metadados disponíveis no CLI                                                       | `adapters.ts`, `console.component.*`                                    |
| Workspace        | SQLite, exportação/importação, compatibilidade v2/v3, versões, restauração e proteção contra conflito entre abas                                                                 | `WorkspaceStore`, `WorkspaceRepository`                                 |
| Preferências     | Chaves estáveis de idioma e visual; configurações comuns de execução e específicas de cada CLI                                                                                   | `models.ts`, `messages.ts`, `ProviderService`                           |

## Referência visual e limites da conferência

O primeiro renderizador Angular simplificava a cena. Ele foi substituído pela construção detalhada do escritório e da cidade, com os parâmetros do original adaptados a módulos TypeScript. A lógica de interface continua em componentes e serviços Angular. Não existe dependência da pasta `SquadCode` em tempo de execução.

Marca, organização dos componentes, idiomas e limites entre frontend/backend pertencem ao Luma Hive. A fidelidade do mapa foi conferida por capturas reais; enquadramento, sombras e textos podem variar conforme viewport, GPU, qualidade, zoom e idioma. Não foi emitida uma certificação de equivalência pixel a pixel de todas as telas.

As integrações mantêm as diferenças de capacidades dos CLIs. O console exibe os metadados que o provedor retorna, sem inventar consumo ou custo. A execução da fila continua coordenada pelo frontend, como nesta etapa da aplicação; uma etapa iniciada é controlada pelo backend. Não foram acrescentadas funcionalidades dos outros repositórios pesquisados.

## Conferência de 14/10/2026

A recuperação foi revista por comparação pareada no Edge via Playwright, com viewport de 1512 × 950 e conferência móvel em 390 × 844. Cada cenário usa uma cópia isolada do mesmo Atlas Commerce: SQUAD ATLAS, seis agentes, sete features, F00/F01 concluídas, duas sprints e documentos completos. A primeira migração usava SQUAD ALPHA, documentos resumidos e todas as features pendentes; isso foi corrigido na fonte do exemplo.

As capturas incluem painel, projetos e documentos, editor de features, lista/quadro, editor de agentes e suas abas, galerias, Squad Studio e seletores, Agent Teams, telefone por função, configurações, console, logs, handoff, cidade, escritório 3D e pixel art. O modo pixel recupera também enquadramento, etiquetas, ações, departamentos e roster inferior.

Os relatórios locais registram ações e asserções, falhas e repetições. Os grupos são:

- paired-stress.json: documentos, CRUD de features/sprints/operações, Markdown, agentes, reuniões, configurações, atalhos, mapas e distribuição.
- advanced-pairs.json: planejamento/cancelamento, pausa/retomada, encerramento, entrega/retrabalho/aprovação, streaming/cancelamento de conversa, propostas/desfazer, handoffs e seletores.
- remaining-pairs.json: painel, biblioteca de convenções, backup/importação, exportação ZIP/perfil, arraste, alternância repetida de mapa e responsividade.
- closure-pairs.json: spawn com um único agente, ciclo de cópia de perfil, recrutamento customizado e visitas aos departamentos.
- completion-pairs.json: atalhos de cada função no telefone, criação com ideia inicial, ADRs, exclusão confirmada e desfazer mantendo edições humanas em outros campos.
- native-smoke.json: uma conversa real com o Codex instalado em cada aplicação, em somente leitura, sem ferramentas nem alterações de arquivos.
- main-smoke.json: inicialização com o banco principal, retratos, saudação, escritório 3D e carregamento da arte/sprites pixel.

As conversas determinísticas usam um executável de verificação restrito ao ambiente isolado. Ele exerce os processos, decodificadores, HTTP, eventos e interface, sem chamar provedores de IA. A execução das features foi conferida em demonstração. Além dessa conferência controlada, uma conversa real pelo Codex CLI 0.161.0 respondeu corretamente nas duas aplicações, em somente leitura. Os catálogos retornaram os mesmos sete modelos. Devin 3000.10.48 e Antigravity 1.3.5 foram detectados; não foi iniciada uma entrega real por esses provedores. As execuções de features em demonstração não equivalem a entregas reais por IA. Custos e consumo não são inventados.

Os testes na pasta tests não foram executados nem corrigidos, conforme solicitado. A validação técnica usa compilação Angular/TypeScript e conferência funcional/visual pelo navegador. Não houve commit nem push. A base original e seus dados de uso foram preservados.

O resultado dos relatórios precisa ser considerado junto das capturas: quantidade de ações sozinha não certifica igualdade visual. Marca Luma Hive e caminhos do banco/projeto diferem da referência por pertencerem à nova aplicação.

## Resultado das rodadas

Todos os grupos abaixo passaram na última rodada registrada de cada conjunto, sem erros JavaScript registrados. As contagens incluem ações e asserções; não representam apenas cliques.

| Relatório             | Ações/asserções | Grupos/casos aprovados |
| --------------------- | --------------: | ---------------------: |
| paired-stress.json    |             466 |                      9 |
| advanced-pairs.json   |             114 |                     14 |
| remaining-pairs.json  |             152 |                     12 |
| closure-pairs.json    |              64 |                      8 |
| completion-pairs.json |             106 |                     12 |
| native-smoke.json     |               8 |                      2 |

O banco anterior do Luma Hive foi guardado em `previews/recovery-20261014/before-reset-main-20261014.db`. O banco principal atual contém SQUAD ATLAS, seis agentes, sete features e F00/F01 concluídas. A perspectiva inicial acompanha o escritório 3D usado no SquadCode. As evidências e relatórios ficam em `previews/recovery-20261014/`, ignorado pelo Git.

## Usar a versão atual

Se a aplicação estiver rodando no terminal, encerre essa instância com Ctrl+C. Na pasta nova:

```powershell
cd C:\Users\UnGui\Documents\Projects\luma-hive
npm.cmd start
```

Abra `http://127.0.0.1:4318` e recarregue a página para carregar os novos bundles. Para alterações contínuas no código, use `npm.cmd run dev` e abra `http://127.0.0.1:4200`.

## Revisão visual por ação — 14/10/2026

A comparação anterior não detectava todos os defeitos visuais. Esta rodada repetiu as ações nos dois sistemas com capturas após cada ação, usando o mesmo Atlas Commerce (SQUAD ATLAS, seis agentes, sete features, F00/F01 concluídas) e viewport de 1512 × 950. Os cenários destrutivos rodaram em cópias SQLite isoladas; os bancos de uso não foram reinicializados nesta rodada.

Foram corrigidos os cartões do mapa que apareciam sobre o painel, a estrutura e as cores dos balões de trabalho, retratos e ícones, campos ausentes no escopo das features, alturas e espaçamentos dos editores e confirmações, expansão e rolagem após salvar/distribuir, estados do chat da operação, prévia de comando e separação entre sessões atuais e histórico do console. O aviso de início do planejamento voltou a identificar a sprint/feature e as features envolvidas.

Nas conversas, as falhas do CLI usam o aviso original e deixam o carregamento terminar; a fila continua após uma falha. Parar cancela a resposta em andamento e preserva mensagens já enviadas, aguardando o encerramento do processo anterior antes de iniciar a próxima. A validação desses estados usou um CLI controlado para produzir erro, resposta lenta e recuperação sem consumir IA.

Evidências em previews/visual-recovery-20261014/, ignorado pelo Git:

- visual-audit.json: 466 ações/asserções em nove grupos e 233 pares de capturas, sem falhas ou erros JavaScript. Os limites dos elementos selecionados não apresentaram diferenças superiores a oito pixels após igualar o estado dos dois sistemas.
- visual-after.json: 24 verificações direcionadas aos prints, planejamento, erro, cancelamento, fila e prévia de comando.
- index.html: galeria das capturas, busca por ação e comparação ao vivo das instâncias de uso. Enquanto o servidor de comparação estiver ativo, abra http://127.0.0.1:4331.

As medidas verificam elementos selecionados, não todos os pixels de cada tela. Capturas e revisão visual complementam as asserções; branding, horário, respostas de IA e dados nativos do ambiente podem variar. A contagem de ações não constitui uma certificação de identidade visual universal. Nenhum teste unitário foi executado ou alterado. Não houve commit nem push.

## Revisão de 22/10/2026

A correção do Ver mais e a nova conferência semântica estão descritas em [PARIDADE-20261022.md](PARIDADE-20261022.md). Essa revisão inclui os resultados atuais, os comportamentos corrigidos e os limites da validação.


## Estado após o reset solicitado

Os números de Atlas Commerce acima pertencem à conferência anterior. Após a revisão do início da sprint, os bancos e os arquivos das operações foram arquivados e ambos os sistemas ficaram sem workspace, na primeira execução. Veja [SPRINT-E-RESET-20261022.md](SPRINT-E-RESET-20261022.md) para correções, evidências e backups.
