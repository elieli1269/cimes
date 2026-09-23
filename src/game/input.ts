const GAME_CODES = new Set([
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
  "ArrowRight",
]);

export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  getPosition: () => { x: number; y: number; z: number };
  setKeys: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
    __gameReady?: boolean;
  }
}

export class Input {
  keys = new Set<string>();
  injected: string[] | null = null;
  lookDx = 0;
  lookDy = 0;
  touchX = 0;
  touchY = 0;
  touchClimb = 0;
  touchBoost = false;
  touchInteract = false;
  dragging = false;
  pointerLocked = false;
  private just = new Set<string>();
  private prev = new Set<string>();
  private unbind: Array<() => void> = [];

  attach(canvas: HTMLCanvasElement) {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) {
        if (GAME_CODES.has(e.code)) e.preventDefault();
        return;
      }
      this.keys.add(e.code);
      if (GAME_CODES.has(e.code)) e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
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
    const onMouseMove = (e: MouseEvent) => {
      if (this.pointerLocked || this.dragging) {
        this.lookDx += e.movementX;
        this.lookDy += e.movementY;
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (e.target !== canvas) return;
      this.dragging = true;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      this.dragging = false;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
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

    this.unbind.push(
      () => window.removeEventListener("keydown", onKeyDown),
      () => window.removeEventListener("keyup", onKeyUp),
      () => window.removeEventListener("blur", clear),
      () => window.removeEventListener("mousemove", onMouseMove),
      () => canvas.removeEventListener("pointerdown", onPointerDown),
      () => canvas.removeEventListener("pointerup", onPointerUp),
      () => canvas.removeEventListener("pointercancel", onPointerUp),
      () => document.removeEventListener("pointerlockchange", onLockChange),
    );
  }

  dispose() {
    for (const fn of this.unbind) fn();
    this.unbind.length = 0;
    this.keys.clear();
  }

  beginFrame() {
    const active = this.activeCodes();
    this.just.clear();
    for (const code of active) {
      if (!this.prev.has(code)) this.just.add(code);
    }
    this.prev = active;
  }

  activeCodes(): Set<string> {
    if (this.injected) return new Set(this.injected);
    return new Set(this.keys);
  }

  isDown(code: string): boolean {
    if (this.injected) return this.injected.includes(code);
    return this.keys.has(code);
  }

  justPressed(code: string): boolean {
    return this.just.has(code);
  }

  consumeLook(): { dx: number; dy: number } {
    const dx = this.lookDx;
    const dy = this.lookDy;
    this.lookDx = 0;
    this.lookDy = 0;
    return { dx, dy };
  }

  setKeys(codes: string[]) {
    this.injected = codes.length ? [...codes] : null;
  }

  wishDir(): { x: number; z: number; y: number; boost: boolean } {
    let x = this.touchX;
    let z = this.touchY;
    if (this.isDown("KeyW") || this.isDown("ArrowUp")) z += 1;
    if (this.isDown("KeyS") || this.isDown("ArrowDown")) z -= 1;
    if (this.isDown("KeyD") || this.isDown("ArrowRight")) x += 1;
    if (this.isDown("KeyA") || this.isDown("ArrowLeft")) x -= 1;
    let y = this.touchClimb;
    if (this.isDown("Space")) y += 1;
    if (
      this.isDown("ControlLeft") ||
      this.isDown("ControlRight") ||
      this.isDown("KeyC")
    ) {
      y -= 1;
    }
    const boost =
      this.touchBoost || this.isDown("ShiftLeft") || this.isDown("ShiftRight");
    const mag = Math.hypot(x, z);
    if (mag > 1) {
      x /= mag;
      z /= mag;
    }
    y = Math.max(-1, Math.min(1, y));
    return { x, z, y, boost };
  }
}
