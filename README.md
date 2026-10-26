# Luma Hive

Workspace local de agentes, reimplementado com **Angular 20 + TypeScript**, **Node.js** e **SQLite**. O design escuro, os retratos, o catálogo de agentes e o mapa pixel art vêm da base local do Squad Code. A aplicação não carrega o `app.js`, o servidor ou os renderizadores antigos.

## Iniciar no Windows

O projeto está em `C:\Users\UnGui\Documents\Projects\luma-hive`.

```powershell
cd C:\Users\UnGui\Documents\Projects\luma-hive
npm.cmd start
```

Abra **http://127.0.0.1:4318**. Encerre com **Ctrl+C**.

As dependências já foram instaladas nesta máquina. Em outro checkout:

```powershell
npm.cmd ci
npm.cmd start
```

Use `npm.cmd` no PowerShell para evitar o bloqueio de `npm.ps1`. Não é necessário mudar a política de execução do Windows.

O comando `npm.cmd start` compila o frontend e o backend antes de abrir o servidor, para evitar carregar um build antigo. Para trabalhar com atualização contínua durante o desenvolvimento:

```powershell
npm.cmd run dev
```

Nesse modo o Angular roda em **http://127.0.0.1:4200**, com atualização automática, e a API em **4318**, por proxy. O start normal serve frontend e API juntos na porta 4318. Isso permite manter o Squad Code antigo na porta 4317.

Requisitos: Node **22.12+ na linha 22** ou **24.x**, npm e Git. Nesta máquina a validação usou Node 24.19.0. A versão principal do Angular permanece em 20; o lockfile fixa as versões instaladas.

## Primeiro uso e banco

Escolha criar uma operação, carregar o exemplo ou importar um backup. O SQLite é criado após essa escolha em **`data/luma.db`**. Os arquivos `luma.db-wal` e `luma.db-shm` são auxiliares do SQLite e podem aparecer durante o uso.

O banco fica dentro do processo Node; não exige Docker nem serviço de banco separado. A pasta **`projects/`** contém as pastas de trabalho das operações executadas pelos CLIs. Cada operação recebe um repositório Git local próprio, sem commits automáticos.

Uma operação criada do zero começa em **Demonstração**. O exemplo Atlas Commerce preserva a configuração da referência; confira o modo em **Configurações → Execução** antes de iniciar uma operação. A execução real exige a aprovação do plano e uma conexão válida do provedor. Os logins continuam sendo feitos nos próprios CLIs. A conexão do plugin GitHub não autentica esses CLIs nem o Git do terminal.

Antes de executar uma operação, preencha briefing, visão, escopos, glossário, arquitetura e ADR. O plano precisa de aprovação; a conclusão de uma feature precisa de revisão humana. Demonstrações não representam código, testes ou entregas reais.

## Idiomas e mapas

- Idiomas: `pt-BR`, `en` e `es`, selecionáveis nas configurações.
- Mapas: `office-3d`, `office-pixel` e `city-3d`, selecionáveis na aba Squad.
- Preferências ficam no workspace SQLite e são recuperadas no próximo acesso.
- Textos do projeto, prompts, personalidade e convenções são conteúdo editável; não são traduzidos automaticamente.
- A animação de circulação dos agentes é uma representação visual. Os estados de execução vêm da execução real ou da demonstração identificada.

O pixel art usa a arte da POC com os treze departamentos e trajetos por portas/corredores. O escritório 3D recupera a câmera ortográfica, o mobiliário detalhado, as janelas, o piso, as divisórias de vidro, os cartões e a War Room da base. A cidade recupera ruas, prédios, parques, litoral e planeta. Cada renderizador tem sua geometria; alternar a vista mantém os mesmos agentes, squads, features e dados.

## Integrações

Codex, Devin e Antigravity têm adaptadores separados. Cada um usa seu catálogo real de modelos, sem uma lista fixa de Sol/Luna. O modo, o intervalo entre etapas, o tempo limite e a concorrência são compartilhados; executável, modelo, esforço e permissões pertencem ao provedor. Agentes podem herdar o padrão do CLI ou ter um modelo próprio.

Codex usa `codex exec --json` e consulta modelos por `app-server`. Devin usa `devin -p` com arquivo de prompt e o catálogo JSON do CLI. Antigravity usa `agy` com entrada/saída estruturada e perfis de agentes. Diferenças de permissões e ferramentas ficam nos adaptadores, em vez de herdar parâmetros incompatíveis de outro CLI.

