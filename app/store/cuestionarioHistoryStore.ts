import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MateriaId } from "@/app/domain/academic";

export type CuestionarioAttempt = {
  id: string;
  userId: string | null;
  cuestionarioId: string;
  materiaId: MateriaId;
  format: string;
  score: number;
  total: number;
  completedAt: string;
};

type State = {
  attempts: CuestionarioAttempt[];
  addAttempt: (attempt: Omit<CuestionarioAttempt, "id" | "completedAt">) => void;
  clearForUser: (userId: string) => void;
};

export const useCuestionarioHistoryStore = create<State>()(
  persist(
    (set) => ({
      attempts: [],
      addAttempt: (attempt) =>
        set((state) => ({
          attempts: [
            {
              ...attempt,
              id: crypto.randomUUID(),
              completedAt: new Date().toISOString(),
            },
            ...state.attempts,
          ],
        })),
      clearForUser: (userId) =>
        set((state) => ({
          attempts: state.attempts.filter((a) => a.userId !== userId),
        })),
    }),
    { name: "ismp-cuestionario-history" }
  )
);
