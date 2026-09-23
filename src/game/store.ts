import { create } from "zustand";

export type PlayMode = "foot" | "jeep" | "plane";
export type Phase = "menu" | "play" | "win";

export type HudSnapshot = {
  altitude: number;
  agl: number;
  speed: number;
  heading: number;
  throttle: number;
  airborne: boolean;
  mode: PlayMode;
  ringsDone: number;
  ringsTotal: number;
  time: number;
  prompt: string;
};

type GameState = {
  ready: boolean;
  playing: boolean;
  phase: Phase;
  pointerLocked: boolean;
  wireframe: boolean;
  night: boolean;
  seed: number;
  hud: HudSnapshot;
  bestTime: number | null;
  setReady: (ready: boolean) => void;
  setPlaying: (playing: boolean) => void;
  setPhase: (phase: Phase) => void;
  setPointerLocked: (locked: boolean) => void;
  setWireframe: (wireframe: boolean) => void;
  toggleWireframe: () => void;
  setNight: (night: boolean) => void;
  toggleNight: () => void;
  setSeed: (seed: number) => void;
  setHud: (hud: HudSnapshot) => void;
  setBestTime: (bestTime: number) => void;
};

function loadFlag(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === "1") return true;
    if (raw === "0") return false;
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveFlag(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function loadBest(): number | null {
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

const INITIAL_SEED = 42817;

export const EMPTY_HUD: HudSnapshot = {
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
  prompt: "",
};

export const useGameStore = create<GameState>((set) => ({
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
  toggleWireframe: () =>
    set((s) => {
      const wireframe = !s.wireframe;
      saveFlag("cimes.wireframe", wireframe);
      return { wireframe };
    }),
  setNight: (night) => {
    saveFlag("cimes.night", night);
    set({ night });
  },
  toggleNight: () =>
    set((s) => {
      const night = !s.night;
      saveFlag("cimes.night", night);
      return { night };
    }),
  setSeed: (seed) => set({ seed }),
  setHud: (hud) => set({ hud }),
  setBestTime: (bestTime) => {
    try {
      window.localStorage.setItem("cimes.best", String(bestTime));
    } catch {
      /* ignore */
    }
    set({ bestTime });
  },
}));
