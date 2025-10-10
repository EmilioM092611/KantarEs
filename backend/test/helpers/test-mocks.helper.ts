// test/helpers/test-mocks.helper.ts
// Helpers para crear mocks reutilizables en tests

/**
 * Mock estándar de CACHE_MANAGER para tests unitarios
 */
export const createMockCacheManager = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
  store: {
    keys: jest.fn().mockResolvedValue([]),
  },
});

/**
 * Mock estándar de CacheUtil para tests unitarios
 */
export const createMockCacheUtil = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  invalidate: jest.fn().mockResolvedValue(undefined),
});

/**
 * Mock estándar de PrismaService con operaciones comunes
 */
export const createMockPrismaService = () => ({
  // Operaciones genéricas
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),

  // Tabla: usuarios
  usuarios: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Tabla: productos
  productos: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },

  // Tabla: categorias
  categorias: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },

  // Tabla: ordenes
  ordenes: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },

  // Tabla: ordenes_detalle
  ordenes_detalle: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },

  // Tabla: pagos
  pagos: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },

  // Tabla: metodos_pago
  metodos_pago: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Tabla: sesiones_mesa
  sesiones_mesa: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Tabla: mesas
  mesas: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },

  // Tabla: inventario
  inventario: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  },

  // Tabla: unidades_medida
  unidades_medida: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },

  // Tabla: proveedores
  proveedores: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
});

/**
 * Configuración de providers comunes para tests unitarios con caché
 */
export const createTestProvidersWithCache = (
  ServiceClass: any,
  additionalProviders: any[] = [],
) => {
  return [
    ServiceClass,
    { provide: 'PrismaService', useValue: createMockPrismaService() },
    { provide: 'CACHE_MANAGER', useValue: createMockCacheManager() },
    { provide: 'CacheUtil', useValue: createMockCacheUtil() },
    ...additionalProviders,
  ];
};

/**
 * Ejemplo de uso en un test:
 *
 * import { createMockCacheManager, createMockCacheUtil, createMockPrismaService } from '../helpers/test-mocks.helper';
 *
 * const mockPrisma = createMockPrismaService();
 * const mockCache = createMockCacheManager();
 * const mockCacheUtil = createMockCacheUtil();
 *
 * beforeEach(async () => {
 *   const module: TestingModule = await Test.createTestingModule({
 *     providers: [
 *       YourService,
 *       { provide: PrismaService, useValue: mockPrisma },
 *       { provide: CACHE_MANAGER, useValue: mockCache },
 *       { provide: CacheUtil, useValue: mockCacheUtil },
 *     ],
 *   }).compile();
 * });
 */
