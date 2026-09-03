import { create } from "zustand";
import type { AnatomySystem } from "../config/systems";

// Sistema 3D activo en el visor. Lo setea app/modelos/[system]/page.tsx al montar.
// MeshScanner y LayerSystemPanel lo leen para saber qué reglas de categorías usar
// (viven en ramas distintas del árbol, por eso va en un store y no por props).
type State = {
  activeSystem: AnatomySystem | null;
  setActiveSystem: (system: AnatomySystem | null) => void;
};

export const useViewerStore = create<State>((set) => ({
  activeSystem: null,
  setActiveSystem: (activeSystem) => set({ activeSystem }),
}));
