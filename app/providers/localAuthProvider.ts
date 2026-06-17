import type { AuthProvider } from "@/app/types/authProvider";
import type { CarreraId } from "@/app/domain/academic";
import type { Role, User } from "@/app/store/userStore";

const STORAGE_KEY = "ismp-user";

function nameFromEmail(email: string) {
  const local = email.split("@")[0] || "Usuario";
  return local
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Implementación concreta del mock actual (localStorage).
// Cuando se integre Supabase, se creará supabaseAuthProvider con la misma interfaz.
export const localAuthProvider: AuthProvider = {
  async getUser() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  async login(email: string, _password: string, role: Role, carreraId?: CarreraId) {
    const user: User = {
      id: crypto.randomUUID(),
      name: nameFromEmail(email),
      email,
      role,
      carreraId: role === "estudiante" ? carreraId : undefined,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    localStorage.removeItem(STORAGE_KEY);
  },

  async updateUser(patch: Partial<User>) {
    const raw = localStorage.getItem(STORAGE_KEY);
    const current: User = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};
