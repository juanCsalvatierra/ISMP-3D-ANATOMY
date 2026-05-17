"use client";
import { useMemo } from "react";
import rawJson from "../data/anatomy.skeleton.json";
import { AnatomyItem, useAnatomyStore } from "../store/anatomyStore";
import Skeleton from "../components/models/Skeleton";
import { ModelPageLayout } from "../components/ui/ModelPageLayout";
import { buildJsonIndex } from "../utils/indexBuilder";

export default function App() {
  const json = rawJson as Record<string, AnatomyItem>;
  const index = useMemo(() => buildJsonIndex(json), [json]);
  const setSelected = useAnatomyStore((state) => state.setSelected);

  return (
    <ModelPageLayout
      breadcrumbItems={[
        { label: "Inicio", href: "/" },
        { label: "Esqueleto y cartílagos" },
      ]}
      json={json}
      scannerIndex={index}
    >
      <Skeleton json={json} index={index} onSelect={setSelected} />
    </ModelPageLayout>
  );
}