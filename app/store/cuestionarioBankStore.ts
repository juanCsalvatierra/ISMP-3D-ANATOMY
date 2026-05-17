import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MateriaId } from "@/app/domain/academic";

export type CuestionarioFormato =
  | "multiple"
  | "truefalse"
  | "identification"
  | "labeling";

export type Question = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
};

export type Cuestionario = {
  id: string;
  titulo: string;
  descripcion: string;
  materiaId: MateriaId;
  formato: CuestionarioFormato;
  autorId: string;
  autorNombre: string;
  preguntas: Question[];
  createdAt: string;
  updatedAt: string;
};

export type CuestionarioInput = Omit<
  Cuestionario,
  "id" | "createdAt" | "updatedAt"
>;

type State = {
  cuestionarios: Cuestionario[];
  create: (input: CuestionarioInput) => string;
  update: (id: string, patch: Partial<CuestionarioInput>) => void;
  remove: (id: string) => void;
};

export const FORMATO_LABELS: Record<CuestionarioFormato, string> = {
  multiple: "Opción múltiple",
  truefalse: "Verdadero / Falso",
  identification: "Identificación",
  labeling: "Etiquetado 3D",
};

const SEED_AUTHOR_ID = "seed-docente-1";
const SEED_AUTHOR_NAME = "Prof. Ejemplo";

const SEED: Cuestionario[] = [
  {
    id: "seed-anatomia-1-huesos",
    titulo: "Huesos largos y articulaciones",
    descripcion: "Repaso introductorio del sistema esquelético.",
    materiaId: "anatomia-1",
    formato: "multiple",
    autorId: SEED_AUTHOR_ID,
    autorNombre: SEED_AUTHOR_NAME,
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
    preguntas: [
      {
        id: "q1",
        question: "¿Cuál es el hueso más largo del cuerpo humano?",
        options: ["Tibia", "Húmero", "Fémur", "Peroné"],
        correct: 2,
        explanation:
          "El fémur es el hueso más largo del cuerpo humano, ubicado en el muslo.",
      },
      {
        id: "q2",
        question: "¿Qué hueso protege la articulación de la rodilla?",
        options: ["Tibia", "Rótula", "Fémur", "Fíbula"],
        correct: 1,
        explanation:
          "La rótula (patela) es un hueso sesamoideo que protege la rodilla.",
      },
      {
        id: "q3",
        question: "¿Cuántos huesos tiene el cráneo adulto?",
        options: ["22", "14", "28", "18"],
        correct: 0,
        explanation:
          "El cráneo adulto está compuesto por 22 huesos: 8 del neurocráneo y 14 del viscerocráneo.",
      },
      {
        id: "q4",
        question: "¿Cómo se denomina la unión entre dos o más huesos?",
        options: ["Tendón", "Ligamento", "Articulación", "Cartílago"],
        correct: 2,
        explanation:
          "Una articulación es la unión entre dos o más huesos.",
      },
      {
        id: "q5",
        question: "¿Qué huesos forman el antebrazo?",
        options: [
          "Húmero y radio",
          "Radio y cúbito",
          "Cúbito y fémur",
          "Radio y fíbula",
        ],
        correct: 1,
        explanation:
          "El antebrazo está formado por el radio (lateral) y el cúbito (medial).",
      },
    ],
  },
  {
    id: "seed-anatomia-2-musculos",
    titulo: "Músculos del miembro superior",
    descripcion: "Identifica los principales grupos musculares.",
    materiaId: "anatomia-2",
    formato: "truefalse",
    autorId: SEED_AUTHOR_ID,
    autorNombre: SEED_AUTHOR_NAME,
    createdAt: "2026-03-05T10:00:00.000Z",
    updatedAt: "2026-03-05T10:00:00.000Z",
    preguntas: [
      {
        id: "q1",
        question: "El bíceps braquial es flexor del codo.",
        options: ["Verdadero", "Falso"],
        correct: 0,
        explanation: "El bíceps braquial flexiona el codo y supina el antebrazo.",
      },
      {
        id: "q2",
        question: "El deltoides es un músculo del antebrazo.",
        options: ["Verdadero", "Falso"],
        correct: 1,
        explanation: "El deltoides es un músculo del hombro, no del antebrazo.",
      },
    ],
  },
  {
    id: "seed-anatomia-3-toraco",
    titulo: "Estructuras toracoabdominales",
    descripcion: "Cuestionario introductorio para Radiología.",
    materiaId: "anatomia-3",
    formato: "multiple",
    autorId: SEED_AUTHOR_ID,
    autorNombre: SEED_AUTHOR_NAME,
    createdAt: "2026-03-10T10:00:00.000Z",
    updatedAt: "2026-03-10T10:00:00.000Z",
    preguntas: [
      {
        id: "q1",
        question: "¿Cuántas vértebras componen la columna torácica?",
        options: ["7", "10", "12", "5"],
        correct: 2,
        explanation: "La columna torácica tiene 12 vértebras (T1-T12).",
      },
      {
        id: "q2",
        question: "¿Qué órgano se ubica predominantemente en el cuadrante superior derecho?",
        options: ["Bazo", "Hígado", "Estómago", "Páncreas"],
        correct: 1,
        explanation: "El hígado ocupa el cuadrante superior derecho del abdomen.",
      },
    ],
  },
];

export const useCuestionarioBankStore = create<State>()(
  persist(
    (set) => ({
      cuestionarios: SEED,
      create: (input) => {
        const now = new Date().toISOString();
        const id = crypto.randomUUID();
        set((state) => ({
          cuestionarios: [
            { ...input, id, createdAt: now, updatedAt: now },
            ...state.cuestionarios,
          ],
        }));
        return id;
      },
      update: (id, patch) =>
        set((state) => ({
          cuestionarios: state.cuestionarios.map((c) =>
            c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c
          ),
        })),
      remove: (id) =>
        set((state) => ({
          cuestionarios: state.cuestionarios.filter((c) => c.id !== id),
        })),
    }),
    { name: "ismp-cuestionario-bank", version: 1 }
  )
);

export function byMateria(list: Cuestionario[], materiaId: MateriaId) {
  return list.filter((c) => c.materiaId === materiaId);
}

export function byAutor(list: Cuestionario[], autorId: string) {
  return list.filter((c) => c.autorId === autorId);
}

export function getById(list: Cuestionario[], id: string) {
  return list.find((c) => c.id === id);
}
