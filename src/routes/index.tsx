import { useEffect, useState, type ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

function Home() {
  const [App, setApp] = useState<ComponentType | null>(null);

  useEffect(() => {
    void import("@/game/TerrainApp").then((mod) => {
      setApp(() => mod.default);
    });
  }, []);

  if (!App) {
    return (
      <main className="flex h-dvh items-end bg-bg p-6 md:items-center md:p-10">
        <div className="max-w-lg">
          <p className="text-xs font-medium tracking-widest text-muted uppercase">Vol libre</p>
          <h1 className="font-display text-4xl tracking-tight text-fg">Cimes</h1>
          <p className="mt-2 text-sm text-muted">Préparation du massif…</p>
        </div>
      </main>
    );
  }

  return <App />;
}
