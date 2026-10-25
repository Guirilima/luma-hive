import { Component, input, output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Agent, Project, Squad, uuid, timestamp } from '@domain/models';
import { portrait } from '@domain/catalog';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector:'luma-squad-card', standalone:true, imports:[IconComponent],
  host:{style:'display:contents'},
  template:`<span class="squad-card-top"><i class="sq-chip lead"><luma-icon name="crown"/></i><span class="grow"><strong>{{squad().name}}</strong><small><luma-icon name="crown"/>{{store.agent(squad().commanderId)?.name || 'SEM COMANDANTE'}}</small></span></span><span class="sq-chain"><i class="sq-chip adr"><luma-icon [name]="store.agent(squad().adrId)?.icon || 'layers'"/></i><i class="sq-chip prd"><luma-icon [name]="store.agent(squad().prdId)?.icon || 'file'"/></i><span class="sq-chain-sep"></span>@for(id of squad().operatorIds.slice(0,6);track id){<i class="sq-chip"><luma-icon [name]="store.agent(id)?.icon || 'code'"/></i>}@if(squad().operatorIds.length>6){<em>+{{squad().operatorIds.length-6}}</em>}</span><span class="squad-card-meta">1 CMD · 2 REC · {{squad().operatorIds.length}} OPS · {{operations()}} {{operations()===1?'OPERAÇÃO':'OPERAÇÕES'}}</span>`
})
export class SquadCardComponent {
  readonly squad=input.required<Squad>(); readonly store=inject(WorkspaceStore);
  operations():number{return this.store.workspace()?.projects.filter(p=>p.squadId===this.squad().id).length || 0;}
}

@Component({
 selector:'luma-teams-cta',standalone:true,imports:[IconComponent],host:{style:'display:contents'},
 template:`<button type="button" class="at-cta" (click)="opened.emit()" title="Reunião online com a squad para co-escrever os documentos"><span class="at-cta-faces">@for(a of members();track a.id){<img [src]="portrait(a)" alt=""/>}</span><span><b><luma-icon name="video"/>Agent Teams</b><small>Kickoff com {{memberNames()}}</small></span></button>`
})
export class TeamsCtaComponent {
 memberNames():string{return this.members().map(a=>a.name).join(', ').replace(/, ([^,]*)$/,' e $1');}
 readonly squadId=input('');readonly opened=output<void>();readonly store=inject(WorkspaceStore);readonly portrait=portrait;readonly name=(a:Agent)=>a.name;
 members():Agent[]{const q=this.store.workspace()?.squads.find(q=>q.id===this.squadId());return [q?.commanderId,q?.prdId,q?.adrId].map(id=>this.store.agent(id||'')).filter((a):a is Agent=>!!a);}
}

