/* eslint-disable @typescript-eslint/no-unused-vars */
// backend/src/ordenes/ordenes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesService } from './ordenes.service';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { CreateOrdenDto } from './dto/create-orden.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheUtil } from '../cache/cache-util.service';

describe('OrdenesService (unit)', () => {
  let service: OrdenesService;
  let prisma: PrismaService;

  const mockOrden = {
    id_orden: 1,
    folio: 'ORD-2024-0001',
    id_sesion_mesa: 1,
    id_usuario_mesero: 1,
    numero_comensales: 4,
    observaciones: 'Sin cebolla',
    id_estado_orden: 1,
    subtotal: 0,
    total: 0,
    created_at: new Date(),
    estados_orden: { nombre: 'pendiente' },
    orden_detalle: [],
    sesiones_mesa: {
      id_sesion: 1,
      mesas: { id_mesa: 1 },
    },
  };

  const sesionMock = {
    id_sesion: 1,
    estado: 'abierta',
    id_mesa: 1,
  };

  const estadoMock = {
    id_estado_orden: 1,
    nombre: 'pendiente',
    descripcion: 'Orden pendiente',
  };

  const mockPrismaService = {
    ordenes: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    sesiones_mesa: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    estados_orden: {
      findFirst: jest.fn(),
    },
    items_orden: {
      createMany: jest.fn(),
    },
    orden_detalle: {
      findMany: jest.fn(),
    },
    inventario: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };

  const mockCacheUtil = {
    invalidate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: CacheUtil,
          useValue: mockCacheUtil,
        },
      ],
    }).compile();

    service = module.get<OrdenesService>(OrdenesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Limpiar todos los mocks antes de cada test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una orden exitosamente', async () => {
      const createOrdenDto: CreateOrdenDto = {
        id_sesion_mesa: 1,
        id_usuario_mesero: 1,
        numero_comensales: 4,
        observaciones: 'Sin cebolla',
      };

      // Mock de findFirst para sesión
      mockPrismaService.sesiones_mesa.findFirst.mockResolvedValue(sesionMock);

      // Mock de findFirst para estado inicial
      mockPrismaService.estados_orden.findFirst.mockResolvedValue(estadoMock);

      // Mock de findFirst para generarFolio (buscar último folio)
      mockPrismaService.ordenes.findFirst.mockResolvedValue(null);

      mockPrismaService.ordenes.count.mockResolvedValue(0);

      // Mock completo de $transaction con TODOS los métodos necesarios
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          ordenes: {
            create: jest.fn().mockResolvedValue(mockOrden),
            update: jest.fn().mockResolvedValue(mockOrden),
            findUnique: jest.fn().mockResolvedValue(mockOrden),
          },
          items_orden: {
            createMany: jest.fn().mockResolvedValue({ count: 0 }),
          },
          orden_detalle: {
            findMany: jest.fn().mockResolvedValue([]),
          },
          inventario: {
            findUnique: jest.fn(),
            update: jest.fn(),
          },
        };
        return callback(tx);
      });

      const result = await service.create(createOrdenDto);

      expect(result).toBeDefined();

      // ✅ CORRECCIÓN: Verificar que se llamó con where E include
      expect(mockPrismaService.sesiones_mesa.findFirst).toHaveBeenCalledWith({
        where: {
          id_sesion: createOrdenDto.id_sesion_mesa,
          estado: 'abierta',
        },
        include: {
          mesas: true,
        },
      });

      expect(mockPrismaService.estados_orden.findFirst).toHaveBeenCalledWith({
        where: { nombre: 'pendiente' },
      });
    });

    it('debe lanzar error si la sesión no existe', async () => {
      const createOrdenDto: CreateOrdenDto = {
        id_sesion_mesa: 999,
        id_usuario_mesero: 1,
      };

      // Mock de findFirst retornando null
      mockPrismaService.sesiones_mesa.findFirst.mockResolvedValue(null);

      await expect(service.create(createOrdenDto)).rejects.toThrow(
        'Sesión de mesa no encontrada o cerrada',
      );
    });

    it('debe lanzar error si la sesión está cerrada', async () => {
      const createOrdenDto: CreateOrdenDto = {
        id_sesion_mesa: 1,
        id_usuario_mesero: 1,
      };

      // Mock de findFirst retornando null (sesión cerrada no se encuentra con estado='abierta')
      mockPrismaService.sesiones_mesa.findFirst.mockResolvedValue(null);

      await expect(service.create(createOrdenDto)).rejects.toThrow(
        'Sesión de mesa no encontrada o cerrada',
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar lista paginada de órdenes', async () => {
      const ordenesMock = [
        { id_orden: 1, folio: 'ORD-2024-0001' },
        { id_orden: 2, folio: 'ORD-2024-0002' },
      ];

      mockCacheManager.get.mockResolvedValue(null);
      mockPrismaService.ordenes.findMany.mockResolvedValue(ordenesMock);
      mockPrismaService.ordenes.count.mockResolvedValue(2);

      const result = await service.findAll({ limit: 10, offset: 0 });

      expect(result).toEqual({
        data: ordenesMock,
        total: 2,
        limit: 10,
        offset: 0,
      });
    });
  });
});
