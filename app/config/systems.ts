// Registro central de los sistemas de modelos 3D.
//
// Agregar un sistema nuevo = agregar una entrada acá + su .glb en public/models/
// + (opcional) su función de material en config/systemMaterials.ts.
// La ruta dinámica app/modelos/[system], la galería, la nav y el panel de capas
// leen todo desde este archivo — no hay nada hardcodeado por sistema fuera de acá.
//
// IMPORTANTE: este módulo no importa THREE ni los JSON de datos, así que es seguro
// importarlo desde la nav / la galería sin arrastrar el bundle 3D.

import type { CarreraId } from "../domain/academic";

export type SystemId = "skeleton" | "muscles" | "joints" | "organs" | "nervous" | "cardiovascular" | "lymphatic";

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
  /** Color representativo del sistema (chip en la galería y el panel combinado). */
  swatch: string;
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
  /**
   * Carreras a las que este sistema le es relevante. La galería /modelos filtra
   * por la(s) carrera(s) del alumno logueado; admin/docente/anónimo ven todo.
   */
  carreras: CarreraId[];
};

const TODAS_LAS_CARRERAS: CarreraId[] = ["carrera-rad", "carrera-iq", "carrera-hem"];

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

const NERVOUS_CATEGORY_RULES: CategoryRule[] = [
  { category: "Encéfalo", keywords: ["cerebr", "gyrus", "sulcus", "hippocamp", "amygdal", "thalamus", "corpus_callosum", "basal_forebrain", "insula", "cingulate", "choroid_plexus", "cerebell", "midbrain", "pons", "medulla_oblongata", "brainstem", "ventricle_of_brain", "epithalamus", "fornix", "putamen", "caudate_nucleus", "colliculus", "tegmentum", "olfactory_bulb", "olfactory_nucleus", "optic_chiasm", "pineal_gland", "septum_pellucidum", "internal_capsule", "basal_ganglia", "brain"] },
  { category: "Médula espinal", keywords: ["spinal_cord", "root_of_spinal_nerve", "ramus_of_spinal_nerve", "rami_of_spinal_nerve", "corticospinal_tract", "spinothalamic_tract", "rubrospinal_tract", "vestibulospinal_tract", "tectospinal_tract", "reticulospinal_tract", "spinotectal_tract", "nucleus_proprius", "cauda_equina", "conus_medullaris", "filum_terminale"] },
  { category: "Meninges y espacios", keywords: ["dura_mater", "arachnoid_mater", "pia_mater", "falx_cerebri", "falx_cerebelli", "tentorium_cerebelli", "dural_venous_sinus", "cistern_of", "cranial_dura", "cranial_pia", "spinal_dura", "epidural_space", "subarachnoid"] },
  { category: "Nervios craneales", keywords: ["olfactory_nerve", "optic_nerve", "oculomotor_nerve", "trochlear_nerve", "trigeminal_nerve", "abducens_nerve", "facial_nerve", "vestibulocochlear_nerve", "cochlear_nerve", "vestibular_nerve", "glossopharyngeal_nerve", "vagus_nerve", "accessory_nerve", "hypoglossal_nerve", "cranial_nerve", "mandibular_nerve", "maxillary_nerve", "ophthalmic_nerve", "lingual_nerve", "buccal_nerve", "auriculotemporal_nerve", "infraorbital_nerve", "lacrimal_nerve", "frontal_nerve", "alveolar_nerve", "palatine_nerve", "chorda_tympani", "nasociliary_nerve", "zygomatic_nerve", "supraorbital_nerve", "supratrochlear_nerve", "petrosal_nerve"] },
  { category: "Plexos y ganglios autónomos", keywords: ["ganglion", "celiac_plexus", "cardiac_plexus", "esophageal_plexus", "gastric_plexus", "hepatic_plexus", "mesenteric_plexus", "hypogastric_plexus", "aortic_plexus", "carotid_plexus", "renal_plexus", "splenic_plexus", "pulmonary_plexus", "pelvic_plexus", "vesical_plexus", "prostatic_plexus", "uterovaginal_plexus", "tympanic_plexus", "pharyngeal_plexus", "cavernous_nerve", "splanchnic_nerve", "sympathetic_trunk", "vagal_trunk", "autonomic"] },
  { category: "Nervios periféricos", keywords: ["nerve", "plexus", "rami", "ramus"] },
];

