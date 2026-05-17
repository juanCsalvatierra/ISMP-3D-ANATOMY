"use client";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnatomyStore } from "../../store/anatomyStore";
import * as THREE from "three";

export function HighlightSystem() {

  // Guarda toda la escena para poder recorrerla y modificar los materiales de los objetos
  const { scene } = useThree();
  // Guarda el uuid del objeto al que se le hace hover
  const hovered = useAnatomyStore((s) => s.hovered);
  const selectedUuid = useAnatomyStore((s) => s.selectedUuid);
  const isolated = useAnatomyStore((s) => s.isolated);

  useFrame(() => {
    if (!scene) return;

    // Recorre toda la escena para acceder a los objetos
    scene.traverse((obj: THREE.Object3D) => {
      if (!(obj instanceof THREE.Mesh)) return;
      const mesh = obj;

      if (isolated) {
        mesh.visible = mesh.uuid === isolated;
      } else {
        mesh.visible = true;
      }

      // Si materials no es un array lo convierte en uno
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((mat) => {
        // Verificar tipo correcto
        if (mat instanceof THREE.MeshStandardMaterial) {
          if (mesh.uuid === hovered) {
            // Si el uuid del mesh coincide con el hovered, se resalta el objeto
            mat.emissive.set("#ff9900");
            mat.emissiveIntensity = 0.8;
          } else if (mesh.uuid === selectedUuid) {
            mat.emissive.set("#00aaff");
            mat.emissiveIntensity = 0.45;
          } else {
            // Si no coincide, se asegura de que el objeto no esté resaltado
            mat.emissive.set("#000000");
            mat.emissiveIntensity = 0;
          }
        }
      });
    });
  });

  return null;
}