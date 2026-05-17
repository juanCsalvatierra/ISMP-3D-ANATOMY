# Backend — ISMP Anatomy

> 🚧 **Placeholder** — Este directorio está reservado para el backend del proyecto y será implementado por un equipo separado. Por ahora, el frontend opera de forma autónoma con datos locales (JSON) y persistencia client-side (`localStorage`).

## Stack planificado

- **Framework**: [NestJS](https://nestjs.com/)
- **Base de datos**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Autenticación**: JWT
- **Puerto local**: `3001` (consumido por el frontend vía `NEXT_PUBLIC_API_URL`)

## Documentación de referencia

Antes de empezar a implementar, leer:

- [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md) — Arquitectura general (frontend + backend).
- [../docs/STACK.md](../docs/STACK.md) — Decisiones técnicas del stack.
- [../docs/BACKEND_API.md](../docs/BACKEND_API.md) — **Contrato REST completo** que el frontend espera consumir (endpoints, payloads, auth flow).
- [../docs/ROLES_ROADMAP.md](../docs/ROLES_ROADMAP.md) — Modelo de roles (`estudiante` / `docente` / `admin`).

## Alcance funcional

El backend debe cubrir, como mínimo:

- 🔐 **Autenticación**: login/logout, emisión y verificación de JWT.
- 👥 **Usuarios**: CRUD con roles (`estudiante`, `docente`, `admin`).
- 📝 **Cuestionarios**: persistencia de cuestionarios autorados por docentes.
- 🎯 **Intentos**: registro de intentos, respuestas y resultados de los estudiantes.
- 📊 **Reportes**: agregados para docentes (rendimiento por curso, por cuestionario).

## Convenciones

- No mover código de frontend a este directorio.
- Respetar el contrato definido en [BACKEND_API.md](../docs/BACKEND_API.md) — el frontend ya tiene las llamadas planificadas contra esos endpoints.
- Variables de entorno sensibles en `.env` (nunca commitear; usar `.env.example` como plantilla).
