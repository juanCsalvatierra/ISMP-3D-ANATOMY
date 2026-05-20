# Backend con Supabase — ISMP 3D Anatomy

Supabase es la **solución de backend** del proyecto: el frontend Next.js habla directo con Supabase (Auth + Postgres + Storage) y la autorización se enforza en la base de datos vía **Row Level Security (RLS)**. No hay servicio Node.js intermedio.

Este documento describe el modelo de datos, las políticas RLS, el flujo de auth con roles y la migración desde los mocks Zustand+localStorage actuales.

Stack: **Supabase (Auth + Postgres + Storage) + `@supabase/ssr` en Next.js 16 App Router**.

---

## 1. Roles

Tres roles fijos: `estudiante` · `docente` · `admin`. Se almacenan en la tabla `profiles` (no en `auth.users`) y se exponen en el JWT vía **custom access token hook** para poder usarlos en RLS sin un `JOIN` en cada query.

- `estudiante` (default) — rinde cuestionarios, ve solo los suyos.
- `docente` — crea/edita/elimina sus propios cuestionarios; ve intentos de alumnos sobre sus cuestionarios.
- `admin` — bypass total: gestión de usuarios, asignación de carreras, vista global.

El primer admin se crea manualmente desde el Studio de Supabase (UPDATE en `profiles`). Nunca se expone vía endpoint público.

---

## 2. Modelo de datos (SQL)

> Convención: snake_case en la base, camelCase en el cliente (mapear en helpers `lib/supabase/`).

```sql
-- Enum de roles
create type public.user_role as enum ('estudiante', 'docente', 'admin');
create type public.formato as enum ('multiple', 'truefalse', 'identification', 'labeling');

-- Perfil 1:1 con auth.users (NUNCA referenciar auth.users desde otra tabla directamente)
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  nombre      text not null default '',
  role        public.user_role not null default 'estudiante',
  carrera_id  uuid references public.carreras(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Catálogo académico (idem dominio actual en app/domain/academic.ts)
create table public.carreras (
  id    uuid primary key default gen_random_uuid(),
  slug  text not null unique,       -- 'instrumentacion' | 'radiologia'
  label text not null
);

create table public.materias (
  id    uuid primary key default gen_random_uuid(),
  slug  text not null unique,       -- 'anatomia-1'..'anatomia-4'
  label text not null
);

create table public.carrera_materias (
  carrera_id uuid references public.carreras(id) on delete cascade,
  materia_id uuid references public.materias(id) on delete cascade,
  primary key (carrera_id, materia_id)
);

-- Cuestionarios
create table public.cuestionarios (
  id           uuid primary key default gen_random_uuid(),
  titulo       text not null,
  descripcion  text not null default '',
  materia_id   uuid not null references public.materias(id) on delete restrict,
  formato      public.formato not null,
  autor_id     uuid not null references public.profiles(id) on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.preguntas (
  id              uuid primary key default gen_random_uuid(),
  cuestionario_id uuid not null references public.cuestionarios(id) on delete cascade,
  orden           int  not null,
  texto           text not null,
  opciones        jsonb not null,   -- array de strings
  correct         int  not null,
  explicacion     text not null default ''
);

-- Intentos y respuestas
create table public.intentos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.profiles(id) on delete set null,
  cuestionario_id uuid not null references public.cuestionarios(id) on delete cascade,
  materia_slug    text not null,
  formato         public.formato not null,
  score           int  not null,
  total           int  not null,
  completed_at    timestamptz not null default now()
);

create table public.respuestas (
  id          uuid primary key default gen_random_uuid(),
  intento_id  uuid not null references public.intentos(id) on delete cascade,
  pregunta_id uuid not null references public.preguntas(id) on delete cascade,
  selected    int  not null,
  correct     boolean not null
);

-- Trigger: al crear auth.users → insertar profile con rol default 'estudiante'
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

## 3. Custom Access Token Hook (rol en el JWT)

Para evitar un `JOIN` con `profiles` en cada política RLS, se inyecta `role` y `carrera_id` en el JWT al emitir el token:

```sql
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb language plpgsql stable as $$
declare
  claims    jsonb;
  user_role text;
  carrera   uuid;
begin
  select role::text, carrera_id into user_role, carrera
  from public.profiles
  where id = (event->>'user_id')::uuid;

  claims := event->'claims';
  claims := jsonb_set(claims, '{user_role}', to_jsonb(coalesce(user_role, 'estudiante')));
  claims := jsonb_set(claims, '{carrera_id}', to_jsonb(carrera));
  return jsonb_set(event, '{claims}', claims);
