import { create } from "zustand";
import type { SystemId } from "../config/systems";
import type { MateriaId } from "../domain/academic";
import { getUnidad, type Unidad } from "../domain/programas";
import { useMeshStore } from "./meshStore";

// Estado de la vista combinada (/modelos/combinado): qué sistemas están montados
// en el canvas, el filtro del panel lateral y, si se llegó desde "Mis materias",
// la unidad de estudio activa.
//
// La carga de cada GLB es perezosa: un sistema solo se descarga cuando entra en
// `enabledSystems`. Al desmontarse la vista se vuelve al estado inicial.

const INITIAL_SYSTEMS: SystemId[] = ["skeleton"];

export type ActiveUnit = { materiaId: MateriaId; unidad: Unidad };

type State = {
  /** true mientras la ruta /modelos/combinado está montada. */
  active: boolean;
  /** Sistemas actualmente montados en el canvas. */
  enabledSystems: SystemId[];
  /** Filtro del panel: mostrar solo los sistemas de la carrera del alumno. */
  onlyMyCarrera: boolean;
  /** Unidad de estudio abierta desde "Mis materias" (null = exploración libre). */
  unit: ActiveUnit | null;
  /**
   * Categorías visibles por sistema para la unidad activa. Se aplica a los
   * grupos recién escaneados que aún no tienen una decisión de visibilidad;
   * lo que el usuario muestre/oculte a mano después se respeta.
   */
  categoryFilter: Partial<Record<SystemId, string[]>> | null;

  setActive: (active: boolean) => void;
  enableSystem: (id: SystemId) => void;
  disableSystem: (id: SystemId) => void;
  toggleSystem: (id: SystemId) => void;
  setOnlyMyCarrera: (value: boolean) => void;
  /** Abre la vista para una unidad: activa sus sistemas y su filtro de categorías. */
  applyUnit: (materiaId: MateriaId, n: number) => boolean;
  /** Quita la unidad activa y muestra todo lo cargado. */
  clearUnit: () => void;
  /** Mantiene la unidad pero muestra todas las categorías. */
  clearCategoryFilter: () => void;
  reset: () => void;
};

export const useCombinedViewerStore = create<State>((set, get) => ({
  active: false,
  enabledSystems: INITIAL_SYSTEMS,
  onlyMyCarrera: false,
  unit: null,
  categoryFilter: null,

  setActive: (active) => set({ active }),

  enableSystem: (id) =>
    set(
      get().enabledSystems.includes(id)
        ? {}
        : { enabledSystems: [...get().enabledSystems, id] },
    ),

  disableSystem: (id) =>
    set({ enabledSystems: get().enabledSystems.filter((s) => s !== id) }),

  toggleSystem: (id) =>
    set(
      get().enabledSystems.includes(id)
        ? { enabledSystems: get().enabledSystems.filter((s) => s !== id) }
        : { enabledSystems: [...get().enabledSystems, id] },
    ),

  setOnlyMyCarrera: (onlyMyCarrera) => set({ onlyMyCarrera }),

  applyUnit: (materiaId, n) => {
    const unidad = getUnidad(materiaId, n);
    if (!unidad) return false;
    const inicial = unidad.inicial3D ?? unidad.sistemas3D;
    // Decisiones de visibilidad de la unidad anterior fuera.
    useMeshStore.getState().resetVisibility();
    set({
      unit: { materiaId, unidad },
      enabledSystems: inicial.length > 0 ? inicial : INITIAL_SYSTEMS,
      categoryFilter: unidad.categorias3D ?? null,
    });
    return true;
  },

  clearUnit: () => {
    useMeshStore.getState().resetVisibility();
    set({ unit: null, categoryFilter: null, enabledSystems: INITIAL_SYSTEMS });
  },

  clearCategoryFilter: () => {
    const { groups, setVisibility } = useMeshStore.getState();
    setVisibility(Object.fromEntries(groups.map((g) => [g.key, true])));
    set({ categoryFilter: null });
  },

  reset: () => {
    useMeshStore.getState().resetVisibility();
    set({
      enabledSystems: INITIAL_SYSTEMS,
      onlyMyCarrera: false,
      unit: null,
      categoryFilter: null,
    });
  },
}));
