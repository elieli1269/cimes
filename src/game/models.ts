import * as THREE from "three";

function mat(color: number, opts?: { flat?: boolean; emissive?: number }): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color,
    flatShading: opts?.flat !== false,
    emissive: opts?.emissive ? new THREE.Color(opts.emissive) : undefined,
    emissiveIntensity: opts?.emissive ? 0.35 : 0,
  });
}

function addBox(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  rx = 0,
  ry = 0,
  rz = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  parent.add(mesh);
  return mesh;
}

/** Low-poly pilot. Local forward is −Z, feet at y = 0. */
export function createCharacter(): THREE.Group {
  const g = new THREE.Group();
  g.name = "character";
  addBox(g, 0.42, 0.58, 0.28, 0xc5d4cc, 0, 1.12, 0);
  addBox(g, 0.32, 0.32, 0.3, 0xc4a07a, 0, 1.58, 0.02);
  addBox(g, 0.34, 0.1, 0.34, 0x2a332e, 0, 1.76, 0);
  const armL = addBox(g, 0.14, 0.52, 0.14, 0x3d4f44, -0.3, 1.08, 0);
  const armR = addBox(g, 0.14, 0.52, 0.14, 0x3d4f44, 0.3, 1.08, 0);
  const legL = addBox(g, 0.16, 0.7, 0.18, 0x2c3530, -0.12, 0.36, 0);
  const legR = addBox(g, 0.16, 0.7, 0.18, 0x2c3530, 0.12, 0.36, 0);
  armL.name = "armL";
  armR.name = "armR";
  legL.name = "legL";
  legR.name = "legR";
  return g;
}

/** Propeller plane, nose toward −Z, wheels on y = 0. */
export function createPlane(livery = 0xe8eee9): THREE.Group {
  const g = new THREE.Group();
  g.name = "plane";
  addBox(g, 0.72, 0.56, 3.6, livery, 0, 1.05, -0.15);
  addBox(g, 0.5, 0.42, 0.7, 0x8b9a90, 0, 1.18, -2.05);
  addBox(g, 0.62, 0.36, 0.7, 0x1c261f, 0, 1.28, 0.2);
  addBox(g, 5.4, 0.08, 1.15, 0x3d4f44, 0, 1.02, -0.35);
  addBox(g, 0.12, 0.08, 1.05, 0xc4a574, 2.55, 1.06, -0.35);
  addBox(g, 0.12, 0.08, 1.05, 0xc4a574, -2.55, 1.06, -0.35);
  addBox(g, 1.6, 0.07, 0.7, 0x3d4f44, 0, 1.12, 1.55);
  addBox(g, 0.08, 0.85, 0.55, 0x3d4f44, 0, 1.55, 1.55);
  addBox(g, 0.22, 0.22, 0.22, 0x2a332e, 0, 0.22, -0.9);
  addBox(g, 0.16, 0.28, 0.16, 0x2a332e, -0.38, 0.2, 0.85);
  addBox(g, 0.16, 0.28, 0.16, 0x2a332e, 0.38, 0.2, 0.85);
  const prop = new THREE.Group();
  prop.name = "prop";
  prop.position.set(0, 1.08, -2.42);
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.35, 0.08), mat(0x1c261f));
  const blade2 = blade.clone();
  blade2.rotation.z = Math.PI / 2;
  prop.add(blade, blade2);
  g.add(prop);
  return g;
}

/** Utility jeep, nose toward −Z. */
export function createJeep(): THREE.Group {
  const g = new THREE.Group();
  g.name = "jeep";
  addBox(g, 1.35, 0.42, 2.2, 0x4a5c3a, 0, 0.62, 0);
  addBox(g, 1.2, 0.5, 1.05, 0x3d4f32, 0, 1.05, 0.15);
  addBox(g, 1.22, 0.08, 0.08, 0x1c261f, 0, 1.32, -0.35);
  addBox(g, 0.38, 0.38, 0.28, 0x2a332e, -0.55, 0.28, 0.72);
  addBox(g, 0.38, 0.38, 0.28, 0x2a332e, 0.55, 0.28, 0.72);
  addBox(g, 0.38, 0.38, 0.28, 0x2a332e, -0.55, 0.28, -0.72);
  addBox(g, 0.38, 0.38, 0.28, 0x2a332e, 0.55, 0.28, -0.72);
  addBox(g, 0.5, 0.12, 0.22, 0xc4a574, 0, 0.55, -1.15);
  return g;
}

export function createHangar(): THREE.Group {
  const g = new THREE.Group();
  addBox(g, 10, 4.2, 8, 0x5c6560, 0, 2.1, 0);
  addBox(g, 8.2, 3.2, 0.2, 0x1a1f1c, 0, 1.7, 4.05);
  addBox(g, 10.3, 0.18, 8.3, 0x3a4340, 0, 4.28, 0);
  return g;
}

export function createTower(): THREE.Group {
  const g = new THREE.Group();
  addBox(g, 2.2, 6.5, 2.2, 0x6a736e, 0, 3.25, 0);
  addBox(g, 3.4, 1.6, 3.4, 0xc5d4cc, 0, 7.1, 0);
  addBox(g, 3.6, 0.12, 3.6, 0x2a332e, 0, 7.95, 0);
  addBox(g, 0.12, 1.4, 0.12, 0x8b9a90, 0, 8.7, 0);
  return g;
}

export function createWindsock(): THREE.Group {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 4.2, 6), mat(0x8b9a90));
  pole.position.y = 2.1;
  g.add(pole);
  const sock = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.4, 5), mat(0xc4a574));
  sock.rotation.z = Math.PI / 2;
  sock.position.set(0.85, 3.85, 0);
  g.add(sock);
  return g;
}

export function createCheckpointRing(active: boolean): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(4.2, 0.28, 8, 20),
    new THREE.MeshLambertMaterial({
      color: active ? 0xe8eee9 : 0x6a736e,
      emissive: active ? 0xc5d4cc : 0x000000,
      emissiveIntensity: active ? 0.45 : 0,
      flatShading: true,
    }),
  );
  mesh.rotation.y = Math.PI / 2;
  return mesh;
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry.dispose();
      const m = mesh.material;
      if (Array.isArray(m)) m.forEach((x) => x.dispose());
      else m.dispose();
    }
  });
}

export function animateWalk(character: THREE.Group, speed: number, _dt: number, t: number) {
  const legL = character.getObjectByName("legL");
  const legR = character.getObjectByName("legR");
  const armL = character.getObjectByName("armL");
  const armR = character.getObjectByName("armR");
  const amp = Math.min(0.7, speed * 0.12);
  const swing = Math.sin(t * 8) * amp;
  if (legL) legL.rotation.x = swing;
  if (legR) legR.rotation.x = -swing;
  if (armL) armL.rotation.x = -swing * 0.7;
  if (armR) armR.rotation.x = swing * 0.7;
}
