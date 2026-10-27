"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { api, ApiError } from "@/app/lib/api";
import { MATERIAS, MATERIA_IDS, type MateriaId } from "@/app/domain/academic";
import { getUnidad, unidadesDeMateria } from "@/app/domain/programas";

type Estado = "BORRADOR" | "APROBADA";

interface Pregunta {
  id: string;
  texto: string;
  opciones: string[];
  correct: number;
  explicacion: string;
  formato: string;
  tema: string | null;
  // La aprobación es por materia; `revisable` indica si el usuario puede actuar ahí.
  materias: {
    materiaId: string;
    unidad: number;
    estado: Estado;
    revisable: boolean;
    materia: { label: string };
    aprobadaPor?: { id: string; name: string } | null;
  }[];
  autor: { id: string; name: string };
}

const PAGE = 40;

function etiquetaDestino(materiaId: string, unidad: number): string {
  const mid = MATERIA_IDS.find((m) => m === materiaId);
  const label = mid ? MATERIAS[mid].label : materiaId;
  if (unidad === 0) return `${label} · toda la materia`;
  const titulo = mid ? getUnidad(mid, unidad)?.titulo : undefined;
  return `${label} · U${unidad}${titulo ? ` ${titulo}` : ""}`;
}

function RevisionBanco() {
  const [estado, setEstado] = useState<Estado>("BORRADOR");
  const [materiaId, setMateriaId] = useState<MateriaId | "">("");
  // Materias en las que el usuario puede revisar (docente: las de sus carreras).
  const [revisables, setRevisables] = useState<MateriaId[]>([]);
  const [unidad, setUnidad] = useState(0);
  const [tema, setTema] = useState("");
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abierta, setAbierta] = useState<string | null>(null);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [lote, setLote] = useState<string | null>(null);
  const [visibles, setVisibles] = useState(PAGE);

  const cargar = useCallback(() => {
    setLoading(true);
    const qs = new URLSearchParams({ estado });
    if (materiaId) qs.set("materiaId", materiaId);
    if (materiaId && unidad > 0) qs.set("unidad", String(unidad));
    api
      .get<Pregunta[]>(`/questions/revision?${qs.toString()}`)
      .then((data) => {
        setPreguntas(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudo cargar el banco."))
      .finally(() => setLoading(false));
  }, [estado, materiaId, unidad]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    api
      .get<{ id: string }[]>("/questions/revision/materias")
      .then((rows) => setRevisables(MATERIA_IDS.filter((m) => rows.some((r) => r.id === m))))
      .catch(() => setRevisables([]));
  }, []);

  const temas = useMemo(
    () => Array.from(new Set(preguntas.map((p) => p.tema).filter((t): t is string => !!t))).sort(),
    [preguntas],
  );
  const filtradas = tema ? preguntas.filter((p) => p.tema?.startsWith(tema)) : preguntas;
  const mostradas = filtradas.slice(0, visibles);
  const destino: Estado = estado === "BORRADOR" ? "APROBADA" : "BORRADOR";

  const cambiar = async (id: string, nuevo: Estado) => {
    setTrabajando(id);
    setError(null);
    try {
      await api.patch(`/questions/${id}`, { estado: nuevo });
      // Ya no pertenece al listado actual.
      setPreguntas((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar la pregunta.");
    } finally {
      setTrabajando(null);
    }
  };

  const cambiarLote = async () => {
    const ids = filtradas.map((p) => p.id);
    if (ids.length === 0) return;
    const accion = destino === "APROBADA" ? "aprobar" : "pasar a borrador";
    if (!window.confirm(`¿Seguro que querés ${accion} las ${ids.length} preguntas del listado actual?`)) return;
    setError(null);
    let fallidas = 0;
    for (let i = 0; i < ids.length; i++) {
      setLote(`${i + 1} / ${ids.length}`);
      try {
        await api.patch(`/questions/${ids[i]}`, { estado: destino });
      } catch {
        fallidas++;
      }
    }
    setLote(null);
    if (fallidas > 0) setError(`${fallidas} pregunta(s) no se pudieron actualizar.`);
    cargar();
  };

  const selectStyle = {
    fontFamily: "var(--font-ibm-plex-sans)",
    color: "var(--text-primary)",
    background: "var(--bg-panel)",
    border: "1px solid var(--border-subtle)",
  } as const;

  return (
    <main style={{ background: "var(--bg-page)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Panel docente", href: "/docente" },
            { label: "Revisar banco" },
          ]}
        />
      </div>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
          Revisar banco de preguntas
        </h1>
        <p
          className="text-sm max-w-2xl mb-6 leading-relaxed"
          style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
        >
          Las preguntas nuevas entran como <strong>borrador</strong> en cada materia y no les llegan a
          los alumnos de esa materia hasta que se aprueban. Cada docente aprueba solo en las materias de
          sus carreras; el administrador, en todas. Revisá el enunciado, la respuesta correcta y la
          explicación.
        </p>

        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={estado}
            onChange={(e) => {
              setEstado(e.target.value as Estado);
              setVisibles(PAGE);
            }}
            className="rounded-lg px-3 py-2 text-sm"
            style={selectStyle}
          >
            <option value="BORRADOR">Borradores (pendientes)</option>
            <option value="APROBADA">Aprobadas</option>
          </select>
          <select
            value={materiaId}
            onChange={(e) => {
              setMateriaId(e.target.value as MateriaId | "");
              setUnidad(0);
              setVisibles(PAGE);
            }}
            className="rounded-lg px-3 py-2 text-sm"
            style={selectStyle}
          >
            <option value="">Todas las materias</option>
            {revisables.map((m) => (
              <option key={m} value={m}>
                {MATERIAS[m].label}
              </option>
            ))}
          </select>
          {materiaId && (
            <select
              value={unidad}
              onChange={(e) => {
                setUnidad(Number(e.target.value));
                setVisibles(PAGE);
              }}
              className="rounded-lg px-3 py-2 text-sm"
              style={selectStyle}
            >
              <option value={0}>Todas las unidades</option>
              {unidadesDeMateria(materiaId).map((u) => (
                <option key={u.n} value={u.n}>
                  U{u.n} · {u.titulo}
                </option>
              ))}
            </select>
          )}
          {temas.length > 0 && (
            <select
              value={tema}
              onChange={(e) => {
                setTema(e.target.value);
                setVisibles(PAGE);
              }}
              className="rounded-lg px-3 py-2 text-sm"
              style={selectStyle}
            >
              <option value="">Todos los temas</option>
              {temas.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-xs" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
            {loading ? "Cargando…" : `${filtradas.length} pregunta${filtradas.length === 1 ? "" : "s"}`}
          </span>
          {filtradas.length > 0 && (
            <button
              onClick={cambiarLote}
              disabled={!!lote}
              className="btn-secondary text-xs py-1 px-3"
              style={{ opacity: lote ? 0.6 : 1 }}
            >
              {lote
                ? `Procesando ${lote}…`
                : destino === "APROBADA"
                  ? `Aprobar las ${filtradas.length} del listado`
                  : `Pasar a borrador las ${filtradas.length} del listado`}
            </button>
          )}
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

        {!loading && filtradas.length === 0 && (
          <div
            className="ui-panel rounded-2xl p-8 text-center text-sm"
            style={{ border: "1px dashed var(--border-subtle)", color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-serif)" }}
          >
            {estado === "BORRADOR" ? "No hay borradores pendientes con este filtro." : "No hay preguntas aprobadas con este filtro."}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {mostradas.map((p) => {
            const open = abierta === p.id;
            return (
              <article key={p.id} className="ui-panel rounded-xl p-4" style={{ border: "1px solid var(--border-subtle)" }}>
                <button
                  onClick={() => setAbierta(open ? null : p.id)}
                  className="w-full text-left flex items-start justify-between gap-3"
                >
                  <span className="text-sm font-medium" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
                    {p.texto}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}>{open ? "▾" : "▸"}</span>
                </button>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.tema && (
                    <span
                      className="text-[11px] px-1.5 py-0.5 rounded"
                      style={{ background: "var(--bg-elevated)", color: "var(--accent)", fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      {p.tema}
                    </span>
                  )}
                  {p.materias.map((m) => (
                    <span
                      key={m.materiaId}
                      className="text-[11px] px-1.5 py-0.5 rounded"
                      title={
                        m.estado === "APROBADA"
                          ? `Aprobada${m.aprobadaPor ? ` por ${m.aprobadaPor.name}` : ""}`
                          : m.revisable
                            ? "Borrador: la podés revisar"
                            : "Borrador de otra cátedra: no es de tus materias"
                      }
                      style={{
                        background: "var(--bg-elevated)",
                        color: m.estado === "APROBADA" ? "rgb(110,190,130)" : m.revisable ? "var(--text-secondary)" : "var(--text-muted)",
                        opacity: m.revisable ? 1 : 0.6,
                        fontFamily: "var(--font-ibm-plex-mono)",
                      }}
                    >
                      {m.estado === "APROBADA" ? "✓ " : m.revisable ? "○ " : "🔒 "}
                      {etiquetaDestino(m.materiaId, m.unidad)}
                    </span>
                  ))}
                </div>

                {open && (
                  <div className="mt-4 flex flex-col gap-3">
                    <ol className="flex flex-col gap-1.5">
                      {p.opciones.map((op, i) => (
                        <li
                          key={i}
                          className="text-sm px-3 py-1.5 rounded-lg"
                          style={{
                            fontFamily: "var(--font-ibm-plex-serif)",
                            background: i === p.correct ? "rgba(70,160,90,0.15)" : "var(--bg-elevated)",
                            border: i === p.correct ? "1px solid rgba(70,160,90,0.5)" : "1px solid transparent",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {i === p.correct ? "✓ " : ""}
                          {op}
                        </li>
                      ))}
                    </ol>
                    {p.explicacion && (
                      <p className="text-sm leading-relaxed" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
                        <strong>Explicación:</strong> {p.explicacion}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => cambiar(p.id, destino)}
                        disabled={trabajando === p.id}
                        className={destino === "APROBADA" ? "btn-primary text-xs py-1 px-3" : "btn-secondary text-xs py-1 px-3"}
                        style={{ opacity: trabajando === p.id ? 0.6 : 1 }}
                      >
                        {destino === "APROBADA" ? "Aprobar en mis materias" : "Volver a borrador en mis materias"}
                      </button>
                      <span className="text-xs" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}>
                        Autor: {p.autor.name}
                      </span>
                    </div>
                  </div>
                )}
              </article>
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
      </section>
    </main>
  );
}

export default function RevisionPage() {
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <RevisionBanco />
    </RoleGate>
  );
}
