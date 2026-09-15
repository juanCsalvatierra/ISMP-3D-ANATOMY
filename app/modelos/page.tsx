import { Breadcrumb } from "../components/ui/Breadcrumb";
import { SystemGrid } from "./SystemGrid";

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
        <h1
          className="text-2xl font-semibold mb-3"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          Modelos 3D
        </h1>

        <p
          className="text-sm max-w-xl mb-10 leading-relaxed"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
        >
          Explora, etiqueta y aísla estructuras anatómicas en 3D. Cada sistema comparte
          el mismo visor: capas, etiquetas y fichas descriptivas.
        </p>

        <SystemGrid />
      </section>
    </main>
  );
}
