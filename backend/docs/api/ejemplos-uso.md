# Ejemplos de Uso de la API

Este documento contiene ejemplos prácticos de uso de la API de KantarEs para casos comunes.

## Configuración Inicial

### Headers Comunes

```javascript
const headers = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer ' + access_token,
};
```

### Base URL

```javascript
const BASE_URL = 'http://localhost:3000';
```

---

## Caso 1: Flujo Completo de una Orden

### 1.1. Autenticarse

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cajero@kantares.com",
    "password": "Cajero123!"
  }'
```

**Response**:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 2,
    "nombre": "María",
    "apellido": "López",
    "rol": "Cajero"
  }
}
```

### 1.2. Crear Orden

```bash
curl -X POST http://localhost:3000/ordenes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_mesa": 5,
    "tipo": "local",
    "notas": "Cliente solicita mesa cerca de ventana"
  }'
```

**Response**:

```json
{
  "id_orden": 123,
  "numero_orden": "ORD-123",
  "fecha_hora_creacion": "2025-10-08T14:30:00Z",
  "estado": "pendiente",
  "total": 0.0
}
```

### 1.3. Agregar Items a la Orden

```bash
# Agregar Tacos al Pastor
curl -X POST http://localhost:3000/ordenes/123/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_producto": 12,
    "cantidad": 3,
    "precio_unitario": 85.00,
    "notas": "Sin cebolla"
  }'

# Agregar Agua de Horchata
curl -X POST http://localhost:3000/ordenes/123/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_producto": 45,
    "cantidad": 2,
    "precio_unitario": 30.00
  }'
```

### 1.4. Cambiar Estado a "Preparando"

```bash
curl -X PATCH http://localhost:3000/ordenes/123/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_estado_orden": 2,
    "notas": "Orden confirmada"
  }'
```

### 1.5. Cambiar Estado a "Listo"

```bash
curl -X PATCH http://localhost:3000/ordenes/123/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_estado_orden": 3
  }'
```

### 1.6. Cambiar Estado a "Entregado"

```bash
curl -X PATCH http://localhost:3000/ordenes/123/estado \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_estado_orden": 4
  }'
```

### 1.7. Procesar Pago

```bash
curl -X POST http://localhost:3000/ordenes/123/pagar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_metodo_pago": 1,
    "monto_recibido": 400.00,
    "propina": 50.00
  }'
```

**Response**:

```json
{
  "message": "Pago procesado exitosamente",
  "orden": {
    "id_orden": 123,
    "total": 345.8,
    "monto_recibido": 400.0,
    "cambio": 54.2,
    "propina": 50.0,
    "estado": "pagado"
  },
  "ticket": {
    "folio": "TICKET-123",
    "url": "/tickets/123.pdf"
  }
}
```

---

## Caso 2: Gestión de Productos

### 2.1. Listar Productos Disponibles

```bash
curl -X GET "http://localhost:3000/productos?disponible=true&categoria=3" \
  -H "Authorization: Bearer {token}"
```

**Response**:

```json
{
  "productos": [
    {
      "id_producto": 12,
      "nombre": "Tacos al Pastor",
      "precio": 85.0,
      "stock_actual": 50,
      "disponible": true,
      "categoria": {
        "nombre": "Platillos Fuertes",
        "color": "#FF6B6B"
      }
    }
  ],
  "total": 25,
  "pagina": 1
}
```

### 2.2. Crear Nuevo Producto

```bash
curl -X POST http://localhost:3000/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nombre": "Quesadillas de Flor de Calabaza",
    "descripcion": "3 quesadillas hechas a mano con flor",
    "precio": 75.00,
    "costo": 28.00,
    "id_categoria": 3,
    "sku": "QFCAL-001",
    "stock_minimo": 30,
    "unidad_medida": "porción",
    "tiempo_preparacion": 12
  }'
```

### 2.3. Actualizar Precio de Producto

```bash
curl -X PATCH http://localhost:3000/productos/12 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "precio": 90.00
  }'
```

### 2.4. Marcar Producto Como No Disponible

```bash
curl -X PATCH http://localhost:3000/productos/12 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "disponible": false
  }'
```

### 2.5. Buscar Productos

```bash
curl -X GET "http://localhost:3000/productos?buscar=taco&precio_min=50&precio_max=100" \
  -H "Authorization: Bearer {token}"
```

---

## Caso 3: Control de Inventario

### 3.1. Consultar Stock de Productos

