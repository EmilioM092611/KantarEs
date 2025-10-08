# Módulo de Productos

## Descripción

El módulo de productos (`productos`) gestiona el catálogo completo del restaurante, incluyendo platillos, bebidas, entradas, postres y todo item vendible.

## Entidades Principales

### 1. productos

```typescript
{
  id_producto: number;
  nombre: string;
  descripcion: string | null;
  precio: Decimal;
  id_categoria: number;
  sku: string | null; // Código único del producto
  imagen_url: string | null;
  disponible: boolean; // Si está disponible para venta
  stock_actual: number; // Cantidad en inventario
  stock_minimo: number; // Alerta de stock bajo
  unidad_medida: string; // 'pieza', 'kg', 'litro', etc.
  tiempo_preparacion: number | null; // Minutos
  costo: Decimal; // Costo de producción/compra
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### 2. categorias

```typescript
{
  id_categoria: number;
  nombre: string; // 'Entradas', 'Platillos Fuertes', 'Bebidas'
  descripcion: string | null;
  color: string | null; // Para UI
  icono: string | null; // Nombre del icono
  orden: number; // Para ordenar en menú
  activo: boolean;
}
```

### 3. modificadores (Opcional - Para personalización)

```typescript
{
  id_modificador: number;
  id_producto: number;
  nombre: string; // 'Sin cebolla', 'Extra queso'
  precio_adicional: Decimal;
  tipo: string; // 'opcional', 'requerido'
}
```

## Estructura del Módulo

```
src/productos/
├── productos.controller.ts
├── productos.service.ts
├── productos.module.ts
├── dto/
│   ├── create-producto.dto.ts
│   ├── update-producto.dto.ts
│   ├── create-categoria.dto.ts
│   └── filtrar-productos.dto.ts
└── interfaces/
    └── producto-con-categoria.interface.ts
