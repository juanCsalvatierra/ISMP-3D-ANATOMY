import { PrismaClient, Role } from '@prisma/client';
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

// Materia ↔ Carrera
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
        carreraId: u.carreraId ?? undefined,
      },
    });
    console.log(`  ✓ ${u.role.padEnd(10)} ${u.email}`);
  }

  console.log(`\nSeed completo.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
