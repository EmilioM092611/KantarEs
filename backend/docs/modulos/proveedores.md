# Módulo de Proveedores

## Descripción

El módulo de proveedores gestiona la información de todos los suplidores del restaurante, su historial de compras, evaluación de desempeño y análisis de costos.

## Entidad Principal

### proveedores

```typescript
{
  id_proveedor: number;
  nombre: string;
  nombre_comercial: string | null;
  rfc: string;
  direccion: string | null;
  ciudad: string | null;
  estado: string | null;
  codigo_postal: string | null;
  telefono: string | null;
  email: string | null;
  nombre_contacto: string | null;
  telefono_contacto: string | null;
  dias_credito: number; // Días de crédito otorgados
  limite_credito: Decimal | null;
  calificacion: number | null; // 1-5 estrellas
  activo: boolean;
  notas: string | null;
  created_at: Date;
  updated_at: Date;
}
```

## Estructura del Módulo

```
src/proveedores/
├── proveedores.controller.ts
├── proveedores.service.ts
├── proveedores.module.ts
└── dto/
    ├── create-proveedor.dto.ts
    ├── update-proveedor.dto.ts
    └── evaluar-proveedor.dto.ts
```

## Endpoints Principales

### GET /proveedores

Listar todos los proveedores.

**Query Params**:

- `activo`: Filtrar por estado
- `buscar`: Búsqueda por nombre o RFC
- `calificacion_min`: Calificación mínima

**Roles**: Gerente, Administrador, Cajero (solo lectura)

**Response**:

```json
{
  "proveedores": [
    {
      "id_proveedor": 5,
      "nombre": "Abarrotes del Centro S.A. de C.V.",
      "nombre_comercial": "Abarrotes del Centro",
      "rfc": "ABC123456XYZ",
      "telefono": "555-1234",
      "email": "ventas@abarrotes.com",
      "calificacion": 4.5,
      "activo": true,
      "estadisticas": {
        "compras_totales": 45,
        "monto_total": 125680.5,
        "ultima_compra": "2025-10-05"
      }
    }
  ]
}
```

### GET /proveedores/:id

Obtener proveedor específico con detalles completos.

**Response**:

```json
{
  "id_proveedor": 5,
  "nombre": "Abarrotes del Centro S.A. de C.V.",
  "nombre_comercial": "Abarrotes del Centro",
  "rfc": "ABC123456XYZ",
  "direccion": "Av. Principal 123",
  "ciudad": "Querétaro",
  "estado": "Querétaro",
  "codigo_postal": "76000",
  "contacto": {
    "nombre": "Juan Pérez",
    "telefono": "555-5678",
    "email": "juan.perez@abarrotes.com"
  },
  "terminos_comerciales": {
    "dias_credito": 30,
    "limite_credito": 50000.0,
    "dias_entrega_promedio": 3
  },
  "calificacion": 4.5,
  "productos_que_surte": [
    {
      "id_producto": 12,
      "nombre": "Tomate",
      "precio_actual": 25.0,
      "es_preferido": true
    },
    {
      "id_producto": 15,
      "nombre": "Cebolla",
      "precio_actual": 15.5,
      "es_preferido": false
    }
  ],
  "estadisticas": {
    "compras_totales": 45,
    "monto_acumulado": 125680.5,
    "promedio_compra": 2792.9,
    "tiempo_entrega_promedio": 3,
    "porcentaje_entregas_tiempo": 92,
    "ultima_compra": "2025-10-05"
  }
}
```

### POST /proveedores

Crear nuevo proveedor.

**Roles**: Gerente, Administrador

**Body**:

```json
{
  "nombre": "Frutas y Verduras La Esperanza",
  "nombre_comercial": "La Esperanza",
  "rfc": "FVE890123ABC",
  "direccion": "Mercado Central Local 45",
  "ciudad": "Querétaro",
  "estado": "Querétaro",
  "codigo_postal": "76000",
  "telefono": "555-9876",
  "email": "ventas@laesperanza.com",
  "nombre_contacto": "María González",
  "telefono_contacto": "555-4321",
  "dias_credito": 15,
  "limite_credito": 25000.0,
  "notas": "Especialistas en productos orgánicos"
}
```

**Validaciones**:

- RFC único
- Email válido (si se proporciona)
- Días de crédito >= 0
- Límite de crédito >= 0

### PATCH /proveedores/:id

Actualizar proveedor.

**Roles**: Gerente, Administrador

**Body** (campos opcionales):

```json
{
  "telefono": "555-9999",
  "dias_credito": 45,
  "calificacion": 5.0,
  "activo": true
}
```

### DELETE /proveedores/:id

Desactivar proveedor (soft delete).

**Roles**: Administrador

