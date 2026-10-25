// Geometry and seat IDs preserved from the Squad Code office.
export interface OfficeRoom {
  code: string;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  cols?: number;
  rows?: number;
  pad?: number;
  round?: number;
  glass?: boolean;
  war?: boolean;
  door?: string;
  index?: number;
  table?: { x: number; z: number };
}
export interface OfficeSlot {
  id: string;
  room: string;
  x: number;
  z: number;
  rot: number;
  seat?: boolean;
  facing?: number;
  screenIndex?: number;
}
const OFFICE = { x0: -16, x1: 16, z0: -9, z1: 9, corridor: [-1.5, 1.5], wallH: 2.4 };
const ROOMS: OfficeRoom[] = [
  {
    code: 'CMD',
    name: 'Sala de Comando',
    x: -16,
    z: -9,
    w: 6,
    d: 7.5,
    cols: 2,
    rows: 1,
    glass: true,
  },
  {
    code: 'REC',
    name: 'Reconhecimento',
    x: -10,
    z: -9,
    w: 6,
    d: 7.5,
    cols: 2,
    rows: 1,
    glass: true,
  },
  { code: 'R', name: 'Sala de Reunião', x: -4, z: -9, w: 7, d: 7.5, round: 6, glass: true },
  { code: 'B', name: 'Open Space B', x: 3, z: -9, w: 6, d: 7.5, cols: 2, rows: 2, pad: 2 },
  { code: 'A', name: 'Open Space A', x: -16, z: 1.5, w: 11, d: 7.5, cols: 4, rows: 2, pad: 2 },
  { code: 'LAB', name: 'Lab', x: -5, z: 1.5, w: 7, d: 7.5, cols: 2, rows: 2 },
  { code: 'C', name: 'Open Space C', x: 2, z: 1.5, w: 7, d: 7.5, cols: 2, rows: 2, pad: 2 },
  { code: 'WAR', name: 'War Room', x: 9, z: -9, w: 7, d: 18, war: true, door: 'west', glass: true },
];
const SLOTS: OfficeSlot[] = [];
ROOMS.forEach((room, ri) => {
  room.index = ri;
  if (room.war) return;
  if (room.round) {
    const cx = room.x + room.w / 2,
      cz = room.z + room.d / 2 + 0.4;
    for (let k = 0; k < room.round; k++) {
      const a = (k / room.round) * Math.PI * 2;
      SLOTS.push({
        id: `${room.code}-${k + 1}`,
        room: room.code,
        x: cx + Math.cos(a) * 2.1,
        z: cz + Math.sin(a) * 2.1,
        rot: -a - Math.PI / 2,
        seat: true,
      });
    }
    room.table = { x: cx, z: cz };
    return;
  }
  // Every workstation faces north (facing -1: monitor on the north edge, chair to the south), so the camera sees the screens.
  const mx = 0.9,
    cw = (room.w - mx * 2) / room.cols!,
    z0 = room.z + (room.rows! > 1 ? 1.55 : room.d * 0.42);
  let n = 0;
  for (let r = 0; r < room.rows!; r++)
    for (let c = 0; c < room.cols!; c++) {
      n++;
      const id = room.code + '-' + (room.pad ? String(n).padStart(room.pad, '0') : n);
      SLOTS.push({
        id,
        room: room.code,
        x: room.x + mx + cw * (c + 0.5),
        z: z0 + r * 2.5,
        rot: Math.PI,
        facing: -1,
      });
    }
});
const SLOT_BY_ID = new Map(SLOTS.map((s) => [s.id, s]));
const ROOM_BY_CODE = new Map(ROOMS.map((r) => [r.code, r]));
// Where the agent "sits": the chair in front of the desk (marker is projected above it).
const seatOf = (slot: OfficeSlot) =>
  slot.seat
    ? { x: slot.x, z: slot.z }
    : { x: slot.x, z: slot.z + (slot.facing! > 0 ? -0.62 : 0.62) };

export { OFFICE, ROOMS, SLOTS, SLOT_BY_ID, ROOM_BY_CODE, seatOf };
export const OFFICE_ROOMS = ROOMS.map((room) => ({
  ...room,
  id: room.code,
  key: (
    {
      CMD: 'command',
      REC: 'architecture',
      R: 'meeting',
      B: 'flex',
      A: 'development',
      LAB: 'testing',
      C: 'design',
      WAR: 'war',
    } as Record<string, string>
  )[room.code],
}));
export const OFFICE_SLOTS = SLOTS;
export function officeSlot(id: string): OfficeSlot | undefined {
  return (
    SLOT_BY_ID.get(id) ||
    SLOTS.find(
      (slot) =>
        slot.room === id.split('-')[0] &&
        Number(slot.id.split('-')[1]) === Number(id.split('-')[1]),
    )
  );
}
