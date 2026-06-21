"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { api, ApiError } from "@/app/lib/api";

interface MateriaOption {
  id: string;
  label: string;
}

interface QuestionData {
  id: string;
  texto: string;
  opciones: string[];
  correct: number;
  explicacion: string;
  formato: string;
  autorId: string;
  materias: { materiaId: string; unidad: number; materia: { id: string; label: string } }[];
}

const FORMATOS = [
  { value: "MULTIPLE", label: "Múltiple opción" },
  { value: "TRUEFALSE", label: "Verdadero / Falso" },
];

function EditarView({ id }: { id: string }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [materiaId, setMateriaId] = useState("");
  const [unidadesCache, setUnidadesCache] = useState<{ materiaId: string; values: number[] } | null>(null);
  const [unidadSel, setUnidadSel] = useState<{ materiaId: string; value: number | "nueva" } | null>(null);
  const [unidadNueva, setUnidadNueva] = useState<number | "">(1);
  const [formato, setFormato] = useState("MULTIPLE");
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<number | null>(null);
  const [explicacion, setExplicacion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unidadesDisponibles = unidadesCache?.materiaId === materiaId ? unidadesCache.values : [];
  const loadingUnidades = !!materiaId && unidadesCache?.materiaId !== materiaId;
  const unidadSelValue = unidadSel?.materiaId === materiaId ? unidadSel.value : 0;
  const unidadFinal: number | null =
    unidadSelValue === "nueva"
      ? unidadNueva === "" ? null : Number(unidadNueva)
      : Number(unidadSelValue);

  // Cargar pregunta y materias en paralelo
  useEffect(() => {
    Promise.all([
      api.get<QuestionData>(`/questions/${id}`),
      api.get<MateriaOption[]>("/materias"),
    ])
      .then(([question, materiasList]) => {
        setMaterias(materiasList);

        const mat = question.materias[0];
        const mId = mat?.materiaId ?? (materiasList[0]?.id ?? "");
        const uVal = mat?.unidad ?? 0;

        setPregunta(question.texto);
        setFormato(question.formato);
        setCorrect(question.correct);
        setExplicacion(question.explicacion);

        // Pad opciones to 4 slots
        const padded = [...question.opciones];
        while (padded.length < 4) padded.push("");
        setOpciones(padded);

        setMateriaId(mId);
        setUnidadSel({ materiaId: mId, value: uVal });
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
        else if (err instanceof ApiError && err.status === 403) setForbidden(true);
        else setError("No se pudo cargar la pregunta.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Cargar unidades cuando cambia materia
  useEffect(() => {
    if (!materiaId) return;
    api
      .get<number[]>(`/materias/${materiaId}/unidades`)
      .then((values) => setUnidadesCache({ materiaId, values }));
  }, [materiaId]);

  const setOpcion = (i: number, value: string) =>
    setOpciones((prev) => prev.map((o, idx) => (idx === i ? value : o)));

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
      await api.patch(`/questions/${id}`, {
        question: pregunta.trim(),
        options: opcionesValidas,
        correct: correct!,
        explanation: explicacion.trim() || undefined,
        formato,
        materias: [{ materiaId, unidad: unidadFinal! }],
      });
      router.push("/docente");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar los cambios.");
      setSaving(false);
    }
  };

  // ── Estados de carga / error ───────────────────────────────────────────────

  if (loading) {
    return (
      <main style={{ background: "var(--bg-page)", minHeight: "100vh" }} className="flex items-center justify-center">
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }}>Cargando…</p>
      </main>
    );
  }

  if (notFound || forbidden) {
    return (
      <main style={{ background: "var(--bg-page)", minHeight: "100vh" }} className="flex items-center justify-center px-6">
        <div className="ui-panel rounded-2xl p-8 max-w-md text-center" style={{ border: "1px solid var(--border-subtle)" }}>
          <h1 className="text-xl font-semibold mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
            {notFound ? "Pregunta no encontrada" : "Sin permiso para editar"}
          </h1>
          <p className="text-sm mb-6" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
            {forbidden ? "Solo el autor o un administrador puede modificar esta pregunta." : "La pregunta no existe o fue eliminada."}
          </p>
          <Link href="/docente" className="btn-primary inline-flex">Volver al panel</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb items={[
          { label: "Inicio", href: "/" },
          { label: "Docente", href: "/docente" },
          { label: "Editar pregunta" },
        ]} />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
            Editar pregunta
          </h1>
          <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
            Los cambios se aplican al banco de preguntas y afectan futuros exámenes.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Materia + Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                Materia
              </label>
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
              >
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
                Unidad
              </label>
              <select
                value={loadingUnidades ? "" : String(unidadSelValue)}
                onChange={(e) => setUnidadSel({ materiaId, value: e.target.value === "nueva" ? "nueva" : Number(e.target.value) })}
                disabled={loadingUnidades}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
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
                  placeholder="Nro. de unidad (ej: 2)"
                  className="w-full rounded-lg px-3 py-2 text-sm mt-2"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
                />
              )}
            </div>
          </div>

          {/* Formato */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
              Formato
            </label>
            <div className="inline-flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}>
              {FORMATOS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormato(f.value)}
                  className="py-1.5 px-4 rounded-md text-sm transition-colors"
                  style={{ fontFamily: "var(--font-ibm-plex-sans)", fontWeight: 500, background: formato === f.value ? "var(--accent)" : "transparent", color: formato === f.value ? "white" : "var(--text-secondary)" }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
              Pregunta
            </label>
            <textarea
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              required
              rows={3}
              className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
            />
          </div>

          {/* Opciones */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
              Opciones — marcá la correcta
            </label>
            <div className="flex flex-col gap-2">
              {opciones.map((op, i) => {
                if (formato === "TRUEFALSE" && i >= 2) return null;
                const letter = ["A", "B", "C", "D"][i];
                const isCorrect = correct === i;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCorrect(i)}
                      disabled={!op.trim()}
                      className="shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold transition-colors"
                      title="Marcar como correcta"
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
            <p className="text-xs mt-2" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
              Hacé clic en la letra para marcar la respuesta correcta.
            </p>
          </div>

          {/* Explicación */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}>
              Explicación <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              value={explicacion}
              onChange={(e) => setExplicacion(e.target.value)}
              rows={2}
              className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)", background: "var(--bg-panel)", border: "1px solid var(--border-subtle)" }}
            />
          </div>

          {error && (
            <div className="rounded-lg px-4 py-3" style={{ background: "rgba(194,47,47,0.08)", border: "1px solid rgba(194,47,47,0.3)" }}>
              <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--accent)" }}>{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="btn-primary flex-1 justify-center"
              style={{ opacity: !canSubmit || saving ? 0.5 : 1, cursor: !canSubmit || saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
            <button type="button" onClick={() => router.push("/docente")} className="btn-secondary">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function EditarCuestionarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <EditarView id={id} />
    </RoleGate>
  );
}
