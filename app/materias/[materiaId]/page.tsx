"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useUserStore } from "../../store/userStore";
import { SYSTEMS } from "../../config/systems";
import {
  CARRERAS,
  MATERIAS,
  MATERIA_IDS,
  carreraDeUsuarioParaMateria,
  carrerasDeMateria,
  type CarreraId,
  type MateriaId,
} from "../../domain/academic";
import { PROGRAMAS, unidadesDeMateria } from "../../domain/programas";

const CARRERA_CORTA: Record<CarreraId, string> = {
  "carrera-rad": "Radiología",
  "carrera-iq": "Instr. Quirúrgica",
  "carrera-hem": "Hemoterapia",
  "carrera-lab": "Laboratorio",
};

export default function MateriaPage({ params }: { params: Promise<{ materiaId: string }> }) {
  const { materiaId: param } = use(params);
  const materiaId = MATERIA_IDS.find((m) => m === param);
  if (!materiaId) notFound();
  return <MateriaDetalle materiaId={materiaId} />;
}

function MateriaDetalle({ materiaId }: { materiaId: MateriaId }) {
  const currentUser = useUserStore((s) => s.currentUser);
  const initialized = useUserStore((s) => s.initialized);
  const init = useUserStore((s) => s.init);
  const [verTodas, setVerTodas] = useState(false);

  useEffect(() => {
    if (!initialized) init();
  }, [initialized, init]);

  const carreraId = carreraDeUsuarioParaMateria(currentUser?.carreraIds, materiaId);
  const compartida = carrerasDeMateria(materiaId).length > 1;
  const todas = unidadesDeMateria(materiaId);
  // Materias compartidas (Anatomía I y II): por defecto solo las unidades del
  // programa de la carrera del alumno; "ver todas" muestra la unión.
  const filtrando = compartida && !!carreraId && !verTodas;
  const unidades = filtrando ? unidadesDeMateria(materiaId, carreraId) : todas;
  const hayOtras = compartida && !!carreraId && todas.length > unidadesDeMateria(materiaId, carreraId).length;
  const programa = PROGRAMAS[materiaId];

  return (
    <main style={{ background: "var(--bg-page)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Mis materias", href: "/materias" },
            { label: MATERIAS[materiaId].label },
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {carrerasDeMateria(materiaId).map((c) => (
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
        </div>
        <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
          {MATERIAS[materiaId].label}
        </h1>

        {programa.provisorio && (
          <p
            className="text-sm rounded-lg px-4 py-3 mb-6"
            style={{
              border: "1px solid var(--accent)",
              background: "rgba(194,47,47,0.08)",
              fontFamily: "var(--font-ibm-plex-serif)",
              color: "var(--text-secondary)",
            }}
          >
            El programa de esta materia es provisorio (reutiliza los contenidos de Anatomía
            Descriptiva y Fisiológica) hasta contar con el programa oficial.
          </p>
        )}

        {hayOtras && (
          <div
            className="flex flex-wrap items-center gap-2 mb-6 text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            <span>
              {filtrando
                ? `Mostrando las unidades de ${CARRERA_CORTA[carreraId!]}.`
                : "Mostrando todas las unidades de la materia."}
            </span>
            <button
              onClick={() => setVerTodas((v) => !v)}
              className="ui-link"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
            >
              {filtrando ? "Ver todas →" : "← Solo las de mi carrera"}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {unidades.map((u) => {
            const tiene3D = u.sistemas3D.length > 0;
            return (
              <article key={u.n} className="ui-panel rounded-xl p-5 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <span
                    className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm"
                    style={{
                      background: "var(--bg-elevated)",
                      fontFamily: "var(--font-ibm-plex-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    {u.n}
                  </span>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
                      {u.titulo}
                    </h2>
                    {compartida && u.origen && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {u.origen.map((c) => (
                          <span
                            key={c}
                            className="text-[11px] px-1.5 py-0.5 rounded"
                            style={{
                              background: "var(--bg-elevated)",
                              fontFamily: "var(--font-ibm-plex-mono)",
                              color: "var(--text-muted)",
                            }}
                          >
                            {CARRERA_CORTA[c]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <details>
                  <summary
                    className="text-sm cursor-pointer select-none"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
                  >
                    {u.temas.length} temas
                  </summary>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {u.temas.map((t) => (
                      <li
                        key={t}
                        className="text-sm leading-snug pl-3"
                        style={{
                          fontFamily: "var(--font-ibm-plex-serif)",
                          color: "var(--text-muted)",
                          borderLeft: "2px solid var(--border-subtle)",
                        }}
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </details>

                <div className="flex flex-wrap items-center gap-2">
                  {u.sistemas3D.map((s) => (
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
                  {u.nota3D && (
                    <span
                      className="text-xs"
                      style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)", fontStyle: "italic" }}
                    >
                      {u.nota3D}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  {tiene3D && (
                    <Link href={`/modelos/combinado?materia=${materiaId}&unidad=${u.n}`} className="btn-primary">
                      Ver en 3D →
                    </Link>
                  )}
                  <Link
                    href={`/cuestionarios/generar?materiaId=${materiaId}&unidad=${u.n}`}
                    className="btn-secondary"
                  >
                    Practicar
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
