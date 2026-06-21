"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore, type Role } from "@/app/store/userStore";
import { ApiError } from "@/app/lib/api";

const ROLE_REDIRECTS: Record<Role, string> = {
  estudiante: "/",
  docente: "/docente",
  admin: "/admin",
};

export default function LoginPage() {
  const router = useRouter();
  const login = useUserStore((s) => s.login);
  const init = useUserStore((s) => s.init);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    init().then(() => {
      const user = useUserStore.getState().currentUser;
      if (user) {
        router.replace(ROLE_REDIRECTS[user.role]);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Completa correo y contraseña para continuar.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // nestAuthProvider ignores the role param and reads it from the backend response
      await login(email.trim(), password, "estudiante");
      const user = useUserStore.getState().currentUser;
      router.push(ROLE_REDIRECTS[user!.role]);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("No se pudo conectar al servidor. Intentá más tarde.");
      }
    } finally {
      setLoading(false);
    }
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

          {error && (
            <p
              className="text-sm"
              style={{ color: "var(--accent)", fontFamily: "var(--font-ibm-plex-serif)" }}
            >
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            ¿Primera vez?{" "}
            <Link href="/register" className="ui-link">
              Registrarse como estudiante
            </Link>
          </p>
          <Link href="/" className="ui-link text-sm">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  );
}
