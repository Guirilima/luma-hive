# Aceite real — Luma Hive / Luma Market — 25/10/2026

## Resultado

Os agentes construíram um website funcional de três telas pelo fluxo real do Luma Hive. Projeto **Luma Market — Aceite real 25-10**, sprint **Sprint 01 — Website demonstrativo**, com setup F00 e demandas F01–F03 aprovadas pelo operador após verificação. A operação terminou com **16 checkpoints confirmados**. O site está disponível em **http://127.0.0.1:4355/login**; Luma Hive em **http://127.0.0.1:4318**.

Credenciais demonstrativas: **demo@luma.test / luma123**. Não há autenticação ou envio de e-mail reais.

**O piloto passou pelos critérios funcionais definidos. Isso não constitui cobertura de todas as combinações de falha, provedores ou ações legadas da aplicação.** Permanecem os gaps descritos abaixo, principalmente delegação de execução entre perfis, preflight de permissões e limites de telemetria.

## Método e escopo

- Criação de operação, briefing Agent Teams, resposta a pergunta pelo centro de atenção, documentos, sprint, demandas, plano, aprovação, pausa, retorno, revisões e memórias realizados pela interface com Playwright/Edge.
- Execuções reais da aplicação exclusivamente com **Antigravity / gemini-3.8-flash-low**, esforço baixo. Nenhum resultado de replay foi apresentado como resposta real de agente.
- O teste suplementar dos dois comandos autorizados foi iniciado pela API real, como SENTINEL, após habilitar seu Bash pela interface. Ele aparece na observabilidade e é a fonte de uma lição aprovada; não foi uma nova feature nem uma etapa extra da sprint.
- Agentes escreveram o site dentro de `projects/op-002-luma-market-aceite-real-25-10`. O operador verificou o produto com Playwright e Node. No fim, SENTINEL também executou os dois comandos nativos autorizados.
- Bancos/processos de replay separados validaram cenários de recuperação, telemetria e a opção avançada de permissões. São testes de integração/aceite, **sem executar ou alterar testes unitários**.
- Projeto Atlas Commerce original preservado; cinco execuções anteriores preservadas. Nenhum reset dos dados de produção, commit ou push nesta rodada.

## Entregas e verificação do website

| Entrega             | Verificado                                                                                                                                           | Resultado                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| F00 — Base          | Servidor Node ligado a 127.0.0.1:4355, arquivos locais, scripts de start/check, README, HTML/CSS/JS                                                  | Aprovada                          |
| F01 — Login         | Campos vazios, credencial inválida, Enter, sucesso, proteção da página de produtos, recarga, logout, senha não persistida                            | Aprovada em 1512 e 390 px         |
| F02 — Produtos      | Seis produtos distintos, seis indicadores, cada botão/dot, limites circulares 6→1 e 1→6, setas, Home/End, ARIA                                       | Aprovada em 1512, 768 e 390 px    |
| F03 — Contato/sobre | Acesso público, campos vazios, email inválido, confirmação simulada, reset, navegação, ausência de recarga/envio externo e de persistência dos dados | Aprovada em 1512, 768 e 390 px    |
| Validação nativa    | `node --check` de server.js e script HTTP/MIME com 13 rotas, incluindo 404                                                                           | Ambos com código 0 e saídas reais |

Nas oito combinações de tela/largura da bateria funcional não ocorreram erros JavaScript ou overflow horizontal. Um smoke adicional, com o site persistente, refez login, interação do carrossel e contato em 390 px.

O formulário produzido acrescentou **assunto obrigatório**, além de nome/email/mensagem pedidos inicialmente. O caminho válido foi testado, mas esse campo é um desvio de escopo/UX a simplificar se quisermos fidelidade estrita ao briefing. Não transformamos esse acréscimo em requisito retroativamente.

O navegador apresentou tráfego injetado do Kaspersky em uma rodada do carrossel. As 33 requisições do ambiente foram separadas das requisições originadas pela aplicação; os arquivos do site não contêm esses hosts. Não desativamos o antivírus. O teste não deve afirmar que todo o navegador ficou sem tráfego externo. Durante o envio simulado de contato não houve requisição da aplicação nem persistência dos dados preenchidos.

## O que funcionou bem no harness