```

## Endpoints Principales

### GET /productos

Lista todos los productos con filtros.

**Query Params**:

- `categoria`: Filtrar por categoría
- `disponible`: Solo productos disponibles
- `buscar`: Búsqueda por nombre
- `precio_min`: Precio mínimo
- `precio_max`: Precio máximo

**Roles**: Todos los autenticados

**Response**:

```json
{
  "productos": [
    {
      "id_producto": 12,
      "nombre": "Tacos al Pastor",
      "descripcion": "3 tacos con carne al pastor, piña y cilantro",
      "precio": 85.0,
      "categoria": {
        "nombre": "Platillos Fuertes",
        "color": "#FF6B6B"
      },
      "disponible": true,
      "stock_actual": 50,
      "imagen_url": "/images/tacos-pastor.jpg"
    }
  ],
  "total": 45,
  "pagina": 1,
  "por_pagina": 20
}
```

### GET /productos/:id

Obtener producto específico.

**Response**:

```json
{
  "id_producto": 12,
  "nombre": "Tacos al Pastor",
  "descripcion": "3 tacos con carne al pastor, piña y cilantro",
  "precio": 85.0,
  "costo": 35.0,
  "margen": "58.82%",
  "categoria": {
    "id_categoria": 3,
    "nombre": "Platillos Fuertes"
  },
  "disponible": true,
  "stock_actual": 50,
  "stock_minimo": 20,
  "unidad_medida": "porción",
  "tiempo_preparacion": 15,
  "modificadores": [
    {
      "nombre": "Sin cebolla",
      "precio_adicional": 0.0
    },
    {
      "nombre": "Extra pastor",
      "precio_adicional": 25.0
    }
  ],
  "estadisticas": {
    "ventas_mes": 450,
    "ingresos_mes": 38250.0
  }
}
```

### POST /productos

Crear nuevo producto.

**Roles**: Gerente, Administrador

**Body**:

```json
{
  "nombre": "Quesadillas de Flor de Calabaza",
  "descripcion": "3 quesadillas hechas a mano",
  "precio": 75.0,
  "costo": 28.0,
  "id_categoria": 3,
  "sku": "QFCAL-001",
  "stock_minimo": 30,
  "unidad_medida": "porción",
  "tiempo_preparacion": 12
}
```

**Validaciones**:

- Nombre único
- Precio > costo
- Categoría válida
- Stock mínimo >= 0

### PATCH /productos/:id

Actualizar producto.

**Roles**: Gerente, Administrador

**Body** (campos opcionales):

```json
{
  "precio": 90.0,
  "disponible": false,
  "stock_minimo": 25
}
```

### DELETE /productos/:id

Eliminar (soft delete) producto.

**Roles**: Administrador

**Proceso**:

- No elimina físicamente
- Cambia `activo = false`
- Mantiene histórico de ventas

### GET /productos/categorias

Listar categorías.

**Response**:

```json
{
  "categorias": [
    {
      "id_categoria": 1,
      "nombre": "Entradas",
      "productos_count": 12,
      "color": "#4ECDC4",
      "icono": "utensils"
    },
    {
      "id_categoria": 2,
      "nombre": "Bebidas",
      "productos_count": 25,
      "color": "#95E1D3",
      "icono": "coffee"
    }
  ]
}
```

### POST /productos/categorias

Crear categoría.

**Roles**: Gerente, Administrador

### GET /productos/mas-vendidos

Top productos más vendidos.

**Query Params**:

- `periodo`: 'dia', 'semana', 'mes'
- `limite`: Cantidad de productos (default: 10)

**Response**:

```json
{
  "periodo": "mes",
  "productos": [
    {
      "id_producto": 12,
      "nombre": "Tacos al Pastor",
      "ventas": 450,
      "ingresos": 38250.0,
      "porcentaje_ventas": "15.2%"
    }
  ]
}
```

### GET /productos/bajo-stock

Productos con stock bajo el mínimo.

**Roles**: Gerente, Administrador

**Response**:

```json
{
  "productos": [
    {
      "id_producto": 8,
      "nombre": "Cerveza Corona",
      "stock_actual": 15,
      "stock_minimo": 30,
      "diferencia": -15,
      "alerta": "critico"
    }
  ]
}
```

## Servicios Principales

### findAll(filtros: FiltrarProductosDto)

Lista productos con filtros y paginación.

**Características**:

- Búsqueda por nombre (case-insensitive)
- Filtro por categoría
- Filtro por disponibilidad
- Rango de precios
- Ordenamiento (precio, nombre, ventas)
- Paginación

### findOne(id: number)

Obtiene producto con toda su información.

**Incluye**:

- Datos básicos
- Categoría
- Modificadores
- Estadísticas de ventas
- Cálculo de margen

### create(dto: CreateProductoDto, userId: number)

Crea nuevo producto.

**Validaciones**:

- SKU único (si se proporciona)
- Nombre único por categoría
- Precio >= costo
- Categoría existe

**Proceso**:

1. Validar datos
2. Verificar unicidad
3. Crear producto
4. Registrar en log de auditoría

### update(id: number, dto: UpdateProductoDto, userId: number)

Actualiza producto existente.

**Validaciones**:

- Producto existe
- Si cambia precio, validar que sea > costo
- Si cambia SKU, verificar unicidad

**Proceso**:

1. Obtener producto actual
2. Validar cambios
3. Actualizar producto
4. Registrar cambio en auditoría

### toggleDisponibilidad(id: number)

Cambia disponibilidad de un producto.

**Uso común**:

- Producto se agotó temporalmente
- Fuera de horario (ej: desayunos solo AM)
- Ingrediente faltante

### ajustarStock(id: number, cantidad: number, motivo: string)

Ajusta el stock de un producto.

**Tipos de ajuste**:

- Entrada (compra, producción)
- Salida (venta, merma)
- Corrección (inventario físico)

## DTOs

### CreateProductoDto

```typescript
export class CreateProductoDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  precio: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costo: number;

  @IsInt()
  @Min(1)
  id_categoria: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  sku?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock_minimo?: number;

  @IsString()
  @MaxLength(20)
  unidad_medida: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  tiempo_preparacion?: number;
}
```

### FiltrarProductosDto

```typescript
export class FiltrarProductosDto {
  @IsOptional()
  @IsInt()
  categoria?: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  disponible?: boolean;

  @IsOptional()
  @IsString()
  buscar?: string;

  @IsOptional()
  @IsNumber()
  precio_min?: number;

  @IsOptional()
  @IsNumber()
  precio_max?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  pagina?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  por_pagina?: number = 20;
}
```

## Reglas de Negocio

### 1. Margen Mínimo

**Regla**: El precio debe ser al menos 30% mayor que el costo

```typescript
const margenMinimo = 0.3;
const precioMinimo = costo * (1 + margenMinimo);

