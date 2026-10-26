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

Lista atualizada em **26/10/2026**, após conferência da implementação de MEL-008–MEL-017 e revisão visual/funcional. O relato da execução paga de 25/10 permanece histórico; a revisão de 26/10 usou dados isolados e não consumiu LLM. Os IDs `MEL-xxx` são referências estáveis deste backlog. `[x]` e texto riscado indicam somente a parte já implementada; `[ ]` indica trabalho pendente. Um item parcial não está concluído apenas por termos validado seu cenário manualmente no aceite.

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

| ID      | Prioridade / estado | Melhoria                                                                                                                                                                                                                                          | Critério de aceite proposto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MEL-008 | P1 · [x] Concluído  | ~~**Corrigir labels e counts dos cartões.** Ajustar A fazer, Prontas, Rodando, Revisão e Feitas, que no print ficam desalinhados ou ultrapassam suas células.~~                                                                                   | Label e valor permanecem dentro da célula, sem sobreposição/corte; acomodar traduções maiores e contagens com três ou mais dígitos, nos dois temas e larguras desktop/mobile. Valores continuam derivados do estado, sem LLM.                                                                                                                                                                                                                                                                                                 |
| MEL-009 | P1 · [x] Concluído  | ~~**Sinalizar conclusão de projeto e sprint.** Badge com texto/ícone e borda verde discreta, além da porcentagem.~~                                                                                                                               | Diferenciar projeto selecionado (**Ativo**) de entrega aprovada (**Concluída**); os sinais podem coexistir. Não usar somente cor ou percentual arredondado. Exigir conjunto não vazio de entregas previstas, todas aprovadas pelo operador e nenhuma execução ainda em curso. Uma etapa que terminou aguardando revisão não equivale a entrega concluída.                                                                                                                                                                     |
| MEL-010 | P1 · [x] Concluído  | ~~**Filtros de projetos no painel inicial e na página Projetos.**~~                                                                                                                                                                               | Busca por nome/código e filtros coerentes por situação da entrega (em andamento, aguardando revisão, concluído) e squad, com ordenação por atualização. Mostrar contagem de resultados, limpar filtros e estado vazio; permitir reencontrar projetos concluídos sem retirá-los do histórico. O projeto selecionado não muda silenciosamente por causa do filtro.                                                                                                                                                              |
| MEL-011 | P1 · Parcial        | **Botão “Guia da entrega” ao lado de cada sprint.**                                                                                                                                                                                               | Habilitar após a aprovação das entregas da sprint e a disponibilidade de seu guia. Enquanto o documentador trabalha, indicar “Gerando guia”; falha ou ausência devem ter explicação e recuperação explícitas. Abrir um snapshot versionado daquela sprint, disponível mesmo depois de outras sprints alterarem o projeto.                                                                                                                                                                                                     |
| MEL-012 | P1 · [x] Concluído  | ~~**Seção “Executar e validar” no briefing do projeto**, abaixo de Arquitetura.~~                                                                                                                                                                 | Exibir instruções persistidas para abrir, iniciar e validar a versão atual entregue; informar pasta, pré-requisitos, instalação, comandos, URL/porta, credenciais exclusivamente demonstrativas, fluxo de teste, resultado esperado, limitações e como parar. Campos desconhecidos devem ser marcados, nunca inventados. Disponível para consulta posterior, edição/revisão e exportação.                                                                                                                                     |
| MEL-013 | P1 · Parcial        | **Agente de documentação responsável pelas features e entregas.** Reaproveitar os presets existentes, escolhendo um responsável por projeto.                                                                                                      | Registrar quem documentou, quais features/sprint/execuções sustentam o guia, idioma, versão e data. Gerar propostas a partir de evidências reais; atualizar a documentação incrementalmente, sem impor a VANGUARD ou aos executores a redação completa dos guias. Persistência e atualização da tela ficam com o sistema. Ver proposta de responsabilidades abaixo.                                                                                                                                                           |
| MEL-014 | P2 · Parcial        | **Versionar e manter a documentação atualizada sem perder releases anteriores.**                                                                                                                                                                  | Uma alteração posterior de código, comando, porta ou configuração relevante marca o guia atual como potencialmente desatualizado e permite atualização por delta. Reabrir feature/sprint ou adicionar demanda não apaga o guia da entrega anterior. Separar estado da implementação, aprovação humana e estado da documentação; incluir os guias no backup MEL-007.                                                                                                                                                           |
| MEL-015 | P1 · [x] Concluído  | ~~**Corrigir a seleção inicial na hierarquia/listagem de agentes do Squad Studio.** Bug relatado nos prints: grupo/agente existente não aparece corretamente selecionado ou centralizado; a seleção visual pode divergir dos detalhes exibidos.~~ | Ao abrir um slot preenchido, recuperar por ID a categoria e o agente atribuídos àquele slot da squad em edição. Cartão destacado, posição central do carrossel, contador, retrato, descrição e ação “Manter” devem apontar ao mesmo item, sem cartões vazios. Cobrir comandante, inteligência e operadores, inclusive agentes customizados/com nomes repetidos; setas, Enter, Esc, troca de categoria, reabertura e cancelamento preservam a seleção correta. Confirmar a causa na reprodução, sem presumir que é apenas CSS. |
| MEL-016 | P1 · [x] Concluído  | ~~**Badge de composição recomendada por squad: pelo menos 1 QA e 1 documentador.** Posicionar no canto do cabeçalho/bloco Operadores, junto à hierarquia.~~                                                                                       | Calcular a cobertura pelos papéis dos membros válidos da squad em edição, sem depender de nomes/presets nem contar agentes apenas existentes no catálogo/workspace. Mostrar separadamente QA e Documentação, com quantidade e indicação textual do que falta; atualizar ao adicionar/remover/trocar membros, antes de salvar. Com ambos presentes, indicar recomendação atendida. Aviso orientativo, sem bloquear salvar/executar ou fingir que um documentador já está integrado ao pipeline MEL-013.                        |
| MEL-017 | P2 · Parcial        | **Permitir adicionar arquitetos especializados no bloco Inteligência.** Incluir botão “+” semelhante ao de Operadores para arquitetura de gateway/integrações, CI/CD, infraestrutura/cloud e outras especialidades.                               | Adicionar, editar, selecionar e remover especialistas sem substituir silenciosamente o arquiteto principal nem o responsável por produto. Preservar hierarquia e squads atuais; persistir vínculos por IDs. Tornar explícito qual arquiteto é responsável pela feature e quais são consultados, acionando somente os necessários. Não executar todos os arquitetos em toda demanda nem ampliar suas ferramentas por causa da especialidade.                                                                                   |

