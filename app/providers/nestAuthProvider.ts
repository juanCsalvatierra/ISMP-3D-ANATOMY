import type { AuthProvider } from "@/app/types/authProvider";
import type { CarreraId } from "@/app/domain/academic";
import type { Role, User } from "@/app/store/userStore";
import { api, setToken, clearToken, getToken, toFrontendRole } from "@/app/lib/api";

const USER_KEY = "ismp-user";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  carreraId: string | null;
};

type LoginResponse = {
  token: string;
  user: BackendUser;
};

function mapUser(backendUser: BackendUser): User {
  return {
    id: backendUser.id,
    name: backendUser.name,
    email: backendUser.email,
    role: toFrontendRole(backendUser.role as "ADMIN" | "DOCENTE" | "ESTUDIANTE"),
    // Phase 0.3: carreraId will be reconciled when academic.ts is updated to use DB ids
    carreraId: (backendUser.carreraId ?? undefined) as CarreraId | undefined,
  };
}

export const nestAuthProvider: AuthProvider = {
  async getUser() {
    if (typeof window === "undefined") return null;
    if (!getToken()) return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  async login(email: string, password: string, _role: Role, _carreraId?: CarreraId) {
    // role and carreraId are ignored: the backend determines them from the DB.
    const res = await api.post<LoginResponse>("/auth/login", { email, password });
    setToken(res.token);
    const user = mapUser(res.user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  async logout() {
    clearToken();
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  async updateUser(patch: Partial<User>) {
    const raw = localStorage.getItem(USER_KEY);
    const current: User = raw ? JSON.parse(raw) : {};
    const updated = { ...current, ...patch };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    return updated;
  },
};
