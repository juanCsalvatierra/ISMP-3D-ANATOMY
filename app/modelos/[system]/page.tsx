"use client";
import { use, useEffect, useMemo } from "react";
import { notFound } from "next/navigation";
import { useAnatomyStore } from "../../store/anatomyStore";
import { useViewerStore } from "../../store/viewerStore";
import AnatomyModel from "../../components/models/AnatomyModel";
import { ModelPageLayout } from "../../components/ui/ModelPageLayout";
import { buildJsonIndex } from "../../utils/indexBuilder";
import { getSystem, type AnatomySystem } from "../../config/systems";
import { DATASETS } from "../../config/datasets";

export default function SystemViewerPage({
  params,
}: {
  params: Promise<{ system: string }>;
}) {
  const { system: systemParam } = use(params);
  const system = getSystem(systemParam);

  if (!system || system.status !== "ready") {
    notFound();
  }

  return <SystemViewer system={system} />;
}

function SystemViewer({ system }: { system: AnatomySystem }) {
  const json = DATASETS[system.dataset];
  const index = useMemo(() => buildJsonIndex(json), [json]);
  const setSelected = useAnatomyStore((state) => state.setSelected);
  const setActiveSystem = useViewerStore((s) => s.setActiveSystem);

  useEffect(() => {
    setActiveSystem(system);
    return () => setActiveSystem(null);
  }, [system, setActiveSystem]);

  return (
    <ModelPageLayout
      breadcrumbItems={[
        { label: "Inicio", href: "/" },
        { label: "Modelos 3D", href: "/modelos" },
        { label: system.label },
      ]}
    >
      <AnatomyModel system={system} json={json} index={index} onSelect={setSelected} />
    </ModelPageLayout>
  );
}
