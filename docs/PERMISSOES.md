# Permissões e autonomia

Em **Configurações → Permissões e autonomia**, escolha a política de cada provedor e confira as ferramentas dos agentes da operação. Textos em pt-BR/en/es no arquivo central de labels; interface futurista e pixel, incluindo disposição vertical no celular.

## Duas camadas

O perfil salvo do agente define as ferramentas solicitadas ao adaptador. O servidor intersecta as ferramentas recebidas com esse perfil; uma requisição HTTP não pode acrescentar Bash, Edit ou Write por conta própria. Políticas de somente leitura/planejamento retiram ferramentas de alteração e terminal. Consultas recebem a interseção dos perfis do chamador e do colega. A disponibilidade final é determinada pelo adaptador e pelo CLI: não é uma promessa de isolamento uniforme entre provedores.

A política nativa determina as confirmações. Aceitar edições não equivale a liberar terminal. No headless, um pedido que precisa de interação pode ser negado, sem abrir um popup no Luma. O modo auto do Antigravity depende da conta, versão e sandbox; na conta deste aceite o CLI avisou que estava indisponível.

## Antigravity sem confirmações

A opção **Sem confirmações do CLI (avançado)** adiciona `--dangerously-skip-permissions` somente às próximas execuções Antigravity que a solicitarem. Antes de salvar, o usuário confirma o alcance para todo o workspace. O servidor rejeita esse modo se não estiver habilitado na configuração salva. Uma conversa ou execução explicitamente somente leitura não recebe a flag. Salvar a configuração não modifica `~/.gemini/antigravity-cli/settings.json`.

Essa opção autoaprova solicitações nativas. As listas de ferramentas dos perfis continuam nos agentes gerados, mas **Bash pode ler/escrever arquivos e usar rede mesmo sem Edit/Write**. Ferramentas e instruções de escopo não substituem um sandbox do sistema operacional. Use em ambientes confiáveis. Aprovação de planos e entregas pelo operador permanece no fluxo do Luma.

O funcionamento da flag é documentado na [referência oficial do CLI](https://antigravity.google/docs/cli/reference). As regras nativas e sua precedência estão na [documentação de permissões](https://antigravity.google/docs/permissions). A configuração não tenta apagar ou reescrever políticas globais do usuário.

## QA e delegação

No perfil original, SENTINEL dispõe de Read/Glob/Grep: pode analisar artefatos e evidências, mas não executar testes por terminal. Para o aceite nativo, o usuário autorizou Bash temporário e dois comandos exatos. O agente executou ambos; o perfil, o modo de execução e as regras globais foram restaurados depois.

Para QA sem Bash, o fluxo desejado é solicitar uma tarefa a um executor autorizado e revisar suas evidências. Isso exige distinguir **consulta** de **tarefa delegada**: uma consulta atual não amplia permissões. Ainda falta um protocolo de solicitação, autorização, execução na identidade do executor, vínculo de dependência e devolução de evidências. Não implementamos empréstimo implícito de ferramentas.

## Verificação

Integração HTTP com SQLite e processo de replay isolados: negação do modo avançado sem configuração salva, interseção de perfis, parâmetros gerados, execução somente leitura sem flag. Playwright: três idiomas, dois temas, confirmação/cancelamento, filtros de perfil e viewport móvel. O modo avançado não foi ativado com CLI real nem no workspace do usuário; a flag foi conferida em processo de replay. A validação nativa real usou somente os dois comandos especificamente autorizados. Detalhes em [ACEITE-REAL-2026-10-25.md](ACEITE-REAL-2026-10-25.md).
