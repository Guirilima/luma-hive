import { TranslatePipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import { Component, inject } from '@angular/core';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { ExecutionService } from '../../core/execution/execution.service';
import { IconComponent } from '../../shared/icon.component';
import { portrait, ROLES } from '@domain/catalog';
import { dependenciesReady } from '@domain/workspace';
@Component({
  selector: 'luma-plan',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  host: { style: 'display:contents' },
  template: `
    @if (execution.plan(); as plan) {
      @if (execution.planOrigin() === 'distribution') {
        <section class="ops-plan">
          <div class="ops-section-head">
            <div>
              <span class="eyebrow">{{ 'ui.commander-s-plan' | t }} {{ commander() }}</span>
              <h3>{{ 'features.responsibility-distribution' | t }}</h3>
            </div>
            <span class="footer-note">
              {{ valid() }} / {{ plan.length }} {{ 'ui.complete-routes' | t }}
            </span>
          </div>
          <div class="state-bar">
            <luma-icon name="crown" />
            <strong>{{ commander() }}</strong>
            <span>
              {{ 'ui.briefing-received' | t }} {{ plan.length }} {{ 'ui.features-analyzed' | t }}
            </span>
          </div>
          <p class="prose" style="margin-bottom:18px;font-size:12px">
            {{ 'features.the-commander-proposes-this-specialist-sequence-based-on-s' | t }}
          </p>
          <div style="overflow:auto">
            <table class="plan-table">
              <thead>
                <tr>
                  <th>FEATURE</th>
                  <th>{{ 'features.priority' | t }}</th>
                  <th>{{ 'features.execution-route-handoff' | t }}</th>
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
                            {{ 'ui.missing-from-squad' | t }} {{ item.missing?.join(', ') }}
                          </div>
                        } @else if (!ready(f.id)) {
                          <div class="plan-error">
                            <luma-icon name="lock" />
                            {{ 'ui.waiting-for' | t }} {{ dependencies(f.id) }}
                          </div>
                        } @else {
                          <div class="hint" style="margin-top:6px">
                            {{ 'features.ready-to-start' | t }}
                          </div>
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
            {{ 'features.applying-the-plan-does-not-start-the-simulation-dependenci' | t }}
          </div>
          <div class="ops-detail-actions">
            <button class="btn" (click)="execution.cancelPlan()">
              <luma-icon name="close" />
              {{ 'features.discard' | t }}
            </button>
            <button
              class="btn primary"
              [disabled]="!valid() || execution.interacting()"
              (click)="execution.approvePlan(false)"
            >
              <luma-icon name="check" />
              {{ 'features.apply-plan' | t }}
            </button>
          </div>
        </section>
      } @else {
        <div class="room-row plan">
          <div class="room-card room-plan awaiting">
            <div class="room-card-head">
              <luma-icon name="flow" />
              <strong>{{ 'features.execution-plan' | t }}</strong>
              <span>{{ execution.planLabel() }}</span>
              <em>
                {{
                  execution.planSource() === 'demo'
                    ? ('ui.built-in-demo' | t)
                    : execution.planSource() === 'default'
                      ? ('ui.default-squad-distribution' | t)
                      : ('ui.built-by-commander' | t)
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
                      <em class="tag">{{ 'features.waiting-for-dependencies' | t }}</em>
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
                      <summary>{{ 'features.commander-s-instructions' | t }}</summary>
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
                {{ 'action.cancel' | t }}
              </button>
              <button
                class="btn primary sm"
                (click)="execution.approvePlan()"
                [disabled]="!valid()"
              >
                <luma-icon name="play" />
                {{ 'features.execute-plan' | t }}
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
  readonly portrait = inject(PortraitService).source;
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
