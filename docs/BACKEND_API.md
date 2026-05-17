# Recomendaciones — Backend NestJS (ISMP 3D Anatomy)

Este documento describe **cómo debería trabajar el backend** que reemplazará los mocks Zustand+localStorage de la app. La UI ya está implementada contra contratos estables; al levantar la API solo hay que reemplazar el cuerpo de cada acción de store por una llamada `fetch`.

Stack sugerido: **NestJS + Prisma + PostgreSQL + JWT**, desplegado en `NEXT_PUBLIC_API_URL` (hoy `http://localhost:3001`).

---

## 1. Modelo de datos (Prisma)

```prisma
enum Role {
  ADMIN
  DOCENTE
  ESTUDIANTE
}

enum Formato {
  MULTIPLE
  TRUEFALSE
  IDENTIFICATION
  LABELING
}

model Carrera {
  id        String     @id @default(cuid())
  slug      String     @unique  // "instrumentacion" | "radiologia"
  label     String
  materias  Materia[]  @relation("CarreraMaterias")
  usuarios  User[]
}

model Materia {
  id             String          @id @default(cuid())
  slug           String          @unique  // "anatomia-1" .. "anatomia-4"
  label          String
  carreras       Carrera[]       @relation("CarreraMaterias")
  cuestionarios  Cuestionario[]
}

model User {
  id            String     @id @default(cuid())
  name          String
  email         String     @unique
  passwordHash  String
  role          Role
  carreraId     String?
  carrera       Carrera?   @relation(fields: [carreraId], references: [id])
  cuestionarios Cuestionario[] @relation("Autor")
  attempts      Attempt[]
  createdAt     DateTime   @default(now())
}

model Cuestionario {
  id          String     @id @default(cuid())
  titulo      String
  descripcion String     @default("")
  materiaId   String
  materia     Materia    @relation(fields: [materiaId], references: [id])
  formato     Formato
  autorId     String
  autor       User       @relation("Autor", fields: [autorId], references: [id])
  preguntas   Question[]
  attempts    Attempt[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Question {
  id              String       @id @default(cuid())
  cuestionarioId  String
  cuestionario    Cuestionario @relation(fields: [cuestionarioId], references: [id], onDelete: Cascade)
  orden           Int
  texto           String
  opciones        String[]     // jsonb, length 2 (truefalse) o 4 (multiple)
  correct         Int
  explicacion     String       @default("")
}

model Attempt {
  id              String       @id @default(cuid())
  userId          String?
  user            User?        @relation(fields: [userId], references: [id], onDelete: SetNull)
  cuestionarioId  String
  cuestionario    Cuestionario @relation(fields: [cuestionarioId], references: [id], onDelete: Cascade)
  materiaSlug     String       // se cachea aquí para no joinear materia en cada query
  formato         Formato
  score           Int
  total           Int
  completedAt     DateTime     @default(now())
  answers         AnswerLog[]
}

model AnswerLog {
  id         String  @id @default(cuid())
  attemptId  String
  attempt    Attempt @relation(fields: [attemptId], references: [id], onDelete: Cascade)
  questionId String
  selected   Int
  correct    Boolean
}
```

**Seed inicial** (debe coincidir con los seeds de los stores para test de paridad):

- 2 carreras: `instrumentacion`, `radiologia`.
- 4 materias: `anatomia-1..4`. Anatomía I y II vinculadas a ambas carreras; III y IV solo a Radiología.
- 7 usuarios (1 admin, 2 docentes, 4 estudiantes — 2 por carrera).
- 3 cuestionarios (uno por materia visible) autoría del primer docente.

---

## 2. Endpoints REST

Envelope estándar: `{ data: T }` o `{ error: { code, message } }`. Códigos HTTP estándares.

### Auth
| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST   | `/auth/login` | `{ email, password }` | `{ user, token }` |
| POST   | `/auth/logout` | — | `{ ok: true }` (invalida cookie) |
| GET    | `/auth/me`     | — (cookie/Bearer)     | `{ user }` |

`token` es JWT firmado (HS256 en dev, RS256 en prod). Payload mínimo:
```json
{ "sub": "<userId>", "role": "ESTUDIANTE", "carreraId": "...", "exp": 1234567 }
```
Recomendado: cookie httpOnly `Secure SameSite=Lax` para evitar XSS; en la UI se elimina el `localStorage` del `userStore`.

### Carreras / Materias (lectura pública para alumnos logueados)
| Método | Ruta | Notas |
|--------|------|-------|
| GET    | `/carreras` | Lista completa |
| GET    | `/materias?carreraId=...` | Filtra por carrera |

### Cuestionarios
| Método | Ruta | Rol | Notas |
|--------|------|-----|-------|
| GET    | `/cuestionarios?materiaId=...&autorId=...` | Cualquier autenticado | Estudiante: solo materias de su carrera |
| GET    | `/cuestionarios/:id` | Cualquier autenticado | 404 si no aplica a su carrera |
| POST   | `/cuestionarios` | DOCENTE/ADMIN | `autorId` se toma del JWT |
| PATCH  | `/cuestionarios/:id` | DOCENTE (solo autor) / ADMIN | |
| DELETE | `/cuestionarios/:id` | DOCENTE (solo autor) / ADMIN | Soft-delete recomendado |

### Intentos
| Método | Ruta | Rol | Notas |
|--------|------|-----|-------|
| POST   | `/cuestionarios/:id/attempts` | ESTUDIANTE | Body: `{ answers: [{ questionId, selected }] }`. El backend calcula `score`/`total` y devuelve `Attempt` |
| GET    | `/attempts?userId=...&materiaId=...&cuestionarioId=...` | Estudiante ve los suyos · Docente ve los de sus cuestionarios · Admin ve todo |

