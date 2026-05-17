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

    group.meshes.forEach((mesh: THREE.Mesh) => {
      mesh.visible = visible;
      if (!visible) {
        mesh.raycast = () => null; // 🔥 clave
      } else {
        mesh.raycast = THREE.Mesh.prototype.raycast;
      }
    });
  },
}));