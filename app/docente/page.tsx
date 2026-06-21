"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUserStore } from "@/app/store/userStore";
import { api, ApiError } from "@/app/lib/api";

interface MateriaOption {
  id: string;
  label: string;
}

interface QuestionDetail {
  id: string;
  texto: string;
  opciones: string[];
  correct: number;
  explicacion: string;
  formato: string;
  materias: { materiaId: string; unidad: number }[];
}

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

const FORMATOS = [
  { value: "MULTIPLE", label: "Múltiple opción" },
  { value: "TRUEFALSE", label: "Verdadero / Falso" },
];

// ── Modal de edición inline ──────────────────────────────────────────────────

interface EditModalProps {
  questionId: string;
  materias: MateriaOption[];
  onClose: () => void;
  onSaved: () => void;
}

function EditModal({ questionId, materias, onClose, onSaved }: EditModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [materiaId, setMateriaId] = useState("");
  const [unidadesCache, setUnidadesCache] = useState<{ materiaId: string; values: number[] } | null>(null);
  const [unidadSel, setUnidadSel] = useState<{ materiaId: string; value: number | "nueva" } | null>(null);
  const [unidadNueva, setUnidadNueva] = useState<number | "">(1);
  const [formato, setFormato] = useState("MULTIPLE");
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<number | null>(null);
  const [explicacion, setExplicacion] = useState("");

  // Cargar pregunta al abrir
  useEffect(() => {
    api
      .get<QuestionDetail>(`/questions/${questionId}`)
      .then((q) => {
        const mat = q.materias[0];
        const mId = mat?.materiaId ?? (materias[0]?.id ?? "");
        const uVal = mat?.unidad ?? 0;
        setPregunta(q.texto);
        setFormato(q.formato);
        setCorrect(q.correct);
        setExplicacion(q.explicacion ?? "");
        const padded = [...q.opciones];
        while (padded.length < 4) padded.push("");
        setOpciones(padded);
        setMateriaId(mId);
        setUnidadSel({ materiaId: mId, value: uVal });
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Error al cargar."))
      .finally(() => setLoading(false));
  }, [questionId, materias]);

  // Cargar unidades cuando cambia la materia
  useEffect(() => {
    if (!materiaId) return;
    api
      .get<number[]>(`/materias/${materiaId}/unidades`)
      .then((values) => setUnidadesCache({ materiaId, values }));
  }, [materiaId]);

  const unidadesDisponibles = unidadesCache?.materiaId === materiaId ? unidadesCache.values : [];
  const loadingUnidades = !!materiaId && unidadesCache?.materiaId !== materiaId;
  const unidadSelValue = unidadSel?.materiaId === materiaId ? unidadSel.value : 0;
  const unidadFinal: number | null =
    unidadSelValue === "nueva"
      ? unidadNueva === "" ? null : Number(unidadNueva)
      : Number(unidadSelValue);

  const setOpcion = (i: number, val: string) =>
    setOpciones((prev) => prev.map((o, idx) => (idx === i ? val : o)));

  const opcionesValidas = opciones.filter((o) => o.trim() !== "");
  const canSubmit =
    materiaId &&
    pregunta.trim() &&
    opcionesValidas.length >= 2 &&
    correct !== null &&
    correct < opcionesValidas.length &&
    unidadFinal !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/questions/${questionId}`, {
        question: pregunta.trim(),
        options: opcionesValidas,
        correct: correct!,
        explanation: explicacion.trim() || undefined,
        formato,
        materias: [{ materiaId, unidad: unidadFinal! }],
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar los cambios.");
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="ui-panel rounded-2xl p-6 w-full overflow-y-auto"
        style={{ maxWidth: 520, maxHeight: "90vh", border: "1px solid var(--border-subtle)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
          Editar pregunta
        </h2>

        {loading ? (
          <p className="text-sm py-8 text-center" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
            Cargando…
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Materia + Unidad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                  Materia
                </label>
                <select
                  value={materiaId}
                  onChange={(e) => setMateriaId(e.target.value)}
                  required
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
                >
                  {materias.map((m) => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                  Unidad
                </label>
                <select
                  value={loadingUnidades ? "" : String(unidadSelValue)}
                  onChange={(e) =>
                    setUnidadSel({ materiaId, value: e.target.value === "nueva" ? "nueva" : Number(e.target.value) })
                  }
                  disabled={loadingUnidades}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)", opacity: loadingUnidades ? 0.6 : 1 }}
                >
                  {loadingUnidades && <option value="">Cargando…</option>}
                  <option value="0">Toda la materia</option>
                  {unidadesDisponibles.filter((u) => u !== 0).map((u) => (
                    <option key={u} value={String(u)}>Unidad {u}</option>
                  ))}
                  <option value="nueva">+ Nueva unidad…</option>
                </select>
                {unidadSelValue === "nueva" && (
                  <input
                    type="number"
                    min={1}
                    value={unidadNueva}
                    onChange={(e) => setUnidadNueva(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Nro. de unidad"
                    className="w-full rounded-lg px-3 py-2 text-sm mt-1"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
                  />
                )}
              </div>
            </div>

            {/* Formato */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                Formato
              </label>
              <div className="inline-flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}>
                {FORMATOS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFormato(f.value)}
                    className="py-1 px-3 rounded-md text-sm transition-colors"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", fontWeight: 500, background: formato === f.value ? "var(--accent)" : "transparent", color: formato === f.value ? "white" : "var(--text-secondary)" }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pregunta */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                Pregunta
              </label>
              <textarea
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                required
                rows={3}
                className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
              />
            </div>

            {/* Opciones */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                Opciones — marcá la correcta
              </label>
              <div className="flex flex-col gap-2">
                {opciones.map((op, i) => {
                  if (formato === "TRUEFALSE" && i >= 2) return null;
                  const letter = ["A", "B", "C", "D"][i];
                  const isCorrect = correct === i;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrect(i)}
                        disabled={!op.trim()}
                        className="shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold transition-colors"
                        style={{
                          background: isCorrect ? "rgb(34,197,94)" : "transparent",
                          borderColor: isCorrect ? "rgb(34,197,94)" : "var(--border-subtle)",
                          color: isCorrect ? "white" : "var(--text-muted)",
                          fontFamily: "var(--font-ibm-plex-mono)",
                          cursor: op.trim() ? "pointer" : "not-allowed",
                          opacity: op.trim() ? 1 : 0.4,
                        }}
                      >
                        {letter}
                      </button>
                      <input
                        type="text"
                        value={op}
                        onChange={(e) => {
                          setOpcion(i, e.target.value);
                          if (!e.target.value.trim() && correct === i) setCorrect(null);
                        }}
                        readOnly={formato === "TRUEFALSE"}
                        placeholder={`Opción ${letter}`}
                        className="flex-1 rounded-lg px-3 py-2 text-sm"
                        style={{
                          fontFamily: "var(--font-ibm-plex-sans)",
                          color: "var(--text-primary)",
                          background: formato === "TRUEFALSE" ? "var(--bg-elevated)" : "var(--bg-panel)",
                          border: `1px solid ${isCorrect ? "rgba(34,197,94,0.4)" : "var(--border-subtle)"}`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explicación */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                Explicación <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
              </label>
              <textarea
                value={explicacion}
                onChange={(e) => setExplicacion(e.target.value)}
                rows={2}
                className="w-full rounded-lg px-3 py-2 text-sm resize-none"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--accent)" }}>{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={!canSubmit || saving}
                className="btn-primary flex-1 justify-center"
                style={{ opacity: !canSubmit || saving ? 0.5 : 1, cursor: !canSubmit || saving ? "not-allowed" : "pointer" }}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Panel principal ──────────────────────────────────────────────────────────

function DocenteDashboard() {
  const currentUser = useUserStore((s) => s.currentUser)!;
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [loadingQ, setLoadingQ] = useState(true);
  const [loadingA, setLoadingA] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Question[]>("/questions")
      .then(setQuestions)
      .finally(() => setLoadingQ(false));
    api.get<MateriaOption[]>("/materias").then(setMaterias);
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

  const handleSaved = () => {
    api.get<Question[]>("/questions").then(setQuestions);
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
                      <button
                        onClick={() => setEditId(q.id)}
                        className="btn-secondary text-xs py-1 px-3"
                      >
                        Editar
                      </button>
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
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {completedAttempts.map((a) => (
                    <tr
                      key={a.id}
                      onClick={() => router.push(`/docente/intentos/${a.id}`)}
                      className="cursor-pointer"
                      style={{ borderTop: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-canvas)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    >
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
                      <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        Ver →
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Modal de edición */}
      {editId && (
        <EditModal
          questionId={editId}
          materias={materias}
          onClose={() => setEditId(null)}
          onSaved={handleSaved}
        />
      )}
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
