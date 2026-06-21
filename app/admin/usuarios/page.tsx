"use client";
import { useEffect, useRef, useState } from "react";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { useUsersStore, type ManagedUser } from "@/app/store/usersStore";
import { ROLE_LABELS, type Role } from "@/app/store/userStore";
import { CARRERAS, CARRERA_IDS, type CarreraId } from "@/app/domain/academic";

const ROLES: Role[] = ["estudiante", "docente", "admin"];

type Draft = {
  id?: string;
  name: string;
  email: string;
  dni: string;
  password: string;
  confirmPassword: string;
  role: Role;
  carreraIds: CarreraId[];
};

const EMPTY: Draft = {
  name: "",
  email: "",
  dni: "",
  password: "",
  confirmPassword: "",
  role: "estudiante",
  carreraIds: [],
};

function UsuariosView() {
  const users = useUsersStore((s) => s.users);
  const loading = useUsersStore((s) => s.loading);
  const storeError = useUsersStore((s) => s.error);
  const fetchUsers = useUsersStore((s) => s.fetch);
  const searchUsers = useUsersStore((s) => s.search);
  const createUser = useUsersStore((s) => s.create);
  const updateUser = useUsersStore((s) => s.update);
  const removeUser = useUsersStore((s) => s.remove);

  const [filtroRol, setFiltroRol] = useState<Role | "all">("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filtered =
    filtroRol === "all" ? users : users.filter((u) => u.role === filtroRol);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      searchUsers(value);
    }, 400);
  };

  const startCreate = () => {
    setDraft({ ...EMPTY });
    setError(null);
  };

  const startEdit = (u: ManagedUser) => {
    setDraft({
      id: u.id,
      name: u.name,
      email: u.email,
      dni: u.dni ?? "",
      password: "",
      confirmPassword: "",
      role: u.role,
      carreraIds: u.carreraIds ?? [],
    });
    setError(null);
  };

  const toggleCarrera = (cid: CarreraId) => {
    if (!draft) return;
    const has = draft.carreraIds.includes(cid);
    setDraft({
      ...draft,
      carreraIds: has
        ? draft.carreraIds.filter((c) => c !== cid)
        : [...draft.carreraIds, cid],
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    if (!draft.id && (!draft.name.trim() || !draft.email.trim())) {
      setError("Nombre y email son obligatorios.");
      return;
    }
    if (!draft.id && !draft.password.trim()) {
      setError("La contraseña es obligatoria para nuevos usuarios.");
      return;
    }
    if (draft.password && draft.password !== draft.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (draft.password && draft.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (draft.id) {
        await updateUser(draft.id, {
          role: draft.role,
          carreraIds: draft.carreraIds,
          ...(draft.password ? { password: draft.password } : {}),
        });
      } else {
        await createUser({
          name: draft.name.trim(),
          email: draft.email.trim(),
          dni: draft.dni.trim() || undefined,
          password: draft.password,
          role: draft.role,
          carreraIds: draft.carreraIds,
        });
      }
      setDraft(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: ManagedUser) => {
    if (typeof window !== "undefined" && window.confirm(`¿Eliminar a ${u.name}?`)) {
      try {
        await removeUser(u.id);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Error al eliminar.");
      }
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

        {/* Search */}
        <div className="mb-4">
          <input
            className="ui-input max-w-sm"
            type="search"
            placeholder="Buscar por nombre o email…"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
          />
          {query && (
            <span
              className="ml-2 text-xs"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Solo busca entre estudiantes
            </span>
          )}
        </div>

        {/* Role filter tabs */}
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

        {/* Error banner */}
        {storeError && (
          <div
            className="mb-4 px-4 py-2 rounded-md text-sm"
            style={{
              background: "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          >
            {storeError}
          </div>
        )}

        <div
          className="ui-panel rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          <div className="overflow-x-auto">
            <table
              className="w-full text-sm"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", minWidth: "640px" }}
            >
              <thead>
                <tr style={{ background: "var(--bg-canvas)", color: "var(--text-muted)" }}>
                  <th className="text-left px-4 py-2 font-medium">Nombre</th>
                  <th className="text-left px-4 py-2 font-medium">DNI</th>
                  <th className="text-left px-4 py-2 font-medium">Email</th>
                  <th className="text-left px-4 py-2 font-medium">Rol</th>
                  <th className="text-left px-4 py-2 font-medium">Carrera(s)</th>
                  <th className="text-right px-4 py-2 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Cargando…
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Sin usuarios para este filtro.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id} style={{ borderTop: "1px solid var(--border-subtle)" }}>
                      <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>
                        {u.name}
                      </td>
                      <td
                        className="px-4 py-2"
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-ibm-plex-mono)",
                        }}
                      >
                        {u.dni ?? "—"}
                      </td>
                      <td
                        className="px-4 py-2"
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-ibm-plex-mono)",
                        }}
                      >
                        {u.email}
                      </td>
                      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>
                        {ROLE_LABELS[u.role]}
                      </td>
                      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>
                        {u.carreraIds && u.carreraIds.length > 0
                          ? u.carreraIds
                              .map((c) => CARRERAS[c as CarreraId]?.label ?? c)
                              .join(", ")
                          : "—"}
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
        </div>

        {/* Create / Edit modal */}
        {draft && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setDraft(null)}
          >
            <div
              className="ui-panel rounded-2xl p-6 w-full overflow-y-auto"
              style={{
                border: "1px solid var(--border-subtle)",
                maxWidth: "480px",
                maxHeight: "90vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                className="text-lg font-semibold mb-4"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
              >
                {draft.id ? "Editar usuario" : "Nuevo usuario"}
              </h2>

              <div className="flex flex-col gap-4">
                {/* En modo edición: info de solo lectura */}
                {draft.id ? (
                  <div
                    className="rounded-lg px-4 py-3 flex flex-col gap-1"
                    style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}
                  >
                    <span
                      className="text-xs uppercase tracking-wider mb-1"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      Información de la cuenta
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
                    >
                      {draft.name}
                    </span>
                    <span
                      className="text-sm"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-secondary)" }}
                    >
                      {draft.email}
                    </span>
                    {draft.dni && (
                      <span
                        className="text-sm"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                      >
                        DNI: {draft.dni}
                      </span>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Nombre */}
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                      >
                        Nombre *
                      </label>
                      <input
                        className="ui-input"
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      />
                    </div>

                    {/* DNI */}
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                      >
                        DNI
                      </label>
                      <input
                        className="ui-input"
                        placeholder="Ej: 30123456"
                        value={draft.dni}
                        onChange={(e) => setDraft({ ...draft, dni: e.target.value })}
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <label
                        className="text-xs uppercase tracking-wider"
                        style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        className="ui-input"
                        value={draft.email}
                        onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {/* Contraseña: obligatoria al crear, opcional al editar */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    {draft.id ? "Nueva contraseña (opcional)" : "Contraseña *"}
                  </label>
                  <input
                    type="password"
                    className="ui-input"
                    placeholder={draft.id ? "Dejar en blanco para no cambiar" : ""}
                    value={draft.password}
                    onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                  />
                </div>
                {(draft.password || !draft.id) && (
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-xs uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                    >
                      Confirmar contraseña {!draft.id && "*"}
                    </label>
                    <input
                      type="password"
                      className="ui-input"
                      value={draft.confirmPassword}
                      onChange={(e) => setDraft({ ...draft, confirmPassword: e.target.value })}
                    />
                  </div>
                )}

                {/* Rol */}
                <div className="flex flex-col gap-1">
                  <label
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    Rol *
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

                {/* Carreras (multi-select checkboxes) */}
                <div className="flex flex-col gap-2">
                  <label
                    className="text-xs uppercase tracking-wider"
                    style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
                  >
                    Carrera(s)
                  </label>
                  <div className="flex flex-col gap-2">
                    {CARRERA_IDS.map((cid) => {
                      const checked = draft.carreraIds.includes(cid);
                      return (
                        <label
                          key={cid}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                          style={{
                            background: checked ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "var(--bg-canvas)",
                            border: `1px solid ${checked ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "var(--border-subtle)"}`,
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
                  <p className="text-sm" style={{ color: "var(--accent)" }}>
                    {error}
                  </p>
                )}

                <div className="flex justify-end gap-3 mt-2">
                  <button className="btn-secondary" onClick={() => setDraft(null)}>
                    Cancelar
                  </button>
                  <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando…" : "Guardar"}
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
