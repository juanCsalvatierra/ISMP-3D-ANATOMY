// Materiales específicos por sistema. Se separan de systems.ts para no arrastrar
// THREE al bundle de la nav / galería — solo AnatomyModel importa este módulo.
//
// applyMaterial(child, resolvedName):
//   - child        = el THREE.Mesh crudo (child.name puede ser "Mesh_12")
//   - resolvedName = nombre ya resuelto al padre cuando child.name es "Mesh_\d+"

import * as THREE from "three";
import type { SystemId } from "./systems";

export type ApplyMaterial = (child: THREE.Mesh, resolvedName: string) => void;

const skeletonMaterial: ApplyMaterial = (child, resolvedName) => {
  // Cartílagos: gris azulado.
  if (resolvedName.toLowerCase().includes("cartilage")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#D9E1E8",
      roughness: 0.38,
      metalness: 0,
    });
    return;
  }

  // Hueso: beige.
  child.material = new THREE.MeshStandardMaterial({
    color: "#F1E1B0",
    roughness: 0.5,
    metalness: 0,
  });
};

const musclesMaterial: ApplyMaterial = (child) => {
  const lowerCaseName = child.name.toLowerCase();

  // Fascia: translúcida, no escribe profundidad para no tapar el músculo.
  if (lowerCaseName.includes("fascia")) {
    (child.material as THREE.Material)?.dispose?.();
    child.material = new THREE.MeshStandardMaterial({
      color: "#DCD6C8",
      transparent: true,
      opacity: 0.18,
      roughness: 0.9,
      metalness: 0,
      depthWrite: false,
    });
    child.renderOrder = 1;
    return;
  }

  // Músculo: rojo.
  child.material = new THREE.MeshStandardMaterial({
    color: "#B84A3A",
    roughness: 0.7,
    metalness: 0,
  });
};

const jointsMaterial: ApplyMaterial = (child, resolvedName) => {
  const name = resolvedName.toLowerCase();

  // Cartílago articular: gris azulado (igual que en el esqueleto).
  if (name.includes("cartilage") || name.includes("disc") || name.includes("meniscus")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#D9E1E8",
      roughness: 0.35,
      metalness: 0,
    });
    return;
  }

  // Cápsula / membrana sinovial: translúcida.
  if (name.includes("capsule") || name.includes("membrane") || name.includes("bursa")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#E9E4D6",
      transparent: true,
      opacity: 0.25,
      roughness: 0.9,
      metalness: 0,
      depthWrite: false,
    });
    child.renderOrder = 1;
    return;
  }

  // Ligamentos / tendones: blanco nacarado.
  child.material = new THREE.MeshStandardMaterial({
    color: "#EDE6D6",
    roughness: 0.6,
    metalness: 0,
  });
};

const organsMaterial: ApplyMaterial = (child, resolvedName) => {
  const name = resolvedName.toLowerCase();

  const byKeyword: [string[], string][] = [
    [["lung", "pulmo", "bronch", "trachea", "larynx"], "#E0A9A0"],
    [["liver", "hepat"], "#8B4A3A"],
    [["kidney", "renal", "ureter", "bladder", "urethra"], "#9C5445"],
    [["stomach", "intestine", "colon", "bowel", "duoden", "jejun", "ileum", "cecum", "rectum", "esophag"], "#C98A6E"],
    [["spleen", "splen"], "#7E4A55"],
    [["pancreas", "thyroid", "adrenal", "gland", "thymus"], "#CDA27E"],
    [["heart", "cardi", "aorta", "atrium", "ventricle"], "#B5453E"],
  ];

  for (const [keywords, color] of byKeyword) {
    if (keywords.some((kw) => name.includes(kw))) {
      child.material = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0 });
      return;
    }
  }

  // Víscera genérica: tono cálido.
  child.material = new THREE.MeshStandardMaterial({
    color: "#C67D6A",
    roughness: 0.6,
    metalness: 0,
  });
};

