// src/health/cache-health.controller.ts
import { Controller, Get, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Controller('health')
export class CacheHealthController {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  @Get('cache')
  async cacheHealth() {
    const k = 'health:cache:ping';
    await this.cache.set(k, { ok: true }, 10_000);
    const v = await this.cache.get(k);
    return { status: 'ok', canSetAndGet: v ? true : false };
  }
}
