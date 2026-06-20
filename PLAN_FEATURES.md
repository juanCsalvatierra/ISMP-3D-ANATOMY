# Plan de Implementación — ISMP 3D Anatomy

Plan de trabajo para llevar cada feature de la especificación ([features_ismp_3d_anatomy.md](features_ismp_3d_anatomy.md)) a producción, dividido por **Epic → Feature**, con tareas concretas de **Frontend** y **Backend** por separado.

> **🔄 Actualizado tras merge `542ab8e` (feature/question-bank).** El backend cambió de raíz. Ver "Cambios desde el último plan" abajo.

---

## 🔄 Cambios desde el último plan (post-merge question-bank)

El merge reemplazó el modelo de cuestionarios por un **banco de preguntas + sistema de intentos**. Impacto:

| Cambio en backend | Efecto en el plan |
|---|---|
| ❌ Eliminado modelo y módulo `Cuestionario` | El concepto "Cuestionario contenedor" del frontend ya no existe en el back. |
| ✅ Nuevo modelo `Question` independiente + `QuestionMateria` (N:M con campo `unidad: Int`) | "Unidad" ya **no** es un título; es un **entero** por materia (`0` = toda la materia). Resuelve la decisión que estaba pendiente. |
| ✅ Nuevo `QuestionsModule` con **CRUD completo** (`/questions`) | Backend de Epic 3 (alta/añadir/modificar/eliminar preguntas) **ya está**. |
| ✅ Nuevo `AttemptsModule`: `POST /attempts/start` con **selección aleatoria en servidor**, `/answer`, `/me`, analytics docente | Backend de Feature 2.1 (examen aleatorio) **ya está**. Era el mayor gap; ya no lo es. |
| 🆕 Flujo de auto-registro: `POST /users/register` (público) + `POST /users/activate` (admin), `estado PENDIENTE/ACTIVO`, `activationCode` | Feature nueva no contemplada en la spec original. Ver Epic 1. |
| 🆕 `GET /users/search` (busca estudiantes por nombre/email) | Apoya el panel admin/docente. |
| ⚠️ `User.dni` **sigue sin existir** | Gap vigente para F1.2/1.3. |
| ⚠️ `User.carreraId` **sigue 1:1** (nullable) | Gap vigente para multi-carrera (F1.3/1.4). |
| ⚠️ JWT payload sigue `{sub, email, role}` (sin `carreraId`) | El login devuelve `carreraId` en el body, pero no va en el token. |
| 🐞 `prisma/seed-cuestionarios.ts` quedó **roto** (referencia el modelo `Cuestionario` eliminado) | Tarea de limpieza. |

> **Premisa actualizada:** el **backend** ahora cubre casi todo el dominio de preguntas/intentos. El **frontend** sigue con mocks Zustand+localStorage y, además, su modelo de datos **ya no coincide** con el backend (contenedor vs banco). El trabajo real es: (a) cablear front↔back y (b) **rehacer los stores del front** para el nuevo modelo.

---

## 🔧 Fase 0 — Prerrequisitos transversales (bloquea casi todo)

### 0.1 Cliente HTTP centralizado (Frontend)
- [ ] Crear `app/lib/api.ts`: wrapper sobre `fetch` que lee `NEXT_PUBLIC_API_URL` (`http://localhost:3001`).
- [ ] Inyectar `Authorization: Bearer <token>` cuando hay sesión.
- [ ] Manejo central de errores (401 → logout/redirect a `/login`; parsear mensajes de Nest).
- [ ] Adapter de roles: backend usa `ADMIN|DOCENTE|ESTUDIANTE` (upper) ↔ front usa `admin|docente|estudiante` (lower).

