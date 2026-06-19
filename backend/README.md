# ISMP Anatomy — Backend

Servidor REST en **NestJS + Prisma + PostgreSQL**. Puerto `3001`.

## Puesta en marcha

```bash
npm install

# Crear backend/.env
cp .env.example .env   # o crear manualmente con:
#   DATABASE_URL=postgresql://user:pass@localhost:5432/ismp
#   JWT_SECRET=cambiar_en_produccion
#   PORT=3001

npx prisma migrate dev   # crea las tablas
npx prisma db seed       # carga carreras, materias y usuarios de prueba

npm run start:dev        # servidor en :3001 con hot-reload
```

## Estructura

```
src/
  auth/           — POST /auth/login, GET /auth/me, JWT guard, roles guard
  users/          — CRUD /users (solo ADMIN)
  cuestionarios/  — CRUD /cuestionarios (autenticado; escritura: DOCENTE/ADMIN)
  prisma/         — PrismaService compartido
  app.module.ts
  main.ts
prisma/
  schema.prisma   — modelos: User, Carrera, Materia, Cuestionario, Question, Attempt, AnswerLog
  migrations/
  seed.ts
```

## Endpoints

| Método | Ruta | Guard |
|--------|------|-------|
| POST | `/auth/login` | — |
| GET | `/auth/me` | JWT |
| GET | `/users` | JWT + ADMIN |
| GET/PATCH/DELETE | `/users/:id` | JWT + ADMIN |
| GET | `/cuestionarios` | JWT |
| GET | `/cuestionarios/:id` | JWT |
| POST | `/cuestionarios` | JWT + DOCENTE/ADMIN |
| PATCH/DELETE | `/cuestionarios/:id` | JWT + autor o ADMIN |

**Pendiente:** `POST /intentos`, `GET /intentos/me` (modelos `Attempt`/`AnswerLog` ya existen en el schema).

## Variables de entorno (`backend/.env`)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ismp
JWT_SECRET=cambiar_en_produccion
PORT=3001
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript a `dist/` |
| `npm run start:prod` | Producción desde `dist/` |
| `npx prisma migrate dev` | Aplicar migraciones |
| `npx prisma db seed` | Sembrar datos iniciales |
| `npx prisma studio` | GUI de la DB en el navegador |

## Notas

- IDs: `cuid` (generados por Prisma). El cliente los trata como `string` opaco.
- Los slugs de `Carrera`/`Materia` deben coincidir exactamente con `app/domain/academic.ts` en el frontend.
- `passwordHash` nunca viaja al cliente.
- El primer admin se crea desde el seed o directamente en la DB — no hay endpoint público para asignarse admin.
