"use client";
import { useMemo, useState } from "react";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUsersStore, type ManagedUser } from "@/app/store/usersStore";
import { ROLE_LABELS, type Role } from "@/app/store/userStore";
import { CARRERAS, type CarreraId } from "@/app/domain/academic";

const ROLES: Role[] = ["estudiante", "docente", "admin"];

type Draft = {
  id?: string;
  name: string;
  email: string;
  role: Role;
  carreraId?: CarreraId;
};

const EMPTY: Draft = {
  name: "",
  email: "",
  role: "estudiante",
  carreraId: "instrumentacion",
};

function UsuariosView() {
  const users = useUsersStore((s) => s.users);
  const create = useUsersStore((s) => s.create);
  const update = useUsersStore((s) => s.update);
  const remove = useUsersStore((s) => s.remove);

  const [filtroRol, setFiltroRol] = useState<Role | "all">("all");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () => (filtroRol === "all" ? users : users.filter((u) => u.role === filtroRol)),
    [users, filtroRol]
  );

  const startCreate = () => {
    setDraft({ ...EMPTY });
    setError(null);
  };

  const startEdit = (u: ManagedUser) => {
    setDraft({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      carreraId: u.carreraId ?? "instrumentacion",
    });
    setError(null);
  };

  const handleSave = () => {
    if (!draft) return;
    if (!draft.name.trim() || !draft.email.trim()) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    const payload = {
      name: draft.name.trim(),
      email: draft.email.trim(),
      role: draft.role,
      carreraId: draft.role === "estudiante" ? draft.carreraId : undefined,
    };
    if (draft.id) update(draft.id, payload);
    else create(payload);
    setDraft(null);
    setError(null);
  };

  const handleDelete = (u: ManagedUser) => {
    if (typeof window !== "undefined" && window.confirm(`¿Eliminar a ${u.name}?`)) {
      remove(u.id);
    }
  };

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "calc(100vh - 48px)" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1
              className="text-2xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
            >
              Usuarios
            </h1>
            <p
              className="text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              Gestiona alumnos, docentes y administradores.
            </p>
          </div>
          <button className="btn-primary" onClick={startCreate}>
            + Nuevo usuario
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", ...ROLES] as const).map((r) => {
            const active = filtroRol === r;
            return (
              <button
                key={r}
                onClick={() => setFiltroRol(r)}
                className="px-3 py-1 rounded-md text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  background: active ? "var(--accent)" : "var(--bg-panel)",
                  color: active ? "white" : "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {r === "all" ? "Todos" : ROLE_LABELS[r]}
              </button>
            );
          })}
        </div>

        <div
          className="ui-panel rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <table className="w-full text-sm" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
            <thead>
              <tr style={{ background: "var(--bg-canvas)", color: "var(--text-muted)" }}>
                <th className="text-left px-4 py-2 font-medium">Nombre</th>
                <th className="text-left px-4 py-2 font-medium">Email</th>
                <th className="text-left px-4 py-2 font-medium">Rol</th>
                <th className="text-left px-4 py-2 font-medium">Carrera</th>
                <th className="text-right px-4 py-2 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Sin usuarios para este filtro.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>{u.name}</td>
                    <td
                      className="px-4 py-2"
                      style={{ color: "var(--text-secondary)", fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      {u.email}
                    </td>
                    <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>
                      {ROLE_LABELS[u.role]}
                    </td>
                    <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>
                      {u.carreraId ? CARRERAS[u.carreraId].label : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button className="btn-ghost mr-2" onClick={() => startEdit(u)}>
                        Editar
                      </button>
                      <button
                        className="btn-ghost"
                        style={{ color: "var(--accent)" }}
                        onClick={() => handleDelete(u)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {draft && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setDraft(null)}
          >
            <div
              className="ui-panel rounded-2xl p-6 max-w-md w-full"
              style={{ border: "1px solid var(--border-subtle)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                {draft.id ? "Editar usuario" : "Nuevo usuario"}
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    Nombre
                  </label>
                  <input
                    className="ui-input"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    className="ui-input"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    Rol
                  </label>
                  <select
                    className="ui-input"
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value as Role })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>

                {draft.role === "estudiante" && (
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      Carrera
                    </label>
                    <select
                      className="ui-input"
                      value={draft.carreraId ?? "instrumentacion"}
                      onChange={(e) =>
                        setDraft({ ...draft, carreraId: e.target.value as CarreraId })
                      }
                    >
                      {(Object.keys(CARRERAS) as CarreraId[]).map((c) => (
                        <option key={c} value={c}>
                          {CARRERAS[c].label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {error && (
                  <p className="text-sm" style={{ color: "var(--accent)" }}>
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 mt-2">
                  <button className="btn-secondary" onClick={() => setDraft(null)}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={handleSave}>
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function UsuariosPage() {
  return (
    <RoleGate allowedRoles={["admin"]}>
      <UsuariosView />
    </RoleGate>
  );
}
