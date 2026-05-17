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

type Props = {
  json: Record<string, AnatomyItem>;
  index: JsonIndex;
  onSelect?: (item: AnatomyItem, uuid?: string) => void;
};

const Skeleton = ({ json, index, onSelect }: Props) => {
  const skeleton = useLoader(GLTFLoader, "/models/skeleton.glb");
  const setFocus = useCameraStore((s) => s.setFocus);


  useEffect(() => {
    skeleton.scene.traverse((child: THREE.Object3D) => {
      if (!(child instanceof THREE.Mesh)) return;



      // Material de los huesos
      child.material = new THREE.MeshStandardMaterial({
        color: "#F1E1B0",
        roughness: 0.5,
        metalness: 0,
      });

      let name = child.name;

      if (/^Mesh_\d+$/.test(name) && child.parent) {
        name = child.parent.name;
      }

      // Material de las cartilagos
      if (name.toLowerCase().includes("cartilage")) {
        child.material = new THREE.MeshStandardMaterial({
          color: "#D9E1E8",
          roughness: 0.38,
          metalness: 0,
        });
      }

      // Match con el JSON
      const normalized = normalize(name);

      const matchKey = findBestJsonMatch(normalized, index);

      if (matchKey) {
        child.userData.jsonKey = matchKey;
      } else {
        // console.log("No match:", name);
      }

    });
  }, [skeleton, json, index]);

  return (
    <primitive
      object={skeleton.scene}
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
        console.log("Seleccionado:", item);

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

export default Skeleton;