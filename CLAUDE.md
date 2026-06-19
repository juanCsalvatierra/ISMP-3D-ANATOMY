# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ISMP Anatomy — Next.js 16 + React 19 educational platform for interactive 3D anatomy. **Backend: NestJS + Prisma + PostgreSQL** en `backend/` (puerto 3001). El frontend corre standalone con JSON local + Zustand+localStorage como mocks mientras se conecta al backend real por fases (auth → users → cuestionarios → intentos).

User-facing strings and most domain terminology are in **Spanish** (e.g. `cuestionarios`, `docente`). Preserve language when editing UI copy.

## Commands

```bash
# Frontend
npm run dev        # Next dev server on :3000
npm run build      # Production build
npm run start      # Run prod build
npm run lint       # ESLint (flat config, eslint-config-next)

# Backend (desde /backend)
npm run start:dev  # NestJS dev server on :3001
npm run build      # Compile TypeScript
npx prisma migrate dev   # Apply migrations
npx prisma db seed       # Seed DB with carreras/materias/users
```

No test runner is configured on the frontend. Requires Node ≥ 20.

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
- `userStore` — auth/user state (currently client-only; replace with NestJS JWT provider)
- `usersStore` — user list for admin (currently seeded mock; replace with `GET /users`)
- `cuestionarioBankStore`, `cuestionarioHistoryStore` — quiz authoring + attempt history (localStorage-persisted; replace with API calls)
- `useHydrated` — guard for SSR/CSR hydration when reading persisted stores

When reading persisted Zustand state in a component, gate on `useHydrated` to avoid SSR mismatches.

### Domain types
Shared types (quiz/academic shapes) in [app/domain/academic.ts](app/domain/academic.ts). The 3D anatomy item shape (`AnatomyItem`, `Section`) is defined in [app/store/anatomyStore.ts](app/store/anatomyStore.ts) — import it from there.

### Styling
Tailwind CSS v4 (PostCSS plugin, no `tailwind.config` file — configured via [postcss.config.mjs](postcss.config.mjs) and [app/globals.css](app/globals.css)). Fonts: IBM Plex Sans/Serif/Mono loaded in [app/layout.tsx](app/layout.tsx) via CSS variables.

## Auth abstraction layer

Auth is decoupled via `AuthProvider` interface (`app/types/authProvider.ts`). The active implementation is `localAuthProvider` (`app/providers/localAuthProvider.ts`), which uses `localStorage`. When NestJS auth is wired, create a `nestAuthProvider` implementing the same interface — it calls `POST /auth/login`, stores the JWT (cookie or memory), and attaches `Authorization: Bearer <token>` to subsequent requests. The store (`userStore`) is a factory that receives the provider, so swapping is isolated.

`app/components/auth/RoleGate.tsx` — client-side guard for `/admin/**`, `/docente/**`, `/mis-cuestionarios`. Reads `userStore.currentUser.role`. Once a `middleware.ts` is added reading the JWT, RoleGate becomes a UX fallback only.

## Backend integration (NestJS, conexión en curso)

[docs/BACKEND.md](docs/BACKEND.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) describen la solución definitiva: NestJS + Prisma + PostgreSQL en `backend/` (puerto 3001). La migración se hace por fases: auth → users → cuestionarios → intentos.

Al cablear features reales: siempre enviar `Authorization: Bearer <token>` en las peticiones, nunca exponer el JWT en localStorage sin HTTPS, y no replicar las validaciones del backend en el cliente (los guards de NestJS son la fuente de verdad de autorización).

El JWT se emite desde `POST /auth/login` y contiene `sub` (userId), `email`, `role`, `carreraId`. Los guards de roles en el backend leen directamente el payload del token.

Variables esperadas:

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Backend (backend/.env)
DATABASE_URL=postgresql://user:pass@localhost:5432/ismp
JWT_SECRET=...
PORT=3001
```

## Conventions

- TypeScript strict mode is on ([tsconfig.json](tsconfig.json)); avoid `any` — anatomy/quiz data is heavily typed.
- `app/utils/layerPresets.ts` — visibility presets for 3D layer groups; `app/hooks/useViewerTabs.ts` — tab state for the viewer sidebar. Both are tightly coupled to the mesh group keys in `meshStore`.
- Slugs de carrera/materia en el frontend (`app/domain/academic.ts`) deben coincidir con los registros seedeados en la DB del backend.
