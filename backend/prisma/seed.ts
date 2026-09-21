import { PrismaClient, Role, Formato } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const carreras = [
  { id: 'carrera-rad', slug: 'radiologia',                 label: 'Radiología' },
  { id: 'carrera-iq',  slug: 'instrumentacion-quirurgica', label: 'Instrumentación Quirúrgica' },
  { id: 'carrera-hem', slug: 'hemoterapia',                label: 'Hemoterapia' },
];

const materias = [
  { id: 'mat-anat1', slug: 'anatomia-1', label: 'Anatomía 1' },
  { id: 'mat-anat2', slug: 'anatomia-2', label: 'Anatomía 2' },
  { id: 'mat-anat3', slug: 'anatomia-3', label: 'Anatomía 3' },
  { id: 'mat-anat4', slug: 'anatomia-4', label: 'Anatomía 4' },
];

const carreraMaterias: { carreraId: string; materiaId: string }[] = [
  { carreraId: 'carrera-rad', materiaId: 'mat-anat1' },
  { carreraId: 'carrera-rad', materiaId: 'mat-anat2' },
  { carreraId: 'carrera-rad', materiaId: 'mat-anat3' },
  { carreraId: 'carrera-rad', materiaId: 'mat-anat4' },
  { carreraId: 'carrera-iq',  materiaId: 'mat-anat1' },
  { carreraId: 'carrera-iq',  materiaId: 'mat-anat2' },
  { carreraId: 'carrera-hem', materiaId: 'mat-anat1' },
];

const usuarios = [
  { name: 'Admin Sistema',       email: 'admin@ismp.edu.ar',       password: 'admin123',   role: Role.ADMIN,      carreraId: null },
  { name: 'Dr. Carlos Medina',   email: 'cmedina@ismp.edu.ar',     password: 'docente123', role: Role.DOCENTE,    carreraId: 'carrera-rad' },
  { name: 'Dra. Ana Sosa',       email: 'asosa@ismp.edu.ar',       password: 'docente123', role: Role.DOCENTE,    carreraId: 'carrera-iq' },
  { name: 'Juan Pérez',          email: 'jperez@ismp.edu.ar',      password: 'alumno123',  role: Role.ESTUDIANTE, carreraId: 'carrera-rad' },
  { name: 'Sofía Martínez',      email: 'smartinez@ismp.edu.ar',   password: 'alumno123',  role: Role.ESTUDIANTE, carreraId: 'carrera-rad' },
  { name: 'Lucas Fernández',     email: 'lfernandez@ismp.edu.ar',  password: 'alumno123',  role: Role.ESTUDIANTE, carreraId: 'carrera-iq' },
  { name: 'Camila Díaz',         email: 'cdiaz@ismp.edu.ar',       password: 'alumno123',  role: Role.ESTUDIANTE, carreraId: 'carrera-iq' },
];

async function main() {
  // Carreras
  console.log('Seeding carreras...');
  for (const c of carreras) {
    await prisma.carrera.upsert({
      where: { slug: c.slug },
      update: { label: c.label },
      create: c,
    });
    console.log(`  ✓ ${c.label}`);
  }

  // Materias
  console.log('\nSeeding materias...');
  for (const m of materias) {
    await prisma.materia.upsert({
      where: { slug: m.slug },
      update: { label: m.label },
      create: m,
    });
    console.log(`  ✓ ${m.label}`);
  }

  // Carrera ↔ Materia
  console.log('\nVinculando materias a carreras...');
  for (const rel of carreraMaterias) {
    await prisma.carrera.update({
      where: { id: rel.carreraId },
      data: { materias: { connect: { id: rel.materiaId } } },
    });
    console.log(`  ✓ ${rel.carreraId} → ${rel.materiaId}`);
  }

  // Usuarios
  console.log('\nSeeding usuarios...');
  for (const u of usuarios) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        estado: 'ACTIVO',
        ...(u.carreraId ? {
          carreras: { create: [{ carreraId: u.carreraId }] },
        } : {}),
      },
    });
    console.log(`  ✓ ${u.role.padEnd(10)} ${u.email}`);
  }

  // Preguntas de ejemplo
  console.log('\nSeeding preguntas...');
  const docente = await prisma.user.findUnique({ where: { email: 'cmedina@ismp.edu.ar' } });
  if (!docente) throw new Error('Docente no encontrado');

  const preguntas = [
    {
      texto: '¿Cuántos huesos tiene el cuerpo humano adulto?',
      opciones: ['206', '208', '212', '198'],
      correct: 0,
      explicacion: 'El esqueleto adulto está compuesto por 206 huesos.',
      formato: Formato.MULTIPLE,
      materiaId: 'mat-anat1',
    },
    {
      texto: '¿Qué hueso es el más largo del cuerpo humano?',
      opciones: ['Húmero', 'Tibia', 'Fémur', 'Peroné'],
      correct: 2,
      explicacion: 'El fémur (hueso del muslo) es el hueso más largo del cuerpo humano.',
      formato: Formato.MULTIPLE,
      materiaId: 'mat-anat1',
    },
    {
      texto: '¿El esternón forma parte de la caja torácica?',
      opciones: ['Verdadero', 'Falso'],
      correct: 0,
      explicacion: 'El esternón es el hueso plano central del tórax que articula con las costillas.',
      formato: Formato.TRUEFALSE,
      materiaId: 'mat-anat1',
    },
    {
      texto: '¿Cuántas vértebras cervicales tiene la columna vertebral humana?',
      opciones: ['5', '7', '12', '9'],
      correct: 1,
      explicacion: 'La columna cervical tiene 7 vértebras (C1 a C7).',
      formato: Formato.MULTIPLE,
      materiaId: 'mat-anat1',
    },
    {
      texto: '¿El húmero es el hueso del antebrazo?',
      opciones: ['Verdadero', 'Falso'],
      correct: 1,
      explicacion: 'El húmero es el hueso del brazo. Los huesos del antebrazo son el radio y el cúbito.',
      formato: Formato.TRUEFALSE,
      materiaId: 'mat-anat2',
    },
    {
      texto: '¿Cuál es el hueso más pequeño del cuerpo humano?',
      opciones: ['Martillo', 'Yunque', 'Estribo', 'Patela'],
      correct: 2,
      explicacion: 'El estribo, ubicado en el oído medio, es el hueso más pequeño del cuerpo.',
      formato: Formato.MULTIPLE,
      materiaId: 'mat-anat2',
    },
    {
      texto: '¿Cuántos pares de costillas tiene el ser humano?',
      opciones: ['10', '11', '12', '14'],
      correct: 2,
      explicacion: 'El ser humano tiene 12 pares de costillas (24 en total).',
      formato: Formato.MULTIPLE,
      materiaId: 'mat-anat2',
    },
    {
      texto: '¿La clavícula articula con el esternón y la escápula?',
      opciones: ['Verdadero', 'Falso'],
      correct: 0,
      explicacion: 'La clavícula articula medialmente con el esternón y lateralmente con la escápula.',
      formato: Formato.TRUEFALSE,
      materiaId: 'mat-anat3',
    },
  ];

  for (const p of preguntas) {
    const { materiaId, ...data } = p;
    const q = await prisma.question.create({
      data: {
        ...data,
        autorId: docente.id,
        materias: { create: [{ materiaId }] },
      },
    });
    console.log(`  ✓ [${q.formato}] ${q.texto.slice(0, 50)}...`);
  }

  console.log(`\nSeed completo.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