end;
$$;
```

Registrar el hook en **Supabase Dashboard → Authentication → Hooks → Custom Access Token**. Después, en RLS se lee con `auth.jwt()->>'user_role'`.

> Importante: si cambia `profiles.role`, el usuario debe **refrescar la sesión** para que el JWT lo refleje. En la UI, después de un cambio de rol invocar `supabase.auth.refreshSession()`.

---

## 4. Políticas RLS

Habilitar RLS en todas las tablas y declarar políticas. Helper en SQL:

```sql
create or replace function public.current_role() returns text
language sql stable as $$ select auth.jwt()->>'user_role' $$;

create or replace function public.is_admin() returns boolean
language sql stable as $$ select public.current_role() = 'admin' $$;
```

### `profiles`
```sql
alter table public.profiles enable row level security;

-- Cualquier autenticado lee su propio perfil; admin lee todos
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- Usuario actualiza su nombre; rol y carrera solo admin
create policy "profiles_update_self_nonrole" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());
```

### `cuestionarios`
```sql
alter table public.cuestionarios enable row level security;

-- Lectura: cualquier autenticado. (Filtrado por carrera del estudiante se hace en query del cliente vía join materias↔carreras_materias↔profiles.carrera_id; opcionalmente endurecer con política.)
create policy "cuestionarios_select_auth" on public.cuestionarios
  for select to authenticated using (true);

-- Insert: solo docente/admin, y autor_id debe ser el propio user
create policy "cuestionarios_insert_docente" on public.cuestionarios
  for insert to authenticated
  with check (
    public.current_role() in ('docente', 'admin')
    and autor_id = auth.uid()
  );

-- Update/Delete: autor o admin
create policy "cuestionarios_modify_owner" on public.cuestionarios
  for update using (autor_id = auth.uid() or public.is_admin())
  with check (autor_id = auth.uid() or public.is_admin());

create policy "cuestionarios_delete_owner" on public.cuestionarios
  for delete using (autor_id = auth.uid() or public.is_admin());
```

### `preguntas`
```sql
alter table public.preguntas enable row level security;

create policy "preguntas_select_auth" on public.preguntas
  for select to authenticated using (true);

create policy "preguntas_write_via_owner" on public.preguntas
  for all using (
    exists (
      select 1 from public.cuestionarios c
      where c.id = preguntas.cuestionario_id
        and (c.autor_id = auth.uid() or public.is_admin())
    )
  ) with check (
    exists (
      select 1 from public.cuestionarios c
      where c.id = preguntas.cuestionario_id
        and (c.autor_id = auth.uid() or public.is_admin())
    )
  );
```

### `intentos` y `respuestas`
```sql
alter table public.intentos enable row level security;

-- Estudiante: solo los suyos. Docente: los de sus cuestionarios. Admin: todo.
create policy "intentos_select_visible" on public.intentos
  for select using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.cuestionarios c
      where c.id = intentos.cuestionario_id and c.autor_id = auth.uid()
    )
  );

-- Insert: solo el propio user (estudiante o admin probando)
create policy "intentos_insert_self" on public.intentos
  for insert with check (user_id = auth.uid());

alter table public.respuestas enable row level security;
create policy "respuestas_via_intento" on public.respuestas
  for all using (
    exists (select 1 from public.intentos i where i.id = respuestas.intento_id
            and (i.user_id = auth.uid() or public.is_admin()
                 or exists (select 1 from public.cuestionarios c where c.id = i.cuestionario_id and c.autor_id = auth.uid())))
  ) with check (
    exists (select 1 from public.intentos i where i.id = respuestas.intento_id and i.user_id = auth.uid())
  );
```

### Catálogo (`carreras`, `materias`, `carrera_materias`)
Lectura pública para autenticados; escritura solo admin.

---

## 5. Integración Next.js (App Router)

### Paquetes
```
npm i @supabase/supabase-js @supabase/ssr
```

### Variables de entorno
```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>     # solo en server, NUNCA exponer
```


### Estructura sugerida
```
lib/supabase/
  client.ts        # createBrowserClient para Client Components
  server.ts        # createServerClient (cookies) para Server Components / Route Handlers
  admin.ts         # createClient con service_role — uso server-only
  types.ts         # tipos generados con `supabase gen types typescript`
