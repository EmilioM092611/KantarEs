import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller()
export class AppController {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello?.() ?? 'OK';
  }

  @Get('cache-stats')
  async cacheStats() {
    try {
      const k1 = `cache-stats:ping:${Date.now()}`;
      const k2 = `cache-stats:ping2:${Date.now()}`;

      await this.cacheManager.set(k1, 'ok', 10_000);
      await this.cacheManager.set(k2, { status: 'ok' }, 10_000);

      const v1 = await this.cacheManager.get<string>(k1);
      const v2 = await this.cacheManager.get<{ status: string }>(k2);

      return {
        status: 'ok',
        canSetAndGet: v1 === 'ok' && v2?.status === 'ok',
        keys: {
          [k1]: v1 ? 'exists' : 'missing',
          [k2]: v2 ? 'exists' : 'missing',
        },
      };
    } catch (error: any) {
      return {
        status: 'error',
        error: String(error?.message ?? error),
      };
    }
  }

  @Get('db-ping')
  async dbPing() {
    try {
      await this.prisma.$queryRawUnsafe('SELECT 1');
      return { status: 'ok' };
    } catch (err: any) {
      return { status: 'error', error: String(err?.message ?? err) };
    }
  }
}
