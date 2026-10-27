"use client";
import { useState } from "react";
import { useViewerTabs, type Tab } from "../../hooks/useViewerTabs";
import { useCombinedViewerStore } from "../../store/combinedViewerStore";
import { TabStrip } from "./TabStrip";
import { InfoPanel } from "./InfoPanel";
import { UnitPanel } from "./UnitPanel";
import { LayerSystemPanel } from "../layers/LayerSystemPanel";
import { LabelsTab } from "../labels/LabelsTab";
import { ImagingLinkedPanel } from "../imaging/ImagingLinkedPanel";

// SRP: este componente solo orquesta qué panel mostrar.
// El cálculo de tabs vive en useViewerTabs; el renderizado del strip en TabStrip.
export function ViewerRightPanel() {
  // Si el usuario no eligió pestaña, se abre en "Unidad" cuando hay una unidad
  // activa y en "Info" si no (derivado, sin efecto).
  const [chosenTab, setChosenTab] = useState<Tab | null>(null);
  const unit = useCombinedViewerStore((s) => s.unit);
  const tabs = useViewerTabs();
  const activeTab: Tab = chosenTab && tabs.some((t) => t.id === chosenTab)
    ? chosenTab
    : unit ? "unit" : "info";

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ background: "var(--bg-panel)" }}
    >
      <div
        className="shrink-0 px-3 pt-3 pb-0"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <TabStrip tabs={tabs} activeTab={activeTab} onTabChange={setChosenTab} />
      </div>

      <div className="flex-1 overflow-y-auto ui-scrollbar scrollbar scrollbar-thumb-muted scrollbar-track-panel">
        {activeTab === "unit" && <UnitPanel />}
        {activeTab === "info" && (
          <div className="p-4">
            <InfoPanel />
          </div>
        )}
        {activeTab === "layers"  && <LayerSystemPanel />}
        {activeTab === "labels"  && <LabelsTab />}
        {activeTab === "imaging" && <ImagingLinkedPanel />}
      </div>
    </div>
  );
}
