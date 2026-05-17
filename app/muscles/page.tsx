"use client";
import { useMemo } from "react";
import rawJson from "../data/anatomy.final.builded.json";
import { AnatomyItem, useAnatomyStore } from "../store/anatomyStore";
import Muscles from "../components/models/Muscles";
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
        { label: "Músculos" },
      ]}
      json={json}
      scannerIndex={index}
    >
      <Muscles json={json} onSelect={setSelected} />
    </ModelPageLayout>
  );
}