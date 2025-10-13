// backend/src/pagos/pagos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PagosService } from './pagos.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

describe('PagosService (Unit Tests)', () => {
  let service: PagosService;
  let prisma: PrismaService;

  const createMockPago = (overrides = {}) => ({
    id_pago: faker.number.int({ min: 1, max: 1000 }),
    folio_pago: `PAG-${Date.now()}`,
    id_orden: 1,
    id_metodo_pago: 1,
    id_usuario_cobra: 1,
    monto: 500.0,
    fecha_hora_pago: new Date(),
    referencia_transaccion: null,
    cambio_entregado: 0.0,
    estado: 'completado',
    ...overrides,
  });

  const mockOrden = {
    id_orden: 1,
    folio: 'ORD-001',
    total: 500.0,
    subtotal: 431.03,
    iva_monto: 68.97,
    id_estado_orden: 1,
    estados_orden: { nombre: 'pendiente' },
  };

  const mockMetodoPago = {
    id_metodo_pago: 1,
    nombre: 'Efectivo',
    requiere_referencia: false,
    requiere_autorizacion: false,
    comision_porcentaje: 0.0,
    activo: true,
  };

  const mockPrismaService = {
    pagos: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(), // 👈 NECESARIO
      findFirst: jest.fn(),
    },
    metodos_pago: {
      findUnique: jest.fn(),
    },
    ordenes: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    orden_detalle: {
      findMany: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    movimientos_inventario: {
      createMany: jest.fn(),
      count: jest.fn(),
    },

    // 👇 NECESARIO para "should use atomic transaction"
    $transaction: jest.fn(async (cb: any) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PagosService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PagosService>(PagosService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('registrarPago', () => {
    it('should register payment with exact amount', async () => {
      const pagoDto = {
        id_orden: 1,
        id_metodo_pago: 1,
        monto: 500.0,
        monto_recibido: 500.0,
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );
      mockPrismaService.pagos.create.mockResolvedValue(
        createMockPago({ cambio_entregado: 0.0 }),
      );

      const result = await service.registrarPago(pagoDto, 1);

      expect(result.cambio_entregado).toBe(0.0);
      expect(result.monto).toBe(500.0);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should calculate change correctly when overpaying', async () => {
      const pagoDto = {
        id_orden: 1,
        id_metodo_pago: 1, // Efectivo
        monto: 500.0,
        monto_recibido: 600.0, // Paga con $600
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );
      mockPrismaService.pagos.create.mockResolvedValue(
        createMockPago({ cambio_entregado: 100.0 }),
      );

      const result = await service.registrarPago(pagoDto, 1);

      expect(result.cambio_entregado).toBe(100.0); // 600 - 500
    });

    it('should NOT allow underpayment', async () => {
      const pagoDto = {
        id_orden: 1,
        id_metodo_pago: 1,
        monto: 500.0,
        monto_recibido: 400.0, // Insuficiente
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );

      await expect(service.registrarPago(pagoDto, 1)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.registrarPago(pagoDto, 1)).rejects.toThrow(
        /Monto insuficiente/,
      );
    });

    it('should validate orden exists and is not paid', async () => {
      mockPrismaService.ordenes.findUnique.mockResolvedValue(null);

      await expect(
        service.registrarPago(
          { id_orden: 999, id_metodo_pago: 1, monto: 100 },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject payment for already paid orden', async () => {
      const ordenPagada = {
        ...mockOrden,
        id_estado_orden: 5,
        estados_orden: { nombre: 'pagado' },
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue(ordenPagada);

      await expect(
        service.registrarPago(
          { id_orden: 1, id_metodo_pago: 1, monto: 500 },
          1,
        ),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.registrarPago(
          { id_orden: 1, id_metodo_pago: 1, monto: 500 },
          1,
        ),
      ).rejects.toThrow(/ya fue pagada/);
    });

    it('should validate metodo_pago exists and is active', async () => {
      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(null);

      await expect(
        service.registrarPago(
          { id_orden: 1, id_metodo_pago: 999, monto: 500 },
          1,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should require referencia for card payments', async () => {
      const metodoTarjeta = {
        ...mockMetodoPago,
        nombre: 'Tarjeta',
        requiere_referencia: true,
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        metodoTarjeta,
      );

      await expect(
        service.registrarPago(
          {
            id_orden: 1,
            id_metodo_pago: 2,
            monto: 500,
            // Sin referencia_transaccion
          },
          1,
        ),
      ).rejects.toThrow(/requiere referencia/);
    });

    it('should apply commission for certain payment methods', async () => {
      const metodoConComision = {
        ...mockMetodoPago,
        nombre: 'Transferencia',
        comision_porcentaje: 2.5, // 2.5% de comisión
      };

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        metodoConComision,
      );
      mockPrismaService.pagos.create.mockResolvedValue(
        createMockPago({ monto: 512.5 }), // 500 + 2.5% = 512.50
      );

      const result = await service.registrarPago(
        {
          id_orden: 1,
          id_metodo_pago: 3,
          monto: 500,
        },
        1,
      );

      // Verificar que se aplicó comisión
      expect(result.monto).toBeGreaterThan(500.0);
    });

    it('should generate unique folio_pago', async () => {
      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );
      mockPrismaService.pagos.create.mockResolvedValue(createMockPago());

      const result = await service.registrarPago(
        {
          id_orden: 1,
          id_metodo_pago: 1,
          monto: 500,
        },
        1,
      );

      expect(result.folio_pago).toMatch(/PAG-\d{8}-\d{4}/);
    });

    it('should update orden status to "pagado" after payment', async () => {
      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );
      mockPrismaService.pagos.create.mockResolvedValue(createMockPago());
      mockPrismaService.ordenes.update.mockResolvedValue({});

      await service.registrarPago(
        {
          id_orden: 1,
          id_metodo_pago: 1,
          monto: 500,
        },
        1,
      );

      expect(mockPrismaService.ordenes.update).toHaveBeenCalledWith({
        where: { id_orden: 1 },
        data: {
          id_estado_orden: expect.any(Number), // Estado "pagado"
        },
      });
    });
  });

  describe('registrarPagoDividido', () => {
    it('should handle split payment with multiple methods', async () => {
      const pagos = [
        { id_metodo_pago: 1, monto: 300.0 }, // Efectivo
        { id_metodo_pago: 2, monto: 200.0 }, // Tarjeta
      ];

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );
      mockPrismaService.pagos.create.mockResolvedValue(createMockPago());

      const result = await service.registrarPagoDividido(1, pagos, 1);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.pagos.create).toHaveBeenCalledTimes(2);
    });

    it('should validate total of split payments equals orden total', async () => {
      const pagos = [
        { id_metodo_pago: 1, monto: 300.0 },
        { id_metodo_pago: 2, monto: 100.0 }, // Total: 400, falta 100
      ];

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);

      await expect(service.registrarPagoDividido(1, pagos, 1)).rejects.toThrow(
        /suma de pagos no coincide/,
      );
    });

    it('should use transaction for split payments', async () => {
      const pagos = [
        { id_metodo_pago: 1, monto: 250.0 },
        { id_metodo_pago: 2, monto: 250.0 },
      ];

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );
      mockPrismaService.pagos.create.mockResolvedValue(createMockPago());

      await service.registrarPagoDividido(1, pagos, 1);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });

  describe('cancelarPago', () => {
    it('should cancel payment with valid reason', async () => {
      const pagoExistente = createMockPago({ estado: 'completado' });
      const pagoCancelado = { ...pagoExistente, estado: 'cancelado' };

      mockPrismaService.pagos.findUnique.mockResolvedValue(pagoExistente);
      mockPrismaService.pagos.update.mockResolvedValue(pagoCancelado);
      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.ordenes.update.mockResolvedValue({});

      const result = await service.cancelarPago(
        1,
        {
          motivo_cancelacion: 'Error en el monto',
        },
        1,
      );

      expect(result.estado).toBe('cancelado');
      expect(result.motivo_cancelacion).toBeTruthy();
    });

    it('should NOT allow canceling already canceled payment', async () => {
      const pagoCancelado = createMockPago({ estado: 'cancelado' });

      mockPrismaService.pagos.findUnique.mockResolvedValue(pagoCancelado);

      await expect(
        service.cancelarPago(1, { motivo_cancelacion: 'Test' }, 1),
      ).rejects.toThrow(/ya está cancelado/);
    });

    it('should revert orden status when payment is canceled', async () => {
      const pago = createMockPago({ estado: 'completado', id_orden: 1 });
      const ordenPagada = {
        ...mockOrden,
        id_estado_orden: 5,
        estados_orden: { nombre: 'pagado' },
      };

      mockPrismaService.pagos.findUnique.mockResolvedValue(pago);
      mockPrismaService.pagos.update.mockResolvedValue({
        ...pago,
        estado: 'cancelado',
      });
      mockPrismaService.ordenes.findUnique.mockResolvedValue(ordenPagada);
      mockPrismaService.ordenes.update.mockResolvedValue({});

      await service.cancelarPago(1, { motivo_cancelacion: 'Error' }, 1);

      // Debe revertir orden a estado anterior (ej: "pendiente")
      expect(mockPrismaService.ordenes.update).toHaveBeenCalledWith({
        where: { id_orden: 1 },
        data: {
          id_estado_orden: expect.any(Number), // Estado anterior
        },
      });
    });

    it('should require motivo_cancelacion', async () => {
      await expect(
        service.cancelarPago(1, { motivo_cancelacion: '' }, 1),
      ).rejects.toThrow(/motivo de cancelación es requerido/);
    });
  });

  describe('procesarReembolso', () => {
    it('should process full refund', async () => {
      const pago = createMockPago({ estado: 'completado', monto: 500.0 });

      mockPrismaService.pagos.findUnique.mockResolvedValue(pago);
      mockPrismaService.pagos.update.mockResolvedValue({
        ...pago,
        estado: 'reembolsado',
      });

      const result = await service.procesarReembolso(
        1,
        {
          monto_reembolso: 500.0,
          motivo: 'Cliente insatisfecho',
        },
        1,
      );

      expect(result.estado).toBe('reembolsado');
    });

    it('should process partial refund', async () => {
      const pago = createMockPago({ estado: 'completado', monto: 500.0 });

      mockPrismaService.pagos.findUnique.mockResolvedValue(pago);
      mockPrismaService.pagos.update.mockResolvedValue(pago);

      await service.procesarReembolso(
        1,
        {
          monto_reembolso: 200.0, // Reembolso parcial
          motivo: 'Item cancelado',
        },
        1,
      );

      // Debe registrar el reembolso pero mantener pago activo
      expect(mockPrismaService.pagos.update).toHaveBeenCalled();
    });

    it('should NOT allow refund exceeding original amount', async () => {
      const pago = createMockPago({ estado: 'completado', monto: 500.0 });

      mockPrismaService.pagos.findUnique.mockResolvedValue(pago);

      await expect(
        service.procesarReembolso(
          1,
          {
            monto_reembolso: 600.0, // Mayor al monto original
            motivo: 'Test',
          },
          1,
        ),
      ).rejects.toThrow(/excede el monto original/);
    });
  });

  describe('obtenerPagosPorOrden', () => {
    it('should return all payments for an orden', async () => {
      const pagos = [
        createMockPago({ id_orden: 1, monto: 300.0 }),
        createMockPago({ id_orden: 1, monto: 200.0 }),
      ];

      mockPrismaService.pagos.findMany.mockResolvedValue(pagos);

      const result = await service.obtenerPagosPorOrden(1);

      expect(result).toHaveLength(2);
      expect(result[0].id_orden).toBe(1);
    });

    it('should calculate total paid amount', async () => {
      const pagos = [
        createMockPago({ id_orden: 1, monto: 300.0, estado: 'completado' }),
        createMockPago({ id_orden: 1, monto: 200.0, estado: 'completado' }),
        createMockPago({ id_orden: 1, monto: 100.0, estado: 'cancelado' }), // No cuenta
      ];

      mockPrismaService.pagos.findMany.mockResolvedValue(pagos);

      const result = await service.calcularTotalPagado(1);

      expect(result).toBe(500.0); // Solo pagos completados
    });
  });

  describe('validarDisponibilidadMetodoPago', () => {
    it('should validate payment method is active', async () => {
      const metodoInactivo = { ...mockMetodoPago, activo: false };

      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        metodoInactivo,
      );

      const result = await service.validarDisponibilidadMetodoPago(1);

      expect(result).toBe(false);
    });

    it('should check if card terminal is available', async () => {
      const metodoTarjeta = {
        ...mockMetodoPago,
        nombre: 'Tarjeta',
        requiere_autorizacion: true,
      };

      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        metodoTarjeta,
      );

      // Mock verificación de terminal
      jest.spyOn(service as any, 'verificarTerminal').mockResolvedValue(true);

      const result = await service.validarDisponibilidadMetodoPago(2);

      expect(result).toBe(true);
    });
  });

  describe('Financial Calculations', () => {
    it('should round to 2 decimal places', () => {
      const monto = 123.456789;
      const redondeado = service.redondearMonto(monto);

      expect(redondeado).toBe(123.46);
    });

    it('should calculate correct change for various scenarios', () => {
      const scenarios = [
        { total: 100.0, recibido: 100.0, cambio: 0.0 },
        { total: 87.5, recibido: 100.0, cambio: 12.5 },
        { total: 123.45, recibido: 150.0, cambio: 26.55 },
        { total: 999.99, recibido: 1000.0, cambio: 0.01 },
      ];

      scenarios.forEach(({ total, recibido, cambio }) => {
        expect(service.calcularCambio(total, recibido)).toBe(cambio);
      });
    });

    it('should handle propina (tip) calculations', () => {
      const subtotal = 500.0;
      const porcentajePropina = 10; // 10%

      const propina = service.calcularPropina(subtotal, porcentajePropina);

      expect(propina).toBe(50.0);
    });
  });

  describe('Transaction Safety', () => {
    it('should rollback on payment failure', async () => {
      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );
      mockPrismaService.pagos.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        service.registrarPago(
          { id_orden: 1, id_metodo_pago: 1, monto: 500 },
          1,
        ),
      ).rejects.toThrow();

      // La orden NO debe actualizarse si el pago falló
      expect(mockPrismaService.ordenes.update).not.toHaveBeenCalled();
    });

    it('should use atomic transaction for split payments', async () => {
      const pagos = [
        { id_metodo_pago: 1, monto: 250.0 },
        { id_metodo_pago: 2, monto: 250.0 },
      ];

      mockPrismaService.ordenes.findUnique.mockResolvedValue(mockOrden);
      mockPrismaService.metodos_pago.findUnique.mockResolvedValue(
        mockMetodoPago,
      );

      // Si un pago falla, todos deben revertirse
      mockPrismaService.pagos.create
        .mockResolvedValueOnce(createMockPago())
        .mockRejectedValueOnce(new Error('Payment failed'));

      await expect(
        service.registrarPagoDividido(1, pagos, 1),
      ).rejects.toThrow();

      // Verificar que se usó transacción
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });
  });
});
