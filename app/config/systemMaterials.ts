// Materiales específicos por sistema. Se separan de systems.ts para no arrastrar
// THREE al bundle de la nav / galería — solo AnatomyModel importa este módulo.
//
// applyMaterial(child, resolvedName):
//   - child        = el THREE.Mesh crudo (child.name puede ser "Mesh_12")
//   - resolvedName = nombre ya resuelto al padre cuando child.name es "Mesh_\d+"

import * as THREE from "three";
import type { SystemId } from "./systems";

export type ApplyMaterial = (child: THREE.Mesh, resolvedName: string) => void;

const skeletonMaterial: ApplyMaterial = (child, resolvedName) => {
  // Cartílagos: gris azulado.
  if (resolvedName.toLowerCase().includes("cartilage")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#D9E1E8",
      roughness: 0.38,
      metalness: 0,
    });
    return;
  }

  // Hueso: beige.
  child.material = new THREE.MeshStandardMaterial({
    color: "#F1E1B0",
    roughness: 0.5,
    metalness: 0,
  });
};

const musclesMaterial: ApplyMaterial = (child) => {
  const lowerCaseName = child.name.toLowerCase();

  // Fascia: translúcida, no escribe profundidad para no tapar el músculo.
  if (lowerCaseName.includes("fascia")) {
    (child.material as THREE.Material)?.dispose?.();
    child.material = new THREE.MeshStandardMaterial({
      color: "#DCD6C8",
      transparent: true,
      opacity: 0.18,
      roughness: 0.9,
      metalness: 0,
      depthWrite: false,
    });
    child.renderOrder = 1;
    return;
  }

  // Músculo: rojo.
  child.material = new THREE.MeshStandardMaterial({
    color: "#B84A3A",
    roughness: 0.7,
    metalness: 0,
  });
};

export const SYSTEM_MATERIALS: Record<SystemId, ApplyMaterial> = {
  skeleton: skeletonMaterial,
  muscles: musclesMaterial,
};
