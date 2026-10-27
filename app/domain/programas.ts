// Programas de las materias de anatomía: unidades, temas y sistemas 3D asociados.
//
// Solo contenidos temáticos, tomados de los programas analíticos de cada cátedra.
// Anatomía I y II son compartidas por Radiología e Instrumentación Quirúrgica: cada
// unidad lleva `origen` (carreras cuyo programa la incluye) para poder filtrar
// "solo lo de mi carrera" con unidadesDeMateria(materiaId, carreraId).
//
// Los números de unidad son los que guarda QuestionMateria.unidad en la DB.

import type { CarreraId, MateriaId } from "./academic";
import type { SystemId } from "../config/systems";

export type Unidad = {
  n: number;
  titulo: string;
  temas: string[];
  /** Sistemas del visor 3D que sirven a la unidad. Vacío = sin modelo 3D. */
  sistemas3D: SystemId[];
  /** Aclaraciones o huecos de cobertura 3D. */
  nota3D?: string;
  /** Solo en materias compartidas: carreras cuyo programa incluye la unidad. */
  origen?: CarreraId[];
};

export type Programa = {
  materiaId: MateriaId;
  unidades: Unidad[];
  /** true si el programa real de la materia aún no fue provisto. */
  provisorio?: boolean;
};

const RAD_IQ: CarreraId[] = ["carrera-rad", "carrera-iq"];
const IQ: CarreraId[] = ["carrera-iq"];
const RAD: CarreraId[] = ["carrera-rad"];

// ── Anatomía I (Radiología + Instrumentación Quirúrgica) ─────────────────────

