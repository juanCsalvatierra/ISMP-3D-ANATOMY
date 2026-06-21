"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/app/components/ui/Breadcrumb";
import { api, ApiError } from "@/app/lib/api";
import { useUserStore } from "@/app/store/userStore";
import { useHydrated } from "@/app/store/useHydrated";

interface MateriaOption {
  id: string;
  slug: string;
  label: string;
}

interface StartResponse {
  attemptId: string;
  total: number;
  numero: number;
  pregunta: {
    id: string;
    texto: string;
    opciones: string[];
    formato: string;
  };
}

export default function GenerarExamenPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const currentUser = useUserStore((s) => s.currentUser);

  const [materias, setMaterias] = useState<MateriaOption[]>([]);
  // unidadesCache tracks fetched unidades per materia to avoid synchronous setState in effects
  const [unidadesCache, setUnidadesCache] = useState<{ materiaId: string; values: number[] } | null>(null);
  // unidadSel tracks the selected unidad per materia so it resets automatically when materia changes
  const [unidadSel, setUnidadSel] = useState<{ materiaId: string; value: number } | null>(null);
  const [materiaId, setMateriaId] = useState("");
  const [cantidad, setCantidad] = useState(10);
  const [loadingMaterias, setLoadingMaterias] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derived values — no synchronous setState in effects
  const unidades = unidadesCache?.materiaId === materiaId ? unidadesCache.values : [];
  const loadingUnidades = !!materiaId && unidadesCache?.materiaId !== materiaId;
  const unidad = unidadSel?.materiaId === materiaId ? unidadSel.value : 0;

  useEffect(() => {
    if (!hydrated) return;
    const carreraId = currentUser?.carreraIds?.[0];
    const path = carreraId ? `/materias?carreraId=${carreraId}` : "/materias";
    api
      .get<MateriaOption[]>(path)
      .then((data) => {
        setMaterias(data);
        if (data.length > 0) setMateriaId(data[0].id);
      })
      .catch(() => setError("No se pudieron cargar las materias."))
      .finally(() => setLoadingMaterias(false));
  }, [hydrated, currentUser]);

  useEffect(() => {
    if (!materiaId) return;
    api
      .get<number[]>(`/materias/${materiaId}/unidades`)
      .then((values) => setUnidadesCache({ materiaId, values }))
      .catch(() => setUnidadesCache({ materiaId, values: [] }));
  }, [materiaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materiaId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const data = await api.post<StartResponse>("/attempts/start", {
        materiaId,
        unidad,
        cantidad,
      });
      const materiaLabel = materias.find((m) => m.id === materiaId)?.label ?? "";
      sessionStorage.setItem(
        `attempt-${data.attemptId}`,
        JSON.stringify({ ...data, materiaLabel })
      );
      router.push(`/cuestionarios/intentos/${data.attemptId}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Error al iniciar el examen. Intentá de nuevo."
      );
      setSubmitting(false);
    }
  };

  return (
    <main style={{ background: "var(--bg-page)", minHeight: "100vh" }}>
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <Breadcrumb
          items={[
            { label: "Inicio", href: "/" },
            { label: "Cuestionarios", href: "/cuestionarios" },
            { label: "Generar examen" },
          ]}
        />
      </div>

      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="mb-8">
          <h1
            className="text-3xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-primary)" }}
          >
            Generar examen de práctica
          </h1>
          <p
            className="text-base"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            Las preguntas se seleccionan al azar del banco de preguntas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              Materia
            </label>
            {loadingMaterias ? (
              <div
                className="ui-panel rounded-lg px-3 py-2.5 text-sm"
                style={{ color: "var(--text-muted)", fontFamily: "var(--font-ibm-plex-mono)" }}
              >
                Cargando materias…
              </div>
            ) : (
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2.5 text-sm"
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  color: "var(--text-primary)",
                  background: "var(--bg-panel)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {materias.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              Unidad
            </label>
            <select
              value={unidad}
              onChange={(e) => setUnidadSel({ materiaId, value: Number(e.target.value) })}
              disabled={loadingUnidades}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{
                fontFamily: "var(--font-ibm-plex-sans)",
                color: "var(--text-primary)",
                background: "var(--bg-panel)",
                border: "1px solid var(--border-subtle)",
                opacity: loadingUnidades ? 0.6 : 1,
              }}
            >
              <option value={0}>Todas las unidades</option>
              {unidades.filter((u) => u !== 0).map((u) => (
                <option key={u} value={u}>
                  Unidad {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              Cantidad de preguntas
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Math.min(30, Number(e.target.value))))}
              required
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{
                fontFamily: "var(--font-ibm-plex-mono)",
                color: "var(--text-primary)",
                background: "var(--bg-panel)",
                border: "1px solid var(--border-subtle)",
              }}
            />
            <p
              className="text-xs mt-1"
              style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
            >
              Entre 1 y 30. Debe haber al menos esa cantidad de preguntas en el banco.
            </p>
          </div>

          {error && (
            <div
              className="rounded-lg px-4 py-3"
              style={{
                background: "rgba(194,47,47,0.08)",
                border: "1px solid rgba(194,47,47,0.3)",
              }}
            >
              <p
                className="text-sm"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--accent)" }}
              >
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || loadingMaterias || !materiaId}
            className="btn-primary justify-center"
            style={{
              opacity: submitting || loadingMaterias || !materiaId ? 0.6 : 1,
              cursor: submitting || loadingMaterias || !materiaId ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Iniciando examen…" : "Iniciar examen →"}
          </button>
        </form>
      </div>
    </main>
  );
}
