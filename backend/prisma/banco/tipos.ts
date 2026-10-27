import { Formato } from '@prisma/client';

// Banco de preguntas por tema (paso 4). Cada pregunta se redacta una vez por
// tema y se asocia a todas las materias/unidades que lo cubren (QuestionMateria
// admite una unidad por materia). Entran como BORRADOR: un docente las revisa y
// aprueba en /docente/revision antes de que lleguen a los alumnos.

export type Destino = { materiaId: string; unidad: number };

export type PreguntaBanco = {
  texto: string;
  opciones: string[];
  correct: number;
  explicacion: string;
  formato: Formato;
  /** Tema transversal, p. ej. "circulatorio.hemostasia". */
  tema: string;
  destinos: Destino[];
};

// Hash FNV-1a del enunciado: reparte la posición de la respuesta correcta de forma
// pareja y reproducible (sin azar en cada corrida del seed).
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Opción múltiple. `correct` es el índice de la opción correcta *en el orden en
 * que se escribió*; la pregunta exportada reubica esa opción en una posición
 * derivada del enunciado (el resto conserva su orden relativo), para que la
 * correcta no caiga siempre en el mismo lugar.
 */
export function mc(
  tema: string,
  destinos: Destino[],
  texto: string,
  opciones: string[],
  correct: number,
  explicacion: string,
): PreguntaBanco {
  const destino = hash(texto) % opciones.length;
  const resto = opciones.filter((_, i) => i !== correct);
  const reubicadas = [...resto.slice(0, destino), opciones[correct], ...resto.slice(destino)];
  return { texto, opciones: reubicadas, correct: destino, explicacion, formato: Formato.MULTIPLE, tema, destinos };
}

/** Verdadero / Falso. */
export function vf(
  tema: string,
  destinos: Destino[],
  texto: string,
  verdadero: boolean,
  explicacion: string,
): PreguntaBanco {
  return {
    texto,
    opciones: ['Verdadero', 'Falso'],
    correct: verdadero ? 0 : 1,
    explicacion,
    formato: Formato.TRUEFALSE,
    tema,
    destinos,
  };
}

// Destinos frecuentes (materia + unidad según domain/programas.ts del frontend).
export const D = {
  ANAT1_U4: { materiaId: 'mat-anat1', unidad: 4 },   // Osteología
  ANAT1_U5: { materiaId: 'mat-anat1', unidad: 5 },   // Artrología
  ANAT1_U6: { materiaId: 'mat-anat1', unidad: 6 },   // Miología general
  ANAT1_U7: { materiaId: 'mat-anat1', unidad: 7 },   // Miembro superior
  ANAT1_U8: { materiaId: 'mat-anat1', unidad: 8 },   // Miembro inferior
  ANAT1_U9: { materiaId: 'mat-anat1', unidad: 9 },   // Sistema digestivo
  ANAT1_U10: { materiaId: 'mat-anat1', unidad: 10 },  // Sistema nervioso
  ANAT2_U1: { materiaId: 'mat-anat2', unidad: 1 },    // Tronco
  ANAT2_U2: { materiaId: 'mat-anat2', unidad: 2 },    // Respiratorio
  ANAT2_U3: { materiaId: 'mat-anat2', unidad: 3 },    // Circulatorio y sangre
  ANAT2_U4: { materiaId: 'mat-anat2', unidad: 4 },    // Cabeza y cuello
  ANAT2_U5: { materiaId: 'mat-anat2', unidad: 5 },    // Urinario
  ANAT2_U9: { materiaId: 'mat-anat2', unidad: 9 },    // Órganos de los sentidos
  ANAT3_U1: { materiaId: 'mat-anat3', unidad: 1 },    // Tórax
  ANAT3_U2: { materiaId: 'mat-anat3', unidad: 2 },    // Respiratorio
  ANAT3_U3: { materiaId: 'mat-anat3', unidad: 3 },    // Cardiovascular
  ANAT3_U4: { materiaId: 'mat-anat3', unidad: 4 },    // Abdomen y peritoneo
  ANAT3_U5: { materiaId: 'mat-anat3', unidad: 5 },    // Urinario
  ANAT4_U1: { materiaId: 'mat-anat4', unidad: 1 },    // Digestivo
  ANAT4_U2: { materiaId: 'mat-anat4', unidad: 2 },    // Glándulas anexas
  ANAT4_U3: { materiaId: 'mat-anat4', unidad: 3 },    // Motilidad y secreción digestivas
  ANAT4_U5: { materiaId: 'mat-anat4', unidad: 5 },    // Circulatorio
  LABD_U2: { materiaId: 'mat-anat-descriptiva', unidad: 2 },  // Histología: tejidos
  LABD_U3: { materiaId: 'mat-anat-descriptiva', unidad: 3 },  // Circulatorio
  LABD_U4: { materiaId: 'mat-anat-descriptiva', unidad: 4 },  // Respiratorio
  LABD_U5: { materiaId: 'mat-anat-descriptiva', unidad: 5 },  // Urinario
  LABD_U6: { materiaId: 'mat-anat-descriptiva', unidad: 6 },  // Digestivo
  LABF_U2: { materiaId: 'mat-anat-fisiologica', unidad: 2 },  // Fisiología celular y de membrana
  LABF_U3: { materiaId: 'mat-anat-fisiologica', unidad: 3 },  // Urinario
  LABF_U4: { materiaId: 'mat-anat-fisiologica', unidad: 4 },  // Digestivo
  LABF_U5: { materiaId: 'mat-anat-fisiologica', unidad: 5 },  // Circulatorio
  LABF_U6: { materiaId: 'mat-anat-fisiologica', unidad: 6 },  // Respiratorio
  // Hemoterapia (programa provisorio): 1–6 = Lab Descriptiva, 7–12 = Lab Fisiológica.
  HEM_U2: { materiaId: 'mat-ahf-normales', unidad: 2 },   // Histología: tejidos
  HEM_U3: { materiaId: 'mat-ahf-normales', unidad: 3 },   // Circulatorio (descriptiva)
  HEM_U4: { materiaId: 'mat-ahf-normales', unidad: 4 },   // Respiratorio
  HEM_U5: { materiaId: 'mat-ahf-normales', unidad: 5 },   // Urinario
  HEM_U6: { materiaId: 'mat-ahf-normales', unidad: 6 },   // Digestivo
  HEM_U8: { materiaId: 'mat-ahf-normales', unidad: 8 },   // Fisiología celular y de membrana
  HEM_U9: { materiaId: 'mat-ahf-normales', unidad: 9 },   // Urinario (fisiológica)
  HEM_U10: { materiaId: 'mat-ahf-normales', unidad: 10 }, // Digestivo (fisiológica)
  HEM_U11: { materiaId: 'mat-ahf-normales', unidad: 11 }, // Circulatorio (fisiológica)
  HEM_U12: { materiaId: 'mat-ahf-normales', unidad: 12 }, // Respiratorio (fisiológica)
} as const satisfies Record<string, Destino>;
