import { create } from "zustand";
import type { AuthProvider } from "@/app/types/authProvider";
import { nestAuthProvider } from "@/app/providers/nestAuthProvider";

// Lee sincrónicamente desde localStorage para evitar el flash de redirección a /login.
// Usa las mismas claves que nestAuthProvider y api.ts.
function readUserSync(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("ismp-token");
    if (!token) return null;
    const raw = localStorage.getItem("ismp-user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

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
  /** Restore session on mount (reads token + cached user from localStorage). */
  init: () => Promise<void>;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (patch: Partial<User>) => Promise<void>;
};

export function createUserStore(auth: AuthProvider) {
  return create<State>()((set) => ({
    currentUser: readUserSync(),
    init: async () => {
      const user = await auth.getUser();
      set({ currentUser: user });
    },
    login: async (email, password, role) => {
      const user = await auth.login(email, password, role);
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