**Proceso**:

- No elimina físicamente
- Cambia `activo = false`
- Mantiene historial de compras

### GET /proveedores/buscar/rfc/:rfc

Buscar proveedor por RFC.

**Uso**: Validar antes de crear nuevo proveedor

### GET /proveedores/:id/historial-compras

Obtener historial de compras de un proveedor.

**Query Params**:

- `fecha_inicio`: Fecha inicial
- `fecha_fin`: Fecha final
- `estado`: Filtrar por estado de compra

**Response**:

```json
{
  "proveedor": "Abarrotes del Centro",
  "periodo": {
    "inicio": "2025-01-01",
    "fin": "2025-10-08"
  },
  "compras": [
    {
      "folio": "COMP-2025-045",
      "fecha": "2025-10-08",
      "total": 1989.4,
      "estado": "pagado",
      "items_count": 5,
      "dias_para_pago": 15
    }
  ],
  "resumen": {
    "compras_periodo": 12,
    "monto_total": 35680.0,
    "promedio_compra": 2973.33,
    "pendiente_pago": 5680.0
  }
}
```

### GET /proveedores/:id/estadisticas

Obtener estadísticas detalladas del proveedor.

**Response**:

```json
{
  "desempeño": {
    "entregas_tiempo": 92,
    "entregas_tarde": 5,
    "entregas_canceladas": 3,
    "calidad_productos": 4.5,
    "tiempo_respuesta": "2 horas promedio"
  },
  "financiero": {
    "credito_disponible": 35000.0,
    "credito_utilizado": 15000.0,
    "dias_pago_promedio": 28,
    "descuentos_obtenidos": 2340.0
  },
  "tendencias": {
    "compras_por_mes": [
      { "mes": "Enero", "compras": 4, "monto": 8920.0 },
      { "mes": "Febrero", "compras": 5, "monto": 10250.0 }
    ]
  }
}
```

### POST /proveedores/:id/evaluar

Calificar desempeño del proveedor.

**Roles**: Gerente, Administrador

**Body**:

```json
{
  "calificacion": 4.5,
  "aspectos": {
    "calidad_productos": 5,
    "tiempo_entrega": 4,
    "atencion_cliente": 5,
    "precios": 4
  },
  "comentarios": "Excelente calidad, entregas ocasionalmente retrasadas"
}
```

### GET /proveedores/comparar

Comparar precios entre proveedores.

**Query Params**:

- `id_producto`: ID del producto a comparar

**Response**:

```json
{
  "producto": "Tomate",
  "comparativa": [
    {
      "proveedor": "Abarrotes del Centro",
      "precio": 25.0,
      "calificacion": 4.5,
      "tiempo_entrega": 3,
      "preferido": true
    },
    {
      "proveedor": "La Esperanza",
      "precio": 23.5,
      "calificacion": 4.0,
      "tiempo_entrega": 2,
      "preferido": false
    }
  ],
  "recomendacion": {
    "mejor_precio": "La Esperanza",
    "mejor_calidad": "Abarrotes del Centro",
    "mas_rapido": "La Esperanza"
  }
}
```

## Servicios Principales

### create(dto: CreateProveedorDto, userId: number)

Crea nuevo proveedor.

**Validaciones**:

- RFC único
- Email único (si se proporciona)
- Datos de contacto válidos

**Proceso**:

1. Validar datos
2. Verificar RFC único
3. Crear proveedor
4. Registrar en log de auditoría

### update(id: number, dto: UpdateProveedorDto, userId: number)

Actualiza información del proveedor.

### findOne(id: number)

Obtiene proveedor con toda su información.

**Incluye**:

- Datos completos
- Productos que surte
- Estadísticas
- Última compra

### getHistorialCompras(id: number, filtros: FiltrosDto)

Obtiene historial de compras.

**Análisis incluido**:

- Frecuencia de compra
- Monto promedio
- Tiempo de pago
- Productos más comprados

### getEstadisticas(id: number)

Calcula estadísticas de desempeño.

**Métricas**:

- Porcentaje de entregas a tiempo
- Tiempo promedio de entrega
- Calificación promedio
- Cumplimiento de órdenes

### compararPrecios(productoId: number)

Compara precios del mismo producto entre proveedores.

**Criterios**:

- Precio unitario
- Calificación del proveedor
- Tiempo de entrega
- Historial de cumplimiento

### evaluarProveedor(id: number, dto: EvaluarProveedorDto)

Registra evaluación de desempeño.

**Proceso**:

1. Validar calificaciones (1-5)
2. Calcular promedio ponderado
3. Actualizar calificación general
4. Registrar evaluación con timestamp

## DTOs

### CreateProveedorDto

