# ISMP Anatomy - Arquitectura del Proyecto

> **Backend: Supabase** (Auth + Postgres + Storage). No hay servicio Node.js intermedio; el frontend habla directo con Supabase y la autorización vive en la base vía RLS. Detalle completo en [SUPABASE.md](SUPABASE.md).

---

## Diagrama General

```
┌─────────────────────────────────────────┐
│      FRONTEND (Next.js 16 App Router)   │
│  - 3D Viewer (Three.js + Fiber)         │
│  - Auth UI (Supabase)                   │
│  - Quiz Interface                       │
│  - Image Gallery                        │
│  - middleware.ts (refresh + role gate)  │
│  Puerto: 3000                           │
└──────────────┬──────────────────────────┘
               │
       @supabase/ssr  (cookie httpOnly)
       @supabase/supabase-js
               │
┌──────────────▼──────────────────────────┐
│      SUPABASE (gestionado)              │
│  ┌────────────┐  ┌──────────────────┐   │
│  │   Auth     │  │  Postgres + RLS  │   │
│  │  (email/   │  │  profiles        │   │
│  │   pwd, JWT │  │  carreras        │   │
│  │   con role)│  │  materias        │   │
│  └────────────┘  │  cuestionarios   │   │
│  ┌────────────┐  │  preguntas       │   │
│  │  Storage   │  │  intentos        │   │
│  │ (imágenes) │  │  respuestas      │   │
│  └────────────┘  └──────────────────┘   │
│  Access Token Hook → role en JWT        │
└─────────────────────────────────────────┘
```

---

## Flujo de Autenticación

1. Usuario ingresa email/password en `/login`.
2. Frontend llama `supabase.auth.signInWithPassword(...)`.
3. Supabase Auth valida y emite JWT que incluye `user_role` y `carrera_id` (inyectados por el **custom access token hook**).
4. `@supabase/ssr` persiste la sesión en cookie httpOnly.
5. `middleware.ts` refresca la sesión en cada request y lee `user_role` del JWT para gatear `/admin/**`, `/docente/**`, `/mis-cuestionarios`.
6. RLS en Postgres usa `auth.uid()` y `auth.jwt()->>'user_role'` como única fuente de verdad para autorización.
7. Logout: `supabase.auth.signOut()` limpia la cookie.

---

## Flujo de Quiz

1. Frontend consulta `from('cuestionarios').select('*, preguntas(*)').eq('id', id)`. RLS deja pasar a cualquier autenticado.
2. Usuario contesta en el cliente.
3. Al finalizar, llamada a RPC `submit_attempt({ cuestionario_id, answers })`. La función Postgres valida server-side, calcula `score`, persiste `intentos` + `respuestas` en una transacción y devuelve el resultado.
4. Frontend muestra resultado y refresca la lista de intentos vía TanStack Query.

---

## Flujo de Upload de Imágenes Médicas (futuro)

1. Frontend selecciona archivo (validación cliente).
2. `supabase.storage.from('imaging').upload(path, file)` con path `{user_id}/...`.
3. Política de Storage permite escritura solo en la propia carpeta.
4. Metadata se persiste en `imaging_studies` con FK a `profiles`.
5. Lectura vía signed URL de corta duración.

---

## Modelo de datos (resumen)

Schema completo en [SUPABASE.md §2](SUPABASE.md). Tablas principales en `public`:

- `profiles` — 1:1 con `auth.users`. Campos: `role` (enum `estudiante|docente|admin`), `carrera_id`.
- `carreras`, `materias`, `carrera_materias` — catálogo académico (mismos slugs que [app/domain/academic.ts](../app/domain/academic.ts)).
- `cuestionarios`, `preguntas` — autoría docente.
- `intentos`, `respuestas` — historial por usuario.

Trigger `on_auth_user_created` inserta automáticamente un `profiles` con rol default `estudiante` al alta de un `auth.users`.

---

## Autorización (RLS)

Reglas centrales (detalle SQL en [SUPABASE.md §4](SUPABASE.md)):

- `profiles`: usuario lee/edita el suyo (sin tocar `role`); admin todo.
- `cuestionarios`: SELECT autenticados; INSERT/UPDATE/DELETE solo autor o admin; INSERT exige `role in ('docente','admin')`.
- `preguntas`: gateadas a través del cuestionario padre.
- `intentos`: estudiante ve los suyos; docente ve los de sus cuestionarios; admin todo. INSERT solo si `user_id = auth.uid()`.
- `respuestas`: gateadas a través del `intento` padre.

---

## Flujo de Datos Frontend

```
┌─────────────────────────────────────────┐
│         Usuario en Navegador            │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼─────────┐
        │  Next.js Pages   │   /skeleton, /muscles, /cuestionarios, ...
        └────────┬─────────┘
                 │
   ┌─────────────┼────────────────┐
   │             │                │
┌──▼──┐   ┌─────▼────┐   ┌───────▼──────┐
│ 3D  │   │ Zustand  │   │ TanStack     │
│Scene│   │ (UI only)│   │ Query →      │
└─────┘   └──────────┘   │ Supabase     │
                         └───────┬──────┘
                                 │
                         ┌───────▼──────┐
                         │ Supabase     │
                         │ (Auth+DB+RLS)│
                         └──────────────┘
```

---

## Estado Frontend

Zustand queda restringido a UI local; el estado servidor migra a TanStack Query sobre Supabase.

### Zustand (UI)
- `useAnatomyStore` — `hovered`, `selected: AnatomyItem | null`, `selectedUuid`, `isolated`.
- `useCameraStore` — `target`, `position`, `isMoving`, `setFocus()`.
- `useMeshStore` — `groups`, `toggleGroup(key, visible)`.

### A reemplazar por Supabase + TanStack Query
- `userStore`, `usersStore` → `supabase.auth` + queries sobre `profiles`.
- `cuestionarioBankStore` → queries sobre `cuestionarios` / `preguntas`.
- `cuestionarioHistoryStore` → queries sobre `intentos` / `respuestas`.

---

## Seguridad

- Sesión en **cookie httpOnly** (gestionada por `@supabase/ssr`) — no localStorage, no vulnerable a XSS de robo de token.
- RLS es la fuente de verdad de autorización. Nunca confiar en filtros del cliente.
- `service_role_key` **solo** en server (Route Handlers, scripts). Nunca en bundle cliente.
- HTTPS forzado en producción.
- Validación adicional en RPCs para operaciones críticas (cálculo de score server-side).

---

## Performance

- **Frontend**: lazy loading, memoización de stores Zustand.
- **Supabase**: índices automáticos en PKs/FKs; agregar manualmente índices en `cuestionarios.materia_id`, `cuestionarios.autor_id`, `intentos.user_id`, `intentos.cuestionario_id`.
- **Paginación**: para historial de intentos usar `range()` o cursor (`gt('created_at', ...)`).

---

## Error Handling

### Frontend
- Try-catch en mutaciones; toasts para errores.
- Códigos Postgres comunes a manejar: `42501` (RLS denegó), `23505` (unique violation), `23503` (FK violation).

### Supabase
- RLS rechaza con `42501` antes de tocar la tabla.
- RPCs lanzan `raise exception` con mensajes descriptivos.
