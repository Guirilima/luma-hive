import * as T from 'three';
import { OFFICE, ROOMS, SLOTS, ROOM_BY_CODE, seatOf, OfficeSlot } from './office-layout';
const C = { cyan: 0x30c5e8, green: 0x7fcf9d };
const dummy = new T.Object3D(),
  color = new T.Color();
function rng(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
type BasicMesh = T.Mesh<T.BufferGeometry, T.MeshBasicMaterial>;
export interface OfficeScene {
  scene: T.Scene;
  camera: T.OrthographicCamera;
  slotMarks: Map<string, { ring: BasicMesh; led: BasicMesh; slot: OfficeSlot }>;
  links: T.Group;
  packets: unknown[];
  key: string;
  shadowDirty: boolean;
  walls: { g: T.Group; nx: number; nz: number }[];
  lampAt: Map<string, { head: T.Vector3; pool: T.Vector3 }>;
  screens: T.InstancedMesh<T.BufferGeometry, T.MeshBasicMaterial>;
  war?: {
    state: string;
    screens: T.MeshBasicMaterial[];
    map: T.MeshBasicMaterial;
    mapTex: T.Texture;
    strip: T.MeshBasicMaterial;
    lights: T.PointLight[];
  };
  lamp: { bulb: BasicMesh; glow: BasicMesh; pool: BasicMesh; light: T.PointLight };
  hover: BasicMesh;
  sel: BasicMesh;
  life: T.Group;
  lifePackets: unknown[];
}
function skylineTexture() {
  const cv = document.createElement('canvas');
  cv.width = 2048;
  cv.height = 160;
  const g = cv.getContext('2d')!,
    r = rng(3307);
  const sky = g.createLinearGradient(0, 0, 0, 160);
  sky.addColorStop(0, '#0a0e11');
  sky.addColorStop(0.65, '#16212a');
  sky.addColorStop(1, '#2a3a44');
  g.fillStyle = sky;
  g.fillRect(0, 0, 2048, 160);
  for (let i = 0; i < 170; i++) {
    g.fillStyle = `rgba(222,232,238,${(0.25 + r() * 0.6).toFixed(2)})`;
    g.fillRect(r() * 2048, r() * 80, 1.3, 1.3);
  }
  const mx = 1480,
    my = 36,
    halo = g.createRadialGradient(mx, my, 8, mx, my, 54);
  halo.addColorStop(0, 'rgba(214,228,234,.28)');
  halo.addColorStop(1, 'rgba(214,228,234,0)');
  g.fillStyle = halo;
  g.fillRect(mx - 60, my - 60, 120, 120);
  g.save();
  g.beginPath();
  g.arc(mx, my, 12, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = '#e4ecee';
  g.fillRect(mx - 14, my - 14, 28, 28);
  g.fillStyle = '#0c1115';
  g.beginPath();
  g.arc(mx + 6, my - 4, 11, 0, Math.PI * 2);
  g.fill();
  g.restore();
  // Two rows of buildings (far: lighter and lower; near: darker and taller) with a few lit windows.
  for (const [hMin, hMax, tone, lit] of [
    [34, 86, '#1d2830', 0.08],
    [44, 124, '#0f161b', 0.14],
  ] as [number, number, string, number][]) {
    for (let x = -12; x < 2048;) {
      const w = 22 + r() * 58,
        h = hMin + r() * (hMax - hMin),
        top = 160 - h;
      g.fillStyle = tone;
      g.fillRect(x, top, w, h);
      if (r() < 0.22) g.fillRect(x + w * 0.45, top - 12 - r() * 12, 2, 24);
      for (let wy = top + 6; wy < 154; wy += 7)
        for (let wx = x + 4; wx < x + w - 5; wx += 6)
          if (r() < lit) {
            g.fillStyle = r() < 0.86 ? 'rgba(206,232,240,.95)' : 'rgba(240,220,176,.9)';
            g.fillRect(wx, wy, 2.2, 2.6);
          }
      x += w + (r() < 0.3 ? 4 + r() * 12 : 0);
    }
  }
  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.wrapS = T.RepeatWrapping;
  return tex;
}
function screenTexture() {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 144;
  const g = cv.getContext('2d')!,
    r = rng(5150);
  g.fillStyle = '#0a1013';
  g.fillRect(0, 0, 256, 144);
  g.fillStyle = '#162228';
  g.fillRect(0, 0, 256, 11);
  g.fillRect(0, 11, 50, 133);
  for (let y = 19; y < 136; y += 9) {
    g.fillStyle = 'rgba(255,255,255,.2)';
    g.fillRect(8, y, 14 + r() * 22, 3);
  }
  for (let y = 20, ind = 0; y < 136; y += 9) {
    if (r() < 0.12) {
      ind = Math.max(0, ind - 1);
      continue;
    }
    ind = Math.max(0, Math.min(4, ind + (r() < 0.3 ? 1 : r() < 0.3 ? -1 : 0)));
    for (let x = 60 + ind * 10, p = 1 + Math.floor(r() * 3); p > 0 && x < 236; p--) {
      const w = Math.min(10 + r() * 44, 244 - x);
      g.fillStyle = ['rgba(255,255,255,.6)', 'rgba(255,255,255,.32)', 'rgba(150,235,255,.9)'][
        Math.floor(r() * 3)
      ];
      g.fillRect(x, y, w, 4);
      x += w + 5;
    }
  }
  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
function glowTexture() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d')!,
    gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)');
  gr.addColorStop(0.22, 'rgba(255,255,255,.42)');
  gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr;
  g.fillRect(0, 0, 128, 128);
  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
// War Room (red): wall screens (radar, bars, countdown, line chart, text rows) and the tactical map of the crisis table.
function warScreenTexture(seed: number) {
  const cv = document.createElement('canvas');
  cv.width = 512;
  cv.height = 256;
  const g = cv.getContext('2d')!,
    r = rng(seed);
  g.fillStyle = '#14070a';
  g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#2c0d12';
  g.fillRect(0, 0, 512, 18);
  for (let x = 8; x < 200; x += 34 + r() * 26) {
    g.fillStyle = 'rgba(255,120,130,.7)';
    g.fillRect(x, 6, 14 + r() * 18, 5);
  }
  g.strokeStyle = 'rgba(255,70,85,.12)';
  g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= 512; x += 24) {
    g.moveTo(x, 18);
    g.lineTo(x, 256);
  }
  for (let y = 18; y <= 256; y += 24) {
    g.moveTo(0, y);
    g.lineTo(512, y);
  }
  g.stroke();
  const cx = 112,
    cy = 140,
    R = 92,
    a0 = r() * Math.PI * 2;
  g.strokeStyle = 'rgba(255,80,95,.55)';
  g.lineWidth = 1.5;
  for (const k of [1, 0.66, 0.33]) {
    g.beginPath();
    g.arc(cx, cy, R * k, 0, Math.PI * 2);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(cx - R, cy);
  g.lineTo(cx + R, cy);
  g.moveTo(cx, cy - R);
  g.lineTo(cx, cy + R);
  g.stroke();
  g.fillStyle = 'rgba(255,60,75,.3)';
  g.beginPath();
  g.moveTo(cx, cy);
  g.arc(cx, cy, R, a0, a0 + 0.75);
  g.closePath();
  g.fill();
  for (let i = 0; i < 8; i++) {
    const a = r() * Math.PI * 2,
      d = r() * R * 0.9;
    g.fillStyle = i < 2 ? '#ffd2d6' : 'rgba(255,90,105,.9)';
    g.beginPath();
    g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, i < 2 ? 4 : 2.5, 0, Math.PI * 2);
    g.fill();
  }
  for (let i = 0; i < 9; i++) {
    const h = 20 + r() * 78;
    g.fillStyle = i === 4 ? 'rgba(255,205,210,.92)' : 'rgba(255,70,85,.75)';
    g.fillRect(232 + i * 14, 132 - h, 9, h);
  }
  for (let i = 0; i < 6; i++) {
    g.fillStyle = `rgba(255,${110 + i * 14},${120 + i * 12},${(0.35 + r() * 0.4).toFixed(2)})`;
    g.fillRect(232, 156 + i * 15, 40 + r() * 80, 6);
  }
  g.fillStyle = 'rgba(255,140,150,.8)';
  g.font = '600 12px monospace';
  g.fillText('OPERAÇÃO', 380, 44);
  g.fillStyle = 'rgba(255,205,210,.96)';
  g.font = '700 40px monospace';
  g.fillText(
    `T-${String(1 + Math.floor(r() * 9)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}`,
    376,
    92,
  );
  g.strokeStyle = 'rgba(255,150,160,.9)';
  g.lineWidth = 2;
  g.beginPath();
  for (let x = 376, y = 200; x <= 500; x += 8) {
    y = Math.max(150, Math.min(240, y + (r() - 0.5) * 28));
    if (x === 376) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  return tex;
}
function warMapTexture() {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 1024;
  const g = cv.getContext('2d')!,
    r = rng(9091);
  g.fillStyle = '#16070a';
  g.fillRect(0, 0, 256, 1024);
  g.strokeStyle = 'rgba(255,70,85,.16)';
  g.lineWidth = 1;
  g.beginPath();
  for (let x = 0; x <= 256; x += 32) {
    g.moveTo(x, 0);
    g.lineTo(x, 1024);
  }
  for (let y = 0; y <= 1024; y += 32) {
    g.moveTo(0, y);
    g.lineTo(256, y);
  }
  g.stroke();
  g.strokeStyle = 'rgba(255,90,105,.32)';
  for (let i = 0; i < 10; i++) {
    const x = r() * 256,
      y = r() * 1024,
      rx = 26 + r() * 60,
      ry = 40 + r() * 110,
      rot = r() * Math.PI;
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      g.ellipse(x, y, rx * (1 - k * 0.28), ry * (1 - k * 0.28), rot, 0, Math.PI * 2);
      g.stroke();
    }
  }
  // A dashed route that starts and ends at the centre, so the scrolling map wraps without a jump.
  g.setLineDash([10, 8]);
  g.strokeStyle = 'rgba(255,170,178,.85)';
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(128, 0);
  for (let y = 64, x = 128; y <= 1024; y += 64) {
    x = y === 1024 ? 128 : Math.max(30, Math.min(226, x + (r() - 0.5) * 90));
    g.lineTo(x, y);
  }
  g.stroke();
  g.setLineDash([]);
  for (let i = 0; i < 8; i++) {
    const x = 24 + r() * 208,
      y = 30 + r() * 964;
    g.strokeStyle = 'rgba(255,110,120,.95)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(x, y, 9, 0, Math.PI * 2);
    g.moveTo(x - 15, y);
    g.lineTo(x + 15, y);
    g.moveTo(x, y - 15);
    g.lineTo(x, y + 15);
    g.stroke();
    g.fillStyle = '#ffd2d6';
    g.fillRect(x - 2, y - 2, 4, 4);
  }
  const tex = new T.CanvasTexture(cv);
  tex.colorSpace = T.SRGBColorSpace;
  tex.wrapT = T.RepeatWrapping;
  return tex;
}
// War Room look per operation state: screens and map tint, LED strip opacity, red light intensity (animate pulses 'live').
const WAR_LOOK = {
  idle: { screen: 0x5a1a20, map: 0x4a161b, strip: 0.25, light: 1 },
  live: { screen: 0xffffff, map: 0xffd0d4, strip: 0.8, light: 7 },
  paused: { screen: 0xb06068, map: 0x9a4048, strip: 0.45, light: 3 },
};
// Workstation details in the desk's own frame: the person faces -z (monitor side), +x is their right.
const SCREEN_TILT = -0.08,
  LAMP_HEAD: [number, number, number] = [-0.5, 1.06, 0.07],
  LAMP_POOL: [number, number, number] = [-0.3, 0.766, 0.1];
export function buildOffice(): OfficeScene {
  const o = {
    scene: new T.Scene(),
    slotMarks: new Map(),
    links: new T.Group(),
    packets: [],
    key: '',
    walls: [],
    shadowDirty: true,
    lampAt: new Map(),
  } as unknown as OfficeScene;
  const os = o.scene,
    wr = rng(8812);
  o.camera = new T.OrthographicCamera(-10, 10, 10, -10, -200, 400);
  os.add(new T.HemisphereLight(0xc4e0ec, 0x0e171b, 1.8));
  // Key light from the back right: soft shadows fall toward the front left, like the reference.
  const key = new T.DirectionalLight(0xe8f3f8, 3);
  key.position.set(7, 18, -11);
  os.add(key);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 3;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, {
    left: -16,
    right: 16,
    top: 16,
    bottom: -16,
    near: 1,
    far: 60,
  });
  key.shadow.camera.updateProjectionMatrix();
  const fill = new T.DirectionalLight(0x3a8fb0, 0.75);
  fill.position.set(-8, 7, 10);
  os.add(fill);
  os.add(new T.AmbientLight(0x22343c, 1.05));
  const mat = (c: number, extra: T.MeshStandardMaterialParameters = {}) =>
    new T.MeshStandardMaterial({ color: c, roughness: 0.85, metalness: 0.1, ...extra });
  // Batches: put() records a part (geometry + material, local transform under `frame`); one InstancedMesh per batch at the end.
  const UB = new T.BoxGeometry(1, 1, 1),
    UC = new T.CylinderGeometry(1, 1, 1, 20),
    US = new T.SphereGeometry(1, 12, 9),
    CONE = new T.CylinderGeometry(0.25, 1, 1, 20),
    frame = new T.Matrix4(),
    batches = new Map<
      string,
      { geo: T.BufferGeometry; m: T.Material; list: [T.Matrix4, number][] }
    >();
  const at = (x: number, z: number, yaw = 0) => frame.makeRotationY(yaw).setPosition(x, 0, z);
  function put(
    geo: T.BufferGeometry,
    m: T.Material,
    x: number,
    y: number,
    z: number,
    sx = 1,
    sy = 1,
    sz = 1,
    rx = 0,
    ry = 0,
    rz = 0,
    tint = 0xffffff,
  ) {
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, rz);
    dummy.scale.set(sx, sy, sz);
    dummy.updateMatrix();
    const k = geo.uuid + m.uuid;
    let b = batches.get(k);
    if (!b) batches.set(k, (b = { geo, m, list: [] }));
    b.list.push([new T.Matrix4().multiplyMatrices(frame, dummy.matrix), tint]);
  }
  const box = (m: T.Material, ...a: [number, number, number, ...number[]]) => put(UB, m, ...a),
    local = (x: number, y: number, z: number) => new T.Vector3(x, y, z).applyMatrix4(frame);
  const topMat = mat(0x56676f, { roughness: 0.6 }),
    bodyMat = mat(0x3a4a52),
    baseMat = mat(0x1f2b31),
    frontMat = mat(0x2b3a41),
    metalMat = mat(0x6d7f87, { metalness: 0.6, roughness: 0.4 });
  const darkMat = mat(0x141c20, { roughness: 0.6 }),
    keysMat = mat(0x243036),
    fabricMat = mat(0x263339, { roughness: 1 }),
    trimMat = mat(0x3d4f57),
    chairMat = mat(0x2e3c43, { roughness: 0.9 });
  const mugMat = mat(0xffffff, { roughness: 0.5 }),
    paperMat = mat(0x8d9aa0, { roughness: 0.95 }),
    potMat = mat(0x2e3a3f),
    plantMat = mat(0x2b423b),
    tableMat = mat(0x46575f, { roughness: 0.55 });
  const rugMat = mat(0x111a1f, { roughness: 1 }),
    plateMat = mat(0x141f25),
    glassPlateMat = mat(0x17252c),
    partMat = mat(0x2a3940),
    warPlateMat = mat(0x1d1114),
    warPartMat = mat(0x2c1c20);
  const glassMat = new T.MeshStandardMaterial({
    color: 0x9fd2e2,
    transparent: true,
    opacity: 0.12,
    roughness: 0.1,
    metalness: 0.4,
    depthWrite: false,
  });
  const warGlassMat = new T.MeshStandardMaterial({
    color: 0xff6670,
    transparent: true,
    opacity: 0.12,
    roughness: 0.1,
    metalness: 0.4,
    depthWrite: false,
  });
  const war = ROOM_BY_CODE.get('WAR'),
    warScreens: T.MeshBasicMaterial[] = [];
  // Floor slab + fine grid.
  const W = OFFICE.x1 - OFFICE.x0,
    D = OFFICE.z1 - OFFICE.z0,
    cx = (OFFICE.x0 + OFFICE.x1) / 2,
    cz = (OFFICE.z0 + OFFICE.z1) / 2,
    H = OFFICE.wallH;
  const slab = new T.Mesh(new T.BoxGeometry(W + 1.2, 0.3, D + 1.2), mat(0x10181c));
  slab.position.set(cx, -0.15, cz);
  slab.receiveShadow = true;
  os.add(slab);
  const grid = [];
  for (let x = Math.ceil(OFFICE.x0); x <= OFFICE.x1; x++)
    grid.push(x, 0.047, OFFICE.z0, x, 0.047, OFFICE.z1);
  for (let z = OFFICE.z0; z <= OFFICE.z1; z++) grid.push(OFFICE.x0, 0.047, z, OFFICE.x1, 0.047, z);
  const gridGeo = new T.BufferGeometry();
  gridGeo.setAttribute('position', new T.Float32BufferAttribute(grid, 3));
  os.add(
    new T.LineSegments(
      gridGeo,
      new T.LineBasicMaterial({ color: 0x1b272d, transparent: true, opacity: 0.5 }),
    ),
  );
  const slabEdge = new T.LineLoop(
    new T.BufferGeometry().setFromPoints(
      [
        [OFFICE.x0 - 0.6, OFFICE.z0 - 0.6],
        [OFFICE.x1 + 0.6, OFFICE.z0 - 0.6],
        [OFFICE.x1 + 0.6, OFFICE.z1 + 0.6],
        [OFFICE.x0 - 0.6, OFFICE.z1 + 0.6],
      ].map(([x, z]) => new T.Vector3(x, 0.006, z)),
    ),
    new T.LineBasicMaterial({ color: 0x2b3d46 }),
  );
  os.add(slabEdge);
  // Outer walls: a low kerb on every side; the tall wall (with its cap, and the skyline window on north/south) is a group
  // that applyCamera shows only when its inner face looks at the camera.
  const wallMat = mat(0x1a2429),
    capMat = mat(0x34454d),
    kerbMat = mat(0x223038),
    frameMat = mat(0x2a3840, { metalness: 0.4, roughness: 0.5 }),
    sky = skylineTexture();
  for (const [nx, nz] of [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]) {
    const horizontal = !!nz,
      len = (horizontal ? W : D) + 0.4,
      px = nx ? (nx > 0 ? OFFICE.x0 - 0.1 : OFFICE.x1 + 0.1) : cx,
      pz = nz ? (nz > 0 ? OFFICE.z0 - 0.1 : OFFICE.z1 + 0.1) : cz;
    const slabAt = (l: number, h: number, t: number, y: number, m: T.Material, off = 0) => {
      const s = new T.Mesh(new T.BoxGeometry(horizontal ? l : t, h, horizontal ? t : l), m);
      s.position.set(px + nx * off, y, pz + nz * off);
      s.castShadow = s.receiveShadow = true;
      return s;
    };
    os.add(slabAt(len, 0.14, 0.2, 0.07, kerbMat));
    const g = new T.Group();
    g.add(
      slabAt(len, H, 0.2, H / 2, wallMat),
      slabAt(len, 0.05, 0.26, H + 0.025, capMat),
      slabAt(len, 0.09, 0.03, 0.045 + 0.14, trimMat, 0.115),
    );
    if (horizontal) {
      // Window band with the skyline (up to the War Room), mullions every ~1.6 and a sill.
      const wx0 = OFFICE.x0 + 0.4,
        wx1 = war ? war.x - 0.3 : OFFICE.x1 - 0.4,
        wl = wx1 - wx0,
        wcx = (wx0 + wx1) / 2,
        y0 = 0.9,
        wh = 1.24,
        tex = nz > 0 ? sky : sky.clone();
      if (nz < 0) {
        tex.offset.x = 0.43;
        tex.needsUpdate = true;
      }
      const pane = new T.Mesh(
        new T.PlaneGeometry(wl, wh),
        new T.MeshBasicMaterial({ map: tex, toneMapped: false }),
      );
      pane.position.set(wcx, y0 + wh / 2, pz + nz * 0.104);
      pane.rotation.y = nz > 0 ? 0 : Math.PI;
      g.add(pane);
      const n = Math.round(wl / 1.6),
        bars = new T.InstancedMesh(UB, frameMat, n + 3);
      let i = 0;
      const bar = (x: number, y: number, sx: number, sy: number) => {
        dummy.position.set(x, y, pz + nz * 0.125);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(sx, sy, 0.05);
        dummy.updateMatrix();
        bars.setMatrixAt(i++, dummy.matrix);
      };
      for (let k = 0; k <= n; k++) bar(wx0 + (wl * k) / n, y0 + wh / 2, 0.05, wh);
      bar(wcx, y0, wl + 0.05, 0.06);
      bar(wcx, y0 + wh, wl + 0.05, 0.05);
      bars.castShadow = true;
      g.add(bars);
      // The War Room's stretch of the north wall carries its screens (one wide, two narrow) instead of the window.
      if (nz > 0 && war)
        for (const [dx, y, w, h, seed] of [
          [0, 1.5, 3.2, 1.55, 71],
          [-2.45, 1.45, 1.3, 1, 72],
          [2.45, 1.45, 1.3, 1, 73],
        ]) {
          const x = war.x + war.w / 2 + dx,
            bez = new T.Mesh(new T.BoxGeometry(w + 0.1, h + 0.1, 0.05), darkMat);
          bez.position.set(x, y, OFFICE.z0 + 0.025);
          g.add(bez);
          const scr = new T.Mesh(
            new T.PlaneGeometry(w, h),
            new T.MeshBasicMaterial({
              map: warScreenTexture(seed),
              color: 0x5a1a20,
              toneMapped: false,
            }),
          );
          scr.position.set(x, y, OFFICE.z0 + 0.052);
          g.add(scr);
          warScreens.push(scr.material);
        }
    }
    os.add(g);
    o.walls.push({ g, nx, nz });
  }
  // Rooms: floor plate, outline, low partitions with a door gap on the corridor side (the War Room's is on its west side, at the
  // end of the corridor; none on the outer walls), glass on some. The War Room is tinted red.
  const seen = new Set();
  for (const room of ROOMS) {
    const plate = new T.Mesh(
      new T.BoxGeometry(room.w - 0.12, 0.04, room.d - 0.12),
      room.war ? warPlateMat : room.glass ? glassPlateMat : plateMat,
    );
    plate.position.set(room.x + room.w / 2, 0.02, room.z + room.d / 2);
    plate.receiveShadow = true;
    os.add(plate);
    const pts = [
      [room.x + 0.06, room.z + 0.06],
      [room.x + room.w - 0.06, room.z + 0.06],
      [room.x + room.w - 0.06, room.z + room.d - 0.06],
      [room.x + 0.06, room.z + room.d - 0.06],
    ].map(([x, z]) => new T.Vector3(x, 0.045, z));
    os.add(
      new T.LineLoop(
        new T.BufferGeometry().setFromPoints(pts),
        new T.LineBasicMaterial({
          color: room.war ? 0x8a2a32 : 0x24505e,
          transparent: true,
          opacity: 0.75,
        }),
      ),
    );
    const corridorSide = room.z < 0 ? room.z + room.d : room.z,
      door = room.x + room.w / 2;
    const walls = [
      [room.x, room.z, room.x + room.w, room.z],
      [room.x, room.z + room.d, room.x + room.w, room.z + room.d],
      [room.x, room.z, room.x, room.z + room.d],
      [room.x + room.w, room.z, room.x + room.w, room.z + room.d],
    ];
    for (const [x1, z1, x2, z2] of walls) {
      const horizontal = z1 === z2,
        k = [x1, z1, x2, z2].join();
      // The War Room's west wall runs the full depth, so the east walls of the rooms beside it are not drawn twice.
      if (
        seen.has(k) ||
        (horizontal
          ? z1 === OFFICE.z0 || z1 === OFFICE.z1
          : x1 === OFFICE.x0 || x1 === OFFICE.x1 || (war && room !== war && x1 === war.x))
      )
        continue;
      seen.add(k);
      const segs =
        horizontal && z1 === corridorSide && !room.door
          ? [
              [x1, door - 0.8],
              [door + 0.8, x2],
            ]
          : !horizontal && room.door === 'west' && x1 === room.x
            ? [
                [z1, -0.8],
                [0.8, z2],
              ]
            : [[horizontal ? x1 : z1, horizontal ? x2 : z2]];
      for (const [a0, a1] of segs) {
        const len = a1 - a0;
        if (len <= 0.1) continue;
        const wall = new T.Mesh(
          new T.BoxGeometry(horizontal ? len : 0.08, 0.42, horizontal ? 0.08 : len),
          room.war ? warPartMat : partMat,
        );
        wall.castShadow = wall.receiveShadow = true;
        wall.position.set(horizontal ? (a0 + a1) / 2 : x1, 0.21, horizontal ? z1 : (a0 + a1) / 2);
        os.add(wall);
        if (room.glass) {
          const g = new T.Mesh(
            new T.BoxGeometry(horizontal ? len : 0.03, 1.3, horizontal ? 0.03 : len),
            room.war ? warGlassMat : glassMat,
          );
          g.position.set(wall.position.x, 1.07, wall.position.z);
          os.add(g);
        }
      }
    }
    if (room.table) {
      at(room.table.x, room.table.z);
      put(UC, rugMat, 0, 0.047, 0, 2.85, 0.01, 2.85);
      put(UC, darkMat, 0, 0.065, 0, 0.55, 0.03, 0.55);
      put(UC, baseMat, 0, 0.4, 0, 0.16, 0.7, 0.16);
      put(UC, tableMat, 0, 0.755, 0, 1.38, 0.05, 1.38);
      put(UC, topMat, 0, 0.782, 0, 1.33, 0.006, 1.33);
    }
    // One plant per room, in a free corner (back rooms: north-east, front rooms: south-west); none in the War Room.
    if (room.war) continue;
    const back = room.z < 0,
      px = back ? room.x + room.w - 0.5 : room.x + 0.5,
      pz = back ? room.z + 0.55 : room.z + room.d - 0.55,
      s = 0.9 + wr() * 0.2;
    at(px, pz);
    put(UC, potMat, 0, 0.19, 0, 0.19, 0.38, 0.19);
    put(US, plantMat, 0, 0.68 * s, 0, 0.3 * s, 0.3 * s, 0.3 * s);
    put(US, plantMat, 0.13, 0.55 * s, 0.09, 0.21, 0.21, 0.21);
    put(US, plantMat, -0.11, 0.6 * s, -0.1, 0.23, 0.23, 0.23);
  }
  // Workstations (desk, drawers, privacy screens, monitor, keyboard, mouse, mug, lamp) and their chairs.
  const desks = SLOTS.filter((sl) => !sl.seat),
    MUG = [0x9aa7ab, 0x5c6b72, 0xc9d1d3, 0x3f5761];
  const screens = new T.InstancedMesh(
    new T.PlaneGeometry(0.64, 0.36),
    new T.MeshBasicMaterial({ map: screenTexture(), toneMapped: false }),
    desks.length,
  );
  const chair = (x: number, z: number, yaw: number) => {
    at(x, z, yaw);
    box(chairMat, 0, 0.47, 0, 0.46, 0.07, 0.44);
    box(chairMat, 0, 0.8, 0.235, 0.44, 0.44, 0.05, 0.12);
    box(darkMat, 0, 0.58, 0.245, 0.06, 0.18, 0.03, 0.12);
    for (const s of [-1, 1]) {
      box(darkMat, s * 0.25, 0.6, 0.03, 0.03, 0.18, 0.03);
      box(chairMat, s * 0.25, 0.695, 0.03, 0.05, 0.025, 0.24);
    }
    put(UC, darkMat, 0, 0.27, 0, 0.028, 0.34, 0.028);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      box(darkMat, Math.cos(a) * 0.13, 0.06, Math.sin(a) * 0.13, 0.27, 0.03, 0.04, 0, -a);
    }
  };
  desks.forEach((sl, i) => {
    const yaw = sl.facing! > 0 ? Math.PI : 0;
    at(sl.x, sl.z, yaw);
    box(bodyMat, 0, 0.735, 0, 1.4, 0.04, 0.72);
    box(topMat, 0, 0.758, 0, 1.38, 0.006, 0.7);
    box(baseMat, 0.46, 0.355, 0, 0.42, 0.71, 0.64);
    box(baseMat, -0.67, 0.355, 0, 0.04, 0.71, 0.64);
    box(baseMat, 0, 0.5, -0.3, 1.24, 0.32, 0.025);
    for (let k = 0; k < 3; k++) {
      const y = 0.13 + k * 0.205;
      box(frontMat, 0.46, y, 0.325, 0.38, 0.185, 0.014);
      box(metalMat, 0.46, y + 0.055, 0.337, 0.12, 0.014, 0.014);
    }
    box(fabricMat, 0, 0.975, -0.38, 1.48, 0.43, 0.04);
    box(trimMat, 0, 1.2, -0.38, 1.5, 0.022, 0.056);
    box(fabricMat, -0.72, 0.93, -0.02, 0.04, 0.33, 0.72);
    box(trimMat, -0.72, 1.105, -0.02, 0.056, 0.022, 0.72);
    box(darkMat, 0, 0.766, -0.2, 0.24, 0.014, 0.15);
    box(darkMat, 0, 0.87, -0.235, 0.045, 0.2, 0.04);
    box(darkMat, 0, 1.09, -0.21, 0.68, 0.4, 0.03, SCREEN_TILT);
    dummy.position.set(
      0,
      1.09 - Math.sin(SCREEN_TILT) * 0.017,
      -0.21 + Math.cos(SCREEN_TILT) * 0.017,
    );
    dummy.rotation.set(SCREEN_TILT, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    screens.setMatrixAt(i, new T.Matrix4().multiplyMatrices(frame, dummy.matrix));
    screens.setColorAt(i, color.setHex(0x16242a));
    sl.screenIndex = i;
    box(darkMat, -0.04, 0.768, 0.13, 0.44, 0.014, 0.14);
    box(keysMat, -0.04, 0.776, 0.13, 0.41, 0.004, 0.115);
    box(darkMat, 0.3, 0.77, 0.15, 0.055, 0.02, 0.09);
    put(
      UC,
      mugMat,
      0.5,
      0.807,
      -0.08 + wr() * 0.1,
      0.038,
      0.09,
      0.038,
      0,
      0,
      0,
      MUG[i % MUG.length],
    );
    if (wr() < 0.55) box(paperMat, 0.17, 0.765, -0.03, 0.2, 0.01, 0.27, 0, (wr() - 0.5) * 0.6);
    // Lamp: base, lower arm leaning toward the person, upper arm, shade pointing down (the bulb lights up on the running desk).
    put(UC, darkMat, -0.5, 0.771, -0.2, 0.065, 0.02, 0.065);
    box(metalMat, -0.5, 0.945, -0.15, 0.022, 0.37, 0.022, 0.33);
    box(metalMat, -0.5, 1.105, -0.02, 0.022, 0.17, 0.022, 1.81);
    put(CONE, darkMat, -0.5, 1.085, 0.07, 0.07, 0.08, 0.07, 0.25);
    o.lampAt.set(sl.id, { head: local(...LAMP_HEAD), pool: local(...LAMP_POOL) });
    const st = seatOf(sl);
    chair(st.x, st.z, yaw);
  });
  if (screens.instanceColor) screens.instanceColor.needsUpdate = true;
  os.add(screens);
  o.screens = screens;
  // Meeting chairs face the table.
  for (const sl of SLOTS)
    if (sl.seat) {
      const t = ROOM_BY_CODE.get(sl.room)!.table!;
      chair(sl.x, sl.z, Math.atan2(-(t.x - sl.x), -(t.z - sl.z)));
    }
  // War Room: a long crisis table with the tactical map, chairs around it, red LED strips (table edge, floor perimeter with a
  // gap at the door) and two red point lights that always stay in the scene; syncOffice/animate drive them (WAR_LOOK).
  if (war) {
    const wx = war.x + war.w / 2,
      wz = war.z + war.d / 2,
      TW = 2,
      TL = 7.5,
      look = WAR_LOOK.idle;
    const stripMat = new T.MeshBasicMaterial({
      color: 0xff3344,
      transparent: true,
      opacity: look.strip,
      depthWrite: false,
      toneMapped: false,
    });
    const mapTex = warMapTexture(),
      mapMat = new T.MeshBasicMaterial({ map: mapTex, color: look.map, toneMapped: false });
    at(wx, wz);
    box(baseMat, 0, 0.36, -TL / 2 + 1.4, 0.55, 0.7, 1.2);
    box(baseMat, 0, 0.36, TL / 2 - 1.4, 0.55, 0.7, 1.2);
    box(bodyMat, 0, 0.735, 0, TW, 0.05, TL);
    const map = new T.Mesh(new T.PlaneGeometry(TW - 0.16, TL - 0.16), mapMat);
    map.rotation.x = -Math.PI / 2;
    map.position.set(wx, 0.762, wz);
    os.add(map);
    const strip = (x: number, z: number, sx: number, sz: number, y = 0.07) => {
      const m = new T.Mesh(new T.BoxGeometry(sx, 0.04, sz), stripMat);
      m.position.set(x, y, z);
      os.add(m);
    };
    strip(wx - TW / 2, wz, 0.03, TL, 0.742);
    strip(wx + TW / 2, wz, 0.03, TL, 0.742);
    strip(wx, wz - TL / 2, TW + 0.03, 0.03, 0.742);
    strip(wx, wz + TL / 2, TW + 0.03, 0.03, 0.742);
    const xa = war.x + 0.22,
      xb = war.x + war.w - 0.22,
      za = war.z + 0.22,
      zb = war.z + war.d - 0.22;
    strip(xb, wz, 0.05, zb - za);
    strip(wx, za, xb - xa, 0.05);
    strip(wx, zb, xb - xa, 0.05);
    strip(xa, (za - 0.9) / 2, 0.05, -0.9 - za);
    strip(xa, (zb + 0.9) / 2, 0.05, zb - 0.9);
    const face = (x: number, z: number) => chair(x, z, Math.atan2(-(wx - x), -(wz - z)));
    for (const dz of [-2.7, -0.9, 0.9, 2.7]) {
      face(wx - TW / 2 - 0.5, wz + dz);
      face(wx + TW / 2 + 0.5, wz + dz);
    }
    face(wx, wz - TL / 2 - 0.55);
    face(wx, wz + TL / 2 + 0.55);
    const lights = [-4.5, 4.5].map((dz) => {
      const l = new T.PointLight(0xff2a3a, look.light, 9, 1.4);
      l.position.set(wx, 2.1, wz + dz);
      os.add(l);
      return l;
    });
    o.war = { state: 'idle', screens: warScreens, map: mapMat, mapTex, strip: stripMat, lights };
  }
  for (const { geo, m, list } of batches.values()) {
    const mesh = new T.InstancedMesh(geo, m, list.length);
    mesh.castShadow = m !== rugMat;
    mesh.receiveShadow = true;
    list.forEach(([mx, tint], i) => {
      mesh.setMatrixAt(i, mx);
      if (m === mugMat) mesh.setColorAt(i, color.setHex(tint));
    });
    os.add(mesh);
  }
  // Per-slot markers: floor ring (occupied desks, move mode) and a status LED (monitor bezel, or the table edge for a seat).
  const ledBox = new T.BoxGeometry(0.035, 0.014, 0.012),
    ledDot = new T.SphereGeometry(0.035, 10, 8);
  for (const sl of SLOTS) {
    const seat = seatOf(sl);
    const ring = new T.Mesh(
      new T.RingGeometry(0.36, 0.42, 28),
      new T.MeshBasicMaterial({
        color: 0x3b5561,
        transparent: true,
        opacity: 0.8,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(seat.x, 0.05, seat.z);
    ring.visible = false;
    os.add(ring);
    const led = new T.Mesh(
      sl.seat ? ledDot : ledBox,
      new T.MeshBasicMaterial({ color: C.green, toneMapped: false }),
    );
    led.visible = false;
    if (sl.seat) {
      const t = ROOM_BY_CODE.get(sl.room)!.table!,
        k = 1.2 / 2.1;
      led.position.set(t.x + (sl.x - t.x) * k, 0.8, t.z + (sl.z - t.z) * k);
    } else {
      at(sl.x, sl.z, sl.facing! > 0 ? Math.PI : 0);
      led.position.copy(local(0.28, 0.905, -0.19));
      led.rotation.y = sl.facing! > 0 ? Math.PI : 0;
    }
    os.add(led);
    o.slotMarks.set(sl.id, { ring, led, slot: sl });
  }
  // The running desk's lamp: bulb, a camera-facing glow, a warm pool on the desk and one point light (always in the scene, so
  // switching it on never recompiles the materials).
  const glow = glowTexture();
  o.lamp = {
    bulb: new T.Mesh(
      new T.SphereGeometry(0.03, 12, 8),
      new T.MeshBasicMaterial({ color: 0xfff3dc, toneMapped: false }),
    ),
    glow: new T.Mesh(
      new T.PlaneGeometry(1.25, 1.25),
      new T.MeshBasicMaterial({
        map: glow,
        color: 0xffc98a,
        transparent: true,
        opacity: 0.55,
        blending: T.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
    pool: new T.Mesh(
      new T.CircleGeometry(0.62, 32),
      new T.MeshBasicMaterial({
        map: glow,
        color: 0xffc98a,
        transparent: true,
        opacity: 0.4,
        blending: T.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    ),
    light: new T.PointLight(0xffd29a, 0, 3.4, 2),
  };
  o.lamp.pool.rotation.x = -Math.PI / 2;
  for (const k of ['bulb', 'glow', 'pool'] as const) {
    o.lamp[k].visible = false;
    os.add(o.lamp[k]);
  }
  os.add(o.lamp.light);
  // Hover and selection rings, plus the activity arcs.
  o.hover = new T.Mesh(
    new T.CircleGeometry(0.5, 32),
    new T.MeshBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0.22,
      blending: T.AdditiveBlending,
      depthWrite: false,
    }),
  );
  o.hover.rotation.x = -Math.PI / 2;
  o.hover.visible = false;
  os.add(o.hover);
  o.sel = new T.Mesh(
    new T.RingGeometry(0.5, 0.58, 36),
    new T.MeshBasicMaterial({
      color: C.cyan,
      transparent: true,
      opacity: 0.9,
      side: T.DoubleSide,
      blending: T.AdditiveBlending,
      depthWrite: false,
    }),
  );
  o.sel.rotation.x = -Math.PI / 2;
  o.sel.visible = false;
  os.add(o.sel);
  os.add(o.links);
  o.life = new T.Group();
  o.lifePackets = [];
  os.add(o.life); // office life arcs (meetings, visits)
  return o;
}
