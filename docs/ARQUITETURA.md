# Arquitetura do Luma Hive

## Limites e responsabilidades

O produto é um workspace local. O Angular é responsável pela interface; o Node controla os processos dos CLIs e a persistência. O domínio compartilhado define agentes, squads, projetos, features, documentos e preferências. Não há carregamento dos scripts globais da aplicação antiga.

```text
Angular components
  → WorkspaceStore / ExecutionService / ProviderService
  → ApiService
  → HTTP local + sessão
  → WorkspaceRepository / RunService / CatalogService
  → SQLite ou adaptador do CLI
```

Os componentes são standalone, usam templates externos, Signals e formulários Angular. A aplicação funciona sem Zone.js. As páginas e os renderizadores de mapa são carregados sob demanda. O CSS separa tokens de identidade, regras de telas e a cena/HUD do mapa. A geometria do escritório e da cidade fica em construtores de cena; o contrato e o ciclo de vida continuam no renderizador. As salas e os IDs de postos têm uma fonte comum no domínio.

## Chaves estáveis para idioma e visual

O domínio contém as listas e os tipos de chaves. `defaultSettings()` fornece os padrões, e `normalizeWorkspace()` valida a seleção ao carregar ou importar dados. Chaves desconhecidas voltam para os padrões.

```json
{
  "locale": "pt-BR",
  "layout": "office-3d",
  "motion": true,
  "quality": "high"
}
```

`I18nService` resolve a chave de uma mensagem no dicionário do idioma atual. `TranslatePipe` permite usar a mesma chave em qualquer template. Um teste verifica que os três idiomas possuem o mesmo conjunto de mensagens. Datas usam `Intl` com a preferência selecionada. Conteúdo do usuário e textos produzidos pelos agentes mantêm seu idioma original; o prompt de uma nova execução pede respostas no idioma selecionado.

O registro `RENDERERS` resolve `MapLayout` para uma fábrica. Cada implementação recebe um `MapFrame` com os mesmos agentes e estados e segue o contrato `MapRenderer`: atualizar, redimensionar, navegar, visitar e liberar recursos. O componente Angular possui o canvas e os elementos interativos; o renderizador possui a cena ou a pintura. Trocar de chave destrói a implementação anterior e cria um canvas novo. Isso evita compartilhar um contexto WebGL com um contexto 2D.

As posições do escritório 3D são mesas (`desk`); as da cidade são coordenadas hexagonais (`hex`); as do pixel art são departamentos e nós de circulação. Um visual não converte nem sobrescreve as posições de outro. Dados de salas ficam separados do motor de desenho. `dispose()` cancela animações e libera recursos ao sair da aba.

Para adicionar um idioma, amplie `Locale` e `LOCALES`, adicione um dicionário completo e uma opção de seleção. Para adicionar um mapa, amplie `MapLayout` e `LAYOUTS`, implemente o contrato, registre a fábrica e adicione a opção. Não é necessário alterar os serviços de features ou a execução de IA.

## Estado e gravação

`WorkspaceStore` é o proprietário do estado do frontend. Alterações ocorrem sobre cópias, passam pela normalização e produzem novas referências para os Signals. A gravação é serializada e usa uma revisão (`rev`). Uma alteração feita por outra aba provoca conflito; a interface oferece exportar a cópia local ou recarregar. A aplicação não força uma sobrescrita silenciosa.

SQLite usa WAL e guarda o documento validado do workspace, as últimas trinta versões, as execuções e os eventos. As execuções e eventos têm tabelas próprias, chave estrangeira e índice por operação. O workspace é mantido como um agregado JSON nesta etapa, permitindo importar a base anterior sem transformar o frontend numa coleção de operações SQL. Consultas futuras sobre entidades podem ser extraídas para repositórios específicos e migrações de schema; isso não exige trocar componentes ou mapas.

O arquivo é `data/luma.db`. O schema usa `PRAGMA user_version`. As pastas de trabalho dos agentes são separadas do banco e dos arquivos da aplicação. A restauração de um workspace cria uma versão do estado atual antes de substituí-lo.

## Execução

