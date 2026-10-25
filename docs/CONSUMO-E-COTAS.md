# Consumo e disponibilidade

Feature exclusiva do Luma Hive, acessível pelo botão **Consumo** no cabeçalho. Mantém a identidade visual existente e as traduções pt-BR, inglês e espanhol. O primeiro clique abre uma prévia compacta ancorada ao botão, com tokens da semana e barras das cotas reais. A prévia usa popover nativo, fecha por Escape, clique fora ou novo clique no botão. “Ver detalhes” abre o painel completo, que usa diálogo nativo com foco contido e retorno de foco ao botão.

## Dados exibidos

- Consumo semanal e mensal por Codex, Devin e Antigravity: tokens de entrada, saída, cache e total, além da cobertura de execuções com contagem informada.
- Semana começa na segunda-feira; mês começa no dia 1, no fuso do servidor mostrado na tela. O período usa a data de início da execução. O consumo inclui todas as operações do banco atual desta instalação.
- Execuções com falha também entram quando o provedor devolve contagem. Dados ausentes aparecem como traço e tornam o total parcial; não são convertidos em consumo zero. Zero execuções significa zero tokens registrados no período.
- O total usa o total informado pela CLI ou, na ausência dele, entrada mais saída. Cache é exibido separadamente e não é adicionado novamente. Não há estimativa de preço, horas restantes ou multiplicação da cota semanal para inventar uma mensal.
- Históricos anteriores a um reset de banco não são importados automaticamente dos backups. As entregas simuladas do exemplo não produzem consumo real.

## Disponibilidade das contas

Codex usa somente `initialize` e `account/rateLimits/read` no app-server local, preservando os grupos e durações retornados pelo provedor. O formato documentado distingue percentual usado, duração da janela e data de renovação. [Documentação oficial do Codex](https://learn.chatgpt.com/docs/app-server#6-rate-limits-chatgpt).

Antigravity usa o comando nativo `/usage` em modo de impressão JSON. A resposta foi conferida com `num_turns: 0` e nenhum token de inferência. São preservados os grupos Gemini e Claude/GPT e as respectivas janelas. [Documentação oficial do Antigravity](https://www.antigravity.google/docs/cli/commands/usage).

O Devin instalado não expõe uma consulta de cota suportada nos comandos disponíveis. O cartão continua mostrando o consumo registrado quando houver contagens e informa a indisponibilidade da cota. A CLI atual devolve respostas de execução em texto sem estatísticas de tokens; essas execuções podem aparecer como contagem não informada.

Nas contas consultadas, Codex e Antigravity retornaram janelas de cinco horas e semanais. Nenhum deles informou uma cota mensal; o popup indica **Mensal · Não informada pela CLI**. Um provedor que devolva uma janela mensal já pode ser renderizado sem mudar a tela.

As cotas são da conta e podem refletir uso fora do Luma. O consumo local é do Luma. Abrir o popup consulta o banco primeiro e depois os provedores, em paralelo. Consultas de cota usam cache de 30 segundos e compartilham requisições simultâneas; o botão Atualizar recalcula o consumo local. Falhas de um provedor não impedem os outros cartões. Os caminhos explícitos das integrações são respeitados. A consulta não lê nem devolve credenciais e não compra créditos.

## Organização

- `packages/domain/src/usage.ts`: contrato compartilhado entre API e tela.
- `apps/api/src/usage/usage.service.ts`: períodos e agregação do consumo do banco, sem o limite de 300 itens do histórico.
- `apps/api/src/usage/quota.ts`: consulta e normalização das cotas, cache e tratamento de falhas.
- `GET /api/usage`: consumo local e última cota consultada; `?refresh=1` consulta os provedores respeitando o cache.
- `apps/web/src/app/features/usage/`: popup, estilo e interação.
- `apps/web/src/app/core/i18n/usage-messages.ts`: textos nos três idiomas.

Foi removida a implementação incompleta que retornava custos e percentuais fixos. Nenhum arquivo de produção do SquadCode foi alterado para esta feature.

## Validação

A compilação Angular e TypeScript passou. Os dois avisos anteriores de encadeamento opcional permanecem. Não foram executados nem alterados testes unitários.

Uma cópia isolada com dados sintéticos e uma CLI de protocolo controlado validou 18 verificações de integração em navegador: mais de 300 execuções, limites de semana/mês, tentativa com falha, cache sem duplicação, valores ausentes, janelas de cota, abertura, mudança de período, ausência de cota mensal, contenção dos atalhos globais, foco, Escape, clique fora, celular sem rolagem horizontal, inglês, espanhol e erro de rede. Evidências: `previews/usage-feature-20261023/review.json` e capturas da mesma pasta. Esses dados não foram inseridos no banco principal.

Também foi validada a aplicação principal com as contas reais: Codex e Antigravity retornaram cotas; Devin informou a limitação descrita acima. Nenhuma mensagem foi enviada a um LLM para testar esta feature. Evidências: `native-quota.json`, `main-smoke.json` e `main-real.png` na pasta acima.

Somente o Luma Hive foi reiniciado, após terminar a execução que estava ativa. O hash do workspace foi idêntico antes e depois, preservando operação, agentes, features e conversas. SquadCode e a comparação permaneceram ativos. Sem stage, commit ou push.

## Prévia compacta — 23/10/2026

A prévia mantém as integrações Codex, Devin e Antigravity, usa cores por provedor e mostra as janelas de cota em ordem de duração. Grupos com cotas separadas permanecem identificados; não são somados nem transformados em uma média. As contagens da semana são abreviadas e o valor completo pode ser consultado na dica ou no painel detalhado. Valores ausentes continuam explícitos. Não foram adicionados custos fixos como os da imagem de referência.

O botão Ver detalhes reutiliza o mesmo snapshot e a eventual consulta em andamento. O painel completo conserva seleção semanal/mensal, contagens, status e datas de renovação. A API, os cálculos e o banco não foram alterados nesta etapa. Somente os arquivos do componente de consumo e suas traduções foram ajustados.

A compilação passou. A conferência em navegador validou 15 comportamentos: abertura compacta, três provedores, tokens/barras, tamanho e ancoragem, alternância pelo botão, detalhes sem nova consulta, seleção mensal preservada, foco e Escape no painel completo, Escape na prévia, contenção de atalhos, clique fora sincronizando o estado, prévia e detalhes no celular, inglês e espanhol. Sem erros JavaScript capturados. Evidências em previews/usage-preview-20261023/review.json e capturas da mesma pasta. Os dados de consumo foram lidos da aplicação e reutilizados nas respostas controladas do navegador para manter a conferência determinística. Nenhuma chamada a LLM, alteração de banco, teste unitário, commit ou push. Não foi necessário reiniciar os serviços, pois esta etapa alterou somente a interface.
