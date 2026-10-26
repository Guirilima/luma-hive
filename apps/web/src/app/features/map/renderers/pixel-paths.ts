import data from '@domain/pixel-rooms.json';
import { Agent } from '@domain/models';
export interface PixelRoom {
  id: string;
  name: string;
  box: number[];
  door: number[];
  inside: number[];
  spot: number[];
  via?: number[];
}
export const PIXEL_ROOMS = data as PixelRoom[];
export interface Waypoint {
  id: string;
  x: number;
  y: number;
}
export const department = (agent: Agent): string =>
  (
    ({
      commander: 'command',
      pm: 'meeting',
      po: 'docs',
      architect: 'architecture',
      designer: 'design',
      qa: 'testing',
      security: 'review',
      devops: 'devops',
      docs: 'docs',
      data: 'devops',
      dba: 'devops',
      mobile: 'flex',
      custom: 'flex',
    }) as Record<string, string>
  )[agent.role] || 'development';
export class PixelPaths {
  readonly nodes = new Map<string, Waypoint>();
  private readonly edges = new Map<string, string[]>();
  constructor() {
    const add = (id: string, point: number[]) => {
      this.nodes.set(id, { id, x: point[0], y: point[1] });
      this.edges.set(id, []);
    };
    const join = (a: string, b: string) => {
      this.edges.get(a)!.push(b);
      this.edges.get(b)!.push(a);
    };
    const xs = [145, 196, 410, 580, 665, 882, 1020, 1080, 1195, 1200, 1460, 1510, 1700, 1715, 1980];
    for (const y of [322, 596])
      xs.forEach((x, i) => {
        add(`${x}:${y}`, [x, y]);
        if (i) join(`${xs[i - 1]}:${y}`, `${x}:${y}`);
      });
    for (const x of [665, 1195, 1700, 1980]) join(`${x}:322`, `${x}:596`);
    for (const room of PIXEL_ROOMS) {
      add(room.id + ':entry', room.inside);
      join(`${room.door[0]}:${room.door[1]}`, room.id + ':entry');
      if (room.via) {
        add(room.id + ':via', room.via);
        join(room.id + ':entry', room.id + ':via');
      }
      add(room.id, room.spot);
      join(room.id + (room.via ? ':via' : ':entry'), room.id);
    }
  }
  route(from: string, to: string): Waypoint[] {
    if (!this.nodes.has(from) || !this.nodes.has(to)) return [];
    const costs = new Map([[from, 0]]),
      previous = new Map<string, string>(),
      remaining = new Set(this.nodes.keys());
    while (remaining.size) {
      let current: string | undefined,
        best = Infinity;
      for (const id of remaining) {
        const cost = costs.get(id) ?? Infinity;
        if (cost < best) {
          best = cost;
          current = id;
        }
      }
      if (!current) break;
      if (current === to) break;
      remaining.delete(current);
      const p = this.nodes.get(current)!;
      for (const next of this.edges.get(current)!) {
        const n = this.nodes.get(next)!,
          cost = best + Math.hypot(n.x - p.x, n.y - p.y);
        if (cost < (costs.get(next) ?? Infinity)) {
          costs.set(next, cost);
          previous.set(next, current);
        }
      }
    }
    const path = [to];
    while (path[0] !== from) {
      const prev = previous.get(path[0]);
      if (!prev) return [];
      path.unshift(prev);
    }
    return path.map((id) => this.nodes.get(id)!);
  }
}
