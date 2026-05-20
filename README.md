# ISMP Anatomy

Plataforma educativa interactiva de **anatomía 3D** construida con Next.js 16 y React 19. Pensada para estudiantes y docentes del ISMP, integra visualización tridimensional de sistemas anatómicos, visor de imágenes médicas y un módulo de cuestionarios con autoría docente.

> Interfaz y terminología en **español** (`cuestionarios`, `docente`, etc.). Conservar el idioma al editar copy.

---

## Tabla de contenidos

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Puesta en marcha](#puesta-en-marcha)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
  - [Routing (App Router)](#routing-app-router)
  - [Pipeline 3D](#pipeline-3d)
  - [Estado global (Zustand)](#estado-global-zustand)
  - [Tipos de dominio](#tipos-de-dominio)
  - [Estilos](#estilos)
- [Datos anatómicos](#datos-anatómicos)
- [Backend (planificado)](#backend-planificado)
- [Convenciones de código](#convenciones-de-código)
- [Documentación adicional](#documentación-adicional)

---

## Características

- 🦴 **Visores 3D por sistema**: esqueleto, músculos, órganos, sistema nervioso, cardiovascular, linfático, articulaciones, inserciones musculares y piel.
- 🔬 **Visor de imágenes médicas** con catálogo de estudios.
- 📝 **Cuestionarios**: rendición por parte del estudiante, autoría por parte del docente y visualización de resultados.
- 👥 **Gating por rol**: estudiante / `docente` / `admin`.
- 🧠 **Mapeo anatomía ↔ malla 3D** mediante metadatos jerárquicos en JSON y un matcher con normalización de nombres (acentos, casing).
- 💾 Persistencia client-side de borradores y attempts vía `localStorage` (hasta que se integre el backend real).

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Lenguaje | TypeScript 5.9 (strict mode) |
| 3D | [three.js](https://threejs.org/), [@react-three/fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei), [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) |
| Estado | [Zustand](https://github.com/pmndrs/zustand) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com/) (vía PostCSS, sin `tailwind.config`) |
| Markdown | `react-markdown` |
| Lint | ESLint 9 (`eslint-config-next`, flat config) |

> Backend definitivo: **Supabase** (Auth + Postgres + RLS). No hay servidor Node.js intermedio. Ver [docs/SUPABASE.md](docs/SUPABASE.md), [docs/STACK.md](docs/STACK.md) y [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Requisitos

- **Node.js** ≥ 20
- **npm** ≥ 10 (o pnpm / yarn equivalentes)

---

## Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm run dev
```

El servidor queda disponible en [http://localhost:3000](http://localhost:3000).

> Los modelos `.glb` ya están versionados en [public/models/](public/models/). No hace falta configurar variables de entorno mientras no exista backend.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `:3000`. |
| `npm run build` | Build de producción. |
| `npm run start` | Sirve el build de producción. |
| `npm run lint` | Linter ESLint sobre todo el proyecto. |

> No hay test runner configurado.

---

## Estructura del proyecto

```
ismp-3d-anatomy/
├── app/                          # App Router de Next.js
│   ├── admin/usuarios/           # Gestión de usuarios (admin)
│   ├── components/               # Componentes React
│   │   ├── auth/                 # Login / role guards
│   │   ├── cuestionarios/        # UI de cuestionarios (estudiante)
│   │   ├── imaging/              # Visor de imágenes médicas
│   │   ├── labels/               # Etiquetas 3D sobre meshes
│   │   ├── layers/               # Capas de sistemas anatómicos
│   │   ├── models/               # Componentes Three.js por modelo
│   │   ├── quiz/                 # Autoría de quizzes (docente)
│   │   ├── scene/                # Cámara, escena, controles
│   │   └── ui/                   # Componentes UI genéricos
│   ├── cuestionarios/            # Rutas de cuestionarios (alumno)
│   ├── data/                     # JSON: anatomía + estudios de imagen
│   ├── docente/cuestionarios/    # Autoría docente
│   ├── domain/                   # Tipos de dominio (academic.ts)
│   ├── imaging/                  # Rutas del visor de imágenes
│   ├── login/                    # Autenticación
│   ├── mis-cuestionarios/        # Historial del alumno
│   ├── muscles/                  # Visor 3D del sistema muscular
│   ├── skeleton/                 # Visor 3D del esqueleto
│   ├── store/                    # Stores Zustand
│   ├── utils/                    # Matcher, normalize, indexBuilder
│   ├── globals.css               # Tailwind v4
│   ├── layout.tsx                # Layout raíz (fuentes IBM Plex)
│   └── page.tsx                  # Home
├── docs/                         # Documentación del proyecto
│   ├── README.md                 # Índice de docs
│   ├── ARCHITECTURE.md           # Arquitectura general
│   ├── STACK.md                  # Stack tecnológico
│   ├── SUPABASE.md               # Backend (Supabase Auth + Postgres + RLS)
│   └── ROLES_ROADMAP.md          # Roles y roadmap
├── public/models/                # Modelos GLB
├── CLAUDE.md                     # Guía para asistentes de IA
├── README.md
└── package.json
```

---

## Arquitectura

### Routing (App Router)

Las rutas top-level se corresponden con cada área del producto:

| Ruta | Propósito |
|------|-----------|
| [app/skeleton/](app/skeleton/), [app/muscles/](app/muscles/) | Visores 3D por sistema. |
| [app/imaging/](app/imaging/), `imaging/[studyId]/` | Visor de imágenes médicas. |
| [app/cuestionarios/](app/cuestionarios/), `cuestionarios/[id]/`, `.../results/` | Cuestionarios del estudiante. |
| [app/docente/cuestionarios/](app/docente/cuestionarios/) | Autoría docente (`nuevo`, `[id]`). |
| [app/mis-cuestionarios/](app/mis-cuestionarios/) | Historial del alumno. |
| [app/admin/usuarios/](app/admin/usuarios/) | Administración de usuarios. |
| [app/login/](app/login/) | Inicio de sesión. |

El gating por rol (estudiante / `docente` / `admin`) se documenta en [docs/ROLES_ROADMAP.md](docs/ROLES_ROADMAP.md).

### Pipeline 3D

- **Assets GLB** en [public/models/](public/models/): `skeleton.glb`, `muscles.glb`, `organs.glb`, `nervous.glb`, `cardiovascular.glb`, `lymph.glb`, `joints.glb`, `muscular_insertions.glb`, `skin.glb`.
- **Render** con `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`.
- Componentes de escena/modelo bajo [app/components/scene/](app/components/scene/), [app/components/models/](app/components/models/), [app/components/layers/](app/components/layers/), [app/components/labels/](app/components/labels/).
- **Mapeo malla ↔ anatomía**:
  - [app/utils/matcher.ts](app/utils/matcher.ts) + [app/utils/indexBuilder.ts](app/utils/indexBuilder.ts) asocian nombres de mallas Three.js con entradas `AnatomyItem`.
  - [app/utils/normalize.ts](app/utils/normalize.ts) normaliza nombres (acentos, casing). ⚠️ **Modificar con cuidado**: todas las interacciones de hover/select dependen de él.

### Estado global (Zustand)

Todo el estado cross-cutting vive en stores Zustand bajo [app/store/](app/store/). **No** introducir Redux ni Context para estado compartido.

| Store | Responsabilidad |
|-------|-----------------|
| `anatomyStore` | `hovered`, `selected` (`AnatomyItem`), `selectedUuid`, `isolated`, visibilidad de etiquetas. |
| `cameraStore` | Posición / target de la cámara + `setFocus` (animación). |
| `meshStore` | Toggle de visibilidad por grupo de mallas. |
| `userStore`, `usersStore` | Estado de auth/usuario (client-only mientras se migra a Supabase). |
| `cuestionarioBankStore` | Autoría de cuestionarios (persistido en `localStorage`). |
| `cuestionarioHistoryStore` | Historial de intentos (persistido en `localStorage`). |
| `useHydrated` | Hook guard para SSR/CSR cuando se lee estado persistido. |

> Al consumir estado persistido en un componente, **siempre** gatear con `useHydrated` para evitar mismatches de hidratación.

### Tipos de dominio

- Tipos compartidos de quiz/académicos: [app/domain/academic.ts](app/domain/academic.ts).
- Forma del ítem anatómico 3D (`AnatomyItem`, `Section`): definida en [app/store/anatomyStore.ts](app/store/anatomyStore.ts) — importar desde ahí.

### Estilos

- **Tailwind CSS v4** vía plugin de PostCSS ([postcss.config.mjs](postcss.config.mjs)).
- No hay archivo `tailwind.config`; la configuración vive en [app/globals.css](app/globals.css).
- Tipografías **IBM Plex Sans / Serif / Mono** cargadas en [app/layout.tsx](app/layout.tsx) como variables CSS.

---

## Datos anatómicos

Los metadatos jerárquicos (estructura → nombres de mallas) son **JSON estáticos** en [app/data/](app/data/):

- `anatomy.final.builded.json` — árbol anatómico completo.
- `anatomy.skeleton.json` — esqueleto.
- `imaging-studies.json` — catálogo del visor de imágenes.

---

## Backend (Supabase)

Backend: **Supabase** (Auth + Postgres + Storage), con **Row Level Security** como única fuente de verdad de autorización. El frontend Next.js habla directo vía `@supabase/ssr` y `supabase-js`; no hay servicio Node.js intermedio.

Documentación:

- [docs/SUPABASE.md](docs/SUPABASE.md) — schema SQL, políticas RLS, custom access token hook, integración con App Router y plan de migración por fases.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — flujos de auth/quiz/upload sobre Supabase.

Mientras la migración no esté completa, auth, persistencia de cuestionarios y listados de usuarios operan sobre mocks client-side / `localStorage`. **Al cablear llamadas reales, leer SUPABASE.md primero**: usar `supabase-js` o RPC, nunca `service_role_key` en bundle cliente, nunca confiar en filtros del cliente para autorización (la RLS manda).

Variables de entorno esperadas en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # solo server, nunca exponer
```

---

## Convenciones de código

- **TypeScript strict mode** activado ([tsconfig.json](tsconfig.json)). Evitar `any`; los datos de anatomía y quizzes están fuertemente tipados.
- Estado cross-cutting **solo** en Zustand.
- Preservar el idioma **español** en strings de UI y terminología de dominio.
- Lint con `npm run lint` antes de cada commit.

---

## Documentación adicional

- [docs/](docs/) — índice de toda la documentación del proyecto.
  - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura completa (Next.js + Supabase).
  - [docs/STACK.md](docs/STACK.md) — stack tecnológico detallado.
  - [docs/SUPABASE.md](docs/SUPABASE.md) — backend definitivo: schema, RLS y plan de migración.
  - [docs/ROLES_ROADMAP.md](docs/ROLES_ROADMAP.md) — roles y roadmap.
- [CLAUDE.md](CLAUDE.md) — guía para asistentes de IA trabajando en el repo.
