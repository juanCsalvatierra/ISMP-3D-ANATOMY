import { ReactNode } from "react";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { AnatomyItem, useAnatomyStore } from "../../store/anatomyStore";
import { useCameraStore } from "../../store/cameraStore";

type Props = {
  children: ReactNode;
  json: Record<string, AnatomyItem>;
};

export function InteractiveScene({ children, json }: Props) {
  const setHovered = useAnatomyStore((s) => s.setHovered);
  const setSelected = useAnatomyStore((s) => s.setSelected);
  const isolated = useAnatomyStore((s) => s.isolated);
  const setIsolated = useAnatomyStore((s) => s.setIsolated);
  const setFocus = useCameraStore((s) => s.setFocus);

  return (
    // group sirve para agrupar multiples objetos
    // Permite aplicar transformaciones o capturar eventos de todos los hijos
    <group
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!e.object.userData.jsonKey) return;
        setHovered(e.object.uuid);
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(null);
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const key = e.object.userData.jsonKey;
        if (!key) return;
        setSelected(json[key], e.object.uuid);

        const meshWorldPos = new THREE.Vector3();
        e.object.getWorldPosition(meshWorldPos);

        const offset = new THREE.Vector3(0, 0, 1.5);
        const camPos = meshWorldPos.clone().add(offset);
        setFocus(meshWorldPos, camPos);
      }}
      onDoubleClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        const uuid = e.object.uuid;
        setIsolated(isolated === uuid ? null : uuid);
      }}
    >
      {children}
    </group>
  );
}