"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleGate } from "@/app/components/auth/RoleGate";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { api, ApiError } from "@/app/lib/api";
import { MATERIA_IDS } from "@/app/domain/academic";
import { getUnidad } from "@/app/domain/programas";

interface Intento {
  id: string;
  userId: string | null;
  materiaId: string;
  unidad: number;
  cantidad: number;
  nota: number | null;
  completado: boolean;
  completedAt: string | null;
  materia: { label: string };
  user: { name: string; email: string } | null;
}

type Orden = "recientes" | "nota-desc" | "nota-asc" | "alumno";
type Vista = "intentos" | "alumnos";

const PAGE = 30;

const selectStyle = {
  fontFamily: "var(--font-ibm-plex-sans)",
  color: "var(--text-primary)",
  background: "var(--bg-panel)",
  border: "1px solid var(--border-subtle)",
} as const;

const mono = { fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" } as const;

const plano = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function unidadLabel(materiaId: string, unidad: number, largo = false): string {
  if (unidad === 0) return largo ? "Toda la materia" : "Todas";
  const mid = MATERIA_IDS.find((m) => m === materiaId);
  const titulo = mid ? getUnidad(mid, unidad)?.titulo : undefined;
  return largo ? `U${unidad}${titulo ? ` · ${titulo}` : ""}` : `U${unidad}`;
}

const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-AR") : "—");
const nota = (n: number | null) => (n === null ? "—" : `${Math.round(n)}%`);

function Resultados() {
  const router = useRouter();
  const [intentos, setIntentos] = useState<Intento[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [materiaId, setMateriaId] = useState("");
  const [unidad, setUnidad] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<Orden>("recientes");
  const [vista, setVista] = useState<Vista>("intentos");
  const [visibles, setVisibles] = useState(PAGE);
  const [abierto, setAbierto] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Intento[]>("/attempts")
      .then((data) => setIntentos(data.filter((a) => a.completado)))
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : "No se pudieron cargar los resultados.");
        setIntentos([]);
      });
  }, []);

  const todos = useMemo(() => intentos ?? [], [intentos]);

  // Menús: solo materias y unidades que tienen intentos, con su cantidad.
  const materias = useMemo(() => {
    const m = new Map<string, { label: string; n: number }>();
    for (const a of todos) {
      const c = m.get(a.materiaId) ?? { label: a.materia.label, n: 0 };
      c.n += 1;
      m.set(a.materiaId, c);
    }
    return Array.from(m.entries()).sort((a, b) => a[1].label.localeCompare(b[1].label, "es"));
  }, [todos]);

  const unidades = useMemo(() => {
    const m = new Map<number, number>();
    for (const a of todos) if (a.materiaId === materiaId) m.set(a.unidad, (m.get(a.unidad) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [todos, materiaId]);

  const filtrados = useMemo(() => {
    const q = plano(busqueda.trim());
    const lista = todos.filter((a) => {
      if (materiaId && a.materiaId !== materiaId) return false;
      if (materiaId && unidad !== "todas" && a.unidad !== Number(unidad)) return false;
      if (q && !plano(`${a.user?.name ?? ""} ${a.user?.email ?? ""}`).includes(q)) return false;
      return true;
    });
    const nombre = (a: Intento) => a.user?.name ?? "Anónimo";
    const porFecha = (a: Intento, b: Intento) =>
      (b.completedAt ?? "").localeCompare(a.completedAt ?? "");
    return lista.sort((a, b) => {
      if (orden === "nota-desc") return (b.nota ?? -1) - (a.nota ?? -1);
      if (orden === "nota-asc") return (a.nota ?? 101) - (b.nota ?? 101);
      if (orden === "alumno") return nombre(a).localeCompare(nombre(b), "es") || porFecha(a, b);
      return porFecha(a, b);
    });
  }, [todos, materiaId, unidad, busqueda, orden]);

  // Vista "por alumno": un renglón por alumno con sus intentos adentro.
  const alumnos = useMemo(() => {
    const m = new Map<string, { key: string; name: string; email: string; items: Intento[] }>();
    for (const a of filtrados) {
      const key = a.userId ?? "anonimo";
      const g = m.get(key) ?? { key, name: a.user?.name ?? "Anónimo", email: a.user?.email ?? "", items: [] };
      g.items.push(a);
      m.set(key, g);
    }
    const filas = Array.from(m.values()).map((g) => ({
      ...g,
      promedio: g.items.reduce((acc, a) => acc + (a.nota ?? 0), 0) / g.items.length,
      ultimo: g.items.reduce((max, a) => ((a.completedAt ?? "") > max ? a.completedAt ?? "" : max), ""),
    }));
    return filas.sort((a, b) => {
      if (orden === "nota-desc") return b.promedio - a.promedio;
      if (orden === "nota-asc") return a.promedio - b.promedio;
      if (orden === "alumno") return a.name.localeCompare(b.name, "es");
      return b.ultimo.localeCompare(a.ultimo);
    });
  }, [filtrados, orden]);

  const promedio = filtrados.length
    ? Math.round(filtrados.reduce((acc, a) => acc + (a.nota ?? 0), 0) / filtrados.length)
    : 0;
  const cantAlumnos = new Set(filtrados.map((a) => a.userId ?? "anonimo")).size;
  const filasVista = vista === "intentos" ? filtrados.length : alumnos.length;

  const reiniciarPagina = () => {
    setVisibles(PAGE);
    setAbierto(null);
  };

  const verIntento = (id: string) => router.push(`/docente/intentos/${id}`);

  const th = "px-4 py-2 font-medium";
  const stats = [
    { label: "Intentos", value: filtrados.length },
    { label: "Alumnos", value: cantAlumnos },
    { label: "Promedio", value: `${promedio}%` },
  ];

  return (
    <main style={{ background: "var(--bg-page)", color: "var(--text-primary)", minHeight: "calc(100vh - 48px)" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Panel docente", href: "/docente" },
            { label: "Resultados de alumnos" },
          ]}
        />
      </div>

      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-1" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
            Resultados de alumnos
          </h1>
          <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
            Filtrá por materia y unidad, buscá a un alumno y abrí cualquier intento para ver sus respuestas.
          </p>
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

        {/* Menús */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={materiaId}
            onChange={(e) => {
              setMateriaId(e.target.value);
              setUnidad("todas");
              reiniciarPagina();
            }}
            className="rounded-lg px-3 py-2 text-sm"
            style={selectStyle}
            aria-label="Materia"
          >
            <option value="">Todas las materias ({todos.length})</option>
            {materias.map(([id, m]) => (
              <option key={id} value={id}>
                {m.label} ({m.n})
              </option>
            ))}
          </select>

          {materiaId && (
            <select
              value={unidad}
              onChange={(e) => {
                setUnidad(e.target.value);
                reiniciarPagina();
              }}
              className="rounded-lg px-3 py-2 text-sm max-w-xs"
              style={selectStyle}
              aria-label="Unidad"
            >
              <option value="todas">Todas las unidades</option>
              {unidades.map(([u, n]) => (
                <option key={u} value={String(u)}>
                  {unidadLabel(materiaId, u, true)} ({n})
                </option>
              ))}
            </select>
          )}

          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              reiniciarPagina();
            }}
            placeholder="Buscar alumno por nombre o email…"
            className="rounded-lg px-3 py-2 text-sm flex-1 min-w-52"
            style={selectStyle}
          />

          <select
            value={orden}
            onChange={(e) => {
              setOrden(e.target.value as Orden);
              reiniciarPagina();
            }}
            className="rounded-lg px-3 py-2 text-sm"
            style={selectStyle}
            aria-label="Orden"
          >
            <option value="recientes">Más recientes</option>
            <option value="nota-desc">Nota: mayor a menor</option>
            <option value="nota-asc">Nota: menor a mayor</option>
            <option value="alumno">Alumno (A–Z)</option>
          </select>
        </div>

        {/* Resumen del filtro + vista */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="grid grid-cols-3 gap-3 flex-1 min-w-64 max-w-md">
            {stats.map((s) => (
              <div key={s.label} className="ui-panel rounded-xl px-4 py-3" style={{ border: "1px solid var(--border-subtle)" }}>
                <p className="text-xs uppercase tracking-wider" style={mono}>{s.label}</p>
                <p className="text-xl font-semibold" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>
                  {intentos === null ? "—" : s.value}
                </p>
              </div>
            ))}
          </div>
          <div className="inline-flex gap-1 p-1 rounded-lg" style={{ background: "var(--bg-canvas)", border: "1px solid var(--border-subtle)" }}>
            {(["intentos", "alumnos"] as Vista[]).map((v) => (
              <button
                key={v}
                onClick={() => {
                  setVista(v);
                  reiniciarPagina();
                }}
                className="py-1 px-3 rounded-md text-sm transition-colors"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  fontWeight: 500,
                  background: vista === v ? "var(--accent)" : "transparent",
                  color: vista === v ? "white" : "var(--text-secondary)",
                }}
              >
                {v === "intentos" ? "Por intento" : "Por alumno"}
              </button>
            ))}
          </div>
        </div>

        {intentos === null ? (
          <p className="text-sm" style={mono}>Cargando…</p>
        ) : filasVista === 0 ? (
          <div className="ui-panel rounded-2xl p-8 text-center" style={{ border: "1px dashed var(--border-subtle)" }}>
            <p className="text-sm" style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}>
              {todos.length === 0 ? "Aún no hay intentos completados." : "No hay intentos con esos filtros."}
            </p>
          </div>
        ) : vista === "intentos" ? (
          <div className="ui-panel rounded-xl overflow-x-auto" style={{ border: "1px solid var(--border-subtle)" }}>
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
              <thead>
                <tr style={{ background: "var(--bg-canvas)", color: "var(--text-muted)" }}>
                  <th className={`text-left ${th}`}>Alumno</th>
                  <th className={`text-left ${th}`}>Materia</th>
                  <th className={`text-left ${th}`}>Unidad</th>
                  <th className={`text-right ${th}`}>Nota</th>
                  <th className={`text-right ${th}`}>Fecha</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {filtrados.slice(0, visibles).map((a) => (
                  <FilaIntento key={a.id} a={a} onVer={verIntento} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ui-panel rounded-xl overflow-x-auto" style={{ border: "1px solid var(--border-subtle)" }}>
            <table className="w-full text-sm" style={{ fontFamily: "var(--font-ibm-plex-sans)" }}>
              <thead>
                <tr style={{ background: "var(--bg-canvas)", color: "var(--text-muted)" }}>
                  <th className={`text-left ${th}`}>Alumno</th>
                  <th className={`text-right ${th}`}>Intentos</th>
                  <th className={`text-right ${th}`}>Promedio</th>
                  <th className={`text-right ${th}`}>Último</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {alumnos.slice(0, visibles).map((g) => {
                  const abierta = abierto === g.key;
                  return (
                    <FilaAlumno
                      key={g.key}
                      g={g}
                      abierta={abierta}
                      onToggle={() => setAbierto(abierta ? null : g.key)}
                      onVer={verIntento}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filasVista > visibles && (
          <div className="mt-6 text-center">
            <button onClick={() => setVisibles((v) => v + PAGE)} className="btn-secondary text-sm">
              Mostrar más ({filasVista - visibles} restantes)
            </button>
          </div>
        )}

        <p className="text-xs mt-6" style={mono}>
          <Link href="/docente" className="ui-link">← Volver al panel</Link>
        </p>
      </section>
    </main>
  );
}

function FilaIntento({ a, onVer }: { a: Intento; onVer: (id: string) => void }) {
  return (
    <tr
      onClick={() => onVer(a.id)}
      className="cursor-pointer"
      style={{ borderTop: "1px solid var(--border-subtle)", transition: "background 0.1s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-canvas)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
    >
      <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>{a.user?.name ?? "Anónimo"}</td>
      <td className="px-4 py-2" style={{ color: "var(--text-secondary)" }}>{a.materia.label}</td>
      <td className="px-4 py-2" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-secondary)" }}>
        {unidadLabel(a.materiaId, a.unidad)}
      </td>
      <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}>
        {nota(a.nota)}
      </td>
      <td className="px-4 py-2 text-right" style={mono}>{fecha(a.completedAt)}</td>
      <td className="px-4 py-2 text-right" style={{ ...mono, fontSize: "0.75rem" }}>Ver →</td>
    </tr>
  );
}

function FilaAlumno({
  g,
  abierta,
  onToggle,
  onVer,
}: {
  g: { key: string; name: string; email: string; items: Intento[]; promedio: number; ultimo: string };
  abierta: boolean;
  onToggle: () => void;
  onVer: (id: string) => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="cursor-pointer"
        style={{ borderTop: "1px solid var(--border-subtle)", background: abierta ? "var(--bg-canvas)" : "" }}
      >
        <td className="px-4 py-2" style={{ color: "var(--text-primary)" }}>
          {g.name}
          {g.email && <span className="block text-xs" style={mono}>{g.email}</span>}
        </td>
        <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>{g.items.length}</td>
        <td className="px-4 py-2 text-right" style={{ fontFamily: "var(--font-ibm-plex-mono)" }}>{Math.round(g.promedio)}%</td>
        <td className="px-4 py-2 text-right" style={mono}>{fecha(g.ultimo || null)}</td>
        <td className="px-4 py-2 text-right" style={{ ...mono, fontSize: "0.75rem" }}>{abierta ? "Ocultar ▴" : "Ver ▾"}</td>
      </tr>
      {abierta &&
        g.items.map((a) => (
          <tr
            key={a.id}
            onClick={() => onVer(a.id)}
            className="cursor-pointer"
            style={{ background: "var(--bg-canvas)", borderTop: "1px solid var(--border-subtle)" }}
          >
            <td className="pl-9 pr-4 py-2 text-xs" style={{ color: "var(--text-secondary)" }}>
              {a.materia.label} · {unidadLabel(a.materiaId, a.unidad, true)}
            </td>
            <td className="px-4 py-2 text-right text-xs" style={mono}>{a.cantidad} preg.</td>
            <td className="px-4 py-2 text-right text-xs" style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-primary)" }}>
              {nota(a.nota)}
            </td>
            <td className="px-4 py-2 text-right text-xs" style={mono}>{fecha(a.completedAt)}</td>
            <td className="px-4 py-2 text-right text-xs" style={mono}>Abrir →</td>
          </tr>
        ))}
    </>
  );
}

export default function ResultadosPage() {
  return (
    <RoleGate allowedRoles={["docente", "admin"]}>
      <Resultados />
    </RoleGate>
  );
}
