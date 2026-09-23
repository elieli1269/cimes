import type { ReactNode } from "react";
import { Grid2x2, Moon, Sun } from "lucide-react";
import { useGameStore } from "./store";
import { gameRef } from "./api";
import { cn } from "@/lib/utils";

function format(n: number, digits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(1).padStart(4, "0")}`;
}

export function Hud() {
  const playing = useGameStore((s) => s.playing);
  const phase = useGameStore((s) => s.phase);
  const wireframe = useGameStore((s) => s.wireframe);
  const night = useGameStore((s) => s.night);
  const hud = useGameStore((s) => s.hud);
  const pointerLocked = useGameStore((s) => s.pointerLocked);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-fg">
      <header className="absolute top-0 left-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] pl-[max(1rem,env(safe-area-inset-left))]">
        <p className="font-display text-xl leading-tight tracking-tight text-fg">Cimes</p>
        <p className="text-xs tracking-wide text-muted">Aérodrome · circuit</p>
      </header>

      <div className="pointer-events-auto absolute top-0 right-0 flex gap-2 p-4 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))]">
        <Toggle
          pressed={wireframe}
          onClick={() => gameRef.current?.setWireframe(!wireframe)}
          label="Filaire"
        >
          <Grid2x2 className="size-4" strokeWidth={1.75} />
        </Toggle>
        <Toggle
          pressed={night}
          onClick={() => gameRef.current?.setNight(!night)}
          label={night ? "Nuit" : "Jour"}
        >
          {night ? <Moon className="size-4" strokeWidth={1.75} /> : <Sun className="size-4" strokeWidth={1.75} />}
        </Toggle>
      </div>

      <div className="absolute top-16 left-0 flex flex-wrap items-end gap-2 p-4 pl-[max(1rem,env(safe-area-inset-left))] md:top-auto md:bottom-0 md:pb-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))]">
        <Instrument label="Altitude" value={`${format(hud.altitude)} m`} hint={`sol ${format(hud.agl)} m`} />
        <Instrument label="Vitesse" value={`${format(hud.speed)}`} hint="m/s" />
        {hud.mode === "plane" && (
          <Instrument label="Gaz" value={`${format(hud.throttle * 100)}`} hint={hud.airborne ? "en l’air" : "au sol"} />
        )}
        <Instrument label="Anneaux" value={`${hud.ringsDone}/${hud.ringsTotal}`} hint={formatTime(hud.time)} />
        <Compass heading={hud.heading} />
      </div>

      {playing && hud.prompt && (
        <p className="absolute top-20 right-1/2 w-max max-w-[min(22rem,calc(100%-2rem))] translate-x-1/2 rounded-lg border border-border bg-surface/90 px-3 py-2 text-center text-sm text-fg md:top-6">
          {hud.prompt}
        </p>
      )}

      {playing && (
        <p className="absolute right-4 bottom-4 hidden max-w-52 text-right text-xs leading-relaxed text-muted md:block">
          {pointerLocked ? "Échap libère la souris" : "Glisser pour regarder · clic pour capturer"}
        </p>
      )}

      {phase === "play" && hud.mode !== "foot" && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2">
          <span className="absolute top-1/2 left-1/2 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-accent/80" />
          <span className="absolute top-1/2 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-accent/80" />
        </div>
      )}
    </div>
  );
}

function Toggle({
  pressed,
  onClick,
  label,
  children,
}: {
  pressed: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors duration-150",
        pressed
          ? "border-accent bg-accent text-accent-fg"
          : "border-border bg-surface/90 text-fg hover:bg-surface-2",
      )}
    >
      <span className="sr-only">{label}</span>
      {children}
    </button>
  );
}

function Instrument({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="min-w-24 rounded-xl border border-border bg-surface/90 px-3 py-2">
      <p className="text-xs font-medium tracking-wider text-muted uppercase">{label}</p>
      <p className="font-mono text-lg leading-tight font-medium tabular-nums text-fg">{value}</p>
      <p className="text-xs text-subtle tabular-nums">{hint}</p>
    </div>
  );
}

function Compass({ heading }: { heading: number }) {
  return (
    <div className="flex size-16 items-center justify-center rounded-xl border border-border bg-surface/90">
      <div
        className="relative size-10"
        style={{ transform: `rotate(${-heading}deg)` }}
        aria-label={`Cap ${format(heading)} degrés`}
      >
        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-semibold text-accent">N</span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-subtle">S</span>
        <span className="absolute top-1/2 left-0 -translate-y-1/2 text-xs text-subtle">O</span>
        <span className="absolute top-1/2 right-0 -translate-y-1/2 text-xs text-subtle">E</span>
      </div>
    </div>
  );
}