const ANAT1: Unidad[] = [
  {
    n: 1,
    titulo: "Introducción a la anatomía y organización del cuerpo",
    temas: [
      "Definición de anatomía y subdivisiones",
      "Historia de la anatomía",
      "Diferencia entre anatomía y fisiología",
      "Morfemas y terminología anatómica básica",
      "Términos de posición y dirección",
      "Planos anatómicos, ejes, cavidades y regiones corporales",
      "Niveles de organización de la materia",
      "Generalidades de osteología, artrología y miología",
    ],
    sistemas3D: [],
    nota3D: "Conceptual; sin modelo propio.",
    origen: RAD_IQ,
  },
  {
    n: 2,
    titulo: "Célula y tejidos",
    temas: [
      "Célula: características, partes, membrana plasmática, orgánulos, núcleo y citoplasma",
      "Homeostasis: definición",
      "Tejidos: tipos, clasificación, características y ubicación",
      "Tejido epitelial, conectivo, membranas, muscular y nervioso",
    ],
    sistemas3D: [],
    nota3D: "Histología: sin modelo 3D.",
    origen: IQ,
  },
  {
    n: 3,
    titulo: "Sistema tegumentario",
    temas: [
      "Estructura de la piel: epidermis y dermis",
      "Anexos de la piel",
      "Funciones de la piel",
      "Cicatrización de heridas epidérmicas y profundas",
      "Líneas de Langer: características e importancia quirúrgica",
    ],
    sistemas3D: [],
    nota3D: "skin.glb existe pero aún no está registrado en el visor.",
    origen: IQ,
  },
  {
    n: 4,
    titulo: "Osteología",
    temas: [
      "Funciones del sistema esquelético y papel del hueso en la homeostasis",
      "Clasificación de los huesos",
      "Propiedades físicas y químicas",
      "Configuración interna y externa; estructura e histología del tejido óseo",
      "Irrigación e inervación del hueso",
      "Reparos de la superficie ósea",
      "Esqueleto axial: cabeza (partes y forámenes), hueso hioides, columna vertebral (curvas, discos, regiones), tórax",
    ],
    sistemas3D: ["skeleton"],
    origen: RAD_IQ,
  },
  {
    n: 5,
    titulo: "Artrología",
    temas: [
      "Clasificación de las articulaciones según movimiento y estructura",
      "Articulaciones fibrosas: suturas y membranas interóseas",
      "Articulaciones cartilaginosas: sínfisis",
      "Articulaciones sinoviales: tipos, estructura, inervación e irrigación",
      "Bolsas sinoviales y vainas tendinosas",
      "Articulaciones corporales específicas",
    ],
    sistemas3D: ["joints"],
    origen: RAD_IQ,
  },
  {
    n: 6,
    titulo: "Miología general",
    temas: [
      "Tejido muscular: función, sitios de fijación y propiedades",
      "Clasificación del tejido muscular y coordinación muscular",
      "Ligamentos, tendones y fascias: diferencias y características",
      "Músculos por regiones: esquelético, cardíaco y liso",
    ],
    sistemas3D: ["muscles"],
    origen: RAD_IQ,
  },
  {
    n: 7,
    titulo: "Miembro superior",
    temas: [
      "Anatomía descriptiva y funcional",
      "Osteología: cintura escapular, brazo, antebrazo y mano",
      "Artrología: hombro, codo, muñeca y mano",
      "Miología y anatomía funcional",
      "Radiología normal e imagenología",
    ],
    sistemas3D: ["skeleton", "joints", "muscles"],
    nota3D: "Filtrar por miembro superior (categorías regionales, paso 2).",
    origen: RAD_IQ,
  },
  {
    n: 8,
    titulo: "Miembro inferior",
    temas: [
      "Anatomía descriptiva y funcional",
      "Osteología: pelvis (mayor y menor; diferencias entre pelvis masculina y femenina), muslo, pierna y pie",
      "Artrología: cadera, rodilla y tobillo",
      "Miología y anatomía funcional",
      "Bipedestación y marcha",
      "Radiología normal",
    ],
    sistemas3D: ["skeleton", "joints", "muscles"],
    nota3D: "Filtrar por miembro inferior (categorías regionales, paso 2).",
    origen: RAD_IQ,
  },
  {
    n: 9,
    titulo: "Sistema digestivo",
    temas: [
      "Túnicas del tubo digestivo: mucosa, submucosa, muscular y serosa",
      "Peritoneo: características anatómicas",
      "Órganos: boca, faringe, esófago, estómago, intestino delgado e intestino grueso",
      "Anexos: páncreas, hígado y vesícula biliar",
      "Irrigación del sistema digestivo",
    ],
    sistemas3D: ["organs", "cardiovascular"],
    origen: IQ,
  },
  {
    n: 10,
    titulo: "Sistema nervioso",
    temas: [
      "Organización del sistema nervioso: neuronas y neuroglias",
      "Médula espinal: anatomía externa e interna",
      "Nervios espinales: distribución",
      "Encéfalo: organización, protección e irrigación",
      "Líquido cefalorraquídeo",
      "Tronco del encéfalo: bulbo raquídeo, protuberancia, mesencéfalo; cerebelo",
      "Diencéfalo: tálamo, hipotálamo, epitálamo",
      "Cerebro: corteza, lóbulos, sustancia blanca, ganglios basales, sistema límbico",
      "Nervios craneales",
      "Meninges: ubicación y anatomía",
    ],
    sistemas3D: ["nervous"],
    origen: IQ,
  },
];

// ── Anatomía II (Radiología + Instrumentación Quirúrgica) ────────────────────