```typescript
export class CreateProveedorDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre_comercial?: string;

  @IsString()
  @Length(12, 13)
  @Matches(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/, {
    message: 'RFC inválido',
  })
  rfc: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ciudad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  telefono?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsInt()
  @Min(0)
  @Max(90)
  dias_credito: number = 0;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  limite_credito?: number;
}
```

### EvaluarProveedorDto

```typescript
export class EvaluarProveedorDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  calidad_productos: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  tiempo_entrega: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  atencion_cliente: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  precios: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comentarios?: string;
}
```

## Reglas de Negocio

### 1. RFC Único

```typescript
const existente = await prisma.proveedores.findUnique({
  where: { rfc: dto.rfc },
});

if (existente) {
  throw new ConflictException('RFC ya registrado');
}
```

### 2. Crédito Disponible

```typescript
const creditoUtilizado = await calcularCreditoUtilizado(proveedorId);
const creditoDisponible = proveedor.limite_credito - creditoUtilizado;

if (montoCompra > creditoDisponible) {
  throw new BadRequestException('Excede límite de crédito');
}
```

### 3. Proveedor Inactivo

```typescript
if (!proveedor.activo) {
  throw new BadRequestException(
    'No se pueden crear compras con proveedores inactivos',
  );
}
```

### 4. Evaluación Automática

```typescript
// Al completar cada compra
const evaluacion = calcularEvaluacionAutomatica(compra);
await actualizarCalificacion(proveedor.id, evaluacion);
```

## Análisis y Reportes

### Ranking de Proveedores

```typescript
getRankingProveedores() {
  return prisma.proveedores.findMany({
    where: { activo: true },
    select: {
      nombre: true,
      calificacion: true,
      _count: { compras: true }
    },
    orderBy: {
      calificacion: 'desc'
    },
    take: 10
  });
}
```

### Análisis de Costos

```typescript
analizarCostos(periodo: string) {
  // Proveedores más económicos
  // Proveedores más caros
  // Ahorro potencial
  // Recomendaciones de consolidación
}
```

### Dependencia de Proveedores

```typescript
analizarDependencia() {
  // % de compras por proveedor
  // Productos exclusivos de cada proveedor
  // Riesgo de dependencia
  // Diversificación recomendada
}
```

## Integración con Otros Módulos

### Con Compras

- Validar proveedor activo
- Verificar límite de crédito
- Calcular días de entrega estimados

### Con Inventario

- Sugerir proveedor para reorden
- Comparar precios históricos
- Analizar confiabilidad

### Con Finanzas

- Cuentas por pagar
- Análisis de flujo de caja
- Proyecciones de pago

## Caché con Redis

```typescript
// Lista de proveedores activos
@CacheKey('proveedores-activos')
@CacheTTL(3600) // 1 hora
async findActivos() {}

// Estadísticas por proveedor
@CacheKey(`proveedor-stats-${id}`)
@CacheTTL(1800) // 30 minutos
async getEstadisticas(id: number) {}

// Invalidar al actualizar
await this.cacheManager.del('proveedores-activos');
await this.cacheManager.del(`proveedor-stats-${id}`);
```

## Testing

```typescript
describe('ProveedoresService', () => {
  it('debe validar RFC único', async () => {
    await expect(service.create(dtoConRFCDuplicado)).rejects.toThrow(
      'RFC ya registrado',
    );
  });

  it('debe calcular estadísticas correctamente', async () => {
    const stats = await service.getEstadisticas(proveedorId);

    expect(stats.compras_totales).toBeDefined();
    expect(stats.monto_acumulado).toBeGreaterThan(0);
  });

  it('debe actualizar calificación al evaluar', async () => {
    await service.evaluarProveedor(id, evaluacionDto);

    const proveedor = await service.findOne(id);
    expect(proveedor.calificacion).toBe(4.5);
  });
});
```

## KPIs de Proveedores

### Métricas Clave

1. **OTD (On-Time Delivery)**

   ```typescript
   OTD = (entregas_a_tiempo / total_entregas) * 100;
   ```

2. **Calidad de Producto**

   ```typescript
   Calidad = promedio(calificaciones_producto);
   ```

3. **Costo por Pedido**

   ```typescript
   CostoPorPedido = sum(totales_compras) / count(compras);
   ```

4. **Cumplimiento de Crédito**
   ```typescript
   Cumplimiento = (pagos_a_tiempo / total_pagos) * 100;
   ```

## Troubleshooting

**RFC inválido**: Verificar formato correcto (12-13 caracteres)

**No se puede crear compra**: Verificar que proveedor esté activo

**Estadísticas incorrectas**: Ejecutar recalculo manual de métricas

**Crédito excedido**: Revisar compras pendientes de pago
