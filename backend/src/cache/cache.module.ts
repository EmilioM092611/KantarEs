/* eslint-disable @typescript-eslint/require-await */
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createIoRedisStore } from './ioredis.store';

@Global()
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST') ?? '127.0.0.1';
        const port = Number(config.get<string>('REDIS_PORT') ?? 6379);
        const password = config.get<string>('REDIS_PASSWORD') || undefined;
        const db = Number(config.get<string>('REDIS_DB') ?? 0);
        const ttl = 600_000; // 10 min (ms)

        // ⬇️ OBJETO PLANO con get/set/del/reset
        const store = createIoRedisStore({ host, port, password, db, ttl });

        return {
          store, // <- objeto con métodos propios
          ttl, // TTL global en ms (también puedes omitirlo y pasar TTL por operación)
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
