// backend/test/helpers/test-data.factory.ts
import { faker } from '@faker-js/faker';

/**
 * Factory de Productos
 */
export const ProductoFactory = {
  create: (overrides = {}) => ({
    sku: faker.string.alphanumeric(10).toUpperCase(),
    nombre: faker.commerce.productName(),
    descripcion: faker.commerce.productDescription(),
    id_categoria: 1,
    id_unidad_medida: 1,
    precio_venta: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
    costo_promedio: parseFloat(faker.commerce.price({ min: 20, max: 250 })),
    iva_tasa: 16.0,
    ieps_tasa: 0.0,
    tiempo_preparacion_min: faker.number.int({ min: 5, max: 30 }),
    es_inventariable: true,
    es_vendible: true,
    es_insumo: false,
    disponible: true,
    destacado: false,
    ...overrides,
  }),

  createMany: (count: number, overrides = {}) => {
    return Array.from({ length: count }, () =>
      ProductoFactory.create(overrides),
    );
  },

  createBebida: () =>
    ProductoFactory.create({
      nombre: faker.helpers.arrayElement([
        'Coca Cola',
        'Agua Mineral',
        'Jugo Naranja',
        'Cerveza',
        'Café',
      ]),
      id_categoria: 1, // Bebidas
      tiempo_preparacion_min: 2,
    }),

  createPlatillo: () =>
    ProductoFactory.create({
      nombre: faker.helpers.arrayElement([
        'Tacos al Pastor',
        'Enchiladas',
        'Pozole',
        'Quesadillas',
        'Torta',
      ]),
      id_categoria: 2, // Alimentos
      tiempo_preparacion_min: 15,
    }),
};

/**
 * Factory de Usuarios
 */
export const UsuarioFactory = {
  create: (overrides = {}) => ({
    username: faker.internet.userName().toLowerCase(),
    password_hash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Hash falso para tests
    email: faker.internet.email().toLowerCase(),
    telefono: faker.phone.number('55########'),
    id_persona: 1,
    id_rol: 2,
    pin_rapido: faker.string.numeric(4),
    activo: true,
    intentos_fallidos: 0,
    bloqueado_hasta: null,
    ...overrides,
  }),

  createAdmin: () =>
    UsuarioFactory.create({
      username: 'admin_test',
      email: 'admin@test.com',
      id_rol: 1, // Rol Administrador
    }),

  createCajero: () =>
    UsuarioFactory.create({
      username: 'cajero_test',
      email: 'cajero@test.com',
      id_rol: 2, // Rol Cajero
    }),

  createMesero: () =>
    UsuarioFactory.create({
      username: 'mesero_test',
      email: 'mesero@test.com',
      id_rol: 3, // Rol Mesero
    }),
};

/**
 * Factory de Órdenes
 */
export const OrdenFactory = {
  create: (overrides = {}) => ({
    folio: `ORD-${Date.now()}-${faker.string.numeric(4)}`,
    id_sesion_mesa: 1,
    id_usuario_mesero: 1,
    id_estado_orden: 1,
    fecha_hora_orden: new Date(),
    subtotal: 431.03,
    iva_monto: 68.97,
    total: 500.0,
    para_llevar: false,
    ...overrides,
  }),

  createConDetalles: (numDetalles = 2) => ({
    ...OrdenFactory.create(),
    orden_detalle: Array.from({ length: numDetalles }, (_, i) =>
      OrdenDetalleFactory.create({ id_producto: i + 1 }),
    ),
  }),
};

/**
 * Factory de Detalles de Orden
 */
export const OrdenDetalleFactory = {
  create: (overrides = {}) => {
    const cantidad = faker.number.int({ min: 1, max: 5 });
    const precioUnitario = parseFloat(
      faker.commerce.price({ min: 50, max: 200 }),
    );
    const subtotal = cantidad * precioUnitario;
    const ivaMonn = subtotal * 0.16;
    const total = subtotal + ivaMonn;

    return {
      id_producto: 1,
      cantidad,
      precio_unitario: precioUnitario,
      descuento_porcentaje: 0.0,
      descuento_monto: 0.0,
      subtotal,
      iva_monto: ivaMonn,
      ieps_monto: 0.0,
      total,
      estado: 'pendiente',
      notas_especiales: null,
      ...overrides,
    };
  },
};

