"use client";
import { useMemo, useState } from "react";
import {
  type Cuestionario,
  type CuestionarioFormato,
  type CuestionarioInput,
  type Question,
  FORMATO_LABELS,
} from "@/app/store/cuestionarioBankStore";
import { MATERIAS, MATERIA_IDS, type MateriaId } from "@/app/domain/academic";

// ISP: los tipos están segregados por responsabilidad.
// Un consumidor de solo lectura usa CuestionarioReadFormProps sin necesitar autorId ni onSubmit.
// Un consumidor de edición usa CuestionarioEditFormProps con todo.

type CuestionarioFormBase = {
  initial?: Cuestionario;
};

type AutorInfo = {
  autorId: string;
  autorNombre: string;
};

type CuestionarioFormActions = {
  onSubmit: (input: CuestionarioInput) => void;
  onCancel: () => void;
};

export type CuestionarioEditFormProps = CuestionarioFormBase & AutorInfo & CuestionarioFormActions;
export type CuestionarioReadFormProps = CuestionarioFormBase;

/** @deprecated Usar CuestionarioEditForm */
type Props = CuestionarioEditFormProps;

const FORMATOS: CuestionarioFormato[] = ["multiple", "truefalse", "identification"];

function optionsLengthFor(formato: CuestionarioFormato) {
  if (formato === "truefalse") return 2;
  return 4;
}

function emptyQuestion(formato: CuestionarioFormato): Question {
  return {
    id: crypto.randomUUID(),
    question: "",
    options:
      formato === "truefalse"
        ? ["Verdadero", "Falso"]
        : Array.from({ length: 4 }, () => ""),
    correct: 0,
    explanation: "",
  };
}