### 0.2 `nestAuthProvider` (Frontend)
- [ ] Crear `app/providers/nestAuthProvider.ts` implementando `AuthProvider` (`app/types/authProvider.ts`).
- [ ] `login()` → `POST /auth/login`, guarda JWT + user del body.
- [ ] `getUser()` → `GET /auth/me`.
- [ ] Cambiar `userStore` para recibir `nestAuthProvider` en vez de `localAuthProvider`.
- [ ] Manejar el caso `estado: PENDIENTE` (login del backend rechaza usuarios no activados con un error específico → mostrar mensaje claro).

### 0.3 ⚠️ Reconciliación de modelo Front ↔ Back (cambió con el merge)
El frontend modela un **Cuestionario contenedor con preguntas anidadas y un `formato` por cuestionario**. El backend ahora es un **banco de `Question` independientes** (cada una con su `formato`) asociadas a `(materia, unidad)`, y las sesiones son **server-driven** vía `Attempt`. Decisiones/tareas:

| Tema | Frontend (mock actual) | Backend (post-merge) | Acción |
|---|---|---|---|
| Contenedor de preguntas | `Cuestionario { preguntas[] }` | No existe; banco plano filtrable por `materiaId`+`unidad` | **Rehacer `cuestionarioBankStore`** → pensar en términos de preguntas por `(materia, unidad)`. |
| "Unidad" | string libre / título | `unidad: Int` en `QuestionMateria` (`0`=toda la materia) | Front usa enteros; UI muestra "Unidad N" y opción "Todas". |
| `formato` | por cuestionario | por **pregunta** (`Question.formato`) | Mover la selección de formato a nivel pregunta. |
| Campos pregunta | `question/options/correct/explanation` | DTO usa `question/options/correct/explanation`; modelo guarda `texto/opciones/correct/explicacion` | Alineado a nivel DTO; OK. |
| Roles | lower | UPPER | Adapter en 0.1. |
| Carrera/Materia | slugs | `id` (cuid) + `slug` | Front debe resolver slug→id o el back exponer filtro por slug. **Falta endpoint para listar materias/carreras.** |
| Sesión de quiz | cliente recorre `preguntas[]` local | servidor: `start`→`answer`→siguiente | **Rehacer `/cuestionarios/[id]`** como sesión server-driven. |

### 0.4 Endpoints de catálogo faltantes (Backend) ⚠️
Para poblar selects del front no hay endpoints aún:
- [ ] `GET /materias` (y/o `?carreraId=`/`?slug=`) → listar materias.
- [ ] `GET /carreras` → listar carreras.
- [ ] `GET /materias/:id/unidades` (o `GET /questions/unidades?materiaId=`) → listar las unidades (enteros distintos) que existen para una materia. Necesario para el select "Unidad" de F2.1 y F3.x.

### 0.5 Limpieza 🐞
- [ ] Arreglar o eliminar `backend/prisma/seed-cuestionarios.ts` (referencia el modelo `Cuestionario` eliminado → rompe el seed).
- [ ] Revisar el seed principal para sembrar `Question` + `QuestionMateria` de ejemplo.

**Complejidad Fase 0:** 🟠 Media-Alta (subió: ahora incluye rehacer stores y endpoints de catálogo). **Front 65% / Back 35%.**

---

## Epic 1 — Gestión de Usuarios y Autenticación

### Feature 1.1 — Navbar global con menú por rol
**Estado:** Frontend implementado (`GlobalNav`, `UserMenu`).
- **Frontend:**
  - [ ] "Usuarios" visible solo si `role === admin`, sobre "Cerrar Sesión".
  - [ ] "Cerrar Sesión" → `logout()` real (Fase 0.2), limpiar token, redirect `/login`.
- **Backend:** Nada.
- **Complejidad:** 🟢 Baja. **Front 95% / Back 5%.**

### Feature 1.2 — Panel de Administración de Usuarios
**Estado:** UI completa en `/admin/usuarios` (mock). Backend `GET /users` (admin) + `GET /users/search` ya existen.
- **Frontend:**
  - [ ] Reemplazar `usersStore` (mock) por `GET /users`.
  - [ ] Búsqueda: hoy el backend busca por **nombre/email** (`/users/search`), no por DNI. ⚠️ (ver gap).
  - [ ] Botón "Crear Nuevo Usuario" → modal de F1.3.