/**
 * Factory de Pagos
 */
export const PagoFactory = {
  create: (overrides = {}) => ({
    folio_pago: `PAG-${Date.now()}-${faker.string.numeric(4)}`,
    id_orden: 1,
    id_metodo_pago: 1,
    id_usuario_cobra: 1,
    monto: 500.0,
    fecha_hora_pago: new Date(),
    cambio_entregado: 0.0,
    estado: 'completado',
    ...overrides,
  }),

  createEfectivo: (monto: number) =>
    PagoFactory.create({
      id_metodo_pago: 1, // Efectivo
      monto,
    }),

  createTarjeta: (monto: number) =>
    PagoFactory.create({
      id_metodo_pago: 2, // Tarjeta
      monto,
      referencia_transaccion: faker.string.alphanumeric(16),
      numero_autorizacion: faker.string.numeric(6),
      ultimos_4_digitos: faker.string.numeric(4),
    }),
};

/**
 * Factory de Mesas
 */
export const MesaFactory = {
  create: (overrides = {}) => ({
    numero_mesa: faker.string.numeric(2),
    capacidad_personas: faker.number.int({ min: 2, max: 8 }),
    ubicacion: faker.helpers.arrayElement(['Terraza', 'Interior', 'Jardín']),
    planta: 1,
    id_estado_mesa: 1,
    activa: true,
    requiere_limpieza: false,
    ...overrides,
  }),
};

/**
 * Factory de Sesiones de Mesa
 */
export const SesionMesaFactory = {
  create: (overrides = {}) => ({
    id_mesa: 1,
    id_usuario_apertura: 1,
    fecha_hora_apertura: new Date(),
    numero_comensales: faker.number.int({ min: 1, max: 6 }),
    estado: 'abierta',
    ...overrides,
  }),
};

/**
 * Factory de Inventario
 */
export const InventarioFactory = {
  create: (overrides = {}) => ({
    id_producto: 1,
    stock_actual: faker.number.float({ min: 0, max: 500, precision: 0.01 }),
    stock_minimo: 20.0,
    stock_maximo: 500.0,
    punto_reorden: 50.0,
    ubicacion_almacen: faker.helpers.arrayElement(['A1', 'B2', 'C3']),
    ...overrides,
  }),

  createStockBajo: () =>
    InventarioFactory.create({
      stock_actual: 10.0,
      stock_minimo: 50.0, // Stock bajo
    }),

  createStockCritico: () =>
    InventarioFactory.create({
      stock_actual: 2.0,
      stock_minimo: 50.0, // Stock crítico
    }),
};

/**
 * Factory de Proveedores
 */
export const ProveedorFactory = {
  create: (overrides = {}) => ({
    razon_social: faker.company.name(),
    nombre_comercial: faker.company.name(),
    rfc: faker.string.alphanumeric(12).toUpperCase(),
    direccion: faker.location.streetAddress(),
    ciudad: 'Querétaro',
    estado: 'Querétaro',
    codigo_postal: '76000',
    telefono: faker.phone.number('442#######'),
    email: faker.internet.email(),
    contacto_nombre: faker.person.fullName(),
    dias_credito: 30,
    limite_credito: 50000.0,
    activo: true,
    ...overrides,
  }),
};

/**
 * Factory de Compras
 */
export const CompraFactory = {
  create: (overrides = {}) => ({
    folio_compra: `COMP-${Date.now()}-${faker.string.numeric(4)}`,
    id_proveedor: 1,
    id_usuario_solicita: 1,
    fecha_pedido: new Date(),
    subtotal: 1000.0,
    iva_monto: 160.0,
    total: 1160.0,
    estado: 'pendiente',
    ...overrides,
  }),
};

