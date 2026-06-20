import { PrismaClient, Formato } from '@prisma/client';

const prisma = new PrismaClient();

// Autor: primer docente del seed de usuarios
const AUTOR_ID = 'cmqju1g5400036n9hep5i88le';

const cuestionarios = [
  {
    id: 'seed-anatomia-1-huesos',
    titulo: 'Huesos largos y articulaciones',
    descripcion: 'Repaso introductorio del sistema esquelético.',
    materiaId: 'mat-osteo',   // anatomia-1 → Osteología
    formato: Formato.MULTIPLE,
    createdAt: new Date('2026-03-01T10:00:00.000Z'),
    preguntas: [
      {
        question: '¿Cuál es el hueso más largo del cuerpo humano?',
        options: ['Tibia', 'Húmero', 'Fémur', 'Peroné'],
        correct: 2,
        explanation: 'El fémur es el hueso más largo del cuerpo humano, ubicado en el muslo.',
      },
      {
        question: '¿Qué hueso protege la articulación de la rodilla?',
        options: ['Tibia', 'Rótula', 'Fémur', 'Fíbula'],
        correct: 1,
        explanation: 'La rótula (patela) es un hueso sesamoideo que protege la rodilla.',
      },
      {
        question: '¿Cuántos huesos tiene el cráneo adulto?',
        options: ['22', '14', '28', '18'],
        correct: 0,
        explanation: 'El cráneo adulto está compuesto por 22 huesos: 8 del neurocráneo y 14 del viscerocráneo.',
      },
      {
        question: '¿Cómo se denomina la unión entre dos o más huesos?',
        options: ['Tendón', 'Ligamento', 'Articulación', 'Cartílago'],
        correct: 2,
        explanation: 'Una articulación es la unión entre dos o más huesos.',
      },
      {
        question: '¿Qué huesos forman el antebrazo?',
        options: ['Húmero y radio', 'Radio y cúbito', 'Cúbito y fémur', 'Radio y fíbula'],
        correct: 1,
        explanation: 'El antebrazo está formado por el radio (lateral) y el cúbito (medial).',
      },
    ],
  },
  {
    id: 'seed-anatomia-2-musculos',
    titulo: 'Músculos del miembro superior',
    descripcion: 'Identifica los principales grupos musculares.',
    materiaId: 'mat-mio',    // anatomia-2 → Miología
    formato: Formato.TRUEFALSE,
    createdAt: new Date('2026-03-05T10:00:00.000Z'),
    preguntas: [
      {
        question: 'El bíceps braquial es flexor del codo.',
        options: ['Verdadero', 'Falso'],
        correct: 0,
        explanation: 'El bíceps braquial flexiona el codo y supina el antebrazo.',
      },
      {
        question: 'El deltoides es un músculo del antebrazo.',
        options: ['Verdadero', 'Falso'],
        correct: 1,
        explanation: 'El deltoides es un músculo del hombro, no del antebrazo.',
      },
    ],
  },
  {
    id: 'seed-anatomia-3-toraco',
    titulo: 'Estructuras toracoabdominales',
    descripcion: 'Cuestionario introductorio para Radiología.',
    materiaId: 'mat-anat',   // anatomia-3 → Anatomía General
    formato: Formato.MULTIPLE,
    createdAt: new Date('2026-03-10T10:00:00.000Z'),
    preguntas: [
      {
        question: '¿Cuántas vértebras componen la columna torácica?',
        options: ['7', '10', '12', '5'],
        correct: 2,
        explanation: 'La columna torácica tiene 12 vértebras (T1-T12).',
      },
      {
        question: '¿Qué órgano se ubica predominantemente en el cuadrante superior derecho?',
        options: ['Bazo', 'Hígado', 'Estómago', 'Páncreas'],
        correct: 1,
        explanation: 'El hígado ocupa el cuadrante superior derecho del abdomen.',
      },
    ],
  },
];

async function main() {
  console.log('Seeding cuestionarios...');

  for (const c of cuestionarios) {
    const { preguntas, ...cuestionarioData } = c;

    await prisma.cuestionario.upsert({
      where: { id: c.id },
      update: {},
      create: {
        ...cuestionarioData,
        updatedAt: cuestionarioData.createdAt,
        autorId: AUTOR_ID,
        preguntas: {
          create: preguntas.map((p, index) => ({
            orden: index,
            texto: p.question,
            opciones: p.options,
            correct: p.correct,
            explicacion: p.explanation,
          })),
        },
      },
    });

    console.log(`  ✓ [${c.formato}] ${c.titulo} (${preguntas.length} preguntas)`);
  }

  console.log('\nSeed de cuestionarios completo.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
