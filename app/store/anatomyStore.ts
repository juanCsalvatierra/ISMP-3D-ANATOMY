import { create } from "zustand";

// Tipado de los items de anatomía
export type AnatomyItem = {
  name: string;
  english_name: string | string[];
  description?: string;
  children?: AnatomyItem[];
  sections: Section[];
};

export type Section = {
  title: string;
  level: number;
  content: string | string[];
}

// Tipado del estado global de anatomía
type State = {
  hovered: string | null;
  selected: AnatomyItem | null;
  selectedUuid: string | null;
  isolated: string | null;
  labelsVisible: boolean;
  labelVisibility: Record<string, boolean>;

  setHovered: (id: string | null) => void;
  setSelected: (item: AnatomyItem | null, uuid?: string | null) => void;
  setIsolated: (id: string | null) => void;
  toggleLabels: () => void;
  setLabelVisible: (id: string, visible: boolean) => void;
};

export const useAnatomyStore = create<State>((set: (partial: Partial<State>) => void, get: () => State) => ({
  hovered: null,
  selected: null,
  selectedUuid: null,
  isolated: null,
  labelsVisible: false,
  labelVisibility: {},

  setHovered: (id: string | null) => set({ hovered: id }),
  setSelected: (item: AnatomyItem | null, uuid: string | null = null) => set({ selected: item, selectedUuid: uuid }),
  setIsolated: (id: string | null) => set({ isolated: id }),
  toggleLabels: () => set({ labelsVisible: !get().labelsVisible }),
  setLabelVisible: (id: string, visible: boolean) =>
    set({ labelVisibility: { ...get().labelVisibility, [id]: visible } }),
}));