if (precio < precioMinimo) {
  throw new BadRequestException(
    `Precio mínimo recomendado: $${precioMinimo.toFixed(2)}`,
  );
}
```

### 2. Stock Negativo

**Regla**: No permitir stock negativo

```typescript
if (stockActual - cantidad < 0) {
  throw new BadRequestException(
    `Stock insuficiente. Disponible: ${stockActual}`,
  );
}
```

### 3. Producto Inactivo

**Regla**: Productos inactivos no pueden:

- Agregarse a órdenes nuevas
- Mostrarse en menú público
- Comprarse

### 4. Categorías Jerárquicas

**Opcional**: Implementar subcategorías

```typescript
{
  "Bebidas": {
    subcategorias: ["Cervezas", "Refrescos", "Aguas"]
  }
}
```

## Análisis y Reportes

### Análisis ABC

Clasificación de productos por importancia:

**Clase A** (80% ingresos - 20% productos):

- Productos estrella
- Enfoque en disponibilidad
- Promocionar

**Clase B** (15% ingresos - 30% productos):

- Productos complementarios
- Mantener stock

**Clase C** (5% ingresos - 50% productos):

- Evaluar eliminación
- Bajo inventario

### Análisis de Rentabilidad

```typescript
calcularRentabilidad(producto: Producto) {
  const margen = ((producto.precio - producto.costo) / producto.precio) * 100;
  const ingresoMensual = producto.ventas_mes * producto.precio;
  const costoMensual = producto.ventas_mes * producto.costo;
  const utilidadMensual = ingresoMensual - costoMensual;

  return {
    margen,
    ingresoMensual,
    utilidadMensual,
    roi: (utilidadMensual / costoMensual) * 100
  };
}
```

## Caché con Redis

### Consultas cacheadas:

- `GET /productos`: TTL 5 minutos
- `GET /productos/categorias`: TTL 1 hora
- `GET /productos/mas-vendidos`: TTL 30 minutos

### Invalidación:

- Al crear/actualizar/eliminar producto
- Al cambiar disponibilidad
- Al crear/modificar categoría

## Integración con Otros Módulos

### Con Órdenes

- Validar disponibilidad antes de agregar
- Actualizar stock al procesar pago
- Obtener precio actual

### Con Inventario

- Sincronizar stock
- Alertas de stock bajo
- Costo promedio ponderado

### Con Reportes

- Productos más vendidos
- Análisis de rentabilidad
- Proyecciones de demanda

## Testing

### Unit Tests

```typescript
describe('ProductosService', () => {
  it('debe calcular margen correctamente', () => {
    const producto = { precio: 100, costo: 40 };
    expect(calcularMargen(producto)).toBe(60);
  });

  it('debe validar precio mínimo', () => {
    expect(() => validarPrecio(50, 60)).toThrow('Precio menor que costo');
  });
});
```

### E2E Tests

```typescript
describe('Productos (e2e)', () => {
  it('/productos (GET) debe retornar lista', () => {
    return request(app.getHttpServer())
      .get('/productos')
      .expect(200)
      .expect((res) => {
        expect(res.body.productos).toBeDefined();
      });
  });
});
```

## Optimizaciones

### Búsqueda Full-Text

```sql
-- Índice para búsqueda rápida
CREATE INDEX idx_productos_nombre ON productos
USING gin(to_tsvector('spanish', nombre));

-- Query optimizada
SELECT * FROM productos
WHERE to_tsvector('spanish', nombre) @@ to_tsquery('spanish', 'taco');
```

### Carga de Imágenes

**Estrategia**:

1. Almacenar en servicio externo (S3, Cloudinary)
2. Guardar solo URL en base de datos
3. Lazy loading en frontend
4. Thumbnail y full-size

## Datos de Ejemplo (Seed)

```typescript
const categorias = [
  { nombre: 'Entradas', color: '#4ECDC4', icono: 'appetizer' },
  { nombre: 'Platillos Fuertes', color: '#FF6B6B', icono: 'restaurant' },
  { nombre: 'Bebidas', color: '#95E1D3', icono: 'local_bar' },
  { nombre: 'Postres', color: '#FFE66D', icono: 'cake' },
];

const productos = [
  {
    nombre: 'Tacos al Pastor',
    precio: 85.0,
    costo: 35.0,
    categoria: 'Platillos Fuertes',
    tiempo_preparacion: 15,
  },
  {
    nombre: 'Guacamole',
    precio: 65.0,
    costo: 25.0,
    categoria: 'Entradas',
    tiempo_preparacion: 5,
  },
];
```

## Troubleshooting

**Problema**: Productos no aparecen en el menú

**Solución**:

- Verificar `activo = true`
- Verificar `disponible = true`
- Verificar categoría activa

**Problema**: Stock no se actualiza

**Solución**:

- Verificar integración con módulo de inventario
- Revisar que ventas estén descontando stock
- Ejecutar sincronización manual si es necesario

**Problema**: Búsqueda lenta con muchos productos

**Solución**:

- Implementar índices full-text
- Usar caché de Redis
- Considerar Elasticsearch para búsquedas avanzadas
