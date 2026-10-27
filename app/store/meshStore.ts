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

  /**
   * Visibilidad decidida por grupo (key → visible). Una clave ausente = nunca
   * se decidió = visible. Vive acá (y no en el estado local de los paneles)
   * para que sobreviva al cambio de pestaña y se reaplique si un sistema se
   * vuelve a montar.
   */
  visibility: Record<string, boolean>;
  toggleGroup: (key: string, visible: boolean) => void;
  /** Aplica varias decisiones de visibilidad de una vez. */
  setVisibility: (changes: Record<string, boolean>) => void;
  /** Olvida todas las decisiones (al salir de un visor o cambiar de unidad). */
  resetVisibility: () => void;
};

// LSP: no se parchea mesh.raycast porque rompe el contrato de THREE.Mesh.
// mesh.visible = false ya excluye el objeto del raycaster internamente.
// mesh.layers mueve el objeto a una capa ignorada por el raycaster de la escena
// (que debe configurarse con raycaster.layers.set(0)).
// userData.forceHidden lo respeta HighlightSystem para no volver a mostrarlo
// en su loop de useFrame.
function applyToMeshes(group: MeshGroup, visible: boolean) {
  group.meshes.forEach((mesh: THREE.Mesh) => {
    mesh.visible = visible;
    mesh.userData.forceHidden = !visible;
    mesh.layers.set(visible ? 0 : 1);
  });
}

export const useMeshStore = create<State>((set: (partial: Partial<State>) => void, get: () => State) => ({
  groups: [],

  // Al re-escanear (p. ej. se montó otro sistema) hay meshes nuevos: se les
  // reaplica lo que ya se había decidido ocultar.
  setGroups: (groups: MeshGroup[]) => {
    set({ groups });
    const { visibility } = get();
    groups.forEach((g) => {
      if (visibility[g.key] === false) applyToMeshes(g, false);
    });
  },

  scanVersion: 0,
  bumpScanVersion: () => set({ scanVersion: get().scanVersion + 1 }),

  visibility: {},

  toggleGroup: (key: string, visible: boolean) => {
    const group = get().groups.find((g) => g.key === key);
    if (!group) return;
    applyToMeshes(group, visible);
    set({ visibility: { ...get().visibility, [key]: visible } });
  },

  setVisibility: (changes: Record<string, boolean>) => {
    const byKey = new Map(get().groups.map((g) => [g.key, g]));
    for (const [key, visible] of Object.entries(changes)) {
      const group = byKey.get(key);
      if (group) applyToMeshes(group, visible);
    }
    set({ visibility: { ...get().visibility, ...changes } });
  },

  resetVisibility: () => {
    const { groups, visibility } = get();
    groups.forEach((g) => {
      if (visibility[g.key] === false) applyToMeshes(g, true);
    });
    set({ visibility: {} });
  },
}));
