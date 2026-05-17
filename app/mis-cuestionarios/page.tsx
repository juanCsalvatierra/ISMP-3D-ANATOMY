"use client";
import Link from "next/link";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUserStore } from "@/app/store/userStore";
import { useCuestionarioHistoryStore } from "@/app/store/cuestionarioHistoryStore";
import { useCuestionarioBankStore, FORMATO_LABELS } from "@/app/store/cuestionarioBankStore";
import { MATERIAS } from "@/app/domain/academic";
import { useHydrated } from "@/app/store/useHydrated";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function scoreColor(score: number, total: number) {
  const ratio = total ? score / total : 0;
  if (ratio >= 0.9) return "rgb(34,197,94)";
  if (ratio >= 0.7) return "rgb(234,179,8)";
  return "var(--accent)";
}

function HistoryView() {
  const currentUser = useUserStore((s) => s.currentUser);
  const attempts = useCuestionarioHistoryStore((s) => s.attempts);
  const cuestionarios = useCuestionarioBankStore((s) => s.cuestionarios);
  const hydrated = useHydrated();

  const mine = hydrated && currentUser
    ? attempts.filter((a) => a.userId === currentUser.id)
    : [];

  const totalAttempts = mine.length;
  const avgScore = totalAttempts
    ? Math.round(
      (mine.reduce((acc, a) => acc + (a.total ? a.score / a.total : 0), 0) /
        totalAttempts) *
      100
    )
    : 0;

  const titleFor = (cuestionarioId: string) =>
    cuestionarios.find((c) => c.id === cuestionarioId)?.titulo ??
    "(cuestionario eliminado)";

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Mis cuestionarios
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Historial de tus intentos y resultados.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          <div className="ui-panel rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)" }}>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Intentos
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}
            >
              {totalAttempts}
            </p>
          </div>
          <div className="ui-panel rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)" }}>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Promedio
            </p>
            <p
              className="text-2xl font-semibold"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}
            >
              {avgScore}%
            </p>
          </div>
          <div className="ui-panel rounded-xl p-4 col-span-2 md:col-span-1" style={{ border: "1px solid var(--border-subtle)" }}>
            <p
              className="text-xs uppercase tracking-wider mb-1"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Último intento
            </p>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
            >
              {mine[0] ? formatDate(mine[0].completedAt) : "—"}
            </p>
          </div>
        </div>

        {totalAttempts === 0 ? (
          <div
            className="ui-panel rounded-2xl p-10 text-center"
            style={{ border: "1px dashed var(--border-subtle)" }}
          >
            <p
              className="text-base mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
            >
              Aún no has completado ningún cuestionario
            </p>
            <p
              className="text-sm mb-6"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              Comienza un cuestionario para registrar tu progreso.
            </p>
            <Link href="/cuestionarios" className="btn-primary inline-flex">
              Explorar cuestionarios
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map((a) => {
              const color = scoreColor(a.score, a.total);
              return (
                <div
                  key={a.id}
                  className="ui-panel rounded-xl p-5 flex flex-wrap items-center gap-4"
                  style={{ border: "1px solid var(--border-subtle)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: "var(--bg-elevated)",
                      border: `2px solid ${color}`,
                    }}
                  >
                    <span
                      className="text-sm font-bold"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color }}
                    >
                      {a.score}/{a.total}
                    </span>
                  </div>
                  <div className="flex-1 min-w-45">
                    <p
                      className="text-base"
                      style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      {titleFor(a.cuestionarioId)}
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      {MATERIAS[a.materiaId].label} · {FORMATO_LABELS[a.format as keyof typeof FORMATO_LABELS] ?? a.format} · {formatDate(a.completedAt)}
                    </p>
                  </div>
                  <Link href={`/cuestionarios/${a.cuestionarioId}`} className="btn-secondary">
                    Repetir
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function MisCuestionariosPage() {
  return (
    <RoleGate allowedRoles={["estudiante"]}>
      <HistoryView />
    </RoleGate>
  );
}
