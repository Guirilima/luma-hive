# Escritório pixel art

Vista alternativa disponível somente na aba **Squad**, pelo botão de quadradinhos nos controles do mapa. Clique novamente para voltar ao escritório 3D. A preferência é salva no workspace.

- `office.png`: cenário derivado da referência fornecida pelo usuário, com 13 departamentos e sem pessoas fixas.
- `agents.png`: atlas transparente 4 × 4; quatro quadros por direção (frente, esquerda, direita, costas).
- `src/pixel-office-layout.js`: salas, especialidades, portas e grafo dos caminhos.
- `src/pixel-office.js`: personagens, navegação, seleção e integração com os eventos da operação existente.

Os agentes usam os dados reais da squad. Passeios ociosos são apenas animação, não representam execução de IA. Cliques e conversas continuam usando o aplicativo existente. As visitas não alteram as mesas ou posições salvas da vista 3D. Os caminhos são pontos de navegação ajustados à ilustração; o cenário é uma imagem 2D, não um editor de móveis ou um novo modelo 3D. A rotação continua disponível na vista original.

Os dois builders (`build.py` e `scripts/dev.mjs`) incorporam os PNGs no HTML para preservar o funcionamento offline, sem um novo serviço de arquivos. Para acompanhar alterações: `npm.cmd run dev`. Os testes do grafo fazem parte de `npm.cmd test`.

## Origem da arte e prompts

Criado com a ferramenta integrada **image_gen**, sem CLI externa. Referência: `Mapa Pixelado do Escritório Squad_Code.png`, fornecida pelo usuário. A primeira edição foi refinada para abrir passagens na fileira inferior; `office.png` é a versão final. Os arquivos originais de geração ficam preservados fora do projeto.

### Cenário

Edit the provided pixel art office image into a production game BACKGROUND asset. Extract ONLY the office floorplan rectangle, excluding ALL top navigation, right task sidebar, bottom portrait/chat UI. Output a wide landscape image approximately 1668 by 650 proportions, filled edge to edge with this EXACT office map. Preserve extremely faithfully the existing pixel art, warm wood, navy/cyan walls, plants, monitors, furniture, room sizes/positions, labels and corridors. Remove EVERY human/agent/person (including heads at chairs) leaving empty chairs: real animated sprites will be added programmatically. Keep these exact 13 room labels and positions from reference: top row LAZER / ENTRADA, ARQUITETURA, REUNIÃO, DOCUMENTAÇÃO, WAR ROOM; middle row DESENVOLVIMENTO, COMANDO, DESIGN, SALA FLEX; bottom row TESTES, REVISÃO, DEVOPS / CLOUD, SUPORTE. Make floor corridors and door openings unobstructed so characters can walk between rooms. No extra UI, no people, no new rooms. Crisp detailed original pixel game art; fixed overhead oblique view, same framing and relative room positions. Do not add border or blank margin.

### Refinamento das portas

Precise small game-map edit. Keep EVERYTHING in this background pixel-art office image identical: all rooms, labels, dimensions, furniture, colors, no people, no UI. Only add four clear open DOOR GAPS through the TOP walls of the four BOTTOM ROW rooms so sprites can walk in from the horizontal hallway above: TESTES doorway at x=210 of image width2009; REVISÃO doorway at x=580; DEVOPS / CLOUD doorway at x=1080; SUPORTE doorway at x=1510. Each opening approx 45px wide, remove wall strip there and connect continuous wooden floor from hall to front room aisle. Keep room signage unchanged. Add unobstructed narrow floor paths from those entrances to the left side of the desks. Preserve fixed overhead view and all other details.

### Personagem animado

Production sprite sheet for a warm detailed pixel-art office RPG. STRICT uniform 4 columns by 4 rows grid, exactly 16 equal 128x128 square cells, sheet square. ONE identical small adult office programmer character in all cells: dark navy trousers, teal jacket, dark short hair, tan skin, clear black pixel outlines and little pixel highlights, chibi 3-head-tall proportions matching classic top-down RPG office. No background at all, true transparent alpha, no text, no grid, no shadow. Each cell character center aligned, feet at same height 110 of 128 and top at 20, generous empty margin. ROW 1 faces DOWN/front: four consecutive walk cycle frames, feet alternate left forward, neutral, right forward, neutral. ROW 2 faces LEFT: same 4 walking frames. ROW 3 faces RIGHT: same 4 walking frames. ROW 4 faces UP/back: same 4 walking frames. Consistent character size and alignment all cells. Sprites never touch other cells. Crisp nearest-neighbor pixel art, discrete pixels, no blur. This is a functional game animation sprite sheet, not a presentation.
