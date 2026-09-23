import * as THREE from "three";
import { createNoise2D, type NoiseFunction2D } from "simplex-noise";
import { flattenAirfield, inAirfield, pickAirfield, type AirfieldSpec } from "./aerodrome";
import { mulberry32, randRange } from "./prng";

export const WORLD_SIZE = 380;
export const TERRAIN_SEGMENTS = 72;
export const SEA_LEVEL = 2.6;

export type PropInstance = {
  x: number;
  y: number;
  z: number;
  scale: number;
  rot: number;
};

export type TerrainWorld = {
  geometry: THREE.BufferGeometry;
  size: number;
  segments: number;
  seaLevel: number;
  maxHeight: number;
  peak: THREE.Vector3;
  airfield: AirfieldSpec;
  sample: (x: number, z: number) => number;
  trees: PropInstance[];
  rocks: PropInstance[];
  clouds: PropInstance[];
  dispose: () => void;
};

const WATER = new THREE.Color(0x1a6b7a);
const SAND = new THREE.Color(0xc4b18c);
const GRASS = new THREE.Color(0x6a9a48);
const FOREST = new THREE.Color(0x3c6b38);
const ROCK = new THREE.Color(0x7a736c);
const SNOW = new THREE.Color(0xe8eef2);
const SLOPE_ROCK = new THREE.Color(0x5e5954);
const ASPHALT = new THREE.Color(0x3a3f3c);
const APRON = new THREE.Color(0x4a504c);

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function fbm(
  noise: NoiseFunction2D,
  x: number,
  z: number,
  octaves: number,
): number {
  let amp = 1;
  let freq = 1;
  let sum = 0;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise(x * freq, z * freq);
    norm += amp;
    amp *= 0.5;
    freq *= 2.05;
  }
  return sum / norm;
}

function heightAt(
  nx: number,
  nz: number,
  n1: NoiseFunction2D,
  n2: NoiseFunction2D,
): number {
  const warpX = n2(nx * 2.1, nz * 2.1) * 0.14;
  const warpZ = n2(nx * 2.1 + 18, nz * 2.1 - 7) * 0.14;
  const e = (fbm(n1, nx * 1.7 + warpX, nz * 1.7 + warpZ, 5) + 1) * 0.5;

  const ridgeRaw = 1 - Math.abs(n1(nx * 3.4 + warpX, nz * 3.4 + warpZ));
  const mountains = Math.pow(ridgeRaw, 2.05);

  const dist = Math.hypot(nx, nz);
  const island = 1 - smoothstep(0.26, 0.49, dist);

  let h = (e * 0.5 + mountains * 0.5) * island;
  h = Math.pow(Math.max(h, 0), 1.18);
  return h * 64 - 6;
}

function colorFor(
  h: number,
  slope: number,
  moisture: number,
  target: THREE.Color,
): void {
  if (h <= SEA_LEVEL + 0.2) {
    target.copy(WATER);
    return;
  }
  const t = Math.max(0, (h - SEA_LEVEL) / 58);
  if (t < 0.055) {
    target.copy(SAND);
  } else if (t < 0.26) {
    target.copy(GRASS).lerp(FOREST, moisture * 0.45);
  } else if (t < 0.5) {
    target.copy(FOREST).lerp(ROCK, smoothstep(0.38, 0.5, t));
  } else if (t < 0.76) {
    target.copy(ROCK).lerp(SNOW, smoothstep(0.62, 0.76, t));
  } else {
    target.copy(SNOW);
  }
  const cliff = smoothstep(0.55, 1.6, slope);
  target.lerp(SLOPE_ROCK, cliff * 0.85);
  const shade = 1 - cliff * 0.22 - (1 - moisture) * 0.06;
  target.multiplyScalar(shade);
}

