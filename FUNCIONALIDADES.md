# Funcionalidades implementadas — ISMP 3D Anatomy

Resumen de todo lo que está funcionando en la plataforma, explicado de forma sencilla.

---

## Acceso y usuarios

### Inicio de sesión
Los usuarios ingresan con su email y contraseña. El sistema reconoce automáticamente su rol (estudiante, docente o administrador) y les muestra únicamente las opciones que les corresponden. Si alguien intenta acceder a una sección que no le pertenece, la plataforma lo redirige o le muestra un mensaje de acceso restringido.

### Registro de estudiantes
Los estudiantes pueden registrarse solos desde la página de inicio de sesión, sin necesidad de que el administrador cree la cuenta manualmente. Al completar el registro, el sistema genera un código de activación que el estudiante le entrega al administrador. Hasta que el administrador active la cuenta, el estudiante no puede ingresar.

### Panel de administración de usuarios
El administrador tiene una sección dedicada donde puede ver todos los usuarios registrados en la plataforma. Desde ahí puede:
- Filtrar por rol (estudiantes, docentes, administradores) o ver solo las cuentas pendientes de activación.
- Buscar un usuario por nombre o email.
- Crear nuevos usuarios indicando su nombre, email, contraseña, rol y carrera.
- Editar el rol, la contraseña o la carrera de cualquier usuario existente.
- Activar cuentas de estudiantes que se registraron solos.
- Eliminar usuarios.

### Menú de navegación por rol
La barra superior se adapta a cada tipo de usuario. Los estudiantes ven sus opciones de práctica; los docentes ven el acceso a su panel y al banco de preguntas; los administradores ven además la gestión de usuarios. Todos tienen la opción de cerrar sesión.

---

## Exámenes de práctica (Estudiantes)

### Generación de exámenes aleatorios
Los estudiantes pueden crear un examen de práctica en cualquier momento eligiendo:
- La **materia** que quieren repasar.
- La **unidad** específica (o toda la materia a la vez).
- La **cantidad de preguntas** que quieren responder (entre 1 y 30).

El sistema selecciona las preguntas al azar desde el banco y arma el examen automáticamente.

### Sesión de examen interactiva
Durante el examen, el estudiante ve una pregunta a la vez y elige su respuesta. Después de cada respuesta recibe retroalimentación inmediata: sabe si acertó o no, cuál era la respuesta correcta y, si el docente lo indicó, una breve explicación. El examen avanza pregunta por pregunta hasta completarse.

### Resultados finales
Al terminar el examen, el estudiante ve su nota final en porcentaje, cuántas respuestas acertó y cuántas erró. Esta información queda registrada para que el docente pueda consultarla.

---

## Banco de preguntas (Docentes)

### Agregar preguntas
Los docentes pueden agregar preguntas al banco desde su panel. Por cada pregunta definen:
- A qué materia y unidad pertenece.
- El enunciado de la pregunta.
- Las opciones de respuesta (múltiple opción o verdadero/falso).
- Cuál es la respuesta correcta.
- Una explicación opcional que se le mostrará al estudiante después de responder.

### Editar y eliminar preguntas
Las preguntas del banco se pueden modificar o eliminar en cualquier momento desde el panel docente, sin necesidad de salir de la pantalla. Los cambios afectan a los próximos exámenes que se generen.

### Panel de seguimiento
El panel del docente muestra un resumen con:
- **Mis preguntas:** todas las preguntas que el docente creó, con su materia, unidad y formato.
- **Resultados de alumnos:** una tabla con todos los exámenes completados, mostrando el nombre del alumno, la materia, la unidad, la nota obtenida y la fecha.
- **Estadísticas rápidas:** cantidad de preguntas creadas, cantidad de exámenes completados y el promedio general de notas.

### Detalle de cada examen
Haciendo clic en cualquier fila de la tabla de resultados, el docente puede ver el examen completo de ese alumno: cada pregunta, qué respondió el estudiante, cuál era la respuesta correcta y si acertó o no. Esto permite identificar fácilmente qué temas generan más dificultades.

---

## Mejoras generales

- **Sin interrupciones al navegar:** al editar una pregunta, se abre un panel flotante dentro de la misma pantalla en lugar de llevar a una página nueva, por lo que el docente no pierde el contexto de su panel.
- **Carga sin parpadeos:** al recargar cualquier página protegida, la plataforma muestra una pantalla de carga breve en lugar de redirigir innecesariamente al login.
- **Acceso controlado por carrera:** los estudiantes solo pueden generar exámenes de las materias que corresponden a su carrera. Si intentan acceder a otra, el sistema lo impide.

---

## Resumen de áreas

| Área | ¿Está funcionando? |
|---|---|
| Inicio de sesión y cierre de sesión | ✅ |
| Registro de estudiantes y activación | ✅ |
| Panel de administración de usuarios | ✅ |
| Creación y edición de usuarios | ✅ |
| Generación de exámenes de práctica | ✅ |
| Sesión interactiva con retroalimentación | ✅ |
| Banco de preguntas (alta, edición, baja) | ✅ |
| Panel docente con resultados de alumnos | ✅ |
| Detalle pregunta por pregunta de cada examen | ✅ |
| Visor 3D de anatomía (esqueleto, músculos, etc.) | ✅ (previo a este ciclo) |
