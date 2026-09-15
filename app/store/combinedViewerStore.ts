import { create } from "zustand";
import type { SystemId } from "../config/systems";

// Estado de la vista combinada (/modelos/combinado): qué sistemas están montados
// en el canvas y el filtro del panel lateral.
//
// La carga de cada GLB es perezosa: un sistema solo se descarga cuando entra en
// `enabledSystems`. Al desmontarse la vista se vuelve al estado inicial.

const INITIAL_SYSTEMS: SystemId[] = ["skeleton"];

type State = {
  /** true mientras la ruta /modelos/combinado está montada. */
  active: boolean;
  /** Sistemas actualmente montados en el canvas. */
  enabledSystems: SystemId[];
  /** Filtro del panel: mostrar solo los sistemas de la carrera del alumno. */
  onlyMyCarrera: boolean;

  setActive: (active: boolean) => void;
  enableSystem: (id: SystemId) => void;
  disableSystem: (id: SystemId) => void;
  toggleSystem: (id: SystemId) => void;
  setOnlyMyCarrera: (value: boolean) => void;
  reset: () => void;
};

export const useCombinedViewerStore = create<State>((set, get) => ({
  active: false,
  enabledSystems: INITIAL_SYSTEMS,
  onlyMyCarrera: false,

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

  reset: () =>
    set({ enabledSystems: INITIAL_SYSTEMS, onlyMyCarrera: false }),
}));
