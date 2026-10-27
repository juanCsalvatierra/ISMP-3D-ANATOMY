import { PrismaClient, EstadoPregunta } from '@prisma/client';
import { BANCO } from './banco';

// Siembra el banco de preguntas por tema (prisma/banco/*). Las preguntas entran
// como BORRADOR en cada materia de destino: no llegan a los alumnos de esa materia
// hasta que un docente de la materia (o un administrador) la aprueba en
// /docente/revision. Es idempotente — una pregunta que ya existe (mismo texto)
// no se toca, así una revisión o aprobación docente nunca se pisa al re-correr.
//
//   npx ts-node prisma/seed-banco.ts

const prisma = new PrismaClient();

function validar(): string[] {
  const errores: string[] = [];
  const vistos = new Set<string>();
  for (const [i, p] of BANCO.entries()) {
    const id = `#${i + 1} (${p.tema}) "${p.texto.slice(0, 50)}…"`;
    if (vistos.has(p.texto)) errores.push(`${id}: texto duplicado en el banco`);
    vistos.add(p.texto);
    if (p.opciones.length < 2) errores.push(`${id}: menos de 2 opciones`);
    if (new Set(p.opciones).size !== p.opciones.length) errores.push(`${id}: opciones repetidas`);
    if (p.correct < 0 || p.correct >= p.opciones.length) errores.push(`${id}: índice de respuesta fuera de rango`);
    if (!p.explicacion.trim()) errores.push(`${id}: sin explicación`);
    if (p.destinos.length === 0) errores.push(`${id}: sin destinos`);
    const materias = p.destinos.map((d) => d.materiaId);
    if (new Set(materias).size !== materias.length) {
      errores.push(`${id}: una materia repetida (QuestionMateria admite una unidad por materia)`);
    }
  }
  return errores;
}

async function main() {
  const errores = validar();
  if (errores.length > 0) {
    console.error('El banco tiene errores:\n  - ' + errores.join('\n  - '));
    process.exit(1);
  }

  const autor =
    (await prisma.user.findFirst({ where: { role: 'DOCENTE' } })) ??
    (await prisma.user.findFirst({ where: { role: 'ADMIN' } }));
  if (!autor) {
    console.error('No hay docentes ni administradores en la DB. Ejecutá el seed principal primero.');
    process.exit(1);
  }

  // Todas las materias de destino tienen que existir (seed principal).
  const materiasNecesarias = Array.from(new Set(BANCO.flatMap((p) => p.destinos.map((d) => d.materiaId))));
  const existentes = await prisma.materia.findMany({
    where: { id: { in: materiasNecesarias } },
    select: { id: true },
  });
  const faltan = materiasNecesarias.filter((m) => !existentes.some((e) => e.id === m));
  if (faltan.length > 0) {
    console.error(`Faltan materias en la DB: ${faltan.join(', ')}. Ejecutá antes "npx prisma db seed".`);
    process.exit(1);
  }

  console.log(`Sembrando banco por tema (autor: ${autor.name})…`);
  const porTema = new Map<string, { creadas: number; omitidas: number }>();

  for (const p of BANCO) {
    const stats = porTema.get(p.tema) ?? { creadas: 0, omitidas: 0 };
    porTema.set(p.tema, stats);

    const existe = await prisma.question.findFirst({ where: { texto: p.texto }, select: { id: true } });
    if (existe) {
      stats.omitidas++;
      continue;
    }

    await prisma.question.create({
      data: {
        texto: p.texto,
        opciones: p.opciones,
        correct: p.correct,
        explicacion: p.explicacion,
        formato: p.formato,
        tema: p.tema,
        autorId: autor.id,
        // La aprobación es por materia: cada destino entra como borrador.
        materias: { create: p.destinos.map((d) => ({ ...d, estado: EstadoPregunta.BORRADOR })) },
      },
    });
    stats.creadas++;
  }

  let creadas = 0;
  let omitidas = 0;
  for (const [tema, s] of Array.from(porTema.entries()).sort()) {
    console.log(`  ${tema.padEnd(36)} ${String(s.creadas).padStart(3)} creadas, ${s.omitidas} ya existían`);
    creadas += s.creadas;
    omitidas += s.omitidas;
  }
  console.log(`\nBanco sembrado: ${creadas} borradores nuevos, ${omitidas} ya existían.`);
  console.log('Revisalos y aprobalos en /docente/revision.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
