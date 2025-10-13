// backend/src/productos/productos.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ProductosService } from './productos.service';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

const mockPrisma = () => ({
  productos: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  categorias: {
    findUnique: jest.fn(),
  },
  unidades_medida: {
    findUnique: jest.fn(),
  },
  movimientos_inventario: {
    count: jest.fn(),
  },
  orden_detalle: {
    count: jest.fn(),
  },
});

const mockCache: Partial<Cache> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockCacheUtil = () => ({
  safeDel: jest.fn(),
  safeDelPattern: jest.fn(),
});

const productoFactory = (overrides: Partial<any> = {}) => ({
  id_producto: overrides.id_producto ?? 1,
  nombre: overrides.nombre ?? 'Hamburguesa',
  descripcion: overrides.descripcion ?? 'Rica hamburguesa',
  id_categoria: overrides.id_categoria ?? 5,
  id_unidad_medida: overrides.id_unidad_medida ?? 3,
  precio_venta: overrides.precio_venta ?? 100,
  costo_promedio: overrides.costo_promedio ?? 50,
  iva_tasa: overrides.iva_tasa ?? 16,
  disponible: overrides.disponible ?? true,
  es_vendible: overrides.es_vendible ?? true,
  tiempo_preparacion_min: overrides.tiempo_preparacion_min ?? 10,
  calorias: overrides.calorias ?? 500,
  sku: overrides.sku ?? 'SKU-001',
  categorias: overrides.categorias ?? { id_categoria: 5, nombre: 'Comidas' },
  unidades_medida: overrides.unidades_medida ?? {
    id_unidad_medida: 3,
    nombre: 'Pieza',
  },
  inventario: overrides.inventario ?? null,
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
});

