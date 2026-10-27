"use client";
import { useEffect } from "react";
import Link from "next/link";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useUserStore } from "../store/userStore";
import { useHydrated } from "../store/useHydrated";
import { SYSTEMS } from "../config/systems";
import {
  CARRERAS,
  MATERIAS,
  carreraDeUsuarioParaMateria,
  carrerasDeMateria,
  materiasParaCarreras,
} from "../domain/academic";
import { PROGRAMAS, sistemasDeMateria, unidadesDeMateria } from "../domain/programas";

export default function MisMateriasPage() {
  const hydrated = useHydrated();
  const currentUser = useUserStore((s) => s.currentUser);
  const initialized = useUserStore((s) => s.initialized);
  const init = useUserStore((s) => s.init);

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  const carreraIds = currentUser?.carreraIds ?? null;
  const materias = materiasParaCarreras(carreraIds);
  const verTodas = !carreraIds || carreraIds.length === 0;

  return (
    <main style={{ background: "var(--bg-page)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Mis materias" }]} />
      </div>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
        >
          Mis materias
        </h1>
        <p
          className="text-sm max-w-xl mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
        >
          Elegí una materia para recorrer sus unidades: cada una se puede abrir en 3D con los
          sistemas que corresponden, o practicar con cuestionarios.
          {hydrated && initialized && verTodas ? " Se muestran todas las materias." : ""}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materias.map((id) => {
            const carreraId = carreraDeUsuarioParaMateria(carreraIds, id);
            const unidades = unidadesDeMateria(id, carreraId);
            const sistemas = sistemasDeMateria(id, carreraId);
            const carreras = carrerasDeMateria(id).filter(
              (c) => verTodas || carreraIds?.includes(c),
            );
            return (
              <Link key={id} href={`/materias/${id}`} className="group block">
                <div className="system-card h-full flex flex-col gap-4 p-6">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {carreras.map((c) => (
                        <span
                          key={c}
                          className="inline-block text-xs px-2 py-0.5 rounded"
                          style={{
                            background: "var(--bg-elevated)",
                            fontFamily: "var(--font-ibm-plex-mono)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {CARRERAS[c].label}
                        </span>
                      ))}
                      {PROGRAMAS[id].provisorio && (
                        <span
                          className="inline-block text-xs px-2 py-0.5 rounded"
                          style={{
                            border: "1px solid var(--accent)",
                            fontFamily: "var(--font-ibm-plex-mono)",
                            color: "var(--accent)",
                          }}
                        >
                          Programa provisorio
                        </span>
                      )}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <h2
                        className="text-xl font-semibold"
                        style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
                      >
                        {MATERIAS[id].label}
                      </h2>
                      <span
                        className="text-xl transition-transform group-hover:translate-x-1 mt-0.5"
                        style={{ color: "var(--accent)" }}
                      >
                        →
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {sistemas.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded"
                        style={{
                          background: "var(--bg-elevated)",
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-ibm-plex-sans)",
                        }}
                      >
                        <span className="w-2 h-2 rounded-sm" style={{ background: SYSTEMS[s].swatch }} />
                        {SYSTEMS[s].shortLabel}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <span
                      className="text-xs"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      {unidades.length} unidades
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