const nervousMaterial: ApplyMaterial = (child, resolvedName) => {
  const name = resolvedName.toLowerCase();

  // Meninges: translúcidas, no escriben profundidad (igual que la fascia).
  if (name.includes("dura_mater") || name.includes("arachnoid_mater") || name.includes("pia_mater") || name.includes("falx") || name.includes("tentorium")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#E9E4D6",
      transparent: true,
      opacity: 0.2,
      roughness: 0.9,
      metalness: 0,
      depthWrite: false,
    });
    child.renderOrder = 1;
    return;
  }

  // Sustancia gris: encéfalo y médula.
  if (name.includes("grey_matter") || name.includes("cortex") || name.includes("gyrus") || name.includes("nucleus") || name.includes("ganglion")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#B8A9C9",
      roughness: 0.55,
      metalness: 0,
    });
    return;
  }

  // Sustancia blanca y tractos: encéfalo, médula y comisuras.
  if (name.includes("white_matter") || name.includes("tract") || name.includes("corpus_callosum") || name.includes("funiculus") || name.includes("peduncle")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#EDEAE0",
      roughness: 0.5,
      metalness: 0,
    });
    return;
  }

  // Nervios y plexos: amarillo, convención clásica de atlas anatómicos.
  child.material = new THREE.MeshStandardMaterial({
    color: "#D9B44A",
    roughness: 0.5,
    metalness: 0,
  });
};

const cardiovascularMaterial: ApplyMaterial = (child, resolvedName) => {
  const name = resolvedName.toLowerCase();

  // Válvulas cardíacas: nacaradas (igual que ligamentos/cápsulas).
  if (name.includes("valve") || name.includes("chordae_tendineae")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#EDE6D6",
      roughness: 0.6,
      metalness: 0,
    });
    return;
  }

  // Venas (incluye el seno coronario, que es venoso aunque agrupe con el corazón): azul.
  if (name.includes("vein") || name.includes("vena_cava") || name.includes("venous") || name.includes("coronary_sinus")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#3D5A80",
      roughness: 0.4,
      metalness: 0,
    });
    return;
  }

  // Cámaras cardíacas / miocardio: rojo muscular oscuro.
  if (name.includes("atrium") || name.includes("ventricle") || name.includes("myocardi") || name.includes("papillary_muscle") || name.includes("cardiac") || name.includes("of_heart") || name.includes("atrioventricular") || name.includes("interventricular_septum") || name.includes("interatrial_septum")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#8B2E2E",
      roughness: 0.6,
      metalness: 0,
    });
    return;
  }

  // Pericardio: translúcido, no escribe profundidad (igual que la fascia).
  if (name.includes("pericardi")) {
    (child.material as THREE.Material)?.dispose?.();
    child.material = new THREE.MeshStandardMaterial({
      color: "#DCD6C8",
      transparent: true,
      opacity: 0.18,
      roughness: 0.9,
      metalness: 0,
      depthWrite: false,
    });
    child.renderOrder = 1;
    return;
  }

  // Arterias (incluye aorta y ramas coronarias/pulmonares): rojo brillante.
  child.material = new THREE.MeshStandardMaterial({
    color: "#C0392B",
    roughness: 0.4,
    metalness: 0,
  });
};

const lymphaticMaterial: ApplyMaterial = (child, resolvedName) => {
  const name = resolvedName.toLowerCase();

  // Bazo: mismo tono que en Vísceras, es el mismo órgano.
  if (name.includes("spleen") || name.includes("splenic")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#7E4A55",
      roughness: 0.6,
      metalness: 0,
    });
    return;
  }

  // Timo y amígdalas: tejido linfoide rosado.
  if (name.includes("thymus") || name.includes("tonsil")) {
    child.material = new THREE.MeshStandardMaterial({
      color: "#D8A7A0",
      roughness: 0.6,
      metalness: 0,
    });
    return;
  }

  // Ganglios linfáticos: verde, convención clásica de atlas anatómicos.
  child.material = new THREE.MeshStandardMaterial({
    color: "#8FAE6B",
    roughness: 0.55,
    metalness: 0,
  });
};

export const SYSTEM_MATERIALS: Record<SystemId, ApplyMaterial> = {
  skeleton: skeletonMaterial,
  muscles: musclesMaterial,
  joints: jointsMaterial,
  organs: organsMaterial,
  nervous: nervousMaterial,
  cardiovascular: cardiovascularMaterial,
  lymphatic: lymphaticMaterial,
};