**Ordem sugerida agora:** MEL-001/MEL-002/MEL-004 → concluir pipeline MEL-013 e guia MEL-011 → histórico MEL-014; em paralelo, revisão com evidências MEL-018 e limites MEL-019/MEL-020. Os itens concluídos acima foram riscados; os quatro itens parciais abaixo conservam suas pendências.

### Conferência de MEL-008–MEL-017 em 26/10

- [x] ~~**MEL-008:** labels/valores contidos nos cartões.~~ Conferidos três idiomas, dois temas, desktop/mobile e stress visual com quatro dígitos (alteração somente do DOM de teste, sem fabricar contagens persistidas).
- [x] ~~**MEL-009:** badges de conclusão e borda, distintos da operação ativa.~~ O cálculo exige features não vazias, todas `done`, e ausência de execução ativa nos controles existentes. A conclusão depende do estado aprovado; percentual arredondado ou término de uma resposta do modelo não bastam.
- [x] ~~**MEL-010:** busca, situação, squad, ordenação, contagem, limpar e vazio nas duas listagens.~~ A página Projetos ainda não expunha squad/ordenação: os controles foram acrescentados. Filtrar não seleciona outro projeto.
- **MEL-011 · Parcial:**
  - [x] ~~Botão em sprint concluída, modal, snapshot manual persistido, reabertura sem regeneração, exportação Markdown.~~
  - [ ] Agendamento real do documentador, estados de geração/falha recuperáveis e guia estruturado ligado às evidências da versão entregue. Hoje abrir o botão pode criar um **rascunho manual**, identificado como tal; isso não é uma execução de SCRIBE.
