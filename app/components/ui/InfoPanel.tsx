import { Section, useAnatomyStore } from "../../store/anatomyStore";
import ReactMarkdown from "react-markdown";

export function InfoPanel() {
  const selected = useAnatomyStore((s) => s.selected);

  if (!selected) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 px-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg-elevated)" }}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.4" style={{ color: "var(--text-muted)" }} />
            <path d="M11 7v5M11 14.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: "var(--text-muted)" }} />
          </svg>
        </div>
        <p
          className="text-sm text-center leading-relaxed"
          style={{
            color: "var(--text-muted)",
            fontFamily: "var(--font-ibm-plex-serif)",
            fontStyle: "italic",
          }}
        >
          Selecciona una estructura en el modelo para ver información
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Structure name */}
      <div
        className="pb-3 mb-4"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <h4
          className="text-lg font-semibold"
          style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-primary)" }}
        >
          {selected.name}
        </h4>
        {Array.isArray(selected.english_name) ? (
          <p
            className="text-xs mt-1"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            {selected.english_name.join(", ")}
          </p>
        ) : selected.english_name ? (
          <p
            className="text-xs mt-1"
            style={{ fontFamily: "var(--font-ibm-plex-mono)", color: "var(--text-muted)" }}
          >
            {selected.english_name}
          </p>
        ) : null}
      </div>

      {/* Sections */}
      {selected.sections?.map((section: Section, i: number) => (
        <div key={i} className="mb-6">
          {section.level === 2 && (
            <h3
              className="text-sm font-semibold mb-2 uppercase tracking-wider"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--accent)" }}
            >
              {section.title}
            </h3>
          )}
          {section.level === 3 && (
            <h4
              className="text-sm font-medium mb-2"
              style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
            >
              {section.title}
            </h4>
          )}

          {Array.isArray(section.content) ? (
            section.content.map((paragraph: string, j: number) => (
              <p
                key={j}
                className="text-sm leading-relaxed mb-2 whitespace-pre-line"
                style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p
              className="text-sm leading-relaxed whitespace-pre-line"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              {section.content}
            </p>
          )}
        </div>
      ))}

      {/* Children */}
      {selected.children?.map((child, i: number) => (
        <div
          key={i}
          className="mb-4 pl-3"
          style={{ borderLeft: "2px solid var(--border-subtle)" }}
        >
          <strong
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-ibm-plex-sans)", color: "var(--text-secondary)" }}
          >
            {child.name}
          </strong>
          {child.description && (
            <div
              className="text-xs mt-1 leading-relaxed"
              style={{ fontFamily: "var(--font-ibm-plex-serif)", color: "var(--text-muted)" }}
            >
              <ReactMarkdown>{child.description}</ReactMarkdown>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
