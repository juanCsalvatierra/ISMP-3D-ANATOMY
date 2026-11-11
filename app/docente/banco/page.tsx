"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { EditQuestionModal, type MateriaOption } from "@/app/components/docente/EditQuestionModal";
import { useUserStore } from "@/app/store/userStore";
import { api, ApiError } from "@/app/lib/api";
import { MATERIAS, MATERIA_IDS } from "@/app/domain/academic";
import { getUnidad } from "@/app/domain/programas";

type Estado = "BORRADOR" | "APROBADA";

// Fila de GET /questions/resumen: cantidad de preguntas de una materia/unidad/estado.
interface ResumenFila {
  materiaId: string;
  unidad: number;
  estado: Estado;
  total: number;
}

interface Pregunta {
  id: string;
  texto: string;
  opciones: string[];
  correct: number;
  explicacion: string;
  formato: string;
  materias: { materiaId: string; unidad: number; estado: Estado }[];
  autor: { id: string; name: string };
}

const PAGE = 25;
const LETRAS = ["A", "B", "C", "D", "E", "F"];

const selectStyle = {
  fontFamily: "var(--font-ibm-plex-sans)",
  color: "var(--text-primary)",
  background: "var(--bg-panel)",
  border: "1px solid var(--border-subtle)",
} as const;

