// test/integration/productos.integration-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from './../../src/app.module';
import { PrismaService } from './../../src/prisma/prisma.service';

describe('Productos (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let productId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configurar pipes igual que en main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    try {
      // ✅ PASO 1: Asegurar que existe el rol de administrador
      let rolAdmin = await prisma.roles.findFirst({
        where: { nombre: 'Administrador' },
      });

      if (!rolAdmin) {
        rolAdmin = await prisma.roles.create({
          data: {
            nombre: 'Administrador',
            descripcion: 'Administrador del sistema',
            nivel_acceso: 5,
            puede_crear_usuarios: true,
            puede_modificar_precios: true,
            puede_anular_ordenes: true,
            puede_cerrar_caja: true,
            puede_ver_reportes: true,
            puede_gestionar_inventario: true,
          },
        });
        console.log(`✅ Rol admin creado con ID: ${rolAdmin.id_rol}`);
      } else {
        console.log(`✅ Rol admin encontrado con ID: ${rolAdmin.id_rol}`);
      }

      // ✅ PASO 2: Crear persona asociada (SOLO con campos que existen)
      let persona = await prisma.personas.findFirst({
        where: {
          nombre: 'Admin',
          apellido_paterno: 'Test',
        },
      });

      if (!persona) {
        persona = await prisma.personas.create({
          data: {
            nombre: 'Admin',
            apellido_paterno: 'Test',
            apellido_materno: 'Sistema',
            fecha_nacimiento: new Date('1990-01-01'),
          },
        });
        console.log(`✅ Persona creada con ID: ${persona.id_persona}`);
      } else {
        console.log(`✅ Persona encontrada con ID: ${persona.id_persona}`);
      }

      // ✅ PASO 3: Crear/actualizar usuario admin
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminUser = await prisma.usuarios.upsert({
        where: { username: 'admin' },
        update: {
          password_hash: hashedPassword,
          activo: true,
          id_rol: rolAdmin.id_rol,
        },
        create: {
          username: 'admin',
          password_hash: hashedPassword,
          email: 'admin@test.com',
          id_persona: persona.id_persona,
          id_rol: rolAdmin.id_rol,
          activo: true,
          intentos_fallidos: 0,
        },
      });

      console.log('✅ Usuario admin creado/actualizado para tests');

      // ✅ PASO 4: Autenticación para obtener token JWT
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123',
        });

      // ✅ CORRECCIÓN: Aceptar tanto 200 como 201 (Created)
      if (
        (loginResponse.status === 200 || loginResponse.status === 201) &&
        loginResponse.body.access_token
      ) {
        authToken = loginResponse.body.access_token;
        console.log('✅ Token JWT obtenido exitosamente');
      } else {
        console.error(
          '❌ Login falló:',
          loginResponse.status,
          loginResponse.body,
        );
        throw new Error(
          'No se pudo autenticar. Error en el endpoint de login.',
        );
      }

      // ✅ PASO 5: Obtener un producto existente para tests
      const productos = await prisma.productos.findMany({ take: 1 });
      if (productos.length > 0) {
        productId = productos[0].id_producto;
        console.log(`✅ Producto de prueba encontrado: ID ${productId}`);
      } else {
        console.warn('⚠️ No hay productos en la BD de pruebas');
      }
    } catch (error) {
      console.error('❌ Error en setup de tests:', error);
      throw error;
    }
  });

  afterAll(async () => {
    // Limpieza opcional: puedes descomentar si quieres eliminar el usuario de prueba
    // await prisma.usuarios.delete({ where: { username: 'admin' } }).catch(() => {});

    await prisma.$disconnect();
    await app.close();
  });

  describe('/productos (GET)', () => {
    it('returns paginated results', () => {
      if (!authToken) {
        console.warn('Skipping test: No auth token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/productos?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('meta');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeLessThanOrEqual(5);
          expect(res.body.meta).toHaveProperty('total');
          expect(res.body.meta).toHaveProperty('page');
          expect(res.body.meta).toHaveProperty('limit');
        });
    });

    it('filters by search term', () => {
      if (!authToken) {
        console.warn('Skipping test: No auth token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/productos?search=agua')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          if (res.body.data.length > 0) {
            const producto = res.body.data[0];
            const matchesSearch =
              producto.nombre.toLowerCase().includes('agua') ||
              producto.descripcion?.toLowerCase().includes('agua');
            expect(matchesSearch).toBe(true);
          }
        });
    });
  });

  describe('/productos/:id (GET)', () => {
    it('returns a product by id', () => {
      if (!authToken || !productId) {
        console.warn('Skipping test: No auth token or product ID available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get(`/productos/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id_producto', productId);
          expect(res.body.data).toHaveProperty('nombre');
          expect(res.body.data).toHaveProperty('precio_venta');
        });
    });

    it('returns 404 for non-existent product', () => {
      if (!authToken) {
        console.warn('Skipping test: No auth token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .get('/productos/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/productos (POST)', () => {
    it('creates a new product', () => {
      if (!authToken) {
        console.warn('Skipping test: No auth token available');
        return Promise.resolve();
      }

      const newProduct = {
        nombre: 'Producto Test',
        descripcion: 'Descripción de prueba',
        codigo: `TEST-${Date.now()}`,
        id_tipo_producto: 1,
        id_unidad_medida: 1,
        precio_venta: 50.0,
        costo_promedio: 25.0,
        iva_tasa: 16,
      };

      return request(app.getHttpServer())
        .post('/productos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct)
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id_producto');
          expect(res.body.data.nombre).toBe(newProduct.nombre);
        });
    });

    it('validates required fields', () => {
      if (!authToken) {
        console.warn('Skipping test: No auth token available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .post('/productos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Producto sin campos requeridos',
        })
        .expect(400);
    });
  });

  describe('/productos/:id (PATCH)', () => {
    it('updates a product', async () => {
      if (!authToken || !productId) {
        console.warn('Skipping test: No auth token or product ID available');
        return Promise.resolve();
      }

      return request(app.getHttpServer())
        .patch(`/productos/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          descripcion: 'Descripción actualizada en test',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data).toHaveProperty('id_producto', productId);
        });
    });
  });
});
