// anatomy.final.builded.json quedó con `name` en inglés para casi todas sus
// 3531 entradas (0% con tildes/ñ) porque el pipeline de traducción automática
// solo tradujo el contenido de las secciones, no el campo `name`.
//
// El texto traducido SÍ está ahí: el traductor repite el título al principio
// de sections[0].content, en mayúsculas, antes de arrancar la primera oración
// en minúsculas/capitalizado normal. Ej:
//   name: "ASCENDING COLON/"
//   sections[0].content: "COLON ASCENDENTE/ INTESTINO GRUESO El intestino grueso..."
// El "/" separa el nombre real de una categoría pegada por el scraper
// ("/Large intestine" → "/ INTESTINO GRUESO"), así que se corta ahí.
//
// Esta heurística extrae ese título repetido para usarlo como `name` en
// español. No modifica el JSON en disco — se aplica una vez al cargar el
// dataset (ver config/datasets.ts) y de ahí cascada a toda la UI (InfoPanel,
// panel de capas, etiquetas), porque todos leen `item.name`.

type NamedSection = { content: string | string[] };
type NameableItem = { name: string; sections?: NamedSection[] };

function isUpperWord(word: string): boolean {
  return /[A-ZÁÉÍÓÚÑÜ]/.test(word) && !/[a-záéíóúñü]/.test(word);
}

/**
 * Devuelve el nombre en español derivado del contenido, o `null` si no hay
 * uno mejor que el `name` actual (contenido sin ese prefijo repetido, o el
 * prefijo coincide con `name`).
 */
export function deriveSpanishName(item: NameableItem): string | null {
  const raw = item.sections?.[0]?.content;
  const text = Array.isArray(raw) ? raw[0] : raw;
  if (!text) return null;

  const words = text.split(" ");
  let i = 0;
  while (i < words.length && isUpperWord(words[i])) i++;
  if (i === 0) return null;

  let title = words.slice(0, i).join(" ");
  const slashIndex = title.indexOf("/");
  if (slashIndex >= 0) title = title.slice(0, slashIndex);
  title = title.replace(/[\s,.-]+$/, "").trim();

  if (!title || title.toUpperCase() === item.name.toUpperCase()) return null;
  return title;
}

/** Aplica deriveSpanishName a todas las entradas de un dataset. */
export function withSpanishNames<T extends NameableItem>(
  json: Record<string, T>,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, item] of Object.entries(json)) {
    const derived = deriveSpanishName(item);
    out[key] = derived ? { ...item, name: derived } : item;
  }
  return out;
}
