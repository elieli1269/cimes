import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as SRGBColorSpace, C as MeshLambertMaterial, D as Points, E as PlaneGeometry, F as Vector3, M as SphereGeometry, N as Timer, O as PointsMaterial, P as TorusGeometry, S as MeshBasicMaterial, T as PerspectiveCamera, _ as InstancedMesh, a as BufferGeometry, b as MathUtils, c as ConeGeometry, d as EdgesGeometry, f as Euler, g as IcosahedronGeometry, h as HemisphereLight, i as BufferAttribute, j as Scene, k as Quaternion, l as CylinderGeometry, m as Group, n as AmbientLight, o as CircleGeometry, p as Fog, r as BoxGeometry, s as Color, t as WebGLRenderer, u as DirectionalLight, v as LineBasicMaterial, w as Object3D, x as Mesh, y as LineSegments } from "../_libs/three.mjs";
import { t as createNoise2D } from "../_libs/simplex-noise.mjs";
import { t as create } from "../_libs/zustand.mjs";
import { a as Mountain, c as Grid2x2, i as MousePointer2, l as Gauge, n as Sun, o as Moon, r as Plane, s as Keyboard, u as ChevronUp } from "../_libs/lucide-react.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TerrainApp-DUUAxJ-0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GAME_CODES = /* @__PURE__ */ new Set([
	"KeyW",
	"KeyA",
	"KeyS",
	"KeyD",
	"KeyE",
	"KeyC",
	"KeyF",
	"KeyN",
	"KeyL",
	"KeyR",
	"Space",
	"ShiftLeft",
	"ShiftRight",
	"ControlLeft",
	"ControlRight",
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
]);
var Input = class {
	keys = /* @__PURE__ */ new Set();
	injected = null;
	lookDx = 0;
	lookDy = 0;
	touchX = 0;
	touchY = 0;
	touchClimb = 0;
	touchBoost = false;
	touchInteract = false;
	dragging = false;
	pointerLocked = false;
	just = /* @__PURE__ */ new Set();
	prev = /* @__PURE__ */ new Set();
	unbind = [];
	attach(canvas) {
		const onKeyDown = (e) => {
			if (e.repeat) {
				if (GAME_CODES.has(e.code)) e.preventDefault();
				return;
			}
			this.keys.add(e.code);
			if (GAME_CODES.has(e.code)) e.preventDefault();
		};
		const onKeyUp = (e) => {
			this.keys.delete(e.code);
		};
		const clear = () => {
			this.keys.clear();
			this.touchX = 0;
			this.touchY = 0;
			this.touchClimb = 0;
			this.touchBoost = false;
			this.touchInteract = false;
			this.dragging = false;
		};
		const onMouseMove = (e) => {
			if (this.pointerLocked || this.dragging) {
				this.lookDx += e.movementX;
				this.lookDy += e.movementY;
			}
		};
		const onPointerDown = (e) => {
			if (e.button !== 0) return;
			if (e.target !== canvas) return;
			this.dragging = true;
			try {
				canvas.setPointerCapture(e.pointerId);
			} catch {}
		};
		const onPointerUp = (e) => {
			this.dragging = false;
			try {
				canvas.releasePointerCapture(e.pointerId);
			} catch {}
		};
		const onLockChange = () => {
			this.pointerLocked = document.pointerLockElement === canvas;
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
		window.addEventListener("blur", clear);
		document.addEventListener("visibilitychange", () => {
			if (document.hidden) clear();
		});
		window.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("pointerdown", onPointerDown);
		canvas.addEventListener("pointerup", onPointerUp);
		canvas.addEventListener("pointercancel", onPointerUp);
		document.addEventListener("pointerlockchange", onLockChange);
		this.unbind.push(() => window.removeEventListener("keydown", onKeyDown), () => window.removeEventListener("keyup", onKeyUp), () => window.removeEventListener("blur", clear), () => window.removeEventListener("mousemove", onMouseMove), () => canvas.removeEventListener("pointerdown", onPointerDown), () => canvas.removeEventListener("pointerup", onPointerUp), () => canvas.removeEventListener("pointercancel", onPointerUp), () => document.removeEventListener("pointerlockchange", onLockChange));
	}
	dispose() {
		for (const fn of this.unbind) fn();
		this.unbind.length = 0;
		this.keys.clear();
	}
	beginFrame() {
		const active = this.activeCodes();
		this.just.clear();
		for (const code of active) if (!this.prev.has(code)) this.just.add(code);
		this.prev = active;
	}
	activeCodes() {
		if (this.injected) return new Set(this.injected);
		return new Set(this.keys);
	}
	isDown(code) {
		if (this.injected) return this.injected.includes(code);
		return this.keys.has(code);
	}
	justPressed(code) {
		return this.just.has(code);
	}
	consumeLook() {
		const dx = this.lookDx;
		const dy = this.lookDy;
		this.lookDx = 0;
		this.lookDy = 0;
		return {
			dx,
			dy
		};
	}
	setKeys(codes) {
		this.injected = codes.length ? [...codes] : null;
	}
	wishDir() {
		let x = this.touchX;
		let z = this.touchY;
		if (this.isDown("KeyW") || this.isDown("ArrowUp")) z += 1;
		if (this.isDown("KeyS") || this.isDown("ArrowDown")) z -= 1;
		if (this.isDown("KeyD") || this.isDown("ArrowRight")) x += 1;
		if (this.isDown("KeyA") || this.isDown("ArrowLeft")) x -= 1;
		let y = this.touchClimb;
		if (this.isDown("Space")) y += 1;
		if (this.isDown("ControlLeft") || this.isDown("ControlRight") || this.isDown("KeyC")) y -= 1;
		const boost = this.touchBoost || this.isDown("ShiftLeft") || this.isDown("ShiftRight");
		const mag = Math.hypot(x, z);
		if (mag > 1) {
			x /= mag;
			z /= mag;
		}
		y = Math.max(-1, Math.min(1, y));
		return {
			x,
			z,
			y,
			boost
		};
	}
};
function mat(color, opts) {
	return new MeshLambertMaterial({
		color,
		flatShading: opts?.flat !== false,
		emissive: opts?.emissive ? new Color(opts.emissive) : void 0,
		emissiveIntensity: opts?.emissive ? .35 : 0
	});
}
function addBox(parent, w, h, d, color, x, y, z, rx = 0, ry = 0, rz = 0) {
	const mesh = new Mesh(new BoxGeometry(w, h, d), mat(color));
	mesh.position.set(x, y, z);
	mesh.rotation.set(rx, ry, rz);
	parent.add(mesh);
	return mesh;
}
/** Low-poly pilot. Local forward is −Z, feet at y = 0. */
function createCharacter() {
	const g = new Group();
	g.name = "character";
	addBox(g, .42, .58, .28, 12965068, 0, 1.12, 0);
	addBox(g, .32, .32, .3, 12886138, 0, 1.58, .02);
	addBox(g, .34, .1, .34, 2765614, 0, 1.76, 0);
	const armL = addBox(g, .14, .52, .14, 4017988, -.3, 1.08, 0);
	const armR = addBox(g, .14, .52, .14, 4017988, .3, 1.08, 0);
	const legL = addBox(g, .16, .7, .18, 2897200, -.12, .36, 0);
	const legR = addBox(g, .16, .7, .18, 2897200, .12, .36, 0);
	armL.name = "armL";
	armR.name = "armR";
	legL.name = "legL";
	legR.name = "legR";
	return g;
}
/** Propeller plane, nose toward −Z, wheels on y = 0. */
function createPlane(livery = 15265513) {
	const g = new Group();
	g.name = "plane";
	addBox(g, .72, .56, 3.6, livery, 0, 1.05, -.15);
	addBox(g, .5, .42, .7, 9149072, 0, 1.18, -2.05);
	addBox(g, .62, .36, .7, 1844767, 0, 1.28, .2);
	addBox(g, 5.4, .08, 1.15, 4017988, 0, 1.02, -.35);
	addBox(g, .12, .08, 1.05, 12887412, 2.55, 1.06, -.35);
	addBox(g, .12, .08, 1.05, 12887412, -2.55, 1.06, -.35);
	addBox(g, 1.6, .07, .7, 4017988, 0, 1.12, 1.55);
	addBox(g, .08, .85, .55, 4017988, 0, 1.55, 1.55);
	addBox(g, .22, .22, .22, 2765614, 0, .22, -.9);
	addBox(g, .16, .28, .16, 2765614, -.38, .2, .85);
	addBox(g, .16, .28, .16, 2765614, .38, .2, .85);
	const prop = new Group();
	prop.name = "prop";
	prop.position.set(0, 1.08, -2.42);
	const blade = new Mesh(new BoxGeometry(.12, 1.35, .08), mat(1844767));
	const blade2 = blade.clone();
	blade2.rotation.z = Math.PI / 2;
	prop.add(blade, blade2);
	g.add(prop);
	return g;
}
/** Utility jeep, nose toward −Z. */
function createJeep() {
	const g = new Group();
	g.name = "jeep";
	addBox(g, 1.35, .42, 2.2, 4873274, 0, .62, 0);
	addBox(g, 1.2, .5, 1.05, 4017970, 0, 1.05, .15);
	addBox(g, 1.22, .08, .08, 1844767, 0, 1.32, -.35);
	addBox(g, .38, .38, .28, 2765614, -.55, .28, .72);
	addBox(g, .38, .38, .28, 2765614, .55, .28, .72);
	addBox(g, .38, .38, .28, 2765614, -.55, .28, -.72);
	addBox(g, .38, .38, .28, 2765614, .55, .28, -.72);
	addBox(g, .5, .12, .22, 12887412, 0, .55, -1.15);
	return g;
}
function createHangar() {
	const g = new Group();
	addBox(g, 10, 4.2, 8, 6055264, 0, 2.1, 0);
	addBox(g, 8.2, 3.2, .2, 1711900, 0, 1.7, 4.05);
	addBox(g, 10.3, .18, 8.3, 3818304, 0, 4.28, 0);
	return g;
}
function createTower() {
	const g = new Group();
	addBox(g, 2.2, 6.5, 2.2, 6976366, 0, 3.25, 0);
	addBox(g, 3.4, 1.6, 3.4, 12965068, 0, 7.1, 0);
	addBox(g, 3.6, .12, 3.6, 2765614, 0, 7.95, 0);
	addBox(g, .12, 1.4, .12, 9149072, 0, 8.7, 0);
	return g;
}
function createWindsock() {
	const g = new Group();
	const pole = new Mesh(new CylinderGeometry(.06, .08, 4.2, 6), mat(9149072));
	pole.position.y = 2.1;
	g.add(pole);
	const sock = new Mesh(new ConeGeometry(.28, 1.4, 5), mat(12887412));
	sock.rotation.z = Math.PI / 2;
	sock.position.set(.85, 3.85, 0);
	g.add(sock);
	return g;
}
function createCheckpointRing(active) {
	const mesh = new Mesh(new TorusGeometry(4.2, .28, 8, 20), new MeshLambertMaterial({
		color: active ? 15265513 : 6976366,
		emissive: active ? 12965068 : 0,
		emissiveIntensity: active ? .45 : 0,
		flatShading: true
	}));
	mesh.rotation.y = Math.PI / 2;
	return mesh;
}
function disposeObject(root) {
	root.traverse((obj) => {
		const mesh = obj;
		if (mesh.isMesh) {
			mesh.geometry.dispose();
			const m = mesh.material;
			if (Array.isArray(m)) m.forEach((x) => x.dispose());
			else m.dispose();
		}
	});
}
function animateWalk(character, speed, _dt, t) {
	const legL = character.getObjectByName("legL");
	const legR = character.getObjectByName("legR");
	const armL = character.getObjectByName("armL");
	const armR = character.getObjectByName("armR");
	const amp = Math.min(.7, speed * .12);
	const swing = Math.sin(t * 8) * amp;
	if (legL) legL.rotation.x = swing;
	if (legR) legR.rotation.x = -swing;
	if (armL) armL.rotation.x = -swing * .7;
	if (armR) armR.rotation.x = swing * .7;
}
function localOnField(spec, along, across) {
	const fx = -Math.sin(spec.yaw);
	const fz = -Math.cos(spec.yaw);
	const rx = Math.cos(spec.yaw);
	const rz = -Math.sin(spec.yaw);
	return {
		x: spec.x + fx * along + rx * across,
		z: spec.z + fz * along + rz * across
	};
}
function inAirfield(spec, x, z, pad = 6) {
	const fx = -Math.sin(spec.yaw);
	const fz = -Math.cos(spec.yaw);
	const rx = Math.cos(spec.yaw);
	const rz = -Math.sin(spec.yaw);
	const dx = x - spec.x;
	const dz = z - spec.z;
	const along = dx * fx + dz * fz;
	const across = dx * rx + dz * rz;
	return Math.abs(along) < spec.length * .5 + pad && Math.abs(across) < spec.width * .5 + 16 + pad;
}
function pickAirfield(sample, sea) {
	const length = 108;
	const width = 12;
	let best = null;
	let bestScore = Infinity;
	for (let k = 0; k < 16; k++) {
		const ang = k / 16 * Math.PI * 2;
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
		for (const a of [
			-40,
			0,
			40
		]) for (const c of [-5, 5]) {
			const h = sample(x + fx * a + rx * c, z + fz * a + rz * c);
			slope += Math.abs(h - y);
			if (h < sea + 1.5) wet += 1;
		}
		if (wet > 0) continue;
		const score = slope;
		if (score < bestScore) {
			bestScore = score;
			best = {
				x,
				y,
				z,
				yaw,
				length,
				width
			};
		}
	}
	return best;
}
function flattenAirfield(heights, grid, size, spec) {
	const half = size / 2;
	const segments = grid - 1;
	const fx = -Math.sin(spec.yaw);
	const fz = -Math.cos(spec.yaw);
	const rx = Math.cos(spec.yaw);
	const rz = -Math.sin(spec.yaw);
	for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) {
		const x = i / segments * size - half;
		const z = j / segments * size - half;
		const dx = x - spec.x;
		const dz = z - spec.z;
		const along = dx * fx + dz * fz;
		const across = dx * rx + dz * rz;
		if (!(Math.abs(along) < spec.length * .52 && Math.abs(across) < spec.width * .5 + 18)) continue;
		const edge = Math.max(Math.abs(along) / (spec.length * .52), Math.abs(across) / (spec.width * .5 + 18));
		const k = edge > .72 ? (1 - edge) / .28 : 1;
		const idx = j * grid + i;
		const cur = heights[idx] ?? spec.y;
		heights[idx] = cur + (spec.y - cur) * Math.max(0, Math.min(1, k));
	}
}
function buildAirfieldScene(spec) {
	const group = new Group();
	group.position.set(spec.x, spec.y, spec.z);
	group.rotation.y = spec.yaw;
	const asphalt = new MeshLambertMaterial({
		color: 3817276,
		flatShading: true
	});
	const paint = new MeshLambertMaterial({
		color: 12887412,
		flatShading: true
	});
	const apronMat = new MeshLambertMaterial({
		color: 4540998,
		flatShading: true
	});
	const runway = new Mesh(new BoxGeometry(spec.width, .16, spec.length), asphalt);
	runway.position.y = .05;
	group.add(runway);
	for (let i = -5; i <= 5; i++) {
		const dash = new Mesh(new BoxGeometry(.28, .04, 3.2), paint);
		dash.position.set(0, .15, i * 9);
		group.add(dash);
	}
	const apron = new Mesh(new BoxGeometry(38, .12, 28), apronMat);
	apron.position.set(18, .04, -8);
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
	sock.position.set(-9, 0, spec.length * .42);
	group.add(sock);
	const playerPlane = createPlane(15265513);
	playerPlane.position.set(0, 0, -spec.length * .38);
	group.add(playerPlane);
	const parked = [];
	[
		12043452,
		14140584,
		10135704
	].forEach((color, i) => {
		const p = createPlane(color);
		p.position.set(14 + i % 2 * 2, 0, -18 + i * 9);
		p.rotation.y = Math.PI * .5;
		group.add(p);
		parked.push(p);
	});
	const jeep = createJeep();
	jeep.position.set(10, 0, -spec.length * .32);
	jeep.rotation.y = -.4;
	group.add(jeep);
	for (let s = -1; s <= 1; s += 2) for (let k = -4; k <= 4; k++) {
		const light = new Mesh(new BoxGeometry(.18, .22, .18), new MeshLambertMaterial({
			color: 15265513,
			emissive: 12965068,
			emissiveIntensity: .4,
			flatShading: true
		}));
		light.position.set(s * (spec.width * .5 + .4), .18, k * 11);
		group.add(light);
	}
	const sign = new Mesh(new BoxGeometry(.12, 2.4, 3.4), new MeshLambertMaterial({
		color: 2765614,
		flatShading: true
	}));
	sign.position.set(-12, 1.2, spec.length * .46);
	group.add(sign);
	return {
		group,
		playerPlane,
		jeep,
		parked
	};
}
/** Fast seeded PRNG in [0, 1). */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = a + 1831565813 | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function randRange(rng, a, b) {
	return a + rng() * (b - a);
}
var SEA_LEVEL = 2.6;
var WATER = new Color(1731450);
var SAND = new Color(12890508);
var GRASS = new Color(6986312);
var FOREST = new Color(3959608);
var ROCK = new Color(8024940);
var SNOW = new Color(15265522);
var SLOPE_ROCK = new Color(6183252);
var ASPHALT = new Color(3817276);
var APRON = new Color(4870220);
function smoothstep(edge0, edge1, x) {
	const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
	return t * t * (3 - 2 * t);
}
function fbm(noise, x, z, octaves) {
	let amp = 1;
	let freq = 1;
	let sum = 0;
	let norm = 0;
	for (let i = 0; i < octaves; i++) {
		sum += amp * noise(x * freq, z * freq);
		norm += amp;
		amp *= .5;
		freq *= 2.05;
	}
	return sum / norm;
}
function heightAt(nx, nz, n1, n2) {
	const warpX = n2(nx * 2.1, nz * 2.1) * .14;
	const warpZ = n2(nx * 2.1 + 18, nz * 2.1 - 7) * .14;
	const e = (fbm(n1, nx * 1.7 + warpX, nz * 1.7 + warpZ, 5) + 1) * .5;
	const ridgeRaw = 1 - Math.abs(n1(nx * 3.4 + warpX, nz * 3.4 + warpZ));
	const mountains = Math.pow(ridgeRaw, 2.05);
	const island = 1 - smoothstep(.26, .49, Math.hypot(nx, nz));
	let h = (e * .5 + mountains * .5) * island;
	h = Math.pow(Math.max(h, 0), 1.18);
	return h * 64 - 6;
}
function colorFor(h, slope, moisture, target) {
	if (h <= 2.8000000000000003) {
		target.copy(WATER);
		return;
	}
	const t = Math.max(0, (h - SEA_LEVEL) / 58);
	if (t < .055) target.copy(SAND);
	else if (t < .26) target.copy(GRASS).lerp(FOREST, moisture * .45);
	else if (t < .5) target.copy(FOREST).lerp(ROCK, smoothstep(.38, .5, t));
	else if (t < .76) target.copy(ROCK).lerp(SNOW, smoothstep(.62, .76, t));
	else target.copy(SNOW);
	const cliff = smoothstep(.55, 1.6, slope);
	target.lerp(SLOPE_ROCK, cliff * .85);
	const shade = 1 - cliff * .22 - (1 - moisture) * .06;
	target.multiplyScalar(shade);
}
function buildTerrain(seed) {
	const rng = mulberry32(seed);
	const n1 = createNoise2D(mulberry32(seed ^ 2654435769));
	const n2 = createNoise2D(mulberry32(seed ^ 2246822507));
	const n3 = createNoise2D(mulberry32(seed ^ 3266489909));
	const size = 380;
	const segments = 72;
	const grid = 73;
	const heights = /* @__PURE__ */ new Float32Array(5329);
	const half = size / 2;
	let maxHeight = -Infinity;
	let peakI = 0;
	let peakJ = 0;
	for (let j = 0; j < grid; j++) for (let i = 0; i < grid; i++) {
		let h = heightAt(i / segments - .5, j / segments - .5, n1, n2);
		if (h < 2.6) h = 2.25;
		heights[j * grid + i] = h;
		if (h > maxHeight) {
			maxHeight = h;
			peakI = i;
			peakJ = j;
		}
	}
	const probe = (x, z) => {
		const u = (x + half) / size * segments;
		const v = (z + half) / size * segments;
		if (u < 0 || v < 0 || u > segments || v > segments) return .6000000000000001;
		const i = Math.min(71, Math.max(0, Math.floor(u)));
		return heights[Math.min(71, Math.max(0, Math.floor(v))) * grid + i] ?? 2.6;
	};
	let airfield = pickAirfield(probe, SEA_LEVEL);
	if (!airfield) airfield = {
		x: 0,
		y: Math.max(probe(0, 90), 6.6),
		z: 90,
		yaw: 0,
		length: 108,
		width: 12
	};
	flattenAirfield(heights, grid, size, airfield);
	const afi = Math.round((airfield.x + half) / size * segments);
	const afj = Math.round((airfield.z + half) / size * segments);
	const afIdx = Math.min(5328, Math.max(0, afj * grid + afi));
	airfield.y = heights[afIdx] ?? airfield.y;
	const planeGeo = new PlaneGeometry(size, size, segments, segments);
	planeGeo.rotateX(-Math.PI / 2);
	const pos = planeGeo.attributes.position;
	for (let i = 0; i < pos.count; i++) pos.setY(i, heights[i] ?? 2.6);
	pos.needsUpdate = true;
	planeGeo.computeVertexNormals();
	const geo = planeGeo.toNonIndexed();
	planeGeo.dispose();
	const p = geo.attributes.position;
	const colors = new Float32Array(p.count * 3);
	const c = new Color();
	const a = new Vector3();
	const b = new Vector3();
	const d = new Vector3();
	for (let i = 0; i < p.count; i += 3) {
		a.fromBufferAttribute(p, i);
		b.fromBufferAttribute(p, i + 1);
		d.fromBufferAttribute(p, i + 2);
		const avgY = (a.y + b.y + d.y) / 3;
		const e1 = new Vector3().subVectors(b, a);
		const e2 = new Vector3().subVectors(d, a);
		const slope = e1.cross(e2).normalize().y;
		const slopeAmt = 1 - Math.abs(slope);
		const mx = (a.x + b.x + d.x) / 3 / size;
		const mz = (a.z + b.z + d.z) / 3 / size;
		const moisture = (n3(mx * 4.2, mz * 4.2) + 1) * .5;
		const cx = (a.x + b.x + d.x) / 3;
		const cz = (a.z + b.z + d.z) / 3;
		if (inAirfield(airfield, cx, cz, 2)) {
			-Math.sin(airfield.yaw);
			-Math.cos(airfield.yaw);
			const rx = Math.cos(airfield.yaw);
			const rz = -Math.sin(airfield.yaw);
			const dx = cx - airfield.x;
			const dz = cz - airfield.z;
			const across = dx * rx + dz * rz;
			c.copy(Math.abs(across) < airfield.width * .52 ? ASPHALT : APRON);
		} else colorFor(avgY, slopeAmt * 2.2, moisture, c);
		for (let k = 0; k < 3; k++) {
			const idx = (i + k) * 3;
			colors[idx] = c.r;
			colors[idx + 1] = c.g;
			colors[idx + 2] = c.b;
		}
	}
	geo.setAttribute("color", new BufferAttribute(colors, 3));
	geo.computeVertexNormals();
	geo.computeBoundingSphere();
	const sample = (x, z) => {
		const u = (x + half) / size * segments;
		const v = (z + half) / size * segments;
		if (u < 0 || v < 0 || u > segments || v > segments) return .6000000000000001;
		const i = Math.min(71, Math.max(0, Math.floor(u)));
		const j = Math.min(71, Math.max(0, Math.floor(v)));
		const fu = u - i;
		const fv = v - j;
		const h00 = heights[j * grid + i] ?? 2.6;
		const h10 = heights[j * grid + i + 1] ?? 2.6;
		const h01 = heights[(j + 1) * grid + i] ?? 2.6;
		const h11 = heights[(j + 1) * grid + i + 1] ?? 2.6;
		return h00 * (1 - fu) * (1 - fv) + h10 * fu * (1 - fv) + h01 * (1 - fu) * fv + h11 * fu * fv;
	};
	const peak = new Vector3(peakI / segments * size - half, maxHeight, peakJ / segments * size - half);
	const trees = [];
	const rocks = [];
	for (let n = 0; n < 1400 && trees.length < 260; n++) {
		const x = randRange(rng, -190 * .82, half * .82);
		const z = randRange(rng, -190 * .82, half * .82);
		if (inAirfield(airfield, x, z, 10)) continue;
		const y = sample(x, z);
		const t = (y - SEA_LEVEL) / 58;
		if (t < .07 || t > .52) continue;
		if (Math.hypot(sample(x + 2.4, z) - sample(x - 2.4, z), sample(x, z + 2.4) - sample(x, z - 2.4)) / 4.8 > .55) continue;
		trees.push({
			x,
			y,
			z,
			scale: randRange(rng, .85, 1.7) * (t < .22 ? .75 : 1),
			rot: rng() * Math.PI * 2
		});
	}
	for (let n = 0; n < 500 && rocks.length < 90; n++) {
		const x = randRange(rng, -190 * .78, half * .78);
		const z = randRange(rng, -190 * .78, half * .78);
		if (inAirfield(airfield, x, z, 10)) continue;
		const y = sample(x, z);
		const t = (y - SEA_LEVEL) / 58;
		if (t < .28 || t > .82) continue;
		rocks.push({
			x,
			y,
			z,
			scale: randRange(rng, .6, 2.1),
			rot: rng() * Math.PI * 2
		});
	}
	const clouds = [];
	for (let n = 0; n < 16; n++) clouds.push({
		x: randRange(rng, -171, half * .9),
		y: randRange(rng, 48, 78),
		z: randRange(rng, -171, half * .9),
		scale: randRange(rng, 6, 14),
		rot: rng() * Math.PI * 2
	});
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
		}
	};
}
function loadFlag(key, fallback) {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(key);
		if (raw === "1") return true;
		if (raw === "0") return false;
	} catch {}
	return fallback;
}
function saveFlag(key, value) {
	try {
		window.localStorage.setItem(key, value ? "1" : "0");
	} catch {}
}
function loadBest() {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem("cimes.best");
		if (!raw) return null;
		const n = Number(raw);
		return Number.isFinite(n) && n > 0 ? n : null;
	} catch {
		return null;
	}
}
var INITIAL_SEED = 42817;
var EMPTY_HUD = {
	altitude: 0,
	agl: 0,
	speed: 0,
	heading: 0,
	throttle: 0,
	airborne: false,
	mode: "foot",
	ringsDone: 0,
	ringsTotal: 6,
	time: 0,
	prompt: ""
};
var useGameStore = create((set) => ({
	ready: false,
	playing: false,
	phase: "menu",
	pointerLocked: false,
	wireframe: loadFlag("cimes.wireframe", false),
	night: loadFlag("cimes.night", false),
	seed: INITIAL_SEED,
	hud: EMPTY_HUD,
	bestTime: loadBest(),
	setReady: (ready) => set({ ready }),
	setPlaying: (playing) => set({ playing }),
	setPhase: (phase) => set({ phase }),
	setPointerLocked: (pointerLocked) => set({ pointerLocked }),
	setWireframe: (wireframe) => {
		saveFlag("cimes.wireframe", wireframe);
		set({ wireframe });
	},
	toggleWireframe: () => set((s) => {
		const wireframe = !s.wireframe;
		saveFlag("cimes.wireframe", wireframe);
		return { wireframe };
	}),
	setNight: (night) => {
		saveFlag("cimes.night", night);
		set({ night });
	},
	toggleNight: () => set((s) => {
		const night = !s.night;
		saveFlag("cimes.night", night);
		return { night };
	}),
	setSeed: (seed) => set({ seed }),
	setHud: (hud) => set({ hud }),
	setBestTime: (bestTime) => {
		try {
			window.localStorage.setItem("cimes.best", String(bestTime));
		} catch {}
		set({ bestTime });
	}
}));
var LOOK_SENS = .00215;
var TOUCH_LOOK_SENS = .0034;
var STEP = 1 / 60;
var RING_TOTAL = 6;
var DAY = {
	bg: new Color(9356504),
	fog: new Color(12967142),
	ambient: .4,
	hemiSky: new Color(12047590),
	hemiGround: new Color(4017970),
	hemi: .62,
	sun: 1.55,
	sunColor: new Color(16773584),
	sunDir: new Vector3(.45, .82, .28).normalize(),
	wire: new Color(1844767),
	cloud: new Color(15988472)
};
var NIGHT = {
	bg: new Color(659480),
	fog: new Color(1054758),
	ambient: .055,
	hemiSky: new Color(1714236),
	hemiGround: new Color(659984),
	hemi: .22,
	sun: .32,
	sunColor: new Color(12965092),
	sunDir: new Vector3(-.38, .78, -.32).normalize(),
	wire: new Color(12965068),
	cloud: new Color(3818840)
};
function createEngine(canvas) {
	const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	const input = new Input();
	input.attach(canvas);
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		powerPreference: "high-performance"
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = 0;
	renderer.setClearColor(DAY.bg, 1);
	const scene = new Scene();
	const bgColor = DAY.bg.clone();
	scene.background = bgColor;
	scene.fog = new Fog(DAY.fog.clone(), 70, 360);
	const camera = new PerspectiveCamera(62, 1, .25, 520);
	camera.rotation.order = "YXZ";
	scene.add(camera);
	const ambient = new AmbientLight(16777215, DAY.ambient);
	const hemi = new HemisphereLight(DAY.hemiSky, DAY.hemiGround, DAY.hemi);
	const sun = new DirectionalLight(DAY.sunColor, DAY.sun);
	sun.position.copy(DAY.sunDir).multiplyScalar(180);
	scene.add(ambient, hemi, sun);
	const sunDiscMat = new MeshBasicMaterial({
		color: 16774872,
		fog: false,
		depthWrite: false
	});
	const sunDisc = new Mesh(new CircleGeometry(7, 24), sunDiscMat);
	scene.add(sunDisc);
	const skyGeo = makeSkyDome();
	const skyMat = new MeshBasicMaterial({
		vertexColors: true,
		side: 1,
		fog: false,
		depthWrite: false
	});
	const sky = new Mesh(skyGeo.day, skyMat);
	scene.add(sky);
	const nightSkyGeo = skyGeo.night;
	const stars = makeStars();
	stars.visible = false;
	scene.add(stars);
	const landMat = new MeshLambertMaterial({
		vertexColors: true,
		flatShading: true
	});
	const wireMat = new LineBasicMaterial({
		color: DAY.wire,
		transparent: true,
		opacity: .32
	});
	const waterMat = new MeshLambertMaterial({
		color: 1731450,
		transparent: true,
		opacity: .78
	});
	const pineMat = new MeshLambertMaterial({
		color: 3103282,
		flatShading: true
	});
	const trunkMat = new MeshLambertMaterial({
		color: 4863784,
		flatShading: true
	});
	const rockMat = new MeshLambertMaterial({
		color: 7235682,
		flatShading: true
	});
	const cloudMat = new MeshLambertMaterial({
		color: DAY.cloud,
		flatShading: true,
		transparent: true,
		opacity: .88
	});
	const terrainMesh = new Mesh(new BufferGeometry(), landMat);
	const wireLines = new LineSegments(new BufferGeometry(), wireMat);
	wireLines.visible = useGameStore.getState().wireframe;
	const water = new Mesh(new CircleGeometry(380 * .72, 48), waterMat);
	water.rotation.x = -Math.PI / 2;
	water.position.y = SEA_LEVEL;
	scene.add(terrainMesh, wireLines, water);
	const pineGeo = new ConeGeometry(1.05, 2.6, 5);
	pineGeo.translate(0, 1.55, 0);
	const trunkGeo = new CylinderGeometry(.12, .18, .7, 5);
	trunkGeo.translate(0, .35, 0);
	const rockGeo = new IcosahedronGeometry(1, 0);
	const cloudGeo = new IcosahedronGeometry(1, 0);
	cloudGeo.scale(1.6, .55, 1.1);
	const pines = new InstancedMesh(pineGeo, pineMat, 280);
	const trunks = new InstancedMesh(trunkGeo, trunkMat, 280);
	const rocks = new InstancedMesh(rockGeo, rockMat, 100);
	const clouds = new InstancedMesh(cloudGeo, cloudMat, 20);
	pines.frustumCulled = false;
	trunks.frustumCulled = false;
	rocks.frustumCulled = false;
	clouds.frustumCulled = false;
	scene.add(pines, trunks, rocks, clouds);
	const character = createCharacter();
	scene.add(character);
	let airfieldGroup = null;
	let playerPlane = null;
	let jeep = null;
	const ringsGroup = new Group();
	scene.add(ringsGroup);
	let world = null;
	let nightBlend = useGameStore.getState().night ? 1 : 0;
	let playing = false;
	let mode = "foot";
	let yaw = 0;
	let pitch = 0;
	let roll = 0;
	let throttle = 0;
	let airborne = false;
	let elapsed = 0;
	let ringIndex = 0;
	let prompt = "";
	let pendingInteract = false;
	const pos = new Vector3();
	const vel = new Vector3();
	const camPos = new Vector3();
	const parkedPlane = new Vector3();
	const parkedJeep = new Vector3();
	let parkedPlaneYaw = 0;
	let parkedJeepYaw = 0;
	const ringTargets = [];
	let orbit = .6;
	let hudAcc = 0;
	let walkT = 0;
	let disposed = false;
	const _fwd = new Vector3();
	const _right = new Vector3();
	const _wish = new Vector3();
	const _dummy = new Object3D();
	const _look = new Vector3();
	const _sunPos = new Vector3();
	const _desired = new Vector3();
	function layoutInstances(data) {
		pines.count = data.trees.length;
		trunks.count = data.trees.length;
		data.trees.forEach((t, i) => {
			_dummy.position.set(t.x, t.y, t.z);
			_dummy.rotation.set(0, t.rot, 0);
			_dummy.scale.setScalar(t.scale);
			_dummy.updateMatrix();
			pines.setMatrixAt(i, _dummy.matrix);
			trunks.setMatrixAt(i, _dummy.matrix);
		});
		pines.instanceMatrix.needsUpdate = true;
		trunks.instanceMatrix.needsUpdate = true;
		rocks.count = data.rocks.length;
		data.rocks.forEach((r, i) => {
			_dummy.position.set(r.x, r.y + r.scale * .25, r.z);
			_dummy.rotation.set(r.rot * .3, r.rot, r.rot * .15);
			_dummy.scale.set(r.scale, r.scale * .7, r.scale * .85);
			_dummy.updateMatrix();
			rocks.setMatrixAt(i, _dummy.matrix);
		});
		rocks.instanceMatrix.needsUpdate = true;
		clouds.count = data.clouds.length;
		data.clouds.forEach((c, i) => {
			_dummy.position.set(c.x, c.y, c.z);
			_dummy.rotation.set(0, c.rot, 0);
			_dummy.scale.setScalar(c.scale);
			_dummy.updateMatrix();
			clouds.setMatrixAt(i, _dummy.matrix);
		});
		clouds.instanceMatrix.needsUpdate = true;
	}
	function clearAirfield() {
		if (airfieldGroup) {
			scene.remove(airfieldGroup);
			disposeObject(airfieldGroup);
			airfieldGroup = null;
		}
		if (playerPlane) {
			scene.remove(playerPlane);
			disposeObject(playerPlane);
			playerPlane = null;
		}
		if (jeep) {
			scene.remove(jeep);
			disposeObject(jeep);
			jeep = null;
		}
		while (ringsGroup.children.length) {
			const ch = ringsGroup.children[0];
			ringsGroup.remove(ch);
			disposeObject(ch);
		}
		ringTargets.length = 0;
	}
	function placeRings(data) {
		const af = data.airfield;
		const peak = data.peak;
		const p1 = localOnField(af, af.length * .42, 0);
		ringTargets.push(new Vector3(p1.x, af.y + 14, p1.z), new Vector3(af.x * .45 + peak.x * .55, Math.max(af.y + 20, peak.y * .35), af.z * .45 + peak.z * .55), new Vector3(peak.x + 18, peak.y * .55 + 8, peak.z - 12), new Vector3(-peak.x * .3, peak.y * .42 + 10, -peak.z * .2), new Vector3(af.x * .65, af.y + 22, af.z * .65), new Vector3(p1.x, af.y + 10, p1.z));
		ringTargets.forEach((p, i) => {
			const mesh = createCheckpointRing(i === 0);
			mesh.position.copy(p);
			ringsGroup.add(mesh);
		});
	}
	function applyWorld(data) {
		const prevGeo = terrainMesh.geometry;
		const prevWire = wireLines.geometry;
		terrainMesh.geometry = data.geometry;
		const edges = new EdgesGeometry(data.geometry, 18);
		wireLines.geometry = edges;
		if (prevGeo && prevGeo !== data.geometry) prevGeo.dispose();
		if (prevWire) prevWire.dispose();
		layoutInstances(data);
		clearAirfield();
		const built = buildAirfieldScene(data.airfield);
		airfieldGroup = built.group;
		scene.add(airfieldGroup);
		built.group.updateMatrixWorld(true);
		playerPlane = built.playerPlane;
		jeep = built.jeep;
		playerPlane.getWorldPosition(parkedPlane);
		jeep.getWorldPosition(parkedJeep);
		const q = new Quaternion();
		playerPlane.getWorldQuaternion(q);
		const eul = new Euler().setFromQuaternion(q, "YXZ");
		parkedPlaneYaw = eul.y;
		jeep.getWorldQuaternion(q);
		eul.setFromQuaternion(q, "YXZ");
		parkedJeepYaw = eul.y;
		built.group.remove(playerPlane);
		built.group.remove(jeep);
		scene.add(playerPlane, jeep);
		playerPlane.position.copy(parkedPlane);
		playerPlane.rotation.set(0, parkedPlaneYaw, 0);
		jeep.position.copy(parkedJeep);
		jeep.rotation.set(0, parkedJeepYaw, 0);
		placeRings(data);
	}
	function rebuild(seed) {
		world?.dispose();
		world = buildTerrain(seed);
		applyWorld(world);
		if (!playing) resetCinematic();
	}
	function resetCinematic() {
		vel.set(0, 0, 0);
		orbit = .6;
		placeCinematic(0);
	}
	function placeCinematic(dt) {
		if (!world) return;
		if (!reducedMotion) orbit += dt * .08;
		const af = world.airfield;
		_look.set(af.x, af.y + 4, af.z);
		const radius = 42;
		camPos.set(_look.x + Math.sin(orbit) * radius, af.y + 14, _look.z + Math.cos(orbit) * radius);
		camPos.y = Math.max(camPos.y, world.sample(camPos.x, camPos.z) + 6);
		camera.position.copy(camPos);
		camera.lookAt(_look);
		yaw = af.yaw;
		pitch = -.18;
	}
	function spawnPlayer() {
		if (!world) return;
		const af = world.airfield;
		const p = localOnField(af, -af.length * .38, 3.6);
		pos.set(p.x, world.sample(p.x, p.z), p.z);
		yaw = af.yaw;
		pitch = 0;
		roll = 0;
		vel.set(0, 0, 0);
		throttle = 0;
		airborne = false;
		mode = "foot";
		elapsed = 0;
		ringIndex = 0;
		character.visible = true;
		if (playerPlane) {
			playerPlane.position.copy(parkedPlane);
			playerPlane.rotation.set(0, parkedPlaneYaw, 0);
		}
		if (jeep) {
			jeep.position.copy(parkedJeep);
			jeep.rotation.set(0, parkedJeepYaw, 0);
		}
		ringsGroup.children.forEach((ch, i) => {
			const m = ch;
			const mat = m.material;
			mat.color.set(i === 0 ? 15265513 : 6976366);
			mat.emissive.set(i === 0 ? 12965068 : 0);
			mat.emissiveIntensity = i === 0 ? .45 : 0;
			m.visible = true;
		});
		camPos.copy(pos).add(new Vector3(6, 4, 8));
	}
	function basis() {
		_fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
		_right.set(Math.cos(yaw), 0, -Math.sin(yaw));
	}
	function nearestVehicle() {
		const dp = pos.distanceTo(playerPlane ? playerPlane.position : parkedPlane);
		const dj = pos.distanceTo(jeep ? jeep.position : parkedJeep);
		if (dp < 5.5) return "plane";
		if (dj < 4.2) return "jeep";
		return null;
	}
	function tryInteract() {
		if (!playing || !world) return;
		if (mode === "foot") {
			const near = nearestVehicle();
			if (near === "plane" && playerPlane) {
				mode = "plane";
				pos.copy(playerPlane.position);
				yaw = playerPlane.rotation.y;
				pitch = 0;
				vel.set(0, 0, 0);
				throttle = 0;
				airborne = false;
				character.visible = false;
			} else if (near === "jeep" && jeep) {
				mode = "jeep";
				pos.copy(jeep.position);
				yaw = jeep.rotation.y;
				vel.set(0, 0, 0);
				character.visible = false;
			}
			return;
		}
		if (vel.length() > 5 || airborne) return;
		const side = localOnField({
			...world.airfield,
			x: pos.x,
			z: pos.z,
			yaw
		}, 0, 3.2);
		if (mode === "plane" && playerPlane) {
			parkedPlane.copy(pos);
			parkedPlaneYaw = yaw;
			playerPlane.position.copy(pos);
			playerPlane.rotation.set(0, yaw, 0);
		}
		if (mode === "jeep" && jeep) {
			parkedJeep.copy(pos);
			parkedJeepYaw = yaw;
			jeep.position.copy(pos);
			jeep.rotation.set(0, yaw, 0);
		}
		pos.set(side.x, world.sample(side.x, side.z), side.z);
		vel.set(0, 0, 0);
		throttle = 0;
		airborne = false;
		pitch = 0;
		roll = 0;
		mode = "foot";
		character.visible = true;
	}
	function stepFoot(dt) {
		if (!world) return;
		const look = input.consumeLook();
		yaw -= look.dx * LOOK_SENS;
		pitch -= look.dy * LOOK_SENS;
		pitch = Math.max(-.9, Math.min(.55, pitch));
		const wish = input.wishDir();
		basis();
		_wish.copy(_fwd).multiplyScalar(wish.z).addScaledVector(_right, wish.x);
		const max = wish.boost ? 9 : 5.4;
		const k = 1 - Math.exp(-10 * dt);
		vel.x += (_wish.x * max - vel.x) * k;
		vel.z += (_wish.z * max - vel.z) * k;
		vel.y -= 28 * dt;
		pos.x += vel.x * dt;
		pos.z += vel.z * dt;
		pos.y += vel.y * dt;
		const ground = world.sample(pos.x, pos.z);
		if (pos.y < ground) {
			pos.y = ground;
			vel.y = 0;
		}
		walkT += dt;
	}
	function stepVehicle(dt, kind) {
		if (!world) return;
		const look = input.consumeLook();
		const wish = input.wishDir();
		const steer = -wish.x;
		if (kind === "plane") {
			pitch -= look.dy * LOOK_SENS;
			pitch -= wish.y * .9 * dt;
			pitch = Math.max(-.7, Math.min(.55, pitch));
			throttle += ((wish.z > .1 ? 1 : wish.z < -.1 ? 0 : throttle) - throttle) * (1 - Math.exp(-2.4 * dt));
			if (wish.z < -.1 && !airborne) throttle = 0;
			const max = 48;
			const speed = Math.hypot(vel.x, vel.z);
			const sp = speed + (throttle * max - speed) * (1 - Math.exp(-(airborne ? 1.1 : 1.6) * dt));
			const turn = steer * (airborne ? 1.15 : 1.6) * Math.min(1, sp / 8);
			yaw += turn * dt;
			roll += (steer * .55 - roll) * (1 - Math.exp(-6 * dt));
			basis();
			const cp = Math.cos(pitch);
			vel.x = _fwd.x * sp * cp;
			vel.z = _fwd.z * sp * cp;
			if (airborne) {
				vel.y += (-22 + sp * .38 - pitch * sp * 1.6) * dt;
				vel.y *= Math.exp(-.35 * dt);
			} else vel.y = 0;
			pos.x += vel.x * dt;
			pos.z += vel.z * dt;
			pos.y += airborne ? vel.y * dt : 0;
			const deck = world.sample(pos.x, pos.z) + .05;
			if (!airborne) {
				pos.y = deck;
				if (sp > 16 && pitch < -.1) {
					airborne = true;
					vel.y = 4;
				}
			} else if (pos.y <= deck + .8 && vel.y <= 4) {
				pos.y = deck;
				vel.y = 0;
				airborne = false;
				pitch *= .4;
				roll *= .3;
			} else if (pos.y < deck) {
				pos.y = deck;
				vel.y = Math.abs(vel.y) * .2;
			}
		} else {
			basis();
			const along = vel.x * _fwd.x + vel.z * _fwd.z;
			const reverse = along >= 0 ? 1 : -1;
			yaw += steer * 2.1 * Math.min(1, Math.abs(along) / 4) * reverse * dt;
			yaw -= look.dx * LOOK_SENS * .15;
			basis();
			const max = wish.boost ? 18 : 12;
			const target = wish.z * max;
			const k = 1 - Math.exp(-3.2 * dt);
			const next = along + (target - along) * k;
			vel.x = _fwd.x * next;
			vel.z = _fwd.z * next;
			pos.x += vel.x * dt;
			pos.z += vel.z * dt;
			pos.y = world.sample(pos.x, pos.z);
			throttle = Math.abs(wish.z);
			airborne = false;
			pitch = 0;
			roll = 0;
		}
	}
	function clampWorld() {
		const limit = 178.6;
		const radial = Math.hypot(pos.x, pos.z);
		if (radial > limit) {
			const s = limit / radial;
			pos.x *= s;
			pos.z *= s;
			vel.x *= .3;
			vel.z *= .3;
		}
	}
	function stepPlay(dt) {
		if (input.justPressed("KeyE") || pendingInteract || input.touchInteract) {
			pendingInteract = false;
			input.touchInteract = false;
			tryInteract();
		}
		if (mode === "foot") stepFoot(dt);
		else stepVehicle(dt, mode);
		clampWorld();
		elapsed += dt;
		checkRings();
	}
	function checkRings() {
		if (!world || ringIndex >= RING_TOTAL) {
			maybeWin();
			return;
		}
		const target = ringTargets[ringIndex];
		if (!target) return;
		if (mode !== "plane") return;
		if (pos.distanceTo(target) < 6.5) {
			const prev = ringsGroup.children[ringIndex];
			if (prev) prev.visible = false;
			ringIndex += 1;
			const next = ringsGroup.children[ringIndex];
			if (next) {
				const mat = next.material;
				mat.color.set(15265513);
				mat.emissive.set(12965068);
				mat.emissiveIntensity = .45;
			}
		}
		maybeWin();
	}
	function maybeWin() {
		if (!world || ringIndex < RING_TOTAL) return;
		if (mode !== "plane" || airborne) return;
		if (vel.length() > 12) return;
		if (!inAirfield(world.airfield, pos.x, pos.z, 4)) return;
		playing = false;
		const t = elapsed;
		const best = useGameStore.getState().bestTime;
		if (best === null || t < best) useGameStore.getState().setBestTime(t);
		useGameStore.getState().setPhase("win");
		useGameStore.getState().setPlaying(false);
	}
	function syncMeshes(dt) {
		character.position.set(pos.x, pos.y, pos.z);
		character.rotation.y = yaw;
		const spd = Math.hypot(vel.x, vel.z);
		if (mode === "foot" && character.visible) animateWalk(character, spd, dt, walkT);
		if (playerPlane) {
			if (mode === "plane") {
				playerPlane.position.copy(pos);
				playerPlane.rotation.set(pitch, yaw, -roll);
				const prop = playerPlane.getObjectByName("prop");
				if (prop) prop.rotation.z += dt * (8 + throttle * 28);
			} else {
				playerPlane.position.copy(parkedPlane);
				playerPlane.rotation.set(0, parkedPlaneYaw, 0);
			}
		}
		if (jeep) {
			if (mode === "jeep") {
				jeep.position.copy(pos);
				jeep.rotation.set(0, yaw, 0);
			} else {
				jeep.position.copy(parkedJeep);
				jeep.rotation.set(0, parkedJeepYaw, 0);
			}
		}
		const active = ringsGroup.children[ringIndex];
		if (active && !reducedMotion) active.rotation.z += dt * .6;
	}
	function updateCamera(dt) {
		if (!world) return;
		basis();
		const dist = mode === "plane" ? airborne ? 13 : 11 : mode === "jeep" ? 8.5 : 6.2;
		const height = mode === "plane" ? 3.4 : 2.1;
		_desired.copy(pos).addScaledVector(_fwd, -dist);
		_desired.y = pos.y + height;
		const minY = world.sample(_desired.x, _desired.z) + 1.4;
		_desired.y = Math.max(_desired.y, minY);
		const k = 1 - Math.exp(-(mode === "foot" ? 6 : 4.2) * dt);
		camPos.lerp(_desired, k);
		camera.position.copy(camPos);
		_look.copy(pos);
		_look.y += mode === "plane" ? 1.4 : 1.35;
		if (mode === "foot") {
			_look.addScaledVector(_fwd, 4);
			_look.y += -pitch * 3;
		}
		camera.lookAt(_look);
	}
	function applyLighting(dt) {
		const target = useGameStore.getState().night ? 1 : 0;
		const k = reducedMotion ? 1 : 1 - Math.exp(-3.2 * dt);
		nightBlend += (target - nightBlend) * k;
		const t = nightBlend;
		bgColor.copy(DAY.bg).lerp(NIGHT.bg, t);
		scene.fog.color.copy(DAY.fog).lerp(NIGHT.fog, t);
		scene.fog.near = 70 - t * 22;
		scene.fog.far = 360 - t * 90;
		renderer.setClearColor(bgColor, 1);
		ambient.intensity = DAY.ambient + (NIGHT.ambient - DAY.ambient) * t;
		hemi.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * t;
		hemi.color.copy(DAY.hemiSky).lerp(NIGHT.hemiSky, t);
		hemi.groundColor.copy(DAY.hemiGround).lerp(NIGHT.hemiGround, t);
		sun.intensity = DAY.sun + (NIGHT.sun - DAY.sun) * t;
		sun.color.copy(DAY.sunColor).lerp(NIGHT.sunColor, t);
		_sunPos.copy(DAY.sunDir).lerp(NIGHT.sunDir, t).normalize();
		sun.position.copy(_sunPos).multiplyScalar(180);
		sunDisc.position.copy(camera.position).addScaledVector(_sunPos, 240);
		sunDisc.lookAt(camera.position);
		sunDisc.scale.setScalar(1 + t * .35);
		sunDiscMat.color.set(t > .5 ? 14016496 : 16774872);
		wireMat.color.copy(DAY.wire).lerp(NIGHT.wire, t);
		wireMat.opacity = .3 + t * .12;
		cloudMat.color.copy(DAY.cloud).lerp(NIGHT.cloud, t);
		stars.visible = t > .35;
		stars.material.opacity = Math.max(0, (t - .35) / .65);
		if (t > .5 && sky.geometry !== nightSkyGeo) sky.geometry = nightSkyGeo;
		else if (t <= .5 && sky.geometry !== skyGeo.day) sky.geometry = skyGeo.day;
		sky.position.copy(camera.position);
		stars.position.copy(camera.position);
	}
	function driftClouds(dt) {
		if (!world) return;
		const half = 342;
		world.clouds.forEach((c, i) => {
			c.x += dt * 1.6;
			if (c.x > half) c.x = -342;
			_dummy.position.set(c.x, c.y, c.z);
			_dummy.rotation.set(0, c.rot, 0);
			_dummy.scale.setScalar(c.scale);
			_dummy.updateMatrix();
			clouds.setMatrixAt(i, _dummy.matrix);
		});
		clouds.instanceMatrix.needsUpdate = true;
	}
	function currentPrompt() {
		if (!playing) return "";
		if (mode === "foot") {
			const n = nearestVehicle();
			if (n === "plane") return "E — Monter dans l’avion";
			if (n === "jeep") return "E — Prendre la jeep";
			return "Rejoignez l’avion sur le tarmac";
		}
		if (mode === "jeep") return "E — Descendre  ·  Z accélère, Q/D braque";
		if (!airborne) {
			if (throttle < .4) return "Z — Plein gaz sur la piste";
			return "Tirer la souris pour cabrer et décoller";
		}
		if (ringIndex < RING_TOTAL) return `Anneau ${ringIndex + 1} / ${RING_TOTAL}`;
		return "Revenez atterrir sur la piste";
	}
	function publishHud() {
		if (!world) return;
		const ground = world.sample(pos.x, pos.z);
		const speed = vel.length();
		const heading = (MathUtils.radToDeg(yaw) % 360 + 360) % 360;
		prompt = currentPrompt();
		useGameStore.getState().setHud({
			altitude: pos.y - SEA_LEVEL,
			agl: pos.y - ground,
			speed,
			heading,
			throttle,
			airborne,
			mode,
			ringsDone: ringIndex,
			ringsTotal: RING_TOTAL,
			time: elapsed,
			prompt
		});
	}
	function resize() {
		const w = canvas.clientWidth || window.innerWidth;
		const h = canvas.clientHeight || window.innerHeight;
		renderer.setSize(w, h, false);
		camera.aspect = w / Math.max(h, 1);
		camera.updateProjectionMatrix();
	}
	rebuild(useGameStore.getState().seed);
	resize();
	const timer = new Timer();
	timer.connect(document);
	let acc = 0;
	const onResize = () => resize();
	window.addEventListener("resize", onResize);
	const ro = new ResizeObserver(onResize);
	ro.observe(canvas.parentElement ?? canvas);
	function frame() {
		if (disposed) return;
		timer.update();
		const dt = Math.min(timer.getDelta(), .1);
		input.beginFrame();
		if (input.justPressed("KeyF")) useGameStore.getState().toggleWireframe();
		if (input.justPressed("KeyN") || input.justPressed("KeyL")) useGameStore.getState().toggleNight();
		wireLines.visible = useGameStore.getState().wireframe;
		if (playing) {
			acc += dt;
			while (acc >= STEP) {
				stepPlay(STEP);
				acc -= STEP;
			}
			syncMeshes(dt);
			updateCamera(dt);
		} else {
			acc = 0;
			if (useGameStore.getState().phase !== "win") placeCinematic(dt);
			else {
				syncMeshes(dt);
				updateCamera(dt);
			}
		}
		applyLighting(dt);
		driftClouds(dt);
		hudAcc += dt;
		if (hudAcc > .08) {
			hudAcc = 0;
			publishHud();
		}
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(frame);
	const probe = {
		getYaw: () => yaw,
		getSpeed: () => vel.length(),
		getPosition: () => ({
			x: pos.x,
			y: pos.y,
			z: pos.z
		}),
		setKeys: (codes) => input.setKeys(codes)
	};
	window.__controlsTest = probe;
	window.__gameReady = true;
	useGameStore.getState().setReady(true);
	const api = {
		start() {
			playing = true;
			spawnPlayer();
			useGameStore.getState().setPhase("play");
			useGameStore.getState().setPlaying(true);
			api.requestLookLock();
		},
		setWireframe(v) {
			useGameStore.getState().setWireframe(v);
		},
		setNight(v) {
			useGameStore.getState().setNight(v);
		},
		regenerate(seed) {
			playing = false;
			useGameStore.getState().setPlaying(false);
			useGameStore.getState().setPhase("menu");
			useGameStore.getState().setSeed(seed);
			rebuild(seed);
		},
		setTouchMove(x, z) {
			input.touchX = x;
			input.touchY = z;
		},
		setTouchClimb(v) {
			input.touchClimb = v;
		},
		setTouchLook(dx, dy) {
			input.lookDx += dx * (TOUCH_LOOK_SENS / LOOK_SENS);
			input.lookDy += dy * (TOUCH_LOOK_SENS / LOOK_SENS);
		},
		setTouchBoost(on) {
			input.touchBoost = on;
		},
		interact() {
			pendingInteract = true;
		},
		requestLookLock() {
			canvas.requestPointerLock?.();
		},
		dispose() {
			disposed = true;
			renderer.setAnimationLoop(null);
			timer.disconnect();
			window.removeEventListener("resize", onResize);
			ro.disconnect();
			input.dispose();
			clearAirfield();
			disposeObject(character);
			world?.dispose();
			skyGeo.day.dispose();
			nightSkyGeo.dispose();
			stars.geometry.dispose();
			stars.material.dispose();
			pineGeo.dispose();
			trunkGeo.dispose();
			rockGeo.dispose();
			cloudGeo.dispose();
			water.geometry.dispose();
			sunDisc.geometry.dispose();
			wireLines.geometry.dispose();
			landMat.dispose();
			wireMat.dispose();
			waterMat.dispose();
			pineMat.dispose();
			trunkMat.dispose();
			rockMat.dispose();
			cloudMat.dispose();
			sunDiscMat.dispose();
			skyMat.dispose();
			renderer.dispose();
			if (window.__controlsTest === probe) delete window.__controlsTest;
			window.__gameReady = false;
		}
	};
	return api;
}
function makeSkyDome() {
	const make = (zenith, horizon) => {
		const geo = new SphereGeometry(420, 20, 12);
		const zc = new Color(zenith);
		const hc = new Color(horizon);
		const cols = new Float32Array(geo.attributes.position.count * 3);
		const c = new Color();
		for (let i = 0; i < geo.attributes.position.count; i++) {
			const y = geo.attributes.position.getY(i) / 420;
			const t = MathUtils.smoothstep(y, -.05, .72);
			c.copy(hc).lerp(zc, t);
			cols[i * 3] = c.r;
			cols[i * 3 + 1] = c.g;
			cols[i * 3 + 2] = c.b;
		}
		geo.setAttribute("color", new BufferAttribute(cols, 3));
		return geo;
	};
	return {
		day: make(6203081, 14149870),
		night: make(461588, 1384499)
	};
}
function makeStars() {
	const count = 700;
	const positions = new Float32Array(count * 3);
	let placed = 0;
	let guard = 0;
	while (placed < count && guard < count * 8) {
		guard++;
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		const r = 380;
		const y = r * Math.cos(phi);
		if (y < 30) continue;
		positions[placed * 3] = r * Math.sin(phi) * Math.cos(theta);
		positions[placed * 3 + 1] = y;
		positions[placed * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
		placed++;
	}
	const geo = new BufferGeometry();
	geo.setAttribute("position", new BufferAttribute(positions, 3));
	geo.setDrawRange(0, placed);
	const mat = new PointsMaterial({
		color: 15265522,
		size: 1.15,
		sizeAttenuation: false,
		transparent: true,
		opacity: 0,
		depthWrite: false,
		fog: false
	});
	return new Points(geo, mat);
}
var gameRef = { current: null };
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function format(n, digits = 0) {
	if (!Number.isFinite(n)) return "—";
	return n.toFixed(digits);
}
function formatTime$1(s) {
	const m = Math.floor(s / 60);
	return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
}
function Hud() {
	const playing = useGameStore((s) => s.playing);
	const phase = useGameStore((s) => s.phase);
	const wireframe = useGameStore((s) => s.wireframe);
	const night = useGameStore((s) => s.night);
	const hud = useGameStore((s) => s.hud);
	const pointerLocked = useGameStore((s) => s.pointerLocked);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-10 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "absolute top-0 left-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl leading-tight tracking-tight text-fg",
					children: "Cimes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-wide text-muted",
					children: "Aérodrome · circuit"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto absolute top-0 right-0 flex gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					pressed: wireframe,
					onClick: () => gameRef.current?.setWireframe(!wireframe),
					label: "Filaire",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid2x2, {
						className: "size-4",
						strokeWidth: 1.75
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					pressed: night,
					onClick: () => gameRef.current?.setNight(!night),
					label: night ? "Nuit" : "Jour",
					children: night ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, {
						className: "size-4",
						strokeWidth: 1.75
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, {
						className: "size-4",
						strokeWidth: 1.75
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute top-16 left-0 flex flex-wrap items-end gap-2 p-4 pl-[max(1rem,env(safe-area-inset-left))] md:top-auto md:bottom-0 md:pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instrument, {
						label: "Altitude",
						value: `${format(hud.altitude)} m`,
						hint: `sol ${format(hud.agl)} m`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instrument, {
						label: "Vitesse",
						value: `${format(hud.speed)}`,
						hint: "m/s"
					}),
					hud.mode === "plane" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instrument, {
						label: "Gaz",
						value: `${format(hud.throttle * 100)}`,
						hint: hud.airborne ? "en l’air" : "au sol"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instrument, {
						label: "Anneaux",
						value: `${hud.ringsDone}/${hud.ringsTotal}`,
						hint: formatTime$1(hud.time)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { heading: hud.heading })
				]
			}),
			playing && hud.prompt && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute top-20 right-1/2 w-max max-w-[min(22rem,calc(100%-2rem))] translate-x-1/2 rounded-lg border border-border bg-surface/90 px-3 py-2 text-center text-sm text-fg md:top-6",
				children: hud.prompt
			}),
			playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute right-4 bottom-4 hidden max-w-52 text-right text-xs leading-relaxed text-muted md:block",
				children: pointerLocked ? "Échap libère la souris" : "Glisser pour regarder · clic pour capturer"
			}),
			phase === "play" && hud.mode !== "foot" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1/2 left-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-accent/80" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1/2 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-accent/80" })]
			})
		]
	});
}
function Toggle({ pressed, onClick, label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": pressed,
		"aria-label": label,
		onClick,
		className: cn("flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors duration-150", pressed ? "border-accent bg-accent text-accent-fg" : "border-border bg-surface/90 text-fg hover:bg-surface-2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "sr-only",
			children: label
		}), children]
	});
}
function Instrument({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-24 rounded-xl border border-border bg-surface/90 px-3 py-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium tracking-wider text-muted uppercase",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-lg leading-tight font-medium tabular-nums text-fg",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle tabular-nums",
				children: hint
			})
		]
	});
}
function Compass({ heading }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex size-16 items-center justify-center rounded-xl border border-border bg-surface/90",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative size-10",
			style: { transform: `rotate(${-heading}deg)` },
			"aria-label": `Cap ${format(heading)} degrés`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-0 left-1/2 -translate-x-1/2 text-xs font-semibold text-accent",
					children: "N"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-subtle",
					children: "S"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-1/2 left-0 -translate-y-1/2 text-xs text-subtle",
					children: "O"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-1/2 right-0 -translate-y-1/2 text-xs text-subtle",
					children: "E"
				})
			]
		})
	});
}
function formatTime(s) {
	const m = Math.floor(s / 60);
	return `${m}:${(s - m * 60).toFixed(1).padStart(4, "0")}`;
}
function StartOverlay() {
	const phase = useGameStore((s) => s.phase);
	const seed = useGameStore((s) => s.seed);
	const ready = useGameStore((s) => s.ready);
	const hud = useGameStore((s) => s.hud);
	const bestTime = useGameStore((s) => s.bestTime);
	if (phase === "play") return null;
	if (phase === "win") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/80 to-transparent p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:justify-center md:p-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg rounded-xl border border-border bg-surface/95 p-5 md:p-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-medium tracking-widest text-muted uppercase",
					children: "Circuit terminé"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl tracking-tight text-fg",
					children: "Piste en vue"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						"Temps ",
						formatTime(hud.time),
						bestTime !== null ? ` · record ${formatTime(bestTime)}` : ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => gameRef.current?.start(),
						className: "h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg hover:opacity-90",
						children: "Rejouer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => gameRef.current?.regenerate(seed),
						className: "h-11 rounded-lg border border-border bg-surface-2 px-4 text-sm font-medium text-fg",
						children: "Menu"
					})]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/75 to-transparent p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:justify-center md:p-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg rounded-xl border border-border bg-surface/95 p-5 md:p-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-2 flex items-center gap-2 text-xs font-medium tracking-widest text-muted uppercase",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mountain, {
						className: "size-3.5",
						strokeWidth: 1.75
					}), "Aérodrome des cimes"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl leading-none tracking-tight text-fg md:text-5xl",
					children: "Cimes"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 max-w-prose text-sm leading-relaxed text-muted md:text-base",
					children: "Vous êtes au sol, sur le tarmac. Montez dans un avion, décollez, enfilez les anneaux du massif, puis atterrissez."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !ready,
						onClick: () => gameRef.current?.start(),
						className: "h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg transition-opacity duration-150 hover:opacity-90 disabled:opacity-50",
						children: "Entrer sur le tarmac"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						disabled: !ready,
						onClick: () => {
							const next = Math.floor(mulberry32(seed ^ Date.now())() * 9e4) + 1e3;
							gameRef.current?.regenerate(next);
						},
						className: "h-11 rounded-lg border border-border bg-surface-2 px-4 text-sm font-medium text-fg transition-colors duration-150 hover:border-accent/40 disabled:opacity-50",
						children: "Autre massif"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointer2, {
								className: "size-4",
								strokeWidth: 1.75
							}),
							k: "Souris",
							v: "Regarder · cabrer"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Keyboard, {
								className: "size-4",
								strokeWidth: 1.75
							}),
							k: "Z/Q/S/D · WASD",
							v: "Marcher / rouler"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plane, {
								className: "size-4",
								strokeWidth: 1.75
							}),
							k: "E",
							v: "Monter · descendre"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Control, {
							k: "Piste",
							v: "Gaz, cabrer, anneaux, atterrir"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-xs text-subtle",
					children: [
						"Graine ",
						seed,
						bestTime !== null ? ` · record ${formatTime(bestTime)}` : ""
					]
				})
			]
		})
	});
}
function Control({ k, v, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-2",
		children: [icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 text-muted",
			children: icon
		}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "font-medium text-fg",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "text-muted",
			children: v
		})] })]
	});
}
function TouchControls() {
	const playing = useGameStore((s) => s.playing);
	const mode = useGameStore((s) => s.hud.mode);
	const [coarse, setCoarse] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const mq = window.matchMedia("(pointer: coarse)");
		const apply = () => setCoarse(mq.matches || window.innerWidth < 720);
		apply();
		mq.addEventListener("change", apply);
		window.addEventListener("resize", apply);
		return () => {
			mq.removeEventListener("change", apply);
			window.removeEventListener("resize", apply);
		};
	}, []);
	if (!playing || !coarse) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-30",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stick, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LookPad, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-auto absolute right-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldButton, {
						label: mode === "plane" ? "Cabrer" : "Interagir",
						onHold: (on) => {
							if (mode === "plane") gameRef.current?.setTouchClimb(on ? 1 : 0);
							else if (on) gameRef.current?.interact();
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, {
							className: "size-5",
							strokeWidth: 1.75
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Monter ou descendre",
						className: "flex h-12 min-w-12 items-center justify-center rounded-lg border border-border bg-surface/90 px-3 text-sm font-semibold text-fg",
						onPointerDown: () => gameRef.current?.interact(),
						children: "E"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HoldButton, {
						label: "Gaz",
						onHold: (on) => gameRef.current?.setTouchBoost(on),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, {
							className: "size-5",
							strokeWidth: 1.75
						})
					})
				]
			})
		]
	});
}
function Stick() {
	const origin = (0, import_react.useRef)({
		x: 0,
		y: 0
	});
	const [knob, setKnob] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const active = (0, import_react.useRef)(false);
	const end = () => {
		active.current = false;
		setKnob({
			x: 0,
			y: 0
		});
		gameRef.current?.setTouchMove(0, 0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 size-28 touch-none rounded-full border border-border bg-surface/80",
		onPointerDown: (e) => {
			active.current = true;
			origin.current = {
				x: e.clientX,
				y: e.clientY
			};
			e.currentTarget.setPointerCapture(e.pointerId);
		},
		onPointerMove: (e) => {
			if (!active.current) return;
			const dx = e.clientX - origin.current.x;
			const dy = e.clientY - origin.current.y;
			const max = 40;
			const mag = Math.hypot(dx, dy);
			const s = mag > max ? max / mag : 1;
			const x = dx * s;
			const y = dy * s;
			setKnob({
				x,
				y
			});
			gameRef.current?.setTouchMove(x / max, -y / max);
		},
		onPointerUp: end,
		onPointerCancel: end,
		"aria-label": "Déplacement",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/90",
			style: { transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }
		})
	});
}
function LookPad() {
	const last = (0, import_react.useRef)({
		x: 0,
		y: 0,
		id: null
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-auto absolute top-20 right-0 h-1/2 w-1/2 touch-none",
		"aria-label": "Regard",
		onPointerDown: (e) => {
			last.current = {
				x: e.clientX,
				y: e.clientY,
				id: e.pointerId
			};
			e.currentTarget.setPointerCapture(e.pointerId);
		},
		onPointerMove: (e) => {
			if (last.current.id !== e.pointerId) return;
			const dx = e.clientX - last.current.x;
			const dy = e.clientY - last.current.y;
			last.current = {
				x: e.clientX,
				y: e.clientY,
				id: e.pointerId
			};
			gameRef.current?.setTouchLook(dx, dy);
		},
		onPointerUp: () => {
			last.current.id = null;
		},
		onPointerCancel: () => {
			last.current.id = null;
		}
	});
}
function HoldButton({ label, onHold, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-label": label,
		className: cn("flex size-12 items-center justify-center rounded-lg border border-border bg-surface/90 text-fg"),
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			onHold(true);
		},
		onPointerUp: () => onHold(false),
		onPointerCancel: () => onHold(false),
		children
	});
}
function TerrainApp() {
	const canvasRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const engine = createEngine(canvas);
		gameRef.current = engine;
		const onLock = () => {
			useGameStore.getState().setPointerLocked(document.pointerLockElement === canvas);
		};
		document.addEventListener("pointerlockchange", onLock);
		const onClick = () => {
			if (useGameStore.getState().playing) engine.requestLookLock();
		};
		canvas.addEventListener("click", onClick);
		return () => {
			document.removeEventListener("pointerlockchange", onLock);
			canvas.removeEventListener("click", onClick);
			engine.dispose();
			gameRef.current = null;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
				ref: canvasRef,
				className: "absolute inset-0 block h-full w-full touch-none",
				onContextMenu: (e) => e.preventDefault()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StartOverlay, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TouchControls, {})
		]
	});
}
//#endregion
export { TerrainApp as default };
