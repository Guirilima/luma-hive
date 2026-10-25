# Tema de interface Pixel art

Implementado na branch feature/layout-pixel. É uma camada de apresentação do frontend Angular; o visual futurista continua sendo o padrão para quem não tem preferência salva.

## Como usar

Abra Configurações → Workspace → Visual da interface, logo abaixo de Idioma. Escolha Futurista ou Pixel art. A mudança é imediata, reversível e preservada após recarregar o navegador. Abas do mesmo navegador acompanham a seleção.

A escolha é independente do mapa: uma interface pixel pode acompanhar tanto o escritório 3D quanto o mapa pixel existente. A preferência não troca o renderizador, a câmera ou o layout do mapa. O backend, o banco e os contratos de domínio não receberam alterações.

## Direção visual

Painéis azul-escuros, molduras em madeira e ouro, sombras em blocos, botões com relevo discreto, campos de entrada e mensagens com contornos retos. Foi adicionada a fonte Pixelify Sans, servida pelos próprios arquivos da aplicação; o tema não depende de fontes remotas. Trechos de código, comandos e saídas técnicas preservam a fonte monoespaçada para leitura.

Foram tratados cabeçalho, navegação, painel geral, operações, formulários, sprints, quadro de features, editores Markdown, configurações, estúdio do agente, Squad Studio e seletor de agentes, conversas individuais, Agent Teams, sala da operação, confirmações, avisos, console e as duas apresentações de consumo. Efeitos puramente decorativos de holograma/scanline nas janelas e retratos foram retirados no tema pixel. Retratos e imagens existentes foram preservados; não foram redesenhados como sprites.

As abas de editores têm rolagem horizontal no tema pixel quando a largura é pequena. Os estados de seleção, desabilitado, erro, execução e revisão continuam distinguíveis. O conteúdo e os eventos das ações existentes não foram reimplementados.

## Organização e extensão

- apps/web/src/app/core/appearance/appearance.service.ts: registro das chaves futuristic/pixel, leitura da preferência, aplicação em data-interface-theme no documento e sincronização entre abas.
- apps/web/src/app/core/i18n/appearance-messages.ts: textos em pt-BR, inglês e espanhol.
- apps/web/src/styles/themes/pixel.css: ponto de entrada da camada visual.
- pixel.tokens.css: fonte, cores, tipografia e primitivas.
- pixel.workspace.css: navegação, páginas, cartões e botões.
- pixel.dialogs.css: configurações, editores, formulários, catálogos e console.
- pixel.conversations.css: reunião, conversa individual e sala da operação.
- pixel.usage.css: popover e diálogo nativos de consumo.

O tema é selecionado por chave e os seletores são isolados por html[data-interface-theme='pixel']. Para adicionar outro tema, registre sua chave no serviço, acrescente os textos e uma camada CSS própria e amplie a restauração da preferência para reconhecer a nova chave. Evite copiar templates ou alterar condições de execução para trocar a aparência.

A preferência fica somente no armazenamento do navegador, sob a chave luma.interface-theme.v1. Ela não é enviada ao SQLite nem incorporada aos backups de workspace, respeitando o escopo exclusivamente visual. Navegadores com armazenamento bloqueado continuam podendo aplicar o tema durante a sessão.

## Fonte

Pixelify Sans, The Pixelify Sans Project Authors, SIL Open Font License 1.1. [Origem oficial](https://github.com/google/fonts/tree/main/ofl/pixelifysans). A licença e o TTF ficam em apps/web/public/assets/fonts/pixelify-sans/. A atribuição e o hash SHA-256 foram registrados em THIRD_PARTY_NOTICES.md.

## Conferência

A compilação Angular e TypeScript passou. Permanecem os dois avisos anteriores sobre encadeamento opcional. Não foram executados nem modificados testes unitários.

Foram comparados 23 estados de tela nos dois temas, incluindo versões para celular. As assinaturas dos controles visíveis (rótulos, identificadores, estado desabilitado e papéis) permaneceram iguais. Textos de movimento ambiente dos agentes foram normalizados na comparação porque variam ao longo do tempo. A seleção de aparência é, naturalmente, a nova diferença de apresentação.

O relatório principal registra 32 verificações aprovadas, incluindo persistência, sincronização entre abas, reversão, rótulos inglês/espanhol, tratamento de preferência inválida, ausência de gravação de workspace ao mudar tema e manutenção do mesmo canvas/renderizador durante a troca. A conferência final acrescenta 7 verificações aprovadas de fonte local, superfícies de consumo, abas no celular e preservação de um rascunho de agente aberto durante mudança de tema em outra aba. Nenhum erro JavaScript ou chamada inesperada de API foi capturado.

Todas as 241 regras de estilo do tema foram conferidas quanto ao escopo pixel. Backend, execução, contratos e arquivos do mapa foram comparados com o commit base e continuam sem diff. Os cenários usam dados copiados para respostas controladas no navegador; não salvam no banco principal e não acionam LLMs. A lógica de negócio não foi auditada novamente como parte deste trabalho visual.

Evidências locais: previews/pixel-theme-20261025/review.json, final-review.json, scope-review.json e capturas futuristic-/pixel-. A pasta é ignorada pelo Git. Somente a nova versão do Luma recebeu o tema. Não houve commit, push ou reinício dos serviços nesta etapa.
