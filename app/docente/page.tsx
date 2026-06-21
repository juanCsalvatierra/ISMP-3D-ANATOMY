"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUserStore } from "@/app/store/userStore";
import { api, ApiError } from "@/app/lib/api";

interface Question {
  id: string;
  texto: string;
  formato: string;
  materias: { materiaId: string; unidad: number; materia: { label: string } }[];
  autor: { id: string; name: string };
}

interface Attempt {
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
}

function DocenteDashboard() {
  const currentUser = useUserStore((s) => s.currentUser)!;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [loadingA, setLoadingA] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    api.get<Question[]>("/questions")
      .then(setQuestions)
      .finally(() => setLoadingQ(false));
  }, []);

  useEffect(() => {
    api.get<Attempt[]>("/attempts")
      .then(setAttempts)
      .finally(() => setLoadingA(false));
  }, []);

  const myQuestions = questions.filter((q) => q.autor.id === currentUser.id);
  const completedAttempts = attempts.filter((a) => a.completado);
  const avgNota = completedAttempts.length
    ? Math.round(completedAttempts.reduce((acc, a) => acc + (a.nota ?? 0), 0) / completedAttempts.length)
    : 0;

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta pregunta del banco?")) return;
    setDeleting(id);
    try {
      await api.delete(`/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error al eliminar.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
            >
              Panel docente
            </h1>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              Hola {currentUser.name}, gestioná el banco de preguntas y seguí el progreso de tus alumnos.
            </p>
          </div>
          <Link href="/docente/cuestionarios/nuevo" className="btn-primary">
            + Agregar pregunta
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Mis preguntas", value: loadingQ ? "—" : myQuestions.length },
            { label: "Intentos totales", value: loadingA ? "—" : completedAttempts.length },
            { label: "Promedio", value: loadingA ? "—" : `${avgNota}%` },
          ].map((s) => (
            <div key={s.label} className="ui-panel rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)" }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
                {s.label}
              </p>
              <p className="text-2xl font-semibold" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Mis preguntas */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
            Mis preguntas
          </h2>

          {loadingQ ? (
            <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>Cargando…</p>
          ) : myQuestions.length === 0 ? (
            <div className="ui-panel rounded-2xl p-8 text-center" style={{ border: "1px dashed var(--border-subtle)" }}>
              <p className="text-sm mb-4" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                Todavía no agregaste preguntas al banco.
              </p>
              <Link href="/docente/cuestionarios/nuevo" className="btn-primary inline-flex">
                Agregar primera pregunta
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {myQuestions.map((q) => {
                const mat = q.materias[0];
                return (
                  <div key={q.id} className="ui-panel rounded-xl p-4 flex flex-wrap items-center gap-4" style={{ border: "1px solid var(--border-subtle)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
                        {q.texto}
                      </p>
                      <p className="text-xs mt-0.5" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
                        {mat?.materia.label ?? "—"} · {mat?.unidad === 0 ? "Toda la materia" : `Unidad ${mat?.unidad}`} · {q.formato.toLowerCase()}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/docente/cuestionarios/${q.id}/editar`} className="btn-secondary text-xs py-1 px-3">
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={deleting === q.id}
                        className="btn-ghost text-xs py-1 px-3"
                        style={{ color: "var(--accent)", opacity: deleting === q.id ? 0.5 : 1 }}
                      >
                        {deleting === q.id ? "…" : "Eliminar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Resultados de alumnos */}
        <section>
          <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
            Resultados de alumnos
          </h2>

          {loadingA ? (
            <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>Cargando…</p>
          ) : completedAttempts.length === 0 ? (
            <div className="ui-panel rounded-2xl p-8 text-center" style={{ border: "1px dashed var(--border-subtle)" }}>
              <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                Aún no hay intentos completados.
              </p>
            </div>
          ) : (
            <div className="ui-panel rounded-xl overflow-x-auto" style={{ border: "1px solid var(--border-subtle)" }}>
              <table className="w-full text-sm" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
                <thead>
                  <tr style={{ background: "var(--bg-canvas)", color: "var(--text-muted)" }}>
                    <th className="text-left px-4 py-2 font-medium">Alumno</th>
                    <th className="text-left px-4 py-2 font-medium">Materia</th>
                    <th className="text-left px-4 py-2 font-medium">Unidad</th>
                    <th className="text-right px-4 py-2 font-medium">Nota</th>
                    <th className="text-right px-4 py-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {completedAttempts.map((a) => (
                    <tr key={a.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>
                        {a.user?.name ?? "Anónimo"}
                      </td>
                      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>
                        {a.materia.label}
                      </td>
                      <td className="px-4 py-2" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-secondary)" }}>
                        {a.unidad === 0 ? "Todas" : `U${a.unidad}`}
                      </td>
                      <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}>
                        {a.nota !== null ? `${Math.round(a.nota)}%` : "—"}
                      </td>
                      <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
                        {a.completedAt ? new Date(a.completedAt).toLocaleDateString("es-AR") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function DocentePage() {
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <DocenteDashboard />
    </RoleGate>
  );
}
