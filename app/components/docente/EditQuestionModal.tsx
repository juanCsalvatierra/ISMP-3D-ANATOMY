"use client";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/app/lib/api";

export interface MateriaOption {
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

const FORMATOS = [
  { value: "MULTIPLE", label: "Múltiple opción" },
  { value: "TRUEFALSE", label: "Verdadero / Falso" },
];

// ── Modal de edición inline ──────────────────────────────────────────────────

interface EditQuestionModalProps {
  questionId: string;
  materias: MateriaOption[];
  onClose: () => void;
  onSaved: () => void;
}

export function EditQuestionModal({ questionId, materias, onClose, onSaved }: EditQuestionModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [materiaId, setMateriaId] = useState("");
  // Una pregunta puede servir a varias materias/unidades. Este modal edita solo el
  // primer destino: se recuerda el original y los demás para no pisarlos al guardar.
  const [destinoOriginal, setDestinoOriginal] = useState<{ materiaId: string; unidad: number } | null>(null);
  const [otrosDestinos, setOtrosDestinos] = useState<{ materiaId: string; unidad: number }[]>([]);
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
        setDestinoOriginal({ materiaId: mId, unidad: uVal });
        setOtrosDestinos(q.materias.slice(1).map((m) => ({ materiaId: m.materiaId, unidad: m.unidad })));
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
        // Solo se tocan los destinos si cambió el primero; los demás se conservan.
        ...(destinoOriginal?.materiaId === materiaId && destinoOriginal.unidad === unidadFinal
          ? {}
          : {
              materias: [
                ...otrosDestinos.filter((o) => o.materiaId !== materiaId),
                { materiaId, unidad: unidadFinal! },
              ],
            }),
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
