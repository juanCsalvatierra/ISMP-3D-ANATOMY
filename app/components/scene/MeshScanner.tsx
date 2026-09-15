import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useMeshStore, MeshGroup } from "../../store/meshStore";
import { SYSTEMS, isSystemId, type CategoryRule } from "../../config/systems";

// Reglas de categorías por sistema (config/systems.ts). Sin reglas → "Otros".
function inferCategory(key: string, rules: CategoryRule[]): string {
  const lower = key.toLowerCase();
  for (const { category, keywords } of rules) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Otros";
}

// Escanea la escena y arma meshStore.groups a partir del userData que estampa
// AnatomyModel (jsonKey, jsonName, systemId). Cada grupo se llavea con
// `${systemId}:${jsonKey}` para no colisionar entre sistemas en la vista combinada.
export function MeshScanner() {
  const { scene } = useThree();
  const setGroups = useMeshStore((s) => s.setGroups);
  const scanVersion = useMeshStore((s) => s.scanVersion);

  useEffect(() => {
    if (!scene) return;

    type Acc = { meshes: THREE.Mesh[]; systemId: string; jsonKey: string; name: string };
    const map = new Map<string, Acc>();

    scene.traverse((obj: THREE.Object3D) => {
      if (!(obj instanceof THREE.Mesh)) return;

      const jsonKey = obj.userData?.jsonKey as string | undefined;
      if (!jsonKey) return;

      const systemId = (obj.userData?.systemId as string | undefined) ?? "unknown";
      const groupKey = `${systemId}:${jsonKey}`;

      let acc = map.get(groupKey);
      if (!acc) {
        acc = {
          meshes: [],
          systemId,
          jsonKey,
          name: (obj.userData?.jsonName as string | undefined) ?? jsonKey,
        };
        map.set(groupKey, acc);
      }
      acc.meshes.push(obj);
    });

    const groups: MeshGroup[] = Array.from(map.entries()).map(([key, acc]) => {
      const rules = isSystemId(acc.systemId) ? SYSTEMS[acc.systemId].categoryRules : [];
      return {
        key,
        name: acc.name,
        meshes: acc.meshes,
        system: acc.systemId,
        category: inferCategory(acc.jsonKey, rules),
      };
    });

    setGroups(groups);
  }, [scene, scanVersion, setGroups]);

  return null;
}
