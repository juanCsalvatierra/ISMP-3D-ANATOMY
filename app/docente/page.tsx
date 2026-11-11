"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUserStore } from "@/app/store/userStore";
import { api } from "@/app/lib/api";

interface ResumenFila {
  materiaId: string;
  unidad: number;
  estado: "BORRADOR" | "APROBADA";
  total: number;
}

interface Intento {
  userId: string | null;
  nota: number | null;
  completado: boolean;
}

const mono = { fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" } as const;

function DocenteDashboard() {
  const currentUser = useUserStore((s) => s.currentUser)!;

  // Solo conteos: las listas completas viven en el banco y en los resultados.
  const [resumen, setResumen] = useState<{ preguntas: number; filas: ResumenFila[] } | null>(null);
  const [intentos, setIntentos] = useState<Intento[] | null>(null);

  useEffect(() => {
    api
      .get<{ preguntas: number; filas: ResumenFila[] }>("/questions/resumen")
      .then(setResumen)
      .catch(() => setResumen({ preguntas: 0, filas: [] }));
    api
      .get<Intento[]>("/attempts")
      .then((data) => setIntentos(data.filter((a) => a.completado)))
      .catch(() => setIntentos([]));
  }, []);

  const filas = resumen?.filas ?? [];
  const aprobadas = filas.filter((f) => f.estado === "APROBADA").reduce((n, f) => n + f.total, 0);
  const borrador = filas.filter((f) => f.estado === "BORRADOR").reduce((n, f) => n + f.total, 0);
  const materiasCount = new Set(filas.map((f) => f.materiaId)).size;

  const alumnos = new Set((intentos ?? []).map((a) => a.userId ?? "anonimo")).size;
  const promedio = intentos?.length
    ? Math.round(intentos.reduce((acc, a) => acc + (a.nota ?? 0), 0) / intentos.length)
    : 0;

  const cargandoQ = resumen === null;
  const cargandoA = intentos === null;

  const tarjetas = [
    {
      href: "/docente/banco",
      titulo: "Banco de preguntas",
      texto: "Explorá las preguntas por materia y unidad, editalas o eliminá las tuyas.",
      cifra: cargandoQ ? "—" : resumen!.preguntas,
      unidad: "preguntas",
      detalle: cargandoQ
        ? ""
        : `En ${materiasCount} materia${materiasCount === 1 ? "" : "s"} · ${aprobadas} aprobadas y ${borrador} en borrador (una pregunta puede estar en varias materias)`,
      cta: "Ver banco",
    },
    {
      href: "/docente/resultados",
      titulo: "Resultados de alumnos",
      texto: "Intentos completados, filtrados por materia y unidad, con el detalle de cada examen.",
      cifra: cargandoA ? "—" : intentos!.length,
      unidad: "intentos",
      detalle: cargandoA ? "" : `${alumnos} alumno${alumnos === 1 ? "" : "s"} · promedio ${promedio}%`,
      cta: "Ver resultados",
    },
  ];

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
            <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
              Hola {currentUser.name}, gestioná el banco de preguntas y seguí el progreso de tus alumnos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/docente/revision" className="btn-secondary">
              Revisar borradores
            </Link>
            <Link href="/docente/cuestionarios/nuevo" className="btn-primary">
              + Agregar pregunta
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {tarjetas.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="ui-panel rounded-2xl p-6 flex flex-col gap-3 transition-colors"
              style={{ border: "1px solid var(--border-subtle)" }}
            >
              <h2 className="text-lg font-semibold" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
                {t.titulo}
              </h2>
              <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                {t.texto}
              </p>
              <div className="mt-2">
                <p className="text-3xl font-semibold" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}>
                  {t.cifra}
                  <span className="text-sm font-normal ml-2" style={mono}>{t.unidad}</span>
                </p>
                <p className="text-xs mt-1 min-h-4" style={mono}>{t.detalle}</p>
              </div>
              <span className="text-sm mt-auto pt-2" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--accent)", fontWeight: 500 }}>
                {t.cta} →
              </span>
            </Link>
          ))}
        </div>
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