```bash
curl -X GET http://localhost:3000/inventario/stock \
  -H "Authorization: Bearer {token}"
```

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
      "estado_stock": "normal"
    },
    {
      "id_producto": 8,
      "nombre": "Cerveza Corona",
      "stock_actual": 15,
      "stock_minimo": 30,
      "unidad": "pieza",
      "estado_stock": "bajo",
      "alerta": true
    }
  ]
}
```

### 3.2. Crear Orden de Compra

```bash
curl -X POST http://localhost:3000/compras \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_proveedor": 5,
    "fecha_compra": "2025-10-08",
    "items": [
      {
        "id_producto": 12,
        "cantidad": 50,
        "precio_unitario": 25.00
      },
      {
        "id_producto": 15,
        "cantidad": 30,
        "precio_unitario": 15.50
      }
    ],
    "notas": "Entrega para el viernes"
  }'
```

**Response**:

```json
{
  "id_compra": 45,
  "folio": "COMP-2025-045",
  "estado": "pendiente",
  "total": 1989.4,
  "proveedor": {
    "nombre": "Abarrotes del Centro"
  }
}
```

### 3.3. Recibir Mercancía

```bash
curl -X PATCH http://localhost:3000/compras/45/recibir \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
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
  }'
```

### 3.4. Ajustar Stock Manualmente

```bash
curl -X POST http://localhost:3000/inventario/ajuste \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_producto": 12,
    "cantidad_nueva": 42,
    "motivo": "Inventario físico mensual",
    "notas": "Diferencia encontrada en conteo"
  }'
```

### 3.5. Registrar Merma

```bash
curl -X POST http://localhost:3000/inventario/merma \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "id_producto": 8,
    "cantidad": 5,
    "motivo": "caducado",
    "responsable": "Juan Pérez",
    "notas": "Producto venció el 2025-10-05"
  }'
```

### 3.6. Ver Alertas de Stock

```bash
curl -X GET http://localhost:3000/inventario/alertas \
  -H "Authorization: Bearer {token}"
```

---

## Caso 4: Gestión de Corte de Caja

### 4.1. Abrir Turno

```bash
curl -X POST http://localhost:3000/cortes/apertura \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "monto_inicial": 500.00,
    "billetes": {
      "1000": 0,
      "500": 1,
      "200": 0,
      "100": 0,
      "50": 0,
      "20": 0
    },
    "monedas": {
      "10": 0,
      "5": 0,
      "2": 0,
      "1": 0
    }
  }'
```

**Response**:

```json
{
  "id_corte": 145,
  "folio": "CORTE-2025-145",
  "fecha_apertura": "2025-10-08T08:00:00Z",
  "monto_inicial": 500.0,
  "estado": "abierto"
}
```

### 4.2. Consultar Estado del Turno Actual

```bash
curl -X GET http://localhost:3000/cortes/activo \
  -H "Authorization: Bearer {token}"
```

**Response**:

```json
{
  "id_corte": 145,
  "fecha_apertura": "2025-10-08T08:00:00Z",
  "monto_inicial": 500.0,
  "totales": {
    "ventas": 12450.0,
    "gastos": 850.0,
    "efectivo": 8320.0,
    "tarjeta": 4130.0
  },
  "ordenes_procesadas": 87,
  "tiempo_transcurrido": "8h 30m"
}
```

### 4.3. Registrar Gasto

```bash
curl -X POST http://localhost:3000/cortes/145/gastos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "concepto": "Compra de gas",
    "monto": 350.00,
    "categoria": "servicios",
    "metodo_pago": "efectivo",
    "comprobante": "FACT-2025-456"
  }'
```

### 4.4. Cerrar Turno

```bash
curl -X POST http://localhost:3000/cortes/145/cierre \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "efectivo_contado": 8320.00,
    "desglose_billetes": {
      "1000": 5,
      "500": 6,
      "200": 4,
      "100": 5,
      "50": 2,
      "20": 6
    },
    "desglose_monedas": {
      "10": 10,
      "5": 4,
      "2": 0,
      "1": 0
    }
  }'
```

**Response**:

```json
{
  "resumen": {
    "total_ventas": 12450.0,
    "total_gastos": 850.0,
    "efectivo_esperado": 8320.0,
    "efectivo_contado": 8320.0,
    "diferencia": 0.0,
    "estado": "cerrado"
  },
  "ticket_url": "/cortes/145/ticket.pdf"
}
```

---

## Caso 5: Reportes y Estadísticas

### 5.1. Productos Más Vendidos del Mes

```bash
curl -X GET "http://localhost:3000/productos/mas-vendidos?periodo=mes&limite=10" \
  -H "Authorization: Bearer {token}"
```

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
    },
    {
      "id_producto": 8,
      "nombre": "Pozole Rojo",
      "ventas": 340,
      "ingresos": 30600.0,
      "porcentaje_ventas": "12.1%"
    }
  ]
}
```

### 5.2. Reporte Diario de Ventas

