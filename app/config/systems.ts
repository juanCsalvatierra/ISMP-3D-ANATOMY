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

export type SystemId = "skeleton" | "muscles" | "joints" | "organs" | "female" | "nervous" | "cardiovascular" | "lymphatic" | "skin";

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

const TODAS_LAS_CARRERAS: CarreraId[] = ["carrera-rad", "carrera-iq", "carrera-hem", "carrera-lab"];

// El orden de este array es el de evaluación (gana la primera regla que
// matchea): lo más específico va antes (ojo, laringe, pie, pierna, muslo…)
// para que los tokens genéricos de abajo (extensor_digitorum, biceps…) no
// les roben estructuras. El orden de visualización está en MUSCLE_CATEGORY_ORDER.
const MUSCLE_CATEGORY_RULES: CategoryRule[] = [
  { category: "Ojo y órbita", keywords: ["inferior_rectus_muscle", "lateral_rectus_muscle", "medial_rectus_muscle", "superior_rectus_muscle", "superior_oblique_muscle", "inferior_oblique_muscle", "trochlea_of_superior_oblique", "common_tendinous_ring"] },
  { category: "Cara y cabeza", keywords: ["frontalis", "temporoparietalis", "nasalis", "zygomaticus", "depressor_anguli", "depressor_labii", "procerus", "risorius", "mentalis", "levator_nasol", "platysma", "temporalis", "masseter", "orbicularis", "levator_anguli", "levator_labii", "bucinator", "corrugator", "depressor_septi", "occipitalis", "epicranial", "pterygoid", "tarsus_eyelid", "temporal_fascia", "levator_palpebrae"] },
  { category: "Laringe y faringe", keywords: ["pharyngeal_constrictor", "palatopharyngeus", "stylopharyngeus", "arytenoid", "aryenoid", "cricothyroid", "thyro_epiglottic", "ary_epiglottic"] },
  { category: "Cuello", keywords: ["sternocleidomastoid", "spinalis_capitis", "splenius", "digastric", "hyoid", "hyoglossus", "genioglossus", "sternothyroid", "longus_capitis", "longus_colli", "longissimus_capitis", "longissimus_colli", "scalene", "semispinalis_colli", "spinalis_colli", "interpinales_colli", "obliquus_inferior_capitis", "obliquus_superior_capitis", "rectus_posterior", "superficial_investing_cervical_fascia"] },
  { category: "Pie", keywords: ["abductor_hallucis", "extensor_digitorum_brevis", "extensor_hallucis_brevis", "flexor_digitorum_brevis", "of_foot", "hallucis_brevis", "adductor_hallucis", "quadratus_plantae", "plantar_aponeurosis", "plantar_interossei", "retinaculum_of_ankle", "fibular_retinaculum", "metatarsal_ligament"] },
  { category: "Pierna", keywords: ["gastrocnemius", "soleus", "plantaris", "tibialis", "fibularis", "popliteus", "flexor_hallucis_longus", "flexor_digitorum_longus", "extensor_digitorum_longus", "extensor_hallucis_longus", "crural_fascia", "calcaneal_tendon", "popliteal_fascia", "intermuscular_septum_of_leg"] },
  { category: "Muslo", keywords: ["rectus_femoris", "vastus", "sartorius", "adductor_magnus", "adductor_longus", "adductor_brevis", "pectineus", "gracilis", "biceps_femoris", "semimembranosus", "semitendinosus", "quadriceps_femoris", "fascia_lata", "iliotibial", "adductor_minimus", "patellar_retinaculum", "prepatellar_bursa", "anserine_bursa", "iliopectineal_bursa"] },
  { category: "Cadera y glúteo", keywords: ["iliacus", "psoas", "gluteus", "tensor_fasciae", "obturator", "gemellus", "gemelli", "piriformis", "quadratus_femoris"] },
  { category: "Suelo pélvico y periné", keywords: ["coccygeus", "levator_ani", "pubo_analis", "pubococcygeus", "iliococcygeus", "anal_sphincter"] },
  { category: "Mano", keywords: ["flexor_pollicis_brevis", "adductor_pollicis", "abductor_pollicis_brevis", "opponens", "lumbrical", "interossei", "abductor_digiti_minimi_of_hand", "flexor_digiti_minimi_of_hand", "opponens_digiti_minimi_muscle_of_hand", "of_hand", "palmar_aponeurosis", "retinaculum_of_wrist", "transverse_metacarpal"] },
  { category: "Antebrazo", keywords: ["flexor_carpi", "extensor_carpi", "palmaris", "flexor_digitorum_superficialis", "flexor_digitorum_profundus", "extensor_digitorum", "extensor_digiti", "flexor_pollicis_longus", "extensor_pollicis", "abductor_pollicis_longus", "extensor_indicis", "anconeus", "pronator_quadratus", "pronator_teres", "brachioradialis", "supinator", "antebrachial_fascia", "common_flexor_tendon"] },
  { category: "Brazo", keywords: ["biceps_brachii", "triceps_brachii", "brachialis", "coracobrachialis", "biceps", "triceps", "brachial_fascia", "intermuscular_septum_of_arm", "lateral_intermuscular_septum"] },
  { category: "Espalda y hombro", keywords: ["trapezius", "latissimus_dorsi", "rhomboid", "levator_scapulae", "serratus", "deltoid", "infraspinatus", "supraspinatus", "subscapularis", "teres_major", "teres_minor", "iliocostalis", "longissimus", "spinalis", "multifidus", "rotatores", "semispinalis", "interspinales", "intertransversarii", "levatores", "quadratus_lumborum", "thoracolumbar"] },
  { category: "Tórax y abdomen", keywords: ["pectoralis", "diaphragm", "rectus_abdominis", "intercostal", "transversus_thoracis", "subclavius", "pectoral_fascia", "clavipectoral", "abdominal_oblique", "transversus_abdominis", "pyramidalis", "linea_alba", "transversalis", "investing_abdominal_fascia", "inguinal_ligament"] },
];

