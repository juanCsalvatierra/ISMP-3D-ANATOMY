import { create } from "zustand";
import type { CarreraId } from "@/app/domain/academic";
import type { AuthProvider } from "@/app/types/authProvider";
import { localAuthProvider } from "@/app/providers/localAuthProvider";

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
  login: (email: string, password: string, role: Role, carreraId?: CarreraId) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (patch: Partial<User>) => Promise<void>;
};

// DIP: el store depende de la abstracción AuthProvider, no de localStorage directamente.
// Para migrar a Supabase: createUserStore(supabaseAuthProvider).
export function createUserStore(auth: AuthProvider) {
  return create<State>()((set) => ({
    currentUser: null,
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

// Instancia por defecto con el proveedor local (mock).
// Reemplazar por createUserStore(supabaseAuthProvider) al integrar Supabase.
export const useUserStore = createUserStore(localAuthProvider);

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrador",
  docente: "Docente",
  estudiante: "Estudiante",
};