1. **Briefing conversacional real:** o time fez pergunta estruturada, o pedido apareceu em Precisa de você e a resposta permitiu preencher documentos e decisões.
2. **Coordenação persistente:** pausa aguardou a etapa em andamento; retorno continuou o trabalho. Após fechar o navegador, o servidor continuou executando. Checkpoints e outputs não foram duplicados nas retomadas.
3. **Revisão humana:** F00 bloqueou as entregas dependentes até sua aprovação. As outras demandas chegaram em revisão, sem conclusão automática baseada somente na fala do modelo.
4. **Memória selecionada:** uma restrição aprovada apareceu no arquivo real de instruções do agente; propostas não aprovadas não são contexto ativo. Lições foram vinculadas às execuções que as motivaram.
5. **Observabilidade:** responsáveis, falhas, tentativas, uso e ferramentas ficaram persistidos. A consulta real a FORGE foi identificada pelo campo nativo TypeName.
6. **Separação de permissões:** o papel sem escrita encontrou uma negativa real. Ela foi mantida como falha, sem converter exit code 0 ou texto otimista em sucesso.

## Falhas encontradas e correções aplicadas

| Problema observado                                                                                                 | Correção / resultado                                                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI Antigravity entregava resultado terminal, mas travava ao encerrar no Windows, causando timeout do planejamento | Entrada stream-json fica aberta até o resultado; depois há tolerância de 5 s e encerramento da árvore de processos pertencente à execução. Texto parcial continua insuficiente. Negativas continuam falha. Três casos de replay verificaram resultado confirmado, negativa e resposta incompleta. |
| Arquiteto antecipou implementação por consulta e tentou escrita sem autorização                                    | Instruções reforçam etapa atual e coordenação de handoffs. Ferramentas de consultas são intersectadas com o chamador. O servidor também limita ferramentas ao perfil salvo; requisições não podem ampliá-las.                                                                                     |
| Consulta real aparecia sem identidade de FORGE                                                                     | Telemetria reconhece TypeName; conserva a limitação dos dados internos não emitidos.                                                                                                                                                                                                              |
| Ferramentas nativas em ERROR não apareciam como resultado terminal na trilha                                       | Decoder e telemetria reconhecem ERROR/FAILED/CANCELED, preservando mensagem e erro.                                                                                                                                                                                                               |
| Aprovar F00 causava conflito ao liberar naturalmente as dependências                                               | Guarda permite somente a transição ready/blocked derivada das dependências, mantendo proteção sobre etapas/outputs controlados pelo coordenador. Aprovação e continuidade verificadas na interface.                                                                                               |
| Revisão podia fechar antes de confirmar o salvamento                                                               | Aguarda persistência e mantém a tela aberta em pendência/conflito.                                                                                                                                                                                                                                |
| Concorrência configurada não era recuperada no restart                                                             | RunService inicia com o valor salvo, limitado a 1–8.                                                                                                                                                                                                                                              |
| Política de terminal era confundida com aceitar edições                                                            | Nova aba Permissões e autonomia, explicação de headless, políticas dos provedores e prévia das ferramentas por agente.                                                                                                                                                                            |
| Cache era descrito como necessariamente contido na entrada em todos os provedores                                  | Labels e documentação corrigidos; preserva campos nativos separadamente, sem somar cache novamente.                                                                                                                                                                                               |
| Novo seletor ficava estreito no tema pixel móvel                                                                   | Layout vertical e largura completa, superando a regra global de max-width de 48% desse tema.                                                                                                                                                                                                      |
| Formulário salvo podia compartilhar referências mutáveis com o estado do workspace                                 | Configuração salva é clonada; alterações posteriores no formulário não alteram o estado por alias.                                                                                                                                                                                                |

## Permissões: o que foi realmente necessário

O perfil original do SENTINEL tinha **Read/Glob/Grep**, sem Bash. Isso é suficiente para **revisão estática e análise de evidências**, mas não para executar `node` no próprio processo. Portanto:

- Habilitar Bash **não era necessário para ele continuar sendo QA**.
- Foi necessário **somente para este teste suplementar de execução direta pelo SENTINEL**, escolhido para verificar se dois comandos autorizados realmente atravessavam o CLI sem confirmações repetidas.
- Na primeira parte, os agentes implementaram/inspecionaram arquivos e o operador executou as verificações de navegador/sintaxe/HTTP. O relatório não atribui esses testes ao QA.
- Depois da autorização explícita, foram aplicadas quatro regras temporárias: command e unsandboxed para cada um dos dois comandos exatos. Ask/deny existentes foram preservados. Bash foi habilitado temporariamente somente no SENTINEL para a rodada final.
- O teste real terminou em **run-e3904b17-f228-48c6-a703-6ef453bac7cf**, com exatamente duas chamadas run_command, resultados sem erro e código 0. O segundo comando informou as 13 rotas/MIME aprovadas.
- **As quatro regras, o hook experimental e Bash temporário foram removidos/restaurados.** Configurações e ferramentas voltaram exatamente ao estado anterior. O arquivo global não existia antes e deixou de existir após a restauração. O modo do workspace voltou a read-only, timeout 120 s e concorrência 2.

