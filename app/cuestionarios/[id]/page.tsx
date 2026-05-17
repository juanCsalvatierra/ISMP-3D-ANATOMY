"use client";
import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/app/store/userStore";
import { useCuestionarioHistoryStore } from "@/app/store/cuestionarioHistoryStore";
import {
  useCuestionarioBankStore,
  getById,
  FORMATO_LABELS,
} from "@/app/store/cuestionarioBankStore";
import { MATERIAS } from "@/app/domain/academic";
import { useHydrated } from "@/app/store/useHydrated";

type AnswerState = "idle" | "selected" | "correct" | "incorrect";

export default function CuestionarioSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const hydrated = useHydrated();
  const cuestionarios = useCuestionarioBankStore((s) => s.cuestionarios);
  const cuestionario = useMemo(
    () => getById(cuestionarios, id),
    [cuestionarios, id]
  );

  const currentUser = useUserStore((s) => s.currentUser);
  const addAttempt = useCuestionarioHistoryStore((s) => s.addAttempt);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [finished, setFinished] = useState(false);
  const recordedRef = useRef(false);

  useEffect(() => {
    if (finished && !recordedRef.current && cuestionario) {
      recordedRef.current = true;
      const score = answers.filter((a) => a.correct).length;
      addAttempt({
        userId: currentUser?.id ?? null,
        cuestionarioId: cuestionario.id,
        materiaId: cuestionario.materiaId,
        format: cuestionario.formato,
        score,
        total: cuestionario.preguntas.length,
      });
    }
    if (!finished) recordedRef.current = false;
  }, [finished, answers, addAttempt, currentUser, cuestionario]);

  if (!hydrated) {
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

  if (!cuestionario) {
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
            Cuestionario no disponible
          </h1>
          <p
            className="text-sm mb-6"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            El cuestionario solicitado no existe o fue eliminado.
          </p>
          <Link href="/cuestionarios" className="btn-primary inline-flex">
            Ver cuestionarios
          </Link>
        </div>
      </main>
    );
  }

  const preguntas = cuestionario.preguntas;
  const question = preguntas[currentQ];
  const progress = (currentQ / preguntas.length) * 100;
  const isCorrect = selected === question.correct;

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    setAnswers((prev) => [
      ...prev,
      { questionId: question.id, correct: selected === question.correct },
    ]);
  };

  const handleNext = () => {
    if (currentQ < preguntas.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      setFinished(true);
    }
  };

  const getOptionState = (index: number): AnswerState => {
    if (!submitted) return selected === index ? "selected" : "idle";
    if (index === question.correct) return "correct";
    if (index === selected && selected !== question.correct) return "incorrect";
    return "idle";
  };

  if (finished) {
    const score = answers.filter((a) => a.correct).length;
    return (
      <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
        <div style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-page)" }}>
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center justify-between">
            <span style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)", fontSize: "0.75rem" }}>
              {MATERIAS[cuestionario.materiaId].label} — {preguntas.length} preguntas
            </span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col items-center gap-8">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="var(--bg-elevated)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="8"
                strokeDasharray={`${(score / preguntas.length) * 251} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontFamily: "var(--font-ibm-plex-mono)", fontWeight: 700, fontSize: "1.5rem", color: "var(--text-primary)" }}>
                {score}/{preguntas.length}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div
              className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
              style={{
                background: score >= preguntas.length * 0.9 ? "rgba(34,197,94,0.12)" : score >= preguntas.length * 0.7 ? "rgba(234,179,8,0.12)" : "rgba(194,47,47,0.12)",
                color: score >= preguntas.length * 0.9 ? "rgb(34,197,94)" : score >= preguntas.length * 0.7 ? "rgb(234,179,8)" : "var(--accent)",
                fontFamily: "var(--font-ibm-plex-sans)",
              }}
            >
              {score >= preguntas.length * 0.9 ? "¡Excelente!" : score >= preguntas.length * 0.7 ? "Bien" : "A repasar"}
            </div>
            <p style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              Respondiste {score} de {preguntas.length} preguntas correctamente
            </p>
          </div>

          <div className="w-full max-w-md">
            {preguntas.map((q, i) => {
              const answer = answers.find((a) => a.questionId === q.id);
              return (
                <div
                  key={q.id}
                  className="flex items-start gap-3 py-3"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{
                      background: answer?.correct ? "rgba(34,197,94,0.15)" : "rgba(194,47,47,0.15)",
                      color: answer?.correct ? "rgb(34,197,94)" : "var(--accent)",
                    }}
                  >
                    {answer?.correct ? "✓" : "✗"}
                  </span>
                  <p
                    className="flex-1 text-sm leading-snug"
                    style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-secondary)" }}
                  >
                    P{i + 1}. {q.question.length > 60 ? q.question.slice(0, 60) + "…" : q.question}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setCurrentQ(0);
                setSelected(null);
                setSubmitted(false);
                setAnswers([]);
                setFinished(false);
              }}
              className="btn-primary"
            >
              Repetir cuestionario
            </button>
            <Link href="/cuestionarios" className="btn-secondary">
              ← Todos los cuestionarios
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
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
            {currentQ + 1} / {preguntas.length}
          </span>
          <Link href="/cuestionarios" className="btn-ghost text-xs py-1 px-2">
            ✕ Salir
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{
              background: "var(--bg-elevated)",
              fontFamily: "var(--font-ibm-plex-mono)",
              color: "var(--text-muted)",
            }}
          >
            {MATERIAS[cuestionario.materiaId].label}
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
            {FORMATO_LABELS[cuestionario.formato]}
          </span>
        </div>

        <h1
          className="text-xl font-semibold mb-6"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          {cuestionario.titulo}
        </h1>

        <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--bg-panel)" }}>
          <p
            className="text-xs uppercase tracking-wider mb-3"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            Pregunta {currentQ + 1}
          </p>
          <h2
            className="text-xl font-medium leading-relaxed mb-6"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
          >
            {question.question}
          </h2>

          <div className="flex flex-col gap-2">
            {question.options.map((option, i) => {
              const state = getOptionState(i);
              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelected(i)}
                  disabled={submitted}
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
                    {["A", "B", "C", "D"][i]}
                  </span>
                  <span>{option}</span>
                  {submitted && state === "correct" && (
                    <span className="ml-auto text-sm" style={{ color: "rgb(34,197,94)" }}>✓</span>
                  )}
                  {submitted && state === "incorrect" && (
                    <span className="ml-auto text-sm" style={{ color: "var(--accent)" }}>✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {submitted && (
            <div
              className="mt-4 p-4 rounded-xl"
              style={{
                background: isCorrect ? "rgba(34,197,94,0.08)" : "rgba(194,47,47,0.08)",
                border: `1px solid ${isCorrect ? "rgba(34,197,94,0.3)" : "rgba(194,47,47,0.3)"}`,
              }}
            >
              <p
                className="text-sm leading-relaxed"
                style={{
                  fontFamily: "var(--font-ibm-plex-serif)",
                  color: isCorrect ? "rgb(34,197,94)" : "var(--accent)",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                {isCorrect ? "¡Correcto!" : "Incorrecto"}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-secondary)" }}
              >
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={selected === null}
            className="btn-primary w-full justify-center"
            style={{ opacity: selected === null ? 0.5 : 1, cursor: selected === null ? "not-allowed" : "pointer" }}
          >
            Enviar respuesta
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary w-full justify-center">
            {currentQ < preguntas.length - 1 ? "Siguiente pregunta →" : "Ver resultados →"}
          </button>
        )}
      </div>
    </main>
  );
}
