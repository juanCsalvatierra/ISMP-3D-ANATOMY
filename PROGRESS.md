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

### ⏳ Feature 2.1 — Generación Aleatoria de Exámenes de Práctica
**Estado:** No implementada en frontend. Backend completo (`POST /attempts/start`, `POST /attempts/:id/answer`).

**Pendiente (frontend):**
- Form de configuración: Materia (select), Unidad (select dinámico), Cantidad (1–30)
- Flujo server-driven de sesión: start → render pregunta → answer → feedback → siguiente → resultados
- Eliminar dependencia de `cuestionarioHistoryStore` (localStorage)

**Bloqueado por:** endpoints de catálogo `GET /materias` y unidades por materia (Fase 0.4, sin implementar en backend).

---

## Epic 3 — Gestión de Preguntas (Docente / Admin)

### ⏳ Feature 3.1 — Alta de pregunta
**Estado:** Backend completo (`POST /questions`). Frontend tiene forma vieja (modelo `Cuestionario` eliminado) → necesita rehacerse.

### ⏳ Feature 3.2 — Añadir pregunta a unidad existente
**Estado:** Backend cubierto por el mismo `POST /questions`. Falta select dinámico de unidades y UI adaptada.

### ⏳ Feature 3.3 — Panel de Mantenimiento (listar / modificar / eliminar)
**Estado:** Backend completo (`GET/PATCH/DELETE /questions`). Falta toda la UI jerárquica Materia → Unidad → Preguntas.

### ⏳ Feature 3.4 — Analítica docente *(extra-spec)*
**Estado:** Backend completo (`GET /attempts`, `/attempts/student`, `/attempts/:id`). Dashboard docente usa mocks.

---

## Fase 0 — Prerrequisitos transversales

| Tarea | Estado |
|---|---|
| `app/lib/api.ts` — cliente HTTP centralizado con token | ✅ |
| Adapter de roles UPPER ↔ lower | ✅ |
| `nestAuthProvider` — login/logout/getUser real | ✅ |
| Reconciliación stores front ↔ modelo backend (banco de preguntas) | ⏳ Pendiente |
| `GET /materias`, `GET /carreras`, unidades por materia (backend) | ⏳ Pendiente |
| Fix `seed-cuestionarios.ts` roto | ⏳ Pendiente |

---

## Cambios de esquema Prisma pendientes (backend)

| Campo | Feature | Estado |
|---|---|---|
| `User.dni` (unique) | F1.2 / F1.3 | ⏳ Pendiente |
| `User ↔ Carrera` N:M | F1.3 / F1.4 | ⏳ Pendiente |
| JWT payload con `carreraId` | F2.1 | ⏳ Pendiente |

---

## Resumen rápido

| Feature | Frontend | Backend |
|---|---|---|
| 1.1 Navbar | ✅ | ✅ |
| 1.2 Panel usuarios | ✅ | ✅ (falta DNI) |
| 1.3 Crear usuario | ✅ | ✅ (falta DNI schema) |
| 1.4 Editar usuario | ✅ | ✅ |
| 1.5 Registro + activación | ✅ | ✅ |
| 2.1 Examen aleatorio | ⏳ | ✅ (falta catálogos) |
| 3.1 Alta pregunta | ⏳ | ✅ |
| 3.2 Añadir pregunta | ⏳ | ✅ |
| 3.3 Panel mantenimiento | ⏳ | ✅ |
| 3.4 Analítica docente | ⏳ | ✅ |
