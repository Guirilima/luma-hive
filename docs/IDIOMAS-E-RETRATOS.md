# Idiomas, retratos e diagnóstico do CLI

## Traduções

A fonte única é apps/web/src/app/core/i18n/labels.ts. Cada ID estável contém pt-BR, en e es lado a lado. Mantenha o ID ao renomear um texto. LABELS é validado pelo TypeScript contra Locale; LANGUAGE_OPTIONS centraliza os nomes nativos do seletor. messages.ts apenas deriva os índices por idioma.

Use {{ 'action.save' | t }} nos templates e i18n.text('action.save') no código. uiLabel é uma ponte explícita para metadados de catálogos compartilhados, com índice por texto de origem; conteúdo do usuário, nomes, briefing, prompts e mensagens históricas não são traduzidos automaticamente. Novas labels devem usar IDs. Para adicionar outro idioma, amplie também o tipo/lista Locale no domínio, pois o backend valida a preferência do workspace.

A auditoria inclui navegação, configurações, editor, reuniões, projetos, ações, estados, dicas e acessibilidade. O texto incorporado à imagem do mapa permanece parte da arte original.

## Visual dos agentes

Configurações > Workspace > Visual dos agentes, imediatamente abaixo do visual da interface. Original é o padrão; Pixel art usa o catálogo alternativo. A escolha é local ao navegador (luma.agent-appearance.v1), independente da preferência de interface e do renderizador do mapa. Sincroniza abas e aplica sem gravar uma imagem nova no agente. Não há autenticação por usuário neste app; perfis de navegador têm preferências separadas.

PortraitService usa IDs de packages/domain/src/portraits.json. O mesmo ID resolve /assets/portraits/<id>.jpg e /assets/portraits/pixel/<id>.png. A preferência é usada no catálogo, galeria, reuniões, conversas, listas, planos, mapa e editor. Uploads e URLs externas conservam o original. As 52 imagens pixel foram produzidas com imagegen incorporado; PNGs de 256x256, cerca de 2,3 MB no total. Os JPGs originais permanecem intactos. Os filtros monocromáticos anteriores não são aplicados aos PNGs pixel.

## Prompt dos retratos

Modo: ferramenta image_gen incorporada, edição style-transfer, uma geração por retrato. Alvos: os 52 arquivos originais do catálogo, inspecionados antes da edição. IDs e nomes de arquivo foram mantidos.

Prompt base (primeiros quatro retratos: avatar-05adbe1b-e4a8-4d12-872c-c7774c9bcc14, avatar-alpha-ghost, avatar-beast e avatar-bishop):

> Use case: style-transfer. Edit target: the attached existing agent portrait. Create a finished pixel-art RPG dialogue portrait of exactly this same character, keeping face identity, skin tone, hairstyle, headgear, glasses, headset, clothing, facing direction, shoulder framing and recognizable distinctive features. Crisp hand-placed 16-bit pixel clusters, approximately 96x96 logical pixels scaled sharply, rich restrained natural colors, deep navy background, warm highlights and subtle cyan accents matching a pixel-art office game. Readable at 32px and 200px. Square full-bleed portrait, no frame, no text, no scanlines, no blur, no photorealism. Preserve character rather than replacing with a generic avatar.

Prompt base (demais 48 retratos):

> Use case: style-transfer. Edit target: attached agent portrait. Create a finished colorful 16-bit pixel-art RPG dialogue portrait of exactly this character. Preserve identity, apparent skin tone, face shape, hairstyle, headgear, glasses/headset, pose, shoulder framing and distinctive clothing. Crisp pixel clusters at approximately 96x96 logical resolution, sharply upscaled, restrained natural colors, deep navy background, warm highlights and subtle cyan accents matching a pixel-art office game. Square full-bleed head-and-shoulders portrait. No frame, text, scanlines, blur, photorealism or generic replacement face.

## FORGE / ViewFile

A execução run-daade7a2-250b-48d2-9caa-fdcb931d8c11 iniciou na pasta correta: projects/op-001-atlas-commerce. Essa pasta continha apenas .git e .agents. O agente subiu para a pasta do Luma Hive, explorou previews e node_modules e tentou ler o package.json externo. O Antigravity bloqueou a ação. A configuração efetiva estava em read-only: isso não autoriza implementar ou alterar arquivos.

O adaptador agora informa, no prompt e no perfil Antigravity, a raiz absoluta autorizada, o inventário inicial e o comportamento diante de uma operação vazia: relatar setup ausente, sem procurar no aplicativo hospedeiro, backups ou pastas vizinhas. Nenhuma permissão foi ampliada. A interface explica a negação; o console conserva o resultado bruto e as evidências. Esta orientação reduz o desvio do modelo; a proteção efetiva continua sendo a permissão do CLI.

Uma chamada real com gemini-3.8-flash-low leu README.md com view_file dentro de uma pasta isolada, usando read-only. Resultado: LUMA_READ_SCOPE_20261025; sem erro, sem escrita de código. Isso confirma que o mapeamento da ferramenta de leitura funciona. O histórico da falha anterior foi preservado.

## Validação

Build Angular/API aprovado. Revisão Playwright em Edge de 45 estados de tela entre os três idiomas; seletor e quatro combinações de aparência, persistência, sincronização entre abas, preservação de rascunho, galeria e celular. Todos os 52 PNGs responderam HTTP 200 com dimensões 256x256. Auditoria estrutural preservou os 453 eventos existentes (dois novos seletores em relação ao commit base). Testes de navegador usam workspace em memória e interceptam escrita/inferência, sem modificar as operações reais. O workspace foi conferido por SHA-256 antes/depois do reinício do backend. Testes unitários não executados, conforme orientação anterior.

Evidências locais ignoradas pelo Git: previews/appearance-language-20261025/. Nenhum commit ou push nesta etapa.
