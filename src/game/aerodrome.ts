import * as THREE from "three";
import {
  createHangar,
  createJeep,
  createPlane,
  createTower,
  createWindsock,
} from "./models";

export type AirfieldSpec = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  length: number;
  width: number;
};

export function localOnField(
  spec: AirfieldSpec,
  along: number,
  across: number,
): { x: number; z: number } {
  const fx = -Math.sin(spec.yaw);
  const fz = -Math.cos(spec.yaw);
  const rx = Math.cos(spec.yaw);
  const rz = -Math.sin(spec.yaw);
  return {
    x: spec.x + fx * along + rx * across,
    z: spec.z + fz * along + rz * across,
  };
}

export function inAirfield(
  spec: AirfieldSpec,
  x: number,
  z: number,
  pad = 6,
): boolean {
  const fx = -Math.sin(spec.yaw);
  const fz = -Math.cos(spec.yaw);
  const rx = Math.cos(spec.yaw);
  const rz = -Math.sin(spec.yaw);
  const dx = x - spec.x;
  const dz = z - spec.z;
  const along = dx * fx + dz * fz;
  const across = dx * rx + dz * rz;
  return Math.abs(along) < spec.length * 0.5 + pad && Math.abs(across) < spec.width * 0.5 + 16 + pad;
}

export function pickAirfield(
  sample: (x: number, z: number) => number,
  sea: number,
): AirfieldSpec | null {
  const length = 108;
  const width = 12;
  let best: AirfieldSpec | null = null;
  let bestScore = Infinity;
  for (let k = 0; k < 16; k++) {
    const ang = (k / 16) * Math.PI * 2;
    const dist = 88;
    const x = Math.sin(ang) * dist;
    const z = Math.cos(ang) * dist;
    const yaw = Math.atan2(x, z);
    const y = sample(x, z);
    if (y < sea + 3.5 || y > sea + 18) continue;
    const fx = -Math.sin(yaw);
    const fz = -Math.cos(yaw);
    const rx = Math.cos(yaw);
    const rz = -Math.sin(yaw);
    let slope = 0;
    let wet = 0;
    for (const a of [-40, 0, 40]) {
      for (const c of [-5, 5]) {
        const px = x + fx * a + rx * c;
        const pz = z + fz * a + rz * c;
        const h = sample(px, pz);
        slope += Math.abs(h - y);
        if (h < sea + 1.5) wet += 1;
      }
    }
    if (wet > 0) continue;
    const score = slope;
    if (score < bestScore) {
      bestScore = score;
      best = { x, y, z, yaw, length, width };
    }
  }
  return best;
}

export function flattenAirfield(
  heights: Float32Array,
  grid: number,
  size: number,
  spec: AirfieldSpec,
) {
  const half = size / 2;
  const segments = grid - 1;
  const fx = -Math.sin(spec.yaw);
  const fz = -Math.cos(spec.yaw);
  const rx = Math.cos(spec.yaw);
  const rz = -Math.sin(spec.yaw);
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const x = (i / segments) * size - half;
      const z = (j / segments) * size - half;
      const dx = x - spec.x;
      const dz = z - spec.z;
      const along = dx * fx + dz * fz;
      const across = dx * rx + dz * rz;
      const inside =
        Math.abs(along) < spec.length * 0.52 && Math.abs(across) < spec.width * 0.5 + 18;
      if (!inside) continue;
      const edge = Math.max(
        Math.abs(along) / (spec.length * 0.52),
        Math.abs(across) / (spec.width * 0.5 + 18),
      );
      const k = edge > 0.72 ? (1 - edge) / 0.28 : 1;
      const idx = j * grid + i;
      const cur = heights[idx] ?? spec.y;
      heights[idx] = cur + (spec.y - cur) * Math.max(0, Math.min(1, k));
    }
  }
}

export function buildAirfieldScene(spec: AirfieldSpec): {
  group: THREE.Group;
  playerPlane: THREE.Group;
  jeep: THREE.Group;
  parked: THREE.Group[];
} {
  const group = new THREE.Group();
  group.position.set(spec.x, spec.y, spec.z);
  group.rotation.y = spec.yaw;

  const asphalt = new THREE.MeshLambertMaterial({ color: 0x3a3f3c, flatShading: true });
  const paint = new THREE.MeshLambertMaterial({ color: 0xc4a574, flatShading: true });
  const apronMat = new THREE.MeshLambertMaterial({ color: 0x454a46, flatShading: true });

  const runway = new THREE.Mesh(new THREE.BoxGeometry(spec.width, 0.16, spec.length), asphalt);
  runway.position.y = 0.05;
  group.add(runway);

  for (let i = -5; i <= 5; i++) {
    const dash = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.04, 3.2), paint);
    dash.position.set(0, 0.15, i * 9);
    group.add(dash);
  }

  const apron = new THREE.Mesh(new THREE.BoxGeometry(38, 0.12, 28), apronMat);
  apron.position.set(18, 0.04, -8);
  group.add(apron);

  const hangarA = createHangar();
  hangarA.position.set(22, 0, -14);
  hangarA.rotation.y = Math.PI / 2;
  const hangarB = createHangar();
  hangarB.position.set(22, 0, 6);
  hangarB.rotation.y = Math.PI / 2;
  group.add(hangarA, hangarB);

  const tower = createTower();
  tower.position.set(28, 0, 22);
  group.add(tower);

  const sock = createWindsock();
  sock.position.set(-9, 0, spec.length * 0.42);
  group.add(sock);

  const playerPlane = createPlane(0xe8eee9);
  playerPlane.position.set(0, 0, -spec.length * 0.38);
  group.add(playerPlane);

  const parked: THREE.Group[] = [];
  const liveries = [0xb7c4bc, 0xd7c4a8, 0x9aa898];
  liveries.forEach((color, i) => {
    const p = createPlane(color);
    p.position.set(14 + (i % 2) * 2, 0, -18 + i * 9);
    p.rotation.y = Math.PI * 0.5;
    group.add(p);
    parked.push(p);
  });

  const jeep = createJeep();
  jeep.position.set(10, 0, -spec.length * 0.32);
  jeep.rotation.y = -0.4;
  group.add(jeep);

  for (let s = -1; s <= 1; s += 2) {
    for (let k = -4; k <= 4; k++) {
      const light = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.22, 0.18),
        new THREE.MeshLambertMaterial({
          color: 0xe8eee9,
          emissive: 0xc5d4cc,
          emissiveIntensity: 0.4,
          flatShading: true,
        }),
      );
      light.position.set(s * (spec.width * 0.5 + 0.4), 0.18, k * 11);
      group.add(light);
    }
  }

  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2.4, 3.4),
    new THREE.MeshLambertMaterial({ color: 0x2a332e, flatShading: true }),
  );
  sign.position.set(-12, 1.2, spec.length * 0.46);
  group.add(sign);

  return { group, playerPlane, jeep, parked };
}
