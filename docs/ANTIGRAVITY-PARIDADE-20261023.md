# Conferência de briefing e sprint com Antigravity — 23/10/2026

Comparação entre SquadCode (4317) e Luma Hive Angular 20 (4318), com o mesmo exemplo Atlas Commerce, seis agentes e sete features. F00 e F01 são entregas ilustrativas do exemplo; não foram implementadas nesta conferência.

## Integração utilizada

- Antigravity CLI 1.4.6 instalado em \Users\UnGui\AppData\Local\agy\bin\agy.exe (unidade C:), explicitamente configurado nas duas aplicações.
- Modelo gemini-3.8-flash-low, esforço low. Escolha econômica na família Flash disponível; o catálogo da CLI não informa preço por modelo, portanto não comprova que seja o menor custo absoluto de todas as famílias.
- Permissão read-only, para simular a execução da sprint com respostas reais, sem implementar o e-commerce. O argumento nativo --mode accept-edits aparece no console, mas o perfil gerado restringe as ferramentas à leitura, conforme a configuração aplicada pelo adaptador.
- Nenhuma alteração de assinatura, compra de créditos ou autenticação.

## Execução real

Foram feitas cinco chamadas em cada aplicação: duas conversas do briefing, um planejamento e duas etapas da sprint. As dez concluíram com status done. Houve perguntas com opções no briefing. Pausar durante a etapa deixou o processo atual concluir e impediu a etapa seguinte; retomar iniciou a próxima etapa. A execução foi pausada novamente e encerrada.

Respostas de LLMs variam entre chamadas: foram comparados o fluxo, a identidade do agente, os eventos e os controles, sem exigir textos idênticos. A simulação percorreu ECHO e PROPHET; não representa conclusão ou aprovação de toda a sprint nem execução de todas as rotas possíveis.

Evidências reais: previews/antigravity-recovery-20261023/live-before.json e live-after.json, registros individuais de execução e capturas old/new. Não foram usados mocks nessas dez chamadas.

## Correções no Angular

- Indicador de digitação com rosto e nome do agente; estados visuais da reunião durante a resposta.
- Mensagem inicial do comandante, instrução de início de cada etapa, indicador de trabalho e passagem de bastão com retratos e entrega expansível.
- Mensagens explícitas de pausa e retomada. O agente atual termina a etapa; o bastão e a identificação da próxima etapa avançam, mas a próxima chamada só começa após retomar.
- Atividades de ferramentas aparecem mesmo antes de chegar texto e permanecem no histórico depois da resposta. Erros preservam sua apresentação de falha.
- Mapa distingue pausando após a etapa de pausado e deixa de exibir como ativa uma ferramenta já finalizada.
- Console acompanha a execução atual e mostra executável, argumentos, pasta absoluta, PID, sessão, modelo, permissões, ferramentas, resultado, duração e tokens quando a CLI os fornece. Blocos de texto de streaming são agrupados para leitura.
- Cabeçalho, mapa e registros identificam o provedor configurado, inclusive Antigravity, em vez de mostrar Codex fixamente. O botão do mapa usa RETORNAR durante a pausa.

## Verificação complementar

Depois das chamadas reais, cópias isoladas nas portas 4347 e 4348 repetiram briefing, planejamento, aprovação, pausa, retomada e encerramento com uma CLI de reprodução controlada do protocolo Antigravity, sem acesso a modelo. Isso permitiu verificar de forma determinística a persistência das ferramentas e a transição de bastão antes da retomada. A reprodução é evidência de interface e não deve ser contada como chamadas reais.

Relatório: previews/antigravity-recovery-20261023/replay/live-after.json. As duas aplicações passaram, sem erros JavaScript capturados. A compilação Angular e TypeScript passou; permanecem dois avisos anteriores de encadeamento opcional. Não foram executados nem alterados testes unitários. Sem stage, commit ou push.

## Estado entregue

Os dados da comparação foram arquivados antes da restauração em previews/reset-20261023-090407 em cada projeto (inclui snapshot SQLite consistente, data e projects). O reset inicial deste trabalho está em previews/reset-20261023-084130.

Ambos foram reiniciados com o mesmo Atlas Commerce original, Antigravity real, modelo Flash Low e permissão de leitura. Não há execução em andamento nem histórico de chamadas nos bancos restaurados. As duas features concluídas continuam sendo as duas entregas do próprio exemplo. Evidências e arquivos de código permanecem preservados fora do reset. As cópias temporárias de conferência foram encerradas.

Comparação: http://127.0.0.1:4331/?live=1. SquadCode: http://127.0.0.1:4317/. Luma Hive: http://127.0.0.1:4318/projects. Recarregar as abas abertas após o reset para descartar o estado anterior em memória.
