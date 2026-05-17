"use client";
import { useState } from "react";
import { useMeshStore } from "../../store/meshStore";
import { capitalize } from "../../utils/capitalize";

const CATEGORY_ORDER = [
  "Cara y cabeza",
  "Cuello",
  "Espalda y hombro",
  "Tórax y abdomen",
  "Brazo",
  "Antebrazo",
  "Mano",
  "Cadera y glúteo",
  "Muslo",
  "Pierna",
  "Pie",
  "Otros",
];

const PRESETS = [
  { label: "Todo", key: "all" },
  { label: "Solo huesos", key: "bones" },
  { label: "Sin cara", key: "no-face" },
];

export function LayerSystemPanel() {
  const groups = useMeshStore((s) => s.groups);
  const toggleGroup = useMeshStore((s) => s.toggleGroup);

  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [activePreset, setActivePreset] = useState<string | null>("all");

  const handleToggle = (key: string, value: boolean) => {
    setVisibility((prev) => ({ ...prev, [key]: value }));
    toggleGroup(key, value);
    setActivePreset(null);
  };

  const handleToggleCategory = (category: string, value: boolean) => {
    const inCategory = groups.filter((g) => (g.category ?? "Otros") === category);
    const next: Record<string, boolean> = {};
    inCategory.forEach((g) => {
      next[g.key] = value;
      toggleGroup(g.key, value);
    });
    setVisibility((prev) => ({ ...prev, ...next }));
    setActivePreset(null);
  };

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    if (preset === "all") {
      groups.forEach((g) => toggleGroup(g.key, true));
      setVisibility({});
    } else if (preset === "bones") {
      const next: Record<string, boolean> = {};
      groups.forEach((g) => {
        const show = !g.key.toLowerCase().includes("muscle") && !g.key.toLowerCase().includes("organ");
        next[g.key] = show;
        toggleGroup(g.key, show);
      });
      setVisibility(next);
    } else if (preset === "no-face") {
      const next: Record<string, boolean> = {};
      groups.forEach((g) => {
        const hide = (g.category ?? "Otros") === "Cara y cabeza";
        next[g.key] = !hide;
        toggleGroup(g.key, !hide);
      });
      setVisibility(next);
    }
  };

  const toggleOpen = (category: string) => {
    setOpenCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const grouped = groups.reduce<Record<string, typeof groups>>((acc, g) => {
    const cat = g.category ?? "Otros";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(g);
    return acc;
  }, {});

  const sortedCategories = CATEGORY_ORDER.filter((c) => grouped[c]);

  if (groups.length === 0) {
    return (
      <div className="p-6 flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg-elevated)" }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "1rem" }}>⊞</span>
        </div>
        <p
          className="text-sm text-center"
          style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}
        >
          Carga un modelo para gestionar capas
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Presets */}
      <div
        className="px-4 py-3 flex flex-col gap-2"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <span
          className="text-xs uppercase tracking-wider"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          Presets
        </span>
        <div className="flex gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key)}
              className="px-3 py-1 rounded-full text-xs border transition-all"
              style={{
                fontFamily: "var(--font-ibm-plex-sans)",
                fontWeight: 500,
                background: activePreset === p.key ? "rgba(194,47,47,0.12)" : "transparent",
                borderColor: activePreset === p.key ? "var(--accent)" : "var(--border-subtle)",
                color: activePreset === p.key ? "var(--accent)" : "var(--text-muted)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto ui-scrollbar scrollbar scrollbar-thumb-muted scrollbar-track-panel px-2 py-2">
        {sortedCategories.map((category) => {
          const categoryGroups = grouped[category];
          const isOpen = openCategories[category] ?? false;
          const allVisible = categoryGroups.every((g) => visibility[g.key] ?? true);
          const visibleCount = categoryGroups.filter((g) => visibility[g.key] ?? true).length;

          return (
            <div
              key={category}
              className="mb-1 rounded-lg overflow-hidden"
              style={{ background: "var(--bg-canvas)" }}
            >
              {/* Category header */}
              <div
                className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
                onClick={() => toggleOpen(category)}
                style={{
                  borderBottom: isOpen ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs transition-transform duration-150"
                    style={{
                      color: "var(--text-muted)",
                      transform: isOpen ? "rotate(90deg)" : "none",
                      display: "inline-block",
                    }}
                  >
                    ▸
                  </span>
                  <span
                    className="text-xs font-medium uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-secondary)" }}
                  >
                    {category}
                  </span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    {visibleCount}/{categoryGroups.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Eye toggle for category */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleCategory(category, !allVisible);
                    }}
                    className="p-1 rounded transition-colors"
                    style={{ color: allVisible ? "var(--text-primary)" : "var(--text-muted)" }}
                    title={allVisible ? "Ocultar todo" : "Mostrar todo"}
                  >
                    {allVisible ? (
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
              </div>

              {/* Mesh list */}
              {isOpen && (
                <div className="py-1">
                  {categoryGroups.map((group) => {
                    const visible = visibility[group.key] ?? true;
                    const label = group.name?.trim() ? group.name : group.key;
                    return (
                      <div
                        key={group.key}
                        className="flex items-center justify-between px-3 py-1.5 transition-colors cursor-pointer"
                        style={{ color: visible ? "var(--text-secondary)" : "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-elevated)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                        onClick={() => handleToggle(group.key, !visible)}
                      >
                        <span
                          className="text-xs truncate max-w-[140px]"
                          style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                        >
                          {capitalize(label)}
                        </span>
                        <button
                          className="shrink-0 p-0.5"
                          style={{ color: visible ? "var(--accent)" : "var(--text-muted)" }}
                        >
                          {visible ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 2.5C3.5 2.5 1.5 4.5 1 6C1.5 7.5 3.5 9.5 6 9.5C8.5 9.5 10.5 7.5 11 6C10.5 4.5 8.5 2.5 6 2.5Z" stroke="currentColor" strokeWidth="1.2" />
                              <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M1.5 1.5L10.5 10.5M4.5 3.5C5 3.2 5.5 3 6 3C8.5 3 10.5 5 11 6C10.7 6.7 10.2 7.3 9.5 7.8M2.5 5C2 5.5 1.5 5.7 1 6C1.5 7.5 3.5 9.5 6 9.5C6.7 9.5 7.4 9.3 8 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
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
        })}
      </div>
    </div>
  );
}
