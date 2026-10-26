# Pendências, recuperação e memória do projeto

As três áreas usam o mesmo arquivo de labels (`apps/web/src/app/core/i18n/labels.ts`) em pt-BR, inglês e espanhol e os temas de interface futurista e pixel. O tema da interface é independente da escolha do renderizador do mapa.

## Precisa de você — `/attention`

O botão no header mostra a quantidade de pendências. A tela reúne perguntas estruturadas sem resposta, planos aguardando aprovação, entregas em revisão, dependências bloqueadas, execuções interrompidas, falhas/permissões negadas e propostas de memória.

Cada cartão abre sua origem: chat, plano, revisão, recuperação, observabilidade ou memória. Opções de navegação de um chat não são tratadas como perguntas. O reconhecimento de uma falha avulsa fica persistido separadamente; ele não apaga o log, não resolve a causa e não muda permissões. Problemas de uma operação coordenada são resolvidos pela recuperação, sem serem ocultados por um reconhecimento genérico.

Os avisos de perguntas dependem de o fluxo emitir opções estruturadas de resposta. Uma pergunta livre em texto, sem esse sinal, não é classificada automaticamente por outra chamada de LLM.

## Recuperação — `/recovery`

Após aprovação do plano em modo real, a coordenação das etapas passa ao servidor Node. O navegador acompanha o estado persistido e pode ser fechado: o servidor e o CLI precisam continuar ligados. O modo Demonstração mantém seu fluxo anterior no navegador.

- Cada etapa tem checkpoint e histórico de tentativas, vinculados à execução real e aos seus eventos.
- A confirmação da saída, o avanço da feature e o checkpoint são gravados na mesma transação SQLite. O `runId` impede duplicar uma saída já registrada.
- A pausa aguarda o término da etapa atual e impede iniciar a seguinte. Retomar executa somente etapas pendentes. Handoffs e avisos de coordenação continuam no chat e no histórico do projeto.
- Uma entrega terminada vai para revisão humana. Dependências não são liberadas antes dessa aprovação.
- Ao reiniciar o servidor, uma saída concluída e persistida pode ser reconciliada. Trabalho sem confirmação fica **incerto**, e a operação aguarda decisão do operador. Não há repetição automática nem nova chamada paga por causa do reinício.
- Antes de repetir uma etapa incerta ou falha, confira arquivos e efeitos da tentativa anterior. A tela exige reconhecimento explícito e prepara a tentativa em pausa; o operador ainda precisa retomar. A API rejeita tentativa enquanto o processo anterior identificado continuar ativo.
- Cancelar preserva o que foi confirmado. Se havia trabalho em andamento, ele continua assinalado como incerto até revisão. Não há rollback automático de arquivos alterados pelo CLI.

O plano oferecido para aprovação também é salvo antes de o botão ficar disponível. Recarregar permite encontrá-lo novamente pela central de pendências.

Esta recuperação cobre **etapas de sprints coordenadas**. O histórico de chamadas avulsas, reuniões e conversas continua disponível, mas não equivale a uma retomada automática de toda conversa ou processo CLI. O sistema não aumenta permissões, autentica contas nem corrige ferramentas negadas automaticamente.

## Memória — `/memory`

A memória organiza decisões, restrições e aprendizados por projeto. Um registro pode nascer manualmente, de um ADR, de uma execução ou de uma mensagem do próprio projeto. A origem e um trecho daquele conteúdo ficam preservados junto com datas e versões. A revisão de entregas também permite propor memória a partir de uma saída real.

1. Criar gera uma **proposta**, sem participação nos prompts.
2. Aprovar é uma ação humana explícita. Somente registros aprovados entram no contexto de chamadas futuras daquele projeto, inclusive perfis de colegas preparados para consultas.
3. Editar retira a aprovação e gera nova versão proposta. O contexto anterior já enviado a uma execução em andamento não pode ser retirado; a próxima chamada usa o estado aprovado mais recente.
4. Arquivar retira o registro das próximas chamadas e preserva seu histórico.

A API valida que a fonte pertence ao projeto e rejeita edições com versão desatualizada. Há limite de 500 registros por projeto e orçamento total de 24 mil caracteres de contexto aprovado; exceder o orçamento exige reduzir/arquivar conteúdo, sem omitir restrições silenciosamente. A atribuição é ao operador local (`local-user`), pois o workspace não tem autenticação multiusuário.

## Persistência e backup

A migração SQLite é aditiva (versão 2): adiciona `operations`, `memories` e `attention_acks`, preservando workspace, execuções e eventos existentes. Os campos opcionais de associação em runs/handoffs mantêm compatibilidade com históricos anteriores.

Essas tabelas **não fazem parte do JSON de exportação do workspace**. A tela de memória possui exportação JSON própria para consulta/portabilidade; ainda não existe importação dedicada desse arquivo. Para um backup completo de memória, operações, reconhecimentos, workspace e logs, faça backup consistente do SQLite, ou encerre a aplicação antes de copiar `data/luma.db`. Os diretórios `projects/` devem ser preservados separadamente, pois contêm arquivos de trabalho dos CLIs.

## Organização do código

- `packages/domain/src/workflow.ts`: contratos de pendências, memória, operações e checkpoints; detecção compartilhada de perguntas estruturadas.
- `packages/domain/src/stage-prompts.ts`: os prompts das etapas, compartilhados pelo servidor e pelo fluxo de demonstração.
- `apps/api/src/workflow/`: projeção de pendências, coordenação durável, validação e contexto de memória.
- `apps/web/src/app/core/workflow/`: sincronização com as operações persistidas e a central.
- `apps/web/src/app/features/workflow/`: telas Angular e estilos compatíveis com os dois temas.

## Validação desta entrega

Compilação Angular/API e integrações HTTP/SQLite com CLI controlado, sem inferência paga. Cenários: aprovação, pausa, continuação sem navegador, queda de servidor, processo anterior ainda vivo, revisão de dependências, repetição explícita sem duplicar saídas, origem/versão/aprovação de memória e proteção dos endpoints pela sessão local.

Playwright com Edge verificou criação/edição/aprovação/arquivamento/exportação de memória, abertura da origem das pendências, recuperação, três idiomas e dois temas, incluindo telas pequenas. Scripts, evidências e bancos isolados ficam em `previews/workflow-20261025/`, ignorados pelo Git. Os testes unitários não foram executados nem alterados, conforme solicitado.

## Políticas dos provedores

A separação entre perfil, confirmações nativas e limites de terminal está em [PERMISSOES.md](PERMISSOES.md).
