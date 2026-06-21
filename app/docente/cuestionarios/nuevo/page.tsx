"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { api, ApiError } from "@/app/lib/api";

interface MateriaOption {
  id: string;
  label: string;
}

const FORMATOS = [
  { value: "MULTIPLE", label: "Múltiple opción" },
  { value: "TRUEFALSE", label: "Verdadero / Falso" },
];

const OPCIONES_INIT = ["", "", "", ""];

function NuevoView() {
  const router = useRouter();

  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  const [materiaId, setMateriaId] = useState("");
  // unidadesCache: unidades existentes por materia (evita setState sincrónico en effect)
  const [unidadesCache, setUnidadesCache] = useState<{ materiaId: string; values: number[] } | null>(null);
  // "nueva" = el usuario eligió crear una unidad nueva con número manual
  const [unidadSel, setUnidadSel] = useState<{ materiaId: string; value: number | "nueva" } | null>(null);
  const [unidadNueva, setUnidadNueva] = useState<number | "">(1);
  const [formato, setFormato] = useState("MULTIPLE");
  const [pregunta, setPregunta] = useState("");
  const [opciones, setOpciones] = useState(OPCIONES_INIT);
  const [correct, setCorrect] = useState<number | null>(null);
  const [explicacion, setExplicacion] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(0);

  // Unidades disponibles para la materia actual
  const unidadesDisponibles = unidadesCache?.materiaId === materiaId ? unidadesCache.values : [];
  const loadingUnidades = !!materiaId && unidadesCache?.materiaId !== materiaId;

  // Valor efectivo de unidad a enviar al backend
  const unidadSelValue = unidadSel?.materiaId === materiaId ? unidadSel.value : 0;
  const unidadFinal: number | null =
    unidadSelValue === "nueva"
      ? unidadNueva === "" ? null : Number(unidadNueva)
      : Number(unidadSelValue);

  useEffect(() => {
    api
      .get<MateriaOption[]>("/materias")
      .then((data) => {
        setMaterias(data);
        if (data.length > 0) setMateriaId(data[0].id);
      })
      .catch(() => setError("No se pudieron cargar las materias."));
  }, []);

  useEffect(() => {
    if (!materiaId) return;
    api
      .get<number[]>(`/materias/${materiaId}/unidades`)
      .then((values) => setUnidadesCache({ materiaId, values }));
  }, [materiaId]);

  // Cuando cambia a TRUEFALSE, resetear opciones a 2
  useEffect(() => {
    if (formato === "TRUEFALSE") {
      setOpciones(["Verdadero", "Falso", "", ""]);
      setCorrect(null);
    } else {
      setOpciones(OPCIONES_INIT);
      setCorrect(null);
    }
  }, [formato]);

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

  const resetForm = () => {
    setPregunta("");
    setOpciones(formato === "TRUEFALSE" ? ["Verdadero", "Falso", "", ""] : OPCIONES_INIT);
    setCorrect(null);
    setExplicacion("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);

    try {
      await api.post("/questions", {
        question: pregunta.trim(),
        options: opcionesValidas,
        correct: correct!,
        explanation: explicacion.trim() || undefined,
        formato,
        materias: [{ materiaId, unidad: unidadFinal! }],
      });
      setSaved((n) => n + 1);
      // Refrescar unidades para que la nueva aparezca en el select
      api.get<number[]>(`/materias/${materiaId}/unidades`)
        .then((values) => setUnidadesCache({ materiaId, values }));
      resetForm();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al guardar la pregunta.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Docente", href: "/docente" },
            { label: "Nueva pregunta" },
          ]}
        />
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
            >
              Nueva pregunta
            </h1>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              Cada pregunta se guarda de forma independiente en el banco y puede usarse en exámenes aleatorios.
            </p>
          </div>
          {saved > 0 && (
            <span
              className="shrink-0 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: "rgba(34,197,94,0.12)",
                color: "rgb(34,197,94)",
                fontFamily: "var(--font-ibm-plex-mono)",
              }}
            >
              {saved} guardada{saved !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Materia + Unidad */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
              >
                Materia
              </label>
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  color: "var(--text-primary)",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
              >
                Unidad
              </label>
              <select
                value={loadingUnidades ? "" : String(unidadSelValue)}
                onChange={(e) => setUnidadSel({ materiaId, value: e.target.value === "nueva" ? "nueva" : Number(e.target.value) })}
                disabled={loadingUnidades}
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  color: "var(--text-primary)",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-subtle)",
                  opacity: loadingUnidades ? 0.6 : 1,
                }}
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
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    color: "var(--text-primary)",
                    background: "var(--bg-panel)",
                    border: "1px solid var(--border-subtle)",
                  }}
                />
              )}
            </div>
          </div>

          {/* Formato */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              Formato
            </label>
            <div className="inline-flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}>
              {FORMATOS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormato(f.value)}
                  className="py-1.5 px-4 rounded-md text-sm transition-colors"
                  style={{
                    fontFamily: "var(--font-ibm-plex-sans)",
                    fontWeight: 500,
                    background: formato === f.value ? "var(--accent)" : "transparent",
                    color: formato === f.value ? "white" : "var(--text-secondary)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pregunta */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              Pregunta
            </label>
            <textarea
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              required
              rows={3}
              placeholder="Escribí la pregunta aquí…"
              className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
              style={{
                fontFamily: "var(--font-ibm-plex-serif)",
                color: "var(--text-primary)",
                background: "var(--bg-panel)",
                border: "1px solid var(--border-subtle)",
              }}
            />
          </div>

          {/* Opciones */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              Opciones — marcá la correcta
            </label>
            <div className="flex flex-col gap-2">
              {opciones.map((op, i) => {
                const isDisabled = formato === "TRUEFALSE" && i >= 2;
                if (isDisabled) return null;
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
            <p
              className="text-xs mt-2"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Hacé clic en la letra para marcar la respuesta correcta.
            </p>
          </div>

          {/* Explicación */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              Explicación <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(opcional)</span>
            </label>
            <textarea
              value={explicacion}
              onChange={(e) => setExplicacion(e.target.value)}
              rows={2}
              placeholder="Se muestra al estudiante después de responder…"
              className="w-full rounded-lg px-3 py-2.5 text-sm resize-none"
              style={{
                fontFamily: "var(--font-ibm-plex-serif)",
                color: "var(--text-primary)",
                background: "var(--bg-panel)",
                border: "1px solid var(--border-subtle)",
              }}
            />
          </div>

          {error && (
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: "rgba(194,47,47,0.08)", border: "1px solid rgba(194,47,47,0.3)" }}
            >
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--accent)" }}
              >
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="btn-primary flex-1 justify-center"
              style={{ opacity: !canSubmit || saving ? 0.5 : 1, cursor: !canSubmit || saving ? "not-allowed" : "pointer" }}
            >
              {saving ? "Guardando…" : "Guardar pregunta →"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/docente")}
              className="btn-secondary"
            >
              Volver
            </button>
          </div>

          {saved > 0 && (
            <p
              className="text-sm text-center"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              ✓ Pregunta guardada. El formulario se limpió para que puedas agregar otra.
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

export default function NuevoCuestionarioPage() {
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <NuevoView />
    </RoleGate>
  );
}
