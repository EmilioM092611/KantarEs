// backend/test/e2e/flujos-completos.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestingApp } from '../utils/create-testing-app';

/**
 * Tests E2E que validan flujos completos del sistema
 * Estos tests simulan escenarios reales del negocio
 */
describe('Flujos Completos E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  // IDs que se crearán y usarán durante los tests
  let mesaId: number;
  let sesionId: number;
  let productoId: number;
  let ordenId: number;
  let pagoId: number;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get(PrismaService);

    // Login
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'admin', password: 'admin123' })
      .expect(200);

    authToken = loginResponse.body.access_token;

    console.log('✅ E2E Setup completado');
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  /**
   * FLUJO 1: Venta Completa en Restaurante
   * 1. Crear/Obtener mesa disponible
   * 2. Abrir sesión de mesa
   * 3. Crear orden con múltiples productos
   * 4. Agregar items adicionales
   * 5. Procesar pago
   * 6. Cerrar sesión
   * 7. Verificar todo quedó registrado correctamente
   */
  describe('Flujo 1: Venta Completa en Restaurante', () => {
    it('should complete full restaurant sale flow', async () => {
      // ===== PASO 1: Obtener/Crear Mesa =====
      console.log('\n📋 PASO 1: Obtener Mesa');

      let mesa = await prisma.mesas.findFirst({
        where: { activa: true },
      });

      if (!mesa) {
        const estadoMesa = await prisma.estados_mesa.findFirst();
        mesa = await prisma.mesas.create({
          data: {
            numero_mesa: `E2E-${Date.now()}`,
            capacidad_personas: 4,
            id_estado_mesa: estadoMesa.id_estado_mesa,
            activa: true,
          },
        });
      }
      mesaId = mesa.id_mesa;
      expect(mesa).toBeDefined();
      console.log(`✅ Mesa obtenida: ${mesa.numero_mesa}`);

      // ===== PASO 2: Abrir Sesión de Mesa =====
      console.log('\n📋 PASO 2: Abrir Sesión de Mesa');

      const sesionResponse = await request(app.getHttpServer())
        .post('/sesiones-mesa')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_mesa: mesaId,
          numero_comensales: 4,
          nombre_cliente: 'Cliente E2E Test',
        })
        .expect(201);

      sesionId = sesionResponse.body.data.id_sesion;
      expect(sesionResponse.body.data.estado).toBe('abierta');
      console.log(`✅ Sesión abierta: ID ${sesionId}`);

      // ===== PASO 3: Obtener Producto Disponible =====
      console.log('\n📋 PASO 3: Obtener Producto');

      let producto = await prisma.productos.findFirst({
        where: { disponible: true, es_vendible: true },
      });

      if (!producto) {
        const categoria = await prisma.categorias.findFirst();
        const unidad = await prisma.unidades_medida.findFirst();

        producto = await prisma.productos.create({
          data: {
            sku: `E2E-${Date.now()}`,
            nombre: 'Producto E2E Test',
            id_categoria: categoria.id_categoria,
            id_unidad_medida: unidad.id_unidad,
            precio_venta: 100.0,
            costo_promedio: 50.0,
            disponible: true,
            es_vendible: true,
          },
        });
      }
      productoId = producto.id_producto;
      console.log(
        `✅ Producto: ${producto.nombre} - $${producto.precio_venta}`,
      );

      // ===== PASO 4: Crear Orden con Items =====
      console.log('\n📋 PASO 4: Crear Orden');

      const ordenResponse = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_sesion_mesa: sesionId,
          detalles: [
            {
              id_producto: productoId,
              cantidad: 2,
              notas_especiales: 'Sin cebolla',
            },
            {
              id_producto: productoId,
              cantidad: 1,
              notas_especiales: 'Extra picante',
            },
          ],
          observaciones: 'Orden E2E Test',
        })
        .expect(201);

      ordenId = ordenResponse.body.data.id_orden;
      const orden = ordenResponse.body.data;

      expect(orden.orden_detalle).toHaveLength(2);
      expect(parseFloat(orden.total)).toBeGreaterThan(0);
      console.log(`✅ Orden creada: ${orden.folio} - Total: $${orden.total}`);

      // Verificar cálculos
      const subtotalEsperado = 300.0; // 2*100 + 1*100
      const ivaEsperado = subtotalEsperado * 0.16;
      const totalEsperado = subtotalEsperado + ivaEsperado;

      expect(parseFloat(orden.subtotal)).toBeCloseTo(subtotalEsperado, 2);
      expect(parseFloat(orden.iva_monto)).toBeCloseTo(ivaEsperado, 2);
      expect(parseFloat(orden.total)).toBeCloseTo(totalEsperado, 2);

      // ===== PASO 5: Agregar Item Adicional =====
      console.log('\n📋 PASO 5: Agregar Item Adicional');

      const itemResponse = await request(app.getHttpServer())
        .post(`/ordenes/${ordenId}/agregar-item`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_producto: productoId,
          cantidad: 1,
          notas_especiales: 'Para llevar',
        })
        .expect(201);

      expect(itemResponse.body.success).toBe(true);
      console.log('✅ Item adicional agregado');

      // ===== PASO 6: Obtener Orden Actualizada =====
      console.log('\n📋 PASO 6: Verificar Orden Actualizada');

      const ordenActualizada = await request(app.getHttpServer())
        .get(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(ordenActualizada.body.data.orden_detalle).toHaveLength(3);
      console.log('✅ Orden actualizada correctamente');

      // ===== PASO 7: Procesar Pago =====
      console.log('\n📋 PASO 7: Procesar Pago');

      const totalOrden = parseFloat(ordenActualizada.body.data.total);
      const pagoResponse = await request(app.getHttpServer())
        .post('/pagos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_orden: ordenId,
          id_metodo_pago: 1, // Efectivo
          monto: totalOrden,
          monto_recibido: 500.0,
        })
        .expect(201);

      pagoId = pagoResponse.body.data.id_pago;
      const pago = pagoResponse.body.data;

      expect(pago.estado).toBe('completado');
      expect(parseFloat(pago.monto)).toBe(totalOrden);
      expect(parseFloat(pago.cambio_entregado)).toBeGreaterThan(0);
      console.log(
        `✅ Pago procesado: ${pago.folio_pago} - Cambio: $${pago.cambio_entregado}`,
      );

      // ===== PASO 8: Cerrar Sesión =====
      console.log('\n📋 PASO 8: Cerrar Sesión de Mesa');

      const cerrarSesionResponse = await request(app.getHttpServer())
        .patch(`/sesiones-mesa/${sesionId}/cerrar`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(cerrarSesionResponse.body.data.estado).toBe('cerrada');
      console.log('✅ Sesión cerrada');

      // ===== PASO 9: Verificaciones Finales =====
      console.log('\n📋 PASO 9: Verificaciones Finales');

      // Verificar que la orden cambió a estado "pagado"
      const ordenFinal = await prisma.ordenes.findUnique({
        where: { id_orden: ordenId },
        include: { estados_orden: true },
      });
      expect(ordenFinal.estados_orden.nombre).toBe('pagado');

      // Verificar que el pago quedó registrado
      const pagoFinal = await prisma.pagos.findUnique({
        where: { id_pago: pagoId },
      });
      expect(pagoFinal.estado).toBe('completado');

      // Verificar que la sesión cerró
      const sesionFinal = await prisma.sesiones_mesa.findUnique({
        where: { id_sesion: sesionId },
      });
      expect(sesionFinal.estado).toBe('cerrada');
      expect(sesionFinal.fecha_hora_cierre).not.toBeNull();

      console.log('\n🎉 FLUJO COMPLETO EXITOSO');
    });
  });

  /**
   * FLUJO 2: Gestión de Inventario Completo
   * 1. Crear producto inventariable
   * 2. Crear entrada de inventario (compra)
   * 3. Realizar venta (salida automática)
   * 4. Registrar merma
   * 5. Verificar stock actualizado
   * 6. Generar reporte de movimientos
   */
  describe('Flujo 2: Gestión de Inventario Completo', () => {
    it('should handle complete inventory management flow', async () => {
      console.log('\n📦 FLUJO DE INVENTARIO');

      // ===== PASO 1: Crear Producto Inventariable =====
      console.log('\n📋 PASO 1: Crear Producto Inventariable');

      const categoria = await prisma.categorias.findFirst();
      const unidad = await prisma.unidades_medida.findFirst();

      const productoInventario = await prisma.productos.create({
        data: {
          sku: `INV-${Date.now()}`,
          nombre: 'Producto Inventario Test',
          id_categoria: categoria.id_categoria,
          id_unidad_medida: unidad.id_unidad,
          precio_venta: 150.0,
          costo_promedio: 75.0,
          es_inventariable: true,
          disponible: true,
        },
      });

      // Crear registro de inventario
      const inventario = await prisma.inventario.create({
        data: {
          id_producto: productoInventario.id_producto,
          stock_actual: 0.0,
          stock_minimo: 10.0,
          stock_maximo: 100.0,
          punto_reorden: 20.0,
        },
      });

      console.log(`✅ Producto creado: ${productoInventario.nombre}`);
      console.log(`✅ Stock inicial: ${inventario.stock_actual}`);

      // ===== PASO 2: Registrar Entrada (Compra) =====
      console.log('\n📋 PASO 2: Registrar Entrada al Inventario');

      const entradaResponse = await request(app.getHttpServer())
        .post('/inventario/ajustar-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_producto: productoInventario.id_producto,
          cantidad: 50.0,
          tipo_movimiento: 'entrada',
          observaciones: 'Compra inicial - Test E2E',
        })
        .expect(201);

      const stockDespuesEntrada = entradaResponse.body.data.stock_actual;
      expect(parseFloat(stockDespuesEntrada)).toBe(50.0);
      console.log(`✅ Entrada registrada. Stock: ${stockDespuesEntrada}`);

      // ===== PASO 3: Crear Orden con Producto (Salida Automática) =====
      console.log('\n📋 PASO 3: Venta con Salida Automática');

      // Primero necesitamos una sesión
      let mesa = await prisma.mesas.findFirst({ where: { activa: true } });
      if (!mesa) {
        const estadoMesa = await prisma.estados_mesa.findFirst();
        mesa = await prisma.mesas.create({
          data: {
            numero_mesa: `INV-${Date.now()}`,
            capacidad_personas: 2,
            id_estado_mesa: estadoMesa.id_estado_mesa,
            activa: true,
          },
        });
      }

      const sesion = await prisma.sesiones_mesa.create({
        data: {
          id_mesa: mesa.id_mesa,
          id_usuario_apertura: 1,
          fecha_hora_apertura: new Date(),
          estado: 'abierta',
        },
      });

      // Crear orden
      const ordenInv = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_sesion_mesa: sesion.id_sesion,
          detalles: [
            {
              id_producto: productoInventario.id_producto,
              cantidad: 5, // Vender 5 unidades
            },
          ],
        })
        .expect(201);

      console.log('✅ Orden creada, salida automática activada');

      // Verificar que el stock se redujo
      const inventarioDespuesVenta = await prisma.inventario.findUnique({
        where: { id_producto: productoInventario.id_producto },
      });

      expect(parseFloat(inventarioDespuesVenta.stock_actual)).toBe(45.0); // 50 - 5
      console.log(
        `✅ Stock después de venta: ${inventarioDespuesVenta.stock_actual}`,
      );

      // ===== PASO 4: Registrar Merma =====
      console.log('\n📋 PASO 4: Registrar Merma');

      const mermaResponse = await request(app.getHttpServer())
        .post('/inventario/registrar-merma')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_producto: productoInventario.id_producto,
          cantidad: 3.0,
          motivo: 'Producto dañado - Test E2E',
        })
        .expect(201);

      const stockDespuesMerma = mermaResponse.body.data.stock_actual;
      expect(parseFloat(stockDespuesMerma)).toBe(42.0); // 45 - 3
      console.log(`✅ Merma registrada. Stock: ${stockDespuesMerma}`);

      // ===== PASO 5: Obtener Historial de Movimientos =====
      console.log('\n📋 PASO 5: Verificar Historial de Movimientos');

      const historialResponse = await request(app.getHttpServer())
        .get(`/inventario/movimientos/${productoInventario.id_producto}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const movimientos = historialResponse.body.data;
      expect(movimientos.length).toBeGreaterThanOrEqual(3); // Entrada, Salida, Merma

      console.log(`✅ ${movimientos.length} movimientos registrados:`);
      movimientos.forEach((mov, i) => {
        console.log(
          `   ${i + 1}. ${mov.tipos_movimiento.nombre}: ${mov.cantidad}`,
        );
      });

      // ===== PASO 6: Verificar Stock Bajo =====
      console.log('\n📋 PASO 6: Verificar Alertas de Stock');

      // Ajustar a stock bajo
      await prisma.inventario.update({
        where: { id_producto: productoInventario.id_producto },
        data: { stock_actual: 8.0 }, // Por debajo del mínimo (10)
      });

      const stockBajoResponse = await request(app.getHttpServer())
        .get('/inventario/stock-bajo')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const productosStockBajo = stockBajoResponse.body.data;
      const nuestroProducto = productosStockBajo.find(
        (p) => p.id_producto === productoInventario.id_producto,
      );

      expect(nuestroProducto).toBeDefined();
      console.log('✅ Alerta de stock bajo detectada correctamente');

      console.log('\n🎉 FLUJO DE INVENTARIO COMPLETO');
    });
  });

  /**
   * FLUJO 3: Pago Dividido y Cancelaciones
   * 1. Crear orden
   * 2. Realizar pago dividido (efectivo + tarjeta)
   * 3. Cancelar uno de los items
   * 4. Procesar reembolso parcial
   * 5. Verificar registros contables
   */
  describe('Flujo 3: Pago Dividido y Cancelaciones', () => {
    it('should handle split payment and cancellations', async () => {
      console.log('\n💳 FLUJO DE PAGO DIVIDIDO');

      // Setup: Crear sesión y orden
      let mesa = await prisma.mesas.findFirst({ where: { activa: true } });
      if (!mesa) {
        const estadoMesa = await prisma.estados_mesa.findFirst();
        mesa = await prisma.mesas.create({
          data: {
            numero_mesa: `PAG-${Date.now()}`,
            capacidad_personas: 4,
            id_estado_mesa: estadoMesa.id_estado_mesa,
            activa: true,
          },
        });
      }

      const sesion = await prisma.sesiones_mesa.create({
        data: {
          id_mesa: mesa.id_mesa,
          id_usuario_apertura: 1,
          fecha_hora_apertura: new Date(),
          estado: 'abierta',
        },
      });

      const producto = await prisma.productos.findFirst({
        where: { disponible: true },
      });

      const orden = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_sesion_mesa: sesion.id_sesion,
          detalles: [
            { id_producto: producto.id_producto, cantidad: 2 },
            { id_producto: producto.id_producto, cantidad: 1 },
          ],
        })
        .expect(201);

      const totalOrden = parseFloat(orden.body.data.total);
      console.log(`✅ Orden creada. Total: $${totalOrden}`);

      // ===== PASO 1: Pago Dividido =====
      console.log('\n📋 PASO 1: Procesar Pago Dividido');

      const mitad = totalOrden / 2;

      const pagoDividido = await request(app.getHttpServer())
        .post('/pagos/dividido')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_orden: orden.body.data.id_orden,
          pagos: [
            { id_metodo_pago: 1, monto: mitad }, // Efectivo
            {
              id_metodo_pago: 2,
              monto: mitad,
              referencia_transaccion: 'TEST123',
            }, // Tarjeta
          ],
        })
        .expect(201);

      expect(pagoDividido.body.data).toHaveLength(2);
      console.log('✅ Pago dividido procesado');

      // ===== PASO 2: Cancelar un Item =====
      console.log('\n📋 PASO 2: Cancelar Item de la Orden');

      const detalles = await prisma.orden_detalle.findMany({
        where: { id_orden: orden.body.data.id_orden },
      });

      const cancelacion = await request(app.getHttpServer())
        .delete(
          `/ordenes/${orden.body.data.id_orden}/item/${detalles[0].id_detalle}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          motivo_cancelacion: 'Cliente cambió de opinión',
        })
        .expect(200);

      console.log('✅ Item cancelado');

      // ===== PASO 3: Procesar Reembolso =====
      console.log('\n📋 PASO 3: Procesar Reembolso');

      const montoCancelado = parseFloat(detalles[0].total);

      const reembolso = await request(app.getHttpServer())
        .post(`/pagos/${pagoDividido.body.data[0].id_pago}/reembolso`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          monto_reembolso: montoCancelado,
          motivo: 'Item cancelado',
        })
        .expect(200);

      console.log(`✅ Reembolso procesado: $${montoCancelado}`);

      console.log('\n🎉 FLUJO DE PAGO DIVIDIDO COMPLETO');
    });
  });
});
