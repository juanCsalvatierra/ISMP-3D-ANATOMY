"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserMenu } from "./UserMenu";
import { useUserStore } from "@/app/store/userStore";

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

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Desktop + Tablet Nav */}
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

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Abrir menú"
          >
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--text-primary)",
                transform: mobileOpen ? "rotate(45deg) translate(4px, 4px)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--text-primary)",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all duration-200"
              style={{
                background: "var(--text-primary)",
                transform: mobileOpen ? "rotate(-45deg) translate(4px, -4px)" : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl py-6 px-6"
            style={{ background: "var(--bg-panel)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-10 h-1 rounded-full mx-auto mb-6"
              style={{ background: "var(--border-subtle)" }}
            />
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-3"
                  style={{
                    fontFamily: "var(--font-ibm-plex-sans)",
                    fontWeight: 500,
                    fontSize: "1rem",
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

            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              {currentUser ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <p
                      className="text-sm"
                      style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)", fontWeight: 500 }}
                    >
                      {currentUser.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      {currentUser.email} · {currentUser.role}
                    </p>
                  </div>
                  {currentUser.role === "estudiante" && (
                    <Link
                      href="/mis-cuestionarios"
                      onClick={() => setMobileOpen(false)}
                      className="ui-link text-sm"
                    >
                      Mis cuestionarios
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="btn-secondary self-start"
                  >
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary inline-flex"
                >
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
