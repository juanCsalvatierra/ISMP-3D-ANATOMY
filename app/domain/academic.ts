export type CarreraId = "instrumentacion" | "radiologia";
export type MateriaId = "anatomia-1" | "anatomia-2" | "anatomia-3" | "anatomia-4";

export const CARRERAS: Record<CarreraId, { label: string; materias: MateriaId[] }> = {
  instrumentacion: {
    label: "Instrumentación Quirúrgica",
    materias: ["anatomia-1", "anatomia-2"],
  },
  radiologia: {
    label: "Radiología",
    materias: ["anatomia-1", "anatomia-2", "anatomia-3", "anatomia-4"],
  },
};

export const MATERIAS: Record<MateriaId, { label: string }> = {
  "anatomia-1": { label: "Anatomía I" },
  "anatomia-2": { label: "Anatomía II" },
  "anatomia-3": { label: "Anatomía III" },
  "anatomia-4": { label: "Anatomía IV" },
};

export const CARRERA_IDS = Object.keys(CARRERAS) as CarreraId[];
export const MATERIA_IDS = Object.keys(MATERIAS) as MateriaId[];

export function materiasDeCarrera(carreraId: CarreraId): MateriaId[] {
  return CARRERAS[carreraId]?.materias ?? [];
}

export function carrerasDeMateria(materiaId: MateriaId): CarreraId[] {
  return CARRERA_IDS.filter((c) => CARRERAS[c].materias.includes(materiaId));
}
