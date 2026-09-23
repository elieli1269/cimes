import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronUp, Gauge } from "lucide-react";
import { useGameStore } from "./store";
import { gameRef } from "./api";
import { cn } from "@/lib/utils";

export function TouchControls() {
  const playing = useGameStore((s) => s.playing);
  const mode = useGameStore((s) => s.hud.mode);
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
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

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <Stick />
      <LookPad />
      <div className="pointer-events-auto absolute right-4 bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+4.5rem))] flex flex-col gap-2">
        <HoldButton
          label={mode === "plane" ? "Cabrer" : "Interagir"}
          onHold={(on) => {
            if (mode === "plane") gameRef.current?.setTouchClimb(on ? 1 : 0);
            else if (on) gameRef.current?.interact();
          }}
        >
          <ChevronUp className="size-5" strokeWidth={1.75} />
        </HoldButton>
        <button
          type="button"
          aria-label="Monter ou descendre"
          className="flex h-12 min-w-12 items-center justify-center rounded-lg border border-border bg-surface/90 px-3 text-sm font-semibold text-fg"
          onPointerDown={() => gameRef.current?.interact()}
        >
          E
        </button>
        <HoldButton label="Gaz" onHold={(on) => gameRef.current?.setTouchBoost(on)}>
          <Gauge className="size-5" strokeWidth={1.75} />
        </HoldButton>
      </div>
    </div>
  );
}

function Stick() {
  const origin = useRef({ x: 0, y: 0 });
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef(false);

  const end = () => {
    active.current = false;
    setKnob({ x: 0, y: 0 });
    gameRef.current?.setTouchMove(0, 0);
  };

  return (
    <div
      className="pointer-events-auto absolute bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-4 size-28 touch-none rounded-full border border-border bg-surface/80"
      onPointerDown={(e) => {
        active.current = true;
        origin.current = { x: e.clientX, y: e.clientY };
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!active.current) return;
        const dx = e.clientX - origin.current.x;
        const dy = e.clientY - origin.current.y;
        const max = 40;
        const mag = Math.hypot(dx, dy);
        const s = mag > max ? max / mag : 1;
        const x = dx * s;
        const y = dy * s;
        setKnob({ x, y });
        gameRef.current?.setTouchMove(x / max, -y / max);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      aria-label="Déplacement"
    >
      <div
        className="absolute top-1/2 left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/90"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}

function LookPad() {
  const last = useRef<{ x: number; y: number; id: number | null }>({ x: 0, y: 0, id: null });

  return (
    <div
      className="pointer-events-auto absolute top-20 right-0 h-1/2 w-1/2 touch-none"
      aria-label="Regard"
      onPointerDown={(e) => {
        last.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (last.current.id !== e.pointerId) return;
        const dx = e.clientX - last.current.x;
        const dy = e.clientY - last.current.y;
        last.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
        gameRef.current?.setTouchLook(dx, dy);
      }}
      onPointerUp={() => {
        last.current.id = null;
      }}
      onPointerCancel={() => {
        last.current.id = null;
      }}
    />
  );
}

function HoldButton({
  label,
  onHold,
  children,
}: {
  label: string;
  onHold: (down: boolean) => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "flex size-12 items-center justify-center rounded-lg border border-border bg-surface/90 text-fg",
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
        onHold(true);
      }}
      onPointerUp={() => onHold(false)}
      onPointerCancel={() => onHold(false)}
    >
      {children}
    </button>
  );
}
