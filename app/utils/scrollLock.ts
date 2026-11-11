// Bloqueo del scroll de la página con contador, para que varios componentes
// (menú móvil, visor 3D) puedan pedirlo a la vez sin pisarse al restaurar.
let locks = 0;

function apply() {
  const v = locks > 0 ? "hidden" : "";
  document.documentElement.style.overflow = v;
  document.body.style.overflow = v;
}

/** Bloquea el scroll de la página. Devuelve la función que libera este bloqueo. */
export function lockPageScroll(): () => void {
  locks += 1;
  apply();
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    apply();
  };
}
