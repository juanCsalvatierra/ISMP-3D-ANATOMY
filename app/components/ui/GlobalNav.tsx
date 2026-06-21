"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "./UserMenu";
import { useUserStore, ROLE_LABELS } from "@/app/store/userStore";

const NAV_LINKS = [
  { label: "Esqueleto", href: "/skeleton" },
  { label: "Músculos", href: "/muscles" },
  { label: "Imágenes", href: "/imaging" },
  { label: "Cuestionarios", href: "/cuestionarios" },
];

export function GlobalNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = useUserStore((s) => s.currentUser);
  const logout = useUserStore((s) => s.logout);
  const init = useUserStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const roleHomeLink =
    currentUser?.role === "admin"
      ? { label: "Panel admin", href: "/admin" }
      : currentUser?.role === "docente"
      ? { label: "Panel docente", href: "/docente" }
      : null;

  const teacherLinks =
    currentUser?.role === "docente" || currentUser?.role === "admin"
      ? [{ label: "Agregar pregunta", href: "/docente/cuestionarios/nuevo" }]
      : [];

  return (
    <>
      {/* Header */}
      <header
        className="sticky top-0 z-50 w-full border-b"
        style={{
          background: "var(--bg-page)",
          borderColor: "var(--border-subtle)",
          height: "48px",
        }}
      >
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <span
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
            >
              ISMP
            </span>
            <span
              className="hidden sm:block w-px h-4"
              style={{ background: "var(--border-subtle)" }}
            />
            <span
              className="hidden sm:block text-sm font-normal"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              3D Anatomy
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1 h-full">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center px-3 h-full text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  fontWeight: 500,
                  color: isActive(link.href) ? "var(--text-primary)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-primary)")
                }
                onMouseLeave={(e) => {
                  if (!isActive(link.href))
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }}
              >
                {link.label}
                {isActive(link.href) && (
                  <span
                    className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* User menu (desktop) */}
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile Hamburger / X */}
          <button
            className="md:hidden p-2 rounded"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M4 4L16 16M16 4L4 16"
                  stroke="var(--text-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M3 5h14M3 10h14M3 15h14"
                  stroke="var(--text-primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer — slide in from right, below header */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "48px", background: "rgba(0,0,0,0.4)" }}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={`absolute top-0 right-0 h-full w-72 max-w-[85vw] flex flex-col transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
          style={{
            background: "var(--bg-panel)",
            borderLeft: "1px solid var(--border-subtle)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nav links */}
          <nav className="flex flex-col px-4 pt-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 py-3"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  fontWeight: 500,
                  fontSize: "0.9375rem",
                  color: isActive(link.href) ? "var(--accent)" : "var(--text-primary)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                {isActive(link.href) && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div
            className="flex flex-col gap-1 px-4 pt-4 mt-auto pb-6"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            {currentUser ? (
              <>
                {/* User info */}
                <div className="pb-3 mb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <p
                    className="text-sm font-medium"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
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

                {/* Role-specific links */}
                {roleHomeLink && (
                  <Link
                    href={roleHomeLink.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                  >
                    {roleHomeLink.label}
                  </Link>
                )}
                {currentUser.role === "admin" && (
                  <Link
                    href="/admin/usuarios"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                  >
                    Usuarios
                  </Link>
                )}
                {currentUser.role === "estudiante" && (
                  <Link
                    href="/mis-cuestionarios"
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                  >
                    Mis cuestionarios
                  </Link>
                )}
                {teacherLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="py-2 text-sm"
                    style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                  >
                    {l.label}
                  </Link>
                ))}

                <button
                  onClick={async () => {
                    await logout();
                    setMobileOpen(false);
                    window.location.href = "/login";
                  }}
                  className="mt-2 py-2 text-sm text-left"
                  style={{
                    fontFamily: "var(--font-ibm-plex-sans)",
                    color: "var(--accent)",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="btn-primary inline-flex self-start"
              >
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
