import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestingApp } from '../utils/create-testing-app';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('Flujo Completo de Venta E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let mesaId: number;
  let productoId: number;
  let estadoInicialId: number;
  let metodoPagoId: number;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get(PrismaService);
    const jwt = app.get(JwtService);

    // Setup inicial - Usuario admin
    const admin = await prisma.usuarios.findFirst({
      where: { username: 'admin' },
    });

    if (!admin) {
      throw new Error('Usuario admin no existe');
    }

    authToken = await jwt.signAsync({
      sub: admin.id_usuario,
      username: admin.username,
    });

    // Crear estado de mesa si no existe
    let estadoMesa = await prisma.estados_mesa.findFirst({
      where: { nombre: 'Disponible' },
    });

    if (!estadoMesa) {
      estadoMesa = await prisma.estados_mesa.create({
        data: {
          nombre: 'Disponible',
          descripcion: 'Mesa disponible',
        },
      });
    }

    // Crear mesa de prueba
    const mesa = await prisma.mesas.create({
      data: {
        numero_mesa: 'TEST-E2E-001',
        capacidad_personas: 4,
        activa: true,
        id_estado_mesa: estadoMesa.id_estado_mesa,
      },
    });
    mesaId = mesa.id_mesa;

    // Crear categoría y unidad si no existen
    let categoria = await prisma.categorias.findFirst();
    if (!categoria) {
      categoria = await prisma.categorias.create({
        data: {
          nombre: 'Bebidas',
          descripcion: 'Bebidas test',
          activa: true,
        },
      });
    }

    let unidad = await prisma.unidades_medida.findFirst();
    if (!unidad) {
      unidad = await prisma.unidades_medida.create({
        data: {
          nombre: 'Pieza',
          abreviatura: 'pz',
          tipo: 'unidad',
        },
      });
    }

    // Crear producto con inventario
    const producto = await prisma.productos.create({
      data: {
        sku: 'TEST-PROD-001',
        nombre: 'Producto Test E2E',
        precio_venta: 100,
        es_inventariable: true,
        disponible: true,
        id_categoria: categoria.id_categoria,
        id_unidad_medida: unidad.id_unidad,
      },
    });
    productoId = producto.id_producto;

    // Crear inventario inicial
    await prisma.inventario.create({
      data: {
        id_producto: productoId,
        stock_actual: 50,
        stock_minimo: 10,
        stock_maximo: 100,
      },
    });

    // Obtener estado inicial de orden
    const estadoInicial = await prisma.estados_orden.findFirst({
      where: { nombre: { equals: 'pendiente', mode: 'insensitive' } },
    });

    if (!estadoInicial) {
      throw new Error('Estado pendiente no existe');
    }
    estadoInicialId = estadoInicial.id_estado_orden;

    // Obtener método de pago
    let metodoPago = await prisma.metodos_pago.findFirst({
      where: { nombre: 'Efectivo' },
    });

    if (!metodoPago) {
      metodoPago = await prisma.metodos_pago.create({
        data: {
          nombre: 'Efectivo',
          descripcion: 'Pago en efectivo',
          activo: true,
        },
      });
    }
    metodoPagoId = metodoPago.id_metodo_pago;
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.orden_detalle.deleteMany({
      where: { productos: { sku: 'TEST-PROD-001' } },
    });
    await prisma.inventario.deleteMany({
      where: { productos: { sku: 'TEST-PROD-001' } },
    });
    await prisma.productos.deleteMany({
      where: { sku: 'TEST-PROD-001' },
    });
    await prisma.sesiones_mesa.deleteMany({
      where: { mesas: { numero_mesa: 'TEST-E2E-001' } },
    });
    await prisma.mesas.deleteMany({
      where: { numero_mesa: 'TEST-E2E-001' },
    });

    await app.close();
  });

  it('debe completar flujo: sesión → orden → pago → inventario', async () => {
    // 1. Crear sesión de mesa
    const sesionRes = await request(app.getHttpServer())
      .post('/sesiones-mesa')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        id_mesa: mesaId,
        numero_comensales: 2,
      })
      .expect(201);

    const sesionId = sesionRes.body.data.id_sesion;
    expect(sesionId).toBeDefined();

    // 2. Crear orden
    const ordenRes = await request(app.getHttpServer())
      .post('/ordenes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        id_sesion_mesa: sesionId,
        items: [
          {
            id_producto: productoId,
            cantidad: 2,
          },
        ],
      })
      .expect(201);

    const ordenId = ordenRes.body.data.id_orden;
    const total = ordenRes.body.data.total;
    expect(ordenId).toBeDefined();
    expect(total).toBe('200'); // 100 * 2

    // 3. Verificar stock inicial
    const stockInicial = await prisma.inventario.findUnique({
      where: { id_producto: productoId },
    });
    expect(stockInicial.stock_actual.toNumber()).toBe(50);

    // 4. Cambiar estado detalle a 'servido' (dispara trigger inventario)
    const detalleId = ordenRes.body.data.orden_detalle[0].id_detalle;

    await request(app.getHttpServer())
      .patch(`/orden-detalle/${detalleId}/estado`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ estado: 'servido' })
      .expect(200);

    // 5. Pagar orden completa con idempotencia
    const idempotencyKey = `test-${Date.now()}`;

    const pagoRes = await request(app.getHttpServer())
      .post('/pagos')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        id_orden: ordenId,
        id_metodo_pago: metodoPagoId,
        id_usuario_cobra: 1, // Admin
        monto: total,
      })
      .expect(201);

    expect(pagoRes.body.folio_pago).toBeDefined();

    // 6. Verificar idempotencia - mismo request no debe crear otro pago
    const pagoRes2 = await request(app.getHttpServer())
      .post('/pagos')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({
        id_orden: ordenId,
        id_metodo_pago: metodoPagoId,
        id_usuario_cobra: 1,
        monto: total,
      })
      .expect(201);

    expect(pagoRes2.body.folio_pago).toBe(pagoRes.body.folio_pago);

    // 7. Verificar estado = PAGADA
    const ordenFinal = await prisma.ordenes.findUnique({
      where: { id_orden: ordenId },
      include: { estados_orden: true },
    });

    expect(ordenFinal.estados_orden.nombre.toLowerCase()).toBe('pagada');

    // 8. Verificar descuento de inventario
    const stockFinal = await prisma.inventario.findUnique({
      where: { id_producto: productoId },
    });
    expect(stockFinal.stock_actual.toNumber()).toBe(48); // 50 - 2
  });
});
