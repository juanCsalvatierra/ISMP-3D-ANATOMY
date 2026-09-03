// Registro central de los sistemas de modelos 3D.
//
// Agregar un sistema nuevo = agregar una entrada acá + su .glb en public/models/
// + (opcional) su función de material en config/systemMaterials.ts.
// La ruta dinámica app/modelos/[system], la galería, la nav y el panel de capas
// leen todo desde este archivo — no hay nada hardcodeado por sistema fuera de acá.
//
// IMPORTANTE: este módulo no importa THREE ni los JSON de datos, así que es seguro
// importarlo desde la nav / la galería sin arrastrar el bundle 3D.

export type SystemId = "skeleton" | "muscles";

export type DatasetId = "skeleton" | "builded";

export type CategoryRule = { category: string; keywords: string[] };

export type AnatomySystem = {
  id: SystemId;
  /** Título largo — breadcrumb y cabecera del visor. */
  label: string;
  /** Etiqueta corta — nav y dropdown. */
  shortLabel: string;
  /** Bajada para la tarjeta de la galería. */
  tagline: string;
  /** Ruta del .glb dentro de public/. */
  glb: string;
  /** Qué JSON de anatomía usa este sistema (lo resuelve la ruta). */
  dataset: DatasetId;
  /** Texto libre para la tarjeta ("206 estructuras"). */
  count: string;
  /** Peso aproximado del .glb en MB — para decidir si necesita compresión. */
  weightMB: number;
  /**
   * "ready"  → visible en nav y galería.
   * "beta"   → oculto (glb pesado sin comprimir, categorías sin curar, etc.).
   */
  status: "ready" | "beta";
  /**
   * Reglas de categorización de meshes para el panel de Capas.
   * Vacío = todas las estructuras caen en "Otros".
   */
  categoryRules: CategoryRule[];
  /**
   * Orden de las categorías en el panel. Las categorías presentes que no estén
   * acá se muestran igual, al final.
   */
  categoryOrder: string[];
};

const MUSCLE_CATEGORY_RULES: CategoryRule[] = [
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

const MUSCLE_CATEGORY_ORDER = [
  "Cara y cabeza",
  "Cuello",
  "Espalda y hombro",
  "Tórax y abdomen",
  "Brazo",
  "Antebrazo",
  "Mano",
  "Cadera y glúteo",
  "Muslo",
  "Pierna",
  "Pie",
  "Otros",
];

export const SYSTEMS: Record<SystemId, AnatomySystem> = {
  skeleton: {
    id: "skeleton",
    label: "Esqueleto y cartílagos",
    shortLabel: "Esqueleto",
    tagline: "Huesos y cartílagos del cuerpo humano",
    glb: "/models/skeleton.glb",
    dataset: "skeleton",
    count: "206 estructuras",
    weightMB: 10,
    status: "ready",
    categoryRules: [],
    categoryOrder: ["Otros"],
  },
  muscles: {
    id: "muscles",
    label: "Músculos",
    shortLabel: "Músculos",
    tagline: "Sistema muscular y fascias",
    glb: "/models/muscles.glb",
    dataset: "builded",
    count: "650+ estructuras",
    weightMB: 10,
    status: "ready",
    categoryRules: MUSCLE_CATEGORY_RULES,
    categoryOrder: MUSCLE_CATEGORY_ORDER,
  },
};

/** Orden de aparición en nav / galería. */
export const SYSTEM_ORDER: SystemId[] = ["skeleton", "muscles"];

export const SYSTEM_LIST: AnatomySystem[] = SYSTEM_ORDER.map((id) => SYSTEMS[id]);

export const READY_SYSTEMS: AnatomySystem[] = SYSTEM_LIST.filter(
  (s) => s.status === "ready",
);

export function isSystemId(value: string): value is SystemId {
  return value in SYSTEMS;
}

export function getSystem(id: string): AnatomySystem | undefined {
  return isSystemId(id) ? SYSTEMS[id] : undefined;
}
