"use client";
import { useAnatomyStore } from "../store/anatomyStore";
import { useMeshStore } from "../store/meshStore";

export type Tab = "info" | "layers" | "labels" | "imaging";

export type TabItem = {
  id: Tab;
  label: string;
  badge?: string | null;
};

export function useViewerTabs(): TabItem[] {
  const selected      = useAnatomyStore((s) => s.selected);
  const groups        = useMeshStore((s) => s.groups);
  const labelsVisible = useAnatomyStore((s) => s.labelsVisible);

  return [
    {
      id: "info",
      label: "Info",
      badge: selected ? selected.name.split(" ").slice(0, 2).join(" ") : null,
    },
    {
      id: "layers",
      label: "Capas",
      badge: groups.length > 0 ? String(groups.length) : null,
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
}
