import type { GameEngine } from "./engine";

export const gameRef: { current: GameEngine | null } = { current: null };
