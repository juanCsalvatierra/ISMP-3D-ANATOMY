"use client";
import Link from "next/link";
import { useAnatomyStore } from "../../store/anatomyStore";

export function ImagingLinkedPanel() {
  const selected = useAnatomyStore((s) => s.selected);

  if (!selected) {
    return (
      <div className="p-6 flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg-elevated)" }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="2" y="3" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" style={{ color: "var(--text-muted)" }} />
            <path d="M6 11 L9 8 L12 13 L14 11 L17 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }} />
          </svg>
        </div>
        <p
          className="text-sm text-center"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}
        >
          Selecciona una estructura para ver imágenes médicas vinculadas
        </p>
        <Link
          href="/imaging"
          className="text-xs"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
        >
          Ver todas las imágenes →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <p
          className="text-xs"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          Imágenes vinculadas a
        </p>
        <p
          className="text-sm font-medium mt-0.5"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          {selected.name}
        </p>
      </div>

      <div className="flex-1 p-4">
        {/* Placeholder: upcoming feature */}
        <div
          className="rounded-xl p-6 flex flex-col items-center gap-3 text-center"
          style={{
            background: "var(--bg-canvas)",
            border: "1px dashed var(--border-subtle)",
          }}
        >
          <span
            className="text-2xl"
            style={{ color: "var(--accent)", opacity: 0.6 }}
          >
            ⬜
          </span>
          <p
            className="text-sm"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}
          >
            No hay imágenes vinculadas a esta estructura todavía.
          </p>
          <Link
            href="/imaging"
            className="text-xs mt-1"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
          >
            Explorar imágenes médicas →
          </Link>
        </div>
      </div>
    </div>
  );
}