- [x] ~~**MEL-012:** seção Executar e validar, seleção do documentador da squad, edição/salvamento/reabertura e uso das instruções no guia/export.~~ Corrigida a lista de campos persistidos, que omitia `runAndValidate`/`documenterId`, e a seleção que não enxergava os operadores documentadores. Dados desconhecidos ficam explicitamente não informados; removidos comandos, URL/porta e credenciais do Luma Market que estavam sendo inseridos em outros projetos.
- **MEL-013 · Parcial:**
  - [x] ~~Campo de responsável elegível por projeto usando o papel `docs` e os membros reais da squad.~~
  - [ ] Executar tarefa documental após aprovação, com entradas/evidências mínimas, autoria real, idempotência, consumo e atualização pelo coordenador. Selecionar um agente não comprova que ele escreveu o documento; o rascunho informa essa limitação.
- **MEL-014 · Parcial:**
  - [x] ~~Número de versão, data e atualização manual do snapshot com as instruções atuais do projeto.~~ Corrigida a mutação por referência que podia impedir a persistência.
  - [ ] Conservar e consultar versões anteriores: hoje atualizar substitui o snapshot em vez de manter histórico. Detectar obsolescência por alterações relevantes, atualizar por delta e integrar ao backup MEL-007.
- [x] ~~**MEL-015:** seleção por IDs e centralização ao abrir comandante, inteligência e operador existentes.~~ Conferidos cartão/detalhes, setas e Esc, reabertura, adição e persistência. A implementação sincroniza o carrossel após renderizar; a conferência não se limitou a trocar CSS. Não foi declarada cobertura de todas as combinações de agentes customizados/históricos.
- [x] ~~**MEL-016:** recomendação QA/Documentação por membros únicos da squad em edição, atualizada com alterações e sem bloquear salvamento.~~ SVG corrigido para 12 px; badge agora no fluxo **dentro de Operadores, alinhado à direita**, abaixo do separador. Tooltip e descrição acessível usam chaves centrais. QA/documentador de outra squad não contam.
- **MEL-017 · Parcial no critério completo:**
  - [x] ~~Adicionar/selecionar/remover arquitetos especialistas, persistir `specialistIds`, preservar `adrId`/`prdId` e sincronizar membros dos projetos.~~ Corrigido filtro de categoria inexistente que ocultava os arquitetos. Adição de GATEWAY, salvamento e reabertura verificados por UI e estado persistido.
  - [ ] Explicitar responsável de arquitetura versus especialistas consultados em cada demanda e validar roteamento por especialidade. O plano existente usa IDs na sequência da rota, mas não representa esse contrato de responsabilidade/consulta; a gestão da hierarquia não encerra esta parte do aceite. Não habilitar chamadas a todos os arquitetos por padrão. Integrar ao broker MEL-001.

### Conteúdo dos dois guias

O guia da **sprint** é um retrato de sua entrega: objetivo, features incluídas e aprovadas, arquivos/artefatos e versão de referência, instruções de execução e testes daquela versão, evidências disponíveis, pendências e limitações conhecidas. Deve oferecer acesso às features, execuções e evidências de origem. Se o ambiente já não permitir executar aquela versão, explicitar isso, em vez de apresentar instruções históricas como se fossem atuais.

O guia do **projeto** consolida a versão utilizável mais recente: “onde está”, “como iniciar”, “como validar” e “o que esperar”. Links locais/localhost devem ser identificados como locais à máquina de execução, sem promessa de disponibilidade para outras máquinas. Comandos são conteúdo para consulta/cópia: visualizar um guia não executa nada nem inicia uma chamada de LLM. Segredos e credenciais reais não devem ser copiados para esses documentos.