const MUSCLE_CATEGORY_ORDER = [
  "Ojo y órbita",
  "Cara y cabeza",
  "Laringe y faringe",
  "Cuello",
  "Espalda y hombro",
  "Tórax y abdomen",
  "Brazo",
  "Antebrazo",
  "Mano",
  "Suelo pélvico y periné",
  "Cadera y glúteo",
  "Muslo",
  "Pierna",
  "Pie",
  "Otros",
];

const NERVOUS_CATEGORY_RULES: CategoryRule[] = [
  { category: "Órganos de los sentidos", keywords: ["eyeball", "cornea", "iris", "lens", "retina", "sclera", "vitreous", "lacrimal", "tympanic_membrane", "cochlea", "vestibule_of_the_ear", "auditory_tube", "chamber_of_eyeball", "segment_of_eyeball"] },
  { category: "Encéfalo", keywords: ["lobule", "culmen", "cuneus", "flocculus", "ventricle", "habenula", "commissure", "geniculate", "olive", "gyri", "occipital_pole", "temporal_pole", "temporal_plane", "precuneus", "optic_tract", "olfactory_tract", "stria_", "septal_nuclei", "vermis", "white_matter_of_telencephalon", "interpeduncular", "red_nucleus", "cochlear_nucleus", "vestibular_nuclei", "nucleus_ambiguus", "nucleus_of_solitary_tract", "salivatory_nuclei","cerebr", "gyrus", "sulcus", "hippocamp", "amygdal", "thalamus", "corpus_callosum", "basal_forebrain", "insula", "cingulate", "choroid_plexus", "cerebell", "midbrain", "pons", "medulla_oblongata", "brainstem", "ventricle_of_brain", "epithalamus", "fornix", "putamen", "caudate_nucleus", "colliculus", "tegmentum", "olfactory_bulb", "olfactory_nucleus", "optic_chiasm", "pineal_gland", "septum_pellucidum", "internal_capsule", "basal_ganglia", "brain"] },
  { category: "Médula espinal", keywords: ["spinal_cord", "central_canal", "intermediolateral", "posterolateral_tract","root_of_spinal_nerve", "ramus_of_spinal_nerve", "rami_of_spinal_nerve", "corticospinal_tract", "spinothalamic_tract", "rubrospinal_tract", "vestibulospinal_tract", "tectospinal_tract", "reticulospinal_tract", "spinotectal_tract", "nucleus_proprius", "cauda_equina", "conus_medullaris", "filum_terminale"] },
  { category: "Meninges y espacios", keywords: ["dura_mater", "arachnoid_mater", "pia_mater", "falx_cerebri", "falx_cerebelli", "tentorium_cerebelli", "dural_venous_sinus", "cistern_of", "cranial_dura", "cranial_pia", "spinal_dura", "epidural_space", "subarachnoid"] },
  { category: "Nervios craneales", keywords: ["olfactory_nerve", "optic_nerve", "oculomotor_nerve", "trochlear_nerve", "trigeminal_nerve", "abducens_nerve", "facial_nerve", "vestibulocochlear_nerve", "cochlear_nerve", "vestibular_nerve", "glossopharyngeal_nerve", "vagus_nerve", "accessory_nerve", "hypoglossal_nerve", "cranial_nerve", "mandibular_nerve", "maxillary_nerve", "ophthalmic_nerve", "lingual_nerve", "buccal_nerve", "auriculotemporal_nerve", "infraorbital_nerve", "lacrimal_nerve", "frontal_nerve", "alveolar_nerve", "palatine_nerve", "chorda_tympani", "nasociliary_nerve", "zygomatic_nerve", "supraorbital_nerve", "supratrochlear_nerve", "petrosal_nerve"] },
  { category: "Plexos y ganglios autónomos", keywords: ["ganglion", "sympathetic_nervous_system","celiac_plexus", "cardiac_plexus", "esophageal_plexus", "gastric_plexus", "hepatic_plexus", "mesenteric_plexus", "hypogastric_plexus", "aortic_plexus", "carotid_plexus", "renal_plexus", "splenic_plexus", "pulmonary_plexus", "pelvic_plexus", "vesical_plexus", "prostatic_plexus", "uterovaginal_plexus", "tympanic_plexus", "pharyngeal_plexus", "cavernous_nerve", "splanchnic_nerve", "sympathetic_trunk", "vagal_trunk", "autonomic"] },
  { category: "Nervios periféricos", keywords: ["nerve", "plexus", "rami", "ramus", "muscle"] },
];

