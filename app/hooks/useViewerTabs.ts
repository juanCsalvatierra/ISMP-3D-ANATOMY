"use client";
import { useAnatomyStore } from "../store/anatomyStore";
import { useMeshStore } from "../store/meshStore";
import { useCombinedViewerStore } from "../store/combinedViewerStore";

export type Tab = "unit" | "info" | "layers" | "labels" | "imaging";

export type TabItem = {
  id: Tab;
  label: string;
  badge?: string | null;
};

export function useViewerTabs(): TabItem[] {
  const selected      = useAnatomyStore((s) => s.selected);
  const groups        = useMeshStore((s) => s.groups);
  const labelsVisible = useAnatomyStore((s) => s.labelsVisible);
  const unit          = useCombinedViewerStore((s) => s.unit);

  const tabs: TabItem[] = [
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

  // Vista combinada abierta desde "Mis materias": pestaña con el contenido de la unidad.
  if (unit) tabs.unshift({ id: "unit", label: "Unidad", badge: `U${unit.unidad.n}` });

  return tabs;
}
