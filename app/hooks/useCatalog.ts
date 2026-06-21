"use client";
import { useEffect, useState } from "react";
import { api } from "@/app/lib/api";

export type CarreraItem = { id: string; slug: string; label: string };
export type MateriaItem = { id: string; slug: string; label: string };

// ── Carreras ──────────────────────────────────────────────────────────────────

export function useCarreras() {
  const [carreras, setCarreras] = useState<CarreraItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CarreraItem[]>("/carreras")
      .then(setCarreras)
      .catch(() => setCarreras([]))
      .finally(() => setLoading(false));
  }, []);

  return { carreras, loading };
}

// ── Materias (opcionalmente filtradas por carreraId) ─────────────────────────

export function useMaterias(carreraId?: string) {
  const [materias, setMaterias] = useState<MateriaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = carreraId ? `?carreraId=${encodeURIComponent(carreraId)}` : "";
    api
      .get<MateriaItem[]>(`/materias${qs}`)
      .then(setMaterias)
      .catch(() => setMaterias([]))
      .finally(() => setLoading(false));
  }, [carreraId]);

  return { materias, loading };
}

// ── Unidades de una materia (enteros distintos) ───────────────────────────────

export function useUnidades(materiaId: string | undefined) {
  const [unidades, setUnidades] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!materiaId) {
      setUnidades([]);
      return;
    }
    setLoading(true);
    api
      .get<number[]>(`/materias/${encodeURIComponent(materiaId)}/unidades`)
      .then(setUnidades)
      .catch(() => setUnidades([]))
      .finally(() => setLoading(false));
  }, [materiaId]);

  return { unidades, loading };
}
