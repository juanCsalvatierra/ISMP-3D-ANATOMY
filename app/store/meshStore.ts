import { create } from "zustand";
import * as THREE from "three";

// Tipado de los grupos de meshes
export type MeshGroup = {
  key: string;
  name: string;
  meshes: THREE.Mesh[];
  category?: string;
};

// Tipado del estado global de visibilidad de meshes
type State = {
  groups: MeshGroup[];
  setGroups: (groups: MeshGroup[]) => void;

  toggleGroup: (key: string, visible: boolean) => void;
};

export const useMeshStore = create<State>((set: (partial: Partial<State>) => void, get: () => State) => ({
  groups: [],

  setGroups: (groups: MeshGroup[]) => set({ groups }),

  toggleGroup: (key: string, visible: boolean) => {
    const group = get().groups.find((g) => g.key === key);
    if (!group) return;

    // LSP: no se parchea mesh.raycast porque rompe el contrato de THREE.Mesh.
    // mesh.visible = false ya excluye el objeto del raycaster internamente.
    // mesh.layers mueve el objeto a una capa ignorada por el raycaster de la escena
    // (que debe configurarse con raycaster.layers.set(0)).
    group.meshes.forEach((mesh: THREE.Mesh) => {
      mesh.visible = visible;
      mesh.layers.set(visible ? 0 : 1);
    });
  },
}));