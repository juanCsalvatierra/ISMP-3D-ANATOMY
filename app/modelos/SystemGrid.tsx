"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useUserStore } from "../store/userStore";
import { useHydrated } from "../store/useHydrated";
import { READY_SYSTEMS, systemsForCarreras } from "../config/systems";
import { CARRERAS } from "../domain/academic";

export function SystemGrid() {
  const hydrated = useHydrated();
  const currentUser = useUserStore((s) => s.currentUser);
  const initialized = useUserStore((s) => s.initialized);
  const init = useUserStore((s) => s.init);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  const carreraIds = currentUser?.carreraIds ?? null;

  const filtered = useMemo(
    () => systemsForCarreras(carreraIds),
    [carreraIds],
  );

  // Antes de hidratar mostramos todos para no parpadear.
  const isFiltering = hydrated && initialized && !showAll && filtered.length < READY_SYSTEMS.length;
  const systems = isFiltering ? filtered : READY_SYSTEMS;

  const carreraLabels = (carreraIds ?? [])
    .map((c) => CARRERAS[c as keyof typeof CARRERAS]?.label)
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      {/* Vista combinada — destacada */}
      <Link href="/modelos/combinado" className="group block mb-6">
        <div
          className="rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
          style={{ background: "var(--bg-panel)", borderLeft: "4px solid var(--accent)" }}
        >
          <div className="flex-1">
            <span
              className="inline-block text-xs px-2 py-0.5 rounded mb-2"
              style={{
                background: "var(--bg-elevated)",
                fontFamily: "var(--font-ibm-plex-mono)",
                color: "var(--text-muted)",
              }}
            >
              Multicapa
            </span>
            <h2
              className="text-xl font-semibold"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
            >
              Vista combinada
            </h2>
            <p
              className="text-sm mt-1"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              Todos los sistemas en un mismo modelo. Activá y ocultá capas desde el panel lateral.
            </p>
          </div>
          <span
            className="text-xl transition-transform group-hover:translate-x-1 shrink-0"
            style={{ color: "var(--accent)" }}
          >
            →
          </span>
        </div>
      </Link>

      {isFiltering && (
        <div
          className="flex flex-wrap items-center gap-2 mb-6 text-sm"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
        >
          <span>
            Mostrando los sistemas de tu carrera{carreraLabels ? `: ${carreraLabels}` : ""}.
          </span>
          <button
            onClick={() => setShowAll(true)}
            className="ui-link"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
          >
            Ver todos los sistemas →
          </button>
        </div>
      )}
      {!isFiltering && hydrated && initialized && carreraIds && carreraIds.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowAll(false)}
            className="ui-link text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            ← Ver solo los de mi carrera
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {systems.map((sys) => (
          <Link key={sys.id} href={`/modelos/${sys.id}`} className="group block">
            <div className="system-card h-full flex flex-col gap-4 p-6">
              <div>
                <span
                  className="inline-block text-xs px-2 py-0.5 rounded mb-3"
                  style={{
                    background: "var(--bg-elevated)",
                    fontFamily: "var(--font-ibm-plex-mono)",
                    color: "var(--text-muted)",
                  }}
                >
                  Modelo 3D
                </span>
                <div className="flex items-start justify-between gap-2">
                  <h2
                    className="text-xl font-semibold"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                  >
                    {sys.shortLabel}
                  </h2>
                  <span
                    className="text-xl transition-transform group-hover:translate-x-1 mt-0.5"
                    style={{ color: "var(--accent)" }}
                  >
                    →
                  </span>
                </div>
                <p
                  className="text-sm mt-1"
                  style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
                >
                  {sys.tagline}
                </p>
              </div>
              <div
                className="mt-auto pt-4"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <span
                  className="text-xs"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                >
                  {sys.count}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