const NERVOUS_CATEGORY_ORDER = [
  "Órganos de los sentidos",
  "Encéfalo",
  "Médula espinal",
  "Meninges y espacios",
  "Nervios craneales",
  "Plexos y ganglios autónomos",
  "Nervios periféricos",
  "Otros",
];

const CARDIOVASCULAR_CATEGORY_RULES: CategoryRule[] = [
  { category: "Corazón", keywords: ["of_heart", "atrium", "ventricle", "atrioventricular", "aortic_valve", "mitral_valve", "tricuspid_valve", "pulmonary_valve", "papillary_muscle", "chordae_tendineae", "pericardi", "myocardi", "coronary_sinus", "coronary_artery", "coronary_vein", "sinoatrial", "purkinje", "interventricular_septum", "interatrial_septum", "cardiac", "leaflet"] },
  { category: "Circulación pulmonar", keywords: ["pulmonary_artery", "pulmonary_vein", "pulmonary_trunk", "ductus_arteriosus"] },
  { category: "Arterias", keywords: ["artery", "arteries", "aorta", "aortic_arch", "arterial", "trunk", "palmar_arch", "plantar_arch", "anastomosis"] },
  { category: "Venas", keywords: ["vein", "veins", "vena_cava", "venous", "sinus"] },
];

const CARDIOVASCULAR_CATEGORY_ORDER = [
  "Corazón",
  "Circulación pulmonar",
  "Arterias",
  "Venas",
  "Otros",
];