A conclusão da implementação e a documentação têm estados próprios. Uma falha do documentador não deve repetir código já executado nem fazer o sistema alegar que o guia está pronto. Para a sprint finalizada sem guia, mostrar explicitamente a pendência documental e permitir gerar/repetir somente essa tarefa. A revisão de feature existente continua sendo a aprovação humana; em 25/10 não havia guia persistido. Em 26/10 há rascunho manual persistido, mas o aceite documental automático e o pipeline continuam pendentes (MEL-011/MEL-013).

### Responsáveis atuais e proposta para o agente de documentação

**Conferido no código atual:**

- **VANGUARD:** planeja e distribui o trabalho. Não é o responsável por recalcular os contadores ou redesenhar a tela a cada alteração.
- **Executores, como PIXEL/FORGE:** implementam sua etapa e devolvem resultado/handoff. Na entrega do website, PIXEL assume a implementação do frontend; isso é diferente de atualizar o estado do painel do Luma.
- **Coordenador Node (`OperationService`):** confirma execuções, persiste outputs/checkpoints e avança os estados no SQLite. O **Angular e o WorkspaceStore/WorkflowService** acompanham o estado e renderizam a interface. As contagens/progresso são calculadas pelo código, sem tokens de VANGUARD.
- **QA e operador:** QA registra inspeções/verificações; o operador aprova a entrega. Concluir a execução da rota não substitui essa aprovação.
- O catálogo já contém **SCRIBE** (documentação técnica geral), **LEXICON** (API/OpenAPI) e **GUIDE** (tutoriais/onboarding). São presets disponíveis, não três tarefas de documentação ativas. As rotas padrão de setup/frontend/backend/fullstack não acrescentam automaticamente a etapa `docs`.
- As instruções “Como abrir e iniciar depois” deste relatório foram consolidadas pelo operador Codex durante o aceite; agora há uma seção manual persistente para elas; sua geração automática por documentador ainda está pendente.

**Pipeline proposto — seleção manual já disponível; execução documental automática ainda pendente:**

1. Selecionar **um documentador responsável** por projeto, usando SCRIBE como generalista ou GUIDE quando o foco for execução/onboarding. LEXICON pode ser escolhido para entregas de API; não chamar os três por padrão para toda feature.
2. O executor continua produzindo um **handoff técnico curto e estruturado**: o que mudou, arquivos/artefatos, comandos realmente executados, resultados, limitações e próximos passos. O QA acrescenta suas evidências. A documentação não deve transferir a descoberta desses fatos para outro agente que precisaria reconstruir tudo lendo o repositório.
3. Após uma entrega aprovada, o **coordenador** agenda uma tarefa documental idempotente por entrega/versão. O documentador recebe o delta da feature, evidências e documentação existente necessária, não todo o histórico do time. Para o guia final da sprint, consolida as entregas aprovadas; para o projeto, atualiza o manual vigente. Não chamar VANGUARD somente para encaminhar essa atualização.
4. O documentador produz **conteúdo estruturado** e sinaliza informações não verificadas. Preferir perfil de leitura e retorno estruturado, com validação/persistência pelo coordenador; exportação Markdown pode ser feita pelo sistema. Documentar não exige Bash, permissão para alterar código da aplicação ou autonomia ampla.
5. O sistema valida formato/origem, persiste versão e autoria, atualiza o estado documental e disponibiliza os botões/seção no Angular. O operador pode revisar/editar o guia, com histórico. O documentador não pode marcar feature como feita, aprovar código ou afirmar teste não executado.
6. Definir orçamento de contexto/saída, modelo compatível, debounce/lotes por entrega e cache do documento gerado. Não gerar novamente ao abrir a tela, trocar filtros, consultar um guia ou alternar o tema/idioma da interface. Repetição só por mudança relevante ou ação explícita, com registro de consumo por documentação.
7. Comparar **tokens totais e qualidade de validação por entrega**, incluindo o documentador. Especialização pode poupar contexto dos executores e melhorar clareza, mas chamadas extras e releitura podem aumentar consumo. Tratar economia como hipótese a medir, sem reduzir o handoff ou a evidência necessários.

