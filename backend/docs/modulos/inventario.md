# Módulo de Inventario

## Descripción

El módulo de inventario gestiona el control de existencias, compras, movimientos y alertas de stock para todos los productos e insumos del restaurante.

## Entidades Principales

### 1. compras

```typescript
{
  id_compra: number;
  folio: string; // AUTO: COMP-2025-001
  id_proveedor: number;
  fecha_compra: Date;
  fecha_recepcion: Date | null;
  fecha_pago: Date | null;
  subtotal: Decimal;
  impuestos: Decimal;
  total: Decimal;
  estado: string; // 'pendiente', 'recibido', 'pagado', 'cancelado'
  id_usuario_registro: number;
  notas: string | null;
  created_at: Date;
  updated_at: Date;
}
```

### 2. detalle_compra

```typescript
{
  id_detalle: number;
  id_compra: number;
  id_producto: number;
  cantidad_solicitada: number;
  cantidad_recibida: number | null;
  precio_unitario: Decimal;
  subtotal: Decimal;
  notas: string | null;
}
```

### 3. movimientos_inventario

```typescript
{
  id_movimiento: number;
  id_producto: number;
  tipo: string; // 'entrada', 'salida', 'ajuste'
  motivo: string; // 'compra', 'venta', 'merma', 'ajuste'
  cantidad: number;
  cantidad_anterior: number;
  cantidad_nueva: number;
  costo_unitario: Decimal | null;
  referencia: string | null; // ID de documento relacionado
  id_usuario: number;
  fecha_movimiento: Date;
  notas: string | null;
}
```

### 4. mermas

```typescript
{
  id_merma: number;
  id_producto: number;
  cantidad: number;
  motivo: string; // 'caducado', 'dañado', 'contaminado'
  costo_total: Decimal;
  responsable: string;
  fecha_registro: Date;
  id_usuario_registro: number;
  notas: string | null;
}
```

## Estructura del Módulo

```
src/inventario/
├── inventario.controller.ts
├── inventario.service.ts
├── inventario.module.ts
├── compras/
│   ├── compras.controller.ts
│   ├── compras.service.ts
│   └── dto/
├── movimientos/
│   ├── movimientos.controller.ts
│   └── movimientos.service.ts
└── dto/
    ├── create-compra.dto.ts
    ├── recibir-compra.dto.ts
    ├── ajustar-stock.dto.ts
    └── registrar-merma.dto.ts
```

## Endpoints - Compras

### GET /compras

Listar todas las compras.

**Query Params**:

- `estado`: Filtrar por estado
- `proveedor`: ID del proveedor
- `fecha_inicio`: Fecha inicial
- `fecha_fin`: Fecha final

**Roles**: Gerente, Administrador

### POST /compras

Crear orden de compra.