- **Backend:**
  - [ ] `GET /users` (filtros `?role`, `?carreraId`) y `GET /users/search` ya existen.
  - [ ] ⚠️ **Gap DNI:** la spec pide búsqueda por `DNI`, pero no existe el campo. Decidir: **agregar `dni String @unique` a `User`** (migración + DTOs + filtro), o aceptar búsqueda por nombre/email.
- **Complejidad:** 🟡 Media. **Front 50% / Back 50%** (por DNI).

### Feature 1.3 — Formulario de Registro / Creación de Usuarios
**Estado:** Modal de creación existe. Backend `POST /users` (admin) existe.
- **Frontend:**
  - [ ] Form: `DNI`, `Nombre`, `Email`, `Rol`, `Carrera` (multi-select), `Contraseña`, `Confirmar`.
  - [ ] Validación cliente (confirm password, email, requeridos).
  - [ ] Submit → `POST /users`.
- **Backend:**
  - [ ] `POST /users` + `CreateUserDto` existen.
  - [ ] ⚠️ Agregar `dni` al modelo + DTO (obligatorio).
  - [ ] ⚠️ **Multi-carrera:** `carreraId` es 1:1; la spec pide múltiple (Radiología y/o Inst. Quirúrgica y/o Hemoterapia). Migrar a N:M `User↔Carrera`. Impacta migración, DTO, `/auth/me` y el body de login.
- **Complejidad:** 🟠 Media-Alta. **Front 45% / Back 55%** (DNI + multi-carrera = cambios de esquema).

### Feature 1.4 — Edición de Perfiles (modal/drawer)
**Estado:** Modal de edición existe. Backend `PATCH /users/:id` existe.
- **Frontend:**
  - [ ] Modal/drawer precargado, editable **solo**: `Rol`, `Contraseña`, `Carrera`.
  - [ ] Submit → `PATCH /users/:id`.
- **Backend:**
  - [ ] `PATCH /users/:id` + `UpdateUserDto` existen (hashea password si viene).
  - [ ] Depende de multi-carrera (F1.3).
- **Complejidad:** 🟢 Baja-Media. **Front 60% / Back 40%.**

### Feature 1.5 — 🆕 Auto-registro + Activación de estudiantes (no estaba en la spec)
**Estado:** Backend ya implementado; **falta toda la UI**.
- **Frontend:**
  - [ ] Página/registro público de estudiante → `POST /users/register` (devuelve `activationCode`; mostrarlo o instruir al alumno).
  - [ ] En `/admin/usuarios`: acción para **activar** usuarios `PENDIENTE` → `POST /users/activate` con el `activationCode` (o por id, según se decida).
  - [ ] Indicar `estado` (PENDIENTE/ACTIVO) en el listado de usuarios.
- **Backend:**
  - [ ] `POST /users/register` (público) y `POST /users/activate` (admin) ya existen.
  - [ ] (Opcional) endpoint de activación por `userId` en vez de por código, para UX de admin.
- **Complejidad:** 🟡 Media. **Front 80% / Back 20%.**

---

## Epic 2 — Cuestionarios (Vista Estudiante)

### Feature 2.1 — Generación Aleatoria de Exámenes de Práctica
**Estado:** ✅ **Backend ya hecho** (`POST /attempts/start` selecciona aleatoriamente y devuelve preguntas sin la respuesta correcta; `POST /attempts/:id/answer` avanza y calcula nota). Falta el cableado del front y los selects de materia/unidad.
- **Frontend:**
  - [ ] Form: `Materia` (select), `Unidad` (select dinámico + "Todas" = `unidad 0`), `Cantidad` (1–30).
  - [ ] "Iniciar Cuestionario" → `POST /attempts/start { materiaId, unidad, cantidad }`.
  - [ ] **Rehacer la sesión** `/cuestionarios/[id]` como flujo server-driven: render de la pregunta recibida → `POST /attempts/:id/answer { questionId, selected }` → feedback (`correcta`, `correcta_era`, `explicacion`) → siguiente, hasta `tipo: "finalizado"`.
  - [ ] Pantalla de resultados desde el `resultado: { nota, correctas, total }` que devuelve el backend (ya no calcular en cliente).
  - [ ] Eliminar la dependencia de `cuestionarioHistoryStore` (el historial ahora vive en `Attempt`).
