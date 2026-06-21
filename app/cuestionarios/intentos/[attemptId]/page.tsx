"use client";
import { use, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "@/app/lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PreguntaData {
  id: string;
  texto: string;
  opciones: string[];
  formato: string;
}

interface StoredSession {
  attemptId: string;
  total: number;
  numero: number;
  pregunta: PreguntaData;
  materiaLabel: string;
}

interface Feedback {
  correcta: boolean;
  correcta_era: number;
  explicacion: string;
}

interface Resultado {
  nota: number;
  correctas: number;
  total: number;
}

type PageState =
  | { phase: "loading" }
  | { phase: "not-found" }
  | {
      phase: "question";
      pregunta: PreguntaData;
      numero: number;
      total: number;
      materiaLabel: string;
      submitting: boolean;
    }
  | {
      phase: "feedback";
      pregunta: PreguntaData;
      selected: number;
      feedback: Feedback;
      numero: number;
      total: number;
      materiaLabel: string;
      nextPregunta: PreguntaData | null;
      nextNumero: number;
    }
  | {
      phase: "finished";
      materiaLabel: string;
      resultado: Resultado;
      lastFeedback: Feedback;
    };

// ── Component ─────────────────────────────────────────────────────────────────

export default function IntentoSessionPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = use(params);
  const [selected, setSelected] = useState<number | null>(null);
  const [pageState, setPageState] = useState<PageState>(() => {
    if (typeof window === "undefined") return { phase: "loading" };
    const raw = sessionStorage.getItem(`attempt-${attemptId}`);
    if (!raw) return { phase: "not-found" };
    try {
      const data = JSON.parse(raw) as StoredSession;
      return {
        phase: "question",
        pregunta: data.pregunta,
        numero: data.numero,
        total: data.total,
        materiaLabel: data.materiaLabel,
        submitting: false,
      };
    } catch {
      return { phase: "not-found" };
    }
  });
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (pageState.phase !== "question" || selected === null || pageState.submitting) return;
    setPageState({ ...pageState, submitting: true });
    setApiError(null);

    try {
      const res = await api.post<{
        tipo: "continua" | "finalizado";
        correcta: boolean;
        correcta_era: number;
        explicacion: string;
        numero?: number;
        total?: number;
        pregunta?: PreguntaData;
        resultado?: Resultado;
      }>(`/attempts/${attemptId}/answer`, {
        questionId: pageState.pregunta.id,
        selected,
      });

      if (res.tipo === "finalizado") {
        sessionStorage.removeItem(`attempt-${attemptId}`);
        setPageState({
          phase: "finished",
          materiaLabel: pageState.materiaLabel,
          resultado: res.resultado!,
          lastFeedback: {
            correcta: res.correcta,
            correcta_era: res.correcta_era,
            explicacion: res.explicacion,
          },
        });
      } else {
        setPageState({
          phase: "feedback",
          pregunta: pageState.pregunta,
          selected,
          feedback: {
            correcta: res.correcta,
            correcta_era: res.correcta_era,
            explicacion: res.explicacion,
          },
          numero: pageState.numero,
          total: pageState.total,
          materiaLabel: pageState.materiaLabel,
          nextPregunta: res.pregunta ?? null,
          nextNumero: res.numero ?? pageState.numero + 1,
        });
      }
    } catch (err) {
      setApiError(
        err instanceof ApiError ? err.message : "Error al enviar la respuesta. Intentá de nuevo."
      );
      setPageState({ ...pageState, submitting: false });
    }
  };

  const handleNext = () => {
    if (pageState.phase !== "feedback" || !pageState.nextPregunta) return;
    setSelected(null);
    setPageState({
      phase: "question",
      pregunta: pageState.nextPregunta,
      numero: pageState.nextNumero,
      total: pageState.total,
      materiaLabel: pageState.materiaLabel,
      submitting: false,
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (pageState.phase === "loading") {
    return (
      <main
        style={{ background: "var(--bg-page)", minHeight: "100vh" }}
        className="flex items-center justify-center"
      >
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }}>
          Cargando…
        </p>
      </main>
    );
  }

  // ── Not found ──────────────────────────────────────────────────────────────

  if (pageState.phase === "not-found") {
    return (
      <main
        style={{ background: "var(--bg-page)", minHeight: "100vh" }}
        className="flex items-center justify-center px-6"
      >
        <div
          className="ui-panel rounded-2xl p-8 max-w-md text-center"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <h1
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Sesión no encontrada
          </h1>
          <p
            className="text-sm mb-6"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Este examen no existe o la sesión expiró.
          </p>
          <Link href="/cuestionarios" className="btn-primary inline-flex">
            Volver a cuestionarios
          </Link>
        </div>
      </main>
    );
  }

  // ── Finished ───────────────────────────────────────────────────────────────

  if (pageState.phase === "finished") {
    const { resultado, materiaLabel, lastFeedback } = pageState;
    const pct = resultado.total > 0 ? resultado.nota : 0;
    const badge =
      pct >= 90 ? "¡Excelente!" : pct >= 70 ? "Bien hecho" : "A seguir practicando";
    const badgeColor =
      pct >= 90
        ? { bg: "rgba(34,197,94,0.12)", fg: "rgb(34,197,94)" }
        : pct >= 70
        ? { bg: "rgba(234,179,8,0.12)", fg: "rgb(234,179,8)" }
        : { bg: "rgba(194,47,47,0.12)", fg: "var(--accent)" };
    const circumference = 251;
    const progress = (pct / 100) * circumference;

    return (
      <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
        <div
          style={{
            borderBottom: "1px solid var(--border-subtle)",
            background: "var(--bg-page)",
          }}
        >
          <div className="max-w-2xl mx-auto px-6 py-3">
            <span
              style={{
                fontFamily: "var(--font-ibm-plex-mono)",
                color: "var(--text-muted)",
                fontSize: "0.75rem",
              }}
            >
              {materiaLabel} — {resultado.total} preguntas
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center gap-8">
          {/* Score ring */}
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--bg-elevated)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={badgeColor.fg}
                strokeWidth="8"
                strokeDasharray={`${progress} ${circumference}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                style={{
                  fontFamily: "var(--font-ibm-plex-mono)",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "var(--text-primary)",
                }}
              >
                {resultado.correctas}/{resultado.total}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ibm-plex-mono)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                }}
              >
                {Math.round(pct)}%
              </span>
            </div>
          </div>

          <div className="text-center">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
              style={{
                background: badgeColor.bg,
                color: badgeColor.fg,
                fontFamily: "var(--font-ibm-plex-sans)",
              }}
            >
              {badge}
            </div>
            <p
              style={{
                fontFamily: "var(--font-ibm-plex-serif)",
                color: "var(--text-muted)",
                fontSize: "0.9375rem",
              }}
            >
              Respondiste {resultado.correctas} de {resultado.total} preguntas correctamente.
            </p>
          </div>

          {/* Last question feedback */}
          <div
            className="w-full rounded-xl p-4"
            style={{
              background: lastFeedback.correcta
                ? "rgba(34,197,94,0.08)"
                : "rgba(194,47,47,0.08)",
              border: `1px solid ${lastFeedback.correcta ? "rgba(34,197,94,0.3)" : "rgba(194,47,47,0.3)"}`,
            }}
          >
            <p
              className="text-sm font-semibold mb-1"
              style={{
                fontFamily: "var(--font-ibm-plex-serif)",
                color: lastFeedback.correcta ? "rgb(34,197,94)" : "var(--accent)",
              }}
            >
              Última pregunta: {lastFeedback.correcta ? "¡Correcta!" : "Incorrecta"}
            </p>
            {lastFeedback.explicacion && (
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: "var(--font-ibm-plex-serif)",
                  color: "var(--text-secondary)",
                }}
              >
                {lastFeedback.explicacion}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/cuestionarios/generar" className="btn-primary">
              Nuevo examen →
            </Link>
            <Link href="/cuestionarios" className="btn-secondary">
              ← Todos los cuestionarios
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Question / Feedback ────────────────────────────────────────────────────

  const isQuestion = pageState.phase === "question";
  const isFeedback = pageState.phase === "feedback";

  const pregunta = pageState.pregunta;
  const numero = pageState.numero;
  const total = pageState.total;
  const materiaLabel = pageState.materiaLabel;
  const progress = ((numero - 1) / total) * 100;

  const feedback = isFeedback ? pageState.feedback : null;
  const selectedInFeedback = isFeedback ? pageState.selected : null;
  const isCorrect = feedback?.correcta ?? false;

  const getOptionState = (index: number) => {
    if (isFeedback) {
      if (index === feedback!.correcta_era) return "correct";
      if (index === selectedInFeedback && index !== feedback!.correcta_era) return "incorrect";
      return "idle";
    }
    return selected === index ? "selected" : "idle";
  };

  const canSubmit = isQuestion && selected !== null && !pageState.submitting;

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Progress bar */}
      <div
        className="sticky top-0 z-30 w-full"
        style={{ background: "var(--bg-page)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
          <div className="flex-1">
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <span
            className="text-xs shrink-0"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            {numero} / {total}
          </span>
          <Link href="/cuestionarios" className="btn-ghost text-xs py-1 px-2">
            ✕ Salir
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Materia badge */}
        <div className="flex items-center gap-2 mb-6">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--bg-elevated)",
              fontFamily: "var(--font-ibm-plex-mono)",
              color: "var(--text-muted)",
            }}
          >
            {materiaLabel}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(194,47,47,0.1)",
              fontFamily: "var(--font-ibm-plex-mono)",
              color: "var(--accent)",
              border: "1px solid rgba(194,47,47,0.2)",
            }}
          >
            Examen aleatorio
          </span>
        </div>

        {/* Question card */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--bg-panel)" }}>
          <p
            className="text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            Pregunta {numero}
          </p>
          <h2
            className="text-xl font-medium leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
          >
            {pregunta.texto}
          </h2>

          <div className="flex flex-col gap-2">
            {pregunta.opciones.map((opcion, i) => {
              const state = getOptionState(i);
              return (
                <button
                  key={i}
                  onClick={() => isQuestion && !pageState.submitting && setSelected(i)}
                  disabled={isFeedback || (isQuestion && pageState.submitting)}
                  className={`answer-option text-left ${state}`}
                >
                  <span
                    className="w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{
                      fontFamily: "var(--font-ibm-plex-mono)",
                      borderColor:
                        state === "correct"
                          ? "rgb(34,197,94)"
                          : state === "incorrect"
                          ? "var(--accent)"
                          : state === "selected"
                          ? "var(--text-muted)"
                          : "var(--border-subtle)",
                      color:
                        state === "correct"
                          ? "rgb(34,197,94)"
                          : state === "incorrect"
                          ? "var(--accent)"
                          : "var(--text-muted)",
                    }}
                  >
                    {["A", "B", "C", "D", "E"][i]}
                  </span>
                  <span>{opcion}</span>
                  {isFeedback && state === "correct" && (
                    <span className="ml-auto text-sm" style={{ color: "rgb(34,197,94)" }}>
                      ✓
                    </span>
                  )}
                  {isFeedback && state === "incorrect" && (
                    <span className="ml-auto text-sm" style={{ color: "var(--accent)" }}>
                      ✗
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback panel */}
          {isFeedback && feedback && (
            <div
              className="mt-4 p-4 rounded-xl"
              style={{
                background: isCorrect ? "rgba(34,197,94,0.08)" : "rgba(194,47,47,0.08)",
                border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "rgba(194,47,47,0.3)"}`,
              }}
            >
              <p
                className="text-sm leading-relaxed font-semibold mb-1"
                style={{
                  fontFamily: "var(--font-ibm-plex-serif)",
                  color: isCorrect ? "rgb(34,197,94)" : "var(--accent)",
                }}
              >
                {isCorrect ? "¡Correcto!" : "Incorrecto"}
              </p>
              {feedback.explicacion && (
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: "var(--font-ibm-plex-serif)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {feedback.explicacion}
                </p>
              )}
            </div>
          )}
        </div>

        {/* API error */}
        {apiError && (
          <div
            className="mb-4 rounded-lg px-4 py-3"
            style={{
              background: "rgba(194,47,47,0.08)",
              border: "1px solid rgba(194,47,47,0.3)",
            }}
          >
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--accent)" }}
            >
              {apiError}
            </p>
          </div>
        )}

        {/* Action button */}
        {isQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="btn-primary w-full justify-center"
            style={{
              opacity: canSubmit ? 1 : 0.5,
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {pageState.submitting ? "Enviando…" : "Enviar respuesta"}
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary w-full justify-center">
            Siguiente pregunta →
          </button>
        )}
      </div>
    </main>
  );
}