**Roles**: Gerente, Administrador

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
    },
    {
      "id_producto": 15,
      "cantidad": 30,
      "precio_unitario": 15.5
    }
  ],
  "notas": "Entrega urgente para el fin de semana"
}
```

**Response**:

```json
{
  "id_compra": 45,
  "folio": "COMP-2025-045",
  "estado": "pendiente",
  "subtotal": 1715.0,
  "impuestos": 274.4,
  "total": 1989.4,
  "proveedor": {
    "nombre": "Abarrotes del Centro",
    "contacto": "555-1234"
  }
}
```

### PATCH /compras/:id/recibir

Registrar recepción de mercancía.

**Roles**: Gerente, Administrador

**Body**:

```json
{
  "fecha_recepcion": "2025-10-10",
  "items_recibidos": [
    {
      "id_detalle": 89,
      "cantidad_recibida": 50
    },
    {
      "id_detalle": 90,
      "cantidad_recibida": 28
    }
  ],
  "notas": "Faltaron 2 unidades del segundo producto"
}
```

**Proceso**:

1. Validar que compra esté en estado "pendiente"
2. Actualizar cantidades recibidas
3. Registrar discrepancias si las hay
4. Actualizar stock de productos
5. Crear movimientos de inventario
6. Cambiar estado a "recibido"

### POST /compras/:id/pagar

Registrar pago de compra.

**Roles**: Gerente, Administrador

**Body**:

```json
{
  "fecha_pago": "2025-10-15",
  "metodo_pago": "transferencia",
  "referencia": "TRF-12345",
  "monto": 1989.4
}
```

### GET /compras/:id

Obtener detalle de compra.

**Response**:

```json
{
  "id_compra": 45,
  "folio": "COMP-2025-045",
  "proveedor": {
    "nombre": "Abarrotes del Centro",
    "rfc": "ABC123456789"
  },
  "fecha_compra": "2025-10-08",
  "fecha_recepcion": "2025-10-10",
  "estado": "recibido",
  "items": [
    {
      "producto": "Tomate",
      "cantidad_solicitada": 50,
      "cantidad_recibida": 50,
      "precio_unitario": 25.0,
      "subtotal": 1250.0
    },
    {
      "producto": "Cebolla",
      "cantidad_solicitada": 30,
      "cantidad_recibida": 28,
      "precio_unitario": 15.5,
      "subtotal": 434.0,
      "discrepancia": -2
    }
  ],
  "totales": {
    "subtotal": 1684.0,
    "impuestos": 269.44,
    "total": 1953.44
  }
}
```

## Endpoints - Stock y Movimientos

### GET /inventario/stock

Consultar stock actual de productos.

**Query Params**:

- `categoria`: Filtrar por categoría
- `bajo_minimo`: Solo productos bajo stock mínimo
- `proveedor`: Productos de proveedor específico

**Roles**: Todos los autenticados

**Response**:

```json
{
  "productos": [
    {
      "id_producto": 12,
      "nombre": "Tomate",
      "stock_actual": 45,
      "stock_minimo": 30,
      "unidad": "kg",
      "estado_stock": "normal",
      "dias_inventario": 15,
      "ultimo_movimiento": "2025-10-08T10:30:00Z",
      "proveedor_principal": "Abarrotes del Centro"
    },
    {
      "id_producto": 8,
      "nombre": "Cerveza Corona",
      "stock_actual": 15,
      "stock_minimo": 30,
      "unidad": "pieza",
      "estado_stock": "bajo",
      "alerta": true,
      "dias_inventario": 3
    }
  ]
}
```

### POST /inventario/ajuste

Realizar ajuste de inventario.

**Roles**: Gerente, Administrador

**Body**:

```json
{
  "id_producto": 12,
  "cantidad_nueva": 42,
  "motivo": "Inventario físico mensual",
  "notas": "Diferencia encontrada en conteo"
}
```

**Validaciones**:

- Requiere justificación si diferencia > 10%
- Ajustes significativos requieren autorización

### POST /inventario/merma

Registrar merma de producto.

**Roles**: Gerente, Administrador

**Body**:

```json
{
  "id_producto": 8,
  "cantidad": 5,
  "motivo": "caducado",
  "responsable": "Juan Pérez",
  "notas": "Producto venció el 2025-10-05"
}
```

### GET /inventario/movimientos

Historial de movimientos.

**Query Params**:

- `producto`: ID del producto
- `tipo`: 'entrada', 'salida', 'ajuste'
- `fecha_inicio`: Fecha inicial
- `fecha_fin`: Fecha final

**Response**:

```json
{
  "movimientos": [
    {
      "id_movimiento": 456,
      "fecha": "2025-10-08T14:30:00Z",
      "tipo": "entrada",
      "motivo": "compra",
      "producto": "Tomate",
      "cantidad": 50,
      "cantidad_anterior": 20,
      "cantidad_nueva": 70,
      "costo_unitario": 25.0,
      "usuario": "María López",
      "referencia": "COMP-2025-045"
    }
  ],
  "resumen": {
    "total_entradas": 150,
    "total_salidas": 85,
    "diferencia_neta": 65
  }
}
```

### GET /inventario/alertas

Productos con alertas de stock.

**Tipos de alertas**:

- Stock bajo
- Stock crítico
- Sin movimiento (30+ días)
- Próximo a caducar

**Response**:

```json
{
  "alertas": [
    {
      "tipo": "stock_bajo",
      "severidad": "media",
      "producto": "Cerveza Corona",
      "stock_actual": 15,
      "stock_minimo": 30,
      "accion_sugerida": "Realizar pedido de 50 unidades"
    },
    {
      "tipo": "sin_movimiento",
      "severidad": "baja",
      "producto": "Postre Especial",
      "dias_sin_movimiento": 45,
      "accion_sugerida": "Revisar menú o promocionar"
    }
  ]
}
```

## Endpoints - Reportes

### GET /inventario/reportes/existencias

Reporte valorizado de inventario.

**Response**:

```json
{
  "fecha_reporte": "2025-10-08",
  "resumen": {
    "productos_total": 125,
    "valor_total": 245680.5,
    "productos_bajo_stock": 8,
    "productos_sin_stock": 2
  },
  "por_categoria": [
    {
      "categoria": "Bebidas",
      "productos": 35,
      "valor": 85230.0,
      "porcentaje": "34.7%"
    }
  ],
  "clasificacion_abc": {
    "clase_a": {
      "productos": 25,
      "valor": 196544.4,
      "porcentaje": "80%"
    }
  }
}
```

### GET /inventario/reportes/movimientos

Análisis de movimientos por período.

### GET /inventario/reportes/mermas

Reporte de mermas y pérdidas.

**Response**:

```json
{
  "periodo": "mes_actual",
  "totales": {
    "cantidad_items": 45,
    "costo_total": 5680.0,
    "porcentaje_ventas": "2.3%"
  },
  "por_motivo": [
    {
      "motivo": "caducado",
      "cantidad": 25,
      "costo": 3200.0,
      "porcentaje": "56.3%"
    }
  ],
  "productos_mas_afectados": [
    {
      "producto": "Lechuga",
      "cantidad_mermas": 12,
      "costo_total": 840.0
    }
  ]
}
```

## Servicios Principales

### crearCompra(dto: CreateCompraDto, userId: number)

Crea orden de compra.

**Proceso**:

1. Validar proveedor
2. Validar productos
3. Crear compra con estado "pendiente"
4. Crear detalles de compra
5. Calcular totales
6. Generar folio consecutivo

### recibirMercancia(compraId: number, dto: RecibirCompraDto)

Registra recepción de mercancía.

**Proceso**:

1. Validar estado de compra
2. Actualizar cantidades recibidas
3. Comparar con cantidades solicitadas
4. Registrar discrepancias
5. Actualizar stock por cada producto
6. Crear movimientos de inventario tipo "entrada"
7. Cambiar estado a "recibido"

### ajustarStock(dto: AjustarStockDto, userId: number)

Ajusta inventario manualmente.

**Validaciones**:

- Producto existe
- Nueva cantidad >= 0
- Si diferencia > 10%, requiere autorización

**Proceso**:

1. Obtener stock actual
2. Calcular diferencia
3. Validar autorización si aplica
4. Actualizar stock
5. Crear movimiento tipo "ajuste"
6. Registrar en log de auditoría

### registrarMerma(dto: RegistrarMermaDto, userId: number)

Registra pérdida de producto.

**Proceso**:

1. Validar stock suficiente
2. Reducir stock
3. Crear registro de merma
4. Crear movimiento tipo "salida - merma"
5. Calcular costo de la merma

### calcularValorInventario()

Calcula valor total del inventario.

**Métodos**:

- PEPS (Primero en Entrar, Primero en Salir)
- Costo Promedio Ponderado

### generarSugerenciaCompra(productoId: number)

Sugiere cantidad a pedir basado en:

- Demanda histórica
- Stock actual
- Tiempo de entrega del proveedor
- Stock de seguridad

```typescript
calcularSugerenciaCompra(producto: Producto) {
  const demandaDiaria = producto.ventas_ultimos_30_dias / 30;
  const tiempoEntrega = producto.proveedor.dias_entrega;
  const stockSeguridad = demandaDiaria * 3; // 3 días de seguridad
  const puntoReorden = (demandaDiaria * tiempoEntrega) + stockSeguridad;

  if (producto.stock_actual <= puntoReorden) {
    const cantidadSugerida = Math.ceil(
      (demandaDiaria * 30) - producto.stock_actual
    );

    return {
      debe_ordenar: true,
      cantidad_sugerida: cantidadSugerida,
      urgencia: producto.stock_actual < stockSeguridad ? 'alta' : 'normal'
    };
  }

  return { debe_ordenar: false };
}
```

## DTOs

### CreateCompraDto

```typescript
export class CreateCompraDto {
  @IsInt()
  @Min(1)
  id_proveedor: number;

