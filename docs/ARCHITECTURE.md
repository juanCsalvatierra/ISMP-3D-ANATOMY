# ISMP Anatomy - Arquitectura del Proyecto

> **Backend: NestJS + Prisma + PostgreSQL** en `backend/` (puerto 3001). El frontend Next.js llama al backend vía REST con JWT. La autorización vive en guards de NestJS.

---

## Diagrama General

```
┌─────────────────────────────────────────┐
│      FRONTEND (Next.js 16 App Router)   │
│  - 3D Viewer (Three.js + Fiber)         │
│  - Auth UI                              │
│  - Quiz Interface                       │
│  - Image Gallery                        │
│  Puerto: 3000                           │
└──────────────┬──────────────────────────┘
               │
        REST HTTP + Bearer JWT
               │
┌──────────────▼──────────────────────────┐
│      BACKEND (NestJS, puerto 3001)      │
│  ┌────────────┐  ┌──────────────────┐   │
│  │ AuthModule │  │  UsersModule     │   │
│  │  /auth/    │  │  /users/         │   │
│  │  login     │  │  (admin only)    │   │
│  │  me        │  └──────────────────┘   │
│  └────────────┘  ┌──────────────────┐   │
│                  │ CuestionariosModule│  │
│                  │ /cuestionarios/   │   │
│                  └──────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  PrismaModule → PostgreSQL       │   │
│  │  User, Carrera, Materia,         │   │
│  │  Cuestionario, Question,         │   │
│  │  Attempt, AnswerLog              │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## Flujo de Autenticación

1. Usuario ingresa email/password en `/login`.
2. Frontend llama `POST /auth/login` con `{ email, password }`.
3. Backend valida con bcrypt, emite JWT con payload `{ sub, email, role, carreraId }`.
4. Frontend almacena el token y lo adjunta como `Authorization: Bearer <token>` en cada request.
5. `RoleGate` cliente lee el rol del store para gatear rutas; el guard real es `JwtGuard` + `RolesGuard` en NestJS.
6. Logout: el frontend descarta el token (no hay invalidación server-side por ahora).

---

## Flujo de Quiz

1. Frontend llama `GET /cuestionarios?materiaId=<id>`. El `JwtGuard` valida el token.
2. Usuario contesta en el cliente.
3. Al finalizar, llamada a `POST /intentos` (pendiente de implementar en el backend). El backend calcula el `score`, persiste `Attempt` + `AnswerLog` y devuelve el resultado.
4. Frontend muestra el resultado y refresca el historial.

---

## Modelo de datos (resumen)

Schema completo en `backend/prisma/schema.prisma`. Modelos principales:

- `User` — id (cuid), email, passwordHash, role (ADMIN|DOCENTE|ESTUDIANTE), carreraId.
- `Carrera`, `Materia` — catálogo académico. Slugs deben coincidir con `app/domain/academic.ts`.
- `Cuestionario`, `Question` — autoría docente. `Question.opciones` es `String[]`.
- `Attempt`, `AnswerLog` — historial de intentos por usuario.

IDs: `cuid` (generados por Prisma). Fechas: `DateTime` (ISO-8601 al cliente).

---

## Autorización

Los guards en `backend/src/auth/guards/`:

- `JwtGuard` — verifica la firma y expiración del JWT en cada request protegido.
- `RolesGuard` — lee el decorador `@Roles(...)` del endpoint y compara con `payload.role`.

Reglas por recurso:
- `GET /cuestionarios` — cualquier autenticado.
- `POST/PATCH/DELETE /cuestionarios/:id` — solo autor (`autorId === user.sub`) o ADMIN.
- `GET/POST/PATCH/DELETE /users` — solo ADMIN.
- `GET /auth/me` — cualquier autenticado.

El cliente **no** es la fuente de verdad de autorización. El RoleGate frontend es solo UX.

---

## Flujo de Datos Frontend

```
┌─────────────────────────────────────────┐
│         Usuario en Navegador            │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼─────────┐
        │  Next.js Pages   │
        └────────┬─────────┘
                 │
   ┌─────────────┼────────────────┐
   │             │                │
┌──▼──┐   ┌─────▼────┐   ┌───────▼──────┐
│ 3D  │   │ Zustand  │   │  fetch/      │
│Scene│   │ (UI only)│   │  REST calls  │
└─────┘   └──────────┘   │  → :3001     │
                         └──────────────┘
```

---

## Estado Frontend

Zustand queda restringido a UI local. El estado servidor migra a llamadas REST al backend.

### Zustand (UI permanente)
- `useAnatomyStore` — `hovered`, `selected: AnatomyItem | null`, `selectedUuid`, `isolated`.
- `useCameraStore` — `target`, `position`, `isMoving`, `setFocus()`.
- `useMeshStore` — `groups`, `toggleGroup(key, visible)`.

### A reemplazar por llamadas al backend
| Store actual (mock) | Reemplazo |
|---------------------|-----------|
| `userStore.login()` | `POST /auth/login` → JWT |
| `userStore.user` | `GET /auth/me` + JWT payload |
| `usersStore.*` | `GET/PATCH/DELETE /users` (admin) |
| `cuestionarioBankStore.cuestionarios` | `GET /cuestionarios` |
| `cuestionarioBankStore.create/update/remove` | `POST/PATCH/DELETE /cuestionarios` |
| `cuestionarioHistoryStore.addAttempt` | `POST /intentos` (pendiente en backend) |
| `cuestionarioHistoryStore.attempts` | `GET /intentos/me` (pendiente en backend) |

---

## Seguridad

- JWT firmado con `JWT_SECRET` (HS256). No exponer en localStorage sin HTTPS.
- `passwordHash` nunca viaja al cliente.
- `JwtGuard` + `RolesGuard` son la fuente de verdad de autorización.
- CORS en NestJS configurado para aceptar solo `http://localhost:3000` en desarrollo.

---

## Performance

- **Frontend**: lazy loading de modelos GLB, memoización de stores Zustand.
- **Backend**: índices en `User.email`, `Cuestionario.autorId`, `Cuestionario.materiaId`, `Attempt.userId`, `Attempt.cuestionarioId` — agregar en migraciones si no están.
- Para historial de intentos con volumen, paginar con `skip`/`take` de Prisma.
