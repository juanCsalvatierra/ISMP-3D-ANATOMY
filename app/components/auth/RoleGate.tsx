"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUserStore, ROLE_LABELS, type Role } from "@/app/store/userStore";

type Props = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

export function RoleGate({ allowedRoles, children }: Props) {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);
  const initialized = useUserStore((s) => s.initialized);

  useEffect(() => {
    if (initialized && !currentUser) {
      router.replace("/login");
    }
  }, [initialized, currentUser, router]);

  // Esperar a que init() resuelva — evita redirección prematura a /login
  if (!initialized) {
    return (
      <main
        style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}
        className="flex items-center justify-center"
      >
        <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }}>
          Cargando…
        </p>
      </main>
    );
  }

  if (!currentUser) return null;

  if (!allowedRoles.includes(currentUser.role)) {
    return (
      <main
        style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}
        className="flex items-center justify-center px-6"
      >
        <div className="ui-panel rounded-2xl p-8 max-w-md text-center" style={{ border: "1px solid var(--border-subtle)" }}>
          <h1
            className="text-xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
          >
            Acceso restringido
          </h1>
          <p
            className="text-sm mb-6"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Esta sección está reservada para: {allowedRoles.map((r) => ROLE_LABELS[r]).join(", ")}.
            Tu rol actual es {ROLE_LABELS[currentUser.role]}.
          </p>
          <Link href="/" className="btn-primary inline-flex">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
