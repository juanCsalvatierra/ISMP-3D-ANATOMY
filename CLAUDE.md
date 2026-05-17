# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

ISMP Anatomy — Next.js 16 + React 19 educational platform for interactive 3D anatomy. The repo currently contains only the frontend; `backend/` is an empty placeholder intended to be filled by a separate team (NestJS + PostgreSQL + Prisma per [docs/STACK.md](docs/STACK.md) / [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)). The frontend runs standalone with local JSON data and Zustand state — there is no live backend to call yet.

User-facing strings and most domain terminology are in **Spanish** (e.g. `cuestionarios`, `docente`). Preserve language when editing UI copy.

## Commands

```bash
npm run dev        # Next dev server on :3000
npm run build      # Production build
npm run start      # Run prod build
npm run lint       # ESLint (flat config, eslint-config-next)
```

No test runner is configured.

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

## Backend integration (not yet implemented)

[docs/BACKEND_API.md](docs/BACKEND_API.md) and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) describe the planned REST contract (JWT auth, `NEXT_PUBLIC_API_URL` → `http://localhost:3001`). Until the backend exists, features (auth, quiz persistence, user lists) run on client-side mocks / localStorage. When wiring real API calls, read these docs first and don't invent endpoints.

## Conventions

- TypeScript strict mode is on ([tsconfig.json](tsconfig.json)); avoid `any` — anatomy/quiz data is heavily typed.
- The empty top-level [backend/](backend/) directory is intentional (reserved for the NestJS team) — do not delete it or move frontend code into it.
