export type CarreraId = "carrera-iq" | "carrera-rad" | "carrera-hem";
export type MateriaId = "mat-anat1" | "mat-anat2" | "mat-anat3" | "mat-anat4";

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
    materias: ["mat-anat1"],
  },
};

export const MATERIAS: Record<MateriaId, { label: string }> = {
  "mat-anat1": { label: "Anatomía I" },
  "mat-anat2": { label: "Anatomía II" },
  "mat-anat3": { label: "Anatomía III" },
  "mat-anat4": { label: "Anatomía IV" },
};

export const CARRERA_IDS = Object.keys(CARRERAS) as CarreraId[];
export const MATERIA_IDS = Object.keys(MATERIAS) as MateriaId[];

export function materiasDeCarrera(carreraId: CarreraId): MateriaId[] {
  return CARRERAS[carreraId]?.materias ?? [];
}

export function carrerasDeMateria(materiaId: MateriaId): CarreraId[] {
  return CARRERA_IDS.filter((c) => CARRERAS[c].materias.includes(materiaId));
}
