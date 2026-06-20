import { create } from "zustand";
import type { CarreraId } from "@/app/domain/academic";
import type { AuthProvider } from "@/app/types/authProvider";
import { nestAuthProvider } from "@/app/providers/nestAuthProvider";

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
  /** Restore session on mount (reads token + cached user from localStorage). */
  init: () => Promise<void>;
  login: (email: string, password: string, role: Role, carreraId?: CarreraId) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (patch: Partial<User>) => Promise<void>;
};

export function createUserStore(auth: AuthProvider) {
  return create<State>()((set) => ({
    currentUser: null,
    init: async () => {
      const user = await auth.getUser();
      set({ currentUser: user });
    },
    login: async (email, password, role, carreraId) => {
      const user = await auth.login(email, password, role, carreraId);
      set({ currentUser: user });
    },
    logout: async () => {
      await auth.logout();
      set({ currentUser: null });
    },
    updateCurrentUser: async (patch) => {
      const user = await auth.updateUser(patch);
      set({ currentUser: user });
    },
  }));
}

export const useUserStore = createUserStore(nestAuthProvider);

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  docente: "Docente",
  estudiante: "Estudiante",
};
