// test/integration/productos.integration-spec.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';

jest.setTimeout(30000);

describe('Productos (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let token: string;

  // IDs de referencias para usar en pruebas
  let categoriaId: number;
  let unidadId: number;

  // Producto sembrado para GET/:id y PATCH
  let baseProductId: number;

  const unique = Date.now();
  const adminUsername = `itest_admin_${unique}`;
  const adminEmail = `itest_admin_${unique}@kantares.com`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    // ✅ Configurar ValidationPipe para que funcione en los tests
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);

    // ====== Asegurar rol admin ======
    let rolAdmin = await prisma.roles.findFirst({ where: { nombre: 'admin' } });
    if (!rolAdmin) {
      rolAdmin = await prisma.roles.create({
        data: {
          nombre: 'admin',
          descripcion: 'Rol administrador',
          nivel_acceso: 10,
          activo: true,
        },
      });
    }

    // ====== Asegurar persona para el usuario ======
    let persona = await prisma.personas.findFirst({
      where: { nombre: 'Test', apellido_paterno: 'Admin' },
    });
    if (!persona) {
      persona = await prisma.personas.create({
        data: {
          nombre: 'Test',
          apellido_paterno: 'Admin',
          apellido_materno: 'KantarEs',
        },
      });
    }

    // ====== Asegurar usuario admin de pruebas ======
    const user = await prisma.usuarios.upsert({
      where: { username: adminUsername },
      update: {
        password_hash: 'hash_pruebas',
        activo: true,
        id_rol: rolAdmin.id_rol,
        intentos_fallidos: 0,
      },
      create: {
        username: adminUsername,
        password_hash: 'hash_pruebas',
        email: adminEmail,
        id_persona: persona.id_persona,
        id_rol: rolAdmin.id_rol,
        activo: true,
        intentos_fallidos: 0,
      },
    });

    // ====== Token JWT para Authorization ======
    token = await jwt.signAsync({
      sub: user.id_usuario,
      username: user.username,
      rol: {
        id_rol: rolAdmin.id_rol,
        nombre: rolAdmin.nombre,
        nivel_acceso: rolAdmin.nivel_acceso,
      },
    });

    // ====== Asegurar Categoría ======
    let categoria = await prisma.categorias.findFirst();
    if (!categoria) {
      categoria = await prisma.categorias.create({
        data: {
          nombre: 'General',
          descripcion: 'Categoría por defecto',
          activa: true,
          visible_menu: true,
          orden_visualizacion: 1,
        },
      });
    }
    categoriaId = categoria.id_categoria;

    // ====== Asegurar Unidad de Medida ======
    let unidad = await prisma.unidades_medida.findFirst();
    if (!unidad) {
      unidad = await prisma.unidades_medida.create({
        data: {
          nombre: 'Pieza',
          abreviatura: 'pz',
          tipo: 'UNIDAD',
          factor_conversion: 1,
        },
      });
    }
    unidadId = unidad.id_unidad;

    // ====== Sembrar un producto base para pruebas de GET y PATCH ======
    const productoBase = await prisma.productos.create({
      data: {
        nombre: 'Producto Base',
        descripcion: 'Producto base de prueba',
        sku: `SKU-${unique}`,
        id_categoria: categoriaId,
        id_unidad_medida: unidadId,
        precio_venta: 50,
        costo_promedio: 25,
        iva_tasa: 16,
        disponible: true,
        es_vendible: true,
      },
    });
    baseProductId = productoBase.id_producto;

    // Crear inventario para el producto base
    await prisma.inventario.create({
      data: {
        id_producto: baseProductId,
        stock_actual: 10,
        stock_minimo: 5,
      },
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/productos (GET)', () => {
    it('returns paginated results', async () => {
      const res = await request(app.getHttpServer())
        .get('/productos?limit=10&page=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : [];
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });

    it('filters by search term', async () => {
      const res = await request(app.getHttpServer())
        .get('/productos?q=Producto%20Base')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const body = res.body;
      const list = Array.isArray(body)
        ? body
        : Array.isArray(body?.data)
          ? body.data
          : [];
      const hasProductoBase = list.some((p: any) =>
        (p.nombre || '').includes('Producto Base'),
      );
      expect(hasProductoBase).toBe(true);
    });
  });

  describe('/productos/:id (GET)', () => {
    it('returns a product by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/productos/${baseProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toBeDefined();
      expect(res.body.id_producto ?? res.body.id).toBeDefined();
    });

    it('returns 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/productos/99999999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('/productos (POST)', () => {
    it('creates a new product', async () => {
      const now = Date.now();
      const payload = {
        codigo: `P-${now}`,
        nombre: 'Producto Nuevo',
        descripcion: 'Creado desde integración',
        id_tipo_producto: categoriaId,
        id_unidad_medida: unidadId,
        precio_venta: 120.5,
        costo: 70.25,
        iva: 16,
        disponible_venta: true,
        stock_minimo: 5,
        stock_maximo: 100,
      };

      const res = await request(app.getHttpServer())
        .post('/productos')
        .set('Authorization', `Bearer ${token}`)
        .send(payload)
        .expect(201);

      expect(res.body).toBeDefined();
      const producto = res.body.data || res.body;
      expect(producto.sku).toBe(payload.codigo);
    });

    it('validates required fields', async () => {
      const badPayload = {
        // ❌ Falta "nombre" que es requerido
        codigo: `P-BAD-${Date.now()}`,
        descripcion: 'Sin nombre',
        id_tipo_producto: categoriaId,
        id_unidad_medida: unidadId,
        precio_venta: 50,
        costo: 25,
        iva: 16,
        disponible_venta: true,
      };

      await request(app.getHttpServer())
        .post('/productos')
        .set('Authorization', `Bearer ${token}`)
        .send(badPayload)
        .expect(400); // ✅ Ahora debería funcionar correctamente
    });
  });

  describe('/productos/:id (PATCH)', () => {
    it('updates a product', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/productos/${baseProductId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          precio_venta: 59.99,
          disponible: true,
          es_vendible: true,
        })
        .expect(200);

      expect(res.body).toBeDefined();
      expect(Number(res.body.precio_venta)).toBe(59.99);
    });
  });
});