  @IsDateString()
  fecha_compra: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemCompraDto)
  items: ItemCompraDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;
}

export class ItemCompraDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsInt()
  @Min(1)
  cantidad: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio_unitario: number;
}
```

### AjustarStockDto

```typescript
export class AjustarStockDto {
  @IsInt()
  @Min(1)
  id_producto: number;

  @IsInt()
  @Min(0)
  cantidad_nueva: number;

  @IsString()
  @MinLength(5)
  motivo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas?: string;

  @IsOptional()
  @IsBoolean()
  autorizado?: boolean;
}
```

## Reglas de Negocio

### 1. No Stock Negativo

```typescript
if (producto.stock_actual - cantidad < 0) {
  throw new BadRequestException('Stock insuficiente');
}
```

### 2. Compra Debe Recibirse Antes de Pagar

```typescript
if (compra.estado !== 'recibido') {
  throw new BadRequestException('Debe recibir la mercancía antes de pagar');
}
```

### 3. Ajustes Significativos

```typescript
const diferencia = Math.abs(nuevaCantidad - stockActual);
const porcentaje = (diferencia / stockActual) * 100;

if (porcentaje > 10 && !dto.autorizado) {
  throw new BadRequestException('Ajuste >10% requiere autorización');
}
```

## Caché con Redis

```typescript
// Stock actual - caché corto
@CacheKey('stock-productos')
@CacheTTL(60) // 1 minuto
async getStock() {}

// Alertas - caché medio
@CacheKey('alertas-stock')
@CacheTTL(300) // 5 minutos
async getAlertas() {}

// Invalidar al actualizar stock
await this.cacheManager.del('stock-productos');
await this.cacheManager.del('alertas-stock');
```

## Testing

```typescript
describe('InventarioService', () => {
  it('debe actualizar stock al recibir compra', async () => {
    const stockInicial = 20;
    const cantidadRecibida = 50;

    await service.recibirMercancia(compraId, dto);

    const producto = await service.getStock(productoId);
    expect(producto.stock_actual).toBe(70);
  });

  it('debe registrar movimiento al ajustar', async () => {
    await service.ajustarStock(dto, userId);

    const movimientos = await service.getMovimientos(productoId);
    expect(movimientos[0].tipo).toBe('ajuste');
  });
});
```

## Troubleshooting

**Stock no se actualiza**: Verificar transacciones completas

**Diferencias en inventario físico**: Ejecutar conteo manual y ajustar

**Alertas no se generan**: Verificar `stock_minimo` configurado
