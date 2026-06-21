# Estado de implementación — ISMP 3D Anatomy

Última actualización: 2026-06-21

---

## Epic 1 — Gestión de Usuarios y Autenticación

### ✅ Feature 1.1 — Navbar global con menú por rol
**Commit:** `bc3a237`

- Navbar con links de navegación globales
- Menú de usuario (esquina superior derecha) con avatar y rol
- Link "Usuarios" visible únicamente para `admin`
- "Cerrar Sesión" para todos los roles
- Drawer lateral en mobile con links por rol
- `/login` y `/register` redirigen si ya hay sesión activa

**Gap pendiente:** ninguno.

---

### ✅ Feature 1.2 — Panel de Administración de Usuarios
**Commit:** `2f50f1c`

- Tabla de usuarios cableada a `GET /users` (backend real)
- Filtro por rol (Todos / Estudiante / Docente / Admin)
- Filtro "Pendientes" con contador badge *(añadido en 1.5)*
- Búsqueda por nombre/email con debounce → `GET /users/search`
- Columna Estado (PENDIENTE / ACTIVO) con badge de color *(añadido en 1.5)*
- Botón "Crear nuevo usuario" → abre modal de F1.3
- Botones "Editar" y "Eliminar" por fila
- Botón "Activar" para usuarios PENDIENTE → abre modal de F1.5

**Gap pendiente:** búsqueda por `DNI` (la spec lo pide; el backend no tiene el campo aún).

---

### ✅ Feature 1.3 — Formulario de Creación de Usuarios
**Commit:** `4d5d02d`

- Modal de creación con campos: Nombre, DNI, Email, Contraseña, Confirmar contraseña, Rol, Carrera(s)
- Validación cliente (campos obligatorios, contraseñas, mínimo 6 chars)
- Submit → `POST /users` (solo admin)
- Selección múltiple de carreras con checkboxes

**Gap pendiente:** el backend aún no tiene `dni` como campo de `User` (migración Prisma pendiente); el form lo envía pero el backend lo ignora.

---

### ✅ Feature 1.4 — Edición de Perfiles de Usuario
**Commit:** `f0fe1c1`

- Modal de edición precargado con datos del usuario seleccionado
- Solo permite modificar: Rol, Contraseña (opcional), Carrera(s)
- Nombre, Email y DNI se muestran como información de solo lectura
- Submit → `PATCH /users/:id`

**Gap pendiente:** depende de multi-carrera en el backend (actualmente funciona; si se migra a N:M habrá que revisar el DTO).

---

### ✅ Feature 1.5 — Auto-registro + Activación de estudiantes *(extra-spec)*
**Commit:** `c1ab0cd`

- Página pública `/register` con formulario (Nombre, Email, Contraseña, Carrera opcional)
- Redirección automática si el usuario ya tiene sesión activa
- Al registrarse → `POST /users/register` → pantalla de éxito con código de activación (8 chars, botón "Copiar")
- Link "Registrarse como estudiante" en `/login`
- Panel admin: modal "Activar cuenta" para usuarios PENDIENTE → `POST /users/activate` con el código
- Tras activación la lista se refresca y el badge cambia a "Activo"

**Gap pendiente:** ninguno.

---

## Epic 2 — Módulo de Cuestionarios (Vista Estudiante)

### ✅ Feature 2.1 — Generación Aleatoria de Exámenes de Práctica
**Commit:** `bdb3760`

- `/cuestionarios/generar`: form con selector de Materia (`GET /materias`), Unidad dinámica (`GET /materias/:id/unidades`, incluye "Todas") y Cantidad (1–30)
- Submit → `POST /attempts/start` → redirige a la sesión con la primera pregunta
- `/cuestionarios/intentos/[attemptId]`: sesión server-driven completa
  - Estado inicial desde `sessionStorage` (sin useEffect para evitar cascading renders)
  - Máquina de estados: question → feedback → question … → finished
  - Cada respuesta llama `POST /attempts/:id/answer { questionId, selected }`
  - Maneja `tipo: 'continua'` (muestra feedback + avanza) y `tipo: 'finalizado'` (nota, correctas/total, feedback de última pregunta)
