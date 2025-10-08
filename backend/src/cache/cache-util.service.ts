/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class CacheUtil {
  private readonly logger = new Logger(CacheUtil.name);

  // ===== Prometheus =====
  private static metricsInit = false;
  private static registry: Registry | null = null;

  private static cacheHit = new Counter({
    name: 'cache_hits_total',
    help: 'Total de aciertos de caché',
    labelNames: ['ns'],
  });

  private static cacheMiss = new Counter({
    name: 'cache_misses_total',
    help: 'Total de fallos de caché',
    labelNames: ['ns'],
  });

  private static cacheSet = new Counter({
    name: 'cache_sets_total',
    help: 'Total de sets al caché',
    labelNames: ['ns'],
  });

  private static cacheDel = new Counter({
    name: 'cache_deletes_total',
    help: 'Total de deletes del caché',
    labelNames: ['reason'],
  });

  private static cacheOpSeconds = new Histogram({
    name: 'cache_op_seconds',
    help: 'Tiempo de operación de caché (segundos)',
    labelNames: ['op'],
    buckets: [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2],
  });

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    // Inicializa métricas solo una vez
    if (!CacheUtil.metricsInit) {
      try {
        CacheUtil.registry = CacheUtil.registry ?? new Registry();
        collectDefaultMetrics({ register: CacheUtil.registry });
      } catch {
        // Si ya existen, ignora
      } finally {
        CacheUtil.metricsInit = true;
      }
    }
  }

  /** Exponer el registry para /metrics */
  static getPromRegistry() {
    return CacheUtil.registry;
  }

  // ===== Helpers públicos =====

  async get<T = any>(key: string, ns = 'default'): Promise<T | null> {
    const end = CacheUtil.cacheOpSeconds.startTimer({ op: 'get' });
    try {
      const val = await this.cache.get<T>(key);
      if (val === undefined || val === null) {
        CacheUtil.cacheMiss.inc({ ns });
        return null;
      }
      CacheUtil.cacheHit.inc({ ns });
      return val;
    } catch (e) {
      this.logger.warn(`cache.get failed for key=${key}: ${String(e)}`);
      return null; // fail-open
    } finally {
      end();
    }
  }

  async set<T = any>(key: string, value: T, ttlMs?: number, ns = 'default') {
    const end = CacheUtil.cacheOpSeconds.startTimer({ op: 'set' });
    try {
      // cache-manager v5/v6 => ttl en ms dentro de options
      await this.cache.set(
        key,
        value,
        ttlMs ? { ttl: ttlMs } : (undefined as any),
      );
      CacheUtil.cacheSet.inc({ ns });
    } catch (e) {
      this.logger.warn(`cache.set failed for key=${key}: ${String(e)}`);
    } finally {
      end();
    }
  }

  async del(key: string, reason: 'key' | 'pattern' | 'explicit' = 'explicit') {
    const end = CacheUtil.cacheOpSeconds.startTimer({ op: 'del' });
    try {
      await this.cache.del(key);
      CacheUtil.cacheDel.inc({ reason });
    } catch (e) {
      this.logger.warn(`cache.del failed for key=${key}: ${String(e)}`);
    } finally {
      end();
    }
  }

  /**
   * Invalidación selectiva.
   * - `keys`: elimina claves exactas
   * - `patterns`: si hay cliente Redis, hace SCAN + UNLINK; si no, hace best-effort (avisa si no soporta).
   */
  async invalidate(opts: { keys?: string[]; patterns?: string[] }) {
    const { keys = [], patterns = [] } = opts || {};

    // 1) Borra claves exactas
    if (keys.length) {
      await Promise.all(keys.map((k) => this.del(k, 'key')));
    }

    if (!patterns.length) return;

    // 2) Si existe cliente redis debajo, usa SCAN
    const store = (this.cache as any)?.store;
    const client =
      store?.getClient?.() ??
      store?.client ??
      store?._redis ??
      store?._client ??
      null;

    if (!client) {
      this.logger.warn(
        `invalidate(patterns) no soportado por el store actual. Patrones ignorados: ${patterns.join(', ')}`,
      );
      return;
    }

    for (const pattern of patterns) {
      try {
        // SCAN loop
        let cursor = '0';
        do {
          const [next, keys] = await client.scan(
            cursor,
            'MATCH',
            pattern,
            'COUNT',
            200,
          );
          cursor = next;
          if (keys?.length) {
            // UNLINK si existe, sino DEL
            if (typeof client.unlink === 'function') {
              await client.unlink(...keys);
            } else {
              await client.del(...keys);
            }
            CacheUtil.cacheDel.inc({ reason: 'pattern' });
          }
        } while (cursor !== '0');
      } catch (e) {
        this.logger.warn(`invalidate pattern=${pattern} failed: ${String(e)}`);
      }
    }
  }
}
