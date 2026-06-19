# ISMP Anatomy - Stack Tecnológico

## Visión General

Aplicación **Next.js** (frontend) + **NestJS** (backend REST en `backend/`). El frontend llama al backend vía HTTP con JWT. No hay BaaS intermedio.

---

## Frontend Stack

**Ubicación:** raíz del proyecto

### Lenguaje & Framework
- **Next.js** `16` — App Router, Server Components
- **React** `19`
- **TypeScript** `5.9` (strict mode)

### 3D & Visualización
- **Three.js** `0.183`
- **@react-three/fiber** `9`
- **@react-three/drei** `10`
- **@react-three/postprocessing** `3`

### Estilos & UI
- **Tailwind CSS** `4` (PostCSS plugin, sin `tailwind.config`)
- **tailwind-scrollbar**

### Gestión de Estado
- **Zustand** `5` — estado UI local (anatomía 3D, cámara, capas). Stores de datos (auth, users, quizzes) son mocks temporales hasta que se conecte el backend.

### Markdown
- **react-markdown**

### Herramientas de Desarrollo
- **ESLint** `9` (flat config, `eslint-config-next`)

---

## Backend Stack

**Ubicación:** `backend/` — servidor independiente en puerto 3001.

### Lenguaje & Framework
- **NestJS** — módulos, guards, decoradores
- **TypeScript** (strict mode)

### Base de Datos
- **Prisma** ORM + **PostgreSQL**
- Schema en `backend/prisma/schema.prisma`
- Migraciones en `backend/prisma/migrations/`

### Auth
- **JWT** (HS256) via `@nestjs/jwt` + `passport-jwt`
- **bcrypt** para hashing de passwords
- `JwtGuard` + `RolesGuard` para proteger endpoints

### Módulos implementados
| Módulo | Endpoints |
|--------|-----------|
| `AuthModule` | `POST /auth/login`, `GET /auth/me` |
| `UsersModule` | `GET/PATCH/DELETE /users`, `GET/PATCH/DELETE /users/:id` |
| `CuestionariosModule` | `GET/POST/PATCH/DELETE /cuestionarios`, `GET /cuestionarios/:id` |
| `PrismaModule` | Cliente Prisma compartido |

**Pendiente:** módulo de intentos (`POST /intentos`, `GET /intentos/me`).

---

## Comunicación Frontend ↔ Backend

- Llamadas REST vía `fetch` nativo (o wrapper en `lib/api/`).
- Auth: `Authorization: Bearer <token>` en cada request.
- El token se emite en `POST /auth/login` y contiene `{ sub, email, role, carreraId }`.

---

## Requisitos del Sistema

- Node.js 20+
- npm 10+
- PostgreSQL (local o Docker)
- Navegador moderno con soporte WebGL

---

## Variables de Entorno

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ISMP Anatomy
```

### Backend (`backend/.env`)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/ismp
JWT_SECRET=cambiar_en_produccion
PORT=3001
```

---

## Puertos

| Servicio | Puerto | Comando |
|----------|--------|---------|
| Frontend | 3000 | `npm run dev` (raíz) |
| Backend | 3001 | `npm run start:dev` (en `backend/`) |
| PostgreSQL | 5432 | Local o Docker |

---

## Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Three.js Docs](https://threejs.org/docs)
