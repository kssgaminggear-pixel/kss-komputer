/**
 * Scene "Bedah PC". Modul ini (beserta three) hanya dimuat lewat import() dinamis.
 * Menggambar hanya saat diperlukan dan berhenti total di luar layar atau saat tab tersembunyi.
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildPcModel, type PartName } from './pcModel';

export type SceneMode = 'rakit' | 'cleaning' | 'upgrade';

export interface SceneHandle {
  setMode: (mode: SceneMode) => void;
  setPaused: (paused: boolean) => void;
  dispose: () => void;
}

interface ModeSpec {
  /** Seberapa jauh tiap bagian diurai (0 = terpasang, 1 = penuh). */
  explode: Partial<Record<PartName, number>>;
  highlight: PartName[];
  /** Redupkan bagian yang tidak disorot. */
  dim: boolean;
  /** Bagian yang bolak-balik terpasang dan terlepas selama diputar. */
  cycle: PartName[];
}

const ALL: PartName[] = ['case', 'glass', 'board', 'cooler', 'ram', 'gpu', 'ssd', 'psu', 'fans', 'cables'];

const MODES: Record<SceneMode, ModeSpec> = {
  rakit: { explode: Object.fromEntries(ALL.map((name) => [name, 1])), highlight: ['cables'], dim: false, cycle: ALL },
  cleaning: { explode: { glass: 1, cooler: 0.75, fans: 0.7 }, highlight: ['cooler', 'fans'], dim: true, cycle: [] },
  upgrade: { explode: { glass: 1, ram: 0.7, ssd: 0.7 }, highlight: ['ram', 'ssd'], dim: true, cycle: ['ram', 'ssd'] },
};

const ACCENT = new THREE.Color('#ea580c');
const SHADE = new THREE.Color('#202328');
const BASE_YAW = -0.42;
const BASE_PITCH = 0.14;
const MAX_YAW = 0.6;
const MAX_PITCH = 0.18;
/** Satu siklus: terurai 4 detik, terpasang 2 detik. */
const CYCLE_SECONDS = 6;
const SETTLE = 0.002;

export function createPcScene(canvas: HTMLCanvasElement, initial: SceneMode, onReady: () => void): SceneHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  const sun = new THREE.DirectionalLight('#ffffff', 1.4);
  sun.position.set(3, 5, 6);
  scene.add(sun);

  const { root, parts, spinners } = buildPcModel();
  scene.add(root);
  const camera = new THREE.PerspectiveCamera(30, 4 / 3, 0.1, 100);

  let mode = initial;
  let paused = false;
  let visible = false;
  let frame = 0;
  let last = 0;
  let clock = 0;
  let ready = false;
  let drag: { x: number; y: number; yaw: number; pitch: number } | null = null;
  const user = { yaw: 0, pitch: 0 };
  const progress = new Map<PartName, number>(parts.map((p) => [p.name, 0]));
  const light = new Map<PartName, { accent: number; shade: number }>(parts.map((p) => [p.name, { accent: 0, shade: 0 }]));

  const request = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  };

  function render(now: number) {
    frame = 0;
    const delta = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
    last = now;
    if (!paused) clock += delta;

    const spec = MODES[mode];
    const open = clock % CYCLE_SECONDS < 4;
    const ease = 1 - Math.exp(-delta * 5);
    let moving = false;

    for (const item of parts) {
      let target = spec.explode[item.name] ?? 0;
      if (spec.cycle.includes(item.name) && !open) target = 0;
      // Saat dijeda, posisi bagian yang bersiklus dibekukan; pergantian tab tetap dianimasikan.
      const current = progress.get(item.name)!;
      const next = current + (target - current) * ease;
      if (Math.abs(target - next) > SETTLE) moving = true;
      progress.set(item.name, next);
      item.group.position.copy(item.offset).multiplyScalar(next);

      const tone = light.get(item.name)!;
      const accent = spec.highlight.includes(item.name) ? 1 : 0;
      const shade = spec.dim && !accent ? 1 : 0;
      tone.accent += (accent - tone.accent) * ease;
      tone.shade += (shade - tone.shade) * ease;
      if (Math.abs(accent - tone.accent) > SETTLE || Math.abs(shade - tone.shade) > SETTLE) moving = true;
      for (const { material, base } of item.materials) {
        material.color.copy(base).lerp(ACCENT, tone.accent * 0.9).lerp(SHADE, tone.shade * 0.6);
      }
      const pane = item.group.userData.pane as THREE.MeshStandardMaterial | undefined;
      if (pane) pane.opacity = 0.1 * (1 - next);
    }

    if (!paused) for (const rotor of spinners) rotor.rotation.z -= delta * 3.2;
    const sway = Math.sin(clock * 0.35) * 0.16;
    root.rotation.set(BASE_PITCH + user.pitch, BASE_YAW + user.yaw + sway, 0);

    // Kamera mundur saat bagian terurai agar semuanya tetap muat.
    const spread = Math.max(...parts.filter((p) => p.name !== 'glass').map((p) => progress.get(p.name)!));
    const fit = Math.max(1, 1.34 / camera.aspect);
    camera.position.set(0, 0.5, (11.4 + spread * 4.2) * fit);
    camera.lookAt(0, -0.05, 0);

    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      onReady();
    }
    if (!paused || moving || drag) request();
    else last = 0;
  }

  const resize = new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    request();
  });
  resize.observe(canvas);

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    last = 0;
    request();
  });
  intersection.observe(canvas);

  const onVisibility = () => {
    last = 0;
    request();
  };
  const onDown = (event: PointerEvent) => {
    drag = { x: event.clientX, y: event.clientY, yaw: user.yaw, pitch: user.pitch };
    canvas.setPointerCapture(event.pointerId);
    request();
  };
  const onMove = (event: PointerEvent) => {
    if (!drag) return;
    user.yaw = THREE.MathUtils.clamp(drag.yaw + (event.clientX - drag.x) / 220, -MAX_YAW, MAX_YAW);
    user.pitch = THREE.MathUtils.clamp(drag.pitch + (event.clientY - drag.y) / 400, -MAX_PITCH, MAX_PITCH);
    request();
  };
  const onUp = () => {
    drag = null;
  };
  document.addEventListener('visibilitychange', onVisibility);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  return {
    setMode(next) {
      mode = next;
      clock = 0;
      request();
    },
    setPaused(next) {
      paused = next;
      last = 0;
      request();
    },
    dispose() {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        for (const material of [object.material].flat()) material.dispose();
      });
      environment.dispose();
      room.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
