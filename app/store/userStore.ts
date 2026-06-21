import { create } from "zustand";
import type { AuthProvider } from "@/app/types/authProvider";
import { nestAuthProvider } from "@/app/providers/nestAuthProvider";

export type Role = "admin" | "docente" | "estudiante";

export type EstadoUsuario = "PENDIENTE" | "ACTIVO";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  dni?: string;
  carreraIds?: string[];
  estado?: EstadoUsuario;
};

type State = {
  currentUser: User | null;
  /** true una vez que init() resolvió — usar para evitar redirects prematuros */
  initialized: boolean;
  /** Restore session on mount (reads token + cached user from localStorage). */
  init: () => Promise<void>;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (patch: Partial<User>) => Promise<void>;
};

export function createUserStore(auth: AuthProvider) {
  return create<State>()((set) => ({
    currentUser: null,
    initialized: false,
    init: async () => {
      const user = await auth.getUser();
      // Actualización atómica: currentUser e initialized en el mismo set
      set({ currentUser: user, initialized: true });
    },
    login: async (email, password, role) => {
      const user = await auth.login(email, password, role);
      set({ currentUser: user, initialized: true });
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
