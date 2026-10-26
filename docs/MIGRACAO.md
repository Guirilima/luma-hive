# Migração da base Squad Code

## Origem e destino

Origem local: `C:\Users\UnGui\Documents\Projects\SquadCode`.

Destino: `C:\Users\UnGui\Documents\Projects\luma-hive`.

O projeto novo tem seu próprio `origin`, apontando para `Guirilima/luma-hive`. O remoto estava vazio na preparação. O Git do terminal não herdou a autenticação do plugin; a pasta local foi preparada com o remoto correto. Não houve commit, push ou alteração do repositório original no GitHub.

A base anterior continua disponível. Seus dados, configurações e pastas de trabalho não foram substituídos. O Luma Hive usa outro banco e outra porta.

## Reimplementação

| Responsabilidade da base                         | Organização nova                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| HTML gerado + `src/app.js` global                | Componentes Angular, serviços e templates por tema                |
| Estado, normalização e regras na interface       | Domínio compartilhado + WorkspaceStore                            |
| Eventos por `data-action` e HTML concatenado     | Bindings Angular, componentes e formulários                       |
| Renderizadores globais dependentes de IDs de DOM | Contrato de mapa, fábrica por chave e ciclo de vida do componente |
| CSS único com regras sobrepostas                 | Tokens de identidade + layout/responsividade                      |
| Servidor monolítico                              | HTTP, armazenamento, processos, catálogos e execução separados    |
| Traduções fixas em texto de UI                   | Dicionários por chave com `pt-BR`, `en`, `es`                     |
| Configurações de CLI com nomes legados           | Provedores explícitos: Codex, Devin, Antigravity                  |
| Build Python/HTML com imagens embutidas          | Build Angular/TypeScript e assets separados                       |

O design, a disposição de salas, os retratos, as imagens do pixel art e o conteúdo do catálogo foram reaproveitados. A lógica da aplicação foi reimplementada em Angular e serviços TypeScript. Após a recuperação de paridade, as construções detalhadas do escritório e da cidade e seus parâmetros visuais foram adaptados a módulos TypeScript, substituindo a primeira cena simplificada. Veja [Recuperação de paridade](PARIDADE.md) para os fluxos recuperados e a conferência realizada.

## Fluxos presentes

- Painel de operações, squads, revisões e atividade.
- Criação/edição de operações, documentação de produto, arquitetura e ADRs.
- Squad Studio com comandante, reconhecedores e operadores.
- Catálogo e estúdio de agentes, especialidades, personalidade, ferramentas, modelos e convenções.
- Galeria de retratos e ícones; guias e subsets salvos na biblioteca.
- Features, sprints, dependências, rotas, instruções por etapa e quadro de status.
- Planejamento pelo comandante, aprovação do plano e execução por etapas.
- Spawn individual, cancelamento, pausa da fila e revisão humana com feedback.
- Chat com agente, coescrita de feature, geração de documento e Agent Teams.
- Handoffs manuais/automáticos, logs, console e histórico de execuções reais.
- SQLite, exportação/importação do workspace, versões e restauração.
- Escritório 3D, cidade 3D, pixel art, circulação de agentes, zoom e navegação do mapa.
- Preferências de idioma, qualidade e visual com chaves estáveis.

O layout conserva a identidade da base, mas os componentes foram reorganizados. Não há dependência de Claude Code para iniciar ou usar a aplicação.

## Importar seu workspace

No Squad Code, exporte o backup JSON em Configurações → Workspace. No Luma Hive, escolha **Importar backup** no primeiro uso ou importe em Configurações → Workspace.

A normalização aceita o formato v2 e grava v3. Mantém agentes, squads, operações, features, sprints, entregas, handoffs, logs, documentos, convenções e os provedores já atribuídos. Converte preferências antigas de visual e os campos de runtime para configurações por provedor. Uma execução marcada como ativa em um backup não é considerada um processo ainda em andamento na nova aplicação.

Backups v2 do workspace não contêm necessariamente todo o histórico SQL de execuções, conversas e mensagens da sala que eram armazenadas separadamente. Esses registros continuam no banco da aplicação original; o importador de workspace não copia automaticamente o banco antigo. Pastas de código das operações também não fazem parte do backup JSON. As novas execuções usam `luma-hive/projects/`.

Para adotar código existente de uma operação, copie a pasta correspondente para `luma-hive/projects/<folder-da-operação>` antes de executar. O campo `folder` fica visível na operação. Não mova a pasta inteira do Squad Code nem reutilize seu banco como se fosse `luma.db`.

## Correções durante a migração

- Canvas 2D e WebGL passam a ter proprietários e ciclos de vida distintos.
- Galeria salva referências locais válidas, além de imagens embutidas de backups.
- Catálogos de modelos são consultados, paginados e separados por provedor.
- Permissões e esforços incompatíveis não são herdados de outro CLI.
- Gravações têm revisão, serialização e preservação de versões anteriores.
- Vagas de concorrência são reservadas antes de preparar processos.
- Execuções interrompidas não permanecem indefinidamente como ativas após reiniciar.
- Links de agentes e dependências são normalizados para evitar ciclos.
- Origens/hosts e sessão local são verificados antes de operações da API.

As validações usaram banco e projetos descartáveis. Nenhuma execução paga de IA foi usada como teste e nenhum banco de produção do Squad Code foi alterado.

## Recuperação posterior de paridade

A recuperação de layout e funcionalidades está registrada em [PARIDADE.md](PARIDADE.md). Nesta recuperação, os testes unitários e os scripts em `tests/` foram mantidos sem execução e sem alterações, conforme solicitado. As validações anteriores desta documentação pertencem à preparação inicial e não certificam as alterações posteriores.
