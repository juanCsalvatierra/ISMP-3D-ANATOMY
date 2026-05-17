import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const id = window.requestAnimationFrame(cb);
  return () => window.cancelAnimationFrame(id);
};

export function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
