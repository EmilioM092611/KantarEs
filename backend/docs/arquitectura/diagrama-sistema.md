# Diagrama del Sistema

## Arquitectura General

```mermaid
graph TB
    subgraph "Cliente"
        FE[Frontend Next.js<br/>Puerto 3002]
        ELECTRON[Aplicación Electron<br/>Escritorio]
    end

    subgraph "Backend - Puerto 3000"
        API[API REST NestJS]
        AUTH[Auth Module<br/>JWT]
        SWAGGER[Swagger Docs<br/>/api]
    end

    subgraph "Capa de Datos"
        PRISMA[Prisma ORM]
        REDIS[(Redis Cache)]
        DB[(PostgreSQL)]
    end

    FE --> API
    ELECTRON --> API
    API --> AUTH
    API --> PRISMA
    API --> REDIS
    PRISMA --> DB
```

## Arquitectura de Módulos

```mermaid
graph LR
    subgraph "Módulos de Negocio"
        ORDENES[Órdenes]
        PRODUCTOS[Productos/Menú]
        INVENTARIO[Inventario]
        PROVEEDORES[Proveedores]
        FINANZAS[Finanzas/Cortes]
        USUARIOS[Usuarios]
    end

    subgraph "Módulos Transversales"
        AUTH[Autenticación]
        GUARDS[Guards/Roles]
        FILTERS[Exception Filters]
        CACHE[Cache Manager]
    end

    ORDENES --> AUTH
    PRODUCTOS --> AUTH
    INVENTARIO --> AUTH
    PROVEEDORES --> AUTH
    FINANZAS --> AUTH
    USUARIOS --> AUTH

    ORDENES --> CACHE
    PRODUCTOS --> CACHE
```

## Flujo de Autenticación

```mermaid
sequenceDiagram
    participant Cliente
    participant API
    participant AuthService
    participant DB
    participant JWT

    Cliente->>API: POST /auth/login
    API->>AuthService: Validar credenciales
    AuthService->>DB: Buscar usuario
    DB-->>AuthService: Datos usuario + rol
    AuthService->>JWT: Generar token
    JWT-->>AuthService: access_token
    AuthService-->>API: Token + datos usuario
    API-->>Cliente: { access_token, user }

    Note over Cliente: Guardar token

    Cliente->>API: GET /ordenes (Header: Bearer token)
    API->>Guards: Validar token + rol
    Guards-->>API: Usuario autorizado
    API-->>Cliente: Lista de órdenes
```

## Capas de la Aplicación

| Capa                  | Responsabilidad                            | Tecnologías              |
| --------------------- | ------------------------------------------ | ------------------------ |
| **Presentación**      | UI/UX, formularios, navegación             | Next.js, React, Tailwind |
| **API**               | Endpoints REST, validación, autenticación  | NestJS, Guards, Pipes    |
| **Lógica de Negocio** | Reglas de negocio, cálculos, transacciones | Services, DTOs           |
| **Acceso a Datos**    | ORM, queries, migraciones                  | Prisma, PostgreSQL       |
| **Caché**             | Optimización de consultas frecuentes       | Redis, Cache Manager     |

## Estructura de Directorios

```
backend/
├── src/
│   ├── auth/              # Autenticación y autorización
│   ├── ordenes/           # Gestión de órdenes
│   ├── productos/         # Catálogo de productos
│   ├── inventario/        # Control de inventario
│   ├── proveedores/       # Gestión de proveedores
│   ├── usuarios/          # Administración de usuarios
│   ├── common/            # Guards, filters, decorators
│   └── main.ts            # Punto de entrada
├── prisma/
│   └── schema.prisma      # Modelo de datos
└── test/                  # Tests e2e
```

## Seguridad

### Medidas Implementadas

1. **Helmet**: Headers de seguridad HTTP
2. **CORS**: Configuración por variables de entorno
3. **JWT**: Tokens con expiración
4. **Validation Pipes**: Validación de entrada
5. **Role Guards**: Control de acceso basado en roles
6. **Exception Filters**: Manejo centralizado de errores

### Variables de Entorno Críticas

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
CORS_ORIGIN=http://localhost:3002
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Patrón de Comunicación

### Request/Response Cycle

```mermaid
sequenceDiagram
    participant C as Cliente
    participant M as Middleware
    participant G as Guards
    participant CO as Controller
    participant S as Service
    participant P as Prisma
    participant D as Database

    C->>M: HTTP Request
    M->>M: Helmet, CORS
    M->>G: Validar JWT
    G->>G: Verificar Roles
    G->>CO: Request autorizado
    CO->>CO: Validar DTO
    CO->>S: Ejecutar lógica
    S->>P: Query/Mutation
    P->>D: SQL
    D-->>P: Resultados
    P-->>S: Datos tipados
    S-->>CO: Respuesta procesada
    CO-->>C: JSON Response
```

## Manejo de Errores

```mermaid
graph TD
    A[Error Ocurre] --> B{Tipo de Error}
    B -->|Prisma Error| C[PrismaExceptionFilter]
    B -->|HTTP Exception| D[Default Exception Filter]
    B -->|Validation Error| E[ValidationPipe]

    C --> F[Convertir a HTTP Status]
    D --> F
    E --> F

    F --> G[Respuesta JSON Estructurada]
    G --> H[Cliente recibe error]
```