middleware.ts      # refresca sesión y gatea /admin, /docente, /mis-cuestionarios
```

### Middleware
- Refresca sesión en cada request (patrón oficial `@supabase/ssr`).
- Lee `user_role` del JWT (no de la DB) y redirige:
  - `/admin/**` → solo `admin`.
  - `/docente/**` → `docente` o `admin`.
  - `/mis-cuestionarios` → autenticado.
  - No autenticado en rutas protegidas → `/login`.

El `RoleGate` cliente queda como fallback UX (loader rápido); el guard real es server-side.

---

## 6. Mapeo store → Supabase

| Frontend actual (mock) | Reemplazo Supabase |
|------------------------|---------------------|
| `userStore.login(email, pwd)` | `supabase.auth.signInWithPassword({ email, password })` |
| `userStore.logout()` | `supabase.auth.signOut()` |
| `userStore.user` | `supabase.auth.getUser()` + `profiles` join (preferir hook `useUser()`) |
| `useUsersStore.*` | Tabla `profiles` — solo admin escribe |
| `useCuestionarioBankStore.cuestionarios` | `from('cuestionarios').select('*, preguntas(*)')` |
| `useCuestionarioBankStore.create(input)` | `from('cuestionarios').insert(...)` + `from('preguntas').insert(...)` |
| `useCuestionarioBankStore.update(id, patch)` | `from('cuestionarios').update(...).eq('id', id)` |
| `useCuestionarioBankStore.remove(id)` | `from('cuestionarios').delete().eq('id', id)` |
| `useCuestionarioHistoryStore.addAttempt(...)` | `from('intentos').insert(...)` + `from('respuestas').insert(...)` (idealmente en un RPC para atomicidad) |
| `useCuestionarioHistoryStore.attempts` | `from('intentos').select('*, respuestas(*)')` |

**Recomendación**: introducir **TanStack Query** para queries/mutaciones a Supabase. Conservar Zustand solo para UI local: `anatomyStore`, `cameraStore`, `meshStore`.

Para operaciones que requieren atomicidad (crear cuestionario + preguntas, registrar intento + respuestas + score) usar **funciones RPC** en Postgres (`create function ... language plpgsql`) y llamarlas con `supabase.rpc('nombre', { ... })`.

---

## 7. Migración paso a paso

1. **Setup**: crear proyecto en Supabase, ejecutar el SQL del schema, registrar el access token hook, sembrar `carreras` / `materias` con los mismos slugs que [app/domain/academic.ts](../app/domain/academic.ts).
2. **Auth real**: instalar `@supabase/ssr`, crear `lib/supabase/{client,server}.ts` y `middleware.ts`. Reemplazar `userStore.login` por `signInWithPassword`. Conservar el shape `User` del frontend mapeando desde `profiles`.
3. **Usuarios (admin)**: migrar `useUsersStore` a queries sobre `profiles`. La UI de admin sigue igual; cambia la fuente de datos.
4. **Cuestionarios (lectura)**: reemplazar la fuente del `useCuestionarioBankStore` por queries Supabase, manteniendo la API del store si conviene (o pasar a TanStack Query).
5. **Cuestionarios (escritura)**: mover `CuestionarioForm.onSubmit` a un RPC `create_cuestionario(payload jsonb)` para crear cuestionario + preguntas en una sola transacción.
6. **Intentos**: idem, RPC `submit_attempt(...)` que valide respuestas server-side, calcule score y persista intento + respuestas.
7. **Limpieza**: eliminar los stores mock (`cuestionarioBankStore`, `usersStore`, seeds locales) y `app/store/userStore.ts` (reemplazado por `useUser()` o `useQuery('auth.me')`).
8. **Eliminar `/backend`**: la carpeta placeholder ya no aplica. Borrarla del repo y del `README`.

Durante la transición, gatear con feature flag `NEXT_PUBLIC_USE_SUPABASE=1` por área (auth → users → cuestionarios → intentos).

---

## 8. Storage (futuro, para imágenes médicas)

Cuando se incorporen subidas de imágenes:
- Bucket `imaging` con políticas por carpeta (`{user_id}/...`).
- Lectura pública con signed URLs de corta duración; escritura solo autenticado.
- Metadata en tabla `imaging_studies` con FK a `profiles`.

No es prioritario; los estudios actuales viven en JSON estático.

---

## 9. Convenciones

- IDs: `uuid` (no `cuid`). Generados en la DB con `gen_random_uuid()`.
- Fechas: `timestamptz` en la DB; ISO-8601 al cliente.
- Slugs de carrera/materia idénticos a [app/domain/academic.ts](../app/domain/academic.ts).
- Tipos del cliente generados con `npx supabase gen types typescript --project-id <id> > lib/supabase/types.ts` (commiteados).
- **Nunca** usar la `service_role_key` en código cliente. Solo en Route Handlers o scripts server-side.
- **Nunca** confiar en filtros del cliente para autorización: la RLS es la fuente de verdad.

---

## 10. Tests de paridad

Antes de cortar los mocks definitivamente, validar con el mismo seed:

| Acción | Mock devuelve | Supabase debe devolver |
|--------|---------------|------------------------|
| Login docente seed | User `role=docente`, carrera correcta | Idem |
| Estudiante de Instrumentación lista materias | `anatomia-1`, `anatomia-2` | Idem |
| Estudiante de Radiología lista materias | `anatomia-1..4` | Idem |
| Docente crea cuestionario | Aparece en su lista | Idem (RLS lo permite) |
| Estudiante intenta editar cuestionario ajeno | UI bloquea | RLS rechaza con `42501` |
| Admin ve todos los intentos | Todos | Todos |
