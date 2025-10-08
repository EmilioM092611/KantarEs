# Módulo de Órdenes

## Descripción

El módulo de órdenes (`ordenes`) es el núcleo del sistema POS, gestionando todo el ciclo de vida de los pedidos desde su creación hasta el pago final.

## Entidades Principales

### 1. ordenes

Tabla principal que representa una orden.

```typescript
{
  id_orden: number;
  numero_orden: string; // AUTO: ORD-001, ORD-002...
  id_mesa: number | null;
  id_cliente: number | null;
  id_estado_orden: number;
  id_usuario_creacion: number;
  fecha_hora_creacion: Date;
  fecha_hora_preparacion: Date | null;
  fecha_hora_listo: Date | null;
  fecha_hora_entrega: Date | null;
  fecha_hora_pago: Date | null;
  subtotal: Decimal;
  descuento: Decimal;
  impuestos: Decimal;
  propina: Decimal;
  total: Decimal;
  notas: string | null;
  tipo: string; // 'local', 'para_llevar', 'domicilio'
  activo: boolean;
}
```

### 2. orden_detalle

Productos/items de cada orden.

```typescript
{
  id_detalle: number;
  id_orden: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: Decimal;
  subtotal: Decimal;
  notas: string | null;
  estado: string; // 'pendiente', 'preparando', 'listo'
  created_at: Date;
}
```

### 3. estados_orden

Catálogo de estados posibles.

```typescript
{
  id_estado_orden: number;
  nombre: string; // 'pendiente', 'preparando', 'listo', etc.
  descripcion: string;
  color: string; // Para UI: '#FFA500'
}
```

### 4. pagos

Registro de pagos de órdenes.

```typescript
{
  id_pago: number;
  id_orden: number;
  id_metodo_pago: number;
  monto: Decimal;
  monto_recibido: Decimal;
  cambio: Decimal;
  fecha_pago: Date;
  id_usuario: number;
  referencia: string | null; // Número de transacción
}
```

## Estructura del Módulo

```
src/ordenes/
├── ordenes.controller.ts     # Endpoints REST
├── ordenes.service.ts         # Lógica de negocio
├── ordenes.module.ts          # Configuración del módulo
├── dto/
│   ├── create-orden.dto.ts
│   ├── update-orden.dto.ts
│   ├── add-item.dto.ts
│   ├── cambiar-estado.dto.ts
│   └── procesar-pago.dto.ts
└── entities/
    └── orden.entity.ts        # (Opcional con TypeORM)
```

## Endpoints Principales

### GET /ordenes

Lista todas las órdenes con filtros.

**Query Params**:

- `estado`: Filtrar por estado
- `mesa`: Filtrar por mesa
- `fecha`: Filtrar por fecha
- `usuario`: Filtrar por cajero/mesero

**Roles**: Todos los autenticados

### POST /ordenes

Crear nueva orden.

**Roles**: Cajero, Mesero, Gerente, Administrador

**Body**:

```json
{
  "id_mesa": 5,
  "tipo": "local",
  "notas": "Cliente prefiere mesa cerca de ventana"
}
```

### GET /ordenes/:id

Obtener orden específica con todos sus detalles.

**Roles**: Todos los autenticados

**Response**:

```json
{
  "id_orden": 123,
  "numero_orden": "ORD-123",
  "mesa": {
    "numero": 5,
    "nombre": "Mesa 5",
    "area": "Terraza"
  },
  "items": [
    {
      "id_detalle": 456,
      "producto": "Tacos al Pastor",
      "cantidad": 3,
      "precio_unitario": 85.0,
      "subtotal": 255.0,
      "notas": "Sin cebolla"
    }
  ],
  "estado": {
    "nombre": "preparando",
    "color": "#FFA500"
  },
  "totales": {
    "subtotal": 255.0,
    "descuento": 0.0,
    "impuestos": 40.8,
    "propina": 30.0,
    "total": 325.8
  }
}
```

### POST /ordenes/:id/items

Agregar items a una orden existente.

**Roles**: Cajero, Mesero, Gerente, Administrador

**Body**:

```json
{
  "id_producto": 45,
  "cantidad": 2,
  "precio_unitario": 150.0,
  "notas": "Término medio"
}
```

### DELETE /ordenes/:id/items/:itemId

Eliminar un item de la orden.

**Restricción**: Solo items en estado "pendiente"

### PATCH /ordenes/:id/estado

Cambiar estado de la orden.

**Body**:

```json
{
  "id_estado_orden": 2,
  "notas": "Orden lista para entrega"
}
```

### POST /ordenes/:id/pagar

Procesar pago de una orden.

**Roles**: Cajero, Gerente, Administrador

**Body**:

```json
{
  "id_metodo_pago": 1,
  "monto_recibido": 500.0,
  "propina": 50.0
}
```

### GET /ordenes/activas

Obtener órdenes activas (no pagadas ni canceladas).

**Uso**: Para cocina, dashboard en tiempo real

### GET /ordenes/mesa/:numeroMesa

Obtener órdenes de una mesa específica.

**Uso**: Meseros para consultar cuenta de mesa

## Servicios Principales

### create(dto: CreateOrdenDto, userId: number)

Crea una nueva orden.

**Proceso**:

1. Validar que la mesa no tenga orden activa (opcional)
2. Generar número de orden consecutivo
3. Asignar estado inicial ("pendiente")
4. Registrar usuario que crea
5. Retornar orden creada

### addItem(ordenId: number, dto: AddItemDto)

Agrega un producto a la orden.

**Validaciones**:

- Orden debe estar en estado "pendiente"
- Producto debe existir y estar activo
- Cantidad > 0
- Precio no puede ser negativo

**Proceso**:

1. Validar orden y producto
2. Insertar item en `orden_detalle`
3. Recalcular totales de la orden
4. Retornar orden actualizada

### removeItem(ordenId: number, itemId: number)

Elimina un item de la orden.

**Validaciones**:

- Item debe pertenecer a la orden
- Item debe estar en estado "pendiente"

**Proceso**:

1. Eliminar item
2. Si era el último item, eliminar orden completa
3. Si no, recalcular totales

### cambiarEstado(ordenId: number, dto: CambiarEstadoDto, userId: number)

Cambia el estado de una orden.

**Validaciones**:

- Validar transición de estado permitida
- Ciertos cambios requieren roles específicos

**Proceso**:

1. Obtener estado actual
2. Validar transición
3. Actualizar estado
4. Actualizar timestamp correspondiente
5. Notificar si es necesario (cocina, mesero)

### procesarPago(ordenId: number, dto: ProcesarPagoDto, userId: number)

Procesa el pago de una orden.

**Validaciones**:

- Orden debe estar en estado "entregado"
- Monto recibido >= total orden

**Proceso**:

1. Validar orden lista para pago
2. Calcular cambio
3. Registrar pago en tabla `pagos`
4. Cambiar estado a "pagado"
5. Actualizar corte de caja actual
6. Generar recibo/ticket

### recalcularTotales(prisma: PrismaTransaction, ordenId: number)

Recalcula subtotal, impuestos y total.

**Fórmula**:

```typescript
subtotal = suma(items.subtotal);
impuestos = subtotal * 0.16; // IVA México
total = subtotal - descuento + impuestos + propina;
```

## DTOs (Data Transfer Objects)

### CreateOrdenDto

```typescript
export class CreateOrdenDto {
  @IsOptional()
  @IsInt()
  id_mesa?: number;

  @IsOptional()
  @IsInt()
  id_cliente?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;

  @IsEnum(['local', 'para_llevar', 'domicilio'])
  tipo: string = 'local';
}
```

### AddItemDto

```typescript
export class AddItemDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_unitario: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notas?: string;
}
```

### CambiarEstadoOrdenDto

```typescript
export class CambiarEstadoOrdenDto {
  @IsInt()
  @Min(1)
  id_estado_orden: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}
```

### ProcesarPagoDto

```typescript
export class ProcesarPagoDto {
  @IsInt()
  @Min(1)
  id_metodo_pago: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  monto_recibido: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  propina?: number;
}
```

## Transacciones Críticas

Operaciones que deben ejecutarse en transacción:

1. **Agregar Item + Recalcular Totales**
2. **Eliminar Item + Recalcular Totales**
3. **Procesar Pago + Actualizar Corte + Cambiar Estado**
4. **Cancelar Orden + Liberar Mesa**

```typescript
// Ejemplo
return this.prisma.$transaction(async (tx) => {
  const item = await tx.orden_detalle.create({ data: itemData });
  await this.recalcularTotales(tx, ordenId);
  return item;
});
```

## Caché con Redis

### Consultas cacheadas:

- `GET /ordenes/activas`: TTL 30 segundos
- `GET /ordenes/:id`: TTL 60 segundos

### Invalidación:

- Al crear/modificar/eliminar orden
- Al cambiar estado
- Al agregar/quitar items

```typescript
@CacheKey('ordenes-activas')
@CacheTTL(30)
async findActivas() {
  // ...
}

// Invalidar caché
await this.cacheManager.del('ordenes-activas');
```

## Eventos y Notificaciones

| Evento          | Trigger                       | Destino | Método    |
| --------------- | ----------------------------- | ------- | --------- |
| orden_creada    | `cambiarEstado('preparando')` | Cocina  | WebSocket |
| orden_lista     | `cambiarEstado('listo')`      | Mesero  | WebSocket |
| orden_cancelada | `cambiarEstado('cancelado')`  | Gerente | Email     |
| pago_procesado  | `procesarPago()`              | Sistema | Log       |

## Testing

### Unit Tests

- `recalcularTotales()`: Validar cálculos
- `validarTransicionEstado()`: Lógica de estados
- `procesarPago()`: Cálculo de cambio

### E2E Tests

- Flujo completo: crear → agregar items → cambiar estados → pagar
- Validaciones de roles
- Manejo de errores

```bash
pnpm test ordenes.service.spec.ts
pnpm test:e2e ordenes.e2e-spec.ts
```

## Métricas y KPIs

### Consultas útiles:

**Tiempo promedio por orden**:

```sql
SELECT AVG(EXTRACT(EPOCH FROM (fecha_hora_pago - fecha_hora_creacion)) / 60)
FROM ordenes
WHERE fecha_hora_pago IS NOT NULL;
```

**Ticket promedio**:

```sql
SELECT AVG(total) FROM ordenes WHERE id_estado_orden = 6;
```

**Órdenes por hora**:

```sql
SELECT EXTRACT(HOUR FROM fecha_hora_creacion) as hora, COUNT(*)
FROM ordenes
GROUP BY hora
ORDER BY hora;
```

## Troubleshooting

**Problema**: Totales no cuadran

**Solución**:

```typescript
await ordenesService.recalcularTotales(ordenId);
```

**Problema**: No se puede cancelar orden

**Solución**: Verificar estado actual y permisos del usuario

**Problema**: Pago no se registra en corte

**Solución**: Verificar que haya un corte abierto para el cajero
