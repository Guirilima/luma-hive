import { MapFrame, MapRenderer, Point, RendererContext, MapTarget } from './map-renderer';
import { PixelPaths, PIXEL_ROOMS, Waypoint, department } from './pixel-paths';
interface Actor extends Point {
  id: string;
  node: string;
  home: string;
  path: Waypoint[];
  direction: number;
  wait: number;
}
export class PixelRenderer implements MapRenderer {
  private readonly paths = new PixelPaths();
  private readonly actors = new Map<string, Actor>();
  private readonly background = new Image();
  private readonly sheet = new Image();
  private context: CanvasRenderingContext2D;
  private frame: MapFrame | null = null;
  private width = 1;
  private height = 1;
  private zoomLevel = 1;
  private offset = { x: 0, y: 0 };
  private raf = 0;
  private last = 0;
  private nextAmbient = 0;
  private disposed = false;
  constructor(private readonly host: RendererContext) {
    this.context = host.canvas.getContext('2d')!;
    this.background.src = '/assets/pixel-office/office.png';
    this.sheet.src = '/assets/pixel-office/agents.png';
    this.raf = requestAnimationFrame((t) => this.draw(t));
  }
  update(frame: MapFrame): void {
    this.frame = frame;
    const ids = new Set(frame.agents.map((a) => a.id));
    for (const id of this.actors.keys()) if (!ids.has(id)) this.actors.delete(id);
    for (const agent of frame.agents) {
      const home = department(agent);
      if (!this.actors.has(agent.id)) {
        const p = this.paths.nodes.get(home)!;
        this.actors.set(agent.id, {
          ...p,
          id: agent.id,
          node: home,
          home,
          path: [],
          direction: 0,
          wait: 0,
        });
      }
      const actor = this.actors.get(agent.id)!;
      if (actor.home !== home) {
        actor.home = home;
        this.visit(agent.id, home);
      }
      if (frame.busyIds.includes(agent.id) && actor.node !== home && !actor.path.length)
        this.visit(agent.id, home);
    }
  }
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    const ratio = Math.min(devicePixelRatio, 2);
    this.host.canvas.width = width * ratio;
    this.host.canvas.height = height * ratio;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  private fit(): { scale: number; x: number; y: number } {
    const compact = this.width < 901,
      focus = !!this.frame?.focused,
      left = focus
        ? 20
        : this.frame?.inset
          ? this.frame.inset + 28
          : this.width <= 560
            ? 184
            : compact
              ? 254
              : 334,
      right = !focus && !this.frame?.dismissed && !compact ? 320 : 56,
      top = focus ? 50 : this.width <= 560 ? 196 : this.width <= 1100 ? 164 : 128,
      bottom = focus ? 70 : compact ? 142 : 96;
    const w = Math.max(100, this.width - left - right),
      h = Math.max(160, this.height - top - bottom),
      scale = Math.min(w / 2009, h / 783) * this.zoomLevel;
    return {
      scale,
      x: left + w / 2 - (2009 * scale) / 2 + this.offset.x,
      y: top + h / 2 - (783 * scale) / 2 + this.offset.y,
    };
  }
  private scale(): number {
    return this.fit().scale;
  }
  pan(dx: number, dy: number): void {
    this.offset.x += dx;
    this.offset.y += dy;
  }
  zoom(factor: number): void {
    this.zoomLevel = Math.min(4, Math.max(0.5, this.zoomLevel * factor));
  }
  zoomValue(): number {
    return Math.round(this.zoomLevel * 100);
  }
  snapshot(): string {
    return this.host.canvas.toDataURL('image/png');
  }
  focus(id: string): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    const scale = this.scale();
    this.offset = { x: (2009 / 2 - actor.x) * scale, y: (783 / 2 - actor.y) * scale };
  }
  pick(x: number, y: number): MapTarget | null {
    const scale = this.scale(),
      ox = this.fit().x,
      oy = this.fit().y,
      px = (x - ox) / scale,
      py = (y - oy) / scale,
      room = PIXEL_ROOMS.find(
        (r) =>
          px >= r.box[0] &&
          px <= r.box[0] + r.box[2] &&
          py >= r.box[1] &&
          py <= r.box[1] + r.box[3],
      );
    return room ? { room: room.id } : null;
  }
  rotate(): void {}
  home(): void {
    this.zoomLevel = 1;
    this.offset = { x: 0, y: 0 };
  }
  visit(id: string, destination: string): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    const next = actor.path[0],
      route = this.paths.route(next?.id || actor.node, destination);
    actor.path = next ? [next, ...route.slice(1)] : route.slice(1);
    actor.wait = performance.now() + 5000;
    if (!this.frame?.motion) {
      const end = route.at(-1);
      if (end) {
        actor.x = end.x;
        actor.y = end.y;
        actor.node = end.id;
        actor.path = [];
      }
    }
  }
  private draw(time: number): void {
    if (this.disposed) return;
    this.raf = requestAnimationFrame((t) => this.draw(t));
    const dt = Math.min(0.05, (time - (this.last || time)) / 1000);
    this.last = time;
    if (!this.frame || document.hidden) return;
    const g = this.context,
      scale = this.scale(),
      origin = {
        x: this.fit().x,
        y: this.fit().y,
      };
    g.clearRect(0, 0, this.width, this.height);
    g.save();
    g.translate(origin.x, origin.y);
    g.scale(scale, scale);
    g.imageSmoothingEnabled = false;
    if (this.background.complete && this.background.naturalWidth) {
      g.drawImage(this.background, 0, 0, 2009, 783);
      this.host.canvas.dataset['ready'] = 'true';
    }
    if (this.frame.locale !== 'pt-BR')
      for (const room of PIXEL_ROOMS) {
        const x = room.box[0] + room.box[2] / 2,
          y = room.box[1] + 17;
        g.fillStyle = '#051522';
        g.fillRect(x - 105, y - 10, 210, 31);
        g.strokeStyle = '#6498b5';
        g.strokeRect(x - 105, y - 10, 210, 31);
        g.fillStyle = '#e3f3ff';
        g.textAlign = 'center';
        g.font = 'bold 16px monospace';
        g.fillText((this.frame.labels[room.id] || room.name).toUpperCase(), x, y + 12, 205);
      }
    if (this.frame.motion) {
      for (const actor of this.actors.values()) {
        const next = actor.path[0];
        if (!next) continue;
        const dx = next.x - actor.x,
          dy = next.y - actor.y,
          distance = Math.hypot(dx, dy),
          stride = dt * 75;
        actor.direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 1) : dy > 0 ? 0 : 3;
        if (distance <= stride) {
          actor.x = next.x;
          actor.y = next.y;
          actor.node = next.id;
          actor.path.shift();
          if (!actor.path.length) actor.wait = time + 5000;
        } else {
          actor.x += (dx / distance) * stride;
          actor.y += (dy / distance) * stride;
        }
      }
      if (time > this.nextAmbient) {
        this.nextAmbient = time + 3500;
        const idle = [...this.actors.values()].filter(
          (a) => !a.path.length && !this.frame!.busyIds.includes(a.id) && time > a.wait,
        );
        const actor = idle[Math.floor(time / 3500) % Math.max(1, idle.length)];
        if (actor)
          this.visit(
            actor.id,
            actor.node === actor.home
              ? ['lounge', 'meeting', 'review'][Math.floor(time / 10000) % 3]
              : actor.home,
          );
      }
    }
    const markers = [];
    const occupancy = new Map<string, number>();
    for (const actor of [...this.actors.values()].sort((a, b) => a.y - b.y)) {
      const walking = !!actor.path.length,
        slot = walking ? 0 : occupancy.get(actor.node) || 0;
      if (!walking) occupancy.set(actor.node, slot + 1);
      const room = PIXEL_ROOMS.find((r) => r.id === actor.node),
        sign = room && actor.x > room.box[0] + room.box[2] / 2 ? -1 : 1,
        x = actor.x + (walking ? 0 : sign * (slot % 3) * 34),
        y = actor.y + (walking ? 0 : Math.floor(slot / 3) * 22);
      g.fillStyle = this.frame.selectedId === actor.id ? '#30c5e877' : '#0006';
      g.beginPath();
      g.ellipse(x, y, 22, 7, 0, 0, Math.PI * 2);
      g.fill();
      if (this.sheet.complete && this.sheet.naturalWidth) {
        const w = this.sheet.naturalWidth / 4,
          h = this.sheet.naturalHeight / 4,
          step = actor.path.length && this.frame.motion ? Math.floor(time / 150) % 4 : 1;
        g.drawImage(this.sheet, step * w, actor.direction * h, w, h, x - 33, y - 62, 66, 66);
      }
      markers.push({
        id: actor.id,
        x: origin.x + x * scale,
        y: origin.y + y * scale,
        scale,
        labelRow: !walking && slot % 2 ? 20 : 0,
        walking: !!actor.path.length,
      });
    }
    g.restore();
    this.host.markers(markers);
  }
  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.actors.clear();
    this.background.onload = null;
    this.sheet.onload = null;
  }
}
