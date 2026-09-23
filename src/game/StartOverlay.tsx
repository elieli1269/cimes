import type { ReactNode } from "react";
import { Keyboard, Mountain, MousePointer2, Plane } from "lucide-react";
import { useGameStore } from "./store";
import { gameRef } from "./api";
import { mulberry32 } from "./prng";

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s - m * 60;
  return `${m}:${r.toFixed(1).padStart(4, "0")}`;
}

export function StartOverlay() {
  const phase = useGameStore((s) => s.phase);
  const seed = useGameStore((s) => s.seed);
  const ready = useGameStore((s) => s.ready);
  const hud = useGameStore((s) => s.hud);
  const bestTime = useGameStore((s) => s.bestTime);

  if (phase === "play") return null;

  if (phase === "win") {
    return (
      <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/80 to-transparent p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:justify-center md:p-10">
        <div className="max-w-lg rounded-xl border border-border bg-surface/95 p-5 md:p-7">
          <p className="mb-2 text-xs font-medium tracking-widest text-muted uppercase">Circuit terminé</p>
          <h1 className="font-display text-4xl tracking-tight text-fg">Piste en vue</h1>
          <p className="mt-3 text-sm text-muted">
            Temps {formatTime(hud.time)}
            {bestTime !== null ? ` · record ${formatTime(bestTime)}` : ""}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => gameRef.current?.start()}
              className="h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg hover:opacity-90"
            >
              Rejouer
            </button>
            <button
              type="button"
              onClick={() => gameRef.current?.regenerate(seed)}
              className="h-11 rounded-lg border border-border bg-surface-2 px-4 text-sm font-medium text-fg"
            >
              Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-bg via-bg/75 to-transparent p-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:justify-center md:p-10">
      <div className="max-w-lg rounded-xl border border-border bg-surface/95 p-5 md:p-7">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium tracking-widest text-muted uppercase">
          <Mountain className="size-3.5" strokeWidth={1.75} />
          Aérodrome des cimes
        </p>
        <h1 className="font-display text-4xl leading-none tracking-tight text-fg md:text-5xl">Cimes</h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted md:text-base">
          Vous êtes au sol, sur le tarmac. Montez dans un avion, décollez, enfilez les anneaux du massif, puis
          atterrissez.
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!ready}
            onClick={() => gameRef.current?.start()}
            className="h-11 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg transition-opacity duration-150 hover:opacity-90 disabled:opacity-50"
          >
            Entrer sur le tarmac
          </button>
          <button
            type="button"
            disabled={!ready}
            onClick={() => {
              const next = Math.floor(mulberry32(seed ^ Date.now())() * 90000) + 1000;
              gameRef.current?.regenerate(next);
            }}
            className="h-11 rounded-lg border border-border bg-surface-2 px-4 text-sm font-medium text-fg transition-colors duration-150 hover:border-accent/40 disabled:opacity-50"
          >
            Autre massif
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <Control icon={<MousePointer2 className="size-4" strokeWidth={1.75} />} k="Souris" v="Regarder · cabrer" />
          <Control icon={<Keyboard className="size-4" strokeWidth={1.75} />} k="Z/Q/S/D · WASD" v="Marcher / rouler" />
          <Control icon={<Plane className="size-4" strokeWidth={1.75} />} k="E" v="Monter · descendre" />
          <Control k="Piste" v="Gaz, cabrer, anneaux, atterrir" />
        </dl>

        <p className="mt-4 text-xs text-subtle">
          Graine {seed}
          {bestTime !== null ? ` · record ${formatTime(bestTime)}` : ""}
        </p>
      </div>
    </div>
  );
}

function Control({ k, v, icon }: { k: string; v: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {icon ? <span className="mt-0.5 text-muted">{icon}</span> : null}
      <div>
        <dt className="font-medium text-fg">{k}</dt>
        <dd className="text-muted">{v}</dd>
      </div>
    </div>
  );
}
