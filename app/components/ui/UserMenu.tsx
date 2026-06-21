"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore, ROLE_LABELS } from "@/app/store/userStore";
import { useHydrated } from "@/app/store/useHydrated";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

export function UserMenu() {
  const router = useRouter();
  const currentUser = useUserStore((s) => s.currentUser);
  const logout = useUserStore((s) => s.logout);

  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (!hydrated) {
    return <div style={{ width: 80 }} aria-hidden />;
  }

  if (!currentUser) {
    return (
      <Link
        href="/login"
        className="text-sm px-3 py-1.5 rounded-md transition-colors"
        style={{
          fontFamily: "var(--font-ibm-plex-sans)",
          fontWeight: 500,
          color: "var(--text-primary)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        Iniciar sesión
      </Link>
    );
  }

  const studentLinks =
    currentUser.role === "estudiante"
      ? [{ label: "Mis cuestionarios", href: "/mis-cuestionarios" }]
      : [];

  const roleHomeLink =
    currentUser.role === "admin"
      ? { label: "Panel admin", href: "/admin" }
      : currentUser.role === "docente"
      ? { label: "Panel docente", href: "/docente" }
      : null;

  const teacherLinks =
    currentUser.role === "docente" || currentUser.role === "admin"
      ? [{ label: "Agregar pregunta", href: "/docente/cuestionarios/nuevo" }]
      : [];

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors"
        style={{ color: "var(--text-primary)" }}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: "var(--accent)",
            color: "white",
            fontFamily: "var(--font-ibm-plex-mono)",
          }}
        >
          {initials(currentUser.name)}
        </span>
        <span
          className="hidden sm:flex flex-col text-left leading-tight"
          style={{ fontFamily: "var(--font-ibm-plex-sans)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
            {currentUser.name}
          </span>
          <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {ROLE_LABELS[currentUser.role]}
          </span>
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden"
          style={{
            background: "var(--bg-panel)",
            border: "1px solid var(--border-subtle)",
            zIndex: 60,
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)", fontWeight: 500 }}
            >
              {currentUser.name}
            </p>
            <p
              className="text-xs truncate"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              {currentUser.email}
            </p>
            <p
              className="text-[10px] mt-1 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--accent)" }}
            >
              {ROLE_LABELS[currentUser.role]}
            </p>
          </div>
          <nav className="flex flex-col py-1">
            {roleHomeLink && (
              <Link
                href={roleHomeLink.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm transition-colors"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                {roleHomeLink.label}
              </Link>
            )}
            {currentUser.role === "admin" && (
              <Link
                href="/admin/usuarios"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm transition-colors"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                Usuarios
              </Link>
            )}
            {studentLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm transition-colors"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                {l.label}
              </Link>
            ))}
            {teacherLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm transition-colors"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                {l.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-left transition-colors"
              style={{
                fontFamily: "var(--font-ibm-plex-sans)",
                color: "var(--accent)",
                borderTop: "1px solid var(--border-subtle)",
              }}
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