/**
 * Factory de Promociones
 */
export const PromocionFactory = {
  create: (overrides = {}) => ({
    nombre: `Promoción ${faker.commerce.productAdjective()}`,
    descripcion: faker.lorem.sentence(),
    tipo: 'descuento_porcentaje',
    valor: faker.number.float({ min: 5, max: 30, precision: 0.01 }),
    fecha_inicio: new Date(),
    fecha_fin: faker.date.future(),
    aplicacion: 'total_cuenta',
    activa: true,
    combinable: false,
    ...overrides,
  }),

  create2x1: () =>
    PromocionFactory.create({
      nombre: '2x1 en Bebidas',
      tipo: 'x1', // 2x1
      aplicacion: 'categoria',
    }),

  createDescuento: (porcentaje: number) =>
    PromocionFactory.create({
      nombre: `${porcentaje}% de descuento`,
      tipo: 'descuento_porcentaje',
      valor: porcentaje,
    }),
};

/**
 * Helper para limpiar datos de prueba
 */
export class TestDataCleaner {
  constructor(private prisma: any) {}

  async cleanAll() {
    // Orden de eliminación respetando foreign keys
    await this.prisma.orden_detalle.deleteMany();
    await this.prisma.pagos.deleteMany();
    await this.prisma.ordenes.deleteMany();
    await this.prisma.sesiones_mesa.deleteMany();
    await this.prisma.mesas.deleteMany();
    await this.prisma.movimientos_inventario.deleteMany();
    await this.prisma.inventario.deleteMany();
    await this.prisma.productos.deleteMany();
    await this.prisma.compra_detalle.deleteMany();
    await this.prisma.compras.deleteMany();
    await this.prisma.proveedores.deleteMany();
    await this.prisma.usuarios.deleteMany({
      where: { username: { contains: 'test' } },
    });
  }

  async cleanProductos() {
    await this.prisma.productos.deleteMany({
      where: { sku: { startsWith: 'TEST-' } },
    });
  }

  async cleanOrdenes() {
    await this.prisma.orden_detalle.deleteMany();
    await this.prisma.ordenes.deleteMany({
      where: { folio: { startsWith: 'ORD-TEST-' } },
    });
  }

  async cleanPagos() {
    await this.prisma.pagos.deleteMany({
      where: { folio_pago: { startsWith: 'PAG-TEST-' } },
    });
  }
}

/**
 * Helper para setup de datos de prueba
 */
export class TestDataSeeder {
  constructor(private prisma: any) {}

  async seedBasicData() {
    // Crear roles si no existen
    const roles = [
      { nombre: 'Administrador', nivel_acceso: 10 },
      { nombre: 'Gerente', nivel_acceso: 8 },
      { nombre: 'Cajero', nivel_acceso: 5 },
      { nombre: 'Mesero', nivel_acceso: 3 },
    ];

    for (const rol of roles) {
      await this.prisma.roles.upsert({
        where: { nombre: rol.nombre },
        update: {},
        create: rol,
      });
    }

    // Crear categorías básicas
    const categorias = [
      { nombre: 'Bebidas', descripcion: 'Bebidas variadas' },
      { nombre: 'Alimentos', descripcion: 'Platillos principales' },
      { nombre: 'Postres', descripcion: 'Postres y dulces' },
    ];

    for (const categoria of categorias) {
      await this.prisma.categorias.upsert({
        where: { nombre: categoria.nombre },
        update: {},
        create: categoria,
      });
    }

    // Crear unidades de medida
    const unidades = [
      { nombre: 'Pieza', abreviatura: 'PZA', tipo: 'unidad' },
      { nombre: 'Kilogramo', abreviatura: 'KG', tipo: 'peso' },
      { nombre: 'Litro', abreviatura: 'L', tipo: 'volumen' },
    ];

    for (const unidad of unidades) {
      await this.prisma.unidades_medida.upsert({
        where: { abreviatura: unidad.abreviatura },
        update: {},
        create: unidad,
      });
    }

    // Crear estados de orden
    const estados = [
      { nombre: 'pendiente' },
      { nombre: 'preparando' },
      { nombre: 'listo' },
      { nombre: 'servido' },
      { nombre: 'pagado' },
    ];

    for (const estado of estados) {
      await this.prisma.estados_orden.upsert({
        where: { nombre: estado.nombre },
        update: {},
        create: estado,
      });
    }

    // Crear métodos de pago
    const metodos = [
      { nombre: 'Efectivo', requiere_referencia: false },
      { nombre: 'Tarjeta', requiere_referencia: true },
      { nombre: 'Transferencia', requiere_referencia: true },
    ];

    for (const metodo of metodos) {
      await this.prisma.metodos_pago.upsert({
        where: { nombre: metodo.nombre },
        update: {},
        create: metodo,
      });
    }
  }

