"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUserStore } from "@/app/store/userStore";

const PUBLIC_ROUTES = ["/login", "/register"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);
  const initialized = useUserStore((s) => s.initialized);
  const init = useUserStore((s) => s.init);

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isPublic && initialized && !currentUser) {
      router.replace("/login");
    }
  }, [isPublic, initialized, currentUser, router]);

  if (isPublic) return <>{children}</>;

  // Mientras se resuelve la sesión, o si no hay usuario (a punto de redirigir),
  // no renderizar contenido protegido — evita flash de páginas restringidas.
  if (!initialized || !currentUser) {
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

  return <>{children}</>;
}
