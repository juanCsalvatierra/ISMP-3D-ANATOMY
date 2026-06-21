import { create } from "zustand";
import type { Role, User } from "./userStore";
import type { CarreraId } from "@/app/domain/academic";
import { api, toFrontendRole } from "@/app/lib/api";

export type ManagedUser = User;

type BackendUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  dni?: string | null;
  estado?: "PENDIENTE" | "ACTIVO";
  carreras?: { carreraId: string }[];
};

function mapUser(u: BackendUser): ManagedUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role ? toFrontendRole(u.role as Parameters<typeof toFrontendRole>[0]) : "estudiante",
    dni: u.dni ?? undefined,
    estado: u.estado,
    carreraIds: u.carreras?.map((c) => c.carreraId as CarreraId) ?? [],
  };
}

type CreateInput = Omit<ManagedUser, "id"> & { password: string };
type UpdateInput = Partial<Omit<ManagedUser, "id">> & { password?: string };

type State = {
  users: ManagedUser[];
  loading: boolean;
  error: string | null;
  fetch: (filters?: { role?: Role }) => Promise<void>;
  search: (query: string) => Promise<void>;
  create: (input: CreateInput) => Promise<string>;
  update: (id: string, patch: UpdateInput) => Promise<void>;
  remove: (id: string) => Promise<void>;
  activate: (code: string) => Promise<void>;
};

export const useUsersStore = create<State>()((set) => ({
  users: [],
  loading: false,
  error: null,

  fetch: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.set("role", filters.role.toUpperCase());
      const qs = params.toString();
      const data = await api.get<BackendUser[]>(`/users${qs ? `?${qs}` : ""}`);
      set({ users: data.map(mapUser), loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar usuarios";
      set({ error: message, loading: false });
    }
  },

  search: async (query) => {
    if (!query.trim()) {
      set({ loading: true, error: null });
      try {
        const data = await api.get<BackendUser[]>("/users");
        set({ users: data.map(mapUser), loading: false });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al cargar usuarios";
        set({ error: message, loading: false });
      }
      return;
    }
    set({ loading: true, error: null });
    try {
      const data = await api.get<BackendUser[]>(
        `/users/search?search=${encodeURIComponent(query)}`,
      );
      set({ users: data.map(mapUser), loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al buscar usuarios";
      set({ error: message, loading: false });
    }
  },

  create: async (input) => {
    const data = await api.post<BackendUser>("/users", {
      name: input.name,
      email: input.email,
      ...(input.dni ? { dni: input.dni } : {}),
      password: input.password,
      role: input.role.toUpperCase(),
      carreraIds: input.carreraIds ?? [],
    });
    const newUser = mapUser(data);
    set((state) => ({ users: [newUser, ...state.users] }));
    return newUser.id;
  },

  update: async (id, patch) => {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.email !== undefined) payload.email = patch.email;
    if (patch.dni !== undefined) payload.dni = patch.dni || null;
    if (patch.role !== undefined) payload.role = patch.role.toUpperCase();
    if (patch.carreraIds !== undefined) payload.carreraIds = patch.carreraIds;
    if (patch.password) payload.password = patch.password;
    const data = await api.patch<BackendUser>(`/users/${id}`, payload);
    const updated = mapUser(data);
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? updated : u)),
    }));
  },

  remove: async (id) => {
    await api.delete(`/users/${id}`);
    set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
  },

  activate: async (code) => {
    await api.post("/users/activate", { code });
    const data = await api.get<BackendUser[]>("/users");
    set({ users: data.map(mapUser) });
  },
}));

export function findByEmail(users: ManagedUser[], email: string) {
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export function filterByRole(users: ManagedUser[], role: Role) {
  return users.filter((u) => u.role === role);
}

export function filterByCarrera(users: ManagedUser[], carreraId: CarreraId) {
  return users.filter((u) => u.carreraIds?.includes(carreraId));
}