@Component({
 selector:'luma-project-form',standalone:true,imports:[FormsModule,IconComponent,SquadCardComponent],host:{style:'display:contents'},
 template:`<div class="form-grid">
 <div class="field full"><label for="projectName">NOME DO PROJETO</label><input id="projectName" name="name" [(ngModel)]="draft().name" [ngModelOptions]="standalone" maxlength="70" placeholder="Ex.: Atlas Commerce"/></div>
 <div class="field full" data-doc-row="briefing"><div class="doc-label-row"><label for="projectBriefing">BRIEFING DO PROJETO</label><button type="button" class="ops-doc-agent group" (click)="meeting.emit('briefing')" title="Co-escrever o briefing no Agent Teams">@for(a of members();track a.id){<img [src]="portrait(a)" [alt]="a.name"/>}</button></div><textarea id="projectBriefing" name="briefing" [(ngModel)]="draft().briefing" [ngModelOptions]="standalone" maxlength="20000" style="min-height:150px" placeholder="Objetivo, usuários, escopo, restrições e definição de pronto."></textarea></div>
 <div class="field full"><span class="label">SQUAD DA OPERAÇÃO</span><div class="squad-pick-grid">@for(q of store.workspace()?.squads;track q.id){<label class="squad-pick" [class.incomplete]="!store.squadComplete(q)"><input type="radio" name="squadId" [value]="q.id" [checked]="draft().squadId===q.id" [disabled]="!store.squadComplete(q)" (change)="choose(q)"/><span class="squad-card"><luma-squad-card [squad]="q"/></span></label>}</div><span class="hint">Obrigatório. A operação usa a squad inteira: comandante, reconhecedores e operadores. Squads incompletas não podem ser escolhidas; complete-as no Squad Studio.</span></div>
 <div class="field full"><span class="label">DOCUMENTAÇÃO DO PROJETO</span><span class="hint">Vai para <code>docs/project/</code> e <code>docs/architecture/</code> na exportação para o Codex CLI. <code>docs/standards/</code> sai das diretrizes dos agentes da squad e <code>docs/features/</code> das features da operação. Clique nos retratos para abrir o <b>Agent Teams</b>: uma reunião online com o comandante e os reconhecedores PRD e ADR em que vocês co-escrevem o briefing, a visão, o escopo, o glossário e a arquitetura conversando.</span>
 <div class="ops-docs">@for(row of rows;track row.key){<details class="ops-doc" [attr.data-doc-row]="row.key"><summary><span>{{row.title}}</span><small>{{row.path}}</small><span class="ops-doc-badges"><em class="ops-doc-state" [class.on]="filled(row.key)">{{filled(row.key)?'PREENCHIDO':'VAZIO'}}</em>@if(row.key==='architecture' && draft().adrs.length){<em class="ops-doc-state on">{{draft().adrs.length}} ADR{{draft().adrs.length>1?'S':''}}</em>}</span><button class="ops-doc-agent group" type="button" (click)="$event.preventDefault();$event.stopPropagation();meeting.emit(row.key)" [attr.aria-label]="'Co-escrever '+row.title">@for(a of members();track a.id){<img [src]="portrait(a)" [alt]="a.name"/>}</button></summary><div class="ops-doc-body">
 @if(row.key==='scope'){<div class="form-grid"><div class="field"><label for="projectScopeIn">DENTRO DO ESCOPO / UM POR LINHA</label><textarea id="projectScopeIn" name="scopeIn" [(ngModel)]="draft().scopeIn" [ngModelOptions]="standalone" maxlength="8000"></textarea></div><div class="field"><label for="projectScopeOut">FORA DO ESCOPO / UM POR LINHA</label><textarea id="projectScopeOut" name="scopeOut" [(ngModel)]="draft().scopeOut" [ngModelOptions]="standalone" maxlength="8000"></textarea></div></div>}
 @else if(row.key==='architecture'){<label class="label" for="projectArchitecture">VISÃO GERAL</label><textarea id="projectArchitecture" name="architecture" [(ngModel)]="draft().architecture" [ngModelOptions]="standalone" maxlength="12000"></textarea><span class="label adr-label">DECISÕES DE ARQUITETURA (ADR)</span><div class="adr-list" id="adrList">@for(adr of draft().adrs;track adr.id){<div class="adr-block"><div class="adr-head"><span class="adr-num">ADR-{{pad($index+1)}}</span><input name="adrTitle" [(ngModel)]="adr.title" [ngModelOptions]="standalone" maxlength="120" aria-label="Título do ADR"/><select name="adrStatus" [(ngModel)]="adr.status" [ngModelOptions]="standalone" aria-label="Status do ADR">@for(status of adrStatuses;track status){<option>{{status}}</option>}</select><button type="button" class="icon-button small" (click)="removeAdr(adr.id)" aria-label="Remover ADR"><luma-icon name="trash"/></button></div><textarea class="code" name="adrContent" [(ngModel)]="adr.content" [ngModelOptions]="standalone" maxlength="12000" aria-label="Contexto, decisão e consequências"></textarea></div>}</div><button type="button" class="btn ghost sm" (click)="addAdr()"><luma-icon name="plus"/>Adicionar ADR</button>}
 @else if(row.key==='vision'){<textarea name="vision" [(ngModel)]="draft().vision" [ngModelOptions]="standalone" maxlength="8000" aria-label="Visão do produto"></textarea>}
 @else{<textarea name="glossary" [(ngModel)]="draft().glossary" [ngModelOptions]="standalone" maxlength="8000" aria-label="Glossário"></textarea>}
 </div></details>}</div></div></div>`
})
export class ProjectFormComponent {
 readonly draft=input.required<Project>();readonly meeting=output<string>();readonly store=inject(WorkspaceStore);readonly portrait=portrait;readonly standalone={standalone:true};
 readonly rows=[{key:'vision',title:'VISÃO DO PRODUTO',path:'docs/project/product-vision.md'},{key:'scope',title:'ESCOPO',path:'docs/project/scope.md'},{key:'glossary',title:'GLOSSÁRIO',path:'docs/project/glossary.md'},{key:'architecture',title:'ARQUITETURA',path:'docs/architecture/'}];
 pad(n:number):string{return String(n).padStart(3,'0');}
 readonly adrStatuses=['Proposto','Aceito','Rejeitado','Substituído'];
 filled(key:string):boolean{const d=this.draft();return key==='scope'?!!(d.scopeIn+d.scopeOut).trim():!!d[key as 'vision'|'glossary'|'architecture']?.trim();}
 members():Agent[]{const q=this.store.workspace()?.squads.find(q=>q.id===this.draft().squadId);return [q?.commanderId,q?.prdId,q?.adrId].map(id=>this.store.agent(id||'')).filter((a):a is Agent=>!!a);}
 choose(q:Squad):void{Object.assign(this.draft(),{squadId:q.id,commanderId:q.commanderId,agentIds:[...q.agentIds]});}
 addAdr():void{this.draft().adrs.push({id:uuid('adr'),title:'',status:'Proposto',date:timestamp().slice(0,10),content:'## Contexto\n\n\n## Decisão\n\n\n## Consequências\n'});}
 removeAdr(id:string):void{this.draft().adrs=this.draft().adrs.filter(a=>a.id!==id);}
}
