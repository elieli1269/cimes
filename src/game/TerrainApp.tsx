import { useEffect, useRef } from "react";
import { createEngine } from "./engine";
import { gameRef } from "./api";
import { Hud } from "./Hud";
import { StartOverlay } from "./StartOverlay";
import { TouchControls } from "./TouchControls";
import { useGameStore } from "./store";

export default function TerrainApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
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

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full touch-none"
        onContextMenu={(e) => e.preventDefault()}
      />
      <Hud />
      <StartOverlay />
      <TouchControls />
    </div>
  );
}
