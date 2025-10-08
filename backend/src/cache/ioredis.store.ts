// backend/src/cache/ioredis.store.ts
import Redis, { RedisOptions } from 'ioredis';

export interface IoRedisStoreOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  ttl?: number; // ms
}

/**
 * Retorna un OBJETO PLANO con los métodos que cache-manager espera.
 * Usamos funciones flecha para que queden como propiedades propias del objeto.
 */
export function createIoRedisStore(opts: IoRedisStoreOptions) {
  const redisOpts: RedisOptions = {
    host: opts.host,
    port: opts.port,
    password: opts.password,
    db: opts.db,
  };
  const client = new Redis(redisOpts);
  const defaultTtl = opts.ttl;

  const ttlMs = (ttl?: number) => (typeof ttl === 'number' ? ttl : defaultTtl);

  const store = {
    name: 'ioredis-store',

    // cache-manager v5: undefined = miss
    get: async <T = unknown>(key: string): Promise<T | undefined> => {
      const raw = await client.get(key);
      if (raw == null) return undefined;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return raw as unknown as T;
      }
    },

    set: async <T = unknown>(
      key: string,
      value: T,
      ttl?: number,
    ): Promise<void> => {
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      const ms = ttlMs(ttl);
      if (typeof ms === 'number' && Number.isFinite(ms)) {
        await client.set(key, payload, 'PX', ms); // PX = milisegundos
      } else {
        await client.set(key, payload);
      }
    },

    del: async (key: string): Promise<void> => {
      await client.del(key);
    },

    reset: async (): Promise<void> => {
      await client.flushdb();
    },

    // utilidades opcionales (no las usa Nest, pero útiles para debug)
    keys: async (pattern = '*'): Promise<string[]> => client.keys(pattern),
    ttl: async (key: string): Promise<number> => {
      const sec = await client.ttl(key);
      return sec > 0 ? sec * 1000 : sec;
    },
    close: async (): Promise<void> => {
      await client.quit();
    },
  };

  return store;
}
