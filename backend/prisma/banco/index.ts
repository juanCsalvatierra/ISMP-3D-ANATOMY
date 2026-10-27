import type { PreguntaBanco } from './tipos';
import { PREGUNTAS_CIRCULATORIO } from './circulatorio';
import { PREGUNTAS_RESPIRATORIO } from './respiratorio';
import { PREGUNTAS_URINARIO } from './urinario';
import { PREGUNTAS_DIGESTIVO_ANATOMIA } from './digestivo-anatomia';
import { PREGUNTAS_DIGESTIVO_FISIOLOGIA } from './digestivo-fisiologia';
import { PREGUNTAS_OSTEOLOGIA } from './osteologia';
import { PREGUNTAS_ARTROLOGIA } from './artrologia';
import { PREGUNTAS_MIOLOGIA } from './miologia';
import { PREGUNTAS_NERVIOSO_CENTRAL } from './nervioso-central';
import { PREGUNTAS_NERVIOSO_PERIFERICO } from './nervioso-periferico';
import { PREGUNTAS_ENDOCRINO } from './endocrino';
import { PREGUNTAS_REPRODUCTOR } from './reproductor';
import { PREGUNTAS_HISTOLOGIA } from './histologia';

// Un archivo por tema transversal. Orden de los lotes (ver propuesta del paso 4):
// circulatorio → respiratorio → urinario → digestivo → osteo/artro/miología →
// nervioso, endocrino y reproductor → histología, fisiología y genética.
export const BANCO: PreguntaBanco[] = [
  ...PREGUNTAS_CIRCULATORIO,
  ...PREGUNTAS_RESPIRATORIO,
  ...PREGUNTAS_URINARIO,
  ...PREGUNTAS_DIGESTIVO_ANATOMIA,
  ...PREGUNTAS_DIGESTIVO_FISIOLOGIA,
  ...PREGUNTAS_OSTEOLOGIA,
  ...PREGUNTAS_ARTROLOGIA,
  ...PREGUNTAS_MIOLOGIA,
  ...PREGUNTAS_NERVIOSO_CENTRAL,
  ...PREGUNTAS_NERVIOSO_PERIFERICO,
  ...PREGUNTAS_ENDOCRINO,
  ...PREGUNTAS_REPRODUCTOR,
  ...PREGUNTAS_HISTOLOGIA,
];
