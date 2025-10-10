import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OrdenesService } from '../../src/ordenes/ordenes.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../../src/cache/cache-util.service';

describe('Ordenes (integration lite)', () => {
  let app: INestApplication;

  const cacheMock: Partial<Cache> = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  const cacheUtilMock = { invalidate: jest.fn() };

  const prismaMock: any = {
    ordenes: {
      findMany: jest.fn().mockResolvedValue([{ id_orden: 1 }, { id_orden: 2 }]),
      findUnique: jest
        .fn()
        .mockResolvedValue({
          id_orden: 1,
          estados_orden: { nombre: 'abierta' },
        }),
    },
    $transaction: jest.fn(async (cb) => {
      const tx = {
        orden_detalle: {
          create: jest.fn().mockResolvedValue({ id_detalle: 1 }),
        },
      };
      return cb(tx);
    }),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        OrdenesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CACHE_MANAGER, useValue: cacheMock },
        { provide: CacheUtil, useValue: cacheUtilMock },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('Servicio disponible y findOne devuelve algo', async () => {
    const service = app.get(OrdenesService);
    const o = await service.findOne(1);
    expect(o.id_orden).toBe(1);
  });
});