Essa divisão tira a redação consolidada dos executores e de VANGUARD, preserva sua responsabilidade técnica e deixa o fechamento/atualização do painel sob controle determinístico do sistema.

### Novos TODOs — organização, monitoramento e eficiência

Propostas a implementar, **não entregas desta rodada**. As dores vêm do aceite real acima e da conferência de 26/10. As referências são padrões úteis de outros projetos, não uma recomendação de trocar Angular/Node ou adicionar esses serviços obrigatoriamente. Consulta às fontes em 26/10/2026.

- [ ] **MEL-018 · P1 — Mesa de revisão com evidências.** Dor: foi preciso navegar entre chat, observabilidade, arquivos e navegador para decidir se a entrega estava pronta. Reunir requisitos, alterações/artefatos da versão, instruções, capturas, comandos/resultados e limitações junto de Aprovar/Pedir ajustes; cada afirmação deve abrir sua origem. Distinguir teste executado, inspeção e texto do modelo. Depende de MEL-004 e alimenta MEL-011. O [QA do OpenHands](https://docs.openhands.dev/openhands/usage/use-cases/qa-changes) exercita o software e apresenta relatório com evidências; adaptar esse padrão ao nosso aceite.
- [ ] **MEL-019 · P1 — Orçamento por projeto, sprint e execução.** Dor: retries, consultas e releitura podem gastar sem melhorar a entrega. Limites configuráveis de tokens, tempo e tentativas; alertas graduais e pausa antes da próxima chamada quando o limite for alcançado, com retomada explícita. Incluir documentação/subagentes quando o provedor os informar; sinalizar cobertura parcial. Não inventar saldo semanal/mensal, preço ou uso oculto. O [rastreamento de uso do Langfuse](https://langfuse.com/docs/observability/features/token-and-cost-tracking) inspira a atribuição de consumo; a decisão de limitar chamadas é nossa proposta.
- [ ] **MEL-020 · P1 — Saúde da execução e detecção de falta de progresso.** Dor: resultado terminal já entregue com processo preso no encerramento e negativas repetidas. Mostrar última atividade, ferramenta em curso, tempo sem novos eventos, finalização e possível repetição; separar tarefa longa viva de processo travado. Permitir inspecionar, pausar ou repetir apenas o checkpoint afetado, sem matar processo alheio nem disparar retry pago silencioso. Usar eventos normalizados de ciclo, ferramenta e subagente como referência: [AG-UI Events](https://docs.ag-ui.com/concepts/events). Não prometer heartbeat quando o conector não o fornece.
- [ ] **MEL-021 · P1 — Plano aprovado versionado e comparação de mudanças.** Dor: decisões e escopo ficam dispersos no chat. Preservar plano/rotas aprovados, destacar alterações de demanda, dependência, agente, capacidade e orçamento antes de executar a nova versão; não repetir checkpoints confirmados sem decisão. Pendências devem guardar motivo, contexto e ponto de retomada. O padrão de pausa persistida e retomada com payload do [LangGraph](https://docs.langchain.com/oss/javascript/langgraph/interrupts) é uma referência, sem exigir migração do coordenador.
- [ ] **MEL-022 · P1 — Pedido de ajuste direcionado, com critério de saída.** Dor: uma correção de contato não deveria refazer login/carrossel nem perder a evidência aprovada. Registrar defeito, reprodução, severidade, artefato e responsável; retornar à etapa afetada, invalidando somente dependências necessárias. Exibir o que permanece aprovado, evidência antes/depois e limite de ciclos. Integrar à mesa MEL-018 e ao QA por delegação MEL-001.
- [ ] **MEL-023 · P1 — Grafo de dependências e bloqueios acionáveis.** Dor: setup, permissão ou decisão humana bloqueiam outras demandas sem uma visão única do motivo. Visualizar demanda → pré-requisito → etapa/agente/pendência, impacto nas próximas entregas e ação necessária. Derivar do estado persistido, sem LLM para calcular contadores; apontar inconsistência/ciclo. Complementar o centro de atenção existente, sem criar uma segunda fila desconectada.
- [ ] **MEL-024 · P2 — Fila de trabalho e limite de trabalho em andamento.** Dor: concorrência global sozinha não expressa prioridade, capacidade nem disputa por arquivos. Ordenar demandas entre projetos por prioridade/dependência, mostrar quem espera o quê e permitir limite por projeto/squad/recurso. Impedir duas execuções concorrentes de escrita incompatíveis na mesma árvore; integrar ao isolamento MEL-005. Inspiração: a [fila priorizada do Agent Canvas/OpenHands](https://docs.openhands.dev/openhands/usage/use-cases/daily-workflow), adaptada ao nosso modelo de sprint.
- [ ] **MEL-025 · P2 — Inspetor de contexto e versão efetiva das instruções.** Dor: dificuldade de saber por que agentes responderam diferente e quanto contexto repetido receberam. Por run, registrar versão/hash do perfil, prompt, modelo/esforço, política, arquivos/memórias incluídos e motivo da seleção; comparar versões e preservar a configuração histórica. Ocultar segredos; tamanho estimado e tokens reportados devem ser distintos. Complementa MEL-006. O [versionamento de prompts do Langfuse](https://langfuse.com/docs/prompt-management/overview) é a referência.
- [ ] **MEL-026 · P2 — Biblioteca de cenários de aceite e replay.** Dor: repetir manualmente cada fluxo da migração custa tempo e regressões reaparecem. Salvar casos Atlas/Luma Market, entrada, resultado esperado, variantes de idioma/tema e eventos de erro; reproduzir offline primeiro, com relatórios comparáveis. Rodadas reais de LLM exigem escolha explícita do conector e orçamento; replay nunca pode aparecer como resposta real. Inspiração: [datasets e experimentos do Langfuse](https://langfuse.com/docs/evaluation/overview). Não inclui executar/corrigir testes unitários nesta rodada.
- [ ] **MEL-027 · P2 — Central de artefatos e ambientes de prévia.** Dor: instruções úteis ficaram só no relatório e uma porta pode não estar mais ativa no dia seguinte. Vincular arquivos/versão/guia à entrega; indicar URL local, estado verificado e data; oferecer copiar comandos e iniciar/parar prévia com ownership do processo/porta. Não executar ao abrir o guia, sobrescrever porta ocupada, prometer localhost público nem usar comandos de outro projeto. Complementa MEL-012/MEL-014.
- [ ] **MEL-028 · P2 — Métricas de eficiência por entrega aprovada.** Dor: tokens isolados não mostram retrabalho ou espera. Medir tempo de execução versus espera humana/CLI, tentativas, correções, custo/uso informado por entrega e documentação, incluindo cobertura de dados e origem. Comparar antes/depois do documentador e da seleção de contexto; separar duração somada dos agentes de duração do fluxo. Usar para melhoria do processo, sem confundir volume de tokens com qualidade individual.
- [ ] **MEL-029 · P2 — Templates de projeto e checklist de pronto para iniciar.** Dor: agentes pediram stack/design system/ambiente e instruções do Luma Market estavam sendo atribuídas a outros projetos. Pedir explicitamente raiz, stack desejada, comandos conhecidos, critérios, restrições e estratégia de validação; campos desconhecidos permanecem vazios. Recomendar QA/documentador e executar preflight MEL-002 antes da primeira chamada. Template reduz perguntas repetidas, mas não inventa decisões do usuário.
- [ ] **MEL-030 · P2 — Arquivamento e organização do histórico.** Dor: listagens crescerão mesmo com filtros MEL-010. Acrescentar tags, responsável, arquivar/restaurar e paginação, mantendo guias, aprovações, memória e trilha recuperáveis. Ocultar arquivados por padrão sem excluir dados; preservar filtros e vínculos ao voltar da revisão. Integrar ao backup MEL-007.
- [ ] **MEL-031 · P2 — Reduzir carregamento inicial sem perder recursos.** Dor técnica desta revisão: bundle inicial de aproximadamente 1,51 MB ultrapassa o aviso de 1,50 MB em 8,07 kB. Medir carregamento e separar módulos/estilos quando apropriado; preservar troca de idioma/tema e rotas. Aceite: ficar dentro do orçamento atual e conferir os fluxos afetados; não apenas aumentar o limite para silenciar o aviso.

**Próximo recorte recomendado:** finalizar MEL-004/MEL-013/MEL-011, depois MEL-018/MEL-019/MEL-020. Esse conjunto resolve a orientação pós-entrega, facilita aprovar com evidência e reduz execução sem progresso. MEL-001/MEL-002 seguem necessários para autonomia consistente com o perfil de cada agente.

## Revisão complementar — 26/10/2026

### Correções aplicadas nesta rodada

- [x] ~~Badge de QA/Docs dentro de Operadores, à direita, com SVG dimensionado corretamente.~~
- [x] ~~Contadores do Squad compactos dentro da lateral esquerda, com filtros preservados.~~ No mobile, disposição vertical compacta para evitar partir palavras em colunas estreitas.
- [x] ~~Header com todos os CLIs detectados: CDX/DVN/AGY quando múltiplos e nome completo quando único; clique abre o provedor correspondente.~~ Tooltip informa versão e distingue o provedor do agente atual. Detecção de executável não equivale a login, saldo ou disponibilidade comercial.
- [x] ~~Tema pixel aplicado a perfil, missão, progresso, controles/legendas, balões e hierarquia de agentes.~~ Removidos anéis/brilho futurista do Squad Studio no tema pixel. Mapa 3D/pixel e retratos continuam escolhas independentes; selecionar interface pixel não força outro mapa ou retrato.
- [x] ~~Corrigidos persistência e autoria dos rascunhos manuais, seleção de documentador e filtro dos arquitetos especialistas.~~ Detalhes nos itens parciais acima.
- [x] ~~Novos textos/descrições acessíveis com chaves centrais em pt-BR, en e es.~~ Não foram alterados comportamentos de execução ou permissões de CLI nesta revisão visual.

### Verificação e limites

- Build completo Angular 20/API aprovado. Avisos: NG8107 preexistente em `review.component.html` e orçamento inicial excedido em 8,07 kB (MEL-031). Sem erro de compilação.
- Playwright/Edge: três idiomas × dois temas, mapas 3D/pixel, desktop 1512 px e mobile 390 px, **54 capturas**; conferidos filtros/busca/ordenação, badge/composição, seleção por teclado e centralização, adição de documentador/especialista, salvar e reabrir.
- Integração adicional: rascunho criado uma vez e persistido, reabertura sem regenerar, editar/salvar/recarregar Executar e validar/documentador, atualizar para v2 e exportar Markdown. Confirmados limites do pipeline e histórico; esses itens não foram riscados integralmente.
- Health/modelos de CLI simulados apenas na fixture visual para reproduzir zero/um/três conectores. Dados clonados para banco/servidor isolado na porta 4356; chamadas de inferência bloqueadas. **Nenhuma nova execução paga, reset de projeto ou alteração de permissões globais.** Os snapshots feitos no banco de teste não são entregas novas dos projetos reais.
- Integridade dos dados reais confirmada ao final: revisão e SHA-256 do workspace iguais ao início; Atlas e Luma Market preservados. Servidores 4317/4318/4331 responderam HTTP 200; fixture 4356 encerrada.
- **Testes unitários não executados nem alterados**, conforme solicitado. Esta revisão dirigida não é declaração de cobertura de 100% das ações legadas, estados de falha ou combinações de agentes customizados.
- Evidências locais: [matriz visual](../previews/layout-review-20261026/ui-review.json), [guias e persistência](../previews/layout-review-20261026/guide-review.json), [integridade do workspace real](../previews/layout-review-20261026/main-integrity.json). Arquivos de previews continuam ignorados pelo Git.

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

Na execução histórica de 25/10: build Angular/API aprovado, com avisos NG8107 preexistentes; testes unitários não executados nem alterados. A conferência de 26/10 e seus limites estão registrados na seção complementar acima. Esta rodada de revisão não realizou commit ou push.
