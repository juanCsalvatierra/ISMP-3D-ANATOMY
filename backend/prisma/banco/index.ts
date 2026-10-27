import type { PreguntaBanco } from './tipos';
import { PREGUNTAS_CIRCULATORIO } from './circulatorio';

// Un archivo por tema transversal. Orden de los lotes (ver propuesta del paso 4):
// circulatorio → respiratorio → urinario → digestivo → osteo/artro/miología →
// nervioso, endocrino y reproductor → histología, fisiología y genética.
export const BANCO: PreguntaBanco[] = [
  ...PREGUNTAS_CIRCULATORIO,
];
