# ISMP Anatomy - Arquitectura del Proyecto

## Diagrama General

```
┌─────────────────────────────────────┐
│      FRONTEND (Next.js)             │
│  - 3D Viewer (Three.js + Fiber)     │
│  - Auth UI                          │
│  - Quiz Interface                   │
│  - Image Gallery                    │
│  Puerto: 3000                       │
└──────────────┬──────────────────────┘
               │
          API REST
        (JWT Auth)
        http://localhost:3001
               │
┌──────────────▼──────────────────────┐
│      BACKEND (NestJS)               │
│  - Auth Service                     │
│  - Anatomy Service                  │
│  - Quiz Service                     │
│  - File Upload Service              │
│  - User Management                  │
│  Puerto: 3001                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      DATABASE (PostgreSQL)          │
│  - Users (students + teachers)      │
│  - Quizzes & Answers                │
│  - Anatomy Metadata                 │
│  - Images Metadata                  │
│  Puerto: 5432                       │
└─────────────────────────────────────┘
```

---

## Flujo de Autenticación

1. Usuario entra email/password en Frontend
2. Frontend POST a `/api/auth/login`
3. Backend valida credenciales en BD
4. Backend devuelve JWT token + datos usuario
5. Frontend almacena token en localStorage
6. Requests posteriores incluyen token en header `Authorization: Bearer <token>`
7. Backend valida JWT en cada request protegido
8. Logout elimina token del cliente

---

## Flujo de Quiz

1. Frontend GET `/api/quizzes/:id` - obtiene preguntas
2. Usuario contesta en Frontend
3. Frontend POST `/api/quizzes/:id/submit` con respuestas
4. Backend valida respuestas y calcula puntuación
5. Backend guarda resultado en BD
6. Backend devuelve feedback inmediato
7. Frontend muestra resultado y estadísticas

---

## Flujo de Upload de Imágenes Médicas

1. Frontend selecciona archivo (validación client-side)
2. Frontend POST `/api/images/upload` con FormData + token
3. Backend valida tamaño/tipo
4. Backend guarda archivo en disk/S3
5. Backend guarda metadata en BD
6. Frontend recibe URL/ID de imagen
7. Imagen se muestra en gallery vinculada a anatomía

---

## Módulos del Backend (Por crear)

### Auth Module
- POST `/api/auth/login` - Login
- POST `/api/auth/register` - Registro
- POST `/api/auth/refresh` - Refresh token
- GET `/api/auth/me` - Obtener usuario actual
- POST `/api/auth/logout` - Logout

### Users Module
- GET `/api/users/:id` - Obtener perfil
- PUT `/api/users/:id` - Actualizar perfil
- GET `/api/users` - Listar usuarios (solo admin)
- Manejo de roles: student, teacher, admin

### Anatomy Module
- GET `/api/anatomy/skeleton` - Datos del esqueleto
- GET `/api/anatomy/muscles` - Datos de músculos
- GET `/api/anatomy/organs` - Datos de órganos
- GET `/api/anatomy/search` - Búsqueda de estructuras

### Quizzes Module
- GET `/api/quizzes` - Listar cuestionarios
- GET `/api/quizzes/:id` - Obtener quiz con preguntas
- POST `/api/quizzes/:id/submit` - Enviar respuestas
- GET `/api/quizzes/:id/results` - Resultados de usuario

### Images Module
- POST `/api/images/upload` - Subir imagen
- GET `/api/images/:id` - Obtener metadatos
- GET `/api/images` - Listar imágenes
- DELETE `/api/images/:id` - Eliminar imagen

### Common Module
- Middlewares (logging, error handling)
- Guards (JWT, roles)
- Decoradores personalizados
- Excepciones globales
- Interceptores

---

## Flujo de Datos Frontend

```
┌─────────────────────────────────────────┐
│         Usuario en Navegador            │
└────────────────┬────────────────────────┘
                 │
        ┌────────▼────────┐
        │  Next.js Pages  │  /skeleton, /muscles, /organs, /quiz
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼──┐  ┌─────▼──┐  ┌─────▼──────┐
│ 3D   │  │ Zustand│  │ API Calls  │
│Scene │  │ Store  │  │ (axios)    │
└──────┘  └────────┘  └────────────┘
    │            │            │
    └────────────┼────────────┘
                 │
        ┌────────▼────────┐
        │   Components    │  InfoPanel, MeshVisibilityPanel, etc.
        └─────────────────┘
```

---

## Flujo de Datos Backend

```
┌──────────────────────────────────────┐
│      HTTP Request (Postman/Client)   │
└────────────────┬─────────────────────┘
                 │
        ┌────────▼────────┐
        │  Controllers    │  Define routes y params
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  Pipes/Guards   │  Validación, Auth, Roles
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Services      │  Lógica de negocio
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   Repositories  │  Acceso a BD (Prisma)
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │   PostgreSQL    │  Persistencia
        └────────┬────────┘
                 │
    ┌────────────▼────────────┐
    │  Response JSON (Success  │
    │  or Error)              │
    └─────────────────────────┘
```

---

## Estado Frontend (Zustand)

### useAnatomyStore
- `hovered: string | null` - Mesh al que hace hover
- `selected: AnatomyItem | null` - Estructura seleccionada
- `selectedUuid: string | null` - UUID del mesh seleccionado
- `isolated: string | null` - UUID del mesh aislado

### useCameraStore
- `target: THREE.Vector3` - Punto a mirar
- `position: THREE.Vector3` - Posición de cámara
- `isMoving: boolean` - Está animando
- `setFocus(target, position)` - Animar cámara

### useMeshStore
- `groups: MeshGroup[]` - Grupos de mallas por categoría
- `toggleGroup(key, visible)` - Mostrar/ocultar grupo

---

## Seguridad

- Frontend: Token JWT en localStorage (vulnerable a XSS)
- Backend: Validar JWT en cada request protegido
- CORS: Permitir solo http://localhost:3000 en dev
- HTTPS: Requerido en producción
- Roles: Student, Teacher, Admin con permisos granulares
- Validación: Siempre server-side, nunca confiar en client-side

---

## Performance Considerations

- **Frontend**: Lazy loading de componentes, memoización de stores
- **Backend**: Índices en BD, caching de quizzes/anatomía
- **Database**: Índices en `id`, `email`, `quizId`
- **API**: Paginación en endpoints que devuelven listas

---

## Error Handling

### Frontend
- Try-catch en async calls
- Toast/modal para errores al usuario
- Log de errores a consola en dev

### Backend
- Throw excepciones específicas (NotFoundException, UnauthorizedException)
- Interceptor global convierte a JSON standard
- Log de errores a archivo/console en dev

