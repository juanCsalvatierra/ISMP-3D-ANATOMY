// Datasets de anatomía usados por los visores 3D, en un solo lugar (antes
// duplicado entre app/modelos/[system]/page.tsx y app/modelos/combinado/page.tsx).
import skeletonJson from "../data/anatomy.skeleton.json";
import buildedJson from "../data/anatomy.final.builded.json";
import type { AnatomyItem } from "../store/anatomyStore";
import type { DatasetId } from "./systems";
import { withSpanishNames } from "../utils/spanishName";

// anatomy.skeleton.json ya está en español; anatomy.final.builded.json (usado
// por muscles/joints/organs) necesita el fix de nombre — ver utils/spanishName.ts.
export const DATASETS: Record<DatasetId, Record<string, AnatomyItem>> = {
  skeleton: skeletonJson as Record<string, AnatomyItem>,
  builded: withSpanishNames(buildedJson as Record<string, AnatomyItem>),
};
