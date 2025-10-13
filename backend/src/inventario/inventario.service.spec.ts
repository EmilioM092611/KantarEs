// src/inventario/inventario.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { StockStatus } from './dto/filter-inventario.dto';

import { InventarioService } from './inventario.service';
import { PrismaService } from '../prisma/prisma.service';
import { CacheUtil } from '../cache/cache-util.service';

// -------------------------
// Mocks de Prisma
// -------------------------
const mockPrismaService = {
  $transaction: jest.fn(),

  productos: {
    findUnique: jest.fn(),
  },

  inventario: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    // Para permitir where: { stock_actual: { lte: this.prisma.inventario.fields.stock_minimo } }
    fields: { stock_minimo: {} },
  },
};

// -------------------------
// Mock de cache-manager
// -------------------------
const mockCache: Partial<Cache> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
};

// -------------------------
// Mock de CacheUtil
// -------------------------
const mockCacheUtil = {
  invalidate: jest.fn().mockResolvedValue(undefined),
};

describe('InventarioService (Unit Tests)', () => {
  let service: InventarioService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventarioService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: CacheUtil, useValue: mockCacheUtil },
      ],
    }).compile();

    service = module.get(InventarioService);
    prisma = module.get(PrismaService);
  });

  // ----------------------------------------------------------------
  // create
  // ----------------------------------------------------------------
  describe('create', () => {
    const dto = {
      id_producto: 10,
      stock_actual: 5,
      stock_minimo: 2,
      stock_maximo: 20,
      punto_reorden: 4,
      ubicacion_almacen: 'A-01',
      lote_actual: 'L-001',
      requiere_refrigeracion: false,
      dias_caducidad: 0,
    };

    it('debe crear inventario cuando producto existe y es inventariable', async () => {
      prisma.productos.findUnique.mockResolvedValue({
        id_producto: 10,
        es_inventariable: true,
      });
      prisma.inventario.findUnique.mockResolvedValue(null);
      prisma.inventario.create.mockResolvedValue({
        id_inventario: 1,
        id_producto: 10,
        stock_actual: dto.stock_actual,
        stock_minimo: dto.stock_minimo,
        stock_maximo: dto.stock_maximo,
        punto_reorden: dto.punto_reorden,
        ubicacion_almacen: dto.ubicacion_almacen,
        lote_actual: dto.lote_actual,
        requiere_refrigeracion: dto.requiere_refrigeracion,
        dias_caducidad: dto.dias_caducidad,
        productos: {
          sku: 'SKU-10',
          nombre: 'Prod 10',
          unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
          categorias: { nombre: 'Cat' },
        },
      });

      const inv = await service.create(dto as any);

      expect(inv.id_producto).toBe(10);
      // invalidaciones (listas/aggregates y por producto)
      expect(mockCacheUtil.invalidate).toHaveBeenCalledTimes(2);
      expect(mockCacheUtil.invalidate).toHaveBeenCalledWith(
        expect.objectContaining({
          patterns: ['inventario:list:*'],
          keys: expect.arrayContaining([
            'inventario:bajo-stock',
            'inventario:reorden',
            'inventario:stats',
          ]),
        }),
      );
      expect(mockCacheUtil.invalidate).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: expect.arrayContaining(['inventario:producto:10']),
        }),
      );
    });

    it('debe lanzar NotFound si el producto no existe', async () => {
      prisma.productos.findUnique.mockResolvedValue(null);
      await expect(service.create(dto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequest si el producto no es inventariable', async () => {
      prisma.productos.findUnique.mockResolvedValue({
        id_producto: 10,
        es_inventariable: false,
      });
      await expect(service.create(dto as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar Conflict si ya existe inventario para el producto', async () => {
      prisma.productos.findUnique.mockResolvedValue({
        id_producto: 10,
        es_inventariable: true,
      });
      prisma.inventario.findUnique.mockResolvedValue({ id_inventario: 99 });
      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('mapea P2002 a ConflictException', async () => {
      prisma.productos.findUnique.mockResolvedValue({
        id_producto: 10,
        es_inventariable: true,
      });
      prisma.inventario.findUnique.mockResolvedValue(null);
      const err = Object.assign(new Error('dup'), { code: 'P2002' });
      prisma.inventario.create.mockRejectedValue(err);
      await expect(service.create(dto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ----------------------------------------------------------------
  // findAll
  // ----------------------------------------------------------------
  describe('findAll', () => {
    it('devuelve lista enriquecida y cachea el resultado', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findMany.mockResolvedValue([
        {
          id_inventario: 1,
          id_producto: 1,
          stock_actual: 1,
          stock_minimo: 2,
          stock_maximo: 10,
          punto_reorden: 3,
          requiere_refrigeracion: false,
          productos: {
            sku: 'A',
            nombre: 'A',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
        {
          id_inventario: 2,
          id_producto: 2,
          stock_actual: 5,
          stock_minimo: 2,
          stock_maximo: null,
          punto_reorden: null,
          requiere_refrigeracion: false,
          productos: {
            sku: 'B',
            nombre: 'B',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
      ]);

      const list = await service.findAll();
      expect(list).toHaveLength(2);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('respeta el cache y evita consultar Prisma', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue([{ mock: true }]);
      const list = await service.findAll();
      expect(list).toEqual([{ mock: true }]);
      expect(prisma.inventario.findMany).not.toHaveBeenCalled();
    });

    it('filtra por solo_bajo_stock usando fields.stock_minimo', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findMany.mockResolvedValue([
        { id_producto: 1, stock_actual: 1, stock_minimo: 2, productos: {} },
      ]);

      const list = await service.findAll({ solo_bajo_stock: true });
      expect(prisma.inventario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            stock_actual: { lte: prisma.inventario.fields.stock_minimo },
          }),
        }),
      );
      expect(list.length).toBe(1);
    });

    it('filtra por punto_reorden_alcanzado y estado', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findMany.mockResolvedValue([
        // BAJO (<= punto reorden)
        {
          id_producto: 1,
          stock_actual: 3,
          stock_minimo: 1,
          punto_reorden: 3,
          stock_maximo: 10,
          requiere_refrigeracion: false,
          productos: {
            sku: 'A',
            nombre: 'A',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
        // NORMAL
        {
          id_producto: 2,
          stock_actual: 8,
          stock_minimo: 2,
          punto_reorden: 3,
          stock_maximo: 12,
          requiere_refrigeracion: false,
          productos: {
            sku: 'B',
            nombre: 'B',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
      ]);

      const list = await service.findAll({
        punto_reorden_alcanzado: true,
        estado: StockStatus.BAJO, // <- clave del fix
      });

      expect(list).toHaveLength(1);
      expect(list[0].id_producto).toBe(1);
    });
  });

  // ----------------------------------------------------------------
  // findOne
  // ----------------------------------------------------------------
  describe('findOne', () => {
    it('devuelve inventario enriquecido y lo cachea', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findUnique.mockResolvedValue({
        id_inventario: 5,
        id_producto: 2,
        stock_actual: 2,
        stock_minimo: 1,
        stock_maximo: 10,
        punto_reorden: 3,
        productos: {
          sku: 'X',
          nombre: 'Prod X',
          descripcion: 'desc',
          disponible: true,
          precio_venta: 100,
          costo_promedio: 50,
          unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
          categorias: { nombre: 'Cat' },
        },
      });

      const inv = await service.findOne(5);
      expect(inv.id_inventario).toBe(5);
      expect(inv.estado_stock).toBeDefined();
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('usa cache si existe y evita Prisma', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue({ id_inventario: 7 });
      const inv = await service.findOne(7);
      expect(inv.id_inventario).toBe(7);
      expect(prisma.inventario.findUnique).not.toHaveBeenCalled();
    });

    it('lanza NotFound si no existe', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ----------------------------------------------------------------
  // findByProducto
  // ----------------------------------------------------------------
  describe('findByProducto', () => {
    it('devuelve por producto y cachea', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findUnique.mockResolvedValue({
        id_inventario: 12,
        id_producto: 33,
        stock_actual: 4,
        stock_minimo: 2,
        stock_maximo: 8,
        punto_reorden: 3,
        productos: {
          sku: 'P',
          nombre: 'Prod P',
          unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
        },
      });

      const inv = await service.findByProducto(33);
      expect(inv.id_producto).toBe(33);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('lanza NotFound si no existe inventario para el producto', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findUnique.mockResolvedValue(null);
      await expect(service.findByProducto(111)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ----------------------------------------------------------------
  // update
  // ----------------------------------------------------------------
  describe('update', () => {
    it('actualiza y hace invalidaciones de cache (id + producto + listas + stats)', async () => {
      // findOne (previo)
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findUnique.mockResolvedValue({
        id_inventario: 9,
        id_producto: 50,
        stock_actual: 10,
        stock_minimo: 2,
        stock_maximo: 20,
        punto_reorden: 5,
        productos: {
          sku: 'SKU',
          nombre: 'Prod',
          descripcion: '',
          disponible: true,
          precio_venta: 0,
          costo_promedio: 0,
          unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
          categorias: { nombre: 'Cat' },
        },
      });

      prisma.inventario.update.mockResolvedValue({
        id_inventario: 9,
        id_producto: 50,
        stock_minimo: 3,
        stock_maximo: 25,
        punto_reorden: 6,
        ubicacion_almacen: 'B-02',
        lote_actual: 'L-2',
        requiere_refrigeracion: false,
        dias_caducidad: 0,
        productos: {
          sku: 'SKU',
          nombre: 'Prod',
          unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
        },
      });

      const res = await service.update(9, {
        stock_minimo: 3,
        stock_maximo: 25,
        punto_reorden: 6,
        ubicacion_almacen: 'B-02',
        lote_actual: 'L-2',
      } as any);

      expect(res.id_inventario).toBe(9);
      // Dos llamadas a invalidate
      expect(mockCacheUtil.invalidate).toHaveBeenCalledTimes(2);

      // 1) invalidación por id + producto + listas
      expect(mockCacheUtil.invalidate).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: expect.arrayContaining([
            'inventario:id:9',
            'inventario:producto:50',
          ]),
          patterns: ['inventario:list:*'],
        }),
      );

      // 2) invalidación de stats y agregados
      expect(mockCacheUtil.invalidate).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: expect.arrayContaining([
            'inventario:bajo-stock',
            'inventario:reorden',
            'inventario:stats',
          ]),
        }),
      );
    });
  });

  // ----------------------------------------------------------------
  // adjustStock
  // ----------------------------------------------------------------
  describe('adjustStock', () => {
    it('ajusta stock, devuelve diferencia y limpia cache relacionado', async () => {
      // findOne interno
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findUnique.mockResolvedValue({
        id_inventario: 20,
        id_producto: 77,
        stock_actual: 10,
        stock_minimo: 2,
        stock_maximo: 20,
        punto_reorden: 5,
        productos: {
          sku: 'SKU-77',
          nombre: 'P77',
          descripcion: '',
          disponible: true,
          precio_venta: 0,
          costo_promedio: 0,
          unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
          categorias: { nombre: 'Cat' },
        },
      });

      prisma.inventario.update.mockResolvedValue({
        id_inventario: 20,
        id_producto: 77,
        stock_actual: 15,
        stock_minimo: 2,
        stock_maximo: 20,
        punto_reorden: 5,
        productos: { id_producto: 77 },
      });

      const out = await service.adjustStock(20, {
        nuevo_stock: 15,
        motivo: 'ajuste',
      } as any);

      expect(out.stock_anterior).toBe(10);
      expect(out.diferencia).toBe(5);
      expect(mockCacheUtil.invalidate).toHaveBeenCalledTimes(2);
      expect(mockCacheUtil.invalidate).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: expect.arrayContaining([
            'inventario:id:20',
            'inventario:producto:77',
          ]),
          patterns: ['inventario:list:*'],
        }),
      );
    });
  });

  // ----------------------------------------------------------------
  // getProductosBajoStock
  // ----------------------------------------------------------------
  describe('getProductosBajoStock', () => {
    it('devuelve productos con bajo stock y cachea', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findMany.mockResolvedValue([
        {
          id_inventario: 1,
          id_producto: 1,
          stock_actual: 1,
          stock_minimo: 3,
          punto_reorden: 2,
          stock_maximo: 10,
          productos: {
            sku: 'A',
            nombre: 'A',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
        {
          id_inventario: 2,
          id_producto: 2,
          stock_actual: 5,
          stock_minimo: 2,
          punto_reorden: 3,
          stock_maximo: 10,
          productos: {
            sku: 'B',
            nombre: 'B',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
      ]);

      const res = await service.getProductosBajoStock();

      expect(prisma.inventario.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            stock_actual: { lte: prisma.inventario.fields.stock_minimo },
          },
        }),
      );
      expect(res[0].faltante).toBe(2); // 3 - 1
      expect(res[0].estado_stock).toBeDefined();
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('usa cache si existe', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue([{ cached: true }]);
      const res = await service.getProductosBajoStock();
      expect(res).toEqual([{ cached: true }]);
      expect(prisma.inventario.findMany).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // getProductosReorden
  // ----------------------------------------------------------------
  describe('getProductosReorden', () => {
    it('devuelve productos en punto de reorden (BAJO) y calcula cantidad_sugerida', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findMany.mockResolvedValue([
        {
          id_producto: 1,
          stock_actual: 4,
          stock_minimo: 2,
          punto_reorden: 5,
          stock_maximo: 12,
          productos: {
            sku: 'A',
            nombre: 'A',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
        {
          id_producto: 2,
          stock_actual: 2,
          stock_minimo: 2,
          punto_reorden: 2,
          stock_maximo: null,
          productos: {
            sku: 'B',
            nombre: 'B',
            disponible: true,
            unidades_medida: { nombre: 'Pieza', abreviatura: 'pz' },
            categorias: { nombre: 'Cat' },
          },
        },
      ]);

      const res = await service.getProductosReorden();

      const ids = res.map((r) => r.id_producto);
      expect(ids).toEqual(expect.arrayContaining([1, 2])); // ambos cumplen

      // cantidad_sugerida:
      // id 1: stock_maximo (12) => 12 - 4 = 8
      // id 2: sin stock_maximo => punto_reorden * 2 = 4
      const byId: Record<number, any> = Object.fromEntries(
        res.map((r) => [r.id_producto, r]),
      );
      expect(byId[1].estado_stock).toBe(StockStatus.BAJO);
      expect(byId[1].cantidad_sugerida).toBe(8);
      expect(byId[2].cantidad_sugerida).toBe(4);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('usa cache si existe', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue([{ cached: true }]);
      const res = await service.getProductosReorden();
      expect(res).toEqual([{ cached: true }]);
      expect(prisma.inventario.findMany).not.toHaveBeenCalled();
    });
  });

  // ----------------------------------------------------------------
  // getEstadisticas
  // ----------------------------------------------------------------
  describe('getEstadisticas', () => {
    it('calcula totales, críticos, punto de reorden y valor del inventario, y cachea', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue(null);
      prisma.inventario.findMany.mockResolvedValue([
        {
          id_producto: 1,
          stock_actual: 1,
          stock_minimo: 2,
          punto_reorden: 3,
          productos: { costo_promedio: 10, precio_venta: 12 },
        },
        {
          id_producto: 2,
          stock_actual: 3,
          stock_minimo: 2,
          punto_reorden: 3,
          productos: { costo_promedio: 5, precio_venta: 8 },
        },
        {
          id_producto: 3,
          stock_actual: 5,
          stock_minimo: 1,
          punto_reorden: null,
          productos: { costo_promedio: 2, precio_venta: 4 },
        },
      ]);

      const stats = await service.getEstadisticas();

      expect(stats.total_productos).toBe(3);
      // críticos: stock_actual <= stock_minimo => item 1 (1<=2) => 1
      expect(stats.productos_criticos).toBe(1);
      // punto reorden: stock <= punto_reorden y > stock_minimo => item 2 (3<=3 y 3>2) => 1
      expect(stats.productos_punto_reorden).toBe(1);
      expect(stats.productos_normal).toBe(1);

      // valor: 1*10 + 3*5 + 5*2 = 10 + 15 + 10 = 35
      expect(stats.valor_total_inventario).toBe('35.00');
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('usa cache si existe', async () => {
      (mockCache.get as jest.Mock).mockResolvedValue({ cached: true });
      const stats = await service.getEstadisticas();
      expect(stats).toEqual({ cached: true });
      expect(prisma.inventario.findMany).not.toHaveBeenCalled();
    });
  });
});