const mono = { fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" } as const;

function materiaLabel(id: string): string {
  const mid = MATERIA_IDS.find((m) => m === id);
  return mid ? MATERIAS[mid].label : id;
}

function unidadLabel(materiaId: string, unidad: number, largo = false): string {
  if (unidad === 0) return "Toda la materia";
  const mid = MATERIA_IDS.find((m) => m === materiaId);
  const titulo = mid ? getUnidad(mid, unidad)?.titulo : undefined;
  return largo && titulo ? `U${unidad} · ${titulo}` : `Unidad ${unidad}`;
}

// Sin tildes ni mayúsculas, para que "circulacion" encuentre "Circulación".
const plano = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function BancoPreguntas() {
  const currentUser = useUserStore((s) => s.currentUser)!;
  const esAdmin = currentUser.role === "admin";

  const [resumen, setResumen] = useState<ResumenFila[] | null>(null);
  const [materiasOpts, setMateriasOpts] = useState<MateriaOption[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [materiaId, setMateriaId] = useState("");
  const [unidad, setUnidad] = useState("todas"); // "todas" | número de unidad ("0" = toda la materia)
  const [estado, setEstado] = useState<"" | Estado>("");
  const [busqueda, setBusqueda] = useState("");
  const [soloMias, setSoloMias] = useState(false);
  const [visibles, setVisibles] = useState(PAGE);

  // Las preguntas de la materia elegida se piden una vez por (materia, estado) y se
  // filtran por unidad y texto en el navegador.
  const [cache, setCache] = useState<{ key: string; items: Pregunta[] } | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const cacheKey = `${materiaId}|${estado}`;
  const loadingLista = !!materiaId && cache?.key !== cacheKey;

  const cargarResumen = () =>
    api
      .get<{ filas: ResumenFila[] }>("/questions/resumen")
      .then((r) => setResumen(r.filas))
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el banco."));

  const cargarPreguntas = (mId: string, est: "" | Estado) => {
    const qs = new URLSearchParams({ materiaId: mId });
    if (est) qs.set("estado", est);
    return api
      .get<Pregunta[]>(`/questions?${qs}`)
      .then((items) => setCache({ key: `${mId}|${est}`, items }))
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudieron cargar las preguntas."));
  };

  useEffect(() => {
    cargarResumen();
    api.get<MateriaOption[]>("/materias").then(setMateriasOpts).catch(() => {});
  }, []);

  useEffect(() => {
    if (materiaId) cargarPreguntas(materiaId, estado);
  }, [materiaId, estado]);

  // ── Conteos para los menús ────────────────────────────────────────────────
  const porMateria = useMemo(() => {
    const m = new Map<string, { total: number; aprobadas: number; borrador: number }>();
    for (const f of resumen ?? []) {
      const c = m.get(f.materiaId) ?? { total: 0, aprobadas: 0, borrador: 0 };
      c.total += f.total;
      if (f.estado === "APROBADA") c.aprobadas += f.total;
      else c.borrador += f.total;
      m.set(f.materiaId, c);
    }
    return m;
  }, [resumen]);

  const materiasConPreguntas = useMemo(
    () => MATERIA_IDS.filter((id) => porMateria.has(id)),
    [porMateria],
  );

  const unidadesDeLaMateria = useMemo(() => {
    const m = new Map<number, number>();
    for (const f of resumen ?? []) {
      if (f.materiaId !== materiaId || (estado && f.estado !== estado)) continue;
      m.set(f.unidad, (m.get(f.unidad) ?? 0) + f.total);
    }
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [resumen, materiaId, estado]);

  const totalMateria = unidadesDeLaMateria.reduce((acc, [, n]) => acc + n, 0);

  // ── Lista filtrada ────────────────────────────────────────────────────────
  const filtradas = useMemo(() => {
    if (!cache || cache.key !== cacheKey) return [];
    const q = plano(busqueda.trim());
    return cache.items.filter((p) => {
      const destino = p.materias.find((m) => m.materiaId === materiaId);
      if (!destino) return false;
      if (unidad !== "todas" && destino.unidad !== Number(unidad)) return false;
      if (soloMias && p.autor.id !== currentUser.id) return false;
      if (q && !plano(p.texto).includes(q)) return false;
      return true;
    });
  }, [cache, cacheKey, materiaId, unidad, soloMias, busqueda, currentUser.id]);

  const elegirMateria = (id: string) => {
    setMateriaId(id);
    setUnidad("todas");
    setBusqueda("");
    setVisibles(PAGE);
    setAbierta(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta pregunta del banco? Se quita de todas sus materias.")) return;
    setDeleting(id);
    try {
      await api.delete(`/questions/${id}`);
      await Promise.all([cargarPreguntas(materiaId, estado), cargarResumen()]);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Error al eliminar.");
    } finally {
      setDeleting(null);
    }
  };

  const handleSaved = () => {
    cargarPreguntas(materiaId, estado);
    cargarResumen();
  };

  return (
    <main style={{ background: "var(--bg-page)", color: "var(--text-primary)", minHeight: "calc(100vh - 48px)" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Panel docente", href: "/docente" },
            { label: "Banco de preguntas" },
          ]}
        />
      </div>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
              Banco de preguntas
            </h1>
            <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
              Elegí una materia y filtrá por unidad. Las preguntas de las materias de tus carreras y las que redactaste vos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/docente/revision" className="btn-secondary">Revisar borradores</Link>
            <Link href="/docente/cuestionarios/nuevo" className="btn-primary">+ Agregar pregunta</Link>
          </div>
        </div>

        {error && (
          <p
            className="text-sm rounded-lg px-4 py-3 mb-4"
            style={{
              background: "rgba(194,47,47,0.08)",
              border: "1px solid rgba(194,47,47,0.3)",
              color: "var(--accent)",
              fontFamily: "var(--font-ibm-plex-serif)",
            }}
          >
            {error}
          </p>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={materiaId}
            onChange={(e) => elegirMateria(e.target.value)}
            className="rounded-lg px-3 py-2 text-sm"
            style={selectStyle}
            aria-label="Materia"
          >
            <option value="">Elegí una materia…</option>
            {materiasConPreguntas.map((id) => (
              <option key={id} value={id}>
                {materiaLabel(id)} ({porMateria.get(id)!.total})
              </option>
            ))}
          </select>

          {materiaId && (
            <>
              <select
                value={unidad}
                onChange={(e) => {
                  setUnidad(e.target.value);
                  setVisibles(PAGE);
                }}
                className="rounded-lg px-3 py-2 text-sm max-w-xs"
                style={selectStyle}
                aria-label="Unidad"
              >
                <option value="todas">Todas las unidades ({totalMateria})</option>
                {unidadesDeLaMateria.map(([u, n]) => (
                  <option key={u} value={String(u)}>
                    {unidadLabel(materiaId, u, true)} ({n})
                  </option>
                ))}
              </select>

              <select
                value={estado}
                onChange={(e) => {
                  setEstado(e.target.value as "" | Estado);
                  setVisibles(PAGE);
                }}
                className="rounded-lg px-3 py-2 text-sm"
                style={selectStyle}
                aria-label="Estado"
              >
                <option value="">Todos los estados</option>
                <option value="APROBADA">Aprobadas</option>
                <option value="BORRADOR">Borradores</option>
              </select>

              <input
                type="search"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setVisibles(PAGE);
                }}
                placeholder="Buscar en el enunciado…"
                className="rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
                style={selectStyle}
              />

              <label
                className="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-muted)" }}
              >
                <input
                  type="checkbox"
                  checked={soloMias}
                  onChange={(e) => {
                    setSoloMias(e.target.checked);
                    setVisibles(PAGE);
                  }}
                />
                Solo las mías
              </label>
            </>
          )}
        </div>

        {/* Sin materia elegida: grilla de materias con sus conteos */}
        {!materiaId && (
          <>
            {resumen === null && !error && (
              <p className="text-sm" style={mono}>Cargando…</p>
            )}
            {resumen !== null && materiasConPreguntas.length === 0 && (
              <div className="ui-panel rounded-2xl p-8 text-center" style={{ border: "1px dashed var(--border-subtle)" }}>
                <p className="text-sm mb-4" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                  Todavía no hay preguntas en tus materias.
                </p>
                <Link href="/docente/cuestionarios/nuevo" className="btn-primary inline-flex">
                  Agregar primera pregunta
                </Link>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              {materiasConPreguntas.map((id) => {
                const c = porMateria.get(id)!;
                return (
                  <button
                    key={id}
                    onClick={() => elegirMateria(id)}
                    className="ui-panel rounded-xl p-5 text-left transition-colors"
                    style={{ border: "1px solid var(--border-subtle)" }}
                  >
                    <p className="text-base font-medium mb-3" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
                      {materiaLabel(id)}
                    </p>
                    <p className="text-2xl font-semibold mb-1" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                      {c.total}
                      <span className="text-xs font-normal ml-1" style={mono}>preguntas</span>
                    </p>
                    <p className="text-xs" style={mono}>
                      {c.aprobadas} aprobadas · {c.borrador} en borrador
                    </p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Materia elegida: lista */}
        {materiaId && (
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs" style={mono}>
                {loadingLista
                  ? "Cargando…"
                  : `${filtradas.length} pregunta${filtradas.length === 1 ? "" : "s"} · ${materiaLabel(materiaId)}`}
              </span>
              <button onClick={() => elegirMateria("")} className="ui-link text-xs" style={{ ...mono, color: "var(--accent)" }}>
                ← Todas las materias
              </button>
            </div>

            {!loadingLista && filtradas.length === 0 && (
              <div className="ui-panel rounded-2xl p-8 text-center" style={{ border: "1px dashed var(--border-subtle)" }}>
                <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                  No hay preguntas con esos filtros.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {filtradas.slice(0, visibles).map((p) => {
                const destino = p.materias.find((m) => m.materiaId === materiaId)!;
                const puedeEditar = esAdmin || p.autor.id === currentUser.id;
                const abierto = abierta === p.id;
                return (
                  <div
                    key={p.id}
                    className="ui-panel rounded-xl p-4"
                    style={{ border: "1px solid var(--border-subtle)" }}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <button
                        className="flex-1 min-w-0 text-left"
                        onClick={() => setAbierta(abierto ? null : p.id)}
                        aria-expanded={abierto}
                      >
                        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}>
                          {p.texto}
                        </p>
                        <p className="text-xs mt-0.5" style={mono}>
                          {unidadLabel(materiaId, destino.unidad)} · {p.formato.toLowerCase()} · {p.autor.name}
                          {p.materias.length > 1 ? ` · +${p.materias.length - 1} materias` : ""}
                          {" · "}
                          <span style={{ color: destino.estado === "BORRADOR" ? "rgb(234,179,8)" : "rgb(34,197,94)" }}>
                            {destino.estado === "BORRADOR" ? "BORRADOR" : "APROBADA"}
                          </span>
                        </p>
                      </button>
                      {puedeEditar && (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setEditId(p.id)} className="btn-secondary text-xs py-1 px-3">
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}
                            className="btn-ghost text-xs py-1 px-3"
                            style={{ color: "var(--accent)", opacity: deleting === p.id ? 0.5 : 1 }}
                          >
                            {deleting === p.id ? "…" : "Eliminar"}
                          </button>
                        </div>
                      )}
                    </div>

                    {abierto && (
                      <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                        <ul className="flex flex-col gap-1 mb-2">
                          {p.opciones.map((o, i) => (
                            <li
                              key={i}
                              className="text-sm"
                              style={{
                                fontFamily: "var(--font-ibm-plex-sans)",
                                color: i === p.correct ? "rgb(34,197,94)" : "var(--text-secondary)",
                                fontWeight: i === p.correct ? 600 : 400,
                              }}
                            >
                              {LETRAS[i]}. {o}
                              {i === p.correct ? "  ✓" : ""}
                            </li>
                          ))}
                        </ul>
                        {p.explicacion && (
                          <p className="text-xs leading-relaxed" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                            {p.explicacion}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filtradas.length > visibles && (
              <div className="mt-6 text-center">
                <button onClick={() => setVisibles((v) => v + PAGE)} className="btn-secondary text-sm">
                  Mostrar más ({filtradas.length - visibles} restantes)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {editId && (
        <EditQuestionModal
          questionId={editId}
          materias={materiasOpts}
          onClose={() => setEditId(null)}
          onSaved={handleSaved}
        />
      )}
    </main>
  );
}

export default function BancoPreguntasPage() {
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <BancoPreguntas />
    </RoleGate>
  );
}
