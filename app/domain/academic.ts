// Estructura académica: carreras y materias de anatomía.
//
// Los ids deben coincidir con los registros seedeados en backend/prisma/seed.ts.
// Anatomía I y II son compartidas por Radiología e Instrumentación Quirúrgica
// (una sola materia con la unión de ambos programas; ver domain/programas.ts).
export type CarreraId = "carrera-iq" | "carrera-rad" | "carrera-hem" | "carrera-lab";
export type MateriaId =
  | "mat-anat1"
  | "mat-anat2"
  | "mat-anat3"
  | "mat-anat4"
  | "mat-anat-descriptiva"
  | "mat-anat-fisiologica"
  | "mat-ahf-normales";

export const CARRERAS: Record<CarreraId, { label: string; materias: MateriaId[] }> = {
  "carrera-iq": {
    label: "Instrumentación Quirúrgica",
    materias: ["mat-anat1", "mat-anat2"],
  },
  "carrera-rad": {
    label: "Radiología",
    materias: ["mat-anat1", "mat-anat2", "mat-anat3", "mat-anat4"],
  },
  "carrera-hem": {
    label: "Hemoterapia",
    materias: ["mat-ahf-normales"],
  },
  "carrera-lab": {
    label: "Laboratorio de Análisis Clínicos",
    materias: ["mat-anat-descriptiva", "mat-anat-fisiologica"],
  },
};

export const MATERIAS: Record<MateriaId, { label: string }> = {
  "mat-anat1": { label: "Anatomía I" },
  "mat-anat2": { label: "Anatomía II" },
  "mat-anat3": { label: "Anatomía III" },
  "mat-anat4": { label: "Anatomía IV" },
  "mat-anat-descriptiva": { label: "Anatomía Descriptiva" },
  "mat-anat-fisiologica": { label: "Anatomía Fisiológica" },
  "mat-ahf-normales": { label: "Anatomía, Histología y Fisiología normales" },
};

export const CARRERA_IDS = Object.keys(CARRERAS) as CarreraId[];
export const MATERIA_IDS = Object.keys(MATERIAS) as MateriaId[];

export function materiasDeCarrera(carreraId: CarreraId): MateriaId[] {
  return CARRERAS[carreraId]?.materias ?? [];
}

export function carrerasDeMateria(materiaId: MateriaId): CarreraId[] {
  return CARRERA_IDS.filter((c) => CARRERAS[c].materias.includes(materiaId));
}

/**
 * Materias que ve un usuario según sus carreras. Sin carreras válidas (admin,
 * docente, anónimo) → todas.
 */
export function materiasParaCarreras(carreraIds: readonly string[] | null | undefined): MateriaId[] {
  const validas = (carreraIds ?? []).filter((c): c is CarreraId => c in CARRERAS);
  if (validas.length === 0) return MATERIA_IDS;
  return MATERIA_IDS.filter((m) => validas.some((c) => CARRERAS[c].materias.includes(m)));
}

/** Primera carrera del usuario que cursa la materia (define qué unidades le corresponden). */
export function carreraDeUsuarioParaMateria(
  carreraIds: readonly string[] | null | undefined,
  materiaId: MateriaId,
): CarreraId | undefined {
  return (carreraIds ?? []).find(
    (c): c is CarreraId => c in CARRERAS && CARRERAS[c as CarreraId].materias.includes(materiaId),
  );
}
