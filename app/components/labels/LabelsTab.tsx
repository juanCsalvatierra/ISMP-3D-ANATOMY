"use client";
import { useState } from "react";
import { useAnatomyStore } from "../../store/anatomyStore";
import { useMeshStore } from "../../store/meshStore";
import { capitalize } from "../../utils/capitalize";

export function LabelsTab() {
  const labelsVisible = useAnatomyStore((s) => s.labelsVisible);
  const toggleLabels = useAnatomyStore((s) => s.toggleLabels);
  const labelVisibility = useAnatomyStore((s) => s.labelVisibility);
  const setLabelVisible = useAnatomyStore((s) => s.setLabelVisible);
  const groups = useMeshStore((s) => s.groups);
  const [filter, setFilter] = useState("");

  const allLabels = groups.map((g) => ({
    id: g.key,
    name: g.name?.trim() ? g.name : g.key,
  }));

  const filtered = allLabels.filter((l) =>
    l.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-sm font-medium"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          Etiquetas
        </span>
        <button
          onClick={toggleLabels}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs border transition-all"
          style={{
            fontFamily: "var(--font-ibm-plex-mono)",
            background: labelsVisible ? "rgba(194,47,47,0.12)" : "transparent",
            borderColor: labelsVisible ? "var(--accent)" : "var(--border-subtle)",
            color: labelsVisible ? "var(--accent)" : "var(--text-muted)",
          }}
        >
          {labelsVisible ? "● Activas" : "○ Inactivas"}
        </button>
      </div>

      {/* Filter input */}
      <div className="px-4 py-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <input
          type="text"
          placeholder="Filtrar estructuras..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="ui-input text-xs"
          style={{ fontSize: "0.75rem" }}
        />
      </div>

      {/* All toggle */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-xs"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          {filtered.length} estructuras
        </span>
        <button
          onClick={() => {
            const allVisible = filtered.every((l) => labelVisibility[l.id] !== false);
            filtered.forEach((l) => setLabelVisible(l.id, !allVisible));
          }}
          className="text-xs"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
        >
          {filtered.every((l) => labelVisibility[l.id] !== false) ? "Ocultar todo" : "Mostrar todo"}
        </button>
      </div>

      {/* Label list */}
      {groups.length === 0 ? (
        <div className="p-6 flex flex-col items-center gap-3">
          <p
            className="text-sm text-center"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}
          >
            Carga un modelo para ver las etiquetas
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto ui-scrollbar scrollbar scrollbar-thumb-muted scrollbar-track-panel">
          {filtered.map((label) => {
            const visible = labelVisibility[label.id] !== false;
            return (
              <div
                key={label.id}
                className="flex items-center justify-between px-4 py-2 transition-colors cursor-pointer"
                style={{
                  borderBottom: "1px solid transparent",
                  color: visible ? "var(--text-secondary)" : "var(--text-muted)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-elevated)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                onClick={() => setLabelVisible(label.id, !visible)}
              >
                <span
                  className="text-xs truncate max-w-[160px]"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                >
                  {capitalize(label.name)}
                </span>
                <button
                  className="shrink-0"
                  style={{ color: visible ? "var(--accent)" : "var(--text-muted)" }}
                >
                  {visible ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 3C4 3 1.5 5.5 1 7C1.5 8.5 4 11 7 11C10 11 12.5 8.5 13 7C12.5 5.5 10 3 7 3Z" stroke="currentColor" strokeWidth="1.2" />
                      <circle cx="7" cy="7" r="2" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2L12 12M5.5 4.2C6 4.1 6.5 4 7 4C10 4 12.5 6.5 13 8C12.7 8.7 12.2 9.4 11.5 10M3 5.8C2.3 6.5 1.7 7.3 1 8C1.5 9.5 4 12 7 12C8 12 9 11.7 9.8 11.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
