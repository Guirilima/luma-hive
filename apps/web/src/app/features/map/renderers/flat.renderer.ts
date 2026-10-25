import { MapRenderer, MapFrame, RendererContext, MapTarget } from './map-renderer';
import { OFFICE_ROOMS, OFFICE_SLOTS, officeSlot, seatOf } from '@domain/office';
export class FlatRenderer implements MapRenderer {
  private frame: MapFrame | null = null;
  private width = 1;
  private height = 1;
  private level = 1;
  private base = 1;
  private yaw = Math.PI / 4;
  private center = { x: 0, z: 0 };
  private offset = { x: 0, y: 0 };
  private readonly visits = new Map<string, { x: number; z: number }>();
  constructor(
    private readonly host: RendererContext,
    private readonly mode: 'office' | 'city' = 'office',
  ) {}
  update(frame: MapFrame): void {
    const first = !this.frame;
    this.frame = frame;
    if (first) this.home();
    this.paint();
    this.host.canvas.dataset['ready'] = 'true';
  }
  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.host.canvas.width = width;
    this.host.canvas.height = height;
    this.home();
  }
  private scale(): number {
    return (this.height / 26) * this.level;
  }
  private project(x: number, z: number, y = 0): { x: number; y: number } {
    const dx = x - this.center.x,
      dz = z - this.center.z,
      c = Math.cos(this.yaw),
      s = Math.sin(this.yaw),
      scale = this.scale();
    return {
      x: this.width / 2 + this.offset.x + (dx * c - dz * s) * scale,
      y:
        this.height / 2 +
        this.offset.y +
        ((dx * s + dz * c) * Math.sin(0.6155) - y * Math.cos(0.6155)) * scale,
    };
  }
  private ground(x: number, y: number): { x: number; z: number } {
    const rx = (x - this.width / 2 - this.offset.x) / this.scale(),
      rz = (y - this.height / 2 - this.offset.y) / this.scale() / Math.sin(0.6155),
      c = Math.cos(this.yaw),
      s = Math.sin(this.yaw);
    return { x: this.center.x + rx * c + rz * s, z: this.center.z - rx * s + rz * c };
  }
  pan(dx: number, dy: number): void {
    this.offset.x += dx;
    this.offset.y += dy;
    this.paint();
  }
  zoom(factor: number): void {
    this.level = Math.min(this.base * 6, Math.max(this.base * 0.35, this.level * factor));
    this.paint();
  }
  rotate(delta: number): void {
    this.yaw += delta;
    this.paint();
  }
  home(): void {
    const visible = this.frame?.focused
      ? this.width
      : this.width < 561
        ? this.width
        : this.width < 901
          ? this.width - 240
          : Math.max(420, this.width - 640);
    this.base = Math.min(visible / ((36 / 26) * this.height), (0.78 * 26) / 21.3) * 1.02;
    this.level = this.mode === 'office' ? this.base : 1.35;
    this.yaw = Math.PI / 4;
    this.center = { x: 0, z: 0 };
    this.offset = {
      x: this.frame?.focused ? 0 : this.width < 901 ? this.width * 0.1 : -this.width * 0.045,
      y: this.height * 0.09,
    };
    this.paint();
  }
  zoomValue(): number {
    return Math.round((this.level / this.base) * 100);
  }
  snapshot(): string {
    return this.host.canvas.toDataURL('image/png');
  }
  focus(id: string): void {
    const agent = this.frame?.agents.find((a) => a.id === id);
    if (!agent) return;
    const slot = officeSlot(agent.desk),
      point =
        this.mode === 'office' && slot
          ? seatOf(slot)
          : { x: Math.sqrt(3) * (agent.hex.q + agent.hex.r / 2), z: 1.5 * agent.hex.r };
    this.center = point;
    this.paint();
  }
  pick(x: number, y: number): MapTarget | null {
    const p = this.ground(x, y);
    if (this.mode === 'office') {
      const room = OFFICE_ROOMS.find(
        (r) => r.war && p.x >= r.x && p.x <= r.x + r.w && p.z >= r.z && p.z <= r.z + r.d,
      );
      if (room) return { room: 'WAR' };
      const nearest = OFFICE_SLOTS.map((slot) => ({
        id: slot.id,
        d: Math.hypot(p.x - seatOf(slot).x, p.z - seatOf(slot).z),
      })).sort((a, b) => a.d - b.d)[0];
      return nearest.d < 1.35 ? { desk: nearest.id } : null;
    }
    const qf = (Math.sqrt(3) / 3) * p.x - p.z / 3,
      rf = (2 / 3) * p.z;
    let q = Math.round(qf),
      r = Math.round(rf),
      s = Math.round(-qf - rf);
    if (Math.abs(q - qf) > Math.abs(r - rf) && Math.abs(q - qf) > Math.abs(s + qf + rf)) q = -r - s;
    else if (Math.abs(r - rf) > Math.abs(s + qf + rf)) r = -q - s;
    return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2 <= 10 ? { hex: { q, r } } : null;
  }
  visit(id: string, destination: string): void {
    const room = OFFICE_ROOMS.find((r) => r.key === destination || r.code === destination);
    if (room) this.visits.set(id, { x: room.x + room.w / 2, z: room.z + room.d / 2 });
    this.paint();
  }
  private paint(): void {
    const g = this.host.canvas.getContext('2d');
    if (!g || !this.frame) return;
    g.clearRect(0, 0, this.width, this.height);
    const polygon = (points: { x: number; y: number }[], fill: string, stroke: string) => {
      g.beginPath();
      points.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      g.closePath();
      g.fillStyle = fill;
      g.fill();
      g.strokeStyle = stroke;
      g.stroke();
    };
    if (this.mode === 'office') {
      for (const room of OFFICE_ROOMS)
        polygon(
          [
            [room.x, room.z],
            [room.x + room.w, room.z],
            [room.x + room.w, room.z + room.d],
            [room.x, room.z + room.d],
          ].map(([x, z]) => this.project(x, z)),
          room.war ? '#211216' : '#142129',
          room.war ? '#86323a' : '#28515f',
        );
      for (const slot of OFFICE_SLOTS) {
        if (slot.seat) continue;
        polygon(
          [
            [slot.x - 0.7, slot.z - 0.36],
            [slot.x + 0.7, slot.z - 0.36],
            [slot.x + 0.7, slot.z + 0.36],
            [slot.x - 0.7, slot.z + 0.36],
          ].map(([x, z]) => this.project(x, z, 0.75)),
          '#354b57',
          '#657d88',
        );
      }
      this.host.rooms?.(
        OFFICE_ROOMS.map((r) => ({
          ...this.project(r.x + 0.4, r.z + 0.45),
          id: r.code,
          key: r.key,
          index: r.index!,
        })),
      );
    } else
      for (let q = -10; q <= 10; q++)
        for (let r = -10; r <= 10; r++)
          if ((Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2 <= 10) {
            const x = Math.sqrt(3) * (q + r / 2),
              z = 1.5 * r;
            polygon(
              Array.from({ length: 6 }, (_, i) =>
                this.project(
                  x + Math.cos(Math.PI / 6 + (i * Math.PI) / 3) * 0.98,
                  z + Math.sin(Math.PI / 6 + (i * Math.PI) / 3) * 0.98,
                ),
              ),
              '#10181d',
              '#293c45',
            );
          }
    const markers = this.frame.agents.map((agent, i) => {
      const slot = officeSlot(agent.desk) || OFFICE_SLOTS[i % OFFICE_SLOTS.length],
        seat =
          this.mode === 'office'
            ? this.visits.get(agent.id) || seatOf(slot)
            : { x: Math.sqrt(3) * (agent.hex.q + agent.hex.r / 2), z: 1.5 * agent.hex.r },
        p = this.project(seat.x, seat.z, this.mode === 'office' ? 1.55 : 0.76);
      return { id: agent.id, ...p, walking: false };
    });
    for (const link of this.frame.links || []) {
      const a = markers.find((m) => m.id === link.from),
        b = markers.find((m) => m.id === link.to);
      if (!a || !b) continue;
      g.strokeStyle = link.active ? '#30c5e8' : this.frame.handoffs ? '#ad85dd88' : '#407b9088';
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) - 30, b.x, b.y);
      g.stroke();
    }
    this.host.markers(markers);
  }
  dispose(): void {
    this.frame = null;
    this.visits.clear();
  }
}
