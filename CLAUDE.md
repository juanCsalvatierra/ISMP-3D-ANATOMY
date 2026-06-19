# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ISMP Anatomy — Next.js 16 + React 19 educational platform for interactive 3D anatomy. **Backend: Supabase** (Auth + Postgres + RLS) — no hay servidor Node.js intermedio. Ver [docs/SUPABASE.md](docs/SUPABASE.md). Hoy el frontend corre standalone con JSON local + Zustand+localStorage como mocks, mientras se hace la migración por fases (auth → users → cuestionarios → intentos).

User-facing strings and most domain terminology are in **Spanish** (e.g. `cuestionarios`, `docente`). Preserve language when editing UI copy.

## Commands

```bash
npm run dev        # Next dev server on :3000
npm run build      # Production build
npm run start      # Run prod build
npm run lint       # ESLint (flat config, eslint-config-next)
```

No test runner is configured. Requires Node ≥ 20.

## Architecture

### Routing (App Router, [app/](app/))
Top-level routes map to product areas:
- [app/skeleton/](app/skeleton/), [app/muscles/](app/muscles/) — 3D viewers per system
- [app/imaging/](app/imaging/), `imaging/[studyId]/` — medical-image viewer
- [app/cuestionarios/](app/cuestionarios/), `cuestionarios/[id]/`, `.../results/` — student quizzes
- [app/docente/cuestionarios/](app/docente/cuestionarios/) — teacher quiz authoring (`nuevo`, `[id]`)
- [app/mis-cuestionarios/](app/mis-cuestionarios/), [app/admin/usuarios/](app/admin/usuarios/), [app/login/](app/login/)

Role gating (student / `docente` / admin) is referenced in [docs/ROLES_ROADMAP.md](docs/ROLES_ROADMAP.md).

### 3D pipeline
- GLB assets live in [public/models/](public/models/) (`skeleton.glb`, `muscles.glb`, `organs.glb`, `nervous.glb`, etc.).
- Rendered via `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`. Scene/model components are under [app/components/scene/](app/components/scene/), [app/components/models/](app/components/models/), [app/components/layers/](app/components/layers/), [app/components/labels/](app/components/labels/).
- Anatomy metadata (hierarchical structure → mesh names) is **static JSON** in [app/data/](app/data/): `anatomy.final.builded.json`, `anatomy.skeleton.json`, `imaging-studies.json`. The matcher in [app/utils/matcher.ts](app/utils/matcher.ts) + [app/utils/indexBuilder.ts](app/utils/indexBuilder.ts) maps Three.js mesh names to `AnatomyItem` entries; [app/utils/normalize.ts](app/utils/normalize.ts) handles name normalization (accents, casing) — touch with care, all hover/select interactions depend on it.

### State (Zustand, [app/store/](app/store/))
All client state goes through Zustand stores; do not introduce Redux/Context for cross-cutting state.
- `anatomyStore` — `hovered`, `selected` (`AnatomyItem`), `selectedUuid`, `isolated`, label visibility
- `cameraStore` — camera target/position + `setFocus` animation
- `meshStore` — visibility toggles per mesh group
- `userStore`, `usersStore` — auth/user state (currently client-only; no real backend)
- `cuestionarioBankStore`, `cuestionarioHistoryStore` — quiz authoring + attempt history (localStorage-persisted)
- `useHydrated` — guard for SSR/CSR hydration when reading persisted stores

When reading persisted Zustand state in a component, gate on `useHydrated` to avoid SSR mismatches.

### Domain types
Shared types (quiz/academic shapes) in [app/domain/academic.ts](app/domain/academic.ts). The 3D anatomy item shape (`AnatomyItem`, `Section`) is defined in [app/store/anatomyStore.ts](app/store/anatomyStore.ts) — import it from there.

### Styling
Tailwind CSS v4 (PostCSS plugin, no `tailwind.config` file — configured via [postcss.config.mjs](postcss.config.mjs) and [app/globals.css](app/globals.css)). Fonts: IBM Plex Sans/Serif/Mono loaded in [app/layout.tsx](app/layout.tsx) via CSS variables.

## Auth abstraction layer

Auth is decoupled via `AuthProvider` interface (`app/types/authProvider.ts`). The active implementation is `localAuthProvider` (`app/providers/localAuthProvider.ts`), which uses `localStorage`. When Supabase auth is wired, create a `supabaseAuthProvider` implementing the same interface — the store (`userStore`) consumes the provider, not a specific implementation.

`app/components/auth/RoleGate.tsx` — client-side guard for `/admin/**`, `/docente/**`, `/mis-cuestionarios`. Once `middleware.ts` is added (planned), RoleGate becomes a UX fallback only.

## Backend integration (Supabase, migración en curso)

[docs/SUPABASE.md](docs/SUPABASE.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) describen la solución definitiva: Supabase Auth + Postgres con RLS, integrado vía `@supabase/ssr` en el App Router. La migración se hace por fases con feature flag `NEXT_PUBLIC_USE_SUPABASE=1` (auth → users → cuestionarios → intentos). Mientras no esté completa, auth/quizzes/usuarios siguen sobre mocks Zustand+localStorage.

Al cablear features reales: leer SUPABASE.md primero, usar RLS como fuente de verdad de autorización, nunca `service_role_key` en código cliente, y no inventar endpoints REST (todo va por `supabase-js` o RPC). TanStack Query no está instalado aún — agregarlo cuando empiece la migración de servidor.

La carpeta `backend/` (NestJS placeholder) **no aplica** — se elimina al completar la integración Supabase, per docs/SUPABASE.md §7.

Variables esperadas en `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (solo server).

Estructura destino para el cliente Supabase (no existe aún):
```
lib/supabase/
  client.ts    # createBrowserClient — Client Components
  server.ts    # createServerClient (cookies) — Server Components / Route Handlers
  admin.ts     # createClient con service_role — server-only
  types.ts     # generado con `supabase gen types typescript`
```

## Conventions

- TypeScript strict mode is on ([tsconfig.json](tsconfig.json)); avoid `any` — anatomy/quiz data is heavily typed.
- `app/utils/layerPresets.ts` — visibility presets for 3D layer groups; `app/hooks/useViewerTabs.ts` — tab state for the viewer sidebar. Both are tightly coupled to the mesh group keys in `meshStore`.
