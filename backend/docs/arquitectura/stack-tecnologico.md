# Stack Tecnológico

## Backend

### Framework Principal

- **NestJS** (v10+)
  - Framework progresivo de Node.js
  - Arquitectura modular
  - Decorators y Dependency Injection
  - Soporte TypeScript nativo

### Base de Datos

- **PostgreSQL**
  - Base de datos relacional principal
  - Transacciones ACID
  - Tipos de datos avanzados
- **Prisma ORM**
  - ORM de última generación
  - Type-safety completo
  - Migraciones automáticas
  - Prisma Client generado

### Caché y Performance

- **Redis**
  - Caché en memoria
  - Cache Manager v5
  - `cache-manager-redis-yet` adapter
  - TTL configurable por endpoint

### Autenticación y Seguridad

- **JWT** (JSON Web Tokens)
  - `@nestjs/jwt`
  - Estrategia de autenticación stateless
  - Tokens con expiración

- **Helmet**
  - Headers de seguridad HTTP
  - Protección XSS, clickjacking, etc.

- **class-validator** & **class-transformer**
  - Validación de DTOs
  - Transformación de tipos
  - Decorators de validación

### Documentación

- **Swagger / OpenAPI**
  - `@nestjs/swagger`
  - Documentación interactiva
  - Generación automática de specs
  - Disponible en `/api`

### Testing

- **Jest**
  - Framework de testing principal
  - Unit tests y integration tests
- **Supertest**
  - Testing de endpoints HTTP
  - Tests e2e

- **@faker-js/faker**
  - Generación de datos de prueba

## Frontend

### Framework Principal

- **Next.js 14+**
  - React framework full-stack
  - App Router
  - Server Components
  - API Routes

### UI/UX

- **React 18**
  - Hooks modernos
  - Concurrent features
- **Tailwind CSS**
  - Utility-first CSS
  - Diseño responsivo
  - Customización completa

- **Lucide React**
  - Librería de iconos
  - Componentes SVG optimizados

### Visualización de Datos

- **Recharts**
  - Gráficos React
  - Componentes declarativos
  - Responsivos

### Estado y Datos

- **React Hooks**
  - useState, useEffect, useContext
  - Custom hooks para API calls

## Aplicación de Escritorio

- **Electron**
  - `@types/electron`
  - Aplicación desktop multiplataforma
  - Integración con Next.js

## Gestión de Paquetes

- **pnpm**
  - Gestor de paquetes eficiente
  - Menor uso de disco
  - Workspaces monorepo

## DevOps y Herramientas

### Control de Versiones

- **Git**
- **GitHub/GitLab**

### Linting y Formato

- **ESLint**
  - Linting de código
  - Reglas personalizadas NestJS

- **Prettier** (recomendado)
  - Formato automático de código

### Scripts de Desarrollo

```json
{
  "start:dev": "nest start --watch",
  "redis:start": "redis-server",
  "test": "jest",
  "test:e2e": "jest --config ./test/jest-e2e.json",
  "electron-dev": "concurrently \"pnpm dev\" \"wait-on http://localhost:3002 && electron .\""
}
```

## Dependencias Principales

### Backend (package.json)

```json
{
  "@nestjs/common": "^10.x",
  "@nestjs/core": "^10.x",
  "@nestjs/jwt": "^10.x",
  "@nestjs/swagger": "^7.x",
  "@nestjs/typeorm": "^10.x",
  "@nestjs/cache-manager": "^3.x",
  "prisma": "^5.x",
  "@prisma/client": "^5.x",
  "cache-manager": "^5.x",
  "cache-manager-redis-yet": "latest",
  "ioredis": "^5.x",
  "class-validator": "^0.14.x",
  "class-transformer": "^0.5.x",
  "helmet": "^7.x"
}
```

### Frontend (package.json)

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.263.x",
  "recharts": "^2.x"
}
```

## Entorno de Desarrollo

### Requisitos

- **Node.js**: v18+ o v20+
- **PostgreSQL**: v14+
- **Redis**: v6+
- **pnpm**: v8+

### Puertos

- Backend: `3000`
- Frontend: `3002`
- PostgreSQL: `5432`
- Redis: `6379`

## Despliegue

### Producción

```bash
# Backend
pnpm run build
pnpm run start:prod

# Frontend
pnpm run build
pnpm run start
```

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/kantares

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRATION=1d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Roadmap Tecnológico

### En Consideración

- [ ] WebSockets para notificaciones en tiempo real
- [ ] GraphQL como alternativa a REST
- [ ] Docker y Docker Compose para desarrollo
- [ ] CI/CD con GitHub Actions
- [ ] Monitoreo con Sentry
- [ ] Logs estructurados con Winston

## Comparación de Tecnologías

### ¿Por qué NestJS?

| Característica       | NestJS | Express | Fastify |
| -------------------- | ------ | ------- | ------- |
| TypeScript nativo    | ✅     | ❌      | ✅      |
| Arquitectura opinada | ✅     | ❌      | ❌      |
| Decorators           | ✅     | ❌      | ⚠️      |
| DI Container         | ✅     | ❌      | ✅      |
| Swagger integrado    | ✅     | ⚠️      | ⚠️      |

### ¿Por qué Prisma?

| Característica       | Prisma | TypeORM | Sequelize |
| -------------------- | ------ | ------- | --------- |
| Type Safety          | ✅✅✅ | ✅✅    | ✅        |
| Migraciones          | ✅     | ✅      | ✅        |
| Performance          | ✅✅   | ✅      | ✅        |
| Developer Experience | ✅✅✅ | ✅✅    | ✅        |
| Auto-completion      | ✅✅✅ | ✅      | ⚠️        |
