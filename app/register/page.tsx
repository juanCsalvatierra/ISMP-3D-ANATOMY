"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/app/lib/api";
import { CARRERAS, CARRERA_IDS, type CarreraId } from "@/app/domain/academic";
import { useUserStore } from "@/app/store/userStore";

type FormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  carreraIds: CarreraId[];
};

const EMPTY: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  carreraIds: [],
};

export default function RegisterPage() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);
  const init = useUserStore((s) => s.init);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    init().then(() => {
      const user = useUserStore.getState().currentUser;
      if (user) {
        // Ya hay sesión activa — redirigir según rol
        const dest = user.role === "admin" ? "/admin" : user.role === "docente" ? "/docente" : "/";
        router.replace(dest);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCarrera = (cid: CarreraId) => {
    const has = form.carreraIds.includes(cid);
    setForm({
      ...form,
      carreraIds: has
        ? form.carreraIds.filter((c) => c !== cid)
        : [...form.carreraIds, cid],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    if (!form.password) {
      setError("La contraseña es obligatoria.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.post<{ message: string; activationCode: string }>(
        "/users/register",
        {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          carreraIds: form.carreraIds,
        },
      );
      setActivationCode(res.activationCode);
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

  const handleCopy = async () => {
    if (!activationCode) return;
    await navigator.clipboard.writeText(activationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (activationCode) {
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
              ¡Registro exitoso!
            </h1>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              Tu cuenta fue creada. Para activarla, entregá este código a un administrador.
            </p>
          </div>

          <div
            className="ui-panel rounded-2xl p-6 flex flex-col gap-5"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <div>
              <p
                className="text-xs uppercase tracking-wider mb-3"
                style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
              >
                Tu código de activación
              </p>
              <div
                className="flex items-center justify-between gap-4 rounded-xl px-5 py-4"
                style={{
                  background: "var(--bg-canvas)",
                  border: "2px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                }}
              >
                <span
                  className="text-3xl font-bold tracking-[0.2em]"
                  style={{
                    fontFamily: "var(--font-ibm-plex-mono)",
                    color: "var(--accent)",
                  }}
                >
                  {activationCode}
                </span>
                <button
                  className="btn-ghost text-sm shrink-0"
                  onClick={handleCopy}
                  style={{ color: copied ? "#16a34a" : "var(--text-secondary)" }}
                >
                  {copied ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
            </div>

            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: "var(--bg-canvas)",
                border: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-ibm-plex-serif)",
                color: "var(--text-secondary)",
                lineHeight: "1.6",
              }}
            >
              <strong style={{ color: "var(--text-primary)" }}>Próximos pasos:</strong>
              <ol className="mt-2 flex flex-col gap-1 list-decimal list-inside">
                <li>Anotá o copiá el código de arriba.</li>
                <li>Entregáselo a un administrador del sistema.</li>
                <li>Una vez activada tu cuenta, podrás iniciar sesión normalmente.</li>
              </ol>
            </div>

            <Link href="/login" className="btn-primary w-full justify-center text-center">
              Ir al inicio de sesión
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
            Crear cuenta
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Registrate como estudiante. Un administrador activará tu cuenta.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="ui-panel rounded-2xl p-6 flex flex-col gap-5"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          {/* Nombre */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Nombre completo *
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              className="ui-input"
              placeholder="Ej: María García"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Correo electrónico *
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="ui-input"
              placeholder="tu.correo@ejemplo.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Contraseña *
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="ui-input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Confirmar contraseña *
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="ui-input"
              placeholder="Repetí la contraseña"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>

          {/* Carreras (optional) */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Carrera(s) <span style={{ color: "var(--text-muted)" }}>(opcional)</span>
            </label>
            <div className="flex flex-col gap-2">
              {CARRERA_IDS.map((cid) => {
                const checked = form.carreraIds.includes(cid);
                return (
                  <label
                    key={cid}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{
                      background: checked
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : "var(--bg-canvas)",
                      border: `1px solid ${
                        checked
                          ? "color-mix(in srgb, var(--accent) 40%, transparent)"
                          : "var(--border-subtle)"
                      }`,
                      fontFamily: "var(--font-ibm-plex-sans)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCarrera(cid)}
                      style={{ accentColor: "var(--accent)" }}
                    />
                    <span className="text-sm">{CARRERAS[cid].label}</span>
                  </label>
                );
              })}
            </div>
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
            {loading ? "Registrando…" : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="ui-link">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
