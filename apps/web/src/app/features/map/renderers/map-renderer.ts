import { Agent, Locale, MapLayout } from '@domain/models';
export interface Point {
  x: number;
  y: number;
}
export interface MapTarget {
  desk?: string;
  hex?: { q: number; r: number };
  room?: string;
}
export interface RoomMarker extends Point {
  id: string;
  key: string;
  index: number;
}
export interface Marker extends Point {
  scale?: number;
  labelRow?: number;
  id: string;
  walking: boolean;
  badge?: string;
}
export interface MapFrame {
  occupiedDesks?: string[];
  occupiedHexes?: { q: number; r: number }[];
  movingId?: string;
  inset?: number;
  focused?: boolean;
  paused?: boolean;
  phase?: string;
  handoffs?: boolean;
  dismissed?: boolean;
  links?: { from: string; to: string; active?: boolean }[];
  agents: Agent[];
  selectedId: string;
  busyIds: string[];
  motion: boolean;
  quality: 'high' | 'low';
  cityShape: 'flat' | 'planet';
  locale: Locale;
  labels: Record<string, string>;
}
export interface MapRenderer {
  update(frame: MapFrame): void;
  resize(width: number, height: number): void;
  pan(dx: number, dy: number): void;
  zoom(factor: number): void;
  rotate(delta: number): void;
  orbit?(dx: number, dy: number): void;
  home(): void;
  visit(agentId: string, destination: string): void;
  pick?(x: number, y: number): MapTarget | null;
  focus?(agentId: string): void;
  zoomValue?(): number;
  snapshot?(): string;
  dispose(): void;
}
export interface RendererContext {
  canvas: HTMLCanvasElement;
  markers: (markers: Marker[]) => void;
  rooms?: (rooms: RoomMarker[]) => void;
  fallback: () => void;
}
export type RendererFactory = (context: RendererContext) => Promise<MapRenderer>;
export const RENDERERS: Record<MapLayout, RendererFactory> = {
  'office-pixel': async (context) => new (await import('./pixel.renderer')).PixelRenderer(context),
  'office-3d': async (context) => {
    try {
      return new (await import('./three.renderer')).ThreeRenderer(context, 'office');
    } catch {
      context.fallback();
      return new (await import('./flat.renderer')).FlatRenderer(context, 'office');
    }
  },
  'city-3d': async (context) => {
    try {
      return new (await import('./three.renderer')).ThreeRenderer(context, 'city');
    } catch {
      context.fallback();
      return new (await import('./flat.renderer')).FlatRenderer(context);
    }
  },
};
