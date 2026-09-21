import type { MeshGroup } from "../store/meshStore";

export type PresetFn = (groups: MeshGroup[]) => Record<string, boolean>;

// OCP: para agregar un preset nuevo, solo se agrega una entrada aquí.
// LayerSystemPanel.tsx no necesita modificarse.
// Las claves de los grupos son `${systemId}:${jsonKey}`, por eso los presets
// discriminan por `g.system` / `g.category`, no por el texto de la clave.
export const LAYER_PRESETS: Record<string, PresetFn> = {
  all: (groups) =>
    Object.fromEntries(groups.map((g) => [g.key, true])),

  bones: (groups) =>
    Object.fromEntries(
      groups.map((g) => [g.key, g.system === "skeleton" || g.system === "joints"]),
    ),

  "no-face": (groups) =>
    Object.fromEntries(
      groups.map((g) => [g.key, (g.category ?? "Otros") !== "Cara y cabeza"]),
    ),
};
