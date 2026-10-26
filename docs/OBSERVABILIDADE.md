# Observabilidade de agentes

Disponível em `/observability`, no menu principal. O console abre a execução selecionada em **Analisar execução**; o painel de consumo oferece **Consumo por entrega e agente**.

## O que está disponível

- Árvore do agente responsável e das consultas a subagentes, incluindo níveis aninhados quando o CLI informa a relação.
- Linha do tempo com ferramentas, respostas, falhas e eventos de ciclo de vida; filtros por tipo, texto e agente, detalhes do evento e exportação JSON.
- Consumo local agrupado por agente responsável, entrega/feature, sprint, modelo, provedor e subagente consultado.
- Filtros por projeto, semana atual, mês atual ou todo o histórico. As listas são paginadas; os totais abrangem todos os registros do filtro.
- Atualização a cada quatro segundos enquanto a página está visível. Temas futurista/pixel e idiomas pt-BR/en/es.

## Origem e limites dos números

Os números são obtidos dos eventos reais armazenados no SQLite, sem chamar um LLM para gerar análises. A página não altera permissões ou a política de execução dos agentes.

Tokens principais são atribuídos ao responsável, feature e sprint da execução. Tokens informados por filhos aparecem em agrupamento separado: não são somados novamente ao total principal, pois o provedor pode incluir consultas no uso da sessão. Cache é um campo nativo separado, cuja composição varia por provedor; não é somado novamente ao total. No aceite Antigravity, cache_read_tokens excedeu input_tokens: preservamos ambos os valores sem inferir consumo faturável. Duração agregada soma durações das execuções; pode exceder o tempo de relógio quando há paralelismo.

`—` significa dado não informado, nunca consumo zero presumido. A cobertura indica quantas execuções têm algum consumo informado. Os totais locais não representam saldo, franquia nem fatura da conta; essas informações continuam no painel de disponibilidade já existente. Não há estimativa de preço sem dados de tarifa verificáveis.

Codex e Antigravity permitem identificar consultas pelos eventos de ferramentas. Detalhes internos, resultados, modelo e tokens individuais dependem da emissão desses campos pelo CLI. A versão de Devin integrada atualmente fornece texto, sem telemetria estruturada de filhos; a tela sinaliza dados parciais. Nenhum subagente é inventado para preencher lacunas. Históricos antigos podem conter somente a chamada e o resultado da consulta, sem seus eventos internos.

As novas execuções preservam nomes e IDs de projeto, agente, entrega e sprint como metadados. Históricos antigos são hidratados com o workspace atual quando possível; campos ausentes continuam desconhecidos. Eventos legados são projetados na árvore sem reescrever registros. Não há migração de esquema necessária: os campos são opcionais no JSON já persistido.

## Implementação

- `packages/domain/src/observability.ts`: contratos, normalização de tokens e projeção de árvores/eventos novos e legados.
- `apps/api/src/providers/telemetry.ts`: separação de eventos de filhos emitidos pelos provedores.
- `apps/api/src/observability/observability.service.ts`: consultas, filtros e agregações.
- `apps/web/src/app/features/observability/`: tela Angular.
- `apps/web/src/app/core/i18n/labels.ts`: textos centralizados nos três idiomas.

Endpoints de leitura, com a autenticação local `x-luma-token` existente:

- `GET /api/observability?period=month&projectId=...&sprintId=...&agentId=...&provider=...&model=...&offset=0&limit=50`
- `GET /api/runs/:id/trace`

`period` aceita `week`, `month`, `all`; `limit` aceita 1 a 200. Sem `projectId`, consulta todos os projetos. O filtro de agente inclui execuções nas quais ele recebeu uma consulta; o total principal continua atribuído ao responsável. O modelo padrão desconhecido e a ausência de sprint são opções explícitas nos filtros.

## Validação desta entrega

Build completo Angular/API; integração HTTP com SQLite isolado e 310 execuções; paginação acima dos 300 registros; árvore aninhada, cobertura parcial, falhas, filtros, autenticação e metadados históricos. Reprodução de NDJSON fragmentado Codex/Antigravity para validar separação das respostas/tokens e deduplicação de ferramentas aninhadas.

Playwright nos três idiomas e dois temas: filtros, seleção de filhos/netos, detalhes, exportação, agrupamentos, paginação e viewport móvel. Verificação adicional de cabeçalho em seis larguras e navegação pela mesma rota através do painel de consumo.

Fixtures e relatórios locais em `previews/observability-20261025/`, ignorados pelo Git. Nenhuma inferência paga foi executada para esta validação. Testes unitários não foram executados nem alterados, conforme solicitado.

## Resumo da squad no mapa

A aba Squad possui um resumo com agentes, trabalhando, disponíveis, aguardando sua ação, pausados e subagentes ativos detectados. Clicar em um contador filtra a lista lateral; **Mostrar todos** remove o filtro.

A lista permanece vertical à esquerda nos mapas 3D e pixel, independentemente do tema da interface. Cada agente exibe especialidade, estado, atividade atual ou última resposta, além do acesso à última execução. As consultas ficam abaixo do agente que as invocou, com níveis aninhados, tarefa, retrato quando existe no catálogo e estado. As consultas podem ser recolhidas; clicar em uma abre sua execução na observabilidade.

Critérios dos contadores:

- **Trabalhando**: execução em andamento ou consulta ativa identificada nos eventos. Um pedido de pausa durante uma etapa continua sendo trabalho até a etapa terminar.
- **Disponíveis**: agentes sem execução ou pendência identificada.
- **Precisam de você**: aprovação de plano, pergunta estruturada ainda sem resposta, entrega em revisão humana ou última execução com falha ainda não superada. A causa aparece no cartão.
- **Pausados**: agente aguardando a liberação da próxima etapa de uma operação pausada.
- **Subagentes ativos**: consultas detectadas ainda em andamento; inclui auxiliares temporários fora do catálogo. Esta contagem não é somada ao total de membros da squad. Provedores sem telemetria suficiente podem omitir consultas.

Eventos da sessão atual atualizam a visualização imediatamente; execuções persistidas são consultadas a cada três segundos enquanto a aba Squad está visível. Ao sair da aba, o monitoramento para. Consultas concluídas continuam na última execução do agente. Em uma falha de atualização, a lista preserva os últimos dados e sinaliza a interrupção.

Implementação adicional em `apps/web/src/app/features/map/squad-activity.service.ts` e `apps/web/src/styles/squad-activity.css`. O ajuste do enquadramento pixel reserva espaço para a sidebar; salas, sprites, rotas e lógica de execução permanecem os mesmos. Nenhuma alteração de backend foi necessária nesta melhoria.

Validação adicional via Playwright: três idiomas × dois temas × dois mapas, quatro larguras, consultas aninhadas e temporárias, filtros, recolhimento, scroll lateral, término de consultas, interrupção de atualização e acesso à linha do tempo. Fluxo de sprint em modo demo com aprovação, pausa, retomada, revisão humana e chat minimizado, com API de escrita interceptada e sem chamadas reais de IA. Relatórios ignorados em `previews/squad-activity-20261025/`.
