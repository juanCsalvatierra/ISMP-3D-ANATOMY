"use client";
import { ThreeEvent, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import { useEffect } from "react";
import * as THREE from "three";

import { normalize } from "../../utils/normalize";
import { findBestJsonMatch } from "../../utils/matcher";
import { JsonIndex } from "../../utils/indexBuilder";
import { AnatomyItem } from "../../store/anatomyStore";
import { useCameraStore } from "../../store/cameraStore";
import type { AnatomySystem } from "../../config/systems";
import { SYSTEM_MATERIALS } from "../../config/systemMaterials";

type Props = {
  system: AnatomySystem;
  json: Record<string, AnatomyItem>;
  index: JsonIndex;
  onSelect?: (item: AnatomyItem, uuid?: string) => void;
};

// Visor 3D genérico. Antes eran Skeleton.tsx y Muscles.tsx, ~95% idénticos:
// lo único específico de cada sistema (ruta del .glb y material) sale de `system`.
const AnatomyModel = ({ system, json, index, onSelect }: Props) => {
  const gltf = useLoader(GLTFLoader, system.glb);
  const setFocus = useCameraStore((s) => s.setFocus);
  const applyMaterial = SYSTEM_MATERIALS[system.id];

  useEffect(() => {
    gltf.scene.traverse((child: THREE.Object3D) => {
      if (!(child instanceof THREE.Mesh)) return;

      let name = child.name;
      if (/^Mesh_\d+$/.test(name) && child.parent) {
        name = child.parent.name;
      }

      applyMaterial(child, name);

      // Match con el JSON de anatomía.
      const matchKey = findBestJsonMatch(normalize(name), index);
      if (matchKey) {
        child.userData.jsonKey = matchKey;
      }
    });
  }, [gltf, json, index, applyMaterial]);

  return (
    <primitive
      object={gltf.scene}
      position={[0, 0, 0]}
      scale={2}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const mesh = e.object as THREE.Mesh;
        const key = mesh.userData.jsonKey;

        if (!key) {
          console.log("Sin data:", mesh.name);
          return;
        }
        const item = json[key];

        const meshWorldPos = new THREE.Vector3();
        mesh.getWorldPosition(meshWorldPos);

        const modelCenter = new THREE.Vector3(0, meshWorldPos.y, 0);
        const dir = meshWorldPos.clone().sub(modelCenter).normalize();
        if (dir.lengthSq() < 0.001) dir.set(0, 0, 1);
        const camPos = meshWorldPos.clone().add(dir.multiplyScalar(0.8));
        setFocus(meshWorldPos, camPos);

        if (onSelect) onSelect(item, mesh.uuid);
      }}
    />
  );
};

export default AnatomyModel;
