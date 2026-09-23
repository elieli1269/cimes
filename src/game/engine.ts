import * as THREE from "three";
import { Input, type ControlsProbe } from "./input";
import { buildTerrain, SEA_LEVEL, WORLD_SIZE, type TerrainWorld } from "./terrain";
import { useGameStore, type PlayMode } from "./store";
import { buildAirfieldScene, inAirfield, localOnField } from "./aerodrome";
import {
  animateWalk,
  createCharacter,
  createCheckpointRing,
  disposeObject,
} from "./models";

const LOOK_SENS = 0.00215;
const TOUCH_LOOK_SENS = 0.0034;
const STEP = 1 / 60;
const RING_TOTAL = 6;
const DAY = {
  bg: new THREE.Color(0x8ec4d8),
  fog: new THREE.Color(0xc5dce6),
  ambient: 0.4,
  hemiSky: new THREE.Color(0xb7d4e6),
  hemiGround: new THREE.Color(0x3d4f32),
  hemi: 0.62,
  sun: 1.55,
  sunColor: new THREE.Color(0xfff1d0),
  sunDir: new THREE.Vector3(0.45, 0.82, 0.28).normalize(),
  wire: new THREE.Color(0x1c261f),
  cloud: new THREE.Color(0xf3f6f8),
};
const NIGHT = {
  bg: new THREE.Color(0x0a1018),
  fog: new THREE.Color(0x101826),
  ambient: 0.055,
  hemiSky: new THREE.Color(0x1a283c),
  hemiGround: new THREE.Color(0x0a1210),
  hemi: 0.22,
  sun: 0.32,
  sunColor: new THREE.Color(0xc5d4e4),
  sunDir: new THREE.Vector3(-0.38, 0.78, -0.32).normalize(),
  wire: new THREE.Color(0xc5d4cc),
  cloud: new THREE.Color(0x3a4558),
};

export type GameEngine = {
  start: () => void;
  setWireframe: (v: boolean) => void;
  setNight: (v: boolean) => void;
  regenerate: (seed: number) => void;
  setTouchMove: (x: number, z: number) => void;
  setTouchClimb: (v: number) => void;
  setTouchLook: (dx: number, dy: number) => void;
  setTouchBoost: (on: boolean) => void;
  interact: () => void;
  requestLookLock: () => void;
  dispose: () => void;
};

type Mode = PlayMode;

