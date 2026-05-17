"use client";
import Link from "next/link";
import { useState } from "react";
import studies from "../data/imaging-studies.json";
import { Breadcrumb } from "../components/ui/Breadcrumb";

type FilterType = "all" | "xray" | "ct";

const TYPE_LABELS: Record<string, string> = {
  xray: "Radiografía",
  ct: "Tomografía",
};

export default function ImagingPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");

  const filtered = studies.filter((s) => {
    const matchType = filter === "all" || s.type === filter;
    const matchSearch =
      search === "" ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.systemLabel.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Imágenes Médicas" }]} />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
          >
            Imágenes Médicas
          </h1>
          <p
            className="text-base"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Radiografías y tomografías vinculadas a estructuras anatómicas
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="flex gap-2">
            {(["all", "xray", "ct"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-full text-sm border transition-all"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  fontWeight: 500,
                  background: filter === f ? "rgba(194,47,47,0.12)" : "transparent",
                  borderColor: filter === f ? "var(--accent)" : "var(--border-subtle)",
                  color: filter === f ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {f === "all" ? "Todos" : f === "xray" ? "Radiografía" : "Tomografía"}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Buscar estudios..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ui-input sm:max-w-xs text-sm"
          />
        </div>

        {/* Count */}
        <p
          className="text-xs mb-5"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          {filtered.length} {filtered.length === 1 ? "estudio" : "estudios"}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((study) => (
            <Link key={study.id} href={`/imaging/${study.id}`} className="group block">
              <div
                className="rounded-xl overflow-hidden border transition-all duration-150"
                style={{
                  background: "var(--bg-panel)",
                  borderColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                {/* Thumbnail placeholder */}
                <div
                  className="w-full flex items-center justify-center"
                  style={{
                    height: "140px",
                    background: "var(--bg-canvas)",
                    borderBottom: "1px solid var(--border-subtle)",
                  }}
                >
                  {study.type === "xray" ? (
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <rect x="8" y="8" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--border-subtle)" }} />
                      <rect x="14" y="14" width="28" height="28" rx="2" fill="currentColor" style={{ color: "var(--bg-elevated)", opacity: 0.5 }} />
                      <path d="M18 28 L22 22 L26 30 L30 24 L34 28 L38 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }} />
                    </svg>
                  ) : (
                    <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                      <circle cx="28" cy="28" r="20" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--border-subtle)" }} />
                      <circle cx="28" cy="28" r="12" fill="currentColor" style={{ color: "var(--bg-elevated)", opacity: 0.4 }} />
                      <circle cx="28" cy="28" r="5" fill="currentColor" style={{ color: "var(--text-muted)", opacity: 0.5 }} />
                      <path d="M28 8 L28 16 M28 40 L28 48 M8 28 L16 28 M40 28 L48 28" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={{ color: "var(--border-subtle)" }} />
                    </svg>
                  )}
                </div>

                {/* Card content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-sm font-semibold leading-snug flex-1"
                      style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                    >
                      {study.title}
                    </h3>
                    <span
                      className={`imaging-badge shrink-0 ${study.type}`}
                      style={{ marginTop: "1px" }}
                    >
                      {TYPE_LABELS[study.type]}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      {study.systemLabel}
                    </span>
                    <span style={{ color: "var(--border-subtle)", fontSize: "0.5rem" }}>●</span>
                    <span
                      className="text-xs"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      {study.linkedStructures.length} estructuras
                    </span>
                    {study.type === "ct" && (
                      <>
                        <span style={{ color: "var(--border-subtle)", fontSize: "0.5rem" }}>●</span>
                        <span
                          className="text-xs"
                          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                        >
                          {study.slices} cortes
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20">
            <span style={{ color: "var(--text-muted)", fontSize: "2rem" }}>⬜</span>
            <p
              className="text-sm"
              style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}
            >
              No se encontraron estudios con esos filtros
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