- **Backend:**
  - [ ] `attempts/start`, `attempts/:id/answer` ya existen (aleatoriedad en servidor, validación de cantidad disponible).
  - [ ] ⚠️ Faltan endpoints de **catálogo** para poblar los selects (ver Fase 0.4: `/materias`, unidades por materia).
  - [ ] Validar que la materia pertenezca a la carrera del alumno (el JWT no trae `carreraId`; resolver con `/auth/me` o agregando `carreraId` al token).
- **Complejidad:** 🟡 Media (bajó de 🔴: el back pesado ya está). **Front 70% / Back 30%.**

---

## Epic 3 — Gestión de Preguntas (Docente / Admin)

> **Mapeo actualizado:** ya no se crea un "Cuestionario contenedor". Cada **pregunta** se asocia a `(materiaId, unidad)`. "Crear unidad" es implícito: al asignar una pregunta a `unidad: N` esa unidad pasa a existir. Backend vía CRUD `/questions`.

### Feature 3.1 — Alta de pregunta (con unidad)
**Estado:** Backend `POST /questions` ya existe. Frontend tiene `CuestionarioEditForm` (modelo viejo) → necesita adaptación.
- **Frontend:**
  - [ ] Form: `Materia` + `Unidad` (entero), `Pregunta` (`question`), `Respuestas` (`options`, dinámicas), `Respuesta Correcta` (`correct`), `formato`, `explanation?`.
  - [ ] Submit → `POST /questions { question, options, correct, explanation, formato, materias: [{materiaId, unidad}] }`.
  - [ ] Adaptar/reemplazar `cuestionarioBankStore` (Fase 0.3).
- **Backend:**
  - [ ] `POST /questions` + `CreateQuestionDto` (`@ArrayMinSize(2)` opciones, `materias @ArrayMinSize(1)`), guard DOCENTE/ADMIN, `autorId` del token. ✅
- **Complejidad:** 🟢 Baja-Media. **Front 70% / Back 30%.**

### Feature 3.2 — Añadir pregunta a unidad existente
**Estado:** ✅ Backend cubierto por el mismo `POST /questions` (es banco plano). Falta select dinámico de unidades.
- **Frontend:**
  - [ ] `Unidad` como select poblado desde catálogo (Fase 0.4) o input numérico.
  - [ ] Reutilizar el form de F3.1.
- **Backend:**
  - [ ] `POST /questions` ya sirve. Falta endpoint de unidades existentes (Fase 0.4).
- **Complejidad:** 🟢 Baja. **Front 60% / Back 40%.**

### Feature 3.3 — Panel de Mantenimiento (listar / modificar / eliminar preguntas)
**Estado:** ✅ Backend completo (`GET /questions?materiaId=&unidad=`, `PATCH /questions/:id`, `DELETE /questions/:id`, con check de autor/admin). Falta la UI jerárquica.
- **Frontend:**
  - [ ] Vista jerárquica: Materia → Unidad → lista de preguntas (`GET /questions?materiaId=&unidad=`).
  - [ ] Por pregunta: **"Modificar"** (modal/drawer precargado → `PATCH /questions/:id`) y **"Eliminar"** (confirmación → `DELETE /questions/:id`).
  - [ ] Modal: `Pregunta`, `Respuestas`, `Respuesta Correcta` (+ formato/explicación) → "Guardar cambios".
- **Backend:**
  - [ ] `GET/PATCH/DELETE /questions/:id` ya existen con autorización (solo autor o ADMIN). ✅