const ANAT2: Unidad[] = [
  {
    n: 1,
    titulo: "Tronco",
    temas: [
      "Costillas y esternón",
      "Artrología: articulaciones de la caja torácica",
      "Miología: músculos torácicos y diafragma (desarrollo, descripción, irrigación e inervación)",
      "Corazón: configuración externa e interna, estructura, sistema cardionector, irrigación e inervación",
      "Sistema arterial del tronco: arterias pulmonares y aorta",
      "Sistemas venosos: cava, porta, ácigos y venas del raquis",
      "Linfáticos del tronco: colectores terminales y grupos linfáticos de tórax, abdomen y pelvis",
      "Nervios raquídeos; plexos lumbar, sacro, pudendo y sacrocoxígeo",
      "Sistema vegetativo del tronco: plexos y conexiones; inervación de vísceras toracoabdominales",
      "Anatomía radiológica del tórax; bases anatómicas de los medios de diagnóstico por imágenes",
    ],
    sistemas3D: ["skeleton", "joints", "muscles", "cardiovascular", "lymphatic", "nervous"],
    origen: RAD,
  },
  {
    n: 2,
    titulo: "Aparato respiratorio",
    temas: [
      "División y desarrollo del aparato respiratorio",
      "Fosas nasales y cavidades neumáticas anexas; laringe y tráquea",
      "Anatomía funcional de la fonación",
      "Árbol traqueobronquial; vías aéreas superiores e inferiores",
      "Pulmones: lóbulos, segmentos, segmentación broncovascular, pedículos primarios y cisurales",
      "Cavidad pleural y pleuras; topografía toracopulmonar",
      "Histología respiratoria",
      "Mecánica respiratoria, intercambio gaseoso, volúmenes y capacidades pulmonares",
      "Regulación respiratoria y alteraciones del ritmo respiratorio",
      "Músculos respiratorios; irrigación e inervación",
    ],
    sistemas3D: ["organs"],
    nota3D: "Histología y fisiología: solo cuestionarios.",
    origen: RAD_IQ,
  },
  {
    n: 3,
    titulo: "Aparato circulatorio y sangre",
    temas: [
      "División del aparato circulatorio; desarrollo del corazón",
      "Corazón: localización, pericardio, capas de la pared, cámaras, válvulas, miocardio",
      "Circulación coronaria; sistema de conducción; ciclo cardíaco",
      "Circulación mayor y menor; grandes vasos",
      "Arterias, arteriolas, capilares, vénulas y venas: estructura y función",
      "Vena cava superior e inferior; aorta: ramas principales y secundarias, tronco braquiocefálico",
      "Presión arterial; masaje cardíaco externo; fibrilación y arritmias principales",
      "Sangre: composición, funciones y propiedades; glóbulos rojos y blancos, plaquetas, plasma",
      "Hemostasia y grupos sanguíneos",
      "Sistema linfático: estructura y función, ganglios y vasos linfáticos, circulación de la linfa",
      "Inmunidad innata y adaptativa; trasplante de órganos y rechazo",
    ],
    sistemas3D: ["cardiovascular", "lymphatic"],
    nota3D:
      "Sangre, hemostasia e inmunidad: sin 3D. El linfático figura en los contenidos mínimos de IQ sin unidad propia.",
    origen: RAD_IQ,
  },
  {
    n: 4,
    titulo: "Cabeza y cuello",
    temas: [
      "Desarrollo del cráneo y la cara: neurocráneo, esqueleto visceral, esqueleto de cubierta",
      "Osteología: huesos del cráneo y de la cara, vértebras cervicales, hueso hioides, cavidades comunes",
      "Artrología: articulaciones del cráneo y la cara, articulación témporo-maxilar y su mecanismo, columna cervical y unión cabeza-cuello",
      "Miología: músculos masticadores y su aponeurosis, anatomía funcional de la masticación, músculos y aponeurosis del cuello, músculos de la mímica",
      "Angiología: arterias carótidas y subclavia, senos venosos craneales, sistemas yugulares, grupos y pedículos linfáticos",
      "Neurología: pares craneales (origen y distribución), nervios raquídeos cervicales y plexo cervical, simpático cervical",
      "Esplacnología: anatomía general, relaciones, irrigación e inervación",
      "Cortes anatómicos e imagenología normal",
    ],
    sistemas3D: ["skeleton", "joints", "muscles", "nervous", "cardiovascular", "lymphatic"],
    nota3D: "Filtrar por cabeza y cuello (categorías regionales, paso 2).",
    origen: RAD,
  },
  {
    n: 5,
    titulo: "Aparato urinario",
    temas: [
      "Riñones: anatomía externa e interna",
      "La nefrona",
      "Uréteres, vejiga urinaria y uretra",
      "Irrigación e inervación; relaciones anatómicas",
      "Fisiología renal; formación y composición química de la orina",
      "Regulación del equilibrio hidroelectrolítico",
      "Aplicación quirúrgica",
    ],
    sistemas3D: ["organs"],
    nota3D: "Nefrona y fisiología renal: sin 3D.",
    origen: IQ,
  },
  {
    n: 6,
    titulo: "Aparato reproductor",
    temas: [
      "Masculino: órganos genitales internos y externos, escroto, testículos, conductos y glándulas anexas, pene",
      "Masculino: irrigación, inervación, relaciones anatómicas y fisiología",
      "Femenino: ovarios, trompas uterinas, útero, vagina, vulva, periné y glándulas mamarias",
      "Fisiología femenina: ciclo sexual",
      "Anticoncepción",
      "Principales patologías biopsicosociales de la esfera genital",
      "Aplicación quirúrgica",
    ],
    sistemas3D: ["organs"],
    nota3D: "Masculino cubierto. Femenino y mama: sin modelo 3D (a incorporar).",
    origen: IQ,
  },
  {
    n: 7,
    titulo: "Sistema endocrino",
    temas: [
      "Concepto y características de la glándula endocrina",
      "Hipotálamo e hipófisis",
      "Tiroides y paratiroides",
      "Glándulas suprarrenales",
      "Páncreas endocrino",
      "Ovarios y testículos",
      "Glándula pineal y timo",
      "Ubicación, irrigación y relaciones; importancia clínica del equilibrio hormonal",
    ],
    sistemas3D: ["organs"],
    origen: IQ,
  },
  {
    n: 8,
    titulo: "Genética y células madre",
    temas: [
      "Concepto de genética; ADN, ARN y genes",
      "Cromosomas y herencia; código genético",
      "Genotipo y fenotipo",
      "Herencia dominante y recesiva; genes y ambiente",
      "Herencia ligada al sexo; bases genéticas de la evolución",
      "Células madre: totipotenciales, pluripotenciales, multipotentes",
      "Aplicaciones clínicas",
    ],
    sistemas3D: [],
    origen: IQ,
  },
  {
    n: 9,
    titulo: "Órganos de los sentidos",
    temas: ["Descripción y funciones generales de los órganos de los sentidos"],
    sistemas3D: ["nervous"],
    nota3D:
      "Figura en los contenidos mínimos de IQ II sin unidad en el analítico; ojo y oído están dentro del sistema nervioso.",
    origen: IQ,
  },
];

