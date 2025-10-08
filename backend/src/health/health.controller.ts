import { Controller, Get, Header, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CacheUtil } from '../cache/cache-util.service';
import { register } from 'prom-client';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  @Get()
  async overall() {
    const result = {
      status: 'ok' as 'ok' | 'degraded',
      uptime_s: Math.round(process.uptime()),
      db: 'down' as 'up' | 'down',
      redis: 'down' as 'up' | 'down',
      version: process.env.APP_VERSION ?? null,
      env: process.env.NODE_ENV ?? null,
    };

    // DB
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      result.db = 'up';
    } catch {
      result.db = 'down';
      result.status = 'degraded';
    }

    // Redis via cache-manager (TTL como número)
    try {
      await this.cache.set('__health__', '1', 2000); // <-- número, no objeto
      const v = await this.cache.get('__health__');
      result.redis = v ? 'up' : 'down';
      if (!v) result.status = 'degraded';
    } catch {
      result.redis = 'down';
      result.status = 'degraded';
    }

    return result;
  }

  @Get('db')
  async db() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { db: 'up' };
    } catch {
      return { db: 'down' };
    }
  }

  @Get('redis')
  async redis() {
    try {
      await this.cache.set('__health__', '1', 2000); // <-- número, no objeto
      const v = await this.cache.get('__health__');
      return { redis: v ? 'up' : 'down' };
    } catch {
      return { redis: 'down' };
    }
  }

  // Prometheus metrics endpoint
  @Get('metrics')
  @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8')
  async metrics(): Promise<string> {
    const reg = CacheUtil.getPromRegistry() ?? register;
    return await reg.metrics();
  }
}
