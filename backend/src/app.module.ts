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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.RATE_TTL ?? 60), // ventana en segundos
        limit: Number(process.env.RATE_LIMIT ?? 100), // peticiones por ventana
      },
    ]),
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

    PrismaModule,
    AuthModule,
    UsuariosModule,
    ProductosModule,
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Throttler guard global
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
