import * as THREE from 'three';
import { MapRenderer, MapFrame, RendererContext, MapTarget, Marker } from './map-renderer';
import { buildCity } from './city-scene';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { buildOffice, OfficeScene } from './office-scene';
import {
  OFFICE,
  OFFICE_ROOMS,
  officeSlot,
  seatOf,
  OfficeRoom,
  OFFICE_SLOTS,
} from './office-layout';

interface AmbientActivity {
  kind: 'meeting' | 'visit' | 'call' | 'pause' | 'ops';
  members: string[];
  state: 'gather' | 'active' | 'return';
  until: number;
  peer?: string;
}
interface Actor {
  mesh: THREE.Group;
  home: THREE.Vector3;
  path: THREE.Vector3[];
  wait: number;
  room: string;
  activity?: AmbientActivity;
}
const CYAN = 0x30c5e8,
  PURPLE = 0xad85dd;
export class ThreeRenderer implements MapRenderer {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene: THREE.Scene;
  private readonly camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private readonly office?: OfficeScene;
  private cityScene?: ReturnType<typeof buildCity>;
  private composer?: EffectComposer;
  private ao?: GTAOPass;
  private bloom?: UnrealBloomPass;
  private readonly world = new THREE.Group();
  private readonly actors = new Map<string, Actor>();
  private readonly links = new THREE.Group();
  private readonly ambient = new THREE.Group();
  private activities: AmbientActivity[] = [];
  private ambientPackets: {
    mesh: THREE.Mesh;
    curve: THREE.QuadraticBezierCurve3;
    back: boolean;
  }[] = [];
  private previousActive = '';
  private previousPhase = '';
  private readonly signals: { texture: THREE.Texture; rate: number; phase: number }[] = [];
  private readonly packets: {
    mesh: THREE.Mesh;
    curve: THREE.QuadraticBezierCurve3;
    offset: number;
    speed?: number;
  }[] = [];
  private frame: MapFrame | null = null;
  private width = 1;
  private height = 1;
  private yaw = Math.PI / 4;
  private distance = 55;
  private zoomLevel = 1;
  private baseZoom = 1;
  private readonly center = new THREE.Vector3();
  private offsetX = 0;
  private offsetY = 0;
  private raf = 0;
  private last = 0;
  private nextAmbient = 0;
  private disposed = false;
  private linkKey = '';
  private aoDirty = true;
  private lastCamera = '';
  private qualityLevel = 3;
  private slowFrames = 0;
  private slowTotal = 0;
  constructor(
    private readonly host: RendererContext,
    private readonly mode: 'office' | 'city',
  ) {
    this.renderer = new THREE.WebGLRenderer({
      canvas: host.canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setClearColor(mode === 'office' ? 0x070a0b : 0x0a0b0c, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    if (mode === 'office') {
      this.office = buildOffice();
      this.scene = this.office.scene;
      this.camera = this.office.camera;
      this.renderer.toneMappingExposure = 1.45;
    } else {
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.Fog(0x0a0b0c, 14, 46);
      this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 400);
      this.scene.add(new THREE.HemisphereLight(0xd9e1e5, 0x0b0c0e, 0.62));
      const sun = new THREE.DirectionalLight(0xeef2f5, 3.4);
      sun.position.set(-11, 21, 9);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.radius = 3;
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.025;
      Object.assign(sun.shadow.camera, {
        left: -24,
        right: 24,
        top: 24,
        bottom: -24,
        near: 1,
        far: 70,
      });
      sun.shadow.camera.updateProjectionMatrix();
      this.scene.add(sun);
      const rim = new THREE.DirectionalLight(0x9fabb2, 0.55);
      rim.position.set(10, 7, -8);
      this.scene.add(rim, new THREE.AmbientLight(0x1c1f22, 0.42));
      this.renderer.toneMappingExposure = 1.06;
      this.cityScene = buildCity(this.renderer);
      this.scene.add(this.cityScene.root);
      this.composer = new EffectComposer(
        this.renderer,
        new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 2 }),
      );
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.ao = new GTAOPass(this.scene, this.camera, 2, 2);
      this.ao.updateGtaoMaterial({
        radius: 0.7,
        distanceExponent: 1.4,
        thickness: 1.2,
        scale: 1.1,
        samples: 8,
        distanceFallOff: 1,
        screenSpaceRadius: false,
      });
      this.cityScene.bendMaterial(this.ao.normalMaterial);
      this.composer.addPass(this.ao);
      this.bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.3, 0.45, 0.86);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    }
    this.scene.add(this.world, this.links, this.ambient);
    this.renderer.shadowMap.autoUpdate = false;
    if (this.ao) this.cacheOcclusion(this.ao);
    this.raf = requestAnimationFrame((t) => this.render(t));
  }
  private cacheOcclusion(pass: GTAOPass): void {
    const resize = pass.setSize.bind(pass);
    pass.setSize = (w, h) => resize(Math.max(1, (w * 0.5) | 0), Math.max(1, (h * 0.5) | 0));
    if (this.bloom) {
      const resizeBloom = this.bloom.setSize.bind(this.bloom);
      this.bloom.setSize = (w, h) =>
        resizeBloom(Math.max(1, (w * 0.5) | 0), Math.max(1, (h * 0.5) | 0));
    }
    const cached = pass as GTAOPass & {
      _overrideVisibility: () => void;
      _visibilityCache: THREE.Object3D[];
      _renderPass: (
        renderer: THREE.WebGLRenderer,
        material: THREE.ShaderMaterial,
        target: THREE.WebGLRenderTarget,
      ) => void;
    };
    const hide = cached._overrideVisibility.bind(cached);
    cached._overrideVisibility = () => {
      hide();
      this.scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (
          object.visible &&
          (object.userData['noAO'] ||
            (mesh.material && !Array.isArray(mesh.material) && mesh.material.transparent))
        ) {
          object.visible = false;
          cached._visibilityCache.push(object);
        }
      });
    };
    const render = pass.render.bind(pass);
    pass.needsSwap = false;
    pass.render = (renderer, writeBuffer, readBuffer, dt, mask) => {
      if (this.aoDirty) {
        this.aoDirty = false;
        const output = pass.output;
        pass.output = GTAOPass.OUTPUT.Off;
        render(renderer, writeBuffer, readBuffer, dt, mask);
        pass.output = output;
      }
      pass.blendMaterial.uniforms['intensity'].value = pass.blendIntensity;
      pass.blendMaterial.uniforms['tDiffuse'].value = pass.pdRenderTarget.texture;
      cached._renderPass(renderer, pass.blendMaterial, readBuffer);
    };
  }
  zoomValue(): number {
    return Math.round(
      this.mode === 'office' ? (this.zoomLevel / this.baseZoom) * 100 : (55 / this.distance) * 100,
    );
  }
  snapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.host.canvas.toDataURL('image/png');
  }
  update(frame: MapFrame): void {
    const refit =
      this.frame?.focused !== frame.focused ||
      this.frame?.cityShape !== frame.cityShape ||
      this.frame?.inset !== frame.inset;
    this.frame = frame;
    this.renderer.shadowMap.enabled = frame.quality === 'high';
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, frame.quality === 'high' ? 2 : 1));
    const ids = new Set(frame.agents.map((a) => a.id));
    for (const [id, actor] of this.actors)
      if (!ids.has(id)) {
        this.world.remove(actor.mesh);
        this.disposeObject(actor.mesh);
        this.actors.delete(id);
      }
    for (const agent of frame.agents) {
      const slot = officeSlot(agent.desk);
      if (this.mode === 'office' && !slot) continue;
      const seat = slot ? seatOf(slot) : { x: 0, z: 0 };
      const home =
        this.mode === 'office'
          ? new THREE.Vector3(seat.x, 0, seat.z)
          : new THREE.Vector3(
              Math.sqrt(3) * (agent.hex.q + agent.hex.r / 2),
              0.34,
              1.5 * agent.hex.r,
            );
      let actor = this.actors.get(agent.id);
      if (!actor) {
        const mesh = new THREE.Group();
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.36, 0.42, 28),
          new THREE.MeshBasicMaterial({
            color: CYAN,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide,
            depthWrite: false,
          }),
        );
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        mesh.add(ring);
        mesh.position.copy(home);
        this.world.add(mesh);
        actor = { mesh, home, path: [], wait: 0, room: slot?.room || '' };
        this.actors.set(agent.id, actor);
      }
      if (!actor.home.equals(home)) {
        actor.home = home;
        actor.mesh.position.copy(home);
        actor.path = [];
        actor.room = slot?.room || '';
      }
      (actor.mesh.children[0] as THREE.Mesh).visible =
        this.mode === 'office' && !!actor.path.length;
    }
    this.aoDirty = true;
    this.renderer.shadowMap.needsUpdate = true;
    this.syncOffice();
    this.syncLinks();
    if (this.mode === 'city') this.cityScene?.sync(frame);
    if (refit) this.home();
    if (this.mode === 'office') this.syncActivity();
  }
  private syncOffice(): void {
    const o = this.office,
      f = this.frame;
    if (!o || !f) return;
    for (const [id, mark] of o.slotMarks) {
      const agent = f.agents.find((a) => officeSlot(a.desk)?.id === id),
        busy = !!agent && f.busyIds.includes(agent.id);
      mark.ring.visible = !!agent;
      mark.ring.material.color.setHex(CYAN);
      mark.led.visible = !!agent;
      mark.led.material.color.setHex(busy ? (f.paused ? 0xe0a84a : CYAN) : 0x7fcf9d);
      if (mark.slot.screenIndex !== undefined)
        o.screens.setColorAt(
          mark.slot.screenIndex,
          new THREE.Color(busy ? (f.paused ? 0xa89a70 : 0xe6fcff) : agent ? 0x6fb8c9 : 0x16242a),
        );
    }
    if (o.screens.instanceColor) o.screens.instanceColor.needsUpdate = true;
    const active = f.agents.find((a) => f.busyIds.includes(a.id)),
      spot = active && o.lampAt.get(officeSlot(active.desk)?.id || '');
    for (const part of ['bulb', 'glow', 'pool'] as const) o.lamp[part].visible = !!spot;
    o.lamp.light.intensity = spot ? (f.paused ? 0.5 : 1.4) : 0;
    if (spot) {
      o.lamp.bulb.position.copy(spot.head);
      o.lamp.glow.position.copy(spot.head);
      o.lamp.pool.position.copy(spot.pool);
      o.lamp.light.position.copy(spot.head);
    }
    if (o.war) {
      const live = !!f.busyIds.length || f.phase === 'planning' || f.phase === 'awaiting',
        paused = !!f.paused;
      o.war.state = live ? (paused ? 'paused' : 'live') : 'idle';
      for (const m of o.war.screens)
        m.color.setHex(live ? (paused ? 0xb06068 : 0xffffff) : 0x5a1a20);
      o.war.map.color.setHex(live ? (paused ? 0x9a4048 : 0xffd0d4) : 0x4a161b);
      o.war.strip.opacity = live ? (paused ? 0.45 : 0.8) : 0.25;
      for (const light of o.war.lights) light.intensity = live ? (paused ? 3 : 7) : 1;
    }
  }
  private syncLinks(): void {
    const frame = this.frame;
    if (!frame) return;
    const visible = (frame.links || []).filter(
      (l) => this.mode === 'city' || l.active || frame.handoffs,
    );
    const key = JSON.stringify([
      visible,
      frame.agents.map((a) => [a.id, a.desk, a.hex]),
      frame.cityShape,
      frame.selectedId,
    ]);
    if (key === this.linkKey) return;
    this.linkKey = key;
    this.disposeObject(this.links);
    this.links.clear();
    this.packets.length = 0;
    this.signals.length = 0;
    for (const link of visible) {
      const from = this.actors.get(link.from),
        to = this.actors.get(link.to);
      if (!from || !to) continue;
      const a = from.home.clone(),
        b = to.home.clone();
      a.y = this.mode === 'city' ? 0.39 : 0.6;
      b.y = a.y;
      const length = a.distanceTo(b),
        mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += this.mode === 'city' ? 0.22 + length * 0.07 : 0.4 + length * 0.09;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b),
        relevant = link.from === frame.selectedId || link.to === frame.selectedId;
      const color = link.active
          ? frame.handoffs
            ? 0xbd93e9
            : 0x5fd4ed
          : frame.handoffs
            ? relevant
              ? 0xa77ad6
              : 0x67518a
            : relevant
              ? 0x76c4d6
              : 0x3b7487,
        radius = link.active ? 0.045 : relevant ? 0.034 : 0.024;
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: link.active ? 1 : relevant ? 0.92 : 0.6,
        depthWrite: false,
      });
      this.cityScene?.bendMaterial(material);
      this.links.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 6, false), material));
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 4;
      const context = canvas.getContext('2d')!,
        gradient = context.createLinearGradient(0, 0, 256, 0);
      for (const [stop, alpha] of [
        [0, 0],
        [0.4, 0],
        [0.62, 0.14],
        [0.8, 0.5],
        [0.9, 1],
        [0.915, 0.25],
        [0.94, 0],
        [1, 0],
      ])
        gradient.addColorStop(stop, 'rgba(255,255,255,' + alpha + ')');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 4);
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.repeat.x = Math.max(1, Math.round(length / 2.4));
      const signal = new THREE.MeshBasicMaterial({
        map: texture,
        color: new THREE.Color(color).multiplyScalar(link.active ? 3.2 : relevant ? 2.4 : 1.6),
        transparent: true,
        opacity: link.active ? 1 : relevant ? 0.9 : 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      this.cityScene?.bendMaterial(signal);
      this.links.add(
        new THREE.Mesh(new THREE.TubeGeometry(curve, 64, radius * 1.8, 6, false), signal),
      );
      this.signals.push({
        texture,
        rate: ((link.active ? 3 : relevant ? 1.6 : 1) * texture.repeat.x) / Math.max(0.5, length),
        phase: (this.signals.length * 0.37) % 1,
      });
      const count = link.active ? 3 : relevant ? 1 : 0;
      for (let k = 0; k < count; k++) {
        const mat = new THREE.MeshBasicMaterial({
          color: 0xf1fcff,
          transparent: true,
          opacity: link.active ? 1 : 0.8,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        this.cityScene?.bendMaterial(mat);
        const packet = new THREE.Mesh(
          new THREE.SphereGeometry(link.active ? 0.09 : 0.06, 10, 8),
          mat,
        );
        this.links.add(packet);
        this.packets.push({
          mesh: packet,
          curve,
          offset: k / count,
          speed: link.active ? 0.45 : 0.22,
        });
      }
    }
  }
  resize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.renderer.setSize(this.width, this.height, false);
    this.composer?.setPixelRatio(this.renderer.getPixelRatio());
    this.composer?.setSize(this.width, this.height);
    this.aoDirty = true;
    this.home();
  }
  pan(dx: number, dy: number): void {
    const scale =
      this.mode === 'office' ? 26 / (this.height * this.zoomLevel) : this.distance * 0.00065;
    const c = Math.cos(this.yaw),
      s = Math.sin(this.yaw),
      forward = dy / Math.sin(0.6155);
    this.center.x -= (dx * c + forward * s) * scale;
    this.center.z -= (-dx * s + forward * c) * scale;
  }
  zoom(factor: number): void {
    if (this.mode === 'office')
      this.zoomLevel = Math.min(
        this.baseZoom * 6,
        Math.max(this.baseZoom * 0.35, this.zoomLevel * factor),
      );
    else this.distance = Math.min(160, Math.max(7, this.distance / factor));
  }
  private pitch = 0.96;
  orbit(dx: number, dy: number): void {
    this.yaw -= dx * 0.006;
    if (this.mode === 'city') this.pitch = Math.max(0.5, Math.min(1.22, this.pitch + dy * 0.004));
  }
  rotate(delta: number): void {
    this.yaw += delta;
  }
  home(): void {
    this.pitch = this.frame?.cityShape === 'planet' ? 0.7 : 0.96;
    const mobile = this.width < 561,
      tablet = this.width < 901,
      insetShift = this.width < 901 ? 0 : Math.max(0, (this.frame?.inset || 0) - 150) / 2,
      visibleW = this.frame?.focused
        ? this.width
        : mobile
          ? this.width
          : tablet
            ? this.width - 240
            : Math.max(420, this.width - 640 - 2 * insetShift);
    this.center.set(0, 0, 0);
    this.yaw = this.mode === 'office' ? Math.PI / 4 : 0.62;
    if (this.mode === 'office') {
      const span = 50 * 0.72,
        depth = 50 * 0.36 + (OFFICE.wallH + 1.6) * Math.cos(0.6155);
      this.baseZoom =
        Math.min(visibleW / ((span / 26) * this.height), (0.78 * 26) / depth) *
        (mobile ? 0.95 : 1.02);
      this.zoomLevel = this.baseZoom;
      this.offsetY = this.height * (mobile ? 0.06 : 0.09);
      this.offsetX = this.frame?.focused
        ? 0
        : mobile
          ? 0
          : tablet
            ? this.width * 0.1
            : -this.width * 0.045;
    } else {
      const planet = this.frame?.cityShape === 'planet',
        t = Math.tan((32 * Math.PI) / 360);
      this.distance = planet
        ? (10.6 / Math.sin((32 * Math.PI) / 360)) * Math.max(1, this.height / visibleW) * 1.06
        : Math.max(4.6 / t, 4.6 / (t * (visibleW / this.height))) *
          (mobile ? 1.55 : tablet ? 1.2 : 1.12);
      this.center.z = planet ? 0 : mobile ? -3.2 : tablet ? -1 : 0.4;
      this.center.y = planet ? -4.4 : 0;
      this.offsetX = mobile ? this.width * 0.05 : tablet ? this.width * 0.1 : 0;
      this.offsetY = 0;
    }
  }
  focus(id: string): void {
    const actor = this.actors.get(id);
    if (!actor) return;
    this.center.x = actor.mesh.position.x;
    this.center.z = actor.mesh.position.z;
    if (this.mode === 'office') this.zoomLevel = Math.max(this.zoomLevel, this.baseZoom * 1.8);
  }
  private applyCamera(): void {
    const c = this.camera;
    if (c instanceof THREE.OrthographicCamera) {
      const h = 13;
      c.left = (-h * this.width) / this.height;
      c.right = -c.left;
      c.top = h;
      c.bottom = -h;
      c.zoom = this.zoomLevel;
      const ce = Math.cos(0.6155);
      c.position.set(
        this.center.x + 80 * ce * Math.sin(this.yaw),
        80 * Math.sin(0.6155),
        this.center.z + 80 * ce * Math.cos(this.yaw),
      );
    } else {
      c.aspect = this.width / this.height;
      const phi = this.pitch;
      c.position.set(
        this.center.x + this.distance * Math.sin(phi) * Math.sin(this.yaw),
        this.center.y + this.distance * Math.cos(phi),
        this.center.z + this.distance * Math.sin(phi) * Math.cos(this.yaw),
      );
    }
    c.lookAt(this.center);
    c.setViewOffset(
      this.width,
      this.height,
      -(this.offsetX + (this.width < 901 ? 0 : Math.max(0, (this.frame?.inset || 0) - 150) / 2)),
      -this.offsetY,
      this.width,
      this.height,
    );
    c.updateProjectionMatrix();
    c.updateMatrixWorld();
    if (this.office) {
      for (const wall of this.office.walls)
        if (wall.g.visible !== wall.nx * Math.sin(this.yaw) + wall.nz * Math.cos(this.yaw) > 0.2) {
          wall.g.visible = !wall.g.visible;
          this.renderer.shadowMap.needsUpdate = true;
        }
      this.office.lamp.glow.quaternion.copy(c.quaternion);
    }
  }
  pick(x: number, y: number): MapTarget | null {
    this.applyCamera();
    const ray = new THREE.Raycaster();
    ray.setFromCamera(
      new THREE.Vector2((x / this.width) * 2 - 1, 1 - (y / this.height) * 2),
      this.camera,
    );
    const hit = new THREE.Vector3();
    if (this.mode === 'city' && this.cityScene!.blend > 0.0005) {
      if (this.cityScene!.blend < 0.999) return null;
      if (!ray.ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(0, -8, 0), 8.14), hit))
        return null;
      const radial = Math.hypot(hit.x, hit.z),
        rho = Math.atan2(radial, hit.y + 8) * 8;
      if (radial > 1e-6) {
        hit.x *= rho / radial;
        hit.z *= rho / radial;
      }
    } else if (!ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit))
      return null;
    if (this.mode === 'office') {
      const room = OFFICE_ROOMS.find(
        (r) => hit.x >= r.x && hit.x <= r.x + r.w && hit.z >= r.z && hit.z <= r.z + r.d,
      );
      if (room?.war) return { room: 'WAR' };
      const nearest = [...this.office!.slotMarks.values()]
        .map((m) => ({
          id: m.slot.id,
          d: Math.hypot(hit.x - seatOf(m.slot).x, hit.z - seatOf(m.slot).z),
        }))
        .sort((a, b) => a.d - b.d)[0];
      return nearest && nearest.d < 1.35 ? { desk: nearest.id } : null;
    }
    const qf = (Math.sqrt(3) / 3) * hit.x - hit.z / 3,
      rf = (2 / 3) * hit.z,
      sf = -qf - rf;
    let q = Math.round(qf),
      r = Math.round(rf),
      s = Math.round(sf);
    const dq = Math.abs(q - qf),
      dr = Math.abs(r - rf),
      ds = Math.abs(s - sf);
    if (dq > dr && dq > ds) q = -r - s;
    else if (dr > ds) r = -q - s;
    return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2 <= 10 ? { hex: { q, r } } : null;
  }
  private roomAt(p: THREE.Vector3): OfficeRoom | undefined {
    return OFFICE_ROOMS.find(
      (r) => p.x >= r.x && p.x <= r.x + r.w && p.z >= r.z && p.z <= r.z + r.d,
    );
  }
  private door(room: OfficeRoom): THREE.Vector3[] {
    if (room.door === 'west')
      return [new THREE.Vector3(room.x + 0.8, 0, 0), new THREE.Vector3(room.x - 0.6, 0, 0)];
    const side = room.z < 0 ? room.z + room.d : room.z,
      x = room.x + room.w / 2;
    return [new THREE.Vector3(x, 0, side + (room.z < 0 ? -0.8 : 0.8)), new THREE.Vector3(x, 0, 0)];
  }
  private path(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3[] {
    const a = this.roomAt(from),
      b = this.roomAt(to),
      points: THREE.Vector3[] = [];
    if (a?.code !== b?.code) {
      if (a) points.push(...this.door(a));
      if (b) points.push(...this.door(b).reverse());
    }
    points.push(to.clone());
    return points;
  }
  visit(id: string, destination: string): void {
    const actor = this.actors.get(id);
    if (!actor || this.mode !== 'office') return;
    const room = OFFICE_ROOMS.find((r) => r.key === destination || r.code === destination);
    if (!room) return;
    const target = new THREE.Vector3(room.x + room.w / 2, 0, room.z + room.d / 2 + 0.4);
    actor.path = this.path(actor.mesh.position, target);
    actor.wait = performance.now() + 12000;
    actor.room = room.code;
    if (!this.frame?.motion) {
      actor.mesh.position.copy(target);
      actor.path = [];
    }
  }
  private endActivity(activity: AmbientActivity): void {
    activity.state = 'return';
    for (const id of activity.members) {
      const actor = this.actors.get(id);
      if (actor) {
        actor.path = this.path(actor.mesh.position, actor.home);
        actor.wait = performance.now() + 1000;
      }
    }
    this.ambientArcs();
  }
  private syncActivity(): void {
    const frame = this.frame!;
    if (
      !frame.motion ||
      frame.paused ||
      frame.handoffs ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.activities = [];
      for (const actor of this.actors.values()) {
        actor.activity = undefined;
        actor.path = [];
        actor.mesh.position.copy(actor.home);
      }
      this.ambientArcs();
      return;
    }
    const active = frame.busyIds[0] || '';
    if (frame.phase !== 'idle')
      for (const act of this.activities)
        if (act.kind !== 'ops' && act.state !== 'return') this.endActivity(act);
    if (frame.phase === 'planning' && this.previousPhase !== 'planning') {
      const commander = frame.agents.find((a) => a.role === 'commander');
      if (commander) {
        this.visit(commander.id, 'WAR');
        const actor = this.actors.get(commander.id)!;
        const act: AmbientActivity = {
          kind: 'ops',
          members: [commander.id],
          state: 'gather',
          until: Infinity,
        };
        actor.activity = act;
        this.activities.push(act);
      }
    }
    if (this.previousPhase === 'planning' && frame.phase !== 'planning')
      for (const act of this.activities)
        if (act.kind === 'ops' && act.until === Infinity) this.endActivity(act);
    if (active !== this.previousActive) {
      if (this.previousActive && active) {
        const actor = this.actors.get(this.previousActive),
          peer = this.actors.get(active);
        if (actor && peer) {
          if (actor.activity) this.endActivity(actor.activity);
          const act: AmbientActivity = {
            kind: 'ops',
            members: [this.previousActive],
            peer: active,
            state: 'gather',
            until: 0,
          };
          actor.activity = act;
          actor.path = this.path(
            actor.mesh.position,
            peer.home.clone().add(new THREE.Vector3(0.95, 0, 0)),
          );
          this.activities.push(act);
        }
      }
      const actor = this.actors.get(active);
      if (actor && actor.activity && frame.phase !== 'planning') {
        this.endActivity(actor.activity);
        actor.activity = undefined;
        actor.mesh.position.copy(actor.home);
        actor.path = [];
      }
    }
    this.previousActive = active;
    this.previousPhase = frame.phase || 'idle';
  }
  private startAmbient(): void {
    const frame = this.frame!,
      pool = [...this.actors.entries()]
        .filter(
          ([id, a]) =>
            !a.activity && !a.path.length && !frame.busyIds.includes(id) && frame.movingId !== id,
        )
        .sort(() => Math.random() - 0.5);
    if (!pool.length) return;
    const random = Math.random(),
      kind: AmbientActivity['kind'] =
        random < 0.42 ? 'meeting' : random < 0.7 ? 'visit' : random < 0.88 ? 'call' : 'pause',
      act: AmbientActivity = { kind, members: [], state: 'gather', until: 0 };
    const seats = OFFICE_SLOTS.filter(
      (s) =>
        s.room === 'R' &&
        !frame.agents.some((a) => officeSlot(a.desk)?.id === s.id) &&
        !frame.occupiedDesks?.includes(s.id),
    );
    if (kind === 'meeting' && pool.length >= 2 && seats.length >= 2) {
      for (const [i, [id, actor]] of pool
        .slice(0, Math.min(4, pool.length, seats.length))
        .entries()) {
        const seat = seatOf(seats[i]);
        actor.activity = act;
        actor.path = this.path(actor.mesh.position, new THREE.Vector3(seat.x, 0, seat.z));
        act.members.push(id);
      }
    } else if (kind === 'visit' && pool.length >= 2) {
      const [id, guest] = pool[0],
        [peer, host] = pool[1];
      guest.activity = host.activity = act;
      guest.path = this.path(
        guest.mesh.position,
        host.home.clone().add(new THREE.Vector3(0.95, 0, 0)),
      );
      act.members = [id, peer];
    } else {
      const [id, actor] = pool[0];
      act.kind = kind === 'pause' ? 'pause' : 'call';
      actor.activity = act;
      act.members = [id];
      if (act.kind === 'pause') this.visit(id, actor.room === 'LAB' ? 'architecture' : 'testing');
    }
    if (act.members.length) this.activities.push(act);
  }
  private ambientArcs(): void {
    this.disposeObject(this.ambient);
    this.ambient.clear();
    this.ambientPackets = [];
    for (const act of this.activities) {
      if (act.state !== 'active' || !['meeting', 'visit', 'ops'].includes(act.kind)) continue;
      const members = [...act.members, ...(act.peer ? [act.peer] : [])]
        .map((id) => this.actors.get(id))
        .filter((a): a is Actor => !!a);
      if (members.length < 2) continue;
      for (let i = 0; i < (members.length === 2 ? 1 : members.length); i++) {
        const a = members[i].mesh.position.clone(),
          b = members[(i + 1) % members.length].mesh.position.clone();
        a.y = b.y = 1.25;
        const mid = a.clone().add(b).multiplyScalar(0.5);
        mid.y += 0.55 + a.distanceTo(b) * 0.14;
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        this.ambient.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(curve, 32, 0.026, 6, false),
            new THREE.MeshBasicMaterial({
              color: 0x6fe3c1,
              transparent: true,
              opacity: 0.7,
              depthWrite: false,
            }),
          ),
        );
        for (const back of [false, true]) {
          const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 10, 8),
            new THREE.MeshBasicMaterial({
              color: 0xeafff8,
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          );
          this.ambient.add(mesh);
          this.ambientPackets.push({ mesh, curve, back });
        }
      }
    }
  }
  private tickAmbient(time: number): void {
    if (!this.frame?.motion || this.frame.paused || this.frame.handoffs) return;
    if (!this.nextAmbient) this.nextAmbient = time + 3000 + Math.random() * 2000;
    if (this.frame.phase === 'idle' && time >= this.nextAmbient) {
      this.nextAmbient = time + 6000 + Math.random() * 6000;
      if (this.activities.length < (this.actors.size < 5 ? 1 : 2)) this.startAmbient();
    }
    for (const act of [...this.activities]) {
      const actors = act.members.map((id) => this.actors.get(id)).filter((a): a is Actor => !!a);
      if (!actors.length) {
        this.activities = this.activities.filter((a) => a !== act);
        continue;
      }
      if (act.state === 'gather' && actors.every((a) => !a.path.length)) {
        act.state = 'active';
        act.until =
          act.until === Infinity
            ? Infinity
            : time +
              (act.kind === 'ops'
                ? 2200
                : act.kind === 'meeting'
                  ? 8000 + Math.random() * 6000
                  : 5000 + Math.random() * 4000);
        this.ambientArcs();
      } else if (act.state === 'active' && time >= act.until) this.endActivity(act);
      else if (act.state === 'return' && actors.every((a) => !a.path.length)) {
        for (const actor of actors) if (actor.activity === act) actor.activity = undefined;
        this.activities = this.activities.filter((a) => a !== act);
        this.ambientArcs();
      }
    }
    for (const packet of this.ambientPackets) {
      const k = ((time / 1000) * 0.42) % 1;
      packet.mesh.position.copy(packet.curve.getPoint(packet.back ? 1 - k : k));
    }
  }
  private render(time: number): void {
    if (this.disposed) return;
    this.raf = requestAnimationFrame((t) => this.render(t));
    const dt = Math.min(0.05, (time - (this.last || time)) / 1000);
    const interval = this.last ? time - this.last : 0;
    this.last = time;
    if (this.mode === 'city' && interval > 0 && this.qualityLevel > 0) {
      this.slowTotal += interval;
      this.slowFrames++;
      if (this.slowFrames >= 60) {
        if (this.slowTotal / this.slowFrames > 45) this.qualityLevel--;
        this.slowFrames = 0;
        this.slowTotal = 0;
      }
    }
    if (!this.frame || document.hidden) return;
    this.applyCamera();
    if (this.frame.motion && this.mode === 'office') {
      for (const actor of this.actors.values()) {
        const next = actor.path[0];
        if (!next) continue;
        const d = next.clone().sub(actor.mesh.position),
          step = dt * 2.6;
        if (d.length() <= step) {
          actor.mesh.position.copy(next);
          actor.path.shift();
          actor.wait = time + 12000;
        } else actor.mesh.position.add(d.normalize().multiplyScalar(step));
        (actor.mesh.children[0] as THREE.Mesh).visible = !!actor.path.length;
      }
      this.tickAmbient(time);
    }
    if (this.office) {
      const selected = this.actors.get(this.frame.selectedId);
      this.office.sel.visible = !!selected;
      if (selected)
        this.office.sel.position.set(selected.mesh.position.x, 0.06, selected.mesh.position.z);
      const w = this.office.war;
      if (w?.state === 'live' && this.frame.motion) {
        const k = 0.5 + 0.5 * Math.sin(time / 380);
        for (const l of w.lights) l.intensity = 7 * (0.6 + 0.4 * k);
        w.strip.opacity = 0.5 + 0.4 * k;
        w.mapTex.offset.y = (time / 40000) % 1;
      }
    }
    for (const packet of this.packets)
      packet.mesh.position.copy(
        packet.curve.getPoint(
          ((this.frame.motion ? (time / 1000) * (packet.speed || 0.22) : 0) + packet.offset) % 1,
        ),
      );
    for (const signal of this.signals)
      signal.texture.offset.x =
        -(this.frame.motion ? (time / 1000) * signal.rate : 0) - signal.phase;
    if (this.cityScene) {
      this.cityScene.tick(time, this.camera);
      const cameraKey =
        this.camera.matrixWorld.elements.join(',') +
        this.camera.projectionMatrix.elements.join(',') +
        this.cityScene.blend;
      if (cameraKey !== this.lastCamera) {
        this.lastCamera = cameraKey;
        this.aoDirty = true;
        if (this.cityScene.blend > 0) this.renderer.shadowMap.needsUpdate = true;
      }
      for (const child of this.links.children) {
        const mesh = child as THREE.Mesh;
        if (mesh.material && !Array.isArray(mesh.material))
          this.cityScene.bendMaterial(mesh.material);
        mesh.frustumCulled = false;
      }
      if (this.frame.quality === 'high' && this.qualityLevel >= 2) {
        if (this.ao) this.ao.enabled = this.qualityLevel >= 3;
        this.composer!.render();
      } else this.renderer.render(this.scene, this.camera);
    } else this.renderer.render(this.scene, this.camera);
    this.host.canvas.dataset['ready'] = 'true';
    const markers: Marker[] = [];
    for (const [id, actor] of this.actors) {
      const p = (
        this.mode === 'city'
          ? this.cityScene!.point(actor.home.clone().add(new THREE.Vector3(0, 0.42, 0)))
          : actor.mesh.localToWorld(new THREE.Vector3(0, 1.55, 0))
      ).project(this.camera);
      if (p.z < 1)
        markers.push({
          id,
          x: ((p.x + 1) / 2) * this.width,
          y: ((1 - p.y) / 2) * this.height,
          walking: !!actor.path.length,
          badge:
            actor.activity?.state === 'active' && actor.activity.kind !== 'ops'
              ? actor.activity.kind
              : undefined,
        });
    }
    this.host.markers(markers);
    if (this.mode === 'office')
      this.host.rooms?.(
        OFFICE_ROOMS.map((room) => {
          const p = new THREE.Vector3(room.x + 0.4, 0.05, room.z + 0.45).project(this.camera);
          return {
            id: room.code,
            key: room.key,
            index: room.index!,
            x: ((p.x + 1) / 2) * this.width,
            y: ((1 - p.y) / 2) * this.height,
          };
        }),
      );
  }
  private disposeObject(object: THREE.Object3D): void {
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    object.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) geometries.add(mesh.geometry);
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
        if (m) {
          materials.add(m);
          for (const value of Object.values(m))
            if (value instanceof THREE.Texture) textures.add(value);
        }
    });
    for (const t of textures) t.dispose();
    for (const m of materials) m.dispose();
    for (const g of geometries) g.dispose();
  }
  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.disposeObject(this.scene);
    this.composer?.dispose();
    this.ao?.dispose();
    this.bloom?.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.actors.clear();
  }
}
