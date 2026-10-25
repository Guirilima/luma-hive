import { Component, inject } from '@angular/core';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { IconComponent } from '../../shared/icon.component';
import { portrait, ROLES } from '@domain/catalog';
import { dependenciesReady } from '@domain/workspace';
@Component({
  selector: 'luma-plan',
  standalone: true,
  imports: [IconComponent],
  host: { style: 'display:contents' },
  template: `
    @if (execution.plan(); as plan) {
      @if (execution.planOrigin() === 'distribution') {
        <section class="ops-plan">
          <div class="ops-section-head">
            <div>
              <span class="eyebrow">PLANO DO COMANDANTE / {{ commander() }}</span>
              <h3>Distribuição de responsabilidades</h3>
            </div>
            <span class="footer-note">{{ valid() }} / {{ plan.length }} ROTAS COMPLETAS</span>
          </div>
          <div class="state-bar">
            <luma-icon name="crown" />
            <strong>{{ commander() }}</strong>
            <span>BRIEFING RECEBIDO / {{ plan.length }} FEATURES ANALISADAS</span>
          </div>
          <p class="prose" style="margin-bottom:18px;font-size:12px">
            O comandante propõe esta sequência de especialistas a partir do escopo. A distribuição
            abaixo é determinística: nenhum modelo de IA foi consultado.
          </p>
          <div style="overflow:auto">
            <table class="plan-table">
              <thead>
                <tr>
                  <th>FEATURE</th>
                  <th>PRIORIDADE</th>
                  <th>ROTA DE EXECUÇÃO / HANDOFF</th>
                </tr>
              </thead>
              <tbody>
                @for (item of plan; track item.featureId) {
                  @if (store.feature(item.featureId); as f) {
                    <tr>
                      <td>
                        <span class="plan-key">{{ f.key }}</span>
                        {{ f.title }}
                        <small class="plan-sprint">{{ sprint(f.sprintId) }}</small>
                      </td>
                      <td>
                        <span [class]="'priority ' + f.priority.toLowerCase()">
                          {{ f.priority }}
                        </span>
                      </td>
                      <td>
                        <div class="route-pills">
                          @for (id of item.route; track $index) {
                            @if ($index) {
                              <luma-icon name="arrow" />
                            }
                            <span class="tag">{{ store.agent(id)?.name }}</span>
                          }
                        </div>
                        @if (item.missing?.length) {
                          <div class="plan-error">
                            Falta no squad: {{ item.missing?.join(', ') }}
                          </div>
                        } @else if (!ready(f.id)) {
                          <div class="plan-error">
                            <luma-icon name="lock" />
                            Aguarda {{ dependencies(f.id) }}
                          </div>
                        } @else {
                          <div class="hint" style="margin-top:6px">Pronta para iniciar.</div>
                        }
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
          <div class="notice">
            <luma-icon name="info" />
            Aplicar o plano não inicia a simulação. Features com dependências aguardam aprovação das
            anteriores. Features sem especialistas suficientes permanecem em A fazer.
          </div>
          <div class="ops-detail-actions">
            <button class="btn" (click)="execution.cancelPlan()">
              <luma-icon name="close" />
              Descartar
            </button>
            <button
              class="btn primary"
              [disabled]="!valid() || execution.interacting()"
              (click)="execution.approvePlan(false)"
            >
              <luma-icon name="check" />
              Aplicar plano
            </button>
          </div>
        </section>
      } @else {
        <div class="room-row plan">
          <div class="room-card room-plan awaiting">
            <div class="room-card-head">
              <luma-icon name="flow" />
              <strong>PLANO DE EXECUÇÃO</strong>
              <span>{{ execution.planLabel() }}</span>
              <em>
                {{
                  execution.planSource() === 'demo'
                    ? 'MONTADO NA DEMONSTRAÇÃO'
                    : execution.planSource() === 'default'
                      ? 'DISTRIBUIÇÃO PADRÃO DA SQUAD'
                      : 'MONTADO PELO COMANDANTE'
                }}
              </em>
            </div>
            @for (item of plan; track item.featureId) {
              @if (store.feature(item.featureId); as f) {
                <div class="room-plan-item">
                  <div class="room-plan-f">
                    <b>{{ f.key }}</b>
                    <span>{{ f.title }}</span>
                    <em class="tag">{{ f.priority }}</em>
                    @if (!ready(f.id)) {
                      <em class="tag">AGUARDA DEPENDÊNCIAS</em>
                    }
                  </div>
                  <div class="room-route">
                    @for (id of item.route; track $index) {
                      @if ($index) {
                        <luma-icon name="arrow" />
                      }
                      <span class="room-pill">
                        @if (store.agent(id); as a) {
                          <img class="room-face sm" [src]="portrait(a)" alt="" />
                          {{ a.name }}
                        }
                      </span>
                    }
                  </div>
                  @if (item.briefs.length) {
                    <details open>
                      <summary>Instruções do comandante</summary>
                      <ul class="room-briefs">
                        @for (brief of item.briefs; track $index) {
                          <li>
                            <b>{{ store.agent(item.route[$index])?.name }}</b>
                            {{ brief }}
                          </li>
                        }
                      </ul>
                    </details>
                  }
                </div>
              }
            }
            <div class="room-card-actions">
              <button class="btn ghost sm" (click)="execution.stop()">
                <luma-icon name="close" />
                Cancelar
              </button>
              <button
                class="btn primary sm"
                (click)="execution.approvePlan()"
                [disabled]="!valid()"
              >
                <luma-icon name="play" />
                Executar plano
              </button>
            </div>
          </div>
        </div>
      }
    }
  `,
})
export class PlanComponent {
  readonly store = inject(WorkspaceStore);
  readonly execution = inject(ExecutionService);
  readonly portrait = portrait;
  valid(): number {
    return this.execution.plan()?.filter((p) => p.route.length && !p.missing?.length).length || 0;
  }
  commander(): string {
    return this.store.agent(this.store.project()!.commanderId)?.name || 'COMANDANTE';
  }
  ready(id: string): boolean {
    return dependenciesReady(this.store.feature(id)!, this.store.project()!);
  }
  dependencies(id: string): string {
    return this.store
      .feature(id)!
      .dependencies.filter((id) => this.store.feature(id)?.status !== 'done')
      .map((id) => this.store.feature(id)?.key)
      .join(', ');
  }
  sprint(id: string): string {
    const p = this.store.project()!,
      i = p.sprints.findIndex((s) => s.id === id);
    return 'S' + String(i + 1).padStart(2, '0') + ' / ' + p.sprints[i]?.name;
  }
}
