"use client";
import { Suspense, useEffect, useMemo } from "react";
import { useAnatomyStore } from "../../store/anatomyStore";
import { useViewerStore } from "../../store/viewerStore";
import { useCombinedViewerStore } from "../../store/combinedViewerStore";
import AnatomyModel from "../../components/models/AnatomyModel";
import { ModelPageLayout } from "../../components/ui/ModelPageLayout";
import { buildJsonIndex } from "../../utils/indexBuilder";
import { SYSTEMS } from "../../config/systems";
import { DATASETS } from "../../config/datasets";

export default function CombinedViewerPage() {
  const setSelected = useAnatomyStore((s) => s.setSelected);
  const setActiveSystem = useViewerStore((s) => s.setActiveSystem);
  const enabledSystems = useCombinedViewerStore((s) => s.enabledSystems);
  const setActive = useCombinedViewerStore((s) => s.setActive);
  const reset = useCombinedViewerStore((s) => s.reset);

  const indexes = useMemo(
    () => ({
      skeleton: buildJsonIndex(DATASETS.skeleton),
      builded: buildJsonIndex(DATASETS.builded),
    }),
    [],
  );

  useEffect(() => {
    setActive(true);
    setActiveSystem(null);
    return () => {
      setActive(false);
      reset();
    };
  }, [setActive, setActiveSystem, reset]);

  return (
    <ModelPageLayout
      breadcrumbItems={[
        { label: "Inicio", href: "/" },
        { label: "Modelos 3D", href: "/modelos" },
        { label: "Vista combinada" },
      ]}
    >
      {enabledSystems.map((id) => {
        const system = SYSTEMS[id];
        return (
          <Suspense key={id} fallback={null}>
            <AnatomyModel
              system={system}
              json={DATASETS[system.dataset]}
              index={indexes[system.dataset]}
              onSelect={setSelected}
            />
          </Suspense>
        );
      })}
    </ModelPageLayout>
  );
}