// ── Anatomía III (Radiología) ────────────────────────────────────────────────

const ANAT3: Unidad[] = [
  {
    n: 1,
    titulo: "Tórax",
    temas: [
      "Pared torácica y su esqueleto",
      "Esternón: características, caras, extremidades y partes",
      "Costillas: características, partes y clasificación; particularidades de 1.ª, 2.ª, 10.ª, 11.ª y 12.ª",
      "Cartílagos costales y clavícula",
      "Articulaciones de la pared costal",
      "Caja torácica, espacios intercostales, aberturas torácicas superior e inferior",
      "Músculos de la pared torácica y diafragma; movimientos de la pared torácica",
      "Contenido y continente del tórax; membranas serosas (hojas parietal y visceral)",
      "Estructuras torácicas en imágenes de diagnóstico estándar",
    ],
    sistemas3D: ["skeleton", "joints", "muscles"],
  },
  {
    n: 2,
    titulo: "Aparato respiratorio",
    temas: [
      "Concepto y formación",
      "Vías extratorácicas: fosas nasales, boca, faringe, laringe y tráquea extratorácica",
      "Vías intratorácicas: tráquea, bronquios principales, divisiones hasta el bronquiolo terminal",
      "Zona de transición y respiratoria: del bronquiolo respiratorio a los sacos alveolares",
      "Pulmones y pleuras",
      "Mecánica de la respiración; unidad alveolo-capilar",
      "Volúmenes y capacidades pulmonares; difusión e intercambio de gases",
    ],
    sistemas3D: ["organs"],
    nota3D: "Fisiología: solo cuestionarios.",
  },
  {
    n: 3,
    titulo: "Aparato cardiovascular",
    temas: [
      "Función y organización del aparato",
      "Corazón: características, situación general, sistema conector, ciclo cardíaco",
      "Sistema canalicular: arterias, venas y capilares (concepto, estructura, localización, distribución, anastomosis)",
      "Circulación sanguínea",
      "Hemodinamia",
    ],
    sistemas3D: ["cardiovascular"],
  },
  {
    n: 4,
    titulo: "Abdomen y peritoneo",
    temas: [
      "División topográfica del abdomen: líneas verticales y horizontales, cuadrantes, órganos que lo forman",
      "Cavidad abdominal: límites de la cavidad abdominopélvica",
      "Peritoneo: características y dependencias (parietal, visceral, mesos, omentos, ligamentos, fascias de coalescencia)",
      "Cavidad peritoneal: descripción y topografía general",
      "Espacios supracólico (supramesocólico) e infracólico (inframesocólico)",
    ],
    sistemas3D: ["organs"],
    nota3D: "Peritoneo parcial: solo mesocolon y epiplones mayor y menor.",
  },
  {
    n: 5,
    titulo: "Aparato urinario",
    temas: [
      "Riñón: configuración externa, relaciones, caras, bordes y polos; configuración interna (zonas cortical y medular)",
      "Uréter: características, configuración interna, porciones y medición",
      "Vejiga: vejiga llena y vacía, configuración interna, capacidad fisiológica",
      "Uretra masculina y femenina: porciones, medidas, ubicación; micción y sus fases",
      "Nefrona: tipos, formación, corpúsculo renal y aparato tubular",
      "Formación de orina: filtración glomerular, reabsorción y secreción tubular",
    ],
    sistemas3D: ["organs"],
    nota3D: "Nefrona y fisiología: sin 3D.",
  },
];

