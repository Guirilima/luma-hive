# Início de sprint e reinicialização — 22/10/2026

O Luma Hive foi corrigido para seguir a apresentação e o fluxo de planejamento da referência SquadCode. Os dois sistemas foram reinicializados sem workspace, após arquivar os bancos e as pastas das operações.

## Correções

- O comandante apresenta a estratégia em texto e entrega o JSON em um bloco separado. A conversa exibe somente a fala; o objeto técnico fica disponível no console e no cartão de planejamento.
- O stream da conversa só aparece durante a interação correspondente. Uma resposta de planejamento concluída não fica repetida como se o agente ainda estivesse trabalhando.
- O comandante coordena fora da rota. As rotas aceitam apenas especialistas existentes na squad, removem duplicações e preservam a distribuição padrão quando a resposta é inválida.
- O rodapé e o mapa indicam Aprovar plano. O clique registra a aprovação humana e só então inicia os especialistas. Cancelar preserva as features; interromper o planejamento impede que uma resposta tardia reabra o plano.
- Uma feature dependente continua bloqueada enquanto a anterior aguarda revisão humana. A primeira sprint mantém instruções específicas para preparar a base do projeto em F00.
- A resolução do Codex CLI no SquadCode recebeu alternativas de caminho para Windows, incluindo a instalação npm da conta do usuário e o diretório usado pelo aplicativo.

## Conferência

Foram executados sete cenários em cada sistema: estratégia/plano/aprovação/dependências, compatibilidade de JSON, resposta inválida, falha do CLI, cancelamento durante o planejamento, demonstração e setup inicial. As 14 verificações passaram, sem erros JavaScript registrados.

O caso de compatibilidade registra uma limitação da referência: o SquadCode não reconhece a resposta moderna features com IDs e pode mostrar esse objeto no chat. O Luma mantém compatibilidade com esse formato e com plan por codinomes, sem copiar esse defeito. O fluxo principal comparado nos dois usa estratégia seguida do bloco plan original.

As respostas de execução vieram de um processo CLI controlado nas bases isoladas; não foram disparadas entregas reais por IA. A compilação Angular/TypeScript passou. Não foram executados ou corrigidos testes unitários e não houve commit/push.

Capturas do plano aguardando aprovação:

- [SquadCode](../previews/sprint-recovery-20261022/old-advanced-live-plan-awaiting.png)
- [Luma Hive](../previews/sprint-recovery-20261022/new-advanced-live-plan-awaiting.png)

## Estado após o reset

- original: workspace vazio, formulário inicial sem nome, codex-cli 0.161.0, sem erro de detecção. Caminho: C:\Users\UnGui\AppData\Roaming\npm\node_modules\@openai\codex\bin\codex.js.
- angular: workspace vazio, formulário inicial sem nome, codex-cli 0.161.0, sem erro de detecção. Caminho: C:\Users\UnGui\AppData\Roaming\npm\node_modules\@openai\codex\bin\codex.js.

Os bancos e os arquivos gerados das operações foram movidos para backups recuperáveis:

- C:\Users\UnGui\Documents\Projects\SquadCode → C:\Users\UnGui\Documents\Projects\SquadCode\previews\reset-20261022-223521
- C:\Users\UnGui\Documents\Projects\luma-hive → C:\Users\UnGui\Documents\Projects\luma-hive\previews\reset-20261022-223521

Também existem snapshots SQLite consistentes em previews/sprint-recovery-20261022/*-before-reset-final.db. O código e a configuração do Git permaneceram no lugar. Para recuperar dados anteriores, pare os servidores e restaure as pastas data e projects do backup correspondente.

Atualize a página da comparação para descartar o estado antigo dos iframes. Ambos estão ligados e aguardam a escolha de começar do zero, carregar exemplo ou importar backup.

- SquadCode: http://127.0.0.1:4317
- Luma Hive: http://127.0.0.1:4318
- Comparação ao vivo: http://127.0.0.1:4331/?live=1


## Modo padrão das novas operações

O Luma Hive mantém demonstração como padrão. A referência SquadCode usa Codex quando o CLI está disponível. A tentativa de alinhar automaticamente esse padrão à execução real foi bloqueada pela revisão automática por poder gerar custos futuros; a alteração não foi aplicada. A execução real continua disponível por escolha explícita nas configurações.
