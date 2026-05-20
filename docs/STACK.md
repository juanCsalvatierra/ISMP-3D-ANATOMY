# ISMP Anatomy - Stack Tecnológico

## Visión General

Aplicación **Next.js** (frontend full-stack) + **Supabase** como backend gestionado (Auth + Postgres + Storage). No hay servidor Node.js intermedio: el cliente Next.js consulta Supabase directo y la autorización se enforza con **Row Level Security (RLS)**. Ver [SUPABASE.md](SUPABASE.md).

---

## Frontend Stack

**Ubicación:** `/` (raíz del proyecto)

### Lenguaje & Framework
- **Next.js** `16.2.3` - App Router, Server Components, middleware de auth
- **React** `19.2.3`
- **TypeScript** `5.9.3` (strict mode)

### 3D & Visualización
- **Three.js** `0.183.2`
- **@react-three/fiber** `9.5.0`
- **@react-three/drei** `10.7.7`
- **@react-three/postprocessing** `3.0.4`

### Estilos & UI
- **Tailwind CSS** `4` (PostCSS plugin)
- **tailwind-scrollbar** `4.0.2`

### Gestión de Estado
- **Zustand** `5.0.12` — solo estado UI local (anatomía 3D, cámara, capas).
- **TanStack Query** (a incorporar) — estado servidor sobre Supabase (cache, mutaciones, invalidaciones).

### Markdown
- **react-markdown** `10.1.0`

### Herramientas de Desarrollo
- **ESLint** `9` (flat config, `eslint-config-next`)
- **Prettier**

---

## Backend — Supabase

**No vive en este repo.** Se administra desde el dashboard de Supabase + migraciones SQL versionadas en `supabase/migrations/` (a crear).

### Servicios usados
- **Supabase Auth** — email/password, sesiones por cookie httpOnly vía `@supabase/ssr`.
- **Postgres** (gestionado por Supabase) — schema en `public.*`, RLS habilitada en todas las tablas de dominio.
- **Supabase Storage** (futuro) — imágenes médicas en bucket `imaging`.

### SDK / paquetes en el frontend
- **@supabase/supabase-js** — cliente principal.
- **@supabase/ssr** — integración cookies en Next.js App Router (server + client + middleware).

### Roles
Tres roles fijos en `profiles.role`: `estudiante` · `docente` · `admin`. Expuestos en el JWT mediante un **custom access token hook** para consumirlos en políticas RLS sin joins. Detalle en [SUPABASE.md](SUPABASE.md).

### Autorización
- **RLS por tabla** — única fuente de verdad de autorización.
- **Middleware Next.js** ([middleware.ts](../middleware.ts)) — refresca sesión y gatea `/admin/**`, `/docente/**`, `/mis-cuestionarios`.
- `service_role_key` solo en Route Handlers / scripts; nunca en bundle cliente.

---

## Comunicación Frontend ↔ Supabase

- Llamadas directas vía `supabase-js` (sin REST custom intermedio).
- Auth: cookie httpOnly (gestionada por `@supabase/ssr`).
- Operaciones que requieren atomicidad (crear cuestionario+preguntas, registrar intento+respuestas+score) → **funciones RPC** en Postgres invocadas con `supabase.rpc(...)`.

---

## Requisitos del Sistema

- Node.js 20+
- npm 10+
- Navegador moderno con soporte WebGL
- Proyecto Supabase (free tier alcanza para desarrollo)
- (Opcional dev local) [Supabase CLI](https://supabase.com/docs/guides/cli) para correr Postgres + Auth en Docker

---

## Variables de Entorno

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role>     # solo server, nunca exponer
NEXT_PUBLIC_APP_NAME=ISMP Anatomy
```

---

## Puertos

| Servicio | Puerto | Comando |
|----------|--------|---------|
| Frontend | 3000 | `npm run dev` |
| Supabase (cloud) | 443 | — |
| Supabase local (opcional, vía CLI) | 54321 (API), 54322 (DB) | `supabase start` |

---

## Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [`@supabase/ssr` en Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Custom Access Token Hooks](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook)
- [Three.js Docs](https://threejs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
