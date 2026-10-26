# Capturas da jornada do Luma Hive

Imagens utilizadas no [README principal](../../README.md), capturadas em **26/10/2026** com Playwright e Microsoft Edge headless, a partir do build Angular 20 da branch `codex/feature/agent-observability`.

## Origem e método

- Interface real, servida por uma instância temporária separada da instalação principal.
- Cópia consistente do SQLite local, com os projetos Atlas Commerce e Luma Market, documentos, conversas, execuções, checkpoints e memórias existentes. O instantâneo inclui interações posteriores ao recorte de 29 runs do piloto de 25/10; por isso os totais exibidos podem ser diferentes dos números históricos daquele relatório.
- Nenhuma nova execução de LLM para fotografar as telas. Requisições de criação de runs/operações foram bloqueadas no navegador. O relatório confirmou zero tentativas de inferência e nenhum erro JavaScript.
- Configuração de idioma em pt-BR. Preferências de aparência alteradas somente na cópia/navegador de captura; os dois temas e retratos são opções reais da interface.
- Caminhos pessoais presentes no histórico foram anonimizados **na cópia** antes da captura. Textos, resultados, estados e métricas não foram substituídos por uma história simulada.
- Saúde dos conectores reutilizada da leitura da instalação local. Catálogo de modelos e atualização de cotas externas não foram acionados para as capturas. A imagem de consumo mostra o uso local persistido, sem fabricar disponibilidade ou preço.
- Viewport desktop de **1512 × 1000**, escala 1. Imagem 05 captura o bloco da sprint completo; imagem 13 usa **390 × 844**. JPEG com qualidade 89, para manter texto legível sem incluir arquivos PNG muito maiores.
- Revisão do workspace principal e conteúdo JSON idênticos antes/depois. A instância temporária foi encerrada; dados de demonstração não foram gravados no banco principal.

## Índice

| Arquivo                                                          | Estado mostrado                                                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [01-squad-futurista.jpg](01-squad-futurista.jpg)                 | Escritório 3D, equipe lateral, indicadores, perfil e progresso            |
| [02-painel-projetos.jpg](02-painel-projetos.jpg)                 | Projetos, filtros, contadores e conclusão                                 |
| [03-briefing-documentos.jpg](03-briefing-documentos.jpg)         | Briefing e organização dos documentos                                     |
| [04-agent-teams.jpg](04-agent-teams.jpg)                         | Reunião com retratos e histórico de mensagens do projeto                  |
| [05-sprint-entregas.jpg](05-sprint-entregas.jpg)                 | Sprint do website e as quatro entregas aprovadas                          |
| [06-observabilidade.jpg](06-observabilidade.jpg)                 | Execução com consulta real a subagente, falha registrada e linha do tempo |
| [07-consumo-por-entrega.jpg](07-consumo-por-entrega.jpg)         | Agregação do consumo informado pelos CLIs                                 |
| [08-recuperacao-checkpoints.jpg](08-recuperacao-checkpoints.jpg) | Operação encerrada e etapas confirmadas                                   |
| [09-memoria-licoes.jpg](09-memoria-licoes.jpg)                   | Memórias aprovadas, origem e histórico                                    |
| [10-configuracoes-visuais.jpg](10-configuracoes-visuais.jpg)     | Idioma e preferências visuais                                             |
| [11-permissoes-agentes.jpg](11-permissoes-agentes.jpg)           | Políticas dos provedores e ferramentas dos perfis                         |
| [12-squad-pixel.jpg](12-squad-pixel.jpg)                         | Interface, mapa e retratos pixel art                                      |
| [13-squad-mobile.jpg](13-squad-mobile.jpg)                       | Visualização da squad em viewport móvel                                   |

## Atualização das imagens

Use sempre uma instância isolada com cópia de dados demonstrativos, preserve a instalação principal e bloqueie inferências durante a captura. Abra cada estado pela própria interface, aguarde fontes/imagens e confira o enquadramento e a leitura dos textos. Não exponha credenciais, caminhos pessoais ou dados de projetos privados.

Os roteiros e relatórios locais desta captura ficam em `previews/readme-20261026/`, ignorados pelo Git; estas imagens são versionadas para renderizar no GitHub e em novos checkouts. Atribuições dos retratos, mapas e fonte permanecem em [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md).
