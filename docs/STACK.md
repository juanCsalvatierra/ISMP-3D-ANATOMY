# ISMP Anatomy - Stack Tecnológico

## Visión General

Proyecto **monorepo** dividido en **frontend** y **backend** para permitir que dos equipos independientes trabajen en paralelo.

---

## Frontend Stack

**Ubicación:** `/` (raíz del proyecto)

### Lenguaje & Framework
- **Next.js** `16.2.3` - Framework React con SSR/SSG
- **React** `19.2.3` - Librería de UI
- **TypeScript** `5.9.3` - Tipado estático (strict mode)

### 3D & Visualización
- **Three.js** `0.183.2` - Motor 3D WebGL
- **@react-three/fiber** `9.5.0` - React renderer para Three.js
- **@react-three/drei** `10.7.7` - Utilidades y helpers para 3D
- **@react-three/postprocessing** `3.0.4` - Efectos post-procesamiento

### Estilos & UI
- **Tailwind CSS** `4` - Utility-first CSS framework
- **tailwind-scrollbar** `4.0.2` - Plugin para estilizar scrollbars

### Gestión de Estado
- **Zustand** `5.0.12` - State management minimalista

### Markdown
- **react-markdown** `10.1.0` - Renderizado de Markdown en React

### Herramientas de Desarrollo
- **ESLint** `9` - Linting
- **Prettier** - Code formatting (configurado en eslintplugin)

---

## Backend Stack (Por implementar por equipo backend)

**Ubicación:** `/backend` (crear estructura)

### Lenguaje & Framework
- **Node.js** `20+` - Runtime JavaScript
- **NestJS** `10.4.0+` - Framework Node.js progresivo
- **TypeScript** `5.3.3+` - Tipado estático

### Base de Datos
- **PostgreSQL** `14+` - Base de datos relacional
- **Prisma** `5.0+` - ORM type-safe

### Autenticación
- **JWT** - Token-based authentication
- **@nestjs/jwt** - Integración con NestJS
- **@nestjs/passport** - Estrategias Passport
- **passport-jwt** - Estrategia JWT

### Validación & Transformación
- **class-validator** - Validación basada en decoradores
- **class-transformer** - Transformación de DTOs

### Almacenamiento de Archivos
- **Multer** - Middleware de upload
- **@nestjs/multer** - Integración con NestJS

### Testing
- **Jest** - Testing framework
- **Supertest** - HTTP assertion library

### Herramientas de Desarrollo
- **ESLint** - Linting
- **Prettier** - Code formatting

---

## Comunicación Frontend-Backend

### API REST
- **Protocolo:** HTTP/HTTPS
- **Base URL:** `http://localhost:3001` (desarrollo) / `https://api.domain.com` (producción)
- **Autenticación:** JWT en headers `Authorization: Bearer <token>`
- **Content-Type:** `application/json` (excepto uploads que usan `multipart/form-data`)

### Estructura de Respuestas
**Success:**
```json
{
  "success": true,
  "data": { /* payload */ },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable message",
  "details": {}
}
```

---

## Requisitos del Sistema

### Frontend
- Node.js 20+
- npm 10+ o yarn 4+
- Navegador moderno con soporte WebGL

### Backend
- Node.js 20+
- PostgreSQL 14+
- npm 10+ o yarn 4+

---

## Workflow de Desarrollo Paralelo

### Equipo Frontend
1. Desarrolla en `/` con `npm run dev`
2. Consume API de backend en `http://localhost:3001`
3. Usa mocks de API si backend no está listo
4. Commits en rama `frontend/*`

### Equipo Backend
1. Desarrolla en `/backend` con `npm run start:dev`
2. Expone API en `http://localhost:3001`
3. Respeta contrato de API documentado
4. Commits en rama `backend/*`

### Integración
- Código se une en rama `develop` tras validación
- Tests deben pasar antes de merge
- API debe estar documentada

---

## Variables de Entorno

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=ISMP Anatomy
```

### Backend (`.env`)
```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/ismp_anatomy
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
```

---

## Puertos

| Servicio | Puerto | Comando |
|----------|--------|---------|
| Frontend | 3000 | `npm run dev` |
| Backend | 3001 | `npm run start:dev` |
| PostgreSQL | 5432 | - |

---

## Referencias

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Three.js Docs](https://threejs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs)