Os testes automatizados das execuções usam um CLI simulado, sem chamadas pagas. A interface permite testar a instalação real e consultar modelos. Para verificar uma execução real de ponta a ponta, configure o login e rode uma operação de teste com o provedor escolhido.

## Acompanhamento e continuidade

O header oferece a central **Precisa de você**, com perguntas, aprovações, revisões e bloqueios. As abas **Recuperação** e **Memória** mostram checkpoints de execução e decisões aprovadas do projeto. Essas áreas estão disponíveis nos três idiomas e nos temas futurista e pixel.

Sprints em modo real continuam no servidor quando o navegador é fechado. Após queda do servidor, etapas incertas exigem revisão e autorização antes de repetir; entregas continuam dependendo de aprovação humana. Somente memórias aprovadas entram no contexto das próximas chamadas.

Veja [Pendências, recuperação e memória](docs/WORKFLOW.md) para uso, persistência e limites de backup, e [Observabilidade](docs/OBSERVABILIDADE.md) para árvores de agentes, eventos e consumo informado pelos CLIs.

## Organização

| Pasta                       | Responsabilidade                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `apps/web/src/app/core`     | API, estado do workspace, idiomas, provedores, execução e diálogos                                                 |
| `apps/web/src/app/features` | Telas organizadas por tema: projetos, agentes, squads, documentos, features, mapas, chats, console e configurações |
| `apps/web/src/app/shared`   | Elementos visuais reutilizáveis, como ícones e modal acessível                                                     |
| `apps/web/src/styles`       | Tokens do design e regras de layout/responsividade                                                                 |
| `apps/web/public/assets`    | Retratos, logotipo e imagens do pixel art                                                                          |
| `apps/api/src/http`         | Servidor HTTP, validação de origem e sessão local                                                                  |
| `apps/api/src/storage`      | Workspace, versões, execuções e eventos em SQLite                                                                  |
| `apps/api/src/providers`    | Execução de processos, catálogos e adaptação dos três CLIs                                                         |
| `apps/api/src/runs`         | Ciclo de vida das execuções, limites, cancelamento e SSE                                                           |
| `packages/domain/src`       | Contratos, catálogos, regras e migração compartilhados pelo frontend e backend                                     |
| `scripts`                   | Inicialização e desenvolvimento                                                                                    |
| `tests`                     | Testes de regras, SQLite, HTTP, adaptadores e navegação                                                            |
| `docs`                      | Arquitetura e migração                                                                                             |

Veja [Arquitetura](docs/ARQUITETURA.md), [Migração](docs/MIGRACAO.md), [Recuperação de paridade](docs/PARIDADE.md) e [Origem dos recursos](THIRD_PARTY_NOTICES.md).

## Verificar

Na recuperação de paridade, os testes em `tests/` não foram executados nem modificados, conforme solicitado; ficam para a última etapa. A compilação e a conferência pela interface estão descritas em `docs/PARIDADE.md`. Os comandos abaixo continuam disponíveis para a etapa de testes posterior.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run format:check
npm.cmd run test:ui
```

O teste de interface abre um navegador headless com perfil separado, inicia uma API em uma porta livre, usa um banco temporário e CLIs simulados, e encerra a instância ao terminar. No Windows usa o Edge instalado. Pode-se escolher outro canal pelo `LUMA_TEST_BROWSER`. Capturas ficam em `previews/screenshots/`, fora do Git.

`data/`, `projects/`, `previews/`, `.env` e `node_modules/` são ignorados pelo Git. Faça backups do workspace pela interface. Para copiar o banco diretamente, encerre a aplicação antes da cópia.

Não houve commit nem push durante a preparação desta base.

## Recuperação de paridade

A conferência desta recuperação está descrita em [docs/PARIDADE.md](docs/PARIDADE.md). Os cenários de navegador usam dois bancos isolados e o mesmo exemplo Atlas Commerce, com F00 e F01 concluídas. Scripts de conferência, capturas e backups locais ficam em `previews/recovery-20261014/`, ignorados pelo Git. Os testes unitários em `tests/` permanecem para a etapa final.

## Aceite real e permissões

Relatório do piloto com Antigravity e website de três telas: [docs/ACEITE-REAL-2026-10-25.md](docs/ACEITE-REAL-2026-10-25.md). Seleção de autonomia e limites dos perfis: [docs/PERMISSOES.md](docs/PERMISSOES.md).