export function buildTerrain(seed: number): TerrainWorld {
  const rng = mulberry32(seed);
  const n1 = createNoise2D(mulberry32(seed ^ 0x9e3779b9));
  const n2 = createNoise2D(mulberry32(seed ^ 0x85ebca6b));
  const n3 = createNoise2D(mulberry32(seed ^ 0xc2b2ae35));

  const size = WORLD_SIZE;
  const segments = TERRAIN_SEGMENTS;
  const grid = segments + 1;
  const heights = new Float32Array(grid * grid);
  const half = size / 2;
  let maxHeight = -Infinity;
  let peakI = 0;
  let peakJ = 0;

  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const nx = i / segments - 0.5;
      const nz = j / segments - 0.5;
      let h = heightAt(nx, nz, n1, n2);
      if (h < SEA_LEVEL) h = SEA_LEVEL - 0.35;
      heights[j * grid + i] = h;
      if (h > maxHeight) {
        maxHeight = h;
        peakI = i;
        peakJ = j;
      }
    }
  }

  const probe = (x: number, z: number): number => {
    const u = ((x + half) / size) * segments;
    const v = ((z + half) / size) * segments;
    if (u < 0 || v < 0 || u > segments || v > segments) return SEA_LEVEL - 2;
    const i = Math.min(segments - 1, Math.max(0, Math.floor(u)));
    const j = Math.min(segments - 1, Math.max(0, Math.floor(v)));
    return heights[j * grid + i] ?? SEA_LEVEL;
  };

  let airfield = pickAirfield(probe, SEA_LEVEL);
  if (!airfield) {
    airfield = { x: 0, y: Math.max(probe(0, 90), SEA_LEVEL + 4), z: 90, yaw: 0, length: 108, width: 12 };
  }
  flattenAirfield(heights, grid, size, airfield);
  const afi = Math.round(((airfield.x + half) / size) * segments);
  const afj = Math.round(((airfield.z + half) / size) * segments);
  const afIdx = Math.min(grid * grid - 1, Math.max(0, afj * grid + afi));
  airfield.y = heights[afIdx] ?? airfield.y;

  const planeGeo = new THREE.PlaneGeometry(size, size, segments, segments);
  planeGeo.rotateX(-Math.PI / 2);
  const pos = planeGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, heights[i] ?? SEA_LEVEL);
  }
  pos.needsUpdate = true;
  planeGeo.computeVertexNormals();
  const geo: THREE.BufferGeometry = planeGeo.toNonIndexed();
  planeGeo.dispose();

  const p = geo.attributes.position;
  const colors = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const d = new THREE.Vector3();

  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i);
    b.fromBufferAttribute(p, i + 1);
    d.fromBufferAttribute(p, i + 2);
    const avgY = (a.y + b.y + d.y) / 3;
    const e1 = new THREE.Vector3().subVectors(b, a);
    const e2 = new THREE.Vector3().subVectors(d, a);
    const slope = e1.cross(e2).normalize().y;
    const slopeAmt = 1 - Math.abs(slope);
    const mx = (a.x + b.x + d.x) / 3 / size;
    const mz = (a.z + b.z + d.z) / 3 / size;
    const moisture = (n3(mx * 4.2, mz * 4.2) + 1) * 0.5;
    const cx = (a.x + b.x + d.x) / 3;
    const cz = (a.z + b.z + d.z) / 3;
    if (inAirfield(airfield, cx, cz, 2)) {
      const fx = -Math.sin(airfield.yaw);
      const fz = -Math.cos(airfield.yaw);
      const rx = Math.cos(airfield.yaw);
      const rz = -Math.sin(airfield.yaw);
      const dx = cx - airfield.x;
      const dz = cz - airfield.z;
      const across = dx * rx + dz * rz;
      c.copy(Math.abs(across) < airfield.width * 0.52 ? ASPHALT : APRON);
    } else {
      colorFor(avgY, slopeAmt * 2.2, moisture, c);
    }
    for (let k = 0; k < 3; k++) {
      const idx = (i + k) * 3;
      colors[idx] = c.r;
      colors[idx + 1] = c.g;
      colors[idx + 2] = c.b;
    }
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();

  const sample = (x: number, z: number): number => {
    const u = ((x + half) / size) * segments;
    const v = ((z + half) / size) * segments;
    if (u < 0 || v < 0 || u > segments || v > segments) return SEA_LEVEL - 2;
    const i = Math.min(segments - 1, Math.max(0, Math.floor(u)));
    const j = Math.min(segments - 1, Math.max(0, Math.floor(v)));
    const fu = u - i;
    const fv = v - j;
    const h00 = heights[j * grid + i] ?? SEA_LEVEL;
    const h10 = heights[j * grid + i + 1] ?? SEA_LEVEL;
    const h01 = heights[(j + 1) * grid + i] ?? SEA_LEVEL;
    const h11 = heights[(j + 1) * grid + i + 1] ?? SEA_LEVEL;
    return h00 * (1 - fu) * (1 - fv) + h10 * fu * (1 - fv) + h01 * (1 - fu) * fv + h11 * fu * fv;
  };

  const peak = new THREE.Vector3(
    (peakI / segments) * size - half,
    maxHeight,
    (peakJ / segments) * size - half,
  );

  const trees: PropInstance[] = [];
  const rocks: PropInstance[] = [];
  for (let n = 0; n < 1400 && trees.length < 260; n++) {
    const x = randRange(rng, -half * 0.82, half * 0.82);
    const z = randRange(rng, -half * 0.82, half * 0.82);
    if (inAirfield(airfield, x, z, 10)) continue;
    const y = sample(x, z);
    const t = (y - SEA_LEVEL) / 58;
    if (t < 0.07 || t > 0.52) continue;
    const slope = Math.hypot(sample(x + 2.4, z) - sample(x - 2.4, z), sample(x, z + 2.4) - sample(x, z - 2.4)) / 4.8;
    if (slope > 0.55) continue;
    trees.push({
      x,
      y,
      z,
      scale: randRange(rng, 0.85, 1.7) * (t < 0.22 ? 0.75 : 1),
      rot: rng() * Math.PI * 2,
    });
  }
  for (let n = 0; n < 500 && rocks.length < 90; n++) {
    const x = randRange(rng, -half * 0.78, half * 0.78);
    const z = randRange(rng, -half * 0.78, half * 0.78);
    if (inAirfield(airfield, x, z, 10)) continue;
    const y = sample(x, z);
    const t = (y - SEA_LEVEL) / 58;
    if (t < 0.28 || t > 0.82) continue;
    rocks.push({
      x,
      y,
      z,
      scale: randRange(rng, 0.6, 2.1),
      rot: rng() * Math.PI * 2,
    });
  }

  const clouds: PropInstance[] = [];
  for (let n = 0; n < 16; n++) {
    clouds.push({
      x: randRange(rng, -half * 0.9, half * 0.9),
      y: randRange(rng, 48, 78),
      z: randRange(rng, -half * 0.9, half * 0.9),
      scale: randRange(rng, 6, 14),
      rot: rng() * Math.PI * 2,
    });
  }

  return {
    geometry: geo,
    size,
    segments,
    seaLevel: SEA_LEVEL,
    maxHeight,
    peak,
    airfield,
    sample,
    trees,
    rocks,
    clouds,
    dispose: () => {
      geo.dispose();
    },
  };
}
