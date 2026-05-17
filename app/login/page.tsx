"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore, ROLE_LABELS, type Role } from "@/app/store/userStore";
import { useUsersStore, findByEmail } from "@/app/store/usersStore";

const ROLES: Role[] = ["estudiante", "docente", "admin"];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  estudiante: "Acceso a cuestionarios e historial de resultados.",
  docente: "Creación de cuestionarios y seguimiento de estudiantes.",
  admin: "Gestión de usuarios, contenido y cuestionarios.",
};

const ROLE_REDIRECTS: Record<Role, string> = {
  estudiante: "/",
  docente: "/docente",
  admin: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);
  const users = useUsersStore((s) => s.users);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("estudiante");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Completa correo y contraseña para continuar.");
      return;
    }
    setError(null);

    const existing = findByEmail(users, email);
    const finalRole: Role = existing?.role ?? role;
    const finalCarrera =
      finalRole === "estudiante" ? existing?.carreraId : undefined;

    login(email.trim(), password, finalRole, finalCarrera);
    router.push(ROLE_REDIRECTS[finalRole]);
  };

  return (
    <main
      style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}
      className="flex items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Iniciar sesión
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Accede a ISMP 3D Anatomy según tu rol en la plataforma.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ui-panel rounded-2xl p-6 flex flex-col gap-5"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="ui-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu.correo@ejemplo.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="ui-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Rol
            </span>
            <div
              className="grid grid-cols-3 gap-1 p-1 rounded-lg"
              style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}
            >
              {ROLES.map((r) => {
                const active = role === r;
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className="py-2 px-2 rounded-md text-sm transition-colors"
                    style={{
                      fontFamily: "var(--font-ibm-plex-sans)",
                      fontWeight: 500,
                      background: active ? "var(--accent)" : "transparent",
                      color: active ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>

          {role === "estudiante" && (
            <p
              className="text-xs leading-relaxed"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              La carrera la asigna el administrador. Si tu correo no figura en el sistema, vas a ver un aviso al ingresar a Cuestionarios.
            </p>
          )}

          {error && (
            <p
              className="text-sm"
              style={{ color: "var(--accent)", fontFamily: "var(--font-ibm-plex-serif)" }}
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full justify-center">
            Ingresar
          </button>

          <p
            className="text-xs text-center"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Sesión simulada — aún no hay backend. Cualquier correo y contraseña funciona.
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="ui-link text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
