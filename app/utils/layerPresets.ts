import type { MeshGroup } from "../store/meshStore";

export type PresetFn = (groups: MeshGroup[]) => Record<string, boolean>;

// OCP: para agregar un preset nuevo, solo se agrega una entrada aquí.
// LayerSystemPanel.tsx no necesita modificarse.
export const LAYER_PRESETS: Record<string, PresetFn> = {
  all: (groups) =>
    Object.fromEntries(groups.map((g) => [g.key, true])),

  bones: (groups) =>
    Object.fromEntries(
      groups.map((g) => [
        g.key,
        !g.key.toLowerCase().includes("muscle") &&
          !g.key.toLowerCase().includes("organ"),
      ])
    ),

  "no-face": (groups) =>
    Object.fromEntries(
      groups.map((g) => [g.key, (g.category ?? "Otros") !== "Cara y cabeza"])
    ),
};
