# Documentación KantarEs

Sistema integral de gestión para restaurantes que incluye punto de venta (POS), gestión de inventario, control de finanzas y administración de personal.

## 📑 Índice

### 🏗️ Arquitectura

- [Diagrama del Sistema](./arquitectura/diagrama-sistema.md)
- [Stack Tecnológico](./arquitectura/stack-tecnologico.md)

### 🔄 Procesos de Negocio

- [Flujo de Órdenes](./procesos/flujo-ordenes.md)
- [Flujo de Inventario](./procesos/flujo-inventario.md)
- [Flujo de Cortes de Caja](./procesos/flujo-cortes-caja.md)
- [Flujo de Autenticación](./procesos/flujo-autenticacion.md)

### 📦 Módulos

- [Módulo de Órdenes](./modulos/ordenes.md)
- [Módulo de Productos](./modulos/productos.md)
- [Módulo de Inventario](./modulos/inventario.md)
- [Módulo de Proveedores](./modulos/proveedores.md)
- [Módulo de Usuarios](./modulos/usuarios.md)

### 🔌 API

- [Endpoints Principales](./api/endpoints.md)
- [Ejemplos de Uso](./api/ejemplos-uso.md)

## 🚀 Inicio Rápido

### Backend

```bash
cd backend
pnpm install
pnpm redis:start
pnpm run start:dev
```

### Frontend

```bash
cd FRONTEND
pnpm install
pnpm dev --port 3002
```

## 📚 Recursos

- **Swagger API**: http://localhost:3000/api
- **Frontend**: http://localhost:3002
- **Backend**: http://localhost:3000

## 👥 Roles del Sistema

- **Administrador**: Acceso completo al sistema
- **Gerente**: Gestión operativa y reportes
- **Cajero**: Operaciones de venta y caja

## 🔧 Tecnologías Principales

- **Backend**: NestJS, Prisma, PostgreSQL, Redis
- **Frontend**: Next.js, React, Tailwind CSS
- **Testing**: Jest, Supertest
- **Documentación**: Swagger/OpenAPI

## 📝 Convenciones

- Todos los endpoints están documentados en Swagger
- Los DTOs incluyen validación con class-validator
- Se usa caché de Redis para optimizar consultas frecuentes
- Las transacciones críticas usan Prisma.$transaction
