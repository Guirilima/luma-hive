import * as T from 'three';
import { Agent } from '@domain/models';
import { MapFrame } from './map-renderer';
type Hex = { q: number; r: number };
type Point = { x: number; z: number };
type Kind = 'box' | 'prism' | 'round' | 'spire' | 'tree' | 'pine';
interface Building {
  key: string;
  kind: Kind;
  x: number;
  z: number;
  rot: number;
  w: number;
  d: number;
  h0: number;
  h: number;
  tone: number;
  mesh?: T.InstancedMesh;
  index?: number;
  base?: number;
  group?: Block;
}
interface Block {
  k: number;
  rise: number;
  wave: number;
  items: Building[];
}
const GRID = 10,
  TILE_H = 0.14,
  PLAZA_H = 0.34,
  PLANET_R = 8,
  PLANET_H = 0.65,
  PLANET_Y0 = 0.39;
const CITY = { water: 0x07090a, wall: 0x131619, tree: 0x222a25, build: 0x2d3135 };
const C = { cyan: 0x30c5e8, purple: 0xad85dd };
function rng(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
const hexToWorld = (q: number, r: number) => ({ x: Math.sqrt(3) * (q + r / 2), z: 1.5 * r });
const hexDistance = (q: number, r: number) => (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
const inGrid = (h: Hex) => hexDistance(h.q, h.r) <= GRID;
const hexKey = (h: Hex) => h.q + ',' + h.r;
const HEXES: Hex[] = [];
for (let q = -GRID; q <= GRID; q++)
  for (let r = -GRID; r <= GRID; r++) if (inGrid({ q, r })) HEXES.push({ q, r });
export function buildCity(renderer: T.WebGLRenderer) {
  const s = new T.Group();
  const invalidate = () => {};
  const markDirty = () => {};
  const PLANET_U = {
    uPlanetR: { value: PLANET_R },
    uPlanetB: { value: 0 },
    uPlanetH: { value: PLANET_H },
    uPlanetY0: { value: PLANET_Y0 },
  };
  const PLANET_GLSL = `
uniform float uPlanetR; uniform float uPlanetB; uniform float uPlanetH; uniform float uPlanetY0;
vec3 pl_map(vec3 pl_w) {
  if (uPlanetB < 0.0005) return pl_w;
  float pl_Rb = uPlanetR / uPlanetB, pl_rho = max(length(pl_w.xz), 1e-6), pl_th = pl_rho / pl_Rb, pl_s = sin(pl_th * 0.5);
  float pl_h = min(pl_w.y, uPlanetY0) + max(pl_w.y - uPlanetY0, 0.0) * mix(1.0, uPlanetH, uPlanetB);
  vec2 pl_d = pl_w.xz * (sin(pl_th) * (pl_Rb + pl_h) / pl_rho);
  return vec3(pl_d.x, pl_h * cos(pl_th) - 2.0 * pl_Rb * pl_s * pl_s, pl_d.y);
}
vec3 pl_bend(vec3 pl_v, vec3 pl_w) {
  if (uPlanetB < 0.0005) return pl_v;
  float pl_rho = max(length(pl_w.xz), 1e-6), pl_th = pl_rho * uPlanetB / uPlanetR, pl_c = cos(pl_th);
  vec3 pl_k = vec3(pl_w.z, 0.0, -pl_w.x) / pl_rho;
  return pl_v * pl_c + cross(pl_k, pl_v) * sin(pl_th) + pl_k * dot(pl_k, pl_v) * (1.0 - pl_c);
}
`;
  const PLANET_PROJECT = `
vec4 pl_wp = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
  pl_wp = instanceMatrix * pl_wp;
#endif
pl_wp = modelMatrix * pl_wp;
pl_wp.xyz = pl_map(pl_wp.xyz);
vec4 mvPosition = viewMatrix * pl_wp;
gl_Position = projectionMatrix * mvPosition;
`;
  const PLANET_NORMAL = `#include <defaultnormal_vertex>
{
  vec4 pl_np = vec4(position, 1.0);
  #ifdef USE_INSTANCING
    pl_np = instanceMatrix * pl_np;
  #endif
  pl_np = modelMatrix * pl_np;
  mat3 pl_vr = mat3(viewMatrix);
  transformedNormal = pl_vr * pl_bend(transpose(pl_vr) * transformedNormal, pl_np.xyz);
}
`;
  function bendMaterial(m: T.Material) {
    if (m.userData.planet) return;
    m.userData.planet = true;
    const own = m.onBeforeCompile,
      key = m.userData.shaderKey || '';
    m.onBeforeCompile = (shader, r) => {
      own.call(m, shader, r);
      Object.assign(shader.uniforms, PLANET_U);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + PLANET_GLSL)
        .replace('#include <project_vertex>', PLANET_PROJECT)
        .replace('#include <defaultnormal_vertex>', PLANET_NORMAL);
    };
    m.customProgramCacheKey = () => 'planet' + key;
    m.needsUpdate = true;
  }
  // Shadow casters render their depth through the bent material too, so the shadows follow the planet.
  const depthMat = new T.MeshDepthMaterial();
  bendMaterial(depthMat);
  const castShadows = <M extends T.Mesh>(mesh: M) => {
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.customDepthMaterial = depthMat;
    return mesh;
  };
  // Bounding volumes stay flat, so bent objects are never frustum-culled.
  function bendTree() {
    s.traverse((o) => {
      const mesh = o as T.Mesh;
      if (!mesh.material) return;
      for (let p: T.Object3D | null = o; p; p = p.parent) if (p.userData.noBend) return;
      o.frustumCulled = false;
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(bendMaterial);
    });
  }

  // Black water around the island (flat shape only; on the planet the core sphere replaces it): low roughness, so the key
  // light leaves a faint sheen.
  const water = new T.Mesh(
    new T.PlaneGeometry(260, 260),
    new T.MeshStandardMaterial({ color: CITY.water, roughness: 0.42, metalness: 0.2 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.04;
  water.receiveShadow = true;
  s.add(water);

  // Planet scenery (never bent): a core sphere that replaces the ground and curls into the planet body, a starfield around the
  // camera, a halo billboard for the cyan atmosphere and the decorative core at the south pole (rings, spire, beacon light).
  const planetFx = new T.Group();
  planetFx.userData.noBend = planetFx.userData.noAO = true;
  planetFx.visible = false;
  s.add(planetFx);
  const coreMat = new T.MeshStandardMaterial({
    color: 0x080a0b,
    roughness: 1,
    metalness: 0,
    emissive: 0x1a1f22,
    emissiveIntensity: 0,
  });
  const planetCore = new T.Mesh(new T.SphereGeometry(1, 96, 64), coreMat);
  planetFx.add(planetCore);
  const starLayer = (
    count: number,
    radius: number,
    size: number,
    colorHex: number,
    seed: number,
  ) => {
    const pos = [],
      sr = rng(seed);
    for (let i = 0; i < count; i++) {
      const u = sr() * 2 - 1,
        a = sr() * Math.PI * 2,
        r = Math.sqrt(1 - u * u);
      pos.push(Math.cos(a) * r * radius, u * radius, Math.sin(a) * r * radius);
    }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    const pts = new T.Points(
      g,
      new T.PointsMaterial({
        color: colorHex,
        size,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0,
        fog: false,
        depthWrite: false,
      }),
    );
    planetFx.add(pts);
    return pts;
  };
  const stars = [
    starLayer(1300, 180, 1.4, 0xbfdde6, 4471),
    starLayer(160, 175, 2.6, 0xe8fbff, 9123),
  ];
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = haloCanvas.height = 256;
  {
    const g = haloCanvas.getContext('2d')!,
      grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    [
      [0, 0],
      [0.52, 0],
      [0.66, 0.22],
      [0.74, 0.55],
      [0.775, 0.75],
      [0.83, 0.32],
      [0.92, 0.08],
      [1, 0],
    ].forEach(([at, a]) => grd.addColorStop(at, `rgba(196,212,220,${a * 0.8})`));
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 256);
  }
  const HALO_PEAK = 0.775,
    haloMat = new T.MeshBasicMaterial({
      map: new T.CanvasTexture(haloCanvas),
      transparent: true,
      opacity: 0,
      blending: T.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
  const halo = new T.Mesh(new T.PlaneGeometry(1, 1), haloMat);
  halo.renderOrder = 10;
  planetFx.add(halo);
  const beacon = new T.Group();
  planetFx.add(beacon);
  const glowMat = (c: number, o: number) =>
    new T.MeshBasicMaterial({
      color: c,
      transparent: true,
      opacity: o,
      blending: T.AdditiveBlending,
      depthWrite: false,
      fog: false,
    });
  // Rings hug the sphere around the south pole (their y follows the surface at their radius).
  const poleRing = (radius: number, tube: number, c: number, o: number) => {
    const m = new T.Mesh(new T.TorusGeometry(radius, tube, 8, 128), glowMat(c, o));
    m.rotation.x = Math.PI / 2;
    m.position.y = PLANET_R - Math.sqrt(PLANET_R * PLANET_R - radius * radius) - 0.14;
    m.userData.o = o;
    beacon.add(m);
    return m;
  };
  const poleRings = [
    poleRing(1.5, 0.05, C.cyan, 0.95),
    poleRing(2.6, 0.03, 0x7fe3f6, 0.55),
    poleRing(3.6, 0.02, C.cyan, 0.3),
  ];
  const spire = new T.Mesh(
    new T.CylinderGeometry(0.035, 0.17, 2.8, 8),
    new T.MeshStandardMaterial({
      color: 0x2b3d46,
      emissive: 0x0e3a47,
      emissiveIntensity: 0.9,
      roughness: 0.5,
      metalness: 0.6,
    }),
  );
  spire.position.y = -1.3;
  beacon.add(spire);
  const orb = new T.Mesh(new T.SphereGeometry(0.22, 16, 12), glowMat(0xbff6ff, 1));
  orb.position.y = -2.8;
  orb.userData.o = 1;
  beacon.add(orb);
  const beaconLight = new T.PointLight(C.cyan, 0, 14, 1.4);
  beaconLight.position.y = -2.3;
  beacon.add(beaconLight);
  let beaconK = 0;
  function setPlanet(b: number) {
    PLANET_U.uPlanetB.value = b;
    markDirty();
    const on = b >= 5e-4,
      Rb = on ? PLANET_R / b : PLANET_R;
    water.visible = seawall.visible = !on;
    planetFx.visible = on;
    if (on) {
      planetCore.position.set(0, -Rb, 0);
      planetCore.scale.setScalar(Rb - 0.02);
      coreMat.emissiveIntensity = 0.5 * b;
      stars[0].material.opacity = 0.75 * Math.min(1, b * 1.3);
      stars[1].material.opacity = Math.min(1, b * 1.3);
      haloMat.opacity = Math.max(0, (b - 0.55) / 0.45);
      halo.position.set(0, -Rb, 0);
      halo.scale.setScalar((2 * (Rb + 2.4)) / HALO_PEAK); // glow beyond the tallest buildings, which stand out against it
      beaconK = Math.max(0, (b - 0.9) / 0.1);
      beacon.visible = beaconK > 0;
      beacon.position.set(0, -2 * Rb, 0);
      for (const m of [...poleRings, orb]) m.material.opacity = m.userData.o * beaconK;
    }
    invalidate();
  }

  const random = rng(26172),
    dummy = new T.Object3D(),
    color = new T.Color();
  // seg > 1 subdivides each side, so big rings (radar sweep, pulses) follow the planet instead of cutting through it.
  const hexRing = (radius: number, y: number, seg = 1) => {
    const pts = [];
    for (let k = 0; k < 6; k++) {
      const a = Math.PI / 6 + (k * Math.PI) / 3,
        a2 = a + Math.PI / 3;
      for (let j = 0; j < seg; j++) {
        const u = j / seg;
        pts.push(
          new T.Vector3(
            (Math.cos(a) * (1 - u) + Math.cos(a2) * u) * radius,
            y,
            (Math.sin(a) * (1 - u) + Math.sin(a2) * u) * radius,
          ),
        );
      }
    }
    return pts;
  };
  // Corner k of a hex (pointy-top, radius 1) and the neighbour across the edge between corners k and k + 1.
  const CORNERS = [0, 1, 2, 3, 4, 5].map((k) => ({
    x: Math.cos(Math.PI / 6 + (k * Math.PI) / 3),
    z: Math.sin(Math.PI / 6 + (k * Math.PI) / 3),
  }));
  const EDGE_N = [
    [0, 1],
    [-1, 1],
    [-1, 0],
    [0, -1],
    [1, -1],
    [1, 0],
  ];
  // Districts: seeded value noise over the map decides where the downtown towers rise.
  const noise = (() => {
    const nr = rng(5501),
      N = 32,
      v = Array.from({ length: N * N }, () => nr()),
      at = (i: number, j: number) => v[(((i % N) + N) % N) * N + (((j % N) + N) % N)],
      sm = (t: number) => t * t * (3 - 2 * t);
    return (x: number, z: number) => {
      const i = Math.floor(x),
        j = Math.floor(z),
        fx = sm(x - i),
        fz = sm(z - j),
        a = at(i, j),
        b = at(i + 1, j),
        c = at(i, j + 1),
        d = at(i + 1, j + 1);
      return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
    };
  })();
  const district = (x: number, z: number) =>
    0.62 * noise(x * 0.15 + 3.1, z * 0.15 + 7.4) + 0.38 * noise(x * 0.36 + 11.2, z * 0.36 + 1.9);
  const parks = new Set(
    HEXES.filter((h) => {
      const d = hexDistance(h.q, h.r);
      return d >= 3 && d <= GRID - 1 && random() < 0.09;
    }).map(hexKey),
  );

  // Street map, drawn once in 2D over the square [-EXT, EXT]² of the flat world (UV from world xz).
  const EXT = 20,
    BLOCK = 0.86;
  function cityMap() {
    const S =
        renderer.capabilities.maxTextureSize >= 4096 && !matchMedia('(max-width: 900px)').matches
          ? 4096
          : 2048,
      ppu = S / (2 * EXT);
    const cv = document.createElement('canvas');
    cv.width = cv.height = S;
    const g = cv.getContext('2d')!;
    const X = (x: number) => (x + EXT) * ppu,
      Z = (z: number) => (z + EXT) * ppu,
      px = (u: number) => Math.max(1, u * ppu);
    const path = (pts: Point[]) => {
      g.beginPath();
      pts.forEach((p, i) => (i ? g.lineTo(X(p.x), Z(p.z)) : g.moveTo(X(p.x), Z(p.z))));
      g.closePath();
    };
    const at = (w: Point, c: Point, k: number) => ({ x: w.x + c.x * k, z: w.z + c.z * k });
    g.fillStyle = '#0c0e10';
    g.fillRect(0, 0, S, S);
    // Fine asphalt grain (a small noise tile repeated over the whole map).
    const nz = document.createElement('canvas');
    nz.width = nz.height = 128;
    const ng = nz.getContext('2d')!,
      img = ng.createImageData(128, 128),
      nr = rng(771);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (110 + nr() * 145) | 0;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = (nr() * 16) | 0;
    }
    ng.putImageData(img, 0, 0);
    g.fillStyle = g.createPattern(nz, 'repeat')!;
    g.fillRect(0, 0, S, S);
    for (const h of HEXES) {
      const w = hexToWorld(h.q, h.r),
        d = hexDistance(h.q, h.r),
        park = parks.has(hexKey(h)),
        block = CORNERS.map((c) => at(w, c, BLOCK));
      // Sidewalk of the block, with its kerb as the thin light line of the reference.
      path(block);
      g.fillStyle = park ? '#111712' : d <= 1 ? '#1a1d20' : '#15181a';
      g.fill();
      g.strokeStyle = 'rgba(196,205,209,.86)';
      g.lineWidth = px(0.017);
      g.stroke();
      if (park) {
        // Lawn with curved paths and a small pond.
        g.strokeStyle = 'rgba(170,184,176,.42)';
        g.lineWidth = px(0.011);
        g.beginPath();
        g.arc(X(w.x), Z(w.z), 0.46 * ppu, 0, Math.PI * 2);
        g.stroke();
        const p0 = at(w, CORNERS[3], 0.8),
          p1 = at(w, CORNERS[0], 0.8),
          c0 = at(w, CORNERS[1], 0.55),
          c1 = at(w, CORNERS[4], 0.55);
        g.beginPath();
        g.moveTo(X(p0.x), Z(p0.z));
        g.bezierCurveTo(X(c0.x), Z(c0.z), X(c1.x), Z(c1.z), X(p1.x), Z(p1.z));
        g.stroke();
        const po = at(w, CORNERS[5], 0.38);
        g.beginPath();
        g.ellipse(X(po.x), Z(po.z), 0.16 * ppu, 0.1 * ppu, 0.6, 0, Math.PI * 2);
        g.fillStyle = '#080a0b';
        g.fill();
        g.stroke();
        continue;
      }
      if (d <= 1) continue;
      // Three rhombus blocks per hex (centre + corners k, k+1, k+2), split by narrow streets, each outlined.
      g.strokeStyle = '#0c0e10';
      g.lineWidth = px(0.075);
      g.beginPath();
      for (const k of [0, 2, 4]) {
        const c = at(w, CORNERS[k], BLOCK);
        g.moveTo(X(w.x), Z(w.z));
        g.lineTo(X(c.x), Z(c.z));
      }
      g.stroke();
      for (const k of [0, 2, 4]) {
        const pts = [
          { x: w.x, z: w.z },
          at(w, CORNERS[k], BLOCK),
          at(w, CORNERS[(k + 1) % 6], BLOCK),
          at(w, CORNERS[(k + 2) % 6], BLOCK),
        ];
        const cx = (pts[0].x + pts[2].x) / 2,
          cz = (pts[0].z + pts[2].z) / 2;
        path(pts.map((p) => ({ x: cx + (p.x - cx) * 0.86, z: cz + (p.z - cz) * 0.86 })));
        g.fillStyle = '#17191c';
        g.fill();
        g.strokeStyle = 'rgba(176,186,191,.5)';
        g.lineWidth = px(0.011);
        g.stroke();
      }
    }
    // Lane marks in the middle of the avenues (each border once) and the coastline where the grid ends.
    g.setLineDash([px(0.06), px(0.09)]);
    g.strokeStyle = 'rgba(140,148,153,.42)';
    g.lineWidth = px(0.009);
    for (const h of HEXES) {
      const w = hexToWorld(h.q, h.r);
      for (let k = 0; k < 6; k++) {
        const n = { q: h.q + EDGE_N[k][0], r: h.r + EDGE_N[k][1] };
        if (!inGrid(n) || hexKey(n) < hexKey(h)) continue;
        const a = at(w, CORNERS[k], 1),
          b = at(w, CORNERS[(k + 1) % 6], 1);
        g.beginPath();
        g.moveTo(X(a.x), Z(a.z));
        g.lineTo(X(b.x), Z(b.z));
        g.stroke();
      }
    }
    g.setLineDash([]);
    for (const h of HEXES) {
      const w = hexToWorld(h.q, h.r);
      for (let k = 0; k < 6; k++) {
        if (inGrid({ q: h.q + EDGE_N[k][0], r: h.r + EDGE_N[k][1] })) continue;
        const a = at(w, CORNERS[k], 1),
          b = at(w, CORNERS[(k + 1) % 6], 1),
          a2 = at(w, CORNERS[k], 0.95),
          b2 = at(w, CORNERS[(k + 1) % 6], 0.95);
        g.strokeStyle = 'rgba(214,221,224,.9)';
        g.lineWidth = px(0.02);
        g.beginPath();
        g.moveTo(X(a.x), Z(a.z));
        g.lineTo(X(b.x), Z(b.z));
        g.stroke();
        g.strokeStyle = 'rgba(160,170,175,.35)';
        g.lineWidth = px(0.008);
        g.beginPath();
        g.moveTo(X(a2.x), Z(a2.z));
        g.lineTo(X(b2.x), Z(b2.z));
        g.stroke();
      }
    }
    // Anisotropy 4: the map is seen at grazing angles, and 16x is costly on integrated GPUs for little visible gain.
    const tex = new T.CanvasTexture(cv);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return tex;
  }
  // Ground: every hex as 6 triangles, each split in 4 (short edges, so the planet bend follows the surface).
  const groundPos: number[] = [],
    groundUV: number[] = [],
    groundN: number[] = [];
  const uv = (p: Point) => [(p.x + EXT) / (2 * EXT), 1 - (p.z + EXT) / (2 * EXT)],
    mid = (p: Point, q: Point) => ({ x: (p.x + q.x) / 2, z: (p.z + q.z) / 2 });
  for (const h of HEXES) {
    const w = hexToWorld(h.q, h.r);
    for (let k = 0; k < 6; k++) {
      const P = [
        { x: w.x, z: w.z },
        { x: w.x + CORNERS[k].x, z: w.z + CORNERS[k].z },
        { x: w.x + CORNERS[(k + 1) % 6].x, z: w.z + CORNERS[(k + 1) % 6].z },
      ];
      const m01 = mid(P[0], P[1]),
        m12 = mid(P[1], P[2]),
        m20 = mid(P[2], P[0]);
      for (const [a, b, c] of [
        [P[0], m01, m20],
        [m01, P[1], m12],
        [m20, m12, P[2]],
        [m01, m12, m20],
      ])
        for (const v of [a, c, b]) {
          groundPos.push(v.x, TILE_H, v.z);
          groundUV.push(...uv(v));
          groundN.push(0, 1, 0);
        }
    }
  }
  const groundGeo = new T.BufferGeometry();
  groundGeo.setAttribute('position', new T.Float32BufferAttribute(groundPos, 3));
  groundGeo.setAttribute('uv', new T.Float32BufferAttribute(groundUV, 2));
  groundGeo.setAttribute('normal', new T.Float32BufferAttribute(groundN, 3));
  const cityGround = new T.Mesh(
    groundGeo,
    new T.MeshStandardMaterial({ map: cityMap(), roughness: 0.9, metalness: 0 }),
  );
  cityGround.receiveShadow = true;
  s.add(cityGround);
  // Seawall: the island's edge drops into the water (flat shape only, like the water).
  const wallPos: number[] = [];
  for (const h of HEXES) {
    const w = hexToWorld(h.q, h.r);
    for (let k = 0; k < 6; k++) {
      if (inGrid({ q: h.q + EDGE_N[k][0], r: h.r + EDGE_N[k][1] })) continue;
      const a = { x: w.x + CORNERS[k].x, z: w.z + CORNERS[k].z },
        b = { x: w.x + CORNERS[(k + 1) % 6].x, z: w.z + CORNERS[(k + 1) % 6].z };
      wallPos.push(
        a.x,
        TILE_H,
        a.z,
        b.x,
        TILE_H,
        b.z,
        b.x,
        -0.08,
        b.z,
        a.x,
        TILE_H,
        a.z,
        b.x,
        -0.08,
        b.z,
        a.x,
        -0.08,
        a.z,
      );
    }
  }
  const wallGeo = new T.BufferGeometry();
  wallGeo.setAttribute('position', new T.Float32BufferAttribute(wallPos, 3));
  wallGeo.computeVertexNormals();
  const seawall = new T.Mesh(
    wallGeo,
    new T.MeshStandardMaterial({ color: CITY.wall, roughness: 0.85, side: T.DoubleSide }),
  );
  s.add(seawall);

  // Buildings: charcoal, matte, with a procedural facade (floor lines, mullions, darker at the foot, lighter roofs) computed
  // from the world position in the shader, so it never stretches with the instance scale and needs no texture.
  const buildMat = new T.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.84,
    metalness: 0.06,
  });
  buildMat.userData.shaderKey = 'facade';
  buildMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vFcPos; varying vec3 vFcN; varying float vFcT;',
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
vFcT = position.y + 0.5;
{
  vec4 fc_p = vec4(transformed, 1.0); vec3 fc_n = objectNormal;
  #ifdef USE_INSTANCING
    fc_p = instanceMatrix * fc_p; fc_n = mat3(instanceMatrix) * fc_n;
  #endif
  vFcPos = (modelMatrix * fc_p).xyz; vFcN = normalize(mat3(modelMatrix) * fc_n);
}`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vFcPos; varying vec3 vFcN; varying float vFcT;',
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
{
  float fc_far = 1.0 - smoothstep(28.0, 70.0, length(vViewPosition));
  if (vFcN.y > 0.55) diffuseColor.rgb *= 1.5;
  else if (vFcN.y > -0.55) {
    vec2 fc_c = vec2((abs(vFcN.x) > abs(vFcN.z) ? vFcPos.z : vFcPos.x) / 0.105, (vFcPos.y - ${TILE_H.toFixed(3)}) / 0.125);
    vec2 fc_f = fract(fc_c), fc_w = fwidth(fc_c) * 1.5;
    float fc_floor = smoothstep(0.0, fc_w.y + 0.1, fc_f.y) * smoothstep(1.0, 0.8 - fc_w.y, fc_f.y);
    float fc_mul = smoothstep(0.0, fc_w.x + 0.05, fc_f.x) * smoothstep(1.0, 0.94 - fc_w.x, fc_f.x);
    diffuseColor.rgb *= mix(1.0, mix(0.58, 1.0, fc_floor) * mix(0.8, 1.0, fc_mul), fc_far * 0.92);
    // Darker at the foot of each volume, a little lighter high up, and a lit cornice at its top edge.
    diffuseColor.rgb *= mix(0.62, 1.0, smoothstep(0.0, 0.35, vFcT)) * (1.0 + 0.2 * smoothstep(1.2, 5.5, vFcPos.y)) * (1.0 + 0.55 * smoothstep(0.955, 0.995, vFcT));
  }
}`,
      );
  };
  const treeMat = new T.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0 });
  const GEO = {
    box: new T.BoxGeometry(1, 1, 1),
    prism: new T.CylinderGeometry(0.5, 0.5, 1, 6),
    round: new T.CylinderGeometry(0.5, 0.5, 1, 16),
    spire: new T.CylinderGeometry(0.22, 0.5, 1, 6),
    tree: new T.SphereGeometry(0.5, 8, 6),
    pine: new T.CylinderGeometry(0, 0.5, 1, 7),
  };
  // Parts: { key, kind, x, z, rot, w, d, h0 (base above the ground), h, tone }. A tall building stacks base + setbacks + spire.
  const specs: Building[] = [];
  const part = (
    key: string,
    kind: Kind,
    x: number,
    z: number,
    rot: number,
    w: number,
    d: number,
    h0: number,
    h: number,
    tone: number,
  ) => specs.push({ key, kind, x, z, rot, w, d, h0, h, tone });
  HEXES.forEach((h) => {
    const d = hexDistance(h.q, h.r),
      key = hexKey(h),
      w = hexToWorld(h.q, h.r);
    if (d <= 1) return;
    if (parks.has(key)) {
      for (let i = 0, n = 6 + Math.floor(random() * 5); i < n; i++) {
        const a = random() * Math.PI * 2,
          r = Math.sqrt(random()) * 0.78,
          s2 = 0.1 + random() * 0.1,
          pine = random() < 0.3;
        part(
          key,
          pine ? 'pine' : 'tree',
          w.x + Math.cos(a) * r,
          w.z + Math.sin(a) * r,
          0,
          s2,
          s2,
          pine ? 0 : 0.02,
          pine ? s2 * 2.2 : s2 * 1.1,
          0.8 + random() * 0.4,
        );
      }
      return;
    }
    // Low near the squad (first rings) and along the coast; downtown towers where the district noise peaks. Kept light: about
    // four blocks in ten are open lots, most blocks hold a single building, and only the tallest get setbacks.
    const ring = Math.min(1, Math.max(0, (d - 2) / 4)),
      coast = 1 - Math.max(0, d - (GRID - 1.5)) * 0.3;
    for (const k of [0, 2, 4]) {
      if (d >= 3 && random() < 0.4) continue;
      const A = { x: CORNERS[k].x * BLOCK, z: CORNERS[k].z * BLOCK },
        B = { x: CORNERS[(k + 2) % 6].x * BLOCK, z: CORNERS[(k + 2) % 6].z * BLOCK };
      const rot = -Math.atan2(A.z, A.x),
        merged = random() < 0.72 || d < 3,
        n = merged ? 1 : 2,
        m = 1;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < m; j++) {
          const sc = (i + 0.5) / n,
            tc = (j + 0.5) / m,
            x = w.x + A.x * sc + B.x * tc,
            z = w.z + A.z * sc + B.z * tc,
            dn = district(x, z);
          let H =
            (0.2 + 4.1 * Math.pow(dn, 1.9)) * (0.45 + random() * 0.85) * (0.2 + 0.8 * ring) * coast;
          // Whatever the camera angle, nothing tall stands between it and the squad: towers only on the outer rings (skyline).
          if (d >= 6 && dn > 0.48 && random() < 0.28) H *= 1.5 + random() * 0.9;
          H = Math.min(d <= 3 ? 0.7 : d <= 4 ? 1.4 : d <= 5 ? 2.3 : 7.4, Math.max(0.12, H));
          const bw = (BLOCK / n) * (0.56 + random() * 0.16),
            bd = ((BLOCK * 0.866) / m) * (0.58 + random() * 0.16),
            tone = 0.74 + random() * 0.42,
            r0 = random();
          const kind = r0 < 0.09 ? 'prism' : r0 < 0.17 && bw < 0.4 ? 'round' : 'box';
          if (kind === 'box' && H > 2.6 && random() < 0.6) {
            // Setbacks: base + tower (+ a crown on the tallest) and sometimes a spire.
            const a1 = 0.55 + random() * 0.12,
              a2 = H > 3.8 ? 0.86 : 1;
            part(key, 'box', x, z, rot, bw, bd, 0, H * a1, tone);
            part(key, 'box', x, z, rot, bw * 0.68, bd * 0.68, H * a1, H * (a2 - a1), tone * 1.04);
            if (a2 < 1)
              part(key, 'box', x, z, rot, bw * 0.44, bd * 0.44, H * a2, H * (1 - a2), tone * 1.08);
            if (H > 4 && random() < 0.35)
              part(key, 'spire', x, z, 0, 0.045, 0.045, H, 0.3 + random() * 0.7, 1.2);
          } else {
            part(key, kind, x, z, rot, bw, bd, 0, H, tone);
            // Roof machinery on some low and mid-rise roofs.
            if (kind === 'box' && random() < 0.12) {
              const ox = (random() - 0.5) * bw * 0.5,
                oz = (random() - 0.5) * bd * 0.5,
                c = Math.cos(rot),
                s1 = Math.sin(rot);
              part(
                key,
                'box',
                x + ox * c + oz * s1,
                z - ox * s1 + oz * c,
                rot,
                bw * (0.2 + random() * 0.18),
                bd * (0.2 + random() * 0.18),
                H,
                0.035 + random() * 0.07,
                tone * 1.1,
              );
            }
          }
        }
    }
  });
  const byHex = new Map<string, Block>(),
    meshes: Partial<Record<Kind, T.InstancedMesh>> = {};
  for (const kind of Object.keys(GEO) as Kind[]) {
    const list = specs.filter((b) => b.kind === kind);
    if (!list.length) continue;
    const mesh = castShadows(
      new T.InstancedMesh(
        GEO[kind],
        kind === 'tree' || kind === 'pine' ? treeMat : buildMat,
        list.length,
      ),
    );
    meshes[kind] = mesh;
    list.forEach((b, i) => {
      b.mesh = mesh;
      b.index = i;
      b.base = kind === 'tree' || kind === 'pine' ? CITY.tree : CITY.build;
      mesh.setColorAt(i, color.setHex(b.base).multiplyScalar(b.tone));
    });
  }
  const meshList = Object.values(meshes);
  specs.forEach((b) => {
    // `rise` is the transmorph wave (0..1), independent from `k` (hex free or occupied); `wave` orders it from the centre out.
    if (!byHex.has(b.key)) {
      const [q, r] = b.key.split(',').map(Number);
      byHex.set(b.key, {
        k: 1,
        rise: 1,
        wave: (hexDistance(q, r) / GRID) * 0.88 + random() * 0.12,
        items: [],
      });
    }
    b.group = byHex.get(b.key)!;
    b.group!.items.push(b);
  });
  const flushBuildings = (colors = false) => {
    for (const m of meshList) {
      m!.instanceMatrix.needsUpdate = true;
      if (colors) m!.instanceColor!.needsUpdate = true;
    }
    markDirty();
  };
  function writeBuilding(b: Building, k: number) {
    const kk = k * b.group!.rise,
      hh = Math.max(0.0001, b.h * kk);
    dummy.position.set(b.x, TILE_H + b.h0 * kk + hh / 2, b.z);
    dummy.rotation.set(0, b.rot, 0);
    dummy.scale.set(b.w, hh, b.d);
    dummy.updateMatrix();
    b.mesh!.setMatrixAt(b.index!, dummy.matrix);
  }
  specs.forEach((b) => writeBuilding(b, 1));
  meshList.forEach((m) => s.add(m!));

  const plazas = new Map<
    string,
    { group: T.Group; rim: T.LineLoop<T.BufferGeometry, T.LineBasicMaterial> }
  >();
  const sel = new T.Mesh(
    new T.RingGeometry(1.02, 1.1, 6, 1, Math.PI / 6),
    new T.MeshBasicMaterial({
      color: new T.Color(0x29c8ff).multiplyScalar(2),
      transparent: true,
      opacity: 0.8,
      side: T.DoubleSide,
      blending: T.AdditiveBlending,
      depthWrite: false,
    }),
  );
  sel.rotation.x = -Math.PI / 2;
  s.add(sel);
  const sweep = new T.LineLoop(
    new T.BufferGeometry().setFromPoints(hexRing(1, 0.2, 16)),
    new T.LineBasicMaterial({ color: C.cyan, transparent: true, opacity: 0 }),
  );
  s.add(sweep);
  let frame: MapFrame | null = null,
    blend = 0,
    target = 0,
    lastTime = 0,
    shapeAt = 0,
    shapeFrom = 0;
  function sync(next: MapFrame) {
    frame = next;
    const nextShape = next.cityShape === 'planet' ? 1 : 0;
    if (nextShape !== target) {
      shapeFrom = blend;
      shapeAt = performance.now();
    }
    target = nextShape;
    if (!next.motion) blend = target;
    const busy = new Set(next.agents.map((a) => hexKey(a.hex)));
    for (const [key, block] of byHex) {
      block.k = busy.has(key) ? 0 : 1;
      for (const b of block.items) writeBuilding(b, block.k);
    }
    flushBuildings();
    for (const [id, p] of plazas)
      if (!next.agents.some((a) => a.id === id)) {
        s.remove(p.group);
        p.group.traverse((o) => {
          const mesh = o as T.Mesh;
          mesh.geometry?.dispose();
          if (mesh.material && !Array.isArray(mesh.material)) mesh.material.dispose();
        });
        plazas.delete(id);
      }
    for (const a of next.agents) {
      let p = plazas.get(a.id);
      if (!p) {
        const group = new T.Group(),
          body = castShadows(
            new T.Mesh(
              new T.CylinderGeometry(0.9, 0.93, 0.2, 6),
              new T.MeshStandardMaterial({
                color: 0x063a58,
                roughness: 0.42,
                metalness: 0.25,
                emissive: 0x0a86e0,
                emissiveIntensity: 0.85,
              }),
            ),
          );
        body.position.y = 0.24;
        group.add(body);
        const rim = new T.LineLoop(
          new T.BufferGeometry().setFromPoints(hexRing(0.9, 0.344)),
          new T.LineBasicMaterial({ color: new T.Color(0x29c8ff).multiplyScalar(2.6) }),
        );
        group.add(rim);
        const glow = new T.LineLoop(
          new T.BufferGeometry().setFromPoints(hexRing(1.02, 0.15)),
          new T.LineBasicMaterial({
            color: new T.Color(0x29c8ff).multiplyScalar(1.6),
            transparent: true,
            opacity: 0.6,
          }),
        );
        group.add(glow);
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 128;
        const context = canvas.getContext('2d')!,
          gradient = context.createRadialGradient(64, 64, 18, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255,255,255,.75)');
        gradient.addColorStop(0.55, 'rgba(255,255,255,.3)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);
        const pool = new T.Mesh(
          new T.PlaneGeometry(3, 3, 6, 6).rotateX(-Math.PI / 2),
          new T.MeshBasicMaterial({
            map: new T.CanvasTexture(canvas),
            color: new T.Color(0x29c8ff).multiplyScalar(1.15),
            transparent: true,
            opacity: 0.45,
            blending: T.AdditiveBlending,
            depthWrite: false,
          }),
        );
        pool.position.y = 0.146;
        group.add(pool);
        s.add(group);
        p = { group, rim };
        plazas.set(a.id, p);
      }
      const w = hexToWorld(a.hex.q, a.hex.r);
      p.group.position.set(w.x, 0, w.z);
      p.rim.material.color.setHex(next.handoffs ? C.purple : 0x29c8ff).multiplyScalar(2.6);
    }
    bendTree();
  }
  function tick(time: number, camera: T.Camera) {
    const dt = Math.min(0.05, (time - (lastTime || time)) / 1000);
    lastTime = time;
    const progress = Math.min(1, (time - shapeAt) / 2600);
    blend = shapeFrom + (target - shapeFrom) * (progress * progress * (3 - 2 * progress));
    setPlanet(blend);
    const agent = frame?.agents.find((a) => a.id === frame!.selectedId);
    sel.visible = !!agent;
    if (agent) {
      const w = hexToWorld(agent.hex.q, agent.hex.r);
      sel.position.set(w.x, 0.35, w.z);
      const k = frame?.motion ? (time % 2200) / 2200 : 0.3;
      sel.scale.setScalar(1 + k * 0.35);
      sel.material.opacity = 0.85 * (1 - k);
    }
    if (frame?.motion) {
      const k = (time % 7000) / 7000;
      sweep.scale.setScalar(0.5 + k * GRID * 1.9);
      sweep.material.opacity = 0.18 * (1 - k);
    } else sweep.material.opacity = 0;
    for (const star of stars) star.position.copy(camera.position);
    halo.quaternion.copy(camera.quaternion);
    if (beacon.visible) {
      for (const [i, ring] of poleRings.entries())
        ring.rotation.z = (time / (2600 + i * 900)) * (i % 2 ? -1 : 1);
      beaconLight.intensity = (2.6 + Math.sin(time / 420) * 1.1) * beaconK;
    }
  }
  function point(p: T.Vector3): T.Vector3 {
    if (blend < 0.0005) return p.clone();
    const radius = 8 / blend,
      rho = Math.max(Math.hypot(p.x, p.z), 1e-6),
      th = rho / radius,
      h = Math.min(p.y, 0.39) + Math.max(p.y - 0.39, 0) * (1 + (0.65 - 1) * blend),
      k = (Math.sin(th) * (radius + h)) / rho;
    return new T.Vector3(p.x * k, h * Math.cos(th) - 2 * radius * Math.sin(th / 2) ** 2, p.z * k);
  }
  return {
    root: s,
    sync,
    tick,
    point,
    bendMaterial,
    get blend() {
      return blend;
    },
  };
}