`ExecutionService` monta e apresenta o plano. A execução percorre as rotas aprovadas, respeita dependências, registra entregas e passagens de bastão e encaminha o resultado para revisão. Setup precisa ser aprovado antes das features que dependem dele. Feedback de rejeição passa a compor o contexto de uma nova execução.

`RunService` valida a operação, reserva a vaga de concorrência antes das etapas assíncronas, prepara o adaptador e inicia o processo. Registra eventos, transmite por SSE, aplica tempo limite e permite cancelar a árvore de processos. Arquivos temporários gerados para a chamada são removidos após o encerramento. A pasta de cada operação recebe um `.git` independente, sem commits automáticos.

O backend conhece o processo ativo e o histórico persistido. Após uma recarga do navegador, uma etapa real pode ser reconectada. Se o processo já terminou, o resultado pode ser recuperado do histórico. Se o servidor foi reiniciado, execuções interrompidas são identificadas e features saem do estado de execução indefinida. O restante de uma rota interrompida requer retomada pela interface.

**A fila de etapas ainda é coordenada pelo frontend.** Esta arquitetura não representa uma fila distribuída ou execução autônoma de uma operação inteira com o navegador fechado. O processo da etapa já iniciada continua no backend; encerrar a aplicação cancela os processos que ela controla. Uma fila durável pode ser introduzida no módulo de execução sem misturar essa responsabilidade com a interface.

Revisão humana continua sendo a decisão de conclusão. Texto de IA ou uma saída de processo com código zero não promove automaticamente uma feature para `done`. A demonstração é identificada em cada entrega e não afirma que código ou testes foram executados.

## Provedores

O contrato de execução e o evento do frontend são comuns. Modelos e argumentos são nativos de cada provedor. Os adaptadores isolam stdin, arquivos de prompt, perfis de colegas, permissões, interpretação de eventos e particularidades de plataformas.

O catálogo de Codex é consultado por JSON-RPC com paginação; os catálogos de Devin e Antigravity são normalizados de seus formatos. O cache tem chave por provedor/executável e atualização explícita. Falhas ficam visíveis; um catálogo não é substituído silenciosamente por uma lista fictícia. A seleção de esforço respeita os metadados retornados.

Modo demo/live, tempo limite, intervalo e concorrência são compartilhados. Caminho, modelo, esforço e permissões são configurações do provedor. O agente pode herdar o CLI ou usar um modelo específico; o modelo global do seu provedor tem precedência. Diretórios adicionais são encaminhados apenas ao adaptador que os suporta.

Os seletores de ferramentas representam as capacidades que o adaptador consegue encaminhar. Codex usa sandbox e controles de ferramentas disponíveis no CLI; não oferece uma equivalência perfeita com listas arbitrárias de permissões de outros provedores. Antigravity usa perfis; Devin usa configurações/perfis próprios. Configurações de uma ferramenta não são reutilizadas como permissões de outra.

## Desenvolvimento e validação

`npm.cmd run dev` executa API e Angular com observação de alterações. `npm.cmd run build` produz arquivos independentes de frontend e backend. O start normal serve o build e a API no mesmo endereço, sem CORS aberto para a rede.

Os testes do domínio verificam invariantes e importação. Os testes de armazenamento verificam conflitos, versões e recuperação. Os testes HTTP verificam sessão, origem, host, processos simulados e persistência. Os testes de adaptadores verificam protocolos e catálogos. O teste de interface usa um banco descartável e valida criação, mapas, modelos, idiomas, formulários, execução em demonstração, revisão e recarga.

Esta base prepara separação de responsabilidades e substituição de implementações. Não foi acrescentado painel de tokens, observabilidade de entregas, integração com outros escritórios ou funções dos repositórios pesquisados. Essas evoluções podem ser discutidas após validar a migração.

## Recuperação dos fluxos da base

`RoomService` mantém mensagens da operação no workspace; `OperationRoomComponent` apresenta o painel acoplado e acompanha o `ExecutionService`. O Agent Teams possui rascunho de documentos e propostas, sem gravá-las como decisões humanas antes de aplicar/salvar. A exportação nativa e ZIP fica no domínio compartilhado. `featureRoute()` concentra os pipelines por escopo e especialistas ausentes. Veja [PARIDADE.md](PARIDADE.md). Os testes permanecem para a última etapa após esta recuperação.
