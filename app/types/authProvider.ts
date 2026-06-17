import type { CarreraId } from "@/app/domain/academic";
import type { Role, User } from "@/app/store/userStore";

// DIP: abstracción que desacopla el store de cualquier implementación de persistencia.
// Cambiar de localStorage a Supabase solo requiere implementar esta interfaz.
export interface AuthProvider {
  getUser(): Promise<User | null>;
  login(email: string, password: string, role: Role, carreraId?: CarreraId): Promise<User>;
  logout(): Promise<void>;
  updateUser(patch: Partial<User>): Promise<User>;
}
