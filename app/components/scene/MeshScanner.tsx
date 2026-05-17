import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import { useMeshStore } from "../../store/meshStore";
import { JsonIndex } from "../../utils/indexBuilder";
import { findBestJsonMatch } from "../../utils/matcher";
import { normalize } from "../../utils/normalize";
import { AnatomyItem } from "../../store/anatomyStore";
import { MeshGroup } from "../../store/meshStore";

const CATEGORY_KEYWORDS: { category: string; keywords: string[] }[] = [
  { category: "Cara y cabeza", keywords: ["frontalis", "temporoparietalis", "nasalis", "zygomaticus", "depressor_anguli", "depressor_labii", "procerus", "risorius", "mentalis", "levator_nasol", "platysma", "temporalis", "masseter"] },
  { category: "Cuello", keywords: ["sternocleidomastoid", "spinalis_capitis", "splenius_capitis"] },
  { category: "Espalda y hombro", keywords: ["trapezius", "latissimus_dorsi", "rhomboid", "levator_scapulae", "serratus", "deltoid", "infraspinatus"] },
  { category: "Tórax y abdomen", keywords: ["pectoralis", "diaphragm", "rectus_abdominis"] },
  { category: "Brazo", keywords: ["biceps_brachii", "triceps_brachii", "brachialis", "coracobrachialis", "pronator_teres", "brachioradialis"] },
  { category: "Antebrazo", keywords: ["flexor_carpi", "extensor_carpi", "palmaris", "flexor_digitorum_superficialis", "flexor_digitorum_profundus", "extensor_digitorum", "extensor_digiti", "flexor_pollicis_longus", "extensor_pollicis", "abductor_pollicis_longus", "extensor_indicis", "anconeus", "pronator_quadratus"] },
  { category: "Mano", keywords: ["flexor_pollicis_brevis", "adductor_pollicis", "abductor_pollicis_brevis", "opponens", "lumbrical", "interossei", "abductor_digiti_minimi_of_hand", "flexor_digiti_minimi_of_hand", "opponens_digiti_minimi_muscle_of_hand"] },
  { category: "Cadera y glúteo", keywords: ["iliacus", "psoas", "gluteus", "tensor_fasciae", "obturator", "gemellus", "piriformis"] },
  { category: "Muslo", keywords: ["rectus_femoris", "vastus", "sartorius", "adductor_magnus", "adductor_longus", "adductor_brevis", "pectineus", "gracilis", "biceps_femoris", "semimembranosus", "semitendinosus"] },
  { category: "Pierna", keywords: ["gastrocnemius", "soleus", "plantaris", "tibialis", "fibularis", "popliteus", "flexor_hallucis_longus", "flexor_digitorum_longus", "extensor_digitorum_longus", "extensor_hallucis_longus"] },
  { category: "Pie", keywords: ["abductor_hallucis", "extensor_digitorum_brevis", "extensor_hallucis_brevis", "flexor_digitorum_brevis"] },
];

function inferCategory(key: string): string {
  const lower = key.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
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
        category: inferCategory(key),
      };
    });

    setGroups(groups);
  }, [scene, index, json, setGroups]);

  return null;
}