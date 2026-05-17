"use client";
import { useState } from "react";
import { useAnatomyStore } from "../../store/anatomyStore";
import { useMeshStore } from "../../store/meshStore";
import { InfoPanel } from "./InfoPanel";
import { LayerSystemPanel } from "../layers/LayerSystemPanel";
import { LabelsTab } from "../labels/LabelsTab";
import { ImagingLinkedPanel } from "../imaging/ImagingLinkedPanel";

type Tab = "info" | "layers" | "labels" | "imaging";

export function ViewerRightPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const selected = useAnatomyStore((s) => s.selected);
  const groups = useMeshStore((s) => s.groups);
  const labelsVisible = useAnatomyStore((s) => s.labelsVisible);

  const visibleCount = groups.filter((g) => {
    return true;
  }).length;

  const tabs: {
    id: Tab;
    label: string;
    badge?: string | null;
  }[] = [
    {
      id: "info",
      label: "Info",
      badge: selected ? selected.name.split(" ").slice(0, 2).join(" ") : null,
    },
    {
      id: "layers",
      label: "Capas",
      badge: groups.length > 0 ? String(groups.filter((_, i) => i < 99).length) : null,
    },
    {
      id: "labels",
      label: "Etiquetas",
      badge: labelsVisible ? "On" : null,
    },
    {
      id: "imaging",
      label: "Imágenes",
      badge: null,
    },
  ];

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: "var(--bg-panel)" }}
    >
      {/* Tab Strip */}
      <div
        className="shrink-0 px-3 pt-3 pb-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="tab-strip">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.badge && (
                <span
                  className="tab-badge"
                  style={
                    tab.id === "labels"
                      ? { background: "var(--accent)" }
                      : tab.id === "info"
                      ? {
                          background: "transparent",
                          color: "var(--text-muted)",
                          fontSize: "0.5625rem",
                          maxWidth: "4rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          display: "inline-block",
                          padding: "0 0.25rem",
                          borderRadius: "0.25rem",
                        }
                      : {}
                  }
                >
                  {tab.id === "info" && tab.badge
                    ? tab.badge.length > 12
                      ? tab.badge.slice(0, 12) + "…"
                      : tab.badge
                    : tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto ui-scrollbar scrollbar scrollbar-thumb-muted scrollbar-track-panel">
        {activeTab === "info" && (
          <div className="p-4">
            <InfoPanel />
          </div>
        )}
        {activeTab === "layers" && <LayerSystemPanel />}
        {activeTab === "labels" && <LabelsTab />}
        {activeTab === "imaging" && <ImagingLinkedPanel />}
      </div>
    </div>
  );
}
