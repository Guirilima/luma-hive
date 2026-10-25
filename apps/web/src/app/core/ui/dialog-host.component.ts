import { UiLabelPipe } from '../i18n/i18n.service';
import { TranslatePipe } from '../i18n/i18n.service';
import { PortraitService } from '../appearance/portrait.service';
import { portrait } from '@domain/catalog';
import { WorkspaceStore } from '../workspace/workspace.store';
import { IconComponent } from '../../shared/icon.component';
import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../execution/room.service';
import { DialogService } from './dialog.service';
import { AgentEditorComponent } from '../../features/agents/agent-editor.component';
import { CatalogComponent } from '../../features/agents/catalog.component';
import { ProjectEditorComponent } from '../../features/projects/project-editor.component';
import { FeatureEditorComponent } from '../../features/features/feature-editor.component';
import { ReviewComponent } from '../../features/features/review.component';
import { DocumentEditorComponent } from '../../features/documents/document-editor.component';
import { SettingsComponent } from '../../features/settings/settings.component';
import { ChatComponent } from '../../features/chat/chat.component';
import { ConsoleComponent } from '../../features/console/console.component';
import { HandoffEditorComponent } from '../../features/handoffs/handoff-editor.component';
import { MeetingComponent } from '../../features/documents/meeting.component';
import { SpawnComponent } from '../../features/features/spawn.component';
import { ModalComponent } from '../../shared/modal.component';
@Component({
  selector: 'luma-dialog-host',
  standalone: true,
  imports: [
    UiLabelPipe,
    TranslatePipe,
    AgentEditorComponent,
    CatalogComponent,
    ProjectEditorComponent,
    FeatureEditorComponent,
    ReviewComponent,
    DocumentEditorComponent,
    SettingsComponent,
    ChatComponent,
    ConsoleComponent,
    HandoffEditorComponent,
    MeetingComponent,
    SpawnComponent,
    ModalComponent,
    IconComponent,
  ],
  templateUrl: './dialog-host.component.html',
})
export class DialogHostComponent {
  readonly shortcuts = [
    ['Mouse', 'Arrastar a cidade para navegar'],
    ['Roda', 'Ampliar ou reduzir o mapa'],
    ['Clique', 'Em um agente: mostra os atalhos de conversar, deslocar e editar'],
    ['Duplo clique', 'Em um agente: abrir a conversa. Em um hexágono vazio: criar um agente ali'],
    ['Shift', 'Shift + arrastar um agente para outro hexágono'],
    ['Botão direito', 'Arrastar para girar a câmera'],
    ['V', 'Alternar entre cidade hexagonal e escritório'],
    ['P', 'Na cidade: dobrar em planeta ou desdobrar'],
    ['0', 'Centralizar mapa e restaurar o zoom'],
    ['Q / E', 'Alternar entre Painel, Projetos, Rede e Handoffs'],
    ['A', 'Criar um agente no estúdio'],
    ['B', 'Abrir briefing do projeto'],
    ['F', 'Abrir quadro de features'],
    ['G', 'Abrir Squad Studio'],
    ['L', 'Abrir registro de transmissões'],
    ['C', 'Abrir console do Codex CLI'],
    ['H', 'Ocultar ou mostrar os painéis'],
    ['Espaço', 'Iniciar, pausar ou retomar a operação'],
    ['Esc', 'Fechar o painel aberto'],
  ];
  readonly dialogs = inject(DialogService);
  readonly store = inject(WorkspaceStore);
  readonly portrait = inject(PortraitService).source;
  squadName(id: string): string {
    return this.store.workspace()?.squads.find((q) => q.id === id)?.name || 'SEM SQUAD';
  }
  selectOperation(id: string): void {
    this.store.switchProject(id);
    if (this.store.project()?.id !== id) return;
    this.dialogs.close();
    void this.router
      .navigateByUrl('/squad')
      .then(() => this.dialogs.mapHomeRequested.update((n) => n + 1));
  }
  readonly room = inject(RoomService);
  readonly router = inject(Router);
  constructor() {
    effect(() => {
      if (this.dialogs.current()?.kind === 'review') {
        const id = this.dialogs.current()!.id!;
        this.dialogs.close();
        void this.router.navigateByUrl('/projects').then(() => this.dialogs.reviewFeature.set(id));
      }
      if (this.dialogs.current()?.kind === 'room') {
        this.room.open();
        this.dialogs.close();
      }
    });
  }
}