describe('ProductosService (Unit Tests)', () => {
  let service: ProductosService;
  let prisma: ReturnType<typeof mockPrisma>;
  let cacheUtil: ReturnType<typeof mockCacheUtil>;

  beforeEach(async () => {
    prisma = mockPrisma() as any;
    cacheUtil = mockCacheUtil() as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        { provide: PrismaService, useValue: prisma },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: CacheUtil, useValue: cacheUtil },
      ],
    }).compile();

    service = module.get(ProductosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe('create', () => {
    const baseDto = {
      nombre: 'Nuevo',
      descripcion: 'Desc',
      id_tipo_producto: 5,
      id_unidad_medida: 3,
      precio_venta: 120,
      costo: 60,
      iva: 16,
      disponible_venta: true,
      tiempo_preparacion_min: 10,
      caloria: 300,
      sku: 'SKU-NEW',
    };

    beforeEach(() => {
      // Por default: no existe SKU, categoría y unidad válidas
      prisma.productos.findUnique.mockResolvedValue(null); // sku unique
      prisma.categorias.findUnique.mockResolvedValue({ id_categoria: 5 });
      prisma.unidades_medida.findUnique.mockResolvedValue({
        id_unidad_medida: 3,
      });
    });

    it('should create a product with valid data', async () => {
      const created = productoFactory({ id_producto: 10, ...baseDto });
      prisma.productos.create.mockResolvedValue(created);

      const result = await service.create(baseDto as any);

      expect(result).toEqual(created);
      expect(prisma.productos.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            nombre: 'Nuevo',
            id_categoria: 5,
            id_unidad_medida: 3,
            precio_venta: 120, // número
          }),
          include: expect.any(Object),
        }),
      );
    });

    it('should throw ConflictException on duplicate SKU', async () => {
      prisma.productos.findUnique.mockResolvedValue({
        id_producto: 1,
        sku: 'SKU-NEW',
      });
      await expect(service.create(baseDto as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should validate precio_venta > 0', async () => {
      await expect(
        service.create({ ...baseDto, precio_venta: 0 } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create product with default values', async () => {
      const dto = { ...baseDto, iva: undefined, disponible_venta: undefined };
      prisma.productos.create.mockResolvedValue(
        productoFactory({ iva_tasa: 16, disponible: true }),
      );

      const result = await service.create(dto as any);
      expect(result.iva_tasa).toBe(16);
      expect(result.disponible).toBe(true);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated products', async () => {
      prisma.productos.findMany.mockResolvedValue([productoFactory()]);
      const result = await service.findAll({ page: 1, perPage: 20 } as any);
      expect(Array.isArray(result)).toBe(true);
      expect(prisma.productos.findMany).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      prisma.productos.findMany.mockResolvedValue([]);
      await service.findAll({ search: 'burguer' } as any);
      expect(prisma.productos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        }),
      );
    });

    it('should filter by categoria', async () => {
      prisma.productos.findMany.mockResolvedValue([]);
      const categoriaId = 5;
      await service.findAll({ id_categoria: categoriaId } as any);

      expect(prisma.productos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id_categoria: categoriaId,
          }),
        }),
      );
    });

    it('should return only disponible products when filtered', async () => {
      prisma.productos.findMany.mockResolvedValue([]);
      await service.findAll({ disponible_venta: true } as any);

      expect(prisma.productos.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            disponible: true,
          }),
        }),
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe('findOne', () => {
    it('should return a product by id', async () => {
      prisma.productos.findUnique.mockResolvedValue(productoFactory());
      const result = await service.findOne(1);
      expect(result).toBeTruthy();
    });

    it('should throw NotFoundException when product does not exist', async () => {
      prisma.productos.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('should include related data when requested', async () => {
      prisma.productos.findUnique.mockResolvedValue(productoFactory());
      await service.findOne(1);
      expect(prisma.productos.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            categorias: true,
            unidades_medida: true,
            inventario: true,
          }),
        }),
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('should update a product successfully', async () => {
      prisma.productos.findUnique.mockResolvedValue(productoFactory());
      const updated = productoFactory({
        nombre: 'Producto Actualizado',
        precio_venta: 75,
      });
      prisma.productos.update.mockResolvedValue(updated);

      const updateDto = { nombre: 'Producto Actualizado', precio_venta: 75 };
      const result = await service.update(1, updateDto as any);

      expect(result.nombre).toBe('Producto Actualizado');
      expect(prisma.productos.update).toHaveBeenCalledWith({
        where: { id_producto: 1 },
        data: expect.objectContaining(updateDto), // precio_venta número
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      prisma.productos.findUnique.mockResolvedValue(null);
      await expect(service.update(999, { nombre: 'X' } as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should not allow updating to negative price', async () => {
      prisma.productos.findUnique.mockResolvedValue(productoFactory());
      await expect(
        service.update(1, { precio_venta: -50 } as any),
      ).rejects.toThrow();
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe('remove (soft delete)', () => {
    it('should soft delete a product', async () => {
      prisma.productos.findUnique.mockResolvedValue(productoFactory());
      prisma.movimientos_inventario.count.mockResolvedValue(0);
      prisma.orden_detalle.count.mockResolvedValue(0);
      prisma.productos.update.mockResolvedValue(
        productoFactory({ disponible: false, es_vendible: false }),
      );

      const result = await service.remove(1);
      expect(result.disponible).toBe(false);
      expect(prisma.productos.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when deleting non-existent product', async () => {
      prisma.productos.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe('toggleDisponibilidad', () => {
    it('should toggle product availability', async () => {
      prisma.productos.findUnique.mockResolvedValue(
        productoFactory({ disponible: true }),
      );
      prisma.productos.update.mockResolvedValue(
        productoFactory({ disponible: false }),
      );

      const result = await service.toggleDisponibilidad(1);
      expect(result.disponible).toBe(false);
      expect(prisma.productos.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_producto: 1 },
          data: { disponible: false },
        }),
      );
    });
  });

  // ────────────────────────────────────────────────────────────────────────────
  describe('validateBusinessRules', () => {
    it('should validate that costo_promedio <= precio_venta', async () => {
      await expect(
        service.validateBusinessRules({
          precio_venta: 100,
          costo_promedio: 150,
        }),
      ).rejects.toThrow(
        'El costo promedio no puede ser mayor que el precio de venta',
      );
    });

    it('should validate IVA percentage is valid', async () => {
      await expect(
        service.validateBusinessRules({ iva_tasa: 150 }),
      ).rejects.toThrow('El IVA debe estar entre 0 y 100');
    });
  });
});