const NERVOUS_CATEGORY_ORDER = [
  "Encéfalo",
  "Médula espinal",
  "Meninges y espacios",
  "Nervios craneales",
  "Plexos y ganglios autónomos",
  "Nervios periféricos",
  "Otros",
];

const CARDIOVASCULAR_CATEGORY_RULES: CategoryRule[] = [
  { category: "Corazón", keywords: ["of_heart", "atrium", "ventricle", "atrioventricular", "aortic_valve", "mitral_valve", "tricuspid_valve", "pulmonary_valve", "papillary_muscle", "chordae_tendineae", "pericardi", "myocardi", "coronary_sinus", "coronary_artery", "coronary_vein", "sinoatrial", "purkinje", "interventricular_septum", "interatrial_septum", "cardiac"] },
  { category: "Circulación pulmonar", keywords: ["pulmonary_artery", "pulmonary_vein", "pulmonary_trunk", "ductus_arteriosus"] },
  { category: "Arterias", keywords: ["artery", "arteries", "aorta", "arterial"] },
  { category: "Venas", keywords: ["vein", "veins", "vena_cava", "venous"] },
];

const CARDIOVASCULAR_CATEGORY_ORDER = [
  "Corazón",
  "Circulación pulmonar",
  "Arterias",
  "Venas",
  "Otros",
];

const LYMPHATIC_CATEGORY_RULES: CategoryRule[] = [
  { category: "Cabeza y cuello", keywords: ["occipital", "mastoid", "submental", "submandibular", "parotid", "bucinator", "nasolabial", "mandibular", "jugulodigastric", "jugulo_omohyoid", "malar", "lingual", "retropharyngeal", "pretracheal", "paratracheal_cervical", "thyroid_nodes", "tonsil", "facial_nodes", "pharyngeal", "supratonsillar", "prelaryngeal", "lymph_nodes_of_head", "lymph_nodes_of_neck", "auricular"] },
  { category: "Tórax", keywords: ["mediastinal", "tracheobronchial", "traqueobronchial", "parasternal", "intercostal", "diaphragmatic", "pericardial", "prepericardial", "azygos", "ligamentum_arteriosum", "brachiocephalic", "thymus", "intrapulmonary", "pulmonary_nodes", "oesophageal", "paratracheal_thoracic", "thoracic_lymph_nodes", "prevertebral"] },
  { category: "Axila y miembro superior", keywords: ["axillary", "brachial", "cubital", "supratrochlear", "infraclavicular", "interpectoral", "deltopectoral"] },
  { category: "Abdomen y vísceras", keywords: ["coeliac", "gastric", "gastro_omental", "pancreat", "splenic", "spleen", "hepatic", "cystic", "mesenteric", "ileocolic", "colic", "sigmoid", "caecal", "appendicular", "pyloric", "lumbar_nodes", "intermediate_lumbar", "aortic_nodes", "periaortic", "inferior_epigastric", "visceral_abdominal", "omental_foramen", "abdominal_lymph"] },
  { category: "Pelvis", keywords: ["iliac", "sacral", "obturator", "gluteal", "vesical", "pararectal", "lacunar", "pelvic_lymph", "visceral_pelvic", "interiliac", "subaortic"] },
  { category: "Ingle y miembro inferior", keywords: ["inguinal", "popliteal", "tibial_node", "fibular_node"] },
];

