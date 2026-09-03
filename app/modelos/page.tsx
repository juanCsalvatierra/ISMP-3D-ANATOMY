import Link from "next/link";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { READY_SYSTEMS } from "../config/systems";

export const metadata = {
  title: "Modelos 3D · ISMP 3D Anatomy",
  description: "Sistemas anatómicos en 3D interactivo",
};

export default function ModelosGalleryPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}
    >
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb
          items={[{ label: "Inicio", href: "/" }, { label: "Modelos 3D" }]}
        />
      </div>

      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Modelos 3D
          </h1>
          <span
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            {READY_SYSTEMS.length} sistemas
          </span>
        </div>

        <p
          className="text-sm max-w-xl mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
        >
          Explora, etiqueta y aísla estructuras anatómicas en 3D. Cada sistema comparte
          el mismo visor: capas, etiquetas y fichas descriptivas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {READY_SYSTEMS.map((sys) => (
            <Link key={sys.id} href={`/modelos/${sys.id}`} className="group block">
              <div className="system-card h-full flex flex-col gap-4 p-6">
                <div>
                  <span
                    className="inline-block text-xs px-2 py-0.5 rounded mb-3"
                    style={{
                      background: "var(--bg-elevated)",
                      fontFamily: "var(--font-ibm-plex-mono)",
                      color: "var(--text-muted)",
                    }}
                  >
                    Modelo 3D
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <h2
                      className="text-xl font-semibold"
                      style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                    >
                      {sys.shortLabel}
                    </h2>
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
                    {sys.tagline}
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
                    {sys.count}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
