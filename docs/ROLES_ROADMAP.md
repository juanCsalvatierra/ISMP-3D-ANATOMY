# Roadmap — Roles y vistas

## Estado actual (mayo 2026)

| Rol         | Ruta home          | Estado     |
|-------------|--------------------|------------|
| estudiante  | `/`                | ✅ Completo |
| docente     | `/docente`         | ✅ Completo (CRUD de cuestionarios + resultados de alumnos) |
| admin       | `/admin`           | 🟡 Esqueleto + `/admin/usuarios` completo (CRUD de usuarios) |

Dominio académico modelado en [app/domain/academic.ts](../domain/academic.ts):

- **Carreras**: Instrumentación Quirúrgica (Anatomía I, II), Radiología (Anatomía I–IV).
- **Materias**: Anatomía I, II, III, IV.
- **Cuestionarios**: pertenecen a una materia, los crea un docente/admin.

Stores persistidos (Zustand + `localStorage`):
- [app/store/userStore.ts](../store/userStore.ts) — sesión actual con `carreraId` opcional.
- [app/store/usersStore.ts](../store/usersStore.ts) — CRUD de usuarios (seedeado).
- [app/store/cuestionarioBankStore.ts](../store/cuestionarioBankStore.ts) — CRUD de cuestionarios (seedeado con 3 cuestionarios).
- [app/store/cuestionarioHistoryStore.ts](../store/cuestionarioHistoryStore.ts) — intentos por usuario y cuestionario.

Guards: [app/components/auth/RoleGate.tsx](../components/auth/RoleGate.tsx) protege `/admin/**`, `/docente/**` y `/mis-cuestionarios`.

---

## Pendientes (admin)

Páginas del admin que quedan como placeholder en [app/admin/page.tsx](../admin/page.tsx):

1. **`/admin/carreras`** — Configurar carreras y asignación de materias.
   - UI: tabla de carreras + checkbox grid para asignar materias.
   - Store: ampliar `useUsersStore` o crear `useCarrerasStore` (hoy las carreras viven hardcodeadas en `academic.ts`).
2. **`/admin/contenido`** — Edición de descripciones del `anatomy.final.builded.json` (no es prioritario; persistir en Supabase cuando se migre).
3. **Vista admin de cuestionarios global** — Actualmente el admin reutiliza `/docente` (ve todos por ser autor solo de los propios). Tras migrar a Supabase, agregar `/admin/cuestionarios` con tabla cross-docente (la RLS permite SELECT a admin sobre todos) y acción "transferir autoría" (UPDATE de `autor_id`, solo admin).

---

## Migración a backend (Supabase)

El backend del proyecto es **Supabase** (Auth + Postgres + RLS). Ver [SUPABASE.md](SUPABASE.md) para:

- Schema SQL completo (`profiles`, `carreras`, `materias`, `cuestionarios`, `preguntas`, `intentos`, `respuestas`).
- Custom access token hook que inyecta `user_role` y `carrera_id` en el JWT.
- Políticas RLS por tabla.
- Mapeo store mock → Supabase y plan de migración por fases (auth → users → cuestionarios → intentos).
- Recomendación: TanStack Query para estado servidor; Zustand solo para UI local (anatomía 3D, cámara, capas).

### Impacto sobre los stores actuales
- `userStore` → `supabase.auth` + hook `useUser()` que lee `profiles`.
- `usersStore` → queries sobre `profiles` (admin gestiona roles desde aquí).
- `cuestionarioBankStore` → queries/mutaciones sobre `cuestionarios` y `preguntas` (con RPC `create_cuestionario` para atomicidad).
- `cuestionarioHistoryStore` → queries sobre `intentos` y `respuestas` (con RPC `submit_attempt` para cálculo server-side del score).
- `RoleGate` cliente queda como fallback UX; el guard real pasa a [middleware.ts](../middleware.ts) leyendo `user_role` del JWT.
