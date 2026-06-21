"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { api, ApiError } from "@/app/lib/api";

interface AnswerLog {
  id: string;
  questionId: string;
  selected: number;
  correct: boolean;
  textoSnapshot: string;
  opcionesSnapshot: string[];
  correctSnapshot: number;
}

interface AttemptDetail {
  id: string;
  userId: string | null;
  materiaId: string;
  unidad: number;
  cantidad: number;
  nota: number | null;
  completado: boolean;
  startedAt: string;
  completedAt: string | null;
  materia: { label: string };
  user: { name: string; email: string } | null;
  answerLogs: AnswerLog[];
}

function DetalleView({ attemptId }: { attemptId: string }) {
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<AttemptDetail>(`/attempts/${attemptId}`)
      .then(setAttempt)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "No se pudo cargar el intento.")
      )
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) {
    return (
      <main style={{ background: "var(--bg-page)", minHeight: "100vh" }} className="flex items-center justify-center">
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }}>Cargando…</p>
      </main>
    );
  }

  if (error || !attempt) {
    return (
      <main style={{ background: "var(--bg-page)", minHeight: "100vh" }} className="flex items-center justify-center px-6">
        <div className="ui-panel rounded-2xl p-8 max-w-md text-center" style={{ border: "1px solid var(--border-subtle)" }}>
          <p className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)", fontFamily: "var(--font-ibm-plex-sans)" }}>
            {error ?? "Intento no encontrado"}
          </p>
          <Link href="/docente" className="btn-primary inline-flex">Volver al panel</Link>
        </div>
      </main>
    );
  }

  const correctas = attempt.answerLogs.filter((l) => l.correct).length;
  const nota = attempt.nota !== null ? Math.round(attempt.nota) : null;

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb items={[
          { label: "Inicio", href: "/" },
          { label: "Docente", href: "/docente" },
          { label: "Detalle de intento" },
        ]} />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
                {attempt.user?.name ?? "Alumno anónimo"}
              </h1>
              <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                {attempt.user?.email}
              </p>
            </div>
            <Link href="/docente" className="btn-secondary shrink-0">← Volver al panel</Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Materia", value: attempt.materia.label },
              { label: "Unidad", value: attempt.unidad === 0 ? "Todas" : `U${attempt.unidad}` },
              { label: "Nota", value: nota !== null ? `${nota}%` : "—" },
              {
                label: "Correctas",
                value: `${correctas} / ${attempt.answerLogs.length}`,
              },
            ].map((s) => (
              <div key={s.label} className="ui-panel rounded-xl p-3" style={{ border: "1px solid var(--border-subtle)" }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
                  {s.label}
                </p>
                <p className="text-base font-semibold truncate" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {attempt.completedAt && (
            <p className="text-xs mt-3" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
              Completado el {new Date(attempt.completedAt).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>

        {/* Preguntas */}
        <div className="flex flex-col gap-5">
          {attempt.answerLogs.map((log, i) => (
            <div
              key={log.id}
              className="ui-panel rounded-2xl p-5"
              style={{
                border: `1px solid ${log.correct ? "rgba(34,197,94,0.3)" : "rgba(194,47,47,0.3)"}`,
                background: log.correct ? "rgba(34,197,94,0.04)" : "rgba(194,47,47,0.04)",
              }}
            >
              {/* Pregunta header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <p className="text-sm font-medium" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)", lineHeight: 1.5 }}>
                  <span style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)", marginRight: 8 }}>
                    {i + 1}.
                  </span>
                  {log.textoSnapshot}
                </p>
                <span
                  className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    background: log.correct ? "rgba(34,197,94,0.15)" : "rgba(194,47,47,0.12)",
                    color: log.correct ? "rgb(22,163,74)" : "var(--accent)",
                  }}
                >
                  {log.correct ? "Correcta ✓" : "Incorrecta ✗"}
                </span>
              </div>

              {/* Opciones */}
              <div className="flex flex-col gap-1.5">
                {log.opcionesSnapshot.map((op, idx) => {
                  const isCorrect = idx === log.correctSnapshot;
                  const isSelected = idx === log.selected;
                  const isWrong = isSelected && !log.correct;

                  let bg = "transparent";
                  let border = "var(--border-subtle)";
                  let color = "var(--text-secondary)";

                  if (isCorrect) {
                    bg = "rgba(34,197,94,0.12)";
                    border = "rgba(34,197,94,0.5)";
                    color = "rgb(22,163,74)";
                  } else if (isWrong) {
                    bg = "rgba(194,47,47,0.10)";
                    border = "rgba(194,47,47,0.4)";
                    color = "var(--accent)";
                  }

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                      style={{ background: bg, border: `1px solid ${border}`, fontFamily: "var(--font-ibm-plex-sans)", color }}
                    >
                      <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 600, minWidth: 18 }}>
                        {["A", "B", "C", "D"][idx]}
                      </span>
                      <span>{op}</span>
                      {isCorrect && !isSelected && (
                        <span className="ml-auto text-xs" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>← correcta</span>
                      )}
                      {isSelected && (
                        <span className="ml-auto text-xs" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                          {log.correct ? "← elegida ✓" : "← elegida ✗"}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function DetalleIntentoPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <DetalleView attemptId={attemptId} />
    </RoleGate>
  );
}
