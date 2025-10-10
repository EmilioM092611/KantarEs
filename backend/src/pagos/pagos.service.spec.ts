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
      findFirst: jest.fn(), // ✅ AGREGADO: Para generarFolio()
      aggregate: jest.fn(),
    },
    ordenes: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    metodos_pago: {
      findUnique: jest.fn(),
    },
    usuarios: {
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
        pagos: [], // ✅ AGREGADO: El servicio espera esta relación
      };

      const metodoPagoMock = {
        id_metodo_pago: 1,
        nombre: 'Efectivo',
        activo: true,
        requiere_referencia: false,
        requiere_autorizacion: false,
      };

      const usuarioMock = {
        id_usuario: 1,
        nombre: 'Test Usuario',
        email: 'test@test.com',
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue(ordenMock);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        metodoPagoMock,
      );
      mockPrismaService.usuarios.findUnique.mockResolvedValue(usuarioMock);
      mockPrismaService.pagos.findFirst.mockResolvedValue(null); // ✅ Para generarFolio()

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
      expect(mockPrismaService.metodos_pago.findUnique).toHaveBeenCalledWith({
        where: { id_metodo_pago: createPagoDto.id_metodo_pago },
      });
      expect(mockPrismaService.usuarios.findUnique).toHaveBeenCalledWith({
        where: { id_usuario: createPagoDto.id_usuario_cobra },
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
        id_estado_orden: 2,
        pagos: [], // ✅ AGREGADO: El servicio espera esta relación
      });

      mockPrismaService.metodos_pago.findUnique.mockResolvedValue({
        id_metodo_pago: 1,
        activo: true,
        requiere_referencia: false,
        requiere_autorizacion: false,
      });

      mockPrismaService.usuarios.findUnique.mockResolvedValue({
        id_usuario: 1,
        nombre: 'Test',
      });

      mockPrismaService.pagos.findFirst.mockResolvedValue(null);

      await expect(service.create(createPagoDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