  async seedTestUser() {
    const persona = await this.prisma.personas.create({
      data: {
        nombre: 'Test',
        apellido_paterno: 'User',
        apellido_materno: 'Admin',
      },
    });

    const adminRole = await this.prisma.roles.findFirst({
      where: { nombre: 'Administrador' },
    });

    return await this.prisma.usuarios.create({
      data: {
        username: 'testadmin',
        password_hash: '$2b$10$YourHashHere', // Usar bcrypt real en producción
        email: 'testadmin@test.com',
        id_persona: persona.id_persona,
        id_rol: adminRole.id_rol,
        activo: true,
      },
    });
  }
}

/**
 * Helper para assertions comunes
 */
export const TestAssertions = {
  assertValidProducto: (producto: any) => {
    expect(producto).toHaveProperty('id_producto');
    expect(producto).toHaveProperty('sku');
    expect(producto).toHaveProperty('nombre');
    expect(producto.precio_venta).toBeGreaterThan(0);
    expect(producto.iva_tasa).toBeGreaterThanOrEqual(0);
  },

  assertValidOrden: (orden: any) => {
    expect(orden).toHaveProperty('id_orden');
    expect(orden).toHaveProperty('folio');
    expect(orden.total).toBeGreaterThan(0);
    expect(orden.subtotal).toBeGreaterThan(0);
    expect(orden.iva_monto).toBeGreaterThanOrEqual(0);
  },

  assertValidPago: (pago: any) => {
    expect(pago).toHaveProperty('id_pago');
    expect(pago).toHaveProperty('folio_pago');
    expect(pago.monto).toBeGreaterThan(0);
    expect(['pendiente', 'completado', 'cancelado', 'reembolsado']).toContain(
      pago.estado,
    );
  },

  assertCalculosOrden: (orden: any) => {
    const subtotalCalculado = orden.orden_detalle.reduce(
      (sum, det) => sum + parseFloat(det.subtotal),
      0,
    );
    const totalCalculado = subtotalCalculado + parseFloat(orden.iva_monto);

    expect(parseFloat(orden.subtotal)).toBeCloseTo(subtotalCalculado, 2);
    expect(parseFloat(orden.total)).toBeCloseTo(totalCalculado, 2);
  },
};

/**
 * Mock de servicios externos
 */
export const ExternalServiceMocks = {
  createMockEmailService: () => ({
    send: jest.fn().mockResolvedValue(true),
    sendOrderConfirmation: jest.fn().mockResolvedValue(true),
    sendInvoice: jest.fn().mockResolvedValue(true),
  }),

  createMockPaymentGateway: () => ({
    processPayment: jest.fn().mockResolvedValue({
      success: true,
      transactionId: faker.string.alphanumeric(16),
      authorizationCode: faker.string.numeric(6),
    }),
    refundPayment: jest.fn().mockResolvedValue({ success: true }),
  }),

  createMockCFDIService: () => ({
    generateInvoice: jest.fn().mockResolvedValue({
      uuid: faker.string.uuid(),
      xml: '<cfdi>...</cfdi>',
      pdfUrl: 'https://example.com/invoice.pdf',
    }),
    cancelInvoice: jest.fn().mockResolvedValue({ success: true }),
  }),
};
