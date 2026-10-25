import { UiLabelPipe } from '../../core/i18n/i18n.service';
import { PortraitService } from '../../core/appearance/portrait.service';
import { department } from './renderers/pixel-paths';
import {
  Component,
  input,
  output,
  ElementRef,
  viewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ROLES } from '@domain/catalog';
import { Agent } from '@domain/models';
import { MapLayout } from '@domain/models';
import { WorkspaceStore } from '../../core/workspace/workspace.store';
import { RoomService } from '../../core/execution/room.service';
import { ExecutionService } from '../../core/execution/execution.service';
import { DialogService } from '../../core/ui/dialog.service';
import { TranslatePipe, I18nService } from '../../core/i18n/i18n.service';
import {
  MapRenderer,
  MapFrame,
  Marker,
  RoomMarker,
  MapTarget,
  RENDERERS,
} from './renderers/map-renderer';
import { PIXEL_ROOMS } from './renderers/pixel-paths';
import { OFFICE_ROOMS, officeSlot } from '@domain/office';
import { Router } from '@angular/router';
import { IconComponent } from '../../shared/icon.component';
interface MapCard extends Marker {
  cardX: number;
  cardY: number;
  leaderX: number;
  leaderY: number;
  leaderWidth: number;
  leaderAngle: string;
}
interface WorkState {
  tone: string;
  chip: string;
  doing: string;
  icon: string;
  foot: string;
  say: string;
}
@Component({
  selector: 'luma-map',
  standalone: true,
  imports: [UiLabelPipe, FormsModule, TranslatePipe, IconComponent],
  templateUrl: './map.component.html',
})
export class MapComponent implements AfterViewInit, OnDestroy {
  readonly Math = Math;
  readonly handoffs = input(false);
  readonly background = input(false);
  readonly roles = ROLES;
  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
  roleLabel(a: Agent): string {
    return a.specialty || ROLES[a.role]?.label || a.role;
  }
  squadName(): string {
    return (
      this.store.workspace()?.squads.find((q) => q.id === this.store.project()?.squadId)?.name ||
      'SQUAD'
    );
  }
  assigned(id: string) {
    return (
      this.store.project()?.features.filter((f) => f.route.includes(id) && f.status !== 'done') ||
      []
    );
  }
  currentSprint() {
    const p = this.store.project();
    return p?.sprints.find((s) =>
      p.features.some((f) => f.sprintId === s.id && f.status !== 'done'),
    );
  }
  openSection(id: string): void {
    void this.router
      .navigateByUrl('/projects')
      .then(() => setTimeout(() => document.getElementById(id)?.scrollIntoView(), 50));
  }
  distribute(): void {
    void this.router.navigateByUrl('/projects').then(() => this.execution.distribute());
  }
  runCurrent(): void {
    this.execution.startCurrent();
  }
  readonly historyRequested = output<void>();
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  readonly store = inject(WorkspaceStore);
  readonly room = inject(RoomService);
  readonly execution = inject(ExecutionService);
  readonly dialogs = inject(DialogService);
  readonly i18n = inject(I18nService);
  readonly markers = signal<Marker[]>([]);
  readonly transition = signal('');
  readonly zoomPercent = signal(100);
  private transitionTimer: ReturnType<typeof setTimeout> | null = null;
  readonly fallback = signal(false);
  readonly roomMarkers = signal<RoomMarker[]>([]);
  readonly cards = signal<MapCard[]>([]);
  readonly workCards = signal<MapCard[]>([]);
  readonly actionsFor = signal('');
  readonly movingId = signal('');
  readonly moveTarget = signal<MapTarget | null>(null);
  readonly dismissed = signal(false);
  readonly router = inject(Router);
  readonly focused = signal(false);
  readonly pixelInspected = signal('');
  pixelNote(): string {
    const room = this.rooms.find((r) => r.id === this.pixelInspected());
    if (!room) return this.i18n.text('ui.click-to-select-an-agent-double-click-to-chat-drag-to-n');
    const names = this.store
      .team()
      .filter((a) => department(a) === room.id)
      .map((a) => a.name);
    return (
      this.i18n.text('pixel.room.' + room.id).toUpperCase() +
      ' · ' +
      (names.length ? names.join(' / ') : this.i18n.text('ui.shared-room-available-for-visits'))
    );
  }
  visitDepartment(id: string): void {
    if (id && this.store.selectedId()) this.renderer?.visit(this.store.selectedId(), id);
  }
  readonly rooms = PIXEL_ROOMS;
  readonly officeRooms = OFFICE_ROOMS;
  portrait = inject(PortraitService).source;
  private renderer: MapRenderer | null = null;
  private observer: ResizeObserver | null = null;
  private ready = signal(false);
  private current: MapLayout | null = null;
  private currentCanvas: HTMLCanvasElement | null = null;
  private latestFrame: MapFrame | null = null;
  private revision = 0;
  private width = 1;
  private height = 1;
  drag: {
    id: number;
    x: number;
    y: number;
    lastX: number;
    lastY: number;
    agentId?: string;
    rotating?: boolean;
    distance: number;
  } | null = null;
  private suppressClick = false;
  constructor() {
    effect(() => {
      if (this.dialogs.mapHomeRequested()) queueMicrotask(() => this.home());
    });
    effect(() => {
      if (!this.ready()) return;
      const settings = this.store.settings(),
        canvas = this.canvas()?.nativeElement;
      if (!settings || !canvas || canvas.dataset['layout'] !== settings.layout) return;
      const layout = settings.layout;
      const frame = {
        movingId: this.movingId(),
        occupiedDesks: this.store
          .agents()
          .filter((a) => !this.store.team().some((t) => t.id === a.id))
          .map((a) => officeSlot(a.desk)?.id || ''),
        occupiedHexes: this.store
          .agents()
          .filter((a) => !this.store.team().some((t) => t.id === a.id))
          .map((a) => a.hex),
        inset: this.room.opened() && !this.room.minimized() ? this.room.width() : 0,
        focused: this.focused(),
        handoffs: this.handoffs(),
        dismissed: this.dismissed(),
        paused: this.background() || this.execution.paused(),
        phase: this.execution.planning()
          ? 'planning'
          : this.execution.plan()
            ? 'awaiting'
            : this.execution.busy()
              ? 'running'
              : 'idle',
        links: this.nodeLinks(),
        agents: this.store.team(),
        selectedId: this.dismissed() ? '' : this.store.selectedId(),
        busyIds: this.execution.busyAgents(),
        motion: settings.motion,
        quality: settings.quality,
        cityShape: settings.cityShape,
        locale: this.i18n.locale(),
        labels: Object.fromEntries(PIXEL_ROOMS.map((r) => [r.id, this.i18n.text('room.' + r.id)])),
      };
      this.latestFrame = frame;
      if (layout !== this.current || canvas !== this.currentCanvas) {
        this.current = layout;
        this.currentCanvas = canvas;
        const version = ++this.revision;
        this.renderer?.dispose();
        this.renderer = null;
        this.markers.set([]);
        this.roomMarkers.set([]);
        this.cards.set([]);
        this.fallback.set(false);
        void RENDERERS[layout]({
          canvas,
          markers: (markers) => {
            if (version === this.revision) {
              this.markers.set(markers);
              this.placeCards(markers);
            }
          },
          rooms: (rooms) => {
            if (version === this.revision) this.roomMarkers.set(rooms);
          },
          fallback: () => {
            if (version === this.revision) this.fallback.set(true);
          },
        }).then((renderer) => {
          if (version !== this.revision) {
            renderer.dispose();
            return;
          }
          this.renderer = renderer;
          renderer.resize(this.width, this.height);
          renderer.update(this.latestFrame!);
          renderer.home();
          this.zoomPercent.set(100);
        });
      } else this.renderer?.update(frame);
    });
  }
  ngAfterViewInit(): void {
    this.observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      this.width = width;
      this.height = height;
      this.renderer?.resize(width, height);
    });
    this.observer.observe(this.canvas()!.nativeElement.parentElement!);
    this.ready.set(true);
  }
  setLayout(layout: MapLayout): void {
    if (this.store.settings()?.motion && this.renderer?.snapshot) {
      try {
        this.transition.set(this.renderer.snapshot());
        if (this.transitionTimer) clearTimeout(this.transitionTimer);
        this.transitionTimer = setTimeout(() => this.transition.set(''), 1050);
      } catch {}
    }
    this.actionsFor.set('');
    this.movingId.set('');
    this.store.change((w) => {
      w.settings.layout = layout;
    });
  }
  toggleShape(): void {
    this.store.change((w) => {
      w.settings.cityShape = w.settings.cityShape === 'planet' ? 'flat' : 'planet';
    });
  }
  zoom(factor: number): void {
    this.renderer?.zoom(factor);
    this.zoomPercent.set(this.renderer?.zoomValue?.() || 100);
  }
  home(): void {
    this.renderer?.home();
    this.zoomPercent.set(100);
  }
  rotate(delta: number): void {
    this.renderer?.rotate(delta);
  }
  visit(id: string, room: string): void {
    if (room) this.renderer?.visit(id, room);
  }
  wheel(e: WheelEvent): void {
    e.preventDefault();
    this.zoom(Math.exp(-e.deltaY * 0.0012));
  }
  private local(e: PointerEvent | MouseEvent): { x: number; y: number } {
    const rect = this.canvas()!.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  down(e: PointerEvent): void {
    if (![0, 2].includes(e.button) || (e.target as HTMLElement).closest('button,select')) return;
    e.preventDefault();
    this.drag = {
      id: e.pointerId,
      rotating: e.button === 2,
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      distance: 0,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  agentDown(e: PointerEvent, id: string): void {
    e.stopPropagation();
    if (e.button !== 0 || this.execution.busy()) return;
    this.drag = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      distance: 0,
      agentId: id,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  move(e: PointerEvent): void {
    const point = this.local(e);
    if (this.movingId() || this.drag?.agentId)
      this.moveTarget.set(this.renderer?.pick?.(point.x, point.y) || null);
    if (!this.drag || this.drag.id !== e.pointerId) return;
    this.drag.distance = Math.hypot(e.clientX - this.drag.x, e.clientY - this.drag.y);
    if (this.drag.rotating)
      this.renderer?.orbit?.(e.clientX - this.drag.lastX, e.clientY - this.drag.lastY);
    else if (!this.drag.agentId)
      this.renderer?.pan(e.clientX - this.drag.lastX, e.clientY - this.drag.lastY);
    else if (this.drag.distance > 6) this.movingId.set(this.drag.agentId);
    this.drag.lastX = e.clientX;
    this.drag.lastY = e.clientY;
  }
  up(e: PointerEvent): void {
    const drag = this.drag;
    if (!drag) return;
    this.suppressClick = drag.distance > 6;
    if (drag.agentId && drag.distance > 6) this.placeAgent(drag.agentId, this.moveTarget());
    this.drag = null;
    const target = e.target as HTMLElement;
    if (target.hasPointerCapture?.(e.pointerId)) target.releasePointerCapture(e.pointerId);
  }
  select(id: string): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.store.selectedId.set(id);
    this.actionsFor.set(id);
    this.dismissed.set(false);
  }
  beginMove(id: string): void {
    if (this.execution.busy()) return;
    this.movingId.set(id);
    this.actionsFor.set('');
  }
  private free(target: MapTarget, id = ''): boolean {
    return (
      !!target &&
      (target.desk
        ? !this.store.agents().some((a) => a.id !== id && officeSlot(a.desk)?.id === target.desk)
        : target.hex
          ? !this.store
              .agents()
              .some((a) => a.id !== id && a.hex.q === target.hex!.q && a.hex.r === target.hex!.r)
          : false)
    );
  }
  private placeAgent(id: string, target: MapTarget | null): void {
    if (this.store.settings()?.layout === 'office-pixel' && target?.room) {
      this.renderer?.visit(id, target.room);
      this.movingId.set('');
      return;
    }
    if (!target || !this.free(target, id)) {
      this.store.error.set(this.i18n.text('map.occupied'));
      return;
    }
    this.store.change((w) => {
      const a = w.agents.find((a) => a.id === id)!;
      if (target.desk) a.desk = target.desk;
      if (target.hex) a.hex = target.hex;
    });
    this.movingId.set('');
    this.moveTarget.set(null);
    this.suppressClick = true;
  }
  mapClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).closest('button,select')) return;
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    const p = this.local(e),
      target = this.renderer?.pick?.(p.x, p.y) || null;
    if (this.movingId()) {
      this.placeAgent(this.movingId(), target);
      return;
    }
    if (this.store.settings()?.layout === 'office-pixel') {
      this.pixelInspected.set(target?.room || '');
      this.actionsFor.set('');
      return;
    }
    if (target?.room?.toUpperCase() === 'WAR') {
      this.dialogs.open('room');
      return;
    }
    this.actionsFor.set('');
    this.dismissed.set(true);
  }
  createAt(e: MouseEvent): void {
    if (
      this.store.settings()?.layout === 'office-pixel' ||
      this.execution.busy() ||
      (e.target as HTMLElement).closest('button,select')
    )
      return;
    const p = this.local(e),
      target = this.renderer?.pick?.(p.x, p.y);
    if (target && this.free(target))
      this.dialogs.open('agent', undefined, undefined, undefined, { target });
  }
  nodeLinks(): { from: string; to: string; active?: boolean }[] {
    const project = this.store.project();
    if (!project) return [];
    const links: { from: string; to: string; active?: boolean }[] = [];
    const add = (from: string, to: string, active = false) => {
      if (!from || !to || from === to) return;
      const existing = links.find((l) => l.from === from && l.to === to);
      if (existing) existing.active = existing.active || active;
      else links.push({ from, to, active });
    };
    if (this.handoffs()) {
      const roles = ['po', 'architect', 'backend', 'frontend', 'qa'],
        chain = [
          project.commanderId,
          ...roles.map((role) => this.store.team().find((a) => a.role === role)?.id || ''),
        ].filter(Boolean);
      chain.slice(1).forEach((to, i) => add(chain[i], to));
      for (const feature of project.features)
        feature.route.slice(1).forEach((to, i) => add(feature.route[i], to));
      for (const h of project.handoffs.slice(-12)) add(h.from, h.to);
    } else
      for (const agent of this.store.team())
        if (agent.id !== project.commanderId) add(agent.linkId || project.commanderId, agent.id);
    const feature = this.store.feature(this.execution.currentFeature());
    if (feature && this.execution.currentAgent())
      add(
        feature.step > 0 ? feature.route[feature.step - 1] : project.commanderId,
        this.execution.currentAgent(),
        !this.execution.paused(),
      );
    return links;
  }
  workState(id: string): WorkState | null {
    const p = this.store.project(),
      agent = this.store.agent(id);
    if (!p || !agent || this.handoffs()) return null;
    const tag = this.store.settings()?.mode === 'live' ? agent.provider.toUpperCase() : 'DEMO';
    const waiting = this.execution.planOrigin() === 'execution' && !!this.execution.plan();
    if ((this.execution.planning() || waiting) && id === p.commanderId) {
      const label = this.currentSprint()?.name || 'operação',
        planning = this.execution.planning();
      return {
        tone: planning ? 'plan' : 'wait',
        chip: planning ? 'PLANEJANDO' : this.i18n.text('ui.awaiting-approval'),
        doing: planning
          ? 'Montando o plano de ' + label
          : this.i18n.text('ui.plan-ready-approve-it-in-the-operation-chat'),
        icon: planning ? 'flow' : 'check',
        foot: label.toUpperCase() + ' · ' + tag,
        say: this.execution
          .events()
          .filter((e) => e.type === 'text')
          .map((e) => e.text || '')
          .join('')
          .split(String.fromCharCode(96).repeat(3))[0]
          .replace(/\s+/g, ' ')
          .slice(0, 160),
      };
    }
    if (!this.execution.busy() || !this.execution.busyAgents().includes(id)) return null;
    const f = this.store.feature(this.execution.currentFeature()),
      paused = this.execution.paused(),
      caller = this.store.agent(this.execution.currentAgent()),
      peer = this.execution.busyAgents().find((a) => a !== id),
      callee = peer ? this.store.agent(peer) : undefined,
      called = id !== this.execution.currentAgent();
    const message = [...this.room.messages()]
      .reverse()
      .find((m) => m.agentId === id && m.role === 'assistant' && (!f || m.featureId === f.id));
    const events = this.execution.events();
    const tool = [...(this.execution.interacting() ? events : [])]
      .reverse()
      .find(
        (e) =>
          e.type === 'tool' &&
          !events.some((r) => r.type === 'tool-result' && r.callId === e.callId),
      );
    const liveSpeech =
      id === this.execution.currentAgent() && this.execution.interacting()
        ? events
            .filter((e) => e.type === 'text')
            .map((e) => e.text || '')
            .join('')
        : '';
    return {
      tone: paused ? 'wait' : callee ? 'call' : 'work',
      chip: paused
        ? this.execution.interacting()
          ? this.i18n.text('ui.pausing-after-stage')
          : 'PAUSADO'
        : called
          ? 'ATENDENDO ' + (caller?.name || '')
          : callee
            ? 'CHAMOU ' + callee.name
            : 'TRABALHANDO',
      doing: callee
        ? called
          ? 'Chamado por ' + (caller?.name || '')
          : 'Aguardando a resposta de ' + callee.name
        : tool?.name
          ? 'Usando ' + tool.name
          : (f?.briefs[f.step] || agent.description).replace(/\s+/g, ' ').slice(0, 120),
      icon: callee ? 'phone' : 'radio',
      foot: f ? f.key + ' · ETAPA ' + (f.step + 1) + '/' + f.route.length + ' · ' + tag : tag,
      say: (liveSpeech || message?.text || '')
        .replace(/[*_#>|]/g, '')
        .replace(/\s+/g, ' ')
        .slice(0, 160),
    };
  }
  workingSummary(): string {
    return this.execution
      .events()
      .filter((e) => e.type === 'text' || e.type === 'tool')
      .map((e) => (e.type === 'tool' ? e.name || '' : e.text || ''))
      .join('')
      .slice(-250);
  }
  focusAgent(id: string): void {
    this.select(id);
    this.renderer?.focus?.(id);
  }
  toggleFocus(): void {
    this.focused.set(!this.focused());
    queueMicrotask(() => this.renderer?.home());
  }
  roomLabel(key: string): string {
    return this.i18n.text('office.' + key);
  }
  private placeCards(markers: Marker[]): void {
    if (this.store.settings()?.layout !== 'office-3d') {
      this.cards.set([]);
      this.workCards.set([]);
      return;
    }
    const gap = 6,
      lift = 26,
      radius = 19,
      placed: { x: number; y: number; w: number; h: number }[] = [];
    if (!this.focused() && this.width > 900) {
      placed.push(
        {
          x: 0,
          y: 0,
          w: this.room.opened() && !this.room.minimized() ? this.room.width() + 28 : 270,
          h: this.height,
        },
        { x: this.width - 295, y: 0, w: 295, h: this.height },
      );
    }
    const overlap = (
      a: { x: number; y: number; w: number; h: number },
      b: { x: number; y: number; w: number; h: number },
    ) =>
      Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
      Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const obstacles = markers.map((m) => ({
      x: m.x - radius,
      y: m.y - radius,
      w: radius * 2,
      h: radius * 2,
    }));
    const cards: MapCard[] = [],
      workCards: MapCard[] = [];
    for (const marker of [...markers]
      .filter((m) => !m.walking || !!this.workState(m.id))
      .sort((a, b) => a.y - b.y || a.x - b.x)) {
      const work = this.workState(marker.id),
        w = work ? 224 : 156,
        h = work ? 126 : 46;
      const offsets: { dx: number; top: number }[] = [];
      for (let k = 0; k < 4; k++)
        for (const dx of [0, -w / 2 - gap, w / 2 + gap, -w - gap * 2, w + gap * 2])
          offsets.push({ dx, top: -lift - h - k * (h + gap) });
      for (let k = 0; k < 2; k++)
        for (const dx of [0, -w / 2 - gap, w / 2 + gap])
          offsets.push({ dx, top: lift + k * (h + gap) });
      for (const dx of [-w / 2 - radius - gap, w / 2 + radius + gap])
        offsets.push({ dx, top: -h / 2 });
      offsets.sort((a, b) => Math.hypot(a.dx, a.top + h / 2) - Math.hypot(b.dx, b.top + h / 2));
      let best = { x: marker.x - w / 2, y: marker.y - lift - h, w, h },
        cost = Infinity;
      for (const offset of offsets) {
        const box = { x: marker.x + offset.dx - w / 2, y: marker.y + offset.top, w, h };
        let score =
          placed.reduce((n, q) => n + overlap(box, q), 0) +
          obstacles.reduce((n, q) => n + overlap(box, q), 0);
        score +=
          (Math.max(0, 4 - box.x) + Math.max(0, box.x + w - this.width + 4)) * h +
          (Math.max(0, 4 - box.y) + Math.max(0, box.y + h - this.height + 4)) * w;
        if (score < cost) {
          cost = score;
          best = box;
          if (!score) break;
        }
      }
      placed.push(best);
      const x = Math.max(best.x, Math.min(marker.x, best.x + w)),
        y = Math.max(best.y, Math.min(marker.y, best.y + h));
      (work ? workCards : cards).push({
        ...marker,
        cardX: best.x,
        cardY: best.y,
        leaderX: x,
        leaderY: y,
        leaderWidth: Math.max(0, Math.hypot(marker.x - x, marker.y - y) - radius * 0.7),
        leaderAngle: 'rotate(' + Math.atan2(marker.y - y, marker.x - x) + 'rad)',
      });
    }
    this.cards.set(cards);
    this.workCards.set(workCards);
  }
  @HostListener('document:keydown', ['$event']) keys(e: KeyboardEvent): void {
    if (
      this.background() ||
      this.dialogs.current() ||
      (e.target as HTMLElement).closest('input,textarea,select') ||
      e.ctrlKey ||
      e.metaKey
    )
      return;
    if (e.key === 'Escape') {
      this.movingId.set('');
      this.actionsFor.set('');
      this.focused.set(false);
    } else if (e.key.toLowerCase() === 'v')
      this.setLayout(this.store.settings()?.layout === 'city-3d' ? 'office-3d' : 'city-3d');
    else if (e.key.toLowerCase() === 'p' && this.store.settings()?.layout === 'city-3d')
      this.toggleShape();
    else if (e.key === '0') this.home();
    else if (['+', '='].includes(e.key)) this.zoom(1.2);
    else if (e.key === '-') this.zoom(1 / 1.2);
    else if (e.key === '[') this.rotate(-Math.PI / 4);
    else if (e.key === ']') this.rotate(Math.PI / 4);
    else if (e.key.toLowerCase() === 'h') this.focused.set(!this.focused());
    else return;
    e.preventDefault();
  }
  ngOnDestroy(): void {
    this.revision++;
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.renderer?.dispose();
    this.observer?.disconnect();
  }
}
import { portrait as importedPortrait } from '@domain/catalog';
