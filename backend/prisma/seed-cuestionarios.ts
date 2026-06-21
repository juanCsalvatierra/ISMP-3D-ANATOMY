import { PrismaClient, Formato } from '@prisma/client';

const prisma = new PrismaClient();

const preguntas = [
  // ── mat-anat1 · Unidad 1 · Sistema Óseo ──────────────────────────────────
  {
    texto: '¿Cuál es el hueso más largo del cuerpo humano?',
    opciones: ['Tibia', 'Húmero', 'Fémur', 'Peroné'],
    correct: 2,
    explicacion: 'El fémur es el hueso más largo del cuerpo humano, ubicado en el muslo.',
    formato: Formato.MULTIPLE,
    materiaId: 'mat-anat1',
    unidad: 1,
  },
  {
    texto: '¿Qué hueso protege la articulación de la rodilla?',
    opciones: ['Tibia', 'Rótula', 'Fémur', 'Fíbula'],
    correct: 1,
    explicacion: 'La rótula (patela) es un hueso sesamoideo que protege la rodilla.',
    formato: Formato.MULTIPLE,
    materiaId: 'mat-anat1',
    unidad: 1,
  },
  {
    texto: '¿Cuántos huesos tiene el cráneo adulto?',
    opciones: ['22', '14', '28', '18'],
    correct: 0,
    explicacion: 'El cráneo adulto está compuesto por 22 huesos: 8 del neurocráneo y 14 del viscerocráneo.',
    formato: Formato.MULTIPLE,
    materiaId: 'mat-anat1',
    unidad: 1,
  },
  {
    texto: '¿Cómo se denomina la unión entre dos o más huesos?',
    opciones: ['Tendón', 'Ligamento', 'Articulación', 'Cartílago'],
    correct: 2,
    explicacion: 'Una articulación es la unión entre dos o más huesos.',
    formato: Formato.MULTIPLE,
    materiaId: 'mat-anat1',
    unidad: 1,
  },
  {
    texto: '¿Qué huesos forman el antebrazo?',
    opciones: ['Húmero y radio', 'Radio y cúbito', 'Cúbito y fémur', 'Radio y fíbula'],
    correct: 1,
    explicacion: 'El antebrazo está formado por el radio (lateral) y el cúbito (medial).',
    formato: Formato.MULTIPLE,
    materiaId: 'mat-anat1',
    unidad: 1,
  },
  // ── mat-anat2 · Unidad 1 · Músculos ──────────────────────────────────────
  {
    texto: 'El bíceps braquial es flexor del codo.',
    opciones: ['Verdadero', 'Falso'],
    correct: 0,
    explicacion: 'El bíceps braquial flexiona el codo y supina el antebrazo.',
    formato: Formato.TRUEFALSE,
    materiaId: 'mat-anat2',
    unidad: 1,
  },
  {
    texto: 'El deltoides es un músculo del antebrazo.',
    opciones: ['Verdadero', 'Falso'],
    correct: 1,
    explicacion: 'El deltoides es un músculo del hombro, no del antebrazo.',
    formato: Formato.TRUEFALSE,
    materiaId: 'mat-anat2',
    unidad: 1,
  },
  // ── mat-anat3 · Unidad 1 · Tórax ─────────────────────────────────────────
  {
    texto: '¿Cuántas vértebras componen la columna torácica?',
    opciones: ['7', '10', '12', '5'],
    correct: 2,
    explicacion: 'La columna torácica tiene 12 vértebras (T1-T12).',
    formato: Formato.MULTIPLE,
    materiaId: 'mat-anat3',
    unidad: 1,
  },
  {
    texto: '¿Qué órgano se ubica predominantemente en el cuadrante superior derecho?',
    opciones: ['Bazo', 'Hígado', 'Estómago', 'Páncreas'],
    correct: 1,
    explicacion: 'El hígado ocupa el cuadrante superior derecho del abdomen.',
    formato: Formato.MULTIPLE,
    materiaId: 'mat-anat3',
    unidad: 1,
  },
];

async function main() {
  // Tomar el primer docente disponible como autor
  const autor = await prisma.user.findFirst({ where: { role: 'DOCENTE' } });
  if (!autor) {
    console.error('No hay docentes en la DB. Ejecutá el seed principal primero.');
    process.exit(1);
  }

  console.log(`Seeding preguntas (autor: ${autor.name})...`);

  let creadas = 0;
  let omitidas = 0;

  for (const p of preguntas) {
    const { materiaId, unidad, ...questionData } = p;

    // Evitar duplicados por texto + materiaId
    const existe = await prisma.question.findFirst({
      where: {
        texto: questionData.texto,
        materias: { some: { materiaId } },
      },
    });

    if (existe) {
      omitidas++;
      continue;
    }

    await prisma.question.create({
      data: {
        ...questionData,
        autorId: autor.id,
        materias: { create: [{ materiaId, unidad }] },
      },
    });

    creadas++;
    console.log(`  ✓ [${p.formato}] ${p.texto.slice(0, 50)}…`);
  }

  console.log(`\nSeed completo: ${creadas} creadas, ${omitidas} ya existían.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
