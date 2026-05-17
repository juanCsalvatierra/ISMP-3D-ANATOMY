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
2. **`/admin/contenido`** — Edición de descripciones del `anatomy.final.builded.json` (no es prioritario; vincular cuando exista backend).
3. **Vista admin de cuestionarios global** — Actualmente el admin reutiliza `/docente` (ve todos por ser autor solo de los propios). Cuando haya backend, agregar `/admin/cuestionarios` con tabla cross-docente y acción "transferir autoría".

---

## Migración a backend

Ver [BACKEND_API.md](BACKEND_API.md) para el detalle de:
- Modelo Prisma sugerido.
- Endpoints REST y mapeo store → endpoint.
- Estrategia de migración paso a paso (feature flag `NEXT_PUBLIC_USE_BACKEND`).
- Recomendación: migrar a TanStack Query para estado servidor; dejar Zustand solo para UI local (anatomía 3D, cámara, capas).
