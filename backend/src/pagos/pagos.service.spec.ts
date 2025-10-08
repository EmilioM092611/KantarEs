/* eslint-disable @typescript-eslint/no-unused-vars */
// backend/src/pagos/pagos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from './pagos.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePagoDto } from './dto/create-pago.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PagosService', () => {
  let service: PagosService;
  let prisma: PrismaService;

  const mockPrismaService = {
    pagos: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
    },
    ordenes: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    metodos_pago: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe procesar un pago completo correctamente', async () => {
      const createPagoDto: CreatePagoDto = {
        id_orden: 1,
        id_metodo_pago: 1,
        id_usuario_cobra: 1,
        monto: 500.0,
      };

      const ordenMock = {
        id_orden: 1,
        total: 500.0,
        id_estado_orden: 2, // pendiente de pago
      };

      const metodoPagoMock = {
        id_metodo_pago: 1,
        nombre: 'Efectivo',
        activo: true,
      };

      const pagosMock = [];

      mockPrismaService.ordenes.findUnique.mockResolvedValue(ordenMock);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        metodoPagoMock,
      );
      mockPrismaService.pagos.findMany.mockResolvedValue(pagosMock);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      mockPrismaService.pagos.create.mockResolvedValue({
        id_pago: 1,
        folio_pago: 'PAY-2024-0001',
        ...createPagoDto,
        estado: 'completado',
      });

      const result = await service.create(createPagoDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.ordenes.update).toHaveBeenCalledWith({
        where: { id_orden: 1 },
        data: { id_estado_orden: expect.any(Number) }, // Estado pagado
      });
    });

    it('debe rechazar pago si el monto excede el total', async () => {
      const createPagoDto: CreatePagoDto = {
        id_orden: 1,
        id_metodo_pago: 1,
        id_usuario_cobra: 1,
        monto: 600.0,
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue({
        id_orden: 1,
        total: 500.0,
      });

      mockPrismaService.metodos_pago.findUnique.mockResolvedValue({
        id_metodo_pago: 1,
        activo: true,
      });

      mockPrismaService.pagos.findMany.mockResolvedValue([]);

      await expect(service.create(createPagoDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
