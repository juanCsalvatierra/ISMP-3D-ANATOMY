"use client";
import { useAnatomyStore } from "../../store/anatomyStore";
import { useCameraStore } from "../../store/cameraStore";
import { Vector3 } from "three";

export function ViewerToolbar() {
  const labelsVisible = useAnatomyStore((s) => s.labelsVisible);
  const toggleLabels = useAnatomyStore((s) => s.toggleLabels);
  const reset = useCameraStore((s) => s.reset);
  const setFocus = useCameraStore((s) => s.setFocus);

  const handleFit = () => {
    setFocus(new Vector3(0, 0, 0), new Vector3(0, 0, 3));
  };

  const handleReset = () => {
    reset(new Vector3(0, 0, 0), new Vector3(0, 1.5, 3.5));
  };

  return (
    <div
      className="viewer-toolbar absolute top-4 left-4 z-20"
    >
      <button
        className={`toolbar-btn ${labelsVisible ? "active" : ""}`}
        onClick={toggleLabels}
        title="Mostrar / ocultar etiquetas"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 3.5C1 2.12 2.12 1 3.5 1H8L11 4V8.5C11 9.88 9.88 11 8.5 11H3.5C2.12 11 1 9.88 1 8.5V3.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path d="M3.5 5.5H7.5M3.5 7.5H6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        Etiquetas
      </button>

      <div className="w-px h-4 mx-1" style={{ background: "var(--border-subtle)" }} />

      <button className="toolbar-btn" onClick={handleFit} title="Ajustar vista">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M1 4V1.5C1 1.22 1.22 1 1.5 1H4M8 1H10.5C10.78 1 11 1.22 11 1.5V4M11 8V10.5C11 10.78 10.78 11 10.5 11H8M4 11H1.5C1.22 11 1 10.78 1 10.5V8"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        Ajustar
      </button>

      <button className="toolbar-btn" onClick={handleReset} title="Restablecer cámara">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6C2 3.79 3.79 2 6 2C7.45 2 8.73 2.74 9.5 3.86"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path d="M9.5 2V4H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M10 6C10 8.21 8.21 10 6 10C4.55 10 3.27 9.26 2.5 8.14"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        Restablecer
      </button>
    </div>
  );
}