- **Complejidad:** 🟡 Media (bajó de 🔴: endpoints granulares ya existen). **Front 75% / Back 25%.**

### Feature 3.4 — 🆕 Analítica docente de intentos (habilitado por el merge)
**Estado:** Backend listo (`GET /attempts`, `/attempts/student`, `/attempts/:id`). El dashboard docente del front usa mock.
- **Frontend:**
  - [ ] Cablear el dashboard `/docente`: stats e historial de alumnos desde `GET /attempts?materiaId=` y `GET /attempts/student?studentId=&materiaId=&carreraId=`.
  - [ ] Detalle de un intento (`GET /attempts/:id`, incluye `answerLogs`).
- **Backend:** ya existe (con validación de acceso del docente a la materia/carrera). ✅
- **Complejidad:** 🟢 Baja-Media. **Front 80% / Back 20%.**

---

## 🎨 Consideraciones UI/UX (transversal)
- [ ] "Modificar" (usuarios y preguntas) → **modal o drawer lateral**, sin redirigir, preservando scroll/filtros. Reutilizar el patrón de modal de `/admin/usuarios`.

---

## 📊 Resumen de prioridades y complejidad (actualizado)

| # | Feature | Complejidad | Front | Back | Estado backend |
|---|---|---|---|---|---|
| 0 | Prerrequisitos (api client, nestAuthProvider, catálogos, stores) | 🟠 Media-Alta | 65% | 35% | parcial |
| 1.1 | Navbar por rol | 🟢 Baja | 95% | 5% | ✅ |
| 1.2 | Panel admin usuarios | 🟡 Media | 50% | 50% | ✅ (falta DNI) |
| 1.3 | Crear usuario | 🟠 Media-Alta | 45% | 55% | ✅ (falta DNI + multi-carrera) |
| 1.4 | Editar usuario | 🟢 Baja-Media | 60% | 40% | ✅ |
| 1.5 | 🆕 Registro + activación | 🟡 Media | 80% | 20% | ✅ |
| 2.1 | Examen aleatorio | 🟡 Media | 70% | 30% | ✅ (falta catálogos) |
| 3.1 | Alta de pregunta | 🟢 Baja-Media | 70% | 30% | ✅ |
| 3.2 | Añadir pregunta | 🟢 Baja | 60% | 40% | ✅ (falta unidades) |
| 3.3 | Panel mantenimiento | 🟡 Media | 75% | 25% | ✅ |
| 3.4 | 🆕 Analítica docente | 🟢 Baja-Media | 80% | 20% | ✅ |

### Orden de ejecución recomendado
1. **Fase 0** (api client + nestAuthProvider + rehacer stores + endpoints de catálogo + fix seed).
2. **1.1 → 1.5 → 1.2 → 1.3 → 1.4** (auth/usuarios; decidir DNI y multi-carrera temprano porque tocan esquema).
3. **3.1 → 3.2 → 3.3 → 3.4** (preguntas docente + analítica; el backend ya está, es sobre todo front).
4. **2.1** (examen aleatorio; depende de catálogos y de rehacer la sesión del front).

### Cambios de esquema Prisma aún pendientes
- `User.dni` (unique, obligatorio) — F1.2/1.3.
- `User` ↔ `Carrera` **N:M** (multi-carrera) — F1.3/1.4.
- (Opcional) Incluir `carreraId`/carreras en el **payload del JWT** para evitar un `/auth/me` extra en validaciones por carrera.

### Decisiones abiertas para el equipo
1. **DNI:** ¿se agrega como campo de `User` (la spec lo exige) o se reemplaza por búsqueda por nombre/email (ya existe `/users/search`)?
2. **Multi-carrera:** ¿migramos `User` a N:M con `Carrera`, o la spec se ajusta a 1 carrera por usuario?
3. **Registro (F1.5):** ¿el `activationCode` se entrega al alumno (autoservicio) o el admin lo activa desde el panel sin código?