const LYMPHATIC_CATEGORY_ORDER = [
  "Cabeza y cuello",
  "Tórax",
  "Axila y miembro superior",
  "Abdomen y vísceras",
  "Pelvis",
  "Ingle y miembro inferior",
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
    swatch: "#F1E1B0",
    weightMB: 10,
    status: "ready",
    categoryRules: [],
    categoryOrder: ["Otros"],
    carreras: TODAS_LAS_CARRERAS,
  },
  muscles: {
    id: "muscles",
    label: "Músculos",
    shortLabel: "Músculos",
    tagline: "Sistema muscular y fascias",
    glb: "/models/muscles.glb",
    dataset: "builded",
    count: "650+ estructuras",
    swatch: "#B84A3A",
    weightMB: 10,
    status: "ready",
    categoryRules: MUSCLE_CATEGORY_RULES,
    categoryOrder: MUSCLE_CATEGORY_ORDER,
    carreras: ["carrera-rad", "carrera-iq"],
  },
  joints: {
    id: "joints",
    label: "Articulaciones y ligamentos",
    shortLabel: "Articulaciones",
    tagline: "Cápsulas articulares, ligamentos y cartílago articular",
    glb: "/models/joints.glb",
    dataset: "builded",
    count: "~300 estructuras",
    swatch: "#EDE6D6",
    weightMB: 7,
    status: "ready",
    categoryRules: [],
    categoryOrder: ["Otros"],
    carreras: ["carrera-rad", "carrera-iq"],
  },
  organs: {
    id: "organs",
    label: "Vísceras y órganos internos",
    shortLabel: "Vísceras",
    tagline: "Sistemas digestivo, respiratorio, urinario y endócrino",
    glb: "/models/organs.glb",
    dataset: "builded",
    count: "~200 estructuras",
    swatch: "#C67D6A",
    weightMB: 12,
    status: "ready",
    categoryRules: [],
    categoryOrder: ["Otros"],
    carreras: TODAS_LAS_CARRERAS,
  },
  nervous: {
    id: "nervous",
    label: "Sistema nervioso",
    shortLabel: "Nervioso",
    tagline: "Encéfalo, médula espinal, nervios y plexos",
    glb: "/models/nervous.glb",
    dataset: "builded",
    count: "~580 estructuras",
    swatch: "#D9B44A",
    weightMB: 22,
    status: "ready",
    categoryRules: NERVOUS_CATEGORY_RULES,
    categoryOrder: NERVOUS_CATEGORY_ORDER,
    carreras: TODAS_LAS_CARRERAS,
  },
  cardiovascular: {
    id: "cardiovascular",
    label: "Sistema cardiovascular",
    shortLabel: "Cardiovascular",
    tagline: "Corazón, arterias y venas de todo el cuerpo",
    glb: "/models/cardiovascular.glb",
    dataset: "builded",
    count: "~670 estructuras",
    swatch: "#B5453E",
    weightMB: 35,
    status: "ready",
    categoryRules: CARDIOVASCULAR_CATEGORY_RULES,
    categoryOrder: CARDIOVASCULAR_CATEGORY_ORDER,
    carreras: TODAS_LAS_CARRERAS,
  },
  lymphatic: {
    id: "lymphatic",
    label: "Sistema linfático",
    shortLabel: "Linfático",
    tagline: "Ganglios linfáticos, bazo y timo",
    glb: "/models/lymph.glb",
    dataset: "builded",
    count: "~110 estructuras",
    swatch: "#8FAE6B",
    weightMB: 2.3,
    status: "ready",
    categoryRules: LYMPHATIC_CATEGORY_RULES,
    categoryOrder: LYMPHATIC_CATEGORY_ORDER,
    carreras: TODAS_LAS_CARRERAS,
  },
};

/** Orden de aparición en nav / galería. */
export const SYSTEM_ORDER: SystemId[] = ["skeleton", "muscles", "joints", "organs", "nervous", "cardiovascular", "lymphatic"];

export const SYSTEM_LIST: AnatomySystem[] = SYSTEM_ORDER.map((id) => SYSTEMS[id]);

export const READY_SYSTEMS: AnatomySystem[] = SYSTEM_LIST.filter(
  (s) => s.status === "ready",
);

export function isSystemId(value: string): value is SystemId {
  return value in SYSTEMS;
}

/**
 * Filtra los sistemas listos por las carreras del alumno.
 * Sin carreras (admin, docente, anónimo) → devuelve todos.
 */
export function systemsForCarreras(
  carreraIds: string[] | null | undefined,
): AnatomySystem[] {
  if (!carreraIds || carreraIds.length === 0) return READY_SYSTEMS;
  return READY_SYSTEMS.filter((s) =>
    s.carreras.some((c) => carreraIds.includes(c)),
  );
}

export function getSystem(id: string): AnatomySystem | undefined {
  return isSystemId(id) ? SYSTEMS[id] : undefined;
}
