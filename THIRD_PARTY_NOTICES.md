# Origem dos recursos

O Luma Hive foi preparado a partir da base local de [Squad Code Network](https://github.com/felipeAguiarCode/squad-code-network), de Felipe Aguiar, incluindo as adaptações locais de Codex, Devin, Antigravity e a POC pixel art feitas neste workspace.

Foram reutilizados como recursos e dados: identidade visual do layout, disposição de salas/mesas, retratos, desenhos SVG do catálogo de ícones, textos de especialidades e agentes, personalidades e guias de convenções. As imagens de escritório e sprites pixel art vêm da POC local; as instruções de geração estão em `apps/web/public/assets/pixel-office/README.md`.

O frontend Angular, os serviços, os contratos e a organização do backend foram reimplementados. Para recuperar a fidelidade visual, os algoritmos de construção do escritório e da cidade e os parâmetros de estilo da base local foram portados e adaptados a módulos TypeScript. Isso não altera a origem do código visual, dos recursos e do conteúdo do catálogo. Não há carregamento do aplicativo global antigo.

Angular, Three.js, TypeScript, RxJS, better-sqlite3 e as ferramentas de desenvolvimento mantêm suas respectivas licenças. As versões exatas são registradas em `package-lock.json`; os textos de licença dos pacotes instalados ficam nos próprios pacotes em `node_modules/`.