export function createEngine(canvas: HTMLCanvasElement): GameEngine {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const input = new Input();
  input.attach(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(DAY.bg, 1);

  const scene = new THREE.Scene();
  const bgColor = DAY.bg.clone();
  scene.background = bgColor;
  scene.fog = new THREE.Fog(DAY.fog.clone(), 70, 360);

  const camera = new THREE.PerspectiveCamera(62, 1, 0.25, 520);
  camera.rotation.order = "YXZ";
  scene.add(camera);

  const ambient = new THREE.AmbientLight(0xffffff, DAY.ambient);
  const hemi = new THREE.HemisphereLight(DAY.hemiSky, DAY.hemiGround, DAY.hemi);
  const sun = new THREE.DirectionalLight(DAY.sunColor, DAY.sun);
  sun.position.copy(DAY.sunDir).multiplyScalar(180);
  scene.add(ambient, hemi, sun);

  const sunDiscMat = new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false, depthWrite: false });
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(7, 24), sunDiscMat);
  scene.add(sunDisc);

  const skyGeo = makeSkyDome();
  const skyMat = new THREE.MeshBasicMaterial({
    vertexColors: true,
    side: THREE.BackSide,
    fog: false,
    depthWrite: false,
  });
  const sky = new THREE.Mesh(skyGeo.day, skyMat);
  scene.add(sky);
  const nightSkyGeo = skyGeo.night;
  const stars = makeStars();
  stars.visible = false;
  scene.add(stars);

  const landMat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const wireMat = new THREE.LineBasicMaterial({ color: DAY.wire, transparent: true, opacity: 0.32 });
  const waterMat = new THREE.MeshLambertMaterial({ color: 0x1a6b7a, transparent: true, opacity: 0.78 });
  const pineMat = new THREE.MeshLambertMaterial({ color: 0x2f5a32, flatShading: true });
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3728, flatShading: true });
  const rockMat = new THREE.MeshLambertMaterial({ color: 0x6e6862, flatShading: true });
  const cloudMat = new THREE.MeshLambertMaterial({
    color: DAY.cloud,
    flatShading: true,
    transparent: true,
    opacity: 0.88,
  });

  const terrainMesh = new THREE.Mesh(new THREE.BufferGeometry(), landMat);
  const wireLines = new THREE.LineSegments(new THREE.BufferGeometry(), wireMat);
  wireLines.visible = useGameStore.getState().wireframe;
  const water = new THREE.Mesh(new THREE.CircleGeometry(WORLD_SIZE * 0.72, 48), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = SEA_LEVEL;
  scene.add(terrainMesh, wireLines, water);

  const pineGeo = new THREE.ConeGeometry(1.05, 2.6, 5);
  pineGeo.translate(0, 1.55, 0);
  const trunkGeo = new THREE.CylinderGeometry(0.12, 0.18, 0.7, 5);
  trunkGeo.translate(0, 0.35, 0);
  const rockGeo = new THREE.IcosahedronGeometry(1, 0);
  const cloudGeo = new THREE.IcosahedronGeometry(1, 0);
  cloudGeo.scale(1.6, 0.55, 1.1);
  const pines = new THREE.InstancedMesh(pineGeo, pineMat, 280);
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, 280);
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, 100);
  const clouds = new THREE.InstancedMesh(cloudGeo, cloudMat, 20);
  pines.frustumCulled = false;
  trunks.frustumCulled = false;
  rocks.frustumCulled = false;
  clouds.frustumCulled = false;
  scene.add(pines, trunks, rocks, clouds);

  const character = createCharacter();
  scene.add(character);
  let airfieldGroup: THREE.Group | null = null;
  let playerPlane: THREE.Group | null = null;
  let jeep: THREE.Group | null = null;
  const ringsGroup = new THREE.Group();
  scene.add(ringsGroup);

  let world: TerrainWorld | null = null;
  let nightBlend = useGameStore.getState().night ? 1 : 0;
  let playing = false;
  let mode: Mode = "foot";
  let yaw = 0;
  let pitch = 0;
  let roll = 0;
  let throttle = 0;
  let airborne = false;
  let elapsed = 0;
  let ringIndex = 0;
  let prompt = "";
  let pendingInteract = false;
  const pos = new THREE.Vector3();
  const vel = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const parkedPlane = new THREE.Vector3();
  const parkedJeep = new THREE.Vector3();
  let parkedPlaneYaw = 0;
  let parkedJeepYaw = 0;
  const ringTargets: THREE.Vector3[] = [];
  let orbit = 0.6;
  let hudAcc = 0;
  let walkT = 0;
  let disposed = false;

  const _fwd = new THREE.Vector3();
  const _right = new THREE.Vector3();
  const _wish = new THREE.Vector3();
  const _dummy = new THREE.Object3D();
  const _look = new THREE.Vector3();
  const _sunPos = new THREE.Vector3();
  const _desired = new THREE.Vector3();

  function layoutInstances(data: TerrainWorld) {
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
      _dummy.position.set(r.x, r.y + r.scale * 0.25, r.z);
      _dummy.rotation.set(r.rot * 0.3, r.rot, r.rot * 0.15);
      _dummy.scale.set(r.scale, r.scale * 0.7, r.scale * 0.85);
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

  function placeRings(data: TerrainWorld) {
    const af = data.airfield;
    const peak = data.peak;
    const p1 = localOnField(af, af.length * 0.42, 0);
    ringTargets.push(
      new THREE.Vector3(p1.x, af.y + 14, p1.z),
      new THREE.Vector3(
        af.x * 0.45 + peak.x * 0.55,
        Math.max(af.y + 20, peak.y * 0.35),
        af.z * 0.45 + peak.z * 0.55,
      ),
      new THREE.Vector3(peak.x + 18, peak.y * 0.55 + 8, peak.z - 12),
      new THREE.Vector3(-peak.x * 0.3, peak.y * 0.42 + 10, -peak.z * 0.2),
      new THREE.Vector3(af.x * 0.65, af.y + 22, af.z * 0.65),
      new THREE.Vector3(p1.x, af.y + 10, p1.z),
    );
    ringTargets.forEach((p, i) => {
      const mesh = createCheckpointRing(i === 0);
      mesh.position.copy(p);
      ringsGroup.add(mesh);
    });
  }

  function applyWorld(data: TerrainWorld) {
    const prevGeo = terrainMesh.geometry;
    const prevWire = wireLines.geometry;
    terrainMesh.geometry = data.geometry;
    const edges = new THREE.EdgesGeometry(data.geometry, 18);
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
    const q = new THREE.Quaternion();
    playerPlane.getWorldQuaternion(q);
    const eul = new THREE.Euler().setFromQuaternion(q, "YXZ");
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

  function rebuild(seed: number) {
    world?.dispose();
    world = buildTerrain(seed);
    applyWorld(world);
    if (!playing) resetCinematic();
  }

  function resetCinematic() {
    vel.set(0, 0, 0);
    orbit = 0.6;
    placeCinematic(0);
  }

  function placeCinematic(dt: number) {
    if (!world) return;
    if (!reducedMotion) orbit += dt * 0.08;
    const af = world.airfield;
    _look.set(af.x, af.y + 4, af.z);
    const radius = 42;
    camPos.set(
      _look.x + Math.sin(orbit) * radius,
      af.y + 14,
      _look.z + Math.cos(orbit) * radius,
    );
    camPos.y = Math.max(camPos.y, world.sample(camPos.x, camPos.z) + 6);
    camera.position.copy(camPos);
    camera.lookAt(_look);
    yaw = af.yaw;
    pitch = -0.18;
  }

  function spawnPlayer() {
    if (!world) return;
    const af = world.airfield;
    const p = localOnField(af, -af.length * 0.38, 3.6);
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
      const m = ch as THREE.Mesh;
      const mat = m.material as THREE.MeshLambertMaterial;
      mat.color.set(i === 0 ? 0xe8eee9 : 0x6a736e);
      mat.emissive.set(i === 0 ? 0xc5d4cc : 0x000000);
      mat.emissiveIntensity = i === 0 ? 0.45 : 0;
      m.visible = true;
    });
    camPos.copy(pos).add(new THREE.Vector3(6, 4, 8));
  }

  function basis() {
    _fwd.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    _right.set(Math.cos(yaw), 0, -Math.sin(yaw));
  }

  function nearestVehicle(): "plane" | "jeep" | null {
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
    const speed = vel.length();
    if (speed > 5 || airborne) return;
    const side = localOnField(
      { ...world.airfield, x: pos.x, z: pos.z, yaw },
      0,
      3.2,
    );
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

  function stepFoot(dt: number) {
    if (!world) return;
    const look = input.consumeLook();
    yaw -= look.dx * LOOK_SENS;
    pitch -= look.dy * LOOK_SENS;
    pitch = Math.max(-0.9, Math.min(0.55, pitch));
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

  function stepVehicle(dt: number, kind: "jeep" | "plane") {
    if (!world) return;
    const look = input.consumeLook();
    const wish = input.wishDir();
    const steer = -wish.x;
    if (kind === "plane") {
      pitch -= look.dy * LOOK_SENS;
      pitch -= wish.y * 0.9 * dt;
      pitch = Math.max(-0.7, Math.min(0.55, pitch));
      throttle += ((wish.z > 0.1 ? 1 : wish.z < -0.1 ? 0 : throttle) - throttle) * (1 - Math.exp(-2.4 * dt));
      if (wish.z < -0.1 && !airborne) throttle = 0;
      const max = 48;
      const accel = airborne ? 18 : 14;
      const speed = Math.hypot(vel.x, vel.z);
      const target = throttle * max;
      const sp = speed + (target - speed) * (1 - Math.exp(- (airborne ? 1.1 : 1.6) * dt));
      const turn = steer * (airborne ? 1.15 : 1.6) * Math.min(1, sp / 8);
      yaw += turn * dt;
      roll += (steer * 0.55 - roll) * (1 - Math.exp(-6 * dt));
      basis();
      const cp = Math.cos(pitch);
      const spitch = Math.sin(pitch);
      vel.x = _fwd.x * sp * cp;
      vel.z = _fwd.z * sp * cp;
      if (airborne) {
        vel.y += (-22 + sp * 0.38 - pitch * sp * 1.6) * dt;
        vel.y *= Math.exp(-0.35 * dt);
      } else {
        vel.y = 0;
      }
      pos.x += vel.x * dt;
      pos.z += vel.z * dt;
      pos.y += (airborne ? vel.y * dt : 0);
      const ground = world.sample(pos.x, pos.z);
      const deck = ground + 0.05;
      if (!airborne) {
        pos.y = deck;
        if (sp > 16 && pitch < -0.1) {
          airborne = true;
          vel.y = 4;
        }
      } else if (pos.y <= deck + 0.8 && vel.y <= 4) {
        pos.y = deck;
        vel.y = 0;
        airborne = false;
        pitch *= 0.4;
        roll *= 0.3;
      } else if (pos.y < deck) {
        pos.y = deck;
        vel.y = Math.abs(vel.y) * 0.2;
      }
    } else {
      basis();
      const along = vel.x * _fwd.x + vel.z * _fwd.z;
      const reverse = along >= 0 ? 1 : -1;
      yaw += steer * 2.1 * Math.min(1, Math.abs(along) / 4) * reverse * dt;
      yaw -= look.dx * LOOK_SENS * 0.15;
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
    const limit = WORLD_SIZE * 0.47;
    const radial = Math.hypot(pos.x, pos.z);
    if (radial > limit) {
      const s = limit / radial;
      pos.x *= s;
      pos.z *= s;
      vel.x *= 0.3;
      vel.z *= 0.3;
    }
  }

  function stepPlay(dt: number) {
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
      const prev = ringsGroup.children[ringIndex] as THREE.Mesh | undefined;
      if (prev) prev.visible = false;
      ringIndex += 1;
      const next = ringsGroup.children[ringIndex] as THREE.Mesh | undefined;
      if (next) {
        const mat = next.material as THREE.MeshLambertMaterial;
        mat.color.set(0xe8eee9);
        mat.emissive.set(0xc5d4cc);
        mat.emissiveIntensity = 0.45;
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

  function syncMeshes(dt: number) {
    character.position.set(pos.x, pos.y, pos.z);
    character.rotation.y = yaw;
    const spd = Math.hypot(vel.x, vel.z);
    if (mode === "foot" && character.visible) {
      animateWalk(character, spd, dt, walkT);
    }
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
    const active = ringsGroup.children[ringIndex] as THREE.Mesh | undefined;
    if (active && !reducedMotion) active.rotation.z += dt * 0.6;
  }

  function updateCamera(dt: number) {
    if (!world) return;
    basis();
    const dist = mode === "plane" ? (airborne ? 13 : 11) : mode === "jeep" ? 8.5 : 6.2;
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

  function applyLighting(dt: number) {
    const target = useGameStore.getState().night ? 1 : 0;
    const k = reducedMotion ? 1 : 1 - Math.exp(-3.2 * dt);
    nightBlend += (target - nightBlend) * k;
    const t = nightBlend;
    bgColor.copy(DAY.bg).lerp(NIGHT.bg, t);
    (scene.fog as THREE.Fog).color.copy(DAY.fog).lerp(NIGHT.fog, t);
    (scene.fog as THREE.Fog).near = 70 - t * 22;
    (scene.fog as THREE.Fog).far = 360 - t * 90;
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
    sunDisc.scale.setScalar(1 + t * 0.35);
    sunDiscMat.color.set(t > 0.5 ? 0xd5dff0 : 0xfff6d8);
    wireMat.color.copy(DAY.wire).lerp(NIGHT.wire, t);
    wireMat.opacity = 0.3 + t * 0.12;
    cloudMat.color.copy(DAY.cloud).lerp(NIGHT.cloud, t);
    stars.visible = t > 0.35;
    (stars.material as THREE.PointsMaterial).opacity = Math.max(0, (t - 0.35) / 0.65);
    if (t > 0.5 && sky.geometry !== nightSkyGeo) sky.geometry = nightSkyGeo;
    else if (t <= 0.5 && sky.geometry !== skyGeo.day) sky.geometry = skyGeo.day;
    sky.position.copy(camera.position);
    stars.position.copy(camera.position);
  }

  function driftClouds(dt: number) {
    if (!world) return;
    const half = WORLD_SIZE * 0.9;
    world.clouds.forEach((c, i) => {
      c.x += dt * 1.6;
      if (c.x > half) c.x = -half;
      _dummy.position.set(c.x, c.y, c.z);
      _dummy.rotation.set(0, c.rot, 0);
      _dummy.scale.setScalar(c.scale);
      _dummy.updateMatrix();
      clouds.setMatrixAt(i, _dummy.matrix);
    });
    clouds.instanceMatrix.needsUpdate = true;
  }

  function currentPrompt(): string {
    if (!playing) return "";
    if (mode === "foot") {
      const n = nearestVehicle();
      if (n === "plane") return "E — Monter dans l’avion";
      if (n === "jeep") return "E — Prendre la jeep";
      return "Rejoignez l’avion sur le tarmac";
    }
    if (mode === "jeep") return "E — Descendre  ·  Z accélère, Q/D braque";
    if (!airborne) {
      if (throttle < 0.4) return "Z — Plein gaz sur la piste";
      return "Tirer la souris pour cabrer et décoller";
    }
    if (ringIndex < RING_TOTAL) return `Anneau ${ringIndex + 1} / ${RING_TOTAL}`;
    return "Revenez atterrir sur la piste";
  }

  function publishHud() {
    if (!world) return;
    const ground = world.sample(pos.x, pos.z);
    const speed = vel.length();
    const heading = ((THREE.MathUtils.radToDeg(yaw) % 360) + 360) % 360;
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
      prompt,
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

  const timer = new THREE.Timer();
  timer.connect(document);
  let acc = 0;
  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  const ro = new ResizeObserver(onResize);
  ro.observe(canvas.parentElement ?? canvas);

  function frame() {
    if (disposed) return;
    timer.update();
    const dt = Math.min(timer.getDelta(), 0.1);
    input.beginFrame();
    if (input.justPressed("KeyF")) useGameStore.getState().toggleWireframe();
    if (input.justPressed("KeyN") || input.justPressed("KeyL")) {
      useGameStore.getState().toggleNight();
    }
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
    if (hudAcc > 0.08) {
      hudAcc = 0;
      publishHud();
    }
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(frame);

  const probe: ControlsProbe = {
    getYaw: () => yaw,
    getSpeed: () => vel.length(),
    getPosition: () => ({ x: pos.x, y: pos.y, z: pos.z }),
    setKeys: (codes) => input.setKeys(codes),
  };
  window.__controlsTest = probe;
  window.__gameReady = true;
  useGameStore.getState().setReady(true);

  const api: GameEngine = {
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
      (stars.material as THREE.Material).dispose();
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
    },
  };

  return api;
}

function makeSkyDome(): { day: THREE.SphereGeometry; night: THREE.SphereGeometry } {
  const make = (zenith: number, horizon: number) => {
    const geo = new THREE.SphereGeometry(420, 20, 12);
    const zc = new THREE.Color(zenith);
    const hc = new THREE.Color(horizon);
    const cols = new Float32Array(geo.attributes.position.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < geo.attributes.position.count; i++) {
      const y = geo.attributes.position.getY(i) / 420;
      const t = THREE.MathUtils.smoothstep(y, -0.05, 0.72);
      c.copy(hc).lerp(zc, t);
      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return geo;
  };
  return { day: make(0x5ea6c9, 0xd7e8ee), night: make(0x070b14, 0x152033) };
}

function makeStars(): THREE.Points {
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
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, placed);
  const mat = new THREE.PointsMaterial({
    color: 0xe8eef2,
    size: 1.15,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  });
  return new THREE.Points(geo, mat);
}
