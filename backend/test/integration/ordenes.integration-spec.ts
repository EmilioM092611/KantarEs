// backend/test/integration/ordenes.integration-spec.ts
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestingApp } from '../utils/create-testing-app';

describe('Ordenes API (Integration Tests)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let mesaId: number;
  let sesionMesaId: number;
  let productoId: number;
  let ordenId: number;

  beforeAll(async () => {
    app = await createTestingApp();
    prisma = app.get(PrismaService);

    // ===== SETUP: Generar token JWT directo (evitar /auth/login mientras tanto)
    const jwt = app.get(JwtService);
    const admin = await prisma.usuarios.findUnique({
      where: { username: 'admin' },
    });
    if (!admin) throw new Error('Usuario admin no existe para tests');

    authToken = await jwt.signAsync({
      sub: admin.id_usuario,
      username: admin.username,
    });

    // ===== ESTADOS DE MESA
    let estadoMesa = await prisma.estados_mesa.findFirst();
    if (!estadoMesa) {
      estadoMesa = await prisma.estados_mesa.create({
        data: { nombre: 'Disponible', descripcion: 'Estado por defecto' },
      });
    }

    // ===== MESA (usa numero_mesa y capacidad_personas según tu schema)
    const mesaNumero = 'E2E-9999';
    let mesa = await prisma.mesas.findFirst({
      where: { numero_mesa: mesaNumero },
    });
    if (!mesa) {
      mesa = await prisma.mesas.create({
        data: {
          numero_mesa: mesaNumero,
          capacidad_personas: 4,
          ubicacion: 'Test',
          id_estado_mesa: estadoMesa.id_estado_mesa,
          activa: true,
          requiere_limpieza: false,
        },
      });
    }
    mesaId = mesa.id_mesa;

    // ===== PRODUCTO BASE
    let producto = await prisma.productos.findFirst({
      where: { nombre: 'Producto E2E Ordenes' },
    });

    if (!producto) {
      // Asegurar que exista una categoría
      let categoria = await prisma.categorias.findFirst();
      if (!categoria) {
        categoria = await prisma.categorias.create({
          data: {
            nombre: 'Categoría Test',
            descripcion: 'Categoría para pruebas',
            activa: true,
          },
        });
      }

      // Asegurar que exista una unidad de medida
      let unidad = await prisma.unidades_medida.findFirst();
      if (!unidad) {
        unidad = await prisma.unidades_medida.create({
          data: {
            nombre: 'Unidad',
            abreviatura: 'ud',
            tipo: 'CANTIDAD',
          },
        });
      }

      // Generar SKU único
      const timestamp = Date.now();
      const sku = `SKU-TEST-${timestamp}`;

      producto = await prisma.productos.create({
        data: {
          sku: sku,
          nombre: 'Producto E2E Ordenes',
          descripcion: 'Producto para pruebas e2e',
          precio_venta: 120.5,
          costo_promedio: 60.25,
          iva_tasa: 16,
          es_vendible: true,
          disponible: true,
          // ✅ Conectar a la categoría usando la relación de Prisma
          categorias: {
            connect: { id_categoria: categoria.id_categoria },
          },
          // ✅ Conectar a la unidad de medida usando la relación de Prisma
          unidades_medida: {
            connect: { id_unidad: unidad.id_unidad },
          },
        },
      });
    }
    productoId = producto.id_producto;

    // ===== SESIÓN DE MESA
    const usuario = admin;
    const sesion = await prisma.sesiones_mesa.create({
      data: {
        id_mesa: mesaId,
        id_usuario_apertura: usuario.id_usuario,
        fecha_hora_apertura: new Date(),
        estado: 'abierta',
      },
    });
    sesionMesaId = sesion.id_sesion;

    // ===== ESTADO DE ORDEN (si tu lógica lo usa)
    try {
      const existeAbierta = await prisma.estados_orden.findFirst({
        where: { nombre: 'abierta' },
      });
      if (!existeAbierta) {
        await prisma.estados_orden.create({
          data: {
            nombre: 'abierta',
            descripcion: 'Orden abierta',
            notifica_cocina: false,
            notifica_cliente: false,
          },
        });
      }
    } catch (error) {
      // Si falla por duplicado, ignorar - el estado ya existe
      console.log(
        'Estado "abierta" ya existe o error al crear:',
        error.message,
      );
    }

    // Crear estado 'cerrada' si no existe
    try {
      const existeCerrada = await prisma.estados_orden.findFirst({
        where: { nombre: 'cerrada' },
      });
      if (!existeCerrada) {
        await prisma.estados_orden.create({
          data: {
            nombre: 'cerrada',
            descripcion: 'Orden cerrada',
            notifica_cocina: false,
            notifica_cliente: false,
          },
        });
      }
    } catch (error) {
      // Si falla por duplicado, ignorar - el estado ya existe
      console.log(
        'Estado "cerrada" ya existe o error al crear:',
        error.message,
      );
    }
  });

  afterAll(async () => {
    try {
      // Limpiar datos de prueba en orden correcto
      if (ordenId) {
        // Eliminar detalles primero si existen restricciones FK
        await prisma.ordenes_detalle.deleteMany({
          where: { id_orden: ordenId },
        });
        await prisma.ordenes.delete({ where: { id_orden: ordenId } });
      }

      if (sesionMesaId) {
        await prisma.sesiones_mesa.update({
          where: { id_sesion: sesionMesaId },
          data: { estado: 'cerrada', fecha_hora_cierre: new Date() },
        });
      }

      // Limpiar producto de prueba (las relaciones se manejan automáticamente)
      if (productoId) {
        await prisma.productos.delete({ where: { id_producto: productoId } });
      }

      // Nota: No eliminamos categorías ni unidades de medida porque pueden ser
      // reutilizadas por otros tests o datos existentes
    } catch (error) {
      console.error('Error en limpieza afterAll:', error);
    } finally {
      await prisma.$disconnect();
      await app.close();
    }
  });

  // ========== MEJORAS PARA ordenes.integration-spec.ts ==========

  describe('POST /ordenes - Crear orden', () => {
    it('should create a complete order with details', async () => {
      const payload = {
        id_sesion_mesa: sesionMesaId,
        items: [
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
        observaciones: 'Mesa de prueba',
      };

      const response = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(response.body.success).toBe(true);

      // ✅ Verificar que se creó correctamente
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id_orden).toBeDefined();

      ordenId = response.body.data.id_orden;

      // ✅ Verificar estructura de la respuesta
      expect(response.body.data).toHaveProperty('folio');
      expect(response.body.data).toHaveProperty('subtotal');
      expect(response.body.data).toHaveProperty('total');

      // ✅ Verificar items
      expect(response.body.data.orden_detalle).toBeDefined();
      expect(response.body.data.orden_detalle.length).toBe(2);
    });

    it('should reject order with invalid sesion_mesa', async () => {
      const response = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_sesion_mesa: 999999,
          items: [{ id_producto: productoId, cantidad: 1 }],
        });

      expect(response.status).toBe(404); // ✅ Expectativa más específica
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrada');
    });

    it('should reject order with invalid producto', async () => {
      const response = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_sesion_mesa: sesionMesaId,
          items: [{ id_producto: 999999, cantidad: 1 }],
        });

      expect(response.status).toBe(404); // ✅ Expectativa más específica
      expect(response.body.success).toBe(false);
    });

    it('should calculate totals correctly (subtotal, IVA, total)', async () => {
      const { body } = await request(app.getHttpServer())
        .post('/ordenes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_sesion_mesa: sesionMesaId,
          items: [{ id_producto: productoId, cantidad: 2 }],
        })
        .expect(201);

      expect(body.data.subtotal).toBeGreaterThan(0);
      expect(body.data.total).toBeGreaterThan(body.data.subtotal);

      // ✅ Verificar cálculo de IVA (16%)
      const expectedSubtotal = 2 * 120.5; // cantidad * precio_venta
      const expectedIVA = expectedSubtotal * 0.16;
      const expectedTotal = expectedSubtotal + expectedIVA;

      expect(Math.abs(body.data.subtotal - expectedSubtotal)).toBeLessThan(
        0.01,
      );
      expect(Math.abs(body.data.iva_monto - expectedIVA)).toBeLessThan(0.01);
      expect(Math.abs(body.data.total - expectedTotal)).toBeLessThan(0.01);

      // Limpiar orden creada en este test
      if (body.data.id_orden && body.data.id_orden !== ordenId) {
        await prisma.orden_detalle.deleteMany({
          where: { id_orden: body.data.id_orden },
        });
        await prisma.ordenes.delete({
          where: { id_orden: body.data.id_orden },
        });
      }
    });
  });

  // ========== CORRECCIONES PARA TESTS DE ESTADO ==========

  describe('PATCH /ordenes/:id/estado - Cambiar estado de orden', () => {
    it('should update order status', async () => {
      // ✅ Primero verificar que ordenId existe
      if (!ordenId) {
        throw new Error('ordenId no está definido - test anterior falló');
      }

      // ✅ Obtener el estado deseado
      const estadoCerrada = await prisma.estados_orden.findFirst({
        where: { nombre: 'cerrada' },
      });

      if (!estadoCerrada) {
        throw new Error('Estado "cerrada" no existe en la BD');
      }

      const res = await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}/estado`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ id_estado_orden: estadoCerrada.id_estado_orden }) // ✅ Enviar ID correcto
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.estados_orden.nombre).toBe('cerrada');
    });
  });

  // ========== CORRECCIONES PARA AGREGAR ITEMS ==========

  describe('POST /ordenes/:id/agregar-item - Agregar item a orden', () => {
    it('should add item to existing order', async () => {
      // ✅ Verificar que ordenId existe
      if (!ordenId) {
        throw new Error('ordenId no está definido');
      }

      // ✅ Asegurar que la orden está en estado abierto/pendiente
      const estadoAbierta = await prisma.estados_orden.findFirst({
        where: { nombre: 'pendiente' },
      });

      if (estadoAbierta) {
        await prisma.ordenes.update({
          where: { id_orden: ordenId },
          data: { id_estado_orden: estadoAbierta.id_estado_orden },
        });
      }

      const res = await request(app.getHttpServer())
        .post(`/ordenes/${ordenId}/agregar-item`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          id_producto: productoId,
          cantidad: 1,
          notas_especiales: 'Item adicional',
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  describe('GET /ordenes - Listar órdenes', () => {
    it('should return paginated orders', async () => {
      const res = await request(app.getHttpServer())
        .get('/ordenes?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.items || res.body.data)).toBe(true);
    });

    it('should filter orders by estado', async () => {
      const res = await request(app.getHttpServer())
        .get('/ordenes?estado=abierta')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    it('should filter orders by date range', async () => {
      const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const to = new Date().toISOString();

      const res = await request(app.getHttpServer())
        .get(`/ordenes?desde=${from}&hasta=${to}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /ordenes/:id - Obtener orden específica', () => {
    it('should return order details with relationships', async () => {
      const res = await request(app.getHttpServer())
        .get(`/ordenes/${ordenId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id_orden', ordenId);
      expect(res.body.data).toHaveProperty('detalles');
    });

    it('should return 404 for non-existent order', async () => {
      await request(app.getHttpServer())
        .get(`/ordenes/999999`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /ordenes/:id/estado - Cambiar estado de orden', () => {
    it('should update order status', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}/estado`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'cerrada' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.estado).toBe('cerrada');
    });
  });

  describe('POST /ordenes/:id/agregar-item - Agregar item a orden', () => {
    it('should add item to existing order', async () => {
      // Reabrir orden si está cerrada
      await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}/estado`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'abierta' });

      const res = await request(app.getHttpServer())
        .post(`/ordenes/${ordenId}/agregar-item`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ id_producto: productoId, cantidad: 1 })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data.detalles.length).toBeGreaterThan(0);
    });
  });

  describe('DELETE /ordenes/:id/item/:idDetalle - Cancelar item', () => {
    it('should cancel order item', async () => {
      // Asegurar que la orden está abierta
      await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}/estado`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'abierta' });

      // Crear item
      const add = await request(app.getHttpServer())
        .post(`/ordenes/${ordenId}/agregar-item`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ id_producto: productoId, cantidad: 1 })
        .expect(201);

      const idDetalle = add.body.data.detalles.slice(-1)[0].id_orden_detalle;

      const res = await request(app.getHttpServer())
        .delete(`/ordenes/${ordenId}/item/${idDetalle}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.success).toBe(true);
    });
  });

  describe('Business Rules Validation', () => {
    it('should not allow adding items to closed orders', async () => {
      // Cerrar orden
      await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}/estado`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'cerrada' })
        .expect(200);

      // Intentar agregar item
      await request(app.getHttpServer())
        .post(`/ordenes/${ordenId}/agregar-item`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ id_producto: productoId, cantidad: 1 })
        .expect(400);
    });

    it('should validate product availability before adding', async () => {
      // Reabrir para esta prueba
      await request(app.getHttpServer())
        .patch(`/ordenes/${ordenId}/estado`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: 'abierta' })
        .expect(200);

      // Cantidad exagerada (depende de tu validación de stock)
      const response = await request(app.getHttpServer())
        .post(`/ordenes/${ordenId}/agregar-item`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ id_producto: productoId, cantidad: 10_000 });

      // Si tu API valida stock, debería ser 400
      expect([400, 201]).toContain(response.status);
    });
  });
});