### Usuarios (admin)
| Método | Ruta | Rol |
|--------|------|-----|
| GET    | `/users?role=...&carreraId=...` | ADMIN |
| POST   | `/users` | ADMIN |
| PATCH  | `/users/:id` | ADMIN |
| DELETE | `/users/:id` | ADMIN |

Para el primer admin se crea vía CLI seed; nunca se expone endpoint de auto-registro.

---

## 3. Autorización (NestJS)

- `JwtAuthGuard` global con bypass en `/auth/login` y `/auth/me`.
- `RolesGuard` + decorador `@Roles(Role.ADMIN, Role.DOCENTE)` por ruta.
- Guard custom `OwnershipGuard` para endpoints `PATCH/DELETE /cuestionarios/:id` que verifica `cuestionario.autorId === request.user.sub` o rol `ADMIN`.
- Para `GET /cuestionarios/:id` y `POST .../attempts`: cuando el rol es `ESTUDIANTE`, validar que `cuestionario.materia` pertenezca a `user.carrera`.

---

## 4. Mapeo store → endpoint

| Frontend (mock actual) | Backend (futuro) |
|------------------------|------------------|
| `userStore.login(email, pwd, role, carreraId)` | `POST /auth/login` (server determina role/carreraId, ignora los del cliente) |
| `userStore.logout()` | `POST /auth/logout` |
| `useCuestionarioBankStore.cuestionarios` | `GET /cuestionarios?materiaId=...` (cargar bajo demanda, no todo el bank) |
| `useCuestionarioBankStore.create(input)` | `POST /cuestionarios` |
| `useCuestionarioBankStore.update(id, patch)` | `PATCH /cuestionarios/:id` |
| `useCuestionarioBankStore.remove(id)` | `DELETE /cuestionarios/:id` |
| `useCuestionarioHistoryStore.addAttempt(payload)` | `POST /cuestionarios/:id/attempts` |
| `useCuestionarioHistoryStore.attempts` | `GET /attempts?userId=me` (estudiante) o `?cuestionarioId=...` (docente) |
| `useUsersStore.*` | `GET/POST/PATCH/DELETE /users` |

Sugerencia: reemplazar Zustand por **TanStack Query** para el estado servidor (cache, invalidaciones, loading states). Mantener Zustand solo para UI local (`anatomyStore`, `cameraStore`, `meshStore`).

---

## 5. Migración paso a paso

1. **Auth real**: implementar `/auth/login` y `/auth/me`. Reemplazar `userStore.login` por un fetch. Conservar el shape del `User` para no romper componentes.
2. **Usuarios**: levantar CRUD `/users`. Migrar `useUsersStore` a TanStack Query con `/users` como key.
3. **Cuestionarios (lectura)**: `GET /cuestionarios`. Reemplazar `useCuestionarioBankStore.cuestionarios` por queries por materia.
4. **Cuestionarios (escritura)**: `POST/PATCH/DELETE`. Migrar `CuestionarioForm.onSubmit`.
5. **Intentos**: `POST /cuestionarios/:id/attempts` y `GET /attempts`. Reemplazar el efecto que guarda el intento al finalizar la sesión.
6. **Middleware Next.js**: agregar `middleware.ts` que valide cookie JWT y proteja `/admin/**`, `/docente/**`, `/mis-cuestionarios` server-side. El `RoleGate` cliente queda como UX (loader/redirect rápido) pero el guard real es el middleware.
7. **Borrar mocks**: eliminar `useCuestionarioBankStore`, `useUsersStore`, seed locales. Mantener solo `userStore` mínimo (cache de `user` actual) o reemplazar por `useQuery('/auth/me')`.

Usar feature flag por env (`NEXT_PUBLIC_USE_BACKEND=1`) para alternar mock/real durante la transición.

---

## 6. Variables de entorno

```
# Frontend (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_USE_BACKEND=0   # 0 = mocks, 1 = backend

# Backend (NestJS)
DATABASE_URL=postgresql://user:pass@localhost:5432/ismp
JWT_SECRET=<min 32 chars>
JWT_EXPIRES_IN=12h
CORS_ORIGIN=http://localhost:3000
```

---

## 7. Convenciones

- IDs en frontend: `string` (cuid/uuid). Nunca asumir numérico.
- Fechas: ISO-8601 UTC en la API. Formatear en el cliente con `toLocaleString("es-AR")`.
- Slugs de carrera/materia coincidentes con `app/domain/academic.ts` (`instrumentacion`, `radiologia`, `anatomia-1..4`).
- Errores de validación: `400 { error: { code: "VALIDATION", details: [...] } }`.
- Paginación de listados grandes (intentos): cursor-based `?cursor=...&limit=20`.

---

## 8. Tests de paridad

Antes de cortar los mocks, verificar que para un mismo seed:

| Acción | Mock devuelve | API debe devolver |
|--------|---------------|-------------------|
| Login docente seed | User con `id="seed-docente-1"`, role=`docente` | Idem (el seed comparte ids) |
| `GET /cuestionarios?materiaId=anatomia-1` | 1 cuestionario | 1 cuestionario con misma estructura |
| Estudiante `instrumentacion` ve materias | `["anatomia-1","anatomia-2"]` | Idem |
| Estudiante `radiologia` ve materias | `["anatomia-1".."anatomia-4"]` | Idem |
| `POST attempts` y luego `GET /attempts?userId=me` | El intento creado | El intento creado |

Mantener los **mismos IDs/slugs** de seed permite hacer este test sin migración de datos.