```bash
curl -X GET "http://localhost:3000/cortes/reporte-diario?fecha=2025-10-08" \
  -H "Authorization: Bearer {token}"
```

### 5.3. Historial de Compras de un Proveedor

```bash
curl -X GET http://localhost:3000/proveedores/5/historial-compras \
  -H "Authorization: Bearer {token}"
```

### 5.4. Reporte de Mermas del Mes

```bash
curl -X GET http://localhost:3000/inventario/reportes/mermas \
  -H "Authorization: Bearer {token}"
```

---

## Caso 6: Gestión de Usuarios

### 6.1. Crear Nuevo Usuario

```bash
curl -X POST http://localhost:3000/usuarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "email": "carlos.ramirez@kantares.com",
    "password": "Password123!",
    "rol": "Mesero",
    "telefono": "555-5678",
    "fecha_contratacion": "2025-10-01"
  }'
```

### 6.2. Cambiar Contraseña

```bash
curl -X POST http://localhost:3000/usuarios/2/cambiar-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "password_actual": "OldPass123!",
    "password_nueva": "NewPass456!",
    "confirmar_password": "NewPass456!"
  }'
```

### 6.3. Listar Usuarios Activos

```bash
curl -X GET "http://localhost:3000/usuarios?activo=true&rol=Cajero" \
  -H "Authorization: Bearer {token}"
```

---

## Caso 7: Manejo de Errores

### Error 400 - Bad Request

```json
{
  "statusCode": 400,
  "message": [
    "precio debe ser un número positivo",
    "nombre no debe estar vacío"
  ],
  "error": "Bad Request"
}
```

### Error 401 - Unauthorized

```json
{
  "statusCode": 401,
  "message": "Token inválido o expirado",
  "error": "Unauthorized"
}
```

### Error 403 - Forbidden

```json
{
  "statusCode": 403,
  "message": "No tienes permisos para realizar esta acción",
  "error": "Forbidden"
}
```

### Error 404 - Not Found

```json
{
  "statusCode": 404,
  "message": "Producto no encontrado",
  "error": "Not Found"
}
```

### Error 409 - Conflict

```json
{
  "statusCode": 409,
  "message": "Email ya registrado",
  "error": "Conflict"
}
```

---

## Ejemplos con JavaScript/Fetch

### Crear Orden Completa

```javascript
// 1. Login
async function login() {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'cajero@kantares.com',
      password: 'Cajero123!',
    }),
  });

  const data = await response.json();
  return data.access_token;
}

// 2. Crear y completar orden
async function crearOrdenCompleta() {
  const token = await login();

  // Crear orden
  const ordenResponse = await fetch('http://localhost:3000/ordenes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_mesa: 5,
      tipo: 'local',
    }),
  });

  const orden = await ordenResponse.json();
  console.log('Orden creada:', orden.numero_orden);

  // Agregar items
  await fetch(`http://localhost:3000/ordenes/${orden.id_orden}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_producto: 12,
      cantidad: 3,
      precio_unitario: 85.0,
    }),
  });

  console.log('Items agregados a la orden');

  // Cambiar a preparando
  await fetch(`http://localhost:3000/ordenes/${orden.id_orden}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_estado_orden: 2,
    }),
  });

  console.log('Orden enviada a cocina');
}

crearOrdenCompleta();
```

### Consultar Stock Bajo

```javascript
async function consultarStockBajo(token) {
  const response = await fetch(
    'http://localhost:3000/inventario/stock?bajo_minimo=true',
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  const data = await response.json();

  data.productos.forEach((producto) => {
    console.log(
      `⚠️ ${producto.nombre}: ${producto.stock_actual} ${producto.unidad}`,
    );
    console.log(`   Mínimo requerido: ${producto.stock_minimo}`);
  });
}
```

---

## Colección de Postman

Para importar en Postman, descarga la colección desde:
`/docs/postman/kantares-api.json`

## Tips y Best Practices

1. **Siempre manejar errores**:

   ```javascript
   try {
     const response = await fetch(url, options);
     if (!response.ok) throw new Error(response.statusText);
     return await response.json();
   } catch (error) {
     console.error('Error:', error);
   }
   ```

2. **Renovar token antes de que expire**:

   ```javascript
   // JWT expira en 24h por defecto
   // Renovar si está próximo a expirar
   ```

3. **Usar variables de entorno**:

   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
   ```

4. **Implementar retry logic**:
   ```javascript
   async function fetchWithRetry(url, options, retries = 3) {
     try {
       return await fetch(url, options);
     } catch (error) {
       if (retries > 0) {
         await new Promise((r) => setTimeout(r, 1000));
         return fetchWithRetry(url, options, retries - 1);
       }
       throw error;
     }
   }
   ```
