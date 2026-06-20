# Especificación de Requerimientos (Features) - ISMP 3D Anatomy

Este documento detalla la estructura de funcionalidades (Features) para la aplicación web **ISMP 3D Anatomy**, organizada por módulos funcionales (Epics) y roles de usuario.

---

## Epic 1: Gestión de Usuarios y Autenticación

### Feature 1.1: Menú de Navegación Global (Navbar)
* **Descripción:** Componente de navegación superior accesible por todos los usuarios autenticados.
* **Roles:** Todos (Estudiante, Docente, Admin).
* **Comportamiento:** * Al hacer clic sobre el ícono de usuario en la esquina superior derecha, se despliega un menú interactivo.
    * **Opción "Cerrar Sesión":** Visible para todos los roles.
    * **Opción "Usuarios":** Visible **únicamente** para usuarios con rol `Admin` (ubicada arriba del botón de cerrar sesión).

### Feature 1.2: Panel de Administración de Usuarios
* **Descripción:** Vista centralizada para la búsqueda y visualización de las cuentas registradas en la plataforma.
* **Roles:** Admin.
* **Componentes de la Interfaz:**
    * **Formulario "Búsqueda de Usuario":** Input de texto/numérico que permite filtrar usuarios a partir de su identificador único (`DNI`).
    * **Botón "Crear Nuevo Usuario":** Ubicado al lado del formulario de búsqueda, redirige a la vista de alta.
    * **Listado General:** Tabla o lista ubicada en la sección inferior que muestra todos los usuarios del sistema.

### Feature 1.3: Formulario de Registro / Creación de Usuarios
* **Descripción:** Interfaz para dar de alta nuevos perfiles en la base de datos de la aplicación.
* **Roles:** Admin.
* **Campos del Formulario:**
    * `DNI` (Input obligatorio)
    * `Nombre y Apellido`
    * `Email`
    * `Rol` (Menú desplegable: Estudiante, Docente, Admin)
    * `Carrera` (Menú desplegable con opción de selección múltiple: *TecRadiologia*, *TecInstQui*, o ambas)
    * `Contraseña`
    * `Confirmar Contraseña`

### Feature 1.4: Edición de Perfiles de Usuario
* **Descripción:** Acción en línea ("Modificar") asociada a cada registro del listado de usuarios para actualizar credenciales y permisos.
* **Roles:** Admin.
* **Restricción de Negocio:** **Solo** se permite la modificación de los siguientes campos:
    * `Rol` (Dropdown con opciones)
    * `Contraseña` (Input de texto/password)
    * `Carrera` (Selección múltiple o checkboxes para *TecRadiologia* y/o *TecInstQui*)
* **Botón de acción:** "Guardar modificaciones".

---

## Epic 2: Módulo de Cuestionarios (Vista Estudiante)

### Feature 2.1: Generación Aleatoria de Exámenes de Práctica
* **Descripción:** Interfaz que permite al alumnado evaluar sus conocimientos mediante test autogenerados a partir del banco de preguntas global.
* **Roles:** Estudiante.
* **Campos de Configuración del Formulario:**
    * `Materia` (Menú desplegable con las materias específicas de la carrera: *AnatomiaI*, *AnatomiaII*, *AnatomíaIII*, *AnatomiaIV*).
    * `Unidad` (Menú desplegable dinámico que lista las unidades creadas por los docentes, incluyendo una opción global que agrupa "Todas").
    * `Cantidad de Preguntas` (Menú desplegable numérico con rango del 1 al 30).
* **Botón de acción:** "Iniciar Cuestionario".

---

## Epic 3: Módulo de Gestión de Cuestionarios (Docentes y Admin)

### Feature 3.1: Alta de Cuestionarios (Estructura Base)
* **Descripción:** Formulario inicial para dar de alta una nueva unidad temática y su primera pregunta en el sistema.
* **Roles:** Docente, Admin.
* **Campos del Formulario:**
    * `Unidad` (Input de texto libre, ej: "Unidad 1")
    * `Pregunta` (Input de texto)
    * `Respuestas` (Estructura dinámica que permite cargar más de una opción)
    * `Respuesta Correcta` (Selector para identificar la opción válida)
* **Botón de acción:** "Crear cuestionario".

### Feature 3.2: Expansión de Banco de Preguntas (Añadir Pregunta)
* **Descripción:** Permite inyectar preguntas adicionales a unidades previamente existentes sin alterar las ya cargadas, potenciando la aleatoriedad de los exámenes de los estudiantes.
* **Roles:** Docente, Admin.
* **Campos del Formulario:**
    * `Unidad` (Menú desplegable que recupera las unidades ya existentes en el sistema).
    * `Pregunta` (Input de texto)
    * `Respuestas` (Múltiples opciones dinámicas)
    * `Respuesta Correcta` (Selector)
* **Botón de acción:** "Añadir pregunta".

### Feature 3.3: Panel de Mantenimiento y Modificación de Cuestionarios
* **Descripción:** Vista jerárquica para la edición fina o remoción de reactivos de forma individual sin necesidad de reiniciar o borrar el cuestionario completo.
* **Roles:** Docente, Admin.
* **Flujo Operativo:**
    1.  Despliegue de los cuestionarios creados, indexados por el nombre de su unidad (ej: *Unidad 1*, *Unidad 2*, *Unidad 3*).
    2.  Al seleccionar una unidad, se renderiza el listado detallado de todas las preguntas asociadas.
    3.  Cada pregunta cuenta con dos botones de acción directa: **"Modificar"** y **"Eliminar"**.
    4.  Al presionar **"Modificar"**, se abre un formulario precargado con los campos:
        * `Pregunta`
        * `Respuestas` (Edición/adición de opciones)
        * `Respuesta Correcta`
    5.  **Botón de acción:** "Guardar cambios".

---

## 🎨 Consideraciones de UI/UX (Estética del Sistema)
* **Contexto de Edición:** Para mantener el flujo de trabajo limpio, se recomienda que la acción "Modificar" tanto en usuarios como en preguntas no redirija a una nueva página, sino que despliegue un **componente modal** o un **drawer lateral**. Esto respeta la estética limpia de la SPA (Single Page Application) y evita la pérdida de scroll o filtros en los listados base.
