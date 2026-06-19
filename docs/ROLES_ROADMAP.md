# Roadmap — Roles y vistas

## Estado actual (junio 2026)

| Rol         | Ruta home          | Estado     |
|-------------|--------------------|------------|
| estudiante  | `/`                | ✅ Completo (mock) |
| docente     | `/docente`         | ✅ Completo (mock) — CRUD de cuestionarios + resultados de alumnos |
| admin       | `/admin`           | 🟡 Parcial — `/admin/usuarios` completo (mock); `/admin/carreras` y `/admin/contenido` son stubs |

Dominio académico modelado en [app/domain/academic.ts](../app/domain/academic.ts):

- **Carreras**: Instrumentación Quirúrgica (Anatomía I, II), Radiología (Anatomía I–IV).
- **Materias**: Anatomía I, II, III, IV.
- **Cuestionarios**: pertenecen a una materia, los crea un docente/admin.

Stores actuales (Zustand + `localStorage`, mocks):
- [app/store/userStore.ts](../app/store/userStore.ts) — sesión actual.
- [app/store/usersStore.ts](../app/store/usersStore.ts) — CRUD de usuarios (seedeado con 7 usuarios).
- [app/store/cuestionarioBankStore.ts](../app/store/cuestionarioBankStore.ts) — CRUD de cuestionarios (seedeado con 3 cuestionarios).
- [app/store/cuestionarioHistoryStore.ts](../app/store/cuestionarioHistoryStore.ts) — intentos por usuario.

Guards cliente: [app/components/auth/RoleGate.tsx](../app/components/auth/RoleGate.tsx) protege `/admin/**`, `/docente/**` y `/mis-cuestionarios`.

---

## Pendientes (admin)

1. **`/admin/carreras`** — Configurar carreras y asignación de materias (hoy hardcodeadas en `academic.ts`; al migrar al backend vienen de la DB).
2. **`/admin/contenido`** — Edición de descripciones del `anatomy.final.builded.json` (no prioritario).
3. **Vista admin de cuestionarios global** — Actualmente el admin reutiliza `/docente` (ve solo los propios). Agregar `/admin/cuestionarios` con tabla cross-docente usando `GET /cuestionarios` (el backend devuelve todos si el rol es ADMIN).

---

## Integración con backend (NestJS)

El backend del proyecto es **NestJS + Prisma + PostgreSQL** en `backend/`. Ver [BACKEND.md](BACKEND.md) para:

- Schema Prisma completo (`User`, `Carrera`, `Materia`, `Cuestionario`, `Question`, `Attempt`, `AnswerLog`).
- Endpoints disponibles y pendientes.
- Plan de integración por fases (auth → users → cuestionarios → intentos).

### Impacto sobre los stores actuales

| Store mock actual | Reemplazo |
|-------------------|-----------|
| `userStore.login()` | `POST /auth/login` → JWT via `nestAuthProvider` |
| `userStore.user` | Payload del JWT + `GET /auth/me` |
| `usersStore.*` | `GET/PATCH/DELETE /users` (solo ADMIN) |
| `cuestionarioBankStore.*` | `GET/POST/PATCH/DELETE /cuestionarios` |
| `cuestionarioHistoryStore.*` | `POST /intentos` + `GET /intentos/me` (pendiente en backend) |

`RoleGate` cliente queda como fallback UX. El guard real es `JwtGuard` + `RolesGuard` en NestJS. Cuando se agregue `middleware.ts` en el frontend, el gating server-side leerá el JWT directamente.
