// backend/src/app.module.ts - VERSIÓN CORREGIDA
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { RedisCacheModule } from './cache/cache.module';
import { CacheToolsModule } from './cache/cache-tools.module';

import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

import { EventsModule } from './events/events.module';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { ProductosModule } from './productos/productos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { UnidadesModule } from './unidades/unidades.module';
import { MesasModule } from './mesas/mesas.module';
import { SesionesMesaModule } from './sesiones-mesas/sesiones-mesas.module';
import { OrdenesModule } from './ordenes/ordenes.module';
import { OrdenDetalleModule } from './orden-detalle/orden-detalle.module';
import { PagosModule } from './pagos/pagos.module';
import { MetodosPagoModule } from './metodos-pago/metodos-pago.module';
import { TiposCorteModule } from './tipos-corte/tipos-corte.module';
import { CortesCajaModule } from './cortes-caja/cortes-caja.module';
import { InventarioModule } from './inventario/inventario.module';
import { ComprasModule } from './compras/compras.module';
import { MovimientosInventarioModule } from './movimientos-inventario/movimientos-inventario.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { PromocionesModule } from './promociones/promociones.module';
import { HistorialPreciosModule } from './historial-precios/historial-precios.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { KdsModule } from './kds/kds.module';
import { TurnosCajaModule } from './turnos-caja/turnos-caja.module';
import { CuentasDivididasModule } from './cuentas-divididas/cuentas-dividas.module';
import { DevolucionesModule } from './devoluciones/devoluciones.module';
import { MermasModule } from './mermas/mermas.module';
import { ReportesModule } from './reportes/reportes.module';
import { CuentasCobrarModule } from './cuentas-cobrar/cuentas-cobrar.module';
import { CfdiModule } from './cfdi/cfdi.module';
import { MotorPromocionesModule } from './motor-promociones/motor-promociones.module';
import { HealthModule } from './health/health.module';
import { GenerosModule } from './generos/generos.module';
import { TiposProductoModule } from './tipos-producto/tipos-producto.module';
import { EstadosMesaModule } from './estados-mesa/estados-mesa.module';
import { EstadosOrdenModule } from './estados-orden/estados-orden.module';
import { RecetasModule } from './recetas/recetas.module';
import { CombosModule } from './combos/combos.module';
// import { LoginAttemptsModule } from './auth/login-attempts/login-attempts.module'; // COMENTADO hasta corregir schema

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_TTL ?? 60),
        limit: Number(process.env.RATE_LIMIT ?? 100),
      },
    ]),
    // COMENTAR BullModule si no vas a usar refresh de MV con jobs
    // BullModule.forRoot({
    //   redis: {
    //     host: process.env.REDIS_HOST || 'localhost',
    //     port: parseInt(process.env.REDIS_PORT || '6379'),
    //   },
    // }),
    // BullModule.registerQueue({
    //   name: 'reportes',
    // }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : { target: 'pino-pretty' },
        genReqId: (req) =>
          (req.headers['x-request-id'] as string) ?? randomUUID(),
        customProps: (req) => ({ userId: (req as any).user?.id ?? null }),
      },
    }),

    RedisCacheModule,
    CacheToolsModule,

    EventsModule,

    PrismaModule,
    AuthModule,
    GenerosModule,
    UsuariosModule,
    ProductosModule,
    TiposProductoModule,
    RecetasModule,
    CombosModule,
    CategoriasModule,
    UnidadesModule,
    MesasModule,
    SesionesMesaModule,
    OrdenesModule,
    OrdenDetalleModule,
    PagosModule,
    MetodosPagoModule,
    TiposCorteModule,
    CortesCajaModule,
    InventarioModule,
    ComprasModule,
    MovimientosInventarioModule,
    ProveedoresModule,
    PromocionesModule,
    EstadosMesaModule,
    EstadosOrdenModule,
    HistorialPreciosModule,
    AuditoriaModule,
    KdsModule,
    TurnosCajaModule,
    CuentasDivididasModule,
    DevolucionesModule,
    MermasModule,
    ReportesModule,
    CuentasCobrarModule,
    CfdiModule,
    MotorPromocionesModule,
    HealthModule,

    // LoginAttemptsModule, // COMENTADO
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
