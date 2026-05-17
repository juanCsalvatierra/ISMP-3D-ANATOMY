export function normalize(name: string): string {
  let n = name.toLowerCase();

  n = n
    .replace(/\.(l|r)$/i, "")
    .replace(/\b(left|right)\b/g, "");

  // detectar vertebras correctamente
  const vertebraMatch = n.match(/vertebra[_\s]*([ctl])[_\s]*(\d+)/);
  const hipMatch = n.match(/(hip|pelvis|ilion|ilium)/);
  if (vertebraMatch) {
    return n;
  }
  if(hipMatch) {
    return n;
  }

  // limpieza general
  n = n
    .replace(/_\d+$/g, "")
    .replace(/bonel|boner/g, "bone")
    .replace(/[^\w]/g, "_")
    .replace(/_+/g, "_")
    .trim();

  return n;
}