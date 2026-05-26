import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando base de datos...');

  // Borramos en orden para respetar las foreign keys
  await prisma.answerLog.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.cuestionario.deleteMany();
  await prisma.user.deleteMany();
  await prisma.materia.deleteMany();
  await prisma.carrera.deleteMany();

  console.log('Creando carreras...');

  const instrumentacion = await prisma.carrera.create({
    data: { slug: 'instrumentacion', label: 'Instrumentación Quirúrgica' },
  });

  const radiologia = await prisma.carrera.create({
    data: { slug: 'radiologia', label: 'Radiología' },
  });

  console.log('Creando materias...');

  const anatomia1 = await prisma.materia.create({
    data: {
      slug: 'anatomia-1',
      label: 'Anatomía I',
      carreras: { connect: [{ id: instrumentacion.id }, { id: radiologia.id }] },
    },
  });

  const anatomia2 = await prisma.materia.create({
    data: {
      slug: 'anatomia-2',
      label: 'Anatomía II',
      carreras: { connect: [{ id: instrumentacion.id }, { id: radiologia.id }] },
    },
  });

  await prisma.materia.create({
    data: {
      slug: 'anatomia-3',
      label: 'Anatomía III',
      carreras: { connect: [{ id: radiologia.id }] },
    },
  });

  await prisma.materia.create({
    data: {
      slug: 'anatomia-4',
      label: 'Anatomía IV',
      carreras: { connect: [{ id: radiologia.id }] },
    },
  });

  console.log('Creando usuarios...');

  const hash = async (pwd: string) => bcrypt.hash(pwd, 10);

  // Admin
  await prisma.user.create({
    data: {
      id: 'seed-admin-1',
      name: 'Admin Sistema',
      email: 'admin@ismp.edu',
      passwordHash: await hash('admin1234'),
      role: Role.ADMIN,
    },
  });

  // Docentes
  const docente1 = await prisma.user.create({
    data: {
      id: 'seed-docente-1',
      name: 'Prof. García',
      email: 'garcia@ismp.edu',
      passwordHash: await hash('docente1234'),
      role: Role.DOCENTE,
    },
  });

  await prisma.user.create({
    data: {
      id: 'seed-docente-2',
      name: 'Prof. López',
      email: 'lopez@ismp.edu',
      passwordHash: await hash('docente1234'),
      role: Role.DOCENTE,
    },
  });

  // Estudiantes — 2 de instrumentacion, 2 de radiologia
  await prisma.user.create({
    data: {
      id: 'seed-estudiante-1',
      name: 'Juan Pérez',
      email: 'juan@ismp.edu',
      passwordHash: await hash('alumno1234'),
      role: Role.ESTUDIANTE,
      carreraId: instrumentacion.id,
    },
  });

  await prisma.user.create({
    data: {
      id: 'seed-estudiante-2',
      name: 'María Torres',
      email: 'maria@ismp.edu',
      passwordHash: await hash('alumno1234'),
      role: Role.ESTUDIANTE,
      carreraId: instrumentacion.id,
    },
  });

  await prisma.user.create({
    data: {
      id: 'seed-estudiante-3',
      name: 'Carlos Ruiz',
      email: 'carlos@ismp.edu',
      passwordHash: await hash('alumno1234'),
      role: Role.ESTUDIANTE,
      carreraId: radiologia.id,
    },
  });

  await prisma.user.create({
    data: {
      id: 'seed-estudiante-4',
      name: 'Laura Díaz',
      email: 'laura@ismp.edu',
      passwordHash: await hash('alumno1234'),
      role: Role.ESTUDIANTE,
      carreraId: radiologia.id,
    },
  });

  console.log('Creando cuestionarios de prueba...');

  await prisma.cuestionario.create({
    data: {
      titulo: 'Huesos del cráneo',
      descripcion: 'Cuestionario sobre los huesos del cráneo',
      materiaId: anatomia1.id,
      formato: 'MULTIPLE',
      autorId: docente1.id,
      preguntas: {
        create: [
          {
            orden: 1,
            texto: '¿Cuántos huesos tiene el cráneo?',
            opciones: ['6', '8', '10', '12'],
            correct: 1,
            explicacion: 'El cráneo está formado por 8 huesos.',
          },
          {
            orden: 2,
            texto: '¿Cuál es el hueso más grande del cráneo?',
            opciones: ['Frontal', 'Parietal', 'Occipital', 'Temporal'],
            correct: 1,
            explicacion: 'Los huesos parietales son los más grandes del cráneo.',
          },
        ],
      },
    },
  });

  await prisma.cuestionario.create({
    data: {
      titulo: 'Músculos del tronco',
      descripcion: 'Cuestionario sobre los músculos del tronco',
      materiaId: anatomia2.id,
      formato: 'TRUEFALSE',
      autorId: docente1.id,
      preguntas: {
        create: [
          {
            orden: 1,
            texto: 'El diafragma es el principal músculo de la respiración.',
            opciones: ['Verdadero', 'Falso'],
            correct: 0,
            explicacion: 'El diafragma es efectivamente el principal músculo respiratorio.',
          },
          {
            orden: 2,
            texto: 'El trapecio es un músculo del abdomen.',
            opciones: ['Verdadero', 'Falso'],
            correct: 1,
            explicacion: 'El trapecio es un músculo de la espalda, no del abdomen.',
          },
        ],
      },
    },
  });

  console.log('✅ Seed completado');
  console.log('');
  console.log('Usuarios creados:');
  console.log('  admin@ismp.edu        / admin1234   (ADMIN)');
  console.log('  garcia@ismp.edu       / docente1234 (DOCENTE)');
  console.log('  lopez@ismp.edu        / docente1234 (DOCENTE)');
  console.log('  juan@ismp.edu         / alumno1234  (ESTUDIANTE - Instrumentación)');
  console.log('  maria@ismp.edu        / alumno1234  (ESTUDIANTE - Instrumentación)');
  console.log('  carlos@ismp.edu       / alumno1234  (ESTUDIANTE - Radiología)');
  console.log('  laura@ismp.edu        / alumno1234  (ESTUDIANTE - Radiología)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
