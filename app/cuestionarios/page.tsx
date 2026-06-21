"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useUserStore } from "@/app/store/userStore";
import { useCuestionarioBankStore, byMateria, FORMATO_LABELS } from "@/app/store/cuestionarioBankStore";
import {
  CARRERAS,
  MATERIAS,
  type CarreraId,
  materiasDeCarrera,
} from "@/app/domain/academic";
import { useHydrated } from "@/app/store/useHydrated";

export default function CuestionariosHubPage() {
  const hydrated = useHydrated();
  const currentUser = useUserStore((s) => s.currentUser);
  const cuestionarios = useCuestionarioBankStore((s) => s.cuestionarios);

  const defaultCarrera: CarreraId =
    (currentUser?.carreraIds?.[0] as CarreraId | undefined) ?? "carrera-iq";
  const [carreraSel, setCarreraSel] = useState<CarreraId>(defaultCarrera);

  const carreraId: CarreraId =
    currentUser?.role === "estudiante" && currentUser?.carreraIds?.[0]
      ? (currentUser.carreraIds[0] as CarreraId)
      : carreraSel;

  const materias = useMemo(() => materiasDeCarrera(carreraId), [carreraId]);

  const sinCarrera =
    hydrated && currentUser?.role === "estudiante" && !currentUser.carreraIds?.length;

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Cuestionarios" }]} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
          >
            Cuestionarios
          </h1>
          <p
            className="text-base"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Practicá con cuestionarios organizados por materia.
          </p>
        </div>

        {sinCarrera && (
          <div
            className="ui-panel rounded-xl p-4 mb-6"
            style={{ border: "1px solid var(--accent)", background: "rgba(194,47,47,0.08)" }}
          >
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
            >
              No tenés una carrera asignada. Contactá al administrador para que la asigne en tu perfil.
            </p>
          </div>
        )}

        {currentUser?.role !== "estudiante" && (
          <div className="mb-8">
            <h2
              className="text-xs uppercase tracking-wider mb-3"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Carrera
            </h2>
            <div
              className="inline-flex gap-1 p-1 rounded-lg"
              style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}
            >
              {(Object.keys(CARRERAS) as CarreraId[]).map((c) => {
                const active = carreraSel === c;
                return (
                  <button
                    key={c}
                    onClick={() => setCarreraSel(c)}
                    className="py-2 px-4 rounded-md text-sm transition-colors"
                    style={{
                      fontFamily: "var(--font-ibm-plex-sans)",
                      fontWeight: 500,
                      background: active ? "var(--accent)" : "transparent",
                      color: active ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {CARRERAS[c].label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-8">
          {materias.map((mat) => {
            const list = byMateria(cuestionarios, mat);
            return (
              <section key={mat}>
                <header className="flex items-baseline justify-between mb-3">
                  <h2
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                  >
                    {MATERIAS[mat].label}
                  </h2>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    {list.length} cuestionario{list.length === 1 ? "" : "s"}
                  </span>
                </header>

                {list.length === 0 ? (
                  <div
                    className="ui-panel rounded-xl p-6 text-center"
                    style={{ border: "1px dashed var(--border-subtle)" }}
                  >
                    <p
                      className="text-sm"
                      style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
                    >
                      Aún no hay cuestionarios disponibles en {MATERIAS[mat].label}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {list.map((c) => (
                      <Link
                        key={c.id}
                        href={`/cuestionarios/${c.id}`}
                        className="ui-panel rounded-xl p-5 group transition-all"
                        style={{ border: "1px solid var(--border-subtle)" }}
                      >
                        <p
                          className="text-base font-medium mb-1"
                          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                        >
                          {c.titulo}
                        </p>
                        <p
                          className="text-sm mb-3 line-clamp-2"
                          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
                        >
                          {c.descripcion || "Sin descripción"}
                        </p>
                        <div
                          className="flex items-center justify-between pt-3"
                          style={{ borderTop: "1px solid var(--border-subtle)" }}
                        >
                          <span
                            className="text-xs"
                            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                          >
                            {FORMATO_LABELS[c.formato]} · {c.preguntas.length} preguntas
                          </span>
                          <span
                            className="text-sm font-medium transition-transform group-hover:translate-x-1"
                            style={{ color: "var(--accent)", fontFamily: "var(--font-ibm-plex-sans)" }}
                          >
                            Iniciar →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {currentUser?.role === "docente" || currentUser?.role === "admin" ? (
          <div className="mt-10 flex justify-center">
            <Link href="/docente/cuestionarios/nuevo" className="btn-secondary">
              + Crear nuevo cuestionario
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
