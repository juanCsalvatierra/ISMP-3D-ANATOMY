"use client";
import { useMemo, useState } from "react";
import { useMeshStore, type MeshGroup } from "../../store/meshStore";
import { useCombinedViewerStore } from "../../store/combinedViewerStore";
import { useUserStore } from "../../store/userStore";
import {
  READY_SYSTEMS,
  systemsForCarreras,
  SYSTEMS,
  type AnatomySystem,
} from "../../config/systems";
import { capitalize } from "../../utils/capitalize";

function EyeIcon({ on }: { on: boolean }) {
  return on ? (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M7 3C4 3 1.5 5.5 1 7C1.5 8.5 4 11 7 11C10 11 12.5 8.5 13 7C12.5 5.5 10 3 7 3Z" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="7" r="2" fill="currentColor" />
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2 2L12 12M5.5 4.2C6 4.1 6.5 4 7 4C10 4 12.5 6.5 13 8C12.7 8.7 12.2 9.4 11.5 10M3 5.8C2.3 6.5 1.7 7.3 1 8C1.5 9.5 4 12 7 12C8 12 9 11.7 9.8 11.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function CombinedLayerPanel() {
  const groups = useMeshStore((s) => s.groups);
  const toggleGroup = useMeshStore((s) => s.toggleGroup);

  const enabledSystems = useCombinedViewerStore((s) => s.enabledSystems);
  const toggleSystem = useCombinedViewerStore((s) => s.toggleSystem);
  const onlyMyCarrera = useCombinedViewerStore((s) => s.onlyMyCarrera);
  const setOnlyMyCarrera = useCombinedViewerStore((s) => s.setOnlyMyCarrera);

  const currentUser = useUserStore((s) => s.currentUser);
  const carreraIds = currentUser?.carreraIds ?? null;
  const hasCarreras = !!carreraIds && carreraIds.length > 0;

  const [visibility, setVisibility] = useState<Record<string, boolean>>({});

  const visibleSystems = useMemo(() => {
    if (onlyMyCarrera && hasCarreras) return systemsForCarreras(carreraIds);
    return READY_SYSTEMS;
  }, [onlyMyCarrera, hasCarreras, carreraIds]);

  const groupsBySystem = useMemo(() => {
    const m = new Map<string, MeshGroup[]>();
    for (const g of groups) {
      const s = g.system ?? "unknown";
      if (!m.has(s)) m.set(s, []);
      m.get(s)!.push(g);
    }
    return m;
  }, [groups]);

  const handleToggleGroup = (key: string, value: boolean) => {
    setVisibility((prev) => ({ ...prev, [key]: value }));
    toggleGroup(key, value);
  };

  const handleToggleMany = (keys: string[], value: boolean) => {
    const next: Record<string, boolean> = {};
    keys.forEach((k) => {
      next[k] = value;
      toggleGroup(k, value);
    });
    setVisibility((prev) => ({ ...prev, ...next }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* ── Sistemas ─────────────────────────────────────────── */}
      <div
        className="px-4 py-3 flex flex-col gap-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center justify-between">
          <span
            className="text-xs uppercase tracking-wider"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            Sistemas
          </span>
          {hasCarreras && (
            <label
              className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-muted)" }}
            >
              <input
                type="checkbox"
                checked={onlyMyCarrera}
                onChange={(e) => setOnlyMyCarrera(e.target.checked)}
              />
              Solo mi carrera
            </label>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {visibleSystems.map((sys) => {
            const enabled = enabledSystems.includes(sys.id);
            const sysGroups = groupsBySystem.get(sys.id) ?? [];
            const loading = enabled && sysGroups.length === 0;
            return (
              <button
                key={sys.id}
                onClick={() => toggleSystem(sys.id)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors"
                style={{
                  background: enabled ? "var(--bg-elevated)" : "transparent",
                }}
              >
                <span
                  className="w-3 h-3 rounded-sm shrink-0"
                  style={{
                    background: enabled ? sys.swatch : "transparent",
                    border: `1px solid ${enabled ? sys.swatch : "var(--border-subtle)"}`,
                  }}
                />
                <span
                  className="text-sm flex-1"
                  style={{
                    fontFamily: "var(--font-ibm-plex-sans)",
                    color: enabled ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  {sys.shortLabel}
                </span>
                <span
                  className="text-xs"
                  style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                >
                  {loading ? "cargando…" : enabled ? `${sysGroups.length}` : sys.count.replace(/[^0-9+]/g, "") || ""}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Estructuras por sistema ──────────────────────────── */}
      <div className="flex-1 overflow-y-auto ui-scrollbar scrollbar scrollbar-thumb-muted scrollbar-track-panel px-2 py-2">
        {enabledSystems
          .map((id) => SYSTEMS[id])
          .filter((sys) => (groupsBySystem.get(sys.id)?.length ?? 0) > 0)
          .map((sys) => (
            <SystemStructureBlock
              key={sys.id}
              system={sys}
              groups={groupsBySystem.get(sys.id) ?? []}
              visibility={visibility}
              onToggleGroup={handleToggleGroup}
              onToggleMany={handleToggleMany}
            />
          ))}
        {groups.length === 0 && (
          <p
            className="text-sm text-center px-4 py-8"
            style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}
          >
            Activá un sistema para ver sus estructuras.
          </p>
        )}
      </div>
    </div>
  );
}

function SystemStructureBlock({
  system,
  groups,
  visibility,
  onToggleGroup,
  onToggleMany,
}: {
  system: AnatomySystem;
  groups: MeshGroup[];
  visibility: Record<string, boolean>;
  onToggleGroup: (key: string, value: boolean) => void;
  onToggleMany: (keys: string[], value: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const byCategory = useMemo(() => {
    const m: Record<string, MeshGroup[]> = {};
    for (const g of groups) {
      const c = g.category ?? "Otros";
      (m[c] ??= []).push(g);
    }
    return m;
  }, [groups]);

  const orderedCats = useMemo(() => {
    const present = Object.keys(byCategory);
    const ordered = system.categoryOrder.filter((c) => byCategory[c]);
    const rest = present.filter((c) => !system.categoryOrder.includes(c)).sort();
    return [...ordered, ...rest];
  }, [byCategory, system.categoryOrder]);

  const allKeys = groups.map((g) => g.key);
  const visibleCount = groups.filter((g) => visibility[g.key] ?? true).length;
  const allVisible = visibleCount === groups.length;

  return (
    <div className="mb-1 rounded-lg overflow-hidden" style={{ background: "var(--bg-canvas)" }}>
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none"
        onClick={() => setOpen((v) => !v)}
        style={{ borderBottom: open ? "1px solid var(--border-subtle)" : "none" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs"
            style={{ color: "var(--text-muted)", transform: open ? "rotate(90deg)" : "none", display: "inline-block" }}
          >
            ▸
          </span>
          <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: system.swatch }} />
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-secondary)" }}
          >
            {system.shortLabel}
          </span>
          <span className="text-xs" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
            {visibleCount}/{groups.length}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleMany(allKeys, !allVisible);
          }}
          className="p-1"
          style={{ color: allVisible ? "var(--text-primary)" : "var(--text-muted)" }}
          title={allVisible ? "Ocultar sistema" : "Mostrar sistema"}
        >
          <EyeIcon on={allVisible} />
        </button>
      </div>

      {open && (
        <div className="py-1">
          {orderedCats.map((cat) => {
            const catGroups = byCategory[cat];
            const catOpen = openCats[cat] ?? false;
            const catKeys = catGroups.map((g) => g.key);
            const catVisible = catGroups.filter((g) => visibility[g.key] ?? true).length;
            const catAllVisible = catVisible === catGroups.length;
            const singleCat = orderedCats.length === 1;

            return (
              <div key={cat}>
                {!singleCat && (
                  <div
                    className="flex items-center justify-between px-3 py-1.5 cursor-pointer select-none"
                    onClick={() => setOpenCats((p) => ({ ...p, [cat]: !catOpen }))}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[10px]"
                        style={{ color: "var(--text-muted)", transform: catOpen ? "rotate(90deg)" : "none", display: "inline-block" }}
                      >
                        ▸
                      </span>
                      <span
                        className="text-[11px] uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                      >
                        {cat} {catVisible}/{catGroups.length}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleMany(catKeys, !catAllVisible);
                      }}
                      className="p-0.5"
                      style={{ color: catAllVisible ? "var(--text-primary)" : "var(--text-muted)" }}
                    >
                      <EyeIcon on={catAllVisible} />
                    </button>
                  </div>
                )}

                {(singleCat || catOpen) &&
                  catGroups.map((group) => {
                    const visible = visibility[group.key] ?? true;
                    const label = group.name?.trim() ? group.name : group.key;
                    return (
                      <div
                        key={group.key}
                        className="flex items-center justify-between px-3 py-1.5 pl-7 transition-colors cursor-pointer"
                        style={{ color: visible ? "var(--text-secondary)" : "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        onClick={() => onToggleGroup(group.key, !visible)}
                      >
                        <span className="text-xs truncate max-w-[150px]" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                          {capitalize(label)}
                        </span>
                        <span className="shrink-0" style={{ color: visible ? "var(--accent)" : "var(--text-muted)" }}>
                          <EyeIcon on={visible} />
                        </span>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