// CuestionarioEditForm: formulario completo con lógica de autor y guardado.
export function CuestionarioEditForm({
  initial,
  autorId,
  autorNombre,
  onSubmit,
  onCancel,
}: CuestionarioEditFormProps) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? "");
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "");
  const [materiaId, setMateriaId] = useState<MateriaId>(
    initial?.materiaId ?? "anatomia-1"
  );
  const [formato, setFormato] = useState<CuestionarioFormato>(
    initial?.formato && initial.formato !== "labeling" ? initial.formato : "multiple"
  );
  const [preguntas, setPreguntas] = useState<Question[]>(
    initial?.preguntas?.length ? initial.preguntas : [emptyQuestion("multiple")]
  );
  const [error, setError] = useState<string | null>(null);

  const optionsCount = useMemo(() => optionsLengthFor(formato), [formato]);

  const changeFormato = (f: CuestionarioFormato) => {
    setFormato(f);
    setPreguntas((prev) =>
      prev.map((q) => {
        const target = optionsLengthFor(f);
        if (f === "truefalse") {
          return { ...q, options: ["Verdadero", "Falso"], correct: q.correct < 2 ? q.correct : 0 };
        }
        const next = [...q.options];
        while (next.length < target) next.push("");
        next.length = target;
        return { ...q, options: next, correct: q.correct < target ? q.correct : 0 };
      })
    );
  };

  const updateQuestion = (idx: number, patch: Partial<Question>) =>
    setPreguntas((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const updateOption = (qIdx: number, optIdx: number, value: string) =>
    setPreguntas((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? { ...q, options: q.options.map((o, j) => (j === optIdx ? value : o)) }
          : q
      )
    );

  const addQuestion = () =>
    setPreguntas((prev) => [...prev, emptyQuestion(formato)]);

  const removeQuestion = (idx: number) =>
    setPreguntas((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return setError("El título es obligatorio.");
    if (preguntas.length === 0) return setError("Agregá al menos una pregunta.");
    for (const [i, q] of preguntas.entries()) {
      if (!q.question.trim()) return setError(`La pregunta ${i + 1} no puede estar vacía.`);
      if (formato !== "truefalse" && q.options.some((o) => !o.trim())) {
        return setError(`Completá todas las opciones de la pregunta ${i + 1}.`);
      }
    }
    setError(null);
    onSubmit({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      materiaId,
      formato,
      autorId,
      autorNombre,
      preguntas,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Metadatos */}
      <section
        className="ui-panel rounded-2xl p-6 flex flex-col gap-4"
        style={{ border: "1px solid var(--border-subtle)" }}
      >
        <div className="flex flex-col gap-2">
          <label
            className="text-xs uppercase tracking-wider"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            Título
          </label>
          <input
            className="ui-input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej: Huesos del cráneo"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            className="text-xs uppercase tracking-wider"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            Descripción
          </label>
          <textarea
            className="ui-input"
            rows={2}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Breve descripción para los estudiantes"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Materia
            </label>
            <select
              className="ui-input"
              value={materiaId}
              onChange={(e) => setMateriaId(e.target.value as MateriaId)}
            >
              {MATERIA_IDS.map((m) => (
                <option key={m} value={m}>
                  {MATERIAS[m].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Formato
            </label>
            <select
              className="ui-input"
              value={formato}
              onChange={(e) => changeFormato(e.target.value as CuestionarioFormato)}
            >
              {FORMATOS.map((f) => (
                <option key={f} value={f}>
                  {FORMATO_LABELS[f]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Preguntas */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Preguntas ({preguntas.length})
          </h2>
          <button type="button" className="btn-secondary" onClick={addQuestion}>
            + Agregar pregunta
          </button>
        </div>

        {preguntas.map((q, qi) => (
          <div
            key={q.id}
            className="ui-panel rounded-2xl p-5 flex flex-col gap-3"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-xs uppercase tracking-wider"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
              >
                Pregunta {qi + 1}
              </span>
              {preguntas.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qi)}
                  className="text-xs"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-ibm-plex-sans)" }}
                >
                  Eliminar
                </button>
              )}
            </div>

            <textarea
              className="ui-input"
              rows={2}
              value={q.question}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
              placeholder="Texto de la pregunta"
            />

            <div className="flex flex-col gap-2">
              {Array.from({ length: optionsCount }).map((_, oi) => (
                <label
                  key={oi}
                  className="flex items-center gap-3"
                  style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
                >
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correct === oi}
                    onChange={() => updateQuestion(qi, { correct: oi })}
                  />
                  <input
                    className="ui-input flex-1"
                    value={q.options[oi] ?? ""}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Opción ${["A", "B", "C", "D"][oi]}`}
                    disabled={formato === "truefalse"}
                  />
                </label>
              ))}
            </div>

            <textarea
              className="ui-input"
              rows={2}
              value={q.explanation}
              onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
              placeholder="Explicación de la respuesta correcta"
            />
          </div>
        ))}
      </section>

      {error && (
        <p
          className="text-sm"
          style={{ color: "var(--accent)", fontFamily: "var(--font-ibm-plex-serif)" }}
        >
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary">
          {initial ? "Guardar cambios" : "Crear cuestionario"}
        </button>
      </div>
    </form>
  );
}

// Alias de compatibilidad — los importadores existentes siguen funcionando.
export const CuestionarioForm = CuestionarioEditForm;

// ISP: componente de solo lectura — no necesita autorId, autorNombre ni callbacks.
export function CuestionarioReadForm({ initial }: CuestionarioReadFormProps) {
  if (!initial) return null;
  return (
    <div className="flex flex-col gap-4">
      <div
        className="ui-panel rounded-2xl p-6 flex flex-col gap-2"
        style={{ border: "1px solid var(--border-subtle)" }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          {initial.titulo}
        </h2>
        {initial.descripcion && (
          <p
            className="text-sm"
            style={{ color: "var(--text-secondary)", fontFamily: "var(--font-ibm-plex-serif)" }}
          >
            {initial.descripcion}
          </p>
        )}
        <span
          className="text-xs uppercase tracking-wider"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          {initial.preguntas.length} preguntas · {FORMATO_LABELS[initial.formato]}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {initial.preguntas.map((q, i) => (
          <div
            key={q.id}
            className="ui-panel rounded-xl p-4 flex flex-col gap-2"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <span
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Pregunta {i + 1}
            </span>
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>{q.question}</p>
            <ul className="flex flex-col gap-1">
              {q.options.map((opt, oi) => (
                <li
                  key={oi}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    background: oi === q.correct ? "rgba(194,47,47,0.08)" : "transparent",
                    color: oi === q.correct ? "var(--accent)" : "var(--text-secondary)",
                    fontWeight: oi === q.correct ? 600 : 400,
                  }}
                >
                  {["A", "B", "C", "D"][oi]}. {opt}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