Houve duas rejeições da revisão automática: uma tentativa anterior de regras globais mais amplas/remoção de hook e, depois, a habilitação persistente de Bash não coberta apenas pela aprovação das quatro regras. Nenhuma ação rejeitada foi executada. O trabalho seguiu com validação pelo operador; os dois comandos nativos só foram testados após as autorizações específicas. Isso expôs um gap de produto: a autorização deve mostrar **ação, agente, alvo, duração e se sai do sandbox**.

### O fluxo de delegação que queremos

Sua expectativa faz sentido: **SENTINEL solicita execução a FORGE (ou a um executor dedicado), recebe a evidência e a revisa**. Hoje existe consulta a colega, mas ela não é um protocolo completo de tarefa delegada com capacidades distintas. Intersectar ferramentas impede que uma consulta vire uma maneira implícita de obter escrita/terminal.

| Estratégia                    | Vantagem                                                | Problema / requisito                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dar Bash ao QA                | QA reproduz comandos diretamente; menos idas e voltas   | Amplia acesso e mistura validação com capacidade de alterar o ambiente. Bash pode escrever mesmo sem Edit/Write. Precisa de isolamento/controle de comandos. |
| QA delega ao implementador    | Mantém QA sem terminal; reutiliza o executor            | Evidência pode vir de quem implementou. Registrar comando, cwd, saída, código e hash/versão dos artefatos; QA precisa avaliar e poder pedir reprodução.      |
| QA delega a executor dedicado | Separação clara entre implementação, execução e revisão | Exige fila/tarefa própria, política por alvo, identidade do executor, dependência e retorno auditável. É a direção mais consistente para evoluir.            |

Recomendação: introduzir **solicitação de capacidade/tarefa delegada**, sem emprestar ferramentas ao chamador. Vincular a solicitação à feature/checkpoint, validar o perfil do executor, aplicar a autorização vigente, executar como esse executor e devolver evidências imutáveis. Se faltar permissão, exibir uma pendência concreta. Ainda não foi implementado esse broker; a nova aba configura as políticas existentes e torna os limites explícitos.

### Nova opção avançada

**Configurações → Permissões e autonomia → Antigravity → Sem confirmações do CLI (avançado)**, salvar e confirmar o alcance. Também disponível na aba do provedor. A configuração vale para próximas execuções do workspace, não modifica o arquivo global do Antigravity e não elimina aprovação humana de plano/entrega.

