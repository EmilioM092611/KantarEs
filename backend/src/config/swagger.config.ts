// backend/src/config/swagger.config.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('KantarEs API')
    .setDescription(
      'API REST para sistema de gestión de restaurante - Punto de Venta, Inventario, Compras y Reportes',
    )
    .setVersion('1.0')
    .setContact('KantarEs Team', 'https://kantares.com', 'soporte@kantares.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Desarrollo')
    .addServer('https://api.kantares.com', 'Producción')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingrese el token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Autenticación', 'Endpoints de login y gestión de sesiones')
    .addTag('Usuarios', 'Gestión de usuarios y permisos')
    .addTag('Productos', 'Catálogo de productos y categorías')
    .addTag('Recetas (BOM)', 'Gestión de recetas e insumos')
    .addTag('Combos', 'Definición de combos y paquetes')
    .addTag('Inventario', 'Control de stock y movimientos')
    .addTag('Órdenes', 'Gestión de órdenes y ventas')
    .addTag('Mesas', 'Administración de mesas y sesiones')
    .addTag('Pagos', 'Procesamiento de pagos')
    .addTag('Cortes de Caja', 'Apertura, cierre y conciliación de caja')
    .addTag('Compras', 'Órdenes de compra y proveedores')
    .addTag('Proveedores', 'Gestión de proveedores')
    .addTag('Reportes', 'Reportes y análisis de negocio')
    .addTag('Reservaciones', 'Gestión de reservas de mesas')
    .addTag('Cuentas por Cobrar', 'Gestión de crédito a clientes')
    .addTag('Promociones', 'Descuentos y ofertas especiales')
    .addTag('KDS', 'Kitchen Display System')
    .addTag('CFDI', 'Facturación electrónica')
    .addTag('Auditoría', 'Logs y trazabilidad')
    .addTag('Catálogos', 'Catálogos generales del sistema')
    .addTag(
      'Configuración del Sistema',
      'Parámetros y ajustes globales del restaurante',
    ) // ← AGREGAR ESTA LÍNEA
    .addTag('Notificaciones en Tiempo Real', 'WebSockets y notificaciones push')
    .addTag('Health', 'Endpoints de salud del sistema')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        theme: 'monokai',
      },
      tryItOutEnabled: true,
    },
    customSiteTitle: 'KantarEs API Docs',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .scheme-container { background: #1e293b; padding: 20px; border-radius: 8px; }
    `,
  });
}
