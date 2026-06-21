"use client";
import Link from "next/link";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { useUserStore } from "@/app/store/userStore";

export default function CuestionariosHubPage() {
  const currentUser = useUserStore((s) => s.currentUser);

  const sinCarrera =
    currentUser?.role === "estudiante" && !currentUser.carreraIds?.length;

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Cuestionarios" }]} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
          >
            Cuestionarios
          </h1>
          <p
            className="text-base"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Generá exámenes de práctica aleatorios desde el banco de preguntas.
          </p>
        </div>

        {sinCarrera && (
          <div
            className="ui-panel rounded-xl p-4 mb-6"
            style={{ border: "1px solid var(--accent)", background: "rgba(194,47,47,0.08)" }}
          >
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
            >
              No tenés una carrera asignada. Contactá al administrador para que la asigne en tu perfil.
            </p>
          </div>
        )}

        {currentUser?.role === "estudiante" || !currentUser ? (
          <Link
            href="/cuestionarios/generar"
            className="group flex items-center justify-between rounded-2xl p-6 transition-all"
            style={{
              background: "rgba(194,47,47,0.06)",
              border: "1px solid rgba(194,47,47,0.2)",
            }}
          >
            <div>
              <p
                className="text-base font-semibold mb-1"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                Generar examen de práctica
              </p>
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
              >
                Elegí materia, unidad y cantidad. Las preguntas se seleccionan al azar.
              </p>
            </div>
            <span
              className="text-lg transition-transform group-hover:translate-x-1 shrink-0 ml-4"
              style={{ color: "var(--accent)" }}
            >
              →
            </span>
          </Link>
        ) : (
          <div className="flex flex-col gap-3">
            <Link
              href="/docente/cuestionarios/nuevo"
              className="group flex items-center justify-between rounded-2xl p-6 transition-all"
              style={{
                background: "rgba(194,47,47,0.06)",
                border: "1px solid rgba(194,47,47,0.2)",
              }}
            >
              <div>
                <p
                  className="text-base font-semibold mb-1"
                  style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                >
                  Agregar pregunta al banco
                </p>
                <p
                  className="text-sm"
                  style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
                >
                  Creá preguntas por materia y unidad para que los estudiantes puedan practicar.
                </p>
              </div>
              <span
                className="text-lg transition-transform group-hover:translate-x-1 shrink-0 ml-4"
                style={{ color: "var(--accent)" }}
              >
                →
              </span>
            </Link>
            <Link href="/docente" className="btn-secondary text-center">
              Ir al panel docente
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
