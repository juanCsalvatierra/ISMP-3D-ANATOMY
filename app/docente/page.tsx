"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUserStore } from "@/app/store/userStore";
import { useCuestionarioBankStore, byAutor, FORMATO_LABELS } from "@/app/store/cuestionarioBankStore";
import { useCuestionarioHistoryStore } from "@/app/store/cuestionarioHistoryStore";
import { useUsersStore, filterByRole } from "@/app/store/usersStore";
import { CARRERAS, MATERIAS, type MateriaId } from "@/app/domain/academic";

function DocenteDashboard() {
  const currentUser = useUserStore((s) => s.currentUser)!;
  const cuestionarios = useCuestionarioBankStore((s) => s.cuestionarios);
  const remove = useCuestionarioBankStore((s) => s.remove);
  const attempts = useCuestionarioHistoryStore((s) => s.attempts);
  const users = useUsersStore((s) => s.users);

  const mine = useMemo(
    () => byAutor(cuestionarios, currentUser.id),
    [cuestionarios, currentUser.id]
  );

  const mineIds = useMemo(() => new Set(mine.map((c) => c.id)), [mine]);
  const intentosDeMisCuest = useMemo(
    () => attempts.filter((a) => mineIds.has(a.cuestionarioId)),
    [attempts, mineIds]
  );

  const stats = useMemo(() => {
    const total = intentosDeMisCuest.length;
    const avg = total
      ? Math.round(
          (intentosDeMisCuest.reduce((acc, a) => acc + (a.total ? a.score / a.total : 0), 0) /
            total) * 100
        )
      : 0;
    return { creados: mine.length, intentos: total, promedio: avg };
  }, [mine.length, intentosDeMisCuest]);

  const estudiantes = useMemo(() => filterByRole(users, "estudiante"), [users]);

  const [filtroMateria, setFiltroMateria] = useState<MateriaId | "all">("all");

  const rowsAlumnos = useMemo(() => {
    return intentosDeMisCuest
      .filter((a) => (filtroMateria === "all" ? true : a.materiaId === filtroMateria))
      .map((a) => {
        const u = estudiantes.find((e) => e.id === a.userId);
        const c = cuestionarios.find((x) => x.id === a.cuestionarioId);
        return {
          ...a,
          alumno: u?.name ?? (a.userId ? "(usuario eliminado)" : "Anónimo"),
          carrera: u?.carreraIds?.length
            ? u.carreraIds.map((c) => (CARRERAS as Record<string, { label: string }>)[c]?.label ?? c).join(", ")
            : "—",
          cuestionarioTitulo: c?.titulo ?? "(eliminado)",
        };
      });
  }, [intentosDeMisCuest, estudiantes, cuestionarios, filtroMateria]);

  const handleDelete = (id: string) => {
    if (typeof window !== "undefined" && window.confirm("¿Eliminar este cuestionario?")) {
      remove(id);
    }
  };

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
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
              Hola {currentUser.name}, gestioná tus cuestionarios y seguí el progreso de tus alumnos.
            </p>
          </div>
          <Link href="/docente/cuestionarios/nuevo" className="btn-primary">
            + Crear cuestionario
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: "Cuestionarios", value: stats.creados },
            { label: "Intentos totales", value: stats.intentos },
            { label: "Promedio", value: `${stats.promedio}%` },
          ].map((s) => (
            <div
              key={s.label}
              className="ui-panel rounded-xl p-4"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <p
                className="text-xs uppercase tracking-wider mb-1"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
              >
                {s.label}
              </p>
              <p
                className="text-2xl font-semibold"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Mis cuestionarios */}
        <section className="mb-12">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Mis cuestionarios
          </h2>

          {mine.length === 0 ? (
            <div
              className="ui-panel rounded-2xl p-8 text-center"
              style={{ border: "1px dashed var(--border-subtle)" }}
            >
              <p
                className="text-sm mb-4"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
              >
                Todavía no creaste cuestionarios. Empezá creando uno para una materia.
              </p>
              <Link href="/docente/cuestionarios/nuevo" className="btn-primary inline-flex">
                Crear mi primer cuestionario
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {mine.map((c) => {
                const intentos = attempts.filter((a) => a.cuestionarioId === c.id).length;
                return (
                  <div
                    key={c.id}
                    className="ui-panel rounded-xl p-5 flex flex-wrap items-center gap-4"
                    style={{ border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="flex-1 min-w-[200px]">
                      <p
                        className="text-base font-medium"
                        style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                      >
                        {c.titulo}
                      </p>
                      <p
                        className="text-xs"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                      >
                        {MATERIAS[c.materiaId].label} · {FORMATO_LABELS[c.formato]} · {c.preguntas.length} preguntas · {intentos} intento{intentos === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Link href={`/cuestionarios/${c.id}`} className="btn-ghost">
                        Previsualizar
                      </Link>
                      <Link href={`/docente/cuestionarios/${c.id}/editar`} className="btn-secondary">
                        Editar
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className="btn-ghost" style={{ color: "var(--accent)" }}>
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Alumnos y resultados */}
        <section>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <h2
              className="text-lg font-semibold"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
            >
              Resultados de alumnos
            </h2>
            <div className="flex flex-col gap-1">
              <label
                className="text-xs uppercase tracking-wider"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
              >
                Filtrar por materia
              </label>
              <select
                className="ui-input"
                value={filtroMateria}
                onChange={(e) => setFiltroMateria(e.target.value as MateriaId | "all")}
              >
                <option value="all">Todas</option>
                {Object.entries(MATERIAS).map(([id, m]) => (
                  <option key={id} value={id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rowsAlumnos.length === 0 ? (
            <div
              className="ui-panel rounded-2xl p-8 text-center"
              style={{ border: "1px dashed var(--border-subtle)" }}
            >
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
              >
                Aún no hay intentos registrados en tus cuestionarios.
              </p>
            </div>
          ) : (
            <div
              className="ui-panel rounded-xl overflow-hidden"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <table className="w-full text-sm" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
                <thead>
                  <tr style={{ background: "var(--bg-canvas)", color: "var(--text-muted)" }}>
                    <th className="text-left px-4 py-2 font-medium">Alumno</th>
                    <th className="text-left px-4 py-2 font-medium">Carrera</th>
                    <th className="text-left px-4 py-2 font-medium">Cuestionario</th>
                    <th className="text-left px-4 py-2 font-medium">Materia</th>
                    <th className="text-right px-4 py-2 font-medium">Score</th>
                    <th className="text-right px-4 py-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {rowsAlumnos.map((r) => (
                    <tr key={r.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>{r.alumno}</td>
                      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{r.carrera}</td>
                      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{r.cuestionarioTitulo}</td>
                      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{MATERIAS[r.materiaId].label}</td>
                      <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}>
                        {r.score}/{r.total}
                      </td>
                      <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
                        {new Date(r.completedAt).toLocaleDateString("es-AR")}
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
