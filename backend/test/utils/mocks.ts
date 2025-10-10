/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
// test/utils/mocks.ts
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { PrismaService } from '../../src/prisma/prisma.service';
import { CacheUtil } from '../../src/cache/cache-util.service';

// Cache mock básico
export const cacheMock: Partial<Cache> = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  reset: jest.fn().mockResolvedValue(undefined),
};

// CacheUtil mock
export const cacheUtilMock = {
  invalidate: jest.fn(),
};

// Prisma super genérico (Proxy) con findMany/findUnique/create/update/delete
export function createPrismaMock() {
  const handler: ProxyHandler<any> = {
    get(target, prop: string) {
      if (!(prop in target)) {
        const model = {
          findMany: jest.fn().mockResolvedValue([]),
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
          delete: jest.fn().mockResolvedValue({}),
        };
        (target as any)[prop] = model;
      }
      return (target as any)[prop];
    },
  };
  const root: any = new Proxy({}, handler);
  root.$transaction = jest.fn(async (cb: any) => cb(root));
  return root;
}

export function commonProviders() {
  return [
    { provide: PrismaService, useValue: createPrismaMock() },
    { provide: CACHE_MANAGER, useValue: cacheMock },
    { provide: CacheUtil, useValue: cacheUtilMock },
  ];
}