A opção utiliza a flag nativa de autoaprovação. As listas de ferramentas continuam nos perfis gerados, mas **não são isolamento do sistema operacional**, sobretudo quando Bash está permitido. A [referência do CLI](https://antigravity.google/docs/cli/reference) documenta a flag e a [documentação de permissões](https://antigravity.google/docs/permissions) descreve as políticas nativas. O modo auto foi oferecido separadamente e o CLI informou indisponibilidade nesta conta.

**Não ativamos esse modo avançado no workspace real.** Confirmação, persistência, parâmetros e restrição de ferramentas foram verificados com SQLite e processo de replay isolados. A execução nativa real usou somente as regras estreitas autorizadas. Não afirmamos que testamos o bypass amplo real nem que todos os provedores impõem as mesmas garantias de perfil.

## Observabilidade, ações e lições

O projeto registrou **29 execuções reais: 25 concluídas e 4 falhas**. Tipos: 7 de documentos, 3 de planejamento, 18 de etapa e 1 validação suplementar. Duas falhas foram timeouts no planejamento; uma foi a tentativa de escrita/delegação fora do papel do arquiteto; uma foi a negativa de terminal do backend. As falhas e suas tentativas continuam visíveis.

A operação da sprint teve **16 etapas confirmadas em 18 tentativas de etapa**. A validação suplementar não aumenta essa contagem. Cada feature recebeu quatro outputs; todas foram concluídas após revisão do operador.

| Campo informado pelos CLIs nas 29 execuções |                             Valor |
| ------------------------------------------- | --------------------------------: |
| Entrada                                     |                         1.347.484 |
| Saída                                       |                            86.743 |
| Total nativo                                |                         1.434.227 |
| Cache informado separadamente               |                         2.714.944 |
| Cobertura de uso informado                  |                             29/29 |
| Duração agregada                            | 1.717.887 ms (aprox. 28 min 38 s) |
| Consultas a subagentes detectadas           |                                 1 |

O cache excede a entrada em vários resultados Antigravity: não presumimos sua composição nem o somamos novamente ao total. Esses números são consumo local reportado, **não fatura, saldo ou franquia da conta**. Não houve tarifa monetária verificável; custo não foi inventado. Duração agregada não representa a duração completa desta sessão de trabalho.

Diagnósticos nativos de transporte feitos fora do harness tiveram consumo próprio e não entram nessas 29 execuções. Replays/fixtures não consomem LLM. A telemetria de FORGE ficou parcial: chamada identificada, estado interrompido e tokens/modelo internos não informados. Não inferimos consumo do filho.

A memória do projeto terminou com **8 registros: 5 aprovados e 3 arquivados**, incluindo **4 lições**: resultado terminal versus encerramento, respeito ao papel/handoff, preflight de permissões e QA por delegação versus execução direta. Restrições temporárias de autorização foram arquivadas para não reaparecerem como contexto vigente.

## Contornos e limites restantes

- Validação pelo operador permitiu continuar enquanto terminal aguardava autorização; isso fica separado da evidência produzida pelos agentes.
- Hook local experimental teve primeiro caminho relativo incorreto. Após corrigido, uma decisão allow do hook ainda não comprovava execução: o resultado nativo continuou registrando negativa. Só as saídas posteriores aos grants aprovados foram consideradas sucesso. O hook experimental foi removido; auditoria preservada em previews.
- Scripts de automação precisaram seguir o encaminhamento de revisão para Projetos e selecionar a origem da memória antes de preencher seu título (a origem preenche o título). Falha de seletor não foi contada como falha de agente. Uma repetição da fixture partiu de política anteriormente salva; o baseline foi explicitado. O conflito de versão posterior foi rastreado a uma chamada de versão que reentrava no próprio roteiro do CLI simulado e criava gravações concorrentes no banco de teste. Corrigimos o dispatch de versão/modelos e isolamos as checagens da interface; o aceite final passou, sem alterar a política real.
- O script HTTP produzido assume porta livre; convém tratar bind/porta ocupada explicitamente. O servidor do site tem escopo demonstrativo local; não foi preparado para publicação, autenticação real ou dados sensíveis.
- A memória e as operações persistidas não fazem parte do export JSON tradicional do workspace. A memória tem export próprio; backup completo requer o SQLite. Uma exportação/restauração unificada continua pendente.
- Não foi exercitada uma morte real da máquina durante uma chamada paga. Cenários de restart/incerteza/duplicação foram verificados em processos isolados de replay. Não foi testada execução paga dos provedores Codex e Devin nesta rodada.

## Próximas melhorias priorizadas

Lista atualizada em **25/10/2026** após a revisão do painel e das necessidades de documentação. Os IDs `MEL-xxx` são referências estáveis deste backlog. `[x]` e texto riscado indicam somente a parte já implementada; `[ ]` indica trabalho pendente. Um item parcial não está concluído apenas por termos validado seu cenário manualmente no aceite.

Toda implementação futura com interface deve nascer com **labels por chave no arquivo central `apps/web/src/app/core/i18n/labels.ts`, nos três idiomas (pt-BR/en/es), e nos temas futurista e pixel**, incluindo mobile, navegação por teclado e estados de vazio/carregamento/erro. Idioma do conteúdo gerado e idioma da interface são propriedades distintas: mudar o idioma da tela não deve disparar uma chamada de LLM para reescrever documentos.

### Melhorias anteriores — andamento real

1. **MEL-001 · P1 · Pendente — Broker de tarefas delegadas e capacidades.**
   - [ ] Implementar o pedido QA → executor autorizado → evidência → QA, com identidade, autorização por tarefa, vínculo à feature/checkpoint e retorno rastreável. Uma consulta não pode emprestar implicitamente ferramentas ao chamador.
2. **MEL-002 · P1 · Parcial — Preflight de permissões por projeto/agente/provedor.**
   - [x] ~~Exibir políticas e prévia das ferramentas dos perfis em Configurações → Permissões e autonomia; limitar ferramentas solicitadas ao perfil salvo e intersectar consultas.~~
   - [ ] Verificar capacidades e incompatibilidades do CLI/conta/sandbox antes da sprint, apresentar bloqueios por agente e orientar a resolução sem gastar uma chamada de LLM para descobrir o problema. A prévia atual não é esse preflight automatizado.
3. **MEL-003 · P1 · Parcial — Autorização temporária por alvo e prazo.**
   - [x] ~~Disponibilizar opção avançada de execução sem confirmações do Antigravity, com confirmação explícita ao salvar e sem editar configurações globais do CLI.~~
   - [ ] Criar autorização restrita por agente, ação, alvo e duração, com prévia, aprovação/revogação, validade, auditoria e restauração. As quatro regras usadas neste aceite foram aplicadas/restauradas pelo operador; esse fluxo ainda não é uma feature do produto.
4. **MEL-004 · P1 · Parcial — Contrato de evidências de verificação.**
   - [x] ~~Preservar e exibir os eventos de ferramentas, resultados, erros e execução de origem na observabilidade.~~
   - [ ] Transformar esses eventos em evidências estruturadas ligadas à entrega: comando, cwd, código de saída, saída relevante, versão/hash do artefato e agente responsável. Distinguir inspeção, teste executado e alegação textual do modelo; integrar esse contrato aos guias MEL-011/MEL-012.
5. **MEL-005 · P2 · Pendente — Isolamento real de executores.**
   - [ ] Avaliar e implementar workspace descartável/container quando compatível, respeitando autenticação e recursos do CLI. Perfil de ferramentas e prompt não substituem sandbox.
6. **MEL-006 · P2 · Parcial — Menos contexto repetido e métricas específicas por provedor.**
   - [x] ~~Separar campos nativos de entrada/saída/cache, corrigir sua explicação e expor cobertura/limites da telemetria sem somar cache ao total nem confundir consumo local com saldo.~~
   - [ ] Selecionar contexto e memória relevantes por tarefa, enviar deltas e medir antes/depois. Avaliar o consumo total do time, incluindo handoffs, documentação, consultas e retries; não presumir economia apenas por acrescentar agentes.
7. **MEL-007 · P2 · Parcial — Backup unificado e navegação de revisão.**
   - [x] ~~Disponibilizar exportação própria da memória do projeto com origem e histórico.~~
   - [ ] Unificar backup/restauração de workspace, operações, memória, trilha e futuros guias de entrega.
   - [ ] Tornar explícito o retorno da revisão à pendência/origem que a abriu, preservando projeto e filtros.

### Novas melhorias — painel, conclusão, documentação e Squad Studio

| ID      | Prioridade / estado | Melhoria                                                                                                                                                                                                                                      | Critério de aceite proposto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MEL-008 | P1 · Pendente       | **Corrigir labels e counts dos cartões.** Ajustar A fazer, Prontas, Rodando, Revisão e Feitas, que no print ficam desalinhados ou ultrapassam suas células.                                                                                   | Label e valor permanecem dentro da célula, sem sobreposição/corte; acomodar traduções maiores e contagens com três ou mais dígitos, nos dois temas e larguras desktop/mobile. Valores continuam derivados do estado, sem LLM.                                                                                                                                                                                                                                                                                                 |
| MEL-009 | P1 · Pendente       | **Sinalizar conclusão de projeto e sprint.** Badge com texto/ícone e borda verde discreta, além da porcentagem.                                                                                                                               | Diferenciar projeto selecionado (**Ativo**) de entrega aprovada (**Concluída**); os sinais podem coexistir. Não usar somente cor ou percentual arredondado. Exigir conjunto não vazio de entregas previstas, todas aprovadas pelo operador e nenhuma execução ainda em curso. Uma etapa que terminou aguardando revisão não equivale a entrega concluída.                                                                                                                                                                     |
| MEL-010 | P1 · Pendente       | **Filtros de projetos no painel inicial e na página Projetos.**                                                                                                                                                                               | Busca por nome/código e filtros coerentes por situação da entrega (em andamento, aguardando revisão, concluído) e squad, com ordenação por atualização. Mostrar contagem de resultados, limpar filtros e estado vazio; permitir reencontrar projetos concluídos sem retirá-los do histórico. O projeto selecionado não muda silenciosamente por causa do filtro.                                                                                                                                                              |
| MEL-011 | P1 · Pendente       | **Botão “Guia da entrega” ao lado de cada sprint.**                                                                                                                                                                                           | Habilitar após a aprovação das entregas da sprint e a disponibilidade de seu guia. Enquanto o documentador trabalha, indicar “Gerando guia”; falha ou ausência devem ter explicação e recuperação explícitas. Abrir um snapshot versionado daquela sprint, disponível mesmo depois de outras sprints alterarem o projeto.                                                                                                                                                                                                     |
| MEL-012 | P1 · Pendente       | **Seção “Executar e validar” no briefing do projeto**, abaixo de Arquitetura.                                                                                                                                                                 | Exibir instruções persistidas para abrir, iniciar e validar a versão atual entregue; informar pasta, pré-requisitos, instalação, comandos, URL/porta, credenciais exclusivamente demonstrativas, fluxo de teste, resultado esperado, limitações e como parar. Campos desconhecidos devem ser marcados, nunca inventados. Disponível para consulta posterior, edição/revisão e exportação.                                                                                                                                     |
| MEL-013 | P1 · Pendente       | **Agente de documentação responsável pelas features e entregas.** Reaproveitar os presets existentes, escolhendo um responsável por projeto.                                                                                                  | Registrar quem documentou, quais features/sprint/execuções sustentam o guia, idioma, versão e data. Gerar propostas a partir de evidências reais; atualizar a documentação incrementalmente, sem impor a VANGUARD ou aos executores a redação completa dos guias. Persistência e atualização da tela ficam com o sistema. Ver proposta de responsabilidades abaixo.                                                                                                                                                           |
| MEL-014 | P2 · Pendente       | **Versionar e manter a documentação atualizada sem perder releases anteriores.**                                                                                                                                                              | Uma alteração posterior de código, comando, porta ou configuração relevante marca o guia atual como potencialmente desatualizado e permite atualização por delta. Reabrir feature/sprint ou adicionar demanda não apaga o guia da entrega anterior. Separar estado da implementação, aprovação humana e estado da documentação; incluir os guias no backup MEL-007.                                                                                                                                                           |
| MEL-015 | P1 · Pendente       | **Corrigir a seleção inicial na hierarquia/listagem de agentes do Squad Studio.** Bug relatado nos prints: grupo/agente existente não aparece corretamente selecionado ou centralizado; a seleção visual pode divergir dos detalhes exibidos. | Ao abrir um slot preenchido, recuperar por ID a categoria e o agente atribuídos àquele slot da squad em edição. Cartão destacado, posição central do carrossel, contador, retrato, descrição e ação “Manter” devem apontar ao mesmo item, sem cartões vazios. Cobrir comandante, inteligência e operadores, inclusive agentes customizados/com nomes repetidos; setas, Enter, Esc, troca de categoria, reabertura e cancelamento preservam a seleção correta. Confirmar a causa na reprodução, sem presumir que é apenas CSS. |
| MEL-016 | P1 · Pendente       | **Badge de composição recomendada por squad: pelo menos 1 QA e 1 documentador.** Posicionar no canto do cabeçalho/bloco Operadores, junto à hierarquia.                                                                                       | Calcular a cobertura pelos papéis dos membros válidos da squad em edição, sem depender de nomes/presets nem contar agentes apenas existentes no catálogo/workspace. Mostrar separadamente QA e Documentação, com quantidade e indicação textual do que falta; atualizar ao adicionar/remover/trocar membros, antes de salvar. Com ambos presentes, indicar recomendação atendida. Aviso orientativo, sem bloquear salvar/executar ou fingir que um documentador já está integrado ao pipeline MEL-013.                        |
| MEL-017 | P2 · Pendente       | **Permitir adicionar arquitetos especializados no bloco Inteligência.** Incluir botão “+” semelhante ao de Operadores para arquitetura de gateway/integrações, CI/CD, infraestrutura/cloud e outras especialidades.                           | Adicionar, editar, selecionar e remover especialistas sem substituir silenciosamente o arquiteto principal nem o responsável por produto. Preservar hierarquia e squads atuais; persistir vínculos por IDs. Tornar explícito qual arquiteto é responsável pela feature e quais são consultados, acionando somente os necessários. Não executar todos os arquitetos em toda demanda nem ampliar suas ferramentas por causa da especialidade.                                                                                   |

**Ordem sugerida de entrega:** correções MEL-008/MEL-015 → sinalização e organização MEL-009/MEL-010/MEL-016 → contrato mínimo MEL-004 e pipeline MEL-013 → guias MEL-011/MEL-012 → manutenção MEL-014 e expansão arquitetural MEL-017. MEL-001/MEL-002/MEL-003 seguem como frente de confiabilidade. Antes de automatizar a documentação, definir os campos e as evidências para evitar gerar guias que apenas repetem respostas do chat.

### Detalhamento das novas melhorias do Squad Studio

**MEL-015 — Seleção coerente ao abrir a hierarquia.** Os anexos indicam dois sintomas a reproduzir: o agente já atribuído aparece deslocado em relação à moldura central, e a seleção de categoria pode abrir com a área central vazia enquanto os detalhes mostram Frontend. O aceite deve comparar o membro real do slot, o cursor de categoria/agente, a posição do carrossel e o conteúdo do painel. Abrir o seletor ou cancelar não pode alterar a composição. A referência deve ser o ID persistido, evitando ambiguidades com nomes repetidos ou índices que mudaram após uma edição. Estes sintomas foram registrados a partir dos prints; correção e validação ficam pendentes.

**MEL-016 — Recomendação por grupo, visível em Operadores.** Proposta de texto: “Composição recomendada: QA 1/1 · Documentação 0/1”, acompanhado de “Falta um documentador” quando aplicável. Quantidades acima de um continuam válidas; o mínimo é um membro de cada papel. O badge deve ser discreto, com texto/ícone além da cor, tooltip ou descrição acessível e disposição responsiva nos dois temas. A referência é a squad atualmente em edição: um QA de outra squad não atende esta recomendação. Manter separadas a indicação de cobertura, a habilitação do pipeline de documentação (MEL-013) e as validações obrigatórias já existentes para uma squad utilizável.

**MEL-017 — Inteligência com múltiplos arquitetos, sem multiplicar chamadas por padrão.** O modelo atual de squad tem um `adrId`, um `prdId` e uma lista `operatorIds`; portanto, adicionar somente um botão “+” não resolve a representação de vários arquitetos. Planejar uma coleção de especialistas de arquitetura com IDs estáveis, preservando o responsável principal e compatibilidade/migração dos squads existentes, seus projetos e históricos. O seletor deve permitir perfis especializados ou customizados; remover um especialista não pode apagar entregas antigas nem deixar referências ativas inválidas.

O planejamento/roteamento precisa identificar o responsável pela arquitetura de cada demanda e as consultas necessárias por especialidade. Um arquiteto de CI/CD ou gateway continua com o escopo e as ferramentas autorizadas do seu papel; a especialidade não o transforma automaticamente em executor de infraestrutura. Evitar incluir todos os especialistas em cada rota ou enviar-lhes o histórico inteiro. Validar persistência/reabertura, sincronização com projetos, adição/remoção e roteamento, além do layout do bloco Inteligência.

### Conteúdo dos dois guias

O guia da **sprint** é um retrato de sua entrega: objetivo, features incluídas e aprovadas, arquivos/artefatos e versão de referência, instruções de execução e testes daquela versão, evidências disponíveis, pendências e limitações conhecidas. Deve oferecer acesso às features, execuções e evidências de origem. Se o ambiente já não permitir executar aquela versão, explicitar isso, em vez de apresentar instruções históricas como se fossem atuais.

O guia do **projeto** consolida a versão utilizável mais recente: “onde está”, “como iniciar”, “como validar” e “o que esperar”. Links locais/localhost devem ser identificados como locais à máquina de execução, sem promessa de disponibilidade para outras máquinas. Comandos são conteúdo para consulta/cópia: visualizar um guia não executa nada nem inicia uma chamada de LLM. Segredos e credenciais reais não devem ser copiados para esses documentos.

A conclusão da implementação e a documentação têm estados próprios. Uma falha do documentador não deve repetir código já executado nem fazer o sistema alegar que o guia está pronto. Para a sprint finalizada sem guia, mostrar explicitamente a pendência documental e permitir gerar/repetir somente essa tarefa. A revisão de feature existente continua sendo a aprovação humana; não há hoje um guia persistido nem um aceite documental automático de sprint.

### Responsáveis atuais e proposta para o agente de documentação

**Conferido no código atual:**

- **VANGUARD:** planeja e distribui o trabalho. Não é o responsável por recalcular os contadores ou redesenhar a tela a cada alteração.
- **Executores, como PIXEL/FORGE:** implementam sua etapa e devolvem resultado/handoff. Na entrega do website, PIXEL assume a implementação do frontend; isso é diferente de atualizar o estado do painel do Luma.
- **Coordenador Node (`OperationService`):** confirma execuções, persiste outputs/checkpoints e avança os estados no SQLite. O **Angular e o WorkspaceStore/WorkflowService** acompanham o estado e renderizam a interface. As contagens/progresso são calculadas pelo código, sem tokens de VANGUARD.
- **QA e operador:** QA registra inspeções/verificações; o operador aprova a entrega. Concluir a execução da rota não substitui essa aprovação.
- O catálogo já contém **SCRIBE** (documentação técnica geral), **LEXICON** (API/OpenAPI) e **GUIDE** (tutoriais/onboarding). São presets disponíveis, não três tarefas de documentação ativas. As rotas padrão de setup/frontend/backend/fullstack não acrescentam automaticamente a etapa `docs`.
- As instruções “Como abrir e iniciar depois” deste relatório foram consolidadas pelo operador Codex durante o aceite; hoje elas não se transformam automaticamente em uma seção do projeto.

**Proposta de evolução, ainda não implementada:**

1. Selecionar **um documentador responsável** por projeto, usando SCRIBE como generalista ou GUIDE quando o foco for execução/onboarding. LEXICON pode ser escolhido para entregas de API; não chamar os três por padrão para toda feature.
2. O executor continua produzindo um **handoff técnico curto e estruturado**: o que mudou, arquivos/artefatos, comandos realmente executados, resultados, limitações e próximos passos. O QA acrescenta suas evidências. A documentação não deve transferir a descoberta desses fatos para outro agente que precisaria reconstruir tudo lendo o repositório.
3. Após uma entrega aprovada, o **coordenador** agenda uma tarefa documental idempotente por entrega/versão. O documentador recebe o delta da feature, evidências e documentação existente necessária, não todo o histórico do time. Para o guia final da sprint, consolida as entregas aprovadas; para o projeto, atualiza o manual vigente. Não chamar VANGUARD somente para encaminhar essa atualização.
4. O documentador produz **conteúdo estruturado** e sinaliza informações não verificadas. Preferir perfil de leitura e retorno estruturado, com validação/persistência pelo coordenador; exportação Markdown pode ser feita pelo sistema. Documentar não exige Bash, permissão para alterar código da aplicação ou autonomia ampla.
5. O sistema valida formato/origem, persiste versão e autoria, atualiza o estado documental e disponibiliza os botões/seção no Angular. O operador pode revisar/editar o guia, com histórico. O documentador não pode marcar feature como feita, aprovar código ou afirmar teste não executado.
6. Definir orçamento de contexto/saída, modelo compatível, debounce/lotes por entrega e cache do documento gerado. Não gerar novamente ao abrir a tela, trocar filtros, consultar um guia ou alternar o tema/idioma da interface. Repetição só por mudança relevante ou ação explícita, com registro de consumo por documentação.
7. Comparar **tokens totais e qualidade de validação por entrega**, incluindo o documentador. Especialização pode poupar contexto dos executores e melhorar clareza, mas chamadas extras e releitura podem aumentar consumo. Tratar economia como hipótese a medir, sem reduzir o handoff ou a evidência necessários.

Essa divisão tira a redação consolidada dos executores e de VANGUARD, preserva sua responsabilidade técnica e deixa o fechamento/atualização do painel sob controle determinístico do sistema.

## Como abrir e iniciar depois

Luma Hive está em http://127.0.0.1:4318 e o site em http://127.0.0.1:4355/login. Se os processos forem encerrados:

```powershell
cd C:\Users\UnGui\Documents\Projects\luma-hive
npm.cmd start
```

Em outro terminal:

```powershell
cd C:\Users\UnGui\Documents\Projects\luma-hive\projects\op-002-luma-market-aceite-real-25-10
npm.cmd start
```

Use `npm.cmd` para evitar a restrição de scripts do PowerShell. Não iniciar uma segunda cópia na mesma porta. O site não tem dependências externas a instalar.

## Evidências locais

Arquivos sob `previews/` e `projects/` são ignorados pelo Git. O relatório e o código do harness ficam versionáveis; o site demonstrativo e as evidências desta máquina não entram em um commit automaticamente.

- [Métricas e estado final](../previews/live-acceptance-20261025/final-evidence.json)
- [Login](../previews/live-acceptance-20261025/login-review.json), [carrossel](../previews/live-acceptance-20261025/carousel-review.json), [contato](../previews/live-acceptance-20261025/contact-review.json)
- [Execução nativa dos comandos](../previews/live-acceptance-20261025/approved-command-result.json), [auditoria do gate](../previews/live-acceptance-20261025/acceptance-command-audit.jsonl)
- [Restauração de permissões](../previews/live-acceptance-20261025/restoration-review.json), [memória exportada](../previews/live-acceptance-20261025/project-memory-export.json)
- [Permissões: integração e seis combinações visuais](../previews/live-acceptance-20261025/permissions-review.json), [smoke final real](../previews/live-acceptance-20261025/final-smoke-review.json)
- [Resultado nativo/cleanup: três casos de integração](../previews/live-acceptance-20261025/terminal-review.json)
- [Recuperação e memória: integração HTTP](../previews/workflow-20261025/api-review.json), [interface em seis combinações](../previews/workflow-20261025/browser-review.json)
- [Guia de permissões](PERMISSOES.md), [guia do workflow](WORKFLOW.md), [observabilidade](OBSERVABILIDADE.md)

Build completo Angular/API aprovado; dois avisos NG8107 preexistentes, sem erro de compilação. Testes unitários não executados nem alterados. Nenhum commit ou push realizado.