- `/cuestionarios` simplificado: solo muestra card "Generar examen" para estudiantes; docentes/admins ven "Agregar pregunta al banco"
- Eliminada toda dependencia de `cuestionarioBankStore` y `cuestionarioHistoryStore` en el flujo de exámenes

**Gap pendiente:** ninguno.

---

## Epic 3 — Gestión de Preguntas (Docente / Admin)

### ✅ Feature 3.1 — Alta de pregunta
**Commit:** `bdb3760`

- `/docente/cuestionarios/nuevo` reescrito para `POST /questions`
- Campos: Materia (select desde `GET /materias`), Unidad (select dinámico: unidades existentes + "Nueva unidad…"), Formato (Múltiple / V-F), Pregunta, Opciones con marcador de correcta, Explicación opcional
- Tras guardar, el form se limpia y el select de unidades se refresca automáticamente
- El botón "Guardar pregunta" muestra contador de preguntas guardadas en la sesión

**Gap pendiente:** ninguno.

---

### ✅ Feature 3.2 — Añadir pregunta a unidad existente
**Commit:** `bdb3760`

- Cubierto por el mismo formulario de F3.1: el select de Unidad muestra las unidades ya existentes para la materia elegida
- Al seleccionar "Nueva unidad…" aparece un input numérico para crear una nueva

**Gap pendiente:** ninguno.

---

### ✅ Feature 3.3 — Panel de Mantenimiento (listar / modificar / eliminar)
**Commit:** `bdb3760`

- Panel docente (`/docente`) reescrito: lista "Mis preguntas" desde `GET /questions`, filtradas por `autor.id`
- Cada pregunta muestra: texto (truncado), materia, unidad, formato
- Botón "Editar" → `/docente/cuestionarios/[id]/editar` (reescrito para `GET + PATCH /questions/:id`)
  - Formulario precargado con todos los campos incluyendo selector de unidad
  - Permite cambiar materia, unidad, formato, pregunta, opciones y explicación
- Botón "Eliminar" → `DELETE /questions/:id` con confirmación, sin recargar página

**Gap pendiente:** ninguno.

---

### ✅ Feature 3.4 — Analítica docente *(extra-spec)*
**Commit:** `bdb3760`

- Panel docente (`/docente`) muestra resultados desde `GET /attempts` (backend real)
- Tabla: Alumno, Materia, Unidad, Nota (%), Fecha
- Stats: mis preguntas, intentos totales, promedio global
- Eliminada toda dependencia de `cuestionarioHistoryStore` y `usersStore` (localStorage)

**Gap pendiente:** ninguno.

---

## Fase 0 — Prerrequisitos transversales

| Tarea | Estado |
|---|---|
| `app/lib/api.ts` — cliente HTTP centralizado con token | ✅ |
| Adapter de roles UPPER ↔ lower | ✅ |
| `nestAuthProvider` — login/logout/getUser real | ✅ |
| `GET /materias`, `GET /carreras`, unidades por materia (backend) | ✅ (`CatalogModule`) |
| Reconciliación stores front ↔ modelo backend (banco de preguntas) | ✅ |
| Fix `seed-cuestionarios.ts` roto | ✅ Reescrito para modelo `Question` |

---

## Cambios de esquema Prisma

| Campo | Feature | Estado |
|---|---|---|
| `User.dni` (unique, nullable) | F1.2 / F1.3 | ✅ Ya en schema y migraciones |
| `User ↔ Carrera` N:M (`UserCarrera`) | F1.3 / F1.4 | ✅ Ya en schema y migraciones |
| JWT payload con `carreraId` | F2.1 | ⏳ Pendiente (workaround: `/auth/me`) |

---

## Resumen rápido

| Feature | Frontend | Backend |
|---|---|---|
| 1.1 Navbar | ✅ | ✅ |
| 1.2 Panel usuarios | ✅ | ✅ (falta DNI) |
| 1.3 Crear usuario | ✅ | ✅ (falta DNI schema) |
| 1.4 Editar usuario | ✅ | ✅ |
| 1.5 Registro + activación | ✅ | ✅ |
| 2.1 Examen aleatorio | ✅ | ✅ |
| 3.1 Alta pregunta | ✅ | ✅ |
| 3.2 Añadir pregunta | ✅ | ✅ |
| 3.3 Panel mantenimiento | ✅ | ✅ |
| 3.4 Analítica docente | ✅ | ✅ |
