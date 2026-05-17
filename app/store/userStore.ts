import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CarreraId } from "@/app/domain/academic";

export type Role = "admin" | "docente" | "estudiante";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  carreraId?: CarreraId;
};

type State = {
  currentUser: User | null;
  login: (email: string, password: string, role: Role, carreraId?: CarreraId) => void;
  logout: () => void;
  updateCurrentUser: (patch: Partial<User>) => void;
};

function nameFromEmail(email: string) {
  const local = email.split("@")[0] || "Usuario";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const useUserStore = create<State>()(
  persist(
    (set) => ({
      currentUser: null,
      login: (email, _password, role, carreraId) =>
        set({
          currentUser: {
            id: crypto.randomUUID(),
            name: nameFromEmail(email),
            email,
            role,
            carreraId: role === "estudiante" ? carreraId : undefined,
          },
        }),
      logout: () => set({ currentUser: null }),
      updateCurrentUser: (patch) =>
        set((state) => ({
          currentUser: state.currentUser ? { ...state.currentUser, ...patch } : null,
        })),
    }),
    { name: "ismp-user" }
  )
);

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  docente: "Docente",
  estudiante: "Estudiante",
};
