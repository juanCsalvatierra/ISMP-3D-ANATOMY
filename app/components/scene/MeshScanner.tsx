import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useMeshStore } from "../../store/meshStore";
import { JsonIndex } from "../../utils/indexBuilder";
import { findBestJsonMatch } from "../../utils/matcher";
import { normalize } from "../../utils/normalize";
import { AnatomyItem } from "../../store/anatomyStore";
import { MeshGroup } from "../../store/meshStore";
import { useViewerStore } from "../../store/viewerStore";
import type { CategoryRule } from "../../config/systems";

const EMPTY_RULES: CategoryRule[] = [];

// Las reglas de categorías salen del sistema activo (config/systems.ts).
// Sin reglas → todo cae en "Otros".
function inferCategory(key: string, rules: CategoryRule[]): string {
  const lower = key.toLowerCase();
  for (const { category, keywords } of rules) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Otros";
}

type Props = {
  json: Record<string, AnatomyItem>;
  index: JsonIndex;
}

export function MeshScanner({ json, index }: Props) {
  const { scene } = useThree();
  const setGroups = useMeshStore((s) => s.setGroups);
  const activeSystem = useViewerStore((s) => s.activeSystem);
  const categoryRules = activeSystem?.categoryRules ?? EMPTY_RULES;

  useEffect(() => {
    if (!scene) return;


    const map = new Map<string, THREE.Mesh[]>();

    scene.traverse((obj: THREE.Object3D) => {
      if (!(obj instanceof THREE.Mesh)) return;

      const key = obj.userData?.jsonKey;
      if (!key) return;

      const normalized = normalize(key);
      const matchKey = findBestJsonMatch(normalized, index);

      if (!matchKey) return;

      if (matchKey) {
        obj.userData.jsonKey = matchKey;
      }

      if (!map.has(matchKey)) {
        map.set(matchKey, []);
      }

      const grouped = map.get(matchKey);
      if (!grouped) return;
      grouped.push(obj);
    });

    const groups: MeshGroup[] = Array.from(map.entries()).map(([key, meshes]) => {
      const item = json[key];

      return {
        key,
        name: item?.name ?? key,
        meshes,
        category: inferCategory(key, categoryRules),
      };
    });

    setGroups(groups);
  }, [scene, index, json, setGroups, categoryRules]);

  return null;
}