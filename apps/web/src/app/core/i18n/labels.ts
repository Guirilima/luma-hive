import { Locale } from '@domain/models';
/** Stable IDs; preserve IDs when renaming labels. */
export const LABELS = {
  'squad.keepAgent': { 'pt-BR': 'Manter', en: 'Keep', es: 'Mantener' },
  'squad.chooseAgent': { 'pt-BR': 'Escolher', en: 'Choose', es: 'Elegir' },
  'squad.newArchitect': {
    'pt-BR': 'Novo especialista de arquitetura',
    en: 'New architecture specialist',
    es: 'Nuevo especialista de arquitectura',
  },
  'filters.byStatus': {
    'pt-BR': 'Filtrar por situação',
    en: 'Filter by status',
    es: 'Filtrar por estado',
  },
  'filters.bySquad': {
    'pt-BR': 'Filtrar por squad',
    en: 'Filter by squad',
    es: 'Filtrar por squad',
  },
  'filters.sort': { 'pt-BR': 'Ordenar projetos', en: 'Sort projects', es: 'Ordenar proyectos' },

  'connectors.available': { 'pt-BR': 'Conectores', en: 'Connectors', es: 'Conectores' },
  'connectors.none': {
    'pt-BR': 'Nenhum CLI detectado. Verifique as configurações.',
    en: 'No CLI detected. Check settings.',
    es: 'No se detectó ningún CLI. Revisa la configuración.',
  },
  'connectors.detectedHint': {
    'pt-BR': 'CLI detectado nesta máquina; não confirma login ou saldo.',
    en: 'CLI detected on this machine; does not confirm sign-in or quota.',
    es: 'CLI detectado en esta máquina; no confirma sesión ni cuota.',
  },
  'connectors.currentAgent': {
    'pt-BR': 'Usado pelo agente atual',
    en: 'Used by the current agent',
    es: 'Usado por el agente actual',
  },
  'squad.coverageQa': { 'pt-BR': 'QA', en: 'QA', es: 'QA' },
  'squad.coverageDocs': { 'pt-BR': 'Docs', en: 'Docs', es: 'Docs' },
  'delivery.unassigned': { 'pt-BR': 'Não atribuído', en: 'Unassigned', es: 'Sin asignar' },
  'delivery.unreported': {
    'pt-BR': 'Não informado — preencher e validar para este projeto.',
    en: 'Not provided — fill in and verify for this project.',
    es: 'No informado — completar y verificar para este proyecto.',
  },
  'delivery.approvedFeatures': {
    'pt-BR': 'Features aprovadas',
    en: 'Approved features',
    es: 'Features aprobadas',
  },
  'delivery.manualNotice': {
    'pt-BR':
      'Rascunho consolidado pelo sistema a partir dos dados do projeto. Nenhum agente documentador foi executado para gerar este guia; revise as instruções antes de usar.',
    en: 'Draft assembled by the system from project data. No documentation agent was run to generate this guide; review the instructions before use.',
    es: 'Borrador compilado por el sistema a partir de los datos del proyecto. No se ejecutó ningún agente de documentación para generar esta guía; revisa las instrucciones antes de usarla.',
  },
  'delivery.installCommands': { 'pt-BR': 'Instalação', en: 'Installation', es: 'Instalación' },
  'delivery.refreshSnapshot': {
    'pt-BR': 'Atualizar rascunho',
    en: 'Update draft',
    es: 'Actualizar borrador',
  },

  'permissions.title': {
    'pt-BR': 'Permissões e autonomia',
    en: 'Permissions and autonomy',
    es: 'Permisos y autonomía',
  },
  'permissions.layers': {
    'pt-BR':
      'O perfil define as ferramentas do agente. A política do CLI define quais ações exigem confirmação.',
    en: 'The profile defines the agent tools. The CLI policy determines which actions require confirmation.',
    es: 'El perfil define las herramientas del agente. La política del CLI determina qué acciones requieren confirmación.',
  },
  'permissions.headless': {
    'pt-BR':
      'Execuções sem terminal interativo não exibem pedidos de aprovação do CLI: uma ação que exige confirmação pode falhar e aparecer em Precisa de você. Aprovação de plano e entrega continua humana.',
    en: 'Non-interactive runs cannot display CLI approval prompts: an action requiring confirmation may fail and appear in Needs you. Plans and deliveries still require human approval.',
    es: 'Las ejecuciones no interactivas no muestran solicitudes de aprobación del CLI: una acción que requiere confirmación puede fallar y aparecer en Te necesitan. Los planes y las entregas siguen requiriendo aprobación humana.',
  },
  'permissions.providerScope': {
    'pt-BR': 'Aplica-se às próximas execuções deste provedor em todos os projetos deste workspace.',
    en: 'Applies to future runs of this provider across all projects in this workspace.',
    es: 'Se aplica a futuras ejecuciones de este proveedor en todos los proyectos de este workspace.',
  },
  'permissions.unattended': {
    'pt-BR': 'Sem confirmações do CLI (avançado)',
    en: 'Without CLI confirmations (advanced)',
    es: 'Sin confirmaciones del CLI (avanzado)',
  },
  'permissions.confirmTitle': {
    'pt-BR': 'Habilitar execução sem confirmações?',
    en: 'Enable execution without confirmations?',
    es: '¿Habilitar ejecución sin confirmaciones?',
  },
  'permissions.confirmAction': {
    'pt-BR': 'Habilitar para próximas execuções',
    en: 'Enable for future runs',
    es: 'Habilitar para futuras ejecuciones',
  },
  'permissions.confirmBody': {
    'pt-BR':
      'Antigravity usará --dangerously-skip-permissions nas próximas execuções. Isso aprova pedidos de ferramentas sem confirmação do CLI, inclusive fora do sandbox. A lista de ferramentas do perfil continua sendo enviada ao CLI, mas Bash pode ler, alterar ou executar recursos do sistema; ela não oferece isolamento do sistema operacional. Use apenas em projetos e comandos confiáveis. Esta opção vale para todo o workspace.',
    en: 'Antigravity will use --dangerously-skip-permissions for future runs. This approves tool requests without CLI confirmation, including outside the sandbox. Profile tool lists are still passed to the CLI, but Bash can read, change or execute system resources; the list provides no operating-system isolation. Use only with trusted projects and commands. This option applies to the entire workspace.',
    es: 'Antigravity usará --dangerously-skip-permissions en futuras ejecuciones. Esto aprueba solicitudes de herramientas sin confirmación del CLI, incluso fuera del sandbox. Las herramientas del perfil se siguen enviando al CLI, pero Bash puede leer, modificar o ejecutar recursos del sistema; la lista no proporciona aislamiento del sistema operativo. Úsalo solo con proyectos y comandos de confianza. Esta opción se aplica a todo el workspace.',
  },
  'permissions.autoAvailability': {
    'pt-BR':
      'O modo auto depende da conta e do sandbox do CLI; pode ser recusado. Aceitar edições não libera automaticamente comandos de terminal.',
    en: 'Auto mode depends on CLI account and sandbox availability; it may be refused. Accepting edits does not automatically authorize terminal commands.',
    es: 'El modo auto depende de la cuenta y del sandbox del CLI; puede rechazarse. Aceptar ediciones no autoriza automáticamente comandos de terminal.',
  },
  'permissions.profiles': {
    'pt-BR': 'Ferramentas dos agentes desta operação',
    en: 'Agent tools for this operation',
    es: 'Herramientas de los agentes de esta operación',
  },
  'permissions.profileHint': {
    'pt-BR':
      'Prévia do perfil após o filtro de somente leitura. Subagentes não recebem ferramentas além do próprio perfil e do agente que os chamou. A disponibilidade final depende do adaptador e do CLI.',
    en: 'Profile preview after the read-only filter. Subagents receive no tools beyond their own profile and the calling agent. Final availability depends on the adapter and CLI.',
    es: 'Vista previa del perfil tras el filtro de solo lectura. Los subagentes no reciben herramientas fuera de su perfil y del agente que los invocó. La disponibilidad final depende del adaptador y del CLI.',
  },
  'permissions.noTools': {
    'pt-BR': 'Nenhuma ferramenta nesta política',
    en: 'No tools under this policy',
    es: 'Sin herramientas con esta política',
  },
  'permissions.editProfile': { 'pt-BR': 'Editar perfil', en: 'Edit profile', es: 'Editar perfil' },
  'permissions.terminalBoundary': {
    'pt-BR':
      'Ferramentas e sandbox são camadas distintas. Bash pode alcançar arquivos e rede mesmo sem Edit/Write. Codex aplica o sandbox escolhido; os controles de ferramentas de cada provedor podem diferir. Uma instrução no prompt não é uma barreira de segurança.',
    en: 'Tools and sandboxing are separate layers. Bash may access files and network even without Edit/Write. Codex applies the selected sandbox; provider tool controls may differ. A prompt instruction is not a security boundary.',
    es: 'Las herramientas y el sandbox son capas distintas. Bash puede acceder a archivos y red incluso sin Edit/Write. Codex aplica el sandbox seleccionado; los controles de herramientas varían por proveedor. Una instrucción en el prompt no es una barrera de seguridad.',
  },
  'permissions.localOnly': {
    'pt-BR':
      'Salvar aqui altera somente a política do Luma Hive. Não modifica regras globais do CLI.',
    en: 'Saving here only changes the Luma Hive policy. It does not modify global CLI rules.',
    es: 'Guardar aquí solo cambia la política de Luma Hive. No modifica reglas globales del CLI.',
  },
  'permissions.notEnabled': {
    'pt-BR': 'Execução sem confirmações não foi habilitada nas configurações do workspace.',
    en: 'Execution without confirmations has not been enabled in workspace settings.',
    es: 'La ejecución sin confirmaciones no está habilitada en la configuración del workspace.',
  },

  'help.navigation': {
    'pt-BR': 'Alternar páginas',
    en: 'Switch pages',
    es: 'Cambiar páginas',
  },
  'run.missing': {
    'pt-BR': 'Faltam especialistas na squad',
    en: 'Missing squad specialists',
    es: 'Faltan especialistas en la squad',
  },
  'life.meeting': {
    'pt-BR': 'REUNIÃO',
    en: 'MEETING',
    es: 'REUNIÓN',
  },
  'life.visit': {
    'pt-BR': 'CONVERSA',
    en: 'CONVERSATION',
    es: 'CONVERSACIÓN',
  },
  'life.call': {
    'pt-BR': 'EM CALL',
    en: 'ON CALL',
    es: 'EN LLAMADA',
  },
  'life.pause': {
    'pt-BR': 'PAUSA',
    en: 'BREAK',
    es: 'PAUSA',
  },
  'project.export': {
    'pt-BR': 'Exportar operação / ZIP',
    en: 'Export operation / ZIP',
    es: 'Exportar operación / ZIP',
  },
  'squad.recognizers': {
    'pt-BR': 'Inteligência',
    en: 'Intelligence',
    es: 'Inteligencia',
  },
  'squad.pickAgent': {
    'pt-BR': 'Selecionar agente',
    en: 'Select agent',
    es: 'Seleccionar agente',
  },
  'library.delete': {
    'pt-BR': 'Excluir este item da biblioteca?',
    en: 'Delete this library entry?',
    es: '¿Eliminar este elemento de la biblioteca?',
  },
  'agent.rollName': {
    'pt-BR': 'Sortear codinome',
    en: 'Pick codename',
    es: 'Elegir nombre',
  },
  'chat.status': {
    'pt-BR': 'Status da operação',
    en: 'Operation status',
    es: 'Estado de operación',
  },
  'chat.assigned': {
    'pt-BR': 'Minhas atribuições',
    en: 'My assignments',
    es: 'Mis asignaciones',
  },
  'meeting.leave': {
    'pt-BR': 'Sair',
    en: 'Leave',
    es: 'Salir',
  },
  'meeting.unsaved': {
    'pt-BR': 'Há documentos ou propostas sem salvar.',
    en: 'There are unsaved documents or proposals.',
    es: 'Hay documentos o propuestas sin guardar.',
  },
  'meeting.saveLeave': {
    'pt-BR': 'Salvar e sair',
    en: 'Save and leave',
    es: 'Guardar y salir',
  },
  'meeting.discard': {
    'pt-BR': 'Sair sem salvar',
    en: 'Leave without saving',
    es: 'Salir sin guardar',
  },
  'meeting.gallery': {
    'pt-BR': 'Voltar à galeria',
    en: 'Back to gallery',
    es: 'Volver a la galería',
  },
  'meeting.invite': {
    'pt-BR': 'Convidar agente da squad',
    en: 'Invite squad agent',
    es: 'Invitar agente de la squad',
  },
  'markdown.preview': {
    'pt-BR': 'Prévia',
    en: 'Preview',
    es: 'Vista previa',
  },
  'markdown.undo': {
    'pt-BR': 'Desfazer proposta',
    en: 'Undo proposal',
    es: 'Deshacer propuesta',
  },
  'room.minimize': {
    'pt-BR': 'Minimizar',
    en: 'Minimize',
    es: 'Minimizar',
  },
  'room.you': {
    'pt-BR': 'VOCÊ',
    en: 'YOU',
    es: 'TÚ',
  },
  'room.empty': {
    'pt-BR': 'As mensagens, planos, entregas e handoffs desta operação aparecerão aqui.',
    en: 'Messages, plans, deliveries and handoffs for this operation appear here.',
    es: 'Los mensajes, planes, entregas y handoffs de esta operación aparecerán aquí.',
  },
  'room.message': {
    'pt-BR': 'Mensagem · use @NOME para chamar um agente',
    en: 'Message · use @NAME to address an agent',
    es: 'Mensaje · usa @NOMBRE para llamar a un agente',
  },
  'office.command': {
    'pt-BR': 'Sala de Comando',
    en: 'Command Room',
    es: 'Sala de Mando',
  },
  'office.architecture': {
    'pt-BR': 'Reconhecimento',
    en: 'Reconnaissance',
    es: 'Reconocimiento',
  },
  'office.meeting': {
    'pt-BR': 'Sala de Reunião',
    en: 'Meeting Room',
    es: 'Sala de Reunión',
  },
  'office.flex': {
    'pt-BR': 'Open Space B',
    en: 'Open Space B',
    es: 'Open Space B',
  },
  'office.development': {
    'pt-BR': 'Open Space A',
    en: 'Open Space A',
    es: 'Open Space A',
  },
  'office.testing': {
    'pt-BR': 'Lab',
    en: 'Lab',
    es: 'Laboratorio',
  },
  'office.design': {
    'pt-BR': 'Open Space C',
    en: 'Open Space C',
    es: 'Open Space C',
  },
  'office.war': {
    'pt-BR': 'War Room',
    en: 'War Room',
    es: 'War Room',
  },
  'map.occupied': {
    'pt-BR': 'Escolha um posto livre para deslocar o agente.',
    en: 'Choose a free workstation to move the agent.',
    es: 'Elige un puesto libre para mover al agente.',
  },
  'map.move': {
    'pt-BR': 'Deslocar',
    en: 'Move',
    es: 'Mover',
  },
  'map.moveHint': {
    'pt-BR': 'Clique em um posto livre · Esc para cancelar',
    en: 'Click a free workstation · Esc to cancel',
    es: 'Haz clic en un puesto libre · Esc para cancelar',
  },
  'map.focusAgent': {
    'pt-BR': 'Localizar no mapa',
    en: 'Locate on map',
    es: 'Localizar en mapa',
  },
  'map.mission': {
    'pt-BR': 'Próxima atribuição',
    en: 'Next assignment',
    es: 'Próxima asignación',
  },
  'room.title': {
    'pt-BR': 'Chat da operação',
    en: 'Operation chat',
    es: 'Chat de operación',
  },
  'meeting.title': {
    'pt-BR': 'AGENT TEAMS',
    en: 'AGENT TEAMS',
    es: 'AGENT TEAMS',
  },
  'meeting.target': {
    'pt-BR': 'Participantes',
    en: 'Participants',
    es: 'Participantes',
  },
  'meeting.all': {
    'pt-BR': 'Comandante + PRD + ADR',
    en: 'Commander + PRD + ADR',
    es: 'Comandante + PRD + ADR',
  },
  'meeting.proposal': {
    'pt-BR': 'Proposta para os documentos',
    en: 'Document proposal',
    es: 'Propuesta de documentos',
  },
  'run.individual': {
    'pt-BR': 'Spawn individual',
    en: 'Individual spawn',
    es: 'Ejecución individual',
  },
  'library.save': {
    'pt-BR': 'Salvar na biblioteca',
    en: 'Save to library',
    es: 'Guardar en biblioteca',
  },
  'library.title': {
    'pt-BR': 'Biblioteca de convenções',
    en: 'Conventions library',
    es: 'Biblioteca de convenciones',
  },
  'nav.dashboard': {
    'pt-BR': 'PAINEL',
    en: 'DASHBOARD',
    es: 'PANEL',
  },
  'nav.projects': {
    'pt-BR': 'PROJETOS',
    en: 'PROJECTS',
    es: 'PROYECTOS',
  },
  'nav.squad': {
    'pt-BR': 'SQUAD',
    en: 'SQUAD',
    es: 'EQUIPO',
  },
  'nav.handoffs': {
    'pt-BR': 'HANDOFFS',
    en: 'HANDOFFS',
    es: 'TRASPASOS',
  },
  'app.subtitle': {
    'pt-BR': 'REDE DE DESENVOLVIMENTO',
    en: 'DEVELOPMENT NETWORK',
    es: 'RED DE DESARROLLO',
  },
  'app.loading': {
    'pt-BR': 'Carregando workspace…',
    en: 'Loading workspace…',
    es: 'Cargando espacio de trabajo…',
  },
  'app.settings': {
    'pt-BR': 'Configurações',
    en: 'Settings',
    es: 'Configuración',
  },
  'app.local': {
    'pt-BR': 'Local · SQLite',
    en: 'Local · SQLite',
    es: 'Local · SQLite',
  },
  'app.empty': {
    'pt-BR': 'Nenhum registro ainda.',
    en: 'No records yet.',
    es: 'Todavía no hay registros.',
  },
  'action.save': {
    'pt-BR': 'Salvar',
    en: 'Save',
    es: 'Guardar',
  },
  'action.cancel': {
    'pt-BR': 'Cancelar',
    en: 'Cancel',
    es: 'Cancelar',
  },
  'action.close': {
    'pt-BR': 'Fechar',
    en: 'Close',
    es: 'Cerrar',
  },
  'action.delete': {
    'pt-BR': 'Excluir',
    en: 'Delete',
    es: 'Eliminar',
  },
  'action.edit': {
    'pt-BR': 'Editar',
    en: 'Edit',
    es: 'Editar',
  },
  'action.new': {
    'pt-BR': 'Novo',
    en: 'New',
    es: 'Nuevo',
  },
  'action.open': {
    'pt-BR': 'Abrir',
    en: 'Open',
    es: 'Abrir',
  },
  'action.back': {
    'pt-BR': 'Voltar',
    en: 'Back',
    es: 'Volver',
  },
  'action.refresh': {
    'pt-BR': 'Atualizar',
    en: 'Refresh',
    es: 'Actualizar',
  },
  'action.export': {
    'pt-BR': 'Exportar',
    en: 'Export',
    es: 'Exportar',
  },
  'action.import': {
    'pt-BR': 'Importar',
    en: 'Import',
    es: 'Importar',
  },
  'action.restore': {
    'pt-BR': 'Restaurar',
    en: 'Restore',
    es: 'Restaurar',
  },
  'action.search': {
    'pt-BR': 'Buscar',
    en: 'Search',
    es: 'Buscar',
  },
  'action.approve': {
    'pt-BR': 'Aprovar',
    en: 'Approve',
    es: 'Aprobar',
  },
  'action.reject': {
    'pt-BR': 'Solicitar ajustes',
    en: 'Request changes',
    es: 'Solicitar cambios',
  },
  'action.confirm': {
    'pt-BR': 'Confirmar',
    en: 'Confirm',
    es: 'Confirmar',
  },
  'action.add': {
    'pt-BR': 'Adicionar',
    en: 'Add',
    es: 'Añadir',
  },
  'action.remove': {
    'pt-BR': 'Remover',
    en: 'Remove',
    es: 'Quitar',
  },
  'setup.first': {
    'pt-BR': 'PRIMEIRA EXECUÇÃO',
    en: 'FIRST RUN',
    es: 'PRIMER INICIO',
  },
  'setup.title': {
    'pt-BR': 'SEU WORKSPACE',
    en: 'YOUR WORKSPACE',
    es: 'TU ESPACIO DE TRABAJO',
  },
  'setup.description': {
    'pt-BR':
      'Crie um workspace ou importe um backup. O banco SQLite será criado somente depois da sua escolha.',
    en: 'Create a workspace or import a backup. The SQLite database is created only after your choice.',
    es: 'Crea un espacio o importa una copia de seguridad. SQLite se crea después de tu elección.',
  },
  'setup.name': {
    'pt-BR': 'Nome da primeira operação',
    en: 'First operation name',
    es: 'Nombre de la primera operación',
  },
  'setup.start': {
    'pt-BR': 'Começar do zero',
    en: 'Start from scratch',
    es: 'Empezar de cero',
  },
  'setup.example': {
    'pt-BR': 'Carregar exemplo',
    en: 'Load example',
    es: 'Cargar ejemplo',
  },
  'setup.backup': {
    'pt-BR': 'Importar backup',
    en: 'Import backup',
    es: 'Importar copia',
  },
  'setup.path': {
    'pt-BR': 'Local do banco',
    en: 'Database location',
    es: 'Ubicación de la base de datos',
  },
  'dashboard.title': {
    'pt-BR': 'PAINEL',
    en: 'GENERAL',
    es: 'PANEL',
  },
  'dashboard.titleSuffix': {
    'pt-BR': 'GERAL.',
    en: 'PANEL.',
    es: 'GENERAL.',
  },
  'dashboard.subtitle': {
    'pt-BR': 'Squads, entregas e atividade no mesmo workspace.',
    en: 'Squads, deliveries and activity in one workspace.',
    es: 'Equipos, entregas y actividad en un solo espacio.',
  },
  'dashboard.operations': {
    'pt-BR': 'Operações',
    en: 'Operations',
    es: 'Operaciones',
  },
  'dashboard.squads': {
    'pt-BR': 'Squads',
    en: 'Squads',
    es: 'Equipos',
  },
  'dashboard.agents': {
    'pt-BR': 'Agentes',
    en: 'Agents',
    es: 'Agentes',
  },
  'dashboard.review': {
    'pt-BR': 'Aguardam revisão',
    en: 'Awaiting review',
    es: 'Esperan revisión',
  },
  'dashboard.activity': {
    'pt-BR': 'Atividade recente',
    en: 'Recent activity',
    es: 'Actividad reciente',
  },
  'dashboard.deliveries': {
    'pt-BR': 'Entregas',
    en: 'Deliveries',
    es: 'Entregas',
  },
  'dashboard.newOperation': {
    'pt-BR': 'Nova operação',
    en: 'New operation',
    es: 'Nueva operación',
  },
  'dashboard.newOperationHint': {
    'pt-BR': 'Nome do projeto e squad',
    en: 'Project name and squad',
    es: 'Nombre del proyecto y equipo',
  },
  'dashboard.newSquad': {
    'pt-BR': 'Nova squad',
    en: 'New squad',
    es: 'Nuevo equipo',
  },
  'dashboard.active': {
    'pt-BR': 'Em execução',
    en: 'Running',
    es: 'En ejecución',
  },
  'project.name': {
    'pt-BR': 'Nome',
    en: 'Name',
    es: 'Nombre',
  },
  'project.code': {
    'pt-BR': 'Código',
    en: 'Code',
    es: 'Código',
  },
  'project.folder': {
    'pt-BR': 'Pasta da operação',
    en: 'Operation folder',
    es: 'Carpeta de la operación',
  },
  'project.squad': {
    'pt-BR': 'Squad da operação',
    en: 'Operation squad',
    es: 'Equipo de la operación',
  },
  'project.briefing': {
    'pt-BR': 'Briefing',
    en: 'Briefing',
    es: 'Briefing',
  },
  'project.vision': {
    'pt-BR': 'Visão do produto',
    en: 'Product vision',
    es: 'Visión del producto',
  },
  'project.scopeIn': {
    'pt-BR': 'Dentro do escopo',
    en: 'In scope',
    es: 'Dentro del alcance',
  },
  'project.scopeOut': {
    'pt-BR': 'Fora do escopo',
    en: 'Out of scope',
    es: 'Fuera del alcance',
  },
  'project.glossary': {
    'pt-BR': 'Glossário',
    en: 'Glossary',
    es: 'Glosario',
  },
  'project.architecture': {
    'pt-BR': 'Arquitetura',
    en: 'Architecture',
    es: 'Arquitectura',
  },
  'project.documents': {
    'pt-BR': 'Documentos',
    en: 'Documents',
    es: 'Documentos',
  },
  'project.features': {
    'pt-BR': 'Features',
    en: 'Features',
    es: 'Funcionalidades',
  },
  'project.sprints': {
    'pt-BR': 'Sprints',
    en: 'Sprints',
    es: 'Sprints',
  },
  'project.adrs': {
    'pt-BR': 'Decisões de arquitetura',
    en: 'Architecture decisions',
    es: 'Decisiones de arquitectura',
  },
  'project.newAdr': {
    'pt-BR': 'Nova ADR',
    en: 'New ADR',
    es: 'Nueva ADR',
  },
  'project.goal': {
    'pt-BR': 'Objetivo',
    en: 'Goal',
    es: 'Objetivo',
  },
  'project.noSquad': {
    'pt-BR': 'Crie uma squad completa antes de criar uma operação.',
    en: 'Create a complete squad before creating an operation.',
    es: 'Crea un equipo completo antes de crear una operación.',
  },
  'project.deleteConfirm': {
    'pt-BR': 'Excluir esta operação e seus registros do workspace?',
    en: 'Delete this operation and its workspace records?',
    es: '¿Eliminar esta operación y sus registros?',
  },
  'feature.title': {
    'pt-BR': 'Título',
    en: 'Title',
    es: 'Título',
  },
  'feature.description': {
    'pt-BR': 'Descrição',
    en: 'Description',
    es: 'Descripción',
  },
  'feature.criteria': {
    'pt-BR': 'Critérios de aceitação',
    en: 'Acceptance criteria',
    es: 'Criterios de aceptación',
  },
  'feature.tasks': {
    'pt-BR': 'Tarefas',
    en: 'Tasks',
    es: 'Tareas',
  },
  'feature.context': {
    'pt-BR': 'Contexto',
    en: 'Context',
    es: 'Contexto',
  },
  'feature.scope': {
    'pt-BR': 'Especialidade',
    en: 'Specialty',
    es: 'Especialidad',
  },
  'feature.priority': {
    'pt-BR': 'Prioridade',
    en: 'Priority',
    es: 'Prioridad',
  },
  'feature.dependencies': {
    'pt-BR': 'Dependências',
    en: 'Dependencies',
    es: 'Dependencias',
  },
  'feature.route': {
    'pt-BR': 'Rota de agentes',
    en: 'Agent route',
    es: 'Ruta de agentes',
  },
  'feature.briefs': {
    'pt-BR': 'Instruções de cada etapa',
    en: 'Step instructions',
    es: 'Instrucciones por etapa',
  },
  'feature.new': {
    'pt-BR': 'Nova feature',
    en: 'New feature',
    es: 'Nueva funcionalidad',
  },
  'feature.list': {
    'pt-BR': 'Lista',
    en: 'List',
    es: 'Lista',
  },
  'feature.board': {
    'pt-BR': 'Quadro',
    en: 'Board',
    es: 'Tablero',
  },
  'feature.review': {
    'pt-BR': 'Revisar entrega',
    en: 'Review delivery',
    es: 'Revisar entrega',
  },
  'feature.outputs': {
    'pt-BR': 'Entregas da feature',
    en: 'Feature deliveries',
    es: 'Entregas de la funcionalidad',
  },
  'feature.setup': {
    'pt-BR': 'Setup obrigatório',
    en: 'Required setup',
    es: 'Configuración obligatoria',
  },
  'feature.blocked': {
    'pt-BR': 'Dependências ainda não aprovadas',
    en: 'Dependencies are not approved yet',
    es: 'Dependencias pendientes de aprobación',
  },
  'feature.plan': {
    'pt-BR': 'Planejar com comandante',
    en: 'Plan with commander',
    es: 'Planificar con comandante',
  },
  'feature.run': {
    'pt-BR': 'Executar',
    en: 'Run',
    es: 'Ejecutar',
  },
  'feature.runAll': {
    'pt-BR': 'Executar operação',
    en: 'Run operation',
    es: 'Ejecutar operación',
  },
  'feature.runSprint': {
    'pt-BR': 'Executar sprint',
    en: 'Run sprint',
    es: 'Ejecutar sprint',
  },
  'feature.reorder': {
    'pt-BR': 'Mover para cima',
    en: 'Move up',
    es: 'Mover arriba',
  },
  'feature.feedback': {
    'pt-BR': 'Feedback da revisão',
    en: 'Review feedback',
    es: 'Comentarios de revisión',
  },
  'feature.noOutput': {
    'pt-BR': 'Ainda não há entregas.',
    en: 'No deliveries yet.',
    es: 'Todavía no hay entregas.',
  },
  'feature.approval': {
    'pt-BR': 'A revisão humana decide a conclusão.',
    en: 'Human review decides completion.',
    es: 'La revisión humana decide la finalización.',
  },
  'feature.planReview': {
    'pt-BR': 'REVISÃO DO PLANO',
    en: 'PLAN REVIEW',
    es: 'REVISIÓN DEL PLAN',
  },
  'feature.planApprove': {
    'pt-BR': 'Aprovar plano e executar',
    en: 'Approve plan and run',
    es: 'Aprobar plan y ejecutar',
  },
  'feature.planDescription': {
    'pt-BR': 'Confira a ordem dos agentes antes da execução.',
    en: 'Review the agent order before execution.',
    es: 'Revisa el orden de los agentes antes de ejecutar.',
  },
  'feature.step': {
    'pt-BR': 'Etapa',
    en: 'Step',
    es: 'Etapa',
  },
  'status.backlog': {
    'pt-BR': 'A fazer',
    en: 'Backlog',
    es: 'Pendiente',
  },
  'status.blocked': {
    'pt-BR': 'Bloqueada',
    en: 'Blocked',
    es: 'Bloqueada',
  },
  'status.ready': {
    'pt-BR': 'Pronta',
    en: 'Ready',
    es: 'Lista',
  },
  'status.running': {
    'pt-BR': 'Em execução',
    en: 'Running',
    es: 'En ejecución',
  },
  'status.review': {
    'pt-BR': 'Em revisão',
    en: 'In review',
    es: 'En revisión',
  },
  'status.done': {
    'pt-BR': 'Concluída',
    en: 'Done',
    es: 'Completada',
  },
  'agent.name': {
    'pt-BR': 'Codinome',
    en: 'Codename',
    es: 'Nombre clave',
  },
  'agent.role': {
    'pt-BR': 'Especialidade',
    en: 'Specialty',
    es: 'Especialidad',
  },
  'agent.specialty': {
    'pt-BR': 'Título personalizado',
    en: 'Custom title',
    es: 'Título personalizado',
  },
  'agent.description': {
    'pt-BR': 'Descrição',
    en: 'Description',
    es: 'Descripción',
  },
  'agent.model': {
    'pt-BR': 'Modelo',
    en: 'Model',
    es: 'Modelo',
  },
  'agent.effort': {
    'pt-BR': 'Nível de esforço',
    en: 'Reasoning effort',
    es: 'Nivel de esfuerzo',
  },
  'agent.default': {
    'pt-BR': 'Padrão do CLI',
    en: 'CLI default',
    es: 'Predeterminado del CLI',
  },
  'agent.stage': {
    'pt-BR': 'Estágio de produção',
    en: 'Production stage',
    es: 'Etapa de producción',
  },
  'agent.provider': {
    'pt-BR': 'Provedor',
    en: 'Provider',
    es: 'Proveedor',
  },
  'agent.prompt': {
    'pt-BR': 'Instruções do agente',
    en: 'Agent instructions',
    es: 'Instrucciones del agente',
  },
  'agent.tools': {
    'pt-BR': 'Ferramentas',
    en: 'Tools',
    es: 'Herramientas',
  },
  'agent.soul': {
    'pt-BR': 'Personalidade',
    en: 'Personality',
    es: 'Personalidad',
  },
  'agent.hellos': {
    'pt-BR': 'Saudações (uma por linha)',
    en: 'Greetings (one per line)',
    es: 'Saludos (uno por línea)',
  },
  'agent.conventions': {
    'pt-BR': 'Convenções',
    en: 'Conventions',
    es: 'Convenciones',
  },
  'agent.template': {
    'pt-BR': 'Template',
    en: 'Template',
    es: 'Plantilla',
  },
  'agent.subsets': {
    'pt-BR': 'Pacotes adicionais',
    en: 'Additional packs',
    es: 'Paquetes adicionales',
  },
  'agent.photo': {
    'pt-BR': 'Foto',
    en: 'Photo',
    es: 'Foto',
  },
  'agent.icon': {
    'pt-BR': 'Ícone',
    en: 'Icon',
    es: 'Icono',
  },
  'agent.desk': {
    'pt-BR': 'Mesa',
    en: 'Desk',
    es: 'Mesa',
  },
  'agent.reports': {
    'pt-BR': 'Reporta para',
    en: 'Reports to',
    es: 'Reporta a',
  },
  'agent.next': {
    'pt-BR': 'Próximo agente',
    en: 'Next agent',
    es: 'Próximo agente',
  },
  'agent.new': {
    'pt-BR': 'Novo agente',
    en: 'New agent',
    es: 'Nuevo agente',
  },
  'agent.edit': {
    'pt-BR': 'Estúdio do agente',
    en: 'Agent studio',
    es: 'Estudio del agente',
  },
  'agent.chat': {
    'pt-BR': 'Conversar',
    en: 'Chat',
    es: 'Conversar',
  },
  'agent.visit': {
    'pt-BR': 'Visitar sala',
    en: 'Visit room',
    es: 'Visitar sala',
  },
  'agent.available': {
    'pt-BR': 'Disponível',
    en: 'Available',
    es: 'Disponible',
  },
  'agent.walking': {
    'pt-BR': 'Em trânsito',
    en: 'In transit',
    es: 'En tránsito',
  },
  'agent.working': {
    'pt-BR': 'Trabalhando',
    en: 'Working',
    es: 'Trabajando',
  },
  'agent.catalog': {
    'pt-BR': 'Catálogo de agentes',
    en: 'Agent catalog',
    es: 'Catálogo de agentes',
  },
  'agent.addPreset': {
    'pt-BR': 'Adicionar do catálogo',
    en: 'Add from catalog',
    es: 'Añadir del catálogo',
  },
  'agent.export': {
    'pt-BR': 'Exportar agente',
    en: 'Export agent',
    es: 'Exportar agente',
  },
  'agent.identity': {
    'pt-BR': 'Identidade',
    en: 'Identity',
    es: 'Identidad',
  },
  'agent.instructions': {
    'pt-BR': 'Prompt e ferramentas',
    en: 'Prompt and tools',
    es: 'Prompt y herramientas',
  },
  'agent.advanced': {
    'pt-BR': 'Avançado',
    en: 'Advanced',
    es: 'Avanzado',
  },
  'agent.appearance': {
    'pt-BR': 'Aparência',
    en: 'Appearance',
    es: 'Apariencia',
  },
  'agent.defaultPhoto': {
    'pt-BR': 'Foto automática',
    en: 'Automatic photo',
    es: 'Foto automática',
  },
  'agent.reset': {
    'pt-BR': 'Restaurar padrões',
    en: 'Restore defaults',
    es: 'Restaurar valores',
  },
  'agent.deleteConfirm': {
    'pt-BR': 'Excluir este agente? As squads e rotas serão atualizadas.',
    en: 'Delete this agent? Squads and routes will be updated.',
    es: '¿Eliminar este agente? Se actualizarán equipos y rutas.',
  },
  'stage.discovery': {
    'pt-BR': 'Descoberta',
    en: 'Discovery',
    es: 'Descubrimiento',
  },
  'stage.identity': {
    'pt-BR': 'Identidade',
    en: 'Identity',
    es: 'Identidad',
  },
  'stage.prompt': {
    'pt-BR': 'Prompt & ferramentas',
    en: 'Prompt & tools',
    es: 'Prompt y herramientas',
  },
  'stage.validation': {
    'pt-BR': 'Validação',
    en: 'Validation',
    es: 'Validación',
  },
  'stage.ready': {
    'pt-BR': 'Pronto',
    en: 'Ready',
    es: 'Listo',
  },
  'squad.name': {
    'pt-BR': 'Nome da squad',
    en: 'Squad name',
    es: 'Nombre del equipo',
  },
  'squad.commander': {
    'pt-BR': 'Comandante',
    en: 'Commander',
    es: 'Comandante',
  },
  'squad.adr': {
    'pt-BR': 'Reconhecedor ADR',
    en: 'ADR scout',
    es: 'Explorador ADR',
  },
  'squad.prd': {
    'pt-BR': 'Reconhecedor PRD',
    en: 'PRD scout',
    es: 'Explorador PRD',
  },
  'squad.operators': {
    'pt-BR': 'Operadores',
    en: 'Operators',
    es: 'Operadores',
  },
  'squad.incomplete': {
    'pt-BR': 'Squad incompleta',
    en: 'Incomplete squad',
    es: 'Equipo incompleto',
  },
  'squad.studio': {
    'pt-BR': 'SQUAD STUDIO',
    en: 'SQUAD STUDIO',
    es: 'ESTUDIO DEL EQUIPO',
  },
  'squad.addAgent': {
    'pt-BR': 'Adicionar agente',
    en: 'Add agent',
    es: 'Añadir agente',
  },
  'squad.select': {
    'pt-BR': 'Selecione uma squad',
    en: 'Select a squad',
    es: 'Selecciona un equipo',
  },
  'squad.deleteConfirm': {
    'pt-BR': 'Excluir esta squad? Operações vinculadas precisam de outra squad.',
    en: 'Delete this squad? Linked operations need another squad.',
    es: '¿Eliminar este equipo? Las operaciones vinculadas necesitan otro equipo.',
  },
  'map.layout': {
    'pt-BR': 'Visual do mapa',
    en: 'Map appearance',
    es: 'Vista del mapa',
  },
  'map.office3d': {
    'pt-BR': 'Escritório 3D',
    en: '3D office',
    es: 'Oficina 3D',
  },
  'map.pixel': {
    'pt-BR': 'Escritório pixel art',
    en: 'Pixel art office',
    es: 'Oficina pixel art',
  },
  'map.city': {
    'pt-BR': 'Cidade 3D',
    en: '3D city',
    es: 'Ciudad 3D',
  },
  'map.rotate': {
    'pt-BR': 'Girar',
    en: 'Rotate',
    es: 'Girar',
  },
  'map.center': {
    'pt-BR': 'Centralizar',
    en: 'Center',
    es: 'Centrar',
  },
  'map.zoom': {
    'pt-BR': 'Zoom',
    en: 'Zoom',
    es: 'Zoom',
  },
  'map.focus': {
    'pt-BR': 'Ocultar painéis',
    en: 'Hide panels',
    es: 'Ocultar paneles',
  },
  'map.restore': {
    'pt-BR': 'Mostrar painéis',
    en: 'Show panels',
    es: 'Mostrar paneles',
  },
  'map.rooms': {
    'pt-BR': 'Departamentos',
    en: 'Departments',
    es: 'Departamentos',
  },
  'map.note': {
    'pt-BR': 'Clique para selecionar · Duplo clique para conversar · Arraste para navegar',
    en: 'Click to select · Double click to chat · Drag to navigate',
    es: 'Clic para seleccionar · Doble clic para conversar · Arrastra para navegar',
  },
  'map.noWebgl': {
    'pt-BR': 'WebGL indisponível: usando visualização 2D.',
    en: 'WebGL unavailable: using 2D view.',
    es: 'WebGL no disponible: vista 2D.',
  },
  'map.planet': {
    'pt-BR': 'Planeta',
    en: 'Planet',
    es: 'Planeta',
  },
  'map.flat': {
    'pt-BR': 'Cidade plana',
    en: 'Flat city',
    es: 'Ciudad plana',
  },
  'room.lounge': {
    'pt-BR': 'Lazer / Entrada',
    en: 'Lounge / Entrance',
    es: 'Descanso / Entrada',
  },
  'room.architecture': {
    'pt-BR': 'Arquitetura',
    en: 'Architecture',
    es: 'Arquitectura',
  },
  'room.meeting': {
    'pt-BR': 'Reunião',
    en: 'Meeting',
    es: 'Reunión',
  },
  'room.docs': {
    'pt-BR': 'Documentação',
    en: 'Documentation',
    es: 'Documentación',
  },
  'room.war': {
    'pt-BR': 'War Room',
    en: 'War Room',
    es: 'War Room',
  },
  'room.development': {
    'pt-BR': 'Desenvolvimento',
    en: 'Development',
    es: 'Desarrollo',
  },
  'room.command': {
    'pt-BR': 'Comando',
    en: 'Command',
    es: 'Comando',
  },
  'room.design': {
    'pt-BR': 'Design',
    en: 'Design',
    es: 'Diseño',
  },
  'room.flex': {
    'pt-BR': 'Sala Flex',
    en: 'Flex Room',
    es: 'Sala Flex',
  },
  'room.testing': {
    'pt-BR': 'Testes',
    en: 'Testing',
    es: 'Pruebas',
  },
  'room.review': {
    'pt-BR': 'Revisão',
    en: 'Review',
    es: 'Revisión',
  },
  'room.devops': {
    'pt-BR': 'DevOps / Cloud',
    en: 'DevOps / Cloud',
    es: 'DevOps / Cloud',
  },
  'room.support': {
    'pt-BR': 'Suporte',
    en: 'Support',
    es: 'Soporte',
  },
  'settings.title': {
    'pt-BR': 'CONFIGURAÇÕES DO WORKSPACE',
    en: 'WORKSPACE SETTINGS',
    es: 'CONFIGURACIÓN DEL ESPACIO',
  },
  'settings.workspace': {
    'pt-BR': 'Workspace',
    en: 'Workspace',
    es: 'Espacio de trabajo',
  },
  'settings.execution': {
    'pt-BR': 'Execução',
    en: 'Execution',
    es: 'Ejecución',
  },
  'settings.locale': {
    'pt-BR': 'Idioma',
    en: 'Language',
    es: 'Idioma',
  },
  'settings.motion': {
    'pt-BR': 'Animações',
    en: 'Animations',
    es: 'Animaciones',
  },
  'settings.quality': {
    'pt-BR': 'Qualidade gráfica',
    en: 'Graphics quality',
    es: 'Calidad gráfica',
  },
  'settings.mode': {
    'pt-BR': 'Modo de execução',
    en: 'Execution mode',
    es: 'Modo de ejecución',
  },
  'settings.live': {
    'pt-BR': 'Execução real',
    en: 'Live execution',
    es: 'Ejecución real',
  },
  'settings.demo': {
    'pt-BR': 'Demonstração',
    en: 'Demonstration',
    es: 'Demostración',
  },
  'settings.timeout': {
    'pt-BR': 'Tempo limite por etapa (segundos)',
    en: 'Step timeout (seconds)',
    es: 'Tiempo límite por etapa (segundos)',
  },
  'settings.concurrency': {
    'pt-BR': 'Execuções simultâneas',
    en: 'Concurrent runs',
    es: 'Ejecuciones simultáneas',
  },
  'settings.interval': {
    'pt-BR': 'Intervalo entre etapas (ms)',
    en: 'Step interval (ms)',
    es: 'Intervalo entre etapas (ms)',
  },
  'settings.permission': {
    'pt-BR': 'Modo de permissão',
    en: 'Permission mode',
    es: 'Modo de permiso',
  },
  'settings.path': {
    'pt-BR': 'Caminho do executável',
    en: 'Executable path',
    es: 'Ruta del ejecutable',
  },
  'settings.directories': {
    'pt-BR': 'Diretórios adicionais (um por linha, Codex)',
    en: 'Additional directories (one per line, Codex)',
    es: 'Directorios adicionales (uno por línea, Codex)',
  },
  'settings.test': {
    'pt-BR': 'Testar conexão',
    en: 'Test connection',
    es: 'Probar conexión',
  },
  'settings.models': {
    'pt-BR': 'Atualizar modelos',
    en: 'Refresh models',
    es: 'Actualizar modelos',
  },
  'settings.versions': {
    'pt-BR': 'Versões do workspace',
    en: 'Workspace versions',
    es: 'Versiones del espacio',
  },
  'settings.noVersions': {
    'pt-BR': 'Nenhuma versão disponível.',
    en: 'No versions available.',
    es: 'No hay versiones disponibles.',
  },
  'settings.connected': {
    'pt-BR': 'CLI encontrado',
    en: 'CLI found',
    es: 'CLI encontrado',
  },
  'settings.notConnected': {
    'pt-BR': 'CLI indisponível',
    en: 'CLI unavailable',
    es: 'CLI no disponible',
  },
  'settings.shared': {
    'pt-BR':
      'Modo, intervalo, concorrência e tempo limite são compartilhados. Permissões e modelos pertencem a cada provedor.',
    en: 'Mode, interval, concurrency and timeout are shared. Permissions and models belong to each provider.',
    es: 'Modo, intervalo, concurrencia y tiempo límite son compartidos. Los permisos y modelos pertenecen a cada proveedor.',
  },
  'settings.high': {
    'pt-BR': 'Alta',
    en: 'High',
    es: 'Alta',
  },
  'settings.low': {
    'pt-BR': 'Baixa',
    en: 'Low',
    es: 'Baja',
  },
  'settings.restoreConfirm': {
    'pt-BR': 'Restaurar esta versão? A versão atual será preservada no histórico.',
    en: 'Restore this version? The current version will be kept in history.',
    es: '¿Restaurar esta versión? La versión actual se conserva en el historial.',
  },
  'run.pause': {
    'pt-BR': 'Pausar fila',
    en: 'Pause queue',
    es: 'Pausar cola',
  },
  'run.resume': {
    'pt-BR': 'Continuar',
    en: 'Resume',
    es: 'Continuar',
  },
  'run.stop': {
    'pt-BR': 'Encerrar',
    en: 'Stop',
    es: 'Detener',
  },
  'run.console': {
    'pt-BR': 'Console e histórico',
    en: 'Console and history',
    es: 'Consola e historial',
  },
  'run.demo': {
    'pt-BR': 'DEMONSTRAÇÃO · sem execução de IA',
    en: 'DEMONSTRATION · no AI execution',
    es: 'DEMOSTRACIÓN · sin ejecución de IA',
  },
  'run.live': {
    'pt-BR': 'EXECUÇÃO REAL',
    en: 'LIVE EXECUTION',
    es: 'EJECUCIÓN REAL',
  },
  'run.idle': {
    'pt-BR': 'Nenhuma execução ativa',
    en: 'No active run',
    es: 'Sin ejecución activa',
  },
  'run.planning': {
    'pt-BR': 'Planejando…',
    en: 'Planning…',
    es: 'Planificando…',
  },
  'run.sprintStarted': {
    'pt-BR': '{label} iniciada',
    en: '{label} started',
    es: '{label} iniciada',
  },
  'run.featureStarted': {
    'pt-BR': '{label} iniciada individualmente',
    en: '{label} started individually',
    es: '{label} iniciada individualmente',
  },
  'run.planningFeatures': {
    'pt-BR': '{count} feature{plural} para o comandante planejar: {keys}.',
    en: '{count} feature{plural} for the commander to plan: {keys}.',
    es: '{count} feature{plural} para que el comandante planifique: {keys}.',
  },
  'run.error': {
    'pt-BR': 'Execução interrompida',
    en: 'Run interrupted',
    es: 'Ejecución interrumpida',
  },
  'run.waiting': {
    'pt-BR': 'Aguardando revisão',
    en: 'Awaiting review',
    es: 'Esperando revisión',
  },
  'run.history': {
    'pt-BR': 'Histórico de execuções',
    en: 'Run history',
    es: 'Historial de ejecuciones',
  },
  'run.events': {
    'pt-BR': 'Eventos',
    en: 'Events',
    es: 'Eventos',
  },
  'run.replay': {
    'pt-BR': 'Abrir console',
    en: 'Open console',
    es: 'Abrir consola',
  },
  'run.stopConfirm': {
    'pt-BR': 'Encerrar a execução atual?',
    en: 'Stop the current run?',
    es: '¿Detener la ejecución actual?',
  },
  'chat.title': {
    'pt-BR': 'CHAT COM AGENTE',
    en: 'AGENT CHAT',
    es: 'CHAT CON AGENTE',
  },
  'chat.message': {
    'pt-BR': 'Mensagem',
    en: 'Message',
    es: 'Mensaje',
  },
  'chat.send': {
    'pt-BR': 'Enviar',
    en: 'Send',
    es: 'Enviar',
  },
  'chat.clear': {
    'pt-BR': 'Limpar conversa',
    en: 'Clear conversation',
    es: 'Limpiar conversación',
  },
  'chat.history': {
    'pt-BR': 'Histórico da conversa',
    en: 'Conversation history',
    es: 'Historial de conversación',
  },
  'chat.context': {
    'pt-BR': 'Contexto: briefing e documentos da operação atual.',
    en: 'Context: briefing and documents from the current operation.',
    es: 'Contexto: briefing y documentos de la operación actual.',
  },
  'chat.cowrite': {
    'pt-BR': 'Coescrever com agente',
    en: 'Cowrite with agent',
    es: 'Coescribir con agente',
  },
  'chat.generateDoc': {
    'pt-BR': 'Gerar documento',
    en: 'Generate document',
    es: 'Generar documento',
  },
  'chat.apply': {
    'pt-BR': 'Aplicar resposta',
    en: 'Apply response',
    es: 'Aplicar respuesta',
  },
  'chat.meeting': {
    'pt-BR': 'Sala da operação',
    en: 'Operation room',
    es: 'Sala de la operación',
  },
  'handoff.title': {
    'pt-BR': 'PASSAGENS DE BASTÃO',
    en: 'HANDOFFS',
    es: 'TRASPASOS DE TRABAJO',
  },
  'handoff.from': {
    'pt-BR': 'Origem',
    en: 'From',
    es: 'Origen',
  },
  'handoff.to': {
    'pt-BR': 'Destino',
    en: 'To',
    es: 'Destino',
  },
  'handoff.context': {
    'pt-BR': 'Contexto da passagem',
    en: 'Handoff context',
    es: 'Contexto del traspaso',
  },
  'handoff.new': {
    'pt-BR': 'Nova passagem',
    en: 'New handoff',
    es: 'Nuevo traspaso',
  },
  'handoff.manual': {
    'pt-BR': 'Manual',
    en: 'Manual',
    es: 'Manual',
  },
  'handoff.automatic': {
    'pt-BR': 'Automática',
    en: 'Automatic',
    es: 'Automático',
  },
  'handoff.date': {
    'pt-BR': 'Data',
    en: 'Date',
    es: 'Fecha',
  },
  'log.title': {
    'pt-BR': 'Transmissões',
    en: 'Transmissions',
    es: 'Transmisiones',
  },
  'log.filter': {
    'pt-BR': 'Tipo de evento',
    en: 'Event type',
    es: 'Tipo de evento',
  },
  'error.title': {
    'pt-BR': 'Não foi possível concluir',
    en: 'Could not complete',
    es: 'No se pudo completar',
  },
  'error.conflict': {
    'pt-BR': 'Outra aba alterou o workspace. Exporte sua cópia ou recarregue antes de continuar.',
    en: 'Another tab changed the workspace. Export your copy or reload before continuing.',
    es: 'Otra pestaña cambió el espacio. Exporta tu copia o recarga antes de continuar.',
  },
  'error.cycle': {
    'pt-BR': 'As dependências formam um ciclo.',
    en: 'Dependencies contain a cycle.',
    es: 'Las dependencias forman un ciclo.',
  },
  'error.running': {
    'pt-BR': 'Encerre a execução antes de alterar esta configuração.',
    en: 'Stop the run before changing this configuration.',
    es: 'Detén la ejecución antes de cambiar esta configuración.',
  },
  'error.required': {
    'pt-BR': 'Preencha os campos obrigatórios.',
    en: 'Fill in the required fields.',
    es: 'Completa los campos obligatorios.',
  },
  'error.import': {
    'pt-BR': 'Backup inválido.',
    en: 'Invalid backup.',
    es: 'Copia inválida.',
  },
  'error.reload': {
    'pt-BR': 'Recarregar',
    en: 'Reload',
    es: 'Recargar',
  },
  'help.title': {
    'pt-BR': 'ATALHOS',
    en: 'SHORTCUTS',
    es: 'ATAJOS',
  },
  'help.shortcuts': {
    'pt-BR':
      'Q/E: navegar · A: novo agente · B: briefing · F: features · H: painéis · 0: centralizar · +/-: zoom · Esc: fechar',
    en: 'Q/E: navigate · A: new agent · B: briefing · F: features · H: panels · 0: center · +/-: zoom · Esc: close',
    es: 'Q/E: navegar · A: nuevo agente · B: briefing · F: funcionalidades · H: paneles · 0: centrar · +/-: zoom · Esc: cerrar',
  },
  'role.commander': {
    'pt-BR': 'Comandante',
    en: 'Commander',
    es: 'Comandante',
  },
  'role.pm': {
    'pt-BR': 'Gestão de projeto',
    en: 'Project management',
    es: 'Gestión de proyectos',
  },
  'role.po': {
    'pt-BR': 'Produto',
    en: 'Product',
    es: 'Producto',
  },
  'role.architect': {
    'pt-BR': 'Arquitetura',
    en: 'Architecture',
    es: 'Arquitectura',
  },
  'role.backend': {
    'pt-BR': 'Backend',
    en: 'Backend',
    es: 'Backend',
  },
  'role.frontend': {
    'pt-BR': 'Frontend',
    en: 'Frontend',
    es: 'Frontend',
  },
  'role.qa': {
    'pt-BR': 'Qualidade',
    en: 'Quality assurance',
    es: 'Calidad',
  },
  'role.designer': {
    'pt-BR': 'Design / UX',
    en: 'Design / UX',
    es: 'Diseño / UX',
  },
  'role.mobile': {
    'pt-BR': 'Mobile',
    en: 'Mobile',
    es: 'Mobile',
  },
  'role.devops': {
    'pt-BR': 'DevOps',
    en: 'DevOps',
    es: 'DevOps',
  },
  'role.security': {
    'pt-BR': 'Segurança',
    en: 'Security',
    es: 'Seguridad',
  },
  'role.data': {
    'pt-BR': 'Dados',
    en: 'Data',
    es: 'Datos',
  },
  'role.docs': {
    'pt-BR': 'Documentação',
    en: 'Documentation',
    es: 'Documentación',
  },
  'role.dba': {
    'pt-BR': 'Banco de dados',
    en: 'Database',
    es: 'Base de datos',
  },
  'role.dotnet': {
    'pt-BR': 'Dev .NET',
    en: '.NET developer',
    es: 'Dev .NET',
  },
  'role.java': {
    'pt-BR': 'Dev Java',
    en: 'Java developer',
    es: 'Dev Java',
  },
  'role.node': {
    'pt-BR': 'Dev Node.js',
    en: 'Node.js developer',
    es: 'Dev Node.js',
  },
  'role.react': {
    'pt-BR': 'Dev React',
    en: 'React developer',
    es: 'Dev React',
  },
  'role.angular': {
    'pt-BR': 'Dev Angular',
    en: 'Angular developer',
    es: 'Dev Angular',
  },
  'role.custom': {
    'pt-BR': 'Especialista personalizado',
    en: 'Custom specialist',
    es: 'Especialista personalizado',
  },
  'role.setup': {
    'pt-BR': 'Setup',
    en: 'Setup',
    es: 'Configuración',
  },
  'role.fullstack': {
    'pt-BR': 'Full-stack',
    en: 'Full-stack',
    es: 'Full-stack',
  },
  'usage.previewTitle': {
    'pt-BR': 'Resumo de consumo',
    en: 'Usage overview',
    es: 'Resumen de consumo',
  },
  'usage.previewTokens': {
    'pt-BR': 'Tokens nesta semana',
    en: 'Tokens this week',
    es: 'Tokens de esta semana',
  },
  'usage.tokens': {
    'pt-BR': 'tokens',
    en: 'tokens',
    es: 'tokens',
  },
  'usage.details': {
    'pt-BR': 'Ver detalhes',
    en: 'View details',
    es: 'Ver detalles',
  },
  'usage.previewLegend': {
    'pt-BR': 'As barras mostram a cota restante da conta.',
    en: 'Bars show the remaining account quota.',
    es: 'Las barras muestran la cuota restante de la cuenta.',
  },
  'usage.partial': {
    'pt-BR': 'Contagem de tokens parcial.',
    en: 'Partial token count.',
    es: 'Recuento de tokens parcial.',
  },
  'usage.previewError': {
    'pt-BR': 'Não foi possível atualizar. Tente novamente.',
    en: 'Unable to refresh. Try again.',
    es: 'No se pudo actualizar. Inténtalo de nuevo.',
  },
  'usage.short': {
    'pt-BR': 'Consumo',
    en: 'Usage',
    es: 'Consumo',
  },
  'usage.title': {
    'pt-BR': 'Consumo e disponibilidade',
    en: 'Usage and availability',
    es: 'Consumo y disponibilidad',
  },
  'usage.integrations': {
    'pt-BR': 'INTEGRAÇÕES',
    en: 'INTEGRATIONS',
    es: 'INTEGRACIONES',
  },
  'usage.description': {
    'pt-BR': 'Tokens registrados nesta instalação e cotas disponíveis nas contas conectadas.',
    en: 'Tokens recorded in this installation and available quotas for connected accounts.',
    es: 'Tokens registrados en esta instalación y cuotas disponibles en las cuentas conectadas.',
  },
  'usage.period': {
    'pt-BR': 'Período do consumo local',
    en: 'Local usage period',
    es: 'Período del consumo local',
  },
  'usage.thisWeek': {
    'pt-BR': 'Esta semana',
    en: 'This week',
    es: 'Esta semana',
  },
  'usage.thisMonth': {
    'pt-BR': 'Este mês',
    en: 'This month',
    es: 'Este mes',
  },
  'usage.week': {
    'pt-BR': 'Semanal',
    en: 'Weekly',
    es: 'Semanal',
  },
  'usage.month': {
    'pt-BR': 'Mensal',
    en: 'Monthly',
    es: 'Mensual',
  },
  'usage.otherWindow': {
    'pt-BR': 'Outra janela',
    en: 'Other window',
    es: 'Otra ventana',
  },
  'usage.refresh': {
    'pt-BR': 'Atualizar',
    en: 'Refresh',
    es: 'Actualizar',
  },
  'usage.refreshing': {
    'pt-BR': 'Atualizando…',
    en: 'Refreshing…',
    es: 'Actualizando…',
  },
  'usage.loading': {
    'pt-BR': 'Carregando consumo…',
    en: 'Loading usage…',
    es: 'Cargando consumo…',
  },
  'usage.noData': {
    'pt-BR': 'Não foi possível carregar os dados.',
    en: 'Unable to load data.',
    es: 'No se pudieron cargar los datos.',
  },
  'usage.error': {
    'pt-BR':
      'Não foi possível atualizar. Tente novamente; os últimos dados recebidos continuam abaixo.',
    en: 'Unable to refresh. Try again; the latest received data remains below.',
    es: 'No se pudo actualizar. Inténtalo de nuevo; los últimos datos recibidos siguen abajo.',
  },
  'usage.local': {
    'pt-BR': 'Consumo no Luma',
    en: 'Usage in Luma',
    es: 'Consumo en Luma',
  },
  'usage.localTokens': {
    'pt-BR': 'Tokens no período',
    en: 'Tokens in period',
    es: 'Tokens del período',
  },
  'usage.executions': {
    'pt-BR': 'Execuções',
    en: 'Runs',
    es: 'Ejecuciones',
  },
  'usage.total': {
    'pt-BR': 'Total de tokens',
    en: 'Total tokens',
    es: 'Total de tokens',
  },
  'usage.input': {
    'pt-BR': 'Entrada',
    en: 'Input',
    es: 'Entrada',
  },
  'usage.output': {
    'pt-BR': 'Saída',
    en: 'Output',
    es: 'Salida',
  },
  'usage.cache': {
    'pt-BR': 'Cache de entrada',
    en: 'Cached input',
    es: 'Caché de entrada',
  },
  'usage.coverage': {
    'pt-BR': 'execuções com tokens informados',
    en: 'runs with token counts',
    es: 'ejecuciones con tokens informados',
  },
  'usage.account': {
    'pt-BR': 'Disponibilidade da conta',
    en: 'Account availability',
    es: 'Disponibilidad de la cuenta',
  },
  'usage.remaining': {
    'pt-BR': 'restante',
    en: 'remaining',
    es: 'restante',
  },
  'usage.resets': {
    'pt-BR': 'Renova em',
    en: 'Resets at',
    es: 'Se renueva el',
  },
  'usage.checked': {
    'pt-BR': 'Consulta da conta:',
    en: 'Account checked:',
    es: 'Cuenta consultada:',
  },
  'usage.notReported': {
    'pt-BR': 'Não informada pela CLI',
    en: 'Not reported by CLI',
    es: 'No informada por la CLI',
  },
  'usage.missing': {
    'pt-BR':
      'execução(ões) sem contagem de tokens. O total é parcial; ausência de informação não significa consumo zero.',
    en: 'run(s) without token counts. The total is partial; missing information does not mean zero usage.',
    es: 'ejecución(es) sin recuento de tokens. El total es parcial; la falta de información no significa consumo cero.',
  },
  'usage.note': {
    'pt-BR':
      'Semana: segunda-feira até agora. Mês: dia 1 até agora. O consumo considera todas as operações desta instalação, incluindo tentativas com falha quando há tokens informados. Cache é informado separadamente pelo CLI; sua composição varia por provedor e não é somada novamente ao total.',
    en: 'Week: Monday until now. Month: day 1 until now. Usage includes all operations in this installation, including failed attempts when tokens are reported. Cache is reported separately by the CLI; its composition varies by provider and is not added again to the total.',
    es: 'Semana: desde el lunes hasta ahora. Mes: desde el día 1 hasta ahora. El consumo incluye todas las operaciones de esta instalación, también los intentos fallidos cuando se informan tokens. El CLI informa la caché por separado; su composición varía por proveedor y no se suma de nuevo al total.',
  },
  'usage.footer': {
    'pt-BR':
      'As cotas pertencem à conta e podem incluir uso fora do Luma. Cada provedor define suas janelas; uma cota semanal não equivale a um limite mensal. Atualizações de cota usam cache de 30 segundos.',
    en: 'Quotas belong to the account and may include usage outside Luma. Each provider defines its windows; a weekly quota is not a monthly limit. Quota refreshes are cached for 30 seconds.',
    es: 'Las cuotas pertenecen a la cuenta y pueden incluir uso fuera de Luma. Cada proveedor define sus ventanas; una cuota semanal no equivale a un límite mensual. Las consultas de cuota usan una caché de 30 segundos.',
  },
  'usage.status.available': {
    'pt-BR': 'Cotas disponíveis',
    en: 'Quotas available',
    es: 'Cuotas disponibles',
  },
  'usage.status.not-checked': {
    'pt-BR': 'Consultando',
    en: 'Checking',
    es: 'Consultando',
  },
  'usage.status.not-installed': {
    'pt-BR': 'CLI não encontrada',
    en: 'CLI not found',
    es: 'CLI no encontrada',
  },
  'usage.status.unsupported': {
    'pt-BR': 'Cota não informada',
    en: 'Quota not reported',
    es: 'Cuota no informada',
  },
  'usage.status.error': {
    'pt-BR': 'Consulta indisponível',
    en: 'Lookup unavailable',
    es: 'Consulta no disponible',
  },
  'usage.reason.auth': {
    'pt-BR': 'A CLI precisa estar autenticada para consultar as cotas.',
    en: 'The CLI must be signed in to check account quotas.',
    es: 'La CLI debe tener una sesión iniciada para consultar las cuotas.',
  },
  'usage.reason.timeout': {
    'pt-BR': 'A consulta demorou mais do que o esperado. Tente atualizar.',
    en: 'The lookup took longer than expected. Try refreshing.',
    es: 'La consulta tardó más de lo esperado. Intenta actualizar.',
  },
  'usage.reason.unavailable': {
    'pt-BR': 'Não foi possível obter as cotas da conta. O consumo local continua disponível.',
    en: 'Unable to retrieve account quotas. Local usage remains available.',
    es: 'No se pudieron obtener las cuotas de la cuenta. El consumo local sigue disponible.',
  },
  'usage.reason.unsupported': {
    'pt-BR': 'Esta CLI não disponibiliza cotas da conta por uma interface suportada.',
    en: 'This CLI does not expose account quotas through a supported interface.',
    es: 'Esta CLI no expone las cuotas de la cuenta mediante una interfaz compatible.',
  },
  'usage.reason.notInstalled': {
    'pt-BR': 'Configure a CLI nas integrações para consultar sua disponibilidade.',
    en: 'Configure the CLI in integrations to check its availability.',
    es: 'Configura la CLI en integraciones para consultar su disponibilidad.',
  },
  'usage.reason.pending': {
    'pt-BR': 'Consultando as janelas de disponibilidade da conta…',
    en: 'Checking the account availability windows…',
    es: 'Consultando las ventanas de disponibilidad de la cuenta…',
  },
  'appearance.title': {
    'pt-BR': 'Visual da interface',
    en: 'Interface appearance',
    es: 'Aspecto de la interfaz',
  },
  'appearance.description': {
    'pt-BR':
      'Escolha o estilo dos painéis, botões e conversas. O visual do mapa continua independente.',
    en: 'Choose the style of panels, buttons and conversations. Map appearance remains independent.',
    es: 'Elige el estilo de paneles, botones y conversaciones. El aspecto del mapa sigue siendo independiente.',
  },
  'appearance.futuristic': {
    'pt-BR': 'Futurista',
    en: 'Futuristic',
    es: 'Futurista',
  },
  'appearance.pixel': {
    'pt-BR': 'Pixel art',
    en: 'Pixel art',
    es: 'Pixel art',
  },
  'appearance.saved': {
    'pt-BR': 'Preferência salva neste navegador. Aplicação imediata.',
    en: 'Preference saved in this browser. Applies immediately.',
    es: 'Preferencia guardada en este navegador. Se aplica al instante.',
  },
  'shell.previous-tab-q': {
    'pt-BR': 'Aba anterior (Q)',
    en: 'Previous tab (Q)',
    es: 'Pestaña anterior (Q)',
  },
  'shell.next-tab-e': {
    'pt-BR': 'Próxima aba (E)',
    en: 'Next tab (E)',
    es: 'Siguiente pestaña (E)',
  },
  'shell.drag-map': {
    'pt-BR': 'ARRASTAR MAPA',
    en: 'DRAG MAP',
    es: 'ARRASTRAR MAPA',
  },
  'shell.center': {
    'pt-BR': 'CENTRALIZAR',
    en: 'CENTER',
    es: 'CENTRAR',
  },
  'shell.new-agent': {
    'pt-BR': 'NOVO AGENTE',
    en: 'NEW AGENT',
    es: 'NUEVO AGENTE',
  },
  'shell.transmission-log': {
    'pt-BR': 'REGISTRO DE TRANSMISSÕES',
    en: 'TRANSMISSION LOG',
    es: 'REGISTRO DE TRANSMISIONES',
  },
  'shell.operation-progress': {
    'pt-BR': 'PROGRESSO DA OPERAÇÃO',
    en: 'OPERATION PROGRESS',
    es: 'PROGRESO DE LA OPERACIÓN',
  },
  'shell.no': {
    'pt-BR': 'NENHUM',
    en: 'NO',
    es: 'NINGUNA',
  },
  'shell.database': {
    'pt-BR': 'BANCO',
    en: 'DATABASE',
    es: 'BASE DE DATOS',
  },
  'shell.found': {
    'pt-BR': 'ENCONTRADO',
    en: 'FOUND',
    es: 'ENCONTRADA',
  },
  'shell.no-database-was-found-create-one-to-use-luma-hive-it-will-': {
    'pt-BR':
      'Nenhum banco de dados foi encontrado. Para usar o SQUAD/CODE, inicie um novo; ele será criado em:',
    en: 'No database was found. Create one to use Luma Hive; it will be stored at:',
    es: 'No se encontró una base de datos. Crea una para usar Luma Hive; se guardará en:',
  },
  'shell.bridge-connected': {
    'pt-BR': 'Bridge conectado',
    en: 'Bridge connected',
    es: 'Bridge conectado',
  },
  'shell.checking': {
    'pt-BR': '/ verificando…',
    en: '/ checking…',
    es: '/ comprobando…',
  },
  'shell.not-found': {
    'pt-BR': '/ não encontrado',
    en: '/ not found',
    es: '/ no encontrado',
  },
  'shell.executables-detected-on-windows-without-a-cli-the-app-runs': {
    'pt-BR':
      'Executáveis detectados no Windows. Sem CLI o app funciona, mas as execuções ficam só na simulação.',
    en: 'Executables detected on Windows. Without a CLI, the app runs in simulation mode.',
    es: 'Ejecutables detectados en Windows. Sin CLI, la aplicación funciona en modo de simulación.',
  },
  'shell.check-again': {
    'pt-BR': 'Testar de novo',
    en: 'Check again',
    es: 'Comprobar de nuevo',
  },
  'shell.first-operation-name': {
    'pt-BR': 'NOME DA PRIMEIRA OPERAÇÃO',
    en: 'FIRST OPERATION NAME',
    es: 'NOMBRE DE LA PRIMERA OPERACIÓN',
  },
  'shell.e-g-ana-s-store': {
    'pt-BR': 'Ex.: Loja da Ana',
    en: "E.g. Ana's Store",
    es: 'Ej.: Tienda de Ana',
  },
  'shell.creates-the-default-agents-and-squad-plus-an-empty-operati': {
    'pt-BR':
      'Cria os agentes e a squad padrão e uma operação vazia para você preencher o briefing.',
    en: 'Creates the default agents and squad, plus an empty operation for your briefing.',
    es: 'Crea los agentes y el equipo predeterminados y una operación vacía para el briefing.',
  },
  'shell.or': {
    'pt-BR': 'ou',
    en: 'or',
    es: 'o',
  },
  'shell.atlas-commerce-an-e-commerce-example-with-a-squad-sprints-': {
    'pt-BR': 'Atlas Commerce: um e-commerce com squad, sprints e features prontos para explorar.',
    en: 'Atlas Commerce: an e-commerce example with a squad, sprints and features ready to explore.',
    es: 'Atlas Commerce: un ejemplo de comercio electrónico con equipo, sprints y funcionalidades para explorar.',
  },
  'shell.a-json-exported-from-settings-workspace-on-another-install': {
    'pt-BR': 'Um .json exportado em Configurações > Workspace, de outra máquina ou instalação.',
    en: 'A .json exported from Settings > Workspace on another installation.',
    es: 'Un .json exportado desde Configuración > Workspace en otra instalación.',
  },
  'shell.recover-this-browser-s-backup': {
    'pt-BR': 'Recuperar a cópia deste navegador',
    en: "Recover this browser's backup",
    es: 'Recuperar la copia de este navegador',
  },
  'shell.nothing-is-saved-to-disk-until-you-choose': {
    'pt-BR': 'Nada é gravado em disco até você escolher.',
    en: 'Nothing is saved to disk until you choose.',
    es: 'No se guarda nada en el disco hasta que elijas.',
  },
  'shell.view-squad': {
    'pt-BR': 'VER <span class=word-tag>SQUAD</span>',
    en: 'VIEW <span class=word-tag>SQUAD</span>',
    es: 'VER <span class=word-tag>EQUIPO</span>',
  },
  'shell.choose-an-operation': {
    'pt-BR': 'ESCOLHA A OPERAÇÃO',
    en: 'CHOOSE AN OPERATION',
    es: 'ELIGE UNA OPERACIÓN',
  },
  'shell.which-operation-s-squad-would-you-like-to-see': {
    'pt-BR': 'De qual operação você quer ver a squad?',
    en: "Which operation's squad would you like to see?",
    es: '¿De qué operación quieres ver el equipo?',
  },
  'shell.active': {
    'pt-BR': 'ATIVA',
    en: 'ACTIVE',
    es: 'ACTIVA',
  },
  'shell.network-controls': {
    'pt-BR': 'CONTROLES DA <span class=word-tag>REDE</span>',
    en: 'NETWORK <span class=word-tag>CONTROLS</span>',
    es: 'CONTROLES DE LA <span class=word-tag>RED</span>',
  },
  'shell.game-menu-ui-development-workspace': {
    'pt-BR': 'GAME-MENU UI / WORKSPACE DE DESENVOLVIMENTO',
    en: 'GAME-MENU UI / DEVELOPMENT WORKSPACE',
    es: 'INTERFAZ DE JUEGO / WORKSPACE DE DESARROLLO',
  },
  'shell.click-an-agent-to-select-it-double-click-to-chat-use-edit-': {
    'pt-BR':
      'Clique em um agente para selecioná-lo. Clique duas vezes para conversar e use Editar para abrir o estúdio. O mapa é uma cidade procedural fictícia: seus marcadores representam especialistas, não localizações reais.',
    en: 'Click an agent to select it. Double-click to chat; use Edit to open the studio. The procedural map is fictional: its markers represent specialists, not real locations.',
    es: 'Haz clic en un agente para seleccionarlo. Haz doble clic para conversar y usa Editar para abrir el estudio. El mapa procedural es ficticio: sus marcadores representan especialistas, no ubicaciones reales.',
  },
  'shell.try-the-full-flow-briefing-features-distribute-apply-plan-': {
    'pt-BR':
      'Para experimentar o fluxo completo: Briefing > Features > Distribuir > Aplicar plano > Iniciar demo > Revisão humana.',
    en: 'Try the full flow: Briefing > Features > Distribute > Apply plan > Start demo > Human review.',
    es: 'Prueba el flujo completo: Briefing > Funcionalidades > Distribuir > Aplicar plan > Iniciar demo > Revisión humana.',
  },
  'shell.operator-confirmation': {
    'pt-BR': 'CONFIRMAÇÃO DO OPERADOR',
    en: 'OPERATOR CONFIRMATION',
    es: 'CONFIRMACIÓN DEL OPERADOR',
  },
  'agents.luma-hive-identity-capabilities': {
    'pt-BR': 'LUMA HIVE / IDENTIDADE & CAPACIDADES',
    en: 'LUMA HIVE / IDENTITY & CAPABILITIES',
    es: 'LUMA HIVE / IDENTIDAD Y CAPACIDADES',
  },
  'agents.agent-portrait': {
    'pt-BR': 'Retrato do agente',
    en: 'Agent portrait',
    es: 'Retrato del agente',
  },
  'agents.map-position': {
    'pt-BR': 'POSIÇÃO NO MAPA',
    en: 'MAP POSITION',
    es: 'POSICIÓN EN EL MAPA',
  },
  'agents.studio-tabs': {
    'pt-BR': 'Abas do estúdio',
    en: 'Studio tabs',
    es: 'Pestañas del estudio',
  },
  'agents.codename': {
    'pt-BR': 'CODINOME',
    en: 'CODENAME',
    es: 'NOMBRE CLAVE',
  },
  'agents.random-codename': {
    'pt-BR': 'Codinome aleatório',
    en: 'Random codename',
    es: 'Nombre clave aleatorio',
  },
  'agents.generate-random-codename': {
    'pt-BR': 'Gerar codinome aleatório',
    en: 'Generate random codename',
    es: 'Generar nombre clave aleatorio',
  },
  'agents.specialty': {
    'pt-BR': 'ESPECIALIDADE',
    en: 'SPECIALTY',
    es: 'ESPECIALIDAD',
  },
  'agents.specialty-title': {
    'pt-BR': 'TÍTULO DA ESPECIALIDADE',
    en: 'SPECIALTY TITLE',
    es: 'TÍTULO DE LA ESPECIALIDAD',
  },
  'agents.optional-e-g-payments-tech-lead-kubernetes-sre-performance': {
    'pt-BR':
      'Opcional. Ex.: Tech Lead de Pagamentos, SRE de Kubernetes, Engenheiro de Performance. Obrigatório em Especialista personalizado.',
    en: 'Optional. E.g. Payments Tech Lead, Kubernetes SRE, Performance Engineer. Required for a custom specialist.',
    es: 'Opcional. Ej.: Tech Lead de Pagos, SRE de Kubernetes, Ingeniero de Rendimiento. Obligatorio para un especialista personalizado.',
  },
  'agents.connected-to': {
    'pt-BR': 'CONECTADO A',
    en: 'CONNECTED TO',
    es: 'CONECTADO A',
  },
  'agents.the-commander-stays-at-the-center-and-receives-connections': {
    'pt-BR': 'O comandante fica no centro e recebe as conexões dos demais agentes.',
    en: 'The commander stays at the center and receives connections from the other agents.',
    es: 'El comandante permanece en el centro y recibe las conexiones de los demás agentes.',
  },
  'agents.office-desk': {
    'pt-BR': 'MESA NO ESCRITÓRIO',
    en: 'OFFICE DESK',
    es: 'ESCRITORIO EN LA OFICINA',
  },
  'agents.automatically-choose-a-free-desk': {
    'pt-BR': 'Mesa livre automática',
    en: 'Automatically choose a free desk',
    es: 'Elegir escritorio libre automáticamente',
  },
  'agents.agent-position-in-the-office-you-can-also-drag-the-agent-o': {
    'pt-BR':
      'Posição do agente na vista de escritório. Também dá para arrastar o agente no mapa ou dar duplo clique numa mesa vazia.',
    en: 'Agent position in the office. You can also drag the agent on the map or double-click an empty desk.',
    es: 'Posición del agente en la oficina. También puedes arrastrarlo en el mapa o hacer doble clic en un escritorio vacío.',
  },
  'agents.squad-desk-appearance': {
    'pt-BR': 'APARÊNCIA NA MESA DO SQUAD',
    en: 'SQUAD DESK APPEARANCE',
    es: 'APARIENCIA EN EL ESCRITORIO DEL EQUIPO',
  },
  'agents.photo': {
    'pt-BR': 'FOTO',
    en: 'PHOTO',
    es: 'FOTO',
  },
  'agents.icon': {
    'pt-BR': 'ÍCONE',
    en: 'ICON',
    es: 'ICONO',
  },
  'agents.click-the-photo-or-icon-to-open-the-gallery-automatic-uses': {
    'pt-BR':
      'Clique na foto ou no ícone para abrir a galeria. Automático usa o padrão da especialidade.',
    en: 'Click the photo or icon to open the gallery. Automatic uses the specialty default.',
    es: 'Haz clic en la foto o el icono para abrir la galería. Automático usa el valor predeterminado de la especialidad.',
  },
  'agents.provider': {
    'pt-BR': 'PROVEDOR',
    en: 'PROVIDER',
    es: 'PROVEEDOR',
  },
  'agents.connection-and-permissions-are-in-the-provider-s-settings-': {
    'pt-BR': 'Conexão e permissões ficam na aba do provedor em Configurações.',
    en: "Connection and permissions are in the provider's Settings tab.",
    es: 'La conexión y los permisos están en la pestaña del proveedor en Configuración.',
  },
  'agents.model': {
    'pt-BR': 'MODELO',
    en: 'MODEL',
    es: 'MODELO',
  },
  'agents.production-stage': {
    'pt-BR': 'ESTÁGIO DE PRODUÇÃO',
    en: 'PRODUCTION STAGE',
    es: 'ETAPA DE PRODUCCIÓN',
  },
  'agents.reasoning-effort': {
    'pt-BR': 'NÍVEL DE ESFORÇO',
    en: 'REASONING EFFORT',
    es: 'NIVEL DE ESFUERZO',
  },
  'agents.uses-the-model-s-default-effort-default-the-session-model-': {
    'pt-BR': 'Usa o nível padrão do modelo. Padrão: o do modelo da sessão.',
    en: "Uses the model's default effort. Default: the session model's setting.",
    es: 'Usa el esfuerzo predeterminado del modelo. Predeterminado: el del modelo de la sesión.',
  },
  'agents.responsibility-description': {
    'pt-BR': 'RESPONSABILIDADE / DESCRIÇÃO',
    en: 'RESPONSIBILITY / DESCRIPTION',
    es: 'RESPONSABILIDAD / DESCRIPCIÓN',
  },
  'agents.soul-personality': {
    'pt-BR': 'SOUL / PERSONALIDADE',
    en: 'SOUL / PERSONALITY',
    es: 'SOUL / PERSONALIDAD',
  },
  'agents.opening-messages': {
    'pt-BR': 'MENSAGENS INICIAIS',
    en: 'OPENING MESSAGES',
    es: 'MENSAJES INICIALES',
  },
  'agents.one-is-chosen-at-random-for-each-conversation': {
    'pt-BR': 'uma é sorteada ao começar cada conversa',
    en: 'one is chosen at random for each conversation',
    es: 'se elige uno al azar para cada conversación',
  },
  'agents.remove-variation': {
    'pt-BR': 'Remover variação',
    en: 'Remove variation',
    es: 'Eliminar variante',
  },
  'agents.add-variation': {
    'pt-BR': 'Adicionar variação',
    en: 'Add variation',
    es: 'Añadir variante',
  },
  'agents.shapes-how-the-agent-talks-and-starts-conversations-and-is': {
    'pt-BR':
      'Molda o jeito de conversar e de iniciar as conversas e vai na exportação. Todo agente fica sempre de prontidão.',
    en: 'Shapes how the agent talks and starts conversations, and is included in exports. Every agent remains on standby.',
    es: 'Define cómo conversa el agente e inicia conversaciones y se incluye en las exportaciones. Todos los agentes permanecen disponibles.',
  },
  'agents.handoff-preference': {
    'pt-BR': 'PREFERÊNCIA DE HANDOFF',
    en: 'HANDOFF PREFERENCE',
    es: 'PREFERENCIA DE TRANSFERENCIA',
  },
  'agents.commander-decides': {
    'pt-BR': 'Comandante decide',
    en: 'Commander decides',
    es: 'El comandante decide',
  },
  'agents.adds-the-destination-to-the-plan-when-it-belongs-to-the-sq': {
    'pt-BR':
      'Adiciona o destino ao plano quando ele pertence ao squad e ainda não faz parte da rota.',
    en: 'Adds the destination to the plan when it belongs to the squad and is not already on the route.',
    es: 'Añade el destino al plan cuando pertenece al equipo y aún no está en la ruta.',
  },
  'agents.the-agent-s-production-stage-also-appears-on-the-agent-kan': {
    'pt-BR':
      'A produção do agente também aparece no Kanban de agentes. Use este campo para indicar se ele ainda está em descoberta, definindo identidade, refinando prompts, em validação ou pronto para uso.',
    en: "The agent's production stage also appears on the agent Kanban. Indicate whether it is in discovery, identity definition, prompt refinement, validation or ready for use.",
    es: 'La etapa del agente también aparece en el Kanban. Indica si está en descubrimiento, definición de identidad, refinamiento de instrucciones, validación o listo para usar.',
  },
  'agents.system-prompt-agent-instructions': {
    'pt-BR': 'SYSTEM PROMPT / INSTRUÇÕES DO AGENTE',
    en: 'SYSTEM PROMPT / AGENT INSTRUCTIONS',
    es: 'SYSTEM PROMPT / INSTRUCCIONES DEL AGENTE',
  },
  'agents.define-the-role-limits-deliverables-and-context-for-the-ne': {
    'pt-BR':
      'Defina papel, limites, entregáveis e contexto para o próximo especialista. Com o bridge ativo, estas instruções são anexadas ao system prompt do CLI.',
    en: 'Define the role, limits, deliverables and context for the next specialist. With the bridge active, these instructions are appended to the CLI system prompt.',
    es: 'Define el rol, los límites, las entregas y el contexto para el siguiente especialista. Con el bridge activo, estas instrucciones se añaden al system prompt del CLI.',
  },
  'agents.use-specialty-instructions': {
    'pt-BR': 'Usar instruções da especialidade',
    en: 'Use specialty instructions',
    es: 'Usar instrucciones de la especialidad',
  },
  'agents.these-selections-describe-the-agent-s-specialty-the-cli-us': {
    'pt-BR':
      'Estas seleções descrevem a especialidade do agente. O CLI usa ferramentas nativas; a restrição efetiva de escrita vem do sandbox nas configurações. Colegas sem Edit, Write ou Bash usam read-only.',
    en: "These selections describe the agent's specialty. The CLI uses native tools; write restrictions are enforced by the sandbox settings. Colleagues without Edit, Write or Bash use read-only.",
    es: 'Estas selecciones describen la especialidad. El CLI usa herramientas nativas; el sandbox aplica las restricciones de escritura. Los compañeros sin Edit, Write o Bash usan read-only.',
  },
  'agents.requested-tools': {
    'pt-BR': 'FERRAMENTAS SOLICITADAS',
    en: 'REQUESTED TOOLS',
    es: 'HERRAMIENTAS SOLICITADAS',
  },
  'agents.global-permissions-still-apply-in-headless-mode-any-action': {
    'pt-BR':
      'O modo de permissão global continua valendo: em modo headless, qualquer ação que exigiria aprovação é negada.',
    en: 'Global permissions still apply: in headless mode, any action requiring approval is denied.',
    es: 'Los permisos globales siguen vigentes: en modo sin interacción se deniega toda acción que requiera aprobación.',
  },
  'agents.agent-guidelines': {
    'pt-BR': 'DIRETRIZES DO AGENTE',
    en: 'AGENT GUIDELINES',
    es: 'DIRECTRICES DEL AGENTE',
  },
  'agents.markdown-conventions-and-practices-the-agent-follows-on-ev': {
    'pt-BR':
      'Convenções e boas práticas em Markdown que o agente segue sempre que é executado: nomenclatura, formatação, padrões de projeto, testes e entregas. São anexadas às instruções enviadas ao CLI em toda etapa.',
    en: 'Markdown conventions and practices the agent follows on every run: naming, formatting, design patterns, testing and delivery. Appended to CLI instructions at each stage.',
    es: 'Convenciones y buenas prácticas en Markdown para cada ejecución: nombres, formato, patrones, pruebas y entregas. Se añaden a las instrucciones del CLI en cada etapa.',
  },
  'agents.base-template': {
    'pt-BR': 'TEMPLATE BASE',
    en: 'BASE TEMPLATE',
    es: 'PLANTILLA BASE',
  },
  'agents.delete-library-template': {
    'pt-BR': 'Excluir template da biblioteca',
    en: 'Delete library template',
    es: 'Eliminar plantilla de la biblioteca',
  },
  'agents.template-applied': {
    'pt-BR': 'Template aplicado.',
    en: 'Template applied.',
    es: 'Plantilla aplicada.',
  },
  'agents.undo': {
    'pt-BR': 'DESFAZER',
    en: 'UNDO',
    es: 'DESHACER',
  },
  'agents.base-guide-markdown': {
    'pt-BR': 'GUIA BASE (MARKDOWN)',
    en: 'BASE GUIDE (MARKDOWN)',
    es: 'GUÍA BASE (MARKDOWN)',
  },
  'agents.library-template-name': {
    'pt-BR': 'Nome do template na biblioteca',
    en: 'Library template name',
    es: 'Nombre de la plantilla en la biblioteca',
  },
  'agents.template-name': {
    'pt-BR': 'Nome do template',
    en: 'Template name',
    es: 'Nombre de la plantilla',
  },
  'agents.save-as-template': {
    'pt-BR': 'Salvar como template',
    en: 'Save as template',
    es: 'Guardar como plantilla',
  },
  'agents.extra-rule-blocks-appended-after-the-base-guide-each-block': {
    'pt-BR':
      'Blocos de regras extras anexados depois do guia base. Cada bloco pode ser editado, salvo na biblioteca ou removido.',
    en: 'Extra rule blocks appended after the base guide. Each block can be edited, saved to the library or removed.',
    es: 'Bloques de reglas adicionales tras la guía base. Cada bloque se puede editar, guardar en la biblioteca o eliminar.',
  },
  'agents.add-subset': {
    'pt-BR': 'Adicionar subset',
    en: 'Add subset',
    es: 'Añadir subconjunto',
  },
  'agents.subset-name': {
    'pt-BR': 'Nome do subset',
    en: 'Subset name',
    es: 'Nombre del subconjunto',
  },
  'agents.save-subset-to-library': {
    'pt-BR': 'Salvar subset na biblioteca',
    en: 'Save subset to library',
    es: 'Guardar subconjunto en la biblioteca',
  },
  'agents.remove-subset': {
    'pt-BR': 'Remover subset',
    en: 'Remove subset',
    es: 'Eliminar subconjunto',
  },
  'agents.final-preview': {
    'pt-BR': 'PRÉ-VISUALIZAÇÃO FINAL',
    en: 'FINAL PREVIEW',
    es: 'VISTA PREVIA FINAL',
  },
  'agents.squad-positions': {
    'pt-BR': 'POSIÇÕES NAS SQUADS',
    en: 'SQUAD POSITIONS',
    es: 'POSICIONES EN LOS EQUIPOS',
  },
  'agents.this-agent-has-no-squad-positions-yet': {
    'pt-BR': 'Este agente ainda não ocupa nenhuma posição em squads.',
    en: 'This agent has no squad positions yet.',
    es: 'Este agente aún no ocupa ninguna posición en equipos.',
  },
  'agents.squads-are-assembled-in-squad-studio-using-the-command-tre': {
    'pt-BR':
      'As squads são montadas no Squad Studio, na árvore de comando (comandante, ADR, PRD e operadores).',
    en: 'Squads are assembled in Squad Studio using the command tree: commander, ADR, PRD and operators.',
    es: 'Los equipos se montan en Squad Studio mediante el árbol de mando: comandante, ADR, PRD y operadores.',
  },
  'agents.open-squad-studio': {
    'pt-BR': 'Abrir Squad Studio',
    en: 'Open Squad Studio',
    es: 'Abrir Squad Studio',
  },
  'agents.close-gallery': {
    'pt-BR': 'Fechar galeria',
    en: 'Close gallery',
    es: 'Cerrar galería',
  },
  'agents.automatic': {
    'pt-BR': 'Automático',
    en: 'Automatic',
    es: 'Automático',
  },
  'agents.import-photo': {
    'pt-BR': 'Importar foto',
    en: 'Import photo',
    es: 'Importar foto',
  },
  'agents.general': {
    'pt-BR': 'GERAL',
    en: 'GENERAL',
    es: 'GENERAL',
  },
  'agents.technologies': {
    'pt-BR': 'TECNOLOGIAS',
    en: 'TECHNOLOGIES',
    es: 'TECNOLOGÍAS',
  },
  'agents.delete-agent': {
    'pt-BR': 'Excluir agente',
    en: 'Delete agent',
    es: 'Eliminar agente',
  },
  'agents.duplicate': {
    'pt-BR': 'Duplicar',
    en: 'Duplicate',
    es: 'Duplicar',
  },
  'agents.restore-default': {
    'pt-BR': 'Restaurar default',
    en: 'Restore default',
    es: 'Restaurar predeterminado',
  },
  'agents.local-no-execution': {
    'pt-BR': 'LOCAL / SEM EXECUÇÃO',
    en: 'LOCAL / NO EXECUTION',
    es: 'LOCAL / SIN EJECUCIÓN',
  },
  'agents.save-agent': {
    'pt-BR': 'Salvar agente',
    en: 'Save agent',
    es: 'Guardar agente',
  },
  'agents.search-by-topic-testing-security-git-accessibility': {
    'pt-BR': 'Pesquise por tema: testes, segurança, git, acessibilidade...',
    en: 'Search by topic: testing, security, git, accessibility...',
    es: 'Busca por tema: pruebas, seguridad, git, accesibilidad...',
  },
  'agents.search-subsets-by-topic': {
    'pt-BR': 'Pesquisar subsets por tema',
    en: 'Search subsets by topic',
    es: 'Buscar subconjuntos por tema',
  },
  'agents.topics': {
    'pt-BR': 'Temas',
    en: 'Topics',
    es: 'Temas',
  },
  'agents.my-library': {
    'pt-BR': 'Minha biblioteca',
    en: 'My library',
    es: 'Mi biblioteca',
  },
  'agents.subsets': {
    'pt-BR': 'Subsets',
    en: 'Subsets',
    es: 'Subconjuntos',
  },
  'agents.no-subsets-found-for-this-topic': {
    'pt-BR': 'Nenhum subset encontrado para esse tema.',
    en: 'No subsets found for this topic.',
    es: 'No se encontraron subconjuntos para este tema.',
  },
  'agents.blank-subset': {
    'pt-BR': 'Subset em branco',
    en: 'Blank subset',
    es: 'Subconjunto vacío',
  },
  'agents.write-your-own-rules': {
    'pt-BR': 'Escreva suas próprias regras.',
    en: 'Write your own rules.',
    es: 'Escribe tus propias reglas.',
  },
  'chat.close-conversation': {
    'pt-BR': 'Fechar conversa',
    en: 'Close conversation',
    es: 'Cerrar conversación',
  },
  'chat.close-esc': {
    'pt-BR': 'Fechar (Esc)',
    en: 'Close (Esc)',
    es: 'Cerrar (Esc)',
  },
  'chat.try-again': {
    'pt-BR': 'Tentar de novo',
    en: 'Try again',
    es: 'Intentar de nuevo',
  },
  'chat.retry': {
    'pt-BR': 'Tentar novamente',
    en: 'Retry',
    es: 'Reintentar',
  },
  'chat.stop': {
    'pt-BR': 'Parar',
    en: 'Stop',
    es: 'Detener',
  },
  'chat.new-message': {
    'pt-BR': 'Nova mensagem ↓',
    en: 'New message ↓',
    es: 'Mensaje nuevo ↓',
  },
  'chat.send-enter': {
    'pt-BR': 'Enviar (Enter)',
    en: 'Send (Enter)',
    es: 'Enviar (Enter)',
  },
  'chat.the-options-work-here-for-open-ended-conversations-connect': {
    'pt-BR':
      'As opções funcionam aqui mesmo. Para conversar livremente, conecte o CLI com a execução ligada.',
    en: 'The options work here. For open-ended conversations, connect the CLI with execution enabled.',
    es: 'Las opciones funcionan aquí. Para conversar libremente, conecta el CLI con la ejecución activada.',
  },
  'console.console': {
    'pt-BR': 'Console',
    en: 'Console',
    es: 'Consola',
  },
  'console.export-log': {
    'pt-BR': 'Exportar log',
    en: 'Export log',
    es: 'Exportar registro',
  },
  'console.silent-channel': {
    'pt-BR': 'Canal em silêncio',
    en: 'Silent channel',
    es: 'Canal en silencio',
  },
  'console.no-events-match-this-filter': {
    'pt-BR': 'Nenhum evento para este filtro.',
    en: 'No events match this filter.',
    es: 'No hay eventos para este filtro.',
  },
  'console.no-runs-in-this-session': {
    'pt-BR': 'Sem execuções nesta sessão.',
    en: 'No runs in this session.',
    es: 'No hay ejecuciones en esta sesión.',
  },
  'console.history': {
    'pt-BR': 'Histórico',
    en: 'History',
    es: 'Historial',
  },
  'console.close-history': {
    'pt-BR': 'Fechar histórico',
    en: 'Close history',
    es: 'Cerrar historial',
  },
  'console.no-saved-runs': {
    'pt-BR': 'Sem execuções salvas',
    en: 'No saved runs',
    es: 'No hay ejecuciones guardadas',
  },
  'console.this-operation-s-bridge-runs-appear-here-including-those-f': {
    'pt-BR':
      'As execuções desta operação com o bridge aparecem aqui, inclusive as de sessões anteriores.',
    en: "This operation's bridge runs appear here, including those from previous sessions.",
    es: 'Aquí aparecen las ejecuciones de esta operación, incluidas las de sesiones anteriores.',
  },
  'console.no-runs-yet': {
    'pt-BR': 'Nenhuma execução ainda',
    en: 'No runs yet',
    es: 'Aún no hay ejecuciones',
  },
  'console.distribute-features-and-start-the-operation-or-spawn-an-in': {
    'pt-BR':
      'Distribua as features e inicie a operação, ou faça um spawn individual com o bridge conectado.',
    en: 'Distribute features and start the operation, or spawn an individual agent with the bridge connected.',
    es: 'Distribuye las funcionalidades e inicia la operación o ejecuta un agente individual con el bridge conectado.',
  },
  'console.end-operation': {
    'pt-BR': 'Encerrar operação',
    en: 'End operation',
    es: 'Finalizar operación',
  },
  'dashboard.open-squad-network': {
    'pt-BR': 'Abrir rede do squad',
    en: 'Open squad network',
    es: 'Abrir red del equipo',
  },
  'dashboard.operations-161': {
    'pt-BR': 'OPERAÇÕES',
    en: 'OPERATIONS',
    es: 'OPERACIONES',
  },
  'dashboard.active-162': {
    'pt-BR': 'ATIVO',
    en: 'ACTIVE',
    es: 'ACTIVO',
  },
  'dashboard.to-do': {
    'pt-BR': 'A FAZER',
    en: 'TO DO',
    es: 'POR HACER',
  },
  'dashboard.ready': {
    'pt-BR': 'PRONTAS',
    en: 'READY',
    es: 'LISTAS',
  },
  'dashboard.running': {
    'pt-BR': 'RODANDO',
    en: 'RUNNING',
    es: 'EN CURSO',
  },
  'dashboard.review-166': {
    'pt-BR': 'REVISÃO',
    en: 'REVIEW',
    es: 'REVISIÓN',
  },
  'dashboard.done': {
    'pt-BR': 'FEITAS',
    en: 'DONE',
    es: 'HECHAS',
  },
  'dashboard.open-project': {
    'pt-BR': 'Abrir projeto',
    en: 'Open project',
    es: 'Abrir proyecto',
  },
  'dashboard.agent-teams-online-meeting-to-co-write-documents': {
    'pt-BR': 'Agent Teams: reunião online para co-escrever documentos',
    en: 'Agent Teams: online meeting to co-write documents',
    es: 'Agent Teams: reunión en línea para coescribir documentos',
  },
  'dashboard.open-teams': {
    'pt-BR': 'Abrir times',
    en: 'Open teams',
    es: 'Abrir equipos',
  },
  'dashboard.project-name-and-squad': {
    'pt-BR': 'Nome do projeto e squad.',
    en: 'Project name and squad.',
    es: 'Nombre del proyecto y equipo.',
  },
  'dashboard.squads-172': {
    'pt-BR': 'SQUADS',
    en: 'SQUADS',
    es: 'EQUIPOS',
  },
  'dashboard.commander-adr-prd-and-operators': {
    'pt-BR': 'Comandante, ADR, PRD e operadores.',
    en: 'Commander, ADR, PRD and operators.',
    es: 'Comandante, ADR, PRD y operadores.',
  },
  'dashboard.active-operation': {
    'pt-BR': 'OPERAÇÃO ATIVA',
    en: 'ACTIVE OPERATION',
    es: 'OPERACIÓN ACTIVA',
  },
  'dashboard.chat': {
    'pt-BR': 'Chat',
    en: 'Chat',
    es: 'Chat',
  },
  'dashboard.no-operation-in-progress': {
    'pt-BR': 'Nenhuma operação em andamento',
    en: 'No operation in progress',
    es: 'No hay operaciones en curso',
  },
  'dashboard.awaiting-review': {
    'pt-BR': 'AGUARDANDO REVISÃO',
    en: 'AWAITING REVIEW',
    es: 'PENDIENTE DE REVISIÓN',
  },
  'dashboard.no-deliveries-awaiting-approval': {
    'pt-BR': 'Nenhuma entrega aguardando aprovação.',
    en: 'No deliveries awaiting approval.',
    es: 'No hay entregas pendientes de aprobación.',
  },
  'dashboard.recent-activity': {
    'pt-BR': 'ATIVIDADE RECENTE',
    en: 'RECENT ACTIVITY',
    es: 'ACTIVIDAD RECIENTE',
  },
  'dashboard.view-transmissions': {
    'pt-BR': 'VER TRANSMISSÕES →',
    en: 'VIEW TRANSMISSIONS →',
    es: 'VER TRANSMISIONES →',
  },
  'dashboard.silent-channel': {
    'pt-BR': 'Canal em silêncio.',
    en: 'Silent channel.',
    es: 'Canal en silencio.',
  },
  'documents.status': {
    'pt-BR': 'Status',
    en: 'Status',
    es: 'Estado',
  },
  'documents.meeting-duration': {
    'pt-BR': 'Duração da reunião',
    en: 'Meeting duration',
    es: 'Duración de la reunión',
  },
  'documents.meeting-agenda': {
    'pt-BR': 'Pauta da reunião',
    en: 'Meeting agenda',
    es: 'Agenda de la reunión',
  },
  'documents.save-to-project': {
    'pt-BR': 'Salvar no projeto',
    en: 'Save to project',
    es: 'Guardar en el proyecto',
  },
  'documents.leave-without-saving-documents': {
    'pt-BR': 'Sair sem salvar os documentos?',
    en: 'Leave without saving documents?',
    es: '¿Salir sin guardar los documentos?',
  },
  'documents.speaking': {
    'pt-BR': 'falando',
    en: 'speaking',
    es: 'hablando',
  },
  'documents.thinking': {
    'pt-BR': 'pensando',
    en: 'thinking',
    es: 'pensando',
  },
  'documents.guest': {
    'pt-BR': 'CONVIDADO',
    en: 'GUEST',
    es: 'INVITADO',
  },
  'documents.typing': {
    'pt-BR': 'digitando',
    en: 'typing',
    es: 'escribiendo',
  },
  'documents.you': {
    'pt-BR': 'Você',
    en: 'You',
    es: 'Tú',
  },
  'documents.shared': {
    'pt-BR': 'compartilhou',
    en: 'shared',
    es: 'compartió',
  },
  'documents.chat-width': {
    'pt-BR': 'Largura do chat',
    en: 'Chat width',
    es: 'Ancho del chat',
  },
  'documents.meeting-chat': {
    'pt-BR': 'Chat da reunião',
    en: 'Meeting chat',
    es: 'Chat de la reunión',
  },
  'documents.undo': {
    'pt-BR': 'Desfazer',
    en: 'Undo',
    es: 'Deshacer',
  },
  'documents.undone': {
    'pt-BR': 'desfeito',
    en: 'undone',
    es: 'deshecho',
  },
  'documents.follow-the-agenda': {
    'pt-BR': 'Seguir a pauta',
    en: 'Follow the agenda',
    es: 'Seguir la agenda',
  },
  'documents.first-draft-of-everything': {
    'pt-BR': 'Primeira versão de tudo',
    en: 'First draft of everything',
    es: 'Primera versión de todo',
  },
  'documents.review-existing-documents': {
    'pt-BR': 'Revisar o que existe',
    en: 'Review existing documents',
    es: 'Revisar lo existente',
  },
  'documents.mention-participant': {
    'pt-BR': 'Marcar participante',
    en: 'Mention participant',
    es: 'Mencionar participante',
  },
  'documents.invite-to-meeting': {
    'pt-BR': 'Convidar para a reunião',
    en: 'Invite to meeting',
    es: 'Invitar a la reunión',
  },
  'documents.type-a-message-use-to-mention-someone': {
    'pt-BR': 'Digite uma mensagem. Use @ para marcar alguém',
    en: 'Type a message. Use @ to mention someone',
    es: 'Escribe un mensaje. Usa @ para mencionar a alguien',
  },
  'documents.message-for-the-meeting': {
    'pt-BR': 'Mensagem para a reunião',
    en: 'Message for the meeting',
    es: 'Mensaje para la reunión',
  },
  'documents.goes-to': {
    'pt-BR': 'Vai para',
    en: 'Goes to',
    es: 'Se guarda en',
  },
  'documents.when-exporting-for-codex-cli-edit-freely-agents-start-from': {
    'pt-BR':
      'na exportação para o Codex CLI. Edite à vontade: os agentes partem do que estiver aqui.',
    en: 'when exporting for Codex CLI. Edit freely: agents start from what is here.',
    es: 'al exportar para Codex CLI. Edita libremente: los agentes parten de este contenido.',
  },
  'documents.architecture-decisions-adr': {
    'pt-BR': 'DECISÕES DE ARQUITETURA (ADR)',
    en: 'ARCHITECTURE DECISIONS (ADR)',
    es: 'DECISIONES DE ARQUITECTURA (ADR)',
  },
  'documents.adr-title': {
    'pt-BR': 'Título do ADR',
    en: 'ADR title',
    es: 'Título del ADR',
  },
  'documents.remove-adr': {
    'pt-BR': 'Remover ADR',
    en: 'Remove ADR',
    es: 'Eliminar ADR',
  },
  'documents.context-decision-and-consequences': {
    'pt-BR': 'Contexto, decisão e consequências',
    en: 'Context, decision and consequences',
    es: 'Contexto, decisión y consecuencias',
  },
  'documents.add-adr': {
    'pt-BR': 'Adicionar ADR',
    en: 'Add ADR',
    es: 'Añadir ADR',
  },
  'documents.undo-document-changes': {
    'pt-BR': 'Desfazer alteração dos documentos',
    en: 'Undo document changes',
    es: 'Deshacer cambios en los documentos',
  },
  'features.co-writing-prd-specialist': {
    'pt-BR': 'CO-ESCRITA · RECONHECEDOR PRD',
    en: 'CO-WRITING · PRD SPECIALIST',
    es: 'COESCRITURA · ESPECIALISTA PRD',
  },
  'features.the-conversation-uses-the-cli-through-the-bridge-start-the': {
    'pt-BR':
      'A conversa usa o CLI pelo bridge. Inicie a aplicação com a execução ligada. O formulário funciona normalmente sem ele.',
    en: 'The conversation uses the CLI through the bridge. Start the app with execution enabled. The form also works without it.',
    es: 'La conversación usa el CLI mediante el bridge. Inicia la aplicación con la ejecución activada. El formulario también funciona sin él.',
  },
  'features.feature-title': {
    'pt-BR': 'Título da feature',
    en: 'Feature title',
    es: 'Título de la funcionalidad',
  },
  'features.area': {
    'pt-BR': 'ÁREA',
    en: 'AREA',
    es: 'ÁREA',
  },
  'features.priority': {
    'pt-BR': 'PRIORIDADE',
    en: 'PRIORITY',
    es: 'PRIORIDAD',
  },
  'features.p0-essential': {
    'pt-BR': 'P0 / Essencial',
    en: 'P0 / Essential',
    es: 'P0 / Esencial',
  },
  'features.p1-important': {
    'pt-BR': 'P1 / Importante',
    en: 'P1 / Important',
    es: 'P1 / Importante',
  },
  'features.p2-incremental': {
    'pt-BR': 'P2 / Incremento',
    en: 'P2 / Incremental',
    es: 'P2 / Incremental',
  },
  'features.dependencies': {
    'pt-BR': 'DEPENDÊNCIAS',
    en: 'DEPENDENCIES',
    es: 'DEPENDENCIAS',
  },
  'features.project-setup-is-the-first-feature-in-sprint-01-it-has-no-': {
    'pt-BR':
      'O setup do projeto é a primeira feature da Sprint 01: não depende de nenhuma outra, e todas as outras dependem dele.',
    en: 'Project setup is the first feature in Sprint 01: it has no dependencies, and every other feature depends on it.',
    es: 'La configuración es la primera funcionalidad del Sprint 01: no depende de ninguna otra y todas las demás dependen de ella.',
  },
  'features.delete-feature': {
    'pt-BR': 'Excluir feature',
    en: 'Delete feature',
    es: 'Eliminar funcionalidad',
  },
  'features.save-feature': {
    'pt-BR': 'Salvar feature',
    en: 'Save feature',
    es: 'Guardar funcionalidad',
  },
  'features.responsibility-distribution': {
    'pt-BR': 'Distribuição de responsabilidades',
    en: 'Responsibility distribution',
    es: 'Distribución de responsabilidades',
  },
  'features.the-commander-proposes-this-specialist-sequence-based-on-s': {
    'pt-BR':
      'O comandante propõe esta sequência de especialistas a partir do escopo. A distribuição abaixo é determinística: nenhum modelo de IA foi consultado.',
    en: 'The commander proposes this specialist sequence based on scope. This distribution is deterministic: no AI model was consulted.',
    es: 'El comandante propone esta secuencia de especialistas según el alcance. La distribución es determinista: no se consultó ningún modelo de IA.',
  },
  'features.execution-route-handoff': {
    'pt-BR': 'ROTA DE EXECUÇÃO / HANDOFF',
    en: 'EXECUTION ROUTE / HANDOFF',
    es: 'RUTA DE EJECUCIÓN / TRANSFERENCIA',
  },
  'features.ready-to-start': {
    'pt-BR': 'Pronta para iniciar.',
    en: 'Ready to start.',
    es: 'Lista para iniciar.',
  },
  'features.applying-the-plan-does-not-start-the-simulation-dependenci': {
    'pt-BR':
      'Aplicar o plano não inicia a simulação. Features com dependências aguardam aprovação das anteriores. Features sem especialistas suficientes permanecem em A fazer.',
    en: 'Applying the plan does not start the simulation. Dependencies must be approved first. Features without enough specialists stay in To do.',
    es: 'Aplicar el plan no inicia la simulación. Primero se deben aprobar las dependencias. Las funcionalidades sin suficientes especialistas permanecen en Por hacer.',
  },
  'features.discard': {
    'pt-BR': 'Descartar',
    en: 'Discard',
    es: 'Descartar',
  },
  'features.apply-plan': {
    'pt-BR': 'Aplicar plano',
    en: 'Apply plan',
    es: 'Aplicar plan',
  },
  'features.execution-plan': {
    'pt-BR': 'PLANO DE EXECUÇÃO',
    en: 'EXECUTION PLAN',
    es: 'PLAN DE EJECUCIÓN',
  },
  'features.waiting-for-dependencies': {
    'pt-BR': 'AGUARDA DEPENDÊNCIAS',
    en: 'WAITING FOR DEPENDENCIES',
    es: 'ESPERANDO DEPENDENCIAS',
  },
  'features.commander-s-instructions': {
    'pt-BR': 'Instruções do comandante',
    en: "Commander's instructions",
    es: 'Instrucciones del comandante',
  },
  'features.execute-plan': {
    'pt-BR': 'Executar plano',
    en: 'Execute plan',
    es: 'Ejecutar plan',
  },
  'features.acceptance-criteria': {
    'pt-BR': 'CRITÉRIOS DE ACEITAÇÃO',
    en: 'ACCEPTANCE CRITERIA',
    es: 'CRITERIOS DE ACEPTACIÓN',
  },
  'features.specialist-deliveries': {
    'pt-BR': 'ENTREGAS DOS ESPECIALISTAS',
    en: 'SPECIALIST DELIVERIES',
    es: 'ENTREGAS DE LOS ESPECIALISTAS',
  },
  'features.no-delivery-records-yet': {
    'pt-BR': 'Nenhum registro de entrega disponível ainda.',
    en: 'No delivery records yet.',
    es: 'Aún no hay registros de entrega.',
  },
  'features.delivery-review': {
    'pt-BR': 'REVISÃO DE ENTREGA',
    en: 'DELIVERY REVIEW',
    es: 'REVISIÓN DE ENTREGA',
  },
  'features.individual-spawn': {
    'pt-BR': 'SPAWN <span class=word-tag>INDIVIDUAL</span>',
    en: 'INDIVIDUAL <span class=word-tag>SPAWN</span>',
    es: 'EJECUCIÓN <span class=word-tag>INDIVIDUAL</span>',
  },
  'handoffs.new-handoff': {
    'pt-BR': 'NOVO <span class=word-tag>HANDOFF</span>',
    en: 'NEW <span class=word-tag>HANDOFF</span>',
    es: 'NUEVA <span class=word-tag>TRANSFERENCIA</span>',
  },
  'handoffs.activity-transfer-explicit-context': {
    'pt-BR': 'TRANSFERÊNCIA DE ATIVIDADE / CONTEXTO EXPLICITO',
    en: 'ACTIVITY TRANSFER / EXPLICIT CONTEXT',
    es: 'TRANSFERENCIA DE ACTIVIDAD / CONTEXTO EXPLÍCITO',
  },
  'handoffs.source-agent': {
    'pt-BR': 'AGENTE DE ORIGEM',
    en: 'SOURCE AGENT',
    es: 'AGENTE DE ORIGEN',
  },
  'handoffs.destination-agent': {
    'pt-BR': 'AGENTE DE DESTINO',
    en: 'DESTINATION AGENT',
    es: 'AGENTE DE DESTINO',
  },
  'handoffs.feature-activity': {
    'pt-BR': 'FEATURE / ATIVIDADE',
    en: 'FEATURE / ACTIVITY',
    es: 'FUNCIONALIDAD / ACTIVIDAD',
  },
  'handoffs.context-for-the-next-agent': {
    'pt-BR': 'CONTEXTO PARA O PRÓXIMO AGENTE',
    en: 'CONTEXT FOR THE NEXT AGENT',
    es: 'CONTEXTO PARA EL SIGUIENTE AGENTE',
  },
  'handoffs.what-was-decided-what-is-the-next-step-what-are-the-contra': {
    'pt-BR':
      'O que foi definido? Qual e o próximo passo? Quais sao os contratos, restrições e critérios?',
    en: 'What was decided? What is the next step? What are the contracts, restrictions and criteria?',
    es: '¿Qué se decidió? ¿Cuál es el siguiente paso? ¿Cuáles son los contratos, restricciones y criterios?',
  },
  'handoffs.this-handoff-replaces-the-feature-s-pending-route-with-sou': {
    'pt-BR':
      'Este handoff substitui a rota pendente da feature por Origem > Destino e preserva suas dependências. O registro é local; não inicia execução automaticamente.',
    en: "This handoff replaces the feature's pending route with Source > Destination and preserves dependencies. The record is local; execution does not start automatically.",
    es: 'Esta transferencia sustituye la ruta pendiente por Origen > Destino y conserva las dependencias. El registro es local y no inicia la ejecución automáticamente.',
  },
  'handoffs.record-handoff': {
    'pt-BR': 'Registrar handoff',
    en: 'Record handoff',
    es: 'Registrar transferencia',
  },
  'handoffs.handoff-network': {
    'pt-BR': 'REDE DE <span class=word-tag>HANDOFFS</span>',
    en: 'HANDOFF <span class=word-tag>NETWORK</span>',
    es: 'RED DE <span class=word-tag>TRANSFERENCIAS</span>',
  },
  'handoffs.the-task-moves-between-agents-while-context-travels-with-t': {
    'pt-BR':
      'A tarefa muda de agente, mas o contexto acompanha a entrega. Os registros abaixo pertencem à demonstração local.',
    en: 'The task moves between agents, while context travels with the delivery. The records below belong to the local demo.',
    es: 'La tarea cambia de agente y el contexto acompaña la entrega. Los registros siguientes pertenecen a la demostración local.',
  },
  'handoffs.new-handoff-268': {
    'pt-BR': 'Novo handoff',
    en: 'New handoff',
    es: 'Nueva transferencia',
  },
  'handoffs.no-transfers-yet': {
    'pt-BR': 'Nenhuma transferência ainda',
    en: 'No transfers yet',
    es: 'Aún no hay transferencias',
  },
  'handoffs.distribute-features-and-start-the-demo-or-configure-a-manu': {
    'pt-BR': 'Distribua as features e inicie a demonstração, ou configure um handoff manual.',
    en: 'Distribute features and start the demo, or configure a manual handoff.',
    es: 'Distribuye las funcionalidades e inicia la demostración o configura una transferencia manual.',
  },
  'handoffs.configure-handoff': {
    'pt-BR': 'Configurar handoff',
    en: 'Configure handoff',
    es: 'Configurar transferencia',
  },
  'map.chat': {
    'pt-BR': 'CONVERSAR',
    en: 'CHAT',
    es: 'CONVERSAR',
  },
  'map.move-273': {
    'pt-BR': 'DESLOCAR',
    en: 'MOVE',
    es: 'MOVER',
  },
  'map.edit': {
    'pt-BR': 'EDITAR',
    en: 'EDIT',
    es: 'EDITAR',
  },
  'map.squad-office': {
    'pt-BR': 'SQUAD / OFFICE',
    en: 'SQUAD / OFFICE',
    es: 'EQUIPO / OFICINA',
  },
  'map.pixel-office': {
    'pt-BR': 'ESCRITÓRIO PIXEL',
    en: 'PIXEL OFFICE',
    es: 'OFICINA PIXEL',
  },
  'map.edit-agent': {
    'pt-BR': 'Editar agente',
    en: 'Edit agent',
    es: 'Editar agente',
  },
  'map.department-to-visit': {
    'pt-BR': 'Departamento para visitar',
    en: 'Department to visit',
    es: 'Departamento para visitar',
  },
  'map.visit-department': {
    'pt-BR': 'Visitar departamento…',
    en: 'Visit department…',
    es: 'Visitar departamento…',
  },
  'map.map-controls': {
    'pt-BR': 'Controles do mapa',
    en: 'Map controls',
    es: 'Controles del mapa',
  },
  'map.view-pixel-art-office': {
    'pt-BR': 'Ver escritório pixel art',
    en: 'View pixel-art office',
    es: 'Ver oficina pixel art',
  },
  'map.switch-map-view': {
    'pt-BR': 'Alternar vista do mapa',
    en: 'Switch map view',
    es: 'Cambiar vista del mapa',
  },
  'map.switch-view': {
    'pt-BR': 'Alternar vista',
    en: 'Switch view',
    es: 'Cambiar vista',
  },
  'map.fold-into-a-planet': {
    'pt-BR': 'Dobrar em planeta',
    en: 'Fold into a planet',
    es: 'Convertir en planeta',
  },
  'map.map-zoom': {
    'pt-BR': 'Zoom do mapa',
    en: 'Map zoom',
    es: 'Zoom del mapa',
  },
  'map.zoom-in-on-map': {
    'pt-BR': 'Ampliar mapa',
    en: 'Zoom in on map',
    es: 'Acercar mapa',
  },
  'map.zoom-in': {
    'pt-BR': 'Ampliar',
    en: 'Zoom in',
    es: 'Acercar',
  },
  'map.zoom-out-of-map': {
    'pt-BR': 'Reduzir mapa',
    en: 'Zoom out of map',
    es: 'Alejar mapa',
  },
  'map.zoom-out': {
    'pt-BR': 'Reduzir',
    en: 'Zoom out',
    es: 'Alejar',
  },
  'map.center-map': {
    'pt-BR': 'Centralizar mapa',
    en: 'Center map',
    es: 'Centrar mapa',
  },
  'map.rotate-map-left': {
    'pt-BR': 'Girar mapa para a esquerda',
    en: 'Rotate map left',
    es: 'Girar mapa a la izquierda',
  },
  'map.rotate-left': {
    'pt-BR': 'Girar à esquerda',
    en: 'Rotate left',
    es: 'Girar a la izquierda',
  },
  'map.rotate-map-right': {
    'pt-BR': 'Girar mapa para a direita',
    en: 'Rotate map right',
    es: 'Girar mapa a la derecha',
  },
  'map.rotate-right': {
    'pt-BR': 'Girar à direita',
    en: 'Rotate right',
    es: 'Girar a la derecha',
  },
  'map.project-and-squad': {
    'pt-BR': 'Projeto e squad',
    en: 'Project and squad',
    es: 'Proyecto y equipo',
  },
  'map.handoff': {
    'pt-BR': 'FLUXO DE',
    en: 'HANDOFF',
    es: 'FLUJO DE',
  },
  'map.switch-or-create-project': {
    'pt-BR': 'Trocar ou criar projeto',
    en: 'Switch or create project',
    es: 'Cambiar o crear proyecto',
  },
  'map.double-click-to-chat': {
    'pt-BR': 'Duplo clique para conversar',
    en: 'Double-click to chat',
    es: 'Haz doble clic para conversar',
  },
  'map.selected-agent': {
    'pt-BR': 'Agente selecionado',
    en: 'Selected agent',
    es: 'Agente seleccionado',
  },
  'map.agent-profile': {
    'pt-BR': 'PERFIL DO AGENTE',
    en: 'AGENT PROFILE',
    es: 'PERFIL DEL AGENTE',
  },
  'map.effort': {
    'pt-BR': 'ESFORÇO',
    en: 'EFFORT',
    es: 'ESFUERZO',
  },
  'map.state': {
    'pt-BR': 'ESTADO',
    en: 'STATE',
    es: 'ESTADO',
  },
  'map.assigned-features': {
    'pt-BR': 'FEATURES ATRIBUÍDAS',
    en: 'ASSIGNED FEATURES',
    es: 'FUNCIONALIDADES ASIGNADAS',
  },
  'map.agent-production': {
    'pt-BR': 'PRODUÇÃO DO AGENTE',
    en: 'AGENT PRODUCTION',
    es: 'PRODUCCIÓN DEL AGENTE',
  },
  'map.view-all-features': {
    'pt-BR': 'Ver todas as features',
    en: 'View all features',
    es: 'Ver todas las funcionalidades',
  },
  'map.awaiting-distribution': {
    'pt-BR': 'Aguardando distribuição.',
    en: 'Awaiting distribution.',
    es: 'Esperando distribución.',
  },
  'map.the-commander-defines-the-squad-s-plan': {
    'pt-BR': 'O comandante define o plano do squad.',
    en: "The commander defines the squad's plan.",
    es: 'El comandante define el plan del equipo.',
  },
  'map.configure-handoff': {
    'pt-BR': 'CONFIGURAR HANDOFF',
    en: 'CONFIGURE HANDOFF',
    es: 'CONFIGURAR TRANSFERENCIA',
  },
  'map.distribute-features': {
    'pt-BR': 'DISTRIBUIR FEATURES',
    en: 'DISTRIBUTE FEATURES',
    es: 'DISTRIBUIR FUNCIONALIDADES',
  },
  'map.end-operation': {
    'pt-BR': 'ENCERRAR OPERAÇÃO',
    en: 'END OPERATION',
    es: 'FINALIZAR OPERACIÓN',
  },
  'map.operation-chat': {
    'pt-BR': 'CHAT DA OPERAÇÃO',
    en: 'OPERATION CHAT',
    es: 'CHAT DE LA OPERACIÓN',
  },
  'map.live-console': {
    'pt-BR': 'CONSOLE AO VIVO',
    en: 'LIVE CONSOLE',
    es: 'CONSOLA EN VIVO',
  },
  'map.local-simulation-no-ai-execution': {
    'pt-BR': 'SIMULAÇÃO LOCAL. SEM EXECUÇÃO DE IA.',
    en: 'LOCAL SIMULATION. NO AI EXECUTION.',
    es: 'SIMULACIÓN LOCAL. SIN EJECUCIÓN DE IA.',
  },
  'map.show-panels': {
    'pt-BR': 'MOSTRAR PAINÉIS',
    en: 'SHOW PANELS',
    es: 'MOSTRAR PANELES',
  },
  'operation-room.minimize-chat': {
    'pt-BR': 'Minimizar o chat',
    en: 'Minimize chat',
    es: 'Minimizar chat',
  },
  'operation-room.close-chat': {
    'pt-BR': 'Fechar o chat',
    en: 'Close chat',
    es: 'Cerrar chat',
  },
  'operation-room.squad': {
    'pt-BR': 'Squad',
    en: 'Squad',
    es: 'Equipo',
  },
  'operation-room.review': {
    'pt-BR': 'Revisar',
    en: 'Review',
    es: 'Revisar',
  },
  'operation-room.passed-the-baton-to': {
    'pt-BR': 'passou o bastão para',
    en: 'passed the baton to',
    es: 'pasó el relevo a',
  },
  'operation-room.when-you-run-a-sprint-or-feature-the-commander-prepares-th': {
    'pt-BR':
      'Quando você executar uma sprint ou uma feature, o comandante monta o plano aqui e a squad conversa enquanto trabalha.',
    en: 'When you run a sprint or feature, the commander prepares the plan here and the squad talks while working.',
    es: 'Al ejecutar un sprint o una funcionalidad, el comandante prepara el plan aquí y el equipo conversa mientras trabaja.',
  },
  'operation-room.approve-plan': {
    'pt-BR': 'Aprovar plano',
    en: 'Approve plan',
    es: 'Aprobar plan',
  },
  'operation-room.planning': {
    'pt-BR': 'Planejando',
    en: 'Planning',
    es: 'Planificando',
  },
  'operation-room.open-operation-chat': {
    'pt-BR': 'Abrir o chat da operação',
    en: 'Open operation chat',
    es: 'Abrir chat de la operación',
  },
  'operation-room.resize-chat': {
    'pt-BR': 'Redimensionar o chat',
    en: 'Resize chat',
    es: 'Redimensionar chat',
  },
  'projects.new-operation': {
    'pt-BR': 'NOVA <span class=word-tag>OPERAÇÃO</span>',
    en: 'NEW <span class=word-tag>OPERATION</span>',
    es: 'NUEVA <span class=word-tag>OPERACIÓN</span>',
  },
  'projects.project-name': {
    'pt-BR': 'NOME DO PROJETO',
    en: 'PROJECT NAME',
    es: 'NOMBRE DEL PROYECTO',
  },
  'projects.e-g-atlas-commerce': {
    'pt-BR': 'Ex.: Atlas Commerce',
    en: 'E.g. Atlas Commerce',
    es: 'Ej.: Atlas Commerce',
  },
  'projects.next-choose-the-squad-that-will-run-the-operation': {
    'pt-BR': 'Depois você escolhe a squad que vai executar a operação.',
    en: 'Next, choose the squad that will run the operation.',
    es: 'Después, elige el equipo que ejecutará la operación.',
  },
  'projects.who-will-execute': {
    'pt-BR': 'Quem vai executar',
    en: 'Who will execute',
    es: 'Quién ejecutará',
  },
  'projects.select-existing-squad': {
    'pt-BR': 'Selecionar squad existente',
    en: 'Select existing squad',
    es: 'Seleccionar equipo existente',
  },
  'projects.create-new-squad': {
    'pt-BR': 'Criar nova squad',
    en: 'Create new squad',
    es: 'Crear equipo nuevo',
  },
  'projects.assemble-commander-adr-prd-and-operators-in-squad-studio': {
    'pt-BR': 'Monte comandante, ADR, PRD e operadores no Squad Studio.',
    en: 'Assemble commander, ADR, PRD and operators in Squad Studio.',
    es: 'Monta el comandante, ADR, PRD y operadores en Squad Studio.',
  },
  'projects.squad-of': {
    'pt-BR': 'Squad de',
    en: 'Squad of',
    es: 'Equipo de',
  },
  'projects.operation-squad': {
    'pt-BR': 'SQUAD DA OPERAÇÃO',
    en: 'OPERATION SQUAD',
    es: 'EQUIPO DE LA OPERACIÓN',
  },
  'projects.required-the-operation-uses-the-entire-squad-commander-ana': {
    'pt-BR':
      'Obrigatório. A operação usa a squad inteira: comandante, reconhecedores e operadores. Squads incompletas não podem ser escolhidas; complete-as no Squad Studio.',
    en: 'Required. The operation uses the entire squad: commander, analysts and operators. Incomplete squads cannot be selected; complete them in Squad Studio.',
    es: 'Obligatorio. La operación usa el equipo completo: comandante, analistas y operadores. No se pueden seleccionar equipos incompletos; complétalos en Squad Studio.',
  },
  'projects.create-operation': {
    'pt-BR': 'Criar operação',
    en: 'Create operation',
    es: 'Crear operación',
  },
  'projects.online-squad-meeting-to-co-write-documents': {
    'pt-BR': 'Reunião online com a squad para co-escrever os documentos',
    en: 'Online squad meeting to co-write documents',
    es: 'Reunión en línea del equipo para coescribir documentos',
  },
  'projects.project-briefing': {
    'pt-BR': 'BRIEFING DO PROJETO',
    en: 'PROJECT BRIEFING',
    es: 'BRIEFING DEL PROYECTO',
  },
  'projects.co-write-the-briefing-in-agent-teams': {
    'pt-BR': 'Co-escrever o briefing no Agent Teams',
    en: 'Co-write the briefing in Agent Teams',
    es: 'Coescribir el briefing en Agent Teams',
  },
  'projects.goal-users-scope-constraints-and-definition-of-done': {
    'pt-BR': 'Objetivo, usuários, escopo, restrições e definição de pronto.',
    en: 'Goal, users, scope, constraints and definition of done.',
    es: 'Objetivo, usuarios, alcance, restricciones y definición de terminado.',
  },
  'projects.project-documentation': {
    'pt-BR': 'DOCUMENTAÇÃO DO PROJETO',
    en: 'PROJECT DOCUMENTATION',
    es: 'DOCUMENTACIÓN DEL PROYECTO',
  },
  'projects.when-exporting-for-codex-cli': {
    'pt-BR': 'na exportação para o Codex CLI.',
    en: 'when exporting for Codex CLI.',
    es: 'al exportar para Codex CLI.',
  },
  'projects.comes-from-squad-agent-guidelines-and': {
    'pt-BR': 'sai das diretrizes dos agentes da squad e',
    en: 'comes from squad agent guidelines and',
    es: 'proviene de las directrices de los agentes del equipo y',
  },
  'projects.from-operation-features-click-the-portraits-to-open': {
    'pt-BR': 'das features da operação. Clique nos retratos para abrir o',
    en: 'from operation features. Click the portraits to open',
    es: 'de las funcionalidades de la operación. Haz clic en los retratos para abrir',
  },
  'projects.an-online-meeting-with-the-commander-prd-and-adr-analysts-': {
    'pt-BR':
      ': uma reunião online com o comandante e os reconhecedores PRD e ADR em que vocês co-escrevem o briefing, a visão, o escopo, o glossário e a arquitetura conversando.',
    en: ': an online meeting with the commander, PRD and ADR analysts to co-write the briefing, vision, scope, glossary and architecture through conversation.',
    es: ': una reunión en línea con el comandante y los analistas PRD y ADR para coescribir el briefing, la visión, el alcance, el glosario y la arquitectura conversando.',
  },
  'projects.in-scope-one-per-line': {
    'pt-BR': 'DENTRO DO ESCOPO / UM POR LINHA',
    en: 'IN SCOPE / ONE PER LINE',
    es: 'DENTRO DEL ALCANCE / UNO POR LÍNEA',
  },
  'projects.out-of-scope-one-per-line': {
    'pt-BR': 'FORA DO ESCOPO / UM POR LINHA',
    en: 'OUT OF SCOPE / ONE PER LINE',
    es: 'FUERA DEL ALCANCE / UNO POR LÍNEA',
  },
  'projects.overview': {
    'pt-BR': 'VISÃO GERAL',
    en: 'OVERVIEW',
    es: 'VISTA GENERAL',
  },
  'projects.adr-status': {
    'pt-BR': 'Status do ADR',
    en: 'ADR status',
    es: 'Estado del ADR',
  },
  'projects.projects-and-operations': {
    'pt-BR': 'Projetos e operações',
    en: 'Projects and operations',
    es: 'Proyectos y operaciones',
  },
  'projects.operations': {
    'pt-BR': '& OPERAÇÕES.',
    en: '& OPERATIONS.',
    es: 'Y OPERACIONES.',
  },
  'projects.create-operations-write-the-briefing-and-define-the-featur': {
    'pt-BR': 'Crie operações, escreva o briefing e defina as features que o squad vai desenvolver.',
    en: 'Create operations, write the briefing and define the features the squad will develop.',
    es: 'Crea operaciones, escribe el briefing y define las funcionalidades que desarrollará el equipo.',
  },
  'projects.new-operation-374': {
    'pt-BR': 'NOVA OPERAÇÃO',
    en: 'NEW OPERATION',
    es: 'NUEVA OPERACIÓN',
  },
  'projects.running': {
    'pt-BR': 'EM EXECUÇÃO',
    en: 'RUNNING',
    es: 'EN EJECUCIÓN',
  },
  'projects.open-in-squad': {
    'pt-BR': 'Abrir no squad',
    en: 'Open in squad',
    es: 'Abrir en el equipo',
  },
  'projects.01-briefing': {
    'pt-BR': '01 / BRIEFING',
    en: '01 / BRIEFING',
    es: '01 / BRIEFING',
  },
  'projects.operation-context': {
    'pt-BR': 'Contexto da operação',
    en: 'Operation context',
    es: 'Contexto de la operación',
  },
  'projects.save-project': {
    'pt-BR': 'Salvar projeto',
    en: 'Save project',
    es: 'Guardar proyecto',
  },
  'projects.02-sprints-and-features': {
    'pt-BR': '02 / SPRINTS E FEATURES',
    en: '02 / SPRINTS AND FEATURES',
    es: '02 / SPRINTS Y FUNCIONALIDADES',
  },
  'projects.what-will-be-developed': {
    'pt-BR': 'O que será desenvolvido',
    en: 'What will be developed',
    es: 'Qué se desarrollará',
  },
  'projects.new-sprint': {
    'pt-BR': 'Nova sprint',
    en: 'New sprint',
    es: 'Nuevo sprint',
  },
  'projects.distribute-features': {
    'pt-BR': 'Distribuir features',
    en: 'Distribute features',
    es: 'Distribuir funcionalidades',
  },
  'projects.execution-blocked': {
    'pt-BR': 'Execução bloqueada.',
    en: 'Execution blocked.',
    es: 'Ejecución bloqueada.',
  },
  'projects.complete-project': {
    'pt-BR': 'Completar projeto',
    en: 'Complete project',
    es: 'Completar proyecto',
  },
  'projects.search-features': {
    'pt-BR': 'Buscar features...',
    en: 'Search features...',
    es: 'Buscar funcionalidades...',
  },
  'projects.search-features-392': {
    'pt-BR': 'Buscar features',
    en: 'Search features',
    es: 'Buscar funcionalidades',
  },
  'projects.view-mode': {
    'pt-BR': 'Modo de visualização',
    en: 'View mode',
    es: 'Modo de visualización',
  },
  'projects.no-features': {
    'pt-BR': 'SEM FEATURES',
    en: 'NO FEATURES',
    es: 'SIN FUNCIONALIDADES',
  },
  'projects.no-features-match-your-search': {
    'pt-BR': 'Nenhuma feature encontrada para a busca.',
    en: 'No features match your search.',
    es: 'No se encontraron funcionalidades para la búsqueda.',
  },
  'projects.current': {
    'pt-BR': 'ATUAL',
    en: 'CURRENT',
    es: 'ACTUAL',
  },
  'projects.new-feature-in-this-sprint': {
    'pt-BR': 'Nova feature nesta sprint',
    en: 'New feature in this sprint',
    es: 'Nueva funcionalidad en este sprint',
  },
  'projects.edit-sprint': {
    'pt-BR': 'Editar sprint',
    en: 'Edit sprint',
    es: 'Editar sprint',
  },
  'projects.delete-sprint-empty-only': {
    'pt-BR': 'Excluir sprint (só vazia)',
    en: 'Delete sprint (empty only)',
    es: 'Eliminar sprint (solo vacío)',
  },
  'projects.no-route': {
    'pt-BR': 'SEM ROTA',
    en: 'NO ROUTE',
    es: 'SIN RUTA',
  },
  'projects.run-this-feature-shows-the-distribution-plan-first': {
    'pt-BR': 'Executar esta feature (mostra o plano de distribuição antes)',
    en: 'Run this feature (shows the distribution plan first)',
    es: 'Ejecutar esta funcionalidad (muestra primero el plan de distribución)',
  },
  'projects.edit-details': {
    'pt-BR': 'Editar / detalhar',
    en: 'Edit / details',
    es: 'Editar / detalles',
  },
  'projects.drag-features-here-or-create-one-with-the-button': {
    'pt-BR': 'Arraste features para cá ou crie uma nova com o botão +.',
    en: 'Drag features here or create one with the + button.',
    es: 'Arrastra funcionalidades aquí o crea una con el botón +.',
  },
  'projects.feature-details': {
    'pt-BR': 'Detalhe da feature',
    en: 'Feature details',
    es: 'Detalle de la funcionalidad',
  },
  'projects.delivery-review': {
    'pt-BR': 'Revisão de entrega',
    en: 'Delivery review',
    es: 'Revisión de entrega',
  },
  'projects.close-details': {
    'pt-BR': 'Fechar detalhe',
    en: 'Close details',
    es: 'Cerrar detalle',
  },
  'projects.sprint-name': {
    'pt-BR': 'NOME DA SPRINT',
    en: 'SPRINT NAME',
    es: 'NOMBRE DEL SPRINT',
  },
  'projects.goal': {
    'pt-BR': 'OBJETIVO',
    en: 'GOAL',
    es: 'OBJETIVO',
  },
  'projects.save-sprint': {
    'pt-BR': 'Salvar sprint',
    en: 'Save sprint',
    es: 'Guardar sprint',
  },
  'settings.workspace-settings': {
    'pt-BR': 'CONFIGURAÇÕES DO <span class=word-tag>WORKSPACE</span>',
    en: '<span class=word-tag>WORKSPACE</span> SETTINGS',
    es: 'CONFIGURACIÓN DEL <span class=word-tag>WORKSPACE</span>',
  },
  'settings.settings-sections': {
    'pt-BR': 'Seções das configurações',
    en: 'Settings sections',
    es: 'Secciones de configuración',
  },
  'settings.workspace-interface-language': {
    'pt-BR': 'Idioma da interface do workspace.',
    en: 'Workspace interface language.',
    es: 'Idioma de la interfaz del workspace.',
  },
  'settings.export-workspace': {
    'pt-BR': 'Exportar workspace',
    en: 'Export workspace',
    es: 'Exportar workspace',
  },
  'settings.json-backup-with-agents-portraits-prompts-projects-feature': {
    'pt-BR':
      'Backup JSON com agentes, retratos, prompts, projetos, features, histórico e configurações do runtime.',
    en: 'JSON backup with agents, portraits, prompts, projects, features, history and runtime settings.',
    es: 'Copia JSON con agentes, retratos, instrucciones, proyectos, funcionalidades, historial y configuración del runtime.',
  },
  'settings.restores-a-json-backup-after-confirmation-replaces-current': {
    'pt-BR':
      'Restaura um backup JSON após confirmação. Substitui os dados atuais, que ficam nas versões salvas.',
    en: 'Restores a JSON backup after confirmation. Replaces current data, which remain in saved versions.',
    es: 'Restaura una copia JSON tras confirmar. Sustituye los datos actuales, que permanecen en las versiones guardadas.',
  },
  'settings.reset-workspace': {
    'pt-BR': 'Reiniciar workspace',
    en: 'Reset workspace',
    es: 'Reiniciar workspace',
  },
  'settings.removes-changes-in-this-workspace-and-restores-the-atlas-c': {
    'pt-BR': 'Remove alterações deste workspace e restaura o projeto Atlas Commerce.',
    en: 'Removes changes in this workspace and restores the Atlas Commerce project.',
    es: 'Elimina los cambios de este workspace y restaura el proyecto Atlas Commerce.',
  },
  'settings.reset': {
    'pt-BR': 'Reiniciar',
    en: 'Reset',
    es: 'Reiniciar',
  },
  'settings.saved-versions': {
    'pt-BR': 'Versões salvas',
    en: 'Saved versions',
    es: 'Versiones guardadas',
  },
  'settings.the-database-saves-workspace-versions-before-imports-and-r': {
    'pt-BR': 'O banco guarda versões do workspace antes de importações e restaurações.',
    en: 'The database saves workspace versions before imports and restores.',
    es: 'La base de datos guarda versiones del workspace antes de importar o restaurar.',
  },
  'settings.no-versions-yet': {
    'pt-BR': 'Nenhuma versão ainda.',
    en: 'No versions yet.',
    es: 'Aún no hay versiones.',
  },
  'settings.the-workspace-operation-room-conversations-and-run-history': {
    'pt-BR':
      'O workspace, a sala da operação, as conversas e o histórico de execuções ficam no banco SQLite local',
    en: 'The workspace, operation room, conversations and run history are stored in the local SQLite database',
    es: 'El workspace, la sala de operación, las conversaciones y el historial se guardan en la base de datos SQLite local',
  },
  'settings.do-not-put-credentials-in-prompts-or-the-briefing': {
    'pt-BR': '. Não coloque credenciais nos prompts ou no briefing.',
    en: '. Do not put credentials in prompts or the briefing.',
    es: '. No incluyas credenciales en las instrucciones ni en el briefing.',
  },
  'settings.these-settings-apply-to-all-agents-codex-devin-and-antigra': {
    'pt-BR':
      'Estas configurações valem para todos os agentes, Codex, Devin e Antigravity. Escolha o provedor no perfil de cada agente.',
    en: "These settings apply to all agents: Codex, Devin and Antigravity. Choose the provider in each agent's profile.",
    es: 'Esta configuración se aplica a todos los agentes: Codex, Devin y Antigravity. Elige el proveedor en el perfil de cada agente.',
  },
  'settings.agent-execution': {
    'pt-BR': 'EXECUÇÃO DOS AGENTES',
    en: 'AGENT EXECUTION',
    es: 'EJECUCIÓN DE LOS AGENTES',
  },
  'settings.live-execution-codex-devin-and-antigravity': {
    'pt-BR': 'Execução real (Codex, Devin e Antigravity)',
    en: 'Live execution (Codex, Devin and Antigravity)',
    es: 'Ejecución real (Codex, Devin y Antigravity)',
  },
  'settings.local-simulation-demo': {
    'pt-BR': 'Simulação local (demo)',
    en: 'Local simulation (demo)',
    es: 'Simulación local (demo)',
  },
  'settings.time-limit-per-stage-s': {
    'pt-BR': 'TEMPO LIMITE POR ETAPA (S)',
    en: 'TIME LIMIT PER STAGE (S)',
    es: 'TIEMPO LÍMITE POR ETAPA (S)',
  },
  'settings.concurrent-bridge-runs': {
    'pt-BR': 'EXECUÇÕES SIMULTÂNEAS NO BRIDGE',
    en: 'CONCURRENT BRIDGE RUNS',
    es: 'EJECUCIONES SIMULTÁNEAS EN EL BRIDGE',
  },
  'settings.delay-between-stages': {
    'pt-BR': 'INTERVALO ENTRE ETAPAS',
    en: 'DELAY BETWEEN STAGES',
    es: 'INTERVALO ENTRE ETAPAS',
  },
  'settings.fast-0-6-s': {
    'pt-BR': 'Rápida / 0,6 s',
    en: 'Fast / 0.6 s',
    es: 'Rápido / 0,6 s',
  },
  'settings.agile-1-s': {
    'pt-BR': 'Ágil / 1 s',
    en: 'Agile / 1 s',
    es: 'Ágil / 1 s',
  },
  'settings.normal-1-8-s': {
    'pt-BR': 'Normal / 1,8 s',
    en: 'Normal / 1.8 s',
    es: 'Normal / 1,8 s',
  },
  'settings.slow-3-2-s': {
    'pt-BR': 'Lenta / 3,2 s',
    en: 'Slow / 3.2 s',
    es: 'Lento / 3,2 s',
  },
  'settings.pause-between-stages-in-simulation-defines-each-stage-s-du': {
    'pt-BR': 'Pausa entre etapas. Na simulação, define a duração de cada etapa.',
    en: "Pause between stages. In simulation, defines each stage's duration.",
    es: 'Pausa entre etapas. En la simulación, define la duración de cada etapa.',
  },
  'settings.projects-folder': {
    'pt-BR': 'PASTA DOS PROJETOS',
    en: 'PROJECTS FOLDER',
    es: 'CARPETA DE LOS PROYECTOS',
  },
  'settings.each-operation-works-in-its-own-folder-inside': {
    'pt-BR': 'Cada operação trabalha na sua própria pasta dentro de',
    en: 'Each operation works in its own folder inside',
    es: 'Cada operación trabaja en su propia carpeta dentro de',
  },
  'settings.created-on-the-first-run-agents-read-and-write-files-there': {
    'pt-BR':
      ', criada na primeira execução. É lá que os agentes leem e escrevem os arquivos. Esta operação:',
    en: ', created on the first run. Agents read and write files there. This operation:',
    es: ', creada en la primera ejecución. Allí los agentes leen y escriben archivos. Esta operación:',
  },
  'settings.bridge-connected-to': {
    'pt-BR': 'Bridge conectado ao',
    en: 'Bridge connected to',
    es: 'Bridge conectado a',
  },
  'settings.name-in-path-or-full-path-e-g-devin-exe-from-devin-desktop': {
    'pt-BR':
      'Nome no PATH ou caminho completo — ex.: o devin.exe que vem com o Devin Desktop. Vazio = padrão do bridge.',
    en: 'Name in PATH or full path, e.g. devin.exe from Devin Desktop. Empty = bridge default.',
    es: 'Nombre en PATH o ruta completa, ej.: devin.exe de Devin Desktop. Vacío = predeterminado del bridge.',
  },
  'settings.use-the-agy-exe-cli-antigravity-exe-is-the-desktop-applica': {
    'pt-BR': 'Use o CLI agy.exe; Antigravity.exe é o aplicativo de desktop.',
    en: 'Use the agy.exe CLI; Antigravity.exe is the desktop application.',
    es: 'Usa el CLI agy.exe; Antigravity.exe es la aplicación de escritorio.',
  },
  'settings.name-in-path-or-full-path-empty-bridge-default': {
    'pt-BR': 'Nome no PATH ou caminho completo. Vazio = padrão do bridge.',
    en: 'Name in PATH or full path. Empty = bridge default.',
    es: 'Nombre en PATH o ruta completa. Vacío = predeterminado del bridge.',
  },
  'settings.native-devin-cli-mode-permission-mode-used-by-devin-agents': {
    'pt-BR': 'Modo nativo do Devin CLI (--permission-mode) usado pelos agentes Devin.',
    en: 'Native Devin CLI mode (--permission-mode) used by Devin agents.',
    es: 'Modo nativo de Devin CLI (--permission-mode) usado por los agentes Devin.',
  },
  'settings.read-only-and-plan-expose-only-reading-tools-actions-requi': {
    'pt-BR':
      'read-only e plan disponibilizam apenas ferramentas de leitura. Ações que exigem aprovação são negadas na execução sem interação.',
    en: 'read-only and plan expose only reading tools. Actions requiring approval are denied in non-interactive runs.',
    es: 'read-only y plan ofrecen solo herramientas de lectura. Las acciones que requieren aprobación se deniegan en ejecuciones sin interacción.',
  },
  'settings.model-overrides-codex-agents': {
    'pt-BR': 'MODELO (SOBRESCREVE AGENTES CODEX)',
    en: 'MODEL (OVERRIDES CODEX AGENTS)',
    es: 'MODELO (SOBRESCRIBE AGENTES CODEX)',
  },
  'settings.empty-each-agent-s-model': {
    'pt-BR': 'vazio = modelo de cada agente',
    en: "empty = each agent's model",
    es: 'vacío = modelo de cada agente',
  },
  'settings.effort-overrides-codex-agents': {
    'pt-BR': 'ESFORÇO (SOBRESCREVE AGENTES CODEX)',
    en: 'EFFORT (OVERRIDES CODEX AGENTS)',
    es: 'ESFUERZO (SOBRESCRIBE AGENTES CODEX)',
  },
  'settings.empty-each-agent-s-effort': {
    'pt-BR': 'Vazio = esforço de cada agente',
    en: "Empty = each agent's effort",
    es: 'Vacío = esfuerzo de cada agente',
  },
  'settings.additional-directories-add-dir': {
    'pt-BR': 'DIRETÓRIOS ADICIONAIS (--add-dir)',
    en: 'ADDITIONAL DIRECTORIES (--add-dir)',
    es: 'DIRECTORIOS ADICIONALES (--add-dir)',
  },
  'settings.comma-separated': {
    'pt-BR': 'Separados por vírgula',
    en: 'Comma-separated',
    es: 'Separados por comas',
  },
  'settings.model-catalog': {
    'pt-BR': 'CATÁLOGO DE MODELOS',
    en: 'MODEL CATALOG',
    es: 'CATÁLOGO DE MODELOS',
  },
  'settings.models-appear-in-the-model-field-of-each-agent-using-devin': {
    'pt-BR': 'Os modelos aparecem no campo MODELO do perfil de cada agente com provedor Devin CLI.',
    en: 'Models appear in the MODEL field of each agent using Devin CLI.',
    es: 'Los modelos aparecen en el campo MODELO de cada agente que usa Devin CLI.',
  },
  'settings.select-provider-model-and-compatible-effort-in-the-agent-s': {
    'pt-BR': 'Selecione provedor, modelo e esforço compatível no perfil do agente.',
    en: "Select provider, model and compatible effort in the agent's profile.",
    es: 'Selecciona proveedor, modelo y esfuerzo compatible en el perfil del agente.',
  },
  'settings.terminal-call-preview': {
    'pt-BR': 'PREVIEW DA CHAMADA NO TERMINAL',
    en: 'TERMINAL CALL PREVIEW',
    es: 'VISTA PREVIA DE LA LLAMADA AL TERMINAL',
  },
  'settings.preview-agent': {
    'pt-BR': 'Agente do preview',
    en: 'Preview agent',
    es: 'Agente de la vista previa',
  },
  'settings.preview-shell': {
    'pt-BR': 'Shell do preview',
    en: 'Preview shell',
    es: 'Shell de la vista previa',
  },
  'settings.copy': {
    'pt-BR': 'Copiar',
    en: 'Copy',
    es: 'Copiar',
  },
  'settings.preview-of-the-call-and-its-options-the-stage-prompt-and-p': {
    'pt-BR':
      'Prévia da chamada e de suas opções. O prompt da etapa e os perfis são preparados pelo bridge na execução.',
    en: 'Preview of the call and its options. The stage prompt and profiles are prepared by the bridge at execution time.',
    es: 'Vista previa de la llamada y sus opciones. El bridge prepara las instrucciones de la etapa y los perfiles al ejecutar.',
  },
  'settings.codex-cli-uses-existing-authentication-and-codex-config-to': {
    'pt-BR':
      'O Codex CLI usa a autenticação existente e ~/.codex/config.toml. Modelo, esforço, sandbox e diretórios escolhidos nesta tela valem apenas para a execução. O app não altera suas credenciais ou configurações pessoais. Os especialistas ficam em projects/<operação>/.codex/agents/.',
    en: 'Codex CLI uses existing authentication and ~/.codex/config.toml. Model, effort, sandbox and directory choices apply only to the run. The app does not change credentials or personal settings. Specialists are stored in projects/<operation>/.codex/agents/.',
    es: 'Codex CLI usa la autenticación existente y ~/.codex/config.toml. El modelo, esfuerzo, sandbox y directorios se aplican solo a la ejecución. La aplicación no cambia credenciales ni ajustes personales. Los especialistas están en projects/<operación>/.codex/agents/.',
  },
  'squads.luma-hive-chain-of-command': {
    'pt-BR': 'LUMA HIVE / CADEIA DE COMANDO',
    en: 'LUMA HIVE / CHAIN OF COMMAND',
    es: 'LUMA HIVE / CADENA DE MANDO',
  },
  'squads.every-squad-has-1-commander-2-analysts-adr-and-prd-and-spe': {
    'pt-BR':
      'Toda squad tem 1 comandante, 2 reconhecedores (ADR e PRD) e operadores especialistas. Clique em uma posição da árvore para escolher o agente.',
    en: 'Every squad has 1 commander, 2 analysts (ADR and PRD) and specialist operators. Click a tree position to choose the agent.',
    es: 'Cada equipo tiene 1 comandante, 2 analistas (ADR y PRD) y operadores especialistas. Haz clic en una posición del árbol para elegir el agente.',
  },
  'squads.new-squad': {
    'pt-BR': 'NOVA SQUAD',
    en: 'NEW SQUAD',
    es: 'NUEVO EQUIPO',
  },
  'squads.e-g-squad-alpha': {
    'pt-BR': 'Ex.: SQUAD ALPHA',
    en: 'E.g. SQUAD ALPHA',
    es: 'Ej.: EQUIPO ALPHA',
  },
  'squads.unsaved-changes': {
    'pt-BR': 'ALTERAÇÕES NÃO SALVAS',
    en: 'UNSAVED CHANGES',
    es: 'CAMBIOS SIN GUARDAR',
  },
  'squads.squad-hierarchy': {
    'pt-BR': 'Hierarquia da squad',
    en: 'Squad hierarchy',
    es: 'Jerarquía del equipo',
  },
  'squads.show-photos-icons': {
    'pt-BR': 'Mostrar fotos / ícones',
    en: 'Show photos / icons',
    es: 'Mostrar fotos / iconos',
  },
  'squads.01-command': {
    'pt-BR': '01 / COMANDO',
    en: '01 / COMMAND',
    es: '01 / MANDO',
  },
  'squads.receives-the-briefing-makes-decisions-and-delegates': {
    'pt-BR': 'RECEBE O BRIEFING, TOMA DECISÕES E DELEGA',
    en: 'RECEIVES THE BRIEFING, MAKES DECISIONS AND DELEGATES',
    es: 'RECIBE EL BRIEFING, TOMA DECISIONES Y DELEGA',
  },
  'squads.02-intelligence': {
    'pt-BR': '02 / INTELIGÊNCIA',
    en: '02 / INTELLIGENCE',
    es: '02 / INTELIGENCIA',
  },
  'squads.turns-requirements-and-context-into-a-mission-plan': {
    'pt-BR': 'TRANSFORMA REQUISITOS E CONTEXTO EM PLANO DE MISSÃO',
    en: 'TURNS REQUIREMENTS AND CONTEXT INTO A MISSION PLAN',
    es: 'TRANSFORMA REQUISITOS Y CONTEXTO EN UN PLAN DE MISIÓN',
  },
  'squads.03-operators': {
    'pt-BR': '03 / OPERADORES',
    en: '03 / OPERATORS',
    es: '03 / OPERADORES',
  },
  'squads.back-to-specialties': {
    'pt-BR': 'Voltar para as especialidades',
    en: 'Back to specialties',
    es: 'Volver a las especialidades',
  },
  'squads.specialties': {
    'pt-BR': 'Especialidades',
    en: 'Specialties',
    es: 'Especialidades',
  },
  'squads.close-picker': {
    'pt-BR': 'Fechar seletor',
    en: 'Close picker',
    es: 'Cerrar selector',
  },
  'squads.previous': {
    'pt-BR': 'Anterior',
    en: 'Previous',
    es: 'Anterior',
  },
  'squads.position-options': {
    'pt-BR': 'Opções para a posição',
    en: 'Position options',
    es: 'Opciones para la posición',
  },
  'squads.next': {
    'pt-BR': 'Próximo',
    en: 'Next',
    es: 'Siguiente',
  },
  'squads.agent-instructions': {
    'pt-BR': 'INSTRUÇÕES DO AGENTE',
    en: 'AGENT INSTRUCTIONS',
    es: 'INSTRUCCIONES DEL AGENTE',
  },
  'squads.see-more': {
    'pt-BR': 'VER MAIS',
    en: 'SEE MORE',
    es: 'VER MÁS',
  },
  'squads.use-to-navigate-enter-to-choose-and-esc-to-close': {
    'pt-BR': 'Use ← → para navegar, Enter para escolher e Esc para fechar.',
    en: 'Use ← → to navigate, Enter to choose and Esc to close.',
    es: 'Usa ← → para navegar, Enter para elegir y Esc para cerrar.',
  },
  'shell.view': {
    'pt-BR': 'Visualizar',
    en: 'View',
    es: 'Visualizar',
  },
  'appearance.agents.title': {
    'pt-BR': 'Visual dos agentes',
    en: 'Agent appearance',
    es: 'Apariencia de los agentes',
  },
  'appearance.agents.description': {
    'pt-BR':
      'Escolha retratos originais ou pixel art. Independente do tema da interface e do mapa. Fotos importadas mantêm o original.',
    en: 'Choose original or pixel-art portraits. Independent of interface and map themes. Uploaded photos keep their original image.',
    es: 'Elige retratos originales o pixel art. Independiente del tema de la interfaz y del mapa. Las fotos importadas mantienen el original.',
  },
  'appearance.agents.original': {
    'pt-BR': 'Original',
    en: 'Original',
    es: 'Original',
  },
  'appearance.agents.pixel': {
    'pt-BR': 'Pixel art',
    en: 'Pixel art',
    es: 'Pixel art',
  },
  'ui.completed': {
    'pt-BR': 'CONCLUÍDAS',
    en: 'COMPLETED',
    es: 'COMPLETADAS',
  },
  'ui.operation': {
    'pt-BR': 'operação,',
    en: 'operation,',
    es: 'operación,',
  },
  'ui.agents-recent-activity': {
    'pt-BR': 'agentes · atividade recente.',
    en: 'agents · recent activity.',
    es: 'agentes · actividad reciente.',
  },
  'ui.architecture-overview': {
    'pt-BR': 'Visão de arquitetura',
    en: 'Architecture overview',
    es: 'Visión de arquitectura',
  },
  'ui.adrs': {
    'pt-BR': 'os ADRs',
    en: 'ADRs',
    es: 'los ADR',
  },
  'ui.vision': {
    'pt-BR': 'VISÃO',
    en: 'VISION',
    es: 'VISIÓN',
  },
  'ui.you': {
    'pt-BR': '(você)',
    en: '(you)',
    es: '(tú)',
  },
  'ui.in-meeting': {
    'pt-BR': '(na reunião)',
    en: '(in meeting)',
    es: '(en la reunión)',
  },
  'ui.the-operation-squad-needs-a-commander': {
    'pt-BR': 'A squad da operação precisa de um comandante.',
    en: 'The operation squad needs a commander.',
    es: 'El equipo de la operación necesita un comandante.',
  },
  'ui.write-the-briefing-before-distributing-features': {
    'pt-BR': 'Escreva o briefing antes de distribuir features.',
    en: 'Write the briefing before distributing features.',
    es: 'Escribe el briefing antes de distribuir funcionalidades.',
  },
  'ui.no-features-need-distribution-review-the-deliveries': {
    'pt-BR': 'Não há features pendentes de distribuição. Revise as entregas.',
    en: 'No features need distribution. Review the deliveries.',
    es: 'No hay funcionalidades pendientes de distribución. Revisa las entregas.',
  },
  'ui.the-route-contains-an-unavailable-agent-redistribute-th': {
    'pt-BR': 'A rota contém um agente indisponível. Redistribua a feature.',
    en: 'The route contains an unavailable agent. Redistribute the feature.',
    es: 'La ruta contiene un agente no disponible. Redistribuye la funcionalidad.',
  },
  'ui.execution-paused-by-the-operator': {
    'pt-BR': 'Execução pausada pelo operador.',
    en: 'Execution paused by the operator.',
    es: 'Ejecución pausada por el operador.',
  },
  'ui.execution-resumed': {
    'pt-BR': 'Execução retomada.',
    en: 'Execution resumed.',
    es: 'Ejecución reanudada.',
  },
  'ui.create-a-sprint-before-executing': {
    'pt-BR': 'Crie uma sprint antes de executar.',
    en: 'Create a sprint before executing.',
    es: 'Crea un sprint antes de ejecutar.',
  },
  'ui.no-pending-features-review-the-deliveries': {
    'pt-BR': 'Não há features pendentes. Revise as entregas.',
    en: 'No pending features. Review the deliveries.',
    es: 'No hay funcionalidades pendientes. Revisa las entregas.',
  },
  'ui.waiting-for': {
    'pt-BR': 'Aguarda',
    en: 'Waiting for',
    es: 'Esperando',
  },
  'ui.response-contains-no-valid-plan': {
    'pt-BR': 'Resposta sem um plano válido.',
    en: 'Response contains no valid plan.',
    es: 'La respuesta no contiene un plan válido.',
  },
  'ui.the-commander-could-not-plan': {
    'pt-BR': 'O comandante não conseguiu planejar (',
    en: 'The commander could not plan (',
    es: 'El comandante no pudo planificar (',
  },
  'ui.used-the-squad-s-default-distribution': {
    'pt-BR': '). Usei a distribuição padrão da squad.',
    en: "). Used the squad's default distribution.",
    es: '). Se usó la distribución predeterminada del equipo.',
  },
  'ui.no-feature-has-enough-specialists-for-a-route-complete-': {
    'pt-BR':
      'Nenhuma feature tem especialistas na squad para montar uma rota. Complete a squad no Squad Studio.',
    en: 'No feature has enough specialists for a route. Complete the squad in Squad Studio.',
    es: 'Ninguna funcionalidad tiene suficientes especialistas para una ruta. Completa el equipo en Squad Studio.',
  },
  'ui.plan-ready-for': {
    'pt-BR': 'Plano pronto para',
    en: 'Plan ready for',
    es: 'Plan listo para',
  },
  'ui.features-with-routes-review-the-instructions-and-approv': {
    'pt-BR': 'features com rota. Confere as instruções e aprova que eu solto a squad.',
    en: 'features with routes. Review the instructions and approve to release the squad.',
    es: 'funcionalidades con ruta. Revisa las instrucciones y aprueba para iniciar el equipo.',
  },
  'ui.approved-you-may-execute': {
    'pt-BR': 'Aprovado. Podem executar.',
    en: 'Approved. You may execute.',
    es: 'Aprobado. Pueden ejecutar.',
  },
  'ui.starts-with-you-route': {
    'pt-BR': ') começa com você. Rota:',
    en: ') starts with you. Route:',
    es: ') comienza contigo. Ruta:',
  },
  'ui.i-took': {
    'pt-BR': 'Peguei a',
    en: 'I took',
    es: 'Tomé',
  },
  'ui.starting': {
    'pt-BR': 'Começando a',
    en: 'Starting',
    es: 'Empezando',
  },
  'ui.completed-the-route-the-delivery-is-ready-for-your-revi': {
    'pt-BR':
      'fechou a rota. A entrega está com você para revisão; aprovar libera quem depende dela.',
    en: 'completed the route. The delivery is ready for your review; approval releases its dependents.',
    es: 'completó la ruta. La entrega espera tu revisión; aprobarla libera sus dependencias.',
  },
  'ui.run-cancelled': {
    'pt-BR': 'Run cancelled',
    en: 'Run cancelled',
    es: 'Ejecución cancelada',
  },
  'ui.connection-to-running-cli-lost': {
    'pt-BR': 'Connection to running CLI lost',
    en: 'Connection to running CLI lost',
    es: 'Se perdió la conexión con el CLI en ejecución',
  },
  'ui.plan-cancelled-no-features-were-changed': {
    'pt-BR': 'Plano cancelado. Nenhuma feature foi alterada.',
    en: 'Plan cancelled. No features were changed.',
    es: 'Plan cancelado. No se modificó ninguna funcionalidad.',
  },
  'ui.operation-ended-by-the-operator': {
    'pt-BR': 'Operação encerrada pelo operador.',
    en: 'Operation ended by the operator.',
    es: 'Operación finalizada por el operador.',
  },
  'ui.connection-lost-open-the-console-or-stop-the-run': {
    'pt-BR': 'Connection lost. Open the console or stop the run.',
    en: 'Connection lost. Open the console or stop the run.',
    es: 'Conexión perdida. Abre la consola o detén la ejecución.',
  },
  'ui.example-record-without-evidence-of-a-real-run': {
    'pt-BR': 'Registro de exemplo, sem evidência de execução real',
    en: 'Example record, without evidence of a real run',
    es: 'Registro de ejemplo, sin evidencia de ejecución real',
  },
  'ui.delivery-approved': {
    'pt-BR': 'Entrega aprovada',
    en: 'Delivery approved',
    es: 'Entrega aprobada',
  },
  'ui.not-detailed': {
    'pt-BR': '(não detalhado)',
    en: '(not detailed)',
    es: '(sin detallar)',
  },
  'ui.agents': {
    'pt-BR': 'AGENTES',
    en: 'AGENTS',
    es: 'AGENTES',
  },
  'ui.drag-the-city-to-navigate': {
    'pt-BR': 'Arrastar a cidade para navegar',
    en: 'Drag the city to navigate',
    es: 'Arrastrar la ciudad para navegar',
  },
  'ui.zoom-in-or-out-of-the-map': {
    'pt-BR': 'Ampliar ou reduzir o mapa',
    en: 'Zoom in or out of the map',
    es: 'Acercar o alejar el mapa',
  },
  'ui.double-click': {
    'pt-BR': 'Duplo clique',
    en: 'Double-click',
    es: 'Doble clic',
  },
  'ui.on-an-agent-open-chat-on-an-empty-hexagon-create-an-age': {
    'pt-BR': 'Em um agente: abrir a conversa. Em um hexágono vazio: criar um agente ali',
    en: 'On an agent: open chat. On an empty hexagon: create an agent there',
    es: 'En un agente: abrir conversación. En un hexágono vacío: crear un agente allí',
  },
  'ui.shift-drag-an-agent-to-another-hexagon': {
    'pt-BR': 'Shift + arrastar um agente para outro hexágono',
    en: 'Shift + drag an agent to another hexagon',
    es: 'Mayús + arrastrar un agente a otro hexágono',
  },
  'ui.right-click': {
    'pt-BR': 'Botão direito',
    en: 'Right-click',
    es: 'Clic derecho',
  },
  'ui.drag-to-rotate-the-camera': {
    'pt-BR': 'Arrastar para girar a câmera',
    en: 'Drag to rotate the camera',
    es: 'Arrastrar para girar la cámara',
  },
  'ui.switch-between-hexagonal-city-and-office': {
    'pt-BR': 'Alternar entre cidade hexagonal e escritório',
    en: 'Switch between hexagonal city and office',
    es: 'Alternar entre ciudad hexagonal y oficina',
  },
  'ui.center-map-and-reset-zoom': {
    'pt-BR': 'Centralizar mapa e restaurar o zoom',
    en: 'Center map and reset zoom',
    es: 'Centrar mapa y restablecer zoom',
  },
  'ui.switch-between-dashboard-projects-network-and-handoffs': {
    'pt-BR': 'Alternar entre Painel, Projetos, Rede e Handoffs',
    en: 'Switch between Dashboard, Projects, Network and Handoffs',
    es: 'Alternar entre Panel, Proyectos, Red y Transferencias',
  },
  'ui.create-an-agent-in-the-studio': {
    'pt-BR': 'Criar um agente no estúdio',
    en: 'Create an agent in the studio',
    es: 'Crear un agente en el estudio',
  },
  'ui.open-project-briefing': {
    'pt-BR': 'Abrir briefing do projeto',
    en: 'Open project briefing',
    es: 'Abrir briefing del proyecto',
  },
  'ui.open-feature-board': {
    'pt-BR': 'Abrir quadro de features',
    en: 'Open feature board',
    es: 'Abrir tablero de funcionalidades',
  },
  'ui.open-transmission-log': {
    'pt-BR': 'Abrir registro de transmissões',
    en: 'Open transmission log',
    es: 'Abrir registro de transmisiones',
  },
  'ui.open-codex-cli-console': {
    'pt-BR': 'Abrir console do Codex CLI',
    en: 'Open Codex CLI console',
    es: 'Abrir consola de Codex CLI',
  },
  'ui.hide-or-show-panels': {
    'pt-BR': 'Ocultar ou mostrar os painéis',
    en: 'Hide or show panels',
    es: 'Ocultar o mostrar paneles',
  },
  'ui.space': {
    'pt-BR': 'Espaço',
    en: 'Space',
    es: 'Espacio',
  },
  'ui.start-pause-or-resume-the-operation': {
    'pt-BR': 'Iniciar, pausar ou retomar a operação',
    en: 'Start, pause or resume the operation',
    es: 'Iniciar, pausar o reanudar la operación',
  },
  'ui.close-the-open-panel': {
    'pt-BR': 'Fechar o painel aberto',
    en: 'Close the open panel',
    es: 'Cerrar el panel abierto',
  },
  'ui.no-squad': {
    'pt-BR': 'Sem squad',
    en: 'No squad',
    es: 'Sin equipo',
  },
  'ui.confirm-action': {
    'pt-BR': 'CONFIRMAR AÇÃO',
    en: 'CONFIRM ACTION',
    es: 'CONFIRMAR ACCIÓN',
  },
  'ui.desk': {
    'pt-BR': 'MESA',
    en: 'DESK',
    es: 'ESCRITORIO',
  },
  'ui.default': {
    'pt-BR': 'PADRÃO',
    en: 'DEFAULT',
    es: 'PREDETERMINADO',
  },
  'ui.custom': {
    'pt-BR': '(personalizado)',
    en: '(custom)',
    es: '(personalizado)',
  },
  'ui.uses-the-model-configured-in-the-cli': {
    'pt-BR': 'Usa o modelo configurado no CLI.',
    en: 'Uses the model configured in the CLI.',
    es: 'Usa el modelo configurado en el CLI.',
  },
  'ui.characters': {
    'pt-BR': 'caracteres',
    en: 'characters',
    es: 'caracteres',
  },
  'ui.read-files': {
    'pt-BR': 'Leitura de arquivos',
    en: 'Read files',
    es: 'Leer archivos',
  },
  'ui.find-files': {
    'pt-BR': 'Glob',
    en: 'Find files',
    es: 'Buscar archivos',
  },
  'ui.search-file-contents': {
    'pt-BR': 'Busca por conteúdo',
    en: 'Search file contents',
    es: 'Buscar contenido',
  },
  'ui.edit-files': {
    'pt-BR': 'Edição de arquivos',
    en: 'Edit files',
    es: 'Editar archivos',
  },
  'ui.create-files': {
    'pt-BR': 'Criação de arquivos',
    en: 'Create files',
    es: 'Crear archivos',
  },
  'ui.terminal-commands': {
    'pt-BR': 'Comandos de terminal',
    en: 'Terminal commands',
    es: 'Comandos de terminal',
  },
  'ui.fetch-web-pages': {
    'pt-BR': 'Buscar páginas web',
    en: 'Fetch web pages',
    es: 'Obtener páginas web',
  },
  'ui.web-search': {
    'pt-BR': 'Pesquisa na web',
    en: 'Web search',
    es: 'Búsqueda web',
  },
  'ui.edit-notebooks': {
    'pt-BR': 'Editar notebooks',
    en: 'Edit notebooks',
    es: 'Editar notebooks',
  },
  'ui.command-room': {
    'pt-BR': 'SALA DE COMANDO',
    en: 'COMMAND ROOM',
    es: 'SALA DE MANDO',
  },
  'ui.open-space-a': {
    'pt-BR': 'OPEN SPACE A',
    en: 'OPEN SPACE A',
    es: 'ESPACIO ABIERTO A',
  },
  'ui.open-space-b': {
    'pt-BR': 'OPEN SPACE B',
    en: 'OPEN SPACE B',
    es: 'ESPACIO ABIERTO B',
  },
  'ui.open-space-c': {
    'pt-BR': 'OPEN SPACE C',
    en: 'OPEN SPACE C',
    es: 'ESPACIO ABIERTO C',
  },
  'ui.meeting-room': {
    'pt-BR': 'SALA DE REUNIÃO',
    en: 'MEETING ROOM',
    es: 'SALA DE REUNIONES',
  },
  'ui.template-removed-from-library-agent-text-was-preserved': {
    'pt-BR': 'Template excluído da biblioteca. O texto do agente foi preservado.',
    en: 'Template removed from library. Agent text was preserved.',
    es: 'Plantilla eliminada de la biblioteca. Se conservó el texto del agente.',
  },
  'ui.subset-removed-from-library-agents-using-this-text-are-': {
    'pt-BR': 'Subset excluído da biblioteca. Os agentes que usam esse texto não mudam.',
    en: 'Subset removed from library. Agents using this text are unchanged.',
    es: 'Subconjunto eliminado de la biblioteca. Los agentes que usan este texto no cambian.',
  },
  'ui.guide-for': {
    'pt-BR': 'Guia de',
    en: 'Guide for',
    es: 'Guía de',
  },
  'ui.template-saved-to-library': {
    'pt-BR': 'Template salvo na biblioteca.',
    en: 'Template saved to library.',
    es: 'Plantilla guardada en la biblioteca.',
  },
  'ui.enter-the-subset-s-name-and-content': {
    'pt-BR': 'Preencha o nome e o conteúdo do subset.',
    en: "Enter the subset's name and content.",
    es: 'Introduce el nombre y el contenido del subconjunto.',
  },
  'ui.replace-the-agent-in-squad-studio-before-changing-its-s': {
    'pt-BR': 'Troque o agente dessa posição no Squad Studio antes de mudar a especialidade.',
    en: 'Replace the agent in Squad Studio before changing its specialty.',
    es: 'Sustituye al agente en Squad Studio antes de cambiar su especialidad.',
  },
  'ui.this-codename-is-already-in-use': {
    'pt-BR': 'Esse codinome já está em uso.',
    en: 'This codename is already in use.',
    es: 'Este nombre clave ya está en uso.',
  },
  'ui.enter-the-specialty-title': {
    'pt-BR': 'Informe o título da especialidade.',
    en: 'Enter the specialty title.',
    es: 'Introduce el título de la especialidad.',
  },
  'ui.agent-saved': {
    'pt-BR': 'Agente salvo.',
    en: 'Agent saved.',
    es: 'Agente guardado.',
  },
  'ui.occupies-a-command-or-analyst-position-replace-that-pos': {
    'pt-BR':
      'ocupa uma posição de comando ou reconhecimento. Troque essa posição no Squad Studio antes de excluir.',
    en: 'occupies a command or analyst position. Replace that position in Squad Studio before deleting.',
    es: 'ocupa una posición de mando o análisis. Sustituye esa posición en Squad Studio antes de eliminarlo.',
  },
  'ui.delete-agent': {
    'pt-BR': 'EXCLUIR AGENTE',
    en: 'DELETE AGENT',
    es: 'ELIMINAR AGENTE',
  },
  'ui.suggested-for-this-agent': {
    'pt-BR': 'Sugeridos para este agente',
    en: 'Suggested for this agent',
    es: 'Sugeridos para este agente',
  },
  'ui.my-library': {
    'pt-BR': 'minha biblioteca',
    en: 'my library',
    es: 'mi biblioteca',
  },
  'ui.today': {
    'pt-BR': 'Hoje',
    en: 'Today',
    es: 'Hoy',
  },
  'ui.start-operation': {
    'pt-BR': 'Iniciar operação',
    en: 'Start operation',
    es: 'Iniciar operación',
  },
  'ui.pending-reviews': {
    'pt-BR': 'Revisões pendentes',
    en: 'Pending reviews',
    es: 'Revisiones pendientes',
  },
  'ui.ask-a-question': {
    'pt-BR': 'Tirar uma dúvida',
    en: 'Ask a question',
    es: 'Hacer una pregunta',
  },
  'ui.edit-a-feature': {
    'pt-BR': 'Editar uma feature',
    en: 'Edit a feature',
    es: 'Editar una funcionalidad',
  },
  'ui.create-new-feature': {
    'pt-BR': 'Criar nova feature',
    en: 'Create new feature',
    es: 'Crear funcionalidad nueva',
  },
  'ui.view-project-adrs': {
    'pt-BR': 'Ver ADRs do projeto',
    en: 'View project ADRs',
    es: 'Ver ADR del proyecto',
  },
  'ui.record-an-adr': {
    'pt-BR': 'Registrar um ADR',
    en: 'Record an ADR',
    es: 'Registrar un ADR',
  },
  'ui.review-a-feature': {
    'pt-BR': 'Revisar uma feature',
    en: 'Review a feature',
    es: 'Revisar una funcionalidad',
  },
  'ui.my-features': {
    'pt-BR': 'Minhas features',
    en: 'My features',
    es: 'Mis funcionalidades',
  },
  'ui.ask-a-technical-question': {
    'pt-BR': 'Tirar uma dúvida técnica',
    en: 'Ask a technical question',
    es: 'Hacer una pregunta técnica',
  },
  'ui.free-conversation': {
    'pt-BR': 'Falar livremente',
    en: 'Free conversation',
    es: 'Conversación libre',
  },
  'ui.back-to-menu': {
    'pt-BR': 'Voltar ao menu',
    en: 'Back to menu',
    es: 'Volver al menú',
  },
  'ui.the-shortcuts-are-here-again': {
    'pt-BR': 'Beleza, os atalhos estão aqui de novo.',
    en: 'The shortcuts are here again.',
    es: 'Los atajos están aquí de nuevo.',
  },
  'ui.completed-182': {
    'pt-BR': 'concluídas',
    en: 'completed',
    es: 'completadas',
  },
  'ui.in-review': {
    'pt-BR': 'em revisão',
    en: 'in review',
    es: 'en revisión',
  },
  'ui.running': {
    'pt-BR': 'em execução',
    en: 'running',
    es: 'en ejecución',
  },
  'ui.to-do': {
    'pt-BR': 'a fazer',
    en: 'to do',
    es: 'por hacer',
  },
  'ui.run-current-sprint': {
    'pt-BR': 'Executar sprint atual',
    en: 'Run current sprint',
    es: 'Ejecutar sprint actual',
  },
  'ui.i-need-the-briefing-before-distributing-write-the-opera': {
    'pt-BR':
      'Preciso do briefing antes de distribuir. Escreva o contexto da operação e me chame de novo.',
    en: 'I need the briefing before distributing. Write the operation context and contact me again.',
    es: 'Necesito el briefing antes de distribuir. Escribe el contexto de la operación y vuelve a llamarme.',
  },
  'ui.open-briefing': {
    'pt-BR': 'Abrir briefing',
    en: 'Open briefing',
    es: 'Abrir briefing',
  },
  'ui.i-will-prepare-the-distribution-plan': {
    'pt-BR': 'Vou montar o plano de distribuição.',
    en: 'I will prepare the distribution plan.',
    es: 'Voy a preparar el plan de distribución.',
  },
  'ui.the-operation-is-already-running-follow-it-on-the-map-a': {
    'pt-BR':
      'A operação já está em andamento. Acompanhe pelo mapa e pelo registro de transmissões.',
    en: 'The operation is already running. Follow it on the map and transmission log.',
    es: 'La operación ya está en curso. Síguela en el mapa y el registro de transmisiones.',
  },
  'ui.i-will-prepare-the-current-sprint-s-plan-for-your-appro': {
    'pt-BR': 'Vou montar o plano da sprint atual para você aprovar.',
    en: "I will prepare the current sprint's plan for your approval.",
    es: 'Prepararé el plan del sprint actual para que lo apruebes.',
  },
  'ui.which-feature-would-you-like-to-edit': {
    'pt-BR': 'Qual feature você quer editar?',
    en: 'Which feature would you like to edit?',
    es: '¿Qué funcionalidad quieres editar?',
  },
  'ui.these-deliveries-await-your-review': {
    'pt-BR': 'Estas entregas aguardam sua revisão.',
    en: 'These deliveries await your review.',
    es: 'Estas entregas esperan tu revisión.',
  },
  'ui.these-are-the-operation-s-features': {
    'pt-BR': 'Estas são as features da operação.',
    en: "These are the operation's features.",
    es: 'Estas son las funcionalidades de la operación.',
  },
  'ui.no-features-available-for-this-option-right-now': {
    'pt-BR': 'Não há features para esta opção agora.',
    en: 'No features available for this option right now.',
    es: 'No hay funcionalidades para esta opción ahora.',
  },
  'ui.i-could-not-find-this-item-it-may-have-been-removed': {
    'pt-BR': 'Não encontrei esse item. Ele pode ter sido removido.',
    en: 'I could not find this item. It may have been removed.',
    es: 'No encontré este elemento. Puede que se haya eliminado.',
  },
  'ui.is': {
    'pt-BR': ') está',
    en: ') is',
    es: ') está',
  },
  'ui.open-feature': {
    'pt-BR': 'Abrir feature',
    en: 'Open feature',
    es: 'Abrir funcionalidad',
  },
  'ui.talk-about-it': {
    'pt-BR': 'Falar sobre ela',
    en: 'Talk about it',
    es: 'Hablar sobre ella',
  },
  'ui.go-ahead-what-would-you-like-to-know-about': {
    'pt-BR': 'Pode mandar: o que você quer saber da',
    en: 'Go ahead: what would you like to know about',
    es: 'Adelante: ¿qué quieres saber sobre',
  },
  'ui.opening-the-feature-for-review': {
    'pt-BR': 'Abrindo a feature para revisão.',
    en: 'Opening the feature for review.',
    es: 'Abriendo la funcionalidad para revisión.',
  },
  'ui.opening-the-feature-in-the-project': {
    'pt-BR': 'Abrindo a feature no projeto.',
    en: 'Opening the feature in the project.',
    es: 'Abriendo la funcionalidad en el proyecto.',
  },
  'ui.opening-the-new-feature-editor': {
    'pt-BR': 'Abrindo o editor para uma nova feature.',
    en: 'Opening the new feature editor.',
    es: 'Abriendo el editor de una nueva funcionalidad.',
  },
  'ui.tell-me-the-feature-idea-in-one-sentence-i-will-open-th': {
    'pt-BR':
      'Me conta a ideia da feature em uma frase. Eu abro o editor e já começo a escrever com você.',
    en: 'Tell me the feature idea in one sentence. I will open the editor and start writing with you.',
    es: 'Cuéntame la idea en una frase. Abriré el editor para escribir contigo.',
  },
  'ui.open-blank-editor': {
    'pt-BR': 'Abrir editor em branco',
    en: 'Open blank editor',
    es: 'Abrir editor vacío',
  },
  'ui.opening-the-blank-editor': {
    'pt-BR': 'Abrindo o editor em branco.',
    en: 'Opening the blank editor.',
    es: 'Abriendo el editor vacío.',
  },
  'ui.these-are-the-recorded-decisions-which-would-you-like-t': {
    'pt-BR': 'Estas são as decisões registradas. Qual você quer ver?',
    en: 'These are the recorded decisions. Which would you like to see?',
    es: 'Estas son las decisiones registradas. ¿Cuál quieres ver?',
  },
  'ui.no-adrs-recorded-in-this-project-yet': {
    'pt-BR': 'Ainda não há ADRs registrados neste projeto.',
    en: 'No ADRs recorded in this project yet.',
    es: 'Aún no hay ADR registrados en este proyecto.',
  },
  'ui.open-in-project': {
    'pt-BR': 'Abrir no projeto',
    en: 'Open in project',
    es: 'Abrir en el proyecto',
  },
  'ui.ask-about-this-adr': {
    'pt-BR': 'Perguntar sobre este ADR',
    en: 'Ask about this ADR',
    es: 'Preguntar sobre este ADR',
  },
  'ui.go-ahead-and-ask-about-this-adr': {
    'pt-BR': 'Pode mandar a pergunta sobre esse ADR.',
    en: 'Go ahead and ask about this ADR.',
    es: 'Adelante, pregunta sobre este ADR.',
  },
  'ui.opening-the-operation-briefing': {
    'pt-BR': 'Abrindo o briefing da operação.',
    en: 'Opening the operation briefing.',
    es: 'Abriendo el briefing de la operación.',
  },
  'ui.opening-project-architecture-decisions': {
    'pt-BR': 'Abrindo as decisões de arquitetura do projeto.',
    en: 'Opening project architecture decisions.',
    es: 'Abriendo las decisiones de arquitectura del proyecto.',
  },
  'ui.opening-individual-spawn': {
    'pt-BR': 'Abrindo o spawn individual.',
    en: 'Opening individual spawn.',
    es: 'Abriendo la ejecución individual.',
  },
  'ui.go-ahead-i-m-listening': {
    'pt-BR': 'Manda. Estou ouvindo.',
    en: "Go ahead. I'm listening.",
    es: 'Adelante. Te escucho.',
  },
  'ui.ask-away-i-will-consider-the-operation-context': {
    'pt-BR': 'Pode perguntar! Vou considerar o contexto da operação.',
    en: 'Ask away! I will consider the operation context.',
    es: '¡Pregunta! Tendré en cuenta el contexto de la operación.',
  },
  'ui.human-review': {
    'pt-BR': 'Revisão humana',
    en: 'Human review',
    es: 'Revisión humana',
  },
  'ui.i-could-not-respond': {
    'pt-BR': 'Não consegui responder:',
    en: 'I could not respond:',
    es: 'No pude responder:',
  },
  'ui.run-history': {
    'pt-BR': 'HISTÓRICO DE EXECUÇÕES /',
    en: 'RUN HISTORY /',
    es: 'HISTORIAL DE EJECUCIONES /',
  },
  'ui.session': {
    'pt-BR': 'SESSÃO',
    en: 'SESSION',
    es: 'SESIÓN',
  },
  'ui.reviews': {
    'pt-BR': 'Revisões',
    en: 'Reviews',
    es: 'Revisiones',
  },
  'ui.default-223': {
    'pt-BR': 'padrão',
    en: 'default',
    es: 'predeterminado',
  },
  'ui.permission': {
    'pt-BR': '/ permissão',
    en: '/ permission',
    es: '/ permiso',
  },
  'ui.session-225': {
    'pt-BR': 'sessão',
    en: 'session',
    es: 'sesión',
  },
  'ui.completed-in': {
    'pt-BR': 'CONCLUÍDO em',
    en: 'COMPLETED in',
    es: 'COMPLETADO en',
  },
  'ui.output': {
    'pt-BR': 'de saída',
    en: 'output',
    es: 'de salida',
  },
  'ui.cost-not-reported': {
    'pt-BR': '/ custo não informado',
    en: '/ cost not reported',
    es: '/ costo no informado',
  },
  'ui.operation-s': {
    'pt-BR': 'operação(ões),',
    en: 'operation(s),',
    es: 'operación(es),',
  },
  'ui.agents-231': {
    'pt-BR': 'agentes',
    en: 'agents',
    es: 'agentes',
  },
  'ui.delivery-s-awaiting-approval': {
    'pt-BR': 'entrega(s) aguardando sua aprovação',
    en: 'delivery(s) awaiting approval',
    es: 'entrega(s) esperando aprobación',
  },
  'ui.features-ready-to-start': {
    'pt-BR': 'features prontas para iniciar',
    en: 'features ready to start',
    es: 'funcionalidades listas para iniciar',
  },
  'ui.distribute-features-to-prepare-the-plan': {
    'pt-BR': 'distribua as features para montar o plano',
    en: 'distribute features to prepare the plan',
    es: 'distribuye las funcionalidades para montar el plan',
  },
  'ui.all-sprints-completed': {
    'pt-BR': 'todas as sprints concluídas',
    en: 'all sprints completed',
    es: 'todos los sprints completados',
  },
  'ui.awaiting-review-or-dependencies': {
    'pt-BR': 'aguardando revisão ou dependências',
    en: 'awaiting review or dependencies',
    es: 'esperando revisión o dependencias',
  },
  'ui.superseded': {
    'pt-BR': 'Substituído',
    en: 'Superseded',
    es: 'Sustituido',
  },
  'ui.prd-analyst': {
    'pt-BR': 'RECONHECEDOR PRD',
    en: 'PRD ANALYST',
    es: 'ANALISTA PRD',
  },
  'ui.adr-analyst': {
    'pt-BR': 'RECONHECEDOR ADR',
    en: 'ADR ANALYST',
    es: 'ANALISTA ADR',
  },
  'ui.for': {
    'pt-BR': 'Para',
    en: 'For',
    es: 'Para',
  },
  'ui.leads-the-meeting': {
    'pt-BR': 'conduz a reunião',
    en: 'leads the meeting',
    es: 'dirige la reunión',
  },
  'ui.answers-their-question': {
    'pt-BR': 'responde à pergunta dele',
    en: 'answers their question',
    es: 'responde a su pregunta',
  },
  'ui.to-the-meeting': {
    'pt-BR': 'para a reunião.',
    en: 'to the meeting.',
    es: 'a la reunión.',
  },
  'ui.left-the-meeting': {
    'pt-BR': 'saiu da reunião.',
    en: 'left the meeting.',
    es: 'salió de la reunión.',
  },
  'ui.connect-the-cli-with-execution-enabled-to-chat': {
    'pt-BR': 'Conecte o CLI com a execução ligada para conversar.',
    en: 'Connect the CLI with execution enabled to chat.',
    es: 'Conecta el CLI con la ejecución activada para conversar.',
  },
  'ui.documents-saved-to-project': {
    'pt-BR': 'Documentos salvos no projeto.',
    en: 'Documents saved to project.',
    es: 'Documentos guardados en el proyecto.',
  },
  'ui.criteria': {
    'pt-BR': 'Critérios',
    en: 'Criteria',
    es: 'Criterios',
  },
  'ui.write-from-scratch': {
    'pt-BR': 'Escrever do zero',
    en: 'Write from scratch',
    es: 'Escribir desde cero',
  },
  'ui.improve-criteria': {
    'pt-BR': 'Melhorar critérios',
    en: 'Improve criteria',
    es: 'Mejorar criterios',
  },
  'ui.break-down-into-tasks': {
    'pt-BR': 'Quebrar em tarefas',
    en: 'Break down into tasks',
    es: 'Dividir en tareas',
  },
  'ui.feature-saved-distribute-the-plan-to-assign-specialists': {
    'pt-BR': 'Feature salva. Distribua o plano para atribuir os especialistas.',
    en: 'Feature saved. Distribute the plan to assign specialists.',
    es: 'Funcionalidad guardada. Distribuye el plan para asignar especialistas.',
  },
  'ui.first-remove-dependencies-in': {
    'pt-BR': 'Remova primeiro as dependências em:',
    en: 'First remove dependencies in:',
    es: 'Primero elimina las dependencias en:',
  },
  'ui.this-removes-the-feature-scope-and-delivery-records': {
    'pt-BR': '? Essa ação remove o escopo e os registros de entrega desta feature.',
    en: '? This removes the feature scope and delivery records.',
    es: '? Esto elimina el alcance y los registros de entrega de esta funcionalidad.',
  },
  'ui.delete-feature': {
    'pt-BR': 'EXCLUIR FEATURE',
    en: 'DELETE FEATURE',
    es: 'ELIMINAR FUNCIONALIDAD',
  },
  'ui.commander-s-plan': {
    'pt-BR': 'PLANO DO COMANDANTE /',
    en: "COMMANDER'S PLAN /",
    es: 'PLAN DEL COMANDANTE /',
  },
  'ui.complete-routes': {
    'pt-BR': 'ROTAS COMPLETAS',
    en: 'COMPLETE ROUTES',
    es: 'RUTAS COMPLETAS',
  },
  'ui.briefing-received': {
    'pt-BR': 'BRIEFING RECEBIDO /',
    en: 'BRIEFING RECEIVED /',
    es: 'BRIEFING RECIBIDO /',
  },
  'ui.features-analyzed': {
    'pt-BR': 'FEATURES ANALISADAS',
    en: 'FEATURES ANALYZED',
    es: 'FUNCIONALIDADES ANALIZADAS',
  },
  'ui.missing-from-squad': {
    'pt-BR': 'Falta no squad:',
    en: 'Missing from squad:',
    es: 'Falta en el equipo:',
  },
  'ui.session-272': {
    'pt-BR': '/ sessão',
    en: '/ session',
    es: '/ sesión',
  },
  'ui.project-setup': {
    'pt-BR': 'Setup do projeto',
    en: 'Project setup',
    es: 'Configuración del proyecto',
  },
  'ui.feature-for': {
    'pt-BR': 'FEATURE PARA',
    en: 'FEATURE FOR',
    es: 'FUNCIONALIDAD PARA',
  },
  'ui.this-feature-s-route-will-be-replaced-by-an-individual-': {
    'pt-BR': 'A rota desta feature será substituída por uma sessão individual de',
    en: "This feature's route will be replaced by an individual session with",
    es: 'La ruta de esta funcionalidad se sustituirá por una sesión individual de',
  },
  'ui.the-delivery-then-goes-to-human-review': {
    'pt-BR': '. Depois, a entrega vai para revisão humana.',
    en: '. The delivery then goes to human review.',
    es: '. Después, la entrega pasa a revisión humana.',
  },
  'ui.complete-and-save-all-project-fields-before-executing': {
    'pt-BR': 'Complete e salve todos os campos do projeto antes de executar.',
    en: 'Complete and save all project fields before executing.',
    es: 'Completa y guarda todos los campos del proyecto antes de ejecutar.',
  },
  'ui.no-feature-available-for-spawn-add-one-or-review-depend': {
    'pt-BR': 'Não há feature disponível para spawn. Adicione uma ou revise as dependências.',
    en: 'No feature available for spawn. Add one or review dependencies.',
    es: 'No hay funcionalidades disponibles para ejecución individual. Añade una o revisa las dependencias.',
  },
  'ui.individual-spawn-for': {
    'pt-BR': 'Spawn individual de',
    en: 'Individual spawn for',
    es: 'Ejecución individual de',
  },
  'ui.without-a-commander-this-session-belongs-only-to-them': {
    'pt-BR': '. Sem comandante: a sessão é só dele.',
    en: '. Without a commander: this session belongs only to them.',
    es: '. Sin comandante: la sesión es solo suya.',
  },
  'ui.13-departments': {
    'pt-BR': '13 DEPARTAMENTOS ·',
    en: '13 DEPARTMENTS ·',
    es: '13 DEPARTAMENTOS ·',
  },
  'ui.agents-283': {
    'pt-BR': 'AGENTES ·',
    en: 'AGENTS ·',
    es: 'AGENTES ·',
  },
  'ui.agents-285': {
    'pt-BR': 'AGENTES /',
    en: 'AGENTS /',
    es: 'AGENTES /',
  },
  'ui.history': {
    'pt-BR': 'HISTÓRICO /',
    en: 'HISTORY /',
    es: 'HISTORIAL /',
  },
  'ui.click-to-select-an-agent-double-click-to-chat-drag-to-n': {
    'pt-BR':
      'Clique em um agente para selecioná-lo · Duplo clique para conversar · Arraste para navegar',
    en: 'Click to select an agent · Double-click to chat · Drag to navigate',
    es: 'Haz clic para seleccionar · Doble clic para conversar · Arrastra para navegar',
  },
  'ui.shared-room-available-for-visits': {
    'pt-BR': 'Sala compartilhada, disponível para visitas',
    en: 'Shared room, available for visits',
    es: 'Sala compartida, disponible para visitas',
  },
  'ui.operation-291': {
    'pt-BR': 'operação',
    en: 'operation',
    es: 'operación',
  },
  'ui.awaiting-approval': {
    'pt-BR': 'AGUARDA APROVAÇÃO',
    en: 'AWAITING APPROVAL',
    es: 'ESPERANDO APROBACIÓN',
  },
  'ui.preparing-the-plan-for': {
    'pt-BR': 'Montando o plano de',
    en: 'Preparing the plan for',
    es: 'Preparando el plan de',
  },
  'ui.plan-ready-approve-it-in-the-operation-chat': {
    'pt-BR': 'Plano pronto. Aprove no chat da operação.',
    en: 'Plan ready. Approve it in the operation chat.',
    es: 'Plan listo. Apruébalo en el chat de la operación.',
  },
  'ui.pausing-after-stage': {
    'pt-BR': 'PAUSANDO APÓS A ETAPA',
    en: 'PAUSING AFTER STAGE',
    es: 'PAUSANDO TRAS LA ETAPA',
  },
  'ui.answering': {
    'pt-BR': 'ATENDENDO',
    en: 'ANSWERING',
    es: 'ATENDIENDO',
  },
  'ui.called': {
    'pt-BR': 'CHAMOU',
    en: 'CALLED',
    es: 'LLAMÓ',
  },
  'ui.called-by': {
    'pt-BR': 'Chamado por',
    en: 'Called by',
    es: 'Llamado por',
  },
  'ui.waiting-for-a-response-from': {
    'pt-BR': 'Aguardando a resposta de',
    en: 'Waiting for a response from',
    es: 'Esperando la respuesta de',
  },
  'ui.using': {
    'pt-BR': 'Usando',
    en: 'Using',
    es: 'Usando',
  },
  'ui.delivery': {
    'pt-BR': 'Entrega',
    en: 'Delivery',
    es: 'Entrega',
  },
  'ui.operation-chat': {
    'pt-BR': '· CHAT DA OPERAÇÃO',
    en: '· OPERATION CHAT',
    es: '· CHAT DE LA OPERACIÓN',
  },
  'ui.preparing-the-plan': {
    'pt-BR': 'montando o plano',
    en: 'preparing the plan',
    es: 'preparando el plan',
  },
  'ui.awaiting-approval-304': {
    'pt-BR': 'aguardando aprovação',
    en: 'awaiting approval',
    es: 'esperando aprobación',
  },
  'ui.answering-a-call': {
    'pt-BR': 'atendendo chamada',
    en: 'answering a call',
    es: 'atendiendo llamada',
  },
  'ui.pausing-after-the-stage': {
    'pt-BR': 'pausando após a etapa',
    en: 'pausing after the stage',
    es: 'pausando tras la etapa',
  },
  'ui.holding-the-baton': {
    'pt-BR': 'com o bastão',
    en: 'holding the baton',
    es: 'con el relevo',
  },
  'ui.queued': {
    'pt-BR': 'na fila',
    en: 'queued',
    es: 'en cola',
  },
  'ui.commander-preparing-the-plan': {
    'pt-BR': 'COMANDANTE MONTANDO O PLANO',
    en: 'COMMANDER PREPARING THE PLAN',
    es: 'COMANDANTE PREPARANDO EL PLAN',
  },
  'ui.plan-awaits-your-approval': {
    'pt-BR': 'PLANO AGUARDA A SUA APROVAÇÃO',
    en: 'PLAN AWAITS YOUR APPROVAL',
    es: 'EL PLAN ESPERA TU APROBACIÓN',
  },
  'ui.no-run-in-progress': {
    'pt-BR': 'SEM EXECUÇÃO EM ANDAMENTO',
    en: 'NO RUN IN PROGRESS',
    es: 'SIN EJECUCIÓN EN CURSO',
  },
  'ui.no-runs-yet': {
    'pt-BR': 'NENHUMA EXECUÇÃO AINDA',
    en: 'NO RUNS YET',
    es: 'AÚN NO HAY EJECUCIONES',
  },
  'ui.selecting-the-next-feature': {
    'pt-BR': 'SELECIONANDO A PRÓXIMA FEATURE',
    en: 'SELECTING THE NEXT FEATURE',
    es: 'SELECCIONANDO LA SIGUIENTE FUNCIONALIDAD',
  },
  'ui.complete-squad-s-available': {
    'pt-BR': 'squad(s) completa(s) disponível(is).',
    en: 'complete squad(s) available.',
    es: 'equipo(s) completo(s) disponible(s).',
  },
  'ui.kickoff-with': {
    'pt-BR': 'Kickoff com',
    en: 'Kickoff with',
    es: 'Kickoff con',
  },
  'ui.product-vision': {
    'pt-BR': 'VISÃO DO PRODUTO',
    en: 'PRODUCT VISION',
    es: 'VISIÓN DEL PRODUCTO',
  },
  'ui.active-operation': {
    'pt-BR': '/ OPERAÇÃO ATIVA',
    en: '/ ACTIVE OPERATION',
    es: '/ OPERACIÓN ACTIVA',
  },
  'ui.folder-projects': {
    'pt-BR': 'PASTA projects/',
    en: 'FOLDER projects/',
    es: 'CARPETA projects/',
  },
  'ui.no-sprint-or-feature-runs-until-all-project-fields-are-': {
    'pt-BR':
      'Nenhuma sprint ou feature roda até todos os campos do projeto estarem preenchidos e salvos. Falta:',
    en: 'No sprint or feature runs until all project fields are completed and saved. Missing:',
    es: 'No se ejecutará ningún sprint ni funcionalidad hasta completar y guardar todos los campos. Falta:',
  },
  'ui.in-review-323': {
    'pt-BR': 'EM REVISÃO',
    en: 'IN REVIEW',
    es: 'EN REVISIÓN',
  },
  'ui.dependency-s': {
    'pt-BR': 'dependência(s)',
    en: 'dependency(s)',
    es: 'dependencia(s)',
  },
  'ui.human-review-325': {
    'pt-BR': 'REVISÃO HUMANA',
    en: 'HUMAN REVIEW',
    es: 'REVISIÓN HUMANA',
  },
  'ui.keep-at-least-one-project-create-another-before-deletin': {
    'pt-BR': 'Mantenha ao menos um projeto. Crie outro antes de excluir este.',
    en: 'Keep at least one project. Create another before deleting this one.',
    es: 'Conserva al menos un proyecto. Crea otro antes de eliminar este.',
  },
  'ui.its-features-and-transmissions-agent-profiles-remain-in': {
    'pt-BR':
      ', suas features e transmissões? Os perfis dos agentes permanecerão no workspace, e a pasta projects/',
    en: ', its features and transmissions? Agent profiles remain in the workspace, and the projects/ folder',
    es: ', sus funcionalidades y transmisiones? Los perfiles permanecen en el workspace y la carpeta projects/',
  },
  'ui.remains-on-disk-with-implemented-files': {
    'pt-BR': 'fica no disco com o que já foi implementado.',
    en: 'remains on disk with implemented files.',
    es: 'permanece en el disco con lo implementado.',
  },
  'ui.delete-project': {
    'pt-BR': 'EXCLUIR PROJETO',
    en: 'DELETE PROJECT',
    es: 'ELIMINAR PROYECTO',
  },
  'ui.delete-project-330': {
    'pt-BR': 'Excluir projeto',
    en: 'Delete project',
    es: 'Eliminar proyecto',
  },
  'ui.enter-the-project-name': {
    'pt-BR': 'Informe o nome do projeto.',
    en: 'Enter the project name.',
    es: 'Introduce el nombre del proyecto.',
  },
  'ui.project-saved': {
    'pt-BR': 'Projeto salvo.',
    en: 'Project saved.',
    es: 'Proyecto guardado.',
  },
  'ui.discard-unsaved-documents': {
    'pt-BR': 'Descartar documentos não salvos?',
    en: 'Discard unsaved documents?',
    es: '¿Descartar documentos sin guardar?',
  },
  'ui.sprint-saved': {
    'pt-BR': 'Sprint salva.',
    en: 'Sprint saved.',
    es: 'Sprint guardado.',
  },
  'ui.move-or-delete-the-features-before-deleting-the-sprint': {
    'pt-BR': 'Mova ou exclua as features antes de excluir a sprint.',
    en: 'Move or delete the features before deleting the sprint.',
    es: 'Mueve o elimina las funcionalidades antes de eliminar el sprint.',
  },
  'ui.delete-sprint': {
    'pt-BR': 'EXCLUIR SPRINT',
    en: 'DELETE SPRINT',
    es: 'ELIMINAR SPRINT',
  },
  'ui.delete-sprint-338': {
    'pt-BR': 'Excluir sprint',
    en: 'Delete sprint',
    es: 'Eliminar sprint',
  },
  'ui.the-bridge-responded-but-the-cli-was-not-found': {
    'pt-BR': 'O bridge respondeu, mas o CLI não foi encontrado:',
    en: 'The bridge responded, but the CLI was not found:',
    es: 'El bridge respondió, pero no se encontró el CLI:',
  },
  'ui.executable-for': {
    'pt-BR': 'EXECUTÁVEL DO',
    en: 'EXECUTABLE FOR',
    es: 'EJECUTABLE DE',
  },
  'ui.models-loaded-from-devin-cli': {
    'pt-BR': 'modelos carregados do Devin CLI.',
    en: 'models loaded from Devin CLI.',
    es: 'modelos cargados desde Devin CLI.',
  },
  'ui.models-loaded-from-the-cli': {
    'pt-BR': 'modelos carregados do CLI.',
    en: 'models loaded from the CLI.',
    es: 'modelos cargados desde el CLI.',
  },
  'ui.motion-and-transmissions': {
    'pt-BR': 'Movimento e transmissões',
    en: 'Motion and transmissions',
    es: 'Movimiento y transmisiones',
  },
  'ui.interface-animations-active-markers-and-route-packets-r': {
    'pt-BR':
      'Animações de interface, marcadores ativos e pacotes nas rotas. Respeita a preferência de movimento reduzido do sistema.',
    en: "Interface animations, active markers and route packets. Respects the system's reduced-motion preference.",
    es: 'Animaciones de interfaz, marcadores activos y paquetes en las rutas. Respeta la preferencia de movimiento reducido del sistema.',
  },
  'ui.enable-motion': {
    'pt-BR': 'Ativar movimento',
    en: 'Enable motion',
    es: 'Activar movimiento',
  },
  'ui.high-quality-city-graphics': {
    'pt-BR': 'Gráficos da cidade em alta qualidade',
    en: 'High-quality city graphics',
    es: 'Gráficos de la ciudad en alta calidad',
  },
  'ui.soft-shadows-ambient-occlusion-and-glow-in-the-hexagona': {
    'pt-BR':
      'Sombras suaves, oclusão de ambiente e brilho na cidade hexagonal. Desligue em computadores mais lentos; em quadros lentos a qualidade também cai sozinha.',
    en: 'Soft shadows, ambient occlusion and glow in the hexagonal city. Disable on slower computers; quality also drops automatically on slow frames.',
    es: 'Sombras suaves, oclusión ambiental y brillo en la ciudad hexagonal. Desactívalo en equipos lentos; la calidad también baja automáticamente si disminuye el rendimiento.',
  },
  'ui.planet-city-mode': {
    'pt-BR': 'Cidade em modo planeta',
    en: 'Planet city mode',
    es: 'Ciudad en modo planeta',
  },
  'ui.codex-configuration': {
    'pt-BR': 'CONFIGURAÇÃO CODEX',
    en: 'CODEX CONFIGURATION',
    es: 'CONFIGURACIÓN CODEX',
  },
  'ui.allow-changes-in-the-project-folder': {
    'pt-BR': 'Permitir alterações na pasta do projeto',
    en: 'Allow changes in the project folder',
    es: 'Permitir cambios en la carpeta del proyecto',
  },
  'ui.read-only': {
    'pt-BR': 'Somente leitura',
    en: 'Read only',
    es: 'Solo lectura',
  },
  'ui.accept-edits': {
    'pt-BR': 'Aceitar edições',
    en: 'Accept edits',
    es: 'Aceptar ediciones',
  },
  'ui.plan-without-editing': {
    'pt-BR': 'Planejar sem editar',
    en: 'Plan without editing',
    es: 'Planificar sin editar',
  },
  'ui.each-stage-runs-codex-exec-json-with-agent-instructions': {
    'pt-BR':
      'Cada etapa roda codex exec --json com as instruções do agente e a tarefa enviadas por stdin. O Codex CLI usa sua autenticação local. As execuções consomem os limites da sua conta ou créditos de API. Não há teto de custo em USD por etapa.',
    en: 'Each stage runs codex exec --json with agent instructions and task sent through stdin. Codex CLI uses local authentication. Runs consume account limits or API credits. There is no USD cost cap per stage.',
    es: 'Cada etapa ejecuta codex exec --json con las instrucciones y la tarea mediante stdin. Codex CLI usa la autenticación local. Las ejecuciones consumen los límites de la cuenta o créditos de API. No hay un límite de costo por etapa en USD.',
  },
  'ui.each-devin-stage-runs-devin-p-prompt-file-in-the-operat': {
    'pt-BR':
      'Cada etapa de um agente Devin roda devin -p --prompt-file … na pasta da operação, com o modelo do perfil do agente e a permissão acima. O Devin CLI usa sua autenticação local; o app não altera suas credenciais. Colegas da squad viram subagentes em projects/<operação>/.devin/agents/. O Devin CLI não oferece níveis de esforço nem limite de custo por etapa nesta integração.',
    en: "Each Devin stage runs devin -p --prompt-file in the operation folder, using the agent's model and selected permission. Devin CLI uses local authentication. Colleagues become subagents in projects/<operation>/.devin/agents/. This integration does not provide effort levels or a stage cost limit.",
    es: 'Cada etapa Devin ejecuta devin -p --prompt-file en la carpeta de la operación con el modelo y el permiso seleccionados. Usa la autenticación local. Los compañeros son subagentes en projects/<operación>/.devin/agents/. Esta integración no ofrece niveles de esfuerzo ni límite de costo por etapa.',
  },
  'ui.each-stage-runs-agy-exe-with-json-output-in-the-operati': {
    'pt-BR':
      'Cada etapa roda agy.exe com saída JSON na pasta da operação. A autenticação e as regras de aprovação locais do Antigravity são respeitadas. Colegas usam perfis em .agents/agents/. Tempo limite e simultaneidade vêm da aba Execução.',
    en: "Each stage runs agy.exe with JSON output in the operation folder. Antigravity's local authentication and approval rules apply. Colleagues use profiles in .agents/agents/. Timeout and concurrency are set in the Execution tab.",
    es: 'Cada etapa ejecuta agy.exe con salida JSON en la carpeta de la operación. Se respetan la autenticación y las reglas locales de Antigravity. Los compañeros usan perfiles en .agents/agents/. El tiempo límite y la simultaneidad están en la pestaña Ejecución.',
  },
  'ui.remove-changes-in-this-workspace-and-restore-the-atlas-': {
    'pt-BR': 'Remover as alterações deste workspace e restaurar o exemplo Atlas Commerce?',
    en: 'Remove changes in this workspace and restore the Atlas Commerce example?',
    es: '¿Eliminar los cambios de este workspace y restaurar el ejemplo Atlas Commerce?',
  },
  'ui.reset-workspace': {
    'pt-BR': 'REINICIAR WORKSPACE',
    en: 'RESET WORKSPACE',
    es: 'REINICIAR WORKSPACE',
  },
  'ui.command-copied': {
    'pt-BR': 'Comando copiado.',
    en: 'Command copied.',
    es: 'Comando copiado.',
  },
  'ui.select-the-preview-text-to-copy': {
    'pt-BR': 'Selecione o texto da prévia para copiar.',
    en: 'Select the preview text to copy.',
    es: 'Selecciona el texto de la vista previa para copiarlo.',
  },
  'ui.replace-current-data-with-the-imported-workspace-the-cu': {
    'pt-BR':
      'Substituir os dados atuais pelo workspace importado? A versão atual fica nas versões salvas.',
    en: 'Replace current data with the imported workspace? The current version remains in saved versions.',
    es: '¿Sustituir los datos actuales por el workspace importado? La versión actual permanece en las versiones guardadas.',
  },
  'ui.restore-workspace': {
    'pt-BR': 'RESTAURAR WORKSPACE',
    en: 'RESTORE WORKSPACE',
    es: 'RESTAURAR WORKSPACE',
  },
  'ui.restore-backup': {
    'pt-BR': 'Restaurar backup',
    en: 'Restore backup',
    es: 'Restaurar copia de seguridad',
  },
  'ui.for-the-operation': {
    'pt-BR': 'PARA A OPERAÇÃO',
    en: 'FOR THE OPERATION',
    es: 'PARA LA OPERACIÓN',
  },
  'ui.technically-executes-the-mission': {
    'pt-BR': 'EXECUTA TECNICAMENTE A MISSÃO ·',
    en: 'TECHNICALLY EXECUTES THE MISSION ·',
    es: 'EJECUTA TÉCNICAMENTE LA MISIÓN ·',
  },
  'ui.operator-s': {
    'pt-BR': 'OPERADOR(ES)',
    en: 'OPERATOR(S)',
    es: 'OPERADOR(ES)',
  },
  'ui.select': {
    'pt-BR': 'SELECIONAR /',
    en: 'SELECT /',
    es: 'SELECCIONAR /',
  },
  'ui.in-this-category': {
    'pt-BR': 'NESTA CATEGORIA',
    en: 'IN THIS CATEGORY',
    es: 'EN ESTA CATEGORÍA',
  },
  'ui.conventions': {
    'pt-BR': '· CONVENÇÕES:',
    en: '· CONVENTIONS:',
    es: '· CONVENCIONES:',
  },
  'ui.already-in-this-squad': {
    'pt-BR': 'JÁ NESTA SQUAD',
    en: 'ALREADY IN THIS SQUAD',
    es: 'YA EN ESTE EQUIPO',
  },
  'ui.in-workspace': {
    'pt-BR': 'NO WORKSPACE',
    en: 'IN WORKSPACE',
    es: 'EN EL WORKSPACE',
  },
  'ui.generalist': {
    'pt-BR': 'Generalista',
    en: 'Generalist',
    es: 'Generalista',
  },
  'ui.no-guide': {
    'pt-BR': 'Sem guia',
    en: 'No guide',
    es: 'Sin guía',
  },
  'ui.view-agents': {
    'pt-BR': 'Ver agentes',
    en: 'View agents',
    es: 'Ver agentes',
  },
  'ui.create-custom': {
    'pt-BR': 'Criar customizado',
    en: 'Create custom',
    es: 'Crear personalizado',
  },
  'ui.already-in-squad': {
    'pt-BR': 'Já na squad',
    en: 'Already in squad',
    es: 'Ya en el equipo',
  },
  'ui.new-operator': {
    'pt-BR': 'NOVO OPERADOR',
    en: 'NEW OPERATOR',
    es: 'NUEVO OPERADOR',
  },
  'ui.options': {
    'pt-BR': 'Opções:',
    en: 'Options:',
    es: 'Opciones:',
  },
  'ui.create-an-agent-from-scratch-in-the-studio-codename-spe': {
    'pt-BR':
      'Crie um agente do zero no estúdio: codinome, especialidade, instruções e ferramentas. Ele entra direto nesta posição.',
    en: 'Create an agent from scratch in the studio: codename, specialty, instructions and tools. It goes directly into this position.',
    es: 'Crea un agente desde cero en el estudio: nombre clave, especialidad, instrucciones y herramientas. Se incorpora directamente a esta posición.',
  },
  'ui.a-squad-with-this-name-already-exists': {
    'pt-BR': 'Já existe uma squad com esse nome.',
    en: 'A squad with this name already exists.',
    es: 'Ya existe un equipo con este nombre.',
  },
  'ui.complete-commander-adr-prd-and-at-least-one-operator': {
    'pt-BR': 'Complete o comandante, ADR, PRD e pelo menos um operador.',
    en: 'Complete commander, ADR, PRD and at least one operator.',
    es: 'Completa el comandante, ADR, PRD y al menos un operador.',
  },
  'ui.this-squad-is-used-by-an-operation-assign-another-squad': {
    'pt-BR': 'A squad está em uso por uma operação. Associe outra squad antes de excluir.',
    en: 'This squad is used by an operation. Assign another squad before deleting.',
    es: 'Este equipo está en uso por una operación. Asigna otro equipo antes de eliminarlo.',
  },
  'ui.delete-squad': {
    'pt-BR': 'EXCLUIR SQUAD',
    en: 'DELETE SQUAD',
    es: 'ELIMINAR EQUIPO',
  },
  'ui.delete-squad-387': {
    'pt-BR': 'Excluir squad',
    en: 'Delete squad',
    es: 'Eliminar equipo',
  },
  'ui.updated-the-proposal-for-your-review': {
    'pt-BR': 'Atualizei a proposta para você revisar.',
    en: 'Updated the proposal for your review.',
    es: 'Actualicé la propuesta para que la revises.',
  },
  'ui.click-to-write-the-feature-scope': {
    'pt-BR': 'Clique para escrever o escopo da feature.',
    en: 'Click to write the feature scope.',
    es: 'Haz clic para escribir el alcance de la funcionalidad.',
  },
  'ui.click-to-write-acceptance-criteria': {
    'pt-BR': 'Clique para escrever os critérios de aceitação.',
    en: 'Click to write acceptance criteria.',
    es: 'Haz clic para escribir los criterios de aceptación.',
  },
  'ui.click-to-break-the-feature-into-tasks': {
    'pt-BR': 'Clique para quebrar a feature em tarefas.',
    en: 'Click to break the feature into tasks.',
    es: 'Haz clic para dividir la funcionalidad en tareas.',
  },
  'ui.click-to-write-the-project-briefing': {
    'pt-BR': 'Clique para escrever o briefing do projeto.',
    en: 'Click to write the project briefing.',
    es: 'Haz clic para escribir el briefing del proyecto.',
  },
  'ui.click-to-write-the-product-vision': {
    'pt-BR': 'Clique para escrever a visão do produto.',
    en: 'Click to write the product vision.',
    es: 'Haz clic para escribir la visión del producto.',
  },
  'ui.click-to-list-what-the-operation-delivers': {
    'pt-BR': 'Clique para listar o que a operação entrega.',
    en: 'Click to list what the operation delivers.',
    es: 'Haz clic para listar las entregas de la operación.',
  },
  'ui.click-to-list-what-is-out-of-scope': {
    'pt-BR': 'Clique para listar o que fica de fora.',
    en: 'Click to list what is out of scope.',
    es: 'Haz clic para listar lo que queda fuera del alcance.',
  },
  'ui.click-to-write-domain-terms': {
    'pt-BR': 'Clique para escrever os termos do domínio.',
    en: 'Click to write domain terms.',
    es: 'Haz clic para escribir los términos del dominio.',
  },
  'ui.click-to-write-the-architecture-overview': {
    'pt-BR': 'Clique para escrever a visão geral da arquitetura.',
    en: 'Click to write the architecture overview.',
    es: 'Haz clic para escribir la visión general de la arquitectura.',
  },
  'ui.italic-ctrl-i': {
    'pt-BR': 'Itálico (Ctrl+I)',
    en: 'Italic (Ctrl+I)',
    es: 'Cursiva (Ctrl+I)',
  },
  'ui.subheading': {
    'pt-BR': 'Subtítulo',
    en: 'Subheading',
    es: 'Subtítulo',
  },
  'ui.what-must-be-delivered': {
    'pt-BR': 'o que deve ser entregue',
    en: 'what must be delivered',
    es: 'qué se debe entregar',
  },
  'ui.context-expected-behavior-and-feature-boundaries': {
    'pt-BR': 'Contexto, comportamento esperado e limites da feature.',
    en: 'Context, expected behavior and feature boundaries.',
    es: 'Contexto, comportamiento esperado y límites de la funcionalidad.',
  },
  'ui.verifiable-list': {
    'pt-BR': 'lista verificável',
    en: 'verifiable list',
    es: 'lista verificable',
  },
  'ui.given-when-then': {
    'pt-BR': '- Dado… quando… então…',
    en: '- Given… when… then…',
    es: '- Dado… cuando… entonces…',
  },
  'ui.goal-users-constraints-and-done': {
    'pt-BR': 'objetivo, usuários, restrições e pronto',
    en: 'goal, users, constraints and done',
    es: 'objetivo, usuarios, restricciones y terminado',
  },
  'ui.for-whom-problem-and-value': {
    'pt-BR': 'para quem, problema e valor',
    en: 'for whom, problem and value',
    es: 'para quién, problema y valor',
  },
  'ui.audience-problem-value-proposition-differentiators-and-': {
    'pt-BR': 'Para quem é, que problema resolve, proposta de valor, diferenciais e metas.',
    en: 'Audience, problem, value proposition, differentiators and goals.',
    es: 'Público, problema, propuesta de valor, diferenciadores y objetivos.',
  },
  'ui.one-item-per-line': {
    'pt-BR': 'um item por linha',
    en: 'one item per line',
    es: 'un elemento por línea',
  },
  'ui.term-definition-one-per-line': {
    'pt-BR': 'termo: definição, um por linha',
    en: 'term: definition, one per line',
    es: 'término: definición, uno por línea',
  },
  'ui.sku-unique-code-identifying-a-product': {
    'pt-BR': 'SKU: código único que identifica um produto',
    en: 'SKU: unique code identifying a product',
    es: 'SKU: código único que identifica un producto',
  },
  'ui.overview-components-data-and-integrations': {
    'pt-BR': 'visão geral: componentes, dados e integrações',
    en: 'overview: components, data and integrations',
    es: 'visión general: componentes, datos e integraciones',
  },
  'ui.components-integrations-data-environments-and-technical': {
    'pt-BR': 'Componentes, integrações, dados, ambientes e restrições técnicas.',
    en: 'Components, integrations, data, environments and technical constraints.',
    es: 'Componentes, integraciones, datos, entornos y restricciones técnicas.',
  },
  'ui.click-to-write': {
    'pt-BR': 'Clique para escrever.',
    en: 'Click to write.',
    es: 'Haz clic para escribir.',
  },
  'ui.criterion': {
    'pt-BR': 'critério',
    en: 'criterion',
    es: 'criterio',
  },
  'ui.identity': {
    'pt-BR': 'IDENTIDADE',
    en: 'IDENTITY',
    es: 'IDENTIDAD',
  },
  'ui.instructions': {
    'pt-BR': 'INSTRUÇÕES',
    en: 'INSTRUCTIONS',
    es: 'INSTRUCCIONES',
  },
  'ui.tools': {
    'pt-BR': 'FERRAMENTAS',
    en: 'TOOLS',
    es: 'HERRAMIENTAS',
  },
  'ui.guidelines': {
    'pt-BR': 'DIRETRIZES',
    en: 'GUIDELINES',
    es: 'DIRECTRICES',
  },
  'ui.execution': {
    'pt-BR': 'EXECUÇÃO',
    en: 'EXECUTION',
    es: 'EJECUCIÓN',
  },
  'ui.gallery': {
    'pt-BR': 'Galeria',
    en: 'Gallery',
    es: 'Galería',
  },
  'ui.ready': {
    'pt-BR': 'PRONTA',
    en: 'READY',
    es: 'LISTA',
  },
  'ui.blocked': {
    'pt-BR': 'BLOQUEADO',
    en: 'BLOCKED',
    es: 'BLOQUEADO',
  },
  'ui.done': {
    'pt-BR': 'CONCLUÍDA',
    en: 'DONE',
    es: 'COMPLETADA',
  },
  'ui.intelligence': {
    'pt-BR': 'RECONHECIMENTO',
    en: 'INTELLIGENCE',
    es: 'INTELIGENCIA',
  },
  'ui.development': {
    'pt-BR': 'DESENVOLVIMENTO',
    en: 'DEVELOPMENT',
    es: 'DESARROLLO',
  },
  'ui.testing': {
    'pt-BR': 'TESTES',
    en: 'TESTING',
    es: 'PRUEBAS',
  },
  'ui.support': {
    'pt-BR': 'SUPORTE',
    en: 'SUPPORT',
    es: 'SOPORTE',
  },
  'ui.architect': {
    'pt-BR': 'Arquiteto',
    en: 'Architect',
    es: 'Arquitecto',
  },
  'ui.refinement': {
    'pt-BR': 'Refinamento',
    en: 'Refinement',
    es: 'Refinamiento',
  },
  'ui.choose-agent': {
    'pt-BR': 'Escolher agente',
    en: 'Choose agent',
    es: 'Elegir agente',
  },
  'ui.create-agent': {
    'pt-BR': 'Criar agente',
    en: 'Create agent',
    es: 'Crear agente',
  },
  'ui.automatic-default': {
    'pt-BR': 'Automático (padrão)',
    en: 'Automatic (default)',
    es: 'Automático (predeterminado)',
  },
  'ui.applications': {
    'pt-BR': 'Aplicativos',
    en: 'Applications',
    es: 'Aplicaciones',
  },
  'ui.infrastructure': {
    'pt-BR': 'Infraestrutura',
    en: 'Infrastructure',
    es: 'Infraestructura',
  },
  'ui.the-hexagonal-city-becomes-a-3d-planet-drag-to-rotate-and-see-agents-on-the-other-side-requires-webgl':
    {
      'pt-BR':
        'A cidade hexagonal vira um planeta 3D: arraste para girar o planeta e ver os agentes do outro lado. Precisa de WebGL.',
      en: 'The hexagonal city becomes a 3D planet. Drag to rotate and see agents on the other side. Requires WebGL.',
      es: 'La ciudad hexagonal se convierte en un planeta 3D. Arrastra para girar y ver los agentes del otro lado. Requiere WebGL.',
    },
  'ui.read': {
    'pt-BR': 'Read',
    en: 'Read',
    es: 'Leer',
  },
  'ui.search-contents': {
    'pt-BR': 'Grep',
    en: 'Search contents',
    es: 'Buscar contenido',
  },
  'ui.status-of': {
    'pt-BR': 'Status do ',
    en: 'Status of ',
    es: 'Estado de ',
  },
  'error.permissionDenied': {
    'pt-BR':
      'O CLI bloqueou uma ação pelas permissões atuais. Confira o console e a pasta da operação. Se faltam arquivos, conclua o setup nessa pasta; não procure código na aplicação Luma Hive. As permissões configuradas foram mantidas.',
    en: 'The CLI blocked an action under current permissions. Check the console and operation folder. If files are missing, complete setup in that folder; do not search the Luma Hive application for code. Configured permissions were preserved.',
    es: 'El CLI bloqueó una acción según los permisos actuales. Revisa la consola y la carpeta de la operación. Si faltan archivos, completa la configuración en esa carpeta; no busques código en la aplicación Luma Hive. Se conservaron los permisos configurados.',
  },
  'ui.saving': {
    'pt-BR': 'SALVANDO…',
    en: 'SAVING…',
    es: 'GUARDANDO…',
  },
  'ui.no-events-recorded': {
    'pt-BR': 'Nenhum evento registrado.',
    en: 'No events recorded.',
    es: 'No hay eventos registrados.',
  },
  'ui.found': {
    'pt-BR': 'encontrado',
    en: 'found',
    es: 'encontrado',
  },
  'ui.recruit-agent': {
    'pt-BR': 'RECRUTAR <span class=word-tag>AGENTE</span>',
    en: 'RECRUIT <span class=word-tag>AGENT</span>',
    es: 'RECLUTAR <span class=word-tag>AGENTE</span>',
  },
  'ui.agent-studio': {
    'pt-BR': 'ESTÚDIO DO <span class=word-tag>AGENTE</span>',
    en: 'AGENT <span class=word-tag>STUDIO</span>',
    es: 'ESTUDIO DEL <span class=word-tag>AGENTE</span>',
  },
  'ui.automatic': {
    'pt-BR': 'AUTOMÁTICA',
    en: 'AUTOMATIC',
    es: 'AUTOMÁTICA',
  },
  'ui.squad-center': {
    'pt-BR': 'Centro do squad',
    en: 'Squad center',
    es: 'Centro del equipo',
  },
  'ui.operation-commander': {
    'pt-BR': 'Comandante da operação',
    en: 'Operation commander',
    es: 'Comandante de la operación',
  },
  'ui.opening-message': {
    'pt-BR': 'Mensagem inicial ',
    en: 'Opening message ',
    es: 'Mensaje inicial ',
  },
  'ui.custom-edited': {
    'pt-BR': 'Personalizado (editado)',
    en: 'Custom (edited)',
    es: 'Personalizado (editado)',
  },
  'ui.no-base-guide': {
    'pt-BR': 'Sem guia base',
    en: 'No base guide',
    es: 'Sin guía base',
  },
  'ui.choose-photo': {
    'pt-BR': 'ESCOLHER FOTO',
    en: 'CHOOSE PHOTO',
    es: 'ELEGIR FOTO',
  },
  'ui.choose-icon': {
    'pt-BR': 'ESCOLHER ÍCONE',
    en: 'CHOOSE ICON',
    es: 'ELEGIR ICONO',
  },
  'ui.already-added-to-this-agent': {
    'pt-BR': 'Já adicionado a este agente',
    en: 'Already added to this agent',
    es: 'Ya añadido a este agente',
  },
  'ui.from-library': {
    'pt-BR': ' da biblioteca',
    en: ' from library',
    es: ' de la biblioteca',
  },
  'ui.conversation-with': {
    'pt-BR': 'Conversa com ',
    en: 'Conversation with ',
    es: 'Conversación con ',
  },
  'ui.message-for': {
    'pt-BR': 'Mensagem para ',
    en: 'Message for ',
    es: 'Mensaje para ',
  },
  'ui.transmission-log': {
    'pt-BR': 'REGISTRO DE <span class=word-tag>TRANSMISSÕES</span>',
    en: '<span class=word-tag>TRANSMISSION</span> LOG',
    es: 'REGISTRO DE <span class=word-tag>TRANSMISIONES</span>',
  },
  'ui.agent-console': {
    'pt-BR': 'CONSOLE DOS <span class=word-tag>AGENTES</span>',
    en: '<span class=word-tag>AGENT</span> CONSOLE',
    es: 'CONSOLA DE <span class=word-tag>AGENTES</span>',
  },
  'ui.system': {
    'pt-BR': 'SISTEMA',
    en: 'SYSTEM',
    es: 'SISTEMA',
  },
  'ui.agent': {
    'pt-BR': 'AGENTE',
    en: 'AGENT',
    es: 'AGENTE',
  },
  'ui.live-execution': {
    'pt-BR': 'EXECUÇÃO REAL / ',
    en: 'LIVE EXECUTION / ',
    es: 'EJECUCIÓN REAL / ',
  },
  'ui.bridge-disconnected': {
    'pt-BR': 'BRIDGE DESCONECTADO',
    en: 'BRIDGE DISCONNECTED',
    es: 'BRIDGE DESCONECTADO',
  },
  'ui.briefing-pending': {
    'pt-BR': 'Briefing pendente.',
    en: 'Briefing pending.',
    es: 'Briefing pendiente.',
  },
  'ui.commander-planning': {
    'pt-BR': 'COMANDANTE PLANEJANDO',
    en: 'COMMANDER PLANNING',
    es: 'COMANDANTE PLANIFICANDO',
  },
  'ui.plan-awaits-approval': {
    'pt-BR': 'PLANO AGUARDA APROVAÇÃO',
    en: 'PLAN AWAITS APPROVAL',
    es: 'EL PLAN ESPERA APROBACIÓN',
  },
  'ui.paused': {
    'pt-BR': 'PAUSADA',
    en: 'PAUSED',
    es: 'PAUSADA',
  },
  'ui.running-expr-31': {
    'pt-BR': 'EXECUTANDO',
    en: 'RUNNING',
    es: 'EN EJECUCIÓN',
  },
  'ui.the-commander-is-preparing-the-plan': {
    'pt-BR': 'O comandante está montando o plano',
    en: 'The commander is preparing the plan',
    es: 'El comandante está preparando el plan',
  },
  'ui.approve-the-plan-in-operation-chat': {
    'pt-BR': 'Aprove o plano no chat da operação',
    en: 'Approve the plan in operation chat',
    es: 'Aprueba el plan en el chat de la operación',
  },
  'ui.selecting-the-next-feature-expr-34': {
    'pt-BR': 'Selecionando próxima feature',
    en: 'Selecting the next feature',
    es: 'Seleccionando la siguiente funcionalidad',
  },
  'ui.pause': {
    'pt-BR': 'Pausar',
    en: 'Pause',
    es: 'Pausar',
  },
  'ui.plan': {
    'pt-BR': 'Planejar ',
    en: 'Plan ',
    es: 'Planificar ',
  },
  'ui.view-sprints': {
    'pt-BR': 'Ver sprints',
    en: 'View sprints',
    es: 'Ver sprints',
  },
  'ui.mention': {
    'pt-BR': 'Marcar @',
    en: 'Mention @',
    es: 'Mencionar @',
  },
  'ui.in-chat': {
    'pt-BR': ' no chat',
    en: ' in chat',
    es: ' en el chat',
  },
  'ui.no-prd-agent': {
    'pt-BR': 'SEM AGENTE PRD',
    en: 'NO PRD AGENT',
    es: 'SIN AGENTE PRD',
  },
  'ui.hi-tell-me-what-needs-to-be-delivered-and-i-ll-help-you': {
    'pt-BR': 'Oi! Me conta o que precisa ser entregue, que eu ajudo a detalhar.',
    en: "Hi! Tell me what needs to be delivered and I'll help you detail it.",
    es: '¡Hola! Cuéntame qué hay que entregar y te ayudaré a detallarlo.',
  },
  'ui.edit-feature': {
    'pt-BR': 'EDITAR <span class=word-tag>FEATURE</span>',
    en: 'EDIT <span class=word-tag>FEATURE</span>',
    es: 'EDITAR <span class=word-tag>FUNCIONALIDAD</span>',
  },
  'ui.new-feature': {
    'pt-BR': 'NOVA <span class=word-tag>FEATURE</span>',
    en: 'NEW <span class=word-tag>FEATURE</span>',
    es: 'NUEVA <span class=word-tag>FUNCIONALIDAD</span>',
  },
  'ui.none': {
    'pt-BR': 'nenhuma',
    en: 'none',
    es: 'ninguna',
  },
  'ui.built-in-demo': {
    'pt-BR': 'MONTADO NA DEMONSTRAÇÃO',
    en: 'BUILT IN DEMO',
    es: 'CREADO EN LA DEMOSTRACIÓN',
  },
  'ui.default-squad-distribution': {
    'pt-BR': 'DISTRIBUIÇÃO PADRÃO DA SQUAD',
    en: 'DEFAULT SQUAD DISTRIBUTION',
    es: 'DISTRIBUCIÓN PREDETERMINADA DEL EQUIPO',
  },
  'ui.built-by-commander': {
    'pt-BR': 'MONTADO PELO COMANDANTE',
    en: 'BUILT BY COMMANDER',
    es: 'CREADO POR EL COMANDANTE',
  },
  'ui.removed-agent': {
    'pt-BR': 'AGENTE REMOVIDO',
    en: 'REMOVED AGENT',
    es: 'AGENTE ELIMINADO',
  },
  'ui.simulated-record': {
    'pt-BR': 'REGISTRO SIMULADO',
    en: 'SIMULATED RECORD',
    es: 'REGISTRO SIMULADO',
  },
  'ui.execution-failed': {
    'pt-BR': 'FALHA NA EXECUÇÃO',
    en: 'EXECUTION FAILED',
    es: 'FALLO EN LA EJECUCIÓN',
  },
  'ui.cli-records-review-changed-files-in-the-repository-befo': {
    'pt-BR':
      'Registros do CLI: revise os arquivos alterados no repositório antes de aprovar. Aprovar libera as features dependentes.',
    en: 'CLI records: review changed files in the repository before approving. Approval releases dependent features.',
    es: 'Registros del CLI: revisa los archivos modificados en el repositorio antes de aprobar. Aprobar libera las funcionalidades dependientes.',
  },
  'ui.these-records-are-simulated-approval-only-changes-the-d': {
    'pt-BR':
      'Estes registros são simulados. Aprovar altera apenas o estado demonstrativo da feature; não valida código real.',
    en: 'These records are simulated. Approval only changes the demo state; it does not validate real code.',
    es: 'Estos registros son simulados. Aprobar solo cambia el estado de demostración; no valida código real.',
  },
  'ui.approve-delivery': {
    'pt-BR': 'Aprovar entrega',
    en: 'Approve delivery',
    es: 'Aprobar entrega',
  },
  'ui.approve-delivery-demo': {
    'pt-BR': 'Aprovar entrega / demo',
    en: 'Approve delivery / demo',
    es: 'Aprobar entrega / demo',
  },
  'ui.the-cli-runs-in-the-operation-folder': {
    'pt-BR': 'O CLI roda na pasta da operação.',
    en: 'The CLI runs in the operation folder.',
    es: 'El CLI se ejecuta en la carpeta de la operación.',
  },
  'ui.no-real-ai-execution': {
    'pt-BR': 'Não há execução real de IA.',
    en: 'No real AI execution.',
    es: 'Sin ejecución real de IA.',
  },
  'ui.spawn-cli': {
    'pt-BR': 'Spawn / CLI',
    en: 'Spawn / CLI',
    es: 'Ejecución individual / CLI',
  },
  'ui.start-spawn-demo': {
    'pt-BR': 'Iniciar spawn / demo',
    en: 'Start spawn / demo',
    es: 'Iniciar ejecución individual / demo',
  },
  'ui.specialist-transmissions': {
    'pt-BR': ' / TRANSMISSÕES ENTRE ESPECIALISTAS',
    en: ' / SPECIALIST TRANSMISSIONS',
    es: ' / TRANSMISIONES ENTRE ESPECIALISTAS',
  },
  'ui.removed': {
    'pt-BR': 'REMOVIDO',
    en: 'REMOVED',
    es: 'ELIMINADO',
  },
  'ui.archived': {
    'pt-BR': 'ARQUIVADA',
    en: 'ARCHIVED',
    es: 'ARCHIVADA',
  },
  'ui.manual': {
    'pt-BR': 'MANUAL',
    en: 'MANUAL',
    es: 'MANUAL',
  },
  'ui.working': {
    'pt-BR': 'TRABALHANDO',
    en: 'WORKING',
    es: 'TRABAJANDO',
  },
  'ui.in-transit': {
    'pt-BR': 'EM TRÂNSITO',
    en: 'IN TRANSIT',
    es: 'EN TRÁNSITO',
  },
  'ui.available': {
    'pt-BR': 'DISPONÍVEL',
    en: 'AVAILABLE',
    es: 'DISPONIBLE',
  },
  'ui.operation-paused': {
    'pt-BR': 'OPERAÇÃO PAUSADA',
    en: 'OPERATION PAUSED',
    es: 'OPERACIÓN PAUSADA',
  },
  'ui.in-operation': {
    'pt-BR': 'EM OPERAÇÃO',
    en: 'IN OPERATION',
    es: 'EN OPERACIÓN',
  },
  'ui.on-standby': {
    'pt-BR': 'EM PRONTIDÃO',
    en: 'ON STANDBY',
    es: 'EN ESPERA',
  },
  'ui.select-expr-72': {
    'pt-BR': 'Selecionar ',
    en: 'Select ',
    es: 'Seleccionar ',
  },
  'ui.portrait-of': {
    'pt-BR': 'Retrato de ',
    en: 'Portrait of ',
    es: 'Retrato de ',
  },
  'ui.default-expr-75': {
    'pt-BR': 'PADRÃO ',
    en: 'DEFAULT ',
    es: 'PREDETERMINADO ',
  },
  'ui.running-expr-76': {
    'pt-BR': 'EXECUTANDO ',
    en: 'RUNNING ',
    es: 'EJECUTANDO ',
  },
  'ui.current-mission': {
    'pt-BR': 'MISSÃO ATUAL',
    en: 'CURRENT MISSION',
    es: 'MISIÓN ACTUAL',
  },
  'ui.next-assignment': {
    'pt-BR': 'PRÓXIMA ATRIBUIÇÃO',
    en: 'NEXT ASSIGNMENT',
    es: 'SIGUIENTE ASIGNACIÓN',
  },
  'ui.planning': {
    'pt-BR': 'PLANEJANDO',
    en: 'PLANNING',
    es: 'PLANIFICANDO',
  },
  'ui.approve-plan': {
    'pt-BR': 'APROVAR PLANO',
    en: 'APPROVE PLAN',
    es: 'APROBAR PLAN',
  },
  'ui.resume': {
    'pt-BR': 'RETORNAR',
    en: 'RESUME',
    es: 'REANUDAR',
  },
  'ui.pause-expr-83': {
    'pt-BR': 'PAUSAR',
    en: 'PAUSE',
    es: 'PAUSAR',
  },
  'ui.plan-expr-84': {
    'pt-BR': 'PLANEJAR ',
    en: 'PLAN ',
    es: 'PLANIFICAR ',
  },
  'ui.plan-approved-the-squad-is-executing': {
    'pt-BR': 'Plano aprovado. A squad está executando.',
    en: 'Plan approved. The squad is executing.',
    es: 'Plan aprobado. El equipo está ejecutando.',
  },
  'ui.awaits-your-review': {
    'pt-BR': 'aguarda a sua revisão.',
    en: 'awaits your review.',
    es: 'espera tu revisión.',
  },
  'ui.left-review': {
    'pt-BR': 'saiu da revisão.',
    en: 'left review.',
    es: 'salió de la revisión.',
  },
  'ui.simulated': {
    'pt-BR': ' simulada',
    en: ' simulated',
    es: ' simulada',
  },
  'ui.is-preparing-the-plan': {
    'pt-BR': 'está montando o plano',
    en: 'is preparing the plan',
    es: 'está preparando el plan',
  },
  'ui.is-working': {
    'pt-BR': 'está trabalhando',
    en: 'is working',
    es: 'está trabajando',
  },
  'ui.working-expr-94': {
    'pt-BR': 'trabalhando',
    en: 'working',
    es: 'trabajando',
  },
  'ui.resume-expr-95': {
    'pt-BR': 'Retomar',
    en: 'Resume',
    es: 'Reanudar',
  },
  'ui.local-simulation-no-ai-executed': {
    'pt-BR': 'SIMULAÇÃO LOCAL / NENHUMA IA EXECUTADA',
    en: 'LOCAL SIMULATION / NO AI EXECUTED',
    es: 'SIMULACIÓN LOCAL / SIN EJECUCIÓN DE IA',
  },
  'ui.no-messages-yet': {
    'pt-BR': 'Nenhuma mensagem ainda',
    en: 'No messages yet',
    es: 'Aún no hay mensajes',
  },
  'ui.no-commander': {
    'pt-BR': 'SEM COMANDANTE',
    en: 'NO COMMANDER',
    es: 'SIN COMANDANTE',
  },
  'ui.operation-expr-99': {
    'pt-BR': 'OPERAÇÃO',
    en: 'OPERATION',
    es: 'OPERACIÓN',
  },
  'ui.filled': {
    'pt-BR': 'PREENCHIDO',
    en: 'FILLED',
    es: 'COMPLETADO',
  },
  'ui.empty': {
    'pt-BR': 'VAZIO',
    en: 'EMPTY',
    es: 'VACÍO',
  },
  'ui.co-write': {
    'pt-BR': 'Co-escrever ',
    en: 'Co-write ',
    es: 'Coescribir ',
  },
  'ui.new-feature-in': {
    'pt-BR': 'Nova feature em ',
    en: 'New feature in ',
    es: 'Nueva funcionalidad en ',
  },
  'ui.edit-sprint': {
    'pt-BR': 'EDITAR <span class=word-tag>SPRINT</span>',
    en: 'EDIT <span class=word-tag>SPRINT</span>',
    es: 'EDITAR <span class=word-tag>SPRINT</span>',
  },
  'ui.new-sprint': {
    'pt-BR': 'NOVA <span class=word-tag>SPRINT</span>',
    en: 'NEW <span class=word-tag>SPRINT</span>',
    es: 'NUEVO <span class=word-tag>SPRINT</span>',
  },
  'ui.live-execution-codex-devin-and-antigravity': {
    'pt-BR': 'EXECUÇÃO REAL / CODEX, DEVIN E ANTIGRAVITY',
    en: 'LIVE EXECUTION / CODEX, DEVIN AND ANTIGRAVITY',
    es: 'EJECUCIÓN REAL / CODEX, DEVIN Y ANTIGRAVITY',
  },
  'ui.local-first-runtime-disconnected': {
    'pt-BR': 'LOCAL-FIRST / RUNTIME DESCONECTADO',
    en: 'LOCAL-FIRST / RUNTIME DISCONNECTED',
    es: 'LOCAL-FIRST / RUNTIME DESCONECTADO',
  },
  'ui.checking-connection': {
    'pt-BR': 'Verificando conexão…',
    en: 'Checking connection…',
    es: 'Comprobando conexión…',
  },
  'ui.agy-exe-automatically-detected': {
    'pt-BR': 'agy.exe (detectado automaticamente)',
    en: 'agy.exe (automatically detected)',
    es: 'agy.exe (detectado automáticamente)',
  },
  'ui.bridge-default': {
    'pt-BR': ' (padrão do bridge)',
    en: ' (bridge default)',
    es: ' (predeterminado del bridge)',
  },
  'ui.execution-mode': {
    'pt-BR': 'MODO DE EXECUÇÃO',
    en: 'EXECUTION MODE',
    es: 'MODO DE EJECUCIÓN',
  },
  'ui.permission-mode': {
    'pt-BR': 'MODO DE PERMISSÃO',
    en: 'PERMISSION MODE',
    es: 'MODO DE PERMISO',
  },
  'ui.save-execution': {
    'pt-BR': 'Salvar execução',
    en: 'Save execution',
    es: 'Guardar ejecución',
  },
  'ui.save-settings': {
    'pt-BR': 'Salvar configurações',
    en: 'Save settings',
    es: 'Guardar configuración',
  },
  'ui.squad-name': {
    'pt-BR': 'NOME DA SQUAD',
    en: 'SQUAD NAME',
    es: 'NOMBRE DEL EQUIPO',
  },
  'ui.new-squad-name-required': {
    'pt-BR': 'NOVA SQUAD / NOME OBRIGATÓRIO',
    en: 'NEW SQUAD / NAME REQUIRED',
    es: 'NUEVO EQUIPO / NOMBRE OBLIGATORIO',
  },
  'ui.complete-squad': {
    'pt-BR': 'SQUAD COMPLETA',
    en: 'COMPLETE SQUAD',
    es: 'EQUIPO COMPLETO',
  },
  'ui.missing': {
    'pt-BR': 'FALTA: ',
    en: 'MISSING: ',
    es: 'FALTA: ',
  },
  'ui.save-squad': {
    'pt-BR': 'Salvar squad',
    en: 'Save squad',
    es: 'Guardar equipo',
  },
  'ui.create-squad-and-operation': {
    'pt-BR': 'Criar squad e operação',
    en: 'Create squad and operation',
    es: 'Crear equipo y operación',
  },
  'ui.create-squad': {
    'pt-BR': 'Criar squad',
    en: 'Create squad',
    es: 'Crear equipo',
  },
  'ui.show-agent-icons': {
    'pt-BR': 'Mostrar ícones dos agentes',
    en: 'Show agent icons',
    es: 'Mostrar iconos de los agentes',
  },
  'ui.show-agent-photos': {
    'pt-BR': 'Mostrar fotos dos agentes',
    en: 'Show agent photos',
    es: 'Mostrar fotos de los agentes',
  },
  'ui.category': {
    'pt-BR': 'CATEGORIA',
    en: 'CATEGORY',
    es: 'CATEGORÍA',
  },
  'ui.agents-in-this-category': {
    'pt-BR': ' AGENTES NESTA CATEGORIA',
    en: ' AGENTS IN THIS CATEGORY',
    es: ' AGENTES EN ESTA CATEGORÍA',
  },
  'ui.scope': {
    'pt-BR': 'ESCOPO',
    en: 'SCOPE',
    es: 'ALCANCE',
  },
  'ui.glossary': {
    'pt-BR': 'GLOSSÁRIO',
    en: 'GLOSSARY',
    es: 'GLOSARIO',
  },
  'ui.architecture': {
    'pt-BR': 'ARQUITETURA',
    en: 'ARCHITECTURE',
    es: 'ARQUITECTURA',
  },
  'ui.briefing': {
    'pt-BR': 'BRIEFING',
    en: 'BRIEFING',
    es: 'BRIEFING',
  },
  'ui.commander': {
    'pt-BR': 'COMANDANTE',
    en: 'COMMANDER',
    es: 'COMANDANTE',
  },
  'ui.commander-organizer': {
    'pt-BR': 'COMANDANTE · ORGANIZADOR',
    en: 'COMMANDER · ORGANIZER',
    es: 'COMANDANTE · ORGANIZADOR',
  },
  'ui.operator': {
    'pt-BR': 'Operador',
    en: 'Operator',
    es: 'Operador',
  },
  'ui.proposed': {
    'pt-BR': 'Proposto',
    en: 'Proposed',
    es: 'Propuesto',
  },
  'ui.accepted': {
    'pt-BR': 'Aceito',
    en: 'Accepted',
    es: 'Aceptado',
  },
  'ui.rejected': {
    'pt-BR': 'Rejeitado',
    en: 'Rejected',
    es: 'Rechazado',
  },
  'pixel.room.lounge': {
    'pt-BR': 'Lazer / Entrada',
    en: 'Lounge / Entrance',
    es: 'Descanso / Entrada',
  },
  'pixel.room.architecture': {
    'pt-BR': 'Arquitetura',
    en: 'Architecture',
    es: 'Arquitectura',
  },
  'pixel.room.meeting': {
    'pt-BR': 'Reunião',
    en: 'Meeting',
    es: 'Reunión',
  },
  'pixel.room.docs': {
    'pt-BR': 'Documentação',
    en: 'Documentation',
    es: 'Documentación',
  },
  'pixel.room.war': {
    'pt-BR': 'War Room',
    en: 'War Room',
    es: 'Sala de crisis',
  },
  'pixel.room.development': {
    'pt-BR': 'Desenvolvimento',
    en: 'Development',
    es: 'Desarrollo',
  },
  'pixel.room.command': {
    'pt-BR': 'Comando',
    en: 'Command',
    es: 'Mando',
  },
  'pixel.room.design': {
    'pt-BR': 'Design',
    en: 'Design',
    es: 'Diseño',
  },
  'pixel.room.flex': {
    'pt-BR': 'Sala Flex',
    en: 'Flex Room',
    es: 'Sala flexible',
  },
  'pixel.room.testing': {
    'pt-BR': 'Testes',
    en: 'Testing',
    es: 'Pruebas',
  },
  'pixel.room.review': {
    'pt-BR': 'Revisão',
    en: 'Review',
    es: 'Revisión',
  },
  'pixel.room.devops': {
    'pt-BR': 'DevOps / Cloud',
    en: 'DevOps / Cloud',
    es: 'DevOps / Cloud',
  },
  'pixel.room.support': {
    'pt-BR': 'Suporte',
    en: 'Support',
    es: 'Soporte',
  },
  'catalog.database': {
    'pt-BR': 'Banco de dados',
    en: 'Database',
    es: 'Base de datos',
  },
  'catalog.qa-testing': {
    'pt-BR': 'QA / Testes',
    en: 'QA / Testing',
    es: 'QA / Pruebas',
  },
  'catalog.security': {
    'pt-BR': 'Segurança',
    en: 'Security',
    es: 'Seguridad',
  },
  'catalog.data': {
    'pt-BR': 'Dados',
    en: 'Data',
    es: 'Datos',
  },
  'catalog.documentation': {
    'pt-BR': 'Documentação',
    en: 'Documentation',
    es: 'Documentación',
  },
  'catalog.others': {
    'pt-BR': 'Outros',
    en: 'Others',
    es: 'Otros',
  },
  'catalog.project-manager-scrum': {
    'pt-BR': 'Gestor de Projetos / Scrum',
    en: 'Project Manager / Scrum',
    es: 'Gestor de Proyectos / Scrum',
  },
  'catalog.security-appsec-': {
    'pt-BR': 'Segurança (AppSec)',
    en: 'Security (AppSec)',
    es: 'Seguridad (AppSec)',
  },
  'catalog.data-engineering': {
    'pt-BR': 'Engenharia de Dados',
    en: 'Data Engineering',
    es: 'Ingeniería de Datos',
  },
  'catalog.technical-documentation': {
    'pt-BR': 'Documentação Técnica',
    en: 'Technical Documentation',
    es: 'Documentación Técnica',
  },
  'catalog.react-specialist': {
    'pt-BR': 'Especialista React',
    en: 'React Specialist',
    es: 'Especialista React',
  },
  'catalog.angular-specialist': {
    'pt-BR': 'Especialista Angular',
    en: 'Angular Specialist',
    es: 'Especialista Angular',
  },
  'catalog.adr-analyst-architecture-': {
    'pt-BR': 'Reconhecedor ADR (arquitetura)',
    en: 'ADR Analyst (architecture)',
    es: 'Analista ADR (arquitectura)',
  },
  'catalog.prd-analyst-product-': {
    'pt-BR': 'Reconhecedor PRD (produto)',
    en: 'PRD Analyst (product)',
    es: 'Analista PRD (producto)',
  },
  'catalog.project-management': {
    'pt-BR': 'Gestão de projeto',
    en: 'Project management',
    es: 'Gestión de proyecto',
  },
  'catalog.backend-general-': {
    'pt-BR': 'Backend (geral)',
    en: 'Backend (general)',
    es: 'Backend (general)',
  },
  'catalog.frontend-general-': {
    'pt-BR': 'Frontend (geral)',
    en: 'Frontend (general)',
    es: 'Frontend (general)',
  },
  'catalog.general': {
    'pt-BR': 'Geral',
    en: 'General',
    es: 'General',
  },
  'action.runPrefix': {
    'pt-BR': 'Executar ',
    en: 'Run ',
    es: 'Ejecutar ',
  },
  'action.simulatePrefix': {
    'pt-BR': 'Simular ',
    en: 'Simulate ',
    es: 'Simular ',
  },
  'common.and': {
    'pt-BR': 'e',
    en: 'and',
    es: 'y',
  },
  'nav.observability': {
    'pt-BR': 'OBSERVABILIDADE',
    en: 'OBSERVABILITY',
    es: 'OBSERVABILIDAD',
  },
  'obs.eyebrow': {
    'pt-BR': 'EXECUÇÕES · AGENTES · CONSUMO',
    en: 'RUNS · AGENTS · USAGE',
    es: 'EJECUCIONES · AGENTES · CONSUMO',
  },
  'obs.title': {
    'pt-BR': 'Observabilidade',
    en: 'Observability',
    es: 'Observabilidad',
  },
  'obs.description': {
    'pt-BR': 'Acompanhe as execuções, as consultas a subagentes e o consumo informado pelos CLIs.',
    en: 'Inspect runs, subagent consultations and usage reported by the CLIs.',
    es: 'Consulta ejecuciones, consultas a subagentes y consumo informado por los CLI.',
  },
  'obs.project': {
    'pt-BR': 'Projeto',
    en: 'Project',
    es: 'Proyecto',
  },
  'obs.period': {
    'pt-BR': 'Período',
    en: 'Period',
    es: 'Período',
  },
  'obs.sprint': {
    'pt-BR': 'Sprint',
    en: 'Sprint',
    es: 'Sprint',
  },
  'obs.agent': {
    'pt-BR': 'Agente envolvido',
    en: 'Agent involved',
    es: 'Agente involucrado',
  },
  'obs.provider': {
    'pt-BR': 'Provedor',
    en: 'Provider',
    es: 'Proveedor',
  },
  'obs.model': {
    'pt-BR': 'Modelo',
    en: 'Model',
    es: 'Modelo',
  },
  'obs.all': {
    'pt-BR': 'Todos',
    en: 'All',
    es: 'Todos',
  },
  'obs.allTime': {
    'pt-BR': 'Todo o histórico',
    en: 'All history',
    es: 'Todo el historial',
  },
  'obs.thisWeek': {
    'pt-BR': 'Esta semana',
    en: 'This week',
    es: 'Esta semana',
  },
  'obs.thisMonth': {
    'pt-BR': 'Este mês',
    en: 'This month',
    es: 'Este mes',
  },
  'obs.retry': {
    'pt-BR': 'Tentar novamente',
    en: 'Retry',
    es: 'Reintentar',
  },
  'obs.runs': {
    'pt-BR': 'Execuções',
    en: 'Runs',
    es: 'Ejecuciones',
  },
  'obs.tokens': {
    'pt-BR': 'Tokens informados',
    en: 'Reported tokens',
    es: 'Tokens informados',
  },
  'obs.duration': {
    'pt-BR': 'Duração',
    en: 'Duration',
    es: 'Duración',
  },
  'obs.helpers': {
    'pt-BR': 'Subagentes detectados',
    en: 'Detected subagents',
    es: 'Subagentes detectados',
  },
  'obs.failures': {
    'pt-BR': 'Falhas',
    en: 'Failures',
    es: 'Fallos',
  },
  'obs.missingUsage': {
    'pt-BR': 'Sem consumo informado',
    en: 'Without reported usage',
    es: 'Sin consumo informado',
  },
  'obs.views': {
    'pt-BR': 'Visualizações de observabilidade',
    en: 'Observability views',
    es: 'Vistas de observabilidad',
  },
  'obs.execution': {
    'pt-BR': 'Execuções e linha do tempo',
    en: 'Runs and timeline',
    es: 'Ejecuciones y línea de tiempo',
  },
  'obs.consumption': {
    'pt-BR': 'Consumo por entrega e agente',
    en: 'Usage by delivery and agent',
    es: 'Consumo por entrega y agente',
  },
  'obs.groupBy': {
    'pt-BR': 'Agrupar por',
    en: 'Group by',
    es: 'Agrupar por',
  },
  'obs.group.agent': {
    'pt-BR': 'Agente responsável',
    en: 'Responsible agent',
    es: 'Agente responsable',
  },
  'obs.group.feature': {
    'pt-BR': 'Feature / entrega',
    en: 'Feature / delivery',
    es: 'Funcionalidad / entrega',
  },
  'obs.group.sprint': {
    'pt-BR': 'Sprint',
    en: 'Sprint',
    es: 'Sprint',
  },
  'obs.group.model': {
    'pt-BR': 'Modelo',
    en: 'Model',
    es: 'Modelo',
  },
  'obs.group.provider': {
    'pt-BR': 'Provedor',
    en: 'Provider',
    es: 'Proveedor',
  },
  'obs.group.subagent': {
    'pt-BR': 'Subagente consultado',
    en: 'Consulted subagent',
    es: 'Subagente consultado',
  },
  'obs.childUsageNote': {
    'pt-BR':
      'Consumo do subagente somente quando informado pelo CLI. Pode já estar incluído no total da execução; não some estas linhas aos totais dos responsáveis.',
    en: 'Subagent usage is shown only when reported by the CLI. It may already be included in the run total; do not add these rows to owner totals.',
    es: 'Se muestra el consumo del subagente solo si lo informa el CLI. Puede estar incluido en el total; no sumes estas filas a los totales de responsables.',
  },
  'obs.rootUsageNote': {
    'pt-BR':
      'Totais informados pelas execuções principais, atribuídos ao responsável e à entrega. Consumo de filhos é detalhado separadamente, sem duplicar os totais. O filtro de agente inclui consultas recebidas.',
    en: 'Main-run totals attributed to their owner and delivery. Child usage is detailed separately without double counting. The agent filter includes received consultations.',
    es: 'Totales de ejecuciones principales atribuidos al responsable y la entrega. Los hijos se detallan aparte sin duplicar totales. El filtro de agente incluye consultas recibidas.',
  },
  'obs.input': {
    'pt-BR': 'Entrada',
    en: 'Input',
    es: 'Entrada',
  },
  'obs.output': {
    'pt-BR': 'Saída',
    en: 'Output',
    es: 'Salida',
  },
  'obs.cached': {
    'pt-BR': 'Cache informado',
    en: 'Reported cache',
    es: 'Caché informada',
  },
  'obs.coverage': {
    'pt-BR': 'Com dados / total',
    en: 'With data / total',
    es: 'Con datos / total',
  },
  'obs.empty': {
    'pt-BR': 'Nenhuma execução para estes filtros.',
    en: 'No runs match these filters.',
    es: 'No hay ejecuciones para estos filtros.',
  },
  'obs.cacheNote': {
    'pt-BR':
      'Cache é um campo nativo separado; sua composição varia por provedor. Não é somado novamente ao total. “—” significa dado não informado. Totais podem ser parciais; são execuções locais, não o saldo da conta.',
    en: 'Cache is a separate native field; its composition varies by provider. It is not added again to the total. “—” means unreported data. Totals may be partial; they cover local runs, not account balance.',
    es: 'La caché es un campo nativo separado; su composición varía por proveedor. No se suma de nuevo al total. “—” indica datos no informados. Los totales pueden ser parciales: son ejecuciones locales, no el saldo de la cuenta.',
  },
  'obs.state.running': {
    'pt-BR': 'Em execução',
    en: 'Running',
    es: 'En ejecución',
  },
  'obs.state.done': {
    'pt-BR': 'Concluído',
    en: 'Completed',
    es: 'Completado',
  },
  'obs.state.failed': {
    'pt-BR': 'Falhou',
    en: 'Failed',
    es: 'Falló',
  },
  'obs.state.cancelled': {
    'pt-BR': 'Cancelado',
    en: 'Cancelled',
    es: 'Cancelado',
  },
  'obs.state.interrupted': {
    'pt-BR': 'Interrompido',
    en: 'Interrupted',
    es: 'Interrumpido',
  },
  'obs.state.unknown': {
    'pt-BR': 'Fim não informado',
    en: 'End not reported',
    es: 'Final no informado',
  },
  'obs.noFeature': {
    'pt-BR': 'Sem feature associada',
    en: 'No associated feature',
    es: 'Sin funcionalidad asociada',
  },
  'obs.unassigned': {
    'pt-BR': 'Sem associação',
    en: 'Unassigned',
    es: 'Sin asociación',
  },
  'obs.defaultModel': {
    'pt-BR': 'Padrão / não informado',
    en: 'Default / unreported',
    es: 'Predeterminado / no informado',
  },
  'obs.previous': {
    'pt-BR': 'Página anterior',
    en: 'Previous page',
    es: 'Página anterior',
  },
  'obs.next': {
    'pt-BR': 'Próxima página',
    en: 'Next page',
    es: 'Página siguiente',
  },
  'obs.export': {
    'pt-BR': 'Exportar execução',
    en: 'Export run',
    es: 'Exportar ejecución',
  },
  'obs.partial': {
    'pt-BR':
      'Este CLI ou registro não oferece todos os eventos estruturados. Exibimos apenas o que foi informado; ausência de subagentes ou tokens não prova que não existiram.',
    en: 'This CLI or record does not expose all structured events. Only reported data is shown; missing subagents or tokens does not prove there were none.',
    es: 'Este CLI o registro no ofrece todos los eventos estructurados. Solo mostramos datos informados; la ausencia de subagentes o tokens no demuestra que no existieran.',
  },
  'obs.tree': {
    'pt-BR': 'Árvore da execução',
    en: 'Run tree',
    es: 'Árbol de ejecución',
  },
  'obs.helper': {
    'pt-BR': 'Subagente',
    en: 'Subagent',
    es: 'Subagente',
  },
  'obs.owner': {
    'pt-BR': 'Responsável',
    en: 'Owner',
    es: 'Responsable',
  },
  'obs.taskMissing': {
    'pt-BR': 'O CLI não informou a tarefa delegada.',
    en: 'The CLI did not report the delegated task.',
    es: 'El CLI no informó la tarea delegada.',
  },
  'obs.unavailable': {
    'pt-BR': 'Não informado',
    en: 'Not reported',
    es: 'No informado',
  },
  'obs.tools': {
    'pt-BR': 'Chamadas de ferramenta',
    en: 'Tool calls',
    es: 'Llamadas a herramientas',
  },
  'obs.timeline': {
    'pt-BR': 'Linha do tempo',
    en: 'Timeline',
    es: 'Línea de tiempo',
  },
  'obs.follow': {
    'pt-BR': 'Acompanhar eventos novos',
    en: 'Follow new events',
    es: 'Seguir eventos nuevos',
  },
  'obs.eventType': {
    'pt-BR': 'Tipo de evento',
    en: 'Event type',
    es: 'Tipo de evento',
  },
  'obs.search': {
    'pt-BR': 'Buscar em ferramenta ou mensagem…',
    en: 'Search tool or message…',
    es: 'Buscar en herramienta o mensaje…',
  },
  'obs.noEvents': {
    'pt-BR': 'Nenhum evento para esta seleção.',
    en: 'No events for this selection.',
    es: 'No hay eventos para esta selección.',
  },
  'obs.eventDetails': {
    'pt-BR': 'Detalhes do evento',
    en: 'Event details',
    es: 'Detalles del evento',
  },
  'obs.result': {
    'pt-BR': 'Resposta / resultado informado',
    en: 'Reported response / result',
    es: 'Respuesta / resultado informado',
  },
  'obs.footer': {
    'pt-BR':
      'Atualização automática a cada 4 segundos com a página visível. Dados obtidos dos registros locais dos CLIs.',
    en: 'Auto-refresh every 4 seconds while visible. Data comes from locally recorded CLI events.',
    es: 'Actualización cada 4 segundos mientras la página está visible. Datos de eventos locales de los CLI.',
  },
  'obs.event.all': {
    'pt-BR': 'Todos os eventos',
    en: 'All events',
    es: 'Todos los eventos',
  },
  'obs.event.start': {
    'pt-BR': 'Início',
    en: 'Start',
    es: 'Inicio',
  },
  'obs.event.init': {
    'pt-BR': 'Sessão',
    en: 'Session',
    es: 'Sesión',
  },
  'obs.event.text': {
    'pt-BR': 'Mensagem',
    en: 'Message',
    es: 'Mensaje',
  },
  'obs.event.tool': {
    'pt-BR': 'Ferramenta',
    en: 'Tool',
    es: 'Herramienta',
  },
  'obs.event.tool-result': {
    'pt-BR': 'Retorno',
    en: 'Tool result',
    es: 'Retorno',
  },
  'obs.event.agent': {
    'pt-BR': 'Subagente',
    en: 'Subagent',
    es: 'Subagente',
  },
  'obs.event.result': {
    'pt-BR': 'Resultado',
    en: 'Result',
    es: 'Resultado',
  },
  'obs.event.stderr': {
    'pt-BR': 'Diagnóstico',
    en: 'Diagnostic',
    es: 'Diagnóstico',
  },
  'obs.event.errors': {
    'pt-BR': 'Erros e diagnósticos',
    en: 'Errors and diagnostics',
    es: 'Errores y diagnósticos',
  },
  'obs.open': {
    'pt-BR': 'Analisar execução',
    en: 'Inspect run',
    es: 'Analizar ejecución',
  },
  'obs.temporary': {
    'pt-BR': 'Auxiliares temporários',
    en: 'Temporary assistants',
    es: 'Auxiliares temporales',
  },
  'squadActivity.summary': {
    'pt-BR': 'Resumo da squad',
    en: 'Squad overview',
    es: 'Resumen del equipo',
  },
  'squadActivity.count.all': { 'pt-BR': 'Agentes', en: 'Agents', es: 'Agentes' },
  'squadActivity.count.working': { 'pt-BR': 'Trabalhando', en: 'Working', es: 'Trabajando' },
  'squadActivity.count.idle': { 'pt-BR': 'Disponíveis', en: 'Available', es: 'Disponibles' },
  'squadActivity.count.waiting': {
    'pt-BR': 'Precisam de você',
    en: 'Need your input',
    es: 'Necesitan tu ayuda',
  },
  'squadActivity.count.paused': { 'pt-BR': 'Pausados', en: 'Paused', es: 'Pausados' },
  'squadActivity.count.helpers': {
    'pt-BR': 'Subagentes ativos',
    en: 'Active subagents',
    es: 'Subagentes activos',
  },
  'squadActivity.executing': { 'pt-BR': 'Em execução', en: 'Running', es: 'En ejecución' },
  'squadActivity.available': { 'pt-BR': 'Disponível', en: 'Available', es: 'Disponible' },
  'squadActivity.consulting': {
    'pt-BR': 'Auxiliando um agente',
    en: 'Assisting an agent',
    es: 'Ayudando a un agente',
  },
  'squadActivity.pausing': {
    'pt-BR': 'Pausa após a etapa',
    en: 'Pausing after this stage',
    es: 'Pausa después de esta etapa',
  },
  'squadActivity.paused': { 'pt-BR': 'Pausado', en: 'Paused', es: 'Pausado' },
  'squadActivity.planning': {
    'pt-BR': 'Preparando o plano',
    en: 'Preparing the plan',
    es: 'Preparando el plan',
  },
  'squadActivity.approval': {
    'pt-BR': 'Aguarda sua aprovação',
    en: 'Awaiting your approval',
    es: 'Espera tu aprobación',
  },
  'squadActivity.question': {
    'pt-BR': 'Aguarda sua resposta',
    en: 'Awaiting your answer',
    es: 'Espera tu respuesta',
  },
  'squadActivity.review': {
    'pt-BR': 'Entrega em revisão humana',
    en: 'Delivery awaiting human review',
    es: 'Entrega en revisión humana',
  },
  'squadActivity.failed': {
    'pt-BR': 'Última execução falhou',
    en: 'Last run failed',
    es: 'La última ejecución falló',
  },
  'squadActivity.consultations': { 'pt-BR': 'Consultas', en: 'Consultations', es: 'Consultas' },
  'squadActivity.active': { 'pt-BR': 'ativas', en: 'active', es: 'activas' },
  'squadActivity.inspect': {
    'pt-BR': 'Ver consulta na linha do tempo',
    en: 'View consultation in timeline',
    es: 'Ver consulta en la línea de tiempo',
  },
  'squadActivity.noDetails': {
    'pt-BR': 'O CLI não informou os detalhes',
    en: 'CLI did not report details',
    es: 'El CLI no informó los detalles',
  },
  'squadActivity.viewRun': { 'pt-BR': 'Ver execução', en: 'View run', es: 'Ver ejecución' },
  'squadActivity.lastRun': { 'pt-BR': 'Última execução', en: 'Last run', es: 'Última ejecución' },
  'squadActivity.showAll': { 'pt-BR': 'Mostrar todos', en: 'Show all', es: 'Mostrar todos' },
  'squadActivity.empty': {
    'pt-BR': 'Nenhum agente neste estado.',
    en: 'No agents in this state.',
    es: 'Ningún agente en este estado.',
  },
  'squadActivity.stale': {
    'pt-BR': 'Sem atualização do CLI. Exibindo os últimos dados recebidos.',
    en: 'CLI update unavailable. Showing the last received data.',
    es: 'Actualización del CLI no disponible. Mostrando los últimos datos recibidos.',
  },
  'squadActivity.consultingWith': {
    'pt-BR': 'Consultando {agent}',
    en: 'Consulting {agent}',
    es: 'Consultando a {agent}',
  },
  'squadActivity.usingTool': { 'pt-BR': 'Usando {tool}', en: 'Using {tool}', es: 'Usando {tool}' },
  'squadActivity.helpersHint': {
    'pt-BR':
      'Consultas ativas detectadas nos eventos dos CLIs. Alguns provedores informam apenas parte da atividade.',
    en: 'Active consultations detected in CLI events. Some providers report only part of their activity.',
    es: 'Consultas activas detectadas en eventos del CLI. Algunos proveedores informan solo parte de su actividad.',
  },
  'workflow.connectionError': {
    'pt-BR': 'Não foi possível atualizar a coordenação. Os últimos dados continuam visíveis.',
    en: 'Could not refresh coordination. Last known data remains visible.',
    es: 'No se pudo actualizar la coordinación. Se muestran los últimos datos.',
  },
  'attention.title': {
    'pt-BR': 'Precisa de você',
    en: 'Needs your input',
    es: 'Necesita tu ayuda',
  },
  'attention.description': {
    'pt-BR': 'Perguntas, aprovações, entregas e interrupções que aguardam uma ação sua.',
    en: 'Questions, approvals, deliveries and interruptions awaiting your action.',
    es: 'Preguntas, aprobaciones, entregas e interrupciones que esperan tu acción.',
  },
  'attention.type': {
    'pt-BR': 'Tipo de pendência',
    en: 'Pending item type',
    es: 'Tipo de pendiente',
  },
  'attention.showAcknowledged': {
    'pt-BR': 'Mostrar falhas reconhecidas',
    en: 'Show acknowledged failures',
    es: 'Mostrar fallos reconocidos',
  },
  'attention.pendingCount': {
    'pt-BR': 'itens na seleção',
    en: 'items selected',
    es: 'elementos en la selección',
  },
  'attention.approvalDetail': {
    'pt-BR': 'Um plano aguarda sua aprovação antes de iniciar a execução.',
    en: 'A plan awaits your approval before execution starts.',
    es: 'Un plan espera tu aprobación antes de iniciar la ejecución.',
  },
  'attention.reviewDetail': {
    'pt-BR': 'A rota terminou. Revise a entrega e aprove ou solicite ajustes.',
    en: 'The route is complete. Review the delivery and approve or request changes.',
    es: 'La ruta terminó. Revisa la entrega y aprueba o solicita cambios.',
  },
  'attention.blockedDetail': {
    'pt-BR': 'A entrega possui dependências ainda não aprovadas.',
    en: 'This delivery has dependencies that are not approved yet.',
    es: 'Esta entrega tiene dependencias aún no aprobadas.',
  },
  'attention.openOrigin': {
    'pt-BR': 'Abrir pendência',
    en: 'Open pending item',
    es: 'Abrir pendiente',
  },
  'attention.permissions': {
    'pt-BR': 'Revisar configuração do provedor',
    en: 'Review provider settings',
    es: 'Revisar configuración del proveedor',
  },
  'attention.acknowledge': {
    'pt-BR': 'Marcar como reconhecida',
    en: 'Acknowledge',
    es: 'Marcar como reconocido',
  },
  'attention.acknowledged': { 'pt-BR': 'Reconhecida', en: 'Acknowledged', es: 'Reconocido' },
  'attention.empty': {
    'pt-BR': 'Nenhuma pendência nesta seleção',
    en: 'No pending items in this selection',
    es: 'No hay pendientes en esta selección',
  },
  'attention.emptyDetail': {
    'pt-BR': 'As novas pendências aparecerão aqui com acesso à ação correspondente.',
    en: 'New pending items will appear here with access to their corresponding action.',
    es: 'Los nuevos pendientes aparecerán aquí con acceso a la acción correspondiente.',
  },
  'attention.note': {
    'pt-BR':
      'Reconhecer uma falha apenas remove seu alerta. Isso não altera permissões, aprova entregas ou repete execuções.',
    en: 'Acknowledging a failure only clears its alert. It does not change permissions, approve deliveries or retry runs.',
    es: 'Reconocer un fallo solo elimina su alerta. No cambia permisos, aprueba entregas ni repite ejecuciones.',
  },
  'attention.invalidAcknowledge': {
    'pt-BR': 'Essa pendência precisa ser resolvida na sua origem.',
    en: 'This item must be resolved at its source.',
    es: 'Este pendiente debe resolverse en su origen.',
  },
  'recovery.title': { 'pt-BR': 'Recuperação', en: 'Recovery', es: 'Recuperación' },
  'recovery.description': {
    'pt-BR':
      'Acompanhe as etapas persistidas e retome uma operação sem repetir o que já foi confirmado.',
    en: 'Track persisted stages and resume an operation without repeating confirmed work.',
    es: 'Sigue las etapas guardadas y retoma una operación sin repetir el trabajo confirmado.',
  },
  'recovery.empty': {
    'pt-BR':
      'Nenhuma execução coordenada registrada. As próximas sprints em modo real aparecerão aqui.',
    en: 'No coordinated runs recorded. Future live sprints will appear here.',
    es: 'No hay ejecuciones coordinadas registradas. Los próximos sprints reales aparecerán aquí.',
  },
  'recovery.confirmedCount': {
    'pt-BR': 'etapas confirmadas',
    en: 'confirmed stages',
    es: 'etapas confirmadas',
  },
  'recovery.approvedAt': {
    'pt-BR': 'Plano aprovado em',
    en: 'Plan approved on',
    es: 'Plan aprobado el',
  },
  'recovery.diagnostic': {
    'pt-BR': 'Detalhes do diagnóstico',
    en: 'Diagnostic details',
    es: 'Detalles del diagnóstico',
  },
  'recovery.resume': {
    'pt-BR': 'Retomar etapas pendentes',
    en: 'Resume pending stages',
    es: 'Retomar etapas pendientes',
  },
  'recovery.cancel': {
    'pt-BR': 'Encerrar coordenação',
    en: 'End coordination',
    es: 'Finalizar coordinación',
  },
  'recovery.cancelConfirm': {
    'pt-BR':
      'Encerrar esta operação? As etapas já confirmadas serão preservadas. Uma etapa interrompida pode ter deixado arquivos alterados.',
    en: 'End this operation? Confirmed stages will be preserved. An interrupted stage may have left changed files.',
    es: '¿Finalizar esta operación? Se conservarán las etapas confirmadas. Una etapa interrumpida puede haber dejado archivos modificados.',
  },
  'recovery.uncertainNote': {
    'pt-BR':
      'Esta etapa não possui conclusão confirmada. Revise o diagnóstico e a pasta do projeto antes de autorizar outra tentativa. Nenhuma etapa anterior confirmada será repetida.',
    en: 'This stage has no confirmed completion. Review diagnostics and the project folder before authorizing another attempt. Previously confirmed stages will not be repeated.',
    es: 'Esta etapa no tiene una conclusión confirmada. Revisa el diagnóstico y la carpeta del proyecto antes de autorizar otro intento. No se repetirán las etapas confirmadas.',
  },
  'recovery.retryAcknowledgement': {
    'pt-BR':
      'Revisei os arquivos e confirmei que o processo anterior encerrou. Autorizo uma nova tentativa desta etapa, que pode já ter realizado alterações.',
    en: 'I reviewed the files and confirmed the previous process has stopped. I authorize another attempt of this stage, which may already have made changes.',
    es: 'Revisé los archivos y confirmé que terminó el proceso anterior. Autorizo otro intento de esta etapa, que puede haber realizado cambios.',
  },
  'recovery.prepareRetry': {
    'pt-BR': 'Preparar nova tentativa',
    en: 'Prepare retry',
    es: 'Preparar otro intento',
  },
  'recovery.stage': { 'pt-BR': 'Etapa', en: 'Stage', es: 'Etapa' },
  'recovery.attempts': {
    'pt-BR': 'Tentativas registradas',
    en: 'Recorded attempts',
    es: 'Intentos registrados',
  },
  'recovery.audit': {
    'pt-BR': 'Histórico de coordenação',
    en: 'Coordination history',
    es: 'Historial de coordinación',
  },
  'recovery.note': {
    'pt-BR':
      'A coordenação real continua no servidor ao fechar a aba. Após reiniciar o servidor, a retomada depende de sua ação. Conclusões de CLI aguardam revisão humana da entrega.',
    en: 'Live coordination continues on the server when the tab closes. After a server restart, resuming requires your action. CLI completions still await human review of the delivery.',
    es: 'La coordinación real continúa en el servidor al cerrar la pestaña. Tras reiniciar el servidor, debes decidir cuándo retomar. Las entregas del CLI siguen requiriendo revisión humana.',
  },
  'recovery.notFound': {
    'pt-BR': 'Coordenação não encontrada.',
    en: 'Coordination not found.',
    es: 'Coordinación no encontrada.',
  },
  'recovery.liveOnly': {
    'pt-BR': 'A coordenação persistente exige uma operação existente em modo real.',
    en: 'Persistent coordination requires an existing live operation.',
    es: 'La coordinación persistente requiere una operación existente en modo real.',
  },
  'recovery.approvalRequired': {
    'pt-BR': 'Aprove o plano antes de iniciar.',
    en: 'Approve the plan before starting.',
    es: 'Aprueba el plan antes de iniciar.',
  },
  'recovery.alreadyOpen': {
    'pt-BR': 'Já existe uma coordenação pendente neste projeto. Abra Recuperação para continuar.',
    en: 'This project already has pending coordination. Open Recovery to continue.',
    es: 'Este proyecto ya tiene una coordinación pendiente. Abre Recuperación para continuar.',
  },
  'recovery.documentsRequired': {
    'pt-BR': 'Complete os documentos do projeto antes de executar.',
    en: 'Complete project documents before execution.',
    es: 'Completa los documentos del proyecto antes de ejecutar.',
  },
  'recovery.invalidPlan': {
    'pt-BR': 'O plano ou a rota contém dados inválidos. Revise os especialistas e as entregas.',
    en: 'The plan or route contains invalid data. Review specialists and deliveries.',
    es: 'El plan o la ruta tiene datos inválidos. Revisa especialistas y entregas.',
  },
  'recovery.locked': {
    'pt-BR':
      'Os campos de execução estão sob controle da coordenação persistente. Atualize o workspace antes de continuar.',
    en: 'Execution fields are controlled by persistent coordination. Refresh the workspace before continuing.',
    es: 'Los campos de ejecución están bajo coordinación persistente. Actualiza el workspace antes de continuar.',
  },
  'recovery.busy': {
    'pt-BR': 'A etapa está sendo preparada. Aguarde a atualização e tente novamente.',
    en: 'The stage is being prepared. Wait for the update and try again.',
    es: 'Se está preparando la etapa. Espera la actualización e inténtalo de nuevo.',
  },
  'recovery.invalidAction': {
    'pt-BR': 'Essa ação não está disponível no estado atual.',
    en: 'This action is unavailable in the current state.',
    es: 'Esta acción no está disponible en el estado actual.',
  },
  'recovery.retryRequired': {
    'pt-BR': 'Resolva a etapa interrompida antes de retomar.',
    en: 'Resolve the interrupted stage before resuming.',
    es: 'Resuelve la etapa interrumpida antes de retomar.',
  },
  'recovery.confirmRetry': {
    'pt-BR': 'Confirme a revisão e selecione a etapa interrompida atual antes de repetir.',
    en: 'Confirm your review and select the current interrupted stage before retrying.',
    es: 'Confirma la revisión y selecciona la etapa interrumpida actual antes de repetir.',
  },
  'recovery.projectMissing': {
    'pt-BR': 'O projeto da coordenação não está disponível.',
    en: 'The coordinated project is unavailable.',
    es: 'El proyecto de la coordinación no está disponible.',
  },
  'recovery.planChanged': {
    'pt-BR': 'A rota ou o progresso mudou. Revise a coordenação antes de continuar.',
    en: 'The route or progress changed. Review coordination before continuing.',
    es: 'La ruta o el progreso cambió. Revisa la coordinación antes de continuar.',
  },
  'recovery.dependencies': {
    'pt-BR': 'Aguardando aprovação humana das entregas dependentes.',
    en: 'Awaiting human approval of dependencies.',
    es: 'Esperando la aprobación humana de las dependencias.',
  },
  'recovery.serverRestarted': {
    'pt-BR': 'O servidor foi reiniciado. Revise o último checkpoint antes de retomar.',
    en: 'The server restarted. Review the last checkpoint before resuming.',
    es: 'El servidor se reinició. Revisa el último checkpoint antes de retomar.',
  },
  'recovery.launchFailed': {
    'pt-BR': 'Não foi possível iniciar o CLI. Revise o diagnóstico e a configuração.',
    en: 'Could not start the CLI. Review diagnostics and configuration.',
    es: 'No se pudo iniciar el CLI. Revisa el diagnóstico y la configuración.',
  },
  'recovery.stageFailed': {
    'pt-BR': 'A etapa falhou. As etapas anteriores confirmadas foram preservadas.',
    en: 'The stage failed. Previously confirmed stages were preserved.',
    es: 'La etapa falló. Se conservaron las etapas confirmadas.',
  },
  'recovery.cancelled': {
    'pt-BR': 'Coordenação encerrada pelo operador.',
    en: 'Coordination ended by the operator.',
    es: 'Coordinación finalizada por el operador.',
  },
  'recovery.deliveryReview': {
    'pt-BR': '{feature} concluiu a rota e aguarda sua revisão humana.',
    en: '{feature} completed its route and awaits your human review.',
    es: '{feature} completó su ruta y espera tu revisión humana.',
  },
  'recovery.completed': {
    'pt-BR': 'A coordenação concluiu as rotas previstas. As entregas aguardam revisão humana.',
    en: 'Coordination completed its planned routes. Deliveries await human review.',
    es: 'La coordinación completó las rutas previstas. Las entregas esperan revisión humana.',
  },
  'recovery.stageStarted': {
    'pt-BR': '{agent} iniciou {feature}, etapa {step}.',
    en: '{agent} started {feature}, stage {step}.',
    es: '{agent} inició {feature}, etapa {step}.',
  },
  'recovery.previousProcessAlive': {
    'pt-BR':
      'O processo da tentativa anterior ainda pode estar ativo. Encerre-o antes de repetir esta etapa.',
    en: 'The previous attempt process may still be active. Stop it before retrying this stage.',
    es: 'El proceso del intento anterior puede seguir activo. Finalízalo antes de repetir esta etapa.',
  },
  'memory.title': {
    'pt-BR': 'Memória do projeto',
    en: 'Project memory',
    es: 'Memoria del proyecto',
  },
  'memory.nav': { 'pt-BR': 'Memória', en: 'Memory', es: 'Memoria' },
  'memory.description': {
    'pt-BR': 'Decisões, restrições e aprendizados com origem, aprovação humana e histórico.',
    en: 'Decisions, constraints and lessons with provenance, human approval and history.',
    es: 'Decisiones, restricciones y aprendizajes con origen, aprobación humana e historial.',
  },
  'memory.state': { 'pt-BR': 'Estado', en: 'State', es: 'Estado' },
  'memory.edit': { 'pt-BR': 'Editar registro', en: 'Edit entry', es: 'Editar registro' },
  'memory.new': { 'pt-BR': 'Nova proposta', en: 'New proposal', es: 'Nueva propuesta' },
  'memory.editNotice': {
    'pt-BR':
      'Salvar uma alteração retira a aprovação atual. O conteúdo só voltará ao contexto dos agentes após nova aprovação.',
    en: 'Saving an edit withdraws the current approval. The content returns to agent context only after approval again.',
    es: 'Guardar un cambio retira la aprobación actual. El contenido volverá al contexto de los agentes solo tras una nueva aprobación.',
  },
  'memory.entryTitle': {
    'pt-BR': 'Título do registro',
    en: 'Entry title',
    es: 'Título del registro',
  },
  'memory.kind': { 'pt-BR': 'Categoria', en: 'Category', es: 'Categoría' },
  'memory.source': { 'pt-BR': 'Origem', en: 'Source', es: 'Origen' },
  'memory.sourceRef': {
    'pt-BR': 'Registro de origem',
    en: 'Source record',
    es: 'Registro de origen',
  },
  'memory.selectSource': {
    'pt-BR': 'Selecione a origem',
    en: 'Select a source',
    es: 'Selecciona el origen',
  },
  'memory.chatSourceNote': {
    'pt-BR': 'Use o ID de uma mensagem deste projeto. A origem será validada e preservada.',
    en: 'Use a message ID from this project. Its source will be validated and preserved.',
    es: 'Usa el ID de un mensaje de este proyecto. Se validará y conservará el origen.',
  },
  'memory.content': { 'pt-BR': 'Conteúdo', en: 'Content', es: 'Contenido' },
  'memory.saveProposal': {
    'pt-BR': 'Salvar proposta',
    en: 'Save proposal',
    es: 'Guardar propuesta',
  },
  'memory.approvalNote': {
    'pt-BR':
      'Somente registros aprovados entram no contexto das próximas chamadas e consultas a subagentes. Propostas e registros arquivados ficam fora.',
    en: 'Only approved entries enter the context of future calls and subagent consultations. Proposals and archived entries are excluded.',
    es: 'Solo los registros aprobados entran en el contexto de futuras llamadas y consultas a subagentes. Se excluyen propuestas y registros archivados.',
  },
  'memory.version': { 'pt-BR': 'Versão', en: 'Version', es: 'Versión' },
  'memory.approvedAt': { 'pt-BR': 'Aprovado em', en: 'Approved on', es: 'Aprobado el' },
  'memory.localUser': { 'pt-BR': 'Operador local', en: 'Local operator', es: 'Operador local' },
  'memory.manualSource': {
    'pt-BR': 'Registro escrito pelo operador local.',
    en: 'Entry written by the local operator.',
    es: 'Registro escrito por el operador local.',
  },
  'memory.approve': {
    'pt-BR': 'Aprovar e usar como contexto',
    en: 'Approve and use as context',
    es: 'Aprobar y usar como contexto',
  },
  'memory.archive': { 'pt-BR': 'Arquivar', en: 'Archive', es: 'Archivar' },
  'memory.history': {
    'pt-BR': 'Histórico de versões',
    en: 'Version history',
    es: 'Historial de versiones',
  },
  'memory.empty': {
    'pt-BR': 'Nenhum registro nesta seleção',
    en: 'No entries in this selection',
    es: 'No hay registros en esta selección',
  },
  'memory.emptyDetail': {
    'pt-BR': 'Registre uma decisão ou use uma entrega ou ADR como origem.',
    en: 'Record a decision or use a delivery or ADR as its source.',
    es: 'Registra una decisión o usa una entrega o ADR como origen.',
  },
  'memory.remember': {
    'pt-BR': 'Propor registro na memória',
    en: 'Propose memory entry',
    es: 'Proponer registro en memoria',
  },
  'memory.projectMissing': {
    'pt-BR': 'Projeto não encontrado.',
    en: 'Project not found.',
    es: 'Proyecto no encontrado.',
  },
  'memory.entryLimit': {
    'pt-BR': 'Este projeto atingiu o limite de registros de memória.',
    en: 'This project reached its memory entry limit.',
    es: 'Este proyecto alcanzó el límite de registros de memoria.',
  },
  'memory.sourceMissing': {
    'pt-BR': 'A origem precisa existir neste projeto.',
    en: 'The source must exist in this project.',
    es: 'El origen debe existir en este proyecto.',
  },
  'memory.notFound': {
    'pt-BR': 'Registro não encontrado.',
    en: 'Entry not found.',
    es: 'Registro no encontrado.',
  },
  'memory.conflict': {
    'pt-BR': 'Este registro mudou em outra aba. Atualize antes de editar ou aprovar.',
    en: 'This entry changed in another tab. Refresh before editing or approving.',
    es: 'Este registro cambió en otra pestaña. Actualiza antes de editar o aprobar.',
  },
  'memory.invalid': {
    'pt-BR': 'Preencha título e conteúdo dentro dos limites e selecione uma categoria válida.',
    en: 'Provide a title and content within the limits and select a valid category.',
    es: 'Completa el título y contenido dentro de los límites y selecciona una categoría válida.',
  },
  'memory.archived': {
    'pt-BR': 'Este registro está arquivado.',
    en: 'This entry is archived.',
    es: 'Este registro está archivado.',
  },
  'memory.confirmRequired': {
    'pt-BR': 'A aprovação exige uma ação explícita do operador.',
    en: 'Approval requires an explicit operator action.',
    es: 'La aprobación requiere una acción explícita del operador.',
  },
  'memory.contextLimit': {
    'pt-BR':
      'O contexto aprovado excederia o limite de 24.000 caracteres. Arquive registros obsoletos antes de aprovar.',
    en: 'Approved context would exceed 24,000 characters. Archive obsolete entries before approving.',
    es: 'El contexto aprobado superaría los 24.000 caracteres. Archiva registros obsoletos antes de aprobar.',
  },
  'attention.kind.question': {
    'pt-BR': 'Pergunta pendente',
    en: 'Pending question',
    es: 'Pregunta pendiente',
  },
  'attention.kind.approval': {
    'pt-BR': 'Aprovação de plano',
    en: 'Plan approval',
    es: 'Aprobación de plan',
  },
  'attention.kind.review': { 'pt-BR': 'Revisão humana', en: 'Human review', es: 'Revisión humana' },
  'attention.kind.permission': {
    'pt-BR': 'Bloqueio de permissão',
    en: 'Permission block',
    es: 'Bloqueo de permisos',
  },
  'attention.kind.failure': {
    'pt-BR': 'Falha de execução',
    en: 'Run failure',
    es: 'Fallo de ejecución',
  },
  'attention.kind.blocked': {
    'pt-BR': 'Dependência bloqueada',
    en: 'Blocked dependency',
    es: 'Dependencia bloqueada',
  },
  'attention.kind.recovery': {
    'pt-BR': 'Recuperação pendente',
    en: 'Recovery pending',
    es: 'Recuperación pendiente',
  },
  'attention.kind.memory': {
    'pt-BR': 'Memória para aprovar',
    en: 'Memory awaiting approval',
    es: 'Memoria por aprobar',
  },
  'recovery.state.running': { 'pt-BR': 'Executando', en: 'Running', es: 'Ejecutando' },
  'recovery.state.pausing': {
    'pt-BR': 'Pausa após a etapa',
    en: 'Pausing after stage',
    es: 'Pausa tras la etapa',
  },
  'recovery.state.paused': { 'pt-BR': 'Pausada', en: 'Paused', es: 'Pausada' },
  'recovery.state.interrupted': { 'pt-BR': 'Interrompida', en: 'Interrupted', es: 'Interrumpida' },
  'recovery.state.blocked': { 'pt-BR': 'Bloqueada', en: 'Blocked', es: 'Bloqueada' },
  'recovery.state.completed': {
    'pt-BR': 'Rotas concluídas',
    en: 'Routes completed',
    es: 'Rutas completadas',
  },
  'recovery.state.cancelled': { 'pt-BR': 'Encerrada', en: 'Ended', es: 'Finalizada' },
  'recovery.stage.pending': { 'pt-BR': 'Pendente', en: 'Pending', es: 'Pendiente' },
  'recovery.stage.launching': {
    'pt-BR': 'Preparando CLI',
    en: 'Preparing CLI',
    es: 'Preparando CLI',
  },
  'recovery.stage.running': { 'pt-BR': 'Em execução', en: 'Running', es: 'En ejecución' },
  'recovery.stage.confirmed': {
    'pt-BR': 'Confirmada pelo resultado do CLI',
    en: 'Confirmed by CLI result',
    es: 'Confirmada por el resultado del CLI',
  },
  'recovery.stage.failed': { 'pt-BR': 'Falhou', en: 'Failed', es: 'Falló' },
  'recovery.stage.uncertain': {
    'pt-BR': 'Resultado incerto',
    en: 'Uncertain outcome',
    es: 'Resultado incierto',
  },
  'recovery.audit.approved': {
    'pt-BR': 'Plano aprovado',
    en: 'Plan approved',
    es: 'Plan aprobado',
  },
  'recovery.audit.confirmed': {
    'pt-BR': 'Etapa confirmada',
    en: 'Stage confirmed',
    es: 'Etapa confirmada',
  },
  'recovery.audit.interrupted': {
    'pt-BR': 'Interrupção registrada',
    en: 'Interruption recorded',
    es: 'Interrupción registrada',
  },
  'recovery.audit.pause': {
    'pt-BR': 'Pausa solicitada',
    en: 'Pause requested',
    es: 'Pausa solicitada',
  },
  'recovery.audit.resume': {
    'pt-BR': 'Retomada autorizada',
    en: 'Resume authorized',
    es: 'Reanudación autorizada',
  },
  'recovery.audit.retry': {
    'pt-BR': 'Nova tentativa preparada',
    en: 'Retry prepared',
    es: 'Nuevo intento preparado',
  },
  'recovery.audit.cancel': {
    'pt-BR': 'Encerramento solicitado',
    en: 'End requested',
    es: 'Finalización solicitada',
  },
  'memory.state.proposed': { 'pt-BR': 'Proposta', en: 'Proposed', es: 'Propuesta' },
  'memory.state.approved': { 'pt-BR': 'Aprovado', en: 'Approved', es: 'Aprobado' },
  'memory.state.archived': { 'pt-BR': 'Arquivado', en: 'Archived', es: 'Archivado' },
  'memory.kind.decision': { 'pt-BR': 'Decisão', en: 'Decision', es: 'Decisión' },
  'memory.kind.constraint': { 'pt-BR': 'Restrição', en: 'Constraint', es: 'Restricción' },
  'memory.kind.lesson': { 'pt-BR': 'Aprendizado', en: 'Lesson', es: 'Aprendizaje' },
  'memory.source.manual': { 'pt-BR': 'Registro manual', en: 'Manual entry', es: 'Registro manual' },
  'memory.source.adr': {
    'pt-BR': 'Decisão de arquitetura (ADR)',
    en: 'Architecture decision (ADR)',
    es: 'Decisión de arquitectura (ADR)',
  },
  'memory.source.run': {
    'pt-BR': 'Resultado de execução',
    en: 'Run result',
    es: 'Resultado de ejecución',
  },
  'memory.source.chat': {
    'pt-BR': 'Mensagem de conversa',
    en: 'Chat message',
    es: 'Mensaje de conversación',
  },
  'memory.audit.created': {
    'pt-BR': 'Proposta criada',
    en: 'Proposal created',
    es: 'Propuesta creada',
  },
  'memory.audit.edit': {
    'pt-BR': 'Conteúdo editado; aprovação retirada',
    en: 'Content edited; approval withdrawn',
    es: 'Contenido editado; aprobación retirada',
  },
  'memory.audit.approve': {
    'pt-BR': 'Aprovado pelo operador',
    en: 'Approved by operator',
    es: 'Aprobado por el operador',
  },
  'memory.audit.archive': {
    'pt-BR': 'Arquivado pelo operador',
    en: 'Archived by operator',
    es: 'Archivado por el operador',
  },
  'memory.search': {
    'pt-BR': 'Buscar na memória',
    en: 'Search project memory',
    es: 'Buscar en la memoria',
  },
  'recovery.pauseRequested': {
    'pt-BR': 'Pausa pedida: o agente termina a etapa atual antes de a coordenação parar.',
    en: 'Pause requested: the agent finishes the current stage before coordination stops.',
    es: 'Pausa solicitada: el agente termina la etapa actual antes de detener la coordinación.',
  },
  'recovery.pauseRecorded': {
    'pt-BR': 'Coordenação pausada pelo operador.',
    en: 'Coordination paused by the operator.',
    es: 'Coordinación pausada por el operador.',
  },
  'recovery.resumeRecorded': {
    'pt-BR': 'Retomada autorizada. A coordenação continua das etapas pendentes.',
    en: 'Resume authorized. Coordination continues from pending stages.',
    es: 'Reanudación autorizada. La coordinación continúa desde las etapas pendientes.',
  },
  'recovery.retryPrepared': {
    'pt-BR': 'Nova tentativa preparada. Revise a etapa e retome quando estiver pronto.',
    en: 'Retry prepared. Review the stage and resume when ready.',
    es: 'Nuevo intento preparado. Revisa la etapa y retoma cuando estés listo.',
  },
  'workflow.cliCleanup': {
    'pt-BR':
      'O Antigravity confirmou o resultado, mas não encerrou em 5 segundos. O processo desta execução foi finalizado; o resultado nativo e o consumo foram preservados.',
    en: 'Antigravity confirmed its result but did not exit within 5 seconds. This run process was terminated; the native result and usage were preserved.',
    es: 'Antigravity confirmó el resultado pero no cerró en 5 segundos. Se finalizó el proceso de esta ejecución; se conservaron el resultado nativo y el consumo.',
  },
  'settings.native-auto': {
    'pt-BR': 'Automático nativo (política do CLI)',
    en: 'Native automatic (CLI policy)',
    es: 'Automático nativo (política del CLI)',
  },
  'settings.antigravity-policy-note': {
    'pt-BR':
      'Somente leitura/plano limitam as ferramentas de edição. Automático usa a política nativa do CLI para decidir ações das ferramentas do agente; bloqueios ainda podem ocorrer. Não desativa globalmente as permissões.',
    en: 'Read-only/plan restrict editing tools. Automatic uses the native CLI policy to decide actions within the agent tool list; blocks may still occur. It does not globally disable permissions.',
    es: 'Solo lectura/plan limitan las herramientas de edición. Automático usa la política nativa del CLI para decidir acciones de las herramientas del agente; aún puede haber bloqueos. No desactiva globalmente los permisos.',
  },
  'status.projectCompleted': {
    'pt-BR': 'Concluído',
    en: 'Completed',
    es: 'Completado',
  },
  'status.sprintCompleted': {
    'pt-BR': 'Concluída',
    en: 'Completed',
    es: 'Completada',
  },
  'filters.searchPlaceholder': {
    'pt-BR': 'Buscar por nome ou código...',
    en: 'Search by name or code...',
    es: 'Buscar por nombre o código...',
  },
  'filters.status.all': {
    'pt-BR': 'Todas as situações',
    en: 'All statuses',
    es: 'Todos los estados',
  },
  'filters.status.in_progress': {
    'pt-BR': 'Em andamento',
    en: 'In progress',
    es: 'En curso',
  },
  'filters.status.review': {
    'pt-BR': 'Aguardando revisão',
    en: 'Awaiting review',
    es: 'En revisión',
  },
  'filters.status.completed': {
    'pt-BR': 'Concluídas',
    en: 'Completed',
    es: 'Completadas',
  },
  'filters.squad.all': {
    'pt-BR': 'Todas as squads',
    en: 'All squads',
    es: 'Todos los squads',
  },
  'filters.sort.recent': {
    'pt-BR': 'Mais recentes',
    en: 'Most recent',
    es: 'Más recientes',
  },
  'filters.sort.name': {
    'pt-BR': 'Nome (A-Z)',
    en: 'Name (A-Z)',
    es: 'Nombre (A-Z)',
  },
  'filters.clear': {
    'pt-BR': 'Limpar filtros',
    en: 'Clear filters',
    es: 'Limpiar filtros',
  },
  'filters.showingCount': {
    'pt-BR': 'Exibindo {count} de {total}',
    en: 'Showing {count} of {total}',
    es: 'Mostrando {count} de {total}',
  },
  'filters.noResults': {
    'pt-BR': 'Nenhuma operação encontrada com os filtros selecionados.',
    en: 'No operations found with selected filters.',
    es: 'No se encontraron operaciones con los filtros seleccionados.',
  },
  'delivery.guide': {
    'pt-BR': 'Guia da entrega',
    en: 'Delivery guide',
    es: 'Guía de entrega',
  },
  'delivery.guideGenerating': {
    'pt-BR': 'Gerando guia...',
    en: 'Generating guide...',
    es: 'Generando guía...',
  },
  'delivery.guideNotAvailable': {
    'pt-BR': 'Guia ainda não disponível. Conclua as entregas da sprint para gerar.',
    en: 'Guide not available yet. Complete sprint deliveries to generate.',
    es: 'Guía aún no disponible. Complete las entregas del sprint para generar.',
  },
  'delivery.runAndValidate': {
    'pt-BR': 'Executar e validar',
    en: 'Run and validate',
    es: 'Ejecutar y validar',
  },
  'delivery.runAndValidateDesc': {
    'pt-BR': 'Instruções para abrir, rodar comandos e validar a versão entregue.',
    en: 'Instructions to open, run commands, and validate the delivered version.',
    es: 'Instrucciones para abrir, ejecutar comandos y validar la versión entregada.',
  },
  'delivery.runAndValidateFolder': {
    'pt-BR': 'Pasta do projeto',
    en: 'Project folder',
    es: 'Carpeta del proyecto',
  },
  'delivery.runAndValidatePrereqs': {
    'pt-BR': 'Pré-requisitos',
    en: 'Prerequisites',
    es: 'Prerrequisitos',
  },
  'delivery.runAndValidateCommands': {
    'pt-BR': 'Comandos de inicialização',
    en: 'Start commands',
    es: 'Comandos de inicio',
  },
  'delivery.runAndValidateUrl': {
    'pt-BR': 'URL / Porta',
    en: 'URL / Port',
    es: 'URL / Puerto',
  },
  'delivery.runAndValidateCreds': {
    'pt-BR': 'Credenciais demonstrativas',
    en: 'Demo credentials',
    es: 'Credenciales demostrativas',
  },
  'delivery.runAndValidateTestFlow': {
    'pt-BR': 'Fluxo de teste e validação',
    en: 'Test and validation flow',
    es: 'Flujo de prueba y validación',
  },
  'delivery.runAndValidateExpected': {
    'pt-BR': 'Resultado esperado',
    en: 'Expected result',
    es: 'Resultado esperado',
  },
  'delivery.runAndValidateLimitations': {
    'pt-BR': 'Limitações conhecidas',
    en: 'Known limitations',
    es: 'Limitaciones conocidas',
  },
  'delivery.runAndValidateHowToStop': {
    'pt-BR': 'Como parar',
    en: 'How to stop',
    es: 'Cómo parar',
  },
  'delivery.runAndValidatePlaceholder': {
    'pt-BR':
      '# Como Executar e Validar\n\n## 1. Pré-requisitos\n- Node.js LTS\n\n## 2. Inicialização\ncd <pasta>\nnpm install\nnpm start\n\n## 3. URL e Acesso\n- http://localhost:4355\n\n## 4. Roteiro de Teste\n1. Acessar tela...\n2. Validar funcionalidade...\n\n## 5. Como Parar\nCtrl+C',
    en: '# How to Run and Validate\n\n## 1. Prerequisites\n- Node.js LTS\n\n## 2. Start\ncd <folder>\nnpm install\nnpm start\n\n## 3. URL & Access\n- http://localhost:4355\n\n## 4. Test Flow\n1. Open page...\n2. Validate feature...\n\n## 5. How to Stop\nCtrl+C',
    es: '# Cómo Ejecutar y Validar\n\n## 1. Prerrequisitos\n- Node.js LTS\n\n## 2. Inicio\ncd <carpeta>\nnpm install\nnpm start\n\n## 3. URL y Acceso\n- http://localhost:4355\n\n## 4. Flujo de Prueba\n1. Abrir página...\n2. Validar función...\n\n## 5. Cómo Parar\nCtrl+C',
  },
  'delivery.documenter': {
    'pt-BR': 'Documentador responsável',
    en: 'Lead documenter',
    es: 'Documentador responsable',
  },
  'delivery.version': {
    'pt-BR': 'Versão do guia',
    en: 'Guide version',
    es: 'Versión de la guía',
  },
  'delivery.outdatedNotice': {
    'pt-BR': 'Este guia pode estar desatualizado em relação a alterações recentes.',
    en: 'This guide may be outdated relative to recent changes.',
    es: 'Esta guía puede estar desactualizada respecto a cambios recientes.',
  },
  'squad.recommendedComposition': {
    'pt-BR': 'Composição recomendada',
    en: 'Recommended composition',
    es: 'Composición recomendada',
  },
  'squad.recommendationMet': {
    'pt-BR': 'Recomendação atendida',
    en: 'Recommendation met',
    es: 'Recomendación cumplida',
  },
  'squad.missingQa': {
    'pt-BR': 'Falta pelo menos 1 QA',
    en: 'Missing at least 1 QA',
    es: 'Falta al menos 1 QA',
  },
  'squad.missingDocs': {
    'pt-BR': 'Falta pelo menos 1 Documentador',
    en: 'Missing at least 1 Documenter',
    es: 'Falta al menos 1 Documentador',
  },
  'squad.missingBoth': {
    'pt-BR': 'Falta 1 QA e 1 Documentador',
    en: 'Missing 1 QA and 1 Documenter',
    es: 'Falta 1 QA y 1 Documentador',
  },
  'squad.addSpecialist': {
    'pt-BR': 'Adicionar especialista em arquitetura',
    en: 'Add architecture specialist',
    es: 'Añadir especialista en arquitectura',
  },
  'squad.specialistArchitect': {
    'pt-BR': 'Arquiteto especialista',
    en: 'Specialist architect',
    es: 'Arquitecto especialista',
  },
} as const satisfies Record<string, Record<Locale, string>>;
export type LabelId = keyof typeof LABELS;

/** Endonyms stay recognizable regardless of the active interface language. */
export const LANGUAGE_OPTIONS = [
  { id: 'pt-BR', label: 'Português (Brasil)' },
  { id: 'en', label: 'English' },
  { id: 'es', label: 'Español' },
] as const satisfies readonly { id: Locale; label: string }[];