const LYMPHATIC_CATEGORY_RULES: CategoryRule[] = [
  { category: "Cabeza y cuello", keywords: ["occipital", "mastoid", "submental", "submandibular", "parotid", "bucinator", "nasolabial", "mandibular", "jugulodigastric", "jugulo_omohyoid", "malar", "lingual", "retropharyngeal", "pretracheal", "paratracheal_cervical", "thyroid_nodes", "tonsil", "facial_nodes", "pharyngeal", "supratonsillar", "prelaryngeal", "lymph_nodes_of_head", "lymph_nodes_of_neck", "auricular", "supraclavicular"] },
  { category: "Tórax", keywords: ["mediastinal", "tracheobronchial", "traqueobronchial", "parasternal", "intercostal", "diaphragmatic", "pericardial", "prepericardial", "azygos", "ligamentum_arteriosum", "brachiocephalic", "thymus", "intrapulmonary", "pulmonary_nodes", "oesophageal", "paratracheal_thoracic", "thoracic_lymph_nodes", "prevertebral"] },
  { category: "Axila y miembro superior", keywords: ["axillary", "brachial", "cubital", "supratrochlear", "infraclavicular", "interpectoral", "deltopectoral"] },
  { category: "Abdomen y vísceras", keywords: ["coeliac", "gastric", "gastro_omental", "pancreat", "splenic", "spleen", "hepatic", "cystic", "mesenteric", "ileocolic", "colic", "sigmoid", "caecal", "appendicular", "pyloric", "lumbar_nodes", "intermediate_lumbar", "aortic_nodes", "periaortic", "inferior_epigastric", "visceral_abdominal", "omental_foramen", "abdominal_lymph", "caval_nodes", "retrocaval", "retro_aortic"] },
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

// Reglas por región/aparato para esqueleto, articulaciones, vísceras y piel.
// Se evalúan en orden (gana la primera que matchea) sobre la clave del dataset
// de anatomía; lo más específico va primero. Las regiones siguen los programas
// de las cátedras (ver domain/programas.ts).

const SKELETON_CATEGORY_RULES: CategoryRule[] = [
  { category: "Cráneo y cara", keywords: ["frontal_bone", "parietal_bone", "occipital_bone", "temporal_bone", "sphenoid", "ethmoid", "nasal_bone", "lacrimal_bone", "zygomatic_bone", "maxilla", "mandible", "palatine_bone", "vomer", "nasal_concha", "frontal_sinus", "nasal_septal_cartilage", "alar_cartilage", "tooth", "incisor", "premolar", "malleus", "incus", "stapes"] },
  { category: "Cuello (hioides y laringe)", keywords: ["hyoid", "thyroid_cartilage", "cricoid", "arytenoid", "corniculate"] },
  { category: "Columna vertebral", keywords: ["vertebra", "atlas", "axis_c2", "sacrum", "coccyx"] },
  { category: "Tórax", keywords: ["_rib", "sternum", "manubrium", "xiphoid", "costal_cartilage"] },
  { category: "Miembro superior", keywords: ["clavicle", "scapula", "humerus", "radius", "ulna", "scaphoid", "lunate", "triquetr", "pisiform", "trapezium", "trapezoid_bone", "capitate", "hamate", "metacarpal", "finger"] },
  { category: "Pelvis", keywords: ["hip_bone", "ilion", "ilium", "isquion", "ischium", "pubis", "symphysis", "pelvi"] },
  { category: "Miembro inferior", keywords: ["femur", "patella", "tibia", "fibula", "calcaneus", "talus", "navicular", "cuboid", "cuneiform", "metatarsal", "sesamoid", "toe", "foot"] },
];

const SKELETON_CATEGORY_ORDER = [
  "Cráneo y cara",
  "Cuello (hioides y laringe)",
  "Columna vertebral",
  "Tórax",
  "Miembro superior",
  "Pelvis",
  "Miembro inferior",
  "Otros",
];

const JOINTS_CATEGORY_RULES: CategoryRule[] = [
  { category: "Cabeza y cuello", keywords: ["temporomandibular", "sphenomandibular", "stylomandibular", "stylohyoid", "pterygospinous", "thyrohyoid", "cricothyroid", "cricopharyngeal", "intercornual", "quadrangular_membrane", "nuchal"] },
  { category: "Columna vertebral", keywords: ["longitudinal_ligament", "ligamenta_flava", "interspinous", "supraspinous", "intertransverse", "iliolumbar"] },
  { category: "Pelvis", keywords: ["sacro_iliac", "sacrotuberous", "sacrospinous", "pubic", "interpubic", "obturator_membrane", "triradiate"] },
  { category: "Tórax", keywords: ["intercostal", "costotransverse", "head_of_rib"] },
  { category: "Hombro", keywords: ["acromioclavicular", "sternoclavicular", "interclavicular", "costoclavicular", "conoid", "trapezoid_ligament", "coraco", "glenohumeral", "glenoid", "transverse_humeral", "superior_transverse_scapular", "shoulder"] },
  { category: "Codo", keywords: ["elbow", "annular_ligament_of_radius", "quadrate_ligament", "oblique_cord", "interosseous_membrane_of_forearm"] },
  { category: "Muñeca y mano", keywords: ["wrist", "carpal", "radio_ulnar", "ulnocarpal", "ulnolunate", "ulnotriquetral", "ulnopisiform", "ulnocapitate", "pisohamate", "pisometacarpal", "radioscaphocapitate", "metacarp", "of_hand", "palmar"] },
  { category: "Cadera", keywords: ["acetabul", "iliofemoral", "ischiofemoral", "pubofemoral", "head_of_femur", "zona_orbicularis", "hip"] },
  { category: "Rodilla", keywords: ["knee", "cruciate", "meniscus", "meniscopatellar", "tibial_collateral", "fibular_collateral", "popliteal", "popliteofibular", "infrapatellar", "fibular_head"] },
  { category: "Tobillo y pie", keywords: ["tars", "talo", "calcane", "cuneo", "cuneiform", "cuboid", "navicular", "plantar", "of_foot", "metatars", "tibiofibular", "interosseous_membrane_of_leg", "tibionavicular", "tibiocalcaneal", "intersesamoid"] },
];

const JOINTS_CATEGORY_ORDER = [
  "Cabeza y cuello",
  "Columna vertebral",
  "Tórax",
  "Hombro",
  "Codo",
  "Muñeca y mano",
  "Pelvis",
  "Cadera",
  "Rodilla",
  "Tobillo y pie",
  "Otros",
];

const ORGANS_CATEGORY_RULES: CategoryRule[] = [
  { category: "Peritoneo", keywords: ["omentum", "mesocolon", "meso_appendix", "mesentery", "peritone"] },
  { category: "Aparato respiratorio", keywords: ["nasopharynx", "epiglottis", "larynx", "trachea", "bronch", "lung", "pleura"] },
  { category: "Aparato urinario", keywords: ["kidney", "renal", "ureter", "bladder", "urethra"] },
  { category: "Aparato reproductor masculino", keywords: ["testis", "epididym", "ductus_deferens", "ejaculatory", "seminal", "prostate", "penis", "scrotum"] },
  { category: "Sistema endocrino", keywords: ["pituitary", "hypophysis", "thyroid", "parathyro", "adrenal", "pineal", "thymus"] },
  { category: "Aparato digestivo", keywords: ["gingiva", "tongue", "palate", "uvula", "parotid", "sublingual", "submandibular", "pharynx", "esophagus", "stomach", "duodenum", "jejunum", "ileum", "colon", "taenia", "appendix", "liver", "gallbladder", "bile_duct", "pancrea", "rectum", "anal_canal"] },
];

const ORGANS_CATEGORY_ORDER = [
  "Aparato digestivo",
  "Aparato respiratorio",
  "Aparato urinario",
  "Aparato reproductor masculino",
  "Sistema endocrino",
  "Peritoneo",
  "Otros",
];

// Aparato reproductor femenino y mama. Las claves son las del dataset: útero,
// ovario, trompa y mama existen en anatomy.final.builded.json; cérvix, lóbulos,
// senos galactóforos y ligamentos suspensorios, en anatomy.female.json.
const FEMALE_CATEGORY_RULES: CategoryRule[] = [
  { category: "Mama", keywords: ["breast", "mammary", "nipple", "areola", "lactiferous"] },
  { category: "Ovarios y trompas", keywords: ["ovary", "fallopian_tube"] },
  { category: "Útero y cuello uterino", keywords: ["uterus", "cervix"] },
];

const FEMALE_CATEGORY_ORDER = [
  "Útero y cuello uterino",
  "Ovarios y trompas",
  "Mama",
  "Otros",
];

const SKIN_CATEGORY_RULES: CategoryRule[] = [
  { category: "Oído externo", keywords: ["auric", "antihelix", "antitragus", "tragus", "helix", "concha", "cymba", "scapha", "triangular_fossa", "fossa_antihelica", "intertragic"] },
  { category: "Periné y genitales", keywords: ["anal_region", "urogenital", "pubic", "perine"] },
  { category: "Cuello", keywords: ["neck", "carotid_triangle", "muscular_triangle", "submandibular_triangle", "submental_triangle", "sternocleidomastoid_region", "supraclavicular"] },
  { category: "Cabeza y cara", keywords: ["frontal_region", "parietal_region", "occipital_region", "temporal_region", "mastoid_region", "orbital_region", "nasal_region", "oral_region", "buccal_region", "mental_region", "zygomatic_region", "eyebrow", "eyelash", "angle_of_mouth", "labial", "philtrum", "tubercle_of_upper_lip"] },
  { category: "Tórax y mama", keywords: ["pectoral", "presternal", "mammary", "infraclavicular", "lateral_region_of_thorax", "thorax"] },
  { category: "Abdomen", keywords: ["epigastric", "hypochondriac", "umbilic", "lumbar", "hypogastric", "inguinal", "lateral_region_of_abdomen"] },
  { category: "Espalda", keywords: ["scapular", "vertebral_region", "sacral_region", "auscultation"] },
  { category: "Miembro superior", keywords: ["deltoid", "bicipital", "cubital", "palm", "axill"] },
  { category: "Miembro inferior", keywords: ["femoral_triangle", "popliteal", "malleolus"] },
];

const SKIN_CATEGORY_ORDER = [
  "Cabeza y cara",
  "Oído externo",
  "Cuello",
  "Tórax y mama",
  "Abdomen",
  "Espalda",
  "Miembro superior",
  "Miembro inferior",
  "Periné y genitales",
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
    categoryRules: SKELETON_CATEGORY_RULES,
    categoryOrder: SKELETON_CATEGORY_ORDER,
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
    categoryRules: JOINTS_CATEGORY_RULES,
    categoryOrder: JOINTS_CATEGORY_ORDER,
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
    categoryRules: ORGANS_CATEGORY_RULES,
    categoryOrder: ORGANS_CATEGORY_ORDER,
    carreras: TODAS_LAS_CARRERAS,
  },
  female: {
    id: "female",
    label: "Aparato reproductor femenino y mama",
    shortLabel: "Reproductor ♀",
    tagline: "Útero, ovarios, trompas uterinas y mama",
    glb: "/models/female.glb",
    dataset: "builded",
    count: "12 estructuras",
    swatch: "#D98BA0",
    weightMB: 6.6,
    status: "ready",
    categoryRules: FEMALE_CATEGORY_RULES,
    categoryOrder: FEMALE_CATEGORY_ORDER,
    carreras: ["carrera-rad", "carrera-iq"],
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
  skin: {
    id: "skin",
    label: "Piel y regiones de superficie",
    shortLabel: "Piel",
    tagline: "Regiones topográficas de superficie y tegumento",
    glb: "/models/skin.glb",
    dataset: "builded",
    count: "~150 regiones",
    swatch: "#E8B89A",
    weightMB: 4,
    status: "ready",
    categoryRules: SKIN_CATEGORY_RULES,
    categoryOrder: SKIN_CATEGORY_ORDER,
    carreras: ["carrera-rad", "carrera-iq"],
  },
};

/** Orden de aparición en nav / galería. */
export const SYSTEM_ORDER: SystemId[] = ["skeleton", "muscles", "joints", "organs", "female", "nervous", "cardiovascular", "lymphatic", "skin"];

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