// ── Anatomía IV (Radiología) ─────────────────────────────────────────────────

const ANAT4: Unidad[] = [
  {
    n: 1,
    titulo: "Aparato digestivo: órganos principales",
    temas: [
      "Regiones, divisiones y función del aparato digestivo",
      "Boca: vestíbulo, dientes, labios, mejillas, región palatina, velo del paladar, istmo de las fauces",
      "Glándulas salivales mayores (parótida, sublingual, submaxilar) y menores",
      "Faringe: configuración, relaciones, músculos; rinofaringe, orofaringe, laringofaringe",
      "Esófago: descripción, relaciones, estrechamientos y dilataciones",
      "Estómago: porciones, relaciones, caras, bordes, curvaturas, configuración interna",
      "Intestino delgado: duodeno, yeyuno-íleon",
      "Intestino grueso: apéndice, colon ascendente, transverso, descendente y sigmoide, recto, ano; cintas, abollonaduras y apéndices epiploicos",
    ],
    sistemas3D: ["organs", "skeleton"],
    nota3D: "Dientes en el sistema esquelético.",
  },
  {
    n: 2,
    titulo: "Glándulas anexas del aparato digestivo",
    temas: [
      "Hígado: caras, bordes, polos, ligamentos, configuración interna, función",
      "Vesícula biliar: porciones, relaciones, función",
      "Vías biliares extrahepáticas: principal y accesoria, esfínter de Oddi, ampolla de Vater",
      "Páncreas: divisiones, medidas, porciones, conductos excretores, función",
    ],
    sistemas3D: ["organs"],
    nota3D: "Vías biliares con poco detalle en el modelo.",
  },
  {
    n: 3,
    titulo: "Motilidad y secreción del aparato digestivo",
    temas: [
      "Motilidad: masticación, deglución (etapas oral, faríngea y esofágica), ondas peristálticas",
      "Motilidad gástrica, del intestino delgado y del intestino grueso",
      "Secreción endocrina y exocrina: conceptos",
      "Secreción en boca, esófago y estómago (células pépticas, oxínticas, glándulas pilóricas)",
      "Intestino delgado: glándulas de Brunner, células caliciformes, criptas de Lieberkühn",
      "Intestino grueso, hígado (bilis) y páncreas (jugo pancreático)",
    ],
    sistemas3D: [],
    nota3D: "Fisiología e histología: solo cuestionarios.",
  },
  {
    n: 4,
    titulo: "Aparato reproductor femenino y fisiología",
    temas: [
      "División y función del aparato reproductor femenino",
      "Órganos genitales internos: ovarios, trompas de Falopio, útero, vagina",
      "Órganos genitales externos: vulva, monte de Venus, labios mayores y menores, clítoris, vestíbulo, glándulas de Bartholin",
      "Sistema regulador hipotálamo-hipófisis-ovarios y hormonas",
      "Ciclo ovárico, uterino y endometrial",
    ],
    sistemas3D: [],
    nota3D: "Sin modelo 3D femenino (a incorporar).",
  },
  {
    n: 5,
    titulo: "Aparato circulatorio",
    temas: [
      "Función y organización del aparato circulatorio",
      "Corazón: situación, configuración externa e interna, ciclo cardíaco",
      "Sistema canalicular: arterias, venas, capilares (estructura, localización, distribución, anastomosis)",
      "Sangre: concepto y composición",
      "Circulación mayor y menor; ramas colaterales de la aorta",
    ],
    sistemas3D: ["cardiovascular"],
  },
];

