/* eslint-disable @typescript-eslint/no-unused-vars */
// backend/src/ordenes/ordenes.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { OrdenesService } from './ordenes.service';
import { PrismaService } from '../prisma/prisma.service';
import { faker } from '@faker-js/faker';
import { CreateOrdenDto } from './dto/create-orden.dto';

describe('OrdenesService', () => {
  let service: OrdenesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    ordenes: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    sesiones_mesa: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdenesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
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

      const sesionMock = {
        id_sesion: 1,
        estado: 'abierta',
        id_mesa: 1,
      };

      const ordenMock = {
        id_orden: 1,
        folio: 'ORD-2024-0001',
        ...createOrdenDto,
        id_estado_orden: 1,
        subtotal: 0,
        total: 0,
        created_at: new Date(),
      };

      mockPrismaService.sesiones_mesa.findUnique.mockResolvedValue(sesionMock);
      mockPrismaService.ordenes.count.mockResolvedValue(0);
      mockPrismaService.ordenes.create.mockResolvedValue(ordenMock);

      const result = await service.create(createOrdenDto);

      expect(result).toEqual(ordenMock);
      expect(mockPrismaService.sesiones_mesa.findUnique).toHaveBeenCalledWith({
        where: { id_sesion: createOrdenDto.id_sesion_mesa },
      });
      expect(mockPrismaService.ordenes.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          folio: expect.stringContaining('ORD-'),
          id_sesion_mesa: createOrdenDto.id_sesion_mesa,
          id_usuario_mesero: createOrdenDto.id_usuario_mesero,
          numero_comensales: createOrdenDto.numero_comensales,
        }),
      });
    });

    it('debe lanzar error si la sesión no existe', async () => {
      const createOrdenDto: CreateOrdenDto = {
        id_sesion_mesa: 999,
        id_usuario_mesero: 1,
      };

      mockPrismaService.sesiones_mesa.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrdenDto)).rejects.toThrow(
        'Sesión de mesa no encontrada o no está activa',
      );
    });

    it('debe lanzar error si la sesión está cerrada', async () => {
      const createOrdenDto: CreateOrdenDto = {
        id_sesion_mesa: 1,
        id_usuario_mesero: 1,
      };

      mockPrismaService.sesiones_mesa.findUnique.mockResolvedValue({
        id_sesion: 1,
        estado: 'cerrada',
      });

      await expect(service.create(createOrdenDto)).rejects.toThrow(
        'Sesión de mesa no encontrada o no está activa',
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar lista paginada de órdenes', async () => {
      const ordenesMock = [
        { id_orden: 1, folio: 'ORD-2024-0001' },
        { id_orden: 2, folio: 'ORD-2024-0002' },
      ];

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
