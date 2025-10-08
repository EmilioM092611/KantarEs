import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';

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
        const database = Number(config.get<string>('REDIS_DB') ?? 0);

        // ⚠️ Solución: creamos el store primero
        const store = await redisStore({
          socket: { host, port },
          password,
          database,
        });

        // ⚠️ Y luego lo retornamos como instancia ya resuelta
        return {
          store, // ✅ no es una Promise ni una función, ya es el store real
          ttl: 600_000, // 10 min (ms)
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