// ── Laboratorio: Anatomía Descriptiva ────────────────────────────────────────

const LAB_DESCRIPTIVA: Unidad[] = [
  {
    n: 1,
    titulo: "La célula",
    temas: [
      "Concepto",
      "Membrana plasmática y citoplasma",
      "Organelas y núcleo",
      "Ciclo celular: mitosis y meiosis",
    ],
    sistemas3D: [],
    nota3D: "Histología: solo cuestionarios.",
  },
  {
    n: 2,
    titulo: "Histología: tejidos",
    temas: [
      "Técnica histológica",
      "Tejido epitelial",
      "Tejido conectivo: general y especializado",
      "Tejido muscular",
      "Tejido nervioso",
    ],
    sistemas3D: [],
    nota3D: "Histología: solo cuestionarios.",
  },
  {
    n: 3,
    titulo: "Aparato circulatorio",
    temas: [
      "Órganos que conforman el aparato circulatorio y su estructura",
      "Anatomía e histología del corazón",
      "Anatomía e histología de los vasos sanguíneos",
      "Órganos hematopoyéticos",
      "Sangre: células que la integran",
    ],
    sistemas3D: ["cardiovascular", "lymphatic"],
    nota3D: "Histología y sangre: solo cuestionarios.",
  },
  {
    n: 4,
    titulo: "Aparato respiratorio",
    temas: [
      "Órganos que conforman el aparato respiratorio y su estructura",
      "Anatomía e histología de fosas nasales, laringe, tráquea, bronquios y pulmones",
    ],
    sistemas3D: ["organs"],
  },
  {
    n: 5,
    titulo: "Aparato urinario",
    temas: [
      "Órganos que conforman el aparato urinario y su estructura",
      "Anatomía e histología de riñones, uréteres, vejiga y uretra",
    ],
    sistemas3D: ["organs"],
  },
  {
    n: 6,
    titulo: "Aparato digestivo",
    temas: [
      "Órganos que conforman el aparato digestivo y su estructura",
      "Anatomía e histología de boca, faringe, esófago, estómago, intestino delgado, intestino grueso, recto, hígado y páncreas",
    ],
    sistemas3D: ["organs"],
  },
];

// ── Laboratorio: Anatomía Fisiológica ────────────────────────────────────────

