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
- [Datos anatómicos](#datos-anatómicos)
- [Backend](#backend)
- [Convenciones de código](#convenciones-de-código)
- [Documentación adicional](#documentación-adicional)

---

## Características

- 🦴 **Visores 3D por sistema**: esqueleto, músculos, órganos, sistema nervioso, cardiovascular, linfático, articulaciones, inserciones musculares y piel.
- 🔬 **Visor de imágenes médicas** con catálogo de estudios.
- 📝 **Cuestionarios**: rendición por parte del estudiante, autoría por parte del docente y visualización de resultados.
- 👥 **Gating por rol**: estudiante / `docente` / `admin`.
- 🧠 **Mapeo anatomía ↔ malla 3D** mediante metadatos jerárquicos en JSON y un matcher con normalización de nombres.
- 💾 Persistencia client-side de borradores y attempts vía `localStorage` (hasta que se conecte el backend).

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | [Next.js 16](https://nextjs.org/) (App Router) + React 19 |
| Lenguaje | TypeScript 5.9 (strict mode) |
| 3D | three.js + @react-three/fiber + @react-three/drei |
| Estado UI | [Zustand](https://github.com/pmndrs/zustand) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com/) (PostCSS, sin `tailwind.config`) |
| Backend | [NestJS](https://nestjs.com/) + [Prisma](https://www.prisma.io/) + PostgreSQL |
| Auth | JWT (HS256) + bcrypt |

---

## Requisitos

- **Node.js** ≥ 20
- **npm** ≥ 10
- **PostgreSQL** (local o Docker) — solo para el backend

---

## Puesta en marcha

### Frontend (standalone, sin backend)
```bash
npm install
npm run dev
```
El frontend queda disponible en [http://localhost:3000](http://localhost:3000) usando mocks de Zustand+localStorage.

### Con backend
```bash
# Terminal 1 — Backend
cd backend
npm install
# Crear backend/.env con DATABASE_URL y JWT_SECRET
npx prisma migrate dev
npx prisma db seed
npm run start:dev

# Terminal 2 — Frontend
# Crear .env.local con NEXT_PUBLIC_API_URL=http://localhost:3001
npm run dev
```

---

## Scripts disponibles

### Frontend (raíz)
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo en `:3000` |
| `npm run build` | Build de producción |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | Linter ESLint |

### Backend (`cd backend`)
| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Servidor de desarrollo en `:3001` |
| `npm run build` | Compilar TypeScript |
| `npx prisma migrate dev` | Aplicar migraciones |
| `npx prisma db seed` | Sembrar datos iniciales |

> No hay test runner configurado en el frontend.

---

## Estructura del proyecto

```
ismp-3d-anatomy/
├── app/                          # App Router de Next.js
│   ├── admin/usuarios/           # Gestión de usuarios (admin)
│   ├── components/               # Componentes React
│   │   ├── auth/                 # RoleGate (guard cliente)
│   │   ├── scene/                # Escena Three.js
│   │   ├── models/               # GLB loaders por sistema
│   │   ├── layers/               # Capas de sistemas anatómicos
│   │   ├── labels/               # Etiquetas 3D
│   │   └── ui/                   # Componentes UI genéricos
│   ├── cuestionarios/            # Rutas de cuestionarios (alumno)
│   ├── data/                     # JSON: anatomía + estudios de imagen
│   ├── docente/cuestionarios/    # Autoría docente
│   ├── domain/                   # Tipos de dominio (academic.ts)
│   ├── imaging/                  # Visor de imágenes médicas
│   ├── login/                    # Autenticación
│   ├── mis-cuestionarios/        # Historial del alumno
│   ├── muscles/, skeleton/       # Visores 3D
│   ├── providers/                # AuthProvider implementations
│   ├── store/                    # Stores Zustand
│   ├── types/                    # Interfaces (AuthProvider, etc.)
│   └── utils/                    # matcher, normalize, indexBuilder
├── backend/                      # NestJS + Prisma + PostgreSQL
│   ├── prisma/schema.prisma      # Modelos y enums
│   ├── src/
│   │   ├── auth/                 # JWT auth, guards, decoradores
│   │   ├── users/                # CRUD usuarios (admin)
│   │   ├── cuestionarios/        # CRUD cuestionarios
│   │   └── prisma/               # PrismaService compartido
│   └── package.json
├── docs/                         # Documentación
│   ├── ARCHITECTURE.md
│   ├── BACKEND.md
│   ├── STACK.md
│   └── ROLES_ROADMAP.md
├── public/models/                # Modelos GLB
├── CLAUDE.md                     # Guía para asistentes de IA
└── package.json
```

---

## Arquitectura

### Routing (App Router)

| Ruta | Propósito |
|------|-----------|
| `app/modelos/`, `modelos/[system]/` | Galería y visor 3D por sistema (registro en `app/config/systems.ts`) |
| `app/imaging/`, `imaging/[studyId]/` | Visor de imágenes médicas |
| `app/cuestionarios/`, `cuestionarios/[id]/` | Cuestionarios del estudiante |
| `app/docente/cuestionarios/` | Autoría docente |
| `app/mis-cuestionarios/` | Historial del alumno |
| `app/admin/usuarios/` | Administración de usuarios |
| `app/login/` | Inicio de sesión |

### Pipeline 3D

- **Assets GLB** en `public/models/`: `skeleton.glb`, `muscles.glb`, `organs.glb`, `nervous.glb`, y otros.
- **Mapeo malla ↔ anatomía**: `app/utils/matcher.ts` + `indexBuilder.ts`. `normalize.ts` normaliza nombres (acentos, casing) — modificar con cuidado.

### Estado global (Zustand)

| Store | Responsabilidad |
|-------|-----------------|
| `anatomyStore` | `hovered`, `selected`, `isolated`, etiquetas |
| `cameraStore` | Posición / target de cámara + `setFocus` |
| `meshStore` | Toggle visibilidad por grupo de mallas |
| `userStore` | Sesión actual (mock → `nestAuthProvider`) |
| `usersStore` | Lista de usuarios admin (mock → `GET /users`) |
| `cuestionarioBankStore` | Autoría de cuestionarios (mock → API) |
| `cuestionarioHistoryStore` | Historial de intentos (mock → API) |

Al consumir estado persistido en un componente, gatear con `useHydrated` para evitar mismatches de hidratación SSR.

---

## Datos anatómicos

Metadatos jerárquicos (estructura → nombres de mallas) en JSON estáticos en `app/data/`:
- `anatomy.final.builded.json` — árbol anatómico completo.
- `anatomy.skeleton.json` — esqueleto.
- `imaging-studies.json` — catálogo del visor de imágenes.

---

## Backend

Backend REST en `backend/` (NestJS + Prisma + PostgreSQL, puerto 3001). Ver [docs/BACKEND.md](docs/BACKEND.md) para endpoints, schema y plan de integración.

Hoy el frontend **no está conectado** al backend — usa mocks Zustand+localStorage. La integración se hace por fases: auth → users → cuestionarios → intentos. Ver [docs/ROLES_ROADMAP.md](docs/ROLES_ROADMAP.md).

---

## Convenciones de código

- **TypeScript strict mode** activado. Evitar `any`.
- Estado cross-cutting **solo** en Zustand.
- Preservar el idioma **español** en strings de UI y terminología de dominio.
- `npm run lint` antes de cada commit.

---

## Documentación adicional

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitectura completa (Next.js + NestJS).
- [docs/BACKEND.md](docs/BACKEND.md) — backend: schema, endpoints, plan de integración.
- [docs/STACK.md](docs/STACK.md) — stack tecnológico detallado.
- [docs/ROLES_ROADMAP.md](docs/ROLES_ROADMAP.md) — roles y estado actual.
- [CREDITS.md](CREDITS.md) — créditos y licencias del contenido de terceros (modelos 3D, textos, imágenes).
- [CLAUDE.md](CLAUDE.md) — guía para asistentes de IA.
