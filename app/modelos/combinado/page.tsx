"use client";
import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAnatomyStore } from "../../store/anatomyStore";
import { useViewerStore } from "../../store/viewerStore";
import { useCombinedViewerStore } from "../../store/combinedViewerStore";
import { useMeshStore } from "../../store/meshStore";
import AnatomyModel from "../../components/models/AnatomyModel";
import { ModelPageLayout } from "../../components/ui/ModelPageLayout";
import { buildJsonIndex } from "../../utils/indexBuilder";
import { SYSTEMS } from "../../config/systems";
import { DATASETS } from "../../config/datasets";
import { MATERIAS, MATERIA_IDS, type MateriaId } from "../../domain/academic";
import { getUnidad } from "../../domain/programas";

export default function CombinedViewerPage() {
  // useSearchParams exige un Suspense boundary en el prerender estático.
  return (
    <Suspense fallback={null}>
      <CombinedViewer />
    </Suspense>
  );
}

function CombinedViewer() {
  const params = useSearchParams();
  const materiaParam = params.get("materia");
  const unidadParam = Number(params.get("unidad") ?? 0);
  const materiaIdParam = MATERIA_IDS.find((m) => m === materiaParam);
  // ¿La URL pide una unidad válida? Mientras el store no la haya aplicado no se
  // montan modelos, para no descargar (p. ej.) el esqueleto por defecto en vano.
  const expectsUnit = !!materiaIdParam && unidadParam > 0 && !!getUnidad(materiaIdParam, unidadParam);

  const setSelected = useAnatomyStore((s) => s.setSelected);
  const setActiveSystem = useViewerStore((s) => s.setActiveSystem);
  const enabledSystems = useCombinedViewerStore((s) => s.enabledSystems);
  const unit = useCombinedViewerStore((s) => s.unit);
  const categoryFilter = useCombinedViewerStore((s) => s.categoryFilter);
  const setActive = useCombinedViewerStore((s) => s.setActive);
  const applyUnit = useCombinedViewerStore((s) => s.applyUnit);
  const clearUnit = useCombinedViewerStore((s) => s.clearUnit);
  const reset = useCombinedViewerStore((s) => s.reset);

  const groups = useMeshStore((s) => s.groups);
  const visibility = useMeshStore((s) => s.visibility);
  const setVisibility = useMeshStore((s) => s.setVisibility);

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

  // Unidad de estudio desde la URL (?materia=mat-anat1&unidad=7).
  useEffect(() => {
    if (materiaIdParam && unidadParam > 0 && applyUnit(materiaIdParam, unidadParam)) return;
    clearUnit();
  }, [materiaIdParam, unidadParam, applyUnit, clearUnit]);

  // Filtro de categorías de la unidad: se aplica a los grupos nuevos que aún no
  // tienen una decisión de visibilidad (así no pisa lo que el usuario toque).
  useEffect(() => {
    if (!categoryFilter) return;
    const pending: Record<string, boolean> = {};
    for (const g of groups) {
      if (visibility[g.key] !== undefined) continue;
      const allowed = g.system ? categoryFilter[g.system as keyof typeof categoryFilter] : undefined;
      pending[g.key] = !allowed || allowed.includes(g.category ?? "Otros");
    }
    if (Object.keys(pending).length > 0) setVisibility(pending);
  }, [groups, visibility, categoryFilter, setVisibility]);

  const breadcrumb = unit
    ? [
        { label: "Inicio", href: "/" },
        { label: "Mis materias", href: "/materias" },
        { label: MATERIAS[unit.materiaId as MateriaId].label, href: `/materias/${unit.materiaId}` },
        { label: `U${unit.unidad.n} · ${unit.unidad.titulo}` },
      ]
    : [
        { label: "Inicio", href: "/" },
        { label: "Modelos 3D", href: "/modelos" },
        { label: "Vista combinada" },
      ];

  const unitApplied = !expectsUnit || (unit?.materiaId === materiaIdParam && unit?.unidad.n === unidadParam);

  return (
    <ModelPageLayout breadcrumbItems={breadcrumb}>
      {(unitApplied ? enabledSystems : []).map((id) => {
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
