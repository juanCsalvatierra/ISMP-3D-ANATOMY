# Backend — NestJS + Prisma + PostgreSQL

El backend del proyecto vive en `backend/`. Es un servidor NestJS independiente en el puerto **3001**, con Prisma como ORM y PostgreSQL como base de datos. El frontend Next.js le habla vía REST con JWT.

---

## 1. Roles

Tres roles fijos, definidos como enum en Prisma:

- `ESTUDIANTE` (default) — rinde cuestionarios, ve solo sus intentos.
- `DOCENTE` — crea/edita/elimina sus propios cuestionarios; ve intentos de sus cuestionarios.
- `ADMIN` — bypass total: gestión de usuarios, vista global.

El rol viaja en el JWT (`payload.role`) y es leído por `RolesGuard` sin tocar la DB.

El primer admin se crea directamente en la DB (UPDATE o seed). Nunca se expone un endpoint público para asignarse admin.

---

## 2. Schema Prisma

`backend/prisma/schema.prisma`. Resumen:

```
User          — id (cuid), email, passwordHash, role, carreraId
Carrera       — id, slug, label  ← slugs deben coincidir con app/domain/academic.ts
Materia       — id, slug, label
Cuestionario  — id, titulo, descripcion, materiaId, formato, autorId
Question      — id, cuestionarioId, orden, texto, opciones (String[]), correct, explicacion
Attempt       — id, userId, cuestionarioId, materiaSlug, formato, score, total, completedAt
AnswerLog     — id, attemptId, questionId, selected, correct
```

Enum `Formato`: `MULTIPLE | TRUEFALSE | IDENTIFICATION | LABELING`

---

## 3. Endpoints disponibles

### Auth (`/auth`)
| Método | Ruta | Guard | Descripción |
|--------|------|-------|-------------|
| POST | `/auth/login` | — | `{ email, password }` → `{ access_token }` |
| GET | `/auth/me` | JWT | Devuelve el usuario autenticado desde DB |

El JWT incluye `{ sub, email, role, carreraId }` con expiración configurable.

### Users (`/users`)
| Método | Ruta | Guard | Descripción |
|--------|------|-------|-------------|
| GET | `/users` | JWT + ADMIN | Lista todos, filtrable por `role`, `carreraId` |
| GET | `/users/:id` | JWT + ADMIN | Detalle de un usuario |
| PATCH | `/users/:id` | JWT + ADMIN | Actualizar nombre, rol, carrera |
| DELETE | `/users/:id` | JWT + ADMIN | Eliminar usuario |

### Cuestionarios (`/cuestionarios`)
| Método | Ruta | Guard | Descripción |
|--------|------|-------|-------------|
| GET | `/cuestionarios` | JWT | Lista todos, filtrable por `materiaId` |
| GET | `/cuestionarios/:id` | JWT | Detalle con `preguntas` incluidas |
| POST | `/cuestionarios` | JWT + DOCENTE/ADMIN | Crear cuestionario con preguntas |
| PATCH | `/cuestionarios/:id` | JWT + autor o ADMIN | Actualizar |
| DELETE | `/cuestionarios/:id` | JWT + autor o ADMIN | Eliminar |

### Intentos — **pendiente de implementar**
Los modelos `Attempt` y `AnswerLog` ya existen en el schema. Faltan:
- `POST /intentos` — recibe `{ cuestionarioId, answers[] }`, calcula `score` y persiste.
- `GET /intentos/me` — historial del usuario autenticado.
- `GET /cuestionarios/:id/intentos` — intentos de un cuestionario (docente/admin).

---

## 4. Guards y Decoradores

```
backend/src/auth/guards/
  jwt.guard.ts    — extrae y valida el Bearer token
  roles.guard.ts  — compara @Roles(...) con payload.role

backend/src/auth/decorators/
  roles.decorator.ts   — @Roles('ADMIN', 'DOCENTE')
  user.decorator.ts    — @CurrentUser() inyecta el payload JWT en el controlador
```

---

## 5. Puesta en marcha

```bash
cd backend
npm install

# Configurar base de datos
cp .env.example .env   # o crear backend/.env manualmente
# Editar DATABASE_URL y JWT_SECRET

# Migraciones y seed
npx prisma migrate dev
npx prisma db seed

# Desarrollo
npm run start:dev
```

Variables requeridas en `backend/.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ismp
JWT_SECRET=cambiar_en_produccion
PORT=3001
```

---

## 6. Integración con el Frontend

El frontend tiene la abstracción `AuthProvider` (`app/types/authProvider.ts`) lista para conectar. Pasos por fase:

### Fase 1 — Auth
1. Crear `app/providers/nestAuthProvider.ts` implementando `AuthProvider`.
   - `login()` → `POST /auth/login` → guarda JWT.
   - `getUser()` → decodifica el JWT o llama `GET /auth/me`.
   - `logout()` → descarta el token.
2. Pasar `nestAuthProvider` al factory de `userStore`.
3. Agregar `Authorization: Bearer <token>` en todas las peticiones (helper `lib/api/client.ts`).

### Fase 2 — Usuarios (admin)
- Reemplazar `usersStore` por llamadas a `GET/PATCH/DELETE /users`.

### Fase 3 — Cuestionarios
- Reemplazar `cuestionarioBankStore` por llamadas a `GET/POST/PATCH/DELETE /cuestionarios`.

### Fase 4 — Intentos
- Implementar los endpoints en el backend (ver §3).
- Reemplazar `cuestionarioHistoryStore` por llamadas a `POST /intentos` y `GET /intentos/me`.

### Limpieza final
- Eliminar stores mock: `usersStore`, `cuestionarioBankStore`, `cuestionarioHistoryStore`.
- Eliminar `localAuthProvider` (o mantenerlo para tests).
- Agregar `middleware.ts` en el frontend leyendo el JWT para gatear rutas server-side.

---

## 7. Convenciones

- IDs: `cuid` (generados por Prisma). El cliente los trata como `string` opaco.
- Fechas: `DateTime` en la DB; ISO-8601 al cliente.
- Slugs de `Carrera`/`Materia` idénticos a `app/domain/academic.ts` — validar al hacer seed.
- `passwordHash` nunca viaja al cliente.
- Nunca exponer el `JWT_SECRET` ni hacer logs del token.
