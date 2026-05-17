import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Role, User } from "./userStore";
import type { CarreraId } from "@/app/domain/academic";

export type ManagedUser = User;

type ManagedInput = Omit<ManagedUser, "id">;

type State = {
  users: ManagedUser[];
  create: (input: ManagedInput) => string;
  update: (id: string, patch: Partial<ManagedInput>) => void;
  remove: (id: string) => void;
};

const SEED: ManagedUser[] = [
  {
    id: "seed-docente-1",
    name: "Prof. Ejemplo",
    email: "docente@ismp.edu",
    role: "docente",
  },
  {
    id: "seed-docente-2",
    name: "Dra. Núñez",
    email: "nunez@ismp.edu",
    role: "docente",
  },
  {
    id: "seed-estudiante-1",
    name: "Lucía Pérez",
    email: "lucia.perez@ismp.edu",
    role: "estudiante",
    carreraId: "instrumentacion",
  },
  {
    id: "seed-estudiante-2",
    name: "Mateo Rivas",
    email: "mateo.rivas@ismp.edu",
    role: "estudiante",
    carreraId: "instrumentacion",
  },
  {
    id: "seed-estudiante-3",
    name: "Sofía Romero",
    email: "sofia.romero@ismp.edu",
    role: "estudiante",
    carreraId: "radiologia",
  },
  {
    id: "seed-estudiante-4",
    name: "Bruno Alonso",
    email: "bruno.alonso@ismp.edu",
    role: "estudiante",
    carreraId: "radiologia",
  },
  {
    id: "seed-admin-1",
    name: "Admin ISMP",
    email: "admin@ismp.edu",
    role: "admin",
  },
];

export const useUsersStore = create<State>()(
  persist(
    (set) => ({
      users: SEED,
      create: (input) => {
        const id = crypto.randomUUID();
        set((state) => ({ users: [{ ...input, id }, ...state.users] }));
        return id;
      },
      update: (id, patch) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
      remove: (id) =>
        set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
    }),
    { name: "ismp-users", version: 1 }
  )
);

export function findByEmail(users: ManagedUser[], email: string) {
  const normalized = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === normalized);
}

export function filterByRole(users: ManagedUser[], role: Role) {
  return users.filter((u) => u.role === role);
}

export function filterByCarrera(users: ManagedUser[], carreraId: CarreraId) {
  return users.filter((u) => u.carreraId === carreraId);
}
