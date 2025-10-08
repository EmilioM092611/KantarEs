# Endpoints Principales de la API

## Base URL

**Desarrollo**: `http://localhost:3000`

**Producción**: `https://api.kantares.com` (ejemplo)

## Documentación Interactiva

**Swagger UI**: `http://localhost:3000/api`

## Autenticación

Todos los endpoints (excepto `/auth/login`) requieren autenticación vía JWT.

**Header requerido**:

```
Authorization: Bearer {access_token}
```

## Estructura de Respuestas

### Respuesta Exitosa

```json
{
  "data": { ... },
  "message": "Operación exitosa"
}
```

### Respuesta de Error

```json
{
  "statusCode": 400,
  "message": "Error descriptivo",
  "error": "Bad Request"
}
```

### Respuesta Paginada

```json
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "pagina": 1,
    "por_pagina": 20,
    "total_paginas": 8
  }
}
```

## Módulos de la API

1. [Autenticación](#autenticación-1)
2. [Órdenes](#órdenes)
3. [Productos](#productos)
4. [Inventario](#inventario)
5. [Proveedores](#proveedores)
6. [Cortes de Caja](#cortes-de-caja)
7. [Usuarios](#usuarios)

---

## Autenticación

### POST /auth/login

Iniciar sesión.

**Roles**: Público

**Body**:

```json
{
  "email": "admin@kantares.com",
  "password": "Admin123!"
}
```

**Response (200)**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "nombre": "Admin",
    "apellido": "Sistema",
    "email": "admin@kantares.com",
    "rol": "Administrador"
  }
}
```

### GET /auth/me

Obtener usuario actual.

**Roles**: Todos los autenticados

**Response (200)**:

```json
{
  "id_usuario": 1,
  "nombre": "Admin",
  "apellido": "Sistema",
  "email": "admin@kantares.com",
  "rol": "Administrador"
}
```

---

## Órdenes

### GET /ordenes

Listar órdenes.

**Roles**: Todos

**Query Params**:

- `estado`: ID del estado
- `mesa`: Número de mesa
- `fecha`: YYYY-MM-DD
- `pagina`: Número de página
- `por_pagina`: Items por página

**Response (200)**: Ver [ejemplos-uso.md](./ejemplos-uso.md#listar-órdenes)

### POST /ordenes

Crear orden.

**Roles**: Cajero, Mesero, Gerente, Admin

**Body**:

```json
{
  "id_mesa": 5,
  "tipo": "local",
  "notas": "Cliente prefiere ventana"
}
```

### GET /ordenes/:id

Obtener orden específica.

**Roles**: Todos

### POST /ordenes/:id/items

Agregar items a orden.

**Roles**: Cajero, Mesero, Gerente, Admin

**Body**:

```json
{
  "id_producto": 12,
  "cantidad": 2,
  "precio_unitario": 85.0,
  "notas": "Sin cebolla"
}
```

### DELETE /ordenes/:id/items/:itemId

Eliminar item de orden.

**Roles**: Cajero, Mesero, Gerente, Admin

### PATCH /ordenes/:id/estado

Cambiar estado de orden.

**Roles**: Según estado (ver matriz de permisos)

**Body**:

```json
{
  "id_estado_orden": 2,
  "notas": "Orden lista"
}
```

### POST /ordenes/:id/pagar

Procesar pago.

**Roles**: Cajero, Gerente, Admin

**Body**:

```json
{
  "id_metodo_pago": 1,
  "monto_recibido": 500.0,
  "propina": 50.0
}
```

### GET /ordenes/activas

Órdenes activas (no pagadas).

**Roles**: Todos

### GET /ordenes/mesa/:numeroMesa

Órdenes de una mesa.

**Roles**: Todos

---

## Productos

### GET /productos

Listar productos.

**Roles**: Todos

**Query Params**:

- `categoria`: ID de categoría
- `disponible`: true/false
- `buscar`: Búsqueda por nombre
- `precio_min`: Precio mínimo
- `precio_max`: Precio máximo

### POST /productos

Crear producto.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "nombre": "Tacos al Pastor",
  "descripcion": "3 tacos con pastor",
  "precio": 85.0,
  "costo": 35.0,
  "id_categoria": 3,
  "sku": "TAC-PAS-001",
  "stock_minimo": 20,
  "unidad_medida": "porción"
}
```

### GET /productos/:id

Obtener producto.

**Roles**: Todos

### PATCH /productos/:id

Actualizar producto.

**Roles**: Gerente, Admin

### DELETE /productos/:id

Eliminar producto (soft delete).

**Roles**: Admin

### GET /productos/categorias

Listar categorías.

**Roles**: Todos

### POST /productos/categorias

Crear categoría.

**Roles**: Gerente, Admin

### GET /productos/mas-vendidos

Top productos.

**Roles**: Todos

**Query Params**:

- `periodo`: dia, semana, mes
- `limite`: Cantidad (default: 10)

### GET /productos/bajo-stock

Productos con stock bajo.

**Roles**: Gerente, Admin

---

## Inventario

### GET /inventario/stock

Consultar stock.

**Roles**: Todos

**Query Params**:

- `categoria`: ID categoría
- `bajo_minimo`: true/false

### POST /inventario/ajuste

Ajustar stock.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "id_producto": 12,
  "cantidad_nueva": 50,
  "motivo": "Inventario físico",
  "notas": "Conteo mensual"
}
```

### POST /inventario/merma

Registrar merma.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "id_producto": 8,
  "cantidad": 5,
  "motivo": "caducado",
  "responsable": "Juan Pérez"
}
```

### GET /inventario/movimientos

Historial de movimientos.

**Roles**: Gerente, Admin

**Query Params**:

- `producto`: ID del producto
- `tipo`: entrada, salida, ajuste
- `fecha_inicio`: YYYY-MM-DD
- `fecha_fin`: YYYY-MM-DD

### GET /inventario/alertas

Alertas de stock.

**Roles**: Gerente, Admin

### GET /inventario/reportes/existencias

Reporte de existencias.

**Roles**: Gerente, Admin

### GET /inventario/reportes/movimientos

Reporte de movimientos.

**Roles**: Gerente, Admin

### GET /inventario/reportes/mermas

Reporte de mermas.

**Roles**: Gerente, Admin

---

## Compras

### GET /compras

Listar compras.

**Roles**: Gerente, Admin

**Query Params**:

- `estado`: Estado de compra
- `proveedor`: ID de proveedor
- `fecha_inicio`: YYYY-MM-DD
- `fecha_fin`: YYYY-MM-DD

### POST /compras

Crear orden de compra.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "id_proveedor": 5,
  "fecha_compra": "2025-10-08",
  "items": [
    {
      "id_producto": 12,
      "cantidad": 50,
      "precio_unitario": 25.0
    }
  ],
  "notas": "Entrega urgente"
}
```

### GET /compras/:id

Obtener compra.

**Roles**: Gerente, Admin

### PATCH /compras/:id/recibir

Registrar recepción.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "fecha_recepcion": "2025-10-10",
  "items_recibidos": [
    {
      "id_detalle": 89,
      "cantidad_recibida": 50
    }
  ]
}
```

### POST /compras/:id/pagar

Registrar pago.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "fecha_pago": "2025-10-15",
  "metodo_pago": "transferencia",
  "referencia": "TRF-12345",
  "monto": 1989.4
}
```

---

## Proveedores

### GET /proveedores

Listar proveedores.

**Roles**: Gerente, Admin, Cajero (lectura)

**Query Params**:

- `activo`: true/false
- `buscar`: Búsqueda por nombre o RFC

### POST /proveedores

Crear proveedor.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "nombre": "Abarrotes del Centro",
  "rfc": "ABC123456XYZ",
  "direccion": "Av. Principal 123",
  "telefono": "555-1234",
  "email": "ventas@abarrotes.com",
  "dias_credito": 30,
  "limite_credito": 50000.0
}
```

### GET /proveedores/:id

Obtener proveedor.

**Roles**: Gerente, Admin, Cajero

### PATCH /proveedores/:id

Actualizar proveedor.

**Roles**: Gerente, Admin

### DELETE /proveedores/:id

Desactivar proveedor.

**Roles**: Admin

### GET /proveedores/:id/historial-compras

Historial de compras.

**Roles**: Gerente, Admin

### GET /proveedores/:id/estadisticas

Estadísticas de desempeño.

**Roles**: Gerente, Admin

### GET /proveedores/comparar

Comparar precios.

**Roles**: Gerente, Admin

**Query Params**:

- `id_producto`: ID del producto

---

## Cortes de Caja

### GET /cortes

Listar cortes.

**Roles**: Todos (con restricciones)

**Query Params**:

- `estado`: Estado del corte
- `usuario`: ID del usuario
- `fecha_inicio`: YYYY-MM-DD
- `fecha_fin`: YYYY-MM-DD

### POST /cortes/apertura

Abrir caja.

**Roles**: Cajero, Gerente, Admin

**Body**:

```json
{
  "monto_inicial": 500.0,
  "billetes": {
    "1000": 0,
    "500": 1,
    "200": 0
  },
  "monedas": {
    "10": 0,
    "5": 0
  }
}
```

### GET /cortes/activo

Obtener corte activo.

**Roles**: Cajero, Gerente, Admin

### POST /cortes/:id/gastos

Registrar gasto.

**Roles**: Gerente, Admin

**Body**:

```json
{
  "concepto": "Compra de gas",
  "monto": 350.0,
  "categoria": "servicios",
  "metodo_pago": "efectivo"
}
```

### POST /cortes/:id/cierre

Cerrar turno.

**Roles**: Cajero, Gerente, Admin

**Body**:

```json
{
  "efectivo_contado": 8820.00,
  "desglose_billetes": { ... }
}
```

### GET /cortes/:id

Obtener corte específico.

**Roles**: Cajero (solo propios), Gerente, Admin

### GET /cortes/reporte-diario

Reporte del día.

**Roles**: Gerente, Admin

**Query Params**:

- `fecha`: YYYY-MM-DD

### GET /cortes/reporte-semanal

Reporte semanal.

**Roles**: Gerente, Admin

### GET /cortes/reporte-mensual

Reporte mensual.

**Roles**: Gerente, Admin

### GET /cortes/dashboard

Dashboard en tiempo real.

**Roles**: Gerente, Admin

---

## Usuarios

### GET /usuarios

Listar usuarios.

**Roles**: Admin, Gerente (lectura)

**Query Params**:

- `rol`: Filtrar por rol
- `activo`: true/false

### POST /usuarios

Crear usuario.

**Roles**: Admin

**Body**:

```json
{
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "email": "carlos@kantares.com",
  "password": "Password123!",
  "rol": "Cajero",
  "telefono": "555-5678"
}
```

### GET /usuarios/:id

Obtener usuario.

**Roles**: Admin, Gerente (lectura), Usuario (su perfil)

### PATCH /usuarios/:id

Actualizar usuario.

**Roles**: Admin

### DELETE /usuarios/:id

Desactivar usuario.

**Roles**: Admin

### POST /usuarios/:id/cambiar-password

Cambiar contraseña.

**Roles**: Admin, Usuario (su password)

**Body**:

```json
{
  "password_actual": "OldPass123!",
  "password_nueva": "NewPass456!",
  "confirmar_password": "NewPass456!"
}
```

### POST /usuarios/:id/reset-password

Resetear contraseña.

**Roles**: Admin

### GET /usuarios/:id/actividad

Log de actividad.

**Roles**: Admin

### GET /usuarios/:id/rendimiento

Métricas de rendimiento.

**Roles**: Admin, Gerente

### POST /usuarios/:id/desbloquear

Desbloquear usuario.

**Roles**: Admin

---

## Códigos de Estado HTTP

| Código | Significado           | Uso                             |
| ------ | --------------------- | ------------------------------- |
| 200    | OK                    | Operación exitosa               |
| 201    | Created               | Recurso creado                  |
| 400    | Bad Request           | Datos inválidos                 |
| 401    | Unauthorized          | No autenticado                  |
| 403    | Forbidden             | Sin permisos                    |
| 404    | Not Found             | Recurso no existe               |
| 409    | Conflict              | Conflicto (ej: email duplicado) |
| 500    | Internal Server Error | Error del servidor              |

## Rate Limiting

- **Login**: 5 intentos por minuto
- **Endpoints generales**: Sin límite (desarrollo)
- **Producción**: 100 requests por minuto por IP

## Versionado

Actualmente v1 (sin prefijo).

Futuro: `/api/v2/...`

## CORS

**Permitido**: Configurado via `CORS_ORIGIN` en `.env`

**Headers permitidos**:

- Origin
- X-Requested-With
- Content-Type
- Accept
- Authorization

## Compresión

Respuestas > 1KB se comprimen automáticamente con gzip.
