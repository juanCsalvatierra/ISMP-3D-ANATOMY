"use client";
import Link from "next/link";
import { useCombinedViewerStore } from "../../store/combinedViewerStore";
import { SYSTEMS } from "../../config/systems";
import { MATERIAS } from "../../domain/academic";

// Pestaña "Unidad" del visor combinado: qué se estudia en la unidad abierta desde
// "Mis materias" y atajos para practicar o volver al listado.
export function UnitPanel() {
  const unit = useCombinedViewerStore((s) => s.unit);
  const enabledSystems = useCombinedViewerStore((s) => s.enabledSystems);

  if (!unit) return null;
  const { materiaId, unidad } = unit;
  const apagados = unidad.sistemas3D.filter((id) => !enabledSystems.includes(id));

  return (
    <div className="p-4 flex flex-col gap-5">
      <div>
        <Link
          href={`/materias/${materiaId}`}
          className="ui-link text-xs"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          ← {MATERIAS[materiaId].label}
        </Link>
        <h3
          className="text-lg font-semibold mt-2"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          Unidad {unidad.n} · {unidad.titulo}
        </h3>
      </div>

      <div>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          Temas
        </span>
        <ul className="mt-2 flex flex-col gap-1.5">
          {unidad.temas.map((tema) => (
            <li
              key={tema}
              className="text-sm leading-snug pl-3"
              style={{
                fontFamily: "var(--font-ibm-plex-serif)",
                color: "var(--text-secondary)",
                borderLeft: "2px solid var(--border-subtle)",
              }}
            >
              {tema}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
        >
          Sistemas 3D
        </span>
        <div className="mt-2 flex flex-wrap gap-2">
          {unidad.sistemas3D.map((id) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs"
              style={{
                background: "var(--bg-elevated)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-ibm-plex-sans)",
                opacity: enabledSystems.includes(id) ? 1 : 0.55,
              }}
            >
              <span className="w-2 h-2 rounded-sm" style={{ background: SYSTEMS[id].swatch }} />
              {SYSTEMS[id].shortLabel}
            </span>
          ))}
        </div>
        {apagados.length > 0 && (
          <p
            className="text-xs mt-2"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
          >
            {apagados.map((id) => SYSTEMS[id].shortLabel).join(", ")}: apagado
            {apagados.length > 1 ? "s" : ""} para no cargar de más; activalo desde Capas.
          </p>
        )}
        {unidad.nota3D && (
          <p
            className="text-xs mt-2"
            style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)", fontStyle: "italic" }}
          >
            {unidad.nota3D}
          </p>
        )}
      </div>

      <Link
        href={`/cuestionarios/generar?materiaId=${materiaId}&unidad=${unidad.n}`}
        className="btn-primary justify-center"
      >
        Practicar esta unidad →
      </Link>
    </div>
  );
}
