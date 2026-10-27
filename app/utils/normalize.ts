export function normalize(name: string): string {
  let n = name.toLowerCase();

  n = n
    .replace(/\.(l|r)$/i, "")
    .replace(/\b(left|right)\b/g, "");

  // detectar vertebras correctamente
  const vertebraMatch = n.match(/vertebra[_\s]*([ctl])[_\s]*(\d+)/);
  const hipMatch = n.match(/(hip|pelvis|ilion|ilium)/);
  // Vértebras y pelvis salen antes de la limpieza general (para no perder el
  // sufijo numérico), pero igual se pasan a snake_case: las claves del dataset
  // son "vertebra_c3" / "hip_bone" y la malla se llama "Vertebra C3" / "Hip bone".
  const toSnake = (s: string) => s.replace(/[^\w]/g, "_").replace(/_+/g, "_");
  if (vertebraMatch) {
    return toSnake(n);
  }
  if(hipMatch) {
    return toSnake(n);
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