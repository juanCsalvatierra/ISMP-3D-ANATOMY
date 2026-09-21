import { create } from "zustand";
import * as THREE from "three";

// Tipado de los grupos de meshes
export type MeshGroup = {
  key: string;
  name: string;
  meshes: THREE.Mesh[];
  category?: string;
  /** Sistema al que pertenece el grupo (para la vista combinada). */
  system?: string;
};

// Tipado del estado global de visibilidad de meshes
type State = {
  groups: MeshGroup[];
  setGroups: (groups: MeshGroup[]) => void;

  /**
   * Contador que se incrementa cada vez que un modelo termina de estampar
   * userData en sus meshes (o se desmonta). MeshScanner lo observa para
   * re-escanear la escena — necesario porque los GLB cargan async y, en la
   * vista combinada, los sistemas se montan/desmontan en distintos momentos.
   */
  scanVersion: number;
  bumpScanVersion: () => void;

  toggleGroup: (key: string, visible: boolean) => void;
};

export const useMeshStore = create<State>((set: (partial: Partial<State>) => void, get: () => State) => ({
  groups: [],

  setGroups: (groups: MeshGroup[]) => set({ groups }),

  scanVersion: 0,
  bumpScanVersion: () => set({ scanVersion: get().scanVersion + 1 }),

  toggleGroup: (key: string, visible: boolean) => {
    const group = get().groups.find((g) => g.key === key);
    if (!group) return;

    // LSP: no se parchea mesh.raycast porque rompe el contrato de THREE.Mesh.
    // mesh.visible = false ya excluye el objeto del raycaster internamente.
    // mesh.layers mueve el objeto a una capa ignorada por el raycaster de la escena
    // (que debe configurarse con raycaster.layers.set(0)).
    // userData.forceHidden lo respeta HighlightSystem para no volver a mostrarlo
    // en su loop de useFrame.
    group.meshes.forEach((mesh: THREE.Mesh) => {
      mesh.visible = visible;
      mesh.userData.forceHidden = !visible;
      mesh.layers.set(visible ? 0 : 1);
    });
  },
}));
