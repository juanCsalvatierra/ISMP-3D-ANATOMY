"use client";
import { use, useState } from "react";
import Link from "next/link";
import studies from "../../data/imaging-studies.json";
import { Breadcrumb } from "../../components/ui/Breadcrumb";

type Study = (typeof studies)[0];

const TYPE_LABELS: Record<string, string> = {
  xray: "Radiografía",
  ct: "Tomografía",
};

const VIEWER_ROUTES: Record<string, string> = {
  skeleton: "/skeleton",
  muscles: "/muscles",
  organs: "/organs",
};

export default function StudyViewerPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = use(params);
  const study = studies.find((s) => s.id === studyId) as Study | undefined;

  const [zoom, setZoom] = useState(1);
  const [currentSlice, setCurrentSlice] = useState(1);

  if (!study) {
    return (
      <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
        <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Imágenes", href: "/imaging" }, { label: "No encontrado" }]} />
        </div>
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}>
            Estudio no encontrado
          </p>
          <Link href="/imaging" style={{ color: "var(--accent)", fontFamily: "var(--font-ibm-plex-mono)", fontSize: "0.875rem" }}>
            ← Volver a Imágenes
          </Link>
        </div>
      </main>
    );
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleFit = () => setZoom(1);

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb items={[
          { label: "Inicio", href: "/" },
          { label: "Imágenes", href: "/imaging" },
          { label: study.title },
        ]} />
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row" style={{ height: "calc(100vh - 48px - 33px)" }}>

        {/* Image Viewer */}
        <div
          className="relative w-full h-[50vh] lg:w-[65%] lg:h-full overflow-hidden flex items-center justify-center"
          style={{ background: "#000000" }}
        >
          {/* Toolbar */}
          <div className="viewer-toolbar absolute top-4 left-4 z-20">
            <button className="toolbar-btn" onClick={handleZoomIn} title="Acercar">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 3V7M3 5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M8 8L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Acercar
            </button>
            <button className="toolbar-btn" onClick={handleZoomOut} title="Alejar">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 5H7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M8 8L11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Alejar
            </button>
            <div className="w-px h-4 mx-1" style={{ background: "var(--border-subtle)" }} />
            <button className="toolbar-btn" onClick={handleFit} title="Ajustar">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 4V1.5C1 1.22 1.22 1 1.5 1H4M8 1H10.5C10.78 1 11 1.22 11 1.5V4M11 8V10.5C11 10.78 10.78 11 10.5 11H8M4 11H1.5C1.22 11 1 10.78 1 10.5V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              Ajustar
            </button>
            <span
              className="text-xs ml-2"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Image placeholder */}
          <div
            className="flex flex-col items-center justify-center gap-6 select-none"
            style={{
              transform: `scale(${zoom})`,
              transition: "transform 200ms ease-in-out",
              width: "min(60vw, 400px)",
              aspectRatio: "3/4",
              background: study.type === "xray" ? "rgb(8,8,12)" : "rgb(4,4,8)",
              borderRadius: "4px",
              border: "1px solid rgba(130,130,130,0.2)",
            }}
          >
            {study.type === "xray" ? (
              <svg width="140" height="180" viewBox="0 0 140 180" fill="none">
                {/* Simplified thorax/skull/knee depending on study */}
                <rect x="20" y="10" width="100" height="160" rx="4" fill="none" stroke="rgba(200,200,200,0.1)" strokeWidth="1" />
                <ellipse cx="70" cy="50" rx="40" ry="35" fill="none" stroke="rgba(220,220,220,0.4)" strokeWidth="1.5" />
                <path d="M30 70 L110 70" stroke="rgba(200,200,200,0.2)" strokeWidth="0.5" />
                <path d="M30 80 L110 80" stroke="rgba(200,200,200,0.2)" strokeWidth="0.5" />
                <path d="M30 90 L110 90" stroke="rgba(200,200,200,0.2)" strokeWidth="0.5" />
                <rect x="50" y="100" width="40" height="60" rx="3" fill="none" stroke="rgba(200,200,200,0.3)" strokeWidth="1.2" />
                {/* Hotspot pins */}
                {study.linkedStructures.slice(0, 3).map((_, i) => (
                  <circle
                    key={i}
                    cx={50 + i * 20}
                    cy={60 + i * 15}
                    r="5"
                    fill="rgba(194,47,47,0.8)"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            ) : (
              <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                <circle cx="90" cy="90" r="80" fill="none" stroke="rgba(200,200,200,0.15)" strokeWidth="1" />
                <circle cx="90" cy="90" r="60" fill="rgba(30,30,40,0.8)" stroke="rgba(200,200,200,0.2)" strokeWidth="1" />
                <ellipse cx="90" cy="85" rx="35" ry="30" fill="rgba(60,60,80,0.6)" stroke="rgba(200,200,200,0.3)" strokeWidth="1.2" />
                <text x="90" y="150" textAnchor="middle" fill="rgba(130,130,130,0.5)" fontSize="10" fontFamily="monospace">
                  Corte {currentSlice}/{study.slices}
                </text>
              </svg>
            )}

            <p
              className="text-xs text-center px-4"
              style={{ color: "rgba(130,130,130,0.6)", fontFamily: "var(--font-ibm-plex-mono)" }}
            >
              Placeholder — {study.title}
            </p>
          </div>

          {/* CT Slice Navigator */}
          {study.type === "ct" && (
            <div
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-lg"
              style={{
                background: "rgba(54,54,54,0.9)",
                border: "1px solid var(--border-subtle)",
                backdropFilter: "blur(4px)",
              }}
            >
              <button
                className="toolbar-btn"
                onClick={() => setCurrentSlice((s) => Math.max(1, s - 1))}
                disabled={currentSlice <= 1}
                style={{ opacity: currentSlice <= 1 ? 0.4 : 1 }}
              >
                ◀
              </button>
              <div className="flex flex-col items-center gap-1">
                <span
                  className="text-xs"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-secondary)" }}
                >
                  Corte {currentSlice} / {study.slices}
                </span>
                <div style={{ width: "120px" }}>
                  <input
                    type="range"
                    min={1}
                    max={study.slices}
                    value={currentSlice}
                    onChange={(e) => setCurrentSlice(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: "var(--accent)" }}
                  />
                </div>
              </div>
              <button
                className="toolbar-btn"
                onClick={() => setCurrentSlice((s) => Math.min(study.slices, s + 1))}
                disabled={currentSlice >= study.slices}
                style={{ opacity: currentSlice >= study.slices ? 0.4 : 1 }}
              >
                ▶
              </button>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div
          className="w-full lg:w-[35%] overflow-y-auto ui-scrollbar scrollbar scrollbar-thumb-muted scrollbar-track-panel flex flex-col"
          style={{ background: "var(--bg-panel)", borderLeft: "1px solid var(--border-subtle)" }}
        >
          <div className="p-5 flex-1">
            {/* Study title + badge */}
            <div
              className="pb-4 mb-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2
                  className="text-lg font-semibold leading-snug"
                  style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                >
                  {study.title}
                </h2>
                <span className={`imaging-badge ${study.type} shrink-0`}>
                  {TYPE_LABELS[study.type]}
                </span>
              </div>
              <span
                className="text-xs"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
              >
                {study.systemLabel}
              </span>
            </div>

            {/* Linked Structures */}
            <div className="mb-6">
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--accent)" }}
              >
                Estructuras vinculadas
              </h3>
              <div className="flex flex-col gap-1">
                {study.linkedStructures.map((structure, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors"
                    style={{ background: "var(--bg-canvas)" }}
                  >
                    <span
                      className="text-sm"
                      style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-secondary)" }}
                    >
                      {structure.name}
                    </span>
                    <Link
                      href={`${VIEWER_ROUTES[structure.viewer] || "/skeleton"}?selected=${structure.key}&highlight=true`}
                      className="text-xs transition-colors"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--accent-hover)")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--accent)")}
                    >
                      Abrir →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Notes */}
            {study.notes && (
              <div>
                <h3
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--accent)" }}
                >
                  Notas clínicas
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
                >
                  {study.notes}
                </p>
              </div>
            )}
          </div>

          {/* Back link */}
          <div
            className="p-5"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <Link
              href="/imaging"
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
            >
              ← Volver a Imágenes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