const LAB_FISIOLOGICA: Unidad[] = [
  {
    n: 1,
    titulo: "Introducción a la fisiología humana",
    temas: ["Reseña histórica", "Sistemas y aparatos del cuerpo humano", "Fisiología humana"],
    sistemas3D: [],
  },
  {
    n: 2,
    titulo: "Fisiología celular y de membrana; líquidos corporales y medio interno",
    temas: [
      "Transporte a través de la membrana",
      "Medio interno; diferencias entre líquido extracelular e intracelular",
      "Origen de los nutrientes en el líquido extracelular; eliminación de productos metabólicos finales",
      "Sistemas de control del organismo",
      "Compartimentos líquidos; ingestión y pérdida diaria de agua",
    ],
    sistemas3D: [],
  },
  {
    n: 3,
    titulo: "Aparato urinario",
    temas: [
      "Generalidades de la función renal y de la fisiología renal",
      "La nefrona",
      "Filtración glomerular",
      "Reabsorción y secreción tubulares",
      "Orina: constitución y generalidades",
    ],
    sistemas3D: ["organs"],
    nota3D: "Fisiología renal: solo cuestionarios.",
  },
  {
    n: 4,
    titulo: "Aparato digestivo: hígado y páncreas",
    temas: [
      "Fisiología general de boca, garganta, esófago, estómago, intestino delgado, hígado, páncreas, vesícula biliar, intestino grueso, recto y ano",
      "Hígado: funciones específicas; metabolismo de hidratos de carbono, lípidos y proteínas",
      "Páncreas: estructura e inervación, componente acuoso del jugo pancreático, regulación de la secreción exocrina, función digestiva e insulina",
    ],
    sistemas3D: ["organs"],
    nota3D: "Fisiología: solo cuestionarios.",
  },
  {
    n: 5,
    titulo: "Aparato circulatorio, sangre y hemostasia",
    temas: [
      "Corazón: localización y anatomía microscópica",
      "Sistema de conducción cardíaco",
      "Vasos sanguíneos: generalidades; sistema linfático",
      "Circulación general y pulmonar",
      "Fisiología del corazón: potencial de acción y electrocardiograma",
      "Fisiología de la circulación: flujo sanguíneo, presión arterial, intercambio capilar",
      "Evaluación del sistema circulatorio",
      "Sangre: fisiología; funciones generales, glóbulos rojos, leucocitos granulocíticos, plaquetas y plasma",
      "Hemostasia (coagulación)",
    ],
    sistemas3D: ["cardiovascular", "lymphatic"],
    nota3D: "Fisiología, sangre y hemostasia: solo cuestionarios.",
  },
  {
    n: 6,
    titulo: "Aparato respiratorio",
    temas: ["Organización y estructura anatómica", "Mecánica respiratoria"],
    sistemas3D: ["organs"],
  },
];

// Hemoterapia: el programa real de "Anatomía, Histología y Fisiología normales"
// aún no fue provisto. Provisorio = Anatomía Descriptiva + Anatomía Fisiológica
// de Laboratorio (unidades 1–6 y 7–12).
const AHF_NORMALES: Unidad[] = [
  ...LAB_DESCRIPTIVA,
  ...LAB_FISIOLOGICA.map((u) => ({ ...u, n: u.n + LAB_DESCRIPTIVA.length })),
];

export const PROGRAMAS: Record<MateriaId, Programa> = {
  "mat-anat1": { materiaId: "mat-anat1", unidades: ANAT1 },
  "mat-anat2": { materiaId: "mat-anat2", unidades: ANAT2 },
  "mat-anat3": { materiaId: "mat-anat3", unidades: ANAT3 },
  "mat-anat4": { materiaId: "mat-anat4", unidades: ANAT4 },
  "mat-anat-descriptiva": { materiaId: "mat-anat-descriptiva", unidades: LAB_DESCRIPTIVA },
  "mat-anat-fisiologica": { materiaId: "mat-anat-fisiologica", unidades: LAB_FISIOLOGICA },
  "mat-ahf-normales": { materiaId: "mat-ahf-normales", unidades: AHF_NORMALES, provisorio: true },
};

/**
 * Unidades de una materia. Con `carreraId`, deja solo las del programa de esa
 * carrera (las unidades sin `origen` valen para todas).
 */
export function unidadesDeMateria(materiaId: MateriaId, carreraId?: CarreraId): Unidad[] {
  const unidades = PROGRAMAS[materiaId]?.unidades ?? [];
  if (!carreraId) return unidades;
  return unidades.filter((u) => !u.origen || u.origen.includes(carreraId));
}
