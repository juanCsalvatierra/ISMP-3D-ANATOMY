"use client";
import Link from "next/link";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUserStore } from "@/app/store/userStore";

const CARDS = [
  {
    label: "Usuarios",
    desc: "Alta, baja y asignación de carreras a estudiantes.",
    href: "/admin/usuarios",
    ready: true,
  },
  {
    label: "Cuestionarios",
    desc: "Gestionar cuestionarios de todos los docentes.",
    href: "/docente",
    ready: true,
  },
  {
    label: "Carreras",
    desc: "Configurar carreras y materias (próximamente).",
    href: "#",
    ready: false,
  },
  {
    label: "Contenido 3D",
    desc: "Editar descripciones del modelo (próximamente).",
    href: "#",
    ready: false,
  },
];

function AdminDashboard() {
  const currentUser = useUserStore((s) => s.currentUser)!;
  return (
    <main style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Panel administrador
          </h1>
          <p
            className="text-sm"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Hola {currentUser.name}, gestioná los recursos de la plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map((c) => {
            const content = (
              <>
                <div className="flex items-baseline justify-between mb-2">
                  <h2
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                  >
                    {c.label}
                  </h2>
                  {!c.ready && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "var(--bg-elevated)",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-ibm-plex-mono)",
                      }}
                    >
                      pronto
                    </span>
                  )}
                </div>
                <p
                  className="text-sm"
                  style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
                >
                  {c.desc}
                </p>
              </>
            );
            return c.ready ? (
              <Link
                key={c.label}
                href={c.href}
                className="ui-panel rounded-2xl p-6 transition-all"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                {content}
              </Link>
            ) : (
              <div
                key={c.label}
                className="ui-panel rounded-2xl p-6 opacity-60"
                style={{ border: "1px solid var(--border-subtle)" }}
              >
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <RoleGate allowedRoles={["admin"]}>
      <AdminDashboard />
    </RoleGate>
  );
}
