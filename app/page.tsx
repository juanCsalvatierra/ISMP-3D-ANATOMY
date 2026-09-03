"use client";
import Link from "next/link";

const MODULES = [
  {
    id: "modelos",
    label: "Modelos 3D",
    sublabel: "Esqueleto, músculos y más sistemas",
    href: "/modelos",
    count: "2 sistemas",
    tag: "Anatomía 3D",
  },
  {
    id: "imaging",
    label: "Imágenes Médicas",
    sublabel: "Radiografías y tomografías",
    href: "/imaging",
    count: "6 estudios",
    tag: "Diagnóstico por imágenes",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>

      {/* Hero */}
      <section
        className="w-full relative overflow-hidden"
        style={{ background: "var(--bg-canvas)" }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 py-20 md:py-28 flex flex-col items-start gap-6">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: "rgba(194, 47, 47, 0.12)",
              color: "var(--accent)",
              fontFamily: "var(--font-ibm-plex-mono)",
              border: "1px solid rgba(194, 47, 47, 0.3)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "var(--accent)" }}
            />
            Plataforma Educativa · ISMP
          </span>

          <h1
            className="text-4xl md:text-6xl leading-tight max-w-3xl"
            style={{
              fontFamily: "var(--font-ibm-plex-serif)",
              color: "var(--text-primary)",
              fontWeight: 600,
            }}
          >
            Explora el cuerpo humano en{" "}
            <span style={{ color: "var(--accent)" }}>3D interactivo</span>
          </h1>

          <p
            className="text-lg max-w-xl leading-relaxed"
            style={{
              fontFamily: "var(--font-ibm-plex-serif)",
              color: "var(--text-muted)",
            }}
          >
            Visualiza, etiqueta y estudia estructuras anatómicas. Integra imágenes médicas y
            evalúa tu conocimiento con cuestionarios adaptados.
          </p>

          <div className="flex flex-wrap gap-3 mt-2">
            <Link href="/modelos" className="btn-primary">
              Explorar Modelos 3D →
            </Link>
            <Link href="/cuestionarios" className="btn-secondary">
              Iniciar Cuestionario
            </Link>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Módulos disponibles
          </h2>
          <span
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            {MODULES.length} módulos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MODULES.map((mod) => (
            <Link key={mod.id} href={mod.href} className="group block">
              <div
                className="system-card h-full flex flex-col gap-4 p-6"
              >
                <div>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded mb-3"
                    style={{
                      background: "var(--bg-elevated)",
                      fontFamily: "var(--font-ibm-plex-mono)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {mod.tag}
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      className="text-xl font-semibold"
                      style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                    >
                      {mod.label}
                    </h3>
                    <span
                      className="text-xl transition-transform group-hover:translate-x-1 mt-0.5"
                      style={{ color: "var(--accent)" }}
                    >
                      →
                    </span>
                  </div>
                  <p
                    className="text-sm mt-1"
                    style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
                  >
                    {mod.sublabel}
                  </p>
                </div>
                <div
                  className="mt-auto pt-4"
                  style={{ borderTop: "1px solid var(--border-subtle)" }}
                >
                  <span
                    className="text-xs"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    {mod.count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Cuestionarios Callout */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-xl"
          style={{
            background: "var(--bg-panel)",
            borderLeft: "4px solid var(--accent)",
          }}
        >
          <div>
            <h3
              className="text-xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
            >
              Pon a prueba tu conocimiento anatómico
            </h3>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              Cuestionarios de identificación, opción múltiple y verdadero/falso.
            </p>
          </div>
          <Link href="/cuestionarios" className="btn-primary shrink-0">
            Ir a Cuestionarios →
          </Link>
        </div>
      </section>

      {/* Features strip */}
      <section
        className="border-t"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-canvas)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Etiquetado", desc: "Etiquetas interactivas sobre estructuras 3D" },
            { label: "Capas", desc: "Gestiona la visibilidad por categorías" },
            { label: "Imágenes", desc: "Radiografías y tomografías vinculadas" },
            { label: "Cuestionarios", desc: "Autoevaluación con retroalimentación inmediata" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-2">
              <div
                className="w-1 h-4 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              <span
                className="text-sm font-semibold"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                {f.label}
              </span>
              <span
                className="text-xs leading-relaxed"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
              >
                {f.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-page)" }}
      >
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span
            className="text-xs"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            © 2026 ISMP 3D Anatomy · Plataforma educativa
          </span>
          <div className="flex gap-4">
            {[
              { label: "Modelos 3D", href: "/modelos" },
              { label: "Imágenes", href: "/imaging" },
              { label: "Cuestionarios", href: "/cuestionarios" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs ui-link"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
