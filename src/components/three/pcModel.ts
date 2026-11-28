/**
 * Model PC bergaya, dibuat seluruhnya dari kode: tanpa file model, tekstur, logo, atau teks.
 * Setiap bagian berupa grup terpisah sehingga bisa diurai dan disorot per layanan.
 */
import * as THREE from 'three';

export type PartName = 'case' | 'glass' | 'board' | 'cooler' | 'ram' | 'gpu' | 'ssd' | 'psu' | 'fans' | 'cables';

export interface Part {
  name: PartName;
  group: THREE.Group;
  /** Pergeseran saat terurai penuh. */
  offset: THREE.Vector3;
  /** Material milik bagian ini saja, agar bisa diredupkan atau disorot sendiri. */
  materials: { material: THREE.MeshStandardMaterial; base: THREE.Color }[];
}

const STEEL = '#c9d1d9';
const INK = '#3a3f47';
const DARK = '#262a30';
const CREAM = '#e9e1d2';
const PCB = '#33463f';
const CABLE = '#17191d';

export function buildPcModel() {
  const root = new THREE.Group();
  const parts: Part[] = [];
  const spinners: THREE.Group[] = [];

  function part(name: PartName, offset: [number, number, number]) {
    const group = new THREE.Group();
    const entry: Part = { name, group, offset: new THREE.Vector3(...offset), materials: [] };
    const cache = new Map<string, THREE.MeshStandardMaterial>();
    const material = (color: string, metalness = 0.35, roughness = 0.5) => {
      const key = `${color}:${metalness}:${roughness}`;
      let found = cache.get(key);
      if (!found) {
        found = new THREE.MeshStandardMaterial({ color, metalness, roughness });
        cache.set(key, found);
        entry.materials.push({ material: found, base: found.color.clone() });
      }
      return found;
    };
    const add = (
      geometry: THREE.BufferGeometry,
      mat: THREE.Material,
      position: [number, number, number],
      parent: THREE.Object3D = group
    ) => {
      const mesh = new THREE.Mesh(geometry, mat);
      mesh.position.set(...position);
      parent.add(mesh);
      return mesh;
    };
    const box = (size: [number, number, number], position: [number, number, number], mat: THREE.Material, parent?: THREE.Object3D) =>
      add(new THREE.BoxGeometry(...size), mat, position, parent);
    /** Kipas menghadap +z; baling-balingnya berputar. */
    const fan = (radius: number, position: [number, number, number], parent: THREE.Object3D = group) => {
      const holder = new THREE.Group();
      holder.position.set(...position);
      add(new THREE.TorusGeometry(radius, radius * 0.09, 10, 40), material(INK), [0, 0, 0], holder);
      const rotor = new THREE.Group();
      for (let i = 0; i < 7; i += 1) {
        const blade = new THREE.Group();
        blade.rotation.z = (i / 7) * Math.PI * 2;
        box([radius * 0.72, radius * 0.3, 0.03], [radius * 0.46, 0, 0], material(STEEL, 0.5, 0.45), blade).rotation.x = 0.5;
        rotor.add(blade);
      }
      add(new THREE.CylinderGeometry(radius * 0.22, radius * 0.22, 0.1, 24), material(DARK), [0, 0, 0], rotor).rotation.x =
        Math.PI / 2;
      holder.add(rotor);
      spinners.push(rotor);
      parent.add(holder);
      return holder;
    };
    parts.push(entry);
    root.add(group);
    return { group, material, box, add, fan };
  }

  // Casing: dinding belakang dan rangka, sisi depan terbuka.
  {
    const p = part('case', [0, 0, -0.35]);
    const wall = p.material(INK, 0.45, 0.55);
    p.box([4.5, 4.6, 0.08], [0, 0, -1.05], p.material(DARK, 0.4, 0.65));
    p.box([4.5, 0.12, 2.1], [0, 2.3, 0], wall);
    p.box([4.5, 0.12, 2.1], [0, -2.3, 0], wall);
    p.box([0.12, 4.6, 2.1], [-2.25, 0, 0], wall);
    p.box([0.1, 4.6, 0.12], [2.25, 0, 1], wall);
    p.box([0.1, 4.6, 0.12], [2.25, 0, -1], wall);
    for (const x of [-1.8, 1.8]) p.box([0.5, 0.16, 1.7], [x, -2.43, 0], p.material(DARK));
    for (const y of [-0.6, -0.2, 0.2, 0.6, 1, 1.4]) p.box([0.06, 0.12, 0.9], [-2.32, y, -0.2], p.material(DARK));
  }

  {
    const p = part('glass', [0, 0, 3.2]);
    const pane = new THREE.MeshStandardMaterial({
      color: '#aebfce',
      metalness: 0.1,
      roughness: 0.08,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
    });
    p.box([4.4, 4.5, 0.04], [0, 0, 1.08], pane);
    p.group.userData.pane = pane;
  }

  {
    const p = part('board', [0, 0, 0.25]);
    p.box([2.95, 3.25, 0.08], [-0.55, 0.4, -0.93], p.material(PCB, 0.2, 0.7));
    const steel = p.material(STEEL, 0.65, 0.4);
    p.box([0.34, 1.3, 0.22], [-1.78, 1.15, -0.8], steel);
    p.box([1.1, 0.3, 0.2], [-0.8, 1.82, -0.8], steel);
    p.box([0.6, 0.55, 0.12], [-0.1, -0.85, -0.84], steel);
    for (const x of [0.24, 0.4, 0.56, 0.72]) p.box([0.07, 1.6, 0.07], [x, 0.9, -0.86], p.material(DARK));
    for (const y of [-0.35, -1.05]) p.box([2.1, 0.09, 0.08], [-0.65, y, -0.85], p.material(DARK));
    for (let i = 0; i < 8; i += 1) p.box([0.12, 0.12, 0.14], [-1.5 + i * 0.19, 1.55, -0.83], p.material(CREAM, 0.1, 0.6));
  }

  {
    const p = part('cooler', [-1.65, 0.7, 1.7]);
    const fin = p.material(STEEL, 0.75, 0.35);
    for (let i = 0; i < 14; i += 1) p.box([1.05, 0.03, 0.62], [-0.72, 0.46 + i * 0.07, -0.52], fin);
    for (const x of [-1.05, -0.72, -0.39]) {
      p.add(new THREE.CylinderGeometry(0.045, 0.045, 1.08, 12), p.material(CREAM, 0.7, 0.3), [x, 0.92, -0.52]);
    }
    p.fan(0.5, [-0.72, 0.92, -0.14]);
  }

  {
    const p = part('ram', [1.35, 0.95, 1.5]);
    for (const x of [0.4, 0.72]) {
      p.box([0.08, 1.45, 0.34], [x, 0.9, -0.66], p.material(CREAM, 0.35, 0.45));
      p.box([0.1, 1.45, 0.05], [x, 0.9, -0.48], p.material(STEEL, 0.6, 0.35));
    }
  }

  {
    const p = part('gpu', [0.75, -0.75, 2.4]);
    p.box([2.75, 0.78, 0.62], [-0.5, -0.45, -0.5], p.material(INK, 0.55, 0.4));
    p.box([2.75, 0.07, 0.66], [-0.5, -0.03, -0.5], p.material(STEEL, 0.65, 0.35));
    p.box([0.07, 1.05, 0.5], [-1.95, -0.4, -0.55], p.material(STEEL, 0.7, 0.35));
    for (const x of [-1.15, 0.15]) p.fan(0.31, [x, -0.45, -0.17]);
  }

  {
    const p = part('ssd', [-1.85, -0.15, 1.8]);
    p.box([1.05, 0.26, 0.05], [-0.65, 0.1, -0.84], p.material(PCB, 0.2, 0.6));
    for (const x of [-0.95, -0.62, -0.29]) p.box([0.24, 0.2, 0.05], [x, 0.1, -0.8], p.material(DARK, 0.3, 0.4));
    p.box([0.08, 0.2, 0.06], [-1.21, 0.1, -0.84], p.material(CREAM, 0.8, 0.3));
  }

  {
    const p = part('psu', [-0.95, -0.85, 1.4]);
    p.box([1.75, 0.82, 1.55], [-1.25, -1.78, -0.15], p.material(INK, 0.5, 0.45));
    p.box([0.9, 0.5, 0.02], [-1.25, -1.78, 0.64], p.material(DARK));
  }

  {
    const p = part('fans', [1.5, 0, 0.5]);
    for (const y of [1.35, 0, -1.35]) p.fan(0.58, [2.02, y, 0]).rotation.y = -Math.PI / 2.6;
  }

  {
    const p = part('cables', [0.35, -0.9, 0.9]);
    const rubber = p.material(CABLE, 0.1, 0.8);
    const route = (points: [number, number, number][]) =>
      p.add(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((v) => new THREE.Vector3(...v))), 40, 0.045, 8),
        rubber,
        [0, 0, 0]
      );
    route([[-0.4, -1.55, 0], [0.5, -1.6, 0.1], [1.15, -0.7, -0.35], [0.95, 0.25, -0.85]]);
    route([[-0.4, -1.75, -0.3], [0.2, -1.95, -0.2], [0.55, -1.1, -0.45], [-0.1, -0.55, -0.75]]);
    route([[-2, -1.4, -0.4], [-2.1, 0, -0.7], [-2.05, 1.5, -0.85], [-1.45, 1.95, -0.86]]);
  }

  return { root, parts, spinners };
}